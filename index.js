require("dotenv").config();

const fs = require("fs");
const {
    Client,
    Collection,
    GatewayIntentBits,
    REST,
    Routes
} = require("discord.js");

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith(".js"))
    .filter(file => !["index.js", "deploy-commands.js", "database.js"].includes(file));

for (const file of commandFiles) {
    try {
        const command = require(`./${file}`);

        if (command.data && command.execute) {
            client.commands.set(command.data.name, command);
            console.log(`✅ Đã tải /${command.data.name}`);
        }
    } catch (error) {
        console.error(`❌ Lỗi tải ${file}:`, error);
    }
}

client.once("ready", async () => {
    console.log("====================================");
    console.log("🌌 HỒNG HOANG ĐẠI LỤC");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`📜 Số lệnh: ${client.commands.size}`);
    console.log("====================================");

    try {
        const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: [...client.commands.values()].map(c => c.data.toJSON()) }
        );

        console.log("✅ Đã đồng bộ slash commands.");
    } catch (error) {
        console.error("❌ Không thể đăng ký slash commands:", error);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        return interaction.reply({
            content: "❌ Lệnh này chưa được tải.",
            ephemeral: true
        });
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`❌ Lỗi /${interaction.commandName}:`, error);

        const message = {
            content: "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
            ephemeral: true
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(message).catch(() => {});
        } else {
            await interaction.reply(message).catch(() => {});
        }
    }
});

client.login(process.env.TOKEN);
