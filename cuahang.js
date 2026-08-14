const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// 🛒 CỬA HÀNG HỒNG HOANG — GỘP TẤT CẢ SHOP
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

const RARITIES = [
    "⚪ Phàm",
    "🟢 Linh",
    "🔵 Huyền",
    "🟣 Địa",
    "🟠 Thiên",
    "🔴 Tiên",
    "👑 Thánh",
    "🌌 Hỗn Độn",
    "⭐ Đại Đạo"
];

// =====================================================
// 🏪 CẤU HÌNH SHOP
// =====================================================

const SHOPS = {
    thuong: {
        name: "🏪 Shop Thường",
        icon: "🏪",
        minRealm: 0,
        maxRealm: 8,
        price: 1
    },

    tien: {
        name: "☁️ Shop Tiên",
        icon: "☁️",
        minRealm: 9,
        maxRealm: 14,
        price: 1000
    },

    thanh: {
        name: "👑 Shop Thánh",
        icon: "👑",
        minRealm: 15,
        maxRealm: 16,
        price: 1000000
    },

    daidao: {
        name: "🌌 Shop Đại Đạo",
        icon: "🌌",
        minRealm: 17,
        maxRealm: 17,
        price: 100000000
    }
};

const SHOP_ORDER = [
    "thuong",
    "tien",
    "thanh",
    "daidao"
];

// =====================================================
// 📜 CÔNG PHÁP
// =====================================================

const CONG_PHAP_NAMES = [
    "Luyện Khí Quyết",
    "Ngũ Hành Quyết",
    "Hỏa Vân Quyết",
    "Băng Tâm Quyết",
    "Thanh Vân Kiếm Quyết",
    "Cửu Thiên Lôi Quyết",
    "Thái Hư Quyết",
    "Huyền Thiên Công",
    "Tử Hà Thần Công",
    "Cửu Dương Thần Công",
    "Cửu Âm Chân Kinh",
    "Thái Cực Đạo Kinh",
    "Thanh Liên Kiếm Kinh",
    "Đại Nhật Kim Ô Quyết",
    "Chu Thiên Tinh Đấu Quyết",
    "Hồng Hoang Đạo Kinh",
    "Thái Thanh Đạo Kinh",
    "Ngọc Thanh Đạo Kinh",
    "Thượng Thanh Đạo Kinh",
    "Cửu Chuyển Huyền Công",
    "Bát Cửu Huyền Công",
    "Hỗn Độn Vô Cực Kinh",
    "Hồng Mông Tạo Hóa Kinh",
    "Tam Thiên Đại Đạo Kinh",
    "Đại Đạo Kinh"
];

// =====================================================
// 💊 ĐAN DƯỢC
// =====================================================

const DAN_DUOC_NAMES = [
    "Tụ Khí Đan",
    "Bồi Nguyên Đan",
    "Tẩy Tủy Đan",
    "Tụ Linh Đan",
    "Hồi Linh Đan",
    "Hồi Huyết Đan",
    "Trúc Cơ Đan",
    "Kim Đan",
    "Nguyên Anh Đan",
    "Hóa Thần Đan",
    "Luyện Hư Đan",
    "Hợp Thể Đan",
    "Đại Thừa Đan",
    "Độ Kiếp Đan",
    "Phá Cảnh Đan",
    "Tiên Linh Đan",
    "Chân Tiên Đan",
    "Thiên Tiên Đan",
    "Huyền Tiên Đan",
    "Kim Tiên Đan",
    "Thánh Linh Đan",
    "Thiên Đạo Đan",
    "Hỗn Độn Đạo Đan",
    "Hồng Mông Đan",
    "Đại Đạo Đan"
];

// =====================================================
// 🐉 LINH THÚ
// =====================================================

const LINH_THU_NAMES = [
    "Thanh Lang",
    "Hỏa Hồ",
    "Lôi Ưng",
    "Bạch Hổ",
    "Thanh Long",
    "Chu Tước",
    "Huyền Vũ",
    "Kỳ Lân",
    "Kim Sí Đại Bằng",
    "Cửu Vĩ Hồ",
    "Thôn Thiên Mãng",
    "Phượng Hoàng",
    "Kim Ô",
    "Tổ Long",
    "Tổ Kỳ Lân",
    "Tổ Phượng Hoàng",
    "Thái Cổ Ma Long",
    "Hỗn Độn Thú",
    "Hồng Mông Thú",
    "Đại Đạo Thú"
];

// =====================================================
// ⚔️ PHÁP BẢO
// =====================================================

