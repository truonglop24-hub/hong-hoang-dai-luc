const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 30 * 60 * 1000;

// =====================================================
// 👹 DANH SÁCH BOSS
// =====================================================

const bosses = [
    { name: "🐉 Hắc Long", hp: 400, reward: 250 },
    { name: "👹 Thao Thiết", hp: 550, reward: 350 },
    { name: "🔥 Chu Tước Ma Vương", hp: 700, reward: 500 },
    { name: "🌑 Cửu U Ma Đế", hp: 900, reward: 750 }
];

// =====================================================
// ⚔️ 😈 🐺 BUFF 3 ĐẠO
// =====================================================

const DAO_BUFFS = {
    chinhdao: {
        name: "⚔️ Chính Đạo",
        cong: 10,
        thu: 25,
        hp: 20
    },

    madao: {
        name: "😈 Ma Đạo",
        cong: 30,
        thu: -10,
        hp: 0
    },

    yeudao: {
        name: "🐺 Yêu Đạo",
        cong: 15,
        thu: 20,
        hp: 40
    }
};

// =====================================================
// 🔧 LẤY ĐẠO
// =====================================================

function normalizeDao(player) {

    const dao =
        player?.dao ||
        player?.conDuong ||
        player?.phuongDao ||
        "chinhdao";

    const value =
        String(dao)
            .toLowerCase()
            .trim();

    if (
        value === "madao" ||
        value === "ma dao" ||
        value.includes("ma đạo")
    ) {
        return "madao";
    }

    if (
        value === "yeudao" ||
        value === "yeu dao" ||
        value.includes("yêu đạo")
    ) {
        return "yeudao";
    }

    return "chinhdao";
}

function getDaoBuff(player) {
    return DAO_BUFFS[
        normalizeDao(player)
    ];
}

// =====================================================
// ⚔️ TÍNH SỨC CHIẾN ĐẤU
// =====================================================

function getPlayerPower(player) {

    const buff =
        getDaoBuff(player);

    const cong =
        Number(
            player.cong || 0
        );

    const thu =
        Number(
            player.thu || 0
        );

    const linhLuc =
        Number(
            player.linhLuc || 0
        );

    const hp =
        Number(
            player.maxHp ||
            player.hp ||
            100
        );

    // Buff Công
    const buffCong =
        cong *
        (
            1 +
            buff.cong / 100
        );

    // Buff Thủ
    const buffThu =
        Math.max(
            0,
            thu *
            (
                1 +
                buff.thu / 100
            )
        );

    // Buff HP
    const buffHp =
        hp *
        (
            1 +
            buff.hp / 100
        );

    return Math.floor(

        buffCong * 2 +

        buffThu +

        Math.floor(
            linhLuc / 10
        ) +

        buffHp / 10

    );
}

// =====================================================
// 🎯 TÍNH HP SAU KHI BỊ BOSS ĐÁNH
// =====================================================

function getDamage(player) {

    const buff =
        getDaoBuff(player);

    let damage = 30;

    /*
     * Yêu Đạo có HP +40%
     * nên chịu đòn tốt hơn.
     */

    if (
        buff.hp > 0
    ) {

        damage =
            Math.max(
                10,
                Math.floor(
                    damage *
                    (
                        1 -
                        buff.hp / 200
                    )
                )
            );
    }

    /*
     * Chính Đạo có Thủ +25%
     * nên giảm thêm sát thương.
     */

    if (
        buff.thu > 0
    ) {

        damage =
            Math.max(
                5,
                Math.floor(
                    damage *
                    (
                        1 -
                        buff.thu / 250
                    )
                )
            );
    }

    /*
     * Ma Đạo Thủ -10%
     * nên chịu sát thương nhiều hơn.
     */

    if (
        buff.thu < 0
    ) {

        damage =
            Math.floor(
                damage *
                (
                    1 +
                    Math.abs(
                        buff.thu
                    ) / 100
                )
            );
    }

    return Math.max(
        1,
        damage
    );
}

// =====================================================
// 🎲 RANDOM BOSS
// =====================================================

