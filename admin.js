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
// FILE PHỤ
// =====================================================

const DATA_DIR = "/app/data";

const CODE_FILE =
    path.join(DATA_DIR, "admin_codes.json");

const REL_FILE =
    path.join(DATA_DIR, "relationships.json");

const OLD_CODE_FILE =
    path.join(__dirname, "data", "admin_codes.json");

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

// =====================================================
// CẢNH GIỚI
// KHỚP VỚI HỆ THỐNG HIỆN TẠI
// =====================================================

const REALMS = [
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
    "Tiên Nhân",
    "Chân Tiên",
    "Thiên Tiên",
    "Huyền Tiên",
    "Kim Tiên",
    "Thánh Nhân",
    "Thiên Đạo",
    "Đại Đạo"
];

// =====================================================
// CODE
// =====================================================

function loadCodes() {

    try {

        if (fs.existsSync(CODE_FILE)) {

            const data =
                JSON.parse(
                    fs.readFileSync(
                        CODE_FILE,
                        "utf8"
                    )
                );

            return data &&
                typeof data === "object"
                ? data
                : {};
        }

        // Hỗ trợ code cũ

        if (fs.existsSync(OLD_CODE_FILE)) {

            const data =
                JSON.parse(
                    fs.readFileSync(
                        OLD_CODE_FILE,
                        "utf8"
                    )
                );

            return data &&
                typeof data === "object"
                ? data
                : {};
        }

    } catch (error) {

        console.error(
            "❌ Lỗi đọc admin_codes.json:",
            error
        );
    }

    return {};
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
// ĐẠO LỮ
// =====================================================

function loadRelationships() {

    try {

        if (!fs.existsSync(REL_FILE)) {
            return {};
        }

        const data =
            JSON.parse(
                fs.readFileSync(
                    REL_FILE,
                    "utf8"
                )
            );

        return data &&
            typeof data === "object"
            ? data
            : {};

    } catch (error) {

        console.error(
            "❌ Lỗi đọc relationships.json:",
            error
        );

        return {};
    }
}

function saveRelationships(data) {

    try {

        fs.writeFileSync(
            REL_FILE,
            JSON.stringify(
                data,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Lỗi lưu relationships.json:",
            error
        );

        return false;
    }
}

// =====================================================
// PLAYER
// =====================================================

function getOrCreatePlayer(
    id,
    username = "Admin"
) {

    let player =
        db.getPlayer(id);

    if (!player) {

        player =
            db.createPlayer(
                id,
                username
            );
    }

    if (!player) {

        throw new Error(
            "Không thể tạo player"
        );
    }

    const tuiDo =
        player.tuiDo || {};

    if (
        !Array.isArray(
            tuiDo.danDuoc
        )
    ) {
        tuiDo.danDuoc = [];
    }

    if (
        !Array.isArray(
            tuiDo.vatPham
        )
    ) {
        tuiDo.vatPham = [];
    }

    if (
        !Array.isArray(
            tuiDo.linhThu
        )
    ) {
        tuiDo.linhThu = [];
    }

    if (
        !Array.isArray(
            player.congphap
        )
    ) {
        player.congphap = [];
    }

    db.updatePlayer(
        id,
        {
            tuiDo,
            congphap:
                player.congphap
        }
    );

    return db.getPlayer(id);
}

// =====================================================
// LẤY ID
// =====================================================

function getId(interaction) {

    return interaction.fields
        .getTextInputValue(
            "user_id"
        )
        .replace(
            /[<@!>]/g,
            ""
        )
        .trim();
}

function validId(id) {

    return /^\d{17,20}$/.test(id);
}

// =====================================================
// INPUT
// =====================================================

function input(
    customId,
    label,
    placeholder,
    required = true
) {

    return new TextInputBuilder()
        .setCustomId(customId)
        .setLabel(label)
        .setPlaceholder(
            placeholder
        )
        .setStyle(
            TextInputStyle.Short
        )
        .setRequired(required);
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

module.exports = {

    data: command,

    // =================================================
    // MỞ ADMIN PANEL
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
                        label:
                            "Cộng Tu Vi",
                        description:
                            "Cộng tu vi",
                        value:
                            "add_tuvi",
                        emoji:
                            "✨"
                    },

                    {
                        label:
                            "Trừ Tu Vi",
                        description:
                            "Trừ tu vi",
                        value:
                            "remove_tuvi",
                        emoji:
                            "❌"
                    },

                    {
                        label:
                            "Cộng Linh Thạch",
                        description:
                            "Cộng linh thạch",
                        value:
                            "add_linhthach",
                        emoji:
                            "💰"
                    },

                    {
                        label:
                            "Trừ Linh Thạch",
                        description:
                            "Trừ linh thạch",
                        value:
                            "remove_linhthach",
                        emoji:
                            "💸"
                    },

                    {
                        label:
                            "Thiết Lập Cảnh Giới",
                        description:
                            "Thiết lập cảnh giới",
                        value:
                            "set_realm",
                        emoji:
                            "🌟"
                    },

                    {
                        label:
                            "Đạo Lữ",
                        description:
                            "Thêm hoặc xóa đạo lữ",
                        value:
                            "daolu",
                        emoji:
                            "💞"
                    },

                    {
                        label:
                            "Công Pháp",
                        description:
                            "Thêm hoặc xóa công pháp",
                        value:
                            "congphap",
                        emoji:
                            "📖"
                    },

                    {
                        label:
                            "Đan Dược",
                        description:
                            "Thêm hoặc xóa đan dược",
                        value:
                            "danduoc",
                        emoji:
                            "💊"
                    },

                    {
                        label:
                            "Luyện Khí",
                        description:
                            "Trao vật phẩm / pháp bảo",
                        value:
                            "luyenkhi",
                        emoji:
                            "⚔️"
                    },

                    {
                        label:
                            "🔑 Tạo Code",
                        description:
                            "Tạo code nhận phần thưởng",
                        value:
                            "create_code",
                        emoji:
                            "🎁"
                    },

                    {
                        label:
                            "Reset Nhân Vật",
                        description:
                            "Reset dữ liệu nhân vật",
                        value:
                            "reset",
                        emoji:
                            "♻️"
                    }

                ]);

        return interaction.reply({

            embeds: [

                new EmbedBuilder()
                    .setColor(0x8e44ad)
                    .setTitle(
                        "🛡️ HỒNG HOANG ĐẠI LỤC"
                    )
                    .setDescription(
                        "## ⚡ ADMIN PANEL\n\n" +
                        "🔽 **Chọn chức năng bên dưới.**\n\n" +
                        "🔒 Chỉ Admin mới sử dụng được."
                    )
                    .setFooter({
                        text:
                            `Admin: ${interaction.user.tag}`
                    })

            ],

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
            interaction.values?.[0];

        if (!action) {

            return interaction.reply({
                content:
                    "❌ Không xác định chức năng.",
                ephemeral: true
            });
        }

        const uid =
            input(
                "user_id",
                "ID người chơi",
                "Nhập ID Discord người chơi"
            );

        const amount =
            input(
                "amount",
                "Số lượng",
                "Ví dụ: 10000"
            );

        const modal =
            new ModalBuilder();

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
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(amount)

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
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(amount)

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

            modal
                .setCustomId(
                    "admin_modal_set_realm"
                )
                .setTitle(
                    "🌟 THIẾT LẬP CẢNH GIỚI"
                );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "realm",
                            "Tên cảnh giới",
                            "Ví dụ: Kim Tiên"
                        )
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

            modal
                .setCustomId(
                    "admin_modal_daolu"
                )
                .setTitle(
                    "💞 QUẢN LÝ ĐẠO LỮ"
                );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "partner",
                            "ID đạo lữ",
                            "Nhập ID Discord"
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "type",
                            "add hoặc remove",
                            "add = thêm | remove = xóa"
                        )
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

            modal
                .setCustomId(
                    "admin_modal_congphap"
                )
                .setTitle(
                    "📖 QUẢN LÝ CÔNG PHÁP"
                );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "name",
                            "Tên công pháp",
                            "Ví dụ: Cửu Chuyển Huyền Công"
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "type",
                            "add hoặc remove",
                            "add = thêm | remove = xóa"
                        )
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

            modal
                .setCustomId(
                    "admin_modal_danduoc"
                )
                .setTitle(
                    "💊 QUẢN LÝ ĐAN DƯỢC"
                );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "dan_name",
                            "Tên đan dược",
                            "Ví dụ: Đan Đổi Linh Căn"
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(amount),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "dan_type",
                            "add hoặc remove",
                            "add = thêm | remove = xóa"
                        )
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

            modal
                .setCustomId(
                    "admin_modal_luyenkhi"
                )
                .setTitle(
                    "⚔️ TRAO PHÁP BẢO / VẬT PHẨM"
                );

            modal.addComponents(

                new ActionRowBuilder()
                    .addComponents(uid),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "item",
                            "Tên vật phẩm",
                            "Ví dụ: Hỗn Độn Chung"
                        )
                    ),

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
                        input(
                            "code",
                            "Mã Code",
                            "Ví dụ: HONGHOANG2026"
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "reward",
                            "Phần thưởng",
                            "tuvi | linhthach | danduoc"
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "dan_name",
                            "Tên đan dược",
                            "Chỉ nhập khi reward = danduoc",
                            false
                        )
                    ),

                new ActionRowBuilder()
                    .addComponents(
                        input(
                            "code_amount",
                            "Số lượng",
                            "Ví dụ: 1"
                        )
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
                    .addComponents(uid)
            );

            return interaction.showModal(
                modal
            );
        }

        return interaction.reply({
            content:
                "❌ Chức năng chưa được hỗ trợ.",
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
                    "🚫 Bạn không có quyền sử dụng chức năng này!",
                ephemeral: true
            });
        }

        try {

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
                                "code_amount"
                            )
                            .trim()
                    );

                if (
                    !/^[A-Z0-9_-]{3,32}$/.test(
                        code
                    )
                ) {

                    return interaction.reply({
                        content:
                            "❌ Code phải 3-32 ký tự, chỉ A-Z, 0-9, _ hoặc -.",
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
                            "❌ Code đan dược phải có tên đan dược.",
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
                            "❌ Số lượng phải là số nguyên > 0.",
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

                    ...(reward === "danduoc"
                        ? {
                            danName
                        }
                        : {}),

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

            // =================================================
            // ID
            // =================================================

            const id =
                getId(interaction);

            if (
                !validId(id)
            ) {

                return interaction.reply({
                    content:
                        "❌ ID Discord không hợp lệ!",
                    ephemeral: true
                });
            }

            let player =
                getOrCreatePlayer(
                    id
                );

            // =================================================
            // CỘNG / TRỪ TU VI
            // =================================================

            if (
                interaction.customId ===
                    "admin_modal_add_tuvi" ||
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
                            "❌ Số Tu Vi không hợp lệ!",
                        ephemeral: true
                    });
                }

                const old =
                    Number(
                        player.tuvi
                    ) || 0;

                const add =
                    interaction.customId
                        .includes("add");

                const value =
                    add
                        ? old + amount
                        : Math.max(
                            0,
                            old - amount
                        );

                db.updatePlayer(
                    id,
                    {
                        tuvi:
                            value
                    }
                );

                return interaction.reply({

                    content:

                        `${add ? "✨ Đã cộng" : "❌ Đã trừ"} ` +

                        `**${amount.toLocaleString()} Tu Vi** ` +

                        `${add ? "cho" : "của"} <@${id}>.\n` +

                        `⚔️ Tu Vi hiện tại: **${value.toLocaleString()}**`,

                    ephemeral: true
                });
            }

            // =================================================
            // LINH THẠCH
            // =================================================

            if (
                interaction.customId ===
                    "admin_modal_add_linhthach" ||
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
                            "❌ Số Linh Thạch không hợp lệ!",
                        ephemeral: true
                    });
                }

                const old =
                    Number(
                        player.linhThach
                    ) || 0;

                const add =
                    interaction.customId
                        .includes("add");

                const value =
                    add
                        ? old + amount
                        : Math.max(
                            0,
                            old - amount
                        );

                db.updatePlayer(
                    id,
                    {
                        linhThach:
                            value
                    }
                );

                return interaction.reply({

                    content:

                        `${add ? "💰 Đã cộng" : "💸 Đã trừ"} ` +

                        `**${amount.toLocaleString()} Linh Thạch** ` +

                        `${add ? "cho" : "của"} <@${id}>.\n` +

                        `💎 Hiện tại: **${value.toLocaleString()}**`,

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

                const realmName =
                    interaction.fields
                        .getTextInputValue(
                            "realm"
                        )
                        .trim();

                const index =
                    REALMS.findIndex(
                        x =>
                            x.toLowerCase() ===
                            realmName.toLowerCase()
                    );

                if (
                    index === -1
                ) {

                    return interaction.reply({

                        content:

                            `❌ Cảnh giới không tồn tại!\n\n` +

                            `📜 Danh sách:\n` +

                            REALMS
                                .map(
                                    (x, i) =>
                                        `${i}. ${x}`
                                )
                                .join("\n"),

                        ephemeral: true
                    });
                }

                db.updatePlayer(
                    id,
                    {
                        realm:
                            index,

                        canhGioi:
                            REALMS[index],

                        tang:
                            1
                    }
                );

                return interaction.reply({

                    content:

                        `🌟 Đã đặt <@${id}> thành **${REALMS[index]}**.\n` +

                        `🔢 ID cảnh giới: **${index}**\n` +

                        `🔢 Tầng: **1**`,

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
                            "partner"
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
                    !validId(partner)
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

                const rel =
                    loadRelationships();

                if (
                    !Array.isArray(
                        rel[id]
                    )
                ) {
                    rel[id] = [];
                }

                if (
                    type === "add"
                ) {

                    if (
                        !Array.isArray(
                            rel[partner]
                        )
                    ) {
                        rel[partner] = [];
                    }

                    if (
                        !rel[id]
                            .includes(
                                partner
                            )
                    ) {

                        rel[id].push(
                            partner
                        );
                    }

                    if (
                        !rel[partner]
                            .includes(
                                id
                            )
                    ) {

                        rel[partner].push(
                            id
                        );
                    }

                    saveRelationships(
                        rel
                    );

                    return interaction.reply({
                        content:
                            `💞 Đã thiết lập <@${id}> và <@${partner}> trở thành đạo lữ.`,
                        ephemeral: true
                    });
                }

                rel[id] =
                    rel[id].filter(
                        x =>
                            x !== partner
                    );

                if (
                    Array.isArray(
                        rel[partner]
                    )
                ) {

                    rel[partner] =
                        rel[partner].filter(
                            x =>
                                x !== id
                        );
                }

                saveRelationships(
                    rel
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

                const list =
                    Array.isArray(
                        player.congphap
                    )
                        ? [
                            ...player.congphap
                        ]
                        : [];

                if (
                    type === "add"
                ) {

                    if (
                        !list.includes(
                            name
                        )
                    ) {

                        list.push(
                            name
                        );
                    }

                    db.updatePlayer(
                        id,
                        {
                            congphap:
                                list
                        }
                    );

                    return interaction.reply({
                        content:
                            `📖 Đã thêm công pháp **${name}** cho <@${id}>.`,
                        ephemeral: true
                    });
                }

                db.updatePlayer(
                    id,
                    {
                        congphap:
                            list.filter(
                                x =>
                                    x !== name
                            )
                    }
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
                            "❌ Số lượng phải là số nguyên > 0!",
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

                const list =
                    Array.isArray(
                        player.tuiDo.danDuoc
                    )
                        ? [
                            ...player.tuiDo.danDuoc
                        ]
                        : [];

                // ADD

                if (
                    type === "add"
                ) {

                    for (
                        let i = 0;
                        i < amount;
                        i++
                    ) {

                        list.push(
                            danName
                        );
                    }

                    db.updatePlayer(
                        id,
                        {
                            tuiDo: {
                                ...player.tuiDo,
                                danDuoc:
                                    list
                            }
                        }
                    );

                    const count =
                        list.filter(
                            x =>
                                x === danName
                        ).length;

                    return interaction.reply({
                        content:

                            `💊 Đã thêm **${danName} ×${amount}** cho <@${id}>.\n` +

                            `📦 Hiện có: **${count}**`,

                        ephemeral: true
                    });
                }

                // REMOVE

                let removed = 0;

                for (
                    let i =
                        list.length - 1;

                    i >= 0 &&
                    removed < amount;

                    i--
                ) {

                    if (
                        list[i] ===
                        danName
                    ) {

                        list.splice(
                            i,
                            1
                        );

                        removed++;
                    }
                }

                if (
                    removed === 0
                ) {

                    return interaction.reply({
                        content:
                            `❌ <@${id}> không có **${danName}**.`,
                        ephemeral: true
                    });
                }

                db.updatePlayer(
                    id,
                    {
                        tuiDo: {
                            ...player.tuiDo,
                            danDuoc:
                                list
                        }
                    }
                );

                return interaction.reply({
                    content:
                        `💊 Đã trừ **${danName} ×${removed}** của <@${id}>.`,
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

                if (!item) {

                    return interaction.reply({
                        content:
                            "❌ Tên vật phẩm không được để trống!",
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
                            "❌ Số lượng không hợp lệ!",
                        ephemeral: true
                    });
                }

                const list =
                    Array.isArray(
                        player.tuiDo.vatPham
                    )
                        ? [
                            ...player.tuiDo.vatPham
                        ]
                        : [];

                for (
                    let i = 0;
                    i < amount;
                    i++
                ) {

                    list.push(
                        item
                    );
                }

                db.updatePlayer(
                    id,
                    {
                        tuiDo: {
                            ...player.tuiDo,
                            vatPham:
                                list
                        }
                    }
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

                const old =
                    db.getPlayer(id);

                if (!old) {

                    return interaction.reply({
                        content:
                            "❌ Người chơi chưa có nhân vật.",
                        ephemeral: true
                    });
                }

                db.updatePlayer(
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

                        congphap: [],

                        tuiDo: {

                            danDuoc: [],

                            vatPham: [],

                            linhThu: []

                        }

                    }
                );

                const rel =
                    loadRelationships();

                delete rel[id];

                for (
                    const uid of
                    Object.keys(rel)
                ) {

                    if (
                        Array.isArray(
                            rel[uid]
                        )
                    ) {

                        rel[uid] =
                            rel[uid].filter(
                                x =>
                                    x !== id
                            );
                    }
                }

                saveRelationships(
                    rel
                );

                return interaction.reply({
                    content:
                        `♻️ Đã reset dữ liệu nhân vật của <@${id}>.`,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    "❌ Không tìm thấy chức năng Admin.",
                ephemeral: true
            });

        } catch (error) {

            console.error(
                "❌ Lỗi Admin Modal:",
                error
            );

            return interaction.reply({

                content:
                    `❌ Admin lỗi: ${error.message}`,

                ephemeral: true
            });
        }
    }
};
