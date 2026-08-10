require("dotenv").config();

const {
    REST,
    Routes
} = require("discord.js");

const commands = [];

const commandFiles = [
    "batdau.js",
    "tuvi.js",
    "tuluyen.js"
];

for (const file of commandFiles) {

    try {

        const command = require(`./${file}`);

        if (command.data) {
            commands.push(
                command.data.toJSON()
            );
        }

    } catch (error) {

        console.error(
            `❌ Lỗi tải ${file}:`,
            error
        );

    }
}

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
            `✅ Đã đăng ký ${commands.length} lệnh!`
        );

    } catch (error) {

        console.error(error);

    }

})();
