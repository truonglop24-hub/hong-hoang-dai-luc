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
    if (!fs.existsSync(dataPath)) {
        return {
            users: {},
            relationships: {}
        };
    }

    try {
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
    fs.writeFileSync(
        dataPath,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}

function loadCodes() {
    if (!fs.existsSync(codePath)) {
        return {};
    }

    try {
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

function createUser(data, id) {
    if (!data.users) {
        data.users = {};
    }

    if (!data.users[id]) {
        data.users[id] = {
            tuvi: 0,
            linhthach: 0,
            realm: 1,
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

// =====================================================
// TÍNH CẢNH GIỚI + TẦNG
// =====================================================

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
            realm.max -
            previous.max;

        const progress =
            value -
            previous.max;

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
// ĐỒNG BỘ TU VI
// =====================================================

async function syncTuVi(
    interaction,
    id,
    newTuvi,
    legacyData
) {
    const realmInfo =
        getRealmInfo(newTuvi);

    // Database cũ
    createUser(
        legacyData,
        id
    );

    legacyData.users[id].tuvi =
        newTuvi;

    legacyData.users[id].realm =
        realmInfo.realmId;

    saveData(legacyData);

    // Database chính
    let player = null;

    try {
        player = db.getPlayer(id);
    } catch {}

    if (!player) {
        try {
            const user =
                await interaction.client.users.fetch(id);

            if (db.createPlayer) {
                player =
                    db.createPlayer(
                        id,
                        user.username
                    );
            }
        } catch {}
    }

    if (player && db.updatePlayer) {
        db.updatePlayer(
            id,
            {
                tuvi: newTuvi,
                canhGioi:
                    realmInfo.realmName,
                realm:
                    realmInfo.realmId,
                tang:
                    realmInfo.tier
            }
        );
    }

    return realmInfo;
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
                .setCustomId(
                    "admin_menu"
                )
                .setPlaceholder(
                    "🛡️ Chọn chức năng quản trị..."
                )
                .addOptions([

                    {
                        label: "Cộng Tu Vi",
                        description:
                            "Cộng tu vi và tự cập nhật cảnh giới/tầng",
                        value: "add_tuvi",
                        emoji: "✨"
                    },

                    {
                        label: "Trừ Tu Vi",
                        description:
                            "Trừ tu vi và tự cập nhật cảnh giới/tầng",
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
                .setCustomId(
                    "user_id"
                )
                .setLabel(
                    "ID người chơi"
                )
                .setPlaceholder(
                    "Nhập ID Discord người chơi"
                )
                .setStyle(
                    TextInputStyle.Short
                )
                .setRequired(true);

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

        if (
            action === "set_realm"
        ) {

            const realmInput =
                new TextInputBuilder()
                    .setCustomId(
                        "realm"
                    )
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

        if (
            action === "daolu"
        ) {

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
                    .setCustomId(
                        "type"
                    )
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

        if (
            action === "congphap"
        ) {

            const nameInput =
                new TextInputBuilder()
                    .setCustomId(
                        "name"
                    )
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
                    .setCustomId(
                        "type"
                    )
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
                    "admin_modal_congphap"
                )
                .setTitle(
                    "📖 QUẢN LÝ CÔNG PHÁP"
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

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // ĐAN DƯỢC
        // =================================================

        if (
            action === "danduoc"
        ) {

            const danInput =
                new TextInputBuilder()
                    .setCustomId(
                        "dan_name"
                    )
                    .setLabel(
                        "Tên đan dược"
                    )
                    .setPlaceholder(
                        "Ví dụ: Đan Đổi Linh Căn"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const danTypeInput =
                new TextInputBuilder()
                    .setCustomId(
                        "dan_type"
                    )
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

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // LUYỆN KHÍ
        // =================================================

        if (
            action === "luyenkhi"
        ) {

            const itemInput =
                new TextInputBuilder()
                    .setCustomId(
                        "item"
                    )
                    .setLabel(
                        "Tên pháp bảo"
                    )
                    .setPlaceholder(
                        "Ví dụ: Tru Tiên Kiếm"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const itemAmountInput =
                new TextInputBuilder()
                    .setCustomId(
                        "amount"
                    )
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

            const codeInput =
                new TextInputBuilder()
                    .setCustomId(
                        "code"
                    )
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
                    .setCustomId(
                        "reward"
                    )
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

            const codeAmountInput =
                new TextInputBuilder()
                    .setCustomId(
                        "code_amount"
                    )
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
                    )

            );

            return interaction.showModal(
                modal
            );
        }

        // =================================================
        // RESET
        // =================================================

        if (
            action === "reset"
        ) {

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
    },

    // =====================================================
    // MODAL
    // =====================================================

    async handleModal(interaction) {

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content:
                    "🚫 Bạn không có quyền sử dụng chức năng này!",
                ephemeral: true
            });
        }

        const data =
            loadData();

        const id =
            interaction.fields
                .getTextInputValue(
                    "user_id"
                )
                .replace(
                    /[<@!>]/g,
                    ""
                )
                .trim();

        if (
            !/^\d{17,20}$/.test(id)
        ) {
            return interaction.reply({
                content:
                    "❌ ID Discord không hợp lệ!",
                ephemeral: true
            });
        }

        // =================================================
        // CỘNG TU VI
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_add_tuvi"
        ) {

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số tu vi không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const oldTuvi =
                Number(
                    db.getPlayer?.(id)?.tuvi ??
                    data.users[id].tuvi ??
                    0
                ) || 0;

            const newTuvi =
                oldTuvi + amount;

            const realmInfo =
                await syncTuVi(
                    interaction,
                    id,
                    newTuvi,
                    data
                );

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0x2ecc71
                        )
                        .setTitle(
                            "✨ CỘNG TU VI THÀNH CÔNG"
                        )
                        .setDescription(

                            `👤 **Người chơi:** <@${id}>\n\n` +

                            `✨ **Đã cộng:** +${amount.toLocaleString()}\n` +

                            `⚔️ **Tu Vi:** ${newTuvi.toLocaleString()}\n` +

                            `🌱 **Cảnh giới:** **${realmInfo.realmName}**\n` +

                            `🔢 **Tầng:** **${realmInfo.tier}**`

                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // TRỪ TU VI
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_remove_tuvi"
        ) {

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số tu vi không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            const oldTuvi =
                Number(
                    db.getPlayer?.(id)?.tuvi ??
                    data.users[id].tuvi ??
                    0
                ) || 0;

            const newTuvi =
                Math.max(
                    0,
                    oldTuvi - amount
                );

            const realmInfo =
                await syncTuVi(
                    interaction,
                    id,
                    newTuvi,
                    data
                );

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0xe74c3c
                        )
                        .setTitle(
                            "❌ TRỪ TU VI THÀNH CÔNG"
                        )
                        .setDescription(

                            `👤 **Người chơi:** <@${id}>\n\n` +

                            `📉 **Đã trừ:** -${amount.toLocaleString()}\n` +

                            `⚔️ **Tu Vi:** ${newTuvi.toLocaleString()}\n` +

                            `🌱 **Cảnh giới:** **${realmInfo.realmName}**\n` +

                            `🔢 **Tầng:** **${realmInfo.tier}**`

                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // CỘNG LINH THẠCH
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_add_linhthach"
        ) {

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
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

            data.users[id].linhthach +=
                amount;

            saveData(data);

            return interaction.reply({
                content:
                    `💰 Đã cộng **${amount.toLocaleString()} linh thạch** cho <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // TRỪ LINH THẠCH
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_remove_linhthach"
        ) {

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
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

            data.users[id].linhthach =
                Math.max(
                    0,
                    data.users[id].linhthach -
                    amount
                );

            saveData(data);

            return interaction.reply({
                content:
                    `💸 Đã trừ **${amount.toLocaleString()} linh thạch** của <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // THIẾT LẬP CẢNH GIỚI
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_set_realm"
        ) {

            const realm =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "realm"
                        )
                );

            if (
                !Number.isInteger(
                    realm
                ) ||
                realm < 0 ||
                realm > 17
            ) {
                return interaction.reply({
                    content:
                        "❌ Cảnh giới phải từ **0 đến 17**!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            data.users[id].realm =
                realm;

            saveData(data);

            const player =
                db.getPlayer?.(id);

            if (
                player &&
                db.updatePlayer
            ) {
                db.updatePlayer(
                    id,
                    {
                        canhGioi:
                            realms[realm].name,

                        realm:

                            realm,

                        tang:
                            Math.max(
                                1,
                                Number(
                                    player.tang
                                ) || 1
                            )
                    }
                );
            }

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0x9b59b6
                        )
                        .setTitle(
                            "🌟 THIẾT LẬP CẢNH GIỚI"
                        )
                        .setDescription(

                            `👤 **Người chơi:** <@${id}>\n\n` +

                            `🌟 **Cảnh giới:** **${realms[realm].name}**\n` +

                            `🔢 **ID:** ${realm}`

                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // ĐẠO LỮ
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_daolu"
        ) {

            const partner =
                interaction.fields
                    .getTextInputValue(
                        "partner_id"
                    )
                    .replace(
                        /[<@!>]/g,
                        ""
                    )
                    .trim();

            const type =
                interaction.fields
                    .getTextInputValue(
                        "type"
                    )
                    .toLowerCase()
                    .trim();

            if (
                !/^\d{17,20}$/.test(
                    partner
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ ID đạo lữ không hợp lệ!",
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
                        "❌ Hãy nhập `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            if (
                !data.relationships
            ) {
                data.relationships = {};
            }

            if (
                !data.relationships[id]
            ) {
                data.relationships[id] =
                    [];
            }

            if (
                type === "add"
            ) {

                if (
                    !data.relationships[id]
                        .includes(
                            partner
                        )
                ) {
                    data.relationships[id]
                        .push(
                            partner
                        );
                }

                if (
                    !data.relationships[partner]
                ) {
                    data.relationships[partner] =
                        [];
                }

                if (
                    !data.relationships[partner]
                        .includes(id)
                ) {
                    data.relationships[partner]
                        .push(id);
                }

                saveData(data);

                return interaction.reply({
                    content:
                        `💞 Đã thiết lập <@${id}> và <@${partner}> trở thành đạo lữ.`,
                    ephemeral: true
                });
            }

            data.relationships[id] =
                data.relationships[id]
                    .filter(
                        x => x !== partner
                    );

            if (
                data.relationships[partner]
            ) {
                data.relationships[partner] =
                    data.relationships[partner]
                        .filter(
                            x => x !== id
                        );
            }

            saveData(data);

            return interaction.reply({
                content:
                    `💔 Đã xóa quan hệ đạo lữ giữa <@${id}> và <@${partner}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // CÔNG PHÁP
        // =================================================

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
                    .toLowerCase()
                    .trim();

            if (!name) {
                return interaction.reply({
                    content:
                        "❌ Tên công pháp không được để trống!",
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
                        "❌ Hãy nhập `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            if (
                type === "add"
            ) {

                if (
                    !data.users[id]
                        .congphap
                        .includes(name)
                ) {
                    data.users[id]
                        .congphap
                        .push(name);
                }

                saveData(data);

                return interaction.reply({
                    content:
                        `📖 Đã thêm công pháp **${name}** cho <@${id}>.`,
                    ephemeral: true
                });
            }

            data.users[id]
                .congphap =
                data.users[id]
                    .congphap
                    .filter(
                        x => x !== name
                    );

            saveData(data);

            return interaction.reply({
                content:
                    `📕 Đã xóa công pháp **${name}** của <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // ĐAN DƯỢC
        // =================================================

        if (
            interaction.customId ===
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
                );

            const type =
                interaction.fields
                    .getTextInputValue(
                        "dan_type"
                    )
                    .toLowerCase()
                    .trim();

            if (!danName) {
                return interaction.reply({
                    content:
                        "❌ Tên đan dược không được để trống!",
                    ephemeral: true
                });
            }

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phải là số nguyên lớn hơn 0!",
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
                        "❌ Hãy nhập `add` hoặc `remove`.",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            if (
                !data.users[id].dan
            ) {
                data.users[id].dan =
                    {};
            }

            // ADD
            if (
                type === "add"
            ) {

                data.users[id]
                    .dan[danName] =
                    (
                        data.users[id]
                            .dan[danName] ||
                        0
                    ) + amount;

                saveData(data);

                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()
                            .setColor(
                                0x2ecc71
                            )
                            .setTitle(
                                "💊 THÊM ĐAN DƯỢC THÀNH CÔNG"
                            )
                            .setDescription(

                                `👤 **Người chơi:** <@${id}>\n\n` +

                                `💊 **Đan dược:** ${danName}\n` +

                                `📦 **Số lượng:** +${amount}\n` +

                                `📊 **Hiện có:** ${data.users[id].dan[danName]}`

                            )

                    ],

                    ephemeral: true
                });
            }

            // REMOVE
            const current =
                data.users[id]
                    .dan[danName] ||
                0;

            if (
                current <= 0
            ) {
                return interaction.reply({
                    content:
                        `❌ <@${id}> không có **${danName}**.`,
                    ephemeral: true
                });
            }

            const newAmount =
                Math.max(
                    0,
                    current - amount
                );

            if (
                newAmount === 0
            ) {
                delete data.users[id]
                    .dan[danName];
            } else {
                data.users[id]
                    .dan[danName] =
                    newAmount;
            }

            saveData(data);

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0xe74c3c
                        )
                        .setTitle(
                            "💊 TRỪ ĐAN DƯỢC THÀNH CÔNG"
                        )
                        .setDescription(

                            `👤 **Người chơi:** <@${id}>\n\n` +

                            `💊 **Đan dược:** ${danName}\n` +

                            `📦 **Đã trừ:** -${amount}\n` +

                            `📊 **Còn lại:** ${newAmount}`

                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // LUYỆN KHÍ
        // =================================================

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
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
                );

            if (
                !item ||
                !Number.isSafeInteger(
                    amount
                ) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Tên pháp bảo hoặc số lượng không hợp lệ!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            data.users[id]
                .trangbi[item] =
                (
                    data.users[id]
                        .trangbi[item] ||
                    0
                ) + amount;

            saveData(data);

            return interaction.reply({
                content:
                    `⚔️ Đã trao **${item} ×${amount}** cho <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // TẠO CODE
        // =================================================

        if (
            interaction.customId ===
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
                );

            if (
                !/^[A-Z0-9_-]{3,32}$/.test(
                    code
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Code phải dài 3-32 ký tự, chỉ gồm A-Z, 0-9, _ hoặc -.",
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
                        "❌ Phần thưởng phải là `tuvi` hoặc `linhthach`.",
                    ephemeral: true
                });
            }

            if (
                !Number.isSafeInteger(
                    amount
                ) ||
                amount <= 0
            ) {
                return interaction.reply({
                    content:
                        "❌ Số lượng phải là số nguyên lớn hơn 0!",
                    ephemeral: true
                });
            }

            const codes =
                loadCodes();

            if (
                codes[code]
            ) {
                return interaction.reply({
                    content:
                        `❌ Code **${code}** đã tồn tại!`,
                    ephemeral: true
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

            if (
                !saveCodes(codes)
            ) {
                return interaction.reply({
                    content:
                        "❌ Không thể lưu code!",
                    ephemeral: true
                });
            }

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0x2ecc71
                        )
                        .setTitle(
                            "🔑 TẠO CODE THÀNH CÔNG"
                        )
                        .setDescription(

                            `🔐 **Code:** \`${code}\`\n\n` +

                            `🎁 **Phần thưởng:** ${reward}\n` +

                            `📦 **Số lượng:** ${amount.toLocaleString()}\n\n` +

                            "👤 Mỗi người chơi chỉ dùng được 1 lần."

                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // RESET
        // =================================================

        if (
            interaction.customId ===
            "admin_modal_reset"
        ) {

            delete data.users[id];

            if (
                data.relationships
            ) {

                delete data.relationships[id];

                for (
                    const userId in
                    data.relationships
                ) {

                    data.relationships[userId] =
                        data.relationships[userId]
                            .filter(
                                x => x !== id
                            );
                }
            }

            saveData(data);

            return interaction.reply({
                content:
                    `♻️ Đã reset toàn bộ dữ liệu của <@${id}>.`,
                ephemeral: true
            });
        }
    }
};
