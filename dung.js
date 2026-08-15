// commands/dung.js
// LỆNH: /dung <tên vật phẩm>
// Discord.js v14

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

// ======================================================
// CẤU HÌNH NHÓM VẬT PHẨM KHÔNG ĐƯỢC DÙNG
// ======================================================

const KHONG_THE_DUNG = [
    "nguyen lieu",
    "nguyên liệu",
    "ren do",
    "rèn đồ",
    "ren",
    "rèn",
    "che tao",
    "chế tạo",
    "nguyen lieu ren",
    "nguyên liệu rèn",
    "nguyen lieu che tao",
    "nguyên liệu chế tạo"
];

// ======================================================
// KIỂM TRA VẬT PHẨM CÓ PHẢI LOẠI KHÔNG ĐƯỢC DÙNG
// ======================================================

function laVatPhamKhongTheDung(item) {
    if (!item) return true;

    const ten = String(item.name || item.ten || "").toLowerCase();
    const loai = String(item.type || item.loai || "").toLowerCase();
    const tag = String(item.category || item.nhom || "").toLowerCase();

    const text = `${ten} ${loai} ${tag}`;

    return KHONG_THE_DUNG.some(x => text.includes(x));
}

// ======================================================
// XÁC ĐỊNH LOẠI VẬT PHẨM
// ======================================================

