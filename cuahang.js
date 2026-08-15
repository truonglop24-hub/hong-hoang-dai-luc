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

// ============================================================
// CẢNH GIỚI
// ============================================================

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

// ============================================================
// SHOP
// ============================================================

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

const SHOP_NAME = {
    thuong: "🏪 Thường",
    tien: "☁️ Tiên",
    thanh: "👑 Thánh",
    daidao: "🌌 Đại Đạo"
};

// ============================================================
// DANH MỤC
// ============================================================

const SHOP_CATEGORIES = {

    danDuoc: {
        name: "🧪 ĐAN DƯỢC",
        keys: ["dan"]
    },

    vatPham: {
        name: "🎒 VẬT PHẨM",
        keys: [
            "congPhap",
            "dacBiet"
        ]
    },

    linhThu: {
        name: "🐉 LINH THÚ",
        keys: ["linhThu"]
    },

    phapBao: {
        name: "⚱️ PHÁP BẢO",
        keys: ["phapBao"]
    },

    maDao: {
        name: "😈 MA ĐẠO",
        keys: [
            "maDaoCongPhap",
            "maDaoPhapBao"
        ]
    },

    yeuDao: {
        name: "🐺 YÊU ĐẠO",
        keys: [
            "yeuCongPhap",
            "yeuPhapBao"
        ]
    }
};

// ============================================================
// CÔNG PHÁP CHÍNH ĐẠO
// ============================================================

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

// ============================================================
// CÔNG PHÁP YÊU ĐẠO
// ============================================================

const YEU_CONG_PHAP_NAMES = [
    "Hoàng Huyết Luyện Thể Quyết",
    "Thanh Mộc Yêu Kinh",
    "Thiên Hồ Mị Công",
    "Kim Sí Đại Bằng Quyết",
    "Thôn Thiên Yêu Công",
    "Cửu Vĩ Thiên Hồ Kinh",
    "Huyết Long Yêu Kinh",
    "Thái Cổ Yêu Thần Quyết",
    "Vạn Yêu Đạo Kinh",
    "Hỗn Độn Yêu Kinh"
];

// ============================================================
// CÔNG PHÁP MA ĐẠO
// ============================================================

const MA_DAO_CONG_PHAP_NAMES = [
    "Huyết Ma Công",
    "Thiên Ma Luyện Thể Quyết",
    "U Minh Ma Kinh",
    "Thôn Hồn Ma Công",
    "Cửu U Ma Kinh",
    "Huyết Ngục Ma Kinh",
    "Vạn Ma Tâm Kinh",
    "Thiên Ma Đại Pháp",
    "Hỗn Độn Ma Kinh",
    "Vô Thượng Ma Đạo"
];

// ============================================================
// ĐAN DƯỢC CHÍNH ĐẠO
// ============================================================

const CHINH_DAO_DAN = [
    "Chính Khí Đan",
    "Thanh Tâm Đan",
    "Hộ Mạch Đan",
    "Kim Cang Đan",
    "Thái Thanh Đan",
    "Cửu Chuyển Chính Khí Đan",
    "Thiên Đạo Chính Khí Đan",
    "Thánh Tâm Đan"
];

// ============================================================
// ĐAN DƯỢC MA ĐẠO
// ============================================================

const MA_DAO_DAN = [
    "Huyết Ma Đan",
    "Ma Tâm Đan",
    "Thôn Hồn Đan",
    "Huyết Sát Đan",
    "Cửu U Ma Đan",
    "Huyết Ngục Ma Đan",
    "Thiên Ma Đan",
    "Vạn Ma Đế Đan",
    "Hỗn Độn Ma Đan",
    "Vô Thượng Ma Đan"
];

// ============================================================
// ĐAN DƯỢC YÊU ĐẠO
// ============================================================

const YEU_DAO_DAN = [
    "Yêu Huyết Đan",
    "Yêu Tủy Đan",
    "Hoàng Huyết Đan",
    "Thanh Mộc Yêu Đan",
    "Kim Sí Yêu Đan",
    "Cửu Vĩ Yêu Đan",
    "Huyết Long Yêu Đan",
    "Thái Cổ Yêu Đan",
    "Vạn Yêu Đế Đan",
    "Hỗn Độn Yêu Đan"
];

// ============================================================
// PHÁP BẢO CHÍNH ĐẠO
// ============================================================

const PHAP_BAO_NAMES = [
    "Thanh Phong Kiếm",
    "Huyền Thiết Kiếm",
    "Tử Vân Kiếm",
    "Bích Ngọc Kiếm",
    "Cửu Thiên Kiếm",
    "Thiên Lôi Kiếm",
    "Huyền Thiên Kiếm",
    "Thái Cực Kiếm",
    "Thanh Liên Kiếm",
    "Hồng Hoang Kiếm"
];

// ============================================================
// PHÁP BẢO YÊU ĐẠO
// ============================================================

