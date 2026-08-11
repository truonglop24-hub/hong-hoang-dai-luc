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
// ADMIN CODE DATABASE - RAILWAY VOLUME
// =====================================================

const DATA_DIR = "/app/data";
const CODE_FILE = path.join(
    DATA_DIR,
    "admin_codes.json"
);

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

// =====================================================
// LOAD / SAVE CODE
// =====================================================

function loadCodes() {
    try {
        if (!fs.existsSync(CODE_FILE)) {
            fs.writeFileSync(
                CODE_FILE,
                "{}",
                "utf8"
            );

            return {};
        }

        return JSON.parse(
            fs.readFileSync(
                CODE_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Lỗi đọc admin_codes.json:",
            error
        );

        return {};
    }
}

function saveCodes(codes) {
    try {

        fs.writeFileSync(
            CODE_FILE,
            JSON.stringify(
                codes,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Lỗi lưu admin_codes.json:",
            error
        );

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

    return String(value)
        .replace(/[<@!>]/g, "")
        .trim();
}

function validId(id) {

    return /^\d{17,20}$/.test(id);
}

function getAmount(value) {

    const amount = Number(value);

    if (
        !Number.isSafeInteger(amount) ||
        amount <= 0
    ) {
        return null;
    }

    return amount;
}

// =====================================================
// LẤY / TẠO PLAYER
// =====================================================

async function getPlayer(
    interaction,
    id
) {

    let player =
        db.getPlayer(id);

    if (player) {
        return player;
    }

    try {

        const user =
            await interaction.client.users.fetch(
                id
            );

        return db.createPlayer(
            id,
            user.username
        );

    } catch {

        return null;
    }
}

// =====================================================
// CẢNH GIỚI
// GIỮ ĐÚNG MỐC TRONG realms.js
// =====================================================

const realms = [

    {
        id: 0,
        name: "Phàm Nhân",
        maxCultivation: 1000
    },

    {
        id: 1,
        name: "Luyện Khí",
        maxCultivation: 10000
    },

    {
        id: 2,
        name: "Trúc Cơ",
        maxCultivation: 30000
    },

    {
        id: 3,
        name: "Kim Đan",
        maxCultivation: 80000
    },

    {
        id: 4,
        name: "Nguyên Anh",
        maxCultivation: 200000
    },

    {
        id: 5,
        name: "Hóa Thần",
        maxCultivation: 500000
    },

    {
        id: 6,
        name: "Luyện Hư",
        maxCultivation: 1000000
    },

    {
        id: 7,
        name: "Hợp Thể",
        maxCultivation: 3000000
    },

    {
        id: 8,
        name: "Đại Thừa",
        maxCultivation: 10000000
    },

    {
        id: 9,
        name: "Độ Kiếp",
        maxCultivation: 30000000
    },

    {
        id: 10,
        name: "Tiên Nhân",
        maxCultivation: 100000000
    },

    {
        id: 11,
        name: "Chân Tiên",
        maxCultivation: 500000000
    },

    {
        id: 12,
        name: "Thiên Tiên",
        maxCultivation: 1000000000
    },

    {
        id: 13,
        name: "Huyền Tiên",
        maxCultivation: 5000000000
    },

    {
        id: 14,
        name: "Kim Tiên",
        maxCultivation: 30000000000
    },

    {
        id: 15,
        name: "Thánh Nhân",
        maxCultivation: 100000000000
    },

    {
        id: 16,
        name: "Thiên Đạo",
        maxCultivation: 10000000000000
    },

    {
        id: 17,
        name: "Đại Đạo",
        maxCultivation: 99999999999999
    }
];

// =====================================================
// TỰ ĐỘNG TÍNH CẢNH GIỚI + TẦNG
// =====================================================

function getRealmInfo(tuvi) {

    const value =
        Math.max(
            0,
            Number(tuvi) || 0
        );

    let index =
        realms.findIndex(
            realm =>
                value <= realm.maxCultivation
        );

    // Vượt toàn bộ mốc
    if (index === -1) {

        index =
            realms.length - 1;
    }

    const realm =
        realms[index];

    // =================================================
    // PHÀM NHÂN
    // =================================================

    if (index === 0) {

        return {
            realmId: realm.id,
            realmName: realm.name,
            tier: 1
        };
    }

    // =================================================
    // ĐẠI ĐẠO
    // =================================================

    if (
        index === realms.length - 1 &&
        value >= realm.maxCultivation
    ) {

        return {
            realmId: realm.id,
            realmName: realm.name,
            tier: 10
        };
    }

    // =================================================
    // MỐC CẢNH GIỚI TRƯỚC
    // =================================================

    const previousRealm =
        realms[index - 1];

    const previousMax =
        previousRealm.maxCultivation;

    const currentMax =
        realm.maxCultivation;

    const range =
        currentMax - previousMax;

    const progress =
        value - previousMax;

    let tier =
        Math.ceil(
            (progress / range) * 10
        );

    tier =
        Math.max(
            1,
            Math.min(
                10,
                tier
            )
        );

    return {
        realmId: realm.id,
        realmName: realm.name,
        tier
    };
}

// =====================================================
// /ADMIN
// =====================================================

const command =
    new SlashCommandBuilder()
        .setName("admin")
        .setDescription(
            "🛡️ Bảng điều khiển quản trị"
        )
        .setDefaultMemberPermissions(
            PermissionFlagsBits.Administrator
        );

// =====================================================
// MODULE
// =====================================================

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
                .setCustomId(
                    "admin_select"
                )
                .setPlaceholder(
                    "🛡️ Chọn chức năng quản trị..."
                )
                .addOptions([

                    // TU VI
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

                    // LINH THẠCH
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

                    // CHỈ SỐ
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

                    // CODE
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
            interaction.values[0];

        // =================================================
        // INPUT ID
        // =================================================

        const userIdInput =
            new TextInputBuilder()
                .setCustomId(
                    "user_id"
                )
                .setLabel(
                    "ID người chơi"
                )
                .setPlaceholder(
                    "Nhập ID Discord"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true);

        // =================================================
        // INPUT SỐ LƯỢNG
        // =================================================

        const amountInput =
            new TextInputBuilder()
                .setCustomId(
                    "amount"
                )
                .setLabel(
                    "Số lượng"
                )
                .setPlaceholder(
                    "Ví dụ: 10000"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true);

        // =================================================
        // TĂNG / GIẢM TU VI
        // =================================================

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
                            ? "⚔️ TĂNG TU VI"
                            : "📉 GIẢM TU VI"
                    );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        userIdInput
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        amountInput
                    )
            );

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // TĂNG / GIẢM LINH THẠCH
        // =================================================

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
                            ? "💎 TĂNG LINH THẠCH"
                            : "💸 GIẢM LINH THẠCH"
                    );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(
                        userIdInput
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        amountInput
                    )
            );

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // TĂNG / GIẢM CHỈ SỐ
        // =================================================

        if (
            action === "add_stat" ||
            action === "remove_stat"
        ) {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `admin_modal_${action}`
                    )
                    .setTitle(
                        action === "add_stat"
                            ? "📈 TĂNG CHỈ SỐ"
                            : "📉 GIẢM CHỈ SỐ"
                    );

            const user =
                new TextInputBuilder()
                    .setCustomId(
                        "user_id"
                    )
                    .setLabel(
                        "ID người chơi"
                    )
                    .setPlaceholder(
                        "Nhập ID Discord"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const stat =
                new TextInputBuilder()
                    .setCustomId(
                        "stat"
                    )
                    .setLabel(
                        "Tên chỉ số"
                    )
                    .setPlaceholder(
                        "linhLuc / hp / maxHp / cong / thu"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const amount =
                new TextInputBuilder()
                    .setCustomId(
                        "amount"
                    )
                    .setLabel(
                        "Số lượng"
                    )
                    .setPlaceholder(
                        "Ví dụ: 100"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(user),

                new ActionRowBuilder()
                    .addComponents(stat),

                new ActionRowBuilder()
                    .addComponents(amount)
            );

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // TẠO CODE
        // =================================================

        if (
            action === "create_code"
        ) {

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
                    .setCustomId(
                        "code"
                    )
                    .setLabel(
                        "Tên Code"
                    )
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
        .setLabel("Phần thưởng")
        .setPlaceholder("tuvi / linhthach / danduoc")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

const itemCode =
    new TextInputBuilder()
        .setCustomId("item_code")
        .setLabel("Code đan dược")
        .setPlaceholder("Ví dụ: TUDAN001")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

const amount =
    new TextInputBuilder()
        .setCustomId("amount")
        .setLabel("Số lượng")
        .setPlaceholder("Ví dụ: 50000")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

            modal.addComponents(

    new ActionRowBuilder()
        .addComponents(code),

    new ActionRowBuilder()
        .addComponents(reward),

    new ActionRowBuilder()
        .addComponents(itemCode),

    new ActionRowBuilder()
        .addComponents(amount)
);

            return interaction.showModal(
                modal
            );
        }

        return interaction.reply({
            content:
                "❌ Chức năng không tồn tại!",
            ephemeral: true
        });
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

        // =================================================
        // TU VI
        // =================================================

        if (
            action ===
                "admin_modal_add_tuvi" ||
            action ===
                "admin_modal_remove_tuvi"
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

            // ---------------------------------------------
            // KIỂM TRA ID
            // ---------------------------------------------

            if (!validId(id)) {

                return interaction.reply({
                    content:
                        "❌ ID Discord không hợp lệ!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // KIỂM TRA SỐ LƯỢNG
            // ---------------------------------------------

            if (!amount) {

                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // LẤY PLAYER
            // ---------------------------------------------

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

            // ---------------------------------------------
            // TU VI CŨ
            // ---------------------------------------------

            const oldValue =
                Number(
                    player.tuvi
                ) || 0;

            // ---------------------------------------------
            // TU VI MỚI
            // ---------------------------------------------

            const newValue =
                action ===
                    "admin_modal_add_tuvi"

                    ? oldValue + amount

                    : Math.max(
                        0,
                        oldValue - amount
                    );

            // ---------------------------------------------
            // TÍNH CẢNH GIỚI + TẦNG
            // ---------------------------------------------

            const realmInfo =
                getRealmInfo(
                    newValue
                );

            // ---------------------------------------------
            // LƯU DATABASE
            // ---------------------------------------------

            db.updatePlayer(
                id,
                {
                    tuvi:
                        newValue,

                    canhGioi:
                        realmInfo.realmName,

                    realm:
                        realmInfo.realmId,

                    tang:
                        realmInfo.tier
                }
            );

            // ---------------------------------------------
            // THÔNG BÁO
            // ---------------------------------------------

            const embed =
                new EmbedBuilder()
                    .setColor(
                        action ===
                            "admin_modal_add_tuvi"

                            ? 0x2ecc71
                            : 0xe74c3c
                    )
                    .setTitle(
                        action ===
                            "admin_modal_add_tuvi"

                            ? "⚔️ TĂNG TU VI THÀNH CÔNG"

                            : "📉 GIẢM TU VI THÀNH CÔNG"
                    )
                    .setDescription(

                        `👤 **Người chơi:** <@${id}>\n\n` +

                        `⚔️ **Tu Vi:** ` +
                        `${oldValue.toLocaleString()}` +
                        ` → ` +
                        `**${newValue.toLocaleString()}**\n\n` +

                        `🌱 **Cảnh giới:** ` +
                        `**${realmInfo.realmName}**\n\n` +

                        `🔢 **Tầng:** ` +
                        `**Tầng ${realmInfo.tier}**`
                    );

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // =================================================
        // LINH THẠCH
        // =================================================

        if (
            action ===
                "admin_modal_add_linhthach" ||
            action ===
                "admin_modal_remove_linhthach"
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
                Number(
                    player.linhThach
                ) || 0;

            const newValue =
                action ===
                    "admin_modal_add_linhthach"

                    ? oldValue + amount

                    : Math.max(
                        0,
                        oldValue - amount
                    );

            db.updatePlayer(
                id,
                {
                    linhThach:
                        newValue
                }
            );

            return interaction.reply({
                content:
                    `💎 <@${id}>\n` +
                    `Linh thạch: **` +
                    `${oldValue.toLocaleString()}` +
                    `** → **` +
                    `${newValue.toLocaleString()}` +
                    `**`,
                ephemeral: true
            });
        }

        // =================================================
        // CHỈ SỐ
        // =================================================

        if (
            action ===
                "admin_modal_add_stat" ||
            action ===
                "admin_modal_remove_stat"
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

            if (
                !allowed.includes(stat)
            ) {

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
                Number(
                    player[stat]
                ) || 0;

            const newValue =
                action ===
                    "admin_modal_add_stat"

                    ? oldValue + amount

                    : Math.max(
                        0,
                        oldValue - amount
                    );

            db.updatePlayer(
                id,
                {
                    [stat]:
                        newValue
                }
            );

            return interaction.reply({
                content:
                    `📊 <@${id}>\n` +
                    `**${stat}**: ` +
                    `${oldValue.toLocaleString()}` +
                    ` → ` +
                    `**${newValue.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // =================================================
        // TẠO CODE
        // =================================================

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

            // ---------------------------------------------
            // KIỂM TRA CODE
            // ---------------------------------------------

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

            // ---------------------------------------------
            // KIỂM TRA PHẦN THƯỞNG
            // ---------------------------------------------

            if (
                ![
                    "tuvi",
                    "linhthach"
                ].includes(
                    reward
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Phần thưởng phải là tuvi hoặc linhthach.",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // KIỂM TRA SỐ LƯỢNG
            // ---------------------------------------------

            if (!amount) {

                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // LOAD CODE
            // ---------------------------------------------

            const codes =
                loadCodes();

            // ---------------------------------------------
            // CODE ĐÃ TỒN TẠI
            // ---------------------------------------------

            if (codes[code]) {

                return interaction.reply({
                    content:
                        `❌ Code ${code} đã tồn tại!`,
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // TẠO CODE
            // ---------------------------------------------

            codes[code] = {

                reward,

                amount,

                usedBy: [],

                createdBy:
                    interaction.user.id,

                createdAt:
                    Date.now()
            };

            // ---------------------------------------------
            // SAVE
            // ---------------------------------------------

            const saved =
                saveCodes(
                    codes
                );

            if (!saved) {

                return interaction.reply({
                    content:
                        "❌ Không thể lưu Code!",
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "🔑 **Tạo code thành công!**\n\n" +

                    `Code: **${code}**\n` +

                    `Phần thưởng: **${reward}**\n` +

                    `Số lượng: **${amount.toLocaleString()}**`,
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Không xác định được chức năng!",
            ephemeral: true
        });
    }
};
