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

        const config = SHOPS[shop];

        // =============================================
        // 📜 25 CÔNG PHÁP
        // =============================================

        CONG_PHAP_NAMES.forEach((baseName, i) => {

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
                (realm + 1) * 10;

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
                    cong: bonus,
                    thu: Math.floor(bonus * 0.5)
                }
            );
        });


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
// 📊 TÊN DANH MỤC
// =====================================================

const CATEGORY_NAME = {
    congPhap: "📜 Công pháp",
    danDuoc: "💊 Đan dược",
    linhThu: "🐉 Linh thú",
    phapBao: "⚔️ Pháp bảo",
    baoVat: "🌿 Thiên tài địa bảo",
    dacBiet: "🎁 Vật phẩm đặc biệt"
};


// =====================================================
// 🏪 TÊN SHOP
// =====================================================

const SHOP_NAME = {
    thuong: "🏪 Shop Thường",
    tien: "☁️ Shop Tiên",
    thanh: "👑 Shop Thánh",
    daidao: "🌌 Shop Đại Đạo"
};


// =====================================================
// 🔢 ĐẾM VẬT PHẨM
// =====================================================

function getShopCount(shop) {

    let total = 0;

    for (const category of Object.values(SHOP[shop])) {
        total += Object.keys(category).length;
    }

    return total;
}


// =====================================================
// 📜 LẤY TẤT CẢ VẬT PHẨM
// =====================================================

function getAllItems(shop) {

    const result = [];

    for (const [category, items] of Object.entries(SHOP[shop])) {

        for (const [id, item] of Object.entries(items)) {

            result.push({
                id,
                category,
                ...item
            });
        }
    }

    return result;
}


// =====================================================
// ⚔️ KIỂM TRA CẢNH GIỚI
// =====================================================

function getRealmIndex(canhGioi) {

    const index =
        REALMS.indexOf(canhGioi);

    return index === -1 ? 0 : index;
}


// =====================================================
// ✨ HIỂN THỊ HIỆU ỨNG
// =====================================================

function formatEffect(item) {

    const effects = [];

    if (item.hpBonus) {
        effects.push(
            `❤️ +${item.hpBonus.toLocaleString()} HP`
        );
    }

    if (item.congBonus) {
        effects.push(
            `⚔️ +${item.congBonus.toLocaleString()} Công`
        );
    }

    if (item.thuBonus) {
        effects.push(
            `🛡️ +${item.thuBonus.toLocaleString()} Thủ`
        );
    }

    if (item.tuviBonus) {
        effects.push(
            `💠 +${item.tuviBonus.toLocaleString()} Tu Vi`
        );
    }

    if (item.linhLucBonus) {
        effects.push(
            `✨ +${item.linhLucBonus.toLocaleString()} Linh Lực`
        );
    }

    if (effects.length === 0) {
        return "✨ Vật phẩm đặc biệt";
    }

    return effects.join(" • ");
}


