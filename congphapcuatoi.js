const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

function loadData() {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("congphapcuatoi")
        .setDescription("Xem công pháp của bản thân"),

    async execute(interaction) {
        const data = loadData();
        const user = data.users[interaction.user.id];

        if (!user || !user.congphap || user.congphap.length === 0) {
            return interaction.reply({
                content: "📜 Đạo hữu chưa học công pháp nào.",
                ephemeral: true
            });
        }

        const names = {
            "1": "🔥 Hỏa Vân Quyết",
            "2": "❄️ Băng Tâm Quyết",
            "3": "⚡ Cửu Thiên Lôi Quyết",
            "4": "🌌 Hồng Hoang Đạo Kinh",
            "5": "☯️ Đại Đạo Kinh"
        };

        const text = user.congphap
            .map(id => `📜 ${names[id] || `Công pháp ${id}`}`)
            .join("\n");

        const embed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle("📜 CÔNG PHÁP CỦA ĐẠO HỮU")
            .setDescription(text);

        await interaction.reply({
            embeds: [embed]
        });
    }
};
