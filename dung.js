// ============================================================
// dung.js
// LỆNH: /dung <tên hoặc ID vật phẩm>
// Discord.js v14
// TƯƠNG THÍCH: database.js + cuahang.js
// ============================================================

const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// ============================================================
// VẬT PHẨM KHÔNG ĐƯỢC /DUNG
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
// LẤY TÊN
// ============================================================

function layTen(item) {
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
// LẤY ID
// ============================================================

function layId(item) {
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
        item.legacyId ??
        null
    );
}

// ============================================================
// LẤY SỐ LƯỢNG
// ============================================================

function laySoLuong(item) {
    if (!item) return 1;

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

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 1;
    }

    return number;
}

// ============================================================
// GẮN CATEGORY CHO ITEM
// ============================================================

function ganCategory(item, category) {

    if (
        !item ||
        typeof item !== "object"
    ) {
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

        item.__dungCategory =
            category;
    }

    return item;
}

// ============================================================
// LẤY TOÀN BỘ TÚI ĐỒ
//
// QUAN TRỌNG:
// cuahang.js lưu:
//
// player.tuiDo[category] = [
//     item,
//     item,
//     item
// ]
//
// Vì vậy phải quét toàn bộ player.tuiDo.
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

        if (
            !Array.isArray(
                danhSach
            )
        ) {
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

            ganCategory(
                item,
                category
            );

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
// KIỂM TRA KHÔNG ĐƯỢC DÙNG
// ============================================================

function laVatPhamKhongTheDung(item) {

    if (!item) {
        return true;
    }

    const text =
        chuanHoa(
            [
                layTen(item),
                item.type,
                item.loai,
                item.category,
                item.nhom,
                item.itemType,
                item.itemCategory
            ]
                .filter(Boolean)
                .join(" ")
        );

    return KHONG_THE_DUNG.some(
        x =>
            text.includes(
                chuanHoa(x)
            )
    );
}

// ============================================================
// XÁC ĐỊNH CATEGORY
// ============================================================

function layCategory(item) {

    if (!item) {
        return "dacBiet";
    }

    return (
        item.__dungCategory ??
        item.category ??
        item.nhom ??
        "dacBiet"
    );
}

// ============================================================
// XÁC ĐỊNH LOẠI
// ============================================================

function xacDinhLoai(item) {

    const category =
        chuanHoa(
            layCategory(item)
        );

    const text =
        chuanHoa(
            [
                layTen(item),
                item.type,
                item.loai,
                item.category,
                item.nhom,
                category
            ]
                .filter(Boolean)
                .join(" ")
        );

    // -----------------------------
    // CATEGORY ĐAN
    // -----------------------------

    if (
        category === "dan" ||
        category.includes("dan duoc") ||
        category.includes("danduoc") ||
        category === "pill"
    ) {
        return "dan_duoc";
    }

    // -----------------------------
    // CATEGORY PHÁP BẢO
    // -----------------------------

    if (
        category === "phapbao" ||
        category === "phap_bao" ||
        category.includes("phap bao") ||
        category.includes("artifact")
    ) {
        return "phap_bao";
    }

    // -----------------------------
    // CATEGORY CÔNG PHÁP
    // -----------------------------

    if (
        category === "congphap" ||
        category === "cong_phap" ||
        category.includes("cong phap") ||
        category.includes("bi kip") ||
        category.includes("ky nang")
    ) {
        return "cong_phap";
    }

    // -----------------------------
    // CATEGORY LINH THÚ
    // -----------------------------

    if (
        category === "linhthu" ||
        category === "linh_thu" ||
        category.includes("linh thu") ||
        category.includes("pet")
    ) {
        return "linh_thu";
    }

    // -----------------------------
    // TÊN ĐAN
    // -----------------------------

    if (
        text.includes("dan duoc") ||
        text.includes("dan") ||
        text.includes("duoc") ||
        text.includes("pill") ||
        text.includes("elixir") ||
        text.includes("thuoc")
    ) {
        return "dan_duoc";
    }

    // -----------------------------
    // TÊN PHÁP BẢO
    // -----------------------------

    if (
        text.includes("phap bao") ||
        text.includes("artifact") ||
        text.includes("vu khi") ||
        text.includes("weapon")
    ) {
        return "phap_bao";
    }

    // -----------------------------
    // TÊN CÔNG PHÁP
    // -----------------------------

    if (
        text.includes("cong phap") ||
        text.includes("bi kip") ||
        text.includes("ky nang") ||
        text.includes("skill") ||
        text.includes("cultivation")
    ) {
        return "cong_phap";
    }

    // -----------------------------
    // TÊN LINH THÚ
    // -----------------------------

    if (
        text.includes("linh thu") ||
        text.includes("pet") ||
        text.includes("thu cung")
    ) {
        return "linh_thu";
    }

    return "vat_pham";
}

// ============================================================
// TÌM THEO ID
// ============================================================

function timTheoId(
    items,
    input
) {

    const search =
        String(input)
            .trim()
            .toLowerCase();

    return items.find(
        item => {

            const id =
                layId(item);

            if (
                id === null ||
                id === undefined
            ) {
                return false;
            }

            return (
                String(id)
                    .trim()
                    .toLowerCase() ===
                search
            );
        }
    );
}

// ============================================================
// TÌM THEO TÊN CHÍNH XÁC
// ============================================================

function timTheoTen(
    items,
    input
) {

    const search =
        chuanHoa(input);

    return items.find(
        item =>
            chuanHoa(
                layTen(item)
            ) === search
    );
}

// ============================================================
// TÌM TÊN GẦN ĐÚNG
// ============================================================

function timGanDung(
    items,
    input
) {

    const search =
        chuanHoa(input);

    if (!search) {
        return null;
    }

    return items.find(
        item => {

            const ten =
                chuanHoa(
                    layTen(item)
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
//
// ƯU TIÊN:
// 1. ID
// 2. Tên chính xác
// 3. Tên gần đúng
// ============================================================

function timVatPham(
    items,
    input
) {

    let item =
        timTheoId(
            items,
            input
        );

    if (item) {
        return item;
    }

    item =
        timTheoTen(
            items,
            input
        );

    if (item) {
        return item;
    }

    return timGanDung(
        items,
        input
    );
}

// ============================================================
// TRỪ 1 VẬT PHẨM
// ============================================================

function truVatPham(
    tuiDo,
    item
) {

    if (
        !tuiDo ||
        !item
    ) {
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

    // -----------------------------
    // CÒN 1
    // -----------------------------

    if (soLuong <= 1) {

        danhSach.splice(
            index,
            1
        );

        return true;
    }

    // -----------------------------
    // CÒN NHIỀU
    // -----------------------------

    if (
        item.amount !== undefined
    ) {

        item.amount =
            soLuong - 1;

    } else if (
        item.soluong !== undefined
    ) {

        item.soluong =
            soLuong - 1;

    } else if (
        item.quantity !== undefined
    ) {

        item.quantity =
            soLuong - 1;

    } else if (
        item.soLuong !== undefined
    ) {

        item.soLuong =
            soLuong - 1;

    } else if (
        item.qty !== undefined
    ) {

        item.qty =
            soLuong - 1;

    } else {

        item.amount =
            soLuong - 1;
    }

    return true;
}

// ============================================================
// ĐỌC HIỆU ỨNG / BUFF CỦA VẬT PHẨM
// Hỗ trợ item trực tiếp và các object effect/effects/buff/stats
// ============================================================

function layGiaTriSo(item, keys, fallback = 0) {
    const sources = [item, item?.effect, item?.effects, item?.buff, item?.stats, item?.attributes, item?.bonus];

    for (const source of sources) {
        if (!source || typeof source !== "object") continue;

        for (const key of keys) {
            if (
                source[key] !== undefined &&
                source[key] !== null &&
                source[key] !== ""
            ) {
                const value = Number(
                    source[key]
                );

                if (Number.isFinite(value)) {
                    return value;
                }
            }
        }
    }

    return fallback;
}

function layTatCaBuff(item) {
    return {
        hp: layGiaTriSo(
            item,
            [
                "hp",
                "heal",
                "hoiMau",
                "hpBonus",
                "health",
                "healthBonus"
            ]
        ),

        maxHp: layGiaTriSo(
            item,
            [
                "maxHp",
                "maxHP",
                "hpMax",
                "maxHealth",
                "maxHealthBonus"
            ]
        ),

        linhLuc: layGiaTriSo(
            item,
            [
                "linhLuc",
                "linhLucBonus",
                "mana",
                "manaBonus"
            ]
        ),

        tuvi: layGiaTriSo(
            item,
            [
                "tuvi",
                "tuVi",
                "tuviBonus",
                "tuViBonus",
                "cultivationValue"
            ]
        ),

        kinhNghiem: layGiaTriSo(
            item,
            [
                "kinhNghiem",
                "kinhnghiem",
                "exp",
                "experience",
                "experienceBonus"
            ]
        ),

        cong: layGiaTriSo(
            item,
            [
                "cong",
                "congBonus",
                "attack",
                "attackBonus",
                "atk"
            ]
        ),

        thu: layGiaTriSo(
            item,
            [
                "thu",
                "thuBonus",
                "def",
                "defense",
                "defBonus"
            ]
        ),

        tuLuyen: layGiaTriSo(
            item,
            [
                "tuLuyen",
                "tuLuyenBonus",
                "cultivation",
                "cultivationBonus"
            ]
        ),

        dotPha: layGiaTriSo(
            item,
            [
                "dotPha",
                "dotpha",
                "dotPhaBonus",
                "breakthrough",
                "breakthroughBonus"
            ]
        )
    };
}

function apDungBuff(
    player,
    buff
) {

    const thongBao = [];

    if (buff.maxHp !== 0) {

        player.maxHp =
            Number(
                player.maxHp || 100
            ) + buff.maxHp;

        if (buff.maxHp > 0) {
            player.hp =
                Number(
                    player.hp || 0
                ) + buff.maxHp;
        }

        thongBao.push(
            `❤️ ${buff.maxHp > 0 ? "+" : ""}${buff.maxHp} Max HP`
        );
    }

    if (buff.hp !== 0) {

        const maxHp =
            Number(
                player.maxHp || 100
            );

        player.hp =
            Math.min(
                maxHp,
                Number(
                    player.hp || 0
                ) + buff.hp
            );

        thongBao.push(
            `❤️ ${buff.hp > 0 ? "+" : ""}${buff.hp} HP`
        );
    }

    if (buff.linhLuc !== 0) {

        player.linhLuc =
            Number(
                player.linhLuc || 0
            ) + buff.linhLuc;

        thongBao.push(
            `💠 ${buff.linhLuc > 0 ? "+" : ""}${buff.linhLuc} Linh lực`
        );
    }

    if (buff.tuvi !== 0) {

        player.tuvi =
            Number(
                player.tuvi || 0
            ) + buff.tuvi;

        thongBao.push(
            `⚔️ ${buff.tuvi > 0 ? "+" : ""}${buff.tuvi} Tu Vi`
        );
    }

    if (buff.kinhNghiem !== 0) {

        player.kinhNghiem =
            Number(
                player.kinhNghiem || 0
            ) + buff.kinhNghiem;

        thongBao.push(
            `✨ ${buff.kinhNghiem > 0 ? "+" : ""}${buff.kinhNghiem} Kinh nghiệm`
        );
    }

    if (buff.cong !== 0) {

        player.cong =
            Number(
                player.cong || 0
            ) + buff.cong;

        thongBao.push(
            `⚔️ ${buff.cong > 0 ? "+" : ""}${buff.cong} Công`
        );
    }

    if (buff.thu !== 0) {

        player.thu =
            Number(
                player.thu || 0
            ) + buff.thu;

        thongBao.push(
            `🛡️ ${buff.thu > 0 ? "+" : ""}${buff.thu} Thủ`
        );
    }

    if (buff.tuLuyen !== 0) {

        player.tuLuyenBonus =
            Number(
                player.tuLuyenBonus || 0
            ) + buff.tuLuyen;

        thongBao.push(
            `🧘 ${buff.tuLuyen > 0 ? "+" : ""}${buff.tuLuyen}% Tốc độ tu luyện`
        );
    }

    if (buff.dotPha !== 0) {

        player.dotPhaBonus =
            Number(
                player.dotPhaBonus || 0
            ) + buff.dotPha;

        thongBao.push(
            `⚡ ${buff.dotPha > 0 ? "+" : ""}${buff.dotPha}% Đột phá`
        );
    }

    return thongBao;
}

function truBuff(
    player,
    buff
) {

    if (
        !buff ||
        typeof buff !== "object"
    ) {
        return;
    }

    if (buff.maxHp) {

        player.maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 100
                ) - Number(buff.maxHp)
            );

        player.hp =
            Math.min(
                Number(
                    player.hp || 0
                ),
                Number(
                    player.maxHp
                )
            );
    }

    if (buff.linhLuc) {

        player.linhLuc =
            Math.max(
                0,
                Number(
                    player.linhLuc || 0
                ) - Number(buff.linhLuc)
            );
    }

    if (buff.tuvi) {

        player.tuvi =
            Math.max(
                0,
                Number(
                    player.tuvi || 0
                ) - Number(buff.tuvi)
            );
    }

    if (buff.kinhNghiem) {

        player.kinhNghiem =
            Math.max(
                0,
                Number(
                    player.kinhNghiem || 0
                ) - Number(buff.kinhNghiem)
            );
    }

    if (buff.cong) {

        player.cong =
            Math.max(
                0,
                Number(
                    player.cong || 0
                ) - Number(buff.cong)
            );
    }

    if (buff.thu) {

        player.thu =
            Math.max(
                0,
                Number(
                    player.thu || 0
                ) - Number(buff.thu)
            );
    }

    if (buff.tuLuyen) {

        player.tuLuyenBonus =
            Math.max(
                0,
                Number(
                    player.tuLuyenBonus || 0
                ) - Number(buff.tuLuyen)
            );
    }

    if (buff.dotPha) {

        player.dotPhaBonus =
            Math.max(
                0,
                Number(
                    player.dotPhaBonus || 0
                ) - Number(buff.dotPha)
            );
    }
}

// ============================================================
// DÙNG ĐAN DƯỢC
// ============================================================

async function dungDanDuoc(
    item,
    player
) {

    const ten =
        layTen(item);

    const buff =
        layTatCaBuff(item);

    const thongBao =
        apDungBuff(
            player,
            buff
        );

    if (
        !thongBao.length
    ) {

        return {
            thanhCong: false,

            noiDung:
                `❌ **${ten}** không có hiệu ứng chỉ số hợp lệ để sử dụng.`
        };
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
// Thay pháp bảo cũ, không cộng chồng vô hạn
// ============================================================

async function dungPhapBao(
    item,
    player
) {

    const ten =
        layTen(item);

    const buff =
        layTatCaBuff(item);

    if (
        player.phapBao &&
        player.phapBao.__dungBuff
    ) {

        truBuff(
            player,
            player.phapBao.__dungBuff
        );
    }

    player.phapBao = {
        ...item,

        ten,

        id:
            layId(item),

        __dungBuff:
            buff
    };

    const thongBao =
        apDungBuff(
            player,
            buff
        );

    return {
        thanhCong: true,

        noiDung:
            `⚔️ Bạn đã trang bị **${ten}**!\n\n` +
            (
                thongBao.length
                    ? thongBao.join("\n")
                    : "✨ Pháp bảo không có buff chỉ số."
            )
    };
}

// ============================================================
// DÙNG CÔNG PHÁP
// Học một lần, buff cộng trực tiếp
// ============================================================

async function dungCongPhap(
    item,
    player
) {

    const ten =
        layTen(item);

    if (
        !Array.isArray(
            player.congPhap
        )
    ) {

        player.congPhap = [];
    }

    const id =
        layId(item);

    const daHoc =
        player.congPhap.some(
            x => {

                if (
                    !x ||
                    typeof x !== "object"
                ) {
                    return false;
                }

                const oldId =
                    x.id ??
                    x.itemId ??
                    x.itemID ??
                    null;

                return (
                    id !== null &&
                    oldId !== null &&
                    String(oldId) ===
                    String(id)
                );
            }
        );

    if (daHoc) {

        return {
            thanhCong: false,

            noiDung:
                `⚠️ Bạn đã học **${ten}** rồi.`
        };
    }

    const buff =
        layTatCaBuff(item);

    player.congPhap.push({
        id,
        ten,
        item,
        __dungBuff:
            buff
    });

    const thongBao =
        apDungBuff(
            player,
            buff
        );

    return {
        thanhCong: true,

        noiDung:
            `📖 Bạn đã học **${ten}**!\n\n` +
            (
                thongBao.length
                    ? thongBao.join("\n")
                    : "✨ Công pháp đã được ghi nhận."
            )
    };
}

// ============================================================
// DÙNG LINH THÚ
// Thay linh thú cũ, không cộng chồng vô hạn
// ============================================================

async function dungLinhThu(
    item,
    player
) {

    const ten =
        layTen(item);

    const buff =
        layTatCaBuff(item);

    if (
        player.linhThuDangSuDung &&
        player.linhThuDangSuDung.__dungBuff
    ) {

        truBuff(
            player,
            player.linhThuDangSuDung.__dungBuff
        );
    }

    player.linhThuDangSuDung = {
        id:
            layId(item),

        ten,

        ...item,

        __dungBuff:
            buff
    };

    const thongBao =
        apDungBuff(
            player,
            buff
        );

    return {
        thanhCong: true,

        noiDung:
            `🐉 Bạn đã triệu hồi **${ten}**!\n\n` +
            (
                thongBao.length
                    ? thongBao.join("\n")
                    : "✨ Linh thú đã được triệu hồi."
            )
    };
}

// ============================================================
// DÙNG VẬT PHẨM THƯỜNG
// ============================================================

async function dungVatPham(
    item,
    player
) {

    const ten =
        layTen(item);

    const coHieuUng =
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        item.coTheSuDung === true ||
        !!item.hieuUng ||
        !!item.effect ||
        !!item.effects ||
        !!item.buff ||
        !!item.stats ||
        !!item.effectId;

    if (!coHieuUng) {

        return {
            thanhCong: false,

            noiDung:
                `❌ **${ten}** không có chức năng sử dụng.`
        };
    }

    const buff =
        layTatCaBuff(item);

    const thongBao =
        apDungBuff(
            player,
            buff
        );

    return {
        thanhCong: true,

        noiDung:
            `✨ Bạn đã sử dụng **${ten}**!\n` +
            (
                thongBao.length
                    ? thongBao.join("\n")
                    : "💫 Hiệu ứng vật phẩm đã được kích hoạt."
            )
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
                "Sử dụng vật phẩm trong túi đồ"
            )

            .addStringOption(
                option =>
                    option
                        .setName("vatpham")
                        .setDescription(
                            "Nhập tên hoặc ID vật phẩm trong túi đồ"
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

            const tui =
                layTuiDo(
                    interaction.user.id
                );

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
                                    layTen(item)
                                )
                                    .toLowerCase();

                            const id =
                                layId(item);

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
                                layTen(item)
                            );

                        const id =
                            layId(item);

                        return {

                            name:
                                (
                                    id !== null &&
                                    id !== undefined
                                )
                                    ? `${ten} | ID: ${id}`.slice(
                                        0,
                                        100
                                    )
                                    : ten.slice(
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
            // LẤY TÚI ĐỒ
            // ==================================================

            const tui =
                layTuiDo(userId);

            if (!tui) {

                return interaction.reply({

                    content:
                        "❌ Không tìm thấy nhân vật của bạn.",

                    ephemeral: true
                });
            }

            const items =
                tui.items;

            // ==================================================
            // TÌM VẬT PHẨM
            // ==================================================

            const item =
                timVatPham(
                    items,
                    input
                );

            if (!item) {

                return interaction.reply({

                    content:
                        `❌ Không tìm thấy vật phẩm **${input}** trong túi đồ của bạn.\n\n` +
                        `💡 Hãy nhập đúng tên vật phẩm hoặc ID.`,

                    ephemeral: true
                });
            }

            const ten =
                layTen(item);

            const id =
                layId(item);

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
                            item,
                            tui.player
                        );

                    break;

                case "phap_bao":

                    ketQua =
                        await dungPhapBao(
                            item,
                            tui.player
                        );

                    break;

                case "cong_phap":

                    ketQua =
                        await dungCongPhap(
                            item,
                            tui.player
                        );

                    break;

                case "linh_thu":

                    ketQua =
                        await dungLinhThu(
                            item,
                            tui.player
                        );

                    break;

                default:

                    ketQua =
                        await dungVatPham(
                            item,
                            tui.player
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
            // TRỪ 1 ITEM TRỰC TIẾP TRONG CATEGORY
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
            // LƯU DATABASE
            // ==================================================

            updatePlayer(
                userId,
                {
                    tuiDo:
                        tui.tuiDo,

                    hp:
                        tui.player.hp,

                    maxHp:
                        tui.player.maxHp,

                    linhLuc:
                        tui.player.linhLuc,

                    kinhNghiem:
                        tui.player.kinhNghiem,

                    tuvi:
                        tui.player.tuvi,

                    cong:
                        tui.player.cong,

                    thu:
                        tui.player.thu,

                    phapBao:
                        tui.player.phapBao,

                    congPhap:
                        tui.player.congPhap,

                    tuLuyenBonus:
                        tui.player.tuLuyenBonus,

                    dotPhaBonus:
                        tui.player.dotPhaBonus,

                    linhThuDangSuDung:
                        tui.player.linhThuDangSuDung
                }
            );

            // ==================================================
            // TÊN LOẠI
            // ============================================================

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
// ============================================================
// CÁC HÀM XỬ LÝ HIỆU ỨNG NÂNG CAO
// ============================================================

// ------------------------------------------------------------
// ĐỌC GIÁ TRỊ TỪ NHIỀU CẤU TRÚC KHÁC NHAU
// ------------------------------------------------------------

function docGiaTri(item, keys) {

    if (!item) {
        return 0;
    }

    const sources = [
        item,
        item.effect,
        item.effects,
        item.hieuUng,
        item.buff,
        item.buffs,
        item.stats,
        item.attributes,
        item.bonus,
        item.bonusStats
    ];

    for (const source of sources) {

        if (
            !source ||
            typeof source !== "object"
        ) {
            continue;
        }

        for (const key of keys) {

            if (
                source[key] !== undefined &&
                source[key] !== null
            ) {

                const value =
                    Number(
                        source[key]
                    );

                if (
                    Number.isFinite(
                        value
                    )
                ) {
                    return value;
                }
            }
        }
    }

    return 0;
}


// ------------------------------------------------------------
// LẤY BUFF ĐẦY ĐỦ
// ------------------------------------------------------------

function layBuffChiTiet(item) {

    return {

        hp:
            docGiaTri(
                item,
                [
                    "hp",
                    "HP",
                    "heal",
                    "hoiMau",
                    "hoiHp",
                    "hpBonus",
                    "health",
                    "healthBonus"
                ]
            ),

        maxHp:
            docGiaTri(
                item,
                [
                    "maxHp",
                    "maxHP",
                    "max_hp",
                    "hpMax",
                    "healthMax",
                    "maxHealth",
                    "maxHealthBonus"
                ]
            ),

        linhLuc:
            docGiaTri(
                item,
                [
                    "linhLuc",
                    "linh_luc",
                    "linhLucBonus",
                    "mana",
                    "manaBonus"
                ]
            ),

        tuvi:
            docGiaTri(
                item,
                [
                    "tuvi",
                    "tuVi",
                    "tu_vi",
                    "tuviBonus",
                    "tuViBonus",
                    "cultivationValue"
                ]
            ),

        kinhNghiem:
            docGiaTri(
                item,
                [
                    "kinhNghiem",
                    "kinhnghiem",
                    "kinh_nghiem",
                    "exp",
                    "EXP",
                    "experience",
                    "experienceBonus"
                ]
            ),

        cong:
            docGiaTri(
                item,
                [
                    "cong",
                    "congBonus",
                    "attack",
                    "attackBonus",
                    "atk",
                    "damage"
                ]
            ),

        thu:
            docGiaTri(
                item,
                [
                    "thu",
                    "thuBonus",
                    "def",
                    "defense",
                    "defBonus",
                    "armor"
                ]
            ),

        tuLuyen:
            docGiaTri(
                item,
                [
                    "tuLuyen",
                    "tu_luyen",
                    "tuLuyenBonus",
                    "cultivation",
                    "cultivationBonus",
                    "trainingBonus"
                ]
            ),

        dotPha:
            docGiaTri(
                item,
                [
                    "dotPha",
                    "dotpha",
                    "dot_pha",
                    "dotPhaBonus",
                    "breakthrough",
                    "breakthroughBonus"
                ]
            ),

        chiMang:
            docGiaTri(
                item,
                [
                    "chiMang",
                    "crit",
                    "critical",
                    "criticalChance"
                ]
            ),

        neTranh:
            docGiaTri(
                item,
                [
                    "neTranh",
                    "dodge",
                    "dodgeChance"
                ]
            ),

        hoiPhuc:
            docGiaTri(
                item,
                [
                    "hoiPhuc",
                    "regen",
                    "regeneration",
                    "hpRegen"
                ]
            )
    };
}


// ------------------------------------------------------------
// ÁP DỤNG BUFF VÀO NHÂN VẬT
// ------------------------------------------------------------

function congBuff(
    player,
    buff
) {

    if (!player) {
        return [];
    }

    const thongBao = [];

    // --------------------------------------------------------
    // MAX HP
    // --------------------------------------------------------

    if (
        Number(buff.maxHp) !== 0
    ) {

        const giaTri =
            Number(
                buff.maxHp
            );

        player.maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 100
                ) + giaTri
            );

        // Khi tăng Max HP thì tăng HP hiện tại tương ứng
        if (giaTri > 0) {

            player.hp =
                Number(
                    player.hp || 0
                ) + giaTri;
        }

        thongBao.push(
            `❤️ **Max HP:** ${giaTri >= 0 ? "+" : ""}${giaTri}`
        );
    }

    // --------------------------------------------------------
    // HP
    // --------------------------------------------------------

    if (
        Number(buff.hp) !== 0
    ) {

        const maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 100
                )
            );

        player.hp =
            Math.min(
                maxHp,
                Math.max(
                    0,
                    Number(
                        player.hp || 0
                    ) + Number(
                        buff.hp
                    )
                )
            );

        thongBao.push(
            `❤️ **HP:** ${buff.hp >= 0 ? "+" : ""}${buff.hp}`
        );
    }

    // --------------------------------------------------------
    // LINH LỰC
    // --------------------------------------------------------

    if (
        Number(buff.linhLuc) !== 0
    ) {

        player.linhLuc =
            Math.max(
                0,
                Number(
                    player.linhLuc || 0
                ) +
                Number(
                    buff.linhLuc
                )
            );

        thongBao.push(
            `💠 **Linh lực:** ${buff.linhLuc >= 0 ? "+" : ""}${buff.linhLuc}`
        );
    }

    // --------------------------------------------------------
    // TU VI
    // --------------------------------------------------------

    if (
        Number(buff.tuvi) !== 0
    ) {

        player.tuvi =
            Math.max(
                0,
                Number(
                    player.tuvi || 0
                ) +
                Number(
                    buff.tuvi
                )
            );

        thongBao.push(
            `⚔️ **Tu Vi:** ${buff.tuvi >= 0 ? "+" : ""}${buff.tuvi}`
        );
    }

    // --------------------------------------------------------
    // KINH NGHIỆM
    // --------------------------------------------------------

    if (
        Number(buff.kinhNghiem) !== 0
    ) {

        player.kinhNghiem =
            Math.max(
                0,
                Number(
                    player.kinhNghiem || 0
                ) +
                Number(
                    buff.kinhNghiem
                )
            );

        thongBao.push(
            `✨ **Kinh nghiệm:** ${buff.kinhNghiem >= 0 ? "+" : ""}${buff.kinhNghiem}`
        );
    }

    // --------------------------------------------------------
    // CÔNG
    // --------------------------------------------------------

    if (
        Number(buff.cong) !== 0
    ) {

        player.cong =
            Math.max(
                0,
                Number(
                    player.cong || 0
                ) +
                Number(
                    buff.cong
                )
            );

        thongBao.push(
            `⚔️ **Công:** ${buff.cong >= 0 ? "+" : ""}${buff.cong}`
        );
    }

    // --------------------------------------------------------
    // THỦ
    // --------------------------------------------------------

    if (
        Number(buff.thu) !== 0
    ) {

        player.thu =
            Math.max(
                0,
                Number(
                    player.thu || 0
                ) +
                Number(
                    buff.thu
                )
            );

        thongBao.push(
            `🛡️ **Thủ:** ${buff.thu >= 0 ? "+" : ""}${buff.thu}`
        );
    }

    // --------------------------------------------------------
    // BUFF TU LUYỆN
    // --------------------------------------------------------

    if (
        Number(buff.tuLuyen) !== 0
    ) {

        player.tuLuyenBonus =
            Number(
                player.tuLuyenBonus || 0
            ) +
            Number(
                buff.tuLuyen
            );

        thongBao.push(
            `🧘 **Tốc độ tu luyện:** ${buff.tuLuyen >= 0 ? "+" : ""}${buff.tuLuyen}%`
        );
    }

    // --------------------------------------------------------
    // BUFF ĐỘT PHÁ
    // --------------------------------------------------------

    if (
        Number(buff.dotPha) !== 0
    ) {

        player.dotPhaBonus =
            Number(
                player.dotPhaBonus || 0
            ) +
            Number(
                buff.dotPha
            );

        thongBao.push(
            `⚡ **Tỷ lệ đột phá:** ${buff.dotPha >= 0 ? "+" : ""}${buff.dotPha}%`
        );
    }

    // --------------------------------------------------------
    // CHÍ MẠNG
    // --------------------------------------------------------

    if (
        Number(buff.chiMang) !== 0
    ) {

        player.chiMang =
            Number(
                player.chiMang || 0
            ) +
            Number(
                buff.chiMang
            );

        thongBao.push(
            `💥 **Chí mạng:** ${buff.chiMang >= 0 ? "+" : ""}${buff.chiMang}%`
        );
    }

    // --------------------------------------------------------
    // NÉ TRÁNH
    // --------------------------------------------------------

    if (
        Number(buff.neTranh) !== 0
    ) {

        player.neTranh =
            Number(
                player.neTranh || 0
            ) +
            Number(
                buff.neTranh
            );

        thongBao.push(
            `💨 **Né tránh:** ${buff.neTranh >= 0 ? "+" : ""}${buff.neTranh}%`
        );
    }

    // --------------------------------------------------------
    // HỒI PHỤC
    // --------------------------------------------------------

    if (
        Number(buff.hoiPhuc) !== 0
    ) {

        player.hoiPhuc =
            Number(
                player.hoiPhuc || 0
            ) +
            Number(
                buff.hoiPhuc
            );

        thongBao.push(
            `💚 **Hồi phục:** ${buff.hoiPhuc >= 0 ? "+" : ""}${buff.hoiPhuc}%`
        );
    }

    return thongBao;
}


// ============================================================
// GỠ BUFF
// ============================================================

function truBuff(
    player,
    buff
) {

    if (
        !player ||
        !buff
    ) {
        return;
    }

    // --------------------------------------------------------
    // MAX HP
    // --------------------------------------------------------

    if (
        Number(buff.maxHp) !== 0
    ) {

        player.maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 100
                ) -
                Number(
                    buff.maxHp
                )
            );

        player.hp =
            Math.min(
                Number(
                    player.hp || 0
                ),
                Number(
                    player.maxHp
                )
            );
    }

    // --------------------------------------------------------
    // LINH LỰC
    // --------------------------------------------------------

    if (
        Number(buff.linhLuc) !== 0
    ) {

        player.linhLuc =
            Math.max(
                0,
                Number(
                    player.linhLuc || 0
                ) -
                Number(
                    buff.linhLuc
                )
            );
    }

    // --------------------------------------------------------
    // CÔNG
    // --------------------------------------------------------

    if (
        Number(buff.cong) !== 0
    ) {

        player.cong =
            Math.max(
                0,
                Number(
                    player.cong || 0
                ) -
                Number(
                    buff.cong
                )
            );
    }

    // --------------------------------------------------------
    // THỦ
    // --------------------------------------------------------

    if (
        Number(buff.thu) !== 0
    ) {

        player.thu =
            Math.max(
                0,
                Number(
                    player.thu || 0
                ) -
                Number(
                    buff.thu
                )
            );
    }

    // --------------------------------------------------------
    // TU LUYỆN
    // --------------------------------------------------------

    if (
        Number(buff.tuLuyen) !== 0
    ) {

        player.tuLuyenBonus =
            Math.max(
                0,
                Number(
                    player.tuLuyenBonus || 0
                ) -
                Number(
                    buff.tuLuyen
                )
            );
    }

    // --------------------------------------------------------
    // ĐỘT PHÁ
    // --------------------------------------------------------

    if (
        Number(buff.dotPha) !== 0
    ) {

        player.dotPhaBonus =
            Math.max(
                0,
                Number(
                    player.dotPhaBonus || 0
                ) -
                Number(
                    buff.dotPha
                )
            );
    }

    // --------------------------------------------------------
    // CHÍ MẠNG
    // --------------------------------------------------------

    if (
        Number(buff.chiMang) !== 0
    ) {

        player.chiMang =
            Math.max(
                0,
                Number(
                    player.chiMang || 0
                ) -
                Number(
                    buff.chiMang
                )
            );
    }

    // --------------------------------------------------------
    // NÉ TRÁNH
    // --------------------------------------------------------

    if (
        Number(buff.neTranh) !== 0
    ) {

        player.neTranh =
            Math.max(
                0,
                Number(
                    player.neTranh || 0
                ) -
                Number(
                    buff.neTranh
                )
            );
    }

    // --------------------------------------------------------
    // HỒI PHỤC
    // --------------------------------------------------------

    if (
        Number(buff.hoiPhuc) !== 0
    ) {

        player.hoiPhuc =
            Math.max(
                0,
                Number(
                    player.hoiPhuc || 0
                ) -
                Number(
                    buff.hoiPhuc
                )
            );
    }
}


// ============================================================
// FORMAT SỐ
// ============================================================

function formatNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "vi-VN"
    );
}


// ============================================================
// XÁC ĐỊNH LOẠI ITEM CHÍNH XÁC HƠN
// ============================================================

function xacDinhLoaiChiTiet(
    item
) {

    const category =
        chuanHoa(
            layCategory(item)
        );

    const type =
        chuanHoa(
            item?.type ||
            item?.loai ||
            item?.itemType ||
            item?.itemCategory ||
            ""
        );

    const name =
        chuanHoa(
            layTen(item)
        );

    const all =
        `${category} ${type} ${name}`;

    // --------------------------------------------------------
    // LINH THÚ
    // --------------------------------------------------------

    if (
        category.includes("linh thu") ||
        category.includes("linhthu") ||
        type.includes("linh thu") ||
        type.includes("pet")
    ) {
        return "linh_thu";
    }

    // --------------------------------------------------------
    // CÔNG PHÁP
    // --------------------------------------------------------

    if (
        category.includes("cong phap") ||
        category.includes("congphap") ||
        type.includes("cong phap") ||
        type.includes("skill")
    ) {
        return "cong_phap";
    }

    // --------------------------------------------------------
    // PHÁP BẢO
    // --------------------------------------------------------

    if (
        category.includes("phap bao") ||
        category.includes("phapbao") ||
        type.includes("phap bao") ||
        type.includes("artifact")
    ) {
        return "phap_bao";
    }

    // --------------------------------------------------------
    // ĐAN DƯỢC
    // --------------------------------------------------------

    if (
        category.includes("dan duoc") ||
        category.includes("danduoc") ||
        category === "dan" ||
        type.includes("dan duoc") ||
        type.includes("pill")
    ) {
        return "dan_duoc";
    }

    // --------------------------------------------------------
    // DỰ PHÒNG THEO TÊN
    // --------------------------------------------------------

    if (
        all.includes("linh thu")
    ) {
        return "linh_thu";
    }

    if (
        all.includes("cong phap")
    ) {
        return "cong_phap";
    }

    if (
        all.includes("phap bao")
    ) {
        return "phap_bao";
    }

    if (
        all.includes("dan duoc") ||
        all.includes("vien dan") ||
        all.includes("linh dan")
    ) {
        return "dan_duoc";
    }

    return "vat_pham";
}


// ============================================================
// KIỂM TRA ITEM CÓ THỂ SỬ DỤNG KHÔNG
// ============================================================

function kiemTraCoTheDung(
    item
) {

    if (!item) {
        return false;
    }

    if (
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        item.coTheSuDung === true
    ) {
        return true;
    }

    const loai =
        xacDinhLoaiChiTiet(
            item
        );

    if (
        [
            "dan_duoc",
            "phap_bao",
            "cong_phap",
            "linh_thu"
        ].includes(loai)
    ) {
        return true;
    }

    if (
        item.effect ||
        item.effects ||
        item.hieuUng ||
        item.buff ||
        item.buffs ||
        item.stats ||
        item.attributes ||
        item.bonus
    ) {
        return true;
    }

    return false;
}


// ============================================================
// LƯU BUFF CỦA PHÁP BẢO
// ============================================================

function taoPhapBaoDangDung(
    item,
    buff
) {

    return {

        id:
            layId(item),

        ten:
            layTen(item),

        buff: {
            ...buff
        }
    };
}


// ============================================================
// LƯU LINH THÚ ĐANG DÙNG
// ============================================================

function taoLinhThuDangDung(
    item,
    buff
) {

    return {

        id:
            layId(item),

        ten:
            layTen(item),

        buff: {
            ...buff
        }
    };
}


// ============================================================
// DÙNG PHÁP BẢO
// ============================================================

async function xuLyPhapBao(
    player,
    item
) {

    const ten =
        layTen(item);

    const buff =
        layBuffChiTiet(item);

    // --------------------------------------------------------
    // GỠ PHÁP BẢO CŨ
    // --------------------------------------------------------

    if (
        player.phapBaoDangDung &&
        player.phapBaoDangDung.buff
    ) {

        truBuff(
            player,
            player.phapBaoDangDung.buff
        );
    }

    // --------------------------------------------------------
    // CỘNG PHÁP BẢO MỚI
    // --------------------------------------------------------

    const thongBao =
        congBuff(
            player,
            buff
        );

    // --------------------------------------------------------
    // LƯU
    // --------------------------------------------------------

    player.phapBaoDangDung =
        taoPhapBaoDangDung(
            item,
            buff
        );

    player.phapBao =
        player.phapBaoDangDung;

    return {

        success: true,

        title:
            "⚔️ PHÁP BẢO ĐÃ ĐƯỢC TRANG BỊ",

        message:
            `Bạn đã trang bị **${ten}**.`,

        buffs:
            thongBao
    };
}


// ============================================================
// DÙNG LINH THÚ
// ============================================================

async function xuLyLinhThu(
    player,
    item
) {

    const ten =
        layTen(item);

    const buff =
        layBuffChiTiet(item);

    // --------------------------------------------------------
    // GỠ BUFF LINH THÚ CŨ
    // --------------------------------------------------------

    if (
        player.linhThuDangDung &&
        player.linhThuDangDung.buff
    ) {

        truBuff(
            player,
            player.linhThuDangDung.buff
        );
    }

    // --------------------------------------------------------
    // CỘNG BUFF LINH THÚ MỚI
    // --------------------------------------------------------

    const thongBao =
        congBuff(
            player,
            buff
        );

    // --------------------------------------------------------
    // LƯU
    // --------------------------------------------------------

    player.linhThuDangDung =
        taoLinhThuDangDung(
            item,
            buff
        );

    player.linhThu =
        player.linhThuDangDung;

    player.linhThuDangSuDung =
        player.linhThuDangDung;

    return {

        success: true,

        title:
            "🐉 LINH THÚ ĐÃ ĐƯỢC TRIỆU HỒI",

        message:
            `Bạn đã triệu hồi **${ten}**.`,

        buffs:
            thongBao
    };
}


// ============================================================
// DÙNG CÔNG PHÁP
// ============================================================

async function xuLyCongPhap(
    player,
    item
) {

    const ten =
        layTen(item);

    const id =
        layId(item);

    const buff =
        layBuffChiTiet(item);

    // --------------------------------------------------------
    // KHỞI TẠO DANH SÁCH
    // --------------------------------------------------------

    if (
        !Array.isArray(
            player.congPhap
        )
    ) {

        player.congPhap = [];
    }

    // --------------------------------------------------------
    // KIỂM TRA ĐÃ HỌC
    // --------------------------------------------------------

    const daHoc =
        player.congPhap.some(
            cp => {

                if (
                    !cp
                ) {
                    return false;
                }

                const oldId =
                    cp.id ??
                    cp.itemId ??
                    cp.itemID;

                const oldName =
                    cp.ten ??
                    cp.name;

                if (
                    id !== null &&
                    id !== undefined &&
                    oldId !== undefined &&
                    oldId !== null
                ) {

                    if (
                        String(
                            oldId
                        ) ===
                        String(
                            id
                        )
                    ) {
                        return true;
                    }
                }

                if (
                    oldName &&
                    chuanHoa(
                        oldName
                    ) ===
                    chuanHoa(
                        ten
                    )
                ) {
                    return true;
                }

                return false;
            }
        );

    if (daHoc) {

        return {

            success: false,

            title:
                "⚠️ CÔNG PHÁP ĐÃ HỌC",

            message:
                `Bạn đã học **${ten}** trước đó.`,

            buffs: []
        };
    }

    // --------------------------------------------------------
    // CỘNG BUFF
    // --------------------------------------------------------

    const thongBao =
        congBuff(
            player,
            buff
        );

    // --------------------------------------------------------
    // LƯU CÔNG PHÁP
    // --------------------------------------------------------

    player.congPhap.push({

        id,

        ten,

        buff: {
            ...buff
        },

        learnedAt:
            Date.now()
    });

    player.congPhapDangDung = {

        id,

        ten,

        buff: {
            ...buff
        }
    };

    return {

        success: true,

        title:
            "📖 CÔNG PHÁP ĐÃ ĐƯỢC HỌC",

        message:
            `Bạn đã lĩnh ngộ **${ten}**.`,

        buffs:
            thongBao
    };
}


// ============================================================
// DÙNG ĐAN DƯỢC
// ============================================================

async function xuLyDanDuoc(
    player,
    item
) {

    const ten =
        layTen(item);

    const buff =
        layBuffChiTiet(item);

    const thongBao =
        congBuff(
            player,
            buff
        );

    return {

        success: true,

        title:
            "💊 ĐAN DƯỢC ĐÃ ĐƯỢC SỬ DỤNG",

        message:
            `Bạn đã sử dụng **${ten}**.`,

        buffs:
            thongBao
    };
}


// ============================================================
// DÙNG ITEM THƯỜNG
// ============================================================

async function xuLyVatPham(
    player,
    item
) {

    const ten =
        layTen(item);

    if (
        !kiemTraCoTheDung(
            item
        )
    ) {

        return {

            success: false,

            title:
                "🚫 KHÔNG THỂ SỬ DỤNG",

            message:
                `**${ten}** không phải vật phẩm có thể sử dụng bằng \`/dung\`.`,

            buffs: []
        };
    }

    const buff =
        layBuffChiTiet(item);

    const thongBao =
        congBuff(
            player,
            buff
        );

    if (
        thongBao.length === 0 &&
        !item.hieuUng &&
        !item.effect &&
        !item.effects
    ) {

        return {

            success: false,

            title:
                "🚫 VẬT PHẨM KHÔNG CÓ HIỆU ỨNG",

            message:
                `**${ten}** không có hiệu ứng sử dụng được.`,

            buffs: []
        };
    }

    return {

        success: true,

        title:
            "✨ VẬT PHẨM ĐÃ ĐƯỢC SỬ DỤNG",

        message:
            `Bạn đã sử dụng **${ten}**.`,

        buffs:
            thongBao
    };
}
module.exports = {

    data: new SlashCommandBuilder()
        .setName("dung")
        .setDescription(
            "Sử dụng đan dược, pháp bảo, công pháp hoặc linh thú bằng tên hoặc ID"
        )
        .addStringOption(option =>
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

    async autocomplete(interaction) {

        try {

            const userId =
                interaction.user.id;

            const data =
                layTuiDo(userId);

            if (!data) {

                return interaction.respond([]);
            }

            const input =
                interaction.options
                    .getString("vatpham")
                    ?.trim()
                    .toLowerCase() || "";

            const danhSach =
                data.items
                    .filter(item =>
                        !laVatPhamKhongTheDung(
                            item
                        )
                    )
                    .filter(item => {

                        const ten =
                            String(
                                layTen(item)
                            ).toLowerCase();

                        const id =
                            layId(item);

                        const idText =
                            id === null ||
                            id === undefined
                                ? ""
                                : String(
                                    id
                                ).toLowerCase();

                        return (
                            !input ||
                            ten.includes(input) ||
                            idText.includes(input)
                        );
                    })
                    .slice(0, 25);

            await interaction.respond(
                danhSach.map(item => {

                    const ten =
                        String(
                            layTen(item)
                        );

                    const id =
                        layId(item);

                    let display =
                        ten;

                    if (
                        id !== null &&
                        id !== undefined
                    ) {

                        display =
                            `${ten} | ID: ${id}`;
                    }

                    return {

                        name:
                            display.slice(
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
                })
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

    async execute(interaction) {

        try {

            const userId =
                interaction.user.id;

            const input =
                interaction.options
                    .getString("vatpham")
                    ?.trim();

            if (!input) {

                return interaction.reply({

                    content:
                        "❌ Vui lòng nhập tên hoặc ID vật phẩm.",

                    ephemeral: true
                });
            }


            // ==================================================
            // LẤY DỮ LIỆU NGƯỜI CHƠI
            // ==================================================

            const data =
                layTuiDo(userId);

            if (!data) {

                return interaction.reply({

                    content:
                        "❌ Không tìm thấy dữ liệu nhân vật của bạn.",

                    ephemeral: true
                });
            }

            const player =
                data.player;

            const tuiDo =
                data.tuiDo;

            const items =
                data.items;


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
                        `❌ Không tìm thấy **${input}** trong túi đồ.\n\n` +
                        `🔎 Bạn có thể nhập **ID** hoặc **tên vật phẩm**.`,

                    ephemeral: true
                });
            }


            // ==================================================
            // KIỂM TRA VẬT PHẨM
            // ==================================================

            const ten =
                layTen(item);

            const id =
                layId(item);

            const category =
                layCategory(item);

            if (
                laVatPhamKhongTheDung(
                    item
                )
            ) {

                return interaction.reply({

                    content:
                        `🚫 **${ten}** không thể sử dụng bằng lệnh \`/dung\`.\n` +
                        `📦 Loại: \`${category}\``,

                    ephemeral: true
                });
            }


            // ==================================================
            // XÁC ĐỊNH LOẠI
            // ==================================================

            const loai =
                xacDinhLoaiChiTiet(
                    item
                );


            // ==================================================
            // XỬ LÝ
            // ==================================================

            let ketQua;

            switch (loai) {

                case "dan_duoc":

                    ketQua =
                        await xuLyDanDuoc(
                            player,
                            item
                        );

                    break;


                case "phap_bao":

                    ketQua =
                        await xuLyPhapBao(
                            player,
                            item
                        );

                    break;


                case "cong_phap":

                    ketQua =
                        await xuLyCongPhap(
                            player,
                            item
                        );

                    break;


                case "linh_thu":

                    ketQua =
                        await xuLyLinhThu(
                            player,
                            item
                        );

                    break;


                default:

                    ketQua =
                        await xuLyVatPham(
                            player,
                            item
                        );

                    break;
            }


            // ==================================================
            // NẾU KHÔNG THÀNH CÔNG
            // ==================================================

            if (
                !ketQua ||
                ketQua.success !== true
            ) {

                return interaction.reply({

                    content:
                        ketQua?.message ||
                        "❌ Không thể sử dụng vật phẩm này.",

                    ephemeral: true
                });
            }


            // ==================================================
            // TRỪ ITEM SAU KHI SỬ DỤNG THÀNH CÔNG
            // ==================================================

            const daTru =
                truVatPham(
                    tuiDo,
                    item
                );

            if (!daTru) {

                return interaction.reply({

                    content:
                        "❌ Hiệu ứng đã được xử lý nhưng không thể trừ vật phẩm khỏi túi đồ. Vui lòng kiểm tra database.",

                    ephemeral: true
                });
            }


            // ==================================================
            // CẬP NHẬT DỮ LIỆU
            // ==================================================

            const updateData = {

                tuiDo,

                hp:
                    player.hp,

                maxHp:
                    player.maxHp,

                linhLuc:
                    player.linhLuc,

                kinhNghiem:
                    player.kinhNghiem,

                tuvi:
                    player.tuvi,

                cong:
                    player.cong,

                thu:
                    player.thu,

                tuLuyenBonus:
                    player.tuLuyenBonus,

                dotPhaBonus:
                    player.dotPhaBonus,

                chiMang:
                    player.chiMang,

                neTranh:
                    player.neTranh,

                hoiPhuc:
                    player.hoiPhuc,

                phapBao:
                    player.phapBao,

                phapBaoDangDung:
                    player.phapBaoDangDung,

                congPhap:
                    player.congPhap,

                congPhapDangDung:
                    player.congPhapDangDung,

                linhThu:
                    player.linhThu,

                linhThuDangDung:
                    player.linhThuDangDung,

                linhThuDangSuDung:
                    player.linhThuDangSuDung
            };


            updatePlayer(
                userId,
                updateData
            );


            // ==================================================
            // HIỂN THỊ BUFF
            // ==================================================

            let buffText =
                "";

            if (
                Array.isArray(
                    ketQua.buffs
                ) &&
                ketQua.buffs.length
            ) {

                buffText =
                    ketQua.buffs
                        .join("\n");

            } else {

                buffText =
                    "✨ Không có buff chỉ số.";
            }


            // ==================================================
            // LOẠI VẬT PHẨM
            // ==================================================

            let loaiText =
                "🎁 Vật phẩm";

            if (
                loai === "dan_duoc"
            ) {

                loaiText =
                    "💊 Đan dược";

            } else if (
                loai === "phap_bao"
            ) {

                loaiText =
                    "⚔️ Pháp bảo";

            } else if (
                loai === "cong_phap"
            ) {

                loaiText =
                    "📖 Công pháp";

            } else if (
                loai === "linh_thu"
            ) {

                loaiText =
                    "🐉 Linh thú";
            }


            // ==================================================
            // EMBED
            // ==================================================

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        ketQua.title ||
                        "✨ SỬ DỤNG VẬT PHẨM"
                    )

                    .setDescription(
                        ketQua.message ||
                        `Bạn đã sử dụng **${ten}**.`
                    )

                    .addFields({

                        name:
                            "📦 Vật phẩm",

                        value:
                            `**${ten}**`,

                        inline: true

                    }, {

                        name:
                            "🏷️ Loại",

                        value:
                            loaiText,

                        inline: true

                    }, {

                        name:
                            "🔢 ID",

                        value:
                            id !== null &&
                            id !== undefined
                                ? `\`${id}\``
                                : "Không có",

                        inline: true

                    }, {

                        name:
                            "✨ Hiệu ứng",

                        value:
                            buffText
                                .slice(
                                    0,
                                    1024
                                ),

                        inline: false

                    }, {

                        name:
                            "❤️ HP",

                        value:
                            `${formatNumber(
                                player.hp
                            )} / ${formatNumber(
                                player.maxHp
                            )}`,

                        inline: true

                    }, {

                        name:
                            "💠 Linh lực",

                        value:
                            formatNumber(
                                player.linhLuc
                            ),

                        inline: true

                    }, {

                        name:
                            "⚔️ Công",

                        value:
                            formatNumber(
                                player.cong
                            ),

                        inline: true

                    }, {

                        name:
                            "🛡️ Thủ",

                        value:
                            formatNumber(
                                player.thu
                            ),

                        inline: true

                    }, {

                        name:
                            "🔥 Tu Vi",

                        value:
                            formatNumber(
                                player.tuvi
                            ),

                        inline: true

                    }, {

                        name:
                            "🧘 Tu luyện",

                        value:
                            `+${formatNumber(
                                player.tuLuyenBonus
                            )}%`,

                        inline: true
                    })

                    .setTimestamp();


            // ==================================================
            // TRẢ KẾT QUẢ
            // ==================================================

            return interaction.reply({

                embeds: [
                    embed
                ]
            });

        } catch (error) {

            console.error(
                "❌ LỖI /DUNG:",
                error
            );

            const message =
                `❌ Đã xảy ra lỗi khi sử dụng vật phẩm.\n` +
                `\`${error.message || error}\``;

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({

                    content:
                        message,

                    ephemeral: true
                });
            }

            return interaction.reply({

                content:
                    message,

                ephemeral: true
            });
        }
    }
};
