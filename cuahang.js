const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// 🏪 CỬA HÀNG HỒNG HOANG
// =====================================================
// 6 DANH MỤC:
// 💊 Đan dược
// 🎁 Vật phẩm
// 🐉 Linh thú
// 📜 Công pháp
// ⚔️ Pháp bảo
// 🧿 Bùa chú
//
// + ☠️ Công pháp Ma Đạo
// + ⚔️ Pháp bảo Ma Đạo
// + 💊 Đan dược Ma Đạo
// + 🧬 Đan Đổi Linh Căn = 10.000.000 LT
// + 💠 Đan Đổi Thể Chất = 10.000.000 LT
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
// ☠️ 18 CẢNH GIỚI MA ĐẠO
// =====================================================

const MA_DAO_REALMS = [
    "Ma Đồ",
    "Ma Tu",
    "Ma Sư",
    "Đại Ma Sư",
    "Ma Tướng",
    "Ma Vương",
    "Ma Hoàng",
    "Ma Tôn",
    "Ma Thánh",
    "Ma Đế",
    "Thiên Ma",
    "Cửu U Ma",
    "Tu La Ma",
    "Hỗn Độn Ma",
    "Ma Tổ",
    "Ma Đạo Thánh Nhân",
    "Ma Đạo Thiên Đạo",
    "Ma Đạo Chí Tôn"
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
// 🏪 4 SHOP CŨ
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
// 📜 CÔNG PHÁP HỒNG HOANG
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
// ☠️ CÔNG PHÁP MA ĐẠO
// =====================================================

const MA_DAO_CONG_PHAP = [
    "Huyết Ma Kinh",
    "Cửu U Ma Kinh",
    "La Sát Ma Công",
    "Vạn Hồn Ma Điển",
    "Phệ Hồn Đại Pháp",
    "Ma Long Thôn Thiên Công",
    "Thiên Ma Cửu Biến",
    "Tu La Huyết Công",
    "Cửu U Phệ Thiên Công",
    "Huyết Hải Ma Công",
    "Vạn Ma Quy Tông",
    "Thôn Thiên Ma Công",
    "Diệt Thế Ma Công",
    "Hắc Ám Ma Điển",
    "Cửu Thiên Ma Quyết",
    "Hỗn Độn Ma Điển",
    "Ma Đế Kinh",
    "Ma Tổ Chân Kinh",
    "Ma Đạo Thánh Kinh",
    "Ma Đạo Thủy Tổ Kinh"
];


// =====================================================
// 💊 ĐAN DƯỢC HỒNG HOANG
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
// ☠️ ĐAN DƯỢC MA ĐẠO
// =====================================================

const MA_DAO_DAN_DUOC = [
    {
        id: "ma_huyet_dan",
        name: "🩸 Ma Huyết Đan",
        rarity: "🔵 Huyền",
        cost: 50000,
        requiredRealm: 0,
        effect: {
            hp: 5000,
            cong: 300
        }
    },

    {
        id: "cuu_u_ma_dan",
        name: "🌑 Cửu U Ma Đan",
        rarity: "🟣 Địa",
        cost: 300000,
        requiredRealm: 2,
        effect: {
            hp: 20000,
            cong: 1000,
            thu: 500
        }
    },

    {
        id: "phe_hon_ma_dan",
        name: "👻 Phệ Hồn Ma Đan",
        rarity: "🟠 Thiên",
        cost: 1000000,
        requiredRealm: 4,
        effect: {
            cong: 5000,
            thu: 2000,
            tuvi: 50000
        }
    },

    {
        id: "thien_ma_dan",
        name: "😈 Thiên Ma Đan",
        rarity: "🔴 Tiên",
        cost: 5000000,
        requiredRealm: 8,
        effect: {
            cong: 20000,
            thu: 10000,
            tuvi: 200000
        }
    },

    {
        id: "hon_don_ma_dan",
        name: "🌌 Hỗn Độn Ma Đan",
        rarity: "🌌 Hỗn Độn",
        cost: 50000000,
        requiredRealm: 14,
        effect: {
            cong: 100000,
            thu: 80000,
            tuvi: 1000000
        }
    },

    {
        id: "dan_doi_linh_can",
        name: "🧬 Đan Đổi Linh Căn",
        rarity: "⭐ Đại Đạo",
        cost: 10000000,
        requiredRealm: 0,
        effect: {
            special: "doi_linh_can"
        }
    },

    {
        id: "dan_doi_the_chat",
        name: "💠 Đan Đổi Thể Chất",
        rarity: "⭐ Đại Đạo",
        cost: 10000000,
        requiredRealm: 0,
        effect: {
            special: "doi_the_chat"
        }
    }
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
// ⚔️ PHÁP BẢO HỒNG HOANG
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
// ☠️ PHÁP BẢO MA ĐẠO
// =====================================================

const MA_DAO_PHAP_BAO = [
    "Ma Huyết Kiếm",
    "Cửu U Ma Đao",
    "La Sát Ma Kích",
    "Vạn Hồn Phiên",
    "Phệ Hồn Châu",
    "Ma Long Kiếm",
    "Tu La Huyết Nhận",
    "Thiên Ma Tháp",
    "Huyết Hải Ma Kỳ",
    "Cửu U Ma Quan",
    "Vạn Ma Phiên",
    "Diệt Thế Ma Đao",
    "Hắc Ám Ma Chung",
    "Cửu Thiên Ma Kiếm",
    "Ma Đế Chi Nhận",
    "Ma Tổ Huyết Kiếm",
    "Ma Đạo Thánh Binh",
    "Hỗn Độn Ma Kiếm",
    "Ma Đạo Thủy Tổ Đỉnh",
    "Vô Thượng Ma Binh"
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
// 🧿 BÙA CHÚ
// =====================================================

const BUA_CHU_NAMES = [
    "Bùa Tăng Công",
    "Bùa Tăng Thủ",
    "Bùa Hộ Mệnh",
    "Bùa Tụ Linh",
    "Bùa Hộ Thần",
    "Bùa Cuồng Chiến",
    "Bùa Phệ Hồn",
    "Bùa Ma Khí",
    "Bùa Thiên Ma",
    "Bùa Cửu U",
    "Bùa Tu La",
    "Bùa Huyết Hải",
    "Bùa Vạn Hồn",
    "Bùa Diệt Hồn",
    "Bùa Diệt Thế",
    "Bùa Hỗn Độn",
    "Bùa Ma Đế",
    "Bùa Ma Tổ",
    "Bùa Thủy Tổ",
    "Bùa Ma Đạo Chí Tôn"
];


// =====================================================
// 🏪 SHOP
// =====================================================

const SHOP = {
    thuong: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {},
        buaChu: {}
    },

    tien: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {},
        buaChu: {}
    },

    thanh: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {},
        buaChu: {}
    },

    daidao: {
        congPhap: {},
        danDuoc: {},
        linhThu: {},
        phapBao: {},
        baoVat: {},
        dacBiet: {},
        buaChu: {}
    }
};


