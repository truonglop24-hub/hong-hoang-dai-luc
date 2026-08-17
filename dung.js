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
// KIỂM TRA VẬT PHẨM KHÔNG ĐƯỢC DÙNG
// ============================================================

function laVatPhamKhongTheDung(item) {

    if (!item) {
        return true;
    }

    const ten =
        chuanHoa(
            layTen(item)
        );

    const category =
        chuanHoa(
            layCategory(item)
        );

    const type =
        chuanHoa(
            item.type ??
            item.loai ??
            ""
        );

    const nhom =
        chuanHoa(
            item.nhom ??
            ""
        );

    const text =
        [
            ten,
            category,
            type,
            nhom
        ]
            .filter(Boolean)
            .join(" ");

    return KHONG_THE_DUNG.some(
        x =>
            text.includes(
                chuanHoa(x)
            )
    );
}

// ============================================================
// LẤY CATEGORY
// ============================================================

function layCategory(item) {

    if (!item) {
        return "";
    }

    return (
        item.__dungCategory ??
        item.category ??
        item.nhom ??
        item.type ??
        item.loai ??
        item.itemCategory ??
        item.itemType ??
        ""
    );
}

// ============================================================
// TÌM THEO ID
// ============================================================

function timTheoId(
    items,
    input
) {

    const search =
        String(
            input || ""
        )
            .trim()
            .toLowerCase();

    if (!search) {
        return null;
    }

    return (
        items.find(
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
        ) ||
        null
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

    if (!search) {
        return null;
    }

    return (
        items.find(
            item =>
                chuanHoa(
                    layTen(item)
                ) === search
        ) ||
        null
    );
}

// ============================================================
// TÌM THEO TÊN GẦN ĐÚNG
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

    return (
        items.find(
            item => {

                const ten =
                    chuanHoa(
                        layTen(item)
                    );

                const id =
                    layId(item);

                const idText =
                    id === null ||
                    id === undefined
                        ? ""
                        : chuanHoa(id);

                return (
                    (
                        ten &&
                        (
                            ten.includes(
                                search
                            ) ||
                            search.includes(
                                ten
                            )
                        )
                    ) ||
                    (
                        idText &&
                        idText === search
                    )
                );
            }
        ) ||
        null
    );
}

// ============================================================
// TÌM VẬT PHẨM
// ƯU TIÊN: ID → TÊN CHÍNH XÁC → TÊN GẦN ĐÚNG
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
// TRỪ VẬT PHẨM
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

    let category =
        layCategory(item);

    // --------------------------------------------------------
    // TÌM ĐÚNG CATEGORY
    // --------------------------------------------------------

    let danhSach =
        Array.isArray(
            tuiDo[category]
        )
            ? tuiDo[category]
            : null;

    let index =
        danhSach
            ? danhSach.indexOf(item)
            : -1;

    // --------------------------------------------------------
    // NẾU KHÔNG TÌM THẤY THÌ QUÉT TOÀN BỘ TÚI
    // --------------------------------------------------------

    if (
        !danhSach ||
        index === -1
    ) {

        for (
            const [key, list]
            of Object.entries(tuiDo)
        ) {

            if (
                !Array.isArray(list)
            ) {
                continue;
            }

            const found =
                list.findIndex(
                    x => {

                        if (
                            x === item
                        ) {
                            return true;
                        }

                        const xid =
                            layId(x);

                        const iid =
                            layId(item);

                        // -----------------------------
                        // SO ID
                        // -----------------------------

                        if (
                            xid !== null &&
                            xid !== undefined &&
                            iid !== null &&
                            iid !== undefined
                        ) {

                            if (
                                String(xid) ===
                                String(iid)
                            ) {
                                return true;
                            }
                        }

                        // -----------------------------
                        // SO TÊN
                        // -----------------------------

                        const xten =
                            chuanHoa(
                                layTen(x)
                            );

                        const iten =
                            chuanHoa(
                                layTen(item)
                            );

                        if (
                            xten &&
                            iten &&
                            xten === iten
                        ) {
                            return true;
                        }

                        return false;
                    }
                );

            if (
                found !== -1
            ) {

                category =
                    key;

                danhSach =
                    list;

                index =
                    found;

                break;
            }
        }
    }

    // --------------------------------------------------------
    // KHÔNG TÌM THẤY
    // --------------------------------------------------------

    if (
        !danhSach ||
        index === -1
    ) {
        return false;
    }

    // --------------------------------------------------------
    // LẤY SỐ LƯỢNG
    // --------------------------------------------------------

    const soLuong =
        laySoLuong(item);

    // --------------------------------------------------------
    // CHỈ CÒN 1
    // --------------------------------------------------------

    if (
        soLuong <= 1
    ) {

        danhSach.splice(
            index,
            1
        );

        return true;
    }

    // --------------------------------------------------------
    // CÒN NHIỀU
    // --------------------------------------------------------

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
// FORMAT SỐ
// ============================================================

