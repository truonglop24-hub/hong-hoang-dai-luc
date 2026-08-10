const Database = require("better-sqlite3");

const db = new Database("honghoang.db");

db.exec(`
CREATE TABLE IF NOT EXISTS players (
    user_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    realm INTEGER DEFAULT 0,
    realm_name TEXT DEFAULT 'Phàm Nhân',
    cultivation INTEGER DEFAULT 0,
    spirit_stones INTEGER DEFAULT 1000,
    merit INTEGER DEFAULT 0,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    attack INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 10,
    speed INTEGER DEFAULT 10,
    luck INTEGER DEFAULT 1,
    talent TEXT DEFAULT 'Phàm Cốt',
    spirit_root TEXT DEFAULT 'Ngũ Hành',
    created_at INTEGER
);
`);

function getPlayer(userId) {
    return db
        .prepare("SELECT * FROM players WHERE user_id = ?")
        .get(userId);
}

function createPlayer(userId, name) {
    const exists = getPlayer(userId);

    if (exists) return exists;

    db.prepare(`
        INSERT INTO players
        (user_id, name, created_at)
        VALUES (?, ?, ?)
    `).run(userId, name, Date.now());

    return getPlayer(userId);
}

module.exports = {
    db,
    getPlayer,
    createPlayer
};
