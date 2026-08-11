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

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

const items = [
    {
        id: "1",
        name: "⚔️ Huyền Thiết Kiếm",
        cost: 500,
        requiredRealm: 1
    },
    {
        id: "2",
        name: "🗡️ Băng Phách Kiếm",
        cost: 2000,
        requiredRealm: 3
    },
    {
        id: "3",
        name: "⚡ Lôi Đình Kiếm",
        cost: 10000,
        requiredRealm: 5
    },
    {
        id: "4",
        name: "🌌 Hồng Hoang Thần Kiếm",
        cost: 100000,
        requiredRealm: 10
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("luyenkhi")
        .setDescription("Xem danh sách pháp bảo"),

    async execute(interaction) {

        const text = items
            .map(
                item =>
                    `**${item.id}. ${item.name}**\n` +
                    `💰 Giá: ${item.cost.toLocaleString()} linh thạch\n` +
                    `🌟 Cảnh giới: ${item.requiredRealm}`
            )
            .join("\n\n");

        const embed = new EmbedBuilder()
            .setColor(0xd35400)
            .setTitle("⚒️ LUYỆN KHÍ HỒNG HOANG")
            .setDescription(text)
            .setFooter({
                text: "Dùng /chetao để chế tạo pháp bảo"
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};