const PHAP_BAO_NAMES = [
    "Thanh Phong Kiếm",
    "Tử Vân Kiếm",
    "Huyền Thiết Kiếm",
    "Hỏa Vân Kiếm",
    "Băng Phách Kiếm",
    "Lôi Đình Kiếm",
    "Tru Tiên Kiếm",
    "Lục Tiên Kiếm",
    "Hãm Tiên Kiếm",
    "Tuyệt Tiên Kiếm",
    "Thanh Bình Kiếm",
    "Thái Cực Đồ",
    "Bàn Cổ Phiên",
    "Hỗn Độn Chung",
    "Càn Khôn Đỉnh",
    "Hà Đồ Lạc Thư",
    "Sơn Hà Xã Tắc Đồ",
    "Công Đức Kim Liên",
    "Diệt Thế Hắc Liên",
    "Hỗn Độn Thanh Liên",
    "Bàn Cổ Phủ",
    "Hồng Mông Kiếm",
    "Đại Đạo Luân",
    "Hỗn Độn Châu",
    "Đại Đạo Chí Bảo"
];

// =====================================================
// 🌿 THIÊN TÀI ĐỊA BẢO
// =====================================================

const BAO_VAT_NAMES = [
    "Linh Chi Ngàn Năm",
    "Huyền Băng Hoa",
    "Hỏa Linh Quả",
    "Lôi Linh Quả",
    "Thanh Tâm Liên",
    "Thiên Linh Quả",
    "Ngộ Đạo Hoa",
    "Nhân Sâm Quả",
    "Hoàng Trung Lý",
    "Ngộ Đạo Trà",
    "Tam Quang Thần Thủy",
    "Cửu Thiên Tức Nhưỡng",
    "Tức Nhưỡng",
    "Hỗn Độn Linh Thạch",
    "Hỗn Độn Tinh Thạch",
    "Hồng Mông Tử Khí",
    "Hỗn Độn Thanh Liên Tử",
    "Công Đức Kim Quang",
    "Đại Đạo Chi Cơ",
    "Hồng Mông Đạo Quả"
];

// =====================================================
// 🎁 VẬT PHẨM ĐẶC BIỆT
// =====================================================

const DAC_BIET_NAMES = [
    "Thẻ Tăng Tu Vi",
    "Thẻ Nhân Đôi Tu Vi",
    "Thẻ Tụ Linh",
    "Thẻ Hộ Mệnh",
    "Thẻ Bảo Vệ Tu Vi",
    "Thẻ Tăng Công",
    "Thẻ Tăng Thủ",
    "Thẻ Tăng HP",
    "Thẻ Đột Phá",
    "Thẻ May Mắn",
    "Thẻ Triệu Hồi Linh Thú",
    "Thẻ Triệu Hồi Pháp Bảo",
    "Thẻ Triệu Hồi Công Pháp",
    "Vé Tiên Cảnh",
    "Vé Thánh Cảnh",
    "Vé Đại Đạo",
    "Hỗn Độn Chi Khí",
    "Đại Đạo Chi Khí",
    "Hồng Mông Tử Khí",
    "Vô Thượng Đạo Quả"
];

// =====================================================
// 🗃️ DATABASE SHOP
// =====================================================

const SHOP = {
    thuong: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {}
    },

    tien: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {}
    },

    thanh: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {}
    },

    daidao: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {}
    }
};

// =====================================================
// 🏷️ TÊN SHOP
// =====================================================

const SHOP_NAME = {
    thuong: "🏪 Thường",
    tien: "☁️ Tiên",
    thanh: "👑 Thánh",
    daidao: "🌌 Đại Đạo"
};

// =====================================================
// 🛠️ TẠO VẬT PHẨM
// =====================================================

function addItem(
    shop,
    category,
    id,
    name,
    requiredRealm,
    rarity,
    cost,
    effect
) {
    SHOP[shop][category][id] = {
        id,
        name,
        requiredRealm,
        rarity,
        cost,
        effect,

        bonus: effect.cong || 0,
        hpBonus: effect.hp || 0,
        congBonus: effect.cong || 0,
        thuBonus: effect.thu || 0,
        tuviBonus: effect.tuvi || 0,
        linhLucBonus: effect.linhLuc || 0
    };
}

// =====================================================
// ⚙️ HỆ SỐ
// =====================================================

const SHOP_MULTIPLIER = {
    thuong: 1,
    tien: 1000,
    thanh: 1000000,
    daidao: 100000000
};

// =====================================================
// 🔤 CHUYỂN TÊN → ID
// =====================================================

