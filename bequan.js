const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bequan")
        .setDescription("Bế quan để nhận phần thưởng lớn hơn")
        .addIntegerOption(option =>
            option.setName("thoigian")
                .setDescription("Số phút bế quan")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(1440)
        ),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });
        if (p.beQuan) return interaction.reply({ content: "🧘 Bạn đang bế quan rồi.", ephemeral: true });

        const minutes = interaction.options.getInteger("thoigian") || 30;

        updatePlayer(interaction.user.id, {
            beQuan: true,
            beQuanEnd: Date.now() + minutes * 60 * 1000
        });

        const embed = new EmbedBuilder()
            .setTitle("🧘 BẾ QUAN")
            .setDescription(`**${interaction.user.username}** tiến vào động phủ.`)
            .addFields(
                { name: "⏳ Thời gian", value: `${minutes} phút`, inline: true },
                { name: "🌱 Cảnh giới", value: `${p.canhGioi} tầng ${p.tang}`, inline: true }
            )
            .setFooter({ text: "Sau khi hết thời gian, dùng /xuatquan" });

        return interaction.reply({ embeds: [embed] });
    }
};