// =====================================================
// 🏷️ TÊN DANH MỤC
// =====================================================

const CATEGORY_NAME = {
    danDuoc: "💊 Đan dược",
    vatPham: "🎁 Vật phẩm",
    linhThu: "🐉 Linh thú",
    congPhap: "📜 Công pháp",
    phapBao: "⚔️ Pháp bảo",
    buaChu: "🧿 Bùa chú"
};


// =====================================================
// 🎯 THÊM ITEM
// =====================================================

function addItem(
    shop,
    category,
    id,
    name,
    requiredRealm,
    rarity,
    cost,
    effect = {},
    extra = {}
) {
    if (!SHOP[shop]) return;

    if (!SHOP[shop][category]) {
        SHOP[shop][category] = {};
    }

    SHOP[shop][category][id] = {
        id,
        name,
        requiredRealm,
        rarity,
        cost,
        effect,

        bonus:
            Number(effect.cong || 0),

        hpBonus:
            Number(effect.hp || 0),

        congBonus:
            Number(effect.cong || 0),

        thuBonus:
            Number(effect.thu || 0),

        tuviBonus:
            Number(effect.tuvi || 0),

        linhLucBonus:
            Number(effect.linhLuc || 0),

        ...extra
    };
}


// =====================================================
// 🆔 TẠO ID
// =====================================================