function formatNumber(
    number
) {

    const n =
        Number(number);

    if (
        !Number.isFinite(n)
    ) {
        return "0";
    }

    return n.toLocaleString(
        "vi-VN"
    );
}

// ============================================================
// LẤY BUFF CHI TIẾT
// ============================================================

function layBuffChiTiet(
    item
) {

    const buff = {

        hp: 0,

        maxHp: 0,

        linhLuc: 0,

        tuvi: 0,

        kinhNghiem: 0,

        cong: 0,

        thu: 0,

        chiMang: 0,

        neTranh: 0,

        hoiPhuc: 0,

        tuLuyen: 0,

        dotPha: 0
    };

    if (!item) {
        return buff;
    }

    // --------------------------------------------------------
    // BUFF TRỰC TIẾP
    // --------------------------------------------------------

    buff.hp +=
        Number(
            item.hp ??
            item.heal ??
            item.hoiMau ??
            0
        ) || 0;

    buff.maxHp +=
        Number(
            item.maxHp ??
            item.maxHpBonus ??
            item.hpMax ??
            0
        ) || 0;

    buff.linhLuc +=
        Number(
            item.linhLuc ??
            item.linhLucBonus ??
            item.mana ??
            0
        ) || 0;

    buff.tuvi +=
        Number(
            item.tuvi ??
            item.tuVi ??
            item.tuviBonus ??
            0
        ) || 0;

    buff.kinhNghiem +=
        Number(
            item.kinhNghiem ??
            item.kinhNghiemBonus ??
            item.exp ??
            0
        ) || 0;

    buff.cong +=
        Number(
            item.cong ??
            item.congBonus ??
            item.attack ??
            item.atk ??
            0
        ) || 0;

    buff.thu +=
        Number(
            item.thu ??
            item.thuBonus ??
            item.def ??
            item.defense ??
            0
        ) || 0;

    buff.chiMang +=
        Number(
            item.chiMang ??
            item.crit ??
            item.critRate ??
            0
        ) || 0;

    buff.neTranh +=
        Number(
            item.neTranh ??
            item.dodge ??
            item.evasion ??
            0
        ) || 0;

    buff.hoiPhuc +=
        Number(
            item.hoiPhuc ??
            item.regen ??
            0
        ) || 0;

    buff.tuLuyen +=
        Number(
            item.tuLuyen ??
            item.tuLuyenBonus ??
            item.cultivation ??
            0
        ) || 0;

    buff.dotPha +=
        Number(
            item.dotPha ??
            item.dotPhaBonus ??
            item.breakthrough ??
            0
        ) || 0;
                item.breakthrough ??
            0
        ) || 0;

    // --------------------------------------------------------
    // EFFECT
    // --------------------------------------------------------

    if (
        item.effect &&
        typeof item.effect === "object"
    ) {

        buff.hp +=
            Number(
                item.effect.hp ??
                item.effect.heal ??
                item.effect.hoiMau ??
                0
            ) || 0;

        buff.maxHp +=
            Number(
                item.effect.maxHp ??
                item.effect.maxHpBonus ??
                0
            ) || 0;

        buff.linhLuc +=
            Number(
                item.effect.linhLuc ??
                item.effect.mana ??
                0
            ) || 0;

        buff.tuvi +=
            Number(
                item.effect.tuvi ??
                item.effect.tuVi ??
                0
            ) || 0;

        buff.kinhNghiem +=
            Number(
                item.effect.kinhNghiem ??
                item.effect.exp ??
                0
            ) || 0;

        buff.cong +=
            Number(
                item.effect.cong ??
                item.effect.attack ??
                item.effect.atk ??
                0
            ) || 0;

        buff.thu +=
            Number(
                item.effect.thu ??
                item.effect.def ??
                item.effect.defense ??
                0
            ) || 0;

        buff.chiMang +=
            Number(
                item.effect.chiMang ??
                item.effect.crit ??
                0
            ) || 0;

        buff.neTranh +=
            Number(
                item.effect.neTranh ??
                item.effect.dodge ??
                0
            ) || 0;

        buff.hoiPhuc +=
            Number(
                item.effect.hoiPhuc ??
                item.effect.regen ??
                0
            ) || 0;

        buff.tuLuyen +=
            Number(
                item.effect.tuLuyen ??
                item.effect.cultivation ??
                0
            ) || 0;

        buff.dotPha +=
            Number(
                item.effect.dotPha ??
                item.effect.breakthrough ??
                0
            ) || 0;
    }

    // --------------------------------------------------------
    // EFFECTS
    // --------------------------------------------------------

    if (
        item.effects &&
        typeof item.effects === "object"
    ) {

        buff.hp +=
            Number(
                item.effects.hp ??
                item.effects.heal ??
                item.effects.hoiMau ??
                0
            ) || 0;

        buff.maxHp +=
            Number(
                item.effects.maxHp ??
                item.effects.maxHpBonus ??
                0
            ) || 0;

        buff.linhLuc +=
            Number(
                item.effects.linhLuc ??
                item.effects.mana ??
                0
            ) || 0;

        buff.tuvi +=
            Number(
                item.effects.tuvi ??
                item.effects.tuVi ??
                0
            ) || 0;

        buff.kinhNghiem +=
            Number(
                item.effects.kinhNghiem ??
                item.effects.exp ??
                0
            ) || 0;

        buff.cong +=
            Number(
                item.effects.cong ??
                item.effects.attack ??
                item.effects.atk ??
                0
            ) || 0;

        buff.thu +=
            Number(
                item.effects.thu ??
                item.effects.def ??
                item.effects.defense ??
                0
            ) || 0;

        buff.chiMang +=
            Number(
                item.effects.chiMang ??
                item.effects.crit ??
                0
            ) || 0;

        buff.neTranh +=
            Number(
                item.effects.neTranh ??
                item.effects.dodge ??
                0
            ) || 0;

        buff.hoiPhuc +=
            Number(
                item.effects.hoiPhuc ??
                item.effects.regen ??
                0
            ) || 0;

        buff.tuLuyen +=
            Number(
                item.effects.tuLuyen ??
                item.effects.cultivation ??
                0
            ) || 0;

        buff.dotPha +=
            Number(
                item.effects.dotPha ??
                item.effects.breakthrough ??
                0
            ) || 0;
    }

    return buff;
}


