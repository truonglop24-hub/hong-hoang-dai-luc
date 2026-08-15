// commands/dung.js
// LỆNH: /dung <tên hoặc ID vật phẩm>
// Discord.js v14

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

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
// CHUẨN HÓA CHUỖI
// ======================================================

function chuanHoa(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

// ======================================================
// KIỂM TRA VẬT PHẨM KHÔNG ĐƯỢC DÙNG
// ======================================================

function laVatPhamKhongTheDung(item) {
    if (!item) return true;

    const ten = String(
        item.name ||
        item.ten ||
        ""
    ).toLowerCase();

    const loai = String(
        item.type ||
        item.loai ||
        ""
    ).toLowerCase();

    const tag = String(
        item.category ||
        item.nhom ||
        ""
    ).toLowerCase();

    const text = `${ten} ${loai} ${tag}`;

    return KHONG_THE_DUNG.some(x =>
        text.includes(x)
    );
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
        text.includes("pháp_bảo") ||
        text.includes("phap_bao")
    ) {
        return "phap_bao";
    }

    if (
        text.includes("công pháp") ||
        text.includes("cong phap") ||
        text.includes("công_pháp") ||
        text.includes("cong_phap")
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
// LẤY ID VẬT PHẨM
// ======================================================

function layIdVatPham(item) {

    return (
        item.id ??
        item.itemId ??
        item.itemID ??
        item.item_id ??
        item.ma ??
        item.itemCode ??
        item.code ??
        null
    );
}

// ======================================================
// LẤY TÊN VẬT PHẨM
// ======================================================

function layTenVatPham(item) {

    return (
        item.name ||
        item.ten ||
        item.itemName ||
        item.item_name ||
        "Vật phẩm không tên"
    );
}

// ======================================================
// GẮN CATEGORY NỘI BỘ
// ======================================================

function taoItemTrongTui(item, category) {

    if (!item || typeof item !== "object") {
        return item;
    }

    try {

        Object.defineProperty(
            item,
            "__dungCategory",
            {
                value: category,
                writable: true,
                configurable: true,
                enumerable: false
            }
        );

    } catch {

        item.__dungCategory = category;
    }

    return item;
}

// ======================================================
// LẤY TOÀN BỘ TÚI ĐỒ
// ======================================================
//
// Shop hiện tại lưu:
//
// player.tuiDo[category] = [item, item, ...]
//
// Vì vậy /dung phải quét toàn bộ category.
// ======================================================

async function layTuiDo(userId) {

    const player = getPlayer(userId);

    if (!player) {
        return null;
    }

    const tuiDo = player.tuiDo || {};
    const items = [];

    for (
        const [category, danhSach]
        of Object.entries(tuiDo)
    ) {

        if (!Array.isArray(danhSach)) {
            continue;
        }

        for (const item of danhSach) {

            items.push(
                taoItemTrongTui(
                    item,
                    category
                )
            );
        }
    }

    return {
        player,
        tuiDo,
        items
    };
}

// ======================================================
// LƯU LẠI TÚI ĐỒ
// ======================================================

async function luuTuiDo(userId, data) {

    const player = getPlayer(userId);

    if (!player) {
        return false;
    }

    const oldTuiDo =
        player.tuiDo || {};

    const newTuiDo = {};

    // Giữ nguyên toàn bộ category
    for (
        const category
        of Object.keys(oldTuiDo)
    ) {

        newTuiDo[category] = [];
    }

    const items =
        Array.isArray(data?.items)
            ? data.items
            : [];

    for (const item of items) {

        if (
            !item ||
            typeof item !== "object"
        ) {
            continue;
        }

        const category =
            item.__dungCategory ||
            item.category ||
            item.nhom ||
            "dacBiet";

        if (
            !Array.isArray(
                newTuiDo[category]
            )
        ) {
            newTuiDo[category] = [];
        }

        const cleanItem = {
            ...item
        };

        // Không lưu biến nội bộ
        delete cleanItem.__dungCategory;

        newTuiDo[category].push(
            cleanItem
        );
    }

    updatePlayer(
        userId,
        {
            tuiDo: newTuiDo
        }
    );

    return true;
}

// ======================================================
// TÌM THEO ID
// ======================================================

function timVatPhamTheoId(
    items,
    idCanTim
) {

    const search =
        String(idCanTim)
            .trim()
            .toLowerCase();

    return items.find(item => {

        const id =
            layIdVatPham(item);

        if (
            id === null ||
            id === undefined
        ) {
            return false;
        }

        return String(id)
            .trim()
            .toLowerCase() === search;
    });
}

// ======================================================
// TÌM THEO TÊN CHÍNH XÁC
// ======================================================

function timVatPhamTheoTen(
    items,
    tenCanTim
) {

    const search =
        chuanHoa(tenCanTim);

    return items.find(item => {

        const ten =
            chuanHoa(
                layTenVatPham(item)
            );

        return ten === search;
    });
}

// ======================================================
// TÌM GẦN ĐÚNG
// ======================================================

function timVatPhamGanDung(
    items,
    tenCanTim
) {

    const search =
        chuanHoa(tenCanTim);

    return items.find(item => {

        const ten =
            chuanHoa(
                layTenVatPham(item)
            );

        if (
            !ten ||
            !search
        ) {
            return false;
        }

        return (
            ten.includes(search) ||
            search.includes(ten)
        );
    });
}

// ======================================================
// TÌM VẬT PHẨM
// ======================================================

function timVatPham(
    items,
    input
) {

    // Tìm ID
    let item =
        timVatPhamTheoId(
            items,
            input
        );

    if (item) {
        return item;
    }

    // Tìm tên chính xác
    item =
        timVatPhamTheoTen(
            items,
            input
        );

    if (item) {
        return item;
    }

    // Tìm gần đúng
    return timVatPhamGanDung(
        items,
        input
    );
}

// ======================================================
// TRỪ 1 VẬT PHẨM
// ======================================================

function truVatPham(
    items,
    item
) {

    const index =
        items.indexOf(item);

    if (index === -1) {
        return false;
    }

    const soLuong =
        Number(
            item.amount ??
            item.soluong ??
            item.quantity ??
            1
        );

    if (soLuong <= 1) {

        items.splice(
            index,
            1
        );

    } else {

        if (
            item.amount !==
            undefined
        ) {

            item.amount =
                soLuong - 1;

        } else if (
            item.soluong !==
            undefined
        ) {

            item.soluong =
                soLuong - 1;

        } else if (
            item.quantity !==
            undefined
        ) {

            item.quantity =
                soLuong - 1;

        } else {

            item.amount =
                soLuong - 1;
        }
    }

    return true;
}

// ======================================================
// DÙNG ĐAN DƯỢC
// ======================================================

async function dungDanDuoc(
    interaction,
    item
) {

    const ten =
        layTenVatPham(item);

    return {

        thanhCong: true,

        noiDung:
            `💊 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Hiệu lực của đan dược đã được kích hoạt.`
    };
}

// ======================================================
// DÙNG PHÁP BẢO
// ======================================================

async function dungPhapBao(
    interaction,
    item
) {

    const ten =
        layTenVatPham(item);

    return {

        thanhCong: true,

        noiDung:
            `⚔️ Bạn đã sử dụng **${ten}**!\n` +
            `✨ Pháp bảo đã được kích hoạt/trang bị.`
    };
}

// ======================================================
// DÙNG CÔNG PHÁP
// ======================================================

async function dungCongPhap(
    interaction,
    item
) {

    const ten =
        layTenVatPham(item);

    return {

        thanhCong: true,

        noiDung:
            `📖 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Công pháp đã được kích hoạt/tu luyện.`
    };
}

// ======================================================
// DÙNG LINH THÚ
// ======================================================

async function dungLinhThu(
    interaction,
    item
) {

    const ten =
        layTenVatPham(item);

    return {

        thanhCong: true,

        noiDung:
            `🐉 Bạn đã sử dụng **${ten}**!\n` +
            `✨ Linh thú đã được triệu hồi/kích hoạt.`
    };
}

// ======================================================
// DÙNG VẬT PHẨM THƯỜNG
// ======================================================

async function dungVatPham(
    interaction,
    item
) {

    const ten =
        layTenVatPham(item);

    const coHieuUng =
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        !!item.hieuUng ||
        !!item.effect ||
        !!item.effects;

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

    data:
        new SlashCommandBuilder()

            .setName("dung")

            .setDescription(
                "Sử dụng vật phẩm bằng tên hoặc ID"
            )

            .addStringOption(
                option =>
                    option

                        .setName(
                            "vatpham"
                        )

                        .setDescription(
                            "Nhập tên hoặc ID vật phẩm"
                        )

                        .setRequired(
                            true
                        )

                        .setAutocomplete(
                            true
                        )
            ),

    // ==================================================
    // AUTOCOMPLETE
    // ==================================================

    async autocomplete(
        interaction
    ) {

        try {

            const userId =
                interaction.user.id;

            const tui =
                await layTuiDo(
                    userId
                );

            const items =
                tui?.items || [];

            const input =
                interaction.options
                    .getString(
                        "vatpham"
                    )
                    ?.toLowerCase() ||
                "";

            const ketQua =
                items

                    .filter(
                        item => {

                            if (
                                laVatPhamKhongTheDung(
                                    item
                                )
                            ) {
                                return false;
                            }

                            const ten =
                                layTenVatPham(
                                    item
                                )
                                    .toLowerCase();

                            const id =
                                layIdVatPham(
                                    item
                                );

                            const idText =
                                id === null ||
                                id === undefined
                                    ? ""
                                    : String(
                                        id
                                    )
                                        .toLowerCase();

                            return (
                                ten.includes(
                                    input
                                ) ||
                                idText.includes(
                                    input
                                )
                            );
                        }
                    )

                    .slice(
                        0,
                        25
                    );

            await interaction.respond(

                ketQua.map(
                    item => {

                        const ten =
                            String(
                                layTenVatPham(
                                    item
                                )
                            );

                        const id =
                            layIdVatPham(
                                item
                            );

                        let hienThi =
                            ten;

                        if (
                            id !== null &&
                            id !== undefined
                        ) {

                            hienThi =
                                `${ten} | ID: ${id}`;
                        }

                        return {

                            name:
                                hienThi.slice(
                                    0,
                                    100
                                ),

                            value:
                                String(
                                    layIdVatPham(
                                        item
                                    ) ??
                                    layTenVatPham(
                                        item
                                    )
                                ).slice(
                                    0,
                                    100
                                )
                        };
                    }
                )
            );

        } catch (error) {

            console.error(
                "Lỗi autocomplete /dung:",
                error
            );

            try {

                await interaction.respond(
                    []
                );

            } catch {}
        }
    },

    // ==================================================
    // EXECUTE
    // ==================================================

    async execute(
        interaction
    ) {

        try {

            const input =
                interaction.options
                    .getString(
                        "vatpham"
                    )
                    ?.trim();

            if (!input) {

                return interaction.reply({

                    content:
                        "❌ Vui lòng nhập tên hoặc ID vật phẩm.",

                    ephemeral: true
                });
            }

            const userId =
                interaction.user.id;

            // ------------------------------------------
            // LẤY TÚI ĐỒ
            // ------------------------------------------

            const tui =
                await layTuiDo(
                    userId
                );

            if (
                !tui ||
                !Array.isArray(
                    tui.items
                )
            ) {

                return interaction.reply({

                    content:
                        "❌ Không tìm thấy túi đồ của bạn.",

                    ephemeral: true
                });
            }

            const items =
                tui.items;

            // ------------------------------------------
            // TÌM VẬT PHẨM
            // ------------------------------------------

            const item =
                timVatPham(
                    items,
                    input
                );

            if (!item) {

                return interaction.reply({

                    content:
                        `❌ Không tìm thấy vật phẩm **${input}** trong túi đồ của bạn.`,

                    ephemeral: true
                });
            }

            const ten =
                layTenVatPham(
                    item
                );

            const id =
                layIdVatPham(
                    item
                );

            // ------------------------------------------
            // KIỂM TRA KHÔNG ĐƯỢC DÙNG
            // ------------------------------------------

            if (
                laVatPhamKhongTheDung(
                    item
                )
            ) {

                return interaction.reply({

                    content:
                        `🚫 **${ten}** là vật phẩm dùng cho rèn đồ/chế tạo hoặc hệ thống khác nên không thể sử dụng bằng \`/dung\`.`,

                    ephemeral: true
                });
            }

            // ------------------------------------------
            // XÁC ĐỊNH LOẠI
            // ------------------------------------------

            const loai =
                xacDinhLoai(
                    item
                );

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
            // DÙNG THẤT BẠI
            // ------------------------------------------

            if (
                !ketQua ||
                !ketQua.thanhCong
            ) {

                return interaction.reply({

                    content:
                        ketQua?.noiDung ||
                        "❌ Không thể sử dụng vật phẩm này.",

                    ephemeral: true
                });
            }

            // ------------------------------------------
            // TRỪ 1 VẬT PHẨM
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
            // LƯU LẠI
            // ------------------------------------------

            await luuTuiDo(
                userId,
                tui
            );

            // ------------------------------------------
            // TÊN LOẠI
            // ------------------------------------------

            let tenLoai =
                "🎁 Vật phẩm";

            if (
                loai === "dan_duoc"
            ) {

                tenLoai =
                    "💊 Đan dược";

            } else if (
                loai === "phap_bao"
            ) {

                tenLoai =
                    "⚔️ Pháp bảo";

            } else if (
                loai === "cong_phap"
            ) {

                tenLoai =
                    "📖 Công pháp";

            } else if (
                loai === "linh_thu"
            ) {

                tenLoai =
                    "🐉 Linh thú";
            }

            // ------------------------------------------
            // EMBED
            // ------------------------------------------

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "✨ SỬ DỤNG VẬT PHẨM"
                    )

                    .setDescription(
                        ketQua.noiDung
                    )

                    .addFields(

                        {
                            name:
                                "📦 Vật phẩm",

                            value:
                                `**${ten}**`,

                            inline: true
                        },

                        {
                            name:
                                "🏷️ Loại",

                            value:
                                tenLoai,

                            inline: true
                        },

                        {
                            name:
                                "🔢 ID",

                            value:
                                id !== null &&
                                id !== undefined
                                    ? `\`${id}\``
                                    : "Không có",

                            inline: true
                        },

                        {
                            name:
                                "📉 Số lượng",

                            value:
                                "Đã sử dụng 1",

                            inline: true
                        }
                    )

                    .setTimestamp();

            return interaction.reply({

                embeds: [
                    embed
                ]
            });

        } catch (error) {

            console.error(
                "Lỗi lệnh /dung:",
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {

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
