const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const database = require("./database");

// =====================================================
// 🗄️ DATABASE GIA TỘC
// =====================================================

const DATA_DIR = "/app/data";
const FILE = path.join(DATA_DIR, "giatoc.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

let giaTocs = {};

function loadData() {
    try {
        if (!fs.existsSync(FILE)) {
            giaTocs = {};
            saveData();
            return;
        }

        giaTocs =
            JSON.parse(
                fs.readFileSync(
                    FILE,
                    "utf8"
                )
            );

    } catch (error) {
        console.error(
            "❌ Lỗi đọc giatoc.json:",
            error
        );

        giaTocs = {};
    }
}

function saveData() {
    try {
        fs.writeFileSync(
            FILE,
            JSON.stringify(
                giaTocs,
                null,
                2
            ),
            "utf8"
        );
    } catch (error) {
        console.error(
            "❌ Lỗi lưu giatoc.json:",
            error
        );
    }
}

loadData();

// =====================================================
// ⚙️ CẤU HÌNH
// =====================================================

const MAX_LEVEL = 20;

const BASE_MAX_MEMBER = 10;

const BASE_CREATE_COST = 5000;

const BASE_UPGRADE_COST = 10000;

const DONATE_EXP_RATE = 1;

// =====================================================
// 🔧 HELPER
// =====================================================

function getPlayer(userId) {
    return database.getPlayer(userId);
}

function formatNumber(number) {
    return Number(
        number || 0
    ).toLocaleString("vi-VN");
}

function safeName(name) {

    return String(name || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 32);
}

function normalizeName(name) {

    return safeName(name)
        .toLowerCase();
}

function getGuildData(guildId) {

    if (!giaTocs[guildId]) {
        giaTocs[guildId] = {};
    }

    return giaTocs[guildId];
}

function getGiaToc(
    guildId,
    name
) {

    const data =
        getGuildData(guildId);

    const key =
        normalizeName(name);

    return data[key] || null;
}

function getUserGiaToc(
    guildId,
    userId
) {

    const data =
        getGuildData(guildId);

    for (const key of Object.keys(data)) {

        const giaToc =
            data[key];

        if (
            Array.isArray(
                giaToc.members
            ) &&
            giaToc.members.some(
                m => m.id === userId
            )
        ) {
            return giaToc;
        }
    }

    return null;
}

function getMaxMembers(level) {

    return (
        BASE_MAX_MEMBER +
        (level - 1) * 5
    );
}

function getUpgradeCost(level) {

    return Math.floor(
        BASE_UPGRADE_COST *
        Math.pow(
            1.7,
            level - 1
        )
    );
}

function getCreateCost() {

    return BASE_CREATE_COST;
}

function calculatePower(
    giaToc
) {

    let power = 0;

    for (
        const member
        of giaToc.members
    ) {

        const player =
            getPlayer(member.id);

        if (!player) continue;

        const cong =
            Number(
                player.cong || 0
            );

        const thu =
            Number(
                player.thu || 0
            );

        const hp =
            Number(
                player.maxHp ||
                player.hp ||
                0
            );

        const linhLuc =
            Number(
                player.linhLuc || 0
            );

        power +=
            cong +
            thu +
            Math.floor(
                hp / 10
            ) +
            linhLuc;
    }

    return Math.floor(
        power *
        giaToc.level
    );
}

// =====================================================
// 🏠 TẠO GIA TỘC
// =====================================================

async function createGiaToc(
    interaction,
    name
) {

    const userId =
        interaction.user.id;

    const player =
        getPlayer(userId);

    if (!player) {

        return interaction.reply({
            content:
                "⚠️ Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    const cleanName =
        safeName(name);

    if (
        cleanName.length < 3
    ) {

        return interaction.reply({
            content:
                "❌ Tên Gia Tộc phải có ít nhất 3 ký tự.",
            ephemeral: true
        });
    }

    if (
        getUserGiaToc(
            interaction.guildId,
            userId
        )
    ) {

        return interaction.reply({
            content:
                "❌ Bạn đã thuộc một Gia Tộc.",
            ephemeral: true
        });
    }

    const guildData =
        getGuildData(
            interaction.guildId
        );

    const key =
        normalizeName(cleanName);

    if (guildData[key]) {

        return interaction.reply({
            content:
                "❌ Gia Tộc này đã tồn tại.",
            ephemeral: true
        });
    }

    const cost =
        getCreateCost();

    const linhThach =
        Number(
            player.linhThach || 0
        );

    if (
        linhThach < cost
    ) {

        return interaction.reply({
            content:
                `💎 Bạn cần **${formatNumber(cost)} Linh Thạch** để sáng lập Gia Tộc.`,
            ephemeral: true
        });
    }

    const giaToc = {

        id:
            `GT_${Date.now()}_${userId}`,

        name:
            cleanName,

        owner:
            userId,

        level:
            1,

        exp:
            0,

        treasury:
            0,

        createdAt:
            Date.now(),

        members: [
            {
                id:
                    userId,

                role:
                    "Tộc Trưởng",

                joinedAt:
                    Date.now()
            }
        ]
    };

    guildData[key] =
        giaToc;

    database.updatePlayer(
        userId,
        {
            linhThach:
                linhThach - cost
        }
    );

    saveData();

    return sendGiaTocPanel(
        interaction,
        giaToc,
        "🎉 GIA TỘC ĐÃ ĐƯỢC SÁNG LẬP"
    );
}

// =====================================================
// 📊 PANEL GIA TỘC
// =====================================================

async function sendGiaTocPanel(
    interaction,
    giaToc,
    title = "🏠 GIA TỘC"
) {

    const maxMember =
        getMaxMembers(
            giaToc.level
        );

    const power =
        calculatePower(
            giaToc
        );

    const owner =
        giaToc.members.find(
            m =>
                m.id ===
                giaToc.owner
        );

    const embed =
        new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle(
                `${title} • ${giaToc.name}`
            )
            .setDescription([
                "━━━━━━━━━━━━━━━━━━━━",
                `🏠 **${giaToc.name}**`,
                "",
                `👑 Tộc Trưởng: <@${giaToc.owner}>`,
                `⭐ Cấp Gia Tộc: **${giaToc.level}/${MAX_LEVEL}**`,
                `✨ EXP: **${formatNumber(giaToc.exp)}**`,
                "",
                `👥 Thành viên: **${giaToc.members.length}/${maxMember}**`,
                `⚔️ Lực chiến: **${formatNumber(power)}**`,
                `💎 Tài khố: **${formatNumber(giaToc.treasury)}**`,
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "🌟 **Phúc lợi Gia Tộc**",
                `👥 Sức chứa: **${maxMember} người**`,
                `📈 Cấp độ: **${giaToc.level}**`,
                "",
                "🏯 *Đoàn kết đồng lòng — gia tộc hưng thịnh.*"
            ].join("\n"))
            .setFooter({
                text:
                    "🌌 Hồng Hoang Đại Lục • Gia Tộc"
            });

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        `gt_members_${giaToc.id}`
                    )
                    .setLabel(
                        "Thành viên"
                    )
                    .setEmoji("👥")
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `gt_upgrade_${giaToc.id}`
                    )
                    .setLabel(
                        "Nâng cấp"
                    )
                    .setEmoji("📈")
                    .setStyle(
                        ButtonStyle.Success
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        `gt_refresh_${giaToc.id}`
                    )
                    .setLabel(
                        "Làm mới"
                    )
                    .setEmoji("🔄")
                    .setStyle(
                        ButtonStyle.Secondary
                    )

            );

    const message =
        await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

    const collector =
        message.createMessageComponentCollector({
            time:
                10 * 60 * 1000
        });

    collector.on(
        "collect",
        async button => {

            if (
                button.user.id !==
                interaction.user.id
            ) {

                return button.reply({
                    content:
                        "🚫 Đây không phải bảng Gia Tộc của bạn.",
                    ephemeral: true
                });
            }

            const id =
                button.customId;

            if (
                id ===
                `gt_refresh_${giaToc.id}`
            ) {

                const current =
                    findGiaTocById(
                        interaction.guildId,
                        giaToc.id
                    );

                if (!current) {

                    return button.reply({
                        content:
                            "❌ Gia Tộc không còn tồn tại.",
                        ephemeral: true
                    });
                }

                const newEmbed =
                    createGiaTocEmbed(
                        current
                    );

                return button.update({
                    embeds: [newEmbed],
                    components: [row]
                });
            }

            if (
                id ===
                `gt_members_${giaToc.id}`
            ) {

                const current =
                    findGiaTocById(
                        interaction.guildId,
                        giaToc.id
                    );

                const lines =
                    current.members
                        .map(
                            (member, index) =>
                                `${index + 1}. ${roleEmoji(member.role)} <@${member.id}> — **${member.role}**`
                        );

                return button.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(
                                0x5865F2
                            )
                            .setTitle(
                                `👥 THÀNH VIÊN • ${current.name}`
                            )
                            .setDescription(
                                lines.join("\n") ||
                                "📭 Chưa có thành viên."
                            )
                            .setFooter({
                                text:
                                    `${current.members.length}/${getMaxMembers(current.level)} thành viên`
                            })
                    ],
                    ephemeral: true
                });
            }

            if (
                id ===
                `gt_upgrade_${giaToc.id}`
            ) {

                const current =
                    findGiaTocById(
                        interaction.guildId,
                        giaToc.id
                    );

                if (
                    current.owner !==
                    button.user.id
                ) {

                    return button.reply({
                        content:
                            "👑 Chỉ **Tộc Trưởng** mới được nâng cấp Gia Tộc.",
                        ephemeral: true
                    });
                }

                const result =
                    upgradeGiaToc(
                        button.user.id,
                        current
                    );

                if (!result.ok) {

                    return button.reply({
                        content:
                            result.message,
                        ephemeral: true
                    });
                }

                const newEmbed =
                    createGiaTocEmbed(
                        current
                    );

                return button.update({
                    embeds: [newEmbed],
                    components: [row]
                });
            }
        }
    );
}

