const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const db = require("./database");

// =====================================================
// ☠️ CẢNH GIỚI MA ĐẠO
// 18 CẢNH GIỚI × 9 TẦNG
// =====================================================

const MA_DAO_REALMS = [
    "Ma Đồ",
    "Ma Tu",
    "Ma Sư",
    "Đại Ma Sư",
    "Ma Tướng",
    "Ma Vương",
    "Ma Hoàng",
    "Ma Đế",
    "Ma Tôn",
    "Ma Thánh",
    "Ma Quân",
    "Ma Thần",
    "Thiên Ma",
    "Cổ Ma",
    "Thủy Tổ Ma",
    "Vô Thượng Ma",
    "Hỗn Độn Ma",
    "Ma Đạo Chí Tôn"
];

const PHAM_CAP = [
    "Huyền",
    "Địa",
    "Thiên",
    "Tiên",
    "Thánh",
    "Đế",
    "Chí Tôn",
    "Hỗn Độn",
    "Thủy Tổ"
];

// =====================================================
// 📜 CÔNG PHÁP MA ĐẠO
// =====================================================

const CONG_PHAP = [
    ["Huyết Ma Kinh", "Huyền", 10, 5, 5],
    ["Cửu U Ma Kinh", "Huyền", 8, 8, 10],
    ["La Sát Ma Công", "Địa", 20, 10, 15],
    ["Vạn Hồn Ma Điển", "Địa", 25, 8, 12],
    ["Thiên Ma Luyện Thể Quyết", "Địa", 10, 30, 10],
    ["Phệ Hồn Đại Pháp", "Thiên", 40, 15, 20],
    ["Thôn Thiên Ma Công", "Thiên", 45, 10, 25],
    ["Hắc Liên Ma Kinh", "Thiên", 35, 30, 20],
    ["Cửu Sát Ma Quyết", "Thiên", 55, 15, 25],
    ["Tu La Huyết Điển", "Thiên", 50, 20, 35],
    ["U Minh Ma Điển", "Tiên", 40, 50, 35],
    ["Thiên Ma Cửu Biến", "Tiên", 65, 25, 50],
    ["Vạn Ma Quy Nguyên Công", "Tiên", 60, 30, 55],
    ["Ma Long Thôn Thiên Quyết", "Tiên", 75, 35, 50],
    ["Diệt Hồn Ma Kinh", "Tiên", 80, 30, 60],
    ["Cửu U Phệ Thiên Công", "Thánh", 100, 50, 80],
    ["Vô Tướng Thiên Ma Kinh", "Thánh", 90, 70, 75],
    ["Huyết Hải Ma Công", "Thánh", 85, 90, 70],
    ["Vạn Kiếp Ma Điển", "Thánh", 110, 100, 100],
    ["Diệt Thế Ma Kinh", "Thánh", 140, 60, 110],
    ["Hỗn Độn Ma Điển", "Đế", 180, 150, 160],
    ["Thôn Thiên Ma Đế Quyết", "Đế", 220, 120, 180],
    ["Cửu U Ma Đế Kinh", "Đế", 190, 180, 170],
    ["Vạn Hồn Ma Đế Điển", "Đế", 210, 160, 190],
    ["Tu La Ma Đế Quyết", "Đế", 250, 130, 220],
    ["Vô Thượng Thiên Ma Kinh", "Chí Tôn", 350, 300, 320],
    ["Hắc Ám Ma Tổ Điển", "Chí Tôn", 400, 280, 350],
    ["Hỗn Độn Ma Tổ Kinh", "Hỗn Độn", 550, 500, 500],
    ["Vạn Ma Thủy Tổ Công", "Thủy Tổ", 800, 700, 750],
    ["Ma Đạo Thủy Tổ Kinh", "Thủy Tổ", 1000, 1000, 1000]
].map((x, i) => ({
    id: `ma_congphap_${i + 1}`,
    ten: `📜 ${x[0]}`,
    phamCap: x[1],
    cong: x[2],
    thu: x[3],
    hp: x[4]
}));

