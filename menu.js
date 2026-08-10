const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("menu")
        .setDescription("Mở giao diện hệ thống Hồng Hoang Đại Lục"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle("🌌 HỒNG HOANG ĐẠI LỤC")
            .setDescription(
                "Chào mừng đạo hữu đến với con đường tu tiên!\n\n" +
                "📜 **Nhân vật**\n" +
                "`/batdau` • `/tuvi` • `/thongtin`\n\n" +
                "🔥 **Tu luyện**\n" +
                "`/tuluyen` • `/bequan` • `/xuatquan` • `/dotpha`\n\n" +
                "⚔️ **Chiến đấu**\n" +
                "`/phoban` • `/boss`\n\n" +
                "🐉 **Linh thú**\n" +
                "`/linhthu xem` • `/linhthu mua`\n\n" +
                "🏪 **Cửa hàng**\n" +
                "`/cuahang xem` • `/cuahang mua`\n\n" +
                "🎒 **Tiện ích**\n" +
                "`/tuido` • `/linhthach` • `/dando` • `/top`"
            )
            .setFooter({ text: "Hồng Hoang Đại Lục" });

        return interaction.reply({ embeds: [embed] });
    }
};
