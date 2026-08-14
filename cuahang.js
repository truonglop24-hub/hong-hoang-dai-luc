const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// 🏪 CỬA HÀNG HỒNG HOANG - 540 VẬT PHẨM
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
// Tổng thực tế: 4 x 135 = 540 vật phẩm
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
// 🔢 TẠO SHOP
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
// 🎯 HÀM THÊM VẬT PHẨM
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

        bonus:
            effect.cong || 0,

        hpBonus:
            effect.hp || 0,

        congBonus:
            effect.cong || 0,

        thuBonus:
            effect.thu || 0,

        tuviBonus:
            effect.tuvi || 0,

        linhLucBonus:
            effect.linhLuc || 0
    };
}


// =====================================================
// 💰 HỆ SỐ SHOP
// =====================================================

const SHOP_MULTIPLIER = {
    thuong: 1,
    tien: 1000,
    thanh: 1000000,
    daidao: 100000000
};


// =====================================================
// ⭐ TẠO VẬT PHẨM
// =====================================================

function generateShop() {

    let counter = 1;

    const shopNames = [
        "thuong",
        "tien",
        "thanh",
        "daidao"
    ];

    for (
        const shop
        of shopNames
    ) {

        const config =
            SHOPS[shop];

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

generateShop();


// =====================================================
// 🔍 TÌM VẬT PHẨM
// =====================================================

function findItem(itemId) {

    if (!itemId) {
        return null;
    }

    const normalized =
        String(itemId)
            .trim()
            .toLowerCase();

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

            const items =
                SHOP[shop][category];

            for (
                const id
                of Object.keys(items)
            ) {

                if (
                    id.toLowerCase() ===
                    normalized
                ) {

                    return {
                        ...items[id],
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
// 📦 TOÀN BỘ VẬT PHẨM
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
// 🆔 TẠO ID DỄ NHỚ
// =====================================================

function makeItemId(name) {

    return String(name)
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
// 🔎 TÌM ITEM BẰNG ID DỄ NHỚ
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

    // Hỗ trợ nhiều kiểu database
    if (
        !Array.isArray(
            player.tuiDo
        )
    ) {

        if (
            Array.isArray(
                player.inventory
            )
        ) {

            player.tuiDo =
                player.inventory;

        } else {

            player.tuiDo = [];
        }
    }

    const itemId =
        item.id ||
        makeItemId(
            item.name
        );

    const existing =
        player.tuiDo.find(
            x =>
                x.id === itemId ||
                x.itemId === itemId
        );

    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 0
            ) + 1;

    } else {

        player.tuiDo.push({

            id:
                itemId,

            itemId:
                itemId,

            name:
                item.name,

            quantity:
                1,

            rarity:
                item.rarity,

            requiredRealm:
                item.requiredRealm,

            cost:
                item.cost,

            effect:
                item.effect || {}
        });
    }

    // Đồng bộ inventory nếu database đang dùng tên này
    if (
        Array.isArray(
            player.inventory
        )
    ) {

        player.inventory =
            player.tuiDo;
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
        getPlayer(
            userId
        );

    if (!player) {

        return interaction.reply({

            content:
                "❌ **Bạn chưa có nhân vật!**\n\n" +
                "🌱 Hãy sử dụng `/batdau` để bắt đầu con đường tu tiên.",

            ephemeral: true
        });
    }

    // =============================================
    // 🔎 TÌM ITEM
    // =============================================

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
                "❌ **KHÔNG TÌM THẤY VẬT PHẨM**",
                "",
                `🆔 ID: \`${itemId}\``,
                "",
                "💡 Hãy kiểm tra lại ID.",
                "",
                "📌 Ví dụ:",
                "`/cuahang mua id:thanh_van_kiem_quyet`"
            ].join("\n"),

            ephemeral: true
        });
    }


    // =============================================
    // 🌌 KIỂM TRA CẢNH GIỚI
    // =============================================

    const playerRealm =
        getRealmIndex(
            player
        );

    const requiredRealm =
        Number(
            item.requiredRealm || 0
        );

    if (
        playerRealm <
        requiredRealm
    ) {

        return interaction.reply({

            content: [
                "🔒 **CẢNH GIỚI CHƯA ĐỦ**",
                "",
                `📦 Vật phẩm: **${item.name}**`,
                "",
                `🌌 Yêu cầu: **${REALMS[requiredRealm] || "Không xác định"}**`,
                `👤 Hiện tại: **${REALMS[playerRealm] || "Phàm Nhân"}**`,
                "",
                "⚡ Hãy tiếp tục tu luyện để mở khóa vật phẩm này!"
            ].join("\n"),

            ephemeral: true
        });
    }


    // =============================================
    // 💎 KIỂM TRA LINH THẠCH
    // =============================================

    const money =
        getLinhThach(
            player
        );

    const price =
        Number(
            item.cost || 0
        );

    if (
        money <
        price
    ) {

        return interaction.reply({

            content: [
                "💎 **KHÔNG ĐỦ LINH THẠCH**",
                "",
                `📦 Vật phẩm: **${item.name}**`,
                `💰 Giá: **${price.toLocaleString()}** Linh Thạch`,
                `💎 Bạn có: **${money.toLocaleString()}**`,
                `❌ Còn thiếu: **${(
                    price - money
                ).toLocaleString()}**`,
                "",
                "💡 Hãy kiếm thêm Linh Thạch rồi quay lại!"
            ].join("\n"),

            ephemeral: true
        });
    }


    // =============================================
    // 💎 TRỪ LINH THẠCH
    // =============================================

    player.linhThach =
        money - price;


    // =============================================
    // 🎒 THÊM VÀO TÚI
    // =============================================

    addToInventory(
        player,
        item
    );


    // =============================================
    // ✨ ÁP DỤNG HIỆU ỨNG
    // =============================================

    const effect =
        item.effect || {};


    if (
        effect.tuvi
    ) {

        player.tuVi =
            Number(
                player.tuVi || 0
            ) +
            Number(
                effect.tuvi
            );
    }


    if (
        effect.cong
    ) {

        player.cong =
            Number(
                player.cong || 0
            ) +
            Number(
                effect.cong
            );
    }


    if (
        effect.thu
    ) {

        player.thu =
            Number(
                player.thu || 0
            ) +
            Number(
                effect.thu
            );
    }


    if (
        effect.hp
    ) {

        player.hp =
            Number(
                player.hp || 0
            ) +
            Number(
                effect.hp
            );
    }


    if (
        effect.linhLuc
    ) {

        player.linhLuc =
            Number(
                player.linhLuc || 0
            ) +
            Number(
                effect.linhLuc
            );
    }


    // =============================================
    // 💾 LƯU DATABASE
    // =============================================

    updatePlayer(
        userId,
        player
    );


    // =============================================
    // 🎉 THÔNG BÁO MUA THÀNH CÔNG
    // =============================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                "🎉 MUA HÀNG THÀNH CÔNG"
            )
            .setDescription([
                "╭───────────────╮",
                `🛍️ **${item.name}**`,
                "╰───────────────╯",
                "",
                `🆔 ID: \`${makeItemId(item.name)}\``,
                `✨ Độ hiếm: **${item.rarity}**`,
                "",
                `💎 Đã trả: **${price.toLocaleString()}**`,
                `💰 Còn lại: **${player.linhThach.toLocaleString()}**`,
                "",
                "🎒 **Vật phẩm đã được thêm vào túi đồ!**",
                "",
                "🌌 Chúc đạo hữu tiếp tục hành trình tu tiên!"
            ].join("\n"));

    return interaction.reply({

        embeds: [
            embed
        ],

        ephemeral: true
    });
}


