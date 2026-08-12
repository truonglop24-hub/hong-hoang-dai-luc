require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
    REST,
    Routes
} = require("discord.js");

// ==========================================
// ENV
// ==========================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
    console.error("❌ Thiếu TOKEN trong Variables.");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Thiếu CLIENT_ID trong Variables.");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("❌ Thiếu GUILD_ID trong Variables.");
    process.exit(1);
}

// ==========================================
// LOAD COMMANDS
// ==========================================

const commandFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith(".js"))
    .filter(file => ![
        "index.js",
        "deploy-commands.js",
        "database.js"
    ].includes(file));

const commands = [];
const commandNames = new Set();

for (const file of commandFiles) {
    try {
        const filePath = path.join(__dirname, file);

        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        if (
            !command ||
            !command.data ||
            !command.execute
        ) {
            console.log(`⚠️ Bỏ qua ${file}`);
            continue;
        }

        const name = command.data.name;

        if (commandNames.has(name)) {
            console.warn(`⚠️ Trùng tên /${name}: bỏ qua ${file}`);
            continue;
        }

        commandNames.add(name);

        commands.push(command.data.toJSON());

        console.log(`✅ Đã tải /${name}`);

    } catch (error) {
        console.error(`❌ Lỗi tải ${file}:`);
        console.error(error);
    }
}

// ==========================================
// THỐNG KÊ
// ==========================================

console.log("");
console.log("====================================");
console.log(`📦 Tổng số command: ${commands.length}`);
console.log("====================================");

// ==========================================
// DISCORD REST
// ==========================================

const rest = new REST({
    version: "10",
    timeout: 30000
}).setToken(TOKEN);

// ==========================================
// DEPLOY
// ==========================================

async function deployCommands() {
    try {
        console.log("");
        console.log("🔄 Đang kết nối Discord API...");

        console.log(`🏠 Guild ID: ${GUILD_ID}`);
        console.log(`🤖 Client ID: ${CLIENT_ID}`);

        console.log("");
        console.log("📤 Đang gửi ${commands.length} command lên Discord...");

        const result = await rest.put(
            Routes.applicationGuildCommands(
                CLIENT_ID,
                GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log("");
        console.log("====================================");
        console.log("✅ ĐĂNG KÝ COMMAND THÀNH CÔNG");
        console.log("====================================");
        console.log(`📜 Discord đã nhận: ${result.length} command`);
        console.log("🎉 Kiểm tra Discord ngay.");

        process.exit(0);

    } catch (error) {
        console.log("");
        console.log("====================================");
        console.log("❌ ĐĂNG KÝ COMMAND THẤT BẠI");
        console.log("====================================");

        console.error("Tên lỗi:", error?.name);
        console.error("Mã lỗi:", error?.code);
        console.error("HTTP:", error?.status);
        console.error("Thông báo:", error?.message);

        if (error?.rawError) {
            console.error("Discord Raw Error:");
            console.error(error.rawError);
        }

        console.error("");
        console.error(error);

        process.exit(1);
    }
}

deployCommands();