function makeItemId(name) {
    return String(name || "")
        .replace(/^[^\wÀ-ỹ]+\s*/, "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}


// =====================================================
// ⭐ TẠO SHOP
// =====================================================

function generateShop() {

    let counter = 1;

    for (const shop of Object.keys(SHOPS)) {

        const config = SHOPS[shop];

        // =================================================
        // 📜 CÔNG PHÁP HỒNG HOANG
        // =================================================

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
                            Math.floor(realm / 2)
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
                        cong: (realm + 1) * 100,
                        thu: (realm + 1) * 30,
                        tuvi: (realm + 1) * 1000
                    }
                );
            }
        );


        // =================================================
        // ☠️ CÔNG PHÁP MA ĐẠO
        // =================================================

        MA_DAO_CONG_PHAP.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 3)
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
                        10000,
                        Math.floor(
                            config.price *
                            (i + 1) *
                            5
                        )
                    );

                addItem(
                    shop,
                    "congPhap",
                    `mdcp-${shop}-${counter++}`,
                    `☠️ ${baseName}`,
                    realm,
                    rarity,
                    cost,
                    {
                        cong:
                            (realm + 1) * 180,

                        thu:
                            (realm + 1) * 70,

                        tuvi:
                            (realm + 1) * 1800
                    },
                    {
                        maDao: true
                    }
                );
            }
        );


        // =================================================
        // 💊 ĐAN DƯỢC HỒNG HOANG
        // =================================================

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


        // =================================================
        // ☠️ ĐAN DƯỢC MA ĐẠO
        // =================================================

        MA_DAO_DAN_DUOC.forEach(
            (item, i) => {

                addItem(
                    shop,
                    "danDuoc",
                    `${item.id}-${shop}-${counter++}`,
                    item.name,
                    Math.min(
                        config.maxRealm,
                        item.requiredRealm
                    ),
                    item.rarity,
                    Math.max(
                        item.cost,
                        config.price
                    ),
                    item.effect,
                    {
                        maDao: true,
                        special:
                            item.effect.special || null
                    }
                );
            }
        );


        // =================================================
        // 🐉 LINH THÚ
        // =================================================

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
            }
        );


        // =================================================
        // ⚔️ PHÁP BẢO HỒNG HOANG
        // =================================================

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
            }
        );


        // =================================================
        // ☠️ PHÁP BẢO MA ĐẠO
        // =================================================

        MA_DAO_PHAP_BAO.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 3)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(realm / 2)
                        )
                    ];

                const bonus =
                    (realm + 1) * 70;

                const cost =
                    Math.max(
                        20000,
                        Math.floor(
                            config.price *
                            (i + 1) *
                            8
                        )
                    );

                addItem(
                    shop,
                    "phapBao",
                    `mdpb-${shop}-${counter++}`,
                    `☠️ ${baseName}`,
                    realm,
                    rarity,
                    cost,
                    {
                        cong:
                            bonus * 2,

                        thu:
                            bonus,

                        hp:
                            bonus * 15
                    },
                    {
                        maDao: true
                    }
                );
            }
        );


        // =================================================
        // 🌿 BẢO VẬT
        // =================================================

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
                        tuvi:
                            (realm + 1) * 1000,

                        linhLuc:
                            (realm + 1) * 100
                    }
                );
            }
        );


        // =================================================
        // 🎁 VẬT PHẨM ĐẶC BIỆT
        // =================================================

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
                        tuvi:
                            (realm + 1) * 2000,

                        cong:
                            (realm + 1) * 50
                    }
                );
            }
        );


        // =================================================
        // 🧿 BÙA CHÚ
        // =================================================

        BUA_CHU_NAMES.forEach(
            (baseName, i) => {

                const realm =
                    Math.min(
                        config.maxRealm,
                        config.minRealm +
                        Math.floor(i / 3)
                    );

                const rarity =
                    RARITIES[
                        Math.min(
                            8,
                            Math.floor(realm / 2)
                        )
                    ];

                const bonus =
                    (realm + 1) * 30;

                const cost =
                    Math.max(
                        1000,
                        Math.floor(
                            config.price *
                            (i + 1) *
                            3
                        )
                    );

                addItem(
                    shop,
                    "buaChu",
                    `bc-${shop}-${counter++}`,
                    `🧿 ${baseName}`,
                    realm,
                    rarity,
                    cost,
                    {
                        cong: bonus,
                        thu: bonus,
                        hp: bonus * 3,
                        tuvi: (realm + 1) * 300
                    }
                );
            }
        );
    }
}