function createGiaTocEmbed(
    giaToc
) {

    const maxMember =
        getMaxMembers(
            giaToc.level
        );

    const power =
        calculatePower(
            giaToc
        );

    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(
            `🏠 GIA TỘC • ${giaToc.name}`
        )
        .setDescription([
            "━━━━━━━━━━━━━━━━━━━━",
            `👑 Tộc Trưởng: <@${giaToc.owner}>`,
            `⭐ Cấp: **${giaToc.level}/${MAX_LEVEL}**`,
            `✨ EXP: **${formatNumber(giaToc.exp)}**`,
            "",
            `👥 Thành viên: **${giaToc.members.length}/${maxMember}**`,
            `⚔️ Lực chiến: **${formatNumber(power)}**`,
            `💎 Tài khố: **${formatNumber(giaToc.treasury)}**`,
            "",
            "━━━━━━━━━━━━━━━━━━━━",
            "🔥 Gia Tộc đang phát triển!"
        ].join("\n"))
        .setFooter({
            text:
                "Hồng Hoang Đại Lục • Gia Tộc"
        });
}

function roleEmoji(role) {

    if (
        role === "Tộc Trưởng"
    ) return "👑";

    if (
        role === "Trưởng Lão"
    ) return "⚜️";

    return "👤";
}