// =====================================================
// ⚔️ PHÁP BẢO MA ĐẠO
// =====================================================

const PHAP_BAO = [
    ["Ma Huyết Kiếm", "Huyền", 20, 5, 10],
    ["Cửu U Ma Đao", "Huyền", 25, 8, 5],
    ["La Sát Ma Kích", "Địa", 45, 15, 15],
    ["Vạn Hồn Phiên", "Địa", 40, 20, 25],
    ["Phệ Hồn Châu", "Địa", 50, 15, 20],
    ["Huyết Ma Châu", "Thiên", 70, 30, 50],
    ["Thiên Ma Giáp", "Thiên", 30, 80, 70],
    ["Cửu U Ma Liên", "Thiên", 60, 50, 80],
    ["Thôn Thiên Hồ", "Thiên", 90, 40, 60],
    ["Ma Long Kiếm", "Thiên", 100, 35, 50],
    ["Tu La Huyết Nhận", "Tiên", 140, 60, 90],
    ["U Minh Ma Quan", "Tiên", 80, 120, 150],
    ["Vạn Ma Kỳ", "Tiên", 120, 100, 110],
    ["Diệt Hồn Đao", "Tiên", 180, 70, 80],
    ["Hắc Liên Ma Ấn", "Tiên", 130, 130, 120],
    ["Thiên Ma Tháp", "Thánh", 200, 180, 250],
    ["Huyết Hải Ma Châu", "Thánh", 250, 150, 220],
    ["Cửu U Ma Chung", "Thánh", 220, 250, 200],
    ["Vạn Hồn Ma Đỉnh", "Thánh", 240, 220, 280],
    ["Diệt Thế Ma Kích", "Thánh", 350, 150, 180],
    ["Hỗn Độn Ma Kiếm", "Đế", 500, 300, 400],
    ["Thôn Thiên Ma Hồ", "Đế", 450, 350, 500],
    ["Vô Tướng Ma Y", "Đế", 300, 500, 550],
    ["Ma Đế Chi Nhãn", "Đế", 600, 350, 450],
    ["Tu La Ma Giáp", "Đế", 350, 600, 650],
    ["Vạn Kiếp Ma Luân", "Chí Tôn", 750, 700, 750],
    ["Hắc Ám Ma Đỉnh", "Chí Tôn", 800, 800, 850],
    ["Hỗn Độn Ma Chung", "Hỗn Độn", 1000, 1000, 1100],
    ["Ma Tổ Chi Nhãn", "Thủy Tổ", 1500, 1200, 1500],
    ["Ma Đạo Thủy Tổ Đỉnh", "Thủy Tổ", 2000, 2000, 2200]
].map((x, i) => ({
    id: `ma_phapbao_${i + 1}`,
    ten: `⚔️ ${x[0]}`,
    phamCap: x[1],
    cong: x[2],
    thu: x[3],
    hp: x[4]
}));
// =====================================================
// 💊 ĐAN DƯỢC MA ĐẠO
// =====================================================

