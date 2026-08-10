const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("xuatquan")
        .setDescription("Xuất quan sau khi bế quan hoàn thành"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });
        if (!p.beQuan) return interaction.reply({ content: "⚠️ Bạn không đang bế quan.", ephemeral: true });

        const remaining = p.beQuanEnd - Date.now();

        if (remaining > 0) {
            return interaction.reply({
                content: `🧘 Chưa thể xuất quan. Còn khoảng **${Math.ceil(remaining / 60000)} phút**.`,
                ephemeral: true
            });
        }

        const linhLuc = Math.floor(Math.random() * 101) + 100;
        const exp = Math.floor(Math.random() * 51) + 50;
        const linhThach = Math.floor(Math.random() * 31) + 20;

        updatePlayer(interaction.user.id, {
            beQuan: false,
            beQuanEnd: 0,
            linhLuc: p.linhLuc + linhLuc,
            kinhNghiem: p.kinhNghiem + exp,
            linhThach: p.linhThach + linhThach
        });

        const embed = new EmbedBuilder()
            .setTitle("🌅 XUẤT QUAN")
            .setDescription("Thiên địa linh khí tràn vào cơ thể, tu vi tăng tiến!")
            .addFields(
                { name: "🔥 Linh lực", value: `+${linhLuc}`, inline: true },
                { name: "✨ Kinh nghiệm", value: `+${exp}`, inline: true },
                { name: "💎 Linh thạch", value: `+${linhThach}`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};