function findGiaTocById(
    guildId,
    id
) {

    const data =
        getGuildData(guildId);

    return Object.values(data)
        .find(
            g => g.id === id
        );
}

// =====================================================
// 📈 NÂNG CẤP
// =====================================================

function upgradeGiaToc(
    userId,
    giaToc
) {

    if (
        giaToc.level >=
        MAX_LEVEL
    ) {

        return {
            ok: false,
            message:
                "👑 Gia Tộc đã đạt cấp tối đa."
        };
    }

    const player =
        getPlayer(userId);

    if (!player) {

        return {
            ok: false,
            message:
                "❌ Không tìm thấy nhân vật."
        };
    }

    const cost =
        getUpgradeCost(
            giaToc.level
        );

    const linhThach =
        Number(
            player.linhThach || 0
        );

    if (
        linhThach < cost
    ) {

        return {
            ok: false,
            message:
                `💎 Cần **${formatNumber(cost)} Linh Thạch** để nâng cấp.`
        };
    }

    database.updatePlayer(
        userId,
        {
            linhThach:
                linhThach - cost
        }
    );

    giaToc.level++;

    giaToc.exp = 0;

    saveData();

    return {
        ok: true
    };
}

// =====================================================
// 💎 ĐÓNG GÓP
// =====================================================

