require("dotenv").config();

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ Thiếu TOKEN / CLIENT_ID / GUILD_ID trong Railway Variables!");
    process.exit(1);
}

// ==========================================
// QUÉT TẤT CẢ FILE COMMAND
// ==========================================

const commands = [];
const loadedNames = [];
const failedFiles = [];

const files = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith(".js"))
    .filter(file =>
        ![
            "index.js",
            "deploy-commands.js",
            "database.js"
        ].includes(file)
    );

console.log("=================================");
console.log("🔎 ĐANG QUÉT COMMAND");
console.log("=================================");

for (const file of files) {
    try {
        const filePath = path.join(__dirname, file);

        delete require.cache[require.resolve(filePath)];

        const command = require(filePath);

        // Không phải Slash Command
        if (
            !command ||
            !command.data ||
            typeof command.data.toJSON !== "function"
        ) {
            console.log(`⚪ ${file} → bỏ qua`);
            continue;
        }

        const json = command.data.toJSON();

        if (!json.name) {
            console.log(`❌ ${file} → không có tên command`);
            failedFiles.push(file);
            continue;
        }

        // Chống trùng tên command
        if (commands.some(cmd => cmd.name === json.name)) {
            console.log(`⚠️ ${file} → trùng /${json.name}, bỏ qua`);
            failedFiles.push(file);
            continue;
        }

        commands.push(json);
        loadedNames.push(json.name);

        console.log(`✅ /${json.name} ← ${file}`);

    } catch (error) {
        console.error(`❌ LỖI FILE ${file}:`);
        console.error(error.message);
        failedFiles.push(file);
    }
}

// ==========================================
// HIỂN THỊ COMMAND TÌM ĐƯỢC
// ==========================================

console.log("");
console.log("=================================");
console.log(`📦 COMMAND TRONG CODE: ${commands.length}`);
console.log("=================================");

for (const name of loadedNames) {
    console.log(`   /${name}`);
}

if (commands.length === 0) {
    console.error("");
    console.error("❌ KHÔNG TÌM THẤY COMMAND NÀO!");
    process.exit(1);
}

// ==========================================
// GỌI DISCORD API
// ==========================================

async function discordRequest(method, url, body = null) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 30000);

    try {

        const options = {
            method: method,

            headers: {
                "Authorization": `Bot ${TOKEN}`,
                "Content-Type": "application/json"
            },

            signal: controller.signal
        };

        if (body !== null) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        const text = await response.text();

        let data;

        try {
            data = text ? JSON.parse(text) : null;
        } catch {
            data = text;
        }

        if (!response.ok) {

            const error = new Error(
                `Discord API HTTP ${response.status}: ` +
                `${typeof data === "string"
                    ? data
                    : JSON.stringify(data)}`
            );

            error.status = response.status;
            error.data = data;

            throw error;
        }

        return data;

    } finally {

        clearTimeout(timeout);

    }
}

// ==========================================
// DEPLOY
// ==========================================

async function deploy() {

    const route =
        `https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`;

    try {

        console.log("");
        console.log("=================================");
        console.log("📡 KIỂM TRA COMMAND TRÊN DISCORD");
        console.log("=================================");

        const oldCommands =
            await discordRequest("GET", route);

        console.log(
            `📋 Discord hiện có: ${oldCommands.length}`
        );

        if (oldCommands.length > 0) {

            console.log("📜 Command hiện tại:");

            for (const command of oldCommands) {
                console.log(`   /${command.name}`);
            }

        }

        // ==================================
        // GHI COMMAND
        // ==================================

        console.log("");
        console.log("=================================");
        console.log("📤 ĐANG GHI COMMAND MỚI");
        console.log("=================================");

        console.log(
            `📦 Đang gửi ${commands.length} command lên Discord...`
        );

        const result =
            await discordRequest(
                "PUT",
                route,
                commands
            );

        // ==================================
        // THÀNH CÔNG
        // ==================================

        console.log("");
        console.log("=================================");
        console.log(
            `✅ DISCORD ĐÃ NHẬN: ${result.length} COMMAND`
        );
        console.log("=================================");

        for (const command of result) {
            console.log(`   ✅ /${command.name}`);
        }

        console.log("");
        console.log("🎉 ĐĂNG KÝ COMMAND HOÀN TẤT!");
        console.log("👉 Vào Discord → gõ / để kiểm tra.");

        // ==================================
        // FILE LỖI
        // ==================================

        if (failedFiles.length > 0) {

            console.log("");
            console.log("⚠️ FILE BỊ BỎ QUA / LỖI:");

            for (const file of failedFiles) {
                console.log(`   ${file}`);
            }

        }

        process.exit(0);

    } catch (error) {

        console.error("");
        console.error("=================================");
        console.error("❌ DEPLOY COMMAND THẤT BẠI");
        console.error("=================================");

        console.error(error.message);

        if (error.status) {
            console.error(`HTTP: ${error.status}`);
        }

        console.error("");

        if (error.name === "AbortError") {
            console.error(
                "⏱️ Discord API không phản hồi trong 30 giây."
            );
        }

        if (error.status === 401) {
            console.error(
                "🔑 TOKEN sai hoặc TOKEN không hợp lệ."
            );
        }

        if (error.status === 403) {
            console.error(
                "🚫 Bot không có quyền phù hợp."
            );
        }

        if (error.status === 400) {
            console.error(
                "⚠️ Có ít nhất một command bị sai cấu trúc."
            );
        }

        process.exit(1);
    }
}

// ==========================================
// CHẠY
// ==========================================

deploy();
