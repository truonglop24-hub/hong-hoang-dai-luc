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
const db = require("./database");

// =====================================================
// CODE DATABASE - RAILWAY VOLUME
// =====================================================

const DATA_DIR = "/app/data";
const CODE_FILE = path.join(DATA_DIR, "admin_codes.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadCodes() {
    try {
        if (!fs.existsSync(CODE_FILE)) {
            fs.writeFileSync(CODE_FILE, "{}", "utf8");
            return {};
        }

        return JSON.parse(
            fs.readFileSync(CODE_FILE, "utf8")
        );
    } catch (error) {
        console.error("❌ Lỗi đọc admin_codes.json:", error);
        return {};
    }
}

function saveCodes(codes) {
    try {
        fs.writeFileSync(
            CODE_FILE,
            JSON.stringify(codes, null, 2),
            "utf8"
        );
        return true;
    } catch (error) {
        console.error("❌ Lỗi lưu admin_codes.json:", error);
        return false;
    }
}

// =====================================================
// HỖ TRỢ
// =====================================================

function isAdmin(interaction) {
    return interaction.member?.permissions?.has(
        PermissionFlagsBits.Administrator
    );
}

function cleanId(value) {
    return value.replace(/[<@!>]/g, "").trim();
}

function validId(id) {
    return /^\d{17,20}$/.test(id);
}

function getAmount(value) {
    const amount = Number(value);

    if (!Number.isSafeInteger(amount) || amount <= 0) {
        return null;
    }

    return amount;
}

async function getPlayer(interaction, id) {
    let player = db.getPlayer(id);

    if (player) return player;

    try {
        const user = await interaction.client.users.fetch(id);

        return db.createPlayer(
            id,
            user.username
        );
    } catch {
        return null;
    }
}

// =====================================================
// /ADMIN
// =====================================================

const command = new SlashCommandBuilder()
    .setName("admin")
    .setDescription("🛡️ Bảng điều khiển quản trị")
    .setDefaultMemberPermissions(
        PermissionFlagsBits.Administrator
    );

module.exports = {

    data: command,

    // =================================================
    // MỞ ADMIN PANEL
    // =================================================

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
                .setCustomId("admin_select")
                .setPlaceholder(
                    "🛡️ Chọn chức năng quản trị..."
                )
                .addOptions([

                    {
                        label: "Tăng Tu Vi",
                        description:
                            "Tăng tu vi người chơi",
                        value: "add_tuvi",
                        emoji: "⚔️"
                    },

                    {
                        label: "Giảm Tu Vi",
                        description:
                            "Giảm tu vi người chơi",
                        value: "remove_tuvi",
                        emoji: "📉"
                    },

                    {
                        label: "Tăng Linh Thạch",
                        description:
                            "Tăng linh thạch",
                        value: "add_linhthach",
                        emoji: "💎"
                    },

                    {
                        label: "Giảm Linh Thạch",
                        description:
                            "Giảm linh thạch",
                        value: "remove_linhthach",
                        emoji: "💸"
                    },

                    {
                        label: "Tăng Chỉ Số",
                        description:
                            "Tăng linh lực, HP, Công, Thủ",
                        value: "add_stat",
                        emoji: "📈"
                    },

                    {
                        label: "Giảm Chỉ Số",
                        description:
                            "Giảm linh lực, HP, Công, Thủ",
                        value: "remove_stat",
                        emoji: "📉"
                    },

                    {
                        label: "Tạo Code",
                        description:
                            "Tạo code phần thưởng",
                        value: "create_code",
                        emoji: "🔑"
                    }
                ]);

        const embed =
            new EmbedBuilder()
                .setColor(0x8e44ad)
                .setTitle(
                    "🛡️ HỒNG HOANG ĐẠI LỤC"
                )
                .setDescription(
                    "## ⚡ ADMIN PANEL\n\n" +

                    "⚔️ **Tu Vi**\n" +
                    "💎 **Linh Thạch**\n" +
                    "📊 **Chỉ Số**\n" +
                    "🔑 **Tạo Code**\n\n" +

                    "🔒 Chỉ Administrator mới có thể sử dụng."
                )
                .setFooter({
    text: "Admin Panel"
});

        return interaction.reply({
            embeds: [embed],
            components: [
                new ActionRowBuilder()
                    .addComponents(menu)
            ],
            ephemeral: true
        });
    },

    // =================================================
    // SELECT MENU
    // =================================================

    async handleSelect(interaction) {

        if (!isAdmin(interaction)) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền Admin!",
                ephemeral: true
            });
        }

        const action =
            interaction.values[0];  const userIdInput =
        new TextInputBuilder()
            .setCustomId("user_id")
            .setLabel("ID người chơi")
            .setPlaceholder("Nhập ID Discord")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

    const amountInput =
        new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Số lượng")
            .setPlaceholder("Ví dụ: 10000")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

    // =================================================
    // TĂNG / GIẢM TU VI + LINH THẠCH
    // =================================================

    if (
        action === "add_tuvi" ||
        action === "remove_tuvi"
    ) {
        const modal =
            new ModalBuilder()
                .setCustomId(`admin_modal_${action}`)
                .setTitle(
                    action === "add_tuvi"
                        ? "⚔️ TĂNG TU VI"
                        : "📉 GIẢM TU VI"
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(userIdInput),

            new ActionRowBuilder()
                .addComponents(amountInput)
        );

        return interaction.showModal(modal);
    }

    if (
        action === "add_linhthach" ||
        action === "remove_linhthach"
    ) {
        const modal =
            new ModalBuilder()
                .setCustomId(`admin_modal_${action}`)
                .setTitle(
                    action === "add_linhthach"
                        ? "💎 TĂNG LINH THẠCH"
                        : "💸 GIẢM LINH THẠCH"
                );

        modal.addComponents(
            new ActionRowBuilder()
                .addComponents(userIdInput),

            new ActionRowBuilder()
                .addComponents(amountInput)
        );

        return interaction.showModal(modal);
    }

        
              
               // =================================================
