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

// =====================================================
// DATABASE
// =====================================================

const dataPath = path.join(
    __dirname,
    "data",
    "data.json"
);

const codePath = path.join(
    __dirname,
    "data",
    "admin_codes.json"
);

// =====================================================
// LOAD DATA
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
            fs.readFileSync(
                dataPath,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Không thể đọc data.json:",
            error
        );

        return {
            users: {},
            relationships: {}
        };
    }
}

// =====================================================
// SAVE DATA
// =====================================================

function saveData(data) {

    const dir =
        path.dirname(dataPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(
            dir,
            { recursive: true }
        );
    }

    fs.writeFileSync(
        dataPath,
        JSON.stringify(
            data,
            null,
            2
        ),
        "utf8"
    );
}

// =====================================================
// LOAD CODE
// =====================================================

function loadCodes() {

    try {

        if (!fs.existsSync(codePath)) {
            return {};
        }

        return JSON.parse(
            fs.readFileSync(
                codePath,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Không thể đọc admin_codes.json:",
            error
        );

        return {};
    }
}

// =====================================================
// SAVE CODE
// =====================================================

function saveCodes(codes) {

    try {

        const dir =
            path.dirname(codePath);

        if (!fs.existsSync(dir)) {

            fs.mkdirSync(
                dir,
                {
                    recursive: true
                }
            );
        }

        fs.writeFileSync(
            codePath,
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
            "❌ Không thể lưu admin_codes.json:",
            error
        );

        return false;
    }
}

// =====================================================
// CREATE USER
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
// EXPORT
// =====================================================

module.exports = {

    data: command,

    // =================================================
    // EXECUTE
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

        // =================================================
        // MENU
        // =================================================

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
                        label: "Tạo Code",
                        description:
                            "Tạo code Tu Vi, Linh Thạch hoặc Đan Dược",
                        value: "create_code",
                        emoji: "🔑"
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

            embeds: [
                embed
            ],

            components: [
                row
            ],

            ephemeral: true

        });
    },

    // =====================================================
    // HANDLE SELECT
    // =====================================================

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

        // =================================================
        // INPUT CHUNG
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

            const typeInput =
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
                        typeInput
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
                    .setCustomId(
                        "code_amount"
                    )
                    .setLabel(
                        "Số lượng"
                    )
                    .setPlaceholder(
                        "Ví dụ: 1 hoặc 50000"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            const danNameInput =
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
                    .setRequired(false);

            modal
                .setCustomId(
                    "admin_modal_create_code"
                )
                .setTitle(
                    "🔑 TẠO CODE"
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

            const amountItemInput =
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
                        amountItemInput
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
    // HANDLE MODAL
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

            // =============================================
            // KIỂM TRA CODE
            // =============================================

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

            // =============================================
            // KIỂM TRA LOẠI
            // =============================================

            if (
                ![
                    "tuvi",
                    "linhthach",
                    "danduoc"
                ].includes(reward)
            ) {

                return interaction.reply({
                    content:
                        "❌ Loại phần thưởng phải là `tuvi`, `linhthach` hoặc `danduoc`.",
                    ephemeral: true
                });
            }

            // =============================================
            // KIỂM TRA SỐ LƯỢNG
            // =============================================

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

            // =============================================
            // KIỂM TRA TÊN ĐAN
            // =============================================

            if (
                reward === "danduoc" &&
                !danName
            ) {

                return interaction.reply({
                    content:
                        "❌ Khi chọn `danduoc`, bạn phải nhập tên đan dược.",
                    ephemeral: true
                });
            }

            // =============================================
            // LOAD CODE
            // =============================================

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

            // =============================================
            // TẠO CODE
            // =============================================

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
                reward ===
                "danduoc"
            ) {

                codes[code].danName =
                    danName;
            }

            // =============================================
            // LƯU
            // =============================================

            if (
                !saveCodes(
                    codes
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Không thể lưu code!",
                    ephemeral: true
                });
            }

            // =============================================
            // THÔNG BÁO
            // =============================================

            let rewardText;

            if (
                reward ===
                "tuvi"
            ) {

                rewardText =
                    `✨ **Tu Vi:** +${amount.toLocaleString()}`;

            } else if (
                reward ===
                "linhthach"
            ) {

                rewardText =
                    `💰 **Linh Thạch:** +${amount.toLocaleString()}`;

            } else {

                rewardText =
                    `💊 **Đan Dược:** ${danName}\n` +
                    `📦 **Số lượng:** ${amount.toLocaleString()}`;
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

                            `${rewardText}\n\n` +

                            "👤 Mỗi người chơi chỉ dùng được 1 lần."

                        )

                ],

                ephemeral: true

            });
        }

        // =================================================
        // DATABASE NGƯỜI CHƠI
        // =================================================

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

        // =================================================
        // KIỂM TRA ID
        // =================================================

        if (
            !/^\d{17,20}$/.test(
                id
            )
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

            data.users[id].tuvi +=
                amount;

            saveData(
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

                            `📊 **Tu vi hiện tại:** ${data.users[id].tuvi.toLocaleString()}`

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

            data.users[id].tuvi =
                Math.max(
                    0,
                    data.users[id].tuvi -
                    amount
                );

            saveData(
                data
            );

            return interaction.reply({
                content:
                    `❌ Đã trừ **${amount.toLocaleString()} tu vi** của <@${id}>.`,
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

            saveData(
                data
            );

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

            saveData(
                data
            );

            return interaction.reply({
                content:
                    `💸 Đã trừ **${amount.toLocaleString()} linh thạch** của <@${id}>.`,
                ephemeral: true
            });
        }

        // =================================================
        // CẢNH GIỚI
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

            saveData(
                data
            );

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

                            `🌟 **Cảnh giới:** ${realms[realm]}\n` +

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

                data.relationships[id] = [];
            }

            if (
                type ===
                "add"
            ) {

                if (
                    !data.relationships[id]
                        .includes(partner)
                ) {

                    data.relationships[id]
                        .push(partner);
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

                saveData(
                    data
                );

                return interaction.reply({
                    content:
                        `💞 Đã thiết lập <@${id}> và <@${partner}> trở thành đạo lữ.`,
                    ephemeral: true
                });
            }

            data.relationships[id] =
                data.relationships[id]
                    .filter(
                        x =>
                            x !== partner
                    );

            if (
                data.relationships[partner]
            ) {

                data.relationships[partner] =
                    data.relationships[partner]
                        .filter(
                            x =>
                                x !== id
                        );
            }

            saveData(
                data
            );

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

            if (!name) {

                return interaction.reply({
                    content:
                        "❌ Tên công pháp không được để trống!",
                    ephemeral: true
                });
            }

            createUser(
                data,
                id
            );

            if (
                type ===
                "add"
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

                saveData(
                    data
                );

                return interaction.reply({
                    content:
                        `📖 Đã thêm công pháp **${name}** cho <@${id}>.`,
                    ephemeral: true
                });
            }

            data.users[id].congphap =
                data.users[id]
                    .congphap
                    .filter(
                        x =>
                            x !== name
                    );

            saveData(
                data
            );

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
                type ===
                "add"
            ) {

                data.users[id]
                    .dan[danName] =
                    (
                        data.users[id]
                            .dan[danName] ||
                        0
                    ) +
                    amount;

                saveData(
                    data
                );

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
                    current -
                    amount
                );

            if (
                newAmount ===
                0
            ) {

                delete data.users[id]
                    .dan[danName];

            } else {

                data.users[id]
                    .dan[danName] =
                    newAmount;
            }

            saveData(
                data
            );

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

            data.users[id]
                .trangbi[item] =
                (
                    data.users[id]
                        .trangbi[item] ||
                    0
                ) +
                amount;

            saveData(
                data
            );

            return interaction.reply({
                content:
                    `⚔️ Đã trao **${item} ×${amount}** cho <@${id}>.`,
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
                    const userId
                    in data.relationships
                ) {

                    data.relationships[userId] =
                        data.relationships[userId]
                            .filter(
                                x =>
                                    x !== id
                            );
                }
            }

            saveData(
                data
            );

            return interaction.reply({
                content:
                    `♻️ Đã reset toàn bộ dữ liệu của <@${id}>.`,
                ephemeral: true
            });
        }
    }
};