const DAN_DUOC = [
    {
        id: "ma_khi_dan",
        ten: "☠️ Ma Khí Đan",
        phamCap: "Huyền",
        tuvi: 500
    },
    {
        id: "huyet_ma_dan",
        ten: "🩸 Huyết Ma Đan",
        phamCap: "Địa",
        hp: 1000
    },
    {
        id: "bao_ma_dan",
        ten: "🔥 Bạo Ma Đan",
        phamCap: "Địa",
        cong: 100
    },
    {
        id: "cuu_u_dan",
        ten: "🌑 Cửu U Đan",
        phamCap: "Thiên",
        tuvi: 5000
    },
    {
        id: "phe_hon_dan",
        ten: "👻 Phệ Hồn Đan",
        phamCap: "Thiên",
        cong: 500
    },
    {
        id: "thien_ma_dan",
        ten: "😈 Thiên Ma Đan",
        phamCap: "Tiên",
        tuvi: 20000
    },
    {
        id: "ma_vuong_dan",
        ten: "👑 Ma Vương Đan",
        phamCap: "Tiên",
        tuvi: 50000
    },
    {
        id: "ma_hoang_dan",
        ten: "👑 Ma Hoàng Đan",
        phamCap: "Thánh",
        tuvi: 150000
    },
    {
        id: "ma_de_dan",
        ten: "☠️ Ma Đế Đan",
        phamCap: "Đế",
        tuvi: 500000
    },
    {
        id: "ma_ton_dan",
        ten: "🩸 Ma Tôn Đan",
        phamCap: "Chí Tôn",
        tuvi: 2000000
    },
    {
        id: "hon_don_ma_dan",
        ten: "🌌 Hỗn Độn Ma Đan",
        phamCap: "Hỗn Độn",
        tuvi: 10000000
    },
    {
        id: "thuy_to_ma_dan",
        ten: "👹 Thủy Tổ Ma Đan",
        phamCap: "Thủy Tổ",
        tuvi: 50000000
    }
];

// =====================================================
// 🔧 KHỞI TẠO DỮ LIỆU MA ĐẠO
// =====================================================

function ensureMaDao(player) {
    if (!player.maDao) {
        player.maDao = {
            canhGioi: "Ma Đồ",
            tang: 1,
            tuVi: 0,
            congPhap: null,
            phapBao: null,
            danDuoc: []
        };
    }

    if (!player.maDao.canhGioi) {
        player.maDao.canhGioi = "Ma Đồ";
    }

    if (!player.maDao.tang) {
        player.maDao.tang = 1;
    }

    if (player.maDao.tuVi === undefined) {
        player.maDao.tuVi = 0;
    }

    if (!Array.isArray(player.maDao.danDuoc)) {
        player.maDao.danDuoc = [];
    }

    return player.maDao;
}

// =====================================================
// 📊 CHỈ SỐ MA ĐẠO
// =====================================================

function getRealmIndex(maDao) {
    const index =
        MA_DAO_REALMS.indexOf(maDao.canhGioi);

    return index < 0 ? 0 : index;
}

function getMaDaoStats(maDao) {
    const realm =
        getRealmIndex(maDao);

    const tang =
        Math.max(1, Number(maDao.tang || 1));

    const power =
        Math.pow(3, realm) * tang;

    return {
        cong: Math.floor(power * 10),
        thu: Math.floor(power * 7),
        hp: Math.floor(power * 50)
    };
}

// =====================================================
// 💾 LƯU DỮ LIỆU
// =====================================================

function savePlayer(player) {
    try {
        if (
            db &&
            typeof db.updatePlayer === "function"
        ) {
            db.updatePlayer(
                player.id,
                {
                    maDao: player.maDao
                }
            );
        }
    } catch (error) {
        console.error(
            "❌ Lỗi lưu dữ liệu Ma Đạo:",
            error
        );
    }
}

// =====================================================
// 📜 TRANG BỊ CÔNG PHÁP
// =====================================================

function equipCongPhap(player, id) {
    const item =
        CONG_PHAP.find(
            x => x.id === id
        );

    if (!item) {
        return false;
    }

    ensureMaDao(player);

    player.maDao.congPhap = {
        ...item
    };

    savePlayer(player);

    return true;
}

// =====================================================
// ⚔️ TRANG BỊ PHÁP BẢO
// =====================================================

function equipPhapBao(player, id) {
    const item =
        PHAP_BAO.find(
            x => x.id === id
        );

    if (!item) {
        return false;
    }

    ensureMaDao(player);

    player.maDao.phapBao = {
        ...item
    };

    savePlayer(player);

    return true;
}

// =====================================================
// ☠️ MENU CHÍNH
// =====================================================

