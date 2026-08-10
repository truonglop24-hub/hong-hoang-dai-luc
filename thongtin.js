const { SlashCommandBuilder } = require("discord.js");
const { getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("thongtin")
        .setDescription("Xem thông tin nhân vật"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) {
            return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });
        }

        return interaction.reply(
            `👤 **${p.username}**\n` +
            `🌱 ${p.canhGioi} tầng ${p.tang}\n` +
            `🔥 Linh lực: **${p.linhLuc}**\n` +
            `💎 Linh thạch: **${p.linhThach}**\n` +
            `❤️ HP: **${p.hp}/${p.maxHp}**\n` +
            `⚔️ Công: **${p.cong}** • 🛡️ Thủ: **${p.thu}**`
        );
    }
};
