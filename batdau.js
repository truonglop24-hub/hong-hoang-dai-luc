const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { createPlayer, getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("batdau")
        .setDescription("Gia nhập Hồng Hoang Đại Lục và bắt đầu tu tiên"),

    async execute(interaction) {
        const old = getPlayer(interaction.user.id);

        if (old) {
            return interaction.reply({
                content: "⚠️ Bạn đã có nhân vật rồi! Dùng `/tuvi` để xem tu vi.",
                ephemeral: true
            });
        }

        const player = createPlayer(
            interaction.user.id,
            interaction.user.username
        );

        const embed = new EmbedBuilder()
            .setTitle("🌌 HỒNG HOANG ĐẠI LỤC")
            .setDescription(
                `✨ Chúc mừng **${interaction.user.username}**!\n\n` +
                "Bạn đã bước vào con đường tu tiên.\n\n" +
                "📜 Cảnh giới: **Luyện Khí tầng 1**\n" +
                "💎 Linh thạch: **100**\n" +
                "🔥 Linh lực: **0**\n\n" +
                "Hãy dùng `/tuluyen` để bắt đầu tu luyện!"
            );

        return interaction.reply({ embeds: [embed] });
    }
};
