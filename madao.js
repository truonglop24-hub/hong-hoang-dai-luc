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
// 🔧 TẠO DỮ LIỆU MA ĐẠO CHO PLAYER CŨ
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
// 📊 TÍNH CHỈ SỐ MA ĐẠO
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
// 📜 CHỌN CÔNG PHÁP
// =====================================================

function equipCongPhap(player, id) {

    const item =
        CONG_PHAP.find(x => x.id === id);

    if (!item) return false;

    ensureMaDao(player);

    player.maDao.congPhap = {
        ...item
    };

    db.updatePlayer(player.id, {
        maDao: player.maDao
    });

    return true;
}

// =====================================================
// ⚔️ CHỌN PHÁP BẢO
// =====================================================

function equipPhapBao(player, id) {

    const item =
        PHAP_BAO.find(x => x.id === id);

    if (!item) return false;

    ensureMaDao(player);

    player.maDao.phapBao = {
        ...item
    };

    db.updatePlayer(player.id, {
        maDao: player.maDao
    });

    return true;
}

// =====================================================
// 📜 LỆNH /MADAO
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("madao")
            .setDescription(
                "☠️ Xem hệ thống Ma Đạo"
            ),

    async execute(interaction) {

        const player =
            db.getPlayer(
                interaction.user.id
            );

        if (!player) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const maDao =
            ensureMaDao(player);

        const stats =
            getMaDaoStats(maDao);

        db.updatePlayer(
            player.id,
            {
                maDao
            }
        );

        const embed =
            new EmbedBuilder()
                .setColor(0x8e44ad)
                .setTitle(
                    "☠️ MA ĐẠO • HỆ THỐNG TU LUYỆN"
                )
                .setDescription([
                    "╔════════════════════╗",
                    "      ☠️ **MA ĐẠO**",
                    "╚════════════════════╝",
                    "",
                    `👹 Cảnh giới: **${maDao.canhGioi}**`,
                    `🌑 Tầng: **${maDao.tang}/9**`,
                    `🩸 Ma Tu Vi: **${Number(maDao.tuVi).toLocaleString("vi-VN")}**`,
                    "",
                    "━━━━━━━━━━━━━━━━━━━━",
                    "📊 **Chỉ số Ma Đạo**",
                    "",
                    `❤️ HP: **+${stats.hp.toLocaleString("vi-VN")}**`,
                    `⚔️ Công: **+${stats.cong.toLocaleString("vi-VN")}**`,
                    `🛡️ Thủ: **+${stats.thu.toLocaleString("vi-VN")}**`,
                    "",
                    `📜 Công pháp: **${maDao.congPhap?.ten || "Chưa có"}**`,
                    `⚔️ Pháp bảo: **${maDao.phapBao?.ten || "Chưa có"}**`
                ].join("\n"))
                .setFooter({
                    text:
                        "☠️ Hồng Hoang Đại Lục • Ma Đạo"
                });

        const menu =
            new StringSelectMenuBuilder()
                .setCustomId(
                    `madao_menu_${interaction.user.id}`
                )
                .setPlaceholder(
                    "☠️ Chọn chức năng Ma Đạo"
                )
                .addOptions([
                    {
                        label: "Xem Công Pháp",
                        description:
                            "Xem các công pháp Ma Đạo",
                        value: "congphap",
                        emoji: "📜"
                    },
                    {
                        label: "Xem Pháp Bảo",
                        description:
                            "Xem các pháp bảo Ma Đạo",
                        value: "phapbao",
                        emoji: "⚔️"
                    },
                    {
                        label: "Xem Đan Dược",
                        description:
                            "Xem các đan dược Ma Đạo",
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
                ]);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });
    },

    MA_DAO_REALMS,
    CONG_PHAP,
    PHAP_BAO,
    DAN_DUOC,
    ensureMaDao,
    getMaDaoStats,
    equipCongPhap,
    equipPhapBao
};
