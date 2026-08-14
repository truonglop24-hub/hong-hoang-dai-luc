const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ======================================================
// 📁 DATABASE
// ======================================================

const DATA_FILE = path.join(__dirname, "tongmon.json");

function loadTongMon() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify({ tongmons: {} }, null, 2)
            );
        }

        const data = JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

        if (!data.tongmons) {
            data.tongmons = {};
        }

        return data;
    } catch (error) {
        console.error("❌ Lỗi đọc tongmon.json:", error);

        return {
            tongmons: {}
        };
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

// ======================================================
// 🆔 ID
// ======================================================

function taoID() {
    return (
        Date.now().toString(36) +
        Math.random()
            .toString(36)
            .substring(2, 8)
    ).toUpperCase();
}

// ======================================================
// 🔎 TÌM TÔNG MÔN
// ======================================================

function timTongMonCuaUser(data, userId) {
    for (const [id, tong] of Object.entries(data.tongmons)) {
        if (
            tong.thanhVien &&
            tong.thanhVien[userId]
        ) {
            return {
                id,
                tong
            };
        }
    }

    return null;
}

// ======================================================
// 👑 CẤP BẬC
// ======================================================

const CAP_BAC = {

    chu_tong: {
        ten: "👑 Tông Chủ",
        emoji: "👑",
        quyen: 100
    },

    pho_tong: {
        ten: "💎 Phó Tông Chủ",
        emoji: "💎",
        quyen: 80
    },

    truong_lao: {
        ten: "🔥 Trưởng Lão",
        emoji: "🔥",
        quyen: 60
    },

    ho_phap: {
        ten: "🛡️ Hộ Pháp",
        emoji: "🛡️",
        quyen: 40
    },

    de_tu: {
        ten: "🌱 Đệ Tử",
        emoji: "🌱",
        quyen: 10
    }
};

// ======================================================
// 🛠️ KHỞI TẠO DỮ LIỆU CŨ
// ======================================================

function khoiTaoTong(tong) {

    if (!tong.thanhVien) {
        tong.thanhVien = {};
    }

    if (typeof tong.diem !== "number") {
        tong.diem = 0;
    }

    if (typeof tong.capDo !== "number") {
        tong.capDo = 1;
    }

    if (!tong.khoBau) {
        tong.khoBau = {
            linhThach: 0,
            danDuoc: {},
            phapBao: {},
            congPhap: {}
        };
    }

    if (!tong.lanhDia) {
        tong.lanhDia = {
            cap: 1,
            hp: 10000,
            phongThu: 100,
            sanLuong: 100,
            chienLuc: 100
        };
    }

    if (!tong.kyNang) {
        tong.kyNang = {
            hoThe: 1,
            chienY: 1,
            tuLinh: 1,
            tuTai: 1,
            hoTong: 1,
            chienHon: 1
        };
    }

    if (!tong.chienTranh) {
        tong.chienTranh = {
            dangChien: false,
            doiThu: null,
            diem: 0,
            lichSu: []
        };
    }

    if (!tong.nhiemVu) {
        tong.nhiemVu = {
            nhiemVu: null,
            tienDo: 0,
            daNhan: false
        };
    }

    if (!tong.nhatKy) {
        tong.nhatKy = [];
    }

    return tong;
}

// ======================================================
// 📝 NHẬT KÝ
// ======================================================

function ghiNhatKy(tong, text) {

    khoiTaoTong(tong);

    tong.nhatKy.unshift({
        text,
        time: Date.now()
    });

    if (tong.nhatKy.length > 30) {
        tong.nhatKy =
            tong.nhatKy.slice(0, 30);
    }
}

// ======================================================
// 👑 QUYỀN
// ======================================================

function layQuyen(tong, userId) {

    const member =
        tong.thanhVien?.[userId];

    if (!member) {
        return 0;
    }

    return (
        CAP_BAC[member.capBac]?.quyen || 10
    );
}

function coQuyen(tong, userId, quyen) {
    return layQuyen(tong, userId) >= quyen;
}

// ======================================================
// 📊 MENU CHÍNH
// ======================================================

function menuChinh() {

    const row1 =
        new ActionRowBuilder()
            .addComponents(

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

    const row2 =
        new ActionRowBuilder()
            .addComponents(

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

    return [row1, row2];
}

// ======================================================
// 🏯 MENU TÔNG MÔN
// ======================================================

function menuTongMon() {

    const row1 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_info")
                    .setLabel("Thông Tin")
                    .setEmoji("📊")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_thanhvien")
                    .setLabel("Thành Viên")
                    .setEmoji("👥")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("tm_quanly")
                    .setLabel("Chức Vụ")
                    .setEmoji("👑")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_chientranh")
                    .setLabel("Chiến Tranh")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("tm_nhiemvu")
                    .setLabel("Nhiệm Vụ")
                    .setEmoji("📜")
                    .setStyle(ButtonStyle.Primary)
            );

    const row2 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_khobau")
                    .setLabel("Kho Báu")
                    .setEmoji("💎")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_lanhdia")
                    .setLabel("Lãnh Địa")
                    .setEmoji("🏯")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_kynang")
                    .setLabel("Kỹ Năng")
                    .setEmoji("🌟")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_nhatky")
                    .setLabel("Nhật Ký")
                    .setEmoji("📖")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("tm_top")
                    .setLabel("BXH")
                    .setEmoji("🏆")
                    .setStyle(ButtonStyle.Primary)
            );

    const row3 =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_back")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            );

    return [
        row1,
        row2,
        row3
    ];
}

// ======================================================
// ⚔️ MENU CHIẾN TRANH
// ======================================================

function menuChienTranh() {

    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_tuyenchien")
                    .setLabel("Tuyên Chiến")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("tm_chiendau")
                    .setLabel("Chiến Đấu")
                    .setEmoji("🔥")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("tm_chienbao")
                    .setLabel("Chiến Báo")
                    .setEmoji("📜")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_phongthu")
                    .setLabel("Phòng Thủ")
                    .setEmoji("🛡️")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_back_chientranh")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            )
    ];
}