function makeId(name) {
    const map = {
        "Đ": "D",
        "đ": "d",
        "Ă": "A",
        "ă": "a",
        "Â": "A",
        "â": "a",
        "Ê": "E",
        "ê": "e",
        "Ô": "O",
        "ô": "o",
        "Ơ": "O",
        "ơ": "o",
        "Ư": "U",
        "ư": "u"
    };

    return name
        .split("")
        .map(c => map[c] || c)
        .join("")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

// =====================================================
// 🎯 HỆ THỐNG ID
// =====================================================

const SPECIAL_IDS = {
    "Thanh Vân Kiếm Quyết": "thanh_van_kiem_quyet",
    "Cửu Thiên Lôi Quyết": "cuu_thien_loi_quyet",
    "Hỗn Độn Vô Cực Kinh": "hon_don_vo_cuc_kinh",
    "Hồng Mông Tạo Hóa Kinh": "hong_mong_tao_hoa_kinh",
    "Tru Tiên Kiếm": "tru_tien_kiem",
    "Hỗn Độn Chung": "hon_don_chung",
    "Bàn Cổ Phiên": "ban_co_phien",
    "Hồng Mông Kiếm": "hong_mong_kiem",
    "Hỗn Độn Đạo Đan": "hon_don_dao_dan",
    "Hồng Mông Đan": "hong_mong_dan",
    "Đại Đạo Đan": "dai_dao_dan"
};

function getItemId(name) {
    return SPECIAL_IDS[name] || makeId(name);
}
        // =============================================
        // 💊 25 ĐAN DƯỢC
        // =============================================

        DAN_DUOC_NAMES.forEach((baseName, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[
                    Math.min(
                        8,
                        Math.floor(realm / 2)
                    )
                ];

            const cost =
                Math.max(
                    100,
                    Math.floor(
                        config.price *
                        (i + 1) *
                        1.5
                    )
                );

            const tuvi =
                (realm + 1) * 500;

            addItem(
                shop,
                "danDuoc",

                `dd-${shop}-${counter++}`,

                `💊 ${baseName}`,

                realm,

                rarity,

                cost,

                {
                    tuvi
                }
            );
        });


        // =============================================
        // 🐉 20 LINH THÚ
        // =============================================

        LINH_THU_NAMES.forEach((baseName, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[
                    Math.min(
                        8,
                        Math.floor(realm / 2)
                    )
                ];

            const bonus =
                (realm + 1) * 25;

            const cost =
                Math.max(
                    300,
                    Math.floor(
                        config.price *
                        (i + 1) *
                        3
                    )
                );

            addItem(
                shop,
                "linhThu",

                `lt-${shop}-${counter++}`,

                `🐉 ${baseName}`,

                realm,

                rarity,

                cost,

                {
                    cong: bonus,
                    hp: bonus * 10
                }
            );
        });


        // =============================================
        // ⚔️ 20 PHÁP BẢO
        // =============================================

        PHAP_BAO_NAMES.forEach((baseName, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[
                    Math.min(
                        8,
                        Math.floor(realm / 2)
                    )
                ];

            const bonus =
                (realm + 1) * 40;

            const cost =
                Math.max(
                    500,
                    Math.floor(
                        config.price *
                        (i + 1) *
                        4
                    )
                );

            addItem(
                shop,
                "phapBao",

                `pb-${shop}-${counter++}`,

                `⚔️ ${baseName}`,

                realm,

                rarity,

                cost,

                {
                    cong: bonus,
                    thu: bonus,
                    hp: bonus * 10
                }
            );
        });


        // =============================================
        // 🌿 20 THIÊN TÀI ĐỊA BẢO
        // =============================================

        BAO_VAT_NAMES.forEach((baseName, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[
                    Math.min(
                        8,
                        Math.floor(realm / 2)
                    )
                ];

            const cost =
                Math.max(
                    1000,
                    Math.floor(
                        config.price *
                        (i + 1) *
                        5
                    )
                );

            addItem(
                shop,
                "baoVat",

                `bv-${shop}-${counter++}`,

                `🌿 ${baseName}`,

                realm,

                rarity,

                cost,

                {
                    tuvi: (realm + 1) * 1000,
                    linhLuc: (realm + 1) * 100
                }
            );
        });


        // =============================================
        // 🎁 ĐẶC BIỆT
        // =============================================

        DAC_BIET_NAMES.forEach((baseName, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[
                    Math.min(
                        8,
                        Math.floor(realm / 2)
                    )
                ];

            const cost =
                Math.max(
                    5000,
                    Math.floor(
                        config.price *
                        (i + 1) *
                        6
                    )
                );

            addItem(
                shop,
                "dacBiet",

                `db-${shop}-${counter++}`,

                `🎁 ${baseName}`,

                realm,

                rarity,

                cost,

                {
                    tuvi: (realm + 1) * 2000,
                    cong: (realm + 1) * 50
                }
            );
        });
    }
}


// =====================================================
// 🚀 KHỞI TẠO SHOP
// =====================================================

generateShop();


// =====================================================
// 🔍 TÌM VẬT PHẨM THEO ID
// =====================================================

