const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getPlayer, updatePlayer } = require("./database");

// ======================================================
// ⏱️ COOLDOWN PHÓ BẢN: 5 PHÚT
// ======================================================
const COOLDOWN = 5 * 60 * 1000;

// ======================================================
// 🏯 DANH SÁCH PHÓ BẢN
// ======================================================
const PHO_BAN = {
    thanh_lam: {
        name: "🌲 Thanh Vân Cổ Lâm",
        enemy: "🐺 Thanh Lang Yêu",
        difficulty: "⭐ Dễ",
        minPower: 0,
        hpMin: 90,
        hpMax: 140,
        atkMin: 10,
        atkMax: 18,
        expMin: 50,
        expMax: 90,
        stoneMin: 40,
        stoneMax: 80,
        heal: 15
    },

    huyet_sac: {
        name: "🩸 Huyết Sắc Ma Cốc",
        enemy: "👹 Huyết Ma",
        difficulty: "⭐⭐ Khá",
        minPower: 80,
        hpMin: 140,
        hpMax: 210,
        atkMin: 18,
        atkMax: 28,
        expMin: 90,
        expMax: 150,
        stoneMin: 70,
        stoneMax: 130,
        heal: 20
    },

    loi_vuc: {
        name: "⚡ Cửu Thiên Lôi Vực",
        enemy: "⚡ Lôi Thú",
        difficulty: "⭐⭐⭐ Khó",
        minPower: 150,
        hpMin: 200,
        hpMax: 290,
        atkMin: 25,
        atkMax: 38,
        expMin: 140,
        expMax: 220,
        stoneMin: 110,
        stoneMax: 190,
        heal: 25
    },

    bang_nguyen: {
        name: "❄️ Cực Bắc Băng Nguyên",
        enemy: "🐲 Băng Giáp Long",
        difficulty: "⭐⭐⭐ Khó",
        minPower: 230,
        hpMin: 280,
        hpMax: 390,
        atkMin: 32,
        atkMax: 46,
        expMin: 200,
        expMax: 310,
        stoneMin: 160,
        stoneMax: 270,
        heal: 30
    },

    van_yeu: {
        name: "🐉 Vạn Yêu Sơn Mạch",
        enemy: "🦖 Đại Yêu Vương",
        difficulty: "⭐⭐⭐⭐ Rất khó",
        minPower: 330,
        hpMin: 380,
        hpMax: 520,
        atkMin: 42,
        atkMax: 58,
        expMin: 280,
        expMax: 430,
        stoneMin: 230,
        stoneMax: 380,
        heal: 35
    },

    ma_cung: {
        name: "😈 Vạn Ma Cổ Cung",
        enemy: "👿 Ma Tướng",
        difficulty: "⭐⭐⭐⭐ Rất khó",
        minPower: 450,
        hpMin: 500,
        hpMax: 680,
        atkMin: 52,
        atkMax: 70,
        expMin: 380,
        expMax: 560,
        stoneMin: 320,
        stoneMax: 520,
        heal: 40
    },

    chien_truong: {
        name: "⚔️ Thượng Cổ Chiến Trường",
        enemy: "🗿 Chiến Hồn Thượng Cổ",
        difficulty: "⭐⭐⭐⭐⭐ Cực khó",
        minPower: 600,
        hpMin: 650,
        hpMax: 850,
        atkMin: 65,
        atkMax: 88,
        expMin: 520,
        expMax: 760,
        stoneMin: 450,
        stoneMax: 720,
        heal: 45
    },

    hon_don: {
        name: "🌌 Hỗn Độn Thâm Uyên",
        enemy: "👁️ Hỗn Độn Cổ Thú",
        difficulty: "⭐⭐⭐⭐⭐⭐ Địa ngục",
        minPower: 800,
        hpMin: 850,
        hpMax: 1100,
        atkMin: 80,
        atkMax: 110,
        expMin: 700,
        expMax: 1000,
        stoneMin: 650,
        stoneMax: 1000,
        heal: 50
    }
};

// ======================================================
// 🔧 HÀM TIỆN ÍCH
// ======================================================
function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function getNumber(value, fallback = 0) {
    const n = Number(value);

    return Number.isFinite(n)
        ? n
        : fallback;
}

