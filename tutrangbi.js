const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tutrangbi")
        .setDescription("Xem pháp bảo của bản thân"),

    async execute(interaction) {
        const data = JSON.parse(
            fs.readFileSync(dataPath, "utf8")
        );

        const user = data.users[interaction.user.id];

        if (
            !user ||
            !user.trangbi ||
            Object.keys(user.trangbi).length === 0
        ) {
            return interaction.reply({
                content: "⚒️ Đạo hữu chưa có pháp bảo nào.",
                ephemeral: true
            });
        }

        const names = {
            "1": "⚔️ Huyền Thiết Kiếm",
            "2": "🗡️ Băng Phách Kiếm",
            "3": "⚡ Lôi Đình Kiếm",
            "4": "🌌 Hồng Hoang Thần Kiếm"
        };

        const text = Object.entries(user.trangbi)
            .map(
                ([id, amount]) =>
                    `${names[id] || `Pháp bảo ${id}`} × **${amount}**`
            )
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor(0xd35400)
            .setTitle("⚒️ PHÁP BẢO CỦA ĐẠO HỮU")
            .setDescription(text);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
