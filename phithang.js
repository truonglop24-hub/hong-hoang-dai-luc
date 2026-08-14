const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// 🌌 LỆNH /PHITHANG
// =====================================================

const data = new SlashCommandBuilder()
    .setName("phithang")
    .setDescription("☁️ Phi thăng từ Hạ Giới lên Tiên Giới");

// =====================================================
// ⚡ EXECUTE
// =====================================================

async function execute(interaction) {

    try {

        const userId =
            interaction.user.id;

        const player =
            getPlayer(userId);

        // =================================================
        // ❌ CHƯA ĐĂNG KÝ
        // =================================================

        if (!player) {

            return interaction.reply({
                content:
                    "❌ Bạn chưa đăng ký tu tiên!\n" +
                    "Hãy sử dụng lệnh đăng ký trước.",
                ephemeral: true
            });

        }

        // =================================================
        // 🌌 KIỂM TRA ĐÃ PHI THĂNG
        // =================================================

        if (
            player.tienGioi === true
        ) {

            return interaction.reply({
                content:
                    "☁️ **Bạn đã phi thăng Tiên Giới rồi!**",
                ephemeral: true
            });

        }

        // =================================================
        // ⚡ KIỂM TRA CẢNH GIỚI
        // =================================================

        const canhGioi =
            String(
                player.canhGioi || ""
            ).trim();

        if (
            canhGioi !== "Độ Kiếp"
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ CHƯA ĐỦ TU VI")
                        .setDescription(
                            [
                                "☁️ **Phi Thăng Tiên Giới**",
                                "",
                                `⚡ Cảnh giới hiện tại: **${canhGioi || "Không rõ"}**`,
                                "",
                                "🔒 Yêu cầu:",
                                "⚡ Cảnh giới **Độ Kiếp**",
                                "🔑 Có **Chìa Khóa Tiên Giới ×1**",
                                "",
                                "📜 Hãy tiếp tục tu luyện và đột phá!"
                            ].join("\n")
                        )
                        .setColor(0xff0000)
                ],
                ephemeral: true
            });

        }

        // =================================================
        // 🎒 KIỂM TRA TÚI ĐỒ
        // =================================================

        if (
            !player.tuiDo
        ) {

            player.tuiDo = {
                danDuoc: [],
                vatPham: [],
                linhThu: []
            };

        }

        if (
            !Array.isArray(
                player.tuiDo.vatPham
            )
        ) {

            player.tuiDo.vatPham = [];

        }

        // =================================================
        // 🔑 TÌM CHÌA KHÓA
        // =================================================

        const keyName =
            "🔑 Chìa Khóa Tiên Giới";

        const inventory =
            player.tuiDo.vatPham;

        let keyIndex = -1;

        // -------------------------------------------------
        // Hỗ trợ cả dạng:
        // "🔑 Chìa Khóa Tiên Giới"
        // -------------------------------------------------

        keyIndex =
            inventory.findIndex(
                item => {

                    if (
                        typeof item === "string"
                    ) {

                        return (
                            item === keyName
                        );

                    }

                    if (
                        item &&
                        typeof item === "object"
                    ) {

                        return (
                            item.name === keyName ||
                            item.ten === keyName ||
                            item.id === "chia_khoa_tien_gioi"
                        );

                    }

                    return false;

                }
            );

        // =================================================
        // ❌ KHÔNG CÓ CHÌA
        // =================================================

        if (
            keyIndex === -1
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🔒 CHƯA THỂ PHI THĂNG")
                        .setDescription(
                            [
                                "☁️ **Cổng Tiên Giới đã xuất hiện!**",
                                "",
                                "⚡ Cảnh giới: **Độ Kiếp** ✅",
                                "🔑 Chìa Khóa Tiên Giới: **❌ Chưa có**",
                                "",
                                "📜 Cách nhận Chìa Khóa Tiên Giới:",
                                "",
                                "⚔️ **Đánh Boss**",
                                "Có cơ hội nhận được chìa khóa.",
                                "",
                                "🛒 **Cửa hàng**",
                                "Giá: **1.000.000.000 Linh Thạch**",
                                "",
                                "🔑 Hãy lấy chìa khóa rồi quay lại sử dụng `/phithang`."
                            ].join("\n")
                        )
                        .setColor(0xffcc00)
                ],
                ephemeral: true
            });

        }

        // =================================================
        // 🗝️ TRỪ CHÌA KHÓA
        // =================================================

        inventory.splice(
            keyIndex,
            1
        );

        // =================================================
        // ☁️ PHI THĂNG
        // =================================================

        updatePlayer(
            userId,
            {
                tienGioi: true,

                tuiDo: {
                    ...player.tuiDo,
                    vatPham: inventory
                }
            }
        );

        // =================================================
        // 🌌 THÔNG BÁO
        // =================================================

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "☁️✨ PHI THĂNG THÀNH CÔNG ✨☁️"
                )
                .setDescription(
                    [
                        "╔════════════════════╗",
                        "      🌌 **TIÊN GIỚI** 🌌",
                        "╚════════════════════╝",
                        "",
                        `⚔️ **${interaction.user.username}**`,
                        "",
                        "⚡ Cảnh giới: **Độ Kiếp**",
                        "🔑 Chìa khóa: **Đã sử dụng ×1**",
                        "",
                        "🌠 **CỔNG TIÊN GIỚI ĐÃ MỞ!**",
                        "",
                        "☁️ Mây tiên vạn dặm trải dài.",
                        "🌌 Tiên khí tràn ngập thiên địa.",
                        "✨ Con đường tiên đạo chính thức bắt đầu!",
                        "",
                        "━━━━━━━━━━━━━━━━━━━━",
                        "",
                        "🎉 **Chúc mừng đạo hữu đã phi thăng!**",
                        "",
                        "⚔️ Từ đây, con đường tu luyện",
                        "sẽ bước sang một tầng trời mới."
                    ].join("\n")
                )
                .setColor(0x00ccff)
                .setFooter({
                    text:
                        "🌌 Hồng Hoang Đại Lục • Tiên Giới"
                })
                .setTimestamp();

        return interaction.reply({
            embeds: [
                embed
            ]
        });

    } catch (error) {

        console.error(
            "❌ Lỗi /phithang:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {
            return;
        }

        return interaction.reply({
            content:
                "❌ Đã xảy ra lỗi khi phi thăng.",
            ephemeral: true
        });

    }

}

// =====================================================
// 📦 EXPORT
// =====================================================

module.exports = {
    data,
    execute
};
