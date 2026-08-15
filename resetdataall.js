const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    resetAllPlayers
} = require("./database");

const ADMIN_IDS = [
    "ĐIỀN_DISCORD_ID_CỦA_BẠN"
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

        // Chỉ admin được dùng
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