// ============================================================
// ÁP DỤNG BUFF VÀO NHÂN VẬT
// ============================================================

function apDungBuff(
    player,
    buff
) {

    if (
        !player ||
        !buff
    ) {
        return [];
    }

    const thayDoi = [];

    // --------------------------------------------------------
    // HP TỐI ĐA
    // --------------------------------------------------------

    if (
        Number(buff.maxHp) !== 0
    ) {

        const oldMaxHp =
            Number(
                player.maxHp || 100
            );

        player.maxHp =
            Math.max(
                1,
                oldMaxHp +
                Number(
                    buff.maxHp
                )
            );

        thayDoi.push(
            `❤️ HP tối đa: **${formatNumber(oldMaxHp)} → ${formatNumber(player.maxHp)}**`
        );

        if (
            Number(buff.maxHp) > 0
        ) {

            player.hp =
                Number(
                    player.hp || 0
                ) +
                Number(
                    buff.maxHp
                );
        }
    }

    // --------------------------------------------------------
    // HP
    // --------------------------------------------------------

    if (
        Number(buff.hp) !== 0
    ) {

        const maxHp =
            Number(
                player.maxHp || 100
            );

        const oldHp =
            Number(
                player.hp || 0
            );

        player.hp =
            Math.min(
                maxHp,
                Math.max(
                    0,
                    oldHp +
                    Number(
                        buff.hp
                    )
                )
            );

        thayDoi.push(
            `❤️ HP: **${formatNumber(oldHp)} → ${formatNumber(player.hp)}**`
        );
    }

    // --------------------------------------------------------
    // LINH LỰC
    // --------------------------------------------------------

    if (
        Number(buff.linhLuc) !== 0
    ) {

        const old =
            Number(
                player.linhLuc || 0
            );

        player.linhLuc =
            Math.max(
                0,
                old +
                Number(
                    buff.linhLuc
                )
            );

        thayDoi.push(
            `💠 Linh lực: **${formatNumber(old)} → ${formatNumber(player.linhLuc)}**`
        );
    }

    // --------------------------------------------------------
    // TU VI
    // --------------------------------------------------------

    if (
        Number(buff.tuvi) !== 0
    ) {

        const old =
            Number(
                player.tuvi || 0
            );

        player.tuvi =
            Math.max(
                0,
                old +
                Number(
                    buff.tuvi
                )
            );

        thayDoi.push(
            `✨ Tu Vi: **${formatNumber(old)} → ${formatNumber(player.tuvi)}**`
        );
    }

    // --------------------------------------------------------
    // KINH NGHIỆM
    // --------------------------------------------------------

    if (
        Number(buff.kinhNghiem) !== 0
    ) {

        const old =
            Number(
                player.kinhNghiem || 0
            );

        player.kinhNghiem =
            Math.max(
                0,
                old +
                Number(
                    buff.kinhNghiem
                )
            );

        thayDoi.push(
            `📚 Kinh nghiệm: **+${formatNumber(buff.kinhNghiem)}**`
        );
    }

    // --------------------------------------------------------
    // CÔNG
    // --------------------------------------------------------

    if (
        Number(buff.cong) !== 0
    ) {

        const old =
            Number(
                player.cong || 0
            );

        player.cong =
            old +
            Number(
                buff.cong
            );

        thayDoi.push(
            `⚔️ Công: **${formatNumber(old)} → ${formatNumber(player.cong)}**`
        );
    }

    // --------------------------------------------------------
    // THỦ
    // --------------------------------------------------------

    if (
        Number(buff.thu) !== 0
    ) {

        const old =
            Number(
                player.thu || 0
            );

        player.thu =
            old +
            Number(
                buff.thu
            );

        thayDoi.push(
            `🛡️ Thủ: **${formatNumber(old)} → ${formatNumber(player.thu)}**`
        );
    }

    // --------------------------------------------------------
    // CHÍ MẠNG
    // --------------------------------------------------------

    if (
        Number(buff.chiMang) !== 0
    ) {

        const old =
            Number(
                player.chiMang || 0
            );

        player.chiMang =
            old +
            Number(
                buff.chiMang
            );

        thayDoi.push(
            `💥 Chí mạng: **+${formatNumber(buff.chiMang)}**`
        );
    }

    // --------------------------------------------------------
    // NÉ TRÁNH
    // --------------------------------------------------------

    if (
        Number(buff.neTranh) !== 0
    ) {

        const old =
            Number(
                player.neTranh || 0
            );

        player.neTranh =
            old +
            Number(
                buff.neTranh
            );

        thayDoi.push(
            `💨 Né tránh: **+${formatNumber(buff.neTranh)}**`
        );
    }

    // --------------------------------------------------------
    // HỒI PHỤC
    // --------------------------------------------------------

    if (
        Number(buff.hoiPhuc) !== 0
    ) {

        const old =
            Number(
                player.hoiPhuc || 0
            );

        player.hoiPhuc =
            old +
            Number(
                buff.hoiPhuc
            );

        thayDoi.push(
            `💚 Hồi phục: **+${formatNumber(buff.hoiPhuc)}**`
        );
    }

    // --------------------------------------------------------
    // BONUS TU LUYỆN
    // --------------------------------------------------------

    if (
        Number(buff.tuLuyen) !== 0
    ) {

        const old =
            Number(
                player.tuLuyenBonus || 0
            );

        player.tuLuyenBonus =
            old +
            Number(
                buff.tuLuyen
            );

        thayDoi.push(
            `🌟 Hiệu quả tu luyện: **+${formatNumber(buff.tuLuyen)}**`
        );
    }

    // --------------------------------------------------------
    // BONUS ĐỘT PHÁ
    // --------------------------------------------------------

    if (
        Number(buff.dotPha) !== 0
    ) {

        const old =
            Number(
                player.dotPhaBonus || 0
            );

        player.dotPhaBonus =
            old +
            Number(
                buff.dotPha
            );

        thayDoi.push(
            `⚡ Tỷ lệ/hiệu quả đột phá: **+${formatNumber(buff.dotPha)}**`
        );
    }

    return thayDoi;
}


