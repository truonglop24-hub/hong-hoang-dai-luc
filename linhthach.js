const { SlashCommandBuilder } = require("discord.js");
const { getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("linhthach")
        .setDescription("Xem số linh thạch"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        return interaction.reply(`💎 Bạn đang có **${p.linhThach} linh thạch**.`);
    }
};
