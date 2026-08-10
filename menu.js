const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getPlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("menu")
        .setDescription("Mở giao diện Hồng Hoang Đại Lục"),

    async execute(interaction) {
        const player = getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ Đạo hữu chưa có nhân vật!\nHãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const linhLuc = player.linhLuc ?? 0;
        const linhThach = player.linhThach ?? 0;
        const tang = player.tang ?? 1;
        const canhGioi = player.canhGioi ?? "Luyện Khí";

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`🌌 HỒNG HOANG ĐẠI LỤC`)
            .setDescription(
                `✨ **${interaction.user.username}**\n\n` +

                `📜 **Cảnh Giới**\n` +
                `**${canhGioi} tầng ${tang}**\n\n` +

                `💎 **Linh Thạch**\n` +
                `**${linhThach}**\n\n` +

                `💧 **Linh Lực**\n` +
                `**${linhLuc}%**\n\n` +

                `🔑 **Linh Giới Lệnh**\n` +
                `**${player.linhGioiLenh ?? 0}**\n\n` +

                `🧪 **Linh Phù**\n` +
                `**${player.linhPhu ?? "0/3"}**\n\n` +

                `🌩️ **Thiên Kiếp**\n` +
                `❌ **Chưa vượt**`
            )
            .setImage(
                process.env.MENU_IMAGE_URL ||
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80"
            )
            .setFooter({
                text: "🌌 Hồng Hoang Đại Lục • Chúc đạo hữu tu luyện thành công"
            });

        // Hàng 1
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("menu_tuluyen")
                .setLabel("Tu Luyện")
                .setEmoji("🧙")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("menu_dotpha")
                .setLabel("Đột Phá")
                .setEmoji("⚡")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("menu_tuhanh")
                .setLabel("Tu Hành")
                .setEmoji("⚙️")
                .setStyle(ButtonStyle.Secondary)
        );

        // Hàng 2
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("menu_nghenghiep")
                .setLabel("Nghề Nghiệp")
                .setEmoji("🛠️")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("menu_chiendau")
                .setLabel("Chiến Đấu")
                .setEmoji("🗡️")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("menu_donghanh")
                .setLabel("Đồng Hành")
                .setEmoji("🦊")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("menu_phithang")
                .setLabel("Phi Thăng")
                .setEmoji("🦋")
                .setStyle(ButtonStyle.Primary)
        );

        // Hàng 3
        const row3 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("menu_tongmon")
                .setLabel("Tông Môn")
                .setEmoji("🏯")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("menu_pvp")
                .setLabel("PvP")
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("menu_thienkiep")
                .setLabel("Vượt Thiên Kiếp")
                .setEmoji("🌩️")
                .setStyle(ButtonStyle.Danger)
        );

        // Hàng 4
        const row4 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("menu_sugia")
                .setLabel("Sứ Giả")
                .setEmoji("👹")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("menu_dongphu")
                .setLabel("Động Phủ")
                .setEmoji("🏔️")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("menu_xephang")
                .setLabel("Xếp Hạng")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("menu_khac")
                .setLabel("Khác")
                .setEmoji("📦")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("menu_dong")
                .setLabel("Đóng")
                .setEmoji("🔒")
                .setStyle(ButtonStyle.Secondary)
        );

        // Hàng 5
        const row5 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("menu_giaodich")
                .setLabel("Giao Dịch")
                .setEmoji("🔄")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("menu_khodo")
                .setLabel("Kho Đồ")
                .setEmoji("🎒")
                .setStyle(ButtonStyle.Success)
        );

        return interaction.reply({
            embeds: [embed],
            components: [
                row1,
                row2,
                row3,
                row4,
                row5
            ]
        });
    }
};
