const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// 18 CẢNH GIỚI HỒNG HOANG
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        max: 9,
        needTuVi: 50,
        stats: {
            hp: 100,
            cong: 20,
            thu: 15
        }
    },
    {
        name: "Luyện Khí",
        max: 9,
        needTuVi: 100,
        stats: {
            hp: 300,
            cong: 60,
            thu: 40
        }
    },
    {
        name: "Trúc Cơ",
        max: 9,
        needTuVi: 250,
        stats: {
            hp: 1000,
            cong: 200,
            thu: 140
        }
    },
    {
        name: "Kim Đan",
        max: 9,
        needTuVi: 500,
        stats: {
            hp: 3000,
            cong: 600,
            thu: 400
        }
    },
    {
        name: "Nguyên Anh",
        max: 9,
        needTuVi: 1000,
        stats: {
            hp: 10000,
            cong: 2000,
            thu: 1400
        }
    },
    {
        name: "Hóa Thần",
        max: 9,
        needTuVi: 2000,
        stats: {
            hp: 30000,
            cong: 6000,
            thu: 4000
        }
    },
    {
        name: "Luyện Hư",
        max: 9,
        needTuVi: 4000,
        stats: {
            hp: 100000,
            cong: 20000,
            thu: 14000
        }
    },
    {
        name: "Hợp Thể",
        max: 9,
        needTuVi: 8000,
        stats: {
            hp: 300000,
            cong: 60000,
            thu: 40000
        }
    },
    {
        name: "Đại Thừa",
        max: 9,
        needTuVi: 16000,
        stats: {
            hp: 1000000,
            cong: 200000,
            thu: 140000
        }
    },
    {
        name: "Độ Kiếp",
        max: 9,
        needTuVi: 32000,
        stats: {
            hp: 3000000,
            cong: 600000,
            thu: 400000
        }
    },
    {
        name: "Tiên Nhân",
        max: 9,
        needTuVi: 64000,
        stats: {
            hp: 10000000,
            cong: 2000000,
            thu: 1400000
        }
    },
    {
        name: "Chân Tiên",
        max: 9,
        needTuVi: 128000,
        stats: {
            hp: 30000000,
            cong: 6000000,
            thu: 4000000
        }
    },
    {
        name: "Thiên Tiên",
        max: 9,
        needTuVi: 256000,
        stats: {
            hp: 100000000,
            cong: 20000000,
            thu: 14000000
        }
    },
    {
        name: "Huyền Tiên",
        max: 9,
        needTuVi: 512000,
        stats: {
            hp: 300000000,
            cong: 60000000,
            thu: 40000000
        }
    },
    {
        name: "Kim Tiên",
        max: 9,
        needTuVi: 1024000,
        stats: {
            hp: 1000000000,
            cong: 200000000,
            thu: 140000000
        }
    },
    {
        name: "Thánh Nhân",
        max: 9,
        needTuVi: 2048000,
        stats: {
            hp: 5000000000,
            cong: 1000000000,
            thu: 700000000
        }
    },
    {
        name: "Thiên Đạo",
        max: 9,
        needTuVi: 4096000,
        stats: {
            hp: 20000000000,
            cong: 4000000000,
            thu: 2800000000
        }
    },
    {
        name: "Đại Đạo",
        max: 9,
        needTuVi: 8192000,
        stats: {
            hp: 100000000000,
            cong: 20000000000,
            thu: 14000000000
        }
    }
];

