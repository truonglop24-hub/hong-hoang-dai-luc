// ============================================================
// dung.js
// LỆNH: /dung <tên hoặc ID vật phẩm>
// Discord.js v14
// Tương thích cuahang (8).js + database (4).js
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
// CẤU HÌNH
// ============================================================

const KHONG_THE_DUNG = [
    "nguyen lieu",
    "nguyên liệu",
    "nguyen_lieu",
    "nguyên_liệu",

    "nguyen lieu ren",
    "nguyên liệu rèn",
    "nguyen_lieu_ren",
    "nguyên_liệu_rèn",

    "nguyen lieu che tao",
    "nguyên liệu chế tạo",
    "nguyen_lieu_che_tao",
    "nguyên_liệu_chế_tạo",

    "ren do",
    "rèn đồ",
    "ren_do",
    "rèn_đồ",

    "che tao",
    "chế tạo",
    "che_tao",
    "chế_tạo"
];

// ============================================================
// CHUẨN HÓA
// ============================================================

function chuanHoa(text) {
    return String(text ?? "")
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
// LẤY ID
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
        item.legacyId ??
        null
    );
}

// ============================================================
// LẤY CATEGORY
// ============================================================

function layCategory(item) {
    if (!item || typeof item !== "object") {
        return "dacBiet";
    }

    return (
        item.__dungCategory ??
        item.category ??
        item.nhom ??
        item.type ??
        item.loai ??
        "dacBiet"
    );
}

// ============================================================
// TẠO ITEM TỪ TÚI
// ============================================================