const YEU_PHAP_BAO_NAMES = [
    "Thiên Yêu Côn",
    "Huyết Long Đao",
    "Cửu Vĩ Phiến",
    "Kim Sí Yêu Kiếm",
    "Thôn Thiên Yêu Đao",
    "Vạn Yêu Cổ",
    "Yêu Thần Kích",
    "Thái Cổ Yêu Thương"
];

// ============================================================
// PHÁP BẢO MA ĐẠO
// ============================================================

const MA_DAO_PHAP_BAO_NAMES = [
    "Huyết Ma Đao",
    "U Minh Ma Kiếm",
    "Thiên Ma Đao",
    "Cửu U Ma Kích",
    "Huyết Ngục Ma Kiếm",
    "Thôn Hồn Ma Đao",
    "Vạn Ma Phiên",
    "Vô Thượng Ma Kiếm"
];

// ============================================================
// LINH THÚ
// ============================================================

const LINH_THU_NAMES = [
    "Thanh Vân Hạc",
    "Hỏa Vân Thú",
    "Bạch Hổ",
    "Thanh Long",
    "Chu Tước",
    "Huyền Vũ",
    "Kỳ Lân",
    "Phượng Hoàng",
    "Kim Sí Đại Bằng",
    "Thái Cổ Long"
];

// ============================================================
// VẬT PHẨM ĐẶC BIỆT
// ============================================================

const DAC_BIET_NAMES = [
    "Đan Dược Thần Bí",
    "Thiên Đạo Phù",
    "Hồng Hoang Ngọc",
    "Hỗn Độn Tinh",
    "Đại Đạo Chi Tâm",
    "Đan Đổi Linh Căn",
    "Đan Đổi Thể Chất"
];

// ============================================================
// SHOP DATA
// ============================================================

const SHOP = {};

for (const shopId of Object.keys(SHOPS)) {

    SHOP[shopId] = {
        congPhap: {},
        yeuCongPhap: {},
        maDaoCongPhap: {},

        phapBao: {},
        yeuPhapBao: {},
        maDaoPhapBao: {},

        linhThu: {},
        dan: {},
        dacBiet: {}
    };
}

// ============================================================
// CREATE ITEM
// ============================================================

let counter = 1;

function createItem(
    shopId,
    category,
    id,
    name,
    realm,
    rarity,
    cost,
    effect = {}
) {

    return {
        id,
        name,
        requiredRealm: realm,
        rarity,
        cost,
        category,
        shopId,
        shopName: SHOP_NAME[shopId],

        effect: {
            ...effect
        },

        hpBonus: Number(effect.hp || 0),
        congBonus: Number(effect.cong || 0),
        thuBonus: Number(effect.thu || 0),
        tuviBonus: Number(effect.tuvi || 0),
        linhLucBonus: Number(effect.linhLuc || 0)
    };
}

// ============================================================
// GENERATE SHOP
// ============================================================

