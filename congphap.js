const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const congPhap = [

    {
        id: "1",
        name: "🔥 Hỏa Vân Quyết",
        requiredRealm: 1,
        bonus: 10
    },

    {
        id: "2",
        name: "❄️ Băng Tâm Quyết",
        requiredRealm: 2,
        bonus: 20
    },

    {
        id: "3",
        name: "⚡ Cửu Thiên Lôi Quyết",
        requiredRealm: 3,
        bonus: 35
    },

    {
        id: "4",
        name: "🌪️ Thiên Phong Quyết",
        requiredRealm: 4,
        bonus: 50
    },

    {
        id: "5",
        name: "🔥 Phần Thiên Quyết",
        requiredRealm: 5,
        bonus: 70
    },

    {
        id: "6",
        name: "🌊 Thái Hư Thủy Quyết",
        requiredRealm: 6,
        bonus: 100
    },

    {
        id: "7",
        name: "🗡️ Vạn Kiếm Quyết",
        requiredRealm: 7,
        bonus: 140
    },

    {
        id: "8",
        name: "🌌 Thái Hư Kinh",
        requiredRealm: 8,
        bonus: 200
    },

    {
        id: "9",
        name: "☯️ Âm Dương Đạo Kinh",
        requiredRealm: 9,
        bonus: 280
    },

    {
        id: "10",
        name: "🌌 Hồng Hoang Đạo Kinh",
        requiredRealm: 10,
        bonus: 400
    },

    {
        id: "11",
        name: "👁️ Thiên Nhãn Thần Quyết",
        requiredRealm: 11,
        bonus: 550
    },

    {
        id: "12",
        name: "🐉 Tổ Long Chân Kinh",
        requiredRealm: 12,
        bonus: 750
    },

    {
        id: "13",
        name: "🔥 Phượng Hoàng Niết Bàn Kinh",
        requiredRealm: 13,
        bonus: 1000
    },

    {
        id: "14",
        name: "⚔️ Thái Cổ Chiến Thần Quyết",
        requiredRealm: 14,
        bonus: 1500
    },

    {
        id: "15",
        name: "☯️ Hỗn Độn Thiên Kinh",
        requiredRealm: 15,
        bonus: 2200
    },

    {
        id: "16",
        name: "🌠 Đại Đạo Kinh",
        requiredRealm: 16,
        bonus: 3500
    },

    {
        id: "17",
        name: "🌌 Thiên Đạo Chân Kinh",
        requiredRealm: 17,
        bonus: 6000
    },

    {
        id: "18",
        name: "♾️ Vô Thượng Đại Đạo Kinh",
        requiredRealm: 18,
        bonus: 10000
    }
];

module.exports = {
    congPhap
};
