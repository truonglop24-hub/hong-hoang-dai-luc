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

const dataPath = path.join(__dirname, "data", "data.json");
const codePath = path.join(__dirname, "data", "admin_codes.json");

// =====================================================
// DATABASE
// =====================================================

function loadData() {
    try {
        if (!fs.existsSync(dataPath)) {
            return {
                users: {},
                relationships: {}
            };
        }

        return JSON.parse(
            fs.readFileSync(dataPath, "utf8")
        );
    } catch (error) {
        console.error("❌ Lỗi đọc data.json:", error);

        return {
            users: {},
            relationships: {}
        };
    }
}

function saveData(data) {
    try {
        const dir = path.dirname(dataPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }

        fs.writeFileSync(
            dataPath,
            JSON.stringify(data, null, 2),
            "utf8"
        );

        return true;
    } catch (error) {
        console.error("❌ Lỗi lưu data:", error);
        return false;
    }
}

// =====================================================
// ADMIN CODE
// =====================================================

function loadCodes() {
    try {
        if (!fs.existsSync(codePath)) {
            return {};
        }

        return JSON.parse(
            fs.readFileSync(codePath, "utf8")
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
        const dir = path.dirname(codePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }

        fs.writeFileSync(
            codePath,
            JSON.stringify(codes, null, 2),
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
// TẠO USER
// =====================================================

function createUser(data, id) {
    if (!data.users) {
        data.users = {};
    }

    if (!data.users[id]) {
        data.users[id] = {
            tuvi: 0,
            linhthach: 0,
            realm: 0,
            tang: 1,
            canhGioi: "Phàm Nhân",
            congphap: [],
            dan: {},
            trangbi: {}
        };
    }

    if (!data.users[id].congphap) {
        data.users[id].congphap = [];
    }

    if (!data.users[id].dan) {
        data.users[id].dan = {};
    }

    if (!data.users[id].trangbi) {
        data.users[id].trangbi = {};
    }
}

// =====================================================
// CẢNH GIỚI
// =====================================================

const realms = [
    {
        id: 0,
        name: "Phàm Nhân",
        max: 1000
    },
    {
        id: 1,
        name: "Luyện Khí",
        max: 10000
    },
    {
        id: 2,
        name: "Trúc Cơ",
        max: 30000
    },
    {
        id: 3,
        name: "Kim Đan",
        max: 80000
    },
    {
        id: 4,
        name: "Nguyên Anh",
        max: 200000
    },
    {
        id: 5,
        name: "Hóa Thần",
        max: 500000
    },
    {
        id: 6,
        name: "Luyện Hư",
        max: 1000000
    },
    {
        id: 7,
        name: "Hợp Thể",
        max: 3000000
    },
    {
        id: 8,
        name: "Đại Thừa",
        max: 10000000
    },
    {
        id: 9,
        name: "Độ Kiếp",
        max: 30000000
    },
    {
        id: 10,
        name: "Tiên Nhân",
        max: 100000000
    },
    {
        id: 11,
        name: "Chân Tiên",
        max: 500000000
    },
    {
        id: 12,
        name: "Thiên Tiên",
        max: 1000000000
    },
    {
        id: 13,
        name: "Huyền Tiên",
        max: 5000000000
    },
    {
        id: 14,
        name: "Kim Tiên",
        max: 30000000000
    },
    {
        id: 15,
        name: "Thánh Nhân",
        max: 100000000000
    },
    {
        id: 16,
        name: "Thiên Đạo",
        max: 10000000000000
    },
    {
        id: 17,
        name: "Đại Đạo",
        max: 99999999999999
    }
];

function getRealmInfo(tuvi) {
    const value = Math.max(
        0,
        Number(tuvi) || 0
    );

    let index = realms.findIndex(
        realm => value <= realm.max
    );

    if (index === -1) {
        index = realms.length - 1;
    }

    const realm = realms[index];

    let tier = 1;

    if (
        index === realms.length - 1 &&
        value >= realm.max
    ) {
        tier = 10;
    } else if (index > 0) {
        const previous = realms[index - 1];

        const range =
            realm.max - previous.max;

        const progress =
            value - previous.max;

        tier = Math.ceil(
            (progress / range) * 10
        );

        tier = Math.max(
            1,
            Math.min(10, tier)
        );
    }

    return {
        realmId: realm.id,
        realmName: realm.name,
        tier
    };
}

// =====================================================
// LỆNH ADMIN
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

module.exports = {
    data: command,

    // =================================================
    // /ADMIN
    // =================================================

    async execute(interaction) {
        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
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
                            "Tạo code Tu Vi, Linh Thạch hoặc Đan Dược",
                        value: "create_code",
                        emoji: "🔑"
                    },
                    {
                        label: "Reset Nhân Vật",
                        description:
                            "Xóa dữ liệu người chơi",
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
                    "Chào mừng đến với hệ thống quản trị.\n\n" +
                    "🔽 **Hãy chọn chức năng bên dưới để tiếp tục.**\n\n" +
                    "🔒 Chỉ Administrator mới có thể sử dụng."
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

    // =================================================
    // SELECT MENU
    // =================================================

    async handleSelect(interaction) {
        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền Admin!",
                ephemeral: true
            });
        }

        const action =
            interaction.values[0];

        const modal =
            new ModalBuilder();

        const userIdInput =
            new TextInputBuilder()
                .setCustomId("user_id")
                .setLabel("ID người chơi")
                .setPlaceholder(
                    "Nhập ID Discord người chơi"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true);

        const amountInput =
            new TextInputBuilder()
                .setCustomId("amount")
                .setLabel("Số lượng")
                .setPlaceholder(
                    "Ví dụ: 10000"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true);

        // =================================================
        // TU VI
        // =================================================

        if (
            action === "add_tuvi" ||
            action === "remove_tuvi"
        ) {
            modal
                .setCustomId(
                    `admin_modal_${action}`
                )
                .setTitle(
                    action === "add_tuvi"
                        ? "✨ CỘNG TU VI"
                        : "❌ TRỪ TU VI"
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

            return interaction.showModal(modal);
        }

        // =================================================
        // LINH THẠCH
        // =================================================

        if (
            action === "add_linhthach" ||
            action === "remove_linhthach"
        ) {
            modal
                .setCustomId(
                    `admin_modal_${action}`
                )
                .setTitle(
                    action === "add_linhthach"
                        ? "💰 CỘNG LINH THẠCH"
                        : "💸 TRỪ LINH THẠCH"
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

            return interaction.showModal(modal);
        }

        // =================================================
        // CẢNH GIỚI
        // =================================================

        if (action === "set_realm") {
            const realmInput =
                new TextInputBuilder()
                    .setCustomId("realm")
                    .setLabel(
                        "ID cảnh giới 0 - 17"
                    )
                    .setPlaceholder(
                        "Ví dụ: 5 = Hóa Thần"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal
                .setCustomId(
                    "admin_modal_set_realm"
                )
                .setTitle(
                    "🌟 THIẾT LẬP CẢNH GIỚI"
                );

            modal.addComponents(
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

        // =================================================
        // ĐẠO LỮ
        // =================================================

        if (action === "daolu") {
            const partnerInput =
                new TextInputBuilder()
                    .setCustomId("partner_id")
                    .setLabel("ID đạo lữ")
                    .setPlaceholder(
                        "Nhập ID Discord đạo lữ"
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

            modal
                .setCustomId(
                    "admin_modal_daolu"
                )
                .setTitle(
                    "💞 QUẢN LÝ ĐẠO LỮ"
                );

            modal.addComponents(
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

        // =================================================
        // CÔNG PHÁP
        // =================================================

        if (action === "congphap") {
            const nameInput =
                new TextInputBuilder()
                    .setCustomId("name")
                    .setLabel("Tên công pháp")
                    .setPlaceholder(
                        "Ví dụ: Cửu Thiên Huyền Công"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const typeInput =
                new TextInputBuilder()
                    .setCustomId("type")
                    .setLabel("Loại công pháp")
                    .setPlaceholder(
                        "Ví dụ: công kích"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal
                .setCustomId(
                    "admin_modal_congphap"
                )
                .setTitle(
                    "📖 THÊM CÔNG PHÁP"
                );

            modal.addComponents(
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

        // =================================================
        // ĐAN DƯỢC
        // =================================================

        if (action === "danduoc") {
            const danInput =
                new TextInputBuilder()
                    .setCustomId("dan_name")
                    .setLabel("Tên đan dược")
                    .setPlaceholder(
                        "Ví dụ: Đan Đổi Thể Chất"
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

            modal
                .setCustomId(
                    "admin_modal_danduoc"
                )
                .setTitle(
                    "💊 QUẢN LÝ ĐAN DƯỢC"
                );

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        userIdInput
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        danInput
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

        // =================================================
        // LUYỆN KHÍ
        // =================================================

        if (action === "luyenkhi") {
            const itemInput =
                new TextInputBuilder()
                    .setCustomId("item")
                    .setLabel("Tên pháp bảo")
                    .setPlaceholder(
                        "Ví dụ: Tru Tiên Kiếm"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const itemAmountInput =
                new TextInputBuilder()
                    .setCustomId("amount")
                    .setLabel("Số lượng")
                    .setPlaceholder(
                        "Ví dụ: 1"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal
                .setCustomId(
                    "admin_modal_luyenkhi"
                )
                .setTitle(
                    "⚔️ QUẢN LÝ LUYỆN KHÍ"
                );

            modal.addComponents(
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
                        itemAmountInput
                    )
            );

            return interaction.showModal(modal);
        }

        // =================================================
        // TẠO CODE
        // =================================================

        if (action === "create_code") {
            const codeInput =
                new TextInputBuilder()
                    .setCustomId("code")
                    .setLabel("Mã Code")
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
                        "Loại phần thưởng"
                    )
                    .setPlaceholder(
                        "tuvi / linhthach / danduoc"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const codeAmountInput =
                new TextInputBuilder()
                    .setCustomId("code_amount")
                    .setLabel(
                        "Số lượng phần thưởng"
                    )
                    .setPlaceholder(
                        "Ví dụ: 50000"
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
                        "Chỉ nhập khi chọn danduoc"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(false);

            modal
                .setCustomId(
                    "admin_modal_create_code"
                )
                .setTitle(
                    "🔑 TẠO CODE PHẦN THƯỞNG"
                );

            modal.addComponents(
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
                        codeAmountInput
                    ),
                new ActionRowBuilder()
                    .addComponents(
                        danNameInput
                    )
            );

            return interaction.showModal(modal);
        }

        // =================================================
        // RESET
        // =================================================

        if (action === "reset") {
            modal
                .setCustomId(
                    "admin_modal_reset"
                )
                .setTitle(
                    "♻️ RESET NHÂN VẬT"
                );

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(
                        userIdInput
                    )
            );

            return interaction.showModal(modal);
        }

        return interaction.reply({
            content:
                "❌ Không tìm thấy chức năng.",
            ephemeral: true
        });
    },

    // =================================================
    // HANDLE MODAL
    // =================================================

    async handleModal(interaction) {
        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền Admin!",
                ephemeral: true
            });
        }

        const customId =
            interaction.customId;

        const data =
            loadData();

        // =================================================
        // ID NGƯỜI CHƠI
        // =================================================

        let id = null;

        try {
            id =
                interaction.fields
                    .getTextInputValue(
                        "user_id"
                    )
                    .trim();
        } catch {}

        // =================================================
        // CỘNG / TRỪ TU VI
        // =================================================

        if (
            customId ===
                "admin_modal_add_tuvi" ||
            customId ===
                "admin_modal_remove_tuvi"
        ) {
            if (!id) {
                return interaction.reply({
                    content:
                        "❌ ID người chơi không hợp lệ!",
                    ephemeral: true
                });
            }

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                        .trim()
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số Tu Vi không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const oldTuvi =
                Number(
                    data.users[id].tuvi
                ) || 0;

            const newTuvi =
                customId ===
                "admin_modal_add_tuvi"
                    ? oldTuvi + amount
                    : Math.max(
                        0,
                        oldTuvi - amount
                    );

            const info =
                getRealmInfo(
                    newTuvi
                );

            data.users[id].tuvi =
                newTuvi;

            data.users[id].realm =
                info.realmId;

            data.users[id].canhGioi =
                info.realmName;

            data.users[id].tang =
                info.tier;

            saveData(data);

            try {
                if (db.getPlayer(id)) {
                    db.updatePlayer(
                        id,
                        {
                            tuvi: newTuvi,
                            realm: info.realmId,
                            tang: info.tier,
                            canhGioi:
                                info.realmName
                        }
                    );
                }
            } catch (error) {
                console.log(
                    "⚠️ Không cập nhật database chính:",
                    error.message
                );
            }

            return interaction.reply({
                content:
                    `${
                        customId ===
                        "admin_modal_add_tuvi"
                            ? "✨ Đã cộng"
                            : "❌ Đã trừ"
                    } **${amount.toLocaleString()} Tu Vi** cho <@${id}>.\n\n` +
                    `✨ **Tu Vi:** ${newTuvi.toLocaleString()}\n` +
                    `🌱 **Cảnh giới:** ${info.realmName}\n` +
                    `🏯 **Tầng:** ${info.tier}`,
                ephemeral: true
            });
        }

        // =================================================
        // CỘNG / TRỪ LINH THẠCH
        // =================================================

        if (
            customId ===
                "admin_modal_add_linhthach" ||
            customId ===
                "admin_modal_remove_linhthach"
        ) {
            if (!id) {
                return interaction.reply({
                    content:
                        "❌ ID người chơi không hợp lệ!",
                    ephemeral: true
                });
            }

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                        .trim()
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số Linh Thạch không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const old =
                Number(
                    data.users[id]
                        .linhthach
                ) || 0;

            const value =
                customId ===
                "admin_modal_add_linhthach"
                    ? old + amount
                    : Math.max(
                        0,
                        old - amount
                    );

            data.users[id]
                .linhthach =
                value;

            saveData(data);

            try {
                if (db.getPlayer(id)) {
                    db.updatePlayer(
                        id,
                        {
                            linhThach:
                                value
                        }
                    );
                }
            } catch {}

            return interaction.reply({
                content:
                    `${
                        customId ===
                        "admin_modal_add_linhthach"
                            ? "💰 Đã cộng"
                            : "💸 Đã trừ"
                    } **${amount.toLocaleString()} Linh Thạch** cho <@${id}>.\n\n` +
                    `💎 **Số dư:** ${value.toLocaleString()}`,
                ephemeral: true
            });
        }

        // =================================================
        // THIẾT LẬP CẢNH GIỚI
        // =================================================

        if (
            customId ===
            "admin_modal_set_realm"
        ) {
            if (!id) {
                return interaction.reply({
                    content:
                        "❌ ID người chơi không hợp lệ!",
                    ephemeral: true
                });
            }

            const realmId =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "realm"
                        )
                        .trim()
                );

            if (
                !Number.isInteger(
                    realmId
                ) ||
                realmId < 0 ||
                realmId >= realms.length
            ) {
                return interaction.reply({
                    content:
                        "❌ Cảnh giới phải từ 0 đến 17!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const realm =
                realms[realmId];

            data.users[id].realm =
                realmId;

            data.users[id].canhGioi =
                realm.name;

            saveData(data);

            return interaction.reply({
                content:
                    `🌟 Đã thiết lập cảnh giới cho <@${id}>.\n\n` +
                    `🌱 **Cảnh giới:** ${realm.name}\n` +
                    `🆔 **ID:** ${realmId}`,
                ephemeral: true
            });
        }

        // =================================================
        // ĐẠO LỮ
        // =================================================

        if (
            customId ===
            "admin_modal_daolu"
        ) {
            const partnerId =
                interaction.fields
                    .getTextInputValue(
                        "partner_id"
                    )
                    .trim();

            const type =
                interaction.fields
                    .getTextInputValue(
                        "type"
                    )
                    .trim()
                    .toLowerCase();

            if (!data.relationships) {
                data.relationships = {};
            }

            if (!data.relationships[id]) {
                data.relationships[id] = [];
            }

            if (type === "add") {
                if (
                    !data.relationships[id]
                        .includes(partnerId)
                ) {
                    data.relationships[id]
                        .push(partnerId);
                }

                saveData(data);

                return interaction.reply({
                    content:
                        `💞 Đã thêm <@${partnerId}> làm đạo lữ của <@${id}>.`,
                    ephemeral: true
                });
            }

            if (type === "remove") {
                data.relationships[id] =
                    data.relationships[id]
                        .filter(
                            x =>
                                x !==
                                partnerId
                        );

                saveData(data);

                return interaction.reply({
                    content:
                        `💔 Đã xóa <@${partnerId}> khỏi danh sách đạo lữ của <@${id}>.`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "❌ Type phải là `add` hoặc `remove`.",
                ephemeral: true
            });
        }

        // =================================================
        // CÔNG PHÁP
        // =================================================

        if (
            customId ===
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
                    .trim();

            createUser(
                data,
                id
            );

            data.users[id]
                .congphap
                .push({
                    name,
                    type
                });

            saveData(data);

            return interaction.reply({
                content:
                    `📖 Đã thêm công pháp **${name}** cho <@${id}>.\n` +
                    `⚔️ Loại: **${type}**`,
                ephemeral: true
            });
        }

        // =================================================
        // ĐAN DƯỢC
        // =================================================

        if (
            customId ===
            "admin_modal_danduoc"
        ) {
            const danName =
                interaction.fields
                    .getTextInputValue(
                        "dan_name"
                    )
                    .trim();

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                        .trim()
                );

            const type =
                interaction.fields
                    .getTextInputValue(
                        "dan_type"
                    )
                    .trim()
                    .toLowerCase();

            if (
                !Number.isInteger(amount) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng đan dược không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            if (type === "add") {
                data.users[id]
                    .dan[danName] =
                    Number(
                        data.users[id]
                            .dan[danName] ||
                        0
                    ) + amount;
            } else if (
                type === "remove"
            ) {
                data.users[id]
                    .dan[danName] =
                    Math.max(
                        0,
                        Number(
                            data.users[id]
                                .dan[danName] ||
                            0
                        ) - amount
                    );
            } else {
                return interaction.reply({
                    content:
                        "❌ Loại phải là `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            saveData(data);

            return interaction.reply({
                content:
                    `${
                        type === "add"
                            ? "💊 Đã thêm"
                            : "❌ Đã trừ"
                    } **${amount}x ${danName}** cho <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // LUYỆN KHÍ
        // =================================================

        if (
            customId ===
            "admin_modal_luyenkhi"
        ) {
            const item =
                interaction.fields
                    .getTextInputValue(
                        "item"
                    )
                    .trim();

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                        .trim()
                );

            if (
                !Number.isInteger(amount) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            data.users[id]
                .trangbi[item] =
                Number(
                    data.users[id]
                        .trangbi[item] ||
                    0
                ) + amount;

            saveData(data);

            return interaction.reply({
                content:
                    `⚔️ Đã trao **${amount}x ${item}** cho <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // TẠO CODE
        // =================================================

        if (
            customId ===
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
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "code_amount"
                        )
                        .trim()
                );

            let danName = "";

            try {
                danName =
                    interaction.fields
                        .getTextInputValue(
                            "dan_name"
                        )
                        .trim();
            } catch {
                danName = "";
            }

            // ---------------------------------------------
            // KIỂM TRA CODE
            // ---------------------------------------------

            if (
                !code ||
                code.length < 2
            ) {
                return interaction.reply({
                    content:
                        "❌ Mã code không hợp lệ!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // KIỂM TRA PHẦN THƯỞNG
            // ---------------------------------------------

            if (
                reward !== "tuvi" &&
                reward !== "linhthach" &&
                reward !== "danduoc"
            ) {
                return interaction.reply({
                    content:
                        "❌ Loại phần thưởng không hợp lệ!\n\n" +
                        "Bạn chỉ được nhập:\n" +
                        "✨ `tuvi`\n" +
                        "💰 `linhthach`\n" +
                        "💊 `danduoc`",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // KIỂM TRA SỐ LƯỢNG
            // ---------------------------------------------

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phần thưởng không hợp lệ!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // KIỂM TRA TÊN ĐAN
            // ---------------------------------------------

            if (
                reward === "danduoc" &&
                !danName
            ) {
                return interaction.reply({
                    content:
                        "❌ Khi chọn `danduoc`, bạn phải nhập tên đan dược!",
                    ephemeral: true
                });
            }

            const codes =
                loadCodes();

            if (codes[code]) {
                return interaction.reply({
                    content:
                        "❌ Code này đã tồn tại!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // LƯU CODE
            // ---------------------------------------------

            codes[code] = {
                reward: reward,
                amount: amount,

                // Chỉ có giá trị khi reward = danduoc
                danName:
                    reward === "danduoc"
                        ? danName
                        : null,

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

            // ---------------------------------------------
            // HIỂN THỊ
            // ---------------------------------------------

            let rewardText = "";

            if (
                reward === "tuvi"
            ) {
                rewardText =
                    `✨ **Tu Vi:** ${amount.toLocaleString()}`;
            }

            if (
                reward === "linhthach"
            ) {
                rewardText =
                    `💰 **Linh Thạch:** ${amount.toLocaleString()}`;
            }

            if (
                reward === "danduoc"
            ) {
                rewardText =
                    `💊 **Đan Dược:** ${danName}\n` +
                    `📦 **Số lượng:** ${amount.toLocaleString()}`;
            }

            return interaction.reply({
                content:
                    `🔑 **TẠO CODE THÀNH CÔNG**\n\n` +
                    `🎁 **Code:** \`${code}\`\n\n` +
                    `${rewardText}`,
                ephemeral: true
            });
        }

        // =================================================
        // RESET
        // =================================================

        if (
            customId ===
            "admin_modal_reset"
        ) {
            if (
                data.users &&
                data.users[id]
            ) {
                delete data.users[id];
            }

            if (
                data.relationships &&
                data.relationships[id]
            ) {
                delete data.relationships[id];
            }

            saveData(data);

            try {
                const player =
                    db.getPlayer(id);

                if (player) {
                    db.updatePlayer(
                        id,
                        {
                            tuvi: 0,
                            realm: 0,
                            tang: 1,
                            canhGioi:
                                "Phàm Nhân",
                            linhThach: 0
                        }
                    );
                }
            } catch {}

            return interaction.reply({
                content:
                    `♻️ Đã reset dữ liệu của <@${id}>.`,
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Không tìm thấy chức năng Admin này.",
            ephemeral: true
        });
    }
};
