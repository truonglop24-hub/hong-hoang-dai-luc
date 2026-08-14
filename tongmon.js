const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionFlagsBits
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ===============================
// 📁 DATABASE TÔNG MÔN
// ===============================

const DATA_FILE = path.join(__dirname, "tongmon.json");

function loadTongMon() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify({ tongmons: {} }, null, 2)
            );
        }

        const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));

        if (!data.tongmons) {
            data.tongmons = {};
        }

        return data;
    } catch (error) {
        console.error("❌ Lỗi đọc tongmon.json:", error);
        return { tongmons: {} };
    }
}

function saveTongMon(data) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("❌ Lỗi lưu tongmon.json:", error);
    }
}

// ===============================
// 🆔 TẠO ID
// ===============================

function taoID() {
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    ).toUpperCase();
}

// ===============================
// 🔎 TÌM TÔNG MÔN CỦA NGƯỜI CHƠI
// ===============================

function timTongMonCuaUser(data, userId) {
    for (const [id, tong] of Object.entries(data.tongmons)) {
        if (tong.thanhVien && tong.thanhVien[userId]) {
            return {
                id,
                tong
            };
        }
    }

    return null;
}

// ===============================
// 👑 KIỂM TRA CHỦ TÔNG
// ===============================

function laChuTong(tong, userId) {
    return tong.chuTong === userId;
}

// ===============================
// 🏅 CẤP BẬC
// ===============================

const CAP_BAC = {
    chu_tong: {
        ten: "👑 Tông Chủ",
        emoji: "👑"
    },

    pho_tong: {
        ten: "💎 Phó Tông Chủ",
        emoji: "💎"
    },

    truong_lao: {
        ten: "🔥 Trưởng Lão",
        emoji: "🔥"
    },

    ho_phap: {
        ten: "🛡️ Hộ Pháp",
        emoji: "🛡️"
    },

    de_tu: {
        ten: "🌱 Đệ Tử",
        emoji: "🌱"
    }
};

