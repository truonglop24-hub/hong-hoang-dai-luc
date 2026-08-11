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

function getUser(data, id) {
    if (!data.users[id]) {
        data.users[id] = {
            tuvi: 0,
            linhthach: 0,
            realm: 0,
            congphap: [],
            dan: {},
            trangbi: {}
        };
    }

    return data.users[id];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("daolu")
        .setDescription("Xem thông tin đạo lữ"),

    async execute(interaction) {
        const data = loadData();
        const id = interaction.user.id;

        const relationship = data.relationships[id];

        if (!relationship) {
            return interaction.reply({
                content: "💔 Đạo hữu hiện chưa có đạo lữ.",
                ephemeral: true
            });
        }

        const partner = await interaction.client.users.fetch(
            relationship.partner
        ).catch(() => null);

        const embed = new EmbedBuilder()
            .setColor(0xe91e63)
            .setTitle("💑 THÔNG TIN ĐẠO LỮ")
            .setDescription(
                `💮 **Đạo hữu:** ${interaction.user}\n` +
                `💮 **Đạo lữ:** ${partner ? partner : "Không tìm thấy"}\n\n` +
                `❤️ Hai người đã kết thành đạo lữ.\n` +
                `🌌 Mong hai vị cùng nhau tu luyện, đồng hành trên con đường đại đạo.`
            )
            .setFooter({
                text: "Hồng Hoang Đại Lục"
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};

module.exports.commands = [
    new SlashCommandBuilder()
        .setName("ketduyen")
        .setDescription("Gửi lời mời kết duyên")
        .addUserOption(option =>
            option
                .setName("nguoi")
                .setDescription("Người muốn kết duyên")
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName("chapnhan")
        .setDescription("Chấp nhận lời mời kết duyên"),

    new SlashCommandBuilder()
        .setName("tuchoi")
        .setDescription("Từ chối lời mời kết duyên"),

    new SlashCommandBuilder()
        .setName("lyhon")
        .setDescription("Kết thúc quan hệ đạo lữ")
];
