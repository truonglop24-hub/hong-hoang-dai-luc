const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");
const database = require("./database");

// =====================================================
// DATABASE
// =====================================================

const DATA_DIR = "/app/data";
const FILE = path.join(DATA_DIR, "giatoc.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let giaTocs = {};

function loadData() {
    try {
        if (fs.existsSync(FILE)) {
            giaTocs = JSON.parse(
                fs.readFileSync(FILE, "utf8")
            );
        }

        if (!giaTocs || typeof giaTocs !== "object") {
            giaTocs = {};
        }
    } catch (e) {
        console.error("Lỗi đọc giatoc:", e);
        giaTocs = {};
    }
}

function saveData() {
    try {
        fs.writeFileSync(
            FILE,
            JSON.stringify(giaTocs, null, 2),
            "utf8"
        );
    } catch (e) {
        console.error("Lỗi lưu giatoc:", e);
    }
}

loadData();

// =====================================================
// CONFIG
// =====================================================

const MAX_LEVEL = 20;
const BASE_MEMBER = 10;
const CREATE_COST = 5000;

function fmt(n) {
    return Number(n || 0).toLocaleString("vi-VN");
}

function player(id) {
    return database.getPlayer(id);
}

function cleanName(name) {
    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 32);
}

function keyName(name) {
    return cleanName(name).toLowerCase();
}

function guildData(guildId) {
    if (!giaTocs[guildId]) {
        giaTocs[guildId] = {};
    }

    return giaTocs[guildId];
}

function maxMembers(level) {
    return BASE_MEMBER + (level - 1) * 5;
}

function upgradeCost(level) {
    return Math.floor(
        10000 * Math.pow(1.7, level - 1)
    );
}

// =====================================================
// TÌM GIA TỘC
// =====================================================

function getGiaToc(guildId, name) {
    return guildData(guildId)[keyName(name)] || null;
}

function findById(guildId, id) {
    return Object.values(guildData(guildId))
        .find(g => g.id === id);
}

function getUserGiaToc(guildId, userId) {
    return Object.values(guildData(guildId))
        .find(g =>
            Array.isArray(g.members) &&
            g.members.some(m => m.id === userId)
        ) || null;
}

// =====================================================
// KHỞI TẠO DỮ LIỆU MỚI
// =====================================================

function initGiaToc(g) {

    if (!Array.isArray(g.members)) {
        g.members = [];
    }

    if (!g.level) g.level = 1;
    if (!g.exp) g.exp = 0;
    if (!g.treasury) g.treasury = 0;

    if (!g.war) {
        g.war = {
            active: false,
            enemyId: null,
            enemyName: null,
            ourScore: 0,
            enemyScore: 0,
            startedAt: 0,
            lastAttack: 0
        };
    }

    if (!g.quest) {
        g.quest = {
            name: "Nhiệm vụ gia tộc",
            description: "Đóng góp Linh Thạch",
            progress: 0,
            target: 100000,
            reward: 10000,
            claimed: false
        };
    }

    if (!g.treasuryItems) {
        g.treasuryItems = {
            linhThach: 0,
            danDuoc: {},
            phapBao: {},
            congPhap: {}
        };
    }

    if (!g.territory) {
        g.territory = {
            level: 1,
            hp: 10000,
            defense: 100,
            production: 100,
            combat: 100
        };
    }

    if (!g.skills) {
        g.skills = {
            hoGia: 1,
            chienY: 1,
            tuLinh: 1,
            taiVan: 1,
            hoToc: 1,
            chienHon: 1
        };
    }

    if (!Array.isArray(g.logs)) {
        g.logs = [];
    }

    return g;
}

// =====================================================
// LOG
// =====================================================

function log(g, text) {

    initGiaToc(g);

    g.logs.unshift({
        text,
        time: Date.now()
    });

    if (g.logs.length > 50) {
        g.logs = g.logs.slice(0, 50);
    }
}

// =====================================================
// CHỨC VỤ
// =====================================================

function rolePower(role) {

    const roles = {
        "Tộc Trưởng": 100,
        "Phó Tộc Trưởng": 80,
        "Trưởng Lão": 60,
        "Hộ Pháp": 40,
        "Thành Viên": 10
    };

    return roles[role] || 0;
}

function roleEmoji(role) {

    if (role === "Tộc Trưởng") return "👑";
    if (role === "Phó Tộc Trưởng") return "💎";
    if (role === "Trưởng Lão") return "⚜️";
    if (role === "Hộ Pháp") return "🛡️";

    return "👤";
}

function memberOf(g, id) {
    return g.members.find(m => m.id === id);
}

function canManage(g, id, power) {

    const m = memberOf(g, id);

    if (!m) return false;

    return rolePower(m.role) >= power;
}

// =====================================================
// LỰC CHIẾN
// =====================================================