function makeMainMenu(userId) {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `madao_menu_${userId}`
                )
                .setPlaceholder(
                    "☠️ Chọn chức năng Ma Đạo"
                )
                .addOptions([
                    {
                        label: "Xem Công Pháp",
                        description:
                            "Xem và trang bị công pháp Ma Đạo",
                        value: "congphap",
                        emoji: "📜"
                    },
                    {
                        label: "Xem Pháp Bảo",
                        description:
                            "Xem và trang bị pháp bảo Ma Đạo",
                        value: "phapbao",
                        emoji: "⚔️"
                    },
                    {
                        label: "Xem Đan Dược",
                        description:
                            "Xem đan dược Ma Đạo",
                        value: "dando",
                        emoji: "💊"
                    },
                    {
                        label: "Cảnh Giới Ma Đạo",
                        description:
                            "Xem 18 cảnh giới Ma Đạo",
                        value: "canhgioi",
                        emoji: "👹"
                    }
                ])
        );
}

// =====================================================
// 📜 MENU ITEM
// =====================================================

function makeItemMenu(
    userId,
    type,
    page = 0
) {
    const list =
        type === "congphap"
            ? CONG_PHAP
            : PHAP_BAO;

    const pageSize = 25;

    const maxPage =
        Math.max(
            0,
            Math.ceil(
                list.length / pageSize
            ) - 1
        );

    page = Math.max(
        0,
        Math.min(
            Number(page) || 0,
            maxPage
        )
    );

    const start =
        page * pageSize;

    const items =
        list.slice(
            start,
            start + pageSize
        );

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                `madao_menu_${userId}_${type}_${page}`
            )
            .setPlaceholder(
                type === "congphap"
                    ? "📜 Chọn công pháp"
                    : "⚔️ Chọn pháp bảo"
            )
            .addOptions(
                items.map(item => ({
                    label:
                        item.ten
                            .replace(
                                /^\S+\s/,
                                ""
                            )
                            .slice(0, 100),

                    description:
                        `${item.phamCap} • ` +
                        `Công +${item.cong} • ` +
                        `Thủ +${item.thu} • ` +
                        `HP +${item.hp}`
                            .slice(0, 100),

                    value:
                        `equip_${item.id}`,

                    emoji:
                        type === "congphap"
                            ? "📜"
                            : "⚔️"
                }))
            );

    const rows = [
        new ActionRowBuilder()
            .addComponents(menu)
    ];

    const nav = [];

    if (page > 0) {
        nav.push({
            label: "Trang trước",
            description:
                `Xem trang ${page}`,
            value:
                `page_${page - 1}`,
            emoji: "⬅️"
        });
    }

    if (page < maxPage) {
        nav.push({
            label: "Trang sau",
            description:
                `Xem trang ${page + 2}`,
            value:
                `page_${page + 1}`,
            emoji: "➡️"
        });
    }

    nav.push({
        label: "Quay lại",
        description:
            "Về menu Ma Đạo",
        value: "back",
        emoji: "🏠"
    });

    rows.push(
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `madao_menu_${userId}_${type}_nav_${page}`
                    )
                    .setPlaceholder(
                        `Trang ${page + 1}/${maxPage + 1}`
                    )
                    .addOptions(nav)
            )
    );

    return rows;
}

// =====================================================
// 💊 HIỂN THỊ ĐAN DƯỢC
// =====================================================

function makeDanDuocMenu(userId) {
    const options =
        DAN_DUOC.map(item => ({
            label:
                item.ten
                    .replace(
                        /^\S+\s/,
                        ""
                    )
                    .slice(0, 100),

            description:
                `${item.phamCap} • ` +
                (
                    item.tuvi
                        ? `Tu Vi +${item.tuvi}`
                        : item.cong
                            ? `Công +${item.cong}`
                            : `HP +${item.hp}`
                ).slice(0, 100),

            value:
                `dan_${item.id}`,

            emoji: "💊"
        }));

    return [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `madao_menu_${userId}_dando`
                    )
                    .setPlaceholder(
                        "💊 Chọn đan dược"
                    )
                    .addOptions(options)
            ),
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `madao_menu_${userId}_dando_nav`
                    )
                    .setPlaceholder(
                        "⬅️ Quay lại"
                    )
                    .addOptions([
                        {
                            label:
                                "Quay lại menu chính",
                            description:
                                "Trở về Ma Đạo",
                            value: "back",
                            emoji: "🏠"
                        }
                    ])
            )
    ];
}

