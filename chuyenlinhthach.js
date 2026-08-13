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

        .setName("chuyenlinhthach")

        .setDescription("💰 Chuyển Linh Thạch cho người chơi khác")

        .addUserOption(option =>
            option
                .setName("nguoi_nhan")
                .setDescription("Người nhận Linh Thạch")
                .setRequired(true)
        )

        .addIntegerOption(option =>
            option
                .setName("so_luong")
                .setDescription("Số Linh Thạch muốn chuyển")
                .setMinValue(1)
                .setRequired(true)
        ),

    async execute(interaction) {

        const nguoiNhan =
            interaction.options.getUser("nguoi_nhan");

        const soLuong =
            interaction.options.getInteger("so_luong");

        // Không chuyển cho bot
        if (nguoiNhan.bot) {

            return interaction.reply({
                content: "❌ Không thể chuyển Linh Thạch cho bot!",
                ephemeral: true
            });

        }

        // Không tự chuyển cho mình
        if (nguoiNhan.id === interaction.user.id) {

            return interaction.reply({
                content: "❌ Bạn không thể chuyển Linh Thạch cho chính mình!",
                ephemeral: true
            });

        }

        // Lấy người gửi
        const nguoiGui =
            getPlayer(interaction.user.id);

        if (!nguoiGui) {

            return interaction.reply({
                content:
                    "❌ Bạn chưa bắt đầu tu luyện! Hãy dùng `/batdau` trước.",
                ephemeral: true
            });

        }

        // Lấy người nhận
        const playerNhan =
            getPlayer(nguoiNhan.id);

        if (!playerNhan) {

            return interaction.reply({
                content:
                    `❌ **${nguoiNhan.username}** chưa bắt đầu tu luyện!`,
                ephemeral: true
            });

        }

        // Kiểm tra số dư
        const soDu =
            Number(nguoiGui.linhThach || 0);

        if (soDu < soLuong) {

            return interaction.reply({
                content:
                    `❌ Bạn không đủ Linh Thạch!\n\n` +
                    `💰 Số dư: **${soDu.toLocaleString()}**\n` +
                    `💸 Muốn chuyển: **${soLuong.toLocaleString()}**`,
                ephemeral: true
            });

        }

        // Trừ người gửi
        updatePlayer(
            interaction.user.id,
            {
                linhThach:
                    soDu - soLuong
            }
        );

        // Cộng người nhận
        updatePlayer(
            nguoiNhan.id,
            {
                linhThach:
                    Number(playerNhan.linhThach || 0) +
                    soLuong
            }
        );

        // Thông báo
        const embed =
            new EmbedBuilder()

                .setTitle("💰 CHUYỂN LINH THẠCH")

                .setDescription(
                    `✨ **${interaction.user.username}** đã chuyển Linh Thạch!\n\n` +

                    `👤 Người gửi: **${interaction.user.username}**\n` +

                    `🎁 Người nhận: **${nguoiNhan.username}**\n\n` +

                    `💰 Số lượng: **${soLuong.toLocaleString()} Linh Thạch**\n\n` +

                    `💎 Số dư người gửi còn: ` +
                    `**${(
                        soDu - soLuong
                    ).toLocaleString()} Linh Thạch**`
                )

                .setFooter({
                    text:
                        "🌌 Hồng Hoang Đại Lục • Giao dịch thành công"
                });

        return interaction.reply({
            embeds: [embed]
        });

    }

};
