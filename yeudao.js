const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const db = require("./database");

// =====================================================
// 🐉 HỆ THỐNG YÊU ĐẠO
// 18 CẢNH GIỚI × 9 TẦNG
// 50 CÔNG PHÁP
// 50 PHÁP BẢO
// 30 ĐAN DƯỢC
// 15 HUYẾT MẠCH
// =====================================================

// =====================================================
// 👹 CẢNH GIỚI
// =====================================================

const YEU_DAO_REALMS = [
    "Yêu Thú",
    "Yêu Binh",
    "Yêu Tướng",
    "Đại Yêu",
    "Yêu Vương",
    "Yêu Hoàng",
    "Yêu Đế",
    "Yêu Tôn",
    "Yêu Thánh",
    "Yêu Quân",
    "Yêu Thần",
    "Thiên Yêu",
    "Cổ Yêu",
    "Thái Cổ Yêu",
    "Yêu Tổ",
    "Vô Thượng Yêu",
    "Hỗn Độn Yêu",
    "Yêu Đạo Chí Tôn"
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
// 📜 50 CÔNG PHÁP
// =====================================================

const CONG_PHAP_NAMES = [
    ["Hoàng Huyết Luyện Thể Quyết", "Huyền"],
    ["Thanh Mộc Yêu Kinh", "Huyền"],
    ["Thiên Lang Khiếu Nguyệt Công", "Huyền"],
    ["Kim Sư Bá Thể Quyết", "Huyền"],
    ["Thái Cổ Xà Linh Kinh", "Huyền"],
    ["Bạch Hổ Sát Sinh Quyết", "Địa"],
    ["Huyền Vũ Trấn Hải Kinh", "Địa"],
    ["Chu Tước Liệt Thiên Công", "Địa"],
    ["Thanh Long Hóa Thiên Quyết", "Địa"],
    ["Cửu Vĩ Thiên Hồ Kinh", "Địa"],
    ["Kim Ô Thôn Nhật Quyết", "Thiên"],
    ["Thao Thiết Thôn Thiên Công", "Thiên"],
    ["Côn Bằng Phệ Hải Kinh", "Thiên"],
    ["Vạn Thú Quy Nguyên Công", "Thiên"],
    ["Thiên Yêu Luyện Thể Quyết", "Thiên"],
    ["Bạch Hổ Thánh Sát Kinh", "Tiên"],
    ["Thanh Long Cửu Biến", "Tiên"],
    ["Chu Tước Niết Bàn Kinh", "Tiên"],
    ["Huyền Vũ Bất Diệt Thể", "Tiên"],
    ["Cửu Vĩ Mị Ảnh Thiên Kinh", "Tiên"],
    ["Kim Ô Chân Hỏa Điển", "Thánh"],
    ["Côn Bằng Thiên Hải Kinh", "Thánh"],
    ["Thao Thiết Phệ Thiên Quyết", "Thánh"],
    ["Vạn Yêu Quy Nguyên Kinh", "Thánh"],
    ["Thiên Hoang Yêu Điển", "Thánh"],
    ["Yêu Đế Chân Kinh", "Đế"],
    ["Yêu Hoàng Diệt Thế Công", "Đế"],
    ["Yêu Tôn Vạn Kiếp Quyết", "Đế"],
    ["Yêu Thần Cổ Kinh", "Đế"],
    ["Vạn Cổ Yêu Thần Công", "Đế"],
    ["Cửu Thiên Yêu Long Kinh", "Chí Tôn"],
    ["Tổ Long Hóa Đạo Kinh", "Chí Tôn"],
    ["Bất Tử Yêu Hoàng Kinh", "Chí Tôn"],
    ["Thái Cổ Vạn Yêu Kinh", "Chí Tôn"],
    ["Vạn Thú Thôn Thiên Quyết", "Chí Tôn"],
    ["Hỗn Độn Yêu Kinh", "Hỗn Độn"],
    ["Hỗn Độn Thôn Phệ Kinh", "Hỗn Độn"],
    ["Hỗn Độn Tổ Long Quyết", "Hỗn Độn"],
    ["Hỗn Độn Côn Bằng Kinh", "Hỗn Độn"],
    ["Hỗn Độn Kim Ô Điển", "Hỗn Độn"],
    ["Yêu Tổ Bản Nguyên Kinh", "Thủy Tổ"],
    ["Vạn Yêu Thủy Tổ Công", "Thủy Tổ"],
    ["Tổ Long Thủy Tổ Kinh", "Thủy Tổ"],
    ["Thái Cổ Yêu Tổ Điển", "Thủy Tổ"],
    ["Vạn Thú Thủy Tổ Quyết", "Thủy Tổ"],
    ["Vô Thượng Yêu Tổ Kinh", "Thủy Tổ"],
    ["Hỗn Nguyên Yêu Đạo Kinh", "Thủy Tổ"],
    ["Yêu Đạo Bản Nguyên Kinh", "Thủy Tổ"],
    ["Vạn Cổ Yêu Đạo Chân Kinh", "Thủy Tổ"],
    ["Yêu Đạo Chí Tôn Kinh", "Thủy Tổ"]
];

const CONG_PHAP = CONG_PHAP_NAMES.map((x, i) => {
    const tier = PHAM_CAP.indexOf(x[1]);

    return {
        id: `yeu_congphap_${i + 1}`,
        ten: `📜 ${x[0]}`,
        phamCap: x[1],
        cong: 10 + tier * 35 + i * 5,
        thu: 5 + tier * 25 + i * 3,
        hp: 20 + tier * 60 + i * 8
    };
});

// =====================================================
// ⚔️ 50 PHÁP BẢO
// =====================================================

const PHAP_BAO_NAMES = [
    ["Yêu Huyết Đao", "Huyền"],
    ["Thiên Lang Kiếm", "Huyền"],
    ["Kim Sư Chiến Kích", "Huyền"],
    ["Thanh Mộc Yêu Trượng", "Huyền"],
    ["Thái Cổ Xà Nhẫn", "Huyền"],
    ["Bạch Hổ Sát Kiếm", "Địa"],
    ["Huyền Vũ Thần Thuẫn", "Địa"],
    ["Chu Tước Ly Hỏa Phiến", "Địa"],
    ["Thanh Long Thần Thương", "Địa"],
    ["Cửu Vĩ Hồ Châu", "Địa"],
    ["Kim Ô Thần Luân", "Thiên"],
    ["Thao Thiết Thôn Thiên Hồ", "Thiên"],
    ["Côn Bằng Hải Đỉnh", "Thiên"],
    ["Vạn Yêu Phiên", "Thiên"],
    ["Thiên Yêu Giáp", "Thiên"],
    ["Bạch Hổ Thánh Kiếm", "Tiên"],
    ["Thanh Long Thiên Thương", "Tiên"],
    ["Chu Tước Thần Cung", "Tiên"],
    ["Huyền Vũ Thánh Thuẫn", "Tiên"],
    ["Cửu Vĩ Thiên Hồ Châu", "Tiên"],
    ["Kim Ô Chân Hỏa Luân", "Thánh"],
    ["Côn Bằng Thiên Hải Đỉnh", "Thánh"],
    ["Thao Thiết Thôn Thiên Đỉnh", "Thánh"],
    ["Vạn Yêu Thần Kỳ", "Thánh"],
    ["Thiên Hoang Yêu Kiếm", "Thánh"],
    ["Yêu Hoàng Thiên Ấn", "Đế"],
    ["Yêu Đế Chi Nhãn", "Đế"],
    ["Yêu Tôn Ma Kích", "Đế"],
    ["Yêu Thần Cổ Đỉnh", "Đế"],
    ["Vạn Cổ Yêu Luân", "Đế"],
    ["Tổ Long Thần Thương", "Chí Tôn"],
    ["Tổ Long Nghịch Lân", "Chí Tôn"],
    ["Bất Tử Phượng Hoàng Phiến", "Chí Tôn"],
    ["Thái Cổ Vạn Thú Đỉnh", "Chí Tôn"],
    ["Vạn Yêu Thần Ấn", "Chí Tôn"],
    ["Hỗn Độn Yêu Chung", "Hỗn Độn"],
    ["Hỗn Độn Yêu Đỉnh", "Hỗn Độn"],
    ["Hỗn Độn Tổ Long Châu", "Hỗn Độn"],
    ["Hỗn Độn Côn Bằng Đồ", "Hỗn Độn"],
    ["Hỗn Độn Kim Ô Luân", "Hỗn Độn"],
    ["Yêu Tổ Thần Trượng", "Thủy Tổ"],
    ["Vạn Yêu Thủy Tổ Đỉnh", "Thủy Tổ"],
    ["Tổ Long Thủy Tổ Ấn", "Thủy Tổ"],
    ["Thái Cổ Yêu Tổ Kiếm", "Thủy Tổ"],
    ["Vạn Thú Thủy Tổ Kỳ", "Thủy Tổ"],
    ["Vô Thượng Yêu Tổ Thần Binh", "Thủy Tổ"],
    ["Hỗn Nguyên Yêu Đạo Đỉnh", "Thủy Tổ"],
    ["Yêu Đạo Bản Nguyên Châu", "Thủy Tổ"],
    ["Vạn Cổ Yêu Đạo Thần Ấn", "Thủy Tổ"],
    ["Yêu Đạo Chí Tôn Đỉnh", "Thủy Tổ"]
];

const PHAP_BAO = PHAP_BAO_NAMES.map((x, i) => {
    const tier = PHAM_CAP.indexOf(x[1]);

    return {
        id: `yeu_phapbao_${i + 1}`,
        ten: `⚔️ ${x[0]}`,
        phamCap: x[1],
        cong: 20 + tier * 45 + i * 7,
        thu: 10 + tier * 35 + i * 5,
        hp: 40 + tier * 80 + i * 10
    };
});

// =====================================================
// 💊 30 ĐAN DƯỢC
// =====================================================

const DAN_DUOC_NAMES = [
    ["Yêu Khí Đan", "Huyền", 500],
    ["Yêu Huyết Đan", "Huyền", 800],
    ["Yêu Linh Đan", "Huyền", 1200],
    ["Bạo Yêu Đan", "Huyền", 1500],
    ["Thanh Mộc Đan", "Địa", 2500],
    ["Thiên Lang Đan", "Địa", 3500],
    ["Bạch Hổ Huyết Đan", "Địa", 5000],
    ["Huyền Vũ Thần Đan", "Địa", 6000],
    ["Chu Tước Niết Bàn Đan", "Thiên", 10000],
    ["Thanh Long Tinh Huyết Đan", "Thiên", 15000],
    ["Kim Ô Chân Hỏa Đan", "Thiên", 20000],
    ["Côn Bằng Tinh Huyết Đan", "Thiên", 25000],
    ["Thao Thiết Thôn Thiên Đan", "Thiên", 30000],
    ["Vạn Thú Yêu Linh Đan", "Tiên", 50000],
    ["Cửu Vĩ Thiên Hồ Đan", "Tiên", 70000],
    ["Thiên Yêu Đan", "Tiên", 100000],
    ["Yêu Vương Đan", "Tiên", 150000],
    ["Yêu Hoàng Đan", "Thánh", 250000],
    ["Yêu Thánh Đan", "Thánh", 350000],
    ["Yêu Quân Đan", "Thánh", 500000],
    ["Yêu Đế Đan", "Đế", 800000],
    ["Yêu Tôn Đan", "Đế", 1200000],
    ["Yêu Thần Đan", "Đế", 2000000],
    ["Thiên Yêu Tổ Đan", "Chí Tôn", 3500000],
    ["Thái Cổ Yêu Đan", "Chí Tôn", 5000000],
    ["Yêu Tổ Đan", "Chí Tôn", 8000000],
    ["Hỗn Độn Yêu Đan", "Hỗn Độn", 15000000],
    ["Hỗn Độn Tổ Huyết Đan", "Hỗn Độn", 25000000],
    ["Yêu Đạo Bản Nguyên Đan", "Thủy Tổ", 50000000],
    ["Yêu Đạo Chí Tôn Đan", "Thủy Tổ", 100000000]
];

const DAN_DUOC = DAN_DUOC_NAMES.map((x, i) => ({
    id: `yeu_dan_${i + 1}`,
    ten: `💊 ${x[0]}`,
    phamCap: x[1],
    tuVi: x[2],
    cong: Math.floor(x[2] / 100),
    hp: x[2] * 2
}));

// =====================================================
// 🧬 15 HUYẾT MẠCH
// =====================================================

const HUYET_MACH = [
    {
        id: "to_long",
        ten: "🐉 Tổ Long Huyết Mạch",
        cap: "Thủy Tổ",
        cong: 500,
        thu: 450,
        hp: 1500
    },
    {
        id: "bach_ho",
        ten: "🐯 Bạch Hổ Huyết Mạch",
        cap: "Chí Tôn",
        cong: 650,
        thu: 300,
        hp: 1000
    },
    {
        id: "chu_tuoc",
        ten: "🔥 Chu Tước Huyết Mạch",
        cap: "Chí Tôn",
        cong: 550,
        thu: 350,
        hp: 1300
    },
    {
        id: "huyen_vu",
        ten: "🐢 Huyền Vũ Huyết Mạch",
        cap: "Chí Tôn",
        cong: 300,
        thu: 700,
        hp: 2000
    },
    {
        id: "kim_o",
        ten: "☀️ Kim Ô Huyết Mạch",
        cap: "Chí Tôn",
        cong: 700,
        thu: 300,
        hp: 1100
    },
    {
        id: "con_bang",
        ten: "🦅 Côn Bằng Huyết Mạch",
        cap: "Hỗn Độn",
        cong: 750,
        thu: 500,
        hp: 1600
    },
    {
        id: "thao_thiet",
        ten: "🐷 Thao Thiết Huyết Mạch",
        cap: "Hỗn Độn",
        cong: 900,
        thu: 350,
        hp: 1700
    },
    {
        id: "cuu_vi",
        ten: "🦊 Cửu Vĩ Thiên Hồ Huyết Mạch",
        cap: "Thánh",
        cong: 450,
        thu: 450,
        hp: 1000
    },
    {
        id: "thien_lang",
        ten: "🐺 Thiên Lang Huyết Mạch",
        cap: "Thiên",
        cong: 250,
        thu: 180,
        hp: 600
    },
    {
        id: "thai_co_xa",
        ten: "🐍 Thái Cổ Xà Huyết Mạch",
        cap: "Tiên",
        cong: 350,
        thu: 250,
        hp: 800
    },
    {
        id: "ung_long",
        ten: "🐲 Ứng Long Huyết Mạch",
        cap: "Đế",
        cong: 600,
        thu: 500,
        hp: 1400
    },
    {
        id: "dang_xa",
        ten: "🐍 Đằng Xà Huyết Mạch",
        cap: "Đế",
        cong: 500,
        thu: 550,
        hp: 1300
    },
    {
        id: "kim_su",
        ten: "🦁 Kim Sư Huyết Mạch",
        cap: "Địa",
        cong: 180,
        thu: 150,
        hp: 500
    },
    {
        id: "thai_co_tuong",
        ten: "🐘 Thái Cổ Tượng Huyết Mạch",
        cap: "Thánh",
        cong: 300,
        thu: 650,
        hp: 1800
    },
    {
        id: "hon_don_yeu",
        ten: "🌌 Hỗn Độn Yêu Huyết Mạch",
        cap: "Thủy Tổ",
        cong: 1200,
        thu: 1200,
        hp: 3000
    }
];

// =====================================================
// 🔧 KHỞI TẠO DỮ LIỆU
// =====================================================

function ensureYeuDao(player) {
    if (!player.yeuDao) {
        player.yeuDao = {
            canhGioi: "Yêu Thú",
            tang: 1,
            tuVi: 0,
            congPhap: null,
            phapBao: null,
            huyetMach: null,
            danDuoc: []
        };
    }

    if (!player.yeuDao.canhGioi) {
        player.yeuDao.canhGioi = "Yêu Thú";
    }

    if (!player.yeuDao.tang) {
        player.yeuDao.tang = 1;
    }

    if (player.yeuDao.tuVi === undefined) {
        player.yeuDao.tuVi = 0;
    }

    if (!Array.isArray(player.yeuDao.danDuoc)) {
        player.yeuDao.danDuoc = [];
    }

    return player.yeuDao;
}

// =====================================================
// 💾 LƯU PLAYER
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
                    yeuDao: player.yeuDao
                }
            );
        }
    } catch (error) {
        console.error(
            "❌ Lỗi lưu Yêu Đạo:",
            error
        );
    }
}

