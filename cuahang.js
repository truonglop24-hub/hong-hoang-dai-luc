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
// 🌌 CẢNH GIỚI
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
// 🏪 SHOP
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

const SHOP_NAME = {
    thuong: "🏪 Thường",
    tien: "☁️ Tiên",
    thanh: "👑 Thánh",
    daidao: "🌌 Đại Đạo"
};

// =====================================================
// 📜 CÔNG PHÁP THƯỜNG
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
// 🐉 CÔNG PHÁP YÊU ĐẠO
// =====================================================

const YEU_CONG_PHAP_NAMES = [
    "Hoàng Huyết Luyện Thể Quyết",
    "Thanh Mộc Yêu Kinh",
    "Thiên Lang Khiếu Nguyệt Công",
    "Kim Sư Bá Thể Quyết",
    "Thái Cổ Xà Linh Kinh",
    "Bạch Hổ Sát Sinh Quyết",
    "Huyền Vũ Trấn Hải Kinh",
    "Chu Tước Liệt Thiên Công",
    "Thanh Long Hóa Thiên Quyết",
    "Cửu Vĩ Thiên Hồ Kinh",
    "Kim Ô Thôn Nhật Quyết",
    "Thao Thiết Thôn Thiên Công",
    "Côn Bằng Phệ Hải Kinh",
    "Vạn Thú Quy Nguyên Công",
    "Thiên Yêu Luyện Thể Quyết",
    "Bạch Hổ Thánh Sát Kinh",
    "Thanh Long Cửu Biến",
    "Chu Tước Niết Bàn Kinh",
    "Huyền Vũ Bất Diệt Thể",
    "Cửu Vĩ Mị Ảnh Thiên Kinh",
    "Kim Ô Chân Hỏa Điển",
    "Côn Bằng Thiên Hải Kinh",
    "Thao Thiết Phệ Thiên Quyết",
    "Vạn Yêu Quy Nguyên Kinh",
    "Thiên Hoang Yêu Điển",
    "Yêu Đế Chân Kinh",
    "Yêu Hoàng Diệt Thế Công",
    "Yêu Tôn Vạn Kiếp Quyết",
    "Yêu Thần Cổ Kinh",
    "Vạn Cổ Yêu Thần Công",
    "Cửu Thiên Yêu Long Kinh",
    "Tổ Long Hóa Đạo Kinh",
    "Bất Tử Yêu Hoàng Kinh",
    "Thái Cổ Vạn Yêu Kinh",
    "Vạn Thú Thôn Thiên Quyết",
    "Hỗn Độn Yêu Kinh",
    "Hỗn Độn Thôn Phệ Kinh",
    "Hỗn Độn Tổ Long Quyết",
    "Hỗn Độn Côn Bằng Kinh",
    "Hỗn Độn Kim Ô Điển",
    "Yêu Tổ Bản Nguyên Kinh",
    "Vạn Yêu Thủy Tổ Công",
    "Tổ Long Thủy Tổ Kinh",
    "Thái Cổ Yêu Tổ Điển",
    "Vạn Thú Thủy Tổ Quyết",
    "Vô Thượng Yêu Tổ Kinh",
    "Hỗn Nguyên Yêu Đạo Kinh",
    "Yêu Đạo Bản Nguyên Kinh",
    "Vạn Cổ Yêu Đạo Chân Kinh",
    "Yêu Đạo Chí Tôn Kinh"
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
// 🐲 LINH THÚ
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
// ⚔️ PHÁP BẢO THƯỜNG
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
// 🐉 PHÁP BẢO YÊU ĐẠO
// =====================================================

const YEU_PHAP_BAO_NAMES = [
    "Yêu Huyết Đao",
    "Thiên Lang Kiếm",
    "Kim Sư Chiến Kích",
    "Thanh Mộc Yêu Trượng",
    "Thái Cổ Xà Nhẫn",
    "Bạch Hổ Sát Kiếm",
    "Huyền Vũ Thần Thuẫn",
    "Chu Tước Ly Hỏa Phiến",
    "Thanh Long Thần Thương",
    "Cửu Vĩ Hồ Châu",
    "Kim Ô Thần Luân",
    "Thao Thiết Thôn Thiên Hồ",
    "Côn Bằng Hải Đỉnh",
    "Vạn Yêu Phiên",
    "Thiên Yêu Giáp",
    "Bạch Hổ Thánh Kiếm",
    "Thanh Long Thiên Thương",
    "Chu Tước Thần Cung",
    "Huyền Vũ Thánh Thuẫn",
    "Cửu Vĩ Thiên Hồ Châu",
    "Kim Ô Chân Hỏa Luân",
    "Côn Bằng Thiên Hải Đỉnh",
    "Thao Thiết Thôn Thiên Đỉnh",
    "Vạn Yêu Thần Kỳ",
    "Thiên Hoang Yêu Kiếm",
    "Yêu Hoàng Thiên Ấn",
    "Yêu Đế Chi Nhãn",
    "Yêu Tôn Ma Kích",
    "Yêu Thần Cổ Đỉnh",
    "Vạn Cổ Yêu Luân",
    "Tổ Long Thần Thương",
    "Tổ Long Nghịch Lân",
    "Bất Tử Phượng Hoàng Phiến",
    "Thái Cổ Vạn Thú Đỉnh",
    "Vạn Yêu Thần Ấn",
    "Hỗn Độn Yêu Chung",
    "Hỗn Độn Yêu Đỉnh",
    "Hỗn Độn Tổ Long Châu",
    "Hỗn Độn Côn Bằng Đồ",
    "Hỗn Độn Kim Ô Luân",
    "Yêu Tổ Thần Trượng",
    "Vạn Yêu Thủy Tổ Đỉnh",
    "Tổ Long Thủy Tổ Ấn",
    "Thái Cổ Yêu Tổ Kiếm",
    "Vạn Thú Thủy Tổ Kỳ",
    "Vô Thượng Yêu Tổ Thần Binh",
    "Hỗn Nguyên Yêu Đạo Đỉnh",
    "Yêu Đạo Bản Nguyên Châu",
    "Vạn Cổ Yêu Đạo Thần Ấn",
    "Yêu Đạo Chí Tôn Đỉnh"
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
// 🗃️ SHOP DATA
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
// 🔧 TẠO ITEM
// =====================================================

function addItem(
    shop,
    category,
    id,
    name,
    requiredRealm,
    rarity,
    cost,
    effect = {}
) {
    SHOP[shop][category][id] = {
        id,
        name,
        requiredRealm,
        rarity,
        cost,
        effect,

        bonus: Number(effect.cong) || 0,
        hpBonus: Number(effect.hp) || 0,
        congBonus: Number(effect.cong) || 0,
        thuBonus: Number(effect.thu) || 0,
        tuviBonus: Number(effect.tuvi) || 0,
        linhLucBonus: Number(effect.linhLuc) || 0
    };
}

// =====================================================
// 🔢 SINH SHOP
// =====================================================

function generateShop() {
    let counter = 1;

    for (const [shopId, config] of Object.entries(SHOPS)) {

        // -------------------------------------------------
        // 📜 CÔNG PHÁP
        // -------------------------------------------------

        CONG_PHAP_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            const bonus = (realm + 1) * 10;

            addItem(
                shopId,
                "congPhap",
                `cp_${shopId}_${counter++}`,
                `📜 ${name}`,
                realm,
                rarity,
                Math.max(
                    100,
                    Math.floor(config.price * (i + 1) * 2)
                ),
                {
                    cong: bonus,
                    thu: Math.floor(bonus / 2),
                    tuvi: (realm + 1) * 100
                }
            );
        });

        // -------------------------------------------------
        // 🐉 CÔNG PHÁP YÊU ĐẠO
        // -------------------------------------------------

        YEU_CONG_PHAP_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 6)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            // Yêu Đạo mạnh hơn công pháp thường
            const bonus = (realm + 1) * 300;

            addItem(
                shopId,
                "congPhap",
                `yeu_cp_${shopId}_${counter++}`,
                `🐉 ${name}`,
                realm,
                rarity,
                Math.max(
                    1000,
                    Math.floor(config.price * (i + 1) * 8)
                ),
                {
                    cong: bonus,
                    thu: Math.floor(bonus * 0.6),
                    tuvi: (realm + 1) * 3000,
                    yeuDao: true,
                    loai: "cong_phap_yeu_dao"
                }
            );
        });

        // -------------------------------------------------
        // 💊 ĐAN DƯỢC
        // -------------------------------------------------

        DAN_DUOC_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 4)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            addItem(
                shopId,
                "danDuoc",
                `dan_${shopId}_${counter++}`,
                `💊 ${name}`,
                realm,
                rarity,
                Math.max(
                    100,
                    Math.floor(config.price * (i + 1) * 1.5)
                ),
                {
                    tuvi: (realm + 1) * 500
                }
            );
        });

        // -------------------------------------------------
        // 🐲 LINH THÚ
        // -------------------------------------------------

        LINH_THU_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 3)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            const bonus = (realm + 1) * 25;

            addItem(
                shopId,
                "linhThu",
                `lt_${shopId}_${counter++}`,
                `🐲 ${name}`,
                realm,
                rarity,
                Math.max(
                    300,
                    Math.floor(config.price * (i + 1) * 3)
                ),
                {
                    cong: bonus,
                    thu: bonus,
                    hp: bonus * 10
                }
            );
        });

        // -------------------------------------------------
        // ⚔️ PHÁP BẢO
        // -------------------------------------------------

        PHAP_BAO_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 3)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            const bonus = (realm + 1) * 40;

            addItem(
                shopId,
                "phapBao",
                `pb_${shopId}_${counter++}`,
                `⚔️ ${name}`,
                realm,
                rarity,
                Math.max(
                    500,
                    Math.floor(config.price * (i + 1) * 4)
                ),
                {
                    cong: bonus,
                    thu: bonus,
                    hp: bonus * 10
                }
            );
        });

        // -------------------------------------------------
        // 🐉 PHÁP BẢO YÊU ĐẠO
        // -------------------------------------------------

        YEU_PHAP_BAO_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 6)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            // Pháp bảo Yêu Đạo mạnh hơn rất nhiều
            const bonus = (realm + 1) * 500;

            addItem(
                shopId,
                "phapBao",
                `yeu_pb_${shopId}_${counter++}`,
                `🐉 ${name}`,
                realm,
                rarity,
                Math.max(
                    2000,
                    Math.floor(config.price * (i + 1) * 12)
                ),
                {
                    cong: bonus,
                    thu: bonus,
                    hp: bonus * 15,
                    yeuDao: true,
                    loai: "phap_bao_yeu_dao"
                }
            );
        });

        // -------------------------------------------------
        // 🌿 BẢO VẬT
        // -------------------------------------------------

        BAO_VAT_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 3)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            addItem(
                shopId,
                "baoVat",
                `bv_${shopId}_${counter++}`,
                `🌿 ${name}`,
                realm,
                rarity,
                Math.max(
                    1000,
                    Math.floor(config.price * (i + 1) * 5)
                ),
                {
                    tuvi: (realm + 1) * 1000,
                    linhLuc: (realm + 1) * 100
                }
            );
        });

        // -------------------------------------------------
        // 🎁 ĐẶC BIỆT
        // -------------------------------------------------

        DAC_BIET_NAMES.forEach((name, i) => {

            const realm = Math.min(
                config.maxRealm,
                config.minRealm + Math.floor(i / 3)
            );

            const rarity =
                RARITIES[Math.min(8, Math.floor(realm / 2))];

            addItem(
                shopId,
                "dacBiet",
                `db_${shopId}_${counter++}`,
                `🎁 ${name}`,
                realm,
                rarity,
                Math.max(
                    5000,
                    Math.floor(config.price * (i + 1) * 6)
                ),
                {
                    cong: (realm + 1) * 50,
                    thu: (realm + 1) * 50,
                    hp: (realm + 1) * 500,
                    tuvi: (realm + 1) * 2500
                }
            );
        });
    }
}

