const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// 🏪 CỬA HÀNG HỒNG HOANG - 500 VẬT PHẨM
// =====================================================
//
// 4 SHOP:
// 1. Thường
// 2. Tiên
// 3. Thánh
// 4. Đại Đạo
//
// Mỗi shop:
// - 25 Công pháp
// - 25 Đan dược
// - 20 Linh thú
// - 20 Pháp bảo
// - 20 Thiên tài địa bảo
//
// Tổng: 4 x 90 = 360
// + 140 vật phẩm đặc biệt = 500
// =====================================================


// =====================================================
// 🌌 18 CẢNH GIỚI
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


// =====================================================
// ⭐ ĐỘ HIẾM
// =====================================================

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
// 🏪 4 SHOP
// =====================================================

const SHOPS = {
    thuong: {
        name: "🏪 SHOP THƯỜNG",
        minRealm: 0,
        maxRealm: 8,
        price: 1
    },

    tien: {
        name: "☁️ SHOP TIÊN",
        minRealm: 9,
        maxRealm: 14,
        price: 1000
    },

    thanh: {
        name: "👑 SHOP THÁNH",
        minRealm: 15,
        maxRealm: 16,
        price: 1000000
    },

    daidao: {
        name: "🌌 SHOP ĐẠI ĐẠO",
        minRealm: 17,
        maxRealm: 17,
        price: 100000000
    }
};


// =====================================================
// 📜 TÊN CÔNG PHÁP
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
// 💊 TÊN ĐAN DƯỢC
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
// 🐉 TÊN LINH THÚ
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
// ⚔️ TÊN PHÁP BẢO
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
// 🔢 TẠO VẬT PHẨM
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
// 🎯 HÀM TẠO VẬT PHẨM
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

        // bonus cũ để tương thích database/shop hiện tại
        bonus: effect.cong || 0,

        hpBonus: effect.hp || 0,
        congBonus: effect.cong || 0,
        thuBonus: effect.thu || 0,
        tuviBonus: effect.tuvi || 0,
        linhLucBonus: effect.linhLuc || 0
    };
}


// =====================================================
// 🧮 HỆ SỐ SHOP
// =====================================================

const SHOP_MULTIPLIER = {
    thuong: 1,
    tien: 1000,
    thanh: 1000000,
    daidao: 100000000
};


// =====================================================
// ⭐ TẠO 500 MÓN
// =====================================================

function generateShop() {

    let counter = 1;

    const shopNames = [
        "thuong",
        "tien",
        "thanh",
        "daidao"
    ];

    for (const shop of shopNames) {

        const config =
            SHOPS[shop];

        // =============================================
        // 📜 CÔNG PHÁP
        // =============================================

        CONG_PHAP_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
                        )
                    ];

                const cost =
                    Math.max(
                        100,
                        Math.floor(
                            config.price *
                            (i + 1) *
                            2
                        )
                    );

                addItem(
                    shop,
                    "congPhap",
                    `cp-${shop}-${counter++}`,
                    `📜 ${baseName}`,
                    realm,
                    rarity,
                    cost,
                    {
                        cong:
                            (realm + 1) * 100,
                        thu:
                            (realm + 1) * 30,
                        tuvi:
                            (realm + 1) * 1000
                    }
                );
            }
        );


// =====================================================
// 💊 ĐAN DƯỢC
// =====================================================

        DAN_DUOC_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
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

                addItem(
                    shop,
                    "danDuoc",
                    `dd-${shop}-${counter++}`,
                    `💊 ${baseName}`,
                    realm,
                    rarity,
                    cost,
                    {
                        tuvi:
                            (realm + 1) * 500
                    }
                );
            }
        );


// =====================================================
// 🐉 LINH THÚ
// =====================================================

        LINH_THU_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
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
            }
        );


// =====================================================
// ⚔️ PHÁP BẢO
// =====================================================

        PHAP_BAO_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
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
            }
        );


// =====================================================
// 🌿 THIÊN TÀI ĐỊA BẢO
// =====================================================

        BAO_VAT_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
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
                        tuvi:
                            (realm + 1) * 1000,
                        linhLuc:
                            (realm + 1) * 100
                    }
                );
            }
        );