// =====================================================
// 🚀 TẠO SHOP
// =====================================================

generateShop();


// =====================================================
// 🔍 TÌM ITEM THEO ID
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
        const shop of Object.keys(SHOP)
    ) {

        for (
            const category of Object.keys(
                SHOP[shop]
            )
        ) {

            const items =
                SHOP[shop][category];

            for (
                const id of Object.keys(items)
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
// 🔎 TÌM ID ĐẸP
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

    for (
        const shop of Object.keys(SHOP)
    ) {

        for (
            const category of Object.keys(
                SHOP[shop]
            )
        ) {

            for (
                const item of Object.values(
                    SHOP[shop][category]
                )
            ) {

                const generated =
                    makeItemId(
                        item.name
                    );

                if (
                    generated ===
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
// 📦 TẤT CẢ ITEM
// =====================================================

function getAllShopItems() {

    const result = [];

    for (
        const shop of Object.keys(SHOP)
    ) {

        for (
            const category of Object.keys(
                SHOP[shop]
            )
        ) {

            for (
                const item of Object.values(
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
// 🏷️ ĐỔI CATEGORY GỐC THÀNH 6 SHOP
// =====================================================

function getDisplayCategory(item) {

    if (
        item.category === "baoVat" ||
        item.category === "dacBiet"
    ) {

        return "vatPham";
    }

    return item.category;
}


// =====================================================
// 📖 LỌC THEO 6 SHOP
// =====================================================

function getCategoryItems(
    category
) {

    return getAllShopItems()
        .filter(
            item =>
                getDisplayCategory(item) ===
                category
        );
}


// =====================================================
// 📄 PHÂN TRANG
// =====================================================

function getCategoryPage(
    category = "danDuoc",
    page = 1,
    pageSize = 6
) {

    const items =
        getCategoryItems(
            category
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
                Number(page) || 1,
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
            items.length,

        category
    };
}


// =====================================================
// ✨ HIỂN THỊ TÁC DỤNG
// =====================================================

function getEffectText(
    item
) {

    const effect =
        item.effect || {};

    const lines = [];

    if (effect.tuvi) {

        lines.push(
            `🌀 Tu Vi: **+${Number(effect.tuvi).toLocaleString()}**`
        );
    }

    if (effect.cong) {

        lines.push(
            `⚔️ Công: **+${Number(effect.cong).toLocaleString()}**`
        );
    }

    if (effect.thu) {

        lines.push(
            `🛡️ Thủ: **+${Number(effect.thu).toLocaleString()}**`
        );
    }

    if (effect.hp) {

        lines.push(
            `❤️ HP: **+${Number(effect.hp).toLocaleString()}**`
        );
    }

    if (effect.linhLuc) {

        lines.push(
            `✨ Linh Lực: **+${Number(effect.linhLuc).toLocaleString()}**`
        );
    }

    if (
        effect.special ===
        "doi_linh_can"
    ) {

        lines.push(
            "🧬 **Đổi Linh Căn ngẫu nhiên**"
        );
    }

    if (
        effect.special ===
        "doi_the_chat"
    ) {

        lines.push(
            "💠 **Đổi Thể Chất ngẫu nhiên**"
        );
    }

    if (
        item.maDao
    ) {

        lines.push(
            "☠️ **Thuộc hệ thống Ma Đạo**"
        );
    }

    if (!lines.length) {

        lines.push(
            "📦 Vật phẩm đặc biệt"
        );
    }

    return lines.join("\n");
}


// =====================================================
// 🏪 TẠO EMBED SHOP
// =====================================================

function createCategoryShopEmbed(
    category = "danDuoc",
    page = 1
) {

    const data =
        getCategoryPage(
            category,
            page,
            6
        );

    let description =
        `💎 Thanh toán bằng **Linh Thạch**.\n\n`;

    if (
        !data.items.length
    ) {

        description +=
            "📦 Danh mục này hiện chưa có vật phẩm.";

    } else {

        data.items.forEach(
            (item, index) => {

                const readableId =
                    makeItemId(
                        item.name
                    );

                description +=
                    `### ${index + 1}. ${item.name}\n`;

                description +=
                    `🆔 \`${readableId}\`\n`;

                description +=
                    `${item.rarity}\n`;

                description +=
                    `🌌 Yêu cầu: **${
                        REALMS[item.requiredRealm] ||
                        "Phàm Nhân"
                    }**\n`;

                description +=
                    `💎 Giá: **${Number(item.cost).toLocaleString()} Linh Thạch**\n`;

                description +=
                    `✨ **Tác dụng:**\n`;

                description +=
                    `${getEffectText(item)}\n\n`;

                description +=
                    "━━━━━━━━━━━━━━\n\n";
            }
        );
    }

    const embed =
        new EmbedBuilder()
            .setColor(
                category === "congPhap"
                    ? 0x8e44ad
                    : category === "phapBao"
                        ? 0x34495e
                        : category === "danDuoc"
                            ? 0xe74c3c
                            : category === "linhThu"
                                ? 0x27ae60
                                : category === "buaChu"
                                    ? 0x9b59b6
                                    : 0xf39c12
            )
            .setTitle(
                `🏪 CỬA HÀNG HỒNG HOANG — ${
                    CATEGORY_NAME[category]
                }`
            )
            .setDescription(
                description
            )
            .setFooter({
                text:
                    `📖 Trang ${data.page}/${data.totalPages} • ${data.totalItems} vật phẩm`
            });

    return {
        embed,
        data
    };
}


// =====================================================
// 🔘 TẠO NÚT 6 SHOP
// =====================================================

function createCategoryButtons(
    category,
    page,
    totalPages,
    sessionId
) {

    const prefix =
        `shop_${sessionId}_`;

    const categories = [
        {
            id: "danDuoc",
            label: "💊 Đan dược"
        },
        {
            id: "vatPham",
            label: "🎁 Vật phẩm"
        },
        {
            id: "linhThu",
            label: "🐉 Linh thú"
        },
        {
            id: "congPhap",
            label: "📜 Công pháp"
        },
        {
            id: "phapBao",
            label: "⚔️ Pháp bảo"
        },
        {
            id: "buaChu",
            label: "🧿 Bùa chú"
        }
    ];

    const row1 =
        new ActionRowBuilder()
            .addComponents(
                categories
                    .slice(0, 3)
                    .map(
                        item =>
                            new ButtonBuilder()
                                .setCustomId(
                                    `${prefix}category_${item.id}`
                                )
                                .setLabel(
                                    item.label
                                )
                                .setStyle(
                                    item.id ===
                                    category
                                        ? ButtonStyle.Primary
                                        : ButtonStyle.Secondary
                                )
                    )
            );

    const row2 =
        new ActionRowBuilder()
            .addComponents(
                categories
                    .slice(3, 6)
                    .map(
                        item =>
                            new ButtonBuilder()
                                .setCustomId(
                                    `${prefix}category_${item.id}`
                                )
                                .setLabel(
                                    item.label
                                )
                                .setStyle(
                                    item.id ===
                                    category
                                        ? ButtonStyle.Primary
                                        : ButtonStyle.Secondary
                                )
                    )
            );

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
                "🏪 Trang đầu"
            )
            .setStyle(
                ButtonStyle.Success
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

    const row3 =
        new ActionRowBuilder()
            .addComponents(
                previous,
                home,
                next
            );

    return [
        row1,
        row2,
        row3
    ];
}


// =====================================================
// 💎 LINH THẠCH
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
// 🌌 CẢNH GIỚI
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

    const itemId =
        makeItemId(
            item.name
        );

    // ---------------------------------------------
    // Hệ thống túi dạng ARRAY
    // ---------------------------------------------

    if (
        Array.isArray(
            player.tuiDo
        )
    ) {

        const existing =
            player.tuiDo.find(
                x =>
                    x &&
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
                name: item.name,
                quantity: 1,
                rarity: item.rarity,
                requiredRealm:
                    item.requiredRealm,
                cost: item.cost,
                effect: item.effect
            });
        }

        return;
    }


    // ---------------------------------------------
    // Hệ thống túi dạng OBJECT
    // ---------------------------------------------

    if (
        !player.tuiDo ||
        typeof player.tuiDo !== "object"
    ) {

        player.tuiDo = {};
    }

    let type =
        getDisplayCategory(
            item
        );

    if (
        !Array.isArray(
            player.tuiDo[type]
        )
    ) {

        player.tuiDo[type] = [];
    }

    player.tuiDo[type].push(
        item.name
    );
}


// =====================================================
// ➕ CỘNG EFFECT
// =====================================================

function applyItemEffect(
    player,
    item
) {

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

        player.maxHp =
            Number(
                player.maxHp || 0
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
}


// =====================================================
// 🛒 MUA ITEM
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
                "💡 Dùng `/cuahang xem` để xem ID."
            ].join("\n"),
            ephemeral: true
        });
    }


    // =================================================
    // 🔒 KIỂM TRA CẢNH GIỚI
    // =================================================

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
                `🌌 Yêu cầu: **${
                    REALMS[item.requiredRealm]
                }**`,
                `👤 Hiện tại: **${
                    REALMS[playerRealm]
                }**`
            ].join("\n"),
            ephemeral: true
        });
    }


    // =================================================
    // 💎 KIỂM TRA LINH THẠCH
    // =================================================

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
                `💰 Giá: **${Number(item.cost).toLocaleString()}**`,
                `💎 Bạn có: **${money.toLocaleString()}**`,
                `❌ Thiếu: **${(
                    item.cost - money
                ).toLocaleString()}**`
            ].join("\n"),
            ephemeral: true
        });
    }


    // =================================================
    // 💰 TRỪ LINH THẠCH
    // =================================================

    player.linhThach =
        money -
        item.cost;


    // =================================================
    // 🎒 THÊM VÀO TÚI
    // =================================================

    addToInventory(
        player,
        item
    );


    // =================================================
    // ✨ KHÔNG TỰ KÍCH HOẠT 2 ĐAN ĐẶC BIỆT
    // =================================================

    const isSpecial =
        item.effect &&
        (
            item.effect.special ===
                "doi_linh_can" ||
            item.effect.special ===
                "doi_the_chat"
        );


    // =================================================
    // ➕ ITEM THƯỜNG CỘNG EFFECT
    // =================================================

    if (
        !isSpecial
    ) {

        applyItemEffect(
            player,
            item
        );
    }


    // =================================================
    // 💾 LƯU DATABASE
    // =================================================

    updatePlayer(
        userId,
        player
    );


    // =================================================
    // 🎉 THÔNG BÁO
    // =================================================

    let extra =
        "";

    if (
        item.effect &&
        item.effect.special ===
            "doi_linh_can"
    ) {

        extra =
            "\n🧬 **Đan này dùng để đổi Linh Căn.**\n" +
            "Hãy dùng lệnh đan dược hiện tại của bạn để sử dụng.";

    }

    if (
        item.effect &&
        item.effect.special ===
            "doi_the_chat"
    ) {

        extra =
            "\n💠 **Đan này dùng để đổi Thể Chất.**\n" +
            "Hãy dùng lệnh đan dược hiện tại của bạn để sử dụng.";
    }

    const embed =
        new EmbedBuilder()
            .setColor(
                item.maDao
                    ? 0x8b0000
                    : 0x8e44ad
            )
            .setTitle(
                "🎉 MUA HÀNG THÀNH CÔNG"
            )
            .setDescription([
                `🛍️ Đã mua: **${item.name}**`,
                "",
                `🆔 ID: \`${makeItemId(item.name)}\``,
                `💎 Đã trả: **${Number(item.cost).toLocaleString()} Linh Thạch**`,
                `💰 Còn lại: **${Number(player.linhThach).toLocaleString()} Linh Thạch**`,
                "",
                `✨ **Tác dụng:**`,
                getEffectText(item),
                "",
                "🎒 Vật phẩm đã được thêm vào túi đồ!",
                extra
            ].join("\n"));

    return interaction.reply({
        embeds: [
            embed
        ],
        ephemeral: true
    });
}


