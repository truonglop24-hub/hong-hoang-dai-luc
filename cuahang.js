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

const YEU_PHAP_BAO_NAMES = [
    "Huyết Ma Đao",
    "Thiên Yêu Côn",
    "Huyết Long Đao",
    "Cửu Vĩ Phiến",
    "Kim Sí Yêu Kiếm",
    "Thôn Thiên Ma Đao",
    "Vạn Yêu Cổ",
    "Yêu Thần Kích"
];

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

const DAC_BIET_NAMES = [
    "Đan Dược Thần Bí",
    "Thiên Đạo Phù",
    "Hồng Hoang Ngọc",
    "Hỗn Độn Tinh",
    "Đại Đạo Chi Tâm"
];

const SHOP = {
    thuong: {
        congPhap: {},
        yeuCongPhap: {},
        phapBao: {},
        yeuPhapBao: {},
        linhThu: {},
        dan: {},
        dacBiet: {}
    },
    tien: {
        congPhap: {},
        yeuCongPhap: {},
        phapBao: {},
        yeuPhapBao: {},
        linhThu: {},
        dan: {},
        dacBiet: {}
    },
    thanh: {
        congPhap: {},
        yeuCongPhap: {},
        phapBao: {},
        yeuPhapBao: {},
        linhThu: {},
        dan: {},
        dacBiet: {}
    },
    daidao: {
        congPhap: {},
        yeuCongPhap: {},
        phapBao: {},
        yeuPhapBao: {},
        linhThu: {},
        dan: {},
        dacBiet: {}
    }
};

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
                            tuvi:
                                (realm + 1) *
                                100 *
                                (i + 1),
                            linhLuc:
                                (realm + 1) *
                                20
                        }
                    );
            });

            YEU_CONG_PHAP_NAMES.forEach((name, i) => {
                const id =
                    `ycp_${shopId}_${counter++}`;

                shop.yeuCongPhap[id] =
                    createItem(
                        shopId,
                        "yeuCongPhap",
                        id,
                        `${name} 🐉`,
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
                            tuvi:
                                (realm + 1) *
                                150
                        }
                    );
            });

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

            YEU_PHAP_BAO_NAMES.forEach((name, i) => {
                const id =
                    `ypb_${shopId}_${counter++}`;

                shop.yeuPhapBao[id] =
                    createItem(
                        shopId,
                        "yeuPhapBao",
                        id,
                        `${name} 🐉`,
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
                                100
                        }
                    );
            });

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

            DAC_BIET_NAMES.forEach((name, i) => {
                const id =
                    `db_${shopId}_${counter++}`;

                shop.dacBiet[id] =
                    createItem(
                        shopId,
                        "dacBiet",
                        id,
                        `🎁 ${name}`,
                        realm,
                        rarity,
                        Math.max(
                            5000,
                            Math.floor(
                                config.price *
                                (i + 1) *
                                6
                            )
                        ),
                        {
                            cong:
                                (realm + 1) *
                                50,
                            thu:
                                (realm + 1) *
                                50,
                            hp:
                                (realm + 1) *
                                500,
                            tuvi:
                                (realm + 1) *
                                2500
                        }
                    );
            });
        }
    }
}

generateShop();

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

    const lower =
        text.toLowerCase();

    const found =
        REALMS.findIndex(
            x =>
                x.toLowerCase() ===
                lower
        );

    return found === -1
        ? 0
        : found;
}

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
            a.id.localeCompare(
                b.id
            )
    );
}

function formatEffect(item) {
    const e =
        item.effect || {};

    const result = [];

    if (e.yeuDao) {
        result.push(
            "🐉 **YÊU ĐẠO**"
        );
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

function makeShopButtons(
    page,
    totalPages,
    disabled = false
) {
    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `shop_page_prev_${page}`
                )
                .setLabel(
                    "◀ Trang trước"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled ||
                    page <= 1
                ),

            new ButtonBuilder()
                .setCustomId(
                    `shop_page_current_${page}`
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
                    `shop_page_next_${page}`
                )
                .setLabel(
                    "Trang sau ▶"
                )
                .setStyle(
                    ButtonStyle.Secondary
                )
                .setDisabled(
                    disabled ||
                    page >= totalPages
                )
        );
}