function findItem(itemId) {

    if (!itemId) return null;

    const normalized = String(itemId)
        .trim()
        .toLowerCase();

    for (const shop of SHOP_ORDER) {

        for (const category of Object.keys(SHOP[shop])) {

            const items = SHOP[shop][category];

            for (const id of Object.keys(items)) {

                const item = items[id];

                if (
                    id.toLowerCase() === normalized ||
                    item.id.toLowerCase() === normalized
                ) {
                    return {
                        ...item,
                        shop,
                        category
                    };
                }

                // Cho phép tìm bằng ID mới
                if (
                    getItemId(
                        item.name
                            .replace(
                                /^[^\wÀ-ỹ]+\s*/,
                                ""
                            )
                    ) === normalized
                ) {
                    return {
                        ...item,
                        shop,
                        category
                    };
                }
            }
        }
    }

    return null;
}


// =====================================================
// 📦 LẤY TOÀN BỘ VẬT PHẨM
// =====================================================

function getAllShopItems() {

    const result = [];

    for (const shop of SHOP_ORDER) {

        for (const category of Object.keys(SHOP[shop])) {

            for (const item of Object.values(
                SHOP[shop][category]
            )) {

                result.push({
                    ...item,
                    shop,
                    category
                });
            }
        }
    }

    return result;
}


// =====================================================
// 📖 PHÂN TRANG
// =====================================================

function getShopPage(
    page = 1,
    pageSize = 10,
    shopFilter = "all"
) {

    let items = getAllShopItems();

    if (
        shopFilter &&
        shopFilter !== "all" &&
        SHOP[shopFilter]
    ) {
        items = items.filter(
            item => item.shop === shopFilter
        );
    }

    const totalPages = Math.max(
        1,
        Math.ceil(items.length / pageSize)
    );

    page = Math.max(
        1,
        Math.min(page, totalPages)
    );

    const start =
        (page - 1) * pageSize;

    return {
        items: items.slice(
            start,
            start + pageSize
        ),

        page,

        totalPages,

        totalItems: items.length
    };
}


// =====================================================
// 🎨 EMOJI DANH MỤC
// =====================================================

const CATEGORY_ICON = {
    congPhap: "📜",
    danDuoc: "💊",
    linhThu: "🐉",
    phapBao: "⚔️",
    baoVat: "🌿",
    dacBiet: "🎁"
};

const CATEGORY_NAME = {
    congPhap: "Công Pháp",
    danDuoc: "Đan Dược",
    linhThu: "Linh Thú",
    phapBao: "Pháp Bảo",
    baoVat: "Thiên Tài Địa Bảo",
    dacBiet: "Vật Phẩm Đặc Biệt"
};


// =====================================================
// 🧾 FORMAT VẬT PHẨM
// =====================================================

function formatItem(item, index) {

    const categoryIcon =
        CATEGORY_ICON[item.category] || "📦";

    const categoryName =
        CATEGORY_NAME[item.category] || "Vật Phẩm";

    const realmName =
        REALMS[item.requiredRealm] ||
        "Không rõ";

    return [
        `**${index + 1}. ${item.name}**`,
        `🆔 \`${getItemId(
            item.name.replace(
                /^[^\wÀ-ỹ]+\s*/,
                ""
            )
        )}\``,
        `${categoryIcon} ${categoryName}`,
        `${item.rarity}`,
        `🌌 ${realmName}`,
        `💎 **${item.cost.toLocaleString()}** Linh Thạch`
    ].join("\n");
}


// =====================================================
// 🏪 TẠO EMBED SHOP
// =====================================================

function createShopEmbed(
    page = 1,
    shopFilter = "all"
) {

    const data = getShopPage(
        page,
        10,
        shopFilter
    );

    let title =
        "🛒 HỒNG HOANG — CỬA HÀNG";

    if (
        shopFilter !== "all" &&
        SHOP_NAME[shopFilter]
    ) {
        title += `\n${SHOP_NAME[shopFilter]}`;
    }

    const description = data.items
        .map((item, index) =>
            formatItem(item, index)
        )
        .join("\n\n");

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(
            description ||
            "📦 Không có vật phẩm nào."
        )
        .setFooter({
            text:
                `📖 Trang ${data.page}/${data.totalPages}` +
                ` • ${data.totalItems} vật phẩm`
        });

    return {
        embed,
        data
    };
}
// =====================================================
// 🔘 NÚT ĐIỀU HƯỚNG
// =====================================================

function createNavigation(
    page,
    totalPages,
    shopFilter = "all"
) {

    const previous = new ButtonBuilder()
        .setCustomId(
            `shop_page_${Math.max(1, page - 1)}_${shopFilter}`
        )
        .setLabel("◀️ Trang trước")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page <= 1);

    const next = new ButtonBuilder()
        .setCustomId(
            `shop_page_${Math.min(totalPages, page + 1)}_${shopFilter}`
        )
        .setLabel("Trang sau ▶️")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(page >= totalPages);

    const home = new ButtonBuilder()
        .setCustomId("shop_home")
        .setLabel("🏪 Tất cả shop")
        .setStyle(ButtonStyle.Primary);

    return new ActionRowBuilder()
        .addComponents(
            previous,
            home,
            next
        );
}


// =====================================================
// 🏪 NÚT CHỌN SHOP
// =====================================================

