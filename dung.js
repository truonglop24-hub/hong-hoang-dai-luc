// ============================================================
// dung.js
// LỆNH: /dung <tên hoặc ID vật phẩm>
// Discord.js v14
// ============================================================

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

// ============================================================
// DATABASE
// dung.js nằm cùng thư mục với database.js
// ============================================================

const {
    getPlayer,
    updatePlayer
} = require("./database");

// ============================================================
// CẤU HÌNH NHÓM VẬT PHẨM KHÔNG ĐƯỢC DÙNG
// ============================================================

const KHONG_THE_DUNG = [
    "nguyen lieu",
    "nguyên liệu",
    "nguyen_lieu",
    "nguyên_liệu",

    "ren do",
    "rèn đồ",
    "ren_do",
    "rèn_đồ",

    "ren",
    "rèn",

    "che tao",
    "chế tạo",
    "che_tao",
    "chế_tạo",

    "nguyen lieu ren",
    "nguyên liệu rèn",

    "nguyen lieu che tao",
    "nguyên liệu chế tạo",

    "nguyen_lieu_ren",
    "nguyên_liệu_rèn",

    "nguyen_lieu_che_tao",
    "nguyên_liệu_chế_tạo"
];

// ============================================================
// CHUẨN HÓA
// ============================================================

function chuanHoa(text) {
    return String(text || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/_/g, " ")
        .replace(/\s+/g, " ");
}

// ============================================================
// LẤY TÊN VẬT PHẨM
// ============================================================

function layTenVatPham(item) {
    if (!item || typeof item !== "object") {
        return "Vật phẩm không tên";
    }

    return (
        item.name ??
        item.ten ??
        item.itemName ??
        item.item_name ??
        item.title ??
        "Vật phẩm không tên"
    );
}

// ============================================================
// LẤY ID VẬT PHẨM
// ============================================================