function power(g) {

    let total = 0;

    for (const m of g.members) {

        const p = player(m.id);

        if (!p) continue;

        total +=
            Number(p.cong || 0) +
            Number(p.thu || 0) +
            Math.floor(
                Number(
                    p.maxHp ||
                    p.hp ||
                    0
                ) / 10
            ) +
            Number(p.linhLuc || 0);
    }

    total *= g.level;

    total +=
        Number(g.territory.combat || 0);

    total +=
        Number(g.skills.chienHon || 0) * 500;

    total +=
        Number(g.skills.chienY || 0) * 300;

    return Math.floor(total);
}

// =====================================================
// TẠO GIA TỘC
// =====================================================

async function createGiaToc(interaction, name) {

    const uid = interaction.user.id;
    const p = player(uid);

    if (!p) {
        return interaction.reply({
            content: "⚠️ Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    name = cleanName(name);

    if (name.length < 3) {
        return interaction.reply({
            content:
                "❌ Tên Gia Tộc phải có ít nhất 3 ký tự.",
            ephemeral: true
        });
    }

    if (getUserGiaToc(
        interaction.guildId,
        uid
    )) {
        return interaction.reply({
            content:
                "❌ Bạn đã thuộc một Gia Tộc.",
            ephemeral: true
        });
    }

    const data =
        guildData(interaction.guildId);

    const key = keyName(name);

    if (data[key]) {
        return interaction.reply({
            content:
                "❌ Gia Tộc này đã tồn tại.",
            ephemeral: true
        });
    }

    const linhThach =
        Number(p.linhThach || 0);

    if (linhThach < CREATE_COST) {
        return interaction.reply({
            content:
                `💎 Cần **${fmt(CREATE_COST)} Linh Thạch**.`,
            ephemeral: true
        });
    }

    const g = {
        id: `GT_${Date.now()}_${uid}`,
        name,
        owner: uid,
        level: 1,
        exp: 0,
        treasury: 0,
        createdAt: Date.now(),

        members: [{
            id: uid,
            role: "Tộc Trưởng",
            joinedAt: Date.now()
        }],

        war: {
            active: false,
            enemyId: null,
            enemyName: null,
            ourScore: 0,
            enemyScore: 0,
            startedAt: 0,
            lastAttack: 0
        },

        quest: {
            name: "Nhiệm vụ gia tộc",
            description: "Đóng góp Linh Thạch",
            progress: 0,
            target: 100000,
            reward: 10000,
            claimed: false
        },

        treasuryItems: {
            linhThach: 0,
            danDuoc: {},
            phapBao: {},
            congPhap: {}
        },

        territory: {
            level: 1,
            hp: 10000,
            defense: 100,
            production: 100,
            combat: 100
        },

        skills: {
            hoGia: 1,
            chienY: 1,
            tuLinh: 1,
            taiVan: 1,
            hoToc: 1,
            chienHon: 1
        },

        logs: []
    };

    data[key] = g;

    database.updatePlayer(uid, {
        linhThach:
            linhThach - CREATE_COST
    });

    log(
        g,
        `🏠 <@${uid}> đã sáng lập Gia Tộc.`
    );

    saveData();

    return showMenu(
        interaction,
        g
    );
}

// =====================================================
// EMBED CHÍNH
// =====================================================

function mainEmbed(g) {

    initGiaToc(g);

    return new EmbedBuilder()
        .setColor(0x8e44ad)
        .setTitle(
            `🏯 GIA TỘC • ${g.name}`
        )
        .setDescription([
            "━━━━━━━━━━━━━━━━━━━━",
            `👑 **Tộc Trưởng:** <@${g.owner}>`,
            `⭐ **Cấp:** ${g.level}/${MAX_LEVEL}`,
            `✨ **EXP:** ${fmt(g.exp)}`,
            "",
            `👥 **Thành viên:** ${g.members.length}/${maxMembers(g.level)}`,
            `⚔️ **Lực chiến:** ${fmt(power(g))}`,
            `💎 **Tài khố:** ${fmt(g.treasury)}`,
            "",
            `🗺️ **Lãnh địa:** Cấp ${g.territory.level}`,
            `❤️ **HP lãnh địa:** ${fmt(g.territory.hp)}`,
            "",
            "━━━━━━━━━━━━━━━━━━━━",
            "🌌 *Gia tộc hưng thịnh — vạn thế trường tồn.*"
        ].join("\n"))
        .setFooter({
            text:
                "Hồng Hoang Đại Lục • Hệ thống Gia Tộc"
        });
}

// =====================================================
// MENU
// =====================================================

function menuRow1(g) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `gt_info_${g.id}`
                )
                .setLabel("Thông tin")
                .setEmoji("🏯")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_member_${g.id}`
                )
                .setLabel("Thành viên")
                .setEmoji("👥")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_war_${g.id}`
                )
                .setLabel("Chiến tranh")
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(
                    `gt_quest_${g.id}`
                )
                .setLabel("Nhiệm vụ")
                .setEmoji("📜")
                .setStyle(ButtonStyle.Success)
        );
}