function getRandomBoss() {

    return bosses[
        Math.floor(
            Math.random() *
            bosses.length
        )
    ];
}

// =====================================================
// 🏆 COMMAND /BOSS
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("boss")

        .setDescription(
            "Thách đấu Boss Hồng Hoang"
        ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        const p =
            getPlayer(
                userId
            );

        // =================================================
        // ❌ CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {

            return interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước.",

                ephemeral:
                    true
            });
        }

        // =================================================
        // ⏳ COOLDOWN
        // =================================================

        const remaining =
            COOLDOWN -
            (
                Date.now() -
                (
                    p.lastBoss ||
                    0
                )
            );

        if (
            remaining > 0
        ) {

            return interaction.reply({

                content:
                    `⏳ Boss chưa xuất hiện lại. Còn **${Math.ceil(remaining / 60000)} phút**.`,

                ephemeral:
                    true
            });
        }

        // =================================================
        // 👹 BOSS
        // =================================================

        const boss =
            getRandomBoss();

        // =================================================
        // ⚔️ ĐẠO
        // =================================================

        const dao =
            getDaoBuff(p);

        // =================================================
        // ⚔️ SỨC CHIẾN ĐẤU
        // =================================================

        const playerPower =
            getPlayerPower(p);

        const roll =
            Math.random() * 300;

        const win =
            playerPower +
            roll >=
            boss.hp;

        // =================================================
        // 💀 THUA
        // =================================================

        if (!win) {

            const damage =
                getDamage(p);

            const newHp =
                Math.max(
                    1,
                    Number(
                        p.hp || 0
                    ) -
                    damage
                );

            updatePlayer(
                userId,
                {

                    lastBoss:
                        Date.now(),

                    hp:
                        newHp

                }
            );

            return interaction.reply({

                content:

                    `💀 **${boss.name}** quá mạnh!\n\n` +

                    `🌌 Đạo: **${dao.name}**\n` +

                    `⚔️ Sức chiến đấu: **${playerPower}**\n` +

                    `🎲 Lực chiến ngẫu nhiên: **+${Math.floor(roll)}**\n` +

                    `❤️ HP mất: **-${damage}**\n` +

                    `❤️ HP còn: **${newHp}**`

            });
        }

        // =================================================
        // 🎁 THẮNG
        // =================================================

        const exp =
            boss.reward;

        const stones =
            boss.reward;

        updatePlayer(
            userId,
            {

                lastBoss:
                    Date.now(),

                kinhNghiem:
                    Number(
                        p.kinhNghiem ||
                        0
                    ) +
                    exp,

                linhThach:
                    Number(
                        p.linhThach ||
                        0
                    ) +
                    stones,

                bossDaGiet:
                    Number(
                        p.bossDaGiet ||
                        0
                    ) +
                    1

            }
        );

        // =================================================
        // 🏆 EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🏆 BOSS BỊ ĐÁNH BẠI"
                )

                .setDescription(

                    `⚔️ Bạn đã chém giết **${boss.name}**!\n\n` +

                    `🌌 Con đường: **${dao.name}**\n\n` +

                    `⚔️ Sức chiến đấu: **${playerPower}**\n` +

                    `🎲 Lực chiến ngẫu nhiên: **+${Math.floor(roll)}**`

                )

                .addFields(

                    {
                        name:
                            "✨ Kinh nghiệm",

                        value:
                            `+${exp}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "💎 Linh thạch",

                        value:
                            `+${stones}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🌌 Buff Đạo",

                        value:
                            `${dao.name}\n` +
                            `⚔️ Công +${dao.cong}%\n` +
                            `🛡️ Thủ ${dao.thu >= 0 ? "+" : ""}${dao.thu}%\n` +
                            `❤️ HP +${dao.hp}%`,

                        inline:
                            false
                    }

                )

                .setFooter({

                    text:
                        "Boss sẽ hồi sinh sau 30 phút"

                });

        return interaction.reply({

            embeds:
                [embed]

        });
    },

    // =================================================
    // 📦 EXPORT
    // =================================================

    bosses,

    DAO_BUFFS,

    getPlayerPower,

    getDaoBuff
};