function generateShop() {

    for (const [shopId, config] of Object.entries(SHOPS)) {

        const shop = SHOP[shopId];

        for (
            let realm = config.minRealm;
            realm <= config.maxRealm;
            realm++
        ) {

            const rarity =
                RARITIES[
                    Math.min(
                        RARITIES.length - 1,
                        Math.floor(realm / 2)
                    )
                ];

            // ====================================================
            // CÔNG PHÁP CHÍNH ĐẠO
            // ====================================================

            CONG_PHAP_NAMES.forEach((name, i) => {

                const id =
                    `cp_${shopId}_${counter++}`;

                shop.congPhap[id] =
                    createItem(
                        shopId,
                        "congPhap",
                        id,
                        name,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                (realm + 1)
                            )
                        ),

                        {
                            chinhDao: true,
                            loai: "cong_phap_chinh_dao",

                            tuvi:
                                (realm + 1) *
                                100 *
                                (i + 1),

                            linhLuc:
                                (realm + 1) *
                                20,

                            thu:
                                (realm + 1) *
                                30 *
                                (i + 1)
                        }
                    );
            });

            // ====================================================
            // CÔNG PHÁP YÊU ĐẠO
            // ====================================================

            YEU_CONG_PHAP_NAMES.forEach((name, i) => {

                const id =
                    `ycp_${shopId}_${counter++}`;

                shop.yeuCongPhap[id] =
                    createItem(
                        shopId,
                        "yeuCongPhap",
                        id,
                        `${name} 🐺`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 2) *
                                (realm + 1) *
                                2
                            )
                        ),

                        {
                            yeuDao: true,
                            loai: "cong_phap_yeu_dao",

                            cong:
                                (realm + 1) *
                                100 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                80 *
                                (i + 1),

                            hp:
                                (realm + 1) *
                                500 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                150,

                            yeuDaoBuff: true
                        }
                    );
            });

            // ====================================================
            // CÔNG PHÁP MA ĐẠO
            // ====================================================

            MA_DAO_CONG_PHAP_NAMES.forEach((name, i) => {

                const id =
                    `mdcp_${shopId}_${counter++}`;

                shop.maDaoCongPhap[id] =
                    createItem(
                        shopId,
                        "maDaoCongPhap",
                        id,
                        `${name} 😈`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 3) *
                                (realm + 1) *
                                3
                            )
                        ),

                        {
                            maDao: true,
                            loai: "cong_phap_ma_dao",

                            cong:
                                (realm + 1) *
                                130 *
                                (i + 1),

                            hp:
                                (realm + 1) *
                                400 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                180,

                            linhLuc:
                                (realm + 1) *
                                100,

                            maDaoBuff: true,

                            satThuongBonus:
                                5 + i,

                            hutMauBonus:
                                2 + i,

                            dotPhaBonus:
                                3 + i
                        }
                    );
            });

            // ====================================================
            // PHÁP BẢO
            // ====================================================

            PHAP_BAO_NAMES.forEach((name, i) => {

                const id =
                    `pb_${shopId}_${counter++}`;

                shop.phapBao[id] =
                    createItem(
                        shopId,
                        "phapBao",
                        id,
                        name,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                (realm + 1) *
                                2
                            )
                        ),

                        {
                            chinhDao: true,
                            cong:
                                (realm + 1) *
                                80 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                50
                        }
                    );
            });

            // ====================================================
            // PHÁP BẢO YÊU ĐẠO
            // ====================================================

            YEU_PHAP_BAO_NAMES.forEach((name, i) => {

                const id =
                    `ypb_${shopId}_${counter++}`;

                shop.yeuPhapBao[id] =
                    createItem(
                        shopId,
                        "yeuPhapBao",
                        id,
                        `${name} 🐺`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 2) *
                                (realm + 1) *
                                3
                            )
                        ),

                        {
                            yeuDao: true,
                            loai: "phap_bao_yeu_dao",

                            cong:
                                (realm + 1) *
                                120 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                100,

                            hp:
                                (realm + 1) *
                                500
                        }
                    );
            });

            // ====================================================
            // PHÁP BẢO MA ĐẠO
            // ====================================================

            MA_DAO_PHAP_BAO_NAMES.forEach((name, i) => {

                const id =
                    `mdpb_${shopId}_${counter++}`;

                shop.maDaoPhapBao[id] =
                    createItem(
                        shopId,
                        "maDaoPhapBao",
                        id,
                        `${name} 😈`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 3) *
                                (realm + 1) *
                                4
                            )
                        ),

                        {
                            maDao: true,
                            loai: "phap_bao_ma_dao",

                            cong:
                                (realm + 1) *
                                160 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                120,

                            maDaoBuff: true,

                            satThuongBonus:
                                5 + i,

                            hutMauBonus:
                                2 + i
                        }
                    );
            });

            // ====================================================
            // LINH THÚ
            // ====================================================

            LINH_THU_NAMES.forEach((name, i) => {

                const id =
                    `lt_${shopId}_${counter++}`;

                shop.linhThu[id] =
                    createItem(
                        shopId,
                        "linhThu",
                        id,
                        name,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                (realm + 1) *
                                4
                            )
                        ),

                        {
                            hp:
                                (realm + 1) *
                                1000,

                            cong:
                                (realm + 1) *
                                100,

                            thu:
                                (realm + 1) *
                                100
                        }
                    );
            });

            // ====================================================
            // ĐAN DƯỢC THƯỜNG
            // ====================================================

            for (let i = 0; i < 5; i++) {

                const id =
                    `dan_${shopId}_${counter++}`;

                shop.dan[id] =
                    createItem(
                        shopId,
                        "dan",
                        id,
                        `Đan Dược ${realm + 1}-${i + 1}`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                (realm + 1)
                            )
                        ),

                        {
                            hp:
                                (realm + 1) *
                                500 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                500 *
                                (i + 1)
                        }
                    );
            }

            // ====================================================
            // ⚔️ ĐAN CHÍNH ĐẠO
            // ====================================================

            CHINH_DAO_DAN.forEach((name, i) => {

                const id =
                    `cddan_${shopId}_${counter++}`;

                shop.dan[id] =
                    createItem(
                        shopId,
                        "dan",
                        id,
                        `${name} ⚔️`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                (realm + 1) *
                                2
                            )
                        ),

                        {
                            chinhDao: true,
                            loai: "dan_chinh_dao",

                            hp:
                                (realm + 1) *
                                700 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                120 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                700 *
                                (i + 1),

                            linhLuc:
                                (realm + 1) *
                                100
                        }
                    );
            });

            // ====================================================
            // 😈 ĐAN MA ĐẠO
            // ====================================================

            MA_DAO_DAN.forEach((name, i) => {

                const id =
                    `mddan_${shopId}_${counter++}`;

                shop.dan[id] =
                    createItem(
                        shopId,
                        "dan",
                        id,
                        `${name} 😈`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 3) *
                                (realm + 1) *
                                4
                            )
                        ),

                        {
                            maDao: true,
                            maDaoBuff: true,
                            loai: "dan_ma_dao",

                            cong:
                                (realm + 1) *
                                250 *
                                (i + 1),

                            hp:
                                (realm + 1) *
                                500 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                1000 *
                                (i + 1),

                            linhLuc:
                                (realm + 1) *
                                150 *
                                (i + 1),

                            satThuongBonus:
                                5 + i * 3,

                            hutMauBonus:
                                2 + i,

                            dotPhaBonus:
                                3 + i
                        }
                    );
            });

            // ====================================================
            // 🐺 ĐAN YÊU ĐẠO
            // ====================================================

            YEU_DAO_DAN.forEach((name, i) => {

                const id =
                    `yddan_${shopId}_${counter++}`;

                shop.dan[id] =
                    createItem(
                        shopId,
                        "dan",
                        id,
                        `${name} 🐺`,
                        realm,
                        rarity,

                        Math.max(
                            1,
                            Math.floor(
                                config.price *
                                (i + 3) *
                                (realm + 1) *
                                3
                            )
                        ),

                        {
                            yeuDao: true,
                            yeuDaoBuff: true,
                            loai: "dan_yeu_dao",

                            hp:
                                (realm + 1) *
                                1200 *
                                (i + 1),

                            cong:
                                (realm + 1) *
                                180 *
                                (i + 1),

                            thu:
                                (realm + 1) *
                                180 *
                                (i + 1),

                            tuvi:
                                (realm + 1) *
                                900 *
                                (i + 1),

                            linhLuc:
                                (realm + 1) *
                                120 *
                                (i + 1),

                            hpPercentBonus:
                                5 + i * 3,

                            congPercentBonus:
                                3 + i * 2,

                            dotPhaBonus:
                                2 + i
                        }
                    );
            });

            // ====================================================
            // ĐẶC BIỆT
            // ====================================================

            DAC_BIET_NAMES.forEach((name, i) => {

                const id =
                    `db_${shopId}_${counter++}`;

                const isLinhCan =
                    name === "Đan Đổi Linh Căn";

                const isTheChat =
                    name === "Đan Đổi Thể Chất";

                shop.dacBiet[id] =
                    createItem(
                        shopId,
                        "dacBiet",
                        id,
                        `🎁 ${name}`,
                        realm,
                        rarity,

                        isLinhCan || isTheChat
                            ? 10000000
                            : Math.max(
                                5000,
                                Math.floor(
                                    config.price *
                                    (i + 1) *
                                    6
                                )
                            ),

                        {
                            cong:
                                (realm + 1) * 50,

                            thu:
                                (realm + 1) * 50,

                            hp:
                                (realm + 1) * 500,

                            tuvi:
                                (realm + 1) * 2500,

                            ...(isLinhCan
                                ? {
                                    loai: "doi_linh_can",
                                    doiLinhCan: true
                                }
                                : {}),

                            ...(isTheChat
                                ? {
                                    loai: "doi_the_chat",
                                    doiTheChat: true
                                }
                                : {})
                        }
                    );
            });
        }
    }
}

