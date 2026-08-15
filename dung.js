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
// DÙNG ĐAN DƯỢC
// ============================================================

async function dungDanDuoc(
    item,
    player
) {

    const ten =
        layTen(item);

    let hp =
        Number(
            item.hp ??
            item.heal ??
            item.hoiMau ??
            item.hpBonus ??
            0
        ) || 0;

    let linhLuc =
        Number(
            item.linhLuc ??
            item.linhLucBonus ??
            item.mana ??
            0
        ) || 0;

    let tuVi =
        Number(
            item.tuvi ??
            item.tuVi ??
            item.tuviBonus ??
            item.kinhNghiem ??
            item.exp ??
            0
        ) || 0;

    // -----------------------------
    // EFFECT
    // -----------------------------

    if (
        item.effect &&
        typeof item.effect === "object"
    ) {

        hp += Number(
            item.effect.hp ??
            item.effect.heal ??
            item.effect.hoiMau ??
            item.effect.hpBonus ??
            0
        ) || 0;

        linhLuc += Number(
            item.effect.linhLuc ??
            item.effect.linhLucBonus ??
            item.effect.mana ??
            0
        ) || 0;

        tuVi += Number(
            item.effect.tuvi ??
            item.effect.tuVi ??
            item.effect.tuviBonus ??
            item.effect.exp ??
            0
        ) || 0;
    }

    // -----------------------------
    // EFFECTS
    // -----------------------------

    if (
        item.effects &&
        typeof item.effects === "object"
    ) {

        hp += Number(
            item.effects.hp ??
            item.effects.heal ??
            item.effects.hoiMau ??
            0
        ) || 0;

        linhLuc += Number(
            item.effects.linhLuc ??
            item.effects.mana ??
            0
        ) || 0;

        tuVi += Number(
            item.effects.tuvi ??
            item.effects.tuVi ??
            item.effects.exp ??
            0
        ) || 0;
    }

    // -----------------------------
    // CẬP NHẬT HP
    // -----------------------------

    if (hp > 0) {

        const maxHp =
            Number(
                player.maxHp || 100
            );

        player.hp =
            Math.min(
                maxHp,
                Number(
                    player.hp || 0
                ) + hp
            );
    }

    // -----------------------------
    // CẬP NHẬT LINH LỰC
    // -----------------------------

    if (linhLuc > 0) {

        player.linhLuc =
            Number(
                player.linhLuc || 0
            ) + linhLuc;
    }

    // -----------------------------
    // CẬP NHẬT TU VI
    // -----------------------------

    if (tuVi > 0) {

        player.kinhNghiem =
            Number(
                player.kinhNghiem || 0
            ) + tuVi;
    }

    const thongBao = [];

    if (hp > 0) {
        thongBao.push(
            `❤️ +${hp} HP`
        );
    }

    if (linhLuc > 0) {
        thongBao.push(
            `💠 +${linhLuc} Linh lực`
        );
    }

    if (tuVi > 0) {
        thongBao.push(
            `✨ +${tuVi} Kinh nghiệm`
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
        layTen(item);

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
            layId(item)
    };

    const cong =
        Number(
            item.cong ??
            item.congBonus ??
            item.attack ??
            item.atk ??
            0
        ) || 0;

    const thu =
        Number(
            item.thu ??
            item.thuBonus ??
            item.def ??
            item.defense ??
            0
        ) || 0;

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
                buff.length
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
        Number(
            item.tuLuyen ??
            item.tuLuyenBonus ??
            item.cultivation ??
            0
        ) || 0;

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
    item,
    player
) {

    const ten =
        layTen(item);

    player.linhThuDangSuDung = {

        id:
            layId(item),

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
    item
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
                            item
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

                    linhThuDangSuDung:
                        tui.player.linhThuDangSuDung
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
