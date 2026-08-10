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

const commandsPath = path.join(__dirname, "commands");

function loadCommands(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {

        const filePath = path.join(dir, file);

        if (fs.statSync(filePath).isDirectory()) {
            loadCommands(filePath);
            continue;
        }

        if (!file.endsWith(".js")) continue;

        try {

            const command = require(filePath);

            if (
                command.data &&
                command.execute
            ) {

                client.commands.set(
                    command.data.name,
                    command
                );

                console.log(
                    `✅ Loaded: /${command.data.name}`
                );

            } else {

                console.log(
                    `⚠️ Bỏ qua: ${file}`
                );

            }

        } catch (error) {

            console.error(
                `❌ Lỗi file ${file}:`
            );

            console.error(error);

        }
    }
}

loadCommands(commandsPath);

// ==========================
// BOT READY
// ==========================

client.once("ready", () => {

    console.log("");
    console.log("================================");
    console.log("🌌 HỒNG HOANG APP ĐÃ GIÁNG LÂM");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`📜 Commands: ${client.commands.size}`);
    console.log("================================");
    console.log("");

});

// ==========================
// INTERACTION
// ==========================

client.on(
    "interactionCreate",
    async interaction => {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        console.log(
            `📥 Nhận lệnh: /${interaction.commandName}`
        );

        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command) {

            console.log(
                `❌ Không tìm thấy command: ${interaction.commandName}`
            );

            if (!interaction.replied) {

                await interaction.reply({
                    content:
                        "❌ Lệnh này chưa được tải vào bot.",
                    ephemeral: true
                });

            }

            return;
        }

        try {

            await command.execute(
                interaction
            );

            console.log(
                `✅ Hoàn thành: /${interaction.commandName}`
            );

        } catch (error) {

            console.error("");
            console.error(
                `❌ LỖI /${interaction.commandName}`
            );
            console.error(error);
            console.error("");

            try {

                if (
                    interaction.replied ||
                    interaction.deferred
                ) {

                    await interaction.editReply({
                        content:
                            "❌ Bot gặp lỗi khi xử lý lệnh."
                    });

                } else {

                    await interaction.reply({
                        content:
                            "❌ Bot gặp lỗi khi xử lý lệnh.",
                        ephemeral: true
                    });

                }

            } catch (replyError) {

                console.error(
                    "❌ Không thể trả lời interaction:"
                );

                console.error(replyError);

            }
        }
    }
);

// ==========================
// LOGIN
// ==========================

client.login(process.env.TOKEN)
    .then(() => {
        console.log("🔑 Đang đăng nhập Discord...");
    })
    .catch(error => {

        console.error(
            "❌ TOKEN KHÔNG HỢP LỆ HOẶC KHÔNG THỂ ĐĂNG NHẬP"
        );

        console.error(error);

    });
