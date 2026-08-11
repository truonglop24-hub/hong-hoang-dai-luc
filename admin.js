const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ===============================
// ĐƯỜNG DẪN DATABASE
// ===============================

const dataPath = path.join(__dirname, "data", "data.json");

// ===============================
// ĐỌC DATABASE
// ===============================

function loadData() {
    if (!fs.existsSync(dataPath)) {
        return {
            users: {},
            relationships: {}
        };
    }

    return JSON.parse(
        fs.readFileSync(dataPath, "utf8")
    );
}

// ===============================
// LƯU DATABASE
// ===============================

function saveData(data) {
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 2)
    );
}

// ===============================
// TẠO DATA NGƯỜI CHƠI
// ===============================

function createUser(data, id) {

    if (!data.users) {
        data.users = {};
    }

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

// ===============================
// CẢNH GIỚI
// ===============================

const realms = [
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

// ===============================
// LỆNH ADMIN
// ===============================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("⚡ Hệ thống quản trị Hồng Hoang Đại Lục")

        // CỘNG TU VI
        .addSubcommand(sub =>
            sub
                .setName("addtuvi")
                .setDescription("✨ Cộng tu vi")
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

        // TRỪ TU VI
        .addSubcommand(sub =>
            sub
                .setName("removetuvi")
                .setDescription("❌ Trừ tu vi")
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

        // CỘNG LINH THẠCH
        .addSubcommand(sub =>
            sub
                .setName("addlinhthach")
                .setDescription("💰 Cộng linh thạch")
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

        // TRỪ LINH THẠCH
        .addSubcommand(sub =>
            sub
                .setName("removelinhtach")
                .setDescription("❌ Trừ linh thạch")
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

        // SET CẢNH GIỚI
        .addSubcommand(sub =>
            sub
                .setName("setrealm")
                .setDescription("🌟 Thiết lập cảnh giới")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("canhgioi")
                        .setDescription("ID cảnh giới 0 - 17")
                        .setRequired(true)
                        .setMinValue(0)
                        .setMaxValue(17)
                )
        )

        // RESET
        .addSubcommand(sub =>
            sub
                .setName("reset")
                .setDescription("♻️ Reset người chơi")
                .addUserOption(option =>
                    option
                        .setName("nguoi")
                        .setDescription("Người chơi")
                        .setRequired(true)
                )
        )

        // GIVE ITEM
        .addSubcommand(sub =>
            sub
                .setName("giveitem")
                .setDescription("🎁 Trao vật phẩm")
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

    // ===============================
    // EXECUTE
    // ===============================

    async execute(interaction) {

        // ==========================================
        // KIỂM TRA QUYỀN ADMIN
        // ==========================================

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {

            return interaction.reply({
                content:
                    "🚫 **Bạn không có quyền sử dụng hệ thống Admin!**",
                ephemeral: true
            });

        }

        // ==========================================
        // LẤY LỆNH CON
        // ==========================================

        const command =
            interaction.options.getSubcommand();

        const data = loadData();

        // ==========================================
        // CỘNG TU VI
        // ==========================================

        if (command === "addtuvi") {

            const user =
                interaction.options.getUser("nguoi");

            const amount =
                interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].tuvi += amount;

            saveData(data);

            const embed = new EmbedBuilder()
                .setColor(0x2ecc71)
                .setTitle("✨ ADMIN • CỘNG TU VI")
                .setDescription(
                    `👤 **Người chơi:** ${user}\n\n` +
                    `✨ **Đã cộng:** +${amount.toLocaleString()} tu vi\n` +
                    `📊 **Tu vi hiện tại:** ${data.users[user.id].tuvi.toLocaleString()}`
                )
                .setFooter({
                    text: `Thực hiện bởi ${interaction.user.tag}`
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // ==========================================
        // TRỪ TU VI
        // ==========================================

        if (command === "removetuvi") {

            const user =
                interaction.options.getUser("nguoi");

            const amount =
                interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].tuvi =
                Math.max(
                    0,
                    data.users[user.id].tuvi - amount
                );

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle("❌ ADMIN • TRỪ TU VI")
                        .setDescription(
                            `👤 **Người chơi:** ${user}\n\n` +
                            `✨ **Đã trừ:** -${amount.toLocaleString()} tu vi\n` +
                            `📊 **Tu vi hiện tại:** ${data.users[user.id].tuvi.toLocaleString()}`
                        )
                        .setFooter({
                            text: `Thực hiện bởi ${interaction.user.tag}`
                        })
                ]
            });
        }

        // ==========================================
        // CỘNG LINH THẠCH
        // ==========================================

        if (command === "addlinhthach") {

            const user =
                interaction.options.getUser("nguoi");

            const amount =
                interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].linhthach += amount;

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xf1c40f)
                        .setTitle("💰 ADMIN • CỘNG LINH THẠCH")
                        .setDescription(
                            `👤 **Người chơi:** ${user}\n\n` +
                            `💰 **Đã cộng:** +${amount.toLocaleString()} linh thạch\n` +
                            `📊 **Hiện tại:** ${data.users[user.id].linhthach.toLocaleString()}`
                        )
                ]
            });
        }

        // ==========================================
        // TRỪ LINH THẠCH
        // ==========================================

        if (command === "removelinhtach") {

            const user =
                interaction.options.getUser("nguoi");

            const amount =
                interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].linhthach =
                Math.max(
                    0,
                    data.users[user.id].linhthach - amount
                );

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xe67e22)
                        .setTitle("❌ ADMIN • TRỪ LINH THẠCH")
                        .setDescription(
                            `👤 **Người chơi:** ${user}\n\n` +
                            `💰 **Đã trừ:** -${amount.toLocaleString()} linh thạch\n` +
                            `📊 **Hiện tại:** ${data.users[user.id].linhthach.toLocaleString()}`
                        )
                ]
            });
        }

        // ==========================================
        // SET CẢNH GIỚI
        // ==========================================

        if (command === "setrealm") {

            const user =
                interaction.options.getUser("nguoi");

            const realm =
                interaction.options.getInteger("canhgioi");

            createUser(data, user.id);

            data.users[user.id].realm = realm;

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x9b59b6)
                        .setTitle("🌟 ADMIN • CẢNH GIỚI")
                        .setDescription(
                            `👤 **Người chơi:** ${user}\n\n` +
                            `🌟 **Cảnh giới:** ${realms[realm]}\n` +
                            `🔢 **ID:** ${realm}`
                        )
                ]
            });
        }

        // ==========================================
        // RESET
        // ==========================================

        if (command === "reset") {

            const user =
                interaction.options.getUser("nguoi");

            if (data.users && data.users[user.id]) {
                delete data.users[user.id];
            }

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle("♻️ ADMIN • RESET")
                        .setDescription(
                            `👤 Đã reset toàn bộ dữ liệu của ${user}.`
                        )
                ]
            });
        }

        // ==========================================
        // GIVE ITEM
        // ==========================================

        if (command === "giveitem") {

            const user =
                interaction.options.getUser("nguoi");

            const item =
                interaction.options.getString("item");

            const amount =
                interaction.options.getInteger("so_luong");

            createUser(data, user.id);

            data.users[user.id].trangbi[item] =
                (data.users[user.id].trangbi[item] || 0)
                + amount;

            saveData(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x3498db)
                        .setTitle("🎁 ADMIN • TRAO VẬT PHẨM")
                        .setDescription(
                            `👤 **Người chơi:** ${user}\n\n` +
                            `🎁 **Vật phẩm:** ${item}\n` +
                            `📦 **Số lượng:** ${amount}\n` +
                            `📊 **Tổng sở hữu:** ${data.users[user.id].trangbi[item]}`
                        )
                ]
            });
        }
    }
};