// =====================================================
// 🎨 UI CỬA HÀNG
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
        (
            item,
            index
        ) => {

            const itemId =
                makeItemId(
                    item.name
                );

            description +=
                `**${index + 1}. ${item.name}**\n`;

            description +=
                `🆔 \`${itemId}\`\n`;

            description +=
                `${item.rarity}\n`;

            description +=
                `🌌 ${REALMS[item.requiredRealm] || "Không xác định"}\n`;

            description +=
                `💎 **${Number(item.cost).toLocaleString()}** Linh Thạch\n\n`;
        }
    );


    const embed =
        new EmbedBuilder()
            .setTitle(
                "🛒 HỒNG HOANG • CỬA HÀNG"
            )
            .setDescription(
                description ||
                "📦 Cửa hàng hiện không có vật phẩm."
            )
            .setFooter({
                text:
                    `📖 Trang ${data.page}/${data.totalPages}` +
                    ` • 🛍️ ${data.totalItems} vật phẩm`
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
    totalPages,
    sessionId = ""
) {

    const {
        ButtonBuilder,
        ActionRowBuilder,
        ButtonStyle
    } = require("discord.js");


    const prefix =
        sessionId
            ? `shop_${sessionId}_`
            : "shop_";


    const previous =
        new ButtonBuilder()
            .setCustomId(
                `${prefix}page_${Math.max(
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


    const home =
        new ButtonBuilder()
            .setCustomId(
                `${prefix}home`
            )
            .setLabel(
                "🏠 Trang 1"
            )
            .setStyle(
                ButtonStyle.Primary
            );


    const next =
        new ButtonBuilder()
            .setCustomId(
                `${prefix}page_${Math.min(
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


    return new ActionRowBuilder()
        .addComponents(
            previous,
            home,
            next
        );
}
// =====================================================
// ⚡ LỆNH /CUAHANG
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
                                .setAutocomplete(false)
                    )
        );


// =====================================================
// ⚡ EXECUTE
// =====================================================

async function execute(
    interaction
) {

    try {

        const subcommand =
            interaction.options.getSubcommand();


        // =================================================
        // 🏪 /CUAHANG XEM
        // =================================================

        if (
            subcommand === "xem"
        ) {

            // ---------------------------------------------
            // 🆔 ID PHIÊN RIÊNG
            // ---------------------------------------------

            const sessionId =
                `${interaction.user.id}_${Date.now()}`
                    .replace(
                        /[^a-zA-Z0-9_]/g,
                        ""
                    )
                    .slice(
                        -70
                    );


            // ---------------------------------------------
            // 📖 TRANG 1
            // ---------------------------------------------

            const {
                embed,
                data: shopData
            } =
                createShopEmbed(
                    1
                );


            // ---------------------------------------------
            // 🔘 NÚT
            // ---------------------------------------------

            const buttons =
                createShopButtons(
                    shopData.page,
                    shopData.totalPages,
                    sessionId
                );


            // ---------------------------------------------
            // 📤 GỬI SHOP
            // ---------------------------------------------

            await interaction.reply({

                embeds: [
                    embed
                ],

                components: [
                    buttons
                ]
            });


            // ---------------------------------------------
            // 📩 LẤY MESSAGE
            // ---------------------------------------------

            const message =
                await interaction.fetchReply();


            // =================================================
            // 🎮 BUTTON COLLECTOR
            // =================================================

            const {
                ComponentType
            } =
                require("discord.js");


            const collector =
                message.createMessageComponentCollector({

                    componentType:
                        ComponentType.Button,

                    time:
                        15 * 60 * 1000,

                    filter:
                        buttonInteraction => {

                            // Chỉ người mở shop được bấm
                            return (
                                buttonInteraction.user.id ===
                                interaction.user.id
                            );
                        }
                });


            // =================================================
            // 🔘 BUTTON COLLECT
            // =================================================

            collector.on(
                "collect",
                async buttonInteraction => {

                    try {

                        const customId =
                            buttonInteraction.customId;


                        // -----------------------------------------
                        // 🛡️ KIỂM TRA PHIÊN
                        // -----------------------------------------

                        const prefix =
                            `shop_${sessionId}_`;


                        if (
                            !customId.startsWith(
                                prefix
                            )
                        ) {

                            return;
                        }


                        // =================================================
                        // 🏠 TRANG 1
                        // =================================================

                        if (
                            customId ===
                            `${prefix}home`
                        ) {

                            const {
                                embed,
                                data: newData
                            } =
                                createShopEmbed(
                                    1
                                );


                            const newButtons =
                                createShopButtons(
                                    newData.page,
                                    newData.totalPages,
                                    sessionId
                                );


                            await buttonInteraction.update({

                                embeds: [
                                    embed
                                ],

                                components: [
                                    newButtons
                                ]
                            });


                            return;
                        }


                        // =================================================
                        // 📖 CHUYỂN TRANG
                        // =================================================

                        if (
                            customId.startsWith(
                                `${prefix}page_`
                            )
                        ) {

                            const pageText =
                                customId.replace(
                                    `${prefix}page_`,
                                    ""
                                );


                            const page =
                                Number(
                                    pageText
                                );


                            // -----------------------------------------
                            // 🛡️ KIỂM TRA PAGE
                            // -----------------------------------------

                            if (
                                !Number.isInteger(
                                    page
                                )
                            ) {

                                return buttonInteraction.reply({

                                    content:
                                        "❌ Trang không hợp lệ.",

                                    ephemeral:
                                        true
                                });
                            }


                            const {
                                embed,
                                data: newData
                            } =
                                createShopEmbed(
                                    page
                                );


                            const newButtons =
                                createShopButtons(
                                    newData.page,
                                    newData.totalPages,
                                    sessionId
                                );


                            await buttonInteraction.update({

                                embeds: [
                                    embed
                                ],

                                components: [
                                    newButtons
                                ]
                            });


                            return;
                        }

                    } catch (error) {

                        console.error(
                            "❌ Lỗi khi xử lý nút cửa hàng:",
                            error
                        );


                        try {

                            if (
                                buttonInteraction.replied ||
                                buttonInteraction.deferred
                            ) {

                                return;
                            }


                            await buttonInteraction.reply({

                                content:
                                    "❌ Đã xảy ra lỗi khi xử lý cửa hàng.",

                                ephemeral:
                                    true
                            });

                        } catch (
                            replyError
                        ) {

                            console.error(
                                "❌ Không thể gửi lỗi:",
                                replyError
                            );
                        }
                    }
                }
            );


            // =================================================
            // ⏰ COLLECTOR KẾT THÚC
            // =================================================

            collector.on(
                "end",
                async () => {

                    try {

                        const {
                            data: endData
                        } =
                            createShopEmbed(
                                1
                            );


                        const disabledButtons =
                            createShopButtons(
                                endData.page,
                                endData.totalPages,
                                sessionId
                            );


                        disabledButtons.components.forEach(
                            button => {

                                button.setDisabled(
                                    true
                                );

                            }
                        );


                        await message.edit({

                            components: [
                                disabledButtons
                            ]
                        });

                    } catch (
                        error
                    ) {

                        // Message có thể đã bị xóa
                        console.log(
                            "ℹ️ Shop collector đã kết thúc."
                        );
                    }
                }
            );


            return;
        }


        // =================================================
        // 🛍️ /CUAHANG MUA
        // =================================================

        if (
            subcommand === "mua"
        ) {

            const itemId =
                interaction.options.getString(
                    "id"
                );


            if (
                !itemId ||
                !itemId.trim()
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa nhập ID vật phẩm.",

                    ephemeral:
                        true
                });
            }


            return buyItem(
                interaction,
                itemId.trim()
            );
        }


    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi /cuahang:",
            error
        );


        try {

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return;
            }


            await interaction.reply({

                content:
                    "❌ Đã xảy ra lỗi khi mở cửa hàng.",

                ephemeral:
                    true
            });

        } catch (
            replyError
        ) {

            console.error(
                "❌ Không thể gửi phản hồi lỗi:",
                replyError
            );
        }
    }
}