generateShop();

// ============================================================
// GET REALM
// ============================================================

function getRealmIndex(realm) {

    if (typeof realm === "number") {
        return Math.max(
            0,
            Math.min(
                REALMS.length - 1,
                realm
            )
        );
    }

    const text =
        String(realm || "").trim();

    const index =
        REALMS.indexOf(text);

    if (index !== -1) {
        return index;
    }

    const found =
        REALMS.findIndex(
            x =>
                x.toLowerCase() ===
                text.toLowerCase()
        );

    return found === -1
        ? 0
        : found;
}

// ============================================================
// GET ALL ITEMS
// ============================================================

function getUnifiedItems() {

    const result = [];

    for (
        const [shopId, shopData]
        of Object.entries(SHOP)
    ) {

        for (
            const [category, items]
            of Object.entries(shopData)
        ) {

            for (
                const item
                of Object.values(items)
            ) {

                result.push({
                    ...item,
                    category,
                    shopId,
                    shopName:
                        SHOP_NAME[shopId]
                });
            }
        }
    }

    return result.sort(
        (a, b) =>
            a.requiredRealm -
            b.requiredRealm ||

            a.cost -
            b.cost ||

            a.id.localeCompare(b.id)
    );
}

// ============================================================
// GET CATEGORY
// ============================================================

function getCategoryItems(category) {

    const config =
        SHOP_CATEGORIES[category];

    if (!config) {
        return [];
    }

    const result = [];

    for (
        const shopData
        of Object.values(SHOP)
    ) {

        for (
            const key
            of config.keys
        ) {

            if (!shopData[key]) {
                continue;
            }

            result.push(
                ...Object.values(
                    shopData[key]
                )
            );
        }
    }

    return result.sort(
        (a, b) =>
            a.requiredRealm -
            b.requiredRealm ||

            a.cost -
            b.cost ||

            a.id.localeCompare(b.id)
    );
}

// ============================================================
// FORMAT EFFECT
// ============================================================

