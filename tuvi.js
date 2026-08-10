const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tuvi")
        .setDescription("Xem thông tin tu vi của bản thân"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) {
            return interaction.reply({
                content: "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📜 TU VI • ${interaction.user.username}`)
            .addFields(
                { name: "🌱 Cảnh giới", value: `${p.canhGioi} tầng ${p.tang}`, inline: true },
                { name: "🔥 Linh lực", value: `${p.linhLuc}`, inline: true },
                { name: "💎 Linh thạch", value: `${p.linhThach}`, inline: true },
                { name: "❤️ HP", value: `${p.hp}/${p.maxHp}`, inline: true },
                { name: "⚔️ Công", value: `${p.cong}`, inline: true },
                { name: "🛡️ Thủ", value: `${p.thu}`, inline: true },
                { name: "✨ Kinh nghiệm", value: `${p.kinhNghiem}`, inline: true },
                { name: "🐉 Boss đã hạ", value: `${p.bossDaGiet}`, inline: true },
                { name: "🏯 Phó bản", value: `${p.phoBanDaHoanThanh}`, inline: true }
            );

        return interaction.reply({ embeds: [embed] });
    }
};
