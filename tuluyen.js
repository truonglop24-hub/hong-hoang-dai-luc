const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 15000;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tuluyen")
        .setDescription("Tu luyện để nhận linh lực và kinh nghiệm"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) {
            return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });
        }

        if (p.beQuan) {
            return interaction.reply({
                content: "🧘 Bạn đang bế quan. Hãy dùng `/xuatquan` khi hoàn thành.",
                ephemeral: true
            });
        }

        const remaining = COOLDOWN - (Date.now() - (p.lastTrain || 0));

        if (remaining > 0) {
            return interaction.reply({
                content: `⏳ Bạn cần chờ **${Math.ceil(remaining / 1000)} giây** nữa.`,
                ephemeral: true
            });
        }

        const linhLuc = Math.floor(Math.random() * 31) + 20;
        const exp = Math.floor(Math.random() * 21) + 10;

        updatePlayer(interaction.user.id, {
            linhLuc: p.linhLuc + linhLuc,
            kinhNghiem: p.kinhNghiem + exp,
            lastTrain: Date.now()
        });

        const embed = new EmbedBuilder()
            .setTitle("⚔️ TU LUYỆN THÀNH CÔNG")
            .setDescription(
                `**${interaction.user.username}** vận chuyển linh khí trong kinh mạch.`
            )
            .addFields(
                { name: "🔥 Linh lực", value: `+${linhLuc}`, inline: true },
                { name: "✨ Kinh nghiệm", value: `+${exp}`, inline: true }
            )
            .setFooter({ text: "Cooldown: 15 giây" });

        return interaction.reply({ embeds: [embed] });
    }
};