// =====================================================
// 🎁 VẬT PHẨM ĐẶC BIỆT
// =====================================================

        DAC_BIET_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 4)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(
                                realm / 2
                            )
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
                        tuvi:
                            (realm + 1) * 2000,
                        cong:
                            (realm + 1) * 50
                    }
                );
            }
        );
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

    const normalized =
        String(itemId)
            .trim()
            .toLowerCase();

    for (const shop of Object.keys(SHOP)) {

        for (
            const category
            of Object.keys(SHOP[shop])
        ) {

            const items =
                SHOP[shop][category];

            for (
                const id
                of Object.keys(items)
            ) {

                const item = items[id];

                if (
                    id.toLowerCase() ===
                    normalized
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

    for (
        const shop
        of Object.keys(SHOP)
    ) {

        for (
            const category
            of Object.keys(SHOP[shop])
        ) {

            for (
                const item
                of Object.values(
                    SHOP[shop][category]
                )
            ) {

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
    pageSize = 12
) {

    const items =
        getAllShopItems();

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
        items:
            items.slice(
                start,
                start + pageSize
            ),

        page,

        totalPages,

        totalItems:
            items.length
    };
}


// =====================================================
// 🏪 TẠO GIAO DIỆN CỬA HÀNG
// =====================================================

function createShopEmbed(
    page = 1
) {

    const data =
        getShopPage(
            page,
            12
        );

    let description =
        "";

    data.items.forEach(
        (item, index) => {

            const cleanName =
                item.name
                    .replace(
                        /^[^\wÀ-ỹ]+\s*/,
                        ""
                    );

            const itemId =
                cleanName
                    .normalize("NFD")
                    .replace(
                        /[\u0300-\u036f]/g,
                        ""
                    )
                    .toLowerCase()
                    .replace(
                        /[^a-z0-9]+/g,
                        "_"
                    )
                    .replace(
                        /^_+|_+$/g,
                        ""
                    );

            description +=
                `**${index + 1}. ${item.name}**\n`;

            description +=
                `🆔 \`${itemId}\`\n`;

            description +=
                `${item.rarity}\n`;

            description +=
                `🌌 ${REALMS[item.requiredRealm]}\n`;

            description +=
                `💎 **${item.cost.toLocaleString()}** Linh Thạch\n\n`;
        }
    );

    const embed =
        new EmbedBuilder()
            .setTitle(
                "🛒 HỒNG HOANG — CỬA HÀNG"
            )
            .setDescription(
                description ||
                "📦 Không có vật phẩm."
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
// 🔘 TẠO NÚT PHÂN TRANG
// =====================================================

function createShopButtons(
    page,
    totalPages
) {

    const {
        ButtonBuilder,
        ActionRowBuilder,
        ButtonStyle
    } = require("discord.js");

    const previous =
        new ButtonBuilder()
            .setCustomId(
                `shop_page_${Math.max(
                    1,
                    page - 1
                )}`
            )
            .setLabel(
                "◀️ Trang trước"
            )
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                page <= 1
            );

    const next =
        new ButtonBuilder()
            .setCustomId(
                `shop_page_${Math.min(
                    totalPages,
                    page + 1
                )}`
            )
            .setLabel(
                "Trang sau ▶️"
            )
            .setStyle(
                ButtonStyle.Secondary
            )
            .setDisabled(
                page >= totalPages
            );

    const home =
        new ButtonBuilder()
            .setCustomId(
                "shop_home"
            )
            .setLabel(
                "🏪 Trang 1"
            )
            .setStyle(
                ButtonStyle.Primary
            );

    return new ActionRowBuilder()
        .addComponents(
            previous,
            home,
            next
        );
}


// =====================================================
// 🆔 TẠO ID DỄ NHỚ
// =====================================================

function makeItemId(name) {

    return name
        .replace(
            /^[^\wÀ-ỹ]+\s*/,
            ""
        )
        .normalize("NFD")
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .toLowerCase()
        .replace(
            /[^a-z0-9]+/g,
            "_"
        )
        .replace(
            /^_+|_+$/g,
            ""
        );
}


// =====================================================
// 🔄 TÌM ITEM BẰNG ID DỄ NHỚ
// =====================================================

function findItemByReadableId(
    readableId
) {

    if (!readableId) {
        return null;
    }

    const normalized =
        String(readableId)
            .trim()
            .toLowerCase();

    const items =
        getAllShopItems();

    return (
        items.find(item => {

            const generatedId =
                makeItemId(
                    item.name
                );

            return (
                generatedId ===
                normalized
            );
        }) || null
    );
}


// =====================================================
// 💎 LẤY LINH THẠCH
// =====================================================

function getLinhThach(
    player
) {

    return Number(
        player.linhThach ??
        player.linhthach ??
        player.linh_thach ??
        0
    );
}


// =====================================================
// 🌌 LẤY CẢNH GIỚI
// =====================================================

function getRealmIndex(
    player
) {

    if (
        typeof player.realmIndex ===
        "number"
    ) {
        return player.realmIndex;
    }

    if (
        typeof player.canhGioiIndex ===
        "number"
    ) {
        return player.canhGioiIndex;
    }

    const realm =
        String(
            player.canhGioi ??
            player.realm ??
            ""
        );

    const index =
        REALMS.findIndex(
            x =>
                x.toLowerCase() ===
                realm.toLowerCase()
        );

    return index >= 0
        ? index
        : 0;
}


// =====================================================
// 🎒 THÊM ITEM VÀO TÚI
// =====================================================

function addToInventory(
    player,
    item
) {

    if (
        !Array.isArray(
            player.tuiDo
        )
    ) {
        player.tuiDo = [];
    }

    const itemId =
        makeItemId(
            item.name
        );

    const existing =
        player.tuiDo.find(
            x =>
                x.id === itemId
        );

    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 0
            ) + 1;

    } else {

        player.tuiDo.push({
            id: itemId,

            name:
                item.name,

            quantity: 1,

            rarity:
                item.rarity,

            requiredRealm:
                item.requiredRealm,

            cost:
                item.cost,

            effect:
                item.effect
        });
    }
}


// =====================================================
// 🛒 MUA VẬT PHẨM
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
                "❌ Bạn chưa có nhân vật. Hãy dùng `/batdau`.",
            ephemeral: true
        });
    }

    let item =
        findItemByReadableId(
            itemId
        );

    if (!item) {

        item =
            findItem(
                itemId
            );
    }

    if (!item) {

        return interaction.reply({
            content: [
                "❌ **Không tìm thấy vật phẩm!**",
                "",
                `🆔 ID: \`${itemId}\``,
                "",
                "💡 Ví dụ:",
                "`/cuahang mua id:thanh_van_kiem_quyet`"
            ].join("\n"),
            ephemeral: true
        });
    }

    const playerRealm =
        getRealmIndex(
            player
        );

    if (
        playerRealm <
        item.requiredRealm
    ) {

        return interaction.reply({
            content: [
                "🔒 **Cảnh giới chưa đủ!**",
                "",
                `📦 ${item.name}`,
                `🌌 Yêu cầu: **${REALMS[item.requiredRealm]}**`,
                `👤 Hiện tại: **${REALMS[playerRealm]}**`
            ].join("\n"),
            ephemeral: true
        });
    }

    const money =
        getLinhThach(
            player
        );

    if (
        money <
        item.cost
    ) {

        return interaction.reply({
            content: [
                "💎 **Không đủ Linh Thạch!**",
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

    // Trừ linh thạch
    player.linhThach =
        money - item.cost;

    // Thêm túi đồ
    addToInventory(
        player,
        item
    );

    // Cộng chỉ số nếu item có hiệu ứng
    if (item.effect) {

        if (item.effect.tuvi) {

            player.tuVi =
                Number(
                    player.tuVi || 0
                ) +
                Number(
                    item.effect.tuvi
                );
        }

        if (item.effect.cong) {

            player.cong =
                Number(
                    player.cong || 0
                ) +
                Number(
                    item.effect.cong
                );
        }

        if (item.effect.thu) {

            player.thu =
                Number(
                    player.thu || 0
                ) +
                Number(
                    item.effect.thu
                );
        }

        if (item.effect.hp) {

            player.hp =
                Number(
                    player.hp || 0
                ) +
                Number(
                    item.effect.hp
                );
        }

        if (item.effect.linhLuc) {

            player.linhLuc =
                Number(
                    player.linhLuc || 0
                ) +
                Number(
                    item.effect.linhLuc
                );
        }
    }

    updatePlayer(
        userId,
        player
    );

    const embed =
        new EmbedBuilder()
            .setTitle(
                "🎉 MUA HÀNG THÀNH CÔNG"
            )
            .setDescription([
                `🛍️ Đã mua: **${item.name}**`,
                "",
                `🆔 ID: \`${makeItemId(item.name)}\``,
                `💎 Đã trả: **${item.cost.toLocaleString()}**`,
                `💰 Còn lại: **${player.linhThach.toLocaleString()}**`,
                "",
                "🎒 Vật phẩm đã được thêm vào túi đồ!"
            ].join("\n"));

    return interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}
// =====================================================
// 🛒 LỆNH /CUAHANG
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
                        "🏪 Xem cửa hàng"
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
                                    "🆔 ID vật phẩm"
                                )
                                .setRequired(true)
                    )
        );


// =====================================================
// ⚡ EXECUTE COMMAND
// =====================================================

async function execute(
    interaction
) {

    const subcommand =
        interaction.options.getSubcommand();

    // =============================================
    // 🏪 XEM CỬA HÀNG
    // =============================================

    if (
        subcommand === "xem"
    ) {

        const {
            embed,
            data
        } =
            createShopEmbed(1);

        const buttons =
            createShopButtons(
                data.page,
                data.totalPages
            );

        return interaction.reply({
            embeds: [embed],
            components: [buttons]
        });
    }


    // =============================================
    // 🛒 MUA VẬT PHẨM
    // =============================================

    if (
        subcommand === "mua"
    ) {

        const itemId =
            interaction.options.getString(
                "id"
            );

        return buyItem(
            interaction,
            itemId
        );
    }
}


// =====================================================
// 🔘 XỬ LÝ BUTTON
// =====================================================

async function handleButton(
    interaction
) {

    const id =
        interaction.customId;


    // =============================================
    // 🏠 VỀ TRANG ĐẦU
    // =============================================

    if (
        id === "shop_home"
    ) {

        const {
            embed,
            data
        } =
            createShopEmbed(1);

        const buttons =
            createShopButtons(
                data.page,
                data.totalPages
            );

        return interaction.update({
            embeds: [embed],
            components: [buttons]
        });
    }


    // =============================================
    // 📖 CHUYỂN TRANG
    // =============================================

    if (
        id.startsWith(
            "shop_page_"
        )
    ) {

        const page =
            Number(
                id.replace(
                    "shop_page_",
                    ""
                )
            ) || 1;

        const {
            embed,
            data
        } =
            createShopEmbed(
                page
            );

        const buttons =
            createShopButtons(
                data.page,
                data.totalPages
            );

        return interaction.update({
            embeds: [embed],
            components: [buttons]
        });
    }

    return null;
}


// =====================================================
// 🔘 XỬ LÝ INTERACTION CỬA HÀNG
// =====================================================

async function handleInteraction(
    interaction
) {

    if (
        !interaction.isButton()
    ) {
        return null;
    }

    if (
        interaction.customId ===
        "shop_home"
    ) {

        return handleButton(
            interaction
        );
    }

    if (
        interaction.customId.startsWith(
            "shop_page_"
        )
    ) {

        return handleButton(
            interaction
        );
    }

    return null;
}


// =====================================================
// 📊 THỐNG KÊ CỬA HÀNG
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

    for (
        const shop
        of Object.keys(SHOP)
    ) {

        for (
            const category
            of Object.keys(
                SHOP[shop]
            )
        ) {

            const count =
                Object.keys(
                    SHOP[shop][category]
                ).length;

            stats.total += count;

            if (
                stats[category] !== undefined
            ) {

                stats[category] +=
                    count;
            }
        }
    }

    return stats;
}