function taoItemTrongTui(item, category) {
    if (!item || typeof item !== "object") {
        return null;
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

// ============================================================
// KIỂM TRA ITEM KHÔNG ĐƯỢC DÙNG
// ============================================================

function laVatPhamKhongTheDung(item) {
    if (!item) {
        return true;
    }

    const text = chuanHoa(
        [
            layTenVatPham(item),
            layIdVatPham(item),
            item.type,
            item.loai,
            item.category,
            item.nhom,
            item.__dungCategory,
            item.legacyId
        ]
            .filter(
                x =>
                    x !== undefined &&
                    x !== null
            )
            .join(" ")
    );

    return KHONG_THE_DUNG.some(
        x => text.includes(chuanHoa(x))
    );
}

// ============================================================
// LẤY TÚI ĐỒ
// ============================================================

function layTuiDo(userId) {
    const player = getPlayer(userId);

    if (!player) {
        return null;
    }

    if (
        !player.tuiDo ||
        typeof player.tuiDo !== "object"
    ) {
        player.tuiDo = {};
    }

    const tuiDo = player.tuiDo;
    const items = [];

    // QUAN TRỌNG:
    // Quét TẤT CẢ category đang tồn tại trong túi.
    for (
        const [category, danhSach]
        of Object.entries(tuiDo)
    ) {
        if (!Array.isArray(danhSach)) {
            continue;
        }

        for (const item of danhSach) {
            const itemMoi =
                taoItemTrongTui(
                    item,
                    category
                );

            if (itemMoi) {
                items.push(itemMoi);
            }
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
    input
) {
    const search =
        String(input ?? "")
            .trim()
            .toLowerCase();

    if (!search) {
        return null;
    }

    return items.find(item => {
        const id =
            layIdVatPham(item);

        const legacyId =
            item?.legacyId;

        if (
            id !== null &&
            id !== undefined &&
            String(id)
                .trim()
                .toLowerCase() === search
        ) {
            return true;
        }

        if (
            legacyId !== null &&
            legacyId !== undefined &&
            String(legacyId)
                .trim()
                .toLowerCase() === search
        ) {
            return true;
        }

        return false;
    }) || null;
}

// ============================================================
// TÌM TÊN CHÍNH XÁC
// ============================================================

function timVatPhamTheoTen(
    items,
    input
) {
    const search =
        chuanHoa(input);

    if (!search) {
        return null;
    }

    return items.find(item => {
        const ten =
            chuanHoa(
                layTenVatPham(item)
            );

        return ten === search;
    }) || null;
}

// ============================================================
// TÌM TÊN GẦN ĐÚNG
// ============================================================

function timVatPhamGanDung(
    items,
    input
) {
    const search =
        chuanHoa(input);

    if (!search) {
        return null;
    }

    return items.find(item => {
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
    }) || null;
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
// LẤY SỐ
// ============================================================

function laySo(item, keys) {
    if (!item) {
        return 0;
    }

    for (const key of keys) {
        if (
            item[key] !== undefined &&
            item[key] !== null
        ) {
            const value =
                Number(item[key]);

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
// LẤY EFFECT
// ============================================================

function layEffect(item) {
    if (
        item?.effect &&
        typeof item.effect === "object"
    ) {
        return item.effect;
    }

    if (
        item?.effects &&
        typeof item.effects === "object"
    ) {
        return item.effects;
    }

    return {};
}

// ============================================================
// XÁC ĐỊNH LOẠI
// ============================================================

function xacDinhLoai(item) {
    const category =
        chuanHoa(
            layCategory(item)
        );

    const effect =
        layEffect(item);

    const effectLoai =
        chuanHoa(
            effect.loai ||
            effect.type ||
            ""
        );

    const text =
        chuanHoa(
            [
                layTenVatPham(item),
                category,
                item.type,
                item.loai,
                item.category,
                item.nhom,
                effectLoai,
                effect.category
            ]
                .filter(Boolean)
                .join(" ")
        );

    // ========================================================
    // ĐAN DƯỢC
    // ========================================================

    if (
        category.includes("dan duoc") ||
        category.includes("danduoc") ||
        category.includes("danDuoc") ||
        category === "dan" ||
        category === "pill" ||
        text.includes("dan duoc") ||
        text.includes("danduoc")
    ) {
        return "dan_duoc";
    }

    // ========================================================
    // CÔNG PHÁP
    // ========================================================

    if (
        category.includes("cong phap") ||
        category.includes("congphap") ||
        category.includes("cong_phap") ||
        category.includes("ma cong phap") ||
        category.includes("yeu cong phap") ||
        text.includes("cong phap") ||
        text.includes("congphap") ||
        text.includes("bi kip") ||
        text.includes("ky nang") ||
        text.includes("skill")
    ) {
        return "cong_phap";
    }

    // ========================================================
    // PHÁP BẢO
    // ========================================================

    if (
        category.includes("phap bao") ||
        category.includes("phapbao") ||
        category.includes("phap_bao") ||
        category.includes("ma phap bao") ||
        category.includes("yeu phap bao") ||
        text.includes("phap bao") ||
        text.includes("phapbao") ||
        text.includes("artifact") ||
        text.includes("vu khi") ||
        text.includes("weapon")
    ) {
        return "phap_bao";
    }

    // ========================================================
    // LINH THÚ
    // ========================================================

    if (
        category.includes("linh thu") ||
        category.includes("linhthu") ||
        category.includes("linh_thu") ||
        category === "pet" ||
        text.includes("linh thu") ||
        text.includes("linhthu") ||
        text.includes("pet")
    ) {
        return "linh_thu";
    }

    // ========================================================
    // VẬT PHẨM
    // ========================================================

    return "vat_pham";
}

// ============================================================
// KIỂM TRA CÓ HIỆU ỨNG
// ============================================================

function coHieuUng(item) {
    if (!item) {
        return false;
    }

    const effect =
        layEffect(item);

    return (
        item.usable === true ||
        item.useable === true ||
        item.coTheDung === true ||
        item.coTheSuDung === true ||

        item.hpBonus !== undefined ||
        item.congBonus !== undefined ||
        item.thuBonus !== undefined ||
        item.tuviBonus !== undefined ||
        item.linhLucBonus !== undefined ||

        item.bonus !== undefined ||
        item.effect !== undefined ||
        item.effects !== undefined ||

        Object.keys(effect).length > 0
    );
}

// ============================================================
// DÙNG ĐAN DƯỢC
// ============================================================

async function dungDanDuoc(
    item,
    player
) {
    const ten =
        layTenVatPham(item);

    const effect =
        layEffect(item);

    let hpTang =
        laySo(
            item,
            [
                "hp",
                "heal",
                "hoiMau",
                "hoiHp",
                "healHp",
                "hpBonus"
            ]
        );

    let linhLucTang =
        laySo(
            item,
            [
                "linhLuc",
                "linhLucTang",
                "linhLucBonus",
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
                "exp",
                "tuviBonus"
            ]
        );

    // Effect
    hpTang +=
        Number(
            effect.hp ??
            effect.heal ??
            effect.hoiMau ??
            effect.hpBonus ??
            0
        ) || 0;

    linhLucTang +=
        Number(
            effect.linhLuc ??
            effect.linhLucTang ??
            effect.linhLucBonus ??
            effect.mana ??
            0
        ) || 0;

    tuViTang +=
        Number(
            effect.tuvi ??
            effect.tuVi ??
            effect.tuviBonus ??
            effect.exp ??
            0
        ) || 0;

    // ========================================================
    // HP
    // ========================================================

    if (hpTang > 0) {
        const maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 1
                )
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
    // TU VI
    // ========================================================

    if (tuViTang > 0) {
        player.tuvi =
            Number(
                player.tuvi || 0
            ) + tuViTang;
    }

    const thongBao = [];

    if (hpTang > 0) {
        thongBao.push(
            `❤️ +${hpTang.toLocaleString()} HP`
        );
    }

    if (linhLucTang > 0) {
        thongBao.push(
            `💠 +${linhLucTang.toLocaleString()} Linh lực`
        );
    }

    if (tuViTang > 0) {
        thongBao.push(
            `✨ +${tuViTang.toLocaleString()} Tu vi`
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
    item,
    player
) {
    const ten =
        layTenVatPham(item);

    const id =
        layIdVatPham(item);

    if (
        !player.phapBao ||
        typeof player.phapBao !== "object"
    ) {
        player.phapBao = {};
    }

    // Không cộng lại bonus mua hàng.
    // cuahang.js đã cộng bonus khi mua.
    player.phapBao = {
        ...item,

        id,
        ten
    };

    const cong =
        laySo(
            item,
            [
                "cong",
                "attack",
                "atk"
            ]
        );

    const thu =
        laySo(
            item,
            [
                "thu",
                "def",
                "defense"
            ]
        );

    const buff = [];

    if (cong > 0) {
        buff.push(
            `⚔️ +${cong.toLocaleString()} Công`
        );
    }

    if (thu > 0) {
        buff.push(
            `🛡️ +${thu.toLocaleString()} Thủ`
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
    item,
    player
) {
    const ten =
        layTenVatPham(item);

    const id =
        layIdVatPham(item);

    if (
        !Array.isArray(
            player.congPhap
        )
    ) {
        player.congPhap = [];
    }

    const daHoc =
        player.congPhap.some(x => {
            if (
                !x ||
                typeof x !== "object"
            ) {
                return false;
            }

            const xId =
                x.id ??
                x.itemId ??
                x.itemID;

            const xTen =
                x.ten ??
                x.name;

            if (
                id !== null &&
                id !== undefined &&
                xId !== null &&
                xId !== undefined
            ) {
                return String(xId) === String(id);
            }

            return (
                chuanHoa(xTen) ===
                chuanHoa(ten)
            );
        });

    if (daHoc) {
        return {
            thanhCong: false,

            noiDung:
                `⚠️ Bạn đã tu luyện **${ten}** rồi.`
        };
    }

    player.congPhap.push({
        id,
        ten,
        name: ten
    });

    return {
        thanhCong: true,

        noiDung:
            `📖 Bạn đã sử dụng **${ten}**!\n\n` +
            `✨ Công pháp đã được ghi nhận.`
    };
}

// ============================================================
// DÙNG LINH THÚ
// ============================================================

async function dungLinhThu(
    item,
    player
) {
    const ten =
        layTenVatPham(item);

    const id =
        layIdVatPham(item);

    player.linhThuDangSuDung = {
        ...item,

        id,
        ten,
        name: ten
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
    item,
    player
) {
    const ten =
        layTenVatPham(item);

    if (!coHieuUng(item)) {
        return {
            thanhCong: false,

            noiDung:
                `❌ **${ten}** không có chức năng sử dụng.`
        };
    }

    const effect =
        layEffect(item);

    const thongBao = [];

    const hp =
        laySo(
            item,
            [
                "hpBonus",
                "hp",
                "heal",
                "hoiMau"
            ]
        );

    const linhLuc =
        laySo(
            item,
            [
                "linhLucBonus",
                "linhLuc",
                "linhLucTang"
            ]
        );

    const tuvi =
        laySo(
            item,
            [
                "tuviBonus",
                "tuvi",
                "tuVi"
            ]
        );

    if (hp > 0) {
        const maxHp =
            Math.max(
                1,
                Number(
                    player.maxHp || 1
                )
            );

        player.hp =
            Math.min(
                maxHp,
                Number(
                    player.hp || 0
                ) + hp
            );

        thongBao.push(
            `❤️ +${hp.toLocaleString()} HP`
        );
    }

    if (linhLuc > 0) {
        player.linhLuc =
            Number(
                player.linhLuc || 0
            ) + linhLuc;

        thongBao.push(
            `💠 +${linhLuc.toLocaleString()} Linh lực`
        );
    }

    if (tuvi > 0) {
        player.tuvi =
            Number(
                player.tuvi || 0
            ) + tuvi;

        thongBao.push(
            `✨ +${tuvi.toLocaleString()} Tu vi`
        );
    }

    if (
        effect.message ||
        effect.mess ||
        effect.description
    ) {
        thongBao.push(
            String(
                effect.message ??
                effect.mess ??
                effect.description
            )
        );
    }

    if (
        thongBao.length === 0
    ) {
        thongBao.push(
            "💫 Hiệu ứng vật phẩm đã được kích hoạt."
        );
    }

    return {
        thanhCong: true,

        noiDung:
            `✨ Bạn đã sử dụng **${ten}**!\n\n` +
            thongBao.join("\n")
    };
}

// ============================================================
// TRỪ ITEM
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

    let index =
        danhSach.indexOf(item);

    // Fallback tìm theo ID
    if (index === -1) {
        const id =
            layIdVatPham(item);

        if (
            id !== null &&
            id !== undefined
        ) {
            index =
                danhSach.findIndex(x => {
                    const xId =
                        layIdVatPham(x);

                    return (
                        xId !== null &&
                        xId !== undefined &&
                        String(xId) ===
                        String(id)
                    );
                });
        }
    }

    // Fallback tìm theo tên
    if (index === -1) {
        const ten =
            chuanHoa(
                layTenVatPham(item)
            );

        index =
            danhSach.findIndex(x =>
                chuanHoa(
                    layTenVatPham(x)
                ) === ten
            );
    }

    if (index === -1) {
        return false;
    }

    const target =
        danhSach[index];

    const soLuong =
        laySo(
            target,
            [
                "amount",
                "soluong",
                "quantity",
                "soLuong",
                "qty"
            ]
        );

    // Không có quantity -> coi như 1
    const coQuantity =
        [
            "amount",
            "soluong",
            "quantity",
            "soLuong",
            "qty"
        ].some(
            key =>
                target[key] !== undefined
        );

    if (
        !coQuantity ||
        soLuong <= 1
    ) {
        danhSach.splice(
            index,
            1
        );

        return true;
    }

    if (
        target.amount !== undefined
    ) {
        target.amount =
            soLuong - 1;
    } else if (
        target.soluong !== undefined
    ) {
        target.soluong =
            soLuong - 1;
    } else if (
        target.quantity !== undefined
    ) {
        target.quantity =
            soLuong - 1;
    } else if (
        target.soLuong !== undefined
    ) {
        target.soLuong =
            soLuong - 1;
    } else if (
        target.qty !== undefined
    ) {
        target.qty =
            soLuong - 1;
    }

    return true;
}

// ============================================================
// AUTOCOMPLETE
// ============================================================

async function autocomplete(
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
                .getString("vatpham")
                ?.trim()
                .toLowerCase() || "";

        const ketQua =
            items
                .filter(
                    item =>
                        !laVatPhamKhongTheDung(
                            item
                        )
                )
                .filter(item => {
                    const ten =
                        String(
                            layTenVatPham(item)
                        ).toLowerCase();

                    const id =
                        layIdVatPham(item);

                    const legacyId =
                        item.legacyId;

                    const idText =
                        id === null ||
                        id === undefined
                            ? ""
                            : String(id)
                                .toLowerCase();

                    const legacyText =
                        legacyId === null ||
                        legacyId === undefined
                            ? ""
                            : String(
                                legacyId
                            ).toLowerCase();

                    return (
                        !input ||
                        ten.includes(input) ||
                        idText.includes(input) ||
                        legacyText.includes(input)
                    );
                })
                .slice(0, 25);

        await interaction.respond(
            ketQua.map(item => {
                const ten =
                    String(
                        layTenVatPham(item)
                    );

                const id =
                    layIdVatPham(item);

                const category =
                    layCategory(item);

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
                        hienThi.slice(0, 100),

                    value:
                        String(
                            id ??
                            ten
                        ).slice(0, 100)
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
            .addStringOption(option =>
                option
                    .setName("vatpham")
                    .setDescription(
                        "Nhập tên hoặc ID vật phẩm"
                    )
                    .setRequired(true)
                    .setAutocomplete(true)
            ),

    autocomplete,

    // ========================================================
    // EXECUTE
    // ========================================================

    async execute(interaction) {
        try {
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
            // TÚI
            // ==================================================

            const tui =
                layTuiDo(userId);

            if (!tui) {
                return interaction.reply({
                    content:
                        "❌ Không thể đọc túi đồ của bạn.",
                    ephemeral: true
                });
            }

            const items =
                tui.items || [];

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
                        `❌ Không tìm thấy vật phẩm **${input}** trong túi đồ.\n\n` +
                        `💡 Hãy nhập **ID chính xác** của vật phẩm hoặc chọn vật phẩm từ danh sách gợi ý.`,
                    ephemeral: true
                });
            }

            const ten =
                layTenVatPham(item);

            const id =
                layIdVatPham(item);

            const category =
                layCategory(item);

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
                        `🚫 **${ten}** là vật phẩm dùng cho rèn đồ/chế tạo hoặc hệ thống khác nên không thể dùng bằng \`/dung\`.`,
                    ephemeral: true
                });
            }

            // ==================================================
            // XÁC ĐỊNH LOẠI
            // ==================================================

            const loai =
                xacDinhLoai(item);

            let ketQua;

            switch (loai) {
                case "dan_duoc":
                    ketQua =
                        await dungDanDuoc(
                            item,
                            player
                        );
                    break;

                case "phap_bao":
                    ketQua =
                        await dungPhapBao(
                            item,
                            player
                        );
                    break;

                case "cong_phap":
                    ketQua =
                        await dungCongPhap(
                            item,
                            player
                        );
                    break;

                case "linh_thu":
                    ketQua =
                        await dungLinhThu(
                            item,
                            player
                        );
                    break;

                default:
                    ketQua =
                        await dungVatPham(
                            item,
                            player
                        );
                    break;
            }

            // ==================================================
            // XỬ LÝ THẤT BẠI
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
                        `❌ Đã kích hoạt **${ten}** nhưng không thể trừ vật phẩm khỏi túi đồ.`,
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
                        player.hp,

                    maxHp:
                        player.maxHp,

                    linhLuc:
                        player.linhLuc,

                    tuvi:
                        player.tuvi,

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

                    linhThuDangSuDung:
                        player.linhThuDangSuDung,

                    tuLuyenBonus:
                        player.tuLuyenBonus
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
            }

            else if (
                loai === "phap_bao"
            ) {
                tenLoai =
                    "⚔️ Pháp bảo";
            }

            else if (
                loai === "cong_phap"
            ) {
                tenLoai =
                    "📖 Công pháp";
            }

            else if (
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
                                "🗂️ Túi",

                            value:
                                `\`${category}\``,

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
                embeds: [embed]
            });

        } catch (error) {
            console.error(
                "❌ Lỗi lệnh /dung:",
                error
            );

            const message =
                error?.message ||
                String(error);

            if (
                interaction.replied ||
                interaction.deferred
            ) {
                return interaction.followUp({
                    content:
                        `❌ Đã xảy ra lỗi khi sử dụng vật phẩm.\n\`${message.slice(0, 1500)}\``,
                    ephemeral: true
                });
            }

            return interaction.reply({
                content:
                    `❌ Đã xảy ra lỗi khi sử dụng vật phẩm.\n\`${message.slice(0, 1500)}\``,
                ephemeral: true
            });
        }
    }
};
