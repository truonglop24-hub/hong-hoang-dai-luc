require("dotenv").config();

const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");

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

        if (!command.data || !command.execute) continue;

        client.commands.set(
            command.data.name,
            command
        );
    }
}

loadCommands(commandsPath);

client.once("ready", () => {

    console.log(
        `🌌 ${client.user.tag} đã giáng lâm Hồng Hoang!`
    );

});

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    const command =
        client.commands.get(interaction.commandName);

    if (!command) return;

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(error);

        if (interaction.replied || interaction.deferred) {

            await interaction.followUp(
                "❌ Hệ thống Hồng Hoang gặp lỗi."
            );

        } else {

            await interaction.reply(
                "❌ Hệ thống Hồng Hoang gặp lỗi."
            );

        }
    }
});

client.login(process.env.TOKEN);