// =====================================================
// 📜 SLASH COMMAND
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
// ⚡ EXECUTE
// =====================================================

async function execute(
    interaction
) {

    try {

        const player =
            getPlayer(
                interaction.user.id
            );

        if (!player) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const subcommand =
            interaction.options.getSubcommand();


        // =================================================
        // 🏪 XEM SHOP
        // =================================================

        if (
            subcommand ===
            "xem"
        ) {

            const sessionId =
                `${interaction.user.id}_${Date.now()}`
                    .replace(
                        /[^a-zA-Z0-9_]/g,
                        ""
                    )
                    .slice(
                        -70
                    );

            let currentCategory =
                "danDuoc";

            let currentPage =
                1;

            const {
                embed,
                data: shopData
            } =
                createCategoryShopEmbed(
                    currentCategory,
                    currentPage
                );

            const buttons =
                createCategoryButtons(
                    currentCategory,
                    shopData.page,
                    shopData.totalPages,
                    sessionId
                );

            await interaction.reply({
                embeds: [
                    embed
                ],
                components:
                    buttons
            });

            const message =
                await interaction.fetchReply();


            // =================================================
            // 🎮 COLLECTOR
            // =================================================

            const collector =
                message.createMessageComponentCollector({
                    componentType:
                        ComponentType.Button,

                    time:
                        15 * 60 * 1000,

                    filter:
                        buttonInteraction =>
                            buttonInteraction.user.id ===
                                interaction.user.id &&
                            buttonInteraction.customId.startsWith(
                                `shop_${sessionId}_`
                            )
                });


            collector.on(
                "collect",
                async buttonInteraction => {

                    try {

                        const prefix =
                            `shop_${sessionId}_`;

                        const customId =
                            buttonInteraction.customId;


                        // =========================================
                        // 🏠 TRANG ĐẦU
                        // =========================================

                        if (
                            customId ===
                            `${prefix}home`
                        ) {

                            currentCategory =
                                "danDuoc";

                            currentPage =
                                1;
                        }


                        // =========================================
                        // 🔄 CHUYỂN CATEGORY
                        // =========================================

                        else if (
                            customId.startsWith(
                                `${prefix}category_`
                            )
                        ) {

                            currentCategory =
                                customId.replace(
                                    `${prefix}category_`,
                                    ""
                                );

                            currentPage =
                                1;
                        }


                        // =========================================
                        // ◀️ ▶️ CHUYỂN TRANG
                        // =========================================

                        else if (
                            customId.startsWith(
                                `${prefix}page_`
                            )
                        ) {

                            const page =
                                Number(
                                    customId.replace(
                                        `${prefix}page_`,
                                        ""
                                    )
                                );

                            if (
                                !Number.isInteger(
                                    page
                                )
                            ) {

                                return buttonInteraction.reply({
                                    content:
                                        "❌ Trang không hợp lệ.",
                                    ephemeral: true
                                });
                            }

                            currentPage =
                                page;
                        }


                        else {

                            return;
                        }


                        // =========================================
                        // 🔄 RENDER
                        // =========================================

                        const {
                            embed: nextEmbed,
                            data: nextData
                        } =
                            createCategoryShopEmbed(
                                currentCategory,
                                currentPage
                            );

                        currentPage =
                            nextData.page;

                        const nextButtons =
                            createCategoryButtons(
                                currentCategory,
                                nextData.page,
                                nextData.totalPages,
                                sessionId
                            );

                        await buttonInteraction.update({
                            embeds: [
                                nextEmbed
                            ],
                            components:
                                nextButtons
                        });

                    } catch (error) {

                        console.error(
                            "❌ Lỗi UI cửa hàng:",
                            error
                        );

                        try {

                            if (
                                !buttonInteraction.replied &&
                                !buttonInteraction.deferred
                            ) {

                                await buttonInteraction.reply({
                                    content:
                                        "❌ Cửa hàng gặp lỗi.",
                                    ephemeral: true
                                });
                            }

                        } catch (_) {}
                    }
                }
            );


            // =================================================
            // ⏰ HẾT THỜI GIAN
            // =================================================

            collector.on(
                "end",
                async () => {

                    try {

                        const {
                            data: finalData
                        } =
                            createCategoryShopEmbed(
                                currentCategory,
                                currentPage
                            );

                        const disabledButtons =
                            createCategoryButtons(
                                currentCategory,
                                finalData.page,
                                finalData.totalPages,
                                sessionId
                            );

                        for (
                            const row of disabledButtons
                        ) {

                            for (
                                const button of row.components
                            ) {

                                button.setDisabled(
                                    true
                                );
                            }
                        }

                        await message.edit({
                            components:
                                disabledButtons
                        });

                    } catch (_) {}
                }
            );

            return;
        }


        // =================================================
        // 🛒 MUA
        // =================================================

        if (
            subcommand ===
            "mua"
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

    } catch (error) {

        console.error(
            "❌ Lỗi /cuahang:",
            error
        );

        if (
            interaction.replied ||
            interaction.deferred
        ) {

            return;
        }

        return interaction.reply({
            content:
                "❌ Đã xảy ra lỗi khi mở cửa hàng.",
            ephemeral: true
        });
    }
}


// =====================================================
// 🔘 HANDLE BUTTON
// =====================================================
// Giữ để tương thích với index.js nếu index.js
// chuyển Button Interaction vào cuahang.js.
// =====================================================

async function handleButton(
    interaction
) {

    if (
        !interaction.isButton()
    ) {

        return false;
    }

    const id =
        interaction.customId || "";

    // Các button session được collector xử lý
    if (
        id.startsWith(
            "shop_"
        )
    ) {

        return false;
    }

    return false;
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

        return null;
    }

    return handleButton(
        interaction
    );
}


