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
            const name = command.data.name;

            // Không cho 2 file dùng trùng tên slash command.
            if (client.commands.has(name)) {
                console.warn(`⚠️ Trùng tên /${name}: bỏ qua ${file}`);
                continue;
            }

            client.commands.set(name, command);
            console.log(`✅ Đã tải /${name}`);
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
            {
                body: [...client.commands.values()].map(command =>
                    command.data.toJSON()
                )
            }
        );

        console.log("✅ Đã đồng bộ slash commands.");
    } catch (error) {
        console.error("❌ Không thể đăng ký slash commands:", error);
    }
});

client.on("interactionCreate", async interaction => {
    try {
        // =========================
        // MENU / BUTTON / SELECT
        // =========================
        if (
            interaction.isButton() ||
            interaction.isStringSelectMenu() ||
            interaction.isUserSelectMenu()
        ) {
            const customId = interaction.customId;

            // Menu Hồng Hoang xử lý toàn bộ button/select của menu.
            if (
                customId.startsWith("menu_") ||
                customId.startsWith("pvp_")
            ) {
                const menu = client.commands.get("menu");

                if (menu?.handleComponent) {
                    return await menu.handleComponent(interaction);
                }

                return interaction.reply({
                    content: "❌ Không tải được hệ thống Menu.",
                    ephemeral: true
                });
            }

            // Admin dùng String Select Menu riêng.
            if (customId === "admin_user_select" || customId === "admin_select") {
                const admin = client.commands.get("admin");

                if (admin?.handleSelect) {
                    return await admin.handleSelect(interaction);
                }

                return interaction.reply({
                    content: "❌ Không tải được Admin Panel.",
                    ephemeral: true
                });
            }
        }

        // =========================
        // MODAL
        // =========================
        if (interaction.isModalSubmit()) {
            const admin = client.commands.get("admin");

            if (
                interaction.customId.startsWith("admin_modal_") &&
                admin?.handleModal
            ) {
                return await admin.handleModal(interaction);
            }

            return interaction.reply({
                content: "❌ Không tìm thấy chức năng Modal.",
                ephemeral: true
            });
        }

        // =========================
        // SLASH COMMAND
        // =========================
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            return interaction.reply({
                content: "❌ Lệnh này chưa được tải.",
                ephemeral: true
            });
        }

        await command.execute(interaction);

    } catch (error) {
        console.error(
            `❌ Lỗi interaction ${interaction.commandName || interaction.customId || ""}:`,
            error
        );

        const message = {
            content: "❌ Đã xảy ra lỗi khi thực hiện chức năng.",
            ephemeral: true
        };

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(message);
            } else {
                await interaction.reply(message);
            }
        } catch {}
    }
});

client.login(process.env.TOKEN);
