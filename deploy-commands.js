require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

// ==========================================
// KIỂM TRA ENV
// ==========================================

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN) {
    console.error("❌ Không tìm thấy TOKEN trong Variables.");
    process.exit(1);
}

if (!CLIENT_ID) {
    console.error("❌ Không tìm thấy CLIENT_ID trong Variables.");
    process.exit(1);
}

if (!GUILD_ID) {
    console.error("❌ Không tìm thấy GUILD_ID trong Variables.");
    process.exit(1);
}

console.log("✅ TOKEN: OK");
console.log("✅ CLIENT_ID:", CLIENT_ID);
console.log("✅ GUILD_ID:", GUILD_ID);

// ==========================================
// ĐỌC COMMAND
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

        delete require.cache[require.resolve(filePath)];

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
                `⚠️ Bỏ qua ${file} - không có data/execute`
            );
        }

    } catch (error) {

        console.error(
            `❌ Lỗi tải ${file}:`
        );

        console.error(error);
    }
}

// ==========================================
// KIỂM TRA COMMAND
// ==========================================

console.log("");
console.log(
    `📦 Tổng số command: ${commands.length}`
);

if (commands.length === 0) {

    console.error(
        "❌ Không có command nào để đăng ký."
    );

    process.exit(1);
}

// ==========================================
// REST DISCORD
// ==========================================

const rest = new REST({
    version: "10",
    timeout: 20000
}).setToken(TOKEN);

// ==========================================
// ĐĂNG KÝ
// ==========================================

(async () => {

    try {

        console.log("");
        console.log("📜 Đang đăng ký lệnh...");
        console.log(
            `🌐 Guild: ${GUILD_ID}`
        );

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
        console.log(
            `✅ Đã đăng ký ${result.length} lệnh.`
        );

        console.log(
            "🎉 Hoàn tất! Kiểm tra Discord."
        );

        process.exit(0);

    } catch (error) {

        console.error("");
        console.error(
            "❌ LỖI ĐĂNG KÝ SLASH COMMAND"
        );

        console.error(
            "Tên lỗi:",
            error.name
        );

        console.error(
            "Thông báo:",
            error.message
        );

        if (error.status) {
            console.error(
                "HTTP Status:",
                error.status
            );
        }

        if (error.code) {
            console.error(
                "Discord Error Code:",
                error.code
            );
        }

        console.error(
            "Chi tiết:",
            error
        );

        process.exit(1);
    }

})();
