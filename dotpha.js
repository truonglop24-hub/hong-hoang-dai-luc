const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// 18 CẢNH GIỚI
// =====================================================

const realms = [
    { name: "Phàm Nhân", maxCultivation: 1000 },
    { name: "Luyện Khí", maxCultivation: 10000 },
    { name: "Trúc Cơ", maxCultivation: 30000 },
    { name: "Kim Đan", maxCultivation: 80000 },
    { name: "Nguyên Anh", maxCultivation: 200000 },
    { name: "Hóa Thần", maxCultivation: 500000 },
    { name: "Luyện Hư", maxCultivation: 1000000 },
    { name: "Hợp Thể", maxCultivation: 3000000 },
    { name: "Đại Thừa", maxCultivation: 10000000 },
    { name: "Độ Kiếp", maxCultivation: 30000000 },
    { name: "Tiên Nhân", maxCultivation: 100000000 },
    { name: "Chân Tiên", maxCultivation: 500000000 },
    { name: "Thiên Tiên", maxCultivation: 1000000000 },
    { name: "Huyền Tiên", maxCultivation: 5000000000 },
    { name: "Kim Tiên", maxCultivation: 30000000000 },
    { name: "Thánh Nhân", maxCultivation: 100000000000 },
    { name: "Thiên Đạo", maxCultivation: 10000000000000 },
    { name: "Đại Đạo", maxCultivation: 99999999999999 }
];

// =====================================================
// CHỈ SỐ CỘNG THEO CẢNH GIỚI
// =====================================================

const stats = {
    "Phàm Nhân": {
        hp: 100,
        cong: 20,
        thu: 15
    },

    "Luyện Khí": {
        hp: 300,
        cong: 60,
        thu: 40
    },

    "Trúc Cơ": {
        hp: 1000,
        cong: 200,
        thu: 140
    },

    "Kim Đan": {
        hp: 3000,
        cong: 600,
        thu: 400
    },

    "Nguyên Anh": {
        hp: 10000,
        cong: 2000,
        thu: 1400
    },

    "Hóa Thần": {
        hp: 30000,
        cong: 6000,
        thu: 4000
    },

    "Luyện Hư": {
        hp: 100000,
        cong: 20000,
        thu: 14000
    },

    "Hợp Thể": {
        hp: 300000,
        cong: 60000,
        thu: 40000
    },

    "Đại Thừa": {
        hp: 1000000,
        cong: 200000,
        thu: 140000
    },

    "Độ Kiếp": {
        hp: 3000000,
        cong: 600000,
        thu: 400000
    },

    "Tiên Nhân": {
        hp: 10000000,
        cong: 2000000,
        thu: 1400000
    },

    "Chân Tiên": {
        hp: 30000000,
        cong: 6000000,
        thu: 4000000
    },

    "Thiên Tiên": {
        hp: 100000000,
        cong: 20000000,
        thu: 14000000
    },

    "Huyền Tiên": {
        hp: 300000000,
        cong: 60000000,
        thu: 40000000
    },

    "Kim Tiên": {
        hp: 1000000000,
        cong: 200000000,
        thu: 140000000
    },

    "Thánh Nhân": {
        hp: 5000000000,
        cong: 1000000000,
        thu: 700000000
    },

    "Thiên Đạo": {
        hp: 20000000000,
        cong: 4000000000,
        thu: 2800000000
    },

    "Đại Đạo": {
        hp: 100000000000,
        cong: 20000000000,
        thu: 14000000000
    }
};

