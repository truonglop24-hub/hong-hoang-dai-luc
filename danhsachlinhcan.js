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
            .setCustomId(`linhcan_list_${interaction.user.id}`)
            .setPlaceholder("🌌 Chọn cấp Linh Căn")
            .addOptions(
                ranks.map(rank => ({
                    label: rank,
                    description: `Xem Linh Căn cấp ${rank}`,
                    value: rank
                }))
            );

        const row = new ActionRowBuilder()
            .addComponents(menu);

        const embed = new EmbedBuilder()
            .setTitle("🌌 DANH SÁCH LINH CĂN")
            .setDescription(
                `Trong Hồng Hoang hiện có **${LINH_CAN.length} Linh Căn**.\n\n` +
                `👇 Chọn cấp bậc bên dưới để xem chi tiết.`
            )
            .setColor(0x8e44ad)
            .setFooter({
                text: "Hồng Hoang Đại Lục • Linh Căn"
            });

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    }
};