function makeItemBuyButtons(items) {
    if (!items.length) {
        return null;
    }

    return new ActionRowBuilder()
        .addComponents(
            items
                .slice(0, 3)
                .map(item =>
                    new ButtonBuilder()
                        .setCustomId(
                            `shop_buy_${item.id}`
                        )
                        .setLabel(
                            `💎 ${item.id}`
                                .slice(
                                    0,
                                    80
                                )
                        )
                        .setStyle(
                            ButtonStyle.Success
                        )
                )
        );
}

async function showShopPage(
    interaction,
    requestedPage = 1,
    update = false
) {
    const items =
        getUnifiedItems();

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
                Number(
                    requestedPage
                ) || 1
            ),
            totalPages
        );

    const currentItems =
        items.slice(
            (page - 1) *
                perPage,
            page *
                perPage
        );

    const player =
        getPlayer(
            interaction.user.id
        );

    const linhThach =
        Number(
            player?.linhThach
        ) || 0;

    let description =
        `💰 **Linh Thạch:** ${linhThach.toLocaleString()}\n` +
        `📦 **${items.length} vật phẩm**\n` +
        `📖 **Trang ${page}/${totalPages}**\n\n`;

    for (
        const item
        of currentItems
    ) {
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

    const embed =
        new EmbedBuilder()
            .setColor(
                0x9b59b6
            )
            .setTitle(
                "🛒 CỬA HÀNG HỒNG HOANG"
            )
            .setDescription(
                description
            )
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
        components.push(
            buyButtons
        );
    }

    const payload = {
        embeds: [
            embed
        ],
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

async function buyItem(
    interaction,
    rawId,
    fromButton = false
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

    const items =
        getUnifiedItems();

    let item =
        items.find(
            x =>
                String(x.id)
                    .toLowerCase() ===
                itemId
        );

    if (!item) {
        item =
            items.find(
                x =>
                    String(
                        x.legacyId ||
                        ""
                    )
                        .toLowerCase() ===
                    itemId
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
                `💎 Giá: **${item.cost.toLocaleString()}**\n` +
                `💰 Bạn có: **${linhThach.toLocaleString()}**\n` +
                `🆔 ID: \`${item.id}\``,
            ephemeral: true
        });
    }

    const category =
        item.category;

    const tuiDo =
        player.tuiDo || {};

    const owned =
        Array.isArray(
            tuiDo[category]
        )
            ? [
                ...tuiDo[
                    category
                ]
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

        yeuDao:
            item.effect?.yeuDao ||
            false,

        loai:
            item.effect?.loai ||
            null
    });

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
                        name:
                            "🆔 ID",
                        value:
                            `\`${item.id}\``,
                        inline: true
                    },
                    {
                        name:
                            "🏪 Shop",
                        value:
                            item.shopName,
                        inline: true
                    },
                    {
                        name:
                            "💎 Đã trả",
                        value:
                            item.cost.toLocaleString(),
                        inline: true
                    },
                    {
                        name:
                            "💰 Còn lại",
                        value:
                            (
                                linhThach -
                                item.cost
                            ).toLocaleString(),
                        inline: true
                    },
                    {
                        name:
                            "✨ Hiệu ứng",
                        value:
                            formatEffect(
                                item
                            ),
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

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName(
                "cuahang"
            )
            .setDescription(
                "🛒 Cửa hàng Hồng Hoang"
            )
            .addSubcommand(
                sub =>
                    sub
                        .setName(
                            "xem"
                        )
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
            .addSubcommand(
                sub =>
                    sub
                        .setName(
                            "mua"
                        )
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
                false
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

    async handleComponent(
        interaction
    ) {
        const id =
            interaction.customId ||
            "";

        if (
            !id.startsWith(
                "shop_"
            )
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

        if (
            id.startsWith(
                "shop_page_prev_"
            )
        ) {
            const currentPage =
                Number(
                    id.replace(
                        "shop_page_prev_",
                        ""
                    )
                ) || 1;

            return showShopPage(
                interaction,
                Math.max(
                    1,
                    currentPage - 1
                ),
                true
            );
        }

        if (
            id.startsWith(
                "shop_page_next_"
            )
        ) {
            const currentPage =
                Number(
                    id.replace(
                        "shop_page_next_",
                        ""
                    )
                ) || 1;

            return showShopPage(
                interaction,
                currentPage + 1,
                true
            );
        }

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
                itemId,
                true
            );
        }

        return false;
    }
};

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

module.exports.getShopStats =
    getShopStats;
