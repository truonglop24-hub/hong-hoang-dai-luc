const fs = require("fs");
const path = require("path");

// Database nằm trong Railway Volume
const DATA_DIR = "/app/data";
const DB_FILE = path.join(DATA_DIR, "players.json");

// Database cũ trong code
const OLD_DB_FILE = path.join(__dirname, "players.json");

// Tạo thư mục /app/data nếu chưa có
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

let players = {};

// Đọc database
function load() {
    // Nếu Volume chưa có database nhưng database cũ tồn tại
    // thì chuyển database cũ sang Volume
    if (!fs.existsSync(DB_FILE) && fs.existsSync(OLD_DB_FILE)) {
        try {
            fs.copyFileSync(OLD_DB_FILE, DB_FILE);
            console.log("Đã chuyển players.json sang Railway Volume.");
        } catch (error) {
            console.error("Không thể chuyển players.json:", error);
        }
    }

    if (!fs.existsSync(DB_FILE)) {
        players = {};
        return;
    }

    try {
        players = JSON.parse(
            fs.readFileSync(DB_FILE, "utf8")
        );
    } catch (error) {
        console.error("Không thể đọc players.json:", error);
        players = {};
    }
}

// Lưu database
function save() {
    try {
        fs.writeFileSync(
            DB_FILE,
            JSON.stringify(players, null, 2),
            "utf8"
        );
    } catch (error) {
        console.error("Không thể lưu players.json:", error);
    }
}

load();

function createPlayer(userId, username) {
    if (players[userId]) return players[userId];

    players[userId] = {
        id: userId,
        username,

        canhGioi: "Luyện Khí",
        tang: 1,
        kinhNghiem: 0,
        linhLuc: 0,
        linhThach: 100,

        hp: 100,
        maxHp: 100,
        cong: 10,
        thu: 5,

        beQuan: false,
        beQuanEnd: 0,

        lastTrain: 0,
        lastDungeon: 0,
        lastBoss: 0,

        bossDaGiet: 0,
        phoBanDaHoanThanh: 0,

        tuiDo: {
            danDuoc: [],
            vatPham: [],
            linhThu: []
        },

        createdAt: Date.now()
    };

    save();
    return players[userId];
}

function getPlayer(userId) {
    return players[userId] || null;
}

function updatePlayer(userId, data) {
    if (!players[userId]) return null;

    players[userId] = {
        ...players[userId],
        ...data
    };

    save();
    return players[userId];
}

function getAllPlayers() {
    return Object.values(players);
}

function addItem(userId, type, item) {
    const player = getPlayer(userId);
    if (!player) return null;

    if (!player.tuiDo[type]) {
        player.tuiDo[type] = [];
    }

    player.tuiDo[type].push(item);
    save();

    return player;
}

module.exports = {
    createPlayer,
    getPlayer,
    updatePlayer,
    getAllPlayers,
    addItem,
    save
};
