const fs = require("fs");
const path = require("path");

const DB_FILE = path.join(__dirname, "players.json");

let players = {};

function load() {
    if (!fs.existsSync(DB_FILE)) {
        players = {};
        return;
    }

    try {
        players = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch (error) {
        console.error("Không thể đọc players.json:", error);
        players = {};
    }
}

function save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(players, null, 2), "utf8");
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
