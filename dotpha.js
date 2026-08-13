const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// COOLDOWN ĐỘT PHÁ: 10 GIÂY / LẦN THỬ
// =====================================================
const dotPhaCooldown = new Map();
const DOTPHA_COOLDOWN = 10_000;

// =====================================================
// 18 CẢNH GIỚI
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        max: 9,
        needTuVi: 50,
        stats: { hp: 100, cong: 20, thu: 15 }
    },
    {
        name: "Luyện Khí",
        max: 9,
        needTuVi: 100,
        stats: { hp: 300, cong: 60, thu: 40 }
    },
    {
        name: "Trúc Cơ",
        max: 9,
        needTuVi: 250,
        stats: { hp: 1000, cong: 200, thu: 140 }
    },
    {
        name: "Kim Đan",
        max: 9,
        needTuVi: 500,
        stats: { hp: 3000, cong: 600, thu: 400 }
    },
    {
        name: "Nguyên Anh",
        max: 9,
        needTuVi: 1000,
        stats: { hp: 10000, cong: 2000, thu: 1400 }
    },
    {
        name: "Hóa Thần",
        max: 9,
        needTuVi: 2000,
        stats: { hp: 30000, cong: 6000, thu: 4000 }
    },
    {
        name: "Luyện Hư",
        max: 9,
        needTuVi: 4000,
        stats: { hp: 100000, cong: 20000, thu: 14000 }
    },
    {
        name: "Hợp Thể",
        max: 9,
        needTuVi: 8000,
        stats: { hp: 300000, cong: 60000, thu: 40000 }
    },
    {
        name: "Đại Thừa",
        max: 9,
        needTuVi: 16000,
        stats: { hp: 1000000, cong: 200000, thu: 140000 }
    },
    {
        name: "Độ Kiếp",
        max: 9,
        needTuVi: 32000,
        stats: { hp: 3000000, cong: 600000, thu: 400000 }
    },
    {
        name: "Tiên Nhân",
        max: 9,
        needTuVi: 64000,
        stats: { hp: 10000000, cong: 2000000, thu: 1400000 }
    },
    {
        name: "Chân Tiên",
        max: 9,
        needTuVi: 128000,
        stats: { hp: 30000000, cong: 6000000, thu: 4000000 }
    },
    {
        name: "Thiên Tiên",
        max: 9,
        needTuVi: 256000,
        stats: { hp: 100000000, cong: 20000000, thu: 14000000 }
    },
    {
        name: "Huyền Tiên",
        max: 9,
        needTuVi: 512000,
        stats: { hp: 300000000, cong: 60000000, thu: 40000000 }
    },
    {
        name: "Kim Tiên",
        max: 9,
        needTuVi: 1024000,
        stats: { hp: 1000000000, cong: 200000000, thu: 140000000 }
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

        if (!p) {
            return interaction.reply({
                content: "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA COOLDOWN 10 GIÂY
        // =================================================

        const userId = interaction.user.id;
        const now = Date.now();

        const lastAttempt =
            dotPhaCooldown.get(userId) || 0;

        const remainingCooldown =
            DOTPHA_COOLDOWN - (now - lastAttempt);

        if (remainingCooldown > 0) {

            const seconds =
                Math.ceil(
                    remainingCooldown / 1000
                );

            return interaction.reply({
                content:
                    `⏳ **Thiên kiếp đang hồi phục!**\n` +
                    `Bạn phải chờ **${seconds} giây** nữa mới có thể đột phá tiếp.`,
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

        const currentTier = Math.max(
            1,
            Number(p.tang || 1)
        );

        // =================================================
        // TU VI HIỆN TẠI
        // =================================================

        const currentTuVi =
            Number(p.tuvi || 0);

        // =================================================
        // TU VI YÊU CẦU
        // =================================================

        const requiredTuVi =
            realm.needTuVi * currentTier;

        // =================================================
        // KIỂM TRA ĐỦ TU VI
        // =================================================

        if (currentTuVi < requiredTuVi) {

            const missing =
                requiredTuVi - currentTuVi;

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xf1c40f)

                        .setTitle("⚠️ CHƯA ĐỦ TU VI")

                        .setDescription(
                            `🌱 **${realm.name} tầng ${currentTier}**`
                        )

                        .addFields(
                            {
                                name: "⚔️ Tu Vi hiện tại",
                                value:
                                    currentTuVi.toLocaleString(),
                                inline: true
                            },
                            {
                                name: "🔓 Tu Vi yêu cầu",
                                value:
                                    requiredTuVi.toLocaleString(),
                                inline: true
                            },
                            {
                                name: "📉 Còn thiếu",
                                value:
                                    missing.toLocaleString(),
                                inline: true
                            }
                        )

                        .setFooter({
                            text:
                                "Cần đủ Tu Vi mới có thể đột phá"
                        })
                ],

                ephemeral: true
            });
        }

        // =================================================
        // BẮT ĐẦU LƯỢT ĐỘT PHÁ
        // KHÓA 10 GIÂY
        // =================================================

        dotPhaCooldown.set(
            userId,
            Date.now()
        );

        // =================================================
        // RANDOM TỶ LỆ
        // =================================================

        const successRate =
            Math.floor(
                Math.random() * 100
            ) + 1;

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

            // Mất ngẫu nhiên từ 1 → 10.000 Tu Vi
            const lostTuVi =
                Math.min(
                    currentTuVi,
                    Math.floor(
                        Math.random() * 10000
                    ) + 1
                );

            const newTuVi =
                Math.max(
                    0,
                    currentTuVi - lostTuVi
                );

            updatePlayer(
                interaction.user.id,
                {
                    tuvi: newTuVi
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
                                inline: true
                            },
                            {
                                name:
                                    "🎯 Kết quả",
                                value:
                                    `${roll}`,
                                inline: true
                            },
                            {
                                name:
                                    "💥 Tu Vi mất",
                                value:
                                    `-${lostTuVi.toLocaleString()}`,
                                inline: true
                            },
                            {
                                name:
                                    "⚔️ Tu Vi còn lại",
                                value:
                                    `${newTuVi.toLocaleString()}`,
                                inline: true
                            }
                        )

                        .setFooter({
                            text:
                                "Kinh nghiệm không bị ảnh hưởng • Có thể đột phá lại sau 10 giây"
                        })
                ]
            });
        }

        // =================================================
        // CẢNH GIỚI / TẦNG MỚI
        // =================================================

        let newRealmIndex = index;

        let newTier =
            currentTier + 1;

        // =================================================
        // TẦNG 9 → CẢNH GIỚI TIẾP THEO
        // =================================================

        if (newTier > realm.max) {

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

            newTier = 1;
        }

        const newRealm =
            realms[newRealmIndex];

        // =================================================
        // TĂNG CHỈ SỐ
        // HỆ SỐ x9
        // =================================================

        const BREAKTHROUGH_MULTIPLIER = 9;

        const tierMultiplier =
            newTier;

        // =================================================
        // HP
        // =================================================

        const hpIncrease =
            Math.floor(
                newRealm.stats.hp *
                tierMultiplier *
                BREAKTHROUGH_MULTIPLIER
            );

        // =================================================
        // CÔNG
        // =================================================

        const congIncrease =
            Math.floor(
                newRealm.stats.cong *
                tierMultiplier *
                BREAKTHROUGH_MULTIPLIER
            );

        // =================================================
        // THỦ
        // =================================================

        const thuIncrease =
            Math.floor(
                newRealm.stats.thu *
                tierMultiplier *
                BREAKTHROUGH_MULTIPLIER
            );

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
            oldMaxHp + hpIncrease;

        const newHp =
            oldHp + hpIncrease;

        const newCong =
            oldCong + congIncrease;

        const newThu =
            oldThu + thuIncrease;

        // =================================================
        // TU VI GIỮ NGUYÊN
        // =================================================

        const remainingTuVi =
            currentTuVi;

        // =================================================
        // KINH NGHIỆM GIỮ NGUYÊN
        // =================================================

        const remainingKinhNghiem =
            Number(
                p.kinhNghiem || 0
            );

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

                tuvi:
                    remainingTuVi,

                kinhNghiem:
                    remainingKinhNghiem,

                maxHp:
                    newMaxHp,

                hp:
                    newHp,

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
                        inline: true
                    },

                    {
                        name:
                            "🎯 Kết quả",
                        value:
                            `${roll}`,
                        inline: true
                    },

                    {
                        name:
                            "⚔️ Tu Vi",
                        value:
                            `${remainingTuVi.toLocaleString()}`,
                        inline: true
                    },

                    {
                        name:
                            "🌱 Cảnh giới",
                        value:
                            `**${newRealm.name} tầng ${newTier}**`,
                        inline: true
                    },

                    {
                        name:
                            "❤️ HP",
                        value:
                            `+${hpIncrease.toLocaleString()}\n` +
                            `Tổng: **${newMaxHp.toLocaleString()}**`,
                        inline: true
                    },

                    {
                        name:
                            "⚔️ Công",
                        value:
                            `+${congIncrease.toLocaleString()}\n` +
                            `Tổng: **${newCong.toLocaleString()}**`,
                        inline: true
                    },

                    {
                        name:
                            "🛡️ Thủ",
                        value:
                            `+${thuIncrease.toLocaleString()}\n` +
                            `Tổng: **${newThu.toLocaleString()}**`,
                        inline: true
                    }
                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục • Đột phá bằng Tu Vi • Chỉ số x9 • Có thể đột phá lại sau 10 giây"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
