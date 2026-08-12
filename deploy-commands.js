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
// QUÉT COMMAND
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

        // Không phải slash command
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

        // Chống trùng tên
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
// KIỂM TRA
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
// DISCORD REQUEST
// ==========================================

async function discordRequest(method, url, body = null) {

    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 30000);

    try {

        const options = {
            method,

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
// SO SÁNH COMMAND
// ==========================================

function normalizeCommand(command) {

    return {
        name: command.name,
        description: command.description || "",
        options: command.options || [],
        type: command.type || 1,
        default_member_permissions:
            command.default_member_permissions ?? null,
        dm_permission:
            command.dm_permission ?? true,
        nsfw:
            command.nsfw ?? false
    };

}

function commandsAreSame(oldCommands, newCommands) {

    if (oldCommands.length !== newCommands.length) {
        return false;
    }

    const oldNormalized = oldCommands
        .map(normalizeCommand)
        .sort((a, b) => a.name.localeCompare(b.name));

    const newNormalized = newCommands
        .map(normalizeCommand)
        .sort((a, b) => a.name.localeCompare(b.name));

    return JSON.stringify(oldNormalized) ===
           JSON.stringify(newNormalized);
}

// ==========================================
// DEPLOY
// ==========================================

async function deploy() {

    const route =
        `https://discord.com/api/v10/applications/${CLIENT_ID}/guilds/${GUILD_ID}/commands`;

    try {

        // ==================================
        // LẤY COMMAND HIỆN TẠI
        // ==================================

        console.log("");
        console.log("=================================");
        console.log("🔎 KIỂM TRA COMMAND TRÊN DISCORD");
        console.log("=================================");

        const oldCommands =
            await discordRequest("GET", route);

        console.log(
            `📋 Discord hiện có: ${oldCommands.length} command`
        );

        if (oldCommands.length > 0) {

            for (const command of oldCommands) {
                console.log(`   /${command.name}`);
            }

        }

        // ==================================
        // KIỂM TRA CÓ CẦN DEPLOY KHÔNG
        // ==================================

        if (commandsAreSame(oldCommands, commands)) {

            console.log("");
            console.log("=================================");
            console.log("✅ COMMAND ĐÃ ĐỒNG BỘ");
            console.log("=================================");

            console.log(
                `📦 Discord đã có đủ ${commands.length} command.`
            );

            console.log(
                "⏭️ Không gửi PUT → không tốn quota tạo command."
            );

            console.log("");
            console.log("🎉 KHÔNG CẦN DEPLOY LẠI!");

            process.exit(0);
        }

        // ==================================
        // COMMAND KHÁC → ĐỒNG BỘ
        // ==================================

        console.log("");
        console.log("=================================");
        console.log("🔄 PHÁT HIỆN COMMAND KHÁC");
        console.log("=================================");

        console.log(
            `📦 Code có: ${commands.length}`
        );

        console.log(
            `📋 Discord có: ${oldCommands.length}`
        );

        console.log("");
        console.log("📤 ĐANG ĐỒNG BỘ COMMAND...");
        console.log("⚠️ Chỉ thực hiện 1 lần PUT.");

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
        console.log("✅ DEPLOY THÀNH CÔNG");
        console.log("=================================");

        console.log(
            `📦 Discord đã nhận ${result.length} command`
        );

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
            console.log("=================================");
            console.log("⚠️ FILE BỊ BỎ QUA / LỖI");
            console.log("=================================");

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

        // ==================================
        // 429
        // ==================================

        if (error.status === 429) {

            console.error("");
            console.error(
                "⛔ Discord đang giới hạn tạo Application Commands."
            );

            if (error.data && error.data.retry_after) {

                const seconds =
                    Number(error.data.retry_after);

                const hours =
                    Math.floor(seconds / 3600);

                const minutes =
                    Math.floor((seconds % 3600) / 60);

                console.error(
                    `⏳ Retry sau khoảng ${hours} giờ ${minutes} phút.`
                );
            }

            console.error("");
            console.error(
                "❗ KHÔNG chạy deploy-commands.js liên tục."
            );
        }

        // ==================================
        // 401
        // ==================================

        if (error.status === 401) {
            console.error(
                "🔑 TOKEN sai hoặc TOKEN không hợp lệ."
            );
        }

        // ==================================
        // 403
        // ==================================

        if (error.status === 403) {
            console.error(
                "🚫 Bot không có quyền phù hợp."
            );
        }

        // ==================================
        // 400
        // ==================================

        if (error.status === 400) {
            console.error(
                "⚠️ Có command bị sai cấu trúc."
            );
        }

        // ==================================
        // TIMEOUT
        // ==================================

        if (error.name === "AbortError") {
            console.error(
                "⏱️ Discord API không phản hồi trong 30 giây."
            );
        }

        process.exit(1);
    }
}

// ==========================================
// CHẠY
// ==========================================

deploy();
