const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

function loadData() {
    if (!fs.existsSync(dataPath)) {
        return {
            users: {},
            relationships: {}
        };
    }

    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const congPhap = [
    {
        id: "1",
        name: "🔥 Hỏa Vân Quyết",
        requiredRealm: 1,
        bonus: 10
    },
    {
        id: "2",
        name: "❄️ Băng Tâm Quyết",
        requiredRealm: 2,
        bonus: 15
    },
    {
        id: "3",
        name: "⚡ Cửu Thiên Lôi Quyết",
        requiredRealm: 5,
        bonus: 30
    },
    {
        id: "4",
        name: "🌌 Hồng Hoang Đạo Kinh",
        requiredRealm: 10,
        bonus: 50
    },
    {
        id: "5",
        name: "☯️ Đại Đạo Kinh",
        requiredRealm: 16,
        bonus: 100
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("congphap")
        .setDescription("Xem danh sách công pháp"),

    async execute(interaction) {
        const text = congPhap
            .map(
                cp =>
                    `**${cp.id}. ${cp.name}**\n` +
                    `> Cảnh giới yêu cầu: ${cp.requiredRealm}\n` +
                    `> Tăng hiệu quả tu luyện: +${cp.bonus}%`
            )
            .join("\n\n");

        const embed = new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle("📜 CÔNG PHÁP HỒNG HOANG")
            .setDescription(text)
            .setFooter({
                text: "Dùng /hoccongphap để học công pháp"
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};