// =====================================================
// /DOTPHA
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("dotpha")
        .setDescription("⚡ Đột phá cảnh giới bằng Tu Vi"),

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

        let index = realms.findIndex(
            r => r.name === p.canhGioi
        );

        if (index === -1) {
            index = 0;
        }

        const realm = realms[index];

        // =================================================
        // TẦNG HIỆN TẠI
        // =================================================

        const currentTier =
            Math.max(
                1,
                Number(p.tang || 1)
            );

        // =================================================
        // TU VI HIỆN TẠI
        // QUAN TRỌNG: DÙNG p.tuvi
        // KHÔNG DÙNG p.kinhNghiem
        // =================================================

        const currentTuVi =
            Number(p.tuvi || 0);

        // =================================================
        // TU VI YÊU CẦU
        // =================================================

        /*
         * Mỗi tầng yêu cầu Tu Vi tăng theo tầng.
         *
         * Tầng 1 = needTuVi
         * Tầng 2 = needTuVi x 2
         * ...
         * Tầng 9 = needTuVi x 9
         */

        const requiredTuVi =
            realm.needTuVi *
            currentTier;

        // =================================================
        // KIỂM TRA ĐỦ TU VI
        // =================================================

        if (currentTuVi < requiredTuVi) {

            const missing =
                requiredTuVi -
                currentTuVi;

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xf1c40f)

                        .setTitle(
                            "⚠️ CHƯA ĐỦ TU VI"
                        )

                        .setDescription(
                            `🌱 **${realm.name} tầng ${currentTier}**`
                        )

                        .addFields(

                            {
                                name:
                                    "✨ Tu Vi hiện tại",

                                value:
                                    currentTuVi
                                        .toLocaleString(),

                                inline:
                                    true
                            },

                            {
                                name:
                                    "🔓 Tu Vi yêu cầu",

                                value:
                                    requiredTuVi
                                        .toLocaleString(),

                                inline:
                                    true
                            },

                            {
                                name:
                                    "📉 Còn thiếu",

                                value:
                                    missing
                                        .toLocaleString(),

                                inline:
                                    true
                            }
                        )

                        .setFooter({
                            text:
                                "Cần đủ Tu Vi mới có thể đột phá"
                        })
                ],

                ephemeral:
                    true
            });
        }

        // =================================================
        // RANDOM TỶ LỆ 1 - 100%
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
        // ĐỘT PHÁ THẤT BẠI
        // =================================================

        if (!success) {

            // Mất 15% Tu Vi yêu cầu
            const lostTuVi =
                Math.max(
                    1,
                    Math.floor(
                        requiredTuVi * 0.15
                    )
                );

            const newTuVi =
                Math.max(
                    0,
                    currentTuVi - lostTuVi
                );

            // Chỉ trừ TU VI
            // Không đụng tới KINH NGHIỆM
            updatePlayer(
                interaction.user.id,
                {
                    tuvi:
                        newTuVi
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
                            `🌱 **${realm.name} tầng ${currentTier}**\n\n` +
                            `Thiên kiếp phản phệ, Tu Vi bị tổn hao!`
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
                                    "💥 Tu Vi mất",

                                value:
                                    `-${lostTuVi.toLocaleString()}`,

                                inline:
                                    true
                            },

                            {
                                name:
                                    "⚔️ Tu Vi còn lại",

                                value:
                                    `${newTuVi.toLocaleString()}`,

                                inline:
                                    true
                            }
                        )

                        .setFooter({
                            text:
                                "Kinh nghiệm không bị ảnh hưởng"
                        })
                ]
            });
        }

        // =================================================
        // XÁC ĐỊNH CẢNH GIỚI / TẦNG MỚI
        // =================================================

        let newRealmIndex =
            index;

        let newTier =
            currentTier + 1;

        // =================================================
        // TẦNG 9 → CẢNH GIỚI TIẾP THEO
        // =================================================

        if (newTier > realm.max) {

            // ĐẠI ĐẠO TẦNG 9
            if (!realms[index + 1]) {

                return interaction.reply({
                    content:
                        "🌌 **ĐẠI ĐẠO TỐI CAO!**\n\n" +
                        "Bạn đã đạt **Đại Đạo tầng 9**.\n" +
                        "Không còn cảnh giới nào cao hơn."
                });
            }

            newRealmIndex =
                index + 1;

            newTier =
                1;
        }

        const newRealm =
            realms[newRealmIndex];

        // =================================================
        // TÍNH CHỈ SỐ TĂNG
        // =================================================

        const tierMultiplier =
            newTier;

        const hpIncrease =
            newRealm.stats.hp *
            tierMultiplier;

        const congIncrease =
            newRealm.stats.cong *
            tierMultiplier;

        const thuIncrease =
            newRealm.stats.thu *
            tierMultiplier;

        // =================================================
        // CHỈ SỐ CŨ
        // =================================================

        const oldMaxHp =
            Number(p.maxHp || 0);

        const oldHp =
            Number(p.hp || 0);

        const oldCong =
            Number(p.cong || 0);

        const oldThu =
            Number(p.thu || 0);

        // =================================================
        // CHỈ SỐ MỚI
        // =================================================

        const newMaxHp =
            oldMaxHp +
            hpIncrease;

        const newHp =
            oldHp +
            hpIncrease;

        const newCong =
            oldCong +
            congIncrease;

        const newThu =
            oldThu +
            thuIncrease;

        // =================================================
        // TU VI SAU KHI THÀNH CÔNG
        // =================================================

        /*
         * Thành công KHÔNG trừ Tu Vi.
         *
         * Tu Vi vẫn giữ nguyên.
         */

        const remainingTuVi =
            currentTuVi;

        // =================================================
        // LƯU DATABASE
        // =================================================

        updatePlayer(
            interaction.user.id,
            {

                canhGioi:
                    newRealm.name,

                tang:
                    newTier,

                // ⚔️ TU VI
                // GIỮ NGUYÊN
                tuvi:
                    remainingTuVi,

                // ✨ KINH NGHIỆM
                // GIỮ NGUYÊN
                kinhNghiem:
                    Number(p.kinhNghiem || 0),

                // ❤️ HP
                maxHp:
                    newMaxHp,

                hp:
                    newHp,

                // ⚔️ CÔNG
                cong:
                    newCong,

                // 🛡️ THỦ
                thu:
                    newThu
            }
        );

        // =================================================
        // EMBED THÀNH CÔNG
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x2ecc71)

                .setTitle(
                    "⚡ ĐỘT PHÁ THÀNH CÔNG!"
                )

                .setDescription(

                    `🌌 **${realm.name} tầng ${currentTier}**\n` +

                    `⬇️\n` +

                    `✨ **${newRealm.name} tầng ${newTier}**`
                )

                .addFields(

                    {
                        name:
                            "📈 Tỷ lệ thành công",

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
                            "⚔️ Tu Vi",

                        value:
                            `${remainingTuVi.toLocaleString()}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🌱 Cảnh giới",

                        value:
                            `**${newRealm.name} tầng ${newTier}**`,

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
                        "Hồng Hoang Đại Lục • Đột phá bằng Tu Vi"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