generateShop();

// =====================================================
// 🔍 LẤY CẢNH GIỚI
// =====================================================

function getRealmIndex(realm) {
    if (typeof realm === "number") {
        return Math.max(
            0,
            Math.min(REALMS.length - 1, realm)
        );
    }

    const text = String(realm || "").trim();

    const index = REALMS.indexOf(text);

    if (index !== -1) {
        return index;
    }

    const lower = text.toLowerCase();

    const found = REALMS.findIndex(
        x => x.toLowerCase() === lower
    );

    return found === -1 ? 0 : found;
}

// =====================================================
// 📦 GỘP TẤT CẢ SHOP
// =====================================================

function getUnifiedItems() {

    const result = [];

    for (const [shopId, shopData] of Object.entries(SHOP)) {

        for (const [category, items] of Object.entries(shopData)) {

            for (const item of Object.values(items)) {

                result.push({
                    ...item,
                    category,
                    shopId,
                    shopName: SHOP_NAME[shopId]
                });
            }
        }
    }

    return result.sort(
        (a, b) =>
            a.requiredRealm - b.requiredRealm ||
            a.cost - b.cost ||
            a.id.localeCompare(b.id)
    );
}

// =====================================================
// ✨ HIỂN THỊ HIỆU ỨNG
// =====================================================

