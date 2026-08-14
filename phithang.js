const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// ☁️ /PHITHANG
// =====================================================

const data = new SlashCommandBuilder()
    .setName("phithang")
    .setDescription("☁️ Phi thăng từ Hạ Giới lên Tiên Giới");

// =====================================================
// ⚡ EXECUTE
// =====================================================

async function execute(interaction) {

    try {

        const userId = interaction.user.id;
        const player = getPlayer(userId);

        // =================================================
        // ❌ CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!player) {
            return interaction.reply({
                content:
                    "❌ Bạn chưa có nhân vật!\n" +
                    "Hãy sử dụng lệnh **/batdau** trước.",
                ephemeral: true
            });
        }

        // =================================================
        // ☁️ ĐÃ PHI THĂNG
        // =================================================

        if (player.tienGioi === true) {

            return interaction.reply({
                content:
                    "☁️ **Bạn đã phi thăng Tiên Giới!**",
                ephemeral: true
            });

        }

        // =================================================
        // ⚡ KIỂM TRA ĐỘ KIẾP
        // =================================================

        const canhGioi =
            String(player.canhGioi || "").trim();

        if (canhGioi !== "Độ Kiếp") {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("☁️ PHI THĂNG TIÊN GIỚI")
                        .setDescription(
                            "Bạn chưa đủ cảnh giới để phi thăng.\n\n" +
                            `⚡ Cảnh giới hiện tại: **${canhGioi || "Không rõ"}**\n\n` +
                            "🔒 Yêu cầu:\n" +
                            "⚡ **Độ Kiếp**"
                        )
                        .setColor(0xff0000)
                ],
                ephemeral: true
            });

        }

        // =================================================
        // 🎒 ĐẢM BẢO TÚI ĐỒ
        // =================================================

        if (!player.tuiDo) {
            player.tuiDo = {
                danDuoc: [],
                vatPham: [],
                linhThu: []
            };
        }

        if (!Array.isArray(player.tuiDo.vatPham)) {
            player.tuiDo.vatPham = [];
        }

        const vatPham = player.tuiDo.vatPham;

        // =================================================
        // 🔑 TÌM CHÌA KHÓA
        // =================================================

        const keyIndex = vatPham.findIndex(item => {

            if (typeof item === "string") {
                return (
                    item === "🔑 Chìa Khóa Tiên Giới" ||
                    item === "Chìa Khóa Tiên Giới"
                );
            }

            if (item && typeof item === "object") {
                return (
                    item.id === "chia_khoa_tien_gioi" ||
                    item.name === "🔑 Chìa Khóa Tiên Giới" ||
                    item.ten === "🔑 Chìa Khóa Tiên Giới" ||
                    item.name === "Chìa Khóa Tiên Giới" ||
                    item.ten === "Chìa Khóa Tiên Giới"
                );
            }

            return false;
        });

        // =================================================
        // ❌ KHÔNG CÓ CHÌA
        // =================================================

        if (keyIndex === -1) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🔒 CHƯA THỂ PHI THĂNG")
                        .setDescription(
                            "Bạn đã đạt **Độ Kiếp** nhưng vẫn thiếu vật phẩm.\n\n" +
                            "⚡ Cảnh giới: **Độ Kiếp** ✅\n" +
                            "🔑 Chìa Khóa Tiên Giới: **❌ Chưa có**\n\n" +
                            "📜 **Cách nhận chìa khóa:**\n\n" +
                            "⚔️ Đánh Boss\n" +
                            "→ Có cơ hội nhận được Chìa Khóa Tiên Giới.\n\n" +
                            "🛒 Cửa hàng\n" +
                            "→ Giá: **1.000.000.000 Linh Thạch**\n\n" +
                            "Sau khi có chìa khóa, sử dụng lại:\n" +
                            "**/phithang**"
                        )
                        .setColor(0xffcc00)
                ],
                ephemeral: true
            });

        }

        // =================================================
        // 🔑 TRỪ 1 CHÌA KHÓA
        // =================================================

        vatPham.splice(keyIndex, 1);

        // =================================================
        // ☁️ PHI THĂNG
        // =================================================

        updatePlayer(userId, {
            tienGioi: true,
            tuiDo: {
                ...player.tuiDo,
                vatPham: vatPham
            }
        });

        // =================================================
        // ✨ THÔNG BÁO
        // =================================================

        const embed = new EmbedBuilder()
            .setTitle("☁️✨ PHI THĂNG THÀNH CÔNG ✨☁️")
            .setDescription(
                "╔══════════════════════════╗\n" +
                "       🌌 **TIÊN GIỚI** 🌌\n" +
                "╚══════════════════════════╝\n\n" +

                `⚔️ **${interaction.user.username}**\n\n` +

                "⚡ Cảnh giới: **Độ Kiếp**\n" +
                "🔑 Chìa khóa: **Đã sử dụng ×1**\n\n" +

                "🌠 **CỔNG TIÊN GIỚI ĐÃ MỞ!**\n\n" +

                "☁️ Tiên Vân vạn dặm trải dài.\n" +
                "🌌 Tiên khí tràn ngập thiên địa.\n" +
                "✨ Một tầng trời mới đã mở ra trước mắt đạo hữu.\n\n" +

                "━━━━━━━━━━━━━━━━━━━━\n\n" +

                "🎉 **Chúc mừng đạo hữu phi thăng thành công!**\n\n" +

                "🌟 Từ giờ, ngươi đã chính thức bước vào **Tiên Giới**."
            )
            .setColor(0x00ccff)
            .setFooter({
                text: "🌌 Hồng Hoang Đại Lục • Tiên Giới"
            })
            .setTimestamp();

        return interaction.reply({
            embeds: [embed]
        });

    } catch (error) {

        console.error("❌ Lỗi /phithang:", error);

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
