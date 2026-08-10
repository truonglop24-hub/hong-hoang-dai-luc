const { SlashCommandBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dando")
        .setDescription("Sử dụng đan dược trong túi")
        .addStringOption(option =>
            option.setName("loai")
                .setDescription("Loại đan")
                .setRequired(true)
                .addChoices(
                    { name: "🔥 Đan Linh Lực", value: "linhluc" },
                    { name: "✨ Đan Kinh Nghiệm", value: "kinhnghiem" }
                )
        ),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        const type = interaction.options.getString("loai");
        const names = type === "linhluc" ? "🔥 Đan Linh Lực" : "✨ Đan Kinh Nghiệm";
        const list = p.tuiDo.danDuoc || [];
        const index = list.indexOf(names);

        if (index === -1) {
            return interaction.reply({
                content: `❌ Bạn không có **${names}** trong túi.`,
                ephemeral: true
            });
        }

        list.splice(index, 1);

        updatePlayer(interaction.user.id, {
            linhLuc: p.linhLuc + (type === "linhluc" ? 100 : 0),
            kinhNghiem: p.kinhNghiem + (type === "kinhnghiem" ? 100 : 0),
            tuiDo: { ...p.tuiDo, danDuoc: list }
        });

        return interaction.reply(`🧪 Đã sử dụng **${names}**.`);
    }
};
