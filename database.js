const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data.json");

function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify({ players: {} }, null, 2));
        }

        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (error) {
        console.error("❌ Lỗi đọc database:", error);
        return { players: {} };
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("❌ Lỗi lưu database:", error);
    }
}

function getPlayer(userId) {
    const data = loadData();
    return data.players[userId] || null;
}

function createPlayer(userId, username) {
    const data = loadData();

    if (data.players[userId]) {
        return data.players[userId];
    }

    const player = {
        id: userId,
        username: username,

        realm: "Luyện Khí",
        level: 1,
        linhLuc: 0,
        linhThach: 100,

        exp: 0,

        beQuan: false,
        beQuanUntil: 0,

        inventory: {
            danDuoc: [],
            linhThu: []
        },

        linhThuActive: null,

        lastTraining: 0,
        lastDungeon: 0,
        lastBoss: 0
    };

    data.players[userId] = player;
    saveData(data);

    return player;
}

function updatePlayer(userId, changes) {
    const data = loadData();

    if (!data.players[userId]) {
        return null;
    }

    data.players[userId] = {
        ...data.players[userId],
        ...changes
    };

    saveData(data);

    return data.players[userId];
}

function addLinhThach(userId, amount) {
    const player = getPlayer(userId);

    if (!player) return null;

    player.linhThach += amount;

    updatePlayer(userId, {
        linhThach: player.linhThach
    });

    return player.linhThach;
}

function removeLinhThach(userId, amount) {
    const player = getPlayer(userId);

    if (!player) return false;

    if (player.linhThach < amount) {
        return false;
    }

    player.linhThach -= amount;

    updatePlayer(userId, {
        linhThach: player.linhThach
    });

    return true;
}

function addLinhLuc(userId, amount) {
    const player = getPlayer(userId);

    if (!player) return null;

    player.linhLuc += amount;

    updatePlayer(userId, {
        linhLuc: player.linhLuc
    });

    return player.linhLuc;
}

function addItem(userId, type, item) {
    const player = getPlayer(userId);

    if (!player) return null;

    if (!player.inventory[type]) {
        player.inventory[type] = [];
    }

    player.inventory[type].push(item);

    updatePlayer(userId, {
        inventory: player.inventory
    });

    return player.inventory;
}

function getAllPlayers() {
    const data = loadData();

    return Object.values(data.players);
}

module.exports = {
    loadData,
    saveData,
    getPlayer,
    createPlayer,
    updatePlayer,
    addLinhThach,
    removeLinhThach,
    addLinhLuc,
    addItem,
    getAllPlayers
};