// TĂNG / GIẢM TU VI + LINH THẠCH
// =================================================

if (
    action === "admin_modal_add_tuvi" ||
    action === "admin_modal_remove_tuvi" ||
    action === "admin_modal_add_linhthach" ||
    action === "admin_modal_remove_linhthach"
) {

    // ==============================
    // LẤY DỮ LIỆU FORM
    // ==============================

    const id = cleanId(
        interaction.fields.getTextInputValue("user_id")
    );

    const amount = positiveInteger(
        interaction.fields.getTextInputValue("amount")
    );

    // ==============================
    // KIỂM TRA ID
    // ==============================

    if (!validId(id)) {
        return interaction.reply({
            content: "❌ ID Discord không hợp lệ!",
            ephemeral: true
        });
    }

    // ==============================
    // KIỂM TRA SỐ LƯỢNG
    // ==============================

    if (!amount) {
        return interaction.reply({
            content: "❌ Số lượng phải là số nguyên dương!",
            ephemeral: true
        });
    }

    // ==============================
    // LẤY NGƯỜI CHƠI
    // ==============================

    const player = await getOrCreatePlayer(
        interaction,
        id
    );

    if (!player) {
        return interaction.reply({
            content: "❌ Không tìm thấy người chơi!",
            ephemeral: true
        });
    }

    // ==============================
    // XÁC ĐỊNH LOẠI DỮ LIỆU
    // ==============================

    const isTuVi =
        action.includes("tuvi");

    const isAdd =
        action.startsWith("admin_modal_add_");

    // ==============================
    // TU VI
    // ==============================

    if (isTuVi) {

        const oldValue =
            Number(player.tuvi) || 0;

        const newValue =
            isAdd
                ? oldValue + amount
                : Math.max(
                    0,
                    oldValue - amount
                );

        db.updatePlayer(id, {
            tuvi: newValue
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(
                        isAdd
                            ? 0x2ecc71
                            : 0xe74c3c
                    )
                    .setTitle(
                        isAdd
                            ? "⚔️ TĂNG TU VI THÀNH CÔNG"
                            : "📉 GIẢM TU VI THÀNH CÔNG"
                    )
                    .setDescription(
                        `👤 **Người chơi:** <@${id}>\n` +
                        `🔢 **Thay đổi:** ${isAdd ? "+" : "-"}${amount.toLocaleString()}\n` +
                        `⚔️ **Tu vi:** ${oldValue.toLocaleString()} → **${newValue.toLocaleString()}**`
                    )
            ],
            ephemeral: true
        });
    }

    // ==============================
    // LINH THẠCH
    // ==============================

    const oldValue =
        Number(player.linhThach) || 0;

    const newValue =
        isAdd
            ? oldValue + amount
            : Math.max(
                0,
                oldValue - amount
            );

    db.updatePlayer(id, {
        linhThach: newValue
    });

    return interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(
                    isAdd
                        ? 0x2ecc71
                        : 0xe74c3c
                )
                .setTitle(
                    isAdd
                        ? "💎 TĂNG LINH THẠCH THÀNH CÔNG"
                        : "💸 GIẢM LINH THẠCH THÀNH CÔNG"
                )
                .setDescription(
                    `👤 **Người chơi:** <@${id}>\n` +
                    `🔢 **Thay đổi:** ${isAdd ? "+" : "-"}${amount.toLocaleString()}\n` +
                    `💎 **Linh thạch:** ${oldValue.toLocaleString()} → **${newValue.toLocaleString()}**`
                )
        ],
        ephemeral: true
    });
}         
        // =============================================
        // CHỈ SỐ
        // =============================================

        if (
            action === "add_stat" ||
            action === "remove_stat"
        ) {

            const modal =
                new ModalBuilder()
                .setCustomId("admin_modal_" + action)
                        
                
                    .setTitle(
                        action === "add_stat"
                            ? "📈 TĂNG CHỈ SỐ"
                            : "📉 GIẢM CHỈ SỐ"
                    );

            const user =
                new TextInputBuilder()
                    .setCustomId("user_id")
                    .setLabel("ID người chơi")
                    .setPlaceholder(
                        "Nhập ID Discord"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const stat =
                new TextInputBuilder()
                    .setCustomId("stat")
                    .setLabel("Tên chỉ số")
                    .setPlaceholder(
                        "linhLuc / hp / maxHp / cong / thu"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const amount =
                new TextInputBuilder()
                    .setCustomId("amount")
                    .setLabel("Số lượng")
                    .setPlaceholder(
                        "Ví dụ: 100"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(tr
                                 ue);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(user),

                new ActionRowBuilder()
                    .addComponents(stat),

                new ActionRowBuilder()
                    .addComponents(amount)
            );

            return interaction.showModal(modal);
        }

        // =============================================
        // TẠO CODE
        // =============================================

        if (action === "create_code") {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "admin_modal_create_code"
                    )
                    .setTitle(
                        "🔑 TẠO CODE"
                    );

            const code =
                new TextInputBuilder()
                    .setCustomId("code")
                    .setLabel("Tên Code")
                    .setPlaceholder(
                        "HONGHOANG2026"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const reward =
                new TextInputBuilder()
                    .setCustomId("reward")
                    .setLabel(
                        "Phần thưởng"
                    )
                    .setPlaceholder(
                        "tuvi hoặc linhthach"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const amount =
                new TextInputBuilder()
                    .setCustomId("amount")
                    .setLabel("Số lượng")
                    .setPlaceholder(
                        "Ví dụ: 50000"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(code),

                new ActionRowBuilder()
                    .addComponents(reward),

                new ActionRowBuilder()
                    .addComponents(amount)
            );

            return interaction.showModal(modal);
        }
    },

    // =================================================
    // MODAL
    // =================================================

    async handleModal(interaction) {

        if (!isAdmin(interaction)) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền!",
                ephemeral: true
            });
        }

        const action =
            interaction.customId;

        // =============================================
        // TU VI
        // =============================================

        if (
            action === "admin_modal_add_tuvi" ||
            action === "admin_modal_remove_tuvi"
        ) {

            const id =
                cleanId(
                    interaction.fields
                        .getTextInputValue(
                            "user_id"
                        )
                );

            const amount =
                getAmount(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (!validId(id)) {
                return interaction.reply({
                    content:
                        "❌ ID Discord không hợp lệ!",
                    ephemeral: true
                });
            }

            if (!amount) {
                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            const player =
                await getPlayer(
                    interaction,
                    id
                );

            if (!player) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy người chơi!",
                    ephemeral: true
                });
            }

            const oldValue =
                Number(player.tuvi) || 0;

            const newValue =
                action === "admin_modal_add_tuvi"
                    ? oldValue + amount
                    : Math.max(
                        0,
                        oldValue - amount
                    );

            db.updatePlayer(id, {
                tuvi: newValue
            });
            return interaction.reply({
    content: "⚔️ <@" + id + ">\\nTu vi: **" +
        oldValue.toLocaleString() + "** -> **" +
        newValue.toLocaleString() + "**",
    ephemeral: true
});
        // =============================================
        // LINH THẠCH
        // =============================================

        if (
            action === "admin_modal_add_linhthach" ||
            action === "admin_modal_remove_linhthach"
        ) {

            const id =
                cleanId(
                    interaction.fields
                        .getTextInputValue(
                            "user_id"
                        )
                );

            const amount =
                getAmount(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (!validId(id)) {
                return interaction.reply({
                    content:
                        "❌ ID Discord không hợp lệ!",
                    ephemeral: true
                });
            }

            if (!amount) {
                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            const player =
                await getPlayer(
                    interaction,
                    id
                );

            if (!player) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy người chơi!",
                    ephemeral: true
                });
            }

            const oldValue =
                Number(player.linhThach) || 0;

            const newValue =
                action ===
                "admin_modal_add_linhthach"
                    ? oldValue + amount
                    : Math.max(
                        0,
                        oldValue - amount
                    );

            db.updatePlayer(id, {
                linhThach: newValue
            });

            return interaction.reply({
    content: "💎 <@" + id + ">\nLinh thạch: **" +
        oldValue.toLocaleString() + "** -> **" +
        newValue.toLocaleString() + "**",
    ephemeral: true
});
        }

        // =============================================
        // CHỈ SỐ
        // =============================================

        if (
            action === "admin_modal_add_stat" ||
            action === "admin_modal_remove_stat"
        ) {

            const id =
                cleanId(
                    interaction.fields
                        .getTextInputValue(
                            "user_id"
                        )
                );

            const stat =
                interaction.fields
                    .getTextInputValue(
                        "stat"
                    )
                    .trim();

            const amount =
                getAmount(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            const allowed = [
                "linhLuc",
                "hp",
                "maxHp",
                "cong",
                "thu"
            ];

            if (!validId(id)) {
                return interaction.reply({
                    content:
                        "❌ ID Discord không hợp lệ!",
                    ephemeral: true
                });
            }

            if (!allowed.includes(stat)) {
                return interaction.reply({
                    content:
    "❌ Chỉ số không hợp lệ!\n\n" +
    "linhLuc\n" +
    "hp\n" +
    "maxHp\n" +
    "cong\n" +
    "thu",
                    ephemeral: true
                });
            }

            if (!amount) {
                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            const player =
                await getPlayer(
                    interaction,
                    id
                );

            if (!player) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy người chơi!",
                    ephemeral: true
                });
            }

            const oldValue =
                Number(player[stat]) || 0;

            const newValue =
                action === "admin_modal_add_stat"
                    ? oldValue + amount
                    : Math.max(
                        0,
                        oldValue - amount
                    );

            db.updatePlayer(id, {
                [stat]: newValue
            });

            return interaction.reply({
    content: "📊 <@" + id + ">\n" +
        "**" + stat + "**: " +
        oldValue.toLocaleString() + " -> " +
        newValue.toLocaleString(),
    ephemeral: true
});
        }

        // =============================================
        // TẠO CODE
        // =============================================

        if (
            action ===
            "admin_modal_create_code"
        ) {

            const code =
                interaction.fields
                    .getTextInputValue(
                        "code"
                    )
                    .trim()
                    .toUpperCase();

            const reward =
                interaction.fields
                    .getTextInputValue(
                        "reward"
                    )
                    .trim()
                    .toLowerCase();

            const amount =
                getAmount(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !/^[A-Z0-9_-]{3,32}$/.test(
                    code
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Code không hợp lệ!",
                    ephemeral: true
                });
            }

            if (
                ![
                    "tuvi",
                    "linhthach"
                ].includes(reward)
            ) {
                return interaction.reply({
                    content:
    "❌ Phần thưởng phải là tuvi hoặc linhthach.",
                });
            }

            if (!amount) {
                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            const codes =
                loadCodes();

            if (codes[code]) {
                return interaction.reply({
                    content:
                    "❌ Code " + code + " đã tồn tại!",
                });
            }

            codes[code] = {
                reward,
                amount,
                usedBy: [],
                createdBy:
                    interaction.user.id,
                createdAt:
                    Date.now()
            };

            saveCodes(codes);

            return interaction.reply({
                content:
    "🔑 **Tạo code thành công!**\n\n" +
    "Code: " + code + "\n" +
    "Phần thưởng: **" + reward + "**\n" +
    "Số lượng: **" + amount.toLocaleString() + "**",
                ephemeral: true
            });
        }
    }
}

}
