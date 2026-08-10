const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    createPlayer
} = require(".database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("batdau")
        .setDescription("Bắt đầu con đường tu tiên"),

    async execute(interaction) {

        const player = createPlayer(
            interaction.user.id,
            interaction.user.username
        );

        if (player.created_at) {
            const embed = new EmbedBuilder()
                .setTitle("🌌 Hồng Hoang Khai Thiên")
                .setDescription(
                    `Đạo hữu **${interaction.user.username}** đã bước vào con đường tu tiên!`
                )
                .addFields(
                    {
                        name: "🌿 Linh căn",
                        value: player.spirit_root,
                        inline: true
                    },
                    {
                        name: "⭐ Thiên phú",
                        value: player.talent,
                        inline: true
                    },
                    {
                        name: "🌀 Cảnh giới",
                        value: player.realm_name,
                        inline: true
                    }
                );

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
};