// =====================================================
// 🔎 TÌM KIẾM VẬT PHẨM
// =====================================================

function searchItems(
    keyword
) {

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
                item.name
                    .toLowerCase();

            const readableId =
                makeItemId(
                    item.name
                );

            return (
                name.includes(key) ||
                readableId.includes(key)
            );
        });
}


// =====================================================
// 🧪 KIỂM TRA SHOP
// =====================================================

function validateShop() {

    const errors = [];

    for (
        const shop
        of Object.keys(SHOP)
    ) {

        if (
            !SHOP[shop]
        ) {

            errors.push(
                `Shop không tồn tại: ${shop}`
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
                        `${id}: thiếu tên`
                    );
                }

                if (
                    typeof item.cost !==
                    "number"
                ) {

                    errors.push(
                        `${id}: giá không hợp lệ`
                    );
                }

                if (
                    typeof item.requiredRealm !==
                    "number"
                ) {

                    errors.push(
                        `${id}: cảnh giới không hợp lệ`
                    );
                }
            }
        }
    }

    return errors;
}


// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {

    // Slash command
    data,

    // Execute
    execute,

    // Button
    handleButton,

    // Interaction
    handleInteraction,

    // Database / shop
    SHOP,
    SHOPS,

    // Item
    findItem,
    findItemByReadableId,
    getAllShopItems,

    // Pagination
    getShopPage,

    // Search
    searchItems,

    // Stats
    getShopStats,

    // Validation
    validateShop,

    // UI
    createShopEmbed,
    createShopButtons,

    // Purchase
    buyItem,

    // ID
    makeItemId
};
