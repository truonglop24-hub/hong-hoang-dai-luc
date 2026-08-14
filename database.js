const fs = require("fs");
const path = require("path");

// =====================================================
// DATABASE - RAILWAY VOLUME
// =====================================================

const DATA_DIR = "/app/data";
const DB_FILE = path.join(
    DATA_DIR,
    "players.json"
);

const OLD_DB_FILE = path.join(
    __dirname,
    "players.json"
);

// =====================================================
// TẠO THƯ MỤC
// =====================================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, {
        recursive: true
    });
}

let players = {};

// =====================================================
// ĐỌC DATABASE
// =====================================================

function load() {

    // Nếu Volume chưa có database
    // nhưng file cũ tồn tại thì copy sang Volume

    if (
        !fs.existsSync(DB_FILE) &&
        fs.existsSync(OLD_DB_FILE)
    ) {

        try {

            fs.copyFileSync(
                OLD_DB_FILE,
                DB_FILE
            );

            console.log(
                "✅ Đã chuyển players.json sang Railway Volume."
            );

        } catch (error) {

            console.error(
                "❌ Không thể chuyển players.json:",
                error
            );
        }
    }

    if (!fs.existsSync(DB_FILE)) {

        players = {};

        return;
    }

    try {

        players =
            JSON.parse(
                fs.readFileSync(
                    DB_FILE,
                    "utf8"
                )
            );

    } catch (error) {

        console.error(
            "❌ Không thể đọc players.json:",
            error
        );

        players = {};
    }
}

// =====================================================
// LƯU DATABASE
// =====================================================

function save() {

    try {

        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(
                players,
                null,
                2
            ),
            "utf8"
        );

    } catch (error) {

        console.error(
            "❌ Không thể lưu players.json:",
            error
        );
    }
}

// =====================================================
// LOAD
// =====================================================

load();

// =====================================================
// LINH CĂN
// =====================================================

