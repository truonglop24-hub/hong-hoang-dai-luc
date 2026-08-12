require("dotenv").config();

const fs = require("fs");
const path = require("path");
const {
    Client,
    GatewayIntentBits
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
// LOAD COMMAND
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

for (const file of commandFiles) {

    try {

        const filePath = path.join(__dirname, file);

        delete require.cache[
            require.resolve(filePath)
        ];

        const command = require(filePath);

        if (
            command &&
            command.data &&
            command.execute
        ) {

            commands.push(
                command.data.toJSON()
            );

            console.log(
                `✅ Đã tải /${command.data.name}`
            );

        } else {

            console.log(
                `⚠️ Bỏ qua ${file}`
            );
        }

    } catch (error) {

        console.error(
            `❌ Lỗi tải ${file}:`
        );

        console.error(error);
    }
}

console.log("");
console.log(
    `📦 Tổng số command: ${commands.length}`
);

// ==========================================
// DISCORD CLIENT
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ==========================================
// KHI BOT READY
// ==========================================

client.once("ready", async () => {

    try {

        console.log("");
        console.log("🟢 Bot đã kết nối Discord.");
        console.log("📜 Đang đăng ký slash commands...");

        const guild =
            await client.guilds.fetch(GUILD_ID);

        console.log(
            `🏠 Server: ${guild.name}`
        );

        // Đăng ký trực tiếp vào server
        await guild.commands.set(commands);

        console.log("");
        console.log(
            `✅ Đã đăng ký ${commands.length} lệnh!`
        );

        console.log(
            "🎉 Hoàn tất. Có thể kiểm tra Discord."
        );

        await client.destroy();

        process.exit(0);

    } catch (error) {

        console.error("");
        console.error(
            "❌ LỖI KHI ĐĂNG KÝ COMMAND"
        );

        console.error(
            "Tên lỗi:",
            error.name
        );

        console.error(
            "Mã lỗi:",
            error.code
        );

        console.error(
            "Thông báo:",
            error.message
        );

        console.error(error);

        await client.destroy();

        process.exit(1);
    }
});

// ==========================================
// LOGIN
// ==========================================

console.log("🔌 Đang kết nối Discord...");

client.login(TOKEN).catch(error => {

    console.error(
        "❌ Không thể đăng nhập Discord:"
    );

    console.error(error);

    process.exit(1);
});
