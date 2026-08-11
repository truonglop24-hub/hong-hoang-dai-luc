const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../data/data.json");

const items = [
    { id: "1", name: "⚔️ Huyền Thiết Kiếm", cost: 500, requiredRealm: 1 },
    { id: "2", name: "🗡️ Băng Phách Kiếm", cost: 2000, requiredRealm: 3 },
    { id: "3", name: "⚡ Lôi Đình Kiếm", cost: 10000, requiredRealm: 5 },
    { id: "4", name: "🌌 Hồng Hoang Thần Kiếm", cost: 100000, requiredRealm: 10 }
];

function loadData() {
    return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function saveData(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("chetao")
        .setDescription("Chế tạo pháp bảo")
        .addStringOption(option =>
            option
                .setName("id")
                .setDescription("ID pháp bảo")
                .setRequired(true)
        ),

    async execute(interaction) {
        const id = interaction.user.id;
        const itemId = interaction.options.getString("id");

        const data = loadData();

        if (!data.users[id]) {
            data.users[id] = {
                tuvi: 0,
                linhthach: 0,
                realm: 0,
                congphap: [],
                trangbi: {}
            };
        }

        if (!data.users[id].trangbi) {
            data.users[id].trangbi = {};
        }

        const item = items.find(x => x.id === itemId);

        if (!item) {
            return interaction.reply({
                content: "❌ Không tìm thấy pháp bảo.",
                ephemeral: true
            });
        }

        if (data.users[id].realm < item.requiredRealm) {
            return interaction.reply({
                content:
                    `❌ Cảnh giới chưa đủ.\n` +
                    `🌟 Yêu cầu: **${item.requiredRealm}**`,
                ephemeral: true
            });
        }

        if (data.users[id].linhthach < item.cost) {
            return interaction.reply({
                content:
                    `❌ Không đủ linh thạch.\n` +
                    `💰 Cần: **${item.cost.toLocaleString()}**`,
                ephemeral: true
            });
        }

        data.users[id].linhthach -= item.cost;

        data.users[id].trangbi[item.id] =
            (data.users[id].trangbi[item.id] || 0) + 1;

        saveData(data);

        const embed = new EmbedBuilder()
            .setColor(0xd35400)
            .setTitle("⚒️ LUYỆN KHÍ THÀNH CÔNG")
            .setDescription(
                `🔥 Đạo hữu đã luyện thành **${item.name}**!\n\n` +
                `💰 Đã tiêu: **${item.cost.toLocaleString()} linh thạch**`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};