// =====================================================
// 🔘 HANDLE BUTTON
// =====================================================
//
// Giữ lại hàm này để index.js cũ của bot vẫn có thể
// gọi được nếu đang có hệ thống interaction chung.
// =====================================================

async function handleButton(
    interaction
) {

    if (
        !interaction.isButton()
    ) {

        return false;
    }


    const customId =
        interaction.customId;


    // Không phải button của shop
    if (
        !customId.startsWith(
            "shop_"
        )
    ) {

        return false;
    }


    try {

        // ---------------------------------------------
        // 🔙 Hệ thống button cũ không có session
        // ---------------------------------------------

        if (
            customId ===
            "shop_home"
        ) {

            const {
                embed,
                data: shopData
            } =
                createShopEmbed(
                    1
                );


            const buttons =
                createShopButtons(
                    shopData.page,
                    shopData.totalPages
                );


            await interaction.update({

                embeds: [
                    embed
                ],

                components: [
                    buttons
                ]
            });


            return true;
        }


        // ---------------------------------------------
        // 📖 Button trang cũ
        // ---------------------------------------------

        if (
            customId.startsWith(
                "shop_page_"
            )
        ) {

            const page =
                Number(
                    customId.replace(
                        "shop_page_",
                        ""
                    )
                );


            if (
                !Number.isInteger(
                    page
                )
            ) {

                await interaction.reply({

                    content:
                        "❌ Trang không hợp lệ.",

                    ephemeral:
                        true
                });

                return true;
            }


            const {
                embed,
                data: shopData
            } =
                createShopEmbed(
                    page
                );


            const buttons =
                createShopButtons(
                    shopData.page,
                    shopData.totalPages
                );


            await interaction.update({

                embeds: [
                    embed
                ],

                components: [
                    buttons
                ]
            });


            return true;
        }


        // ---------------------------------------------
        // 🔒 Button session mới
        // ---------------------------------------------
        //
        // Các button dạng:
        //
        // shop_USERID_TIMESTAMP_home
        // shop_USERID_TIMESTAMP_page_2
        //
        // được Collector trong execute() xử lý.
        //
        // Nếu index.js bắt trước Collector thì bỏ qua
        // để tránh xử lý trùng.
        // ---------------------------------------------

        const sessionPattern =
            /^shop_[0-9]+_[0-9]+_(home|page_[0-9]+)$/;


        if (
            sessionPattern.test(
                customId
            )
        ) {

            return false;
        }


        return false;

    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi handleButton cửa hàng:",
            error
        );


        try {

            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                await interaction.reply({

                    content:
                        "❌ Không thể xử lý nút cửa hàng.",

                    ephemeral:
                        true
                });
            }

        } catch (
            replyError
        ) {

            console.error(
                "❌ Reply error:",
                replyError
            );
        }


        return true;
    }
}
// =====================================================
// 🔘 HANDLE INTERACTION
// =====================================================