function createShopSelector() {

    const buttons = [];

    for (const shop of SHOP_ORDER) {

        buttons.push(
            new ButtonBuilder()
                .setCustomId(
                    `shop_select_${shop}`
                )
                .setLabel(
                    SHOP_NAME[shop]
                )
                .setStyle(
                    shop === "daidao"
                        ? ButtonStyle.Danger
                        : shop === "thanh"
                            ? ButtonStyle.Success
                            : ButtonStyle.Secondary
                )
        );
    }

    return new ActionRowBuilder()
        .addComponents(buttons);
}


// =====================================================
// 🛒 NÚT MUA NHANH
// =====================================================

function createBuyButtons(items) {

    const rows = [];

    /*
     * Discord giới hạn 5 button / ActionRow.
     * Mỗi trang chỉ hiển thị tối đa 10 item,
     * nên tạo tối đa 2 hàng.
     */

    for (
        let i = 0;
        i < items.length && i < 10;
        i += 5
    ) {

        const row =
            new ActionRowBuilder();

        for (
            let j = i;
            j < i + 5 && j < items.length;
            j++
        ) {

            const item = items[j];

            const cleanName =
                item.name
                    .replace(
                        /^[^\wÀ-ỹ]+\s*/,
                        ""
                    );

            const itemId =
                getItemId(cleanName);

            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(
                        `shop_buy_${itemId}`
                    )
                    .setLabel(
                        `🛒 ${j + 1}`
                    )
                    .setStyle(
                        ButtonStyle.Success
                    )
            );
        }

        rows.push(row);
    }

    return rows;
}


// =====================================================
// 🏪 UI CỬA HÀNG
// =====================================================

function createShopUI(
    page = 1,
    shopFilter = "all"
) {

    const {
        embed,
        data
    } = createShopEmbed(
        page,
        shopFilter
    );

    const components = [];

    // Chọn shop
    components.push(
        createShopSelector()
    );

    // Trang
    components.push(
        createNavigation(
            data.page,
            data.totalPages,
            shopFilter
        )
    );

    // Mua nhanh
    const buyRows =
        createBuyButtons(
            data.items
        );

    components.push(
        ...buyRows
    );

    return {
        embeds: [embed],
        components
    };
}


// =====================================================
// 💎 KIỂM TRA LINH THẠCH
// =====================================================

function getLinhThach(player) {

    if (!player) return 0;

    return Number(
        player.linhThach ??
        player.linhthach ??
        player.linh_thach ??
        0
    );
}


// =====================================================
// 🌌 LẤY CẢNH GIỚI NGƯỜI CHƠI
// =====================================================

function getPlayerRealm(player) {

    if (!player) return 0;

    if (
        typeof player.realmIndex === "number"
    ) {
        return player.realmIndex;
    }

    if (
        typeof player.canhGioiIndex === "number"
    ) {
        return player.canhGioiIndex;
    }

    if (
        typeof player.canhGioi === "number"
    ) {
        return player.canhGioi;
    }

    const realmName =
        String(
            player.canhGioi ??
            player.realm ??
            ""
        );

    const index =
        REALMS.findIndex(
            realm =>
                realm.toLowerCase() ===
                realmName.toLowerCase()
        );

    return index >= 0 ? index : 0;
}


// =====================================================
// 🛍️ MUA VẬT PHẨM
// =====================================================