// =====================================================
// 👹 HIỂN THỊ CẢNH GIỚI
// =====================================================

function makeRealmEmbed(maDao) {
    const index =
        getRealmIndex(maDao);

    const stats =
        getMaDaoStats(maDao);

    const next =
        MA_DAO_REALMS[index + 1];

    const embed =
        new EmbedBuilder()
            .setTitle(
                "☠️ CẢNH GIỚI MA ĐẠO"
            )
            .setDescription(
                [
                    `👹 Cảnh giới: **${maDao.canhGioi}**`,
                    `🔥 Tầng: **${maDao.tang}/9**`,
                    `☠️ Ma Tu Vi: **${Number(maDao.tuVi || 0).toLocaleString()}**`,
                    "",
                    `⚔️ Công: **${stats.cong.toLocaleString()}**`,
                    `🛡️ Thủ: **${stats.thu.toLocaleString()}**`,
                    `❤️ HP: **${stats.hp.toLocaleString()}**`,
                    "",
                    next
                        ? `➡️ Cảnh giới tiếp theo: **${next}**`
                        : "🌌 Đã đạt cảnh giới tối cao!"
                ].join("\n")
            );

    return embed;
}

// =====================================================
// 📜 EMBED CÔNG PHÁP
// =====================================================

function makeCongPhapEmbed(maDao) {
    const current =
        maDao.congPhap;

    const stats =
        current
            ? `⚔️ Công +${current.cong}\n` +
              `🛡️ Thủ +${current.thu}\n` +
              `❤️ HP +${current.hp}`
            : "❌ Chưa trang bị công pháp.";

    return new EmbedBuilder()
        .setTitle(
            "📜 CÔNG PHÁP MA ĐẠO"
        )
        .setDescription(
            current
                ? [
                    `📜 Đang dùng: **${current.ten}**`,
                    `💠 Phẩm cấp: **${current.phamCap}**`,
                    "",
                    stats
                ].join("\n")
                : stats
        )
        .setFooter({
            text:
                "Chọn công pháp bên dưới để trang bị."
        });
}

// =====================================================
// ⚔️ EMBED PHÁP BẢO
// =====================================================

function makePhapBaoEmbed(maDao) {
    const current =
        maDao.phapBao;

    const stats =
        current
            ? `⚔️ Công +${current.cong}\n` +
              `🛡️ Thủ +${current.thu}\n` +
              `❤️ HP +${current.hp}`
            : "❌ Chưa trang bị pháp bảo.";

    return new EmbedBuilder()
        .setTitle(
            "⚔️ PHÁP BẢO MA ĐẠO"
        )
        .setDescription(
            current
                ? [
                    `⚔️ Đang dùng: **${current.ten}**`,
                    `💠 Phẩm cấp: **${current.phamCap}**`,
                    "",
                    stats
                ].join("\n")
                : stats
        )
        .setFooter({
            text:
                "Chọn pháp bảo bên dưới để trang bị."
        });
}

// =====================================================
// 💊 EMBED ĐAN DƯỢC
// =====================================================

function makeDanEmbed() {
    return new EmbedBuilder()
        .setTitle(
            "💊 ĐAN DƯỢC MA ĐẠO"
        )
        .setDescription(
            DAN_DUOC.map(
                (item, index) => {
                    let effect =
                        item.tuvi
                            ? `Ma Tu Vi +${item.tuvi.toLocaleString()}`
                            : item.cong
                                ? `Công +${item.cong}`
                                : `HP +${item.hp}`;

                    return (
                        `**${index + 1}.** ` +
                        `${item.ten}\n` +
                        `💠 ${item.phamCap} • ${effect}`
                    );
                }
            ).join("\n\n")
        );
}

