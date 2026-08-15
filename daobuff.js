// ============================================================
// 🌌 HỒNG HOANG ĐẠI LỤC
// ⚔️ CHÍNH ĐẠO • 😈 MA ĐẠO • 🐺 YÊU ĐẠO
// HỆ THỐNG BUFF 3 ĐẠO
// ============================================================

// ============================================================
// ⚔️ 😈 🐺 BUFF GỐC
// ============================================================

const DAO_BUFFS = {

    // ========================================================
    // ⚔️ CHÍNH ĐẠO
    // ========================================================

    "Chính Đạo": {

        ten: "⚔️ Chính Đạo",

        moTa:
            "Con đường chính thống, thiên về phòng thủ, tu luyện và ổn định.",

        // Tu vi
        tuViBonus: 20,

        // Tốc độ tu luyện
        tocDoTuLuyenBonus: 15,

        // Sát thương
        satThuongBonus: 10,

        // Phòng thủ
        phongThuBonus: 25,

        // HP
        hpBonus: 20,

        // Đột phá
        dotPhaBonus: 5,

        // Hút máu
        hutMauBonus: 0
    },


    // ========================================================
    // 😈 MA ĐẠO
    // ========================================================

    "Ma Đạo": {

        ten: "😈 Ma Đạo",

        moTa:
            "Con đường ma đạo thiên về sát thương, hút máu và đột phá.",

        // Tu vi
        tuViBonus: 15,

        // Tốc độ tu luyện
        tocDoTuLuyenBonus: 10,

        // Sát thương
        satThuongBonus: 30,

        // Phòng thủ
        phongThuBonus: -10,

        // HP
        hpBonus: 0,

        // Đột phá
        dotPhaBonus: 15,

        // Hút máu
        hutMauBonus: 15
    },


    // ========================================================
    // 🐺 YÊU ĐẠO
    // ========================================================

    "Yêu Đạo": {

        ten: "🐺 Yêu Đạo",

        moTa:
            "Con đường yêu đạo thiên về thân thể, HP, công kích và sức mạnh.",

        // Tu vi
        tuViBonus: 10,

        // Tốc độ tu luyện
        tocDoTuLuyenBonus: 5,

        // Sát thương
        satThuongBonus: 15,

        // Phòng thủ
        phongThuBonus: 20,

        // HP
        hpBonus: 40,

        // Đột phá
        dotPhaBonus: 0,

        // Hút máu
        hutMauBonus: 0
    }
};


// ============================================================
// 🔄 CHUẨN HÓA TÊN ĐẠO
// ============================================================

function normalizeDao(dao) {

    if (!dao) {
        return "Chính Đạo";
    }

    const text =
        String(dao)
            .trim()
            .toLowerCase();

    if (
        text === "chính đạo" ||
        text === "chinh dao" ||
        text === "chinhdao" ||
        text === "⚔️ chính đạo"
    ) {
        return "Chính Đạo";
    }

    if (
        text === "ma đạo" ||
        text === "ma dao" ||
        text === "madao" ||
        text === "😈 ma đạo"
    ) {
        return "Ma Đạo";
    }

    if (
        text === "yêu đạo" ||
        text === "yeu dao" ||
        text === "yeudao" ||
        text === "🐺 yêu đạo" ||
        text === "🐉 yêu đạo"
    ) {
        return "Yêu Đạo";
    }

    return "Chính Đạo";
}


// ============================================================
// 🎯 LẤY BUFF CỦA NGƯỜI CHƠI
// ============================================================

function getDaoBuff(player) {

    if (!player) {
        return DAO_BUFFS["Chính Đạo"];
    }

    const dao =
        normalizeDao(
            player.dao ||
            player.phapDao ||
            player.daoPhai ||
            player.tuLuyenDao
        );

    return (
        DAO_BUFFS[dao] ||
        DAO_BUFFS["Chính Đạo"]
    );
}


// ============================================================
// 🏷️ LẤY TÊN ĐẠO
// ============================================================