const LINH_CAN = [

    // =================================================
    // HỒNG MÔNG
    // =================================================

    {
        id: "hong_mong",

        ten:
            "☯️ Hồng Mông Đạo Thể",

        phamCap:
            "Hồng Mông",

        thuocTinh:
            "Hồng Mông",

        tyLe:
            0.05,

        moTa:
            "Căn cơ tối thượng, được sinh ra trước cả Hồng Hoang.",

        buff: {
            tuLuyen: 150,
            hp: 120,
            linhLuc: 150,
            cong: 100,
            thu: 100,
            dotPha: 40
        }
    },

    // =================================================
    // HỖN ĐỘN
    // =================================================

    {
        id: "hon_don",

        ten:
            "🌌 Hỗn Độn Đạo Thể",

        phamCap:
            "Hỗn Độn",

        thuocTinh:
            "Hỗn Độn",

        tyLe:
            0.15,

        moTa:
            "Thân mang khí Hỗn Độn, có khả năng dung nạp vạn đạo.",

        buff: {
            tuLuyen: 100,
            hp: 90,
            linhLuc: 120,
            cong: 80,
            thu: 80,
            dotPha: 30
        }
    },

    // =================================================
    // HỖN NGUYÊN
    // =================================================

    {
        id: "hon_nguyen",

        ten:
            "🔱 Hỗn Nguyên Đạo Căn",

        phamCap:
            "Hỗn Nguyên",

        thuocTinh:
            "Hỗn Nguyên",

        tyLe:
            0.5,

        moTa:
            "Đạo căn hiếm thấy, con đường chứng đạo rộng mở.",

        buff: {
            tuLuyen: 75,
            hp: 70,
            linhLuc: 90,
            cong: 65,
            thu: 65,
            dotPha: 25
        }
    },

    // =================================================
    // TIÊN THIÊN
    // =================================================

    {
        id: "tien_thien",

        ten:
            "🌠 Tiên Thiên Đạo Căn",

        phamCap:
            "Tiên Thiên",

        thuocTinh:
            "Tiên Thiên",

        tyLe:
            1.5,

        moTa:
            "Tiên thiên mà sinh, hấp thu linh khí cực nhanh.",

        buff: {
            tuLuyen: 50,
            hp: 50,
            linhLuc: 65,
            cong: 45,
            thu: 45,
            dotPha: 20
        }
    },

    // =================================================
    // THÁNH PHẨM
    // =================================================

    {
        id: "thanh_pham",

        ten:
            "👑 Thánh Phẩm Linh Căn",

        phamCap:
            "Thánh Phẩm",

        thuocTinh:
            "Ngũ Hành",

        tyLe:
            3,

        moTa:
            "Linh căn cấp Thánh, được vô số tu sĩ mơ ước.",

        buff: {
            tuLuyen: 35,
            hp: 35,
            linhLuc: 45,
            cong: 35,
            thu: 35,
            dotPha: 15
        }
    },

    // =================================================
    // THIÊN PHẨM
    // =================================================

    {
        id: "thien_pham",

        ten:
            "💠 Thiên Phẩm Linh Căn",

        phamCap:
            "Thiên Phẩm",

        thuocTinh:
            "Ngũ Hành",

        tyLe:
            7,

        moTa:
            "Thiên tư hơn người, con đường tu luyện thuận lợi.",

        buff: {
            tuLuyen: 25,
            hp: 25,
            linhLuc: 30,
            cong: 25,
            thu: 25,
            dotPha: 10
        }
    },

    // =================================================
    // ĐỊA PHẨM
    // =================================================

    {
        id: "dia_pham",

        ten:
            "🔥 Địa Phẩm Linh Căn",

        phamCap:
            "Địa Phẩm",

        thuocTinh:
            "Ngũ Hành",

        tyLe:
            12,

        moTa:
            "Căn cơ tốt, đủ khả năng bước vào hàng cường giả.",

        buff: {
            tuLuyen: 18,
            hp: 18,
            linhLuc: 20,
            cong: 18,
            thu: 18,
            dotPha: 7
        }
    },

    // =================================================
    // HUYỀN PHẨM
    // =================================================

    {
        id: "huyen_pham",

        ten:
            "⚡ Huyền Phẩm Linh Căn",

        phamCap:
            "Huyền Phẩm",

        thuocTinh:
            "Ngũ Hành",

        tyLe:
            18,

        moTa:
            "Linh căn khá tốt, có tư chất tu luyện.",

        buff: {
            tuLuyen: 12,
            hp: 12,
            linhLuc: 15,
            cong: 12,
            thu: 12,
            dotPha: 5
        }
    },

    // =================================================
    // HOÀNG PHẨM
    // =================================================

    {
        id: "hoang_pham",

        ten:
            "🌿 Hoàng Phẩm Linh Căn",

        phamCap:
            "Hoàng Phẩm",

        thuocTinh:
            "Ngũ Hành",

        tyLe:
            28,

        moTa:
            "Linh căn phổ thông, con đường tu luyện bình thường.",

        buff: {
            tuLuyen: 7,
            hp: 7,
            linhLuc: 8,
            cong: 7,
            thu: 7,
            dotPha: 3
        }
    },

    // =================================================
    // PHÀM PHẨM
    // =================================================

    {
        id: "pham_pham",

        ten:
            "🪨 Phàm Phẩm Linh Căn",

        phamCap:
            "Phàm Phẩm",

        thuocTinh:
            "Tạp",

        tyLe:
            29.8,

        moTa:
            "Linh căn yếu, con đường tu luyện vô cùng gian nan.",

        buff: {
            tuLuyen: 2,
            hp: 2,
            linhLuc: 3,
            cong: 2,
            thu: 2,
            dotPha: 1
        }
    }
];

// =====================================================
// THUỘC TÍNH LINH CĂN
// =====================================================

const LINH_CAN_THUOC_TINH = [

    {
        ten: "🔥 Hỏa",
        bonus: {
            cong: 10,
            linhLuc: 5
        }
    },

    {
        ten: "💧 Thủy",
        bonus: {
            hp: 10,
            linhLuc: 5
        }
    },

    {
        ten: "🌳 Mộc",
        bonus: {
            hp: 8,
            tuLuyen: 5
        }
    },

    {
        ten: "🪨 Thổ",
        bonus: {
            thu: 12,
            hp: 5
        }
    },

    {
        ten: "⚡ Lôi",
        bonus: {
            cong: 15,
            dotPha: 3
        }
    },

    {
        ten: "🌪️ Phong",
        bonus: {
            cong: 8,
            tuLuyen: 8
        }
    },

    {
        ten: "❄️ Băng",
        bonus: {
            thu: 8,
            dotPha: 5
        }
    },

    {
        ten: "☀️ Quang",
        bonus: {
            linhLuc: 10,
            hp: 5
        }
    },

    {
        ten: "🌑 Ám",
        bonus: {
            cong: 12,
            thu: 5
        }
    },

    {
        ten: "☯️ Âm Dương",
        bonus: {
            hp: 10,
            linhLuc: 10,
            cong: 5,
            thu: 5
        }
    },

    {
        ten: "🌌 Hỗn Độn",
        bonus: {
            tuLuyen: 15,
            linhLuc: 15,
            cong: 10,
            thu: 10,
            dotPha: 5
        }
    },

    {
        ten: "🌠 Không Gian",
        bonus: {
            tuLuyen: 10,
            cong: 10
        }
    },

    {
        ten: "⏳ Thời Gian",
        bonus: {
            tuLuyen: 20,
            dotPha: 5
        }
    }
];

