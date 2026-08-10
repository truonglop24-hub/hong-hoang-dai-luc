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

    // =========================
    // XỬ LÝ NÚT MENU
    // =========================
    if (interaction.isButton()) {

        const buttonCommands = {

            // Hàng 1
            "menu_tuluyen": "tuluyen",
            "menu_dotpha": "dotpha",
            "menu_tuhanh": "tuhanh",

            // Hàng 2
            "menu_nghenghiep": "nghenghiep",
            "menu_chiendau": "chiendau",
            "menu_donghanh": "donghanh",
            "menu_phithang": "phithang",

            // Hàng 3
            "menu_tongmon": "tongmon",
            "menu_pvp": "pvp",
            "menu_thienkiep": "thienkiep",

            // Hàng 4
            "menu_sugia": "sugia",
            "menu_dongphu": "dongphu",
            "menu_xephang": "xephang",
            "menu_khac": "khac",

            // Hàng 5
            "menu_giaodich": "giaodich",
            "menu_khodo": "khodo"
        };

        // Nút Đóng
        if (interaction.customId === "menu_dong") {
            return interaction.update({
                content: "🔒 **Menu đã được đóng.**",
                embeds: [],
                components: []
            });
        }

        const commandName = buttonCommands[interaction.customId];

        if (!commandName) {
            return interaction.reply({
                content: "❌ Không tìm thấy chức năng của nút này.",
                ephemeral: true
            });
        }

        const command = client.commands.get(commandName);

        if (!command) {
            return interaction.reply({
                content:
                    `❌ Lệnh \`/${commandName}\` chưa được cài đặt.\n` +
                    `Hãy tạo file \`${commandName}.js\` trong thư mục commands.`,
                ephemeral: true
            });
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`❌ Lỗi nút ${interaction.customId}:`, error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "❌ Đã xảy ra lỗi khi thực hiện chức năng.",
                    ephemeral: true
                }).catch(() => {});
            } else {
                await interaction.reply({
                    content: "❌ Đã xảy ra lỗi khi thực hiện chức năng.",
                    ephemeral: true
                }).catch(() => {});
            }
        }

        return;
    }


    // =========================
    // XỬ LÝ SLASH COMMAND
    // =========================
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

        console.error(
            `❌ Lỗi /${interaction.commandName}:`,
            error
        );

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
