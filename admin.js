const {
    SlashCommandBuilder,
    PermissionFlagsBits,
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
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 2)
    );
}

function createUser(data, id) {
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

    if (!data.users[id].congphap) {
        data.users[id].congphap = [];
    }

    if (!data.users[id].dan) {
        data.users[id].dan = {};
    }

    if (!data.users[id].trangbi) {
        data.users[id].trangbi = {};
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("Hệ thống quản trị Hồng Hoang Đại Lục")

        .addSubcommand(sub =>
            sub
                .setName("addtuvi")
                .setDescription("Cộng tu vi cho người chơi")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("so_luong")
                        .setDescription("Số tu vi")
                        .setRequired(true)
                        .setMinValue(1)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("removetuvi")
                .setDescription("Trừ tu vi của người chơi")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("so_luong")
                        .setDescription("Số tu vi")
                        .setRequired(true)
                        .setMinValue(1)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("addlinhthach")
                .setDescription("Cộng linh thạch")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("so_luong")
                        .setDescription("Số linh thạch")
                        .setRequired(true)
                        .setMinValue(1)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("removelinhtach")
                .setDescription("Trừ linh thạch")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("so_luong")
                        .setDescription("Số linh thạch")
                        .setRequired(true)
                        .setMinValue(1)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("setrealm")
                .setDescription("Thiết lập cảnh giới")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("canhgioi")
                        .setDescription("ID cảnh giới từ 0 đến 17")
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(17)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("Reset toàn bộ dữ liệu người chơi")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
        )

        .addSubcommand(sub =>
            sub
                .setName("giveitem")
                .setDescription("Trao vật phẩm cho người chơi")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("item")
                        .setDescription("ID vật phẩm")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("so_luong")
                        .setDescription("Số lượng")
                        .setRequired(true)
                        .setMinValue(1)
                )
        ),

    async execute(interaction) {

        // =========================
        // KIỂM TRA QUYỀN ADMIN
        // =========================

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content: "🚫 Bạn không có quyền sử dụng lệnh Admin!",
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        const data = loadData();

        // =========================
        // CỘNG TU VI
        // =========================

        if (subcommand === "addtuvi") {

            const user = interaction.options.getUser("nguoi");
            const amount = interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].tuvi += amount;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("⚡ ADMIN - CỘNG TU VI")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `✨ **Tu vi cộng:** +${amount.toLocaleString()}\n` +
                    `📊 **Tu vi hiện tại:** ${data.users[user.id].tuvi.toLocaleString()}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // TRỪ TU VI
        // =========================

        if (subcommand === "removetuvi") {

            const user = interaction.options.getUser("nguoi");
            const amount = interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].tuvi = Math.max(
                0,
                data.users[user.id].tuvi - amount
            );

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle("⚡ ADMIN - TRỪ TU VI")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `✨ **Tu vi trừ:** -${amount.toLocaleString()}\n` +
                    `📊 **Tu vi hiện tại:** ${data.users[user.id].tuvi.toLocaleString()}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // CỘNG LINH THẠCH
        // =========================

        if (subcommand === "addlinhthach") {

            const user = interaction.options.getUser("nguoi");
            const amount = interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].linhthach += amount;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0xf1c40f)
                .setTitle("💰 ADMIN - CỘNG LINH THẠCH")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `💰 **Linh thạch cộng:** +${amount.toLocaleString()}\n` +
                    `📊 **Linh thạch hiện tại:** ${data.users[user.id].linhthach.toLocaleString()}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // TRỪ LINH THẠCH
        // =========================

        if (subcommand === "removelinhtach") {

            const user = interaction.options.getUser("nguoi");
            const amount = interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].linhthach = Math.max(
                0,
                data.users[user.id].linhthach - amount
            );

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0xe67e22)
                .setTitle("💰 ADMIN - TRỪ LINH THẠCH")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `💰 **Linh thạch trừ:** -${amount.toLocaleString()}\n` +
                    `📊 **Linh thạch hiện tại:** ${data.users[user.id].linhthach.toLocaleString()}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // SET CẢNH GIỚI
        // =========================

        if (subcommand === "setrealm") {

            const user = interaction.options.getUser("nguoi");
            const realm = interaction.options.getInteger("canhgioi");

            createUser(data, user.id);

            data.users[user.id].realm = realm;

            saveData(data);

            const realmNames = [
                "Phàm Nhân",
                "Luyện Khí",
                "Trúc Cơ",
                "Kim Đan",
                "Nguyên Anh",
                "Hóa Thần",
                "Luyện Hư",
                "Hợp Thể",
                "Đại Thừa",
                "Độ Kiếp",
                "Tán Tiên",
                "Chân Tiên",
                "Kim Tiên",
                "Tiên Vương",
                "Tiên Đế",
                "Thánh Nhân",
                "Thiên Đạo",
                "Đại Đạo"
            ];

            const embed = new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle("🌟 ADMIN - THIẾT LẬP CẢNH GIỚI")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `🌟 **Cảnh giới:** ${realmNames[realm]}\n` +
                    `🔢 **ID:** ${realm}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // RESET
        // =========================

        if (subcommand === "reset") {

            const user = interaction.options.getUser("nguoi");

            delete data.users[user.id];

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0xe74c3c)
                .setTitle("♻️ ADMIN - RESET")
                .setDescription(
                    `👤 Đã reset toàn bộ dữ liệu của ${user}.`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =========================
        // GIVE ITEM
        // =========================

        if (subcommand === "giveitem") {

            const user = interaction.options.getUser("nguoi");
            const item = interaction.options.getString("item");
            const amount = interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].trangbi[item] =
                (data.users[user.id].trangbi[item] || 0) + amount;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0x3498db)
                .setTitle("🎁 ADMIN - TRAO VẬT PHẨM")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n` +
                    `🎁 **Vật phẩm:** ${item}\n` +
                    `📦 **Số lượng:** ${amount}\n` +
                    `📊 **Tổng sở hữu:** ${data.users[user.id].trangbi[item]}`
                )
                .setFooter({
                    text: `Admin: ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }
    }
};
