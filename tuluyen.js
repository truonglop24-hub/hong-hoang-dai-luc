const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// ⏳ COOLDOWN TU LUYỆN
// =====================================================

const COOLDOWN = 15 * 1000;

// =====================================================
// ⚡ TỐC ĐỘ TU LUYỆN THEO CẢNH GIỚI
// =====================================================
//
// Tốc độ gốc của từng cảnh giới ×4
//
// Ví dụ:
// Phàm Nhân 1 ×4 = 4
// Luyện Khí 5 ×4 = 20
// Trúc Cơ 15 ×4 = 60
// Kim Đan 40 ×4 = 160
//
// =====================================================

const CULTIVATION_SPEED = {

    "Phàm Nhân": 1 * 4,

    "Luyện Khí": 5 * 4,

    "Trúc Cơ": 15 * 4,

    "Kim Đan": 40 * 4,

    "Nguyên Anh": 100 * 4,

    "Hóa Thần": 250 * 4,

    "Luyện Hư": 600 * 4,

    "Hợp Thể": 1500 * 4,

    "Đại Thừa": 3500 * 4,

    "Độ Kiếp": 8000 * 4,

    "Tiên Nhân": 20000 * 4,

    "Chân Tiên": 50000 * 4,

    "Thiên Tiên": 120000 * 4,

    "Huyền Tiên": 300000 * 4,

    "Kim Tiên": 750000 * 4,

    "Thánh Nhân": 2000000 * 4,

    "Thiên Đạo": 10000000 * 4,

    "Đại Đạo": 50000000 * 4

};

// =====================================================
// ⚡ LẤY TỐC ĐỘ TU LUYỆN
// =====================================================

function getCultivationSpeed(canhGioi) {

    return Math.max(
        1,
        Math.floor(
            CULTIVATION_SPEED[canhGioi] || 1
        )
    );
}

// =====================================================
// 📊 GIAI ĐOẠN 12 TẦNG
// =====================================================

function getStage(tang) {

    tang =
        Number(tang) || 1;

    if (tang <= 3) {
        return "Sơ kỳ";
    }

    if (tang <= 6) {
        return "Trung kỳ";
    }

    if (tang <= 9) {
        return "Hậu kỳ";
    }

    if (tang <= 11) {
        return "Viên mãn";
    }

    return "Đỉnh phong";
}