function formatEffect(item) {

    const e =
        item.effect || {};

    const result = [];

    if (e.chinhDao) {
        result.push("⚔️ **CHÍNH ĐẠO**");
    }

    if (e.maDao) {
        result.push("😈 **MA ĐẠO**");
    }

    if (e.yeuDao) {
        result.push("🐺 **YÊU ĐẠO**");
    }

    if (e.maDaoBuff) {
        result.push("🔥 Buff Ma Đạo");

        if (e.satThuongBonus) {
            result.push(
                `💀 Sát thương +${e.satThuongBonus}%`
            );
        }

        if (e.hutMauBonus) {
            result.push(
                `🩸 Hút máu +${e.hutMauBonus}%`
            );
        }

        if (e.dotPhaBonus) {
            result.push(
                `⚡ Đột phá +${e.dotPhaBonus}%`
            );
        }
    }

    if (e.yeuDaoBuff) {
        result.push("🐺 Buff Yêu Đạo");

        if (e.hpPercentBonus) {
            result.push(
                `❤️ HP +${e.hpPercentBonus}%`
            );
        }

        if (e.congPercentBonus) {
            result.push(
                `⚔️ Công +${e.congPercentBonus}%`
            );
        }

        if (e.dotPhaBonus) {
            result.push(
                `⚡ Đột phá +${e.dotPhaBonus}%`
            );
        }
    }

    if (e.doiLinhCan) {
        result.push("🧬 **ĐỔI LINH CĂN**");
    }

    if (e.doiTheChat) {
        result.push("💪 **ĐỔI THỂ CHẤT**");
    }

    if (e.cong) {
        result.push(
            `⚔️ Công +${Number(
                e.cong
            ).toLocaleString()}`
        );
    }

    if (e.thu) {
        result.push(
            `🛡️ Thủ +${Number(
                e.thu
            ).toLocaleString()}`
        );
    }

    if (e.hp) {
        result.push(
            `❤️ HP +${Number(
                e.hp
            ).toLocaleString()}`
        );
    }

    if (e.tuvi) {
        result.push(
            `✨ Tu Vi +${Number(
                e.tuvi
            ).toLocaleString()}`
        );
    }

    if (e.linhLuc) {
        result.push(
            `🔮 Linh Lực +${Number(
                e.linhLuc
            ).toLocaleString()}`
        );
    }

    if (e.loai) {
        result.push(
            `📌 ${e.loai}`
        );
    }

    return result.length
        ? result.join(" • ")
        : "Không có hiệu ứng";
}

// ============================================================
// CATEGORY BUTTON
// ============================================================

function makeCategoryButtons(
    currentCategory
) {

    const buttons = [
        ["danDuoc", "🧪 Đan dược"],
        ["vatPham", "🎒 Vật phẩm"],
        ["linhThu", "🐉 Linh thú"],
        ["phapBao", "⚱️ Pháp bảo"],
        ["maDao", "😈 Ma đạo"],
        ["yeuDao", "🐺 Yêu đạo"]
    ].map(
        ([id, label]) =>
            new ButtonBuilder()
                .setCustomId(
                    `shop_category_${id}`
                )
                .setLabel(label)
                .setStyle(
                    currentCategory === id
                        ? ButtonStyle.Primary
                        : ButtonStyle.Secondary
                )
    );

    return [
        new ActionRowBuilder()
            .addComponents(
                ...buttons.slice(0, 4)
            ),

        new ActionRowBuilder()
            .addComponents(
                ...buttons.slice(4)
            )
    ];
}

// ============================================================
// PAGE BUTTON
// ============================================================

function makePageButtons(
    category,
    page,
    totalPages
) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `shop_page_prev_${category}_${page}`
                )
                .setLabel(
                    "◀ Trang trước"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    page <= 1
                ),

            new ButtonBuilder()
                .setCustomId(
                    `shop_page_current_${category}_${page}`
                )
                .setLabel(
                    `📖 ${page}/${totalPages}`
                )
                .setStyle(
                    ButtonStyle.Primary
                )
                .setDisabled(true),

            new ButtonBuilder()
                .setCustomId(
                    `shop_page_next_${category}_${page}`
                )
                .setLabel(
                    "Trang sau ▶"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    page >= totalPages
                )
        );
}

// ============================================================
// SHOW SHOP
// ============================================================