function getDaoName(player) {

    if (!player) {
        return "⚔️ Chính Đạo";
    }

    const buff =
        getDaoBuff(player);

    return buff.ten;
}


// ============================================================
// 📝 LẤY MÔ TẢ ĐẠO
// ============================================================

function getDaoDescription(player) {

    if (!player) {
        return DAO_BUFFS["Chính Đạo"].moTa;
    }

    return getDaoBuff(player).moTa;
}


// ============================================================
// ✨ TU VI
// ============================================================

function getTuViWithDao(
    player,
    amount
) {

    amount =
        Number(amount) || 0;

    const buff =
        getDaoBuff(player);

    return Math.max(
        0,
        Math.floor(
            amount *
            (
                1 +
                buff.tuViBonus /
                100
            )
        )
    );
}


// ============================================================
// ⚡ TỐC ĐỘ TU LUYỆN
// ============================================================

function getTrainingWithDao(
    player,
    amount
) {

    amount =
        Number(amount) || 0;

    const buff =
        getDaoBuff(player);

    return Math.max(
        0,
        Math.floor(
            amount *
            (
                1 +
                buff.tocDoTuLuyenBonus /
                100
            )
        )
    );
}


// ============================================================
// 💀 SÁT THƯƠNG
// ============================================================

function getDamageWithDao(
    player,
    damage
) {

    damage =
        Number(damage) || 0;

    const buff =
        getDaoBuff(player);

    return Math.max(
        0,
        Math.floor(
            damage *
            (
                1 +
                buff.satThuongBonus /
                100
            )
        )
    );
}


// ============================================================
// 🛡️ PHÒNG THỦ
// ============================================================

function getDefenseWithDao(
    player,
    defense
) {

    defense =
        Number(defense) || 0;

    const buff =
        getDaoBuff(player);

    return Math.max(
        0,
        Math.floor(
            defense *
            (
                1 +
                buff.phongThuBonus /
                100
            )
        )
    );
}


// ============================================================
// ❤️ HP TỐI ĐA
// ============================================================

function getMaxHpWithDao(
    player,
    hp
) {

    hp =
        Number(hp) || 0;

    const buff =
        getDaoBuff(player);

    return Math.max(
        1,
        Math.floor(
            hp *
            (
                1 +
                buff.hpBonus /
                100
            )
        )
    );
}


// ============================================================
// ⚡ TỶ LỆ ĐỘT PHÁ
// ============================================================

function getDotPhaChanceWithDao(
    player,
    chance
) {

    chance =
        Number(chance) || 0;

    const buff =
        getDaoBuff(player);

    return Math.min(
        100,
        Math.max(
            0,
            chance +
            buff.dotPhaBonus
        )
    );
}


// ============================================================
// 🩸 HÚT MÁU
// ============================================================

function getHutMauWithDao(
    player,
    damage
) {

    damage =
        Number(damage) || 0;

    const buff =
        getDaoBuff(player);

    if (
        !buff.hutMauBonus ||
        buff.hutMauBonus <= 0
    ) {
        return 0;
    }

    return Math.max(
        0,
        Math.floor(
            damage *
            buff.hutMauBonus /
            100
        )
    );
}


// ============================================================
// 📊 TÍNH TOÀN BỘ CHỈ SỐ SAU BUFF
// ============================================================

function calculateDaoStats(
    player
) {

    if (!player) {

        return {
            dao: "Chính Đạo",

            tuViBonus: 20,
            tocDoTuLuyenBonus: 15,
            satThuongBonus: 10,
            phongThuBonus: 25,
            hpBonus: 20,
            dotPhaBonus: 5,
            hutMauBonus: 0
        };
    }

    const buff =
        getDaoBuff(player);

    return {

        dao:
            normalizeDao(
                player.dao ||
                player.phapDao ||
                player.daoPhai
            ),

        ten:
            buff.ten,

        moTa:
            buff.moTa,

        tuViBonus:
            buff.tuViBonus,

        tocDoTuLuyenBonus:
            buff.tocDoTuLuyenBonus,

        satThuongBonus:
            buff.satThuongBonus,

        phongThuBonus:
            buff.phongThuBonus,

        hpBonus:
            buff.hpBonus,

        dotPhaBonus:
            buff.dotPhaBonus,

        hutMauBonus:
            buff.hutMauBonus
    };
}


