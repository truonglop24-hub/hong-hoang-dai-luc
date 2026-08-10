const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer
} = require("./database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tuvi")
        .setDescription("Xem thông tin tu vi"),

    async execute(interaction) {

        const player = getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply(
                "❌ Bạn chưa bắt đầu tu tiên. Hãy dùng `/batdau`."
            );
        }

        const embed = new EmbedBuilder()
            .setTitle(`🌌 Hồ Sơ Tu Tiên — ${player.name}`)
            .addFields(
                {
                    name: "🌀 Cảnh giới",
                    value: player.realm_name,
                    inline: true
                },
                {
                    name: "✨ Tu vi",
                    value: `${player.cultivation}`,
                    inline: true
                },
                {
                    name: "💰 Linh thạch",
                    value: `${player.spirit_stones}`,
                    inline: true
                },
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
                    name: "⚔️ Công kích",
                    value: `${player.attack}`,
                    inline: true
                }
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};
