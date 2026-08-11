const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, createPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("batdau")
        .setDescription("Bắt đầu con đường tu luyện"),

    async execute(interaction) {
        const userId = interaction.user.id;
        const username = interaction.user.username;

        // Kiểm tra đã có nhân vật chưa
        const player = getPlayer(userId);

        if (player) {
            return interaction.reply({
                content: "⚠️ Bạn đã bắt đầu con đường tu luyện rồi!",
                ephemeral: true
            });
        }

        // Tạo nhân vật mới
        createPlayer(userId, username);

        const embed = new EmbedBuilder()
            .setTitle("🌟 BẮT ĐẦU TU LUYỆN")
            .setDescription(
                `**${username}** đã chính thức bước vào con đường tu tiên!\n\n` +
                "⚔️ Cảnh giới: **Luyện Khí**\n" +
                "📊 Tầng: **1**\n" +
                "🔥 Linh lực: **0**\n" +
                "✨ Kinh nghiệm: **0**\n" +
                "❤️ HP: **100/100**\n\n" +
                "📜 Dùng `/tuluyen` để bắt đầu tu luyện."
            )
            .setFooter({
                text: "Hồng Hoang Đại Lục"
            });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
