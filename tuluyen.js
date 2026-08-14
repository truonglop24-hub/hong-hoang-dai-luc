const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 15 * 1000;

// =====================================================
// ⚡ TỐC ĐỘ TU LUYỆN THEO CẢNH GIỚI
// Giữ tốc độ cũ → giảm 2 lần
// =====================================================

const CULTIVATION_SPEED = {
    "Phàm Nhân": 1,
    "Luyện Khí": 5,
    "Trúc Cơ": 15,
    "Kim Đan": 40,
    "Nguyên Anh": 100,
    "Hóa Thần": 250,
    "Luyện Hư": 600,
    "Hợp Thể": 1500,
    "Đại Thừa": 3500,
    "Độ Kiếp": 8000,
    "Tiên Nhân": 20000,
    "Chân Tiên": 50000,
    "Thiên Tiên": 120000,
    "Huyền Tiên": 300000,
    "Kim Tiên": 750000,
    "Thánh Nhân": 2000000,
    "Thiên Đạo": 10000000,
    "Đại Đạo": 50000000
};

// =====================================================
// ⚡ LẤY TỐC ĐỘ SAU KHI GIẢM 2 LẦN
// =====================================================

function getCultivationSpeed(canhGioi) {
    const oldSpeed =
        CULTIVATION_SPEED[canhGioi] || 1;

    return Math.max(
        1,
        Math.floor(oldSpeed / 2)
    );
}

// =====================================================
// 📦 MODULE
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tuluyen")
        .setDescription(
            "🧘 Tu luyện để nhận linh lực, tu vi và kinh nghiệm"
        ),

    async execute(interaction) {

        const p =
            getPlayer(interaction.user.id);

        // =================================================
        // ❌ CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // 🧘 ĐANG BẾ QUAN
        // =================================================

        if (p.beQuan) {
            return interaction.reply({
                content:
                    "🧘 Bạn đang bế quan. Hãy dùng `/xuatquan` khi hoàn thành.",
                ephemeral: true
            });
        }

        // =================================================
        // ⏳ COOLDOWN
        // =================================================

        const remaining =
            COOLDOWN -
            (Date.now() - (p.lastTrain || 0));

        if (remaining > 0) {
            return interaction.reply({
                content:
                    `⏳ Bạn cần chờ **${Math.ceil(
                        remaining / 1000
                    )} giây** nữa.`,
                ephemeral: true
            });
        }

        // =================================================
        // 🌌 CẢNH GIỚI
        // =================================================

        const canhGioi =
            p.canhGioi || "Phàm Nhân";

        const tang =
            Number(p.tang) || 1;

        // =================================================
        // ⚡ TỐC ĐỘ
        // =================================================

        const speed =
            getCultivationSpeed(canhGioi);

        // =================================================
        // 🧬 LINH CĂN
        // =================================================

        let linhCanBuff = 0;

        if (
            p.linhCan &&
            typeof p.linhCan === "object" &&
            p.linhCan.buff
        ) {
            linhCanBuff =
                Number(
                    p.linhCan.buff.tuLuyen
                ) || 0;
        }

        const buffMultiplier =
            1 + (linhCanBuff / 100);

        // =================================================
        // 🔥 TÍNH LINH LỰC
        // =================================================

        const baseLinhLuc =
            Math.floor(
                Math.random() * 31
            ) + 20;

        const linhLuc =
            Math.floor(
                baseLinhLuc *
                speed *
                buffMultiplier
            );

        // =================================================
        // ⚔️ TÍNH TU VI
        // =================================================

        const baseTuVi =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const tuvi =
            Math.floor(
                baseTuVi *
                speed *
                buffMultiplier
            );

        // =================================================
        // ✨ TÍNH KINH NGHIỆM
        // =================================================

        const baseExp =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const exp =
            Math.floor(
                baseExp *
                speed *
                buffMultiplier
            );

        // =================================================
        // 📈 TU VI HIỆN TẠI
        // =================================================

        const tuViHienTai =
            (Number(p.tuvi) || 0) +
            tuvi;

        // =================================================
        // 💾 CẬP NHẬT DATABASE
        // =================================================

        updatePlayer(
            interaction.user.id,
            {
                linhLuc:
                    (Number(p.linhLuc) || 0) +
                    linhLuc,

                // ⚔️ QUAN TRỌNG:
                // Lưu Tu Vi vào trường "tuvi"
                tuvi:
                    tuViHienTai,

                kinhNghiem:
                    (Number(p.kinhNghiem) || 0) +
                    exp,

                lastTrain:
                    Date.now()
            }
        );

        // =================================================
        // 🔢 FORMAT SỐ
        // =================================================

        const format =
            value =>
                Number(value || 0)
                    .toLocaleString();

        // =================================================
        // 📜 EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x8e44ad)

                .setTitle(
                    "⚔️ TU LUYỆN THÀNH CÔNG"
                )

                .setDescription(
                    `**${interaction.user.username}** ` +
                    `vận chuyển linh khí trong kinh mạch.\n\n` +

                    `🌌 **Cảnh giới:** ` +
                    `**${canhGioi} tầng ${tang}**\n` +

                    `⚡ **Tốc độ tu luyện:** ` +
                    `**×${format(speed)}**`
                )

                .addFields(

                    {
                        name: "🔥 Linh lực",
                        value:
                            `+**${format(linhLuc)}**`,
                        inline: true
                    },

                    {
                        name: "⚔️ Tu Vi",
                        value:
                            `+**${format(tuvi)}**`,
                        inline: true
                    },

                    {
                        name: "✨ Kinh nghiệm",
                        value:
                            `+**${format(exp)}**`,
                        inline: true
                    },

                    {
                        name: "📈 Tu Vi hiện tại",
                        value:
                            `**${format(
                                tuViHienTai
                            )}**`,
                        inline: true
                    },

                    {
                        name: "🧬 Linh căn",
                        value:
                            `+${linhCanBuff}% tốc độ`,
                        inline: true
                    }

                )

                .setFooter({
                    text:
                        "⏳ Cooldown: 15 giây • Hồng Hoang Đại Lục"
                });

        // =================================================
        // 📤 TRẢ KẾT QUẢ
        // =================================================

        return interaction.reply({
            embeds: [embed]
        });
    }
};