// =====================================================
// ☠️ XỬ LÝ MENU MA ĐẠO
// =====================================================

async function handleMenu(interaction) {

    const customId =
        interaction.customId || "";

    const userId =
        interaction.user.id;

    const parts =
        customId.split("_");

    const selected =
        interaction.values &&
        interaction.values[0];

    let player;

    try {
        if (
            db &&
            typeof db.getPlayer === "function"
        ) {
            player =
                db.getPlayer(userId);
        }
    } catch (error) {
        console.error(
            "❌ Lỗi lấy player Ma Đạo:",
            error
        );
    }

    if (!player) {
        return interaction.reply({
            content:
                "❌ Không tìm thấy dữ liệu nhân vật.",
            ephemeral: true
        });
    }

    ensureMaDao(player);

    // =================================================
    // MENU CHÍNH
    // =================================================

    if (
        selected === "congphap"
    ) {
        return interaction.update({
            embeds: [
                makeCongPhapEmbed(
                    player.maDao
                )
            ],
            components:
                makeItemMenu(
                    userId,
                    "congphap",
                    0
                )
        });
    }

    if (
        selected === "phapbao"
    ) {
        return interaction.update({
            embeds: [
                makePhapBaoEmbed(
                    player.maDao
                )
            ],
            components:
                makeItemMenu(
                    userId,
                    "phapbao",
                    0
                )
        });
    }

    if (
        selected === "dando"
    ) {
        return interaction.update({
            embeds: [
                makeDanEmbed()
            ],
            components:
                makeDanDuocMenu(
                    userId
                )
        });
    }

    if (
        selected === "canhgioi"
    ) {
        return interaction.update({
            embeds: [
                makeRealmEmbed(
                    player.maDao
                )
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(
                                `madao_menu_${userId}`
                            )
                            .setPlaceholder(
                                "⬅️ Quay lại"
                            )
                            .addOptions([
                                {
                                    label:
                                        "Quay lại menu chính",
                                    description:
                                        "Trở về Ma Đạo",
                                    value:
                                        "back",
                                    emoji: "🏠"
                                }
                            ])
                    )
            ]
        });
    }

    // =================================================
    // QUAY LẠI
    // =================================================

    if (
        selected === "back"
    ) {
        return interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "☠️ HỆ THỐNG MA ĐẠO"
                    )
                    .setDescription(
                        "Chọn một chức năng bên dưới."
                    )
            ],
            components: [
                makeMainMenu(userId)
            ]
        });
    }

    // =================================================
    // TRANG
    // =================================================

    if (
        selected &&
        selected.startsWith(
            "page_"
        )
    ) {
        const page =
            Number(
                selected
                    .replace(
                        "page_",
                        ""
                    )
            );

        const type =
            parts.includes(
                "congphap"
            )
                ? "congphap"
                : "phapbao";

        return interaction.update({
            components:
                makeItemMenu(
                    userId,
                    type,
                    page
                )
        });
    }

    // =================================================
    // TRANG BỊ CÔNG PHÁP
    // =================================================

    if (
        selected &&
        selected.startsWith(
            "equip_ma_congphap_"
        )
    ) {
        const id =
            selected.replace(
                "equip_",
                ""
            );

        const ok =
            equipCongPhap(
                player,
                id
            );

        if (!ok) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy công pháp.",
                ephemeral: true
            });
        }

        return interaction.update({
            embeds: [
                makeCongPhapEmbed(
                    player.maDao
                )
            ],
            components:
                makeItemMenu(
                    userId,
                    "congphap",
                    0
                )
        });
    }

    // =================================================
    // TRANG BỊ PHÁP BẢO
    // =================================================

    if (
        selected &&
        selected.startsWith(
            "equip_ma_phapbao_"
        )
    ) {
        const id =
            selected.replace(
                "equip_",
                ""
            );

        const ok =
            equipPhapBao(
                player,
                id
            );

        if (!ok) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy pháp bảo.",
                ephemeral: true
            });
        }

        return interaction.update({
            embeds: [
                makePhapBaoEmbed(
                    player.maDao
                )
            ],
            components:
                makeItemMenu(
                    userId,
                    "phapbao",
                    0
                )
        });
    }

    // =================================================
    // CHỌN ĐAN DƯỢC
    // =================================================

    if (
        selected &&
        selected.startsWith(
            "dan_"
        )
    ) {
        const id =
            selected.replace(
                "dan_",
                ""
            );

        const item =
            DAN_DUOC.find(
                x => x.id === id
            );

        if (!item) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy đan dược.",
                ephemeral: true
            });
        }

        return interaction.reply({
            content:
                [
                    `${item.ten}`,
                    `💠 Phẩm cấp: **${item.phamCap}**`,
                    item.tuvi
                        ? `☠️ Ma Tu Vi: **+${item.tuvi.toLocaleString()}**`
                        : "",
                    item.cong
                        ? `⚔️ Công: **+${item.cong}**`
                        : "",
                    item.hp
                        ? `❤️ HP: **+${item.hp.toLocaleString()}**`
                        : "",
                    "",
                    "💡 Đan dược được hiển thị tại đây."
                ]
                    .filter(Boolean)
                    .join("\n"),
            ephemeral: true
        });
    }

    // =================================================
    // KHÔNG NHẬN DIỆN
    // =================================================

    return interaction.reply({
        content:
            "❌ Chức năng Ma Đạo này chưa được hỗ trợ.",
        ephemeral: true
    });
}

