require("dotenv").config();

const fs = require("fs");
const path = require("path");

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

// ==========================================
// LOAD COMMANDS
// ==========================================

for (const file of commandFiles) {
    try {
        delete require.cache[
            require.resolve(`./${file}`)
        ];

        const command = require(`./${file}`);

        if (
            command.data &&
            command.execute
        ) {
            commands.push(
                command.data.toJSON()
            );

            console.log(
                `✅ Đã tải /${command.data.name}`
            );
        }
    } catch (error) {
        console.error(
            `❌ Lỗi tải ${file}:`,
            error.message
        );
    }
}

// ==========================================
// KIỂM TRA ENV
// ==========================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
    console.error("❌ Không tìm thấy TOKEN!");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Không tìm thấy CLIENT_ID!");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("❌ Không tìm thấy GUILD_ID!");
    process.exit(1);
}

// ==========================================
// THÔNG TIN
// ==========================================

console.log("");
console.log("======================================");
console.log(`📦 Tổng số command: ${commands.length}`);
console.log("======================================");

console.log(`🏠 Guild ID: ${GUILD_ID}`);
console.log(`🤖 Client ID: ${CLIENT_ID}`);

console.log("");
console.log("📡 Đang kết nối Discord API...");

// ==========================================
// DEPLOY COMMANDS
// ==========================================

async function deployCommands() {
    const url =
        `https://discord.com/api/v10` +
        `/applications/${CLIENT_ID}` +
        `/guilds/${GUILD_ID}/commands`;

    console.log("");
    console.log(
        "📤 Đang gửi command lên Discord..."
    );

    console.log(
        `🔗 URL: ${url}`
    );

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            30000
        );

    try {
        const response = await fetch(
            url,
            {
                method: "PUT",

                headers: {
                    "Authorization":
                        `Bot ${TOKEN}`,

                    "Content-Type":
                        "application/json",

                    "User-Agent":
                        "HongHoangDaiLuc/1.0"
                },

                body:
                    JSON.stringify(commands),

                signal:
                    controller.signal
            }
        );

        clearTimeout(timeout);

        const body =
            await response.text();

        console.log("");
        console.log(
            `📡 Discord HTTP: ${response.status}`
        );

        console.log(
            "📄 Discord Response:"
        );

        console.log(body);

        if (!response.ok) {
            console.error("");
            console.error(
                `❌ Đăng command thất bại! HTTP ${response.status}`
            );

            process.exit(1);
        }

        console.log("");
        console.log(
            `✅ ĐÃ ĐĂNG THÀNH CÔNG ${commands.length} COMMAND!`
        );

        console.log(
            "🎉 Hoàn tất!"
        );

    } catch (error) {

        clearTimeout(timeout);

        console.error("");
        console.error(
            "❌ LỖI KẾT NỐI DISCORD:"
        );

        console.error(
            error.message
        );

        if (
            error.name ===
            "AbortError"
        ) {
            console.error(
                "⏰ Discord API phản hồi quá 30 giây."
            );
        }

        process.exit(1);
    }
}

// ==========================================
// START
// ==========================================

deployCommands();