// =====================================================
// 🏪 COMMAND
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("cuahang")

        .setDescription(
            "🏪 Cửa hàng Hồng Hoang"
        )

        // =============================================
        // XEM
        // =============================================

        .addSubcommand(sub =>
            sub
                .setName("xem")
                .setDescription(
                    "📜 Xem cửa hàng"
                )

                .addStringOption(option =>
                    option
                        .setName("shop")
                        .setDescription(
                            "Chọn cửa hàng"
                        )
                        .setRequired(false)
                        .addChoices(
                            {
                                name: "🏪 Shop Thường",
                                value: "thuong"
                            },
                            {
                                name: "☁️ Shop Tiên",
                                value: "tien"
                            },
                            {
                                name: "👑 Shop Thánh",
                                value: "thanh"
                            },
                            {
                                name: "🌌 Shop Đại Đạo",
                                value: "daidao"
                            }
                        )
                )

                .addIntegerOption(option =>
                    option
                        .setName("trang")
                        .setDescription(
                            "Trang muốn xem"
                        )
                        .setRequired(false)
                        .setMinValue(1)
                )
        )

        // =============================================
        // MUA
        // =============================================

        .addSubcommand(sub =>
            sub
                .setName("mua")
                .setDescription(
                    "🛒 Mua vật phẩm"
                )

                .addStringOption(option =>
                    option
                        .setName("shop")
                        .setDescription(
                            "Chọn cửa hàng"
                        )
                        .setRequired(true)
                        .addChoices(
                            {
                                name: "🏪 Shop Thường",
                                value: "thuong"
                            },
                            {
                                name: "☁️ Shop Tiên",
                                value: "tien"
                            },
                            {
                                name: "👑 Shop Thánh",
                                value: "thanh"
                            },
                            {
                                name: "🌌 Shop Đại Đạo",
                                value: "daidao"
                            }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName("vatpham")
                        .setDescription(
                            "ID vật phẩm muốn mua"
                        )
                        .setRequired(true)
                )
        ),


    // =================================================
    // EXECUTE
    // =================================================

    async execute(interaction) {

        const p =
            getPlayer(interaction.user.id);

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const subcommand =
            interaction.options.getSubcommand();


        // =================================================
        // 👀 XEM SHOP
        // =================================================

        if (subcommand === "xem") {

            const shop =
                interaction.options.getString("shop");

            const page =
                interaction.options.getInteger("trang") || 1;


            // =============================================
            // NẾU KHÔNG CHỌN SHOP
            // =============================================

            if (!shop) {

                const embeds = [];

                for (const shopId of Object.keys(SHOP)) {

                    const count =
                        getShopCount(shopId);

                    embeds.push(
                        new EmbedBuilder()

                            .setColor(0x8e44ad)

                            .setTitle(
                                SHOP_NAME[shopId]
                            )

                            .setDescription(
                                `📦 Có **${count} vật phẩm**\n\n` +
                                `🌱 Cảnh giới: **${REALMS[SHOPS[shopId].minRealm]} → ${REALMS[SHOPS[shopId].maxRealm]}**\n\n` +
                                `Dùng:\n` +
                                `\`/cuahang xem shop:${shopId}\`\n\n` +
                                `🛒 Dùng \`/cuahang mua\` để mua vật phẩm.`
                            )
                    );
                }

                return interaction.reply({
                    embeds
                });
            }


            // =============================================
            // KIỂM TRA SHOP
            // =============================================

            if (!SHOP[shop]) {

                return interaction.reply({
                    content:
                        "❌ Shop không tồn tại.",
                    ephemeral: true
                });
            }


            // =============================================
            // LẤY ITEMS
            // =============================================

            const items =
                getAllItems(shop);

            const perPage = 20;

            const totalPages =
                Math.ceil(
                    items.length / perPage
                );

            const safePage =
                Math.min(
                    page,
                    totalPages
                );

            const start =
                (safePage - 1) * perPage;

            const currentItems =
                items.slice(
                    start,
                    start + perPage
                );


            let description =
                `💎 Thanh toán bằng **Linh Thạch**.\n` +
                `📦 Tổng: **${items.length} vật phẩm**\n` +
                `📖 Trang **${safePage}/${totalPages}**\n\n`;


            for (const item of currentItems) {

                description +=
                    `**${item.name}**\n` +
                    `🆔 \`${item.id}\`\n` +
                    `💎 ${item.cost.toLocaleString()}` +
                    ` • 🌱 ${REALMS[item.requiredRealm]}` +
                    ` • ${item.rarity}\n` +
                    `✨ ${formatEffect(item)}\n\n`;
            }


            const embed =
                new EmbedBuilder()

                    .setColor(0x8e44ad)

                    .setTitle(
                        `${SHOP_NAME[shop]} • CỬA HÀNG HỒNG HOANG`
                    )

                    .setDescription(
                        description
                    )

                    .setFooter({
                        text:
                            `Trang ${safePage}/${totalPages} • Dùng /cuahang xem để xem các shop`
                    });


            return interaction.reply({
                embeds: [embed]
            });
        }


        // =================================================
        // 🛒 MUA
        // =================================================

        const shop =
            interaction.options.getString("shop");

        const itemId =
            interaction.options.getString("vatpham");


        if (!SHOP[shop]) {

            return interaction.reply({
                content:
                    "❌ Shop không tồn tại.",
                ephemeral: true
            });
        }


        // =================================================
        // 🔎 TÌM VẬT PHẨM
        // =================================================

        let item = null;
        let category = null;

        for (
            const [categoryName, items]
            of Object.entries(SHOP[shop])
        ) {

            if (items[itemId]) {

                item =
                    items[itemId];

                category =
                    categoryName;

                break;
            }
        }


        if (!item) {

            return interaction.reply({

                content:
                    `❌ Không tìm thấy vật phẩm \`${itemId}\` trong ${SHOP_NAME[shop]}.\n\n` +
                    `Dùng \`/cuahang xem shop:${shop}\` để xem ID.`,

                ephemeral: true
            });
        }


        // =================================================
        // 🌱 KIỂM TRA CẢNH GIỚI
        // =================================================

        const playerRealm =
            getRealmIndex(
                p.canhGioi
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
                            `Bạn chưa đủ cảnh giới để mua **${item.name}**.`
                        )

                        .addFields(
                            {
                                name:
                                    "🌱 Cảnh giới hiện tại",
                                value:
                                    `${p.canhGioi} tầng ${p.tang || 1}`,
                                inline: true
                            },
                            {
                                name:
                                    "🔓 Yêu cầu",
                                value:
                                    REALMS[item.requiredRealm],
                                inline: true
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
            Number(p.linhThach) || 0;


        if (
            linhThach <
            item.cost
        ) {

            return interaction.reply({

                content:
                    `❌ Không đủ Linh Thạch.\n\n` +
                    `💎 Giá: **${item.cost.toLocaleString()}**\n` +
                    `💎 Bạn có: **${linhThach.toLocaleString()}**`,

                ephemeral: true
            });
        }


        // =================================================
        // 📦 TÚI ĐỒ
        // =================================================

        const tuiDo =
            p.tuiDo || {};


        const owned =
            Array.isArray(
                tuiDo[category]
            )
                ? [...tuiDo[category]]
                : [];


        // =================================================
        // 🎁 VẬT PHẨM MỚI
        // =================================================

        owned.push({

            id:
                item.id,

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
                item.linhLucBonus
        });


        // =================================================
        // 📈 CHỈ SỐ SAU KHI MUA
        // =================================================

        const newHp =
            (Number(p.hp) || 0) +
            item.hpBonus;

        const newMaxHp =
            (Number(p.maxHp) || 0) +
            item.hpBonus;

        const newCong =
            (Number(p.cong) || 0) +
            item.congBonus;

        const newThu =
            (Number(p.thu) || 0) +
            item.thuBonus;

        const newTuVi =
            (Number(p.tuvi) || 0) +
            item.tuviBonus;

        const newLinhLuc =
            (Number(p.linhLuc) || 0) +
            item.linhLucBonus;


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
                    newHp,

                maxHp:
                    newMaxHp,

                cong:
                    newCong,

                thu:
                    newThu,

                tuvi:
                    newTuVi,

                linhLuc:
                    newLinhLuc,

                tuiDo: {

                    ...tuiDo,

                    [category]:
                        owned
                }
            }
        );


        // =================================================
        // 🛒 MUA THÀNH CÔNG
        // =================================================

        const effectText =
            formatEffect(item);


        return interaction.reply({

            embeds: [

                new EmbedBuilder()

                    .setColor(0x2ecc71)

                    .setTitle(
                        "🛒 MUA THÀNH CÔNG!"
                    )

                    .setDescription(
                        `✨ Bạn đã mua **${item.name}**`
                    )

                    .addFields(

                        {
                            name:
                                "📦 Loại",
                            value:
                                CATEGORY_NAME[category],
                            inline: true
                        },

                        {
                            name:
                                "⭐ Độ hiếm",
                            value:
                                item.rarity,
                            inline: true
                        },

                        {
                            name:
                                "🌱 Yêu cầu",
                            value:
                                REALMS[item.requiredRealm],
                            inline: true
                        },

                        {
                            name:
                                "💎 Giá",
                            value:
                                `${item.cost.toLocaleString()} Linh Thạch`,
                            inline: true
                        },

                        {
                            name:
                                "💰 Còn lại",
                            value:
                                `${(linhThach - item.cost).toLocaleString()} Linh Thạch`,
                            inline: true
                        },

                        {
                            name:
                                "✨ Hiệu ứng",
                            value:
                                effectText,
                            inline: false
                        }
                    )

                    .setFooter({
                        text:
                            "Hồng Hoang Đại Lục"
                    })
            ]
        });
    }
};