async function buyItem(
    interaction,
    itemId
) {

    const userId =
        interaction.user.id;

    const player =
        getPlayer(userId);

    if (!player) {

        return interaction.reply({
            content:
                "❌ Bạn chưa đăng ký nhân vật.",
            ephemeral: true
        });
    }

    const item =
        findItem(itemId);

    if (!item) {

        return interaction.reply({
            content:
                `❌ Không tìm thấy vật phẩm \`${itemId}\`.`,
            ephemeral: true
        });
    }

    const playerRealm =
        getPlayerRealm(player);

    if (
        playerRealm <
        item.requiredRealm
    ) {

        return interaction.reply({
            content: [
                "🔒 **Chưa đủ cảnh giới**",
                "",
                `📦 Vật phẩm: **${item.name}**`,
                `🌌 Yêu cầu: **${REALMS[item.requiredRealm]}**`,
                `👤 Hiện tại: **${REALMS[playerRealm]}**`
            ].join("\n"),
            ephemeral: true
        });
    }

    const money =
        getLinhThach(player);

    if (money < item.cost) {

        return interaction.reply({
            content: [
                "💎 **Không đủ Linh Thạch**",
                "",
                `📦 ${item.name}`,
                `💰 Giá: **${item.cost.toLocaleString()}**`,
                `💎 Bạn có: **${money.toLocaleString()}**`,
                `❌ Thiếu: **${(
                    item.cost - money
                ).toLocaleString()}**`
            ].join("\n"),
            ephemeral: true
        });
    }


    // =============================================
    // 💰 TRỪ TIỀN
    // =============================================

    const newMoney =
        money - item.cost;


    // =============================================
    // 🎒 THÊM ITEM
    // =============================================

    if (!Array.isArray(player.inventory)) {

        player.inventory = [];
    }

    player.inventory.push({
        id: getItemId(
            item.name.replace(
                /^[^\wÀ-ỹ]+\s*/,
                ""
            )
        ),

        name: item.name,

        quantity: 1,

        rarity: item.rarity,

        source: "cuahang",

        purchasedAt: Date.now()
    });


    // =============================================
    // 💾 LƯU
    // =============================================

    player.linhThach =
        newMoney;

    updatePlayer(
        userId,
        player
    );


    // =============================================
    // 🎉 THÔNG BÁO
    // =============================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                "🎉 MUA HÀNG THÀNH CÔNG"
            )
            .setDescription([
                `🛍️ Bạn đã mua **${item.name}**`,
                "",
                `🆔 ID: \`${getItemId(
                    item.name.replace(
                        /^[^\wÀ-ỹ]+\s*/,
                        ""
                    )
                )}\``,
                `💎 Giá: **${item.cost.toLocaleString()}**`,
                `💰 Còn lại: **${newMoney.toLocaleString()}**`,
                "",
                "🎒 Vật phẩm đã được thêm vào túi đồ!"
            ].join("\n"));

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId(
                        "shop_home"
                    )
                    .setLabel(
                        "🛒 Tiếp tục mua"
                    )
                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()
                    .setCustomId(
                        "shop_inventory"
                    )
                    .setLabel(
                        "🎒 Túi đồ"
                    )
                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );

    return interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
    });
}


// =====================================================
// 🏠 SLASH COMMAND
// =====================================================

const data =
    new SlashCommandBuilder()
        .setName("cuahang")
        .setDescription(
            "🛒 Mở cửa hàng Hồng Hoang"
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("xem")
                    .setDescription(
                        "🏪 Xem toàn bộ cửa hàng"
                    )
        )

        .addSubcommand(
            sub =>
                sub
                    .setName("mua")
                    .setDescription(
                        "🛍️ Mua vật phẩm bằng ID"
                    )

                    .addStringOption(
                        option =>
                            option
                                .setName("id")
                                .setDescription(
                                    "🆔 ID vật phẩm, ví dụ: thanh_van_kiem_quyet"
                                )
                                .setRequired(true)
                    )
        );


// =====================================================
// ⚡ EXECUTE
// =====================================================

async function execute(
    interaction
) {

    const subcommand =
        interaction.options.getSubcommand();

    // =============================================
    // 🏪 XEM SHOP
    // =============================================

    if (
        subcommand === "xem"
    ) {

        return interaction.reply(
            createShopUI(
                1,
                "all"
            )
        );
    }


    // =============================================
    // 🛒 MUA
    // =============================================

    if (
        subcommand === "mua"
    ) {

        const id =
            interaction.options.getString(
                "id"
            );

        return buyItem(
            interaction,
            id
        );
    }
}


// =====================================================
// 🔘 XỬ LÝ BUTTON
// =====================================================

async function handleComponent(
    interaction
) {

    const id =
        interaction.customId;

    // =============================================
    // 🏠 SHOP HOME
    // =============================================

    if (
        id === "shop_home"
    ) {

        return interaction.update(
            createShopUI(
                1,
                "all"
            )
        );
    }


    // =============================================
    // 📖 PHÂN TRANG
    // =============================================

    if (
        id.startsWith(
            "shop_page_"
        )
    ) {

        const parts =
            id.split("_");

        const page =
            Number(parts[2]) || 1;

        const filter =
            parts.slice(3).join("_") ||
            "all";

        return interaction.update(
            createShopUI(
                page,
                filter
            )
        );
    }


    // =============================================
    // 🏪 CHỌN SHOP
    // =============================================

    if (
        id.startsWith(
            "shop_select_"
        )
    ) {

        const shop =
            id.replace(
                "shop_select_",
                ""
            );

        if (
            !SHOP[shop]
        ) {
            return interaction.reply({
                content:
                    "❌ Shop không tồn tại.",
                ephemeral: true
            });
        }

        return interaction.update(
            createShopUI(
                1,
                shop
            )
        );
    }


    // =============================================
    // 🛒 MUA NHANH
    // =============================================

    if (
        id.startsWith(
            "shop_buy_"
        )
    ) {

        const itemId =
            id.replace(
                "shop_buy_",
                ""
            );

        return buyItem(
            interaction,
            itemId
        );
    }


    // =============================================
    // 🎒 TÚI ĐỒ
    // =============================================

    if (
        id === "shop_inventory"
    ) {

        return interaction.reply({
            content:
                "🎒 Hãy sử dụng lệnh **/tuido** để xem túi đồ.",
            ephemeral: true
        });
    }

    return null;
}


// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {
    data,
    execute,
    handleComponent,

    SHOP,
    SHOPS,
    SHOP_ORDER,

    findItem,
    getAllShopItems,
    getShopPage,
    getItemId
};
// =====================================================
// 🔄 XỬ LÝ INTERACTION TỔNG
// =====================================================

async function handleInteraction(interaction) {

    if (!interaction.isButton()) {
        return null;
    }

    const id = interaction.customId;

    // 🛒 Các button của cửa hàng
    if (
        id === "shop_home" ||
        id.startsWith("shop_page_") ||
        id.startsWith("shop_select_") ||
        id.startsWith("shop_buy_") ||
        id === "shop_inventory"
    ) {
        return handleComponent(interaction);
    }

    return null;
}


// =====================================================
// 📊 THỐNG KÊ SHOP
// =====================================================

function getShopStats() {

    const stats = {
        total: 0,
        congPhap: 0,
        danDuoc: 0,
        linhThu: 0,
        phapBao: 0,
        baoVat: 0,
        dacBiet: 0
    };

    for (const shop of SHOP_ORDER) {

        for (
            const category
            of Object.keys(SHOP[shop])
        ) {

            const count =
                Object.keys(
                    SHOP[shop][category]
                ).length;

            stats.total += count;

            if (
                stats[category] !== undefined
            ) {
                stats[category] += count;
            }
        }
    }

    return stats;
}


// =====================================================
// 🔎 TÌM VẬT PHẨM THEO TÊN
// =====================================================

function searchItems(keyword) {

    if (!keyword) {
        return [];
    }

    const key =
        String(keyword)
            .toLowerCase()
            .trim();

    return getAllShopItems()
        .filter(item => {

            const name =
                item.name.toLowerCase();

            const id =
                getItemId(
                    item.name.replace(
                        /^[^\wÀ-ỹ]+\s*/,
                        ""
                    )
                ).toLowerCase();

            return (
                name.includes(key) ||
                id.includes(key)
            );
        });
}


// =====================================================
// 📦 LẤY ITEM THEO TRANG
// =====================================================

function getItemsByCategory(
    category,
    page = 1,
    pageSize = 10
) {

    const items =
        getAllShopItems()
            .filter(
                item =>
                    item.category === category
            );

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                items.length /
                pageSize
            )
        );

    page =
        Math.max(
            1,
            Math.min(
                page,
                totalPages
            )
        );

    const start =
        (page - 1) *
        pageSize;

    return {
        items: items.slice(
            start,
            start + pageSize
        ),
        page,
        totalPages,
        totalItems: items.length
    };
}


// =====================================================
// 💎 HIỂN THỊ GIÁ
// =====================================================

function formatPrice(price) {

    return `💎 ${Number(price || 0)
        .toLocaleString("vi-VN")} Linh Thạch`;
}


// =====================================================
// 🌌 HIỂN THỊ CẢNH GIỚI
// =====================================================

function formatRealm(realm) {

    return (
        REALMS[realm] ||
        REALMS[0]
    );
}


// =====================================================
// 🧾 THÔNG TIN CHI TIẾT ITEM
// =====================================================

function createItemEmbed(item) {

    const cleanName =
        item.name.replace(
            /^[^\wÀ-ỹ]+\s*/,
            ""
        );

    const id =
        getItemId(cleanName);

    const embed =
        new EmbedBuilder()
            .setTitle(
                `📦 ${cleanName}`
            )
            .setDescription([
                `${item.rarity}`,
                "",
                `🆔 ID`,
                `\`${id}\``,
                "",
                `🌌 Cảnh giới yêu cầu`,
                `**${formatRealm(
                    item.requiredRealm
                )}**`,
                "",
                `💰 Giá`,
                `**${formatPrice(
                    item.cost
                )}**`,
                "",
                `✨ Hiệu ứng`,
                formatEffect(
                    item.effect
                )
            ].join("\n"));

    return embed;
}


// =====================================================
// ✨ HIỂN THỊ HIỆU ỨNG
// =====================================================

function formatEffect(effect = {}) {

    const result = [];

    if (effect.tuvi) {

        result.push(
            `✨ +${Number(
                effect.tuvi
            ).toLocaleString(
                "vi-VN"
            )} Tu Vi`
        );
    }

    if (effect.cong) {

        result.push(
            `⚔️ +${Number(
                effect.cong
            ).toLocaleString(
                "vi-VN"
            )} Công`
        );
    }

    if (effect.thu) {

        result.push(
            `🛡️ +${Number(
                effect.thu
            ).toLocaleString(
                "vi-VN"
            )} Thủ`
        );
    }

    if (effect.hp) {

        result.push(
            `❤️ +${Number(
                effect.hp
            ).toLocaleString(
                "vi-VN"
            )} HP`
        );
    }

    if (effect.linhLuc) {

        result.push(
            `💙 +${Number(
                effect.linhLuc
            ).toLocaleString(
                "vi-VN"
            )} Linh Lực`
        );
    }

    if (!result.length) {

        result.push(
            "✨ Vật phẩm đặc biệt"
        );
    }

    return result.join("\n");
}