// ============================================================
// 🧮 ÁP DỤNG BUFF VÀO CHỈ SỐ
// ============================================================

function applyDaoBuff(
    player,
    stats = {}
) {

    const buff =
        getDaoBuff(player);

    const result = {
        ...stats
    };


    // ========================================================
    // TU VI
    // ========================================================

    if (
        result.tuvi !== undefined
    ) {

        result.tuvi =
            Math.floor(
                Number(result.tuvi) *
                (
                    1 +
                    buff.tuViBonus /
                    100
                )
            );
    }


    // ========================================================
    // SÁT THƯƠNG
    // ========================================================

    if (
        result.satThuong !== undefined
    ) {

        result.satThuong =
            Math.floor(
                Number(result.satThuong) *
                (
                    1 +
                    buff.satThuongBonus /
                    100
                )
            );
    }


    // ========================================================
    // CÔNG
    // ========================================================

    if (
        result.cong !== undefined
    ) {

        result.cong =
            Math.floor(
                Number(result.cong) *
                (
                    1 +
                    buff.satThuongBonus /
                    100
                )
            );
    }


    // ========================================================
    // PHÒNG THỦ
    // ========================================================

    if (
        result.thu !== undefined
    ) {

        result.thu =
            Math.floor(
                Number(result.thu) *
                (
                    1 +
                    buff.phongThuBonus /
                    100
                )
            );
    }


    // ========================================================
    // HP
    // ========================================================

    if (
        result.hp !== undefined
    ) {

        result.hp =
            Math.floor(
                Number(result.hp) *
                (
                    1 +
                    buff.hpBonus /
                    100
                )
            );
    }


    // ========================================================
    // MAX HP
    // ========================================================

    if (
        result.maxHp !== undefined
    ) {

        result.maxHp =
            Math.floor(
                Number(result.maxHp) *
                (
                    1 +
                    buff.hpBonus /
                    100
                )
            );
    }


    return result;
}


// ============================================================
// 🔍 KIỂM TRA NGƯỜI CHƠI CÓ ĐẠO NÀO
// ============================================================

function isChinhDao(player) {

    return (
        normalizeDao(
            player?.dao
        ) ===
        "Chính Đạo"
    );
}


function isMaDao(player) {

    return (
        normalizeDao(
            player?.dao
        ) ===
        "Ma Đạo"
    );
}


function isYeuDao(player) {

    return (
        normalizeDao(
            player?.dao
        ) ===
        "Yêu Đạo"
    );
}


// ============================================================
// 🏆 LẤY DANH SÁCH 3 ĐẠO
// ============================================================

function getAllDao() {

    return [
        {
            id: "chinh_dao",
            name: "Chính Đạo",
            emoji: "⚔️",
            buff:
                DAO_BUFFS["Chính Đạo"]
        },

        {
            id: "ma_dao",
            name: "Ma Đạo",
            emoji: "😈",
            buff:
                DAO_BUFFS["Ma Đạo"]
        },

        {
            id: "yeu_dao",
            name: "Yêu Đạo",
            emoji: "🐺",
            buff:
                DAO_BUFFS["Yêu Đạo"]
        }
    ];
}


// ============================================================
// 📜 HIỂN THỊ BUFF
// ============================================================

function formatDaoBuff(
    player
) {

    const buff =
        getDaoBuff(player);

    const dao =
        normalizeDao(
            player?.dao
        );

    let text = "";

    text +=
        `${buff.ten}\n`;

    text +=
        `> ${buff.moTa}\n\n`;

    text +=
        `✨ Tu Vi: **+${buff.tuViBonus}%**\n`;

    text +=
        `⚡ Tốc độ tu luyện: **+${buff.tocDoTuLuyenBonus}%**\n`;

    text +=
        `💀 Sát thương: **${buff.satThuongBonus >= 0 ? "+" : ""}${buff.satThuongBonus}%**\n`;

    text +=
        `🛡️ Phòng thủ: **${buff.phongThuBonus >= 0 ? "+" : ""}${buff.phongThuBonus}%**\n`;

    text +=
        `❤️ HP: **+${buff.hpBonus}%**\n`;

    text +=
        `🌟 Đột phá: **+${buff.dotPhaBonus}%**\n`;

    text +=
        `🩸 Hút máu: **+${buff.hutMauBonus}%**`;

    return text;
}


