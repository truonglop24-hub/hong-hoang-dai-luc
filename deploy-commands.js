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
    .filter(file =>
        ![
            "index.js",
            "deploy-commands.js",
            "database.js"
        ].includes(file)
    );

const commands = [];
const commandNames = new Set();

for (const file of commandFiles) {

    try {
        const filePath = path.join(__dirname, file);

        delete require.cache[
            require.resolve(filePath)
        ];

        const command = require(filePath);

        if (
            !command ||
            !command.data ||
            !command.execute
        ) {
            console.log(
                `⚠️ Bỏ qua ${file}: không phải Slash Command.`
            );
            continue;
        }

        const name = command.data.name;

        // Kiểm tra command trùng tên
        if (commandNames.has(name)) {
            console.warn(
                `⚠️ Trùng tên /${name}: bỏ qua file ${file}`
            );
            continue;
        }

        commandNames.add(name);

        commands.push(
            command.data.toJSON()
        );

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
// REGISTER COMMANDS
// ==========================================

const rest = new REST({
    version: "10"
}).setToken(TOKEN);

async function deployCommands() {

    try {

        console.log("");
        console.log("🔄 Đang đăng ký Slash Commands...");
        console.log(`🏠 Guild ID: ${GUILD_ID}`);
        console.log(`🤖 Client ID: ${CLIENT_ID}`);

        await rest.put(
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
        console.log(`📜 Đã đăng ký: ${commands.length} lệnh`);
        console.log("====================================");
        console.log("🎉 Có thể mở Discord kiểm tra lệnh.");

    } catch (error) {

        console.error("");
        console.error("====================================");
        console.error("❌ ĐĂNG KÝ COMMAND THẤT BẠI");
        console.error("====================================");

        console.error("Tên lỗi:", error.name);
        console.error("Mã lỗi:", error.code);
        console.error("Thông báo:", error.message);

        console.error("");
        console.error(error);

        process.exit(1);
    }
}

deployCommands();
