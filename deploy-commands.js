require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const TOKEN = process.env.TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

if (!TOKEN || !CLIENT_ID || !GUILD_ID) {
    console.error("❌ Thiếu TOKEN / CLIENT_ID / GUILD_ID!");
    process.exit(1);
}

const commands = [];
const loadedNames = [];
const failedFiles = [];

const files = fs
    .readdirSync(__dirname)
    .filter(file =>
        file.endsWith(".js") &&
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

        if (!command || !command.data) {
            console.log(`⚪ ${file} → không có data`);
            continue;
        }

        if (typeof command.data.toJSON !== "function") {
            console.log(`❌ ${file} → data không hợp lệ`);
            failedFiles.push(file);
            continue;
        }

        const json = command.data.toJSON();

        if (!json.name) {
            console.log(`❌ ${file} → không có tên command`);
            failedFiles.push(file);
            continue;
        }

        commands.push(json);
        loadedNames.push(json.name);

        console.log(`✅ /${json.name} ← ${file}`);

    } catch (error) {
        console.error(`❌ LỖI ${file}:`);
        console.error(error.message);
        failedFiles.push(file);
    }
}

console.log("");
console.log("=================================");
console.log(`📦 COMMAND TRONG CODE: ${commands.length}`);
console.log("=================================");

console.log("📜 Danh sách:");
for (const name of loadedNames) {
    console.log(`   /${name}`);
}

if (failedFiles.length > 0) {
    console.log("");
    console.log("⚠️ FILE BỊ LỖI:");
    for (const file of failedFiles) {
        console.log(`   ${file}`);
    }
}

const rest = new REST({
    version: "10",
    timeout: 30000
}).setToken(TOKEN);

async function deploy() {
    try {
        const route = Routes.applicationGuildCommands(
            CLIENT_ID,
            GUILD_ID
        );

        console.log("");
        console.log("=================================");
        console.log("📡 ĐANG LẤY COMMAND TỪ DISCORD");
        console.log("=================================");

        const oldCommands = await rest.get(route);

        console.log(`📋 Discord hiện có: ${oldCommands.length}`);

        if (oldCommands.length > 0) {
            console.log("📜 Command hiện tại trên Discord:");

            for (const command of oldCommands) {
                console.log(`   /${command.name}`);
            }
        }

        console.log("");
        console.log("=================================");
        console.log("📤 ĐANG GHI COMMAND MỚI");
        console.log("=================================");

        const result = await rest.put(route, {
            body: commands
        });

        console.log("");
        console.log("=================================");
        console.log(`✅ DISCORD ĐÃ NHẬN: ${result.length} COMMAND`);
        console.log("=================================");

        console.log("📜 Command sau khi cập nhật:");

        for (const command of result) {
            console.log(`   ✅ /${command.name}`);
        }

        console.log("");
        console.log("🎉 ĐĂNG KÝ COMMAND HOÀN TẤT!");

    } catch (error) {
        console.error("");
        console.error("❌ DEPLOY COMMAND THẤT BẠI");

        if (error.status) {
            console.error("HTTP:", error.status);
        }

        if (error.code) {
            console.error("Discord Code:", error.code);
        }

        console.error(error.message);

        if (error.rawError) {
            console.error(
                JSON.stringify(error.rawError, null, 2)
            );
        }

        process.exit(1);
    }
}

deploy();
