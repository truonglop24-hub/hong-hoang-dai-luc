require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith(".js"))
    .filter(file => !["index.js", "deploy-commands.js", "database.js"].includes(file));

const commands = [];

for (const file of commandFiles) {
    try {
        delete require.cache[require.resolve(`./${file}`)];
        const command = require(`./${file}`);

        if (command.data && command.execute) {
            commands.push(command.data.toJSON());
            console.log(`✅ Đã tải /${command.data.name}`);
        }
    } catch (error) {
        console.error(`❌ Lỗi tải ${file}:`, error);
    }
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("📜 Đang đăng ký lệnh...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log(`✅ Đã đăng ký ${commands.length} lệnh.`);
    } catch (error) {
        console.error("❌ Lỗi đăng ký lệnh:", error);
    }
})();