// ============================================================
// ĐỔI LINH CĂN
// ============================================================

function doiLinhCan(
    player,
    item
) {

    if (
        !player ||
        !item
    ) {
        return null;
    }

    const linhCanMoi =
        item.linhCanMoi ??
        item.linhCanMoiId ??
        item.newLinhCan ??
        item.newLinhCanId ??
        item.effect?.linhCanMoi ??
        item.effect?.linhCan ??
        item.effects?.linhCanMoi ??
        item.effects?.linhCan ??
        null;

    if (
        linhCanMoi === null ||
        linhCanMoi === undefined
    ) {
        return null;
    }

    const old =
        player.linhCan ??
        "Chưa có";

    player.linhCan =
        linhCanMoi;

    return {
        old,
        new: linhCanMoi
    };
}


// ============================================================
// ĐỔI THỂ CHẤT
// ============================================================

function doiTheChat(
    player,
    item
) {

    if (
        !player ||
        !item
    ) {
        return null;
    }

    const theChatMoi =
        item.theChatMoi ??
        item.theChatMoiId ??
        item.newTheChat ??
        item.newTheChatId ??
        item.effect?.theChatMoi ??
        item.effect?.theChat ??
        item.effects?.theChatMoi ??
        item.effects?.theChat ??
        null;

    if (
        theChatMoi === null ||
        theChatMoi === undefined
    ) {
        return null;
    }

    const old =
        player.theChat ??
        "Chưa có";

    player.theChat =
        theChatMoi;

    return {
        old,
        new: theChatMoi
    };
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
        layBuffChiTiet(
            item
        );

    const thayDoi =
        apDungBuff(
            player,
            buff
        );

    const linhCan =
        doiLinhCan(
            player,
            item
        );

    const theChat =
        doiTheChat(
            player,
            item
        );

    if (
        linhCan
    ) {

        thayDoi.push(
            `🧬 Linh căn: **${linhCan.old} → ${typeof linhCan.new === "object"
                ? (
                    linhCan.new.name ??
                    linhCan.new.id ??
                    "Mới"
                )
                : linhCan.new}**`
        );
    }

    if (
        theChat
    ) {

        thayDoi.push(
            `🩸 Thể chất: **${theChat.old} → ${typeof theChat.new === "object"
                ? (
                    theChat.new.name ??
                    theChat.new.id ??
                    "Mới"
                )
                : theChat.new}**`
        );
    }

    if (
        thayDoi.length === 0
    ) {

        thayDoi.push(
            "✨ Đan dược đã được kích hoạt."
        );
    }

    return {

        thanhCong:
            true,

        noiDung:
            `💊 Bạn đã sử dụng **${ten}**!\n\n` +
            thayDoi.join("\n")
    };
}


