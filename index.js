require("dotenv").config();

const fs = require("fs");
const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");

// ==========================================
// KIỂM TRA ENV
// ==========================================

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
    console.error("❌ Thiếu TOKEN trong Variables.");
    process.exit(1);
}

// ==========================================
// CLIENT
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

client.commands = new Collection();

// ==========================================
// LOAD COMMANDS
// ==========================================

const commandFiles = fs
    .readdirSync(__dirname)
    .filter(file => file.endsWith(".js"))
    .filter(file =>
        ![
            "index.js",
            "deploy-commands.js",
            "database.js"
        ].includes(file)
    );

for (const file of commandFiles) {
    try {
        const command = require(`./${file}`);

        if (!command.data || !command.execute) {
            console.warn(`⚠️ Bỏ qua ${file}: không phải Slash Command.`);
            continue;
        }

        const name = command.data.name;

        // Không cho 2 file trùng tên command
        if (client.commands.has(name)) {
            console.warn(
                `⚠️ Trùng tên /${name}: bỏ qua ${file}`
            );
            continue;
        }

        client.commands.set(name, command);

        console.log(`✅ Đã tải /${name}`);
    } catch (error) {
        console.error(`❌ Lỗi tải ${file}:`);
        console.error(error);
    }
}

// ==========================================
// READY
// ==========================================

client.once("ready", () => {
    console.log("");
    console.log("====================================");
    console.log("🌌 HỒNG HOANG ĐẠI LỤC");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`📜 Số lệnh: ${client.commands.size}`);
    console.log("====================================");
    console.log("🟢 Bot đang hoạt động.");
});

// ==========================================
// INTERACTION
// ==========================================

client.on("interactionCreate", async interaction => {
    try {

        // ==================================
        // BUTTON / SELECT MENU
        // ==================================

        if (
            interaction.isButton() ||
            interaction.isStringSelectMenu() ||
            interaction.isUserSelectMenu()
        ) {
            const customId = interaction.customId;

            // -------------------------------
            // MENU HỒNG HOANG / PVP
            // -------------------------------

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

            // -------------------------------
            // ADMIN SELECT MENU
            // -------------------------------

            if (
                customId === "admin_user_select" ||
                customId === "admin_select" ||
                customId === "admin_menu"
            ) {
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

        // ==================================
        // MODAL
        // ==================================

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

        // ==================================
        // SLASH COMMAND
        // ==================================

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command = client.commands.get(
            interaction.commandName
        );

        if (!command) {
            return interaction.reply({
                content: "❌ Lệnh này chưa được tải.",
                ephemeral: true
            });
        }

        await command.execute(interaction);

    } catch (error) {

        console.error(
            `❌ Lỗi interaction ${
                interaction.commandName ||
                interaction.customId ||
                ""
            }:`,
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

// ==========================================
// LOGIN
// ==========================================

client.login(TOKEN).catch(error => {
    console.error("❌ Không thể đăng nhập Discord:");
    console.error(error);
});
