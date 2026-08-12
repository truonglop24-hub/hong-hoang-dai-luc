const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// 18 CẢNH GIỚI HỒNG HOANG
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        max: 9,
        needExp: 50,
        stats: {
            hp: 100,
            cong: 20,
            thu: 15
        }
    },
    {
        name: "Luyện Khí",
        max: 9,
        needExp: 100,
        stats: {
            hp: 300,
            cong: 60,
            thu: 40
        }
    },
    {
        name: "Trúc Cơ",
        max: 9,
        needExp: 250,
        stats: {
            hp: 1000,
            cong: 200,
            thu: 140
        }
    },
    {
        name: "Kim Đan",
        max: 9,
        needExp: 500,
        stats: {
            hp: 3000,
            cong: 600,
            thu: 400
        }
    },
    {
        name: "Nguyên Anh",
        max: 9,
        needExp: 1000,
        stats: {
            hp: 10000,
            cong: 2000,
            thu: 1400
        }
    },
    {
        name: "Hóa Thần",
        max: 9,
        needExp: 2000,
        stats: {
            hp: 30000,
            cong: 6000,
            thu: 4000
        }
    },
    {
        name: "Luyện Hư",
        max: 9,
        needExp: 4000,
        stats: {
            hp: 100000,
            cong: 20000,
            thu: 14000
        }
    },
    {
        name: "Hợp Thể",
        max: 9,
        needExp: 8000,
        stats: {
            hp: 300000,
            cong: 60000,
            thu: 40000
        }
    },
    {
        name: "Đại Thừa",
        max: 9,
        needExp: 16000,
        stats: {
            hp: 1000000,
            cong: 200000,
            thu: 140000
        }
    },
    {
        name: "Độ Kiếp",
        max: 9,
        needExp: 32000,
        stats: {
            hp: 3000000,
            cong: 600000,
            thu: 400000
        }
    },
    {
        name: "Tiên Nhân",
        max: 9,
        needExp: 64000,
        stats: {
            hp: 10000000,
            cong: 2000000,
            thu: 1400000
        }
    },
    {
        name: "Chân Tiên",
        max: 9,
        needExp: 128000,
        stats: {
            hp: 30000000,
            cong: 6000000,
            thu: 4000000
        }
    },
    {
        name: "Thiên Tiên",
        max: 9,
        needExp: 256000,
        stats: {
            hp: 100000000,
            cong: 20000000,
            thu: 14000000
        }
    },
    {
        name: "Huyền Tiên",
        max: 9,
        needExp: 512000,
        stats: {
            hp: 300000000,
            cong: 60000000,
            thu: 40000000
        }
    },
    {
        name: "Kim Tiên",
        max: 9,
        needExp: 1024000,
        stats: {
            hp: 1000000000,
            cong: 200000000,
            thu: 140000000
        }
    },
    {
        name: "Thánh Nhân",
        max: 9,
        needExp: 2048000,
        stats: {
            hp: 5000000000,
            cong: 1000000000,
            thu: 700000000
        }
    },
    {
        name: "Thiên Đạo",
        max: 9,
        needExp: 4096000,
        stats: {
            hp: 20000000000,
            cong: 4000000000,
            thu: 2800000000
        }
    },
    {
        name: "Đại Đạo",
        max: 9,
        needExp: 8192000,
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
        // TÌM CẢNH GIỚI HIỆN TẠI
        // =================================================

        let index = realms.findIndex(
            r => r.name === p.canhGioi
        );

        // Hỗ trợ dữ liệu cũ
        if (index === -1) {
            index = 1;
        }

        const realm = realms[index];

        const currentTier =
            Math.max(1, Number(p.tang || 1));

        const currentExp =
            Number(p.kinhNghiem || 0);

        // =================================================
        // KIỂM TRA EXP
        // =================================================

        if (currentExp < realm.needExp) {

            return interaction.reply({
                content:
                    `❌ **Chưa đủ kinh nghiệm để đột phá!**\n\n` +
                    `🌱 Cảnh giới: **${realm.name} tầng ${currentTier}**\n` +
                    `✨ Cần: **${realm.needExp.toLocaleString()} EXP**\n` +
                    `📖 Hiện có: **${currentExp.toLocaleString()} EXP**`,
                ephemeral: true
            });
        }

        // =================================================
        // TỶ LỆ THÀNH CÔNG
        // =================================================

        const successRate = Math.min(
            95,
            55 + currentTier * 4
        );

        const success =
            Math.random() * 100 < successRate;

        // =================================================
        // ĐỘT PHÁ THẤT BẠI
        // =================================================

        if (!success) {

            const lostExp =
                Math.floor(realm.needExp * 0.15);

            updatePlayer(
                interaction.user.id,
                {
                    kinhNghiem:
                        Math.max(
                            0,
                            currentExp - lostExp
                        )
                }
            );

            return interaction.reply({
                content:
                    `⚡ **ĐỘT PHÁ THẤT BẠI!**\n\n` +
                    `🌱 Cảnh giới: **${realm.name} tầng ${currentTier}**\n` +
                    `📈 Tỷ lệ thành công: **${successRate}%**\n` +
                    `💥 Mất: **${lostExp.toLocaleString()} EXP**`
            });
        }

        // =================================================
        // XÁC ĐỊNH CẢNH GIỚI / TẦNG MỚI
        // =================================================

        let newRealmIndex = index;
        let newTier = currentTier + 1;

        // Tầng 9 → cảnh giới tiếp theo
        if (newTier > realm.max) {

            // Đã đạt Đại Đạo tầng 9
            if (!realms[index + 1]) {

                return interaction.reply({
                    content:
                        "🌌 **ĐẠI ĐẠO TỐI CAO!**\n\n" +
                        "Bạn đã đạt **Đại Đạo tầng 9**.\n" +
                        "Không còn cảnh giới nào cao hơn."
                });
            }

            newRealmIndex = index + 1;
            newTier = 1;
        }

        const newRealm =
            realms[newRealmIndex];

        // =================================================
        // TÍNH CHỈ SỐ TĂNG
        // =================================================

        /*
         * Cảnh giới càng cao:
         * HP / Công / Thủ càng lớn.
         *
         * Tầng càng cao:
         * lượng chỉ số nhận được càng lớn.
         */

        const tierMultiplier = newTier;

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
            oldMaxHp + hpIncrease;

        const newHp =
            oldHp + hpIncrease;

        const newCong =
            oldCong + congIncrease;

        const newThu =
            oldThu + thuIncrease;

        // =================================================
        // EXP CÒN LẠI
        // =================================================

        const remainingExp =
            Math.max(
                0,
                currentExp - realm.needExp
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

                kinhNghiem:
                    remainingExp,

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
        // EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x8e44ad)

                .setTitle(
                    "⚡ ĐỘT PHÁ THÀNH CÔNG"
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
                            "🌱 Cảnh giới",

                        value:
                            `**${newRealm.name} tầng ${newTier}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "✨ EXP còn lại",

                        value:
                            `${remainingExp.toLocaleString()}`,

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
                        "Hồng Hoang Đại Lục • Con đường chứng đạo"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