async function showShopPage(
    interaction,
    requestedPage = 1,
    update = false,
    category = "danDuoc"
) {

    if (!SHOP_CATEGORIES[category]) {
        category = "danDuoc";
    }

    const items =
        getCategoryItems(category);

    const perPage = 12;

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                items.length /
                perPage
            )
        );

    const page =
        Math.min(
            Math.max(
                1,
                Number(requestedPage) || 1
            ),
            totalPages
        );

    const currentItems =
        items.slice(
            (page - 1) * perPage,
            page * perPage
        );

    const player =
        getPlayer(
            interaction.user.id
        );

    const linhThach =
        Number(
            player?.linhThach
        ) || 0;

    const categoryName =
        SHOP_CATEGORIES[
            category
        ].name;

    let description =
        `💰 **Linh Thạch:** ${linhThach.toLocaleString()}\n` +
        `🛍️ **${categoryName}**\n` +
        `📦 **${items.length} vật phẩm**\n` +
        `📖 **Trang ${page}/${totalPages}**\n\n`;

    if (!currentItems.length) {
        description +=
            "❌ Shop này hiện chưa có vật phẩm.";
    }

    for (const item of currentItems) {

        description +=
            `━━━━━━━━━━━━━━━━━━\n` +
            `**${item.name}**\n` +
            `🆔 \`${item.id}\`\n` +
            `🏪 ${item.shopName}\n` +
            `💎 **${item.cost.toLocaleString()} LT**\n` +
            `🌱 ${REALMS[item.requiredRealm]}\n` +
            `${item.rarity}\n` +
            `✨ ${formatEffect(item)}\n\n`;
    }

    description +=
        `━━━━━━━━━━━━━━━━━━\n` +
        `🛒 **Mua:**\n` +
        `\`/cuahang mua vatpham:<ID>\`\n\n` +
        `⚔️ Chính Đạo • 😈 Ma Đạo • 🐺 Yêu Đạo`;

    const embed =
        new EmbedBuilder()
            .setColor(0x9b59b6)
            .setTitle(
                `🛒 CỬA HÀNG HỒNG HOANG — ${categoryName}`
            )
            .setDescription(
                description
            )
            .setFooter({
                text:
                    `🌌 Thường · Tiên · Thánh · Đại Đạo • ` +
                    `Trang ${page}/${totalPages}`
            });

    const payload = {
        embeds: [embed],

        components: [
            ...makeCategoryButtons(
                category
            ),

            makePageButtons(
                category,
                page,
                totalPages
            )
        ]
    };

    if (update) {
        return interaction.update(
            payload
        );
    }

    return interaction.reply(
        payload
    );
}

// ============================================================
// MUA ITEM
// ============================================================