// =====================================================
// 🛍️ UI CHI TIẾT ITEM
// =====================================================

function createItemUI(item) {

    const embed =
        createItemEmbed(item);

    const id =
        getItemId(
            item.name.replace(
                /^[^\wÀ-ỹ]+\s*/,
                ""
            )
        );

    const buy =
        new ButtonBuilder()
            .setCustomId(
                `shop_buy_${id}`
            )
            .setLabel(
                "🛒 Mua ngay"
            )
            .setStyle(
                ButtonStyle.Success
            );

    const back =
        new ButtonBuilder()
            .setCustomId(
                "shop_home"
            )
            .setLabel(
                "↩️ Cửa hàng"
            )
            .setStyle(
                ButtonStyle.Secondary
            );

    const row =
        new ActionRowBuilder()
            .addComponents(
                buy,
                back
            );

    return {
        embeds: [embed],
        components: [row]
    };
}


// =====================================================
// 🧹 CHUYỂN ID CŨ → ID MỚI
// =====================================================

const LEGACY_IDS = {

    "thanh-van-kiem-quyet":
        "thanh_van_kiem_quyet",

    "cuu-thien-loi-quyet":
        "cuu_thien_loi_quyet",

    "hong-mong-dan":
        "hong_mong_dan",

    "tru-tien-kiem":
        "tru_tien_kiem",

    "hong-mong-kiem":
        "hong_mong_kiem",

    "hon-don-chung":
        "hon_don_chung",

    "ban-co-phien":
        "ban_co_phien",

    "dai-dao-dan":
        "dai_dao_dan"
};


function normalizeItemId(id) {

    if (!id) {
        return "";
    }

    const value =
        String(id)
            .trim()
            .toLowerCase();

    return (
        LEGACY_IDS[value] ||
        value
    );
}


// =====================================================
// 🔍 FIND ITEM NÂNG CAO
// =====================================================

function findItemAdvanced(id) {

    const normalized =
        normalizeItemId(id);

    const direct =
        findItem(normalized);

    if (direct) {
        return direct;
    }

    const all =
        getAllShopItems();

    return all.find(item => {

        const cleanName =
            item.name.replace(
                /^[^\wÀ-ỹ]+\s*/,
                ""
            );

        const generatedId =
            getItemId(
                cleanName
            );

        return (
            generatedId === normalized
        );
    }) || null;
}


// =====================================================
// 🛒 BUY ITEM OVERRIDE
// =====================================================

async function purchase(
    interaction,
    rawId
) {

    const itemId =
        normalizeItemId(rawId);

    const item =
        findItemAdvanced(itemId);

    if (!item) {

        return interaction.reply({
            content: [
                "❌ **Không tìm thấy vật phẩm**",
                "",
                `🆔 ID: \`${rawId}\``,
                "",
                "💡 Ví dụ:",
                "`/cuahang mua id:thanh_van_kiem_quyet`",
                "`/cuahang mua id:hong_mong_dan`"
            ].join("\n"),
            ephemeral: true
        });
    }

    return buyItem(
        interaction,
        itemId
    );
}


// =====================================================
// 🧪 KIỂM TRA DỮ LIỆU
// =====================================================

function validateShop() {

    const errors = [];

    for (
        const shop of SHOP_ORDER
    ) {

        if (!SHOP[shop]) {

            errors.push(
                `Không tồn tại shop: ${shop}`
            );

            continue;
        }

        for (
            const category
            of Object.keys(
                SHOP[shop]
            )
        ) {

            for (
                const [id, item]
                of Object.entries(
                    SHOP[shop][category]
                )
            ) {

                if (!item.name) {

                    errors.push(
                        `${shop}/${category}/${id}: thiếu name`
                    );
                }

                if (
                    typeof item.cost !==
                    "number"
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: cost không hợp lệ`
                    );
                }

                if (
                    typeof item.requiredRealm !==
                    "number"
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: requiredRealm không hợp lệ`
                    );
                }
            }
        }
    }

    return errors;
}


// =====================================================
// 📋 EXPORT BỔ SUNG
// =====================================================

module.exports = {
    data,
    execute,
    handleComponent,
    handleInteraction,

    SHOP,
    SHOPS,
    SHOP_ORDER,

    findItem,
    findItemAdvanced,

    getItemId,
    normalizeItemId,

    getAllShopItems,
    getShopPage,
    getItemsByCategory,

    searchItems,
    getShopStats,

    createShopEmbed,
    createShopUI,
    createItemEmbed,
    createItemUI,

    formatEffect,
    formatPrice,
    formatRealm,

    purchase,

    validateShop
};