// =====================================================
// 📊 THỐNG KÊ
// =====================================================

function getShopStats() {

    const stats = {
        total: 0,
        congPhap: 0,
        danDuoc: 0,
        linhThu: 0,
        phapBao: 0,
        baoVat: 0,
        dacBiet: 0,
        buaChu: 0,
        vatPham: 0
    };

    for (
        const shop of Object.keys(
            SHOP
        )
    ) {

        for (
            const category of Object.keys(
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
                stats[category] !==
                undefined
            ) {

                stats[category] +=
                    count;
            }

            if (
                category ===
                    "baoVat" ||
                category ===
                    "dacBiet"
            ) {

                stats.vatPham +=
                    count;
            }
        }
    }

    return stats;
}


// =====================================================
// 🔎 TÌM KIẾM
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
        .filter(
            item => {

                const name =
                    item.name
                        .toLowerCase();

                const id =
                    makeItemId(
                        item.name
                    );

                return (
                    name.includes(key) ||
                    id.includes(key)
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
        const shop of Object.keys(
            SHOP
        )
    ) {

        for (
            const category of Object.keys(
                SHOP[shop]
            )
        ) {

            for (
                const [
                    id,
                    item
                ] of Object.entries(
                    SHOP[shop][category]
                )
            ) {

                if (
                    !item.name
                ) {

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

                if (
                    !item.effect
                ) {

                    errors.push(
                        `${id}: thiếu effect`
                    );
                }
            }
        }
    }

    return errors;
}


// =====================================================
// 📦 GET PAGE CŨ - TƯƠNG THÍCH
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
                Number(page) || 1,
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
// 🏪 CREATE SHOP EMBED CŨ
// =====================================================

function createShopEmbed(
    page = 1
) {

    return createCategoryShopEmbed(
        "danDuoc",
        page
    );
}


// =====================================================
// 🔘 CREATE BUTTON CŨ
// =====================================================

function createShopButtons(
    page,
    totalPages
) {

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

    return new ActionRowBuilder()
        .addComponents(
            previous,
            home,
            next
        );
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

    // Shop
    SHOP,
    SHOPS,

    // Items
    findItem,
    findItemByReadableId,
    getAllShopItems,

    // Pagination
    getShopPage,
    getCategoryPage,

    // Search
    searchItems,

    // Stats
    getShopStats,

    // Validation
    validateShop,

    // UI
    createShopEmbed,
    createShopButtons,
    createCategoryShopEmbed,
    createCategoryButtons,

    // Purchase
    buyItem,

    // ID
    makeItemId,

    // Category
    getCategoryItems,

    // Effects
    getEffectText,

    // Realm
    getRealmIndex,

    // Inventory
    addToInventory
};