async function handleInteraction(
    interaction
) {

    if (
        !interaction.isButton()
    ) {
        return false;
    }

    return handleButton(
        interaction
    );
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


            stats.total +=
                count;


            if (
                stats[
                    category
                ] !== undefined
            ) {

                stats[
                    category
                ] += count;
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

    if (
        !keyword
    ) {

        return [];
    }


    const key =
        String(keyword)
            .toLowerCase()
            .trim();


    return getAllShopItems()
        .filter(
            item => {

                const name =
                    String(
                        item.name || ""
                    )
                        .toLowerCase();


                const itemId =
                    String(
                        item.id || ""
                    )
                        .toLowerCase();


                const readableId =
                    makeItemId(
                        item.name
                    );


                return (
                    name.includes(
                        key
                    ) ||

                    itemId.includes(
                        key
                    ) ||

                    readableId.includes(
                        key
                    )
                );
            }
        );
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

            const items =
                SHOP[shop][category];


            if (
                !items ||
                typeof items !==
                "object"
            ) {

                errors.push(
                    `${shop}/${category}: dữ liệu không hợp lệ`
                );

                continue;
            }


            for (
                const [
                    id,
                    item
                ]
                of Object.entries(
                    items
                )
            ) {

                if (
                    !item
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: item rỗng`
                    );

                    continue;
                }


                if (
                    !item.name
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: thiếu tên`
                    );
                }


                if (
                    typeof item.cost !==
                    "number"
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: giá không hợp lệ`
                    );
                }


                if (
                    typeof item.requiredRealm !==
                    "number"
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: cảnh giới không hợp lệ`
                    );
                }


                if (
                    item.requiredRealm <
                    0 ||
                    item.requiredRealm >=
                    REALMS.length
                ) {

                    errors.push(
                        `${shop}/${category}/${id}: cảnh giới nằm ngoài phạm vi`
                    );
                }
            }
        }
    }


    return errors;
}