// =====================================================
// QUAY PHẨM CẤP LINH CĂN
// =====================================================

function rollLinhCan() {

    const random =
        Math.random() * 100;

    let current = 0;

    for (
        const linhCan
        of LINH_CAN
    ) {

        current +=
            linhCan.tyLe;

        if (
            random <
            current
        ) {

            return {
                ...linhCan
            };
        }
    }

    return {
        ...LINH_CAN[
            LINH_CAN.length - 1
        ]
    };
}

// =====================================================
// QUAY THUỘC TÍNH
// =====================================================

function rollThuocTinh(
    linhCan
) {

    // Hồng Mông
    if (
        linhCan.id ===
        "hong_mong"
    ) {

        return {
            ten:
                "☯️ Hồng Mông",

            bonus: {
                tuLuyen: 25,
                hp: 20,
                linhLuc: 25,
                cong: 20,
                thu: 20,
                dotPha: 10
            }
        };
    }

    // Hỗn Độn
    if (
        linhCan.id ===
        "hon_don"
    ) {

        return {
            ten:
                "🌌 Hỗn Độn",

            bonus: {
                tuLuyen: 20,
                linhLuc: 20,
                cong: 15,
                thu: 15,
                dotPha: 8
            }
        };
    }

    // Hỗn Nguyên
    if (
        linhCan.id ===
        "hon_nguyen"
    ) {

        return {
            ten:
                "🔱 Hỗn Nguyên",

            bonus: {
                tuLuyen: 15,
                linhLuc: 15,
                cong: 12,
                thu: 12,
                dotPha: 6
            }
        };
    }

    const index =
        Math.floor(
            Math.random() *
            LINH_CAN_THUOC_TINH.length
        );

    return {
        ...LINH_CAN_THUOC_TINH[index]
    };
}

// =====================================================
// TÍNH BUFF CUỐI
// =====================================================

function buildLinhCan(
    linhCan,
    thuocTinh
) {

    const base =
        linhCan.buff || {};

    const element =
        thuocTinh?.bonus || {};

    return {

        id:
            linhCan.id,

        ten:
            linhCan.ten,

        phamCap:
            linhCan.phamCap,

        thuocTinh:
            thuocTinh.ten,

        moTa:
            linhCan.moTa,

        buff: {

            tuLuyen:
                (base.tuLuyen || 0) +
                (element.tuLuyen || 0),

            hp:
                (base.hp || 0) +
                (element.hp || 0),

            linhLuc:
                (base.linhLuc || 0) +
                (element.linhLuc || 0),

            cong:
                (base.cong || 0) +
                (element.cong || 0),

            thu:
                (base.thu || 0) +
                (element.thu || 0),

            dotPha:
                (base.dotPha || 0) +
                (element.dotPha || 0)
        }
    };
}

// =====================================================
// TẠO LINH CĂN HOÀN CHỈNH
// =====================================================

function generateLinhCan() {

    const linhCan =
        rollLinhCan();

    const thuocTinh =
        rollThuocTinh(
            linhCan
        );

    return buildLinhCan(
        linhCan,
        thuocTinh
    );
}

// =====================================================
// PLAYER MẶC ĐỊNH
// =====================================================

function createPlayer(
    userId,
    username
) {

    if (
        players[userId]
    ) {

        return players[userId];
    }

    players[userId] = {

        id:
            userId,

        username:
            username,

        // ===============================
        // TU VI
        // ===============================

        tuvi:
            0,

        canhGioi:
            "Luyện Khí",

        tang:
            1,

        realm:
            1,

        kinhNghiem:
            0,

        // ===============================
        // LINH CĂN
        // ===============================

        linhCan:
            null,

        // ===============================
        // LINH LỰC
        // ===============================

        linhLuc:
            0,

        linhThach:
            100,

        // ===============================
        // CHỈ SỐ
        // ===============================

        hp:
            100,

        maxHp:
            100,

        cong:
            10,

        thu:
            5,

        // ===============================
        // TRẠNG THÁI
        // ===============================

        beQuan:
            false,

        beQuanEnd:
            0,

        lastTrain:
            0,

        lastDungeon:
            0,

        lastBoss:
            0,

        // ===============================
        // THỐNG KÊ
        // ===============================

        bossDaGiet:
            0,

        phoBanDaHoanThanh:
            0,

        // ===============================
        // TÚI ĐỒ
        // ===============================

        tuiDo: {

            danDuoc: [],

            vatPham: [],

            linhThu: []
        },

        createdAt:
            Date.now()
    };

    save();

    return players[userId];
}

