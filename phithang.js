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
                    "Hãy sử dụng **/batdau** trước.",
                ephemeral: true
            });
        }

        // =================================================
        // ☁️ ĐÃ PHI THĂNG
        // =================================================

        if (player.tienGioi === true) {
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
            String(player.canhGioi || "").trim();

        if (canhGioi !== "Độ Kiếp") {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xff0000)
                        .setTitle("❌ CHƯA ĐỦ CẢNH GIỚI")
                        .setDescription(
                            "☁️ **Điều kiện Phi Thăng Tiên Giới**\n\n" +
                            `⚡ Cảnh giới hiện tại: **${canhGioi || "Không rõ"}**\n\n` +
                            "🔒 Yêu cầu:\n" +
                            "⚡ **Độ Kiếp**"
                        )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // 🎒 ĐẢM BẢO TÚI ĐỒ
        // =================================================

        if (!player.tuiDo) {
            player.tuiDo = {};
        }

        if (!Array.isArray(player.tuiDo.vatPham)) {
            player.tuiDo.vatPham = [];
        }

        if (!Array.isArray(player.tuiDo.dacBiet)) {
            player.tuiDo.dacBiet = [];
        }

        // =================================================
        // 🔑 TÊN / ID CHÌA KHÓA
        // =================================================

        const KEY_ID = "chia_khoa_tien_gioi";

        const KEY_NAMES = [
            "🔑 Chìa Khóa Tiên Giới",
            "Chìa Khóa Tiên Giới"
        ];

        // =================================================
        // 🔍 HÀM KIỂM TRA CHÌA KHÓA
        // =================================================

        function isKey(item) {

            // Nếu vật phẩm được lưu dạng string
            if (typeof item === "string") {
                return KEY_NAMES.includes(item);
            }

            // Nếu vật phẩm được lưu dạng object
            if (item && typeof item === "object") {

                return (
                    item.id === KEY_ID ||
                    KEY_NAMES.includes(item.name) ||
                    KEY_NAMES.includes(item.ten)
                );
            }

            return false;
        }

        // =================================================
        // 🔑 TÌM TRONG vatPham
        // =================================================

        let keyType = null;
        let keyIndex = -1;

        keyIndex =
            player.tuiDo.vatPham.findIndex(isKey);

        if (keyIndex !== -1) {
            keyType = "vatPham";
        }

        // =================================================
        // 🔑 NẾU KHÔNG CÓ → TÌM TRONG dacBiet
        // =================================================

        if (keyIndex === -1) {

            keyIndex =
                player.tuiDo.dacBiet.findIndex(isKey);

            if (keyIndex !== -1) {
                keyType = "dacBiet";
            }
        }

        // =================================================
        // ❌ KHÔNG CÓ CHÌA KHÓA
        // =================================================

        if (keyIndex === -1) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xffcc00)
                        .setTitle("🔒 CHƯA THỂ PHI THĂNG")
                        .setDescription(
                            "☁️ **Cổng Tiên Giới đã xuất hiện!**\n\n" +

                            "⚡ Cảnh giới: **Độ Kiếp** ✅\n" +
                            "🔑 Chìa Khóa Tiên Giới: **❌ Chưa có**\n\n" +

                            "📜 **Cách nhận Chìa Khóa Tiên Giới:**\n\n" +

                            "⚔️ **Đánh Boss**\n" +
                            "→ Có cơ hội nhận được chìa khóa.\n\n" +

                            "🛒 **Cửa hàng**\n" +
                            "→ Giá: **1.000.000.000 Linh Thạch**\n\n" +

                            "🔑 Sau khi có chìa khóa, sử dụng lại:\n" +
                            "**/phithang**"
                        )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // 🔑 TRỪ 1 CHÌA KHÓA
        // =================================================

        player.tuiDo[keyType].splice(keyIndex, 1);

        // =================================================
        // ☁️ ĐÁNH DẤU ĐÃ PHI THĂNG
        // =================================================

        player.tienGioi = true;

        // =================================================
        // 💾 LƯU DATABASE
        // =================================================

        updatePlayer(userId, {
            tienGioi: true,
            tuiDo: player.tuiDo
        });

        // =================================================
        // ✨ THÔNG BÁO PHI THĂNG
        // =================================================

        const embed =
            new EmbedBuilder()
                .setColor(0x00ccff)
                .setTitle(
                    "☁️✨ PHI THĂNG THÀNH CÔNG ✨☁️"
                )
                .setDescription(
                    "╔══════════════════════════╗\n" +
                    "       🌌 **TIÊN GIỚI** 🌌\n" +
                    "╚══════════════════════════╝\n\n" +

                    `⚔️ **${interaction.user.username}**\n\n` +

                    "⚡ Cảnh giới: **Độ Kiếp** ✅\n" +
                    "🔑 Chìa Khóa Tiên Giới: **Đã sử dụng ×1**\n\n" +

                    "🌠 **CỔNG TIÊN GIỚI ĐÃ MỞ!**\n\n" +

                    "☁️ Tiên Vân vạn dặm trải dài.\n" +
                    "🌌 Tiên khí tràn ngập thiên địa.\n" +
                    "✨ Tiên khí bao phủ toàn bộ thiên địa.\n\n" +

                    "━━━━━━━━━━━━━━━━━━━━\n\n" +

                    "🎉 **CHÚC MỪNG ĐẠO HỮU!**\n\n" +

                    "Ngươi đã chính thức bước vào\n" +
                    "🌌 **TIÊN GIỚI** 🌌\n\n" +

                    "⚔️ Con đường tiên đạo chân chính\n" +
                    "giờ mới chính thức bắt đầu!"
                )
                .setFooter({
                    text:
                        "🌌 Hồng Hoang Đại Lục • Tiên Giới"
                })
                .setTimestamp();

        return interaction.reply({
            embeds: [embed]
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