function formatCooldown(ms) {
    const totalSeconds =
        Math.ceil(ms / 1000);

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes} phút ${seconds} giây`;
    }

    return `${seconds} giây`;
}

function getPower(player) {
    const cong =
        getNumber(player.cong);

    const thu =
        getNumber(player.thu);

    const linhLuc =
        getNumber(player.linhLuc);

    return (
        cong +
        thu +
        Math.floor(linhLuc / 20)
    );
}

// ======================================================
// 🏯 TẠO MENU PHÓ BẢN
// ======================================================
function createDungeonMenu(player) {

    const power =
        getPower(player);

    const embed =
        new EmbedBuilder()
            .setColor(0x8e44ad)
            .setTitle("🏯 PHÓ BẢN HỒNG HOANG")
            .setDescription(
                "🌌 **Chọn một phó bản để tiến vào chiến đấu.**\n\n" +
                `⚔️ Chiến lực hiện tại: **${power.toLocaleString()}**\n` +
                "⏱️ Mỗi lần tham gia phó bản sẽ **hồi 5 phút**.\n\n" +
                "👇 **Chọn phó bản bên dưới:**"
            )
            .setFooter({
                text:
                    "🌌 Hồng Hoang Đại Lục • Phó Bản"
            });

    const buttons =
        Object.entries(PHO_BAN)
            .map(([id, dungeon]) => {

                const locked =
                    power < dungeon.minPower;

                const emoji =
                    dungeon.name.match(/^\S+/u)?.[0]
                    || "🏯";

                const label =
                    dungeon.name
                        .replace(
                            /^[🌲🩸⚡❄️🐉😈⚔️🌌]\s*/u,
                            ""
                        )
                        .trim();

                return new ButtonBuilder()
                    .setCustomId(
                        `phoban_enter_${id}`
                    )
                    .setLabel(label)
                    .setEmoji(emoji)
                    .setStyle(
                        locked
                            ? ButtonStyle.Secondary
                            : ButtonStyle.Primary
                    )
                    .setDisabled(locked);
            });

    const rows = [];

    // 4 nút mỗi hàng
    for (
        let i = 0;
        i < buttons.length;
        i += 4
    ) {

        rows.push(
            new ActionRowBuilder()
                .addComponents(
                    buttons.slice(i, i + 4)
                )
        );
    }

    rows.push(
        new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        "phoban_info"
                    )
                    .setLabel(
                        "📜 Thông tin phó bản"
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            )
    );

    return {
        embeds: [embed],
        components: rows
    };
}

// ======================================================
// 📜 THÔNG TIN PHÓ BẢN
// ======================================================
async function showDungeonInfo(
    interaction
) {

    const lines =
        Object.values(PHO_BAN)
            .map(dungeon => {

                return (
                    `${dungeon.name} — **${dungeon.difficulty}**\n` +
                    `👹 ${dungeon.enemy} • ` +
                    `⚔️ Chiến lực yêu cầu: **${dungeon.minPower}**`
                );
            });

    const embed =
        new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(
                "📜 THÔNG TIN PHÓ BẢN"
            )
            .setDescription(
                lines.join("\n\n") +
                "\n\n⏱️ **Cooldown: 5 phút**"
            );

    return interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

// ======================================================
// ⚔️ VÀO PHÓ BẢN
// ======================================================
async function enterDungeon(
    interaction,
    dungeonId
) {

    const p =
        getPlayer(
            interaction.user.id
        );

    if (!p) {

        return interaction.reply({
            content:
                "⚠️ Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    const dungeon =
        PHO_BAN[dungeonId];

    if (!dungeon) {

        return interaction.reply({
            content:
                "❌ Phó bản không tồn tại.",
            ephemeral: true
        });
    }

    // ==================================================
    // ⏱️ KIỂM TRA COOLDOWN
    // ==================================================

    const lastDungeon =
        getNumber(
            p.lastDungeon,
            0
        );

    const remaining =
        COOLDOWN -
        (
            Date.now() -
            lastDungeon
        );

    if (remaining > 0) {

        return interaction.reply({
            content:
                `⏳ **Phó bản đang hồi phục!**\n\n` +
                `🕐 Còn **${formatCooldown(
                    remaining
                )}** mới có thể tham gia lại.`,
            ephemeral: true
        });
    }

    // ==================================================
    // ⚔️ KIỂM TRA CHIẾN LỰC
    // ==================================================

    const power =
        getPower(p);

    if (
        power <
        dungeon.minPower
    ) {

        return interaction.reply({
            content:
                `🔒 **Chưa đủ chiến lực!**\n\n` +
                `🏯 Phó bản: **${dungeon.name}**\n` +
                `⚔️ Yêu cầu: **${dungeon.minPower}**\n` +
                `💪 Chiến lực của bạn: **${power}**`,
            ephemeral: true
        });
    }

    // ==================================================
    // 👹 TẠO QUÁI
    // ==================================================

    const enemyHp =
        randomInt(
            dungeon.hpMin,
            dungeon.hpMax
        );

    const enemyAtk =
        randomInt(
            dungeon.atkMin,
            dungeon.atkMax
        );

    // ==================================================
    // ⚔️ TÍNH CHIẾN LỰC
    // ==================================================

    const attackPower =
        getNumber(p.cong) +
        Math.floor(
            getNumber(p.linhLuc) / 25
        );

    const defensePower =
        getNumber(p.thu);

    const combatPower =
        power +
        attackPower * 0.35 +
        defensePower * 0.25;

    const enemyPower =
        enemyHp * 0.9 +
        enemyAtk * 3;

    const roll =
        Math.random() * 100;

    const win =
        combatPower * 0.72 +
        roll >
        enemyPower * 0.78;

    const now =
        Date.now();

    // ==================================================
    // 💀 THẤT BẠI
    // ==================================================

    if (!win) {

        const currentHp =
            Math.max(
                1,
                getNumber(
                    p.hp,
                    1
                )
            );

        const damage =
            randomInt(
                Math.max(
                    1,
                    Math.floor(
                        enemyAtk * 0.5
                    )
                ),
                Math.max(
                    1,
                    enemyAtk
                )
            );

        const newHp =
            Math.max(
                1,
                currentHp - damage
            );

        updatePlayer(
            interaction.user.id,
            {
                lastDungeon: now,
                hp: newHp
            }
        );

        const embed =
            new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle(
                    "💀 PHÓ BẢN THẤT BẠI"
                )
                .setDescription(
                    `🏯 **${dungeon.name}**\n\n` +
                    `👹 Kẻ địch: **${dungeon.enemy}**\n` +
                    `💥 Bạn đã bị đánh lui khỏi phó bản.\n\n` +
                    `❤️ HP mất: **-${damage}**\n` +
                    `❤️ HP còn lại: **${newHp}/${getNumber(
                        p.maxHp,
                        newHp
                    )}**\n\n` +
                    `⏱️ Phó bản đã bắt đầu hồi **5 phút**.`
                )
                .setFooter({
                    text:
                        "🌌 Hồng Hoang Đại Lục"
                });

        return interaction.update({
            embeds: [embed],
            components: []
        });
    }

    // ==================================================
    // 🏆 THẮNG
    // ==================================================

    const exp =
        randomInt(
            dungeon.expMin,
            dungeon.expMax
        );

    const stones =
        randomInt(
            dungeon.stoneMin,
            dungeon.stoneMax
        );

    const currentHp =
        getNumber(
            p.hp,
            1
        );

    const maxHp =
        Math.max(
            1,
            getNumber(
                p.maxHp,
                currentHp
            )
        );

    const newHp =
        Math.min(
            maxHp,
            currentHp +
            dungeon.heal
        );

    const oldCompleted =
        getNumber(
            p.phoBanDaHoanThanh,
            0
        );

    updatePlayer(
        interaction.user.id,
        {
            lastDungeon: now,

            kinhNghiem:
                getNumber(
                    p.kinhNghiem,
                    0
                ) + exp,

            linhThach:
                getNumber(
                    p.linhThach,
                    0
                ) + stones,

            phoBanDaHoanThanh:
                oldCompleted + 1,

            hp: newHp
        }
    );

    const embed =
        new EmbedBuilder()
            .setColor(0x2ecc71)
            .setTitle(
                "🏆 PHÓ BẢN HOÀN THÀNH"
            )
            .setDescription(
                `🏯 **${dungeon.name}**\n\n` +
                `👹 Kẻ địch: **${dungeon.enemy}**\n` +
                `⭐ Độ khó: **${dungeon.difficulty}**\n\n` +
                `🎁 **Phần thưởng nhận được:**`
            )
            .addFields(
                {
                    name:
                        "✨ Kinh nghiệm",
                    value:
                        `+${exp.toLocaleString()}`,
                    inline: true
                },
                {
                    name:
                        "💎 Linh thạch",
                    value:
                        `+${stones.toLocaleString()}`,
                    inline: true
                },
                {
                    name:
                        "❤️ Hồi phục",
                    value:
                        `+${dungeon.heal} HP`,
                    inline: true
                },
                {
                    name:
                        "⚔️ Chiến lực",
                    value:
                        power.toLocaleString(),
                    inline: true
                },
                {
                    name:
                        "🏆 Tổng phó bản",
                    value:
                        `${(
                            oldCompleted + 1
                        ).toLocaleString()}`,
                    inline: true
                }
            )
            .setFooter({
                text:
                    "⏱️ Phó bản hồi sau 5 phút • Hồng Hoang Đại Lục"
            });

    return interaction.update({
        embeds: [embed],
        components: []
    });
}

// ======================================================
// 🧾 SLASH COMMAND
// ======================================================
module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("phoban")
            .setDescription(
                "🏯 Mở danh sách phó bản Hồng Hoang"
            ),

    // ==================================================
    // /phoban
    // ==================================================

    async execute(interaction) {

        const p =
            getPlayer(
                interaction.user.id
            );

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        return interaction.reply(
            createDungeonMenu(p)
        );
    },

    // ==================================================
    // 🔘 XỬ LÝ BUTTON
    // ==================================================

    async handleComponent(
        interaction
    ) {

        const id =
            interaction.customId || "";

        if (
            id ===
            "phoban_info"
        ) {

            return showDungeonInfo(
                interaction
            );
        }

        if (
            !id.startsWith(
                "phoban_enter_"
            )
        ) {

            return false;
        }

        const dungeonId =
            id.replace(
                "phoban_enter_",
                ""
            );

        return enterDungeon(
            interaction,
            dungeonId
        );
    }
};
