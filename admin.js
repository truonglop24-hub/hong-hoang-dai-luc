const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ==========================================
// DATABASE
// ==========================================

const database = require("./database");

// ==========================================
// ADMIN CODE
// ==========================================

const codeDir = path.join(__dirname, "data");
const codePath = path.join(codeDir, "admin_codes.json");

if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir, { recursive: true });
}

function loadCodes() {
    try {
        if (!fs.existsSync(codePath)) return {};

        return JSON.parse(
            fs.readFileSync(codePath, "utf8")
        );
    } catch (error) {
        console.error("❌ Lỗi đọc admin_codes.json:", error);
        return {};
    }
}

function saveCodes(codes) {
    try {
        fs.writeFileSync(
            codePath,
            JSON.stringify(codes, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("❌ Lỗi lưu admin_codes.json:", error);
        return false;
    }
}

// ==========================================
// CẢNH GIỚI
// ==========================================

const realms = [
    "Phàm Nhân",
    "Luyện Khí",
    "Trúc Cơ",
    "Kim Đan",
    "Nguyên Anh",
    "Hóa Thần",
    "Luyện Hư",
    "Hợp Thể",
    "Đại Thừa",
    "Độ Kiếp",
    "Tán Tiên",
    "Chân Tiên",
    "Kim Tiên",
    "Tiên Vương",
    "Tiên Đế",
    "Thánh Nhân",
    "Thiên Đạo",
    "Đại Đạo"
];

// ==========================================
// HELPER
// ==========================================

function isAdmin(interaction) {
    return !!interaction.member?.permissions?.has(
        PermissionFlagsBits.Administrator
    );
}

function ensurePlayer(id) {
    let player = database.getPlayer(id);

    if (!player) {
        player = database.createPlayer(
            id,
            `Player-${id}`
        );
    }

    return player;
}

function getNumber(interaction, field) {
    return Number(
        interaction.fields
            .getTextInputValue(field)
            .trim()
    );
}

function validPositiveInteger(value) {
    return Number.isSafeInteger(value) && value > 0;
}

function parseUserId(value) {
    return value
        .replace(/[<@!>]/g, "")
        .trim();
}

function validDiscordId(id) {
    return /^\d{17,20}$/.test(id);
}

function getArray(object, key) {
    if (!Array.isArray(object[key])) {
        object[key] = [];
    }

    return object[key];
}

// ==========================================
// COMMAND
// ==========================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("🛡️ Bảng điều khiển quản trị")
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        ),

    // ======================================
    // /ADMIN
    // ======================================

    async execute(interaction) {

        if (!isAdmin(interaction)) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền sử dụng Admin Panel!",
                ephemeral: true
            });
        }

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId("admin_menu")
                .setPlaceholder(
                    "🛡️ Chọn chức năng quản trị..."
                )
                .addOptions([

                    {
                        label: "Cộng Tu Vi",
                        description:
                            "Cộng tu vi cho người chơi",
                        value: "add_tuvi",
                        emoji: "✨"
                    },

                    {
                        label: "Trừ Tu Vi",
                        description:
                            "Trừ tu vi của người chơi",
                        value: "remove_tuvi",
                        emoji: "❌"
                    },

                    {
                        label: "Cộng Linh Thạch",
                        description:
                            "Cộng linh thạch",
                        value: "add_linhthach",
                        emoji: "💰"
                    },

                    {
                        label: "Trừ Linh Thạch",
                        description:
                            "Trừ linh thạch",
                        value: "remove_linhthach",
                        emoji: "💸"
                    },

                    {
                        label: "Thiết Lập Cảnh Giới",
                        description:
                            "Thiết lập cảnh giới",
                        value: "set_realm",
                        emoji: "🌟"
                    },

                    {
                        label: "Đạo Lữ",
                        description:
                            "Thêm hoặc xóa đạo lữ",
                        value: "daolu",
                        emoji: "💞"
                    },

                    {
                        label: "Công Pháp",
                        description:
                            "Thêm hoặc xóa công pháp",
                        value: "congphap",
                        emoji: "📖"
                    },

                    {
                        label: "Đan Dược",
                        description:
                            "Thêm hoặc xóa đan dược",
                        value: "danduoc",
                        emoji: "💊"
                    },

                    {
                        label: "Luyện Khí",
                        description:
                            "Trao pháp bảo / trang bị",
                        value: "luyenkhi",
                        emoji: "⚔️"
                    },

                    {
                        label: "Tạo Code",
                        description:
                            "Tạo code nhận phần thưởng",
                        value: "create_code",
                        emoji: "🔑"
                    },

                    {
                        label: "Reset Nhân Vật",
                        description:
                            "Đưa nhân vật về trạng thái ban đầu",
                        value: "reset",
                        emoji: "♻️"
                    }

                ]);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        const embed =
            new EmbedBuilder()
                .setColor(0x8e44ad)
                .setTitle(
                    "🛡️ HỒNG HOANG ĐẠI LỤC"
                )
                .setDescription(
                    "## ⚡ ADMIN PANEL\n\n" +
                    "Chào mừng đến hệ thống quản trị.\n\n" +
                    "🔽 **Chọn chức năng bên dưới.**\n\n" +
                    "🔒 Chỉ Administrator mới sử dụng được."
                )
                .setFooter({
                    text:
                        `Admin: ${interaction.user.tag}`
                });

        return interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    },

    // ======================================
    // SELECT MENU
    // ======================================

    async handleSelect(interaction) {

        if (!isAdmin(interaction)) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền Admin!",
                ephemeral: true
            });
        }

        const action =
            interaction.values?.[0];

        if (!action) {
            return interaction.reply({
                content:
                    "❌ Không xác định được chức năng.",
                ephemeral: true
            });
        }

        const userIdInput =
            new TextInputBuilder()
                .setCustomId("user_id")
                .setLabel("ID người chơi")
                .setPlaceholder(
                    "Nhập ID Discord người chơi"
                )
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

        const amountInput =
            new TextInputBuilder()
                .setCustomId("amount")
                .setLabel("Số lượng")
                .setPlaceholder(
                    "Ví dụ: 10000"
                )
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

        // ==================================
        // TU VI
        // ==================================

        if (
            action === "add_tuvi" ||
            action === "remove_tuvi"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `admin_modal_${action}`
                    )
                    .setTitle(
                        action === "add_tuvi"
                            ? "✨ CỘNG TU VI"
                            : "❌ TRỪ TU VI"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                amountInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // LINH THẠCH
        // ==================================

        if (
            action === "add_linhthach" ||
            action === "remove_linhthach"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `admin_modal_${action}`
                    )
                    .setTitle(
                        action === "add_linhthach"
                            ? "💰 CỘNG LINH THẠCH"
                            : "💸 TRỪ LINH THẠCH"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                amountInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // CẢNH GIỚI
        // ==================================

        if (action === "set_realm") {

            const realmInput =
                new TextInputBuilder()
                    .setCustomId("realm")
                    .setLabel(
                        "Tên hoặc số cảnh giới"
                    )
                    .setPlaceholder(
                        "Ví dụ: Kim Đan hoặc 4"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_set_realm"
                    )
                    .setTitle(
                        "🌟 THIẾT LẬP CẢNH GIỚI"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                realmInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // ĐẠO LỮ
        // ==================================

        if (action === "daolu") {

            const partnerInput =
                new TextInputBuilder()
                    .setCustomId("partner")
                    .setLabel(
                        "ID người còn lại"
                    )
                    .setPlaceholder(
                        "Nhập ID Discord"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const typeInput =
                new TextInputBuilder()
                    .setCustomId("type")
                    .setLabel(
                        "add hoặc remove"
                    )
                    .setPlaceholder(
                        "add = thêm | remove = xóa"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_daolu"
                    )
                    .setTitle(
                        "💞 QUẢN LÝ ĐẠO LỮ"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                partnerInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                typeInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // CÔNG PHÁP
        // ==================================

        if (action === "congphap") {

            const nameInput =
                new TextInputBuilder()
                    .setCustomId("name")
                    .setLabel(
                        "Tên công pháp"
                    )
                    .setPlaceholder(
                        "Ví dụ: Cửu Chuyển Huyền Công"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const typeInput =
                new TextInputBuilder()
                    .setCustomId("type")
                    .setLabel(
                        "add hoặc remove"
                    )
                    .setPlaceholder(
                        "add = thêm | remove = xóa"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_congphap"
                    )
                    .setTitle(
                        "📖 QUẢN LÝ CÔNG PHÁP"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                nameInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                typeInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // ĐAN DƯỢC
        // ==================================

        if (action === "danduoc") {

            const danNameInput =
                new TextInputBuilder()
                    .setCustomId("dan_name")
                    .setLabel(
                        "Tên đan dược"
                    )
                    .setPlaceholder(
                        "Ví dụ: Trúc Cơ Đan"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const danTypeInput =
                new TextInputBuilder()
                    .setCustomId("dan_type")
                    .setLabel(
                        "add hoặc remove"
                    )
                    .setPlaceholder(
                        "add = thêm | remove = xóa"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_danduoc"
                    )
                    .setTitle(
                        "💊 QUẢN LÝ ĐAN DƯỢC"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                danNameInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                amountInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                danTypeInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // LUYỆN KHÍ
        // ==================================

        if (action === "luyenkhi") {

            const itemInput =
                new TextInputBuilder()
                    .setCustomId("item")
                    .setLabel(
                        "Tên pháp bảo / trang bị"
                    )
                    .setPlaceholder(
                        "Ví dụ: Hỗn Độn Chung"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_luyenkhi"
                    )
                    .setTitle(
                        "⚔️ TRAO PHÁP BẢO"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                itemInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                amountInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // TẠO CODE
        // ==================================

        if (action === "create_code") {

            const codeInput =
                new TextInputBuilder()
                    .setCustomId("code")
                    .setLabel(
                        "Mã Code"
                    )
                    .setPlaceholder(
                        "Ví dụ: HONGHOANG2026"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const rewardInput =
                new TextInputBuilder()
                    .setCustomId("reward")
                    .setLabel(
                        "Phần thưởng"
                    )
                    .setPlaceholder(
                        "tuvi | linhthach | danduoc"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const danNameInput =
                new TextInputBuilder()
                    .setCustomId("dan_name")
                    .setLabel(
                        "Tên đan dược"
                    )
                    .setPlaceholder(
                        "Nếu chọn danduoc"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false);

            const codeAmountInput =
                new TextInputBuilder()
                    .setCustomId("code_amount")
                    .setLabel(
                        "Số lượng"
                    )
                    .setPlaceholder(
                        "Ví dụ: 50000"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_create_code"
                    )
                    .setTitle(
                        "🔑 TẠO CODE PHẦN THƯỞNG"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                codeInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                rewardInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                danNameInput
                            ),

                        new ActionRowBuilder()
                            .addComponents(
                                codeAmountInput
                            )
                    );

            return interaction.showModal(modal);
        }

        // ==================================
        // RESET
        // ==================================

        if (action === "reset") {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_reset"
                    )
                    .setTitle(
                        "♻️ RESET NHÂN VẬT"
                    )
                    .addComponents(
                        new ActionRowBuilder()
                            .addComponents(
                                userIdInput
                            )
                    );

            return interaction.showModal(modal);
        }

        return interaction.reply({
            content:
                "❌ Chức năng này chưa được cấu hình.",
            ephemeral: true
        });
    },
        // ==========================================
    // MODAL
    // ==========================================

    async handleModal(interaction) {

        if (!isAdmin(interaction)) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền sử dụng chức năng này!",
                ephemeral: true
            });
        }

        // ==========================================
        // TẠO CODE
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_create_code"
        ) {

            const code =
                interaction.fields
                    .getTextInputValue("code")
                    .trim()
                    .toUpperCase();

            const reward =
                interaction.fields
                    .getTextInputValue("reward")
                    .trim()
                    .toLowerCase();

            const danName =
                interaction.fields
                    .getTextInputValue("dan_name")
                    .trim();

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "code_amount"
                        )
                        .trim()
                );

            if (
                !/^[A-Z0-9_-]{3,32}$/.test(code)
            ) {
                return interaction.reply({
                    content:
                        "❌ Code phải dài 3-32 ký tự và chỉ gồm A-Z, 0-9, _ hoặc -.",
                    ephemeral: true
                });
            }

            if (
                ![
                    "tuvi",
                    "linhthach",
                    "danduoc"
                ].includes(reward)
            ) {
                return interaction.reply({
                    content:
                        "❌ Phần thưởng phải là `tuvi`, `linhthach` hoặc `danduoc`.",
                    ephemeral: true
                });
            }

            if (
                reward === "danduoc" &&
                !danName
            ) {
                return interaction.reply({
                    content:
                        "❌ Bạn phải nhập tên đan dược.",
                    ephemeral: true
                });
            }

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phải lớn hơn 0.",
                    ephemeral: true
                });
            }

            const codes = loadCodes();

            if (codes[code]) {
                return interaction.reply({
                    content:
                        `❌ Code \`${code}\` đã tồn tại!`,
                    ephemeral: true
                });
            }

            codes[code] = {
                reward,
                amount,

                ...(reward === "danduoc"
                    ? { danName }
                    : {}),

                usedBy: [],

                createdBy:
                    interaction.user.id,

                createdAt:
                    Date.now()
            };

            if (!saveCodes(codes)) {
                return interaction.reply({
                    content:
                        "❌ Không thể lưu code!",
                    ephemeral: true
                });
            }

            return interaction.reply({

                embeds: [
                    new EmbedBuilder()
                        .setColor(0x2ecc71)
                        .setTitle(
                            "🔑 TẠO CODE THÀNH CÔNG"
                        )
                        .setDescription(
                            `🔐 **Code:** \`${code}\`\n\n` +

                            (
                                reward === "danduoc"
                                    ? `💊 **Đan Dược:** ${danName}\n`
                                    : `🎁 **Phần thưởng:** ${reward}\n`
                            ) +

                            `📦 **Số lượng:** ${amount.toLocaleString()}\n\n` +

                            "👤 Mỗi người chơi chỉ dùng được 1 lần."
                        )
                ],

                ephemeral: true
            });
        }

        // ==========================================
        // LẤY USER ID
        // ==========================================

        const id =
            parseUserId(
                interaction.fields
                    .getTextInputValue(
                        "user_id"
                    )
            );

        if (!validDiscordId(id)) {
            return interaction.reply({
                content:
                    "❌ ID Discord không hợp lệ!",
                ephemeral: true
            });
        }

        const player =
            ensurePlayer(id);

        // ==========================================
        // CỘNG TU VI
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_add_tuvi"
        ) {

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng Tu Vi không hợp lệ!",
                    ephemeral: true
                });
            }

            const current =
                Number(
                    player.tuvi || 0
                );

            const next =
                current + amount;

            database.updatePlayer(
                id,
                {
                    tuvi: next
                }
            );

            return interaction.reply({
                content:
                    `✨ Đã cộng **${amount.toLocaleString()} Tu Vi** cho <@${id}>.\n` +
                    `📈 Tu Vi hiện tại: **${next.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==========================================
        // TRỪ TU VI
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_remove_tuvi"
        ) {

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng Tu Vi không hợp lệ!",
                    ephemeral: true
                });
            }

            const current =
                Number(
                    player.tuvi || 0
                );

            const removed =
                Math.min(
                    current,
                    amount
                );

            const next =
                current - removed;

            database.updatePlayer(
                id,
                {
                    tuvi: next
                }
            );

            return interaction.reply({
                content:
                    `❌ Đã trừ **${removed.toLocaleString()} Tu Vi** của <@${id}>.\n` +
                    `📉 Tu Vi hiện tại: **${next.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==========================================
        // CỘNG LINH THẠCH
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_add_linhthach"
        ) {

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng Linh Thạch không hợp lệ!",
                    ephemeral: true
                });
            }

            const current =
                Number(
                    player.linhThach || 0
                );

            const next =
                current + amount;

            database.updatePlayer(
                id,
                {
                    linhThach: next
                }
            );

            return interaction.reply({
                content:
                    `💰 Đã cộng **${amount.toLocaleString()} Linh Thạch** cho <@${id}>.\n` +
                    `💎 Hiện tại: **${next.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==========================================
        // TRỪ LINH THẠCH
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_remove_linhthach"
        ) {

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng Linh Thạch không hợp lệ!",
                    ephemeral: true
                });
            }

            const current =
                Number(
                    player.linhThach || 0
                );

            const removed =
                Math.min(
                    current,
                    amount
                );

            const next =
                current - removed;

            database.updatePlayer(
                id,
                {
                    linhThach: next
                }
            );

            return interaction.reply({
                content:
                    `💸 Đã trừ **${removed.toLocaleString()} Linh Thạch** của <@${id}>.\n` +
                    `💎 Hiện tại: **${next.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==========================================
        // CẢNH GIỚI
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_set_realm"
        ) {

            const input =
                interaction.fields
                    .getTextInputValue(
                        "realm"
                    )
                    .trim();

            let index = -1;

            if (/^\d+$/.test(input)) {

                index =
                    Number(input) - 1;

            } else {

                index =
                    realms.findIndex(
                        realm =>
                            realm.toLowerCase() ===
                            input.toLowerCase()
                    );
            }

            if (
                index < 0 ||
                index >= realms.length
            ) {

                return interaction.reply({
                    content:
                        "❌ Cảnh giới không hợp lệ!\n\n" +

                        realms
                            .map(
                                (x, i) =>
                                    `${i + 1}. ${x}`
                            )
                            .join("\n"),

                    ephemeral: true
                });
            }

            database.updatePlayer(
                id,
                {
                    realm:
                        index + 1,

                    canhGioi:
                        realms[index],

                    tang: 1
                }
            );

            return interaction.reply({
                content:
                    `🌟 Đã đặt cảnh giới của <@${id}> thành **${realms[index]}**.`,

                ephemeral: true
            });
        }

        // ==========================================
        // ĐẠO LỮ
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_daolu"
        ) {

            const partner =
                parseUserId(
                    interaction.fields
                        .getTextInputValue(
                            "partner"
                        )
                );

            const type =
                interaction.fields
                    .getTextInputValue(
                        "type"
                    )
                    .trim()
                    .toLowerCase();

            if (
                !validDiscordId(partner)
            ) {
                return interaction.reply({
                    content:
                        "❌ ID người còn lại không hợp lệ!",
                    ephemeral: true
                });
            }

            if (partner === id) {
                return interaction.reply({
                    content:
                        "❌ Không thể làm đạo lữ với chính mình!",
                    ephemeral: true
                });
            }

            if (
                ![
                    "add",
                    "remove"
                ].includes(type)
            ) {
                return interaction.reply({
                    content:
                        "❌ Type phải là `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            const partnerPlayer =
                ensurePlayer(partner);

            const listA =
                getArray(
                    player,
                    "daoLu"
                );

            const listB =
                getArray(
                    partnerPlayer,
                    "daoLu"
                );

            if (type === "add") {

                if (
                    !listA.includes(partner)
                ) {
                    listA.push(partner);
                }

                if (
                    !listB.includes(id)
                ) {
                    listB.push(id);
                }

            } else {

                player.daoLu =
                    listA.filter(
                        x => x !== partner
                    );

                partnerPlayer.daoLu =
                    listB.filter(
                        x => x !== id
                    );
            }

            database.updatePlayer(
                id,
                {
                    daoLu:
                        player.daoLu
                }
            );

            database.updatePlayer(
                partner,
                {
                    daoLu:
                        partnerPlayer.daoLu
                }
            );

            return interaction.reply({
                content:
                    type === "add"

                        ? `💞 Đã thiết lập <@${id}> và <@${partner}> thành đạo lữ.`

                        : `💔 Đã xóa quan hệ đạo lữ giữa <@${id}> và <@${partner}>.`,

                ephemeral: true
            });
        }

        // ==========================================
        // CÔNG PHÁP
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_congphap"
        ) {

            const name =
                interaction.fields
                    .getTextInputValue(
                        "name"
                    )
                    .trim();

            const type =
                interaction.fields
                    .getTextInputValue(
                        "type"
                    )
                    .trim()
                    .toLowerCase();

            if (!name) {
                return interaction.reply({
                    content:
                        "❌ Tên công pháp không được trống!",
                    ephemeral: true
                });
            }

            if (
                ![
                    "add",
                    "remove"
                ].includes(type)
            ) {
                return interaction.reply({
                    content:
                        "❌ Type phải là `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            const list =
                getArray(
                    player,
                    "congphap"
                );

            if (type === "add") {

                if (
                    !list.includes(name)
                ) {
                    list.push(name);
                }

            } else {

                player.congphap =
                    list.filter(
                        x =>
                            x.toLowerCase() !==
                            name.toLowerCase()
                    );
            }

            database.updatePlayer(
                id,
                {
                    congphap:
                        player.congphap
                }
            );

            return interaction.reply({
                content:
                    type === "add"

                        ? `📖 Đã thêm **${name}** cho <@${id}>.`

                        : `📖 Đã xóa **${name}** khỏi <@${id}>.`,

                ephemeral: true
            });
        }

        // ==========================================
        // ĐAN DƯỢC
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_danduoc"
        ) {

            const name =
                interaction.fields
                    .getTextInputValue(
                        "dan_name"
                    )
                    .trim();

            const type =
                interaction.fields
                    .getTextInputValue(
                        "dan_type"
                    )
                    .trim()
                    .toLowerCase();

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (!name) {
                return interaction.reply({
                    content:
                        "❌ Tên đan dược không được trống!",
                    ephemeral: true
                });
            }

            if (
                ![
                    "add",
                    "remove"
                ].includes(type)
            ) {
                return interaction.reply({
                    content:
                        "❌ Type phải là `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phải lớn hơn 0.",
                    ephemeral: true
                });
            }

            if (!player.tuiDo) {
                player.tuiDo = {};
            }

            if (
                !Array.isArray(
                    player.tuiDo.danDuoc
                )
            ) {
                player.tuiDo.danDuoc = [];
            }

            const list =
                player.tuiDo.danDuoc;

            let found =
                list.find(
                    item =>
                        typeof item === "object" &&
                        item.name &&
                        item.name.toLowerCase() ===
                        name.toLowerCase()
                );

            if (type === "add") {

                if (found) {

                    found.amount =
                        Number(
                            found.amount || 0
                        ) + amount;

                } else {

                    list.push({
                        name,
                        amount
                    });
                }

            } else {

                if (found) {

                    found.amount =
                        Number(
                            found.amount || 0
                        ) - amount;

                    if (
                        found.amount <= 0
                    ) {

                        const index =
                            list.indexOf(
                                found
                            );

                        list.splice(
                            index,
                            1
                        );
                    }

                } else {

                    const oldIndex =
                        list.findIndex(
                            item =>
                                typeof item ===
                                "string" &&
                                item.toLowerCase() ===
                                name.toLowerCase()
                        );

                    if (
                        oldIndex !== -1
                    ) {
                        list.splice(
                            oldIndex,
                            1
                        );
                    }
                }
            }

            database.updatePlayer(
                id,
                {
                    tuiDo:
                        player.tuiDo
                }
            );

            return interaction.reply({
                content:
                    type === "add"

                        ? `💊 Đã thêm **${name} ×${amount}** cho <@${id}>.`

                        : `💊 Đã trừ **${name} ×${amount}** của <@${id}>.`,

                ephemeral: true
            });
        }

        // ==========================================
        // LUYỆN KHÍ
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_luyenkhi"
        ) {

            const item =
                interaction.fields
                    .getTextInputValue(
                        "item"
                    )
                    .trim();

            const amount =
                getNumber(
                    interaction,
                    "amount"
                );

            if (!item) {
                return interaction.reply({
                    content:
                        "❌ Tên pháp bảo không được trống!",
                    ephemeral: true
                });
            }

            if (
                !validPositiveInteger(amount)
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phải lớn hơn 0.",
                    ephemeral: true
                });
            }

            if (!player.tuiDo) {
                player.tuiDo = {};
            }

            if (
                !Array.isArray(
                    player.tuiDo.vatPham
                )
            ) {
                player.tuiDo.vatPham = [];
            }

            const list =
                player.tuiDo.vatPham;

            const found =
                list.find(
                    x =>
                        typeof x === "object" &&
                        x.name &&
                        x.name.toLowerCase() ===
                        item.toLowerCase()
                );

            if (found) {

                found.amount =
                    Number(
                        found.amount || 0
                    ) + amount;

            } else {

                list.push({
                    name: item,
                    amount
                });
            }

            database.updatePlayer(
                id,
                {
                    tuiDo:
                        player.tuiDo
                }
            );

            return interaction.reply({
                content:
                    `⚔️ Đã trao **${item} ×${amount}** cho <@${id}>.`,

                ephemeral: true
            });
        }

        // ==========================================
        // RESET NHÂN VẬT
        // ==========================================

        if (
            interaction.customId ===
            "admin_modal_reset"
        ) {

            database.updatePlayer(
                id,
                {
                    tuvi: 0,

                    canhGioi:
                        "Luyện Khí",

                    tang: 1,

                    realm: 1,

                    kinhNghiem: 0,

                    linhCan: null,

                    linhLuc: 0,

                    linhThach: 100,

                    hp: 100,

                    maxHp: 100,

                    cong: 10,

                    thu: 5,

                    beQuan: false,

                    beQuanEnd: 0,

                    lastTrain: 0,

                    lastDungeon: 0,

                    lastBoss: 0,

                    bossDaGiet: 0,

                    phoBanDaHoanThanh: 0,

                    tuiDo: {
                        danDuoc: [],
                        vatPham: [],
                        linhThu: []
                    }
                }
            );

            return interaction.reply({
                content:
                    `♻️ Đã reset nhân vật của <@${id}> về trạng thái ban đầu.`,

                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Không tìm thấy chức năng Admin này.",
            ephemeral: true
        });
    }
