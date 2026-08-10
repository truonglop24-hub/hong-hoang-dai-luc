const {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ===============================
// CONFIG
// ===============================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// ===============================
// DATABASE
// ===============================

const DATA_FILE = path.join(__dirname, "data.json");

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
}

function loadData() {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch {
        return {};
    }
}

let db = loadData();

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// ===============================
// USER DATA
// ===============================

function createUser(user) {
    if (!db[user.id]) {
        db[user.id] = {
            id: user.id,
            name: user.username,

            realm: 0,
            cultivation: 0,

            spiritStones: 1000,

            pills: {
                tuLinh: 3,
                dotPha: 1,
                hoiPhuc: 2,
                baoMenh: 1
            },

            lastCultivate: 0,
            lastDaily: 0,

            totalCultivate: 0,
            breakthroughs: 0,

            createdAt: Date.now()
        };

        saveData();
    }

    return db[user.id];
}

// ===============================
// REALMS
// ===============================

const realms = [
    {
        name: "Phàm Nhân",
        max: 0,
        requirement: 0,
        success: 100
    },
    {
        name: "Luyện Khí",
        max: 9,
        requirement: 100,
        success: 90
    },
    {
        name: "Trúc Cơ",
        max: 9,
        requirement: 500,
        success: 80
    },
    {
        name: "Kim Đan",
        max: 9,
        requirement: 1500,
        success: 70
    },
    {
        name: "Nguyên Anh",
        max: 9,
        requirement: 4000,
        success: 60
    },
    {
        name: "Hóa Thần",
        max: 9,
        requirement: 10000,
        success: 50
    },
    {
        name: "Luyện Hư",
        max: 9,
        requirement: 25000,
        success: 45
    },
    {
        name: "Hợp Thể",
        max: 9,
        requirement: 60000,
        success: 40
    },
    {
        name: "Đại Thừa",
        max: 9,
        requirement: 150000,
        success: 35
    },
    {
        name: "Độ Kiếp",
        max: 9,
        requirement: 400000,
        success: 30
    },
    {
        name: "Tiên Nhân",
        max: 9,
        requirement: 1000000,
        success: 25
    },
    {
        name: "Chân Tiên",
        max: 9,
        requirement: 3000000,
        success: 20
    },
    {
        name: "Tiên Vương",
        max: 9,
        requirement: 10000000,
        success: 15
    },
    {
        name: "Tiên Đế",
        max: 9,
        requirement: 50000000,
        success: 10
    },
    {
        name: "Hồng Hoang Chí Tôn",
        max: 1,
        requirement: 100000000,
        success: 5
    }
];

// ===============================
// HELPERS
// ===============================

function getRealm(user) {
    return realms[user.realm] || realms[0];
}

function formatNumber(number) {
    return Number(number).toLocaleString("vi-VN");
}

function getProgress(user) {
    const realm = getRealm(user);

    if (user.realm >= realms.length - 1) {
        return "MAX";
    }

    const next = realms[user.realm + 1];

    const percent = Math.min(
        100,
        Math.floor((user.cultivation / next.requirement) * 100)
    );

    const barLength = 10;
    const filled = Math.floor(percent / 10);

    return "█".repeat(filled) +
        "░".repeat(barLength - filled) +
        ` ${percent}%`;
}

function cooldownRemaining(timestamp, cooldown) {
    const remaining = cooldown - (Date.now() - timestamp);

    if (remaining <= 0) return 0;

    return remaining;
}

function formatTime(ms) {
    const seconds = Math.ceil(ms / 1000);

    if (seconds < 60) {
        return `${seconds} giây`;
    }

    const minutes = Math.ceil(seconds / 60);

    if (minutes < 60) {
        return `${minutes} phút`;
    }

    const hours = Math.ceil(minutes / 60);

    return `${hours} giờ`;
}

// ===============================
// DISCORD CLIENT
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ===============================
// SLASH COMMANDS
// ===============================