// =====================================================
// 📜 LỆNH /MADAO
// =====================================================

async function execute(interaction) {

    const userId =
        interaction.user.id;

    let player;

    try {
        player =
            db.getPlayer(userId);
    } catch (error) {
        console.error(error);
    }

    if (!player) {
        return interaction.reply({
            content:
                "❌ Bạn chưa có nhân vật. Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    ensureMaDao(player);

    const stats =
        getMaDaoStats(
            player.maDao
        );

    const embed =
        new EmbedBuilder()
            .setTitle(
                "☠️ HỒNG HOANG — MA ĐẠO"
            )
            .setDescription(
                [
                    `👹 Cảnh giới: **${player.maDao.canhGioi}**`,
                    `🔥 Tầng: **${player.maDao.tang}/9**`,
                    `☠️ Ma Tu Vi: **${Number(player.maDao.tuVi || 0).toLocaleString()}**`,
                    "",
                    `⚔️ Công: **${stats.cong.toLocaleString()}**`,
                    `🛡️ Thủ: **${stats.thu.toLocaleString()}**`,
                    `❤️ HP: **${stats.hp.toLocaleString()}**`,
                    "",
                    player.maDao.congPhap
                        ? `📜 Công pháp: **${player.maDao.congPhap.ten}**`
                        : "📜 Công pháp: **Chưa trang bị**",
                    player.maDao.phapBao
                        ? `⚔️ Pháp bảo: **${player.maDao.phapBao.ten}**`
                        : "⚔️ Pháp bảo: **Chưa trang bị**"
                ].join("\n")
            )
            .setFooter({
                text:
                    "☠️ Ma Đạo — Hồng Hoang Đại Lục"
            });

    return interaction.reply({
        embeds: [embed],
        components: [
            makeMainMenu(userId)
        ]
    });
}

// =====================================================
// 📦 EXPORT
// =====================================================

module.exports = {
    data:
        new SlashCommandBuilder()
            .setName("madao")
            .setDescription(
                "☠️ Mở hệ thống Ma Đạo"
            ),

    execute,

    handleMenu,

    MA_DAO_REALMS,

    CONG_PHAP,

    PHAP_BAO,

    DAN_DUOC,

    ensureMaDao,

    getMaDaoStats
};
