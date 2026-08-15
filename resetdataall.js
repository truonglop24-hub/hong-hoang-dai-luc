const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    resetAllPlayers
} = require("./database");

// Discord ID được phép sử dụng /resetall
const ADMIN_IDS = [
    "1263416165372268607"
];

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("resetall")
            .setDescription(
                "☠️ Reset toàn bộ dữ liệu người chơi"
            )
            .setDefaultMemberPermissions(
                PermissionFlagsBits.Administrator
            ),

    async execute(interaction) {

        // Kiểm tra ID có nằm trong danh sách được cấp quyền hay không
        if (
            !ADMIN_IDS.includes(
                interaction.user.id
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Bạn không có quyền dùng lệnh này.",
                ephemeral: true
            });
        }

        // Reset toàn bộ người chơi
        const count =
            resetAllPlayers();

        return interaction.reply({
            content:
                "☠️ **RESET TOÀN BỘ DATA THÀNH CÔNG!**\n\n" +
                `👥 Đã reset: **${count}** người chơi.\n` +
                "📈 Tu vi: reset\n" +
                "💎 Linh thạch: reset\n" +
                "🎒 Túi đồ: reset\n" +
                "🌌 Linh căn: reset\n" +
                "⚔️ Chỉ số: reset\n" +
                "🏯 Phó bản: reset",
            ephemeral: true
        });
    }
};