// =====================================================
// LẤY PLAYER
// =====================================================

function getPlayer(
    userId
) {

    const player =
        players[userId];

    if (!player) {

        return null;
    }

    // =================================================
    // MIGRATION CHO PLAYER CŨ
    // Không xóa dữ liệu cũ
    // =================================================

    let changed = false;

    if (
        player.tuvi === undefined
    ) {

        player.tuvi = 0;

        changed = true;
    }

    if (
        player.realm === undefined
    ) {

        player.realm = 1;

        changed = true;
    }

    if (
        player.canhGioi === undefined
    ) {

        player.canhGioi =
            "Luyện Khí";

        changed = true;
    }

    if (
        player.tang === undefined
    ) {

        player.tang = 1;

        changed = true;
    }

    if (
        player.linhCan === undefined
    ) {

        player.linhCan = null;

        changed = true;
    }

    if (
        player.linhLuc === undefined
    ) {

        player.linhLuc = 0;

        changed = true;
    }

    if (
        player.linhThach === undefined
    ) {

        player.linhThach = 100;

        changed = true;
    }

    if (
        player.hp === undefined
    ) {

        player.hp = 100;

        changed = true;
    }

    if (
        player.maxHp === undefined
    ) {

        player.maxHp = 100;

        changed = true;
    }

    if (
        player.cong === undefined
    ) {

        player.cong = 10;

        changed = true;
    }

    if (
        player.thu === undefined
    ) {

        player.thu = 5;

        changed = true;
    }

    if (
        player.kinhNghiem === undefined
    ) {

        player.kinhNghiem = 0;

        changed = true;
    }

    if (
        !player.tuiDo
    ) {

        player.tuiDo = {

            danDuoc: [],

            vatPham: [],

            linhThu: []
        };

        changed = true;
    }

    if (
        !Array.isArray(
            player.tuiDo.danDuoc
        )
    ) {

        player.tuiDo.danDuoc = [];

        changed = true;
    }

    if (
        !Array.isArray(
            player.tuiDo.vatPham
        )
    ) {

        player.tuiDo.vatPham = [];

        changed = true;
    }

    if (
        !Array.isArray(
            player.tuiDo.linhThu
        )
    ) {

        player.tuiDo.linhThu = [];

        changed = true;
    }

    if (changed) {

        save();
    }

    return player;
}

// =====================================================
// UPDATE PLAYER
// =====================================================

function updatePlayer(
    userId,
    data
) {

    if (
        !players[userId]
    ) {

        return null;
    }

    players[userId] = {

        ...players[userId],

        ...data
    };

    save();

    return players[userId];
}

// =====================================================
// TẤT CẢ PLAYER
// =====================================================

function getAllPlayers() {

    return Object.values(
        players
    );
}
// =====================================================
// ❤️ HỆ THỐNG HỒI MÁU TỰ ĐỘNG
// ❤️ Hồi 1% MAX HP mỗi giây
// =====================================================

function regenerateAllPlayers() {

    let changed = false;

    for (const player of Object.values(players)) {

        if (!player) continue;

        const maxHp = Math.max(
            1,
            Number(player.maxHp || 1)
        );

        const hp = Math.max(
            0,
            Number(player.hp || 0)
        );

        // Đã đầy máu
        if (hp >= maxHp) {
            continue;
        }

        // HP = 0 không tự hồi sinh
        if (hp <= 0) {
            continue;
        }

        // Hồi 1% Max HP mỗi giây
        const heal = Math.max(
            1,
            Math.floor(maxHp * 0.01)
        );

        const newHp = Math.min(
            maxHp,
            hp + heal
        );

        if (newHp !== hp) {
            player.hp = newHp;
            changed = true;
        }
    }

    if (changed) {
        save();
    }
}
// =====================================================
// THÊM ITEM
// =====================================================

function addItem(
    userId,
    type,
    item
) {

    const player =
        getPlayer(userId);

    if (!player) {

        return null;
    }

    if (
        !player.tuiDo[type]
    ) {

        player.tuiDo[type] = [];
    }

    player.tuiDo[type].push(
        item
    );

    save();

    return player;
}

// =====================================================
// EXPORT
// =====================================================

module.exports = {

    createPlayer,

    getPlayer,

    updatePlayer,

    getAllPlayers,
    
    regenerateAllPlayers,
    
    addItem,

    save,

    // Linh Căn
    generateLinhCan,

    rollLinhCan,

    rollThuocTinh,

    LINH_CAN,

    LINH_CAN_THUOC_TINH
};