async function buyItem(
    interaction,
    rawId
) {

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

    const itemId =
        String(
            rawId || ""
        )
            .trim()
            .toLowerCase();

    const item =
        getUnifiedItems().find(
            x =>
                String(x.id)
                    .toLowerCase() ===
                itemId
        );

    if (!item) {
        return interaction.reply({
            content:
                `❌ Không tìm thấy vật phẩm **${itemId}**.\n\n` +
                `🛒 Dùng \`/cuahang xem\` để xem ID chính xác.`,
            ephemeral: true
        });
    }

    // ========================================================
    // KIỂM TRA CẢNH GIỚI
    // ========================================================

    const playerRealm =
        getRealmIndex(
            player.canhGioi
        );

    if (
        playerRealm <
        item.requiredRealm
    ) {

        return interaction.reply({

            embeds: [

                new EmbedBuilder()
                    .setColor(
                        0xe74c3c
                    )
                    .setTitle(
                        "🔒 CHƯA ĐỦ CẢNH GIỚI"
                    )
                    .setDescription(
                        `❌ Bạn chưa đủ cảnh giới để mua **${item.name}**.`
                    )
                    .addFields(

                        {
                            name:
                                "🌱 Hiện tại",

                            value:
                                `${player.canhGioi || "Phàm Nhân"} • Tầng ${player.tang || 1}`,

                            inline: true
                        },

                        {
                            name:
                                "🔓 Yêu cầu",

                            value:
                                REALMS[
                                    item.requiredRealm
                                ],

                            inline: true
                        },

                        {
                            name:
                                "🆔 ID",

                            value:
                                `\`${item.id}\``,

                            inline: false
                        }
                    )
            ],

            ephemeral: true
        });
    }

    // ========================================================
    // KIỂM TRA LINH THẠCH
    // ========================================================

    const linhThach =
        Number(
            player.linhThach
        ) || 0;

    if (
        linhThach <
        item.cost
    ) {

        return interaction.reply({

            content:
                `💸 **Không đủ Linh Thạch!**\n\n` +
                `💎 Giá: **${item.cost.toLocaleString()} LT**\n` +
                `💰 Bạn có: **${linhThach.toLocaleString()} LT**\n` +
                `🆔 ID: \`${item.id}\``,

            ephemeral: true
        });
    }

    // ========================================================
    // TÚI ĐỒ
    // ========================================================

    const category =
        item.category;

    const tuiDo =
        player.tuiDo || {};

    const owned =
        Array.isArray(
            tuiDo[category]
        )
            ? [
                ...tuiDo[category]
            ]
            : [];

    owned.push({

        id:
            item.id,

        legacyId:
            item.legacyId ||
            null,

        name:
            item.name,

        rarity:
            item.rarity,

        requiredRealm:
            item.requiredRealm,

        effect:
            item.effect,

        bonus:
            item.bonus,

        hpBonus:
            item.hpBonus,

        congBonus:
            item.congBonus,

        thuBonus:
            item.thuBonus,

        tuviBonus:
            item.tuviBonus,

        linhLucBonus:
            item.linhLucBonus,

        chinhDao:
            item.effect?.chinhDao ||
            false,

        yeuDao:
            item.effect?.yeuDao ||
            false,

        maDao:
            item.effect?.maDao ||
            false,

        maDaoBuff:
            item.effect?.maDaoBuff ||
            false,

        yeuDaoBuff:
            item.effect?.yeuDaoBuff ||
            false,

        satThuongBonus:
            item.effect?.satThuongBonus ||
            0,

        hutMauBonus:
            item.effect?.hutMauBonus ||
            0,

        hpPercentBonus:
            item.effect?.hpPercentBonus ||
            0,

        congPercentBonus:
            item.effect?.congPercentBonus ||
            0,

        dotPhaBonus:
            item.effect?.dotPhaBonus ||
            0,

        loai:
            item.effect?.loai ||
            null
    });

    // ========================================================
    // UPDATE PLAYER
    // ========================================================

    updatePlayer(
        interaction.user.id,
        {

            linhThach:
                linhThach -
                item.cost,

            hp:
                (Number(
                    player.hp
                ) || 0) +
                item.hpBonus,

            maxHp:
                (Number(
                    player.maxHp
                ) || 0) +
                item.hpBonus,

            cong:
                (Number(
                    player.cong
                ) || 0) +
                item.congBonus,

            thu:
                (Number(
                    player.thu
                ) || 0) +
                item.thuBonus,

            tuvi:
                (Number(
                    player.tuvi
                ) || 0) +
                item.tuviBonus,

            linhLuc:
                (Number(
                    player.linhLuc
                ) || 0) +
                item.linhLucBonus,

            tuiDo: {

                ...tuiDo,

                [category]:
                    owned
            }
        }
    );

    // ========================================================
    // THÔNG BÁO
    // ========================================================

    let specialText = "";

    if (item.effect?.chinhDao) {
        specialText +=
            "\n⚔️ **VẬT PHẨM CHÍNH ĐẠO**";
    }

    if (item.effect?.maDao) {
        specialText +=
            "\n😈 **VẬT PHẨM MA ĐẠO**";
    }

    if (item.effect?.yeuDao) {
        specialText +=
            "\n🐺 **VẬT PHẨM YÊU ĐẠO**";
    }

    if (item.effect?.doiLinhCan) {
        specialText +=
            "\n🧬 **ĐAN ĐỔI LINH CĂN**";
    }

    if (item.effect?.doiTheChat) {
        specialText +=
            "\n💪 **ĐAN ĐỔI THỂ CHẤT**";
    }

    const color =
        item.effect?.maDao
            ? 0x8e44ad
            : item.effect?.yeuDao
                ? 0xe67e22
                : item.effect?.chinhDao
                    ? 0x3498db
                    : 0x2ecc71;

    const title =
        item.effect?.maDao
            ? "😈 MUA THÀNH CÔNG — MA ĐẠO"
            : item.effect?.yeuDao
                ? "🐺 MUA THÀNH CÔNG — YÊU ĐẠO"
                : item.effect?.chinhDao
                    ? "⚔️ MUA THÀNH CÔNG — CHÍNH ĐẠO"
                    : "🎉 MUA THÀNH CÔNG!";

    return interaction.reply({

        embeds: [

            new EmbedBuilder()

                .setColor(color)

                .setTitle(title)

                .setDescription(
                    `✨ Bạn đã nhận được **${item.name}**${specialText}`
                )

                .addFields(

                    {
                        name: "🆔 ID",
                        value:
                            `\`${item.id}\``,
                        inline: true
                    },

                    {
                        name: "🏪 Shop",
                        value:
                            item.shopName,
                        inline: true
                    },

                    {
                        name: "💎 Đã trả",
                        value:
                            `${item.cost.toLocaleString()} LT`,
                        inline: true
                    },

                    {
                        name: "💰 Còn lại",
                        value:
                            `${(
                                linhThach -
                                item.cost
                            ).toLocaleString()} LT`,
                        inline: true
                    },

                    {
                        name: "✨ Hiệu ứng",
                        value:
                            formatEffect(item),
                        inline: false
                    }
                )

                .setFooter({
                    text:
                        "🌌 Hồng Hoang Đại Lục • /cuahang"
                })
        ]
    });
}