// =====================================================
// LỆNH /DOTPHA
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("dotpha")
        .setDescription("⚡ Đột phá cảnh giới"),

    async execute(interaction) {

        const p = getPlayer(interaction.user.id);

        // =================================================
        // KIỂM TRA NHÂN VẬT
        // =================================================

        if (!p) {
            return interaction.reply({
                content: "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // TÌM CẢNH GIỚI
        // =================================================

        let realmIndex = realms.findIndex(
            r => r.name === p.canhGioi
        );

        if (realmIndex === -1) {
            realmIndex = 0;
        }

        const currentRealm = realms[realmIndex];

        // =================================================
        // TẦNG HIỆN TẠI
        // =================================================

        const currentTier = Math.max(
            1,
            Number(p.tang || 1)
        );

        // =================================================
        // TU VI HIỆN TẠI
        // =================================================

        const currentCultivation = Math.max(
            0,
            Number(p.kinhNghiem || 0)
        );

        // =================================================
        // CẢNH GIỚI / TẦNG TIẾP THEO
        // =================================================

        let nextRealmIndex = realmIndex;
        let nextTier = currentTier + 1;

        // Tầng 10 → cảnh giới kế tiếp tầng 1
        if (nextTier > 9) {

            if (!realms[realmIndex + 1]) {

                return interaction.reply({
                    content:
                        "🌌 **ĐẠI ĐẠO TỐI CAO!**\n\n" +
                        "Bạn đã đạt **Đại Đạo tầng 9**.\n" +
                        "Đây là cảnh giới cao nhất.",
                    ephemeral: true
                });
            }

            nextRealmIndex = realmIndex + 1;
            nextTier = 1;
        }

        const nextRealm =
            realms[nextRealmIndex];

        // =================================================
        // TÍNH TU VI YÊU CẦU
        // =================================================
        //
        // Cảnh giới hiện tại có maxCultivation.
        //
        // Chia thành 9 tầng.
        //
        // Ví dụ Luyện Khí:
        //
        // max = 10.000
        //
        // Tầng 1 ≈ 1.112
        // Tầng 2 ≈ 2.223
        // ...
        // Tầng 9 = 10.000
        //
        // =================================================

        const cultivationPerTier =
            currentRealm.maxCultivation / 9;

        const requiredCultivation =
            Math.ceil(
                cultivationPerTier * currentTier
            );

        // =================================================
        // CHƯA ĐỦ TU VI
        // =================================================

        if (currentCultivation < requiredCultivation) {

            const missing =
                requiredCultivation -
                currentCultivation;

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xf1c40f)

                        .setTitle(
                            "⚠️ CHƯA ĐỦ TU VI"
                        )

                        .setDescription(
                            `🌱 **${currentRealm.name} tầng ${currentTier}**`
                        )

                        .addFields(

                            {
                                name: "✨ Tu vi hiện tại",
                                value:
                                    currentCultivation
                                        .toLocaleString(),
                                inline: true
                            },

                            {
                                name: "🔓 Tu vi yêu cầu",
                                value:
                                    requiredCultivation
                                        .toLocaleString(),
                                inline: true
                            },

                            {
                                name: "📉 Còn thiếu",
                                value:
                                    missing
                                        .toLocaleString(),
                                inline: true
                            }
                        )
                ],

                ephemeral: true
            });
        }

        // =================================================
        // RANDOM TỶ LỆ 1% → 100%
        // =================================================

        const successRate =
            Math.floor(
                Math.random() * 100
            ) + 1;

        // =================================================
        // RANDOM KẾT QUẢ
        // =================================================

        const roll =
            Math.floor(
                Math.random() * 100
            ) + 1;

        const success =
            roll <= successRate;

        // =================================================
        // THẤT BẠI
        // =================================================

        if (!success) {

            // Mất 10% lượng tu vi yêu cầu
            const lostCultivation =
                Math.max(
                    1,
                    Math.floor(
                        requiredCultivation * 0.10
                    )
                );

            const newCultivation =
                Math.max(
                    0,
                    currentCultivation -
                    lostCultivation
                );

            // Lưu tu vi mới
            updatePlayer(
                interaction.user.id,
                {
                    kinhNghiem:
                        newCultivation
                }
            );

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xe74c3c)

                        .setTitle(
                            "💥 ĐỘT PHÁ THẤT BẠI"
                        )

                        .setDescription(
                            `⚡ Ngươi đã thất bại khi đột phá!\n\n` +
                            `🌱 **${currentRealm.name} tầng ${currentTier}**`
                        )

                        .addFields(

                            {
                                name:
                                    "🎲 Tỷ lệ thành công",

                                value:
                                    `${successRate}%`,

                                inline:
                                    true
                            },

                            {
                                name:
                                    "🎯 Kết quả",

                                value:
                                    `${roll}`,

                                inline:
                                    true
                            },

                            {
                                name:
                                    "💥 Tu vi mất",

                                value:
                                    `-${lostCultivation.toLocaleString()}`,

                                inline:
                                    true
                            },

                            {
                                name:
                                    "✨ Tu vi còn lại",

                                value:
                                    newCultivation
                                        .toLocaleString(),

                                inline:
                                    true
                            }
                        )

                        .setFooter({
                            text:
                                "Đột phá thất bại • Tu vi bị phản phệ"
                        })
                ]
            });
        }

        // =================================================
        // ĐỘT PHÁ THÀNH CÔNG
        // =================================================

        const realmStats =
            stats[nextRealm.name] || {
                hp: 100,
                cong: 20,
                thu: 15
            };

        // =================================================
        // CHỈ SỐ TĂNG
        // =================================================

        const hpIncrease =
            realmStats.hp *
            nextTier;

        const congIncrease =
            realmStats.cong *
            nextTier;

        const thuIncrease =
            realmStats.thu *
            nextTier;

        // =================================================
        // CHỈ SỐ CŨ
        // =================================================

        const oldHp =
            Number(p.hp || 0);

        const oldMaxHp =
            Number(p.maxHp || 0);

        const oldCong =
            Number(p.cong || 0);

        const oldThu =
            Number(p.thu || 0);

        // =================================================
        // CHỈ SỐ MỚI
        // =================================================

        const newHp =
            oldHp +
            hpIncrease;

        const newMaxHp =
            oldMaxHp +
            hpIncrease;

        const newCong =
            oldCong +
            congIncrease;

        const newThu =
            oldThu +
            thuIncrease;

        // =================================================
        // LƯU DATABASE
        // =================================================

        updatePlayer(
            interaction.user.id,
            {

                canhGioi:
                    nextRealm.name,

                tang:
                    nextTier,

                // Thành công không mất tu vi
                kinhNghiem:
                    currentCultivation,

                hp:
                    newHp,

                maxHp:
                    newMaxHp,

                cong:
                    newCong,

                thu:
                    newThu
            }
        );

        // =================================================
        // THÔNG BÁO THÀNH CÔNG
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x2ecc71)

                .setTitle(
                    "🌌 ĐỘT PHÁ THÀNH CÔNG!"
                )

                .setDescription(

                    `⚡ **${currentRealm.name} tầng ${currentTier}**\n` +

                    `⬇️\n` +

                    `✨ **${nextRealm.name} tầng ${nextTier}**`
                )

                .addFields(

                    {
                        name:
                            "🎲 Tỷ lệ thành công",

                        value:
                            `${successRate}%`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🎯 Kết quả",

                        value:
                            `${roll}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "✨ Tu vi",

                        value:
                            currentCultivation
                                .toLocaleString(),

                        inline:
                            true
                    },

                    {
                        name:
                            "❤️ HP",

                        value:
                            `+${hpIncrease.toLocaleString()}\n` +
                            `Tổng: **${newMaxHp.toLocaleString()}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "⚔️ Công",

                        value:
                            `+${congIncrease.toLocaleString()}\n` +
                            `Tổng: **${newCong.toLocaleString()}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🛡️ Thủ",

                        value:
                            `+${thuIncrease.toLocaleString()}\n` +
                            `Tổng: **${newThu.toLocaleString()}**`,

                        inline:
                            true
                    }
                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục • Đột phá cảnh giới"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
