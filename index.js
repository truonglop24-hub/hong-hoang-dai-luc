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

// ==========================
// LOAD COMMANDS
// ==========================
const commandFiles = fs.readdirSync(__dirname)
.filter(file => file.endsWith(".js"))
.filter(file => 
    ![
        "index.js",
        "database.js",
        "deploy-commands.js",
        "realms.js"
    ].includes(file)
);


for (const file of commandFiles) {

    const filePath = path.join(__dirname, file);

    try {

        const command = require(filePath);

        if (command.data && command.execute) {

            client.commands.set(
                command.data.name,
                command
            );

            console.log(
                `✅ Đã tải /${command.data.name}`
            );

        } else {

            console.log(
                `❌ ${file} không đúng cấu trúc command`
            );

        }

    } catch (error) {

        console.log(`❌ Không thể tải ${file}`);
        console.error(error);

    }
}

// ==========================
// READY
// ==========================

client.once("ready", () => {

    console.log("================================");
    console.log("🌌 HỒNG HOANG APP ĐÃ GIÁNG LÂM");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`📜 Số lệnh: ${client.commands.size}`);
    console.log("================================");

});

// ==========================
// INTERACTION
// ==========================

client.on("interactionCreate", async interaction => {

    if (!interaction.isChatInputCommand()) return;

    console.log(
        `📥 Nhận lệnh /${interaction.commandName}`
    );

    const command = client.commands.get(
        interaction.commandName
    );

    if (!command) {

        return interaction.reply({
            content: "❌ Lệnh này chưa được tải vào bot.",
            ephemeral: true
        });

    }

    try {

        await command.execute(interaction);

    } catch (error) {

        console.error(
            `❌ Lỗi /${interaction.commandName}:`,
            error
        );

        if (interaction.replied || interaction.deferred) {

            await interaction.editReply({
                content: "❌ Bot gặp lỗi khi xử lý lệnh."
            });

        } else {

            await interaction.reply({
                content: "❌ Bot gặp lỗi khi xử lý lệnh.",
                ephemeral: true
            });

        }
    }
});

// ==========================
// LOGIN
// ==========================

client.login(process.env.TOKEN);
