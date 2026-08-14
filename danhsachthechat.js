const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const { THE_CHAT } = require("./thechat");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("danhsachthechat")
        .setDescription("Xem toàn bộ Thể Chất trong Hồng Hoang"),

    async execute(interaction) {
        const ranks = [...new Set(THE_CHAT.map(x => x.rank))];

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`thechat_list_${interaction.user.id}`)
            .setPlaceholder("🧬 Chọn cấp Thể Chất")
            .addOptions(
                ranks.map(rank => ({
                    label: rank,
                    description: `Xem Thể Chất cấp ${rank}`,
                    value: rank
                }))
            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("🧬 DANH SÁCH THỂ CHẤT")
            .setDescription(
                `Trong Hồng Hoang hiện có **${THE_CHAT.length} Thể Chất**.\n\n` +
                `👇 Chọn cấp bậc bên dưới để xem chi tiết.`
            )
            .setColor(0xe67e22)
            .setFooter({
                text: "Hồng Hoang Đại Lục • Thể Chất"
            });

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
