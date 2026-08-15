const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 30 * 60 * 1000;

// =====================================================
// 👹 DANH SÁCH BOSS
// =====================================================

const bosses = [
    {
        name: "🐉 Hắc Long",
        hp: 400,
        reward: 250
    },
    {
        name: "👹 Thao Thiết",
        hp: 550,
        reward: 350
    },
    {
        name: "🔥 Chu Tước Ma Vương",
        hp: 700,
        reward: 500
    },
    {
        name: "🌑 Cửu U Ma Đế",
        hp: 900,
        reward: 750,
        finalBoss: true,
        keyDropRate: 0.5
    }
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
// 🔧 XÁC ĐỊNH ĐẠO
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
// ⚔️ TÍNH LỰC CHIẾN
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

    const buffCong =
        cong *
        (
            1 +
            buff.cong / 100
        );

    const buffThu =
        Math.max(
            0,
            thu *
            (
                1 +
                buff.thu / 100
            )
        );

    const buffHp =
        hp *
        (
            1 +
            buff.hp / 100
        );

    return Math.floor(
        buffCong * 2 +
        buffThu +
        Math.floor(linhLuc / 10) +
        buffHp / 10
    );
}

// =====================================================
// 🛡️ TÍNH SÁT THƯƠNG BOSS
// =====================================================

function getBossDamage(player) {

    const buff =
        getDaoBuff(player);

    let damage = 30;

    // Chính Đạo / Yêu Đạo có thủ và HP cao
    if (buff.thu > 0) {

        damage =
            Math.floor(
                damage *
                (
                    1 -
                    buff.thu / 250
                )
            );
    }

    if (buff.hp > 0) {

        damage =
            Math.floor(
                damage *
                (
                    1 -
                    buff.hp / 200
                )
            );
    }

    // Ma Đạo Thủ -10%
    if (buff.thu < 0) {

        damage =
            Math.floor(
                damage *
                (
                    1 +
                    Math.abs(buff.thu) / 100
                )
            );
    }

    return Math.max(
        1,
        damage
    );
}

// =====================================================
// 🔑 TỶ LỆ RƠI CHÌA KHÓA
// =====================================================

function rollKeyDrop(boss) {

    if (
        !boss.finalBoss
    ) {
        return false;
    }

    const rate =
        Number(
            boss.keyDropRate || 0
        );

    return (
        Math.random() * 100
    ) < rate;
}

// =====================================================
// 📦 THÊM CHÌA KHÓA VÀO KHO
// =====================================================

