require("dotenv").config();

const fs = require("fs");

const {
    Client,
    Collection,
    GatewayIntentBits,
    EmbedBuilder
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
// LOAD LINH CĂN + THỂ CHẤT
// ==========================================

let LINH_CAN = [];
let THE_CHAT = [];

try {
    const linhCanData = require("./linhcan");
    LINH_CAN = linhCanData.LINH_CAN || [];

    console.log(`🌌 Đã tải ${LINH_CAN.length} Linh Căn.`);
} catch (error) {
    console.error("❌ Không tải được linhcan.js:");
    console.error(error);
}

try {
    const theChatData = require("./thechat");
    THE_CHAT = theChatData.THE_CHAT || [];

    console.log(`🧬 Đã tải ${THE_CHAT.length} Thể Chất.`);
} catch (error) {
    console.error("❌ Không tải được thechat.js:");
    console.error(error);
}

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
            "database.js",
            "linhcan.js",
            "thechat.js"
        ].includes(file)
    );

for (const file of commandFiles) {
    try {

        const command = require(`./${file}`);

        if (!command.data || !command.execute) {
            console.warn(
                `⚠️ Bỏ qua ${file}: không phải Slash Command.`
            );
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
    console.log(`🌌 Linh Căn: ${LINH_CAN.length}`);
    console.log(`🧬 Thể Chất: ${THE_CHAT.length}`);
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

            // ==================================
            // DANH SÁCH LINH CĂN
            // ==================================

            if (
                interaction.isStringSelectMenu() &&
                customId.startsWith("linhcan_list_")
            ) {

                const ownerId = customId.replace(
                    "linhcan_list_",
                    ""
                );

                // Chỉ người gọi lệnh được dùng
                if (interaction.user.id !== ownerId) {
                    return interaction.reply({
                        content:
                            "❌ Menu này không phải của bạn.",
                        ephemeral: true
                    });
                }

                const rank = interaction.values[0];

                const list = LINH_CAN.filter(
                    item => item.rank === rank
                );

                if (!list.length) {
                    return interaction.reply({
                        content:
                            "❌ Không tìm thấy Linh Căn cấp này.",
                        ephemeral: true
                    });
                }

                let text = "";

                list.forEach((item, index) => {

                    text +=
                        `**${index + 1}. ${item.name}**\n` +
                        `⭐ Cấp: ${item.rank}\n` +
                        `🌀 Tu luyện: x${item.train}\n` +
                        `🎲 Độ hiếm: ${item.rate}\n\n`;

                });

                // Discord giới hạn Embed Description
                if (text.length > 3900) {
                    text =
                        text.substring(0, 3900) +
                        "\n\n... danh sách còn tiếp.";
                }

                const embed = new EmbedBuilder()
                    .setTitle(
                        `🌌 LINH CĂN — ${rank}`
                    )
                    .setDescription(text)
                    .setColor(0x8e44ad)
                    .setFooter({
                        text:
                            `Hồng Hoang Đại Lục • ${list.length} Linh Căn`
                    });

                return interaction.update({
                    embeds: [embed]
                });
            }

            // ==================================
            // DANH SÁCH THỂ CHẤT
            // ==================================

            if (
                interaction.isStringSelectMenu() &&
                customId.startsWith("thechat_list_")
            ) {

                const ownerId = customId.replace(
                    "thechat_list_",
                    ""
                );

                // Chỉ người gọi lệnh được dùng
                if (interaction.user.id !== ownerId) {
                    return interaction.reply({
                        content:
                            "❌ Menu này không phải của bạn.",
                        ephemeral: true
                    });
                }

                const rank = interaction.values[0];

                const list = THE_CHAT.filter(
                    item => item.rank === rank
                );

                if (!list.length) {
                    return interaction.reply({
                        content:
                            "❌ Không tìm thấy Thể Chất cấp này.",
                        ephemeral: true
                    });
                }

                let text = "";

                list.forEach((item, index) => {

                    text +=
                        `**${index + 1}. ${item.name}**\n` +
                        `⭐ Cấp: ${item.rank}\n` +
                        `❤️ HP: +${item.hp}\n` +
                        `🛡️ Phòng thủ: +${item.defense}\n` +
                        `⚔️ Lực chiến: +${item.power}\n` +
                        `🌀 Tu luyện: x${item.train}\n` +
                        `🎲 Độ hiếm: ${item.rate}\n\n`;

                });

                if (text.length > 3900) {
                    text =
                        text.substring(0, 3900) +
                        "\n\n... danh sách còn tiếp.";
                }

                const embed = new EmbedBuilder()
                    .setTitle(
                        `🧬 THỂ CHẤT — ${rank}`
                    )
                    .setDescription(text)
                    .setColor(0xe67e22)
                    .setFooter({
                        text:
                            `Hồng Hoang Đại Lục • ${list.length} Thể Chất`
                    });

                return interaction.update({
                    embeds: [embed]
                });
            }

            // ==================================
            // 🏯 TÔNG MÔN
            // ==================================

            if (
                customId.startsWith("tm_")
            ) {

                const tongmon =
                    client.commands.get("tongmon");

                // Button
                if (
                    interaction.isButton() &&
                    tongmon?.buttonHandler
                ) {

                    return await tongmon.buttonHandler(
                        interaction
                    );
                }

                // Select Menu
                if (
                    interaction.isStringSelectMenu() &&
                    tongmon?.selectHandler
                ) {

                    return await tongmon.selectHandler(
                        interaction
                    );
                }

                return interaction.reply({
                    content:
                        "❌ Không tải được hệ thống Tông Môn.",
                    ephemeral: true
                });
            }

            // ==================================
            // MENU HỒNG HOANG / PVP
            // ==================================

            if (
                customId.startsWith("menu_") ||
                customId.startsWith("pvp_")
            ) {

                const menu =
                    client.commands.get("menu");

                if (menu?.handleComponent) {

                    return await menu.handleComponent(
                        interaction
                    );

                }

                return interaction.reply({
                    content:
                        "❌ Không tải được hệ thống Menu.",
                    ephemeral: true
                });
            }

            // ==================================
            // ADMIN SELECT MENU
            // ==================================

            if (
                customId === "admin_user_select" ||
                customId === "admin_select" ||
                customId === "admin_menu"
            ) {

                const admin =
                    client.commands.get("admin");

                if (admin?.handleSelect) {

                    return await admin.handleSelect(
                        interaction
                    );

                }

                return interaction.reply({
                    content:
                        "❌ Không tải được Admin Panel.",
                    ephemeral: true
                });
            }
        }

        // ==================================
        // MODAL
        // ==================================

        if (interaction.isModalSubmit()) {

            // ==================================
            // 🏯 TÔNG MÔN MODAL
            // ==================================

            if (
                interaction.customId.startsWith("tm_")
            ) {

                const tongmon =
                    client.commands.get("tongmon");

                if (tongmon?.modalHandler) {

                    return await tongmon.modalHandler(
                        interaction
                    );

                }

                return interaction.reply({
                    content:
                        "❌ Không tải được hệ thống Tông Môn.",
                    ephemeral: true
                });
            }

            // ==================================
            // ADMIN MODAL
            // ==================================

            const admin =
                client.commands.get("admin");

            if (
                interaction.customId.startsWith(
                    "admin_modal_"
                ) &&
                admin?.handleModal
            ) {

                return await admin.handleModal(
                    interaction
                );
            }

            return interaction.reply({
                content:
                    "❌ Không tìm thấy chức năng Modal.",
                ephemeral: true
            });
        }

        // ==================================
        // SLASH COMMAND
        // ==================================

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const command =
            client.commands.get(
                interaction.commandName
            );

        if (!command) {

            return interaction.reply({
                content:
                    "❌ Lệnh này chưa được tải.",
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
            content:
                "❌ Đã xảy ra lỗi khi thực hiện chức năng.",
            ephemeral: true
        };

        try {

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp(
                    message
                );

            } else {

                await interaction.reply(
                    message
                );
            }

        } catch {}

    }
});

// ==========================================
// LOGIN
// ==========================================

client.login(TOKEN).catch(error => {

    console.error(
        "❌ Không thể đăng nhập Discord:"
    );

    console.error(error);

});