const commands = [

    new SlashCommandBuilder()
        .setName("tuvi")
        .setDescription("Xem thông tin tu vi của bản thân"),

    new SlashCommandBuilder()
        .setName("luyentap")
        .setDescription("Tu luyện để tăng tu vi"),

    new SlashCommandBuilder()
        .setName("dotpha")
        .setDescription("Đột phá cảnh giới"),

    new SlashCommandBuilder()
        .setName("tui")
        .setDescription("Xem túi đồ và đan dược"),

    new SlashCommandBuilder()
        .setName("top")
        .setDescription("Xem bảng xếp hạng tu vi"),

    new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Nhận linh thạch mỗi ngày"),

    new SlashCommandBuilder()
        .setName("trogiup")
        .setDescription("Xem toàn bộ lệnh tu tiên")

].map(command => command.toJSON());

// ===============================
// REGISTER COMMANDS
// ===============================

async function registerCommands() {

    if (!CLIENT_ID) {
        console.log("❌ Thiếu CLIENT_ID");
        return;
    }

    const rest = new REST({
        version: "10"
    }).setToken(TOKEN);

    try {

        console.log("🔄 Đang đăng ký slash commands...");

        if (GUILD_ID) {

            await rest.put(
                Routes.applicationGuildCommands(
                    CLIENT_ID,
                    GUILD_ID
                ),
                {
                    body: commands
                }
            );

            console.log("✅ Đã đăng ký lệnh cho server.");

        } else {

            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                {
                    body: commands
                }
            );

            console.log("✅ Đã đăng ký lệnh toàn hệ thống.");

        }

    } catch (error) {
        console.error("❌ Không thể đăng ký commands:", error);
    }
}

// ===============================
// READY
// ===============================

client.once("ready", () => {

    console.log(`================================`);
    console.log(`☯ HỒNG HOANG ĐẠI LỤC`);
    console.log(`☯ Bot: ${client.user.tag}`);
    console.log(`☯ Trạng thái: ONLINE`);
    console.log(`================================`);

    client.user.setActivity("Hồng Hoang Đại Lục", {
        type: 0
    });
});