function formatEffect(item) {

    const e = item.effect || {};

    const result = [];

    if (e.yeuDao) {
        result.push("🐉 **YÊU ĐẠO**");
    }

    if (e.cong) {
        result.push(`⚔️ Công +${Number(e.cong).toLocaleString()}`);
    }

    if (e.thu) {
        result.push(`🛡️ Thủ +${Number(e.thu).toLocaleString()}`);
    }

    if (e.hp) {
        result.push(`❤️ HP +${Number(e.hp).toLocaleString()}`);
    }

    if (e.tuvi) {
        result.push(`✨ Tu Vi +${Number(e.tuvi).toLocaleString()}`);
    }

    if (e.linhLuc) {
        result.push(`🔮 Linh Lực +${Number(e.linhLuc).toLocaleString()}`);
    }

    if (e.loai) {
        result.push(`📌 ${e.loai}`);
    }

    return result.length
        ? result.join(" • ")
        : "Không có hiệu ứng";
}

// =====================================================
// 📖 NÚT PHÂN TRANG
// =====================================================

function makeShopButtons(
    page,
    totalPages,
    disabled = false
) {

    return new ActionRowBuilder().addComponents(

        new ButtonBuilder()
            .setCustomId(
                `shop_page_${Math.max(1, page - 1)}`
            )
            .setLabel("◀ Trang trước")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(
                disabled || page <= 1
            ),

        new ButtonBuilder()
            .setCustomId(
                `shop_page_${page}`
            )
            .setLabel(
                `📖 ${page}/${totalPages}`
            )
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),

        new ButtonBuilder()
            .setCustomId(
                `shop_page_${Math.min(
                    totalPages,
                    page + 1
                )}`
            )
            .setLabel("Trang sau ▶")
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(
                disabled || page >= totalPages
            )
    );
}