// ============================================================
// TRANG BỊ PHÁP BẢO
// ============================================================

async function dungPhapBao(
    item,
    player
) {

    const ten =
        layTen(item);

    if (
        !player.phapBao ||
        typeof player.phapBao !== "object"
    ) {

        player.phapBao = {};
    }

    // --------------------------------------------------------
    // Nếu đã có pháp bảo cũ thì thay bằng pháp bảo mới
    // --------------------------------------------------------

    player.phapBao = {
        ...item,

        id:
            layId(item),

        ten
    };

    const buff =
        layBuffChiTiet(
            item
        );

    const thayDoi =
        apDungBuff(
            player,
            buff
        );

    if (
        thayDoi.length === 0
    ) {

        thayDoi.push(
            "⚔️ Pháp bảo đã được trang bị."
        );
    }

    return {

        thanhCong:
            true,

        noiDung:
            `⚔️ Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Pháp bảo đã được trang bị.\n` +
            thayDoi.join("\n")
    };
}


// ============================================================
// SỬ DỤNG CÔNG PHÁP
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

    // --------------------------------------------------------
    // KIỂM TRA ĐÃ HỌC
    // --------------------------------------------------------

    const daHoc =
        player.congPhap.some(
            x => {

                if (
                    !x
                ) {
                    return false;
                }

                if (
                    id !== null &&
                    id !== undefined
                ) {

                    const xid =
                        x.id ??
                        x.itemId ??
                        x.itemID ??
                        null;

                    if (
                        xid !== null &&
                        xid !== undefined &&
                        String(xid) ===
                        String(id)
                    ) {
                        return true;
                    }
                }

                const xten =
                    chuanHoa(
                        x.ten ??
                        x.name ??
                        ""
                    );

                return (
                    xten &&
                    xten ===
                    chuanHoa(ten)
                );
            }
        );

    if (
        daHoc
    ) {

        return {

            thanhCong:
                false,

            noiDung:
                `⚠️ Bạn đã sử dụng công pháp **${ten}** rồi.`
        };
    }

    // --------------------------------------------------------
    // THÊM CÔNG PHÁP
    // --------------------------------------------------------

    player.congPhap.push({

        id,

        ten,

        item
    });

    const buff =
        layBuffChiTiet(
            item
        );

    const thayDoi =
        apDungBuff(
            player,
            buff
        );

    if (
        thayDoi.length === 0
    ) {

        thayDoi.push(
            "📖 Công pháp đã được kích hoạt."
        );
    }

    return {

        thanhCong:
            true,

        noiDung:
            `📖 Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Công pháp đã được ghi nhận.\n` +
            thayDoi.join("\n")
    };
}