// =====================================================
// 📦 LẤY VẬT PHẨM THEO SHOP
// =====================================================

function getShopItems(
    shopName
) {

    if (
        !SHOP[shopName]
    ) {

        return [];
    }


    const result = [];


    for (
        const category
        of Object.keys(
            SHOP[shopName]
        )
    ) {

        for (
            const item
            of Object.values(
                SHOP[shopName][category]
            )
        ) {

            result.push({
                ...item,

                shop:
                    shopName,

                category
            });
        }
    }


    return result;
}


// =====================================================
// 📚 LẤY TÊN SHOP
// =====================================================

function getShopName(
    shopName
) {

    return (
        SHOPS[shopName]?.name ||
        shopName
    );
}


// =====================================================
// 📖 LẤY THÔNG TIN TRANG
// =====================================================

function getPageInfo(
    page = 1,
    pageSize = 12
) {

    const data =
        getShopPage(
            page,
            pageSize
        );


    return {

        currentPage:
            data.page,

        totalPages:
            data.totalPages,

        totalItems:
            data.totalItems,

        pageSize,

        hasPrevious:
            data.page > 1,

        hasNext:
            data.page <
            data.totalPages
    };
}


// =====================================================
// 🛒 KIỂM TRA ITEM CÓ TỒN TẠI
// =====================================================

function itemExists(
    itemId
) {

    return Boolean(
        findItem(
            itemId
        ) ||
        findItemByReadableId(
            itemId
        )
    );
}