// =====================================================
// 🛒 NÚT MUA
// =====================================================

function makeItemBuyButtons(items) {

    if (!items.length) {
        return null;
    }

    return new ActionRowBuilder().addComponents(

        items
            .slice(0, 3)
            .map(item =>
                new ButtonBuilder()
                    .setCustomId(
                        `shop_buy_${item.id}`
                    )
                    .setLabel(
                        `💎 ${item.id}`.slice(0, 80)
                    )
                    .setStyle(ButtonStyle.Success)
            )
    );
}

// =====================================================
// 🏪 HIỂN THỊ SHOP
// =====================================================

async function showShopPage(
    interaction,
    requestedPage = 1,
    update = false
) {

    const items = getUnifiedItems();

    const perPage = 12;

    const totalPages = Math.max(
        1,
        Math.ceil(items.length / perPage)
    );

    const page = Math.min(
        Math.max(1, Number(requestedPage) || 1),
        totalPages
    );

    const currentItems = items.slice(
        (page - 1) * perPage,
        page * perPage
    );

    const player = getPlayer(
        interaction.user.id
    );

    const linhThach =
        Number(player?.linhThach) || 0;

    let description =
        `💰 **Linh Thạch:** ${linhThach.toLocaleString()}\n` +
        `📦 **${items.length} vật phẩm**\n` +
        `📖 **Trang ${page}/${totalPages}**\n\n`;

    for (const item of currentItems) {

        description +=
            `${item.name}\n` +
            `🆔 \`${item.id}\`\n` +
            `🏪 ${item.shopName}\n` +
            `💎 **${item.cost.toLocaleString()}**\n` +
            `🌱 ${REALMS[item.requiredRealm]}\n` +
            `${item.rarity}\n` +
            `✨ ${formatEffect(item)}\n\n`;
    }

    description +=
        `━━━━━━━━━━━━━━━━━━\n` +
        `🛒 **Mua:**\n` +
        `\`/cuahang mua vatpham:<ID>\`\n\n` +
        `🐉 Các vật phẩm có chữ **YÊU ĐẠO** là công pháp/pháp bảo Yêu Đạo.`;

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🛒 CỬA HÀNG HỒNG HOANG")
        .setDescription(description)
        .setFooter({
            text:
                `🌌 Thường · Tiên · Thánh · Đại Đạo • ` +
                `Trang ${page}/${totalPages}`
        });

    const components = [
        makeShopButtons(
            page,
            totalPages
        )
    ];

    const buyButtons =
        makeItemBuyButtons(
            currentItems
        );

    if (buyButtons) {
        components.push(buyButtons);
    }

    const payload = {
        embeds: [embed],
        components
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

// =====================================================
// 💰 MUA VẬT PHẨM
// =====================================================

async function buyItem(
    interaction,
    rawId,
    fromButton = false
) {

    const player =
        getPlayer(interaction.user.id);

    if (!player) {

        return interaction.reply({
            content:
                "⚠️ Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    const itemId =
        String(rawId || "")
            .trim()
            .toLowerCase();

    const items =
        getUnifiedItems();

    let item =
        items.find(
            x =>
                String(x.id)
                    .toLowerCase() === itemId
        );

    // Hỗ trợ ID cũ
    if (!item) {

        item =
            items.find(
                x =>
                    String(x.legacyId || "")
                        .toLowerCase() === itemId
            );
    }

    if (!item) {

        return interaction.reply({
            content:
                `❌ Không tìm thấy vật phẩm **${itemId}**.\n\n` +
                `🛒 Dùng \`/cuahang xem\` để xem ID chính xác.`,
            ephemeral: true
        });
    }

    // =================================================
    // 🔒 KIỂM TRA CẢNH GIỚI
    // =================================================

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
                    .setColor(0xe74c3c)
                    .setTitle(
                        "🔒 CHƯA ĐỦ CẢNH GIỚI"
                    )
                    .setDescription(
                        `❌ Bạn chưa đủ cảnh giới để mua **${item.name}**.`
                    )
                    .addFields(
                        {
                            name: "🌱 Hiện tại",
                            value:
                                `${player.canhGioi || "Phàm Nhân"} • Tầng ${player.tang || 1}`,
                            inline: true
                        },
                        {
                            name: "🔓 Yêu cầu",
                            value:
                                REALMS[item.requiredRealm],
                            inline: true
                        },
                        {
                            name: "🆔 ID",
                            value:
                                `\`${item.id}\``,
                            inline: false
                        }
                    )
            ],

            ephemeral: true
        });
    }

    // =================================================
    // 💎 KIỂM TRA LINH THẠCH
    // =================================================

    const linhThach =
        Number(player.linhThach) || 0;

    if (
        linhThach <
        item.cost
    ) {

        return interaction.reply({

            content:
                `💸 **Không đủ Linh Thạch!**\n\n` +
                `💎 Giá: **${item.cost.toLocaleString()}**\n` +
                `💰 Bạn có: **${linhThach.toLocaleString()}**\n` +
                `🆔 ID: \`${item.id}\``,

            ephemeral: true
        });
    }

    // =================================================
    // 📦 THÊM VÀO TÚI ĐỒ
    // =================================================

    const category =
        item.category;

    const tuiDo =
        player.tuiDo || {};

    const owned =
        Array.isArray(
            tuiDo[category]
        )
            ? [...tuiDo[category]]
            : [];

    owned.push({

        id: item.id,

        legacyId:
            item.legacyId || null,

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

        // 🐉 Yêu Đạo
        yeuDao:
            item.effect?.yeuDao || false,

        loai:
            item.effect?.loai || null
    });

    // =================================================
    // 💾 LƯU DATABASE
    // =================================================

    updatePlayer(
        interaction.user.id,
        {

            linhThach:
                linhThach -
                item.cost,

            hp:
                (Number(player.hp) || 0) +
                item.hpBonus,

            maxHp:
                (Number(player.maxHp) || 0) +
                item.hpBonus,

            cong:
                (Number(player.cong) || 0) +
                item.congBonus,

            thu:
                (Number(player.thu) || 0) +
                item.thuBonus,

            tuvi:
                (Number(player.tuvi) || 0) +
                item.tuviBonus,

            linhLuc:
                (Number(player.linhLuc) || 0) +
                item.linhLucBonus,

            tuiDo: {
                ...tuiDo,
                [category]: owned
            }
        }
    );

    // =================================================
    // 🎉 THÔNG BÁO
    // =================================================

    const yeuDaoText =
        item.effect?.yeuDao
            ? "\n🐉 **VẬT PHẨM YÊU ĐẠO**"
            : "";

    return interaction.reply({

        embeds: [

            new EmbedBuilder()
                .setColor(
                    item.effect?.yeuDao
                        ? 0x8e44ad
                        : 0x2ecc71
                )

                .setTitle(
                    item.effect?.yeuDao
                        ? "🐉 MUA THÀNH CÔNG — YÊU ĐẠO"
                        : "🎉 MUA THÀNH CÔNG!"
                )

                .setDescription(
                    `✨ Bạn đã nhận được **${item.name}**${yeuDaoText}`
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
                            item.cost.toLocaleString(),
                        inline: true
                    },

                    {
                        name: "💰 Còn lại",
                        value:
                            (
                                linhThach -
                                item.cost
                            ).toLocaleString(),
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

// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("cuahang")

            .setDescription(
                "🛒 Cửa hàng Hồng Hoang"
            )

            // =========================================
            // 👀 XEM
            // =========================================

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
                                    .setName("trang")
                                    .setDescription(
                                        "📖 Trang muốn xem"
                                    )
                                    .setRequired(false)
                                    .setMinValue(1)
                        )
            )

            // =========================================
            // 💎 MUA
            // =========================================

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
                                    .setName("vatpham")
                                    .setDescription(
                                        "🆔 ID vật phẩm"
                                    )
                                    .setRequired(true)
                        )
            ),

    // =================================================
    // ⚙️ EXECUTE
    // =================================================

    async execute(interaction) {

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

        if (
            subcommand === "xem"
        ) {

            const page =
                interaction.options
                    .getInteger("trang") || 1;

            return showShopPage(
                interaction,
                page,
                false
            );
        }

        if (
            subcommand === "mua"
        ) {

            const itemId =
                interaction.options
                    .getString("vatpham");

            return buyItem(
                interaction,
                itemId
            );
        }
    },

    // =================================================
    // 🖱️ HANDLE BUTTON
    // =================================================

    async handleComponent(
        interaction
    ) {

        const id =
            interaction.customId || "";

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

        // =============================================
        // 📖 PHÂN TRANG
        // =============================================

        if (
            id.startsWith("shop_page_")
        ) {

            const page =
                Number(
                    id.replace(
                        "shop_page_",
                        ""
                    )
                ) || 1;

            return showShopPage(
                interaction,
                page,
                true
            );
        }

        // =============================================
        // 🛒 MUA
        // =============================================

        if (
            id.startsWith("shop_buy_")
        ) {

            const itemId =
                id.replace(
                    "shop_buy_",
                    ""
                );

            return buyItem(
                interaction,
                itemId,
                true
            );
        }

        return false;
    }
};

// =====================================================
// 🧪 KIỂM TRA SHOP
// =====================================================

function getShopStats() {

    const items =
        getUnifiedItems();

    return {
        total:
            items.length,

        yeuDaoCongPhap:
            items.filter(
                x =>
                    x.effect?.yeuDao &&
                    x.effect?.loai ===
                        "cong_phap_yeu_dao"
            ).length,

        yeuDaoPhapBao:
            items.filter(
                x =>
                    x.effect?.yeuDao &&
                    x.effect?.loai ===
                        "phap_bao_yeu_dao"
            ).length
    };
}

// Có thể dùng require("./cuahang").getShopStats()
module.exports.getShopStats = getShopStats;