function donate(
    userId,
    giaToc,
    amount
) {

    const player =
        getPlayer(userId);

    if (!player) {

        return {
            ok: false,
            message:
                "❌ Không tìm thấy nhân vật."
        };
    }

    amount =
        Math.floor(
            Number(amount)
        );

    if (
        !Number.isSafeInteger(
            amount
        ) ||
        amount <= 0
    ) {

        return {
            ok: false,
            message:
                "❌ Số Linh Thạch không hợp lệ."
        };
    }

    const linhThach =
        Number(
            player.linhThach || 0
        );

    if (
        linhThach < amount
    ) {

        return {
            ok: false,
            message:
                "💎 Bạn không đủ Linh Thạch."
        };
    }

    database.updatePlayer(
        userId,
        {
            linhThach:
                linhThach - amount
        }
    );

    giaToc.treasury +=
        amount;

    giaToc.exp +=
        amount *
        DONATE_EXP_RATE;

    saveData();

    return {
        ok: true,
        amount
    };
}

// =====================================================
// 🏆 BXH
// =====================================================

function getRanking(
    guildId
) {

    return Object.values(
        getGuildData(guildId)
    )
        .sort(
            (a, b) =>
                calculatePower(b) -
                calculatePower(a)
        );
}

// =====================================================
// 🚀 COMMAND
// =====================================================