// ============================================================
// SỬ DỤNG LINH THÚ
// ============================================================

async function dungLinhThu(
    item,
    player
) {

    const ten =
        layTen(item);

    const id =
        layId(item);

    player.linhThuDangSuDung = {

        ...item,

        id,

        ten
    };

    const buff =
        layBuffChiTiet(
            item
        );

    const thayDoi =
        apDungBuff(
            player,
            buff
        );

    if (
        thayDoi.length === 0
    ) {

        thayDoi.push(
            "🐉 Linh thú đã được triệu hồi và kích hoạt."
        );
    }

    return {

        thanhCong:
            true,

        noiDung:
            `🐉 Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Linh thú đã được triệu hồi.\n` +
            thayDoi.join("\n")
    };
}

// ============================================================
// CỘNG BUFF
// ============================================================

function congBuff(
    player,
    buff
) {

    if (!player || !buff) {
        return [];
    }

    // Dùng chung logic áp dụng buff để tránh cộng chỉ số trùng lặp.
    return apDungBuff(player, buff);
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

    if (
        player.phapBaoDangDung &&
        player.phapBaoDangDung.buff
    ) {

        truBuff(
            player,
            player.phapBaoDangDung.buff
        );
    }

    const thongBao =
        congBuff(
            player,
            buff
        );

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

    if (
        player.linhThuDangDung &&
        player.linhThuDangDung.buff
    ) {

        truBuff(
            player,
            player.linhThuDangDung.buff
        );
    }

    const thongBao =
        congBuff(
            player,
            buff
        );

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

    if (
        !Array.isArray(
            player.congPhap
        )
    ) {

        player.congPhap = [];
    }

    const daHoc =
        player.congPhap.some(
            cp => {

                if (!cp) {
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
                        String(oldId) ===
                        String(id)
                    ) {
                        return true;
                    }
                }

                if (
                    oldName &&
                    chuanHoa(oldName) ===
                    chuanHoa(ten)
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

    const thongBao =
        congBuff(
            player,
            buff
        );

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
        !kiemTraCoTheDung(item)
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


// ============================================================
// LỆNH SLASH /DUNG
// ============================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dung")
            .setDescription(
                "Sử dụng một vật phẩm trong túi đồ"
            )
            .addStringOption(
                option =>
                    option
                        .setName("vatpham")
                        .setDescription(
                            "Tên hoặc ID vật phẩm muốn sử dụng"
                        )
                        .setRequired(true)
            ),

    async execute(
        interaction
    ) {

        const userId =
            interaction.user.id;

        const input =
            interaction.options.getString(
                "vatpham",
                true
            );

        const data =
            layTuiDo(
                userId
            );

        if (!data) {

            return interaction.reply({

                content:
                    "⚠️ Bạn chưa có nhân vật. Hãy dùng `/batdau` trước.",

                ephemeral: true
            });
        }

        const {
            player,
            tuiDo,
            items
        } = data;

        if (
            KHONG_THE_DUNG.some(
                x =>
                    chuanHoa(input) ===
                    chuanHoa(x)
            )
        ) {

            return interaction.reply({

                content:
                    `🚫 **${input}** không thể sử dụng bằng /dung.`,

                ephemeral: true
            });
        }

        const item =
            timVatPham(
                items,
                input
            );

        if (!item) {

            return interaction.reply({

                content:
                    `❌ Không tìm thấy vật phẩm **${input}** trong túi đồ.`,

                ephemeral: true
            });
        }

        if (
            laVatPhamKhongTheDung(
                item
            )
        ) {

            return interaction.reply({

                content:
                    `🚫 **${layTen(item)}** không thể sử dụng bằng /dung.`,

                ephemeral: true
            });
        }

        if (
            !kiemTraCoTheDung(
                item
            )
        ) {

            return interaction.reply({

                content:
                    `🚫 **${layTen(item)}** không phải vật phẩm có thể sử dụng bằng /dung.`,

                ephemeral: true
            });
        }

        const loai =
            xacDinhLoaiChiTiet(
                item
            );

        let result;

        try {

            if (
                loai === "phap_bao"
            ) {

                result =
                    await xuLyPhapBao(
                        player,
                        item
                    );

            } else if (
                loai === "linh_thu"
            ) {

                result =
                    await xuLyLinhThu(
                        player,
                        item
                    );

            } else if (
                loai === "cong_phap"
            ) {

                result =
                    await xuLyCongPhap(
                        player,
                        item
                    );

            } else if (
                loai === "dan_duoc"
            ) {

                result =
                    await xuLyDanDuoc(
                        player,
                        item
                    );

            } else {

                result =
                    await xuLyVatPham(
                        player,
                        item
                    );
            }

        } catch (error) {

            console.error(
                "❌ Lỗi /dung:",
                error
            );

            return interaction.reply({

                content:
                    "❌ Có lỗi xảy ra khi sử dụng vật phẩm.",

                ephemeral: true
            });
        }

        if (
            !result ||
            result.success === false
        ) {

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setTitle(
                            result?.title ||
                            "⚠️ KHÔNG THỂ SỬ DỤNG"
                        )
                        .setDescription(
                            result?.message ||
                            "Vật phẩm không thể sử dụng."
                        )
                ],

                ephemeral: true
            });
        }

        if (
            !truVatPham(
                tuiDo,
                item
            )
        ) {

            return interaction.reply({

                content:
                    "⚠️ Đã kích hoạt vật phẩm nhưng không thể trừ vật phẩm khỏi túi đồ. Vui lòng kiểm tra lại túi đồ.",

                ephemeral: true
            });
        }

        updatePlayer(
            userId,
            {
                ...player,
                tuiDo,
                id:
                    player.id,
                username:
                    player.username
            }
        );

        const embed =
            new EmbedBuilder()
                .setTitle(
                    result.title ||
                    "✨ SỬ DỤNG THÀNH CÔNG"
                )
                .setDescription(
                    result.message ||
                    "Đã sử dụng vật phẩm."
                );

        if (
            Array.isArray(
                result.buffs
            ) &&
            result.buffs.length > 0
        ) {

            embed.addFields({

                name:
                    "📊 Hiệu ứng",

                value:
                    result.buffs
                        .join("\n")
                        .slice(
                            0,
                            1024
                        )
            });
        }

        embed.addFields({

            name:
                "🎒 Vật phẩm",

            value:
                `**${layTen(item)}** đã được sử dụng và trừ khỏi túi đồ.`
        });

        return interaction.reply({

            embeds: [
                embed
            ]
        });
    }
};
