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

// =====================================================
// DATABASE
// =====================================================

function loadData() {
    if (!fs.existsSync(dataPath)) {
        return {
            users: {},
            relationships: {}
        };
    }

    return JSON.parse(
        fs.readFileSync(dataPath, "utf8")
    );
}

function saveData(data) {
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 2)
    );
}

function createUser(data, id) {

    if (!data.users) {
        data.users = {};
    }

    if (!data.users[id]) {
        data.users[id] = {
            tuvi: 0,
            linhthach: 0,
            realm: 0,
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
    { id: 0, name: "Phàm Nhân", max: 1000 },
    { id: 1, name: "Luyện Khí", max: 10000 },
    { id: 2, name: "Trúc Cơ", max: 30000 },
    { id: 3, name: "Kim Đan", max: 80000 },
    { id: 4, name: "Nguyên Anh", max: 200000 },
    { id: 5, name: "Hóa Thần", max: 500000 },
    { id: 6, name: "Luyện Hư", max: 1000000 },
    { id: 7, name: "Hợp Thể", max: 3000000 },
    { id: 8, name: "Đại Thừa", max: 10000000 },
    { id: 9, name: "Độ Kiếp", max: 30000000 },
    { id: 10, name: "Tán Tiên", max: 100000000 },
    { id: 11, name: "Chân Tiên", max: 500000000 },
    { id: 12, name: "Kim Tiên", max: 1000000000 },
    { id: 13, name: "Tiên Vương", max: 5000000000 },
    { id: 14, name: "Tiên Đế", max: 30000000000 },
    { id: 15, name: "Thánh Nhân", max: 100000000000 },
    { id: 16, name: "Thiên Đạo", max: 10000000000000 },
    { id: 17, name: "Đại Đạo", max: 99999999999999 }
];

function getRealmInfo(tuvi) {

    const value =
        Math.max(
            0,
            Number(tuvi) || 0
        );

    let index =
        realms.findIndex(
            r => value <= r.max
        );

    if (index === -1) {
        index = realms.length - 1;
    }

    const realm =
        realms[index];

    let tier = 1;

    if (
        index === realms.length - 1 &&
        value >= realm.max
    ) {

        tier = 10;

    } else if (index > 0) {

        const previous =
            realms[index - 1];

        const range =
            realm.max -
            previous.max;

        const progress =
            value -
            previous.max;

        tier =
            Math.ceil(
                (progress / range) * 10
            );

        tier =
            Math.max(
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
// LỆNH /ADMIN
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

    async execute(interaction) {

        // =================================================
        // KIỂM TRA QUYỀN
        // =================================================

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

        // =================================================
        // MENU
        // =================================================

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
                            "Thêm công pháp cho người chơi",
                        value: "congphap",
                        emoji: "📖"
                    },

                    {
                        label: "Luyện Khí",
                        description:
                            "Trao pháp bảo / trang bị",
                        value: "luyenkhi",
                        emoji: "⚔️"
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
                    "🔒 Chỉ thành viên có quyền **Administrator** mới có thể sử dụng."
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

    // =====================================================
    // XỬ LÝ SELECT MENU
    // =====================================================

    async handleSelect(interaction) {

        // Kiểm tra quyền lần nữa
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

        // =================================================
        // TẠO MODAL
        // =================================================

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

            return interaction.showModal(
                modal
            );
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

            return interaction.showModal(
                modal
            );
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

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // ĐẠO LỮ
        // =================================================

        if (action === "daolu") {

            const partnerInput =
                new TextInputBuilder()
                    .setCustomId(
                        "partner_id"
                    )
                    .setLabel(
                        "ID đạo lữ"
                    )
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

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // CÔNG PHÁP
        // =================================================

        if (action === "congphap") {

            const nameInput =
                new TextInputBuilder()
                    .setCustomId("name")
                    .setLabel(
                        "Tên công pháp"
                    )
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
                    .setLabel(
                        "Loại công pháp"
                    )
                    .setPlaceholder(
                        "Ví dụ: Công pháp"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);
                    // =================================================
        // LUYỆN KHÍ
        // =================================================

        if (action === "luyenkhi") {

            const itemInput =
                new TextInputBuilder()
                    .setCustomId("item")
                    .setLabel(
                        "Tên pháp bảo / trang bị"
                    )
                    .setPlaceholder(
                        "Ví dụ: Thanh Vân Kiếm"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const amountInput2 =
                new TextInputBuilder()
                    .setCustomId("amount")
                    .setLabel(
                        "Số lượng"
                    )
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
                    "⚔️ TRAO PHÁP BẢO"
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
                        amountInput2
                    )
            );

            return interaction.showModal(
                modal
            );
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

            return interaction.showModal(
                modal
            );
        }

        return interaction.reply({
            content:
                "❌ Chức năng không tồn tại.",
            ephemeral: true
        });
    },

    // =====================================================
    // XỬ LÝ MODAL
    // =====================================================

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
        // LẤY USER ID
        // =================================================

        const id =
            interaction.fields.getTextInputValue(
                "user_id"
            ).trim();

        // =================================================
        // CỘNG / TRỪ TU VI
        // =================================================

        if (
            customId ===
                "admin_modal_add_tuvi" ||
            customId ===
                "admin_modal_remove_tuvi"
        ) {

            const amountText =
                interaction.fields.getTextInputValue(
                    "amount"
                ).trim();

            const amount =
                Number(
                    amountText
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return interaction.reply({
                    content:
                        "❌ Số lượng Tu Vi không hợp lệ.",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            // =============================================
            // LẤY PLAYER DATABASE CHÍNH
            // =============================================

            let player =
                db.getPlayer(id);

            // Nếu chưa có trong database chính
            if (!player) {

                try {

                    const user =
                        await interaction.client.users.fetch(
                            id
                        );

                    player =
                        db.createPlayer(
                            id,
                            user.username
                        );

                } catch {

                    player = null;
                }
            }

            // =============================================
            // TU VI HIỆN TẠI
            // =============================================

            const oldTuvi =
                Number(
                    player?.tuvi ??
                    data.users[id].tuvi
                ) || 0;

            // =============================================
            // TU VI MỚI
            // =============================================

            let newTuvi;

            if (
                customId ===
                "admin_modal_add_tuvi"
            ) {

                newTuvi =
                    oldTuvi + amount;

            } else {

                newTuvi =
                    Math.max(
                        0,
                        oldTuvi - amount
                    );
            }

            // =============================================
            // TỰ ĐỘNG TÍNH CẢNH GIỚI + TẦNG
            // =============================================

            const realmInfo =
                getRealmInfo(
                    newTuvi
                );

            // =============================================
            // LƯU DATA.JSON
            // =============================================

            data.users[id].tuvi =
                newTuvi;

            data.users[id].realm =
                realmInfo.realmId;

            saveData(data);

            // =============================================
            // ĐỒNG BỘ DATABASE CHÍNH
            // =============================================

            if (player) {

                db.updatePlayer(
                    id,
                    {
                        tuvi:
                            newTuvi,

                        canhGioi:
                            realmInfo.realmName,

                        realm:
                            realmInfo.realmId,

                        tang:
                            realmInfo.tier
                    }
                );
            }

            // =============================================
            // THÔNG BÁO
            // =============================================

            const isAdd =
                customId ===
                "admin_modal_add_tuvi";

            const embed =
                new EmbedBuilder()
                    .setColor(
                        isAdd
                            ? 0x2ecc71
                            : 0xe74c3c
                    )
                    .setTitle(
                        isAdd
                            ? "✨ CỘNG TU VI THÀNH CÔNG"
                            : "❌ TRỪ TU VI THÀNH CÔNG"
                    )
                    .setDescription(
                        `👤 **Người chơi:** <@${id}>\n\n` +

                        `${isAdd ? "✨" : "❌"} **${isAdd ? "Đã cộng" : "Đã trừ"}:** ` +
                        `${amount.toLocaleString()}\n\n` +

                        `📊 **Tu Vi:** ` +
                        `${newTuvi.toLocaleString()}\n` +

                        `🌱 **Cảnh giới:** ` +
                        `${realmInfo.realmName}\n` +

                        `🏯 **Tầng:** ` +
                        `${realmInfo.tier}`
                    )
                    .setFooter({
                        text:
                            `Admin: ${interaction.user.tag}`
                    });

            return interaction.reply({
                embeds: [embed],
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

            const amountText =
                interaction.fields.getTextInputValue(
                    "amount"
                ).trim();

            const amount =
                Number(
                    amountText
                );

            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {

                return interaction.reply({
                    content:
                        "❌ Số lượng Linh Thạch không hợp lệ.",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const old =
                Number(
                    data.users[id].linhthach
                ) || 0;

            let value;

            if (
                customId ===
                "admin_modal_add_linhthach"
            ) {

                value =
                    old + amount;

            } else {

                value =
                    Math.max(
                        0,
                        old - amount
                    );
            }

            data.users[id].linhthach =
                value;

            saveData(data);

            // Đồng bộ database chính
            const player =
                db.getPlayer(id);

            if (player) {

                db.updatePlayer(
                    id,
                    {
                        linhThach:
                            value
                    }
                );
            }

            return interaction.reply({
                content:
                    `${customId.includes("add") ? "💰 Đã cộng" : "💸 Đã trừ"} ` +
                    `**${amount.toLocaleString()} Linh Thạch** ` +
                    `cho <@${id}>.\n\n` +
                    `💎 **Linh Thạch hiện tại:** ` +
                    `${value.toLocaleString()}`,
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

            const realmText =
                interaction.fields.getTextInputValue(
                    "realm"
                ).trim();

            const realmId =
                Number(
                    realmText
                );

            if (
                !Number.isInteger(realmId) ||
                realmId < 0 ||
                realmId >= realms.length
            ) {

                return interaction.reply({
                    content:
                        "❌ ID cảnh giới phải từ **0 đến 17**.",
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

            saveData(data);

            const player =
                db.getPlayer(id);

            if (player) {

                db.updatePlayer(
                    id,
                    {
                        realm:
                            realmId,

                        canhGioi:
                            realm.name
                    }
                );
            }

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
                interaction.fields.getTextInputValue(
                    "partner_id"
                ).trim();

            const type =
                interaction.fields.getTextInputValue(
                    "type"
                )
                .trim()
                .toLowerCase();

            if (
                !data.relationships
            ) {

                data.relationships = {};
            }

            if (type === "add") {

                if (
                    !data.relationships[id]
                ) {

                    data.relationships[id] =
                        [];
                }

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

                if (
                    data.relationships[id]
                ) {

                    data.relationships[id] =
                        data.relationships[id]
                            .filter(
                                x =>
                                    x !==
                                    partnerId
                            );
                }

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
                interaction.fields.getTextInputValue(
                    "name"
                ).trim();

            const type =
                interaction.fields.getTextInputValue(
                    "type"
                ).trim();

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
        // LUYỆN KHÍ
        // =================================================

        if (
            customId ===
            "admin_modal_luyenkhi"
        ) {

            const item =
                interaction.fields.getTextInputValue(
                    "item"
                ).trim();

            const amountText =
                interaction.fields.getTextInputValue(
                    "amount"
                ).trim();

            const amount =
                Number(
                    amountText
                );

            if (
                !Number.isInteger(amount) ||
                amount <= 0
            ) {

                return interaction.reply({
                    content:
                        "❌ Số lượng không hợp lệ.",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            if (
                !data.users[id].trangbi[item]
            ) {

                data.users[id].trangbi[item] =
                    0;
            }

            data.users[id].trangbi[item] +=
                amount;

            saveData(data);

            return interaction.reply({
                content:
                    `⚔️ Đã trao **${amount}x ${item}** cho <@${id}>.`,
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
                data.users[id]
            ) {

                delete data.users[id];
            }

            if (
                data.relationships
            ) {

                delete data.relationships[id];
            }

            saveData(data);

            return interaction.reply({
                content:
                    `♻️ Đã reset dữ liệu của <@${id}>.`,
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                "❌ Không tìm thấy chức năng.",
            ephemeral: true
        });
    }
};
// =====================================================
// KẾT THÚC ADMIN.JS
// =====================================================

module.exports = {
    data: command,

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
                            "Thêm công pháp",
                        value: "congphap",
                        emoji: "📖"
                    },
                    {
                        label: "Luyện Khí",
                        description:
                            "Trao pháp bảo / trang bị",
                        value: "luyenkhi",
                        emoji: "⚔️"
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
                    "Chào mừng đến hệ thống quản trị.\n\n" +
                    "🔽 **Chọn chức năng bên dưới.**\n\n" +
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

    async handleSelect(interaction) {
        // Phần xử lý Select Menu nằm ở phần 1/3.
        // Phần xử lý Modal nằm ở phần 2/3.
    },

    async handleModal(interaction) {
        // Phần xử lý Modal nằm ở phần 2/3.
    }
};
