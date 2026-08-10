require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const commands = [];

function loadCommands(dir) {

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const fullPath = path.join(dir, file);

        if (fs.statSync(fullPath).isDirectory()) {
            loadCommands(fullPath);
            continue;
        }

        if (!file.endsWith(".js")) continue;

        const command = require(fullPath);

        if (command.data) {
            commands.push(command.data.toJSON());
        }
    }
}

loadCommands(
    path.join(__dirname, "commands")
);

const rest = new REST({
    version: "10"
}).setToken(process.env.TOKEN);

(async () => {

    try {

        console.log("📜 Đang đăng ký lệnh...");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            {
                body: commands
            }
        );

        console.log(
            "✅ Đã đăng ký lệnh cho server!"
        );

    } catch (error) {

        console.error(error);

    }

})();
