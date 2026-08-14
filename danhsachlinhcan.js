const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const { LINH_CAN } = require("./linhcan");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("danhsachlinhcan")
        .setDescription("Xem toàn bộ Linh Căn trong Hồng Hoang"),

    async execute(interaction) {

        const ranks = [...new Set(LINH_CAN.map(x => x.rank))];

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`xem_linhcan_${interaction.user.id}`)
            .setPlaceholder("🌌 Chọn cấp Linh Căn")
            .addOptions(
                ranks.map(rank => ({
                    label: rank,
                    description: `Xem các Linh Căn cấp ${rank}`,
                    value: rank
                }))
            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("🌌 DANH SÁCH LINH CĂN")
            .setDescription(
                `Hiện có **${LINH_CAN.length} Linh Căn** trong Hồng Hoang.\n\n` +
                `📖 Hãy chọn cấp bậc bên dưới để xem danh sách.`
            )
            .setColor(0x9b59b6)
            .setFooter({
                text: "Hồng Hoang Đại Lục • Linh Căn"
            });

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
