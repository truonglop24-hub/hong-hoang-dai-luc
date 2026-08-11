const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const realms = [
    {
        id: 0,
        name: "Phàm Nhân",
        maxCultivation: 1000
    },
    {
        id: 1,
        name: "Luyện Khí",
        maxCultivation: 10000
    },
    {
        id: 2,
        name: "Trúc Cơ",
        maxCultivation: 30000
    },
    {
        id: 3,
        name: "Kim Đan",
        maxCultivation: 80000
    },
    {
        id: 4,
        name: "Nguyên Anh",
        maxCultivation: 200000
    },
    {
        id: 5,
        name: "Hóa Thần",
        maxCultivation: 500000
    },
    {
        id: 6,
        name: "Luyện Hư",
        maxCultivation: 1000000
    },
    {
        id: 7,
        name: "Hợp Thể",
        maxCultivation: 3000000
    },
    {
        id: 8,
        name: "Đại Thừa",
        maxCultivation: 10000000
    },
    {
        id: 9,
        name: "Độ Kiếp",
        maxCultivation: 30000000
    },
    {
        id: 10,
        name: "Tiên Nhân",
        maxCultivation: 100000000
    },
    {
        id: 11,
        name: "Chân Tiên",
        maxCultivation: 500000000
    },
    {
        id: 12,
        name: "Thiên Tiên",
        maxCultivation: 1000000000
    },
    {
        id: 13,
        name: "Huyền Tiên",
        maxCultivation: 5000000000
    },
    {
        id: 14,
        name: "Kim Tiên",
        maxCultivation: 30000000000
    },
    {
        id: 15,
        name: "Thánh Nhân",
        maxCultivation: 100000000000
    },
    {
        id: 16,
        name: "Thiên Đạo",
        maxCultivation: 10000000000000
    },
    {
        id: 17,
        name: "Đại Đạo",
        maxCultivation: 99999999999999
    }
];

const data = new SlashCommandBuilder()
    .setName("realms")
    .setDescription("Xem danh sách cảnh giới tu tiên");

async function execute(interaction) {
    const text = realms
        .map(r =>
            `**${r.id}. ${r.name}** — Tối đa: ${r.maxCultivation.toLocaleString()}`
        )
        .join("\n");

    const embed = new EmbedBuilder()
        .setTitle("🌌 HỒNG HOANG ĐẠI LỤC – CẢNH GIỚI")
        .setDescription(text)
        .setFooter({ text: "Con đường tu tiên" });

    await interaction.reply({
        embeds: [embed]
    });
}

module.exports = {
    data,
    execute,
    realms
};