// =====================================================
// 📊 CHỈ SỐ CƠ BẢN
// =====================================================

function getRealmIndex(yeuDao) {
    const index =
        YEU_DAO_REALMS.indexOf(
            yeuDao.canhGioi
        );

    return index < 0 ? 0 : index;
}

function getYeuDaoStats(yeuDao) {
    const realm =
        getRealmIndex(yeuDao);

    const tang =
        Math.max(
            1,
            Number(yeuDao.tang || 1)
        );

    const base =
        Math.pow(3, realm) * tang;

    let cong =
        Math.floor(base * 10);

    let thu =
        Math.floor(base * 8);

    let hp =
        Math.floor(base * 55);

    if (yeuDao.congPhap) {
        cong +=
            Number(
                yeuDao.congPhap.cong || 0
            );

        thu +=
            Number(
                yeuDao.congPhap.thu || 0
            );

        hp +=
            Number(
                yeuDao.congPhap.hp || 0
            );
    }

    if (yeuDao.phapBao) {
        cong +=
            Number(
                yeuDao.phapBao.cong || 0
            );

        thu +=
            Number(
                yeuDao.phapBao.thu || 0
            );

        hp +=
            Number(
                yeuDao.phapBao.hp || 0
            );
    }

    if (yeuDao.huyetMach) {
        cong +=
            Number(
                yeuDao.huyetMach.cong || 0
            );

        thu +=
            Number(
                yeuDao.huyetMach.thu || 0
            );

        hp +=
            Number(
                yeuDao.huyetMach.hp || 0
            );
    }

    return {
        cong,
        thu,
        hp
    };
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

    ensureYeuDao(player);

    player.yeuDao.congPhap = {
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

    ensureYeuDao(player);

    player.yeuDao.phapBao = {
        ...item
    };

    savePlayer(player);

    return true;
}

// =====================================================
// 🧬 TRANG BỊ HUYẾT MẠCH
// =====================================================

function equipHuyetMach(player, id) {
    const item =
        HUYET_MACH.find(
            x => x.id === id
        );

    if (!item) {
        return false;
    }

    ensureYeuDao(player);

    player.yeuDao.huyetMach = {
        ...item
    };

    savePlayer(player);

    return true;
}

// =====================================================
// 🏠 MENU CHÍNH
// =====================================================

function makeMainMenu(userId) {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId(
                    `yeudao_menu_${userId}`
                )
                .setPlaceholder(
                    "🐉 Chọn chức năng Yêu Đạo"
                )
                .addOptions([
                    {
                        label: "Cảnh Giới Yêu Đạo",
                        description:
                            "Xem cảnh giới và Yêu Tu Vi",
                        value: "canhgioi",
                        emoji: "👹"
                    },
                    {
                        label: "Công Pháp Yêu Đạo",
                        description:
                            "Xem và trang bị công pháp",
                        value: "congphap",
                        emoji: "📜"
                    },
                    {
                        label: "Pháp Bảo Yêu Đạo",
                        description:
                            "Xem và trang bị pháp bảo",
                        value: "phapbao",
                        emoji: "⚔️"
                    },
                    {
                        label: "Đan Dược Yêu Đạo",
                        description:
                            "Xem 30 đan dược",
                        value: "dando",
                        emoji: "💊"
                    },
                    {
                        label: "Huyết Mạch Yêu Tộc",
                        description:
                            "Xem và trang bị huyết mạch",
                        value: "huyetmach",
                        emoji: "🧬"
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
    let list;

    if (type === "congphap") {
        list = CONG_PHAP;
    } else if (type === "phapbao") {
        list = PHAP_BAO;
    } else {
        list = HUYET_MACH;
    }

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
                `yeudao_menu_${userId}_${type}_${page}`
            )
            .setPlaceholder(
                type === "congphap"
                    ? "📜 Chọn công pháp"
                    : type === "phapbao"
                        ? "⚔️ Chọn pháp bảo"
                        : "🧬 Chọn huyết mạch"
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
                        type === "huyetmach"
                            ? `${item.cap} • Công +${item.cong} • Thủ +${item.thu} • HP +${item.hp}`
                                .slice(0, 100)
                            : `${item.phamCap} • Công +${item.cong} • Thủ +${item.thu} • HP +${item.hp}`
                                .slice(0, 100),

                    value:
                        `equip_${item.id}`,

                    emoji:
                        type === "congphap"
                            ? "📜"
                            : type === "phapbao"
                                ? "⚔️"
                                : "🧬"
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
            "Về menu Yêu Đạo",
        value: "back",
        emoji: "🏠"
    });

    rows.push(
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `yeudao_menu_${userId}_${type}_nav_${page}`
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
// 💊 MENU ĐAN DƯỢC
// =====================================================

function makeDanMenu(userId) {
    const first25 =
        DAN_DUOC.slice(0, 25);

    const options =
        first25.map(item => ({
            label:
                item.ten
                    .replace(
                        /^\S+\s/,
                        ""
                    )
                    .slice(0, 100),

            description:
                `${item.phamCap} • Yêu Tu Vi +${item.tuVi.toLocaleString()}`
                    .slice(0, 100),

            value:
                `dan_${item.id}`,

            emoji: "💊"
        }));

    const rows = [
        new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(
                        `yeudao_menu_${userId}_dando`
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
                        `yeudao_menu_${userId}_dando_nav`
                    )
                    .setPlaceholder(
                        "🏠 Quay lại"
                    )
                    .addOptions([
                        {
                            label:
                                "Quay lại menu chính",
                            description:
                                "Trở về Yêu Đạo",
                            value: "back",
                            emoji: "🏠"
                        }
                    ])
            )
    ];

    return rows;
}

// =====================================================
// 👹 EMBED CẢNH GIỚI
// =====================================================

function makeRealmEmbed(yeuDao) {
    const index =
        getRealmIndex(yeuDao);

    const stats =
        getYeuDaoStats(yeuDao);

    const next =
        YEU_DAO_REALMS[index + 1];

    return new EmbedBuilder()
        .setTitle(
            "🐉 CẢNH GIỚI YÊU ĐẠO"
        )
        .setDescription(
            [
                `👹 Cảnh giới: **${yeuDao.canhGioi}**`,
                `🔥 Tầng: **${yeuDao.tang}/9**`,
                `🌌 Yêu Tu Vi: **${Number(yeuDao.tuVi || 0).toLocaleString()}**`,
                "",
                `⚔️ Công: **${stats.cong.toLocaleString()}**`,
                `🛡️ Thủ: **${stats.thu.toLocaleString()}**`,
                `❤️ HP: **${stats.hp.toLocaleString()}**`,
                "",
                yeuDao.huyetMach
                    ? `🧬 Huyết mạch: **${yeuDao.huyetMach.ten}**`
                    : "🧬 Huyết mạch: **Chưa thức tỉnh**",
                "",
                next
                    ? `➡️ Cảnh giới tiếp theo: **${next}**`
                    : "👑 Đã đạt cảnh giới tối cao!"
            ].join("\n")
        )
        .setFooter({
            text:
                "🐉 Yêu Đạo — Hồng Hoang Đại Lục"
        });
}

// =====================================================
// 📜 EMBED CÔNG PHÁP
// =====================================================

function makeCongPhapEmbed(yeuDao) {
    const item =
        yeuDao.congPhap;

    return new EmbedBuilder()
        .setTitle(
            "📜 CÔNG PHÁP YÊU ĐẠO"
        )
        .setDescription(
            item
                ? [
                    `📜 Đang dùng: **${item.ten}**`,
                    `💠 Phẩm cấp: **${item.phamCap}**`,
                    "",
                    `⚔️ Công +${item.cong}`,
                    `🛡️ Thủ +${item.thu}`,
                    `❤️ HP +${item.hp}`
                ].join("\n")
                : "❌ Chưa trang bị công pháp."
        )
        .setFooter({
            text:
                "Chọn công pháp bên dưới để trang bị."
        });
}

// =====================================================
// ⚔️ EMBED PHÁP BẢO
// =====================================================

function makePhapBaoEmbed(yeuDao) {
    const item =
        yeuDao.phapBao;

    return new EmbedBuilder()
        .setTitle(
            "⚔️ PHÁP BẢO YÊU ĐẠO"
        )
        .setDescription(
            item
                ? [
                    `⚔️ Đang dùng: **${item.ten}**`,
                    `💠 Phẩm cấp: **${item.phamCap}**`,
                    "",
                    `⚔️ Công +${item.cong}`,
                    `🛡️ Thủ +${item.thu}`,
                    `❤️ HP +${item.hp}`
                ].join("\n")
                : "❌ Chưa trang bị pháp bảo."
        )
        .setFooter({
            text:
                "Chọn pháp bảo bên dưới để trang bị."
        });
}

// =====================================================
// 🧬 EMBED HUYẾT MẠCH
// =====================================================

function makeHuyetMachEmbed(yeuDao) {
    const item =
        yeuDao.huyetMach;

    return new EmbedBuilder()
        .setTitle(
            "🧬 HUYẾT MẠCH YÊU TỘC"
        )
        .setDescription(
            item
                ? [
                    `🧬 Đang dùng: **${item.ten}**`,
                    `💠 Cấp: **${item.cap}**`,
                    "",
                    `⚔️ Công +${item.cong}`,
                    `🛡️ Thủ +${item.thu}`,
                    `❤️ HP +${item.hp}`
                ].join("\n")
                : "❌ Chưa thức tỉnh huyết mạch."
        )
        .setFooter({
            text:
                "Chọn huyết mạch bên dưới để thức tỉnh."
        });
}

// =====================================================
// 💊 EMBED ĐAN DƯỢC
// =====================================================

function makeDanEmbed() {
    return new EmbedBuilder()
        .setTitle(
            "💊 ĐAN DƯỢC YÊU ĐẠO"
        )
        .setDescription(
            DAN_DUOC.map(
                (item, i) =>
                    `**${i + 1}.** ${item.ten}\n` +
                    `💠 ${item.phamCap} • ` +
                    `🌌 Yêu Tu Vi +${item.tuVi.toLocaleString()}`
            ).join("\n\n")
        )
        .setFooter({
            text:
                "Chọn đan dược trong menu để xem chi tiết."
        });
}

// =====================================================
// 🧬 EMBED DANH SÁCH HUYẾT MẠCH
// =====================================================

function makeHuyetMachListEmbed() {
    return new EmbedBuilder()
        .setTitle(
            "🧬 15 HUYẾT MẠCH YÊU TỘC"
        )
        .setDescription(
            HUYET_MACH.map(
                (item, i) =>
                    `**${i + 1}.** ${item.ten}\n` +
                    `💠 ${item.cap} • ` +
                    `⚔️ +${item.cong} • 🛡️ +${item.thu} • ` +
                    `❤️ +${item.hp}`
            ).join("\n\n")
        );
}

// =====================================================
// ☠️ HANDLE MENU
// =====================================================

async function handleMenu(interaction) {
    const customId =
        interaction.customId || "";

    const selected =
        interaction.values?.[0];

    const userId =
        interaction.user.id;

    let player;

    try {
        if (
            typeof db.getPlayer ===
            "function"
        ) {
            player =
                db.getPlayer(userId);
        }
    } catch (error) {
        console.error(
            "❌ Lỗi lấy dữ liệu Yêu Đạo:",
            error
        );
    }

    if (!player) {
        return interaction.reply({
            content:
                "❌ Không tìm thấy nhân vật. Hãy dùng `/batdau` trước.",
            ephemeral: true
        });
    }

    ensureYeuDao(player);

    // ================================================
    // QUAY LẠI
    // ================================================

    if (selected === "back") {
        return interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle(
                        "🐉 HỆ THỐNG YÊU ĐẠO"
                    )
                    .setDescription(
                        [
                            `👹 Cảnh giới: **${player.yeuDao.canhGioi}**`,
                            `🔥 Tầng: **${player.yeuDao.tang}/9**`,
                            `🌌 Yêu Tu Vi: **${Number(player.yeuDao.tuVi || 0).toLocaleString()}**`,
                            "",
                            "🐉 Chọn chức năng bên dưới."
                        ].join("\n")
                    )
            ],
            components: [
                makeMainMenu(userId)
            ]
        });
    }

    // ================================================
    // CẢNH GIỚI
    // ================================================

    if (selected === "canhgioi") {
        return interaction.update({
            embeds: [
                makeRealmEmbed(
                    player.yeuDao
                )
            ],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(
                                `yeudao_menu_${userId}`
                            )
                            .setPlaceholder(
                                "🏠 Quay lại"
                            )
                            .addOptions([
                                {
                                    label:
                                        "Quay lại menu chính",
                                    description:
                                        "Trở về Yêu Đạo",
                                    value: "back",
                                    emoji: "🏠"
                                }
                            ])
                    )
            ]
        });
    }

    // ================================================
    // CÔNG PHÁP
    // ================================================

    if (selected === "congphap") {
        return interaction.update({
            embeds: [
                makeCongPhapEmbed(
                    player.yeuDao
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

    // ================================================
    // PHÁP BẢO
    // ================================================

    if (selected === "phapbao") {
        return interaction.update({
            embeds: [
                makePhapBaoEmbed(
                    player.yeuDao
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

    // ================================================
    // ĐAN DƯỢC
    // ================================================

    if (selected === "dando") {
        return interaction.update({
            embeds: [
                makeDanEmbed()
            ],
            components:
                makeDanMenu(userId)
        });
    }

    // ================================================
    // HUYẾT MẠCH
    // ================================================

    if (selected === "huyetmach") {
        return interaction.update({
            embeds: [
                makeHuyetMachListEmbed()
            ],
            components:
                makeItemMenu(
                    userId,
                    "huyetmach",
                    0
                )
        });
    }

    // ================================================
    // CHUYỂN TRANG
    // ================================================

    if (
        selected &&
        selected.startsWith("page_")
    ) {
        const page =
            Number(
                selected.replace(
                    "page_",
                    ""
                )
            );

        let type =
            "congphap";

        if (
            customId.includes(
                "_phapbao_"
            )
        ) {
            type =
                "phapbao";
        }

        if (
            customId.includes(
                "_huyetmach_"
            )
        ) {
            type =
                "huyetmach";
        }

        return interaction.update({
            components:
                makeItemMenu(
                    userId,
                    type,
                    page
                )
        });
    }

    // ================================================
    // TRANG BỊ CÔNG PHÁP
    // ================================================

    if (
        selected &&
        selected.startsWith(
            "equip_yeu_congphap_"
        )
    ) {
        const id =
            selected.replace(
                "equip_",
                ""
            );

        if (
            !equipCongPhap(
                player,
                id
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy công pháp.",
                ephemeral: true
            });
        }

        return interaction.update({
            embeds: [
                makeCongPhapEmbed(
                    player.yeuDao
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

    // ================================================
    // TRANG BỊ PHÁP BẢO
    // ================================================

    if (
        selected &&
        selected.startsWith(
            "equip_yeu_phapbao_"
        )
    ) {
        const id =
            selected.replace(
                "equip_",
                ""
            );

        if (
            !equipPhapBao(
                player,
                id
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy pháp bảo.",
                ephemeral: true
            });
        }

        return interaction.update({
            embeds: [
                makePhapBaoEmbed(
                    player.yeuDao
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

    // ================================================
    // TRANG BỊ HUYẾT MẠCH
    // ================================================

    if (
        selected &&
        selected.startsWith(
            "equip_yeu_huyetmach_"
        )
    ) {
        const id =
            selected.replace(
                "equip_",
                ""
            );

        if (
            !equipHuyetMach(
                player,
                id
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy huyết mạch.",
                ephemeral: true
            });
        }

        return interaction.update({
            embeds: [
                makeHuyetMachEmbed(
                    player.yeuDao
                )
            ],
            components:
                makeItemMenu(
                    userId,
                    "huyetmach",
                    0
                )
        });
    }

    // ================================================
    // CHỌN ĐAN DƯỢC
    // ================================================

    if (
        selected &&
        selected.startsWith("dan_")
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
            content: [
                `${item.ten}`,
                `💠 Phẩm cấp: **${item.phamCap}**`,
                `🌌 Yêu Tu Vi: **+${item.tuVi.toLocaleString()}**`,
                `⚔️ Công: **+${item.cong.toLocaleString()}**`,
                `❤️ HP: **+${item.hp.toLocaleString()}**`
            ].join("\n"),
            ephemeral: true
        });
    }

    // ================================================
    // KHÔNG XÁC ĐỊNH
    // ================================================

    return interaction.reply({
        content:
            "❌ Chức năng Yêu Đạo không tồn tại.",
        ephemeral: true
    });
}

// =====================================================
// 🐉 LỆNH /YEUDao
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

    ensureYeuDao(player);

    const stats =
        getYeuDaoStats(
            player.yeuDao
        );

    const embed =
        new EmbedBuilder()
            .setTitle(
                "🐉 HỒNG HOANG — YÊU ĐẠO"
            )
            .setDescription(
                [
                    `👹 Cảnh giới: **${player.yeuDao.canhGioi}**`,
                    `🔥 Tầng: **${player.yeuDao.tang}/9**`,
                    `🌌 Yêu Tu Vi: **${Number(player.yeuDao.tuVi || 0).toLocaleString()}**`,
                    "",
                    `⚔️ Công: **${stats.cong.toLocaleString()}**`,
                    `🛡️ Thủ: **${stats.thu.toLocaleString()}**`,
                    `❤️ HP: **${stats.hp.toLocaleString()}**`,
                    "",
                    player.yeuDao.congPhap
                        ? `📜 Công pháp: **${player.yeuDao.congPhap.ten}**`
                        : "📜 Công pháp: **Chưa trang bị**",
                    player.yeuDao.phapBao
                        ? `⚔️ Pháp bảo: **${player.yeuDao.phapBao.ten}**`
                        : "⚔️ Pháp bảo: **Chưa trang bị**",
                    player.yeuDao.huyetMach
                        ? `🧬 Huyết mạch: **${player.yeuDao.huyetMach.ten}**`
                        : "🧬 Huyết mạch: **Chưa thức tỉnh**"
                ].join("\n")
            )
            .setFooter({
                text:
                    "🐉 Yêu Đạo — Hồng Hoang Đại Lục"
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
            .setName("yeudao")
            .setDescription(
                "🐉 Mở hệ thống Yêu Đạo"
            ),

    execute,

    handleMenu,

    YEU_DAO_REALMS,

    CONG_PHAP,

    PHAP_BAO,

    DAN_DUOC,

    HUYET_MACH,

    ensureYeuDao,

    getYeuDaoStats
};
