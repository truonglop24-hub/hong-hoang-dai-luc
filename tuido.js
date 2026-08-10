const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tuido")
        .setDescription("Xem túi đồ"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        const dan = p.tuiDo.danDuoc || [];
        const item = p.tuiDo.vatPham || [];
        const pet = p.tuiDo.linhThu || [];

        const embed = new EmbedBuilder()
            .setTitle(`🎒 TÚI ĐỒ • ${p.username}`)
            .addFields(
                { name: "💊 Đan dược", value: dan.length ? dan.join("\n") : "Trống", inline: true },
                { name: "📦 Vật phẩm", value: item.length ? item.join("\n") : "Trống", inline: true },
                { name: "🐉 Linh thú", value: pet.length ? pet.map(x => x.name).join("\n") : "Trống", inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};