function layIdVatPham(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

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

// ============================================================
// LẤY CATEGORY
// ============================================================

function layCategory(item) {
    if (!item || typeof item !== "object") {
        return "vatPham";
    }

    return (
        item.__dungCategory ??
        item.category ??
        item.nhom ??
        item.type ??
        item.loai ??
        "vatPham"
    );
}

// ============================================================
// KIỂM TRA ITEM KHÔNG ĐƯỢC DÙNG
// ============================================================

function laVatPhamKhongTheDung(item) {
    if (!item) return true;

    const ten = chuanHoa(
        layTenVatPham(item)
    );

    const loai = chuanHoa(
        item.type ??
        item.loai ??
        ""
    );

    const category = chuanHoa(
        item.category ??
        item.nhom ??
        ""
    );

    const id = chuanHoa(
        layIdVatPham(item) ?? ""
    );

    const text =
        `${ten} ${loai} ${category} ${id}`;

    return KHONG_THE_DUNG.some(
        x =>
            text.includes(
                chuanHoa(x)
            )
    );
}

// ============================================================
// XÁC ĐỊNH LOẠI VẬT PHẨM
// ============================================================

function xacDinhLoai(item) {

    const category = chuanHoa(
        layCategory(item)
    );

    const text = chuanHoa(
        [
            layTenVatPham(item),
            item.name,
            item.ten,
            item.type,
            item.loai,
            item.category,
            item.nhom,
            category
        ]
            .filter(Boolean)
            .join(" ")
    );

    // ========================================================
    // ƯU TIÊN CATEGORY TRONG TÚI
    // ========================================================

    if (
        category.includes("danduoc") ||
        category.includes("dan duoc") ||
        category === "pill"
    ) {
        return "dan_duoc";
    }

    if (
        category.includes("phapbao") ||
        category.includes("phap bao") ||
        category.includes("artifact")
    ) {
        return "phap_bao";
    }

    if (
        category.includes("congphap") ||
        category.includes("cong phap") ||
        category.includes("bi kip") ||
        category.includes("ky nang")
    ) {
        return "cong_phap";
    }

    if (
        category.includes("linhthu") ||
        category.includes("linh thu") ||
        category.includes("pet")
    ) {
        return "linh_thu";
    }

    // ========================================================
    // ĐAN DƯỢC
    // ========================================================

    if (
        text.includes("dan duoc") ||
        text.includes("pill") ||
        text.includes("elixir") ||
        text.includes("thuoc") ||
        text.includes("dung luc")
    ) {
        return "dan_duoc";
    }

    // ========================================================
    // PHÁP BẢO
    // ========================================================

    if (
        text.includes("phap bao") ||
        text.includes("phapbao") ||
        text.includes("artifact") ||
        text.includes("vu khi") ||
        text.includes("weapon")
    ) {
        return "phap_bao";
    }

    // ========================================================
    // CÔNG PHÁP
    // ========================================================

    if (
        text.includes("cong phap") ||
        text.includes("congphap") ||
        text.includes("bi kip") ||
        text.includes("ky nang") ||
        text.includes("skill") ||
        text.includes("cultivation")
    ) {
        return "cong_phap";
    }

    // ========================================================
    // LINH THÚ
    // ========================================================

    if (
        text.includes("linh thu") ||
        text.includes("linhthu") ||
        text.includes("pet") ||
        text.includes("thu cung")
    ) {
        return "linh_thu";
    }

    // ========================================================
    // VẬT PHẨM
    // ========================================================

    return "vat_pham";
}

// ============================================================
// LẤY TÚI ĐỒ
// ============================================================

function layTuiDo(userId) {

    const player =
        getPlayer(userId);

    if (!player) {
        return null;
    }

    if (
        !player.tuiDo ||
        typeof player.tuiDo !== "object"
    ) {
        player.tuiDo = {};
    }

    const tuiDo =
        player.tuiDo;

    const items = [];

    for (
        const [category, danhSach]
        of Object.entries(tuiDo)
    ) {

        if (!Array.isArray(danhSach)) {
            continue;
        }

        for (
            const item of danhSach
        ) {

            if (
                !item ||
                typeof item !== "object"
            ) {
                continue;
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

                item.__dungCategory =
                    category;
            }

            items.push(item);
        }
    }

    return {
        player,
        tuiDo,
        items
    };
}

// ============================================================
// TÌM THEO ID
// ============================================================

function timVatPhamTheoId(
    items,
    idCanTim
) {

    const search =
        String(idCanTim)
            .trim()
            .toLowerCase();

    return items.find(
        item => {

            const id =
                layIdVatPham(item);

            if (
                id === null ||
                id === undefined
            ) {
                return false;
            }

            return (
                String(id)
                    .trim()
                    .toLowerCase() === search
            );
        }
    );
}

// ============================================================
// TÌM TÊN CHÍNH XÁC
// ============================================================

function timVatPhamTheoTen(
    items,
    tenCanTim
) {

    const search =
        chuanHoa(
            tenCanTim
        );

    return items.find(
        item => {

            const ten =
                chuanHoa(
                    layTenVatPham(item)
                );

            return ten === search;
        }
    );
}

// ============================================================
// TÌM GẦN ĐÚNG
// ============================================================

function timVatPhamGanDung(
    items,
    tenCanTim
) {

    const search =
        chuanHoa(
            tenCanTim
        );

    if (!search) {
        return null;
    }

    return items.find(
        item => {

            const ten =
                chuanHoa(
                    layTenVatPham(item)
                );

            if (!ten) {
                return false;
            }

            return (
                ten.includes(search) ||
                search.includes(ten)
            );
        }
    );
}

// ============================================================
// TÌM VẬT PHẨM
// ============================================================

function timVatPham(
    items,
    input
) {

    // 1. ID
    let item =
        timVatPhamTheoId(
            items,
            input
        );

    if (item) {
        return item;
    }

    // 2. Tên chính xác
    item =
        timVatPhamTheoTen(
            items,
            input
        );

    if (item) {
        return item;
    }

    // 3. Tên gần đúng
    return timVatPhamGanDung(
        items,
        input
    );
}

// ============================================================
// LẤY SỐ LƯỢNG
// ============================================================

function laySoLuong(item) {

    const value =
        item.amount ??
        item.soluong ??
        item.quantity ??
        item.soLuong ??
        item.qty;

    if (
        value === undefined ||
        value === null
    ) {
        return 1;
    }

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 1;
}

// ============================================================
// TRỪ 1 ITEM
// ============================================================

function truVatPham(
    tuiDo,
    item
) {

    if (!item) {
        return false;
    }

    const category =
        layCategory(item);

    if (
        !Array.isArray(
            tuiDo[category]
        )
    ) {
        return false;
    }

    const danhSach =
        tuiDo[category];

    const index =
        danhSach.indexOf(item);

    if (index === -1) {
        return false;
    }

    const soLuong =
        laySoLuong(item);

    // ========================================================
    // CÒN 1
    // ========================================================

    if (soLuong <= 1) {

        danhSach.splice(
            index,
            1
        );

        return true;
    }

    // ========================================================
    // CÒN NHIỀU
    // ========================================================

    const newAmount =
        soLuong - 1;

    if (
        item.amount !== undefined
    ) {

        item.amount =
            newAmount;

    } else if (
        item.soluong !== undefined
    ) {

        item.soluong =
            newAmount;

    } else if (
        item.quantity !== undefined
    ) {

        item.quantity =
            newAmount;

    } else if (
        item.soLuong !== undefined
    ) {

        item.soLuong =
            newAmount;

    } else if (
        item.qty !== undefined
    ) {

        item.qty =
            newAmount;

    } else {

        item.amount =
            newAmount;
    }

    return true;
}

// ============================================================
// LẤY GIÁ TRỊ SỐ
// ============================================================

function laySo(
    item,
    keys
) {

    if (!item) {
        return 0;
    }

    for (
        const key of keys
    ) {

        if (
            item[key] !== undefined &&
            item[key] !== null
        ) {

            const value =
                Number(
                    item[key]
                );

            if (
                Number.isFinite(value)
            ) {
                return value;
            }
        }
    }

    return 0;
}

// ============================================================
// DÙNG ĐAN DƯỢC
// ============================================================

async function dungDanDuoc(
    interaction,
    item,
    player
) {

    const ten =
        layTenVatPham(item);

    let hpTang =
        laySo(
            item,
            [
                "hp",
                "heal",
                "hoiMau",
                "hoiHp",
                "healHp"
            ]
        );

    let linhLucTang =
        laySo(
            item,
            [
                "linhLuc",
                "linhLucTang",
                "mana"
            ]
        );

    let tuViTang =
        laySo(
            item,
            [
                "tuvi",
                "tuVi",
                "kinhNghiem",
                "exp"
            ]
        );

    // ========================================================
    // EFFECT OBJECT
    // ========================================================

    if (
        item.effect &&
        typeof item.effect === "object"
    ) {

        hpTang +=
            Number(
                item.effect.hp ??
                item.effect.heal ??
                item.effect.hoiMau ??
                0
            );

        linhLucTang +=
            Number(
                item.effect.linhLuc ??
                item.effect.mana ??
                0
            );

        tuViTang +=
            Number(
                item.effect.tuvi ??
                item.effect.tuVi ??
                item.effect.exp ??
                0
            );
    }

    // ========================================================
    // EFFECTS OBJECT
    // ========================================================

    if (
        item.effects &&
        typeof item.effects === "object"
    ) {

        hpTang +=
            Number(
                item.effects.hp ??
                item.effects.heal ??
                item.effects.hoiMau ??
                0
            );

        linhLucTang +=
            Number(
                item.effects.linhLuc ??
                item.effects.mana ??
                0
            );

        tuViTang +=
            Number(
                item.effects.tuvi ??
                item.effects.tuVi ??
                item.effects.exp ??
                0
            );
    }

    // ========================================================
    // HP
    // ========================================================

    if (hpTang > 0) {

        const maxHp =
            Number(
                player.maxHp || 100
            );

        player.hp =
            Math.min(
                maxHp,
                Number(
                    player.hp || 0
                ) + hpTang
            );
    }

    // ========================================================
    // LINH LỰC
    // ========================================================

    if (linhLucTang > 0) {

        player.linhLuc =
            Number(
                player.linhLuc || 0
            ) + linhLucTang;
    }

    // ========================================================
    // TU VI / KINH NGHIỆM
    // ========================================================

    if (tuViTang > 0) {

        player.kinhNghiem =
            Number(
                player.kinhNghiem || 0
            ) + tuViTang;
    }

    const thongBao = [];

    if (hpTang > 0) {

        thongBao.push(
            `❤️ +${hpTang} HP`
        );
    }

    if (linhLucTang > 0) {

        thongBao.push(
            `💠 +${linhLucTang} Linh lực`
        );
    }

    if (tuViTang > 0) {

        thongBao.push(
            `✨ +${tuViTang} Kinh nghiệm`
        );
    }

    if (
        thongBao.length === 0
    ) {

        thongBao.push(
            "✨ Hiệu lực đan dược đã được kích hoạt."
        );
    }

    return {
        thanhCong: true,

        noiDung:
            `💊 Bạn đã sử dụng **${ten}**!\n\n` +
            thongBao.join("\n")
    };
}

// ============================================================
// DÙNG PHÁP BẢO
// ============================================================

async function dungPhapBao(
    interaction,
    item,
    player
) {

    const ten =
        layTenVatPham(item);

    if (
        !player.phapBao ||
        typeof player.phapBao !== "object"
    ) {

        player.phapBao = {};
    }

    player.phapBao = {
        ...player.phapBao,

        ...item,

        ten,

        id:
            layIdVatPham(item)
    };

    // ========================================================
    // CÔNG
    // ========================================================

    const cong =
        laySo(
            item,
            [
                "cong",
                "attack",
                "atk"
            ]
        );

    // ========================================================
    // THỦ
    // ========================================================

    const thu =
        laySo(
            item,
            [
                "thu",
                "def",
                "defense"
            ]
        );

    if (cong > 0) {

        player.cong =
            Number(
                player.cong || 0
            ) + cong;
    }

    if (thu > 0) {

        player.thu =
            Number(
                player.thu || 0
            ) + thu;
    }

    const buff = [];

    if (cong > 0) {

        buff.push(
            `⚔️ +${cong} Công`
        );
    }

    if (thu > 0) {

        buff.push(
            `🛡️ +${thu} Thủ`
        );
    }

    return {
        thanhCong: true,

        noiDung:
            `⚔️ Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Pháp bảo đã được trang bị.` +
            (
                buff.length > 0
                    ? `\n${buff.join("\n")}`
                    : ""
            )
    };
}

// ============================================================
// DÙNG CÔNG PHÁP
// ============================================================

async function dungCongPhap(
    interaction,
    item,
    player
) {

    const ten =
        layTenVatPham(item);

    if (
        !Array.isArray(
            player.congPhap
        )
    ) {

        player.congPhap = [];
    }

    const id =
        layIdVatPham(item);

    // ========================================================
    // KIỂM TRA ĐÃ HỌC
    // ========================================================

    if (id !== null) {

        const daHoc =
            player.congPhap.some(
                x => {

                    if (
                        !x ||
                        typeof x !== "object"
                    ) {
                        return false;
                    }

                    return String(
                        x.id ??
                        x.itemId ??
                        ""
                    ) ===
                    String(id);
                }
            );

        if (daHoc) {

            return {
                thanhCong: false,

                noiDung:
                    `⚠️ Bạn đã tu luyện **${ten}** rồi.`
            };
        }
    }

    player.congPhap.push({

        id,

        ten,

        item
    });

    const tuLuyen =
        laySo(
            item,
            [
                "tuLuyen",
                "tuLuyenBonus",
                "cultivation"
            ]
        );

    if (tuLuyen > 0) {

        player.tuLuyenBonus =
            Number(
                player.tuLuyenBonus || 0
            ) + tuLuyen;
    }

    return {
        thanhCong: true,

        noiDung:
            `📖 Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Công pháp đã được ghi nhận và kích hoạt.` +
            (
                tuLuyen > 0
                    ? `\n🌟 +${tuLuyen} hiệu quả tu luyện`
                    : ""
            )
    };
}

// ============================================================
// DÙNG LINH THÚ
// ============================================================

async function dungLinhThu(
    interaction,
    item,
    player
) {

    const ten =
        layTenVatPham(item);

    player.linhThuDangSuDung = {

        id:
            layIdVatPham(item),

        ten,

        ...item
    };

    return {
        thanhCong: true,

        noiDung:
            `🐉 Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Linh thú đã được triệu hồi và kích hoạt.`
    };
}

// ============================================================
// DÙNG VẬT PHẨM THƯỜNG
// ============================================================

async function dungVatPham(
    interaction,
    item,
    player
) {

    const ten =
        layTenVatPham(item);

    const coHieuUng =
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        item.coTheSuDung === true ||
        !!item.hieuUng ||
        !!item.effect ||
        !!item.effects ||
        !!item.effectId;

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

// ============================================================
// COMMAND
// ============================================================

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

                        .setName("vatpham")

                        .setDescription(
                            "Nhập tên hoặc ID vật phẩm"
                        )

                        .setRequired(true)

                        .setAutocomplete(true)
            ),

    // ========================================================
    // AUTOCOMPLETE
    // ========================================================

    async autocomplete(
        interaction
    ) {

        try {

            const userId =
                interaction.user.id;

            const tui =
                layTuiDo(userId);

            const items =
                tui?.items || [];

            const input =
                interaction.options
                    .getString(
                        "vatpham"
                    )
                    ?.toLowerCase()
                    .trim() || "";

            const ketQua =
                items

                    .filter(
                        item =>
                            !laVatPhamKhongTheDung(
                                item
                            )
                    )

                    .filter(
                        item => {

                            const ten =
                                String(
                                    layTenVatPham(
                                        item
                                    )
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
                                    ).toLowerCase();

                            return (
                                !input ||
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
                                    id ??
                                    ten
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
                "❌ Lỗi autocomplete /dung:",
                error
            );

            try {

                await interaction.respond([]);

            } catch {}
        }
    },

    // ========================================================
    // EXECUTE
    // ========================================================

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

            // ==================================================
            // PLAYER
            // ==================================================

            const player =
                getPlayer(userId);

            if (!player) {

                return interaction.reply({

                    content:
                        "❌ Không tìm thấy nhân vật của bạn.",

                    ephemeral: true
                });
            }

            // ==================================================
            // TÚI ĐỒ
            // ==================================================

            const tui =
                layTuiDo(userId);

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

            // ==================================================
            // TÌM ITEM
            // ==================================================

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
                layTenVatPham(item);

            const id =
                layIdVatPham(item);

            // ==================================================
            // KHÔNG ĐƯỢC DÙNG
            // ==================================================

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

            // ==================================================
            // XÁC ĐỊNH LOẠI
            // ==================================================

            const loai =
                xacDinhLoai(item);

            let ketQua;

            // ==================================================
            // XỬ LÝ
            // ==================================================

            switch (loai) {

                case "dan_duoc":

                    ketQua =
                        await dungDanDuoc(
                            interaction,
                            item,
                            player
                        );

                    break;

                case "phap_bao":

                    ketQua =
                        await dungPhapBao(
                            interaction,
                            item,
                            player
                        );

                    break;

                case "cong_phap":

                    ketQua =
                        await dungCongPhap(
                            interaction,
                            item,
                            player
                        );

                    break;

                case "linh_thu":

                    ketQua =
                        await dungLinhThu(
                            interaction,
                            item,
                            player
                        );

                    break;

                default:

                    ketQua =
                        await dungVatPham(
                            interaction,
                            item,
                            player
                        );

                    break;
            }

            // ==================================================
            // THẤT BẠI
            // ==================================================

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

            // ==================================================
            // TRỪ ITEM
            // ==================================================

            const daTru =
                truVatPham(
                    tui.tuiDo,
                    item
                );

            if (!daTru) {

                return interaction.reply({

                    content:
                        "❌ Không thể trừ vật phẩm khỏi túi đồ.",

                    ephemeral: true
                });
            }

            // ==================================================
            // LƯU PLAYER
            // ==================================================

            updatePlayer(
                userId,
                {

                    tuiDo:
                        tui.tuiDo,

                    hp:
                        player.hp,

                    maxHp:
                        player.maxHp,

                    linhLuc:
                        player.linhLuc,

                    kinhNghiem:
                        player.kinhNghiem,

                    cong:
                        player.cong,

                    thu:
                        player.thu,

                    phapBao:
                        player.phapBao,

                    congPhap:
                        player.congPhap,

                    tuLuyenBonus:
                        player.tuLuyenBonus,

                    linhThuDangSuDung:
                        player.linhThuDangSuDung
                }
            );

            // ==================================================
            // TÊN LOẠI
            // ==================================================

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

            // ==================================================
            // EMBED
            // ==================================================

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
                "❌ Lỗi lệnh /dung:",
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        `❌ Đã xảy ra lỗi khi sử dụng vật phẩm.\n\`${error.message || error}\``,

                    ephemeral: true
                });
            }

            return interaction.reply({

                content:
                    `❌ Đã xảy ra lỗi khi sử dụng vật phẩm.\n\`${error.message || error}\``,

                ephemeral: true
            });
        }
    }
};