// ======================================================
// 📜 MENU NHIỆM VỤ
// ======================================================

function menuNhiemVu() {

    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_nv_danhsach")
                    .setLabel("Nhiệm Vụ")
                    .setEmoji("📜")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_nv_tiendo")
                    .setLabel("Tiến Độ")
                    .setEmoji("📊")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("tm_nv_nhan")
                    .setLabel("Nhận Thưởng")
                    .setEmoji("🎁")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_back_nhiemvu")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            )
    ];
}

// ======================================================
// 💎 MENU KHO BÁU
// ======================================================

function menuKhoBau() {

    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_kho_xem")
                    .setLabel("Xem Kho")
                    .setEmoji("💎")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_kho_donggop")
                    .setLabel("Đóng Góp")
                    .setEmoji("📥")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_kho_nhan")
                    .setLabel("Nhận Vật Phẩm")
                    .setEmoji("📤")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_back_khobau")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            )
    ];
}

// ======================================================
// 🏯 MENU LÃNH ĐỊA
// ======================================================

function menuLanhDia() {

    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_ld_info")
                    .setLabel("Thông Tin")
                    .setEmoji("📊")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_ld_nangcap")
                    .setLabel("Nâng Cấp")
                    .setEmoji("⬆️")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_ld_phongthu")
                    .setLabel("Phòng Thủ")
                    .setEmoji("🛡️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_back_lanhdia")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            )
    ];
}

// ======================================================
// 🌟 MENU KỸ NĂNG
// ======================================================

function menuKyNang() {

    return [
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_kn_hothe")
                    .setLabel("Hộ Thể")
                    .setEmoji("❤️")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_kn_chieny")
                    .setLabel("Chiến Ý")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("tm_kn_tulinh")
                    .setLabel("Tụ Linh")
                    .setEmoji("🌀")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("tm_kn_tutai")
                    .setLabel("Tụ Tài")
                    .setEmoji("💎")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("tm_kn_hotong")
                    .setLabel("Hộ Tông")
                    .setEmoji("🛡️")
                    .setStyle(ButtonStyle.Primary)
            ),

        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("tm_kn_chienhon")
                    .setLabel("Chiến Hồn")
                    .setEmoji("🔥")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("tm_back_kynang")
                    .setLabel("Quay Lại")
                    .setEmoji("↩️")
                    .setStyle(ButtonStyle.Secondary)
            )
    ];
}