// ============================================================
// 🎯 LẤY BUFF THEO TÊN ĐẠO
// ============================================================

function getBuffByDao(
    dao
) {

    const normalized =
        normalizeDao(dao);

    return (
        DAO_BUFFS[normalized] ||
        DAO_BUFFS["Chính Đạo"]
    );
}


// ============================================================
// 🔐 KIỂM TRA ĐẠO HỢP LỆ
// ============================================================

function isValidDao(
    dao
) {

    const normalized =
        normalizeDao(dao);

    return (
        normalized === "Chính Đạo" ||
        normalized === "Ma Đạo" ||
        normalized === "Yêu Đạo"
    );
}


// ============================================================
// 💾 TẠO DATA ĐẠO CHO NGƯỜI CHƠI MỚI
// ============================================================

function createDaoData(
    dao = "Chính Đạo"
) {

    const normalized =
        normalizeDao(dao);

    const buff =
        DAO_BUFFS[normalized];

    return {

        dao:
            normalized,

        daoTen:
            buff.ten,

        daoMoTa:
            buff.moTa,

        daoBuff: {

            tuViBonus:
                buff.tuViBonus,

            tocDoTuLuyenBonus:
                buff.tocDoTuLuyenBonus,

            satThuongBonus:
                buff.satThuongBonus,

            phongThuBonus:
                buff.phongThuBonus,

            hpBonus:
                buff.hpBonus,

            dotPhaBonus:
                buff.dotPhaBonus,

            hutMauBonus:
                buff.hutMauBonus
        }
    };
}


// ============================================================
// 🔄 ĐỔI ĐẠO
// ============================================================

function changeDao(
    player,
    dao
) {

    if (!player) {
        return {
            success: false,
            message:
                "❌ Không tìm thấy người chơi."
        };
    }

    if (!isValidDao(dao)) {
        return {
            success: false,
            message:
                "❌ Đạo không hợp lệ."
        };
    }

    const normalized =
        normalizeDao(dao);

    const buff =
        DAO_BUFFS[normalized];

    player.dao =
        normalized;

    player.daoTen =
        buff.ten;

    player.daoMoTa =
        buff.moTa;

    player.daoBuff = {

        tuViBonus:
            buff.tuViBonus,

        tocDoTuLuyenBonus:
            buff.tocDoTuLuyenBonus,

        satThuongBonus:
            buff.satThuongBonus,

        phongThuBonus:
            buff.phongThuBonus,

        hpBonus:
            buff.hpBonus,

        dotPhaBonus:
            buff.dotPhaBonus,

        hutMauBonus:
            buff.hutMauBonus
    };

    return {

        success: true,

        dao:
            normalized,

        buff
    };
}


// ============================================================
// 📦 EXPORT
// ============================================================

module.exports = {

    // Data
    DAO_BUFFS,

    // Chuẩn hóa
    normalizeDao,

    // Lấy buff
    getDaoBuff,
    getDaoName,
    getDaoDescription,
    getBuffByDao,

    // Tính toán
    getTuViWithDao,
    getTrainingWithDao,
    getDamageWithDao,
    getDefenseWithDao,
    getMaxHpWithDao,
    getDotPhaChanceWithDao,
    getHutMauWithDao,

    // Stats
    calculateDaoStats,
    applyDaoBuff,

    // Kiểm tra
    isChinhDao,
    isMaDao,
    isYeuDao,
    isValidDao,

    // Danh sách
    getAllDao,

    // Hiển thị
    formatDaoBuff,

    // Data người chơi
    createDaoData,

    // Đổi đạo
    changeDao
};
