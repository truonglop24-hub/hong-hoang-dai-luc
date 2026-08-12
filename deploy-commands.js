require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ Thiếu TOKEN / CLIENT_ID / GUILD_ID trong Variables!");
    process.exit(1);
}

// ===============================
// LOAD COMMANDS
// ===============================

const commands = [];

const files = fs
    .readdirSync(__dirname)
    .filter(file =>
        file.endsWith(".js") &&
        file !== "deploy-commands.js"
    );

for (const file of files) {
    try {
        const filePath = path.join(__dirname, file);
        const command = require(filePath);

        if (!command?.data) continue;

        if (typeof command.data.toJSON === "function") {
            commands.push(command.data.toJSON());
        } else {
            commands.push(command.data);
        }

        console.log(`✅ Đã tải /${command.data.name}`);
    } catch (err) {
        console.log(`⚠️ Bỏ qua ${file}: ${err.message}`);
    }
}

console.log("");
console.log("=================================");
console.log(`📦 Tổng số command: ${commands.length}`);
console.log("=================================");

// ===============================
// REST
// ===============================

const rest = new REST({
    version: "10",
    timeout: 30000,
    userAgentAppendix: "HongHoangDaiLuc/1.0"
}).setToken(TOKEN);

// ===============================
// SO SÁNH COMMAND
// ===============================

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

    const oldMap = new Map(
        oldCommands.map(c => [
            c.name,
            JSON.stringify(normalizeCommand(c))
        ])
    );

    for (const command of newCommands) {

        const oldCommand = oldMap.get(command.name);

        if (!oldCommand) {
            return false;
        }

        const newCommand = JSON.stringify(
            normalizeCommand(command)
        );

        if (oldCommand !== newCommand) {
            return false;
        }
    }

    return true;
}

// ===============================
// DEPLOY
// ===============================

async function deployCommands() {

    try {

        console.log("");
        console.log("📡 Đang kết nối Discord API...");
        console.log(`🏠 Guild ID: ${GUILD_ID}`);
        console.log(`🤖 Client ID: ${CLIENT_ID}`);

        const route = Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        );

        // ===============================
        // LẤY COMMAND HIỆN TẠI
        // ===============================

        console.log("");
        console.log("🔍 Đang kiểm tra command hiện tại...");

        const currentCommands = await rest.get(route);

        console.log(
            `📋 Discord đang có ${currentCommands.length} command`
        );

        // ===============================
        // KHÔNG CÓ THAY ĐỔI
        // ===============================

        if (commandsAreSame(currentCommands, commands)) {

            console.log("");
            console.log("✅ Command đã giống với code hiện tại.");
            console.log("⏭️ Không cần deploy lại.");
            console.log("🎉 Hoàn tất!");

            return;
        }

        // ===============================
        // CÓ THAY ĐỔI
        // ===============================

        console.log("");
        console.log("🔄 Phát hiện command thay đổi.");
        console.log("📤 Đang cập nhật command lên Discord...");

        const result = await rest.put(
            route,
            {
                body: commands
            }
        );

        console.log("");
        console.log("=================================");
        console.log(`✅ Deploy thành công: ${result.length} command`);
        console.log("=================================");

    } catch (error) {

        console.log("");
        console.log("❌ DEPLOY COMMAND THẤT BẠI");

        if (error.status) {
            console.log(`HTTP: ${error.status}`);
        }

        if (error.code) {
            console.log(`Discord Code: ${error.code}`);
        }

        if (error.rawError) {
            console.log(
                "Discord Response:",
                JSON.stringify(error.rawError, null, 2)
            );
        }

        console.log("Chi tiết:", error.message);

        if (error.rawError?.retry_after) {
            console.log(
                `⏳ Hãy chờ khoảng ${Math.ceil(error.rawError.retry_after)} giây rồi thử lại.`
            );
        }
    }
}

deployCommands();