// =====================================================
// 💰 ĐỊNH DẠNG GIÁ
// =====================================================

function formatPrice(
    price
) {

    return `${Number(
        price || 0
    ).toLocaleString()} 💎`;
}


// =====================================================
// 🌌 ĐỊNH DẠNG CẢNH GIỚI
// =====================================================

function formatRealm(
    realmIndex
) {

    return (
        REALMS[
            Number(
                realmIndex
            )
        ] ||
        "Phàm Nhân"
    );
}


// =====================================================
// 🆔 LẤY ID HIỂN THỊ
// =====================================================

function getDisplayItemId(
    item
) {

    if (
        item.id &&
        !String(
            item.id
        ).startsWith(
            "cp-"
        ) &&
        !String(
            item.id
        ).startsWith(
            "dd-"
        ) &&
        !String(
            item.id
        ).startsWith(
            "lt-"
        ) &&
        !String(
            item.id
        ).startsWith(
            "pb-"
        ) &&
        !String(
            item.id
        ).startsWith(
            "bv-"
        ) &&
        !String(
            item.id
        ).startsWith(
            "db-"
        )
    ) {

        return item.id;
    }


    return makeItemId(
        item.name
    );
}


// =====================================================
// 🧹 DỌN DỮ LIỆU ITEM
// =====================================================

function normalizeItem(
    item
) {

    if (
        !item
    ) {

        return null;
    }


    return {

        ...item,

        id:
            item.id ||
            makeItemId(
                item.name
            ),

        name:
            item.name ||
            "Vật phẩm không tên",

        requiredRealm:
            Number(
                item.requiredRealm || 0
            ),

        cost:
            Number(
                item.cost || 0
            ),

        rarity:
            item.rarity ||
            "⚪ Phàm",

        effect:
            item.effect ||
            {}
    };
}


// =====================================================
// 📦 CHUẨN HÓA TOÀN BỘ SHOP
// =====================================================

function normalizeShopData() {

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

            const items =
                SHOP[shop][category];


            for (
                const id
                of Object.keys(
                    items
                )
            ) {

                const normalized =
                    normalizeItem(
                        items[id]
                    );


                if (
                    normalized
                ) {

                    items[id] =
                        normalized;
                }
            }
        }
    }
}


// Chạy chuẩn hóa một lần
normalizeShopData();


// =====================================================
// 🧪 VALIDATE KHI KHỞI ĐỘNG
// =====================================================

const shopErrors =
    validateShop();


if (
    shopErrors.length > 0
) {

    console.warn(
        "⚠️ SHOP CÓ LỖI:"
    );


    shopErrors
        .slice(
            0,
            20
        )
        .forEach(
            error => {

                console.warn(
                    " -",
                    error
                );
            }
        );


    if (
        shopErrors.length >
        20
    ) {

        console.warn(
            `... và ${
                shopErrors.length - 20
            } lỗi khác.`
        );
    }

} else {

    const stats =
        getShopStats();


    console.log(
        `✅ Cửa hàng đã tải: ${stats.total} vật phẩm`
    );
}


// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {

    // ---------------------------------------------
    // Slash Command
    // ---------------------------------------------

    data,

    execute,


    // ---------------------------------------------
    // Interaction / Button
    // ---------------------------------------------

    handleButton,

    handleInteraction,


    // ---------------------------------------------
    // Database / Shop
    // ---------------------------------------------

    SHOP,

    SHOPS,

    REALMS,

    RARITIES,


    // ---------------------------------------------
    // Item
    // ---------------------------------------------

    findItem,

    findItemByReadableId,

    getAllShopItems,

    getShopItems,

    itemExists,


    // ---------------------------------------------
    // Pagination
    // ---------------------------------------------

    getShopPage,

    getPageInfo,


    // ---------------------------------------------
    // Search
    // ---------------------------------------------

    searchItems,


    // ---------------------------------------------
    // Statistics
    // ---------------------------------------------

    getShopStats,

    validateShop,


    // ---------------------------------------------
    // UI
    // ---------------------------------------------

    createShopEmbed,

    createShopButtons,


    // ---------------------------------------------
    // Purchase
    // ---------------------------------------------

    buyItem,


    // ---------------------------------------------
    // Helpers
    // ---------------------------------------------

    makeItemId,

    getDisplayItemId,

    formatPrice,

    formatRealm,

    getShopName,

    normalizeItem
};