// ============================================================
// COMMAND
// ============================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("cuahang")

            .setDescription(
                "🛒 Cửa hàng Hồng Hoang"
            )

            // ==================================================
            // XEM
            // ==================================================

            .addSubcommand(

                sub =>

                    sub

                        .setName("xem")

                        .setDescription(
                            "🛍️ Xem cửa hàng"
                        )

                        .addIntegerOption(

                            option =>

                                option

                                    .setName(
                                        "trang"
                                    )

                                    .setDescription(
                                        "📖 Trang muốn xem"
                                    )

                                    .setRequired(
                                        false
                                    )

                                    .setMinValue(
                                        1
                                    )
                        )
            )

            // ==================================================
            // MUA
            // ==================================================

            .addSubcommand(

                sub =>

                    sub

                        .setName("mua")

                        .setDescription(
                            "💎 Mua vật phẩm bằng ID"
                        )

                        .addStringOption(

                            option =>

                                option

                                    .setName(
                                        "vatpham"
                                    )

                                    .setDescription(
                                        "🆔 ID vật phẩm"
                                    )

                                    .setRequired(
                                        true
                                    )
                        )
            ),

    // ========================================================
    // EXECUTE
    // ========================================================

    async execute(
        interaction
    ) {

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
            interaction.options
                .getSubcommand();

        if (
            subcommand ===
            "xem"
        ) {

            const page =
                interaction.options
                    .getInteger(
                        "trang"
                    ) || 1;

            return showShopPage(
                interaction,
                page,
                false,
                "danDuoc"
            );
        }

        if (
            subcommand ===
            "mua"
        ) {

            const itemId =
                interaction.options
                    .getString(
                        "vatpham"
                    );

            return buyItem(
                interaction,
                itemId
            );
        }
    },

    // ========================================================
    // BUTTON
    // ========================================================

    async handleComponent(
        interaction
    ) {

        const id =
            interaction.customId ||
            "";

        if (
            !id.startsWith("shop_")
        ) {
            return false;
        }

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

        // ====================================================
        // CHUYỂN CATEGORY
        // ====================================================

        if (
            id.startsWith(
                "shop_category_"
            )
        ) {

            const category =
                id.replace(
                    "shop_category_",
                    ""
                );

            if (
                !SHOP_CATEGORIES[
                    category
                ]
            ) {

                return interaction.reply({

                    content:
                        "❌ Danh mục cửa hàng không hợp lệ.",

                    ephemeral: true
                });
            }

            return showShopPage(
                interaction,
                1,
                true,
                category
            );
        }

        // ====================================================
        // TRANG TRƯỚC
        // ====================================================

        if (
            id.startsWith(
                "shop_page_prev_"
            )
        ) {

            const data =
                id.replace(
                    "shop_page_prev_",
                    ""
                );

            const parts =
                data.split("_");

            const currentPage =
                Number(
                    parts.pop()
                ) || 1;

            const category =
                parts.join("_");

            return showShopPage(
                interaction,
                Math.max(
                    1,
                    currentPage - 1
                ),
                true,
                category
            );
        }

        // ====================================================
        // TRANG SAU
        // ====================================================

        if (
            id.startsWith(
                "shop_page_next_"
            )
        ) {

            const data =
                id.replace(
                    "shop_page_next_",
                    ""
                );

            const parts =
                data.split("_");

            const currentPage =
                Number(
                    parts.pop()
                ) || 1;

            const category =
                parts.join("_");

            return showShopPage(
                interaction,
                currentPage + 1,
                true,
                category
            );
        }

        // ====================================================
        // NÚT SỐ TRANG
        // ====================================================

        if (
            id.startsWith(
                "shop_page_current_"
            )
        ) {

            return interaction.deferUpdate();
        }

        return false;
    }
};

// ============================================================
// THỐNG KÊ SHOP
// ============================================================

function getShopStats() {

    const items =
        getUnifiedItems();

    return {

        total:
            items.length,

        chinhDaoCongPhap:
            items.filter(
                x =>
                    x.effect?.chinhDao &&
                    x.effect?.loai ===
                        "cong_phap_chinh_dao"
            ).length,

        yeuDaoCongPhap:
            items.filter(
                x =>
                    x.effect?.yeuDao &&
                    x.effect?.loai ===
                        "cong_phap_yeu_dao"
            ).length,

        maDaoCongPhap:
            items.filter(
                x =>
                    x.effect?.maDao &&
                    x.effect?.loai ===
                        "cong_phap_ma_dao"
            ).length,

        chinhDaoDan:
            items.filter(
                x =>
                    x.effect?.chinhDao &&
                    x.effect?.loai ===
                        "dan_chinh_dao"
            ).length,

        maDaoDan:
            items.filter(
                x =>
                    x.effect?.maDao &&
                    x.effect?.loai ===
                        "dan_ma_dao"
            ).length,

        yeuDaoDan:
            items.filter(
                x =>
                    x.effect?.yeuDao &&
                    x.effect?.loai ===
                        "dan_yeu_dao"
            ).length,

        yeuDaoPhapBao:
            items.filter(
                x =>
                    x.effect?.yeuDao &&
                    x.effect?.loai ===
                        "phap_bao_yeu_dao"
            ).length,

        maDaoPhapBao:
            items.filter(
                x =>
                    x.effect?.maDao &&
                    x.effect?.loai ===
                        "phap_bao_ma_dao"
            ).length,

        danDoiLinhCan:
            items.filter(
                x =>
                    x.effect?.doiLinhCan
            ).length,

        danDoiTheChat:
            items.filter(
                x =>
                    x.effect?.doiTheChat
            ).length
    };
}

module.exports.getShopStats =
    getShopStats;