// ===============================
// 🏯 SLASH COMMAND
// ===============================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tongmon")
        .setDescription("🏯 Hệ thống Tông Môn Hồng Hoang Đại Lục"),

    async execute(interaction) {

        const data = loadTongMon();

        // ===============================
        // 🏯 UI CHÍNH
        // ===============================

        const embed = new EmbedBuilder()
            .setTitle("🏯 HỒNG HOANG ĐẠI LỤC")
            .setDescription(
                "## 🏯 HỆ THỐNG TÔNG MÔN\n\n" +
                "⚔️ **Gia nhập tông môn** để cùng tu luyện.\n" +
                "👑 **Tạo tông môn** để trở thành Tông Chủ.\n" +
                "💎 **Quản lý thành viên** và phát triển thế lực.\n" +
                "🏆 **Tranh bá** cùng các tông môn khác.\n\n" +
                "━━━━━━━━━━━━━━━━━━━━\n" +
                "🌌 *Một bước vào tông môn — vạn dặm tu tiên!*"
            )
            .setFooter({
                text: "🏯 Hồng Hoang Đại Lục • Tông Môn"
            })
            .setTimestamp();

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("tm_tao")
                .setLabel("Tạo Tông Môn")
                .setEmoji("🏯")
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId("tm_danhsach")
                .setLabel("Danh Sách")
                .setEmoji("📜")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("tm_thongtin")
                .setLabel("Tông Môn Của Tôi")
                .setEmoji("🏠")
                .setStyle(ButtonStyle.Success)
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("tm_gianhap")
                .setLabel("Gia Nhập")
                .setEmoji("⚔️")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("tm_roi")
                .setLabel("Rời Tông Môn")
                .setEmoji("🚪")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("tm_top")
                .setLabel("Xếp Hạng")
                .setEmoji("🏆")
                .setStyle(ButtonStyle.Primary)
        );

        await interaction.reply({
            embeds: [embed],
            components: [row1, row2]
        });
    },

    // ===============================
    // 🔘 BUTTON HANDLER
    // ===============================

    async buttonHandler(interaction) {

        const data = loadTongMon();

        // ===============================
        // 🏯 TẠO TÔNG MÔN
        // ===============================

        if (interaction.customId === "tm_tao") {

            const hienTai = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (hienTai) {
                return interaction.reply({
                    content:
                        "❌ Bạn đã thuộc **" +
                        hienTai.tong.ten +
                        "** rồi!",
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId("tm_modal_tao")
                .setTitle("🏯 Tạo Tông Môn");

            const input = new TextInputBuilder()
                .setCustomId("ten_tong")
                .setLabel("Tên Tông Môn")
                .setPlaceholder("VD: Vạn Kiếm Tiên Tông")
                .setStyle(TextInputStyle.Short)
                .setMinLength(2)
                .setMaxLength(30)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(input)
            );

            return interaction.showModal(modal);
        }

        // ===============================
        // 📜 DANH SÁCH TÔNG MÔN
        // ===============================

        if (interaction.customId === "tm_danhsach") {

            const list = Object.values(data.tongmons);

            if (list.length === 0) {
                return interaction.reply({
                    content:
                        "📜 **Chưa có tông môn nào được thành lập.**",
                    ephemeral: true
                });
            }

            const top = list
                .sort(
                    (a, b) =>
                        (b.diem || 0) -
                        (a.diem || 0)
                )
                .slice(0, 10);

            let text =
                "## 🏯 DANH SÁCH TÔNG MÔN\n\n";

            top.forEach((tong, index) => {

                const soThanhVien =
                    Object.keys(
                        tong.thanhVien || {}
                    ).length;

                text +=
                    `**${index + 1}.** 🏯 **${tong.ten}**\n` +
                    `> 👥 ${soThanhVien} thành viên • 🏆 ${tong.diem || 0} điểm\n\n`;
            });

            const embed = new EmbedBuilder()
                .setTitle("📜 TÔNG MÔN HỒNG HOANG")
                .setDescription(text)
                .setFooter({
                    text: "🏯 Top 10 Tông Môn"
                });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // ===============================
        // 🏠 THÔNG TIN TÔNG MÔN
        // ===============================

        if (interaction.customId === "tm_thongtin") {

            const result = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn hiện **chưa thuộc tông môn nào**.",
                    ephemeral: true
                });
            }

            const tong = result.tong;

            const members =
                Object.entries(
                    tong.thanhVien || {}
                );

            let danhSach = "";

            for (const [id, member] of members.slice(0, 15)) {

                const cap =
                    CAP_BAC[member.capBac] ||
                    CAP_BAC.de_tu;

                danhSach +=
                    `${cap.emoji} <@${id}> — **${cap.ten}**\n`;
            }

            if (!danhSach) {
                danhSach = "🌱 Chưa có thành viên.";
            }

            const embed = new EmbedBuilder()
                .setTitle(`🏯 ${tong.ten}`)
                .setDescription(
                    `👑 **Tông Chủ:** <@${tong.chuTong}>\n\n` +
                    `🏆 **Điểm Tông Môn:** ${tong.diem || 0}\n` +
                    `👥 **Thành Viên:** ${members.length}\n` +
                    `📅 **Ngày Thành Lập:** <t:${Math.floor(tong.ngayTao / 1000)}:D>\n\n` +
                    `━━━━━━━━━━━━━━━━━━━━\n` +
                    `### 👥 Thành Viên\n${danhSach}`
                )
                .setFooter({
                    text: "🏯 Tông Môn • Hồng Hoang Đại Lục"
                });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("tm_quanly")
                    .setLabel("Quản Lý")
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_thanhvien")
                    .setLabel("Thành Viên")
                    .setEmoji("👥")
                    .setStyle(ButtonStyle.Secondary)
            );

            return interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }

        // ===============================
        // ⚔️ GIA NHẬP
        // ===============================

        if (interaction.customId === "tm_gianhap") {

            const hienTai = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (hienTai) {
                return interaction.reply({
                    content:
                        `❌ Bạn đang thuộc **${hienTai.tong.ten}**.`,
                    ephemeral: true
                });
            }

            const list = Object.values(data.tongmons);

            if (list.length === 0) {
                return interaction.reply({
                    content:
                        "❌ Hiện chưa có tông môn nào.",
                    ephemeral: true
                });
            }

            const options = list
                .slice(0, 25)
                .map(tong => ({
                    label: tong.ten.substring(0, 100),
                    description:
                        `👥 ${Object.keys(tong.thanhVien || {}).length} thành viên`,
                    value: tong.id
                }));

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId("tm_select_gianhap")
                    .setPlaceholder("⚔️ Chọn tông môn muốn gia nhập")
                    .addOptions(options);

            return interaction.reply({
                content:
                    "## ⚔️ GIA NHẬP TÔNG MÔN\n\n" +
                    "🌌 Hãy chọn tông môn mà bạn muốn gia nhập:",
                components: [
                    new ActionRowBuilder().addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // ===============================
        // 🚪 RỜI TÔNG MÔN
        // ===============================

        if (interaction.customId === "tm_roi") {

            const result = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn không thuộc tông môn nào.",
                    ephemeral: true
                });
            }

            if (
                result.tong.chuTong ===
                interaction.user.id
            ) {
                return interaction.reply({
                    content:
                        "👑 **Tông Chủ không thể rời tông môn.**\n" +
                        "⚠️ Hãy chuyển chức Tông Chủ trước.",
                    ephemeral: true
                });
            }

            delete result.tong.thanhVien[
                interaction.user.id
            ];

            saveTongMon(data);

            return interaction.reply({
                content:
                    `🚪 Bạn đã rời **${result.tong.ten}**.\n\n` +
                    "🌌 Con đường tu tiên mới lại bắt đầu!",
                ephemeral: true
            });
        }

        // ===============================
        // 🏆 XẾP HẠNG
        // ===============================

        if (interaction.customId === "tm_top") {

            const list = Object.values(data.tongmons)
                .sort(
                    (a, b) =>
                        (b.diem || 0) -
                        (a.diem || 0)
                )
                .slice(0, 10);

            let text =
                "## 🏆 TOP TÔNG MÔN\n\n";

            if (list.length === 0) {
                text =
                    "🌌 Chưa có tông môn nào.";
            } else {

                list.forEach((tong, i) => {

                    const medal =
                        i === 0
                            ? "🥇"
                            : i === 1
                            ? "🥈"
                            : i === 2
                            ? "🥉"
                            : `🏅 ${i + 1}.`;

                    text +=
                        `${medal} **${tong.ten}**\n` +
                        `> 🏆 ${tong.diem || 0} điểm • 👥 ${Object.keys(tong.thanhVien || {}).length} người\n\n`;
                });
            }

            const embed = new EmbedBuilder()
                .setTitle("🏆 BẢNG XẾP HẠNG TÔNG MÔN")
                .setDescription(text)
                .setFooter({
                    text: "⚔️ Tranh bá Hồng Hoang"
                });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // ===============================
        // 👥 DANH SÁCH THÀNH VIÊN
        // ===============================

        if (interaction.customId === "tm_thanhvien") {

            const result = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc tông môn nào.",
                    ephemeral: true
                });
            }

            const members =
                Object.entries(
                    result.tong.thanhVien
                );

            let text =
                `## 👥 THÀNH VIÊN ${result.tong.ten}\n\n`;

            members.forEach(([id, member], i) => {

                const cap =
                    CAP_BAC[member.capBac] ||
                    CAP_BAC.de_tu;

                text +=
                    `**${i + 1}.** ${cap.emoji} <@${id}> — ${cap.ten}\n`;
            });

            const embed = new EmbedBuilder()
                .setDescription(text)
                .setFooter({
                    text: `👥 ${members.length} thành viên`
                });

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }

        // ===============================
        // ⚙️ QUẢN LÝ
        // ===============================

        if (interaction.customId === "tm_quanly") {

            const result = timTongMonCuaUser(
                data,
                interaction.user.id
            );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc tông môn.",
                    ephemeral: true
                });
            }

            if (
                !laChuTong(
                    result.tong,
                    interaction.user.id
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ **Tông Chủ** mới có quyền quản lý.",
                    ephemeral: true
                });
            }

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId("tm_menu_quanly")
                    .setPlaceholder("⚙️ Chọn chức năng quản lý")
                    .addOptions([
                        {
                            label: "👑 Cấp Phó Tông Chủ",
                            description: "Bổ nhiệm thành viên",
                            value: "cap_pho"
                        },
                        {
                            label: "🔥 Cấp Trưởng Lão",
                            description: "Bổ nhiệm Trưởng Lão",
                            value: "cap_truong_lao"
                        },
                        {
                            label: "🛡️ Cấp Hộ Pháp",
                            description: "Bổ nhiệm Hộ Pháp",
                            value: "cap_ho_phap"
                        },
                        {
                            label: "🌱 Hạ Cấp",
                            description: "Đưa về Đệ Tử",
                            value: "ha_cap"
                        },
                        {
                            label: "⚔️ Tăng Điểm",
                            description: "Tăng điểm tông môn",
                            value: "tang_diem"
                        }
                    ]);

            return interaction.reply({
                content:
                    "## ⚙️ QUẢN LÝ TÔNG MÔN\n\n" +
                    "👑 Chỉ Tông Chủ mới có quyền sử dụng.",
                components: [
                    new ActionRowBuilder().addComponents(menu)
                ],
                ephemeral: true
            });
        }
    },

    // ===============================
    // 🪟 MODAL HANDLER
    // ===============================

    async modalHandler(interaction) {

        if (
            interaction.customId !==
            "tm_modal_tao"
        ) {
            return;
        }

        const data = loadTongMon();

        const hienTai = timTongMonCuaUser(
            data,
            interaction.user.id
        );

        if (hienTai) {
            return interaction.reply({
                content:
                    "❌ Bạn đã thuộc một tông môn.",
                ephemeral: true
            });
        }

        const ten =
            interaction.fields
                .getTextInputValue("ten_tong")
                .trim();

        if (ten.length < 2) {
            return interaction.reply({
                content:
                    "❌ Tên tông môn quá ngắn.",
                ephemeral: true
            });
        }

        const trung =
            Object.values(data.tongmons)
                .some(
                    t =>
                        t.ten.toLowerCase() ===
                        ten.toLowerCase()
                );

        if (trung) {
            return interaction.reply({
                content:
                    "❌ Tên tông môn này đã tồn tại.",
                ephemeral: true
            });
        }

        const id = taoID();

        data.tongmons[id] = {
            id,
            ten,
            chuTong: interaction.user.id,

            thanhVien: {
                [interaction.user.id]: {
                    capBac: "chu_tong",
                    ngayGiaNhap: Date.now()
                }
            },

            diem: 0,
            capDo: 1,
            ngayTao: Date.now()
        };

        saveTongMon(data);

        const embed = new EmbedBuilder()
            .setTitle("🏯 TẠO TÔNG MÔN THÀNH CÔNG")
            .setDescription(
                `🌌 Chúc mừng **<@${interaction.user.id}>**!\n\n` +
                `🏯 **Tông Môn:** ${ten}\n` +
                `👑 **Tông Chủ:** <@${interaction.user.id}>\n` +
                `📈 **Cấp Độ:** 1\n` +
                `🏆 **Điểm:** 0\n\n` +
                "⚔️ Con đường tranh bá Hồng Hoang chính thức bắt đầu!"
            )
            .setFooter({
                text: "🏯 Hồng Hoang Đại Lục"
            });

        return interaction.reply({
            embeds: [embed]
        });
    },

    // ===============================
    // 📋 SELECT MENU HANDLER
    // ===============================

    async selectHandler(interaction) {

        const data = loadTongMon();

        // ===============================
        // ⚔️ GIA NHẬP
        // ===============================

        if (
            interaction.customId ===
            "tm_select_gianhap"
        ) {

            const tongId =
                interaction.values[0];

            const tong =
                data.tongmons[tongId];

            if (!tong) {
                return interaction.reply({
                    content:
                        "❌ Tông môn không tồn tại.",
                    ephemeral: true
                });
            }

            const hienTai =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (hienTai) {
                return interaction.reply({
                    content:
                        "❌ Bạn đã thuộc một tông môn.",
                    ephemeral: true
                });
            }

            tong.thanhVien[
                interaction.user.id
            ] = {
                capBac: "de_tu",
                ngayGiaNhap: Date.now()
            };

            saveTongMon(data);

            return interaction.update({
                content:
                    `⚔️ **GIA NHẬP THÀNH CÔNG!**\n\n` +
                    `🏯 Tông môn: **${tong.ten}**\n` +
                    `🌱 Cấp bậc: **Đệ Tử**\n\n` +
                    "🔥 Hãy bắt đầu con đường tu tiên!",
                components: []
            });
        }

        // ===============================
        // ⚙️ QUẢN LÝ
        // ===============================

        if (
            interaction.customId ===
            "tm_menu_quanly"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn không thuộc tông môn.",
                    ephemeral: true
                });
            }

            if (
                !laChuTong(
                    result.tong,
                    interaction.user.id
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ Tông Chủ mới có quyền.",
                    ephemeral: true
                });
            }

            const action =
                interaction.values[0];

            if (
                action === "cap_pho" ||
                action === "cap_truong_lao" ||
                action === "cap_ho_phap" ||
                action === "ha_cap"
            ) {

                const capBac =
                    action === "cap_pho"
                        ? "pho_tong"
                        : action === "cap_truong_lao"
                        ? "truong_lao"
                        : action === "cap_ho_phap"
                        ? "ho_phap"
                        : "de_tu";

                const modal =
                    new ModalBuilder()
                        .setCustomId(
                            `tm_modal_cap_${capBac}`
                        )
                        .setTitle("👑 Thay Đổi Cấp Bậc");

                const input =
                    new TextInputBuilder()
                        .setCustomId("user_id")
                        .setLabel("ID Discord thành viên")
                        .setPlaceholder("123456789012345678")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder()
                        .addComponents(input)
                );

                return interaction.showModal(modal);
            }

            if (action === "tang_diem") {

                result.tong.diem =
                    (result.tong.diem || 0) + 100;

                saveTongMon(data);

                return interaction.update({
                    content:
                        "🏆 **TÔNG MÔN NHẬN ĐƯỢC 100 ĐIỂM!**\n\n" +
                        `🏯 ${result.tong.ten}\n` +
                        `🏆 Điểm hiện tại: **${result.tong.diem}**`,
                    components: []
                });
            }
        }
    }
};
