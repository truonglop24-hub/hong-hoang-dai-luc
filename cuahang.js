const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const items = {
    "tui-mau": { name: "❤️ Túi Hồi Máu", cost: 100, type: "vatPham" },
    "dan-linh-luc": { name: "🔥 Đan Linh Lực", cost: 150, type: "danDuoc" },
    "dan-kinh-nghiem": { name: "✨ Đan Kinh Nghiệm", cost: 200, type: "danDuoc" }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cuahang")
        .setDescription("Cửa hàng Hồng Hoang")
        .addSubcommand(sub =>
            sub.setName("xem").setDescription("Xem cửa hàng")
        )
        .addSubcommand(sub =>
            sub.setName("mua")
                .setDescription("Mua vật phẩm")
                .addStringOption(option =>
                    option.setName("vatpham")
                        .setDescription("Vật phẩm")
                        .setRequired(true)
                        .addChoices(
                            { name: "❤️ Túi Hồi Máu - 100", value: "tui-mau" },
                            { name: "🔥 Đan Linh Lực - 150", value: "dan-linh-luc" },
                            { name: "✨ Đan Kinh Nghiệm - 200", value: "dan-kinh-nghiem" }
                        )
                )
        ),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        if (interaction.options.getSubcommand() === "xem") {
            const embed = new EmbedBuilder()
                .setTitle("🏪 CỬA HÀNG HỒNG HOANG")
                .setDescription(
                    "❤️ Túi Hồi Máu — **100** linh thạch\n" +
                    "🔥 Đan Linh Lực — **150** linh thạch\n" +
                    "✨ Đan Kinh Nghiệm — **200** linh thạch"
                )
                .setFooter({ text: "Dùng /cuahang mua để mua vật phẩm" });

            return interaction.reply({ embeds: [embed] });
        }

        const id = interaction.options.getString("vatpham");
        const item = items[id];

        if (p.linhThach < item.cost) {
            return interaction.reply({
                content: `❌ Không đủ linh thạch. Cần **${item.cost}**.`,
                ephemeral: true
            });
        }

        const list = [...(p.tuiDo[item.type] || []), item.name];

        const changes = {
            linhThach: p.linhThach - item.cost,
            tuiDo: {
                ...p.tuiDo,
                [item.type]: list
            }
        };

        updatePlayer(interaction.user.id, changes);

        return interaction.reply(`🛒 Đã mua **${item.name}** với giá **${item.cost} linh thạch**.`);
    }
};