// =====================================================
// 📦 MODULE
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("tuluyen")

            .setDescription(
                "🧘 Tu luyện để nhận linh lực, tu vi và kinh nghiệm"
            ),

    // =================================================
    // ⚡ EXECUTE
    // =================================================

    async execute(interaction) {

        const p =
            getPlayer(
                interaction.user.id
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
        // 🧘 ĐANG BẾ QUAN
        // =================================================

        if (p.beQuan) {

            return interaction.reply({

                content:
                    "🧘 Bạn đang bế quan. Hãy dùng `/xuatquan` khi hoàn thành.",

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
                (p.lastTrain || 0)
            );

        if (remaining > 0) {

            return interaction.reply({

                content:
                    `⏳ Bạn cần chờ **${Math.ceil(
                        remaining / 1000
                    )} giây** nữa.`,

                ephemeral:
                    true
            });
        }

        // =================================================
        // 🌌 CẢNH GIỚI
        // =================================================

        const canhGioi =
            p.canhGioi ||
            "Phàm Nhân";

        // =================================================
        // 🔢 TẦNG
        // =================================================

        const tang =
            Math.max(
                1,
                Math.min(
                    12,
                    Number(p.tang) || 1
                )
            );

        // =================================================
        // 📜 GIAI ĐOẠN
        // =================================================

        const stage =
            getStage(tang);

        // =================================================
        // ⚡ TỐC ĐỘ
        // =================================================

        const speed =
            getCultivationSpeed(
                canhGioi
            );

        // =================================================
        // 🧬 BUFF LINH CĂN
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

        // =================================================
        // ✨ HỆ SỐ BUFF
        // =================================================

        const buffMultiplier =
            1 +
            (
                linhCanBuff /
                100
            );

        // =================================================
        // 🔥 LINH LỰC
        // =================================================

        const baseLinhLuc =
            Math.floor(
                Math.random() * 31
            ) + 20;

        const linhLuc =
            Math.max(
                1,
                Math.floor(
                    baseLinhLuc *
                    speed *
                    buffMultiplier
                )
            );

        // =================================================
        // ⚔️ TU VI
        // =================================================

        const baseTuVi =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const tuvi =
            Math.max(
                1,
                Math.floor(
                    baseTuVi *
                    speed *
                    buffMultiplier
                )
            );

        // =================================================
        // ✨ KINH NGHIỆM
        // =================================================

        const baseExp =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const exp =
            Math.max(
                1,
                Math.floor(
                    baseExp *
                    speed *
                    buffMultiplier
                )
            );

        // =================================================
        // 📈 TU VI HIỆN TẠI
        // =================================================

        const tuViHienTai =
            (
                Number(p.tuvi) ||
                0
            ) +
            tuvi;

        // =================================================
        // 🔥 LINH LỰC HIỆN TẠI
        // =================================================

        const linhLucHienTai =
            (
                Number(p.linhLuc) ||
                0
            ) +
            linhLuc;

        // =================================================
        // ✨ KINH NGHIỆM HIỆN TẠI
        // =================================================

        const kinhNghiemHienTai =
            (
                Number(p.kinhNghiem) ||
                0
            ) +
            exp;

        // =================================================
        // 💾 CẬP NHẬT DATABASE
        // =================================================

        updatePlayer(

            interaction.user.id,

            {

                linhLuc:
                    linhLucHienTai,

                // ⚔️ LƯU TU VI
                tuvi:
                    tuViHienTai,

                // ✨ LƯU KINH NGHIỆM
                kinhNghiem:
                    kinhNghiemHienTai,

                // ⏳ LƯU COOLDOWN
                lastTrain:
                    Date.now()

            }
        );

        // =================================================
        // 🔢 FORMAT
        // =================================================

        const format =
            value =>
                Number(
                    value || 0
                ).toLocaleString();

        // =================================================
        // 📜 EMBED
        // =================================================

        const embed =

            new EmbedBuilder()

                .setColor(
                    0x8e44ad
                )

                .setTitle(
                    "⚔️ TU LUYỆN THÀNH CÔNG"
                )

                .setDescription(

                    `**${interaction.user.username}** ` +
                    `vận chuyển linh khí trong kinh mạch.\n\n` +

                    `🌌 **Cảnh giới:** ` +
                    `**${canhGioi} ${stage} tầng ${tang}**\n` +

                    `⚡ **Tốc độ tu luyện:** ` +
                    `**×${format(speed)}**`

                )

                .addFields(

                    // =================================================
                    // LINH LỰC
                    // =================================================

                    {

                        name:
                            "🔥 Linh lực",

                        value:
                            `+**${format(
                                linhLuc
                            )}**`,

                        inline:
                            true
                    },

                    // =================================================
                    // TU VI
                    // =================================================

                    {

                        name:
                            "⚔️ Tu Vi",

                        value:
                            `+**${format(
                                tuvi
                            )}**`,

                        inline:
                            true
                    },

                    // =================================================
                    // KINH NGHIỆM
                    // =================================================

                    {

                        name:
                            "✨ Kinh nghiệm",

                        value:
                            `+**${format(
                                exp
                            )}**`,

                        inline:
                            true
                    },

                    // =================================================
                    // TU VI HIỆN TẠI
                    // =================================================

                    {

                        name:
                            "📈 Tu Vi hiện tại",

                        value:
                            `**${format(
                                tuViHienTai
                            )}**`,

                        inline:
                            true
                    },

                    // =================================================
                    // LINH CĂN
                    // =================================================

                    {

                        name:
                            "🧬 Linh căn",

                        value:
                            `+${linhCanBuff}% tốc độ`,

                        inline:
                            true
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

            embeds:
                [embed]

        });

    }

};

// =====================================================
// 📦 EXPORT
// =====================================================

module.exports.getCultivationSpeed =
    getCultivationSpeed;

module.exports.getStage =
    getStage;

module.exports.CULTIVATION_SPEED =
    CULTIVATION_SPEED;