const command =
    new SlashCommandBuilder()
        .setName("giatoc")
        .setDescription(
            "🏠 Hệ thống Gia Tộc"
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("tao")
                    .setDescription(
                        "🏠 Sáng lập Gia Tộc"
                    )
                    .addStringOption(
                        option =>
                            option
                                .setName("ten")
                                .setDescription(
                                    "Tên Gia Tộc"
                                )
                                .setRequired(true)
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("xem")
                    .setDescription(
                        "🏠 Xem Gia Tộc của bạn"
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("tim")
                    .setDescription(
                        "🔎 Tìm Gia Tộc"
                    )
                    .addStringOption(
                        option =>
                            option
                                .setName("ten")
                                .setDescription(
                                    "Tên Gia Tộc"
                                )
                                .setRequired(true)
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("xinvao")
                    .setDescription(
                        "🤝 Xin gia nhập Gia Tộc"
                    )
                    .addStringOption(
                        option =>
                            option
                                .setName("ten")
                                .setDescription(
                                    "Tên Gia Tộc"
                                )
                                .setRequired(true)
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("roi")
                    .setDescription(
                        "🚪 Rời Gia Tộc"
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("thanhvien")
                    .setDescription(
                        "👥 Xem thành viên"
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("donggop")
                    .setDescription(
                        "💎 Đóng góp Linh Thạch"
                    )
                    .addIntegerOption(
                        option =>
                            option
                                .setName("so_luong")
                                .setDescription(
                                    "Số Linh Thạch"
                                )
                                .setMinValue(1)
                                .setRequired(true)
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("nangcap")
                    .setDescription(
                        "📈 Nâng cấp Gia Tộc"
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("top")
                    .setDescription(
                        "🏆 BXH Gia Tộc"
                    )
        );

// =====================================================
// ⚡ EXECUTE
// =====================================================

async function execute(
    interaction
) {

    try {

        const action =
            interaction.options
                .getSubcommand();

        const guildId =
            interaction.guildId;

        if (!guildId) {

            return interaction.reply({
                content:
                    "❌ Lệnh này chỉ dùng được trong server.",
                ephemeral: true
            });
        }

        const userId =
            interaction.user.id;

        // ==========================================
        // 🏠 TẠO
        // ==========================================

        if (
            action === "tao"
        ) {

            const name =
                interaction.options
                    .getString("ten");

            return createGiaToc(
                interaction,
                name
            );
        }

        // ==========================================
        // 👤 GIA TỘC CỦA TÔI
        // ==========================================

        if (
            action === "xem"
        ) {

            const giaToc =
                getUserGiaToc(
                    guildId,
                    userId
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc nào.\n\n🏠 Dùng `/giatoc tao` để sáng lập.",
                    ephemeral: true
                });
            }

            return sendGiaTocPanel(
                interaction,
                giaToc
            );
        }

        // ==========================================
        // 🔎 TÌM
        // ==========================================

        if (
            action === "tim"
        ) {

            const name =
                interaction.options
                    .getString("ten");

            const giaToc =
                getGiaToc(
                    guildId,
                    name
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "❌ Không tìm thấy Gia Tộc.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                embeds: [
                    createGiaTocEmbed(
                        giaToc
                    )
                ]
            });
        }

        // ==========================================
        // 🤝 XIN VÀO
        // ==========================================

        if (
            action === "xinvao"
        ) {

            const giaToc =
                getGiaToc(
                    guildId,
                    interaction.options
                        .getString("ten")
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "❌ Không tìm thấy Gia Tộc.",
                    ephemeral: true
                });
            }

            if (
                getUserGiaToc(
                    guildId,
                    userId
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Bạn đã thuộc một Gia Tộc.",
                    ephemeral: true
                });
            }

            if (
                giaToc.members.length >=
                getMaxMembers(
                    giaToc.level
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Gia Tộc đã đầy.",
                    ephemeral: true
                });
            }

            giaToc.members.push({
                id:
                    userId,
                role:
                    "Thành Viên",
                joinedAt:
                    Date.now()
            });

            saveData();

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            0x57F287
                        )
                        .setTitle(
                            "🎉 GIA NHẬP THÀNH CÔNG"
                        )
                        .setDescription([
                            `🏠 Bạn đã gia nhập **${giaToc.name}**!`,
                            "",
                            `👑 Tộc Trưởng: <@${giaToc.owner}>`,
                            `⭐ Cấp: **${giaToc.level}**`,
                            "",
                            "⚔️ Hãy cùng gia tộc phát triển!"
                        ].join("\n"))
                ]
            });
        }

        // ==========================================
        // 🚪 RỜI
        // ==========================================

        if (
            action === "roi"
        ) {

            const giaToc =
                getUserGiaToc(
                    guildId,
                    userId
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "📭 Bạn không thuộc Gia Tộc nào.",
                    ephemeral: true
                });
            }

            if (
                giaToc.owner ===
                userId
            ) {

                return interaction.reply({
                    content:
                        "👑 Tộc Trưởng không thể rời Gia Tộc.\nHãy chuyển quyền trước.",
                    ephemeral: true
                });
            }

            giaToc.members =
                giaToc.members.filter(
                    m =>
                        m.id !==
                        userId
                );

            saveData();

            return interaction.reply({
                content:
                    `🚪 Bạn đã rời **${giaToc.name}**.`
            });
        }

        // ==========================================
        // 👥 THÀNH VIÊN
        // ==========================================

        if (
            action === "thanhvien"
        ) {

            const giaToc =
                getUserGiaToc(
                    guildId,
                    userId
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            const lines =
                giaToc.members
                    .map(
                        (member, index) =>
                            `${index + 1}. ${roleEmoji(member.role)} <@${member.id}> — ${member.role}`
                    );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            0x5865F2
                        )
                        .setTitle(
                            `👥 THÀNH VIÊN • ${giaToc.name}`
                        )
                        .setDescription(
                            lines.join("\n")
                        )
                ]
            });
        }

        // ==========================================
        // 💎 ĐÓNG GÓP
        // ==========================================

        if (
            action === "donggop"
        ) {

            const giaToc =
                getUserGiaToc(
                    guildId,
                    userId
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            const amount =
                interaction.options
                    .getInteger(
                        "so_luong"
                    );

            const result =
                donate(
                    userId,
                    giaToc,
                    amount
                );

            if (!result.ok) {

                return interaction.reply({
                    content:
                        result.message,
                    ephemeral: true
                });
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            0x57F287
                        )
                        .setTitle(
                            "💎 ĐÓNG GÓP THÀNH CÔNG"
                        )
                        .setDescription([
                            `🏠 Gia Tộc: **${giaToc.name}**`,
                            "",
                            `💎 Đã đóng góp: **${formatNumber(amount)}**`,
                            `🏦 Tài khố: **${formatNumber(giaToc.treasury)}**`,
                            `✨ EXP Gia Tộc: **+${formatNumber(amount)}**`
                        ].join("\n"))
                ]
            });
        }

        // ==========================================
        // 📈 NÂNG CẤP
        // ==========================================

        if (
            action === "nangcap"
        ) {

            const giaToc =
                getUserGiaToc(
                    guildId,
                    userId
                );

            if (!giaToc) {

                return interaction.reply({
                    content:
                        "📭 Bạn chưa thuộc Gia Tộc.",
                    ephemeral: true
                });
            }

            if (
                giaToc.owner !==
                userId
            ) {

                return interaction.reply({
                    content:
                        "👑 Chỉ Tộc Trưởng được nâng cấp.",
                    ephemeral: true
                });
            }

            const result =
                upgradeGiaToc(
                    userId,
                    giaToc
                );

            if (!result.ok) {

                return interaction.reply({
                    content:
                        result.message,
                    ephemeral: true
                });
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            0x57F287
                        )
                        .setTitle(
                            "📈 GIA TỘC ĐÃ NÂNG CẤP"
                        )
                        .setDescription([
                            `🏠 **${giaToc.name}**`,
                            "",
                            `⭐ Cấp mới: **${giaToc.level}**`,
                            `👥 Sức chứa: **${getMaxMembers(giaToc.level)} người**`,
                            "",
                            "🔥 Gia Tộc ngày càng hưng thịnh!"
                        ].join("\n"))
                ]
            });
        }

        // ==========================================
        // 🏆 TOP
        // ==========================================

        if (
            action === "top"
        ) {

            const ranking =
                getRanking(
                    guildId
                );

            if (
                ranking.length === 0
            ) {

                return interaction.reply({
                    content:
                        "📭 Server chưa có Gia Tộc nào.",
                    ephemeral: true
                });
            }

            const lines =
                ranking
                    .slice(0, 10)
                    .map(
                        (g, index) =>
                            `${index === 0 ? "👑" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"} **${index + 1}. ${g.name}** — ⚔️ ${formatNumber(calculatePower(g))}`
                    );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(
                            0xF1C40F
                        )
                        .setTitle(
                            "🏆 BXH GIA TỘC"
                        )
                        .setDescription(
                            lines.join("\n")
                        )
                        .setFooter({
                            text:
                                "Top 10 Gia Tộc mạnh nhất"
                        })
                ]
            });
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
                    "❌ Gia Tộc xảy ra lỗi khi thực hiện chức năng."
            });
        }

        return interaction.reply({
            content:
                "❌ Gia Tộc xảy ra lỗi khi thực hiện chức năng.",
            ephemeral: true
        });
    }
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {

    data:
        command,

    execute,

    getUserGiaToc,

    getGiaToc,

    getRanking

};