function addTienGioiKey(player) {

    /*
     * Hỗ trợ nhiều kiểu kho đồ để hạn chế
     * ảnh hưởng database hiện tại.
     */

    if (
        Array.isArray(
            player.khoDo
        )
    ) {

        player.khoDo.push(
            "Chìa Khóa Tiên Giới"
        );

        return {
            khoDo:
                player.khoDo
        };
    }

    if (
        Array.isArray(
            player.inventory
        )
    ) {

        player.inventory.push(
            "Chìa Khóa Tiên Giới"
        );

        return {
            inventory:
                player.inventory
        };
    }

    if (
        Array.isArray(
            player.tuiDo
        )
    ) {

        player.tuiDo.push(
            "Chìa Khóa Tiên Giới"
        );

        return {
            tuiDo:
                player.tuiDo
        };
    }

    /*
     * Nếu database đang lưu item dưới dạng
     * object số lượng.
     */

    if (
        player.kho &&
        typeof player.kho === "object"
    ) {

        const kho = {
            ...player.kho
        };

        kho["Chìa Khóa Tiên Giới"] =
            Number(
                kho["Chìa Khóa Tiên Giới"] ||
                0
            ) + 1;

        return {
            kho
        };
    }

    /*
     * Trường hợp database chưa có kho.
     */
    return {
        khoDo: [
            "Chìa Khóa Tiên Giới"
        ]
    };
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
// /BOSS
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName(
                "boss"
            )

            .setDescription(
                "Thách đấu Boss Hồng Hoang"
            ),

    async execute(
        interaction
    ) {

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
                    `⏳ Boss chưa xuất hiện lại. Còn **${Math.ceil(
                        remaining / 60000
                    )} phút**.`,

                ephemeral:
                    true
            });
        }

        // =================================================
        // 👹 RANDOM BOSS
        // =================================================

        const boss =
            getRandomBoss();

        // =================================================
        // 🌌 ĐẠO
        // =================================================

        const dao =
            getDaoBuff(p);

        // =================================================
        // ⚔️ LỰC CHIẾN
        // =================================================

        const playerPower =
            getPlayerPower(
                p
            );

        const roll =
            Math.random() *
            300;

        const totalPower =
            playerPower +
            roll;

        const win =
            totalPower >=
            boss.hp;

        // =================================================
        // 💀 THUA
        // =================================================

        if (!win) {

            const damage =
                getBossDamage(
                    p
                );

            const oldHp =
                Number(
                    p.hp || 1
                );

            const newHp =
                Math.max(
                    1,
                    oldHp -
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

                embeds: [

                    new EmbedBuilder()

                        .setColor(
                            0xed4245
                        )

                        .setTitle(
                            "💀 BOSS CHIẾN THẮNG"
                        )

                        .setDescription(

                            `**${boss.name}** quá mạnh!\n\n` +

                            `🌌 Đạo: **${dao.name}**\n` +

                            `⚔️ Lực chiến: **${playerPower}**\n` +

                            `🎲 Lực chiến ngẫu nhiên: **+${Math.floor(roll)}**\n\n` +

                            `💥 Sát thương nhận: **-${damage} HP**\n` +

                            `❤️ HP còn: **${newHp}**`

                        )

                ]

            });
        }

        // =================================================
        // 🏆 THẮNG
        // =================================================

        const exp =
            Number(
                boss.reward || 0
            );

        const stones =
            Number(
                boss.reward || 0
            );

        let updateData = {

            lastBoss:
                Date.now(),

            kinhNghiem:
                Number(
                    p.kinhNghiem || 0
                ) +
                exp,

            linhThach:
                Number(
                    p.linhThach || 0
                ) +
                stones,

            bossDaGiet:
                Number(
                    p.bossDaGiet || 0
                ) +
                1
        };

        // =================================================
        // 🔑 CHÌA KHÓA TIÊN GIỚI
        // =================================================

        const gotKey =
            rollKeyDrop(
                boss
            );

        if (
            gotKey
        ) {

            const keyData =
                addTienGioiKey(
                    p
                );

            updateData = {
                ...updateData,
                ...keyData
            };
        }

        // =================================================
        // 💾 LƯU
        // =================================================

        updatePlayer(
            userId,
            updateData
        );

        // =================================================
        // 🏆 EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    boss.finalBoss
                        ? 0xf1c40f
                        : 0x57f287
                )

                .setTitle(
                    boss.finalBoss
                        ? "👑 BOSS CUỐI BỊ ĐÁNH BẠI!"
                        : "🏆 BOSS BỊ ĐÁNH BẠI"
                )

                .setDescription(

                    `⚔️ Bạn đã chém giết **${boss.name}**!\n\n` +

                    `🌌 Đạo: **${dao.name}**\n` +

                    `⚔️ Lực chiến: **${playerPower}**\n` +

                    `🎲 Lực chiến ngẫu nhiên: **+${Math.floor(roll)}**\n\n` +

                    (
                        boss.finalBoss
                            ? `👑 **BOSS CUỐI**\n🔑 Tỷ lệ Chìa Khóa Tiên Giới: **0.5%**\n\n`
                            : ""
                    ) +

                    (
                        gotKey
                            ? "🎉 **HIẾM! BẠN ĐÃ NHẬN ĐƯỢC 🔑 CHÌA KHÓA TIÊN GIỚI!**\n\n"
                            : ""
                    )

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

                            `🛡️ Thủ ${
                                dao.thu >= 0
                                    ? "+"
                                    : ""
                            }${dao.thu}%\n` +

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

    bosses,

    DAO_BUFFS,

    getPlayerPower,

    getDaoBuff,

    rollKeyDrop
};
