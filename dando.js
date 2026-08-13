const { SlashCommandBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dungdan")
        .setDescription("Dùng đan dược bằng cách nhập tên đan")
        .addStringOption(option =>
            option
                .setName("dan")
                .setDescription("Nhập chính xác tên đan dược trong túi")
                .setRequired(true)
        ),

    async execute(interaction) {

        try {

            const p = getPlayer(interaction.user.id);

            if (!p) {
                return interaction.reply({
                    content: "⚠️ Hãy dùng `/batdau` trước.",
                    ephemeral: true
                });
            }

            // ==========================================
            // TÊN ĐAN NGƯỜI CHƠI NHẬP
            // ==========================================

            const danNhap =
                interaction.options
                    .getString("dan")
                    .trim();

            if (!danNhap) {
                return interaction.reply({
                    content: "❌ Vui lòng nhập tên đan dược.",
                    ephemeral: true
                });
            }

            // ==========================================
            // KIỂM TRA TÚI ĐAN
            // ==========================================

            if (
                !p.tuiDo ||
                !Array.isArray(p.tuiDo.danDuoc)
            ) {
                return interaction.reply({
                    content: "❌ Túi đan dược của bạn đang trống.",
                    ephemeral: true
                });
            }

            const list = p.tuiDo.danDuoc;

            // Tìm không phân biệt hoa/thường
            // và bỏ khoảng trắng đầu/cuối
            const index = list.findIndex(
                item =>
                    String(item)
                        .trim()
                        .toLowerCase() ===
                    danNhap.toLowerCase()
            );

            // ==========================================
            // KHÔNG CÓ ĐAN
            // ==========================================

            if (index === -1) {
                return interaction.reply({
                    content:
                        `❌ Bạn không có **${danNhap}** trong túi đan dược.`,
                    ephemeral: true
                });
            }

            // ==========================================
            // LẤY TÊN ĐAN THỰC TẾ TRONG TÚI
            // ==========================================

            const tenDan = list[index];

            // ==========================================
            // XỬ LÝ HIỆU ỨNG ĐAN
            //
            // Giữ nguyên 2 loại đan hiện tại:
            //
            // 🔥 Đan Linh Lực
            // ✨ Đan Kinh Nghiệm
            // ==========================================

            let linhLucThem = 0;
            let kinhNghiemThem = 0;

            if (
                tenDan === "🔥 Đan Linh Lực"
            ) {
                linhLucThem = 100;
            }

            if (
                tenDan === "✨ Đan Kinh Nghiệm"
            ) {
                kinhNghiemThem = 100;
            }

            // ==========================================
            // ĐAN KHÁC
            //
            // Nếu tên đan không phải 2 loại cũ,
            // vẫn cho phép sử dụng và trừ đan.
            // Không tự bịa hiệu ứng.
            // ==========================================

            // Xóa đúng 1 viên
            list.splice(index, 1);

            // ==========================================
            // CẬP NHẬT PLAYER
            // ==========================================

            updatePlayer(
                interaction.user.id,
                {
                    linhLuc:
                        (Number(p.linhLuc) || 0) +
                        linhLucThem,

                    kinhNghiem:
                        (Number(p.kinhNghiem) || 0) +
                        kinhNghiemThem,

                    tuiDo: {
                        ...p.tuiDo,
                        danDuoc: list
                    }
                }
            );

            // ==========================================
            // THÔNG BÁO
            // ==========================================

            let message =
                `🧪 Đã sử dụng **${tenDan}**.`;

            if (linhLucThem > 0) {
                message +=
                    `\n🔥 Linh lực +${linhLucThem}`;
            }

            if (kinhNghiemThem > 0) {
                message +=
                    `\n✨ Kinh nghiệm +${kinhNghiemThem}`;
            }

            // Đan chưa có hiệu ứng trong file hiện tại
            if (
                linhLucThem === 0 &&
                kinhNghiemThem === 0
            ) {
                message +=
                    `\n⚠️ Đan này chưa được khai báo hiệu ứng trong hệ thống.`;
            }

            return interaction.reply({
                content: message
            });

        } catch (error) {

            console.error(
                "❌ Lỗi /dungdan:",
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                return interaction.followUp({
                    content:
                        "❌ Đã xảy ra lỗi khi sử dụng đan dược.",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi sử dụng đan dược.",
                ephemeral: true
            });
        }
    }
};