function menuRow2(g) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `gt_treasure_${g.id}`
                )
                .setLabel("Kho báu")
                .setEmoji("💎")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_territory_${g.id}`
                )
                .setLabel("Lãnh địa")
                .setEmoji("🗺️")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_skill_${g.id}`
                )
                .setLabel("Kỹ năng")
                .setEmoji("🌟")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(
                    `gt_rank_${g.id}`
                )
                .setLabel("BXH")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Secondary)
        );
}

function menuRow3(g) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `gt_manage_${g.id}`
                )
                .setLabel("Quản lý")
                .setEmoji("👑")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_upgrade_${g.id}`
                )
                .setLabel("Nâng cấp")
                .setEmoji("📈")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(
                    `gt_log_${g.id}`
                )
                .setLabel("Nhật ký")
                .setEmoji("📖")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId(
                    `gt_refresh_${g.id}`
                )
                .setLabel("Làm mới")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Secondary)
        );
}

// =====================================================
// HIỂN THỊ MENU
// =====================================================

async function showMenu(interaction, g) {

    initGiaToc(g);

    return interaction.reply({
        embeds: [mainEmbed(g)],
        components: [
            menuRow1(g),
            menuRow2(g),
            menuRow3(g)
        ],
        fetchReply: true
    }).then(message => {

        const collector =
            message.createMessageComponentCollector({
                time: 15 * 60 * 1000
            });

        collector.on(
            "collect",
            async i => {

                if (
                    i.user.id !==
                    interaction.user.id
                ) {
                    return i.reply({
                        content:
                            "🚫 Đây không phải menu Gia Tộc của bạn.",
                        ephemeral: true
                    });
                }

                const current =
                    findById(
                        interaction.guildId,
                        g.id
                    );

                if (!current) {
                    return i.reply({
                        content:
                            "❌ Gia Tộc không tồn tại.",
                        ephemeral: true
                    });
                }

                initGiaToc(current);

                await handleButton(
                    i,
                    current
                );
            }
        );
    });
}

// =====================================================
// THÀNH VIÊN
// =====================================================

async function showMembers(i, g) {

    const lines =
        g.members.map(
            (m, index) =>
                `${index + 1}. ${roleEmoji(m.role)} <@${m.id}> — **${m.role}**`
        );

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle(
                    `👥 THÀNH VIÊN • ${g.name}`
                )
                .setDescription(
                    lines.join("\n") ||
                    "📭 Chưa có thành viên."
                )
                .setFooter({
                    text:
                        `${g.members.length}/${maxMembers(g.level)} thành viên`
                })
        ],
        ephemeral: true
    });
}

// =====================================================
// CHIẾN TRANH
// =====================================================

async function showWar(i, g) {

    let enemy = null;

    if (g.war.enemyId) {
        enemy =
            findById(
                i.guildId,
                g.war.enemyId
            );
    }

    const desc = [
        `⚔️ **Gia Tộc:** ${g.name}`,
        "",
        `🔥 Trạng thái: ${
            g.war.active
                ? "ĐANG CHIẾN"
                : "ĐANG HÒA BÌNH"
        }`,
        `⚔️ Điểm ta: **${fmt(g.war.ourScore)}**`,
        `💀 Điểm địch: **${fmt(g.war.enemyScore)}**`
    ];

    if (enemy) {
        desc.push(
            "",
            `🎯 Đối thủ: **${enemy.name}**`
        );
    }

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `gt_attack_${g.id}`
                    )
                    .setLabel("Tấn công")
                    .setEmoji("⚔️")
                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `gt_declare_${g.id}`
                    )
                    .setLabel("Tuyên chiến")
                    .setEmoji("🔥")
                    .setStyle(
                        ButtonStyle.Danger
                    )
            );

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle(
                    "⚔️ CHIẾN TRANH GIA TỘC"
                )
                .setDescription(
                    desc.join("\n")
                )
        ],
        components: [row],
        ephemeral: true
    });
}

// =====================================================
// NHIỆM VỤ
// =====================================================

async function showQuest(i, g) {

    const q = g.quest;

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle(
                    `📜 NHIỆM VỤ GIA TỘC • ${g.name}`
                )
                .setDescription([
                    `📜 **${q.name}**`,
                    "",
                    q.description,
                    "",
                    `📊 Tiến độ: **${fmt(q.progress)}/${fmt(q.target)}**`,
                    `🎁 Phần thưởng: **${fmt(q.reward)} Linh Thạch**`,
                    "",
                    q.claimed
                        ? "✅ Đã nhận thưởng."
                        : q.progress >= q.target
                            ? "🎉 Đã hoàn thành! Hãy nhận thưởng."
                            : "🔥 Tiếp tục đóng góp để hoàn thành."
                ].join("\n"))
        ],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `gt_claimquest_${g.id}`
                        )
                        .setLabel(
                            "Nhận thưởng"
                        )
                        .setEmoji("🎁")
                        .setStyle(
                            ButtonStyle.Success
                        )
                )
        ],
        ephemeral: true
    });
}

// =====================================================
// KHO BÁU
// =====================================================

async function showTreasure(i, g) {

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xf1c40f)
                .setTitle(
                    `💎 KHO BÁU GIA TỘC • ${g.name}`
                )
                .setDescription([
                    `💎 Linh Thạch trong kho: **${fmt(g.treasuryItems.linhThach)}**`,
                    "",
                    "🌿 Đan dược: Chưa có",
                    "⚔️ Pháp bảo: Chưa có",
                    "📖 Công pháp: Chưa có",
                    "",
                    "💡 Thành viên có thể đóng góp Linh Thạch vào Tài Khố."
                ].join("\n"))
        ],
        ephemeral: true
    });
}

// =====================================================
// LÃNH ĐỊA
// =====================================================

async function showTerritory(i, g) {

    const t = g.territory;

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x27ae60)
                .setTitle(
                    `🗺️ LÃNH ĐỊA • ${g.name}`
                )
                .setDescription([
                    `🏯 Cấp lãnh địa: **${t.level}/10**`,
                    `❤️ HP: **${fmt(t.hp)}**`,
                    `🛡️ Phòng thủ: **${fmt(t.defense)}**`,
                    `⚔️ Chiến lực: **${fmt(t.combat)}**`,
                    `🌾 Sản xuất: **${fmt(t.production)}**`
                ].join("\n"))
        ],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `gt_upgrade_territory_${g.id}`
                        )
                        .setLabel(
                            "Nâng cấp lãnh địa"
                        )
                        .setEmoji("🏯")
                        .setStyle(
                            ButtonStyle.Success
                        )
                )
        ],
        ephemeral: true
    });
}

// =====================================================
// KỸ NĂNG
// =====================================================

async function showSkills(i, g) {

    const s = g.skills;

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(
                    `🌟 KỸ NĂNG GIA TỘC • ${g.name}`
                )
                .setDescription([
                    `🛡️ **Hộ Gia:** cấp ${s.hoGia}`,
                    `⚔️ **Chiến Ý:** cấp ${s.chienY}`,
                    `🌌 **Tụ Linh:** cấp ${s.tuLinh}`,
                    `💰 **Tài Vận:** cấp ${s.taiVan}`,
                    `🏯 **Hộ Tộc:** cấp ${s.hoToc}`,
                    `🔥 **Chiến Hồn:** cấp ${s.chienHon}`,
                    "",
                    "Kỹ năng càng cao, phúc lợi và chiến lực Gia Tộc càng lớn."
                ].join("\n"))
        ],
        components: [
            new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `gt_skillup_${g.id}`
                        )
                        .setLabel(
                            "Nâng kỹ năng"
                        )
                        .setEmoji("⬆️")
                        .setStyle(
                            ButtonStyle.Success
                        )
                )
        ],
        ephemeral: true
    });
}

// =====================================================
// QUẢN LÝ
// =====================================================

async function showManage(i, g) {

    if (!canManage(
        g,
        i.user.id,
        60
    )) {
        return i.reply({
            content:
                "🚫 Bạn không có quyền quản lý Gia Tộc.",
            ephemeral: true
        });
    }

    const select =
        new StringSelectMenuBuilder()
            .setCustomId(
                `gt_role_${g.id}`
            )
            .setPlaceholder(
                "👑 Chọn thành viên để quản lý"
            )
            .addOptions(
                g.members
                    .slice(0, 25)
                    .map(m => ({
                        label:
                            `@${m.id}`.slice(0, 100),
                        description:
                            m.role,
                        value:
                            m.id
                    }))
            );

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xe67e22)
                .setTitle(
                    `👑 QUẢN LÝ GIA TỘC • ${g.name}`
                )
                .setDescription([
                    "Chọn thành viên bên dưới để thay đổi chức vụ.",
                    "",
                    "👑 Tộc Trưởng",
                    "💎 Phó Tộc Trưởng",
                    "⚜️ Trưởng Lão",
                    "🛡️ Hộ Pháp",
                    "👤 Thành Viên"
                ].join("\n"))
        ],
        components: [
            new ActionRowBuilder()
                .addComponents(select)
        ],
        ephemeral: true
    });
}

// =====================================================
// NHẬT KÝ
// =====================================================

async function showLogs(i, g) {

    const lines =
        g.logs
            .slice(0, 15)
            .map(x =>
                `• ${x.text}`
            );

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0x95a5a6)
                .setTitle(
                    `📖 NHẬT KÝ • ${g.name}`
                )
                .setDescription(
                    lines.join("\n") ||
                    "📭 Chưa có hoạt động."
                )
        ],
        ephemeral: true
    });
}

// =====================================================
// BXH
// =====================================================

async function showRank(i) {

    const ranking =
        Object.values(
            guildData(i.guildId)
        )
        .sort(
            (a, b) =>
                power(b) - power(a)
        )
        .slice(0, 10);

    const lines =
        ranking.map(
            (g, n) =>
                `${n < 3
                    ? ["🥇", "🥈", "🥉"][n]
                    : "🏅"} **${n + 1}. ${g.name}** — ⚔️ ${fmt(power(g))}`
        );

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xf1c40f)
                .setTitle(
                    "🏆 BXH GIA TỘC"
                )
                .setDescription(
                    lines.join("\n") ||
                    "📭 Chưa có Gia Tộc."
                )
        ],
        ephemeral: true
    });
}

// =====================================================
// NÂNG CẤP GIA TỘC
// =====================================================

function upgradeGiaToc(uid, g) {

    if (g.level >= MAX_LEVEL) {
        return {
            ok: false,
            message:
                "👑 Gia Tộc đã đạt cấp tối đa."
        };
    }

    const p = player(uid);

    if (!p) {
        return {
            ok: false,
            message:
                "❌ Không tìm thấy nhân vật."
        };
    }

    const cost =
        upgradeCost(g.level);

    const ls =
        Number(p.linhThach || 0);

    if (ls < cost) {
        return {
            ok: false,
            message:
                `💎 Cần ${fmt(cost)} Linh Thạch.`
        };
    }

    database.updatePlayer(uid, {
        linhThach: ls - cost
    });

    g.level++;
    g.exp = 0;

    log(
        g,
        `📈 Gia Tộc đã tăng lên cấp ${g.level}.`
    );

    saveData();

    return {
        ok: true
    };
}

// =====================================================
// ĐÓNG GÓP
// =====================================================

function donate(uid, g, amount) {

    const p = player(uid);

    if (!p) {
        return {
            ok: false,
            message:
                "❌ Không tìm thấy nhân vật."
        };
    }

    amount = Math.floor(
        Number(amount)
    );

    if (
        !Number.isSafeInteger(amount) ||
        amount <= 0
    ) {
        return {
            ok: false,
            message:
                "❌ Số lượng không hợp lệ."
        };
    }

    const ls =
        Number(p.linhThach || 0);

    if (ls < amount) {
        return {
            ok: false,
            message:
                "💎 Không đủ Linh Thạch."
        };
    }

    database.updatePlayer(uid, {
        linhThach: ls - amount
    });

    g.treasury += amount;
    g.treasuryItems.linhThach += amount;

    g.exp += amount;

    g.quest.progress += amount;

    log(
        g,
        `💎 <@${uid}> đã đóng góp ${fmt(amount)} Linh Thạch.`
    );

    saveData();

    return {
        ok: true
    };
}

// =====================================================
// TẤN CÔNG
// =====================================================

async function attackWar(i, g) {

    if (!g.war.active) {
        return i.reply({
            content:
                "🕊️ Gia Tộc hiện không trong chiến tranh.",
            ephemeral: true
        });
    }

    const enemy =
        findById(
            i.guildId,
            g.war.enemyId
        );

    if (!enemy) {
        return i.reply({
            content:
                "❌ Không tìm thấy đối thủ.",
            ephemeral: true
        });
    }

    const now = Date.now();

    if (
        now - g.war.lastAttack <
        30000
    ) {
        const left =
            Math.ceil(
                (
                    30000 -
                    (
                        now -
                        g.war.lastAttack
                    )
                ) / 1000
            );

        return i.reply({
            content:
                `⏳ Hãy chờ **${left}s**.`,
            ephemeral: true
        });
    }

    const myPower =
        power(g);

    const enemyPower =
        power(enemy);

    const damage =
        Math.max(
            100,
            Math.floor(
                myPower *
                (
                    0.05 +
                    Math.random() * 0.1
                )
            )
        );

    g.war.ourScore += damage;
    g.war.lastAttack = now;

    enemy.war.enemyScore += damage;

    if (
        enemy.war.enemyScore >=
        enemy.territory.hp
    ) {
        g.war.active = false;
        enemy.war.active = false;

        log(
            g,
            `🏆 Gia Tộc đã đánh bại ${enemy.name}.`
        );

        log(
            enemy,
            `💀 Lãnh địa đã thất thủ trước ${g.name}.`
        );
    }

    saveData();

    return i.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle(
                    "⚔️ TẤN CÔNG THÀNH CÔNG"
                )
                .setDescription([
                    `⚔️ Bạn gây **${fmt(damage)} sát thương**.`,
                    "",
                    `🔥 Điểm Gia Tộc: **${fmt(g.war.ourScore)}**`,
                    `💀 Điểm đối thủ: **${fmt(g.war.enemyScore)}**`,
                    "",
                    `⚡ Lực chiến ta: **${fmt(myPower)}**`,
                    `🛡️ Lực chiến địch: **${fmt(enemyPower)}**`
                ].join("\n"))
        ],
        ephemeral: true
    });
}

// =====================================================
// CLAIM QUEST
// =====================================================

async function claimQuest(i, g) {

    const q = g.quest;

    if (q.claimed) {
        return i.reply({
            content:
                "❌ Nhiệm vụ đã nhận thưởng.",
            ephemeral: true
        });
    }

    if (q.progress < q.target) {
        return i.reply({
            content:
                `❌ Chưa hoàn thành nhiệm vụ.\nTiến độ: ${fmt(q.progress)}/${fmt(q.target)}`,
            ephemeral: true
        });
    }

    q.claimed = true;

    g.treasury += q.reward;

    log(
        g,
        `🎁 Gia Tộc đã nhận ${fmt(q.reward)} Linh Thạch từ nhiệm vụ.`
    );

    saveData();

    return i.reply({
        content:
            `🎉 Hoàn thành nhiệm vụ!\n💎 Gia Tộc nhận **${fmt(q.reward)} Linh Thạch**.`,
        ephemeral: true
    });
}

// =====================================================
// NÂNG LÃNH ĐỊA
// =====================================================

async function upgradeTerritory(i, g) {

    if (!canManage(
        g,
        i.user.id,
        60
    )) {
        return i.reply({
            content:
                "🚫 Bạn không có quyền.",
            ephemeral: true
        });
    }

    const t =
        g.territory;

    if (t.level >= 10) {
        return i.reply({
            content:
                "🏯 Lãnh địa đã đạt cấp tối đa.",
            ephemeral: true
        });
    }

    const cost =
        20000 *
        t.level;

    if (g.treasury < cost) {
        return i.reply({
            content:
                `💎 Tài khố cần **${fmt(cost)}**.`,
            ephemeral: true
        });
    }

    g.treasury -= cost;

    t.level++;

    t.hp +=
        5000 * t.level;

    t.defense +=
        100 * t.level;

    t.combat +=
        150 * t.level;

    t.production +=
        100 * t.level;

    log(
        g,
        `🏯 Lãnh địa đã nâng lên cấp ${t.level}.`
    );

    saveData();

    return i.reply({
        content:
            `🏯 Lãnh địa đã đạt **cấp ${t.level}**!`,
        ephemeral: true
    });
}

// =====================================================
// NÂNG KỸ NĂNG
// =====================================================

async function upgradeSkill(i, g) {

    if (!canManage(
        g,
        i.user.id,
        60
    )) {
        return i.reply({
            content:
                "🚫 Bạn không có quyền.",
            ephemeral: true
        });
    }

    const skill =
        "chienHon";

    const level =
        Number(
            g.skills[skill] || 1
        );

    if (level >= 10) {
        return i.reply({
            content:
                "🌟 Kỹ năng đã đạt cấp tối đa.",
            ephemeral: true
        });
    }

    const cost =
        15000 * level;

    if (g.treasury < cost) {
        return i.reply({
            content:
                `💎 Cần ${fmt(cost)} Linh Thạch trong Tài Khố.`,
            ephemeral: true
        });
    }

    g.treasury -= cost;
    g.skills[skill] = level + 1;

    log(
        g,
        `🌟 Chiến Hồn đã tăng lên cấp ${level + 1}.`
    );

    saveData();

    return i.reply({
        content:
            `🌟 **Chiến Hồn** đã tăng lên cấp **${level + 1}**!`,
        ephemeral: true
    });
}

// =====================================================
// XỬ LÝ BUTTON
// =====================================================

async function handleButton(i, g) {

    const id = i.customId;

    if (
        id === `gt_info_${g.id}` ||
        id === `gt_refresh_${g.id}`
    ) {

        return i.update({
            embeds: [mainEmbed(g)],
            components: [
                menuRow1(g),
                menuRow2(g),
                menuRow3(g)
            ]
        });
    }

    if (
        id === `gt_member_${g.id}`
    ) {
        return showMembers(i, g);
    }

    if (
        id === `gt_war_${g.id}`
    ) {
        return showWar(i, g);
    }

    if (
        id === `gt_quest_${g.id}`
    ) {
        return showQuest(i, g);
    }

    if (
        id === `gt_treasure_${g.id}`
    ) {
        return showTreasure(i, g);
    }

    if (
        id === `gt_territory_${g.id}`
    ) {
        return showTerritory(i, g);
    }

    if (
        id === `gt_skill_${g.id}`
    ) {
        return showSkills(i, g);
    }

    if (
        id === `gt_rank_${g.id}`
    ) {
        return showRank(i);
    }

    if (
        id === `gt_manage_${g.id}`
    ) {
        return showManage(i, g);
    }

    if (
        id === `gt_log_${g.id}`
    ) {
        return showLogs(i, g);
    }

    if (
        id === `gt_upgrade_${g.id}`
    ) {

        if (g.owner !== i.user.id) {
            return i.reply({
                content:
                    "👑 Chỉ Tộc Trưởng mới được nâng cấp.",
                ephemeral: true
            });
        }

        const result =
            upgradeGiaToc(
                i.user.id,
                g
            );

        if (!result.ok) {
            return i.reply({
                content: result.message,
                ephemeral: true
            });
        }

        return i.update({
            embeds: [mainEmbed(g)],
            components: [
                menuRow1(g),
                menuRow2(g),
                menuRow3(g)
            ]
        });
    }

    if (
        id === `gt_attack_${g.id}`
    ) {
        return attackWar(i, g);
    }

    if (
        id === `gt_claimquest_${g.id}`
    ) {
        return claimQuest(i, g);
    }

    if (
        id === `gt_upgrade_territory_${g.id}`
    ) {
        return upgradeTerritory(i, g);
    }

    if (
        id === `gt_skillup_${g.id}`
    ) {
        return upgradeSkill(i, g);
    }

    if (
        id === `gt_declare_${g.id}`
    ) {
        return declareWar(i, g);
    }
}

// =====================================================
// TUYÊN CHIẾN
// =====================================================

async function declareWar(i, g) {

    if (!canManage(
        g,
        i.user.id,
        60
    )) {
        return i.reply({
            content:
                "🚫 Chỉ Trưởng Lão trở lên mới có quyền tuyên chiến.",
            ephemeral: true
        });
    }

    const others =
        Object.values(
            guildData(i.guildId)
        ).filter(
            x => x.id !== g.id
        );

    if (!others.length) {
        return i.reply({
            content:
                "❌ Chưa có Gia Tộc khác để tuyên chiến.",
            ephemeral: true
        });
    }

    const options =
        others.slice(0, 25)
            .map(x => ({
                label:
                    x.name.slice(0, 100),
                description:
                    `⚔️ ${fmt(power(x))} lực chiến`,
                value:
                    x.id
            }));

    const select =
        new StringSelectMenuBuilder()
            .setCustomId(
                `gt_choosewar_${g.id}`
            )
            .setPlaceholder(
                "⚔️ Chọn Gia Tộc đối thủ"
            )
            .addOptions(options);

    return i.reply({
        content:
            "⚔️ **Chọn Gia Tộc muốn tuyên chiến:**",
        components: [
            new ActionRowBuilder()
                .addComponents(select)
        ],
        ephemeral: true
    });
}

// =====================================================
// SLASH COMMAND
// =====================================================

const data =
    new SlashCommandBuilder()
        .setName("giatoc")
        .setDescription(
            "🏯 Hệ thống Gia Tộc Hồng Hoang"
        )

        .addSubcommand(
            s => s
                .setName("tao")
                .setDescription(
                    "🏠 Sáng lập Gia Tộc"
                )
                .addStringOption(
                    o => o
                        .setName("ten")
                        .setDescription(
                            "Tên Gia Tộc"
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(
            s => s
                .setName("xem")
                .setDescription(
                    "🏯 Mở menu Gia Tộc"
                )
        )

        .addSubcommand(
            s => s
                .setName("tim")
                .setDescription(
                    "🔎 Tìm Gia Tộc"
                )
                .addStringOption(
                    o => o
                        .setName("ten")
                        .setDescription(
                            "Tên Gia Tộc"
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(
            s => s
                .setName("xinvao")
                .setDescription(
                    "🤝 Gia nhập Gia Tộc"
                )
                .addStringOption(
                    o => o
                        .setName("ten")
                        .setDescription(
                            "Tên Gia Tộc"
                        )
                        .setRequired(true)
                )
        )

        .addSubcommand(
            s => s
                .setName("roi")
                .setDescription(
                    "🚪 Rời Gia Tộc"
                )
        )

        .addSubcommand(
            s => s
                .setName("donggop")
                .setDescription(
                    "💎 Đóng góp Linh Thạch"
                )
                .addIntegerOption(
                    o => o
                        .setName("so_luong")
                        .setDescription(
                            "Số Linh Thạch"
                        )
                        .setMinValue(1)
                        .setRequired(true)
                )
        )

        .addSubcommand(
            s => s
                .setName("nangcap")
                .setDescription(
                    "📈 Nâng cấp Gia Tộc"
                )
        )

        .addSubcommand(
            s => s
                .setName("top")
                .setDescription(
                    "🏆 BXH Gia Tộc"
                )
        );

// =====================================================
// EXECUTE
// =====================================================

async function execute(interaction) {

    try {

        if (!interaction.guildId) {
            return interaction.reply({
                content:
                    "❌ Chỉ dùng trong server.",
                ephemeral: true
            });
        }

        const action =
            interaction.options.getSubcommand();

        const uid =
            interaction.user.id;

        // TẠO
        if (action === "tao") {

            return createGiaToc(
                interaction,
                interaction.options.getString(
                    "ten"
                )
            );
        }

        // XEM
        if (action === "xem") {

            const g =
                getUserGiaToc(
                    interaction.guildId,
                    uid
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.\nDùng `/giatoc tao` để sáng lập.",
                    ephemeral: true
                });
            }

            initGiaToc(g);

            return showMenu(
                interaction,
                g
            );
        }

        // TÌM
        if (action === "tim") {

            const g =
                getGiaToc(
                    interaction.guildId,
                    interaction.options.getString(
                        "ten"
                    )
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy Gia Tộc.",
                    ephemeral: true
                });
            }

            initGiaToc(g);

            return interaction.reply({
                embeds: [
                    mainEmbed(g)
                ]
            });
        }

        // XIN VÀO
        if (action === "xinvao") {

            const g =
                getGiaToc(
                    interaction.guildId,
                    interaction.options.getString(
                        "ten"
                    )
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy Gia Tộc.",
                    ephemeral: true
                });
            }

            if (
                getUserGiaToc(
                    interaction.guildId,
                    uid
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Bạn đã thuộc một Gia Tộc.",
                    ephemeral: true
                });
            }

            if (
                g.members.length >=
                maxMembers(g.level)
            ) {
                return interaction.reply({
                    content:
                        "❌ Gia Tộc đã đầy.",
                    ephemeral: true
                });
            }

            g.members.push({
                id: uid,
                role: "Thành Viên",
                joinedAt: Date.now()
            });

            log(
                g,
                `🤝 <@${uid}> đã gia nhập Gia Tộc.`
            );

            saveData();

            return interaction.reply({
                content:
                    `🎉 Bạn đã gia nhập **${g.name}**!`
            });
        }

        // RỜI
        if (action === "roi") {

            const g =
                getUserGiaToc(
                    interaction.guildId,
                    uid
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            if (g.owner === uid) {
                return interaction.reply({
                    content:
                        "👑 Tộc Trưởng không thể rời Gia Tộc.",
                    ephemeral: true
                });
            }

            g.members =
                g.members.filter(
                    m => m.id !== uid
                );

            log(
                g,
                `🚪 <@${uid}> đã rời Gia Tộc.`
            );

            saveData();

            return interaction.reply({
                content:
                    `🚪 Bạn đã rời **${g.name}**.`
            });
        }

        // ĐÓNG GÓP
        if (action === "donggop") {

            const g =
                getUserGiaToc(
                    interaction.guildId,
                    uid
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            const amount =
                interaction.options.getInteger(
                    "so_luong"
                );

            const result =
                donate(
                    uid,
                    g,
                    amount
                );

            return interaction.reply({
                content:
                    result.ok
                        ? `💎 Đã đóng góp **${fmt(amount)} Linh Thạch** cho Gia Tộc.`
                        : result.message,
                ephemeral: true
            });
        }

        // NÂNG CẤP
        if (action === "nangcap") {

            const g =
                getUserGiaToc(
                    interaction.guildId,
                    uid
                );

            if (!g) {
                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            if (g.owner !== uid) {
                return interaction.reply({
                    content:
                        "👑 Chỉ Tộc Trưởng mới được nâng cấp.",
                    ephemeral: true
                });
            }

            const result =
                upgradeGiaToc(
                    uid,
                    g
                );

            if (!result.ok) {
                return interaction.reply({
                    content:
                        result.message,
                    ephemeral: true
                });
            }

            return showMenu(
                interaction,
                g
            );
        }

        // TOP
        if (action === "top") {
            return showRank(interaction);
        }

    } catch (error) {

        console.error(
            "❌ Lỗi /giatoc:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            return interaction.editReply({
                content:
                    "❌ Gia Tộc xảy ra lỗi."
            });
        }

        return interaction.reply({
            content:
                "❌ Gia Tộc xảy ra lỗi.",
            ephemeral: true
        });
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
    data,
    execute,
    getUserGiaToc,
    getGiaToc,
    getRanking: guildId =>
        Object.values(
            guildData(guildId)
        ).sort(
            (a, b) =>
                power(b) - power(a)
        )
};
