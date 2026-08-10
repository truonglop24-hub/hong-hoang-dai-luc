const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bequan")
        .setDescription("Bế quan tu luyện để tăng linh lực")
        .addIntegerOption(option =>
            option
                .setName("thoigian")
                .setDescription("Số phút bế quan")
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(1440)
        ),

    async execute(interaction) {

        const userId = interaction.user.id;
        const player = getPlayer(userId);

        if (!player) {
            return interaction.reply({
                content: "⚠️ Bạn chưa có nhân vật! Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        if (player.beQuan) {
            const conLai = Math.max(
                0,
                Math.ceil((player.beQuanEnd - Date.now()) / 60000)
            );

            return interaction.reply({
                content: `🧘 Bạn đang bế quan!\n⏳ Còn khoảng **${conLai} phút**.`,
                ephemeral: true
            });
        }

        const phut = interaction.options.getInteger("thoigian") || 30;

        const endTime = Date.now() + phut * 60 * 1000;

        updatePlayer(userId, {
            beQuan: true,
            beQuanEnd: endTime
        });

        const embed = new EmbedBuilder()
            .setTitle("🧘 BẾ QUAN TU LUYỆN")
            .setDescription(
                `**${interaction.user.username}** đã tiến vào động phủ và bắt đầu bế quan!`
            )
            .addFields(
                {
                    name: "⏳ Thời gian",
                    value: `**${phut} phút**`,
                    inline: true
                },
                {
                    name: "🔥 Trạng thái",
                    value: "Đang bế quan",
                    inline: true
                },
                {
                    name: "📜 Cảnh giới",
                    value: `**${player.canhGioi} ${player.tang}**`,
                    inline: true
                }
            )
            .setFooter({
                text: "Dùng /xuatquan để xuất quan khi đã hoàn thành"
            });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