function xacDinhLoai(item) {
    const text = [
        item.name,
        item.ten,
        item.type,
        item.loai,
        item.category,
        item.nhom
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

    if (
        text.includes("đan") ||
        text.includes("dan") ||
        text.includes("dược") ||
        text.includes("duoc")
    ) {
        return "dan_duoc";
    }

    if (
        text.includes("pháp bảo") ||
        text.includes("phap bao") ||
        text.includes("pháp_bảo")
    ) {
        return "phap_bao";
    }

    if (
        text.includes("công pháp") ||
        text.includes("cong phap") ||
        text.includes("công_pháp")
    ) {
        return "cong_phap";
    }

    if (
        text.includes("linh thú") ||
        text.includes("linh thu") ||
        text.includes("linh_thu")
    ) {
        return "linh_thu";
    }

    return "vat_pham";
}

// ======================================================
// LẤY TÚI ĐỒ
//
// THAY PHẦN NÀY BẰNG DATABASE CỦA BOT BẠN NẾU CÓ.
// ======================================================

async function layTuiDo(userId) {

    /*
        Ví dụ dữ liệu:

        {
            items: [
                {
                    name: "Hồi Linh Đan",
                    type: "đan dược",
                    amount: 3
                }
            ]
        }
    */

    // --------------------------------------------------
    // TẠM DÙNG DATABASE TRÊN MEMORY
    // --------------------------------------------------

    if (!global.tuiDoNguoiChoi) {
        global.tuiDoNguoiChoi = {};
    }

    if (!global.tuiDoNguoiChoi[userId]) {
        global.tuiDoNguoiChoi[userId] = {
            items: []
        };
    }

    return global.tuiDoNguoiChoi[userId];
}

// ======================================================
// LƯU TÚI ĐỒ
// ======================================================

async function luuTuiDo(userId, data) {

    if (!global.tuiDoNguoiChoi) {
        global.tuiDoNguoiChoi = {};
    }

    global.tuiDoNguoiChoi[userId] = data;

    return true;
}

// ======================================================
// TÌM VẬT PHẨM TRONG TÚI
// ======================================================

function timVatPham(items, tenCanTim) {

    const search = tenCanTim
        .trim()
        .toLowerCase();

    return items.find(item => {

        const ten = String(
            item.name ||
            item.ten ||
            ""
        ).toLowerCase();

        return ten === search;
    });
}

// ======================================================
// TÌM VẬT PHẨM GẦN ĐÚNG
// ======================================================

function timVatPhamGanDung(items, tenCanTim) {

    const search = tenCanTim
        .trim()
        .toLowerCase();

    return items.find(item => {

        const ten = String(
            item.name ||
            item.ten ||
            ""
        ).toLowerCase();

        return (
            ten.includes(search) ||
            search.includes(ten)
        );
    });
}

// ======================================================
// TRỪ 1 VẬT PHẨM
// ======================================================

function truVatPham(items, item) {

    const index = items.indexOf(item);

    if (index === -1) {
        return false;
    }

    const soLuong = Number(
        item.amount ??
        item.soluong ??
        item.quantity ??
        1
    );

    if (soLuong <= 1) {

        items.splice(index, 1);

    } else {

        if (item.amount !== undefined) {
            item.amount = soLuong - 1;
        }

        else if (item.soluong !== undefined) {
            item.soluong = soLuong - 1;
        }

        else if (item.quantity !== undefined) {
            item.quantity = soLuong - 1;
        }

        else {
            item.amount = soLuong - 1;
        }
    }

    return true;
}

// ======================================================
// XỬ LÝ ĐAN DƯỢC
// ======================================================

async function dungDanDuoc(interaction, item) {

    const ten = item.name || item.ten;

    /*
        Ở đây bạn có thể gắn hiệu ứng riêng:

        - Hồi HP
        - Hồi MP
        - Tăng tu vi
        - Tăng cảnh giới
        - Đổi linh căn
        - Đổi thể chất
        - Buff chỉ số
        ...
    */

    return {
        thanhCong: true,
        noiDung:
            `💊 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Hiệu lực của đan dược đã được kích hoạt.`
    };
}

// ======================================================
// XỬ LÝ PHÁP BẢO
// ======================================================

async function dungPhapBao(interaction, item) {

    const ten = item.name || item.ten;

    /*
        Có thể gắn:

        - Trang bị pháp bảo
        - Tăng công kích
        - Tăng phòng thủ
        - Tăng tốc độ
        - Kích hoạt kỹ năng
    */

    return {
        thanhCong: true,
        noiDung:
            `⚔️ Bạn đã sử dụng **${ten}**!\n` +
            `✨ Pháp bảo đã được kích hoạt/trang bị.`
    };
}

// ======================================================
// XỬ LÝ CÔNG PHÁP
// ======================================================

async function dungCongPhap(interaction, item) {

    const ten = item.name || item.ten;

    /*
        Có thể gắn:

        - Học công pháp
        - Tăng tu vi
        - Mở kỹ năng
        - Thay đổi công pháp đang tu luyện
    */

    return {
        thanhCong: true,
        noiDung:
            `📖 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Công pháp đã được kích hoạt/tu luyện.`
    };
}

// ======================================================
// XỬ LÝ LINH THÚ
// ======================================================

async function dungLinhThu(interaction, item) {

    const ten = item.name || item.ten;

    /*
        Có thể gắn:

        - Triệu hồi linh thú
        - Nhận linh thú
        - Trang bị linh thú
        - Kích hoạt linh thú
    */

    return {
        thanhCong: true,
        noiDung:
            `🐉 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Linh thú đã được triệu hồi/kích hoạt.`
    };
}

// ======================================================
// XỬ LÝ VẬT PHẨM THÔNG THƯỜNG
// ======================================================

async function dungVatPham(interaction, item) {

    const ten = item.name || item.ten;

    /*
        Vật phẩm bình thường chỉ được dùng
        nếu nó có thuộc tính useable / usable / effect.
    */

    const coHieuUng =
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        item.hieuUng ||
        item.effect ||
        item.effects;

    if (!coHieuUng) {

        return {
            thanhCong: false,
            noiDung:
                `❌ **${ten}** không có chức năng sử dụng.`
        };
    }

    return {
        thanhCong: true,
        noiDung:
            `✨ Bạn đã sử dụng **${ten}**!\n` +
            `💫 Hiệu ứng vật phẩm đã được kích hoạt.`
    };
}

// ======================================================
// COMMAND
// ======================================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("dung")
        .setDescription("Sử dụng vật phẩm trong túi đồ")
        .addStringOption(option =>
            option
                .setName("vatpham")
                .setDescription("Tên vật phẩm muốn sử dụng")
                .setRequired(true)
                .setAutocomplete(true)
        ),

    // ==================================================
    // AUTOCOMPLETE
    // ==================================================

    async autocomplete(interaction) {

        try {

            const userId = interaction.user.id;

            const tui = await layTuiDo(userId);

            const items = tui.items || [];

            const input =
                interaction.options
                    .getString("vatpham")
                    ?.toLowerCase() || "";

            const ketQua = items
                .filter(item => {

                    if (laVatPhamKhongTheDung(item)) {
                        return false;
                    }

                    const ten = String(
                        item.name ||
                        item.ten ||
                        ""
                    ).toLowerCase();

                    return ten.includes(input);
                })
                .slice(0, 25);

            await interaction.respond(
                ketQua.map(item => ({
                    name: String(
                        item.name ||
                        item.ten ||
                        "Vật phẩm"
                    ).slice(0, 100),

                    value: String(
                        item.name ||
                        item.ten ||
                        ""
                    ).slice(0, 100)
                }))
            );

        } catch (error) {

            console.error(
                "Lỗi autocomplete /dung:",
                error
            );

            try {
                await interaction.respond([]);
            } catch {}
        }
    },

    // ==================================================
    // EXECUTE
    // ==================================================

    async execute(interaction) {

        try {

            const tenVatPham =
                interaction.options
                    .getString("vatpham");

            if (!tenVatPham) {

                return interaction.reply({
                    content:
                        "❌ Vui lòng nhập tên vật phẩm cần sử dụng.",
                    ephemeral: true
                });
            }

            const userId =
                interaction.user.id;

            // ------------------------------------------
            // LẤY TÚI ĐỒ
            // ------------------------------------------

            const tui =
                await layTuiDo(userId);

            if (!tui || !Array.isArray(tui.items)) {

                return interaction.reply({
                    content:
                        "❌ Không tìm thấy túi đồ của bạn.",
                    ephemeral: true
                });
            }

            const items = tui.items;

            // ------------------------------------------
            // TÌM VẬT PHẨM
            // ------------------------------------------

            let item =
                timVatPham(
                    items,
                    tenVatPham
                );

            if (!item) {

                item =
                    timVatPhamGanDung(
                        items,
                        tenVatPham
                    );
            }

            // ------------------------------------------
            // KHÔNG CÓ VẬT PHẨM
            // ------------------------------------------

            if (!item) {

                return interaction.reply({
                    content:
                        `❌ Bạn không có vật phẩm **${tenVatPham}** trong túi đồ.`,
                    ephemeral: true
                });
            }

            // ------------------------------------------
            // KIỂM TRA VẬT PHẨM RÈN/CHẾ TẠO
            // ------------------------------------------

            if (laVatPhamKhongTheDung(item)) {

                return interaction.reply({
                    content:
                        `🚫 **${item.name || item.ten}** là vật phẩm dùng cho rèn đồ/chế tạo hoặc hệ thống khác nên không thể sử dụng bằng \`/dung\`.`,
                    ephemeral: true
                });
            }

            // ------------------------------------------
            // XÁC ĐỊNH LOẠI
            // ------------------------------------------

            const loai =
                xacDinhLoai(item);

            let ketQua;

            // ------------------------------------------
            // XỬ LÝ
            // ------------------------------------------

            switch (loai) {

                case "dan_duoc":

                    ketQua =
                        await dungDanDuoc(
                            interaction,
                            item
                        );

                    break;

                case "phap_bao":

                    ketQua =
                        await dungPhapBao(
                            interaction,
                            item
                        );

                    break;

                case "cong_phap":

                    ketQua =
                        await dungCongPhap(
                            interaction,
                            item
                        );

                    break;

                case "linh_thu":

                    ketQua =
                        await dungLinhThu(
                            interaction,
                            item
                        );

                    break;

                default:

                    ketQua =
                        await dungVatPham(
                            interaction,
                            item
                        );

                    break;
            }

            // ------------------------------------------
            // SỬ DỤNG THẤT BẠI
            // ------------------------------------------

            if (!ketQua || !ketQua.thanhCong) {

                return interaction.reply({
                    content:
                        ketQua?.noiDung ||
                        "❌ Không thể sử dụng vật phẩm này.",
                    ephemeral: true
                });
            }

            // ------------------------------------------
            // TRỪ VẬT PHẨM
            // ------------------------------------------

            const daTru =
                truVatPham(
                    items,
                    item
                );

            if (!daTru) {

                return interaction.reply({
                    content:
                        "❌ Không thể trừ vật phẩm khỏi túi đồ.",
                    ephemeral: true
                });
            }

            // ------------------------------------------
            // LƯU TÚI
            // ------------------------------------------

            await luuTuiDo(
                userId,
                tui
            );

            // ------------------------------------------
            // THÔNG BÁO
            // ------------------------------------------

            const embed =
                new EmbedBuilder()
                    .setTitle("✨ SỬ DỤNG VẬT PHẨM")
                    .setDescription(
                        ketQua.noiDung
                    )
                    .addFields(
                        {
                            name: "📦 Loại",
                            value:
                                loai === "dan_duoc"
                                    ? "💊 Đan dược"
                                    : loai === "phap_bao"
                                        ? "⚔️ Pháp bảo"
                                        : loai === "cong_phap"
                                            ? "📖 Công pháp"
                                            : loai === "linh_thu"
                                                ? "🐉 Linh thú"
                                                : "🎁 Vật phẩm",
                            inline: true
                        },
                        {
                            name: "📉 Số lượng",
                            value: "Đã sử dụng 1",
                            inline: true
                        }
                    )
                    .setTimestamp();

            return interaction.reply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                "Lỗi lệnh /dung:",
                error
            );

            if (interaction.replied ||
                interaction.deferred) {

                return interaction.followUp({
                    content:
                        "❌ Đã xảy ra lỗi khi sử dụng vật phẩm.",
                    ephemeral: true
                });

            }

            return interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi sử dụng vật phẩm.",
                ephemeral: true
            });
        }
    }
};