// ======================================================
// 🏯 COMMAND
// ======================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("tongmon")
            .setDescription(
                "🏯 Hệ thống Tông Môn Hồng Hoang Đại Lục"
            ),

    // ==================================================
    // /TONGMON
    // ==================================================

    async execute(interaction) {

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🏯 HỒNG HOANG ĐẠI LỤC"
                )
                .setDescription(
                    "## 🏯 HỆ THỐNG TÔNG MÔN\n\n" +

                    "⚔️ **Gia nhập tông môn** để cùng tu luyện.\n" +
                    "👑 **Tạo tông môn** để trở thành Tông Chủ.\n" +
                    "💎 **Phát triển kho báu và lãnh địa.**\n" +
                    "⚔️ **Tranh bá cùng các thế lực khác.**\n\n" +

                    "━━━━━━━━━━━━━━━━━━━━\n\n" +

                    "🌌 *Một bước vào tông môn — vạn dặm tu tiên!*"
                )
                .setFooter({
                    text:
                        "🏯 Hồng Hoang Đại Lục • Tông Môn"
                })
                .setTimestamp();

        return interaction.reply({
            embeds: [embed],
            components: menuChinh()
        });
    },

    // ==================================================
    // 🔘 BUTTON
    // ==================================================

    async buttonHandler(interaction) {

        const data = loadTongMon();

        const id =
            interaction.customId;

        // ==================================================
        // 🏯 TẠO
        // ==================================================

        if (id === "tm_tao") {

            const hienTai =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (hienTai) {
                return interaction.reply({
                    content:
                        `❌ Bạn đã thuộc **${hienTai.tong.ten}**.`,
                    ephemeral: true
                });
            }

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "tm_modal_tao"
                    )
                    .setTitle(
                        "🏯 Tạo Tông Môn"
                    );

            const input =
                new TextInputBuilder()
                    .setCustomId(
                        "ten_tong"
                    )
                    .setLabel(
                        "Tên Tông Môn"
                    )
                    .setPlaceholder(
                        "VD: Vạn Kiếm Tiên Tông"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setMinLength(2)
                    .setMaxLength(30)
                    .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(input)
            );

            return interaction.showModal(modal);
        }

        // ==================================================
        // 📜 DANH SÁCH
        // ==================================================

        if (id === "tm_danhsach") {

            const list =
                Object.values(
                    data.tongmons
                )
                .sort(
                    (a, b) =>
                        (b.diem || 0) -
                        (a.diem || 0)
                )
                .slice(0, 10);

            if (!list.length) {
                return interaction.reply({
                    content:
                        "📜 Chưa có Tông Môn nào.",
                    ephemeral: true
                });
            }

            let text =
                "## 🏯 TÔNG MÔN HỒNG HOANG\n\n";

            list.forEach((tong, i) => {

                khoiTaoTong(tong);

                text +=
                    `**${i + 1}. ${tong.ten}**\n` +
                    `> 👥 ${Object.keys(tong.thanhVien).length} thành viên\n` +
                    `> 🏆 ${tong.diem} điểm\n` +
                    `> 🏯 Lãnh địa cấp ${tong.lanhDia.cap}\n\n`;
            });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "📜 DANH SÁCH TÔNG MÔN"
                        )
                        .setDescription(text)
                ],
                ephemeral: true
            });
        }

        // ==================================================
        // 🏠 TÔNG MÔN CỦA TÔI
        // ==================================================

        if (
            id === "tm_thongtin" ||
            id === "tm_info"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn nào.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            const members =
                Object.entries(
                    tong.thanhVien
                );

            const member =
                tong.thanhVien[
                    interaction.user.id
                ];

            const cap =
                CAP_BAC[
                    member?.capBac
                ] || CAP_BAC.de_tu;

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        `🏯 ${tong.ten}`
                    )
                    .setDescription(

                        `👑 **Tông Chủ:** <@${tong.chuTong}>\n\n` +

                        `${cap.emoji} **Chức vụ của bạn:** ${cap.ten}\n\n` +

                        `🏆 **Điểm:** ${tong.diem}\n` +
                        `📈 **Cấp Tông Môn:** ${tong.capDo}\n` +
                        `👥 **Thành viên:** ${members.length}\n\n` +

                        `🏯 **Lãnh địa:** Cấp ${tong.lanhDia.cap}\n` +
                        `❤️ **HP lãnh địa:** ${tong.lanhDia.hp.toLocaleString()}\n` +
                        `🛡️ **Phòng thủ:** ${tong.lanhDia.phongThu}\n` +
                        `⚔️ **Chiến lực:** ${tong.lanhDia.chienLuc}\n\n` +

                        `💎 **Kho:** ${tong.khoBau.linhThach.toLocaleString()} Linh Thạch`
                    );

            return interaction.reply({
                embeds: [embed],
                components:
                    menuTongMon(),
                ephemeral: true
            });
        }

        // ==================================================
        // 👥 THÀNH VIÊN
        // ==================================================

        if (id === "tm_thanhvien") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            let text =
                `## 👥 THÀNH VIÊN ${tong.ten}\n\n`;

            Object.entries(
                tong.thanhVien
            )
            .forEach(
                ([userId, member], i) => {

                    const cap =
                        CAP_BAC[
                            member.capBac
                        ] ||
                        CAP_BAC.de_tu;

                    text +=
                        `**${i + 1}.** ${cap.emoji} <@${userId}> — ${cap.ten}\n`;
                }
            );

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(text)
                ],
                ephemeral: true
            });
        }

        // ==================================================
        // 👑 CHỨC VỤ
        // ==================================================

        if (id === "tm_quanly") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            if (
                !coQuyen(
                    result.tong,
                    interaction.user.id,
                    60
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Bạn không có quyền quản lý chức vụ.",
                    ephemeral: true
                });
            }

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        "tm_menu_quanly"
                    )
                    .setPlaceholder(
                        "👑 Chọn chức vụ"
                    )
                    .addOptions([

                        {
                            label:
                                "💎 Phó Tông Chủ",
                            value:
                                "pho_tong"
                        },

                        {
                            label:
                                "🔥 Trưởng Lão",
                            value:
                                "truong_lao"
                        },

                        {
                            label:
                                "🛡️ Hộ Pháp",
                            value:
                                "ho_phap"
                        },

                        {
                            label:
                                "🌱 Đệ Tử",
                            value:
                                "de_tu"
                        }
                    ]);

            return interaction.reply({
                content:
                    "## 👑 QUẢN LÝ CHỨC VỤ\n\n" +
                    "Chọn chức vụ muốn bổ nhiệm/hạ cấp.",
                components: [
                    new ActionRowBuilder()
                        .addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // ==================================================
        // ⚔️ CHIẾN TRANH
        // ==================================================

        if (id === "tm_chientranh") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            const status =
                tong.chienTranh.dangChien
                    ? `⚔️ **ĐANG CHIẾN TRANH**\n\n` +
                      `🎯 Đối thủ: **${tong.chienTranh.doiThu}**\n` +
                      `🏆 Điểm chiến tranh: **${tong.chienTranh.diem}**`
                    : "🕊️ Tông Môn hiện không tham gia chiến tranh.";

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "⚔️ CHIẾN TRANH TÔNG MÔN"
                        )
                        .setDescription(
                            status
                        )
                ],
                components:
                    menuChienTranh(),
                ephemeral: true
            });
        }

        // ==================================================
        // 📜 NHIỆM VỤ
        // ==================================================

        if (id === "tm_nhiemvu") {

            return interaction.reply({
                content:
                    "## 📜 NHIỆM VỤ TÔNG MÔN\n\n" +
                    "Hoàn thành nhiệm vụ để nhận **Điểm Tông Môn + Linh Thạch**.",
                components:
                    menuNhiemVu(),
                ephemeral: true
            });
        }

        // ==================================================
        // 💎 KHO BÁU
        // ==================================================

        if (id === "tm_khobau") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            return interaction.reply({
                content:
                    `## 💎 KHO BÁU ${tong.ten}\n\n` +
                    `💎 Linh Thạch: **${tong.khoBau.linhThach.toLocaleString()}**\n` +
                    `🧪 Đan dược: **${Object.keys(tong.khoBau.danDuoc).length} loại**\n` +
                    `⚔️ Pháp bảo: **${Object.keys(tong.khoBau.phapBao).length} loại**\n` +
                    `📜 Công pháp: **${Object.keys(tong.khoBau.congPhap).length} loại**`,
                components:
                    menuKhoBau(),
                ephemeral: true
            });
        }

        // ==================================================
        // 🏯 LÃNH ĐỊA
        // ==================================================

        if (id === "tm_lanhdia") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            return interaction.reply({
                content:
                    `## 🏯 LÃNH ĐỊA TÔNG MÔN\n\n` +

                    `📈 Cấp: **${tong.lanhDia.cap}/10**\n` +
                    `❤️ HP: **${tong.lanhDia.hp.toLocaleString()}**\n` +
                    `🛡️ Phòng thủ: **${tong.lanhDia.phongThu}**\n` +
                    `💎 Sản lượng: **${tong.lanhDia.sanLuong}**\n` +
                    `⚔️ Chiến lực: **${tong.lanhDia.chienLuc}**`,
                components:
                    menuLanhDia(),
                ephemeral: true
            });
        }

        // ==================================================
        // 🌟 KỸ NĂNG
        // ==================================================

        if (id === "tm_kynang") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const k =
                khoiTaoTong(
                    result.tong
                ).kyNang;

            return interaction.reply({
                content:
                    "## 🌟 KỸ NĂNG TÔNG MÔN\n\n" +

                    `❤️ **Hộ Thể:** Lv.${k.hoThe}\n` +
                    `⚔️ **Chiến Ý:** Lv.${k.chienY}\n` +
                    `🌀 **Tụ Linh:** Lv.${k.tuLinh}\n` +
                    `💎 **Tụ Tài:** Lv.${k.tuTai}\n` +
                    `🛡️ **Hộ Tông:** Lv.${k.hoTong}\n` +
                    `🔥 **Chiến Hồn:** Lv.${k.chienHon}`,
                components:
                    menuKyNang(),
                ephemeral: true
            });
        }

        // ==================================================
        // 📖 NHẬT KÝ
        // ==================================================

        if (id === "tm_nhatky") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            let text =
                "## 📖 NHẬT KÝ TÔNG MÔN\n\n";

            if (!tong.nhatKy.length) {
                text +=
                    "🌌 Chưa có hoạt động.";
            } else {

                tong.nhatKy
                    .slice(0, 15)
                    .forEach(log => {

                        text +=
                            `• ${log.text}\n`;
                    });
            }

            return interaction.reply({
                content: text,
                ephemeral: true
            });
        }

        // ==================================================
        // ⚔️ TUYÊN CHIẾN
        // ==================================================

        if (id === "tm_tuyenchien") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            if (
                !coQuyen(
                    result.tong,
                    interaction.user.id,
                    60
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ Trưởng Lão trở lên mới có quyền tuyên chiến.",
                    ephemeral: true
                });
            }

            const list =
                Object.values(
                    data.tongmons
                )
                .filter(
                    t =>
                        t.id !== result.id
                )
                .slice(0, 25);

            if (!list.length) {
                return interaction.reply({
                    content:
                        "❌ Không có Tông Môn khác để tuyên chiến.",
                    ephemeral: true
                });
            }

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        "tm_select_chientranh"
                    )
                    .setPlaceholder(
                        "⚔️ Chọn Tông Môn đối thủ"
                    )
                    .addOptions(
                        list.map(t => ({
                            label:
                                t.ten.substring(0, 100),
                            description:
                                `🏆 ${t.diem || 0} điểm`,
                            value:
                                t.id
                        }))
                    );

            return interaction.reply({
                content:
                    "## ⚔️ TUYÊN CHIẾN\n\n" +
                    "Chọn thế lực muốn khiêu chiến.",
                components: [
                    new ActionRowBuilder()
                        .addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // ==================================================
        // 🔥 CHIẾN ĐẤU
        // ==================================================

        if (id === "tm_chiendau") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            if (!tong.chienTranh.dangChien) {
                return interaction.reply({
                    content:
                        "🕊️ Tông Môn hiện không có chiến tranh.",
                    ephemeral: true
                });
            }

            const damage =
                Math.floor(
                    Math.random() *
                    1000
                ) + 500;

            tong.chienTranh.diem +=
                damage;

            tong.diem +=
                Math.floor(
                    damage / 10
                );

            ghiNhatKy(
                tong,
                `⚔️ <@${interaction.user.id}> tham gia chiến tranh và gây ${damage} điểm sát thương.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "⚔️ **CHIẾN ĐẤU THÀNH CÔNG!**\n\n" +
                    `💥 Sát thương: **${damage}**\n` +
                    `🏆 Điểm chiến tranh: **${tong.chienTranh.diem}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 📜 CHIẾN BÁO
        // ==================================================

        if (id === "tm_chienbao") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            return interaction.reply({
                content:
                    `## 📜 CHIẾN BÁO\n\n` +

                    `⚔️ Đang chiến tranh: **${tong.chienTranh.dangChien ? "Có" : "Không"}**\n` +

                    `🎯 Đối thủ: **${tong.chienTranh.doiThu || "Không có"}**\n` +

                    `🏆 Điểm chiến tranh: **${tong.chienTranh.diem}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 🛡️ PHÒNG THỦ
        // ==================================================

        if (
            id === "tm_phongthu" ||
            id === "tm_ld_phongthu"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            const bonus =
                tong.kyNang.hoTong * 5;

            tong.lanhDia.phongThu +=
                bonus;

            ghiNhatKy(
                tong,
                `🛡️ Hệ thống phòng thủ được củng cố +${bonus}.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "🛡️ **PHÒNG THỦ ĐƯỢC CỦNG CỐ!**\n\n" +
                    `🛡️ Phòng thủ hiện tại: **${tong.lanhDia.phongThu}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 📜 DANH SÁCH NHIỆM VỤ
        // ==================================================

        if (id === "tm_nv_danhsach") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            const nv = [
                {
                    id: "tu_luyen",
                    ten: "🌀 Tu Luyện",
                    yeuCau: "Tu luyện 10 lần",
                    thuong: 100
                },
                {
                    id: "chien_dau",
                    ten: "⚔️ Chiến Đấu",
                    yeuCau: "Tham gia chiến đấu",
                    thuong: 150
                },
                {
                    id: "linh_thach",
                    ten: "💎 Tụ Tài",
                    yeuCau: "Đóng góp Linh Thạch",
                    thuong: 200
                },
                {
                    id: "boss",
                    ten: "🐉 Trảm Yêu",
                    yeuCau: "Đánh bại Boss",
                    thuong: 300
                }
            ];

            const menu =
                new StringSelectMenuBuilder()
                    .setCustomId(
                        "tm_select_nhiemvu"
                    )
                    .setPlaceholder(
                        "📜 Chọn nhiệm vụ"
                    )
                    .addOptions(
                        nv.map(n => ({
                            label:
                                n.ten.substring(0, 100),
                            description:
                                `${n.yeuCau} • +${n.thuong} điểm`,
                            value:
                                n.id
                        }))
                    );

            return interaction.reply({
                content:
                    "## 📜 NHIỆM VỤ TÔNG MÔN\n\n" +
                    `Nhiệm vụ hiện tại: **${tong.nhiemVu.nhiemVu || "Chưa nhận"}**`,
                components: [
                    new ActionRowBuilder()
                        .addComponents(menu)
                ],
                ephemeral: true
            });
        }

        // ==================================================
        // 📊 TIẾN ĐỘ
        // ==================================================

        if (id === "tm_nv_tiendo") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const nv =
                khoiTaoTong(
                    result.tong
                ).nhiemVu;

            return interaction.reply({
                content:
                    `## 📊 TIẾN ĐỘ NHIỆM VỤ\n\n` +
                    `📜 Nhiệm vụ: **${nv.nhiemVu || "Chưa có"}**\n` +
                    `📈 Tiến độ: **${nv.tienDo}**\n` +
                    `🎁 Đã nhận: **${nv.daNhan ? "Có" : "Chưa"}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 🎁 NHẬN THƯỞNG
        // ==================================================

        if (id === "tm_nv_nhan") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            if (
                !tong.nhiemVu.nhiemVu ||
                tong.nhiemVu.tienDo < 1
            ) {
                return interaction.reply({
                    content:
                        "❌ Chưa có nhiệm vụ hoàn thành.",
                    ephemeral: true
                });
            }

            if (tong.nhiemVu.daNhan) {
                return interaction.reply({
                    content:
                        "❌ Bạn đã nhận thưởng nhiệm vụ này.",
                    ephemeral: true
                });
            }

            tong.nhiemVu.daNhan = true;

            tong.diem += 100;

            tong.khoBau.linhThach +=
                5000;

            ghiNhatKy(
                tong,
                `🎁 Tông Môn nhận thưởng nhiệm vụ +100 điểm và +5.000 Linh Thạch.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "🎁 **NHẬN THƯỞNG THÀNH CÔNG!**\n\n" +
                    "🏆 +100 Điểm Tông Môn\n" +
                    "💎 +5.000 Linh Thạch vào kho.",
                ephemeral: true
            });
        }

        // ==================================================
        // 💎 XEM KHO
        // ==================================================

        if (id === "tm_kho_xem") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const kho =
                khoiTaoTong(
                    result.tong
                ).khoBau;

            return interaction.reply({
                content:
                    `## 💎 KHO BÁU\n\n` +

                    `💎 Linh Thạch: **${kho.linhThach.toLocaleString()}**\n` +
                    `🧪 Đan dược: **${Object.keys(kho.danDuoc).length} loại**\n` +
                    `⚔️ Pháp bảo: **${Object.keys(kho.phapBao).length} loại**\n` +
                    `📜 Công pháp: **${Object.keys(kho.congPhap).length} loại**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 📥 ĐÓNG GÓP
        // ==================================================

        if (id === "tm_kho_donggop") {

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "tm_modal_donggop"
                    )
                    .setTitle(
                        "💎 Đóng Góp Linh Thạch"
                    );

            const input =
                new TextInputBuilder()
                    .setCustomId(
                        "amount"
                    )
                    .setLabel(
                        "Số Linh Thạch"
                    )
                    .setPlaceholder(
                        "1000"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(input)
            );

            return interaction.showModal(
                modal
            );
        }

        // ==================================================
        // 📤 NHẬN VẬT PHẨM
        // ==================================================

        if (id === "tm_kho_nhan") {

            return interaction.reply({
                content:
                    "📤 Chức năng nhận vật phẩm sẽ kiểm tra quyền kho của chức vụ.\n\n" +
                    "🔒 Hiện tại chỉ Tông Chủ/Phó Tông Chủ có quyền quản lý kho.",
                ephemeral: true
            });
        }

        // ==================================================
        // 📊 LÃNH ĐỊA
        // ==================================================

        if (id === "tm_ld_info") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const ld =
                khoiTaoTong(
                    result.tong
                ).lanhDia;

            return interaction.reply({
                content:
                    `## 🏯 LÃNH ĐỊA\n\n` +
                    `📈 Cấp: **${ld.cap}/10**\n` +
                    `❤️ HP: **${ld.hp.toLocaleString()}**\n` +
                    `🛡️ Phòng thủ: **${ld.phongThu}**\n` +
                    `💎 Sản lượng: **${ld.sanLuong}**\n` +
                    `⚔️ Chiến lực: **${ld.chienLuc}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // ⬆️ NÂNG CẤP LÃNH ĐỊA
        // ==================================================

        if (id === "tm_ld_nangcap") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            if (
                !coQuyen(
                    tong,
                    interaction.user.id,
                    60
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ Trưởng Lão trở lên có quyền nâng cấp lãnh địa.",
                    ephemeral: true
                });
            }

            const ld =
                tong.lanhDia;

            if (ld.cap >= 10) {
                return interaction.reply({
                    content:
                        "🏯 Lãnh địa đã đạt cấp tối đa.",
                    ephemeral: true
                });
            }

            const cost =
                ld.cap * 10000;

            if (
                tong.khoBau.linhThach <
                cost
            ) {
                return interaction.reply({
                    content:
                        `❌ Kho không đủ Linh Thạch.\n\n` +
                        `💎 Cần: **${cost.toLocaleString()}**`,
                    ephemeral: true
                });
            }

            tong.khoBau.linhThach -=
                cost;

            ld.cap++;

            ld.hp += 5000;
            ld.phongThu += 50;
            ld.sanLuong += 50;
            ld.chienLuc += 100;

            tong.diem += 100;

            ghiNhatKy(
                tong,
                `🏯 Lãnh địa được nâng lên cấp ${ld.cap}.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "🏯 **NÂNG CẤP LÃNH ĐỊA THÀNH CÔNG!**\n\n" +
                    `📈 Cấp mới: **${ld.cap}/10**\n` +
                    `💎 Chi phí: **${cost.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // 🌟 KỸ NĂNG
        // ==================================================

        if (
            id.startsWith("tm_kn_")
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const tong =
                khoiTaoTong(
                    result.tong
                );

            if (
                !coQuyen(
                    tong,
                    interaction.user.id,
                    60
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Chỉ Trưởng Lão trở lên có quyền nâng kỹ năng.",
                    ephemeral: true
                });
            }

            const map = {
                tm_kn_hothe: "hoThe",
                tm_kn_chieny: "chienY",
                tm_kn_tulinh: "tuLinh",
                tm_kn_tutai: "tuTai",
                tm_kn_hotong: "hoTong",
                tm_kn_chienhon: "chienHon"
            };

            const key =
                map[id];

            if (!key) {
                return interaction.reply({
                    content:
                        "❌ Kỹ năng không tồn tại.",
                    ephemeral: true
                });
            }

            const current =
                tong.kyNang[key];

            if (current >= 10) {
                return interaction.reply({
                    content:
                        "🌟 Kỹ năng đã đạt cấp tối đa.",
                    ephemeral: true
                });
            }

            const cost =
                current * 5000;

            if (
                tong.khoBau.linhThach <
                cost
            ) {
                return interaction.reply({
                    content:
                        `❌ Kho không đủ Linh Thạch.\n` +
                        `💎 Cần: **${cost.toLocaleString()}**`,
                    ephemeral: true
                });
            }

            tong.khoBau.linhThach -=
                cost;

            tong.kyNang[key]++;

            tong.diem += 50;

            ghiNhatKy(
                tong,
                `🌟 Kỹ năng ${key} tăng lên cấp ${tong.kyNang[key]}.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "🌟 **NÂNG KỸ NĂNG THÀNH CÔNG!**\n\n" +
                    `📈 Cấp mới: **Lv.${tong.kyNang[key]}**\n` +
                    `💎 Chi phí: **${cost.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // ==================================================
        // ↩️ QUAY LẠI
        // ==================================================

        if (
            id === "tm_back" ||
            id.startsWith("tm_back_")
        ) {

            const embed =
                new EmbedBuilder()
                    .setTitle(
                        "🏯 HỒNG HOANG ĐẠI LỤC"
                    )
                    .setDescription(
                        "## 🏯 HỆ THỐNG TÔNG MÔN\n\n" +
                        "⚔️ Gia nhập • 👑 Thành lập • 🏆 Tranh bá"
                    );

            return interaction.update({
                embeds: [embed],
                content: "",
                components:
                    menuChinh()
            });
        }

        // ==================================================
        // 🏆 TOP
        // ==================================================

        if (id === "tm_top") {

            const list =
                Object.values(
                    data.tongmons
                )
                .sort(
                    (a, b) =>
                        (b.diem || 0) -
                        (a.diem || 0)
                )
                .slice(0, 10);

            let text =
                "## 🏆 BẢNG XẾP HẠNG\n\n";

            list.forEach((tong, i) => {

                text +=
                    `**${i + 1}. ${tong.ten}**\n` +
                    `> 🏆 ${tong.diem || 0} điểm\n` +
                    `> 👥 ${Object.keys(tong.thanhVien || {}).length} thành viên\n\n`;
            });

            return interaction.reply({
                content: text,
                ephemeral: true
            });
        }

        // ==================================================
        // 🚪 RỜI
        // ==================================================

        if (id === "tm_roi") {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn không thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            if (
                result.tong.chuTong ===
                interaction.user.id
            ) {
                return interaction.reply({
                    content:
                        "👑 Tông Chủ không thể rời Tông Môn.\n" +
                        "Hãy chuyển quyền Tông Chủ trước.",
                    ephemeral: true
                });
            }

            delete result.tong.thanhVien[
                interaction.user.id
            ];

            ghiNhatKy(
                result.tong,
                `🚪 <@${interaction.user.id}> đã rời Tông Môn.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    `🚪 Bạn đã rời **${result.tong.ten}**.`,
                ephemeral: true
            });
        }
    },

    // ==================================================
    // 🪟 MODAL
    // ==================================================

    async modalHandler(interaction) {

        const data =
            loadTongMon();

        // ==============================================
        // 🏯 TẠO TÔNG MÔN
        // ==============================================

        if (
            interaction.customId ===
            "tm_modal_tao"
        ) {

            const hienTai =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (hienTai) {
                return interaction.reply({
                    content:
                        "❌ Bạn đã thuộc một Tông Môn.",
                    ephemeral: true
                });
            }

            const ten =
                interaction.fields
                    .getTextInputValue(
                        "ten_tong"
                    )
                    .trim();

            if (ten.length < 2) {
                return interaction.reply({
                    content:
                        "❌ Tên quá ngắn.",
                    ephemeral: true
                });
            }

            const trung =
                Object.values(
                    data.tongmons
                ).some(
                    t =>
                        t.ten.toLowerCase() ===
                        ten.toLowerCase()
                );

            if (trung) {
                return interaction.reply({
                    content:
                        "❌ Tên Tông Môn đã tồn tại.",
                    ephemeral: true
                });
            }

            const id =
                taoID();

            data.tongmons[id] = {

                id,

                ten,

                chuTong:
                    interaction.user.id,

                thanhVien: {

                    [interaction.user.id]: {

                        capBac:
                            "chu_tong",

                        ngayGiaNhap:
                            Date.now()
                    }
                },

                diem: 0,

                capDo: 1,

                ngayTao:
                    Date.now(),

                khoBau: {
                    linhThach: 0,
                    danDuoc: {},
                    phapBao: {},
                    congPhap: {}
                },

                lanhDia: {
                    cap: 1,
                    hp: 10000,
                    phongThu: 100,
                    sanLuong: 100,
                    chienLuc: 100
                },

                kyNang: {
                    hoThe: 1,
                    chienY: 1,
                    tuLinh: 1,
                    tuTai: 1,
                    hoTong: 1,
                    chienHon: 1
                },

                chienTranh: {
                    dangChien: false,
                    doiThu: null,
                    diem: 0,
                    lichSu: []
                },

                nhiemVu: {
                    nhiemVu: null,
                    tienDo: 0,
                    daNhan: false
                },

                nhatKy: []
            };

            ghiNhatKy(
                data.tongmons[id],
                `🏯 Tông Môn được thành lập bởi <@${interaction.user.id}>.`
            );

            saveTongMon(data);

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "🏯 TẠO TÔNG MÔN THÀNH CÔNG"
                        )
                        .setDescription(
                            `🏯 **${ten}**\n\n` +
                            `👑 Tông Chủ: <@${interaction.user.id}>\n` +
                            `📈 Cấp: **1**\n` +
                            `🏆 Điểm: **0**\n\n` +
                            "⚔️ Con đường tranh bá Hồng Hoang bắt đầu!"
                        )
                ]
            });
        }

        // ==============================================
        // 💎 ĐÓNG GÓP KHO
        // ==============================================

        if (
            interaction.customId ===
            "tm_modal_donggop"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const amount =
                Number(
                    interaction.fields
                        .getTextInputValue(
                            "amount"
                        )
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

            /*
             * Phần database nhân vật của bạn
             * đang được quản lý ở file khác.
             *
             * Vì vậy ở đây chưa tự ý trừ tiền
             * của người chơi để tránh phá database.
             */

            result.tong.khoBau.linhThach +=
                amount;

            result.tong.diem +=
                Math.floor(
                    amount / 100
                );

            ghiNhatKy(
                result.tong,
                `💎 <@${interaction.user.id}> đóng góp ${amount.toLocaleString()} Linh Thạch vào kho.`
            );

            saveTongMon(data);

            return interaction.reply({
                content:
                    "💎 **ĐÓNG GÓP THÀNH CÔNG!**\n\n" +
                    `📥 Kho nhận: **${amount.toLocaleString()} Linh Thạch**\n` +
                    `🏆 Điểm Tông Môn: **+${Math.floor(amount / 100)}**`,
                ephemeral: true
            });
        }
    },

    // ==================================================
    // 📋 SELECT MENU
    // ==================================================

    async selectHandler(interaction) {

        const data =
            loadTongMon();

        // ==============================================
        // 👑 CHỨC VỤ
        // ==============================================

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
                        "❌ Bạn không thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            if (
                !coQuyen(
                    result.tong,
                    interaction.user.id,
                    60
                )
            ) {
                return interaction.reply({
                    content:
                        "❌ Bạn không có quyền.",
                    ephemeral: true
                });
            }

            const capBac =
                interaction.values[0];

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `tm_modal_cap_${capBac}`
                    )
                    .setTitle(
                        "👑 Thay Đổi Chức Vụ"
                    );

            const input =
                new TextInputBuilder()
                    .setCustomId(
                        "user_id"
                    )
                    .setLabel(
                        "ID Discord thành viên"
                    )
                    .setPlaceholder(
                        "123456789012345678"
                    )
                    .setStyle(
                        TextInputStyle.Short
                    )
                    .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder()
                    .addComponents(input)
            );

            return interaction.showModal(
                modal
            );
        }

        // ==============================================
        // ⚔️ TUYÊN CHIẾN
        // ==============================================

        if (
            interaction.customId ===
            "tm_select_chientranh"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const enemyId =
                interaction.values[0];

            const enemy =
                data.tongmons[
                    enemyId
                ];

            if (!enemy) {
                return interaction.reply({
                    content:
                        "❌ Không tìm thấy đối thủ.",
                    ephemeral: true
                });
            }

            khoiTaoTong(
                result.tong
            );

            khoiTaoTong(
                enemy
            );

            result.tong.chienTranh = {

                dangChien: true,

                doiThu:
                    enemy.ten,

                diem: 0,

                lichSu: []
            };

            enemy.chienTranh = {

                dangChien: true,

                doiThu:
                    result.tong.ten,

                diem: 0,

                lichSu: []
            };

            ghiNhatKy(
                result.tong,
                `⚔️ Tuyên chiến với **${enemy.ten}**.`
            );

            ghiNhatKy(
                enemy,
                `⚔️ Bị **${result.tong.ten}** tuyên chiến.`
            );

            saveTongMon(data);

            return interaction.update({
                content:
                    "⚔️ **TUYÊN CHIẾN THÀNH CÔNG!**\n\n" +
                    `🏯 ${result.tong.ten}\n` +
                    `⚔️ VS\n` +
                    `🏯 ${enemy.ten}`,
                components: []
            });
        }

        // ==============================================
        // 📜 CHỌN NHIỆM VỤ
        // ==============================================

        if (
            interaction.customId ===
            "tm_select_nhiemvu"
        ) {

            const result =
                timTongMonCuaUser(
                    data,
                    interaction.user.id
                );

            if (!result) {
                return interaction.reply({
                    content:
                        "❌ Bạn chưa thuộc Tông Môn.",
                    ephemeral: true
                });
            }

            const id =
                interaction.values[0];

            const names = {
                tu_luyen:
                    "🌀 Tu Luyện",
                chien_dau:
                    "⚔️ Chiến Đấu",
                linh_thach:
                    "💎 Tụ Tài",
                boss:
                    "🐉 Trảm Yêu"
            };

            result.tong.nhiemVu = {

                nhiemVu:
                    names[id] || id,

                tienDo: 1,

                daNhan: false
            };

            saveTongMon(data);

            return interaction.update({
                content:
                    `📜 **NHẬN NHIỆM VỤ THÀNH CÔNG!**\n\n` +
                    `🎯 ${names[id] || id}\n\n` +
                    "📈 Tiến độ: **1**",
                components: []
            });
        }

        // ==============================================
        // ⚔️ GIA NHẬP TÔNG MÔN
        // ==============================================

        if (
            interaction.customId ===
            "tm_select_gianhap"
        ) {

            const tongId =
                interaction.values[0];

            const tong =
                data.tongmons[
                    tongId
                ];

            if (!tong) {
                return interaction.reply({
                    content:
                        "❌ Tông Môn không tồn tại.",
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
                        "❌ Bạn đã thuộc một Tông Môn.",
                    ephemeral: true
                });
            }

            khoiTaoTong(
                tong
            );

            tong.thanhVien[
                interaction.user.id
            ] = {
                capBac:
                    "de_tu",

                ngayGiaNhap:
                    Date.now()
            };

            ghiNhatKy(
                tong,
                `⚔️ <@${interaction.user.id}> gia nhập Tông Môn.`
            );

            saveTongMon(data);

            return interaction.update({
                content:
                    `⚔️ **GIA NHẬP THÀNH CÔNG!**\n\n` +
                    `🏯 ${tong.ten}\n` +
                    `🌱 Cấp bậc: Đệ Tử`,
                components: []
            });
        }
    }
};