// ===============================
// INTERACTION
// ===============================

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const user = createUser(interaction.user);

    // ===========================
    // TU VI
    // ===========================

    if (interaction.commandName === "tuvi") {

        const realm = getRealm(user);

        const embed = new EmbedBuilder()
            .setTitle("☯ Hồ Sơ Tu Tiên")
            .setDescription(
                `**${interaction.user.username}**\n\n` +
                `🌌 **Cảnh giới:** ${realm.name}\n` +
                `✨ **Tu vi:** ${formatNumber(user.cultivation)}\n` +
                `💎 **Linh thạch:** ${formatNumber(user.spiritStones)}\n\n` +
                `📈 **Tiến độ đột phá:**\n${getProgress(user)}\n\n` +
                `⚡ **Số lần đột phá:** ${user.breakthroughs}\n` +
                `🧘 **Số lần tu luyện:** ${user.totalCultivate}`
            )
            .setColor(0x7b2cff)
            .setFooter({
                text: "Hồng Hoang Đại Lục"
            });

        await interaction.reply({
            embeds: [embed]
        });

        return;
    }

    // ===========================
    // LUYỆN TẬP
    // ===========================

    if (interaction.commandName === "luyentap") {

        const cooldown = 60 * 1000;

        const remaining = cooldownRemaining(
            user.lastCultivate,
            cooldown
        );

        if (remaining > 0) {

            await interaction.reply(
                `⏳ **Đạo hữu cần tĩnh tâm!**\n` +
                `Hãy chờ **${formatTime(remaining)}** rồi tiếp tục tu luyện.`
            );

            return;
        }

        const realm = getRealm(user);

        let gain = Math.floor(
            Math.random() * 201
        ) + 100;

        gain += user.realm * 100;

        user.cultivation += gain;
        user.totalCultivate++;
        user.lastCultivate = Date.now();

        // Thưởng linh thạch
        const stones = Math.floor(
            Math.random() * 101
        ) + 50;

        user.spiritStones += stones;

        saveData();

        await interaction.reply(
            `🧘 **Tu luyện thành công!**\n\n` +
            `🌌 Cảnh giới: **${realm.name}**\n` +
            `✨ Tu vi nhận được: **+${formatNumber(gain)}**\n` +
            `💎 Linh thạch nhận được: **+${formatNumber(stones)}**\n\n` +
            `📈 Tu vi hiện tại: **${formatNumber(user.cultivation)}**`
        );

        return;
    }

    // ===========================
    // ĐỘT PHÁ
    // ===========================

    if (interaction.commandName === "dotpha") {

        if (user.realm >= realms.length - 1) {

            await interaction.reply(
                "👑 **Đạo hữu đã đạt cảnh giới Hồng Hoang Chí Tôn!**\n" +
                "Không còn cảnh giới nào cao hơn."
            );

            return;
        }

        const currentRealm = getRealm(user);
        const nextRealm = realms[user.realm + 1];

        if (user.cultivation < nextRealm.requirement) {

            const missing =
                nextRealm.requirement -
                user.cultivation;

            await interaction.reply(
                `❌ **Đột phá thất bại!**\n\n` +
                `🌌 Cảnh giới hiện tại: **${currentRealm.name}**\n` +
                `🔮 Cảnh giới tiếp theo: **${nextRealm.name}**\n\n` +
                `✨ Còn thiếu **${formatNumber(missing)} tu vi**.`
            );

            return;
        }

        // Tăng tỷ lệ nếu có đan dược
        let successRate = nextRealm.success;

        let usedPill = false;

        if (user.pills.dotPha > 0) {

            successRate += 15;

            usedPill = true;

            user.pills.dotPha--;
        }

        const roll = Math.random() * 100;

        if (roll <= successRate) {

            user.realm++;
            user.breakthroughs++;

            // Trừ một phần tu vi
            user.cultivation = Math.floor(
                user.cultivation * 0.25
            );

            saveData();

            const newRealm = getRealm(user);

            await interaction.reply(
                `⚡ **ĐỘT PHÁ THÀNH CÔNG!** ⚡\n\n` +
                `🌌 **${currentRealm.name}**\n` +
                `⬇️\n` +
                `👑 **${newRealm.name}**\n\n` +
                `🎲 Tỷ lệ thành công: **${successRate}%**\n` +
                `${usedPill ? "💊 Đã sử dụng Đột Phá Đan\n" : ""}` +
                `✨ Tu vi còn lại: **${formatNumber(user.cultivation)}**`
            );

        } else {

            // Mất tu vi khi thất bại
            const loss = Math.floor(
                user.cultivation * 0.10
            );

            user.cultivation = Math.max(
                0,
                user.cultivation - loss
            );

            saveData();

            await interaction.reply(
                `💥 **ĐỘT PHÁ THẤT BẠI!**\n\n` +
                `🌌 Cảnh giới: **${currentRealm.name}**\n` +
                `🎲 Tỷ lệ thành công: **${successRate}%**\n` +
                `💔 Tu vi tổn thất: **-${formatNumber(loss)}**\n` +
                `${usedPill ? "💊 Đột Phá Đan đã được sử dụng.\n" : ""}` +
                `✨ Tu vi hiện tại: **${formatNumber(user.cultivation)}**`
            );
        }

        return;
    }

    // ===========================
    // TÚI ĐỒ
    // ===========================

    if (interaction.commandName === "tui") {

        const embed = new EmbedBuilder()
            .setTitle("🎒 Túi Đồ Tu Tiên")
            .setDescription(
                `💎 **Linh thạch:** ${formatNumber(user.spiritStones)}\n\n` +

                `💊 **Đan dược:**\n` +
                `┠ 🔵 Tụ Linh Đan: **${user.pills.tuLinh}**\n` +
                `┠ 🟣 Đột Phá Đan: **${user.pills.dotPha}**\n` +
                `┠ 🟢 Hồi Phục Đan: **${user.pills.hoiPhuc}**\n` +
                `┗ 🔴 Bảo Mệnh Đan: **${user.pills.baoMenh}**`
            )
            .setColor(0x00bfff);

        await interaction.reply({
            embeds: [embed]
        });

        return;
    }

    // ===========================
    // TOP
    // ===========================

    if (interaction.commandName === "top") {

        const players = Object.values(db)
            .sort((a, b) => {

                if (b.realm !== a.realm) {
                    return b.realm - a.realm;
                }

                return b.cultivation - a.cultivation;

            })
            .slice(0, 10);

        if (players.length === 0) {

            await interaction.reply(
                "📜 Chưa có đạo hữu nào trên bảng xếp hạng."
            );

            return;
        }

        let text = "";

        players.forEach((player, index) => {

            const realm = getRealm(player);

            const medals = [
                "🥇",
                "🥈",
                "🥉"
            ];

            const medal =
                medals[index] ||
                `**${index + 1}.**`;

            text +=
                `${medal} <@${player.id}> — ` +
                `**${realm.name}** — ` +
                `${formatNumber(player.cultivation)} tu vi\n`;

        });

        const embed = new EmbedBuilder()
            .setTitle("🏆 BẢNG XẾP HẠNG HỒNG HOANG")
            .setDescription(text)
            .setColor(0xffd700)
            .setFooter({
                text: "Thiên Đạo ghi nhận mọi nỗ lực tu luyện."
            });

        await interaction.reply({
            embeds: [embed]
        });

        return;
    }

    // ===========================
    // DAILY
    // ===========================

    if (interaction.commandName === "daily") {

        const cooldown = 24 * 60 * 60 * 1000;

        const remaining = cooldownRemaining(
            user.lastDaily,
            cooldown
        );

        if (remaining > 0) {

            await interaction.reply(
                `⏳ **Đạo hữu đã nhận thiên đạo ban thưởng hôm nay.**\n` +
                `Hãy quay lại sau **${formatTime(remaining)}**.`
            );

            return;
        }

        const reward =
            Math.floor(Math.random() * 1001) +
            1000;

        user.spiritStones += reward;
        user.lastDaily = Date.now();

        // Có cơ hội nhận đan
        if (Math.random() < 0.25) {
            user.pills.tuLinh++;
        }

        saveData();

        await interaction.reply(
            `🎁 **Thiên Đạo ban thưởng!**\n\n` +
            `💎 Linh thạch: **+${formatNumber(reward)}**\n` +
            `💰 Tổng linh thạch: **${formatNumber(user.spiritStones)}**\n\n` +
            `☯ Hãy tiếp tục con đường tu tiên!`
        );

        return;
    }

    // ===========================
    // HELP
    // ===========================

    if (interaction.commandName === "trogiup") {

        const embed = new EmbedBuilder()
            .setTitle("☯ HỒNG HOANG ĐẠI LỤC")
            .setDescription(
                "**Hệ thống tu tiên nâng cao**\n\n" +

                "🧘 `/luyentap`\n" +
                "Tu luyện và nhận tu vi + linh thạch.\n\n" +

                "📊 `/tuvi`\n" +
                "Xem cảnh giới, tu vi và tiến độ.\n\n" +

                "⚡ `/dotpha`\n" +
                "Đột phá cảnh giới với tỷ lệ thành công.\n\n" +

                "🎒 `/tui`\n" +
                "Xem linh thạch và đan dược.\n\n" +

                "🏆 `/top`\n" +
                "Xem bảng xếp hạng tu tiên.\n\n" +

                "🎁 `/daily`\n" +
                "Nhận linh thạch mỗi ngày.\n\n" +

                "🌌 **Cảnh giới:**\n" +
                "Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Luyện Hư → Hợp Thể → Đại Thừa → Độ Kiếp → Tiên Nhân → Chân Tiên → Tiên Vương → Tiên Đế → Hồng Hoang Chí Tôn"
            )
            .setColor(0x8a2be2);

        await interaction.reply({
            embeds: [embed]
        });

        return;
    }
});

// ===============================
// ERROR HANDLING
// ===============================

process.on("unhandledRejection", error => {
    console.error("Unhandled rejection:", error);
});

process.on("uncaughtException", error => {
    console.error("Uncaught exception:", error);
});

// ===============================
// START
// ===============================

if (!TOKEN) {
    console.error("❌ Railway chưa có biến TOKEN.");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Railway chưa có biến CLIENT_ID.");
    process.exit(1);
}

registerCommands().finally(() => {

    client.login(TOKEN).catch(error => {
        console.error("❌ Không thể đăng nhập bot:", error);
    });

});
