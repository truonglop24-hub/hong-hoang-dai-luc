const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 10 * 60 * 1000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("phoban")
        .setDescription("Tiến vào phó bản và chiến đấu"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        const remaining = COOLDOWN - (Date.now() - (p.lastDungeon || 0));

        if (remaining > 0) {
            return interaction.reply({
                content: `⏳ Phó bản đang hồi phục. Còn **${Math.ceil(remaining / 60000)} phút**.`,
                ephemeral: true
            });
        }

        const enemyHp = Math.floor(Math.random() * 101) + 100;
        const enemyAtk = Math.floor(Math.random() * 21) + 15;
        const power = p.cong + p.thu + Math.floor(p.linhLuc / 20);

        const win = power + Math.random() * 80 > enemyHp * 0.9;

        if (!win) {
            updatePlayer(interaction.user.id, {
                lastDungeon: Date.now(),
                hp: Math.max(1, p.hp - Math.floor(enemyAtk / 2))
            });

            return interaction.reply({
                content: `💀 **Phó bản thất bại!**\nBạn bị yêu thú đánh lui.\n❤️ HP còn: **${Math.max(1, p.hp - Math.floor(enemyAtk / 2))}**`
            });
        }

        const exp = Math.floor(Math.random() * 81) + 60;
        const stones = Math.floor(Math.random() * 101) + 50;

        updatePlayer(interaction.user.id, {
            lastDungeon: Date.now(),
            kinhNghiem: p.kinhNghiem + exp,
            linhThach: p.linhThach + stones,
            phoBanDaHoanThanh: p.phoBanDaHoanThanh + 1,
            hp: Math.min(p.maxHp, p.hp + 20)
        });

        const embed = new EmbedBuilder()
            .setTitle("🏯 PHÓ BẢN HOÀN THÀNH")
            .setDescription("Bạn chém giết yêu thú và thu được tài nguyên!")
            .addFields(
                { name: "✨ Kinh nghiệm", value: `+${exp}`, inline: true },
                { name: "💎 Linh thạch", value: `+${stones}`, inline: true },
                { name: "❤️ Hồi phục", value: "+20 HP", inline: true }
            )
            .setFooter({ text: "Cooldown: 10 phút" });

        return interaction.reply({ embeds: [embed] });
    }
};
