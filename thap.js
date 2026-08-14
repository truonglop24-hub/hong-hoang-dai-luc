const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// =====================================================
// 📁 DATABASE
// =====================================================

const DATA_FILE = path.join(__dirname, "thap.json");

function loadData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(
                DATA_FILE,
                JSON.stringify({ players: {} }, null, 2)
            );
        }

        const data = JSON.parse(
            fs.readFileSync(DATA_FILE, "utf8")
        );

        if (!data.players) {
            data.players = {};
        }

        return data;
    } catch (error) {
        console.error("❌ Lỗi đọc thap.json:", error);

        return {
            players: {}
        };
    }
}

function saveData(data) {
    try {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 2)
        );
    } catch (error) {
        console.error("❌ Lỗi lưu thap.json:", error);
    }
}

// =====================================================
// 🧰 TIỆN ÍCH
// =====================================================

function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function formatNumber(number) {
    return Number(number || 0).toLocaleString("vi-VN");
}

function getToday() {
    const now = new Date();

    return (
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0")
    );
}

// =====================================================
// 👤 PLAYER
// =====================================================

function getPlayer(data, userId) {

    if (!data.players[userId]) {

        data.players[userId] = {

            tower: null,

            floor: 1,

            maxFloor: 0,

            pendingReward: {
                linhThach: 0,
                tuVi: 0,
                items: []
            },

            totalReward: {
                linhThach: 0,
                tuVi: 0,
                items: []
            },

            monster: null,

            defeated: false,

            // 🌅 4 LƯỢT MỖI NGÀY
            dailyTower: {
                date: getToday(),
                used: 0
            }
        };
    }

    const player = data.players[userId];

    // =================================================
    // 🌅 TỰ RESET LƯỢT KHI SANG NGÀY MỚI
    // =================================================

    if (
        !player.dailyTower ||
        player.dailyTower.date !== getToday()
    ) {

        player.dailyTower = {
            date: getToday(),
            used: 0
        };
    }

    // =================================================
    // 🛠️ BỔ SUNG DỮ LIỆU CŨ
    // =================================================

    if (!player.pendingReward) {
        player.pendingReward = {
            linhThach: 0,
            tuVi: 0,
            items: []
        };
    }

    if (!player.totalReward) {
        player.totalReward = {
            linhThach: 0,
            tuVi: 0,
            items: []
        };
    }

    if (!Array.isArray(player.pendingReward.items)) {
        player.pendingReward.items = [];
    }

    if (!Array.isArray(player.totalReward.items)) {
        player.totalReward.items = [];
    }

    return player;
}

// =====================================================
// 🏯 12 THÁP HỒNG HOANG
// =====================================================

const TOWERS = {

    luyen_the: {
        id: "luyen_the",
        name: "Luyện Thể Tháp",
        emoji: "🌿",
        difficulty: 0.75,
        description:
            "Tháp dành cho những tu sĩ mới bước vào con đường tu luyện.",
        reward: "linh_thach",
        rewardName: "💎 Linh Thạch"
    },

    chien_than: {
        id: "chien_than",
        name: "Chiến Thần Tháp",
        emoji: "⚔️",
        difficulty: 0.95,
        description:
            "Nơi tôi luyện chiến lực và ý chí chiến đấu.",
        reward: "luc_chien",
        rewardName: "⚔️ Chiến Lực"
    },

    tinh_than: {
        id: "tinh_than",
        name: "Tinh Thần Tháp",
        emoji: "🌌",
        difficulty: 1.15,
        description:
            "Tháp thử thách tinh thần và thần hồn.",
        reward: "tu_vi",
        rewardName: "🌀 Tu Vi"
    },

    liet_hoa: {
        id: "liet_hoa",
        name: "Liệt Hỏa Tháp",
        emoji: "🔥",
        difficulty: 1.35,
        description:
            "Biển lửa vô tận thiêu đốt mọi kẻ yếu.",
        reward: "hoa_dan",
        rewardName: "🔥 Hỏa Linh Đan"
    },

    han_bang: {
        id: "han_bang",
        name: "Hàn Băng Tháp",
        emoji: "❄️",
        difficulty: 1.55,
        description:
            "Hàn khí có thể đóng băng cả linh hồn.",
        reward: "bang_dan",
        rewardName: "❄️ Hàn Băng Đan"
    },

    loi_kiep: {
        id: "loi_kiep",
        name: "Lôi Kiếp Tháp",
        emoji: "🌩️",
        difficulty: 1.8,
        description:
            "Từng tầng đều chịu thiên lôi oanh kích.",
        reward: "loi_dan",
        rewardName: "⚡ Lôi Linh Đan"
    },

    van_yeu: {
        id: "van_yeu",
        name: "Vạn Yêu Tháp",
        emoji: "🐉",
        difficulty: 2.05,
        description:
            "Nơi hội tụ vô số yêu thú Hồng Hoang.",
        reward: "yeu_vat",
        rewardName: "🐉 Yêu Linh Tinh"
    },

    tu_la: {
        id: "tu_la",
        name: "Tu La Tháp",
        emoji: "👹",
        difficulty: 2.35,
        description:
            "Tháp Tu La chứa sát khí vô tận.",
        reward: "tu_la",
        rewardName: "🩸 Tu La Tinh"
    },

    hac_am: {
        id: "hac_am",
        name: "Hắc Ám Tháp",
        emoji: "🌑",
        difficulty: 2.7,
        description:
            "Một thế giới chìm trong bóng tối.",
        reward: "hac_am",
        rewardName: "🌑 Hắc Ám Tinh"
    },

    hong_hoang: {
        id: "hong_hoang",
        name: "Hồng Hoang Tháp",
        emoji: "🏯",
        difficulty: 3.1,
        description:
            "Tháp cổ chứa sức mạnh của Hồng Hoang.",
        reward: "phap_bao",
        rewardName: "✨ Pháp Bảo"
    },

    thien_dao: {
        id: "thien_dao",
        name: "Thiên Đạo Tháp",
        emoji: "🌠",
        difficulty: 3.6,
        description:
            "Mỗi bước đều bị Thiên Đạo khảo nghiệm.",
        reward: "thien_dao",
        rewardName: "🌠 Thiên Đạo Tinh"
    },

    dai_dao: {
        id: "dai_dao",
        name: "Đại Đạo Tháp",
        emoji: "♾️",
        difficulty: 4.5,
        description:
            "Nơi chỉ những đại năng chân chính mới có thể tiến vào.",
        reward: "dai_dao",
        rewardName: "♾️ Đại Đạo Tinh"
    }
};

// =====================================================
// 👹 QUÁI
// =====================================================

const MONSTERS = [
    "Hồng Hoang Hung Thú",
    "Luyện Thể Chiến Binh",
    "Thiên Lôi Chiến Tướng",
    "Thái Cổ Yêu Vương",
    "Tu La Chiến Hồn",
    "Hắc Ám Ma Quân",
    "Hồng Hoang Cự Thú",
    "Thiên Đạo Hóa Thân",
    "Đại Đạo Ma Thần"
];

function createMonster(
    tower,
    floor,
    playerHP,
    playerPower
) {

    const boss = floor % 10 === 0;

    const towerMultiplier =
        tower.difficulty;

    const floorMultiplier =
        1 + floor * 0.045;

    // ❤️ HP càng cao → quái càng mạnh
    const hpFactor =
        Math.sqrt(
            Math.max(playerHP, 1)
        );

    const powerFactor =
        Math.sqrt(
            Math.max(playerPower, 1)
        );

    let monsterHP =
        (
            hpFactor * 85 +
            powerFactor * 45
        ) *
        towerMultiplier *
        floorMultiplier;

    let monsterAttack =
        (
            hpFactor * 12 +
            powerFactor * 10
        ) *
        towerMultiplier *
        floorMultiplier;

    if (boss) {
        monsterHP *= 2.2;
        monsterAttack *= 1.8;
    }

    monsterHP = Math.max(
        500,
        Math.floor(monsterHP)
    );

    monsterAttack = Math.max(
        100,
        Math.floor(monsterAttack)
    );

    return {

        name: boss
            ? `👑 ${MONSTERS[random(0, MONSTERS.length - 1)]} BOSS`
            : `👹 ${MONSTERS[random(0, MONSTERS.length - 1)]}`,

        hp: monsterHP,

        maxHp: monsterHP,

        attack: monsterAttack,

        boss
    };
}

// =====================================================
// 🎁 PHẦN THƯỞNG
// =====================================================

function createReward(
    tower,
    floor
) {

    const base =
        Math.floor(
            500 *
            tower.difficulty *
            floor
        );

    const linhThach =
        base * random(2, 5);

    const tuVi =
        base * random(1, 3);

    const items = [];

    if (floor % 5 === 0) {

        items.push({

            id: tower.reward,

            name: tower.rewardName,

            amount:
                floor >= 50
                    ? 2
                    : 1
        });
    }

    if (floor % 10 === 0) {

        items.push({

            id:
                `${tower.id}_boss`,

            name:
                `🎁 ${tower.name} Boss Tinh`,

            amount: 1
        });
    }

    return {
        linhThach,
        tuVi,
        items
    };
}

// =====================================================
// 📜 DANH SÁCH THÁP
// =====================================================

function createTowerList() {

    let text =
        "## 🏯 BÁCH THÁP HỒNG HOANG\n\n";

    const list =
        Object.values(TOWERS);

    list.forEach(
        (tower, index) => {

            let difficulty;

            if (tower.difficulty <= 1) {
                difficulty = "🟢 Dễ";
            }
            else if (tower.difficulty <= 1.8) {
                difficulty = "🟡 Trung Bình";
            }
            else if (tower.difficulty <= 2.7) {
                difficulty = "🟠 Khó";
            }
            else if (tower.difficulty <= 3.6) {
                difficulty = "🔴 Rất Khó";
            }
            else {
                difficulty = "⚫ Đại Đạo";
            }

            text +=
                `**${index + 1}. ${tower.emoji} ${tower.name}**\n` +
                `> ${difficulty} • 🎁 ${tower.rewardName}\n` +
                `> ${tower.description}\n\n`;
        }
    );

    text +=
        "⚔️ **Chọn một tháp để bắt đầu thử thách.**\n\n" +
        "🌅 **Mỗi ngày chỉ được leo 4 lượt.**";

    return text;
}
// =====================================================
// 🔘 NÚT 12 THÁP
// =====================================================

function createTowerButtons() {

    const towers =
        Object.values(TOWERS);

    const rows = [];

    for (
        let i = 0;
        i < towers.length;
        i += 5
    ) {

        const row =
            new ActionRowBuilder();

        towers
            .slice(i, i + 5)
            .forEach(
                (tower) => {

                    row.addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                `thap_chon_${tower.id}`
                            )

                            .setLabel(
                                tower.name
                                    .replace(
                                        " Tháp",
                                        ""
                                    )
                                    .replace(
                                        "Tháp",
                                        ""
                                    )
                            )

                            .setEmoji(
                                tower.emoji
                            )

                            .setStyle(
                                ButtonStyle.Primary
                            )
                    );
                }
            );

        rows.push(row);
    }

    return rows;
}

// =====================================================
// 🎮 /THAP
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName("thap")

            .setDescription(
                "🏯 Bách Tháp Hồng Hoang"
            ),

    async execute(interaction) {

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🏯 HỒNG HOANG ĐẠI LỤC"
                )

                .setDescription(
                    createTowerList()
                )

                .setFooter({
                    text:
                        "⚔️ Bách Tháp • 🌅 4 lượt mỗi ngày"
                });

        return interaction.reply({

            embeds: [embed],

            components:
                createTowerButtons()
        });
    },

    // =================================================
    // 🔘 BUTTON HANDLER
    // =================================================

    async buttonHandler(interaction) {

        const id =
            interaction.customId;

        const data =
            loadData();

        const player =
            getPlayer(
                data,
                interaction.user.id
            );

        // =============================================
        // 🏯 CHỌN THÁP
        // =============================================

        if (
            id.startsWith(
                "thap_chon_"
            )
        ) {

            const towerId =
                id.replace(
                    "thap_chon_",
                    ""
                );

            const tower =
                TOWERS[towerId];

            if (!tower) {

                return interaction.reply({

                    content:
                        "❌ Không tìm thấy tháp.",

                    ephemeral: true
                });
            }

            player.tower =
                towerId;

            player.floor = 1;

            player.maxFloor = 0;

            player.pendingReward = {

                linhThach: 0,

                tuVi: 0,

                items: []
            };

            player.monster = null;

            player.defeated = false;

            saveData(data);

            return showTower(
                interaction,
                tower,
                player
            );
        }

        // =============================================
        // ⚔️ KHIÊU CHIẾN
        // =============================================

        if (
            id === "thap_khieu_chien"
        ) {

            if (!player.tower) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            // =========================================
            // 🌅 KIỂM TRA 4 LƯỢT / NGÀY
            // =========================================

            if (
                player.dailyTower.used >= 4
            ) {

                return interaction.reply({

                    content:
                        "⛔ **HÔM NAY BẠN ĐÃ HẾT LƯỢT LEO THÁP!**\n\n" +

                        "🏯 Mỗi ngày chỉ được khiêu chiến **4 lần**.\n\n" +

                        "⚔️ Lượt hôm nay: **4/4**\n\n" +

                        "🌅 **Ngày mai sẽ tự động reset về 4/4.**\n\n" +

                        "🚪 Bạn vẫn có thể **Rút Lui** để nhận phần thưởng đang giữ.",

                    ephemeral: true
                });
            }

            // =========================================
            // ⚔️ BẮT ĐẦU KHIÊU CHIẾN
            //
            // ❗ KHÔNG TRỪ LƯỢT Ở ĐÂY
            //
            // Một lượt chỉ bị trừ khi:
            // 💀 Người chơi thua
            // 🚪 Người chơi rút lui
            // =========================================

            const tower =
                TOWERS[player.tower];

            const playerHP =
                Number(
                    player.hp ||
                    player.maxHp ||
                    10000
                );

            const playerPower =
                Number(
                    player.lucChien ||
                    player.power ||
                    5000
                );

            const monster =
                createMonster(

                    tower,

                    player.floor,

                    playerHP,

                    playerPower
                );

            player.monster =
                monster;

            // =========================================
            // 🎲 TỶ LỆ THẮNG
            // =========================================

            const playerStrength =
                playerPower +
                playerHP * 0.35;

            const monsterStrength =
                monster.attack +
                monster.hp * 0.18;

            let chance =
                (
                    playerStrength /
                    (
                        playerStrength +
                        monsterStrength
                    )
                ) * 100;

            chance -=
                player.floor * 0.12;

            if (monster.boss) {
                chance -= 12;
            }

            chance =
                Math.max(
                    5,
                    Math.min(
                        95,
                        chance
                    )
                );

            const roll =
                random(1, 100);

            // =========================================
            // 🏆 THẮNG
            // =========================================

            if (roll <= chance) {

                const reward =
                    createReward(
                        tower,
                        player.floor
                    );

                player.pendingReward.linhThach +=
                    reward.linhThach;

                player.pendingReward.tuVi +=
                    reward.tuVi;

                for (
                    const item
                    of reward.items
                ) {

                    player.pendingReward.items.push(
                        item
                    );
                }

                player.maxFloor =
                    Math.max(
                        player.maxFloor || 0,
                        player.floor
                    );

                player.defeated = true;

                player.monster = null;

                saveData(data);

                return showVictory(
                    interaction,
                    tower,
                    player,
                    reward,
                    chance
                );
            }

            // =========================================
            // 💀 THUA → TRỪ 1 LƯỢT
            // =========================================

            player.dailyTower.used++;

            player.monster = null;

            saveData(data);

            return showDefeat(
                interaction,
                tower,
                player,
                chance
            );
        }

        // =============================================
        // ⚔️ TẦNG TIẾP
        // =============================================

        if (
            id === "thap_tiep"
        ) {

            if (!player.defeated) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa vượt qua tầng này.",

                    ephemeral: true
                });
            }

            if (player.floor >= 100) {

                return interaction.update({

                    content:
                        "🏆 **CHÚC MỪNG!**\n\n" +

                        `Bạn đã hoàn thành **100 tầng ${TOWERS[player.tower].name}**!\n\n` +

                        "🎁 Hãy bấm **Rút Lui & Nhận Thưởng** để nhận phần thưởng.",

                    embeds: [],

                    components: [

                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()

                                    .setCustomId(
                                        "thap_rut_lui"
                                    )

                                    .setLabel(
                                        "Rút Lui & Nhận Thưởng"
                                    )

                                    .setEmoji("🎁")

                                    .setStyle(
                                        ButtonStyle.Success
                                    )
                            )
                    ]
                });
            }

            player.floor++;

            player.defeated = false;

            player.monster = null;

            saveData(data);

            const tower =
                TOWERS[player.tower];

            return showTower(
                interaction,
                tower,
                player
            );
        }

        // =============================================
        // 🚪 RÚT LUI
        // =============================================

        if (
            id === "thap_rut_lui"
        ) {

            if (!player.tower) {

                return interaction.reply({

                    content:
                        "❌ Bạn hiện không ở trong tháp.",

                    ephemeral: true
                });
            }

            // =========================================
            // 🚪 RÚT LUI → TRỪ 1 LƯỢT
            // =========================================

            player.dailyTower.used++;

            const reward =
                player.pendingReward;

            const tower =
                TOWERS[player.tower];

            const result =

                `## 🚪 RÚT LUI THÀNH CÔNG\n\n` +

                `🏯 **${tower.name}**\n\n` +

                `📊 **Đã vượt:** ${player.maxFloor} tầng\n\n` +

                `⚔️ **Lượt leo hôm nay:** ` +
                `${Math.max(
                    0,
                    4 - player.dailyTower.used
                )}/4\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🎁 **PHẦN THƯỞNG**\n\n` +

                `💎 Linh Thạch:\n` +
                `**+${formatNumber(
                    reward.linhThach
                )}**\n\n` +

                `🌀 Tu Vi:\n` +
                `**+${formatNumber(
                    reward.tuVi
                )}**\n\n` +

                `${formatItems(
                    reward.items
                )}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `✨ Bạn đã bảo toàn toàn bộ phần thưởng!`;

            player.totalReward.linhThach +=
                reward.linhThach;

            player.totalReward.tuVi +=
                reward.tuVi;

            player.totalReward.items.push(
                ...reward.items
            );

            player.tower = null;

            player.floor = 1;

            player.pendingReward = {

                linhThach: 0,

                tuVi: 0,

                items: []
            };

            player.monster = null;

            player.defeated = false;

            saveData(data);

            return interaction.update({

                content: result,

                embeds: [],

                components: []
            });
        }

        // =============================================
        // 📜 THÔNG TIN
        // =============================================

        if (
            id === "thap_info"
        ) {

            if (!player.tower) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[player.tower];

            const remaining =
                Math.max(
                    0,
                    4 - player.dailyTower.used
                );

            return interaction.reply({

                content:

                    `🏯 **${tower.name}**\n\n` +

                    `📊 Tầng hiện tại: **${player.floor}/100**\n` +

                    `🏆 Cao nhất: **${player.maxFloor}**\n\n` +

                    `🌅 Lượt leo hôm nay: **${remaining}/4**\n\n` +

                    `🎁 ${tower.rewardName}\n\n` +

                    `${tower.description}`,

                ephemeral: true
            });
        }
    }
};
// =====================================================
// 🏯 HIỂN THỊ TẦNG
// =====================================================

async function showTower(
    interaction,
    tower,
    player
) {

    const floor =
        player.floor;

    const boss =
        floor % 10 === 0;

    const remaining =
        Math.max(
            0,
            4 - player.dailyTower.used
        );

    let difficulty;

    if (tower.difficulty <= 1) {
        difficulty = "🟢 Dễ";
    }
    else if (tower.difficulty <= 1.8) {
        difficulty = "🟡 Trung Bình";
    }
    else if (tower.difficulty <= 2.7) {
        difficulty = "🟠 Khó";
    }
    else if (tower.difficulty <= 3.6) {
        difficulty = "🔴 Rất Khó";
    }
    else {
        difficulty = "⚫ Đại Đạo";
    }

    const embed =
        new EmbedBuilder()

            .setTitle(
                `${tower.emoji} ${tower.name}`
            )

            .setDescription(

                `## 🏯 TẦNG ${floor} / 100\n\n` +

                `📈 **Độ khó:** ${difficulty}\n` +

                `⚔️ **Lượt leo hôm nay:** **${remaining}/4**\n\n` +

                `🌅 Mỗi ngày được khiêu chiến tối đa **4 lần**.\n\n` +

                `🎁 **Phần thưởng:** ${tower.rewardName}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                (
                    boss
                        ? "👑 **BOSS TẦNG!**\n" +
                          "⚠️ Tầng này khó hơn bình thường rất nhiều!\n\n"
                        : ""
                ) +

                `🎁 **THƯỞNG ĐANG GIỮ**\n\n` +

                `💎 ${formatNumber(
                    player.pendingReward.linhThach
                )} Linh Thạch\n` +

                `🌀 ${formatNumber(
                    player.pendingReward.tuVi
                )} Tu Vi\n\n` +

                `${formatItems(
                    player.pendingReward.items
                )}\n\n` +

                `❤️ **HP càng cao → quái càng mạnh!**`
            )

            .setFooter({

                text:
                    "⚔️ Bách Tháp Hồng Hoang"
            });

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "thap_khieu_chien"
                    )

                    .setLabel(
                        "Khiêu Chiến"
                    )

                    .setEmoji("⚔️")

                    .setStyle(
                        ButtonStyle.Danger
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        "thap_rut_lui"
                    )

                    .setLabel(
                        "Rút Lui"
                    )

                    .setEmoji("🚪")

                    .setStyle(
                        ButtonStyle.Success
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        "thap_info"
                    )

                    .setLabel(
                        "Thông Tin"
                    )

                    .setEmoji("📜")

                    .setStyle(
                        ButtonStyle.Secondary
                    )
            );

    return interaction.update({

        content: "",

        embeds: [embed],

        components: [row]
    });
}

// =====================================================
// 🏆 THẮNG
// =====================================================

async function showVictory(
    interaction,
    tower,
    player,
    reward,
    chance
) {

    const floor =
        player.floor;

    const boss =
        floor % 10 === 0;

    const remaining =
        Math.max(
            0,
            4 - player.dailyTower.used
        );

    const embed =
        new EmbedBuilder()

            .setTitle(

                boss
                    ? "👑 BOSS BỊ ĐÁNH BẠI!"
                    : "⚔️ VƯỢT QUA TẦNG!"
            )

            .setDescription(

                `## ${tower.emoji} ${tower.name}\n\n` +

                `🏯 **Tầng ${floor} / 100**\n\n` +

                `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                `🌅 **Lượt còn lại hôm nay: ${remaining}/4**\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🎁 **PHẦN THƯỞNG TẦNG ${floor}**\n\n` +

                `💎 +${formatNumber(
                    reward.linhThach
                )} Linh Thạch\n` +

                `🌀 +${formatNumber(
                    reward.tuVi
                )} Tu Vi\n\n` +

                `${formatItems(
                    reward.items
                )}\n\n` +

                `💰 **TỔNG THƯỞNG ĐANG GIỮ**\n\n` +

                `💎 ${formatNumber(
                    player.pendingReward.linhThach
                )}\n` +

                `🌀 ${formatNumber(
                    player.pendingReward.tuVi
                )}\n\n` +

                `⚠️ Nếu tiếp tục, tầng sau sẽ khó hơn!`
            )

            .setFooter({

                text:
                    "🔥 Hồng Hoang Đại Lục • Bách Tháp"
            });

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "thap_tiep"
                    )

                    .setLabel(
                        "Tầng Tiếp Theo"
                    )

                    .setEmoji("⚔️")

                    .setStyle(
                        ButtonStyle.Primary
                    ),

                new ButtonBuilder()

                    .setCustomId(
                        "thap_rut_lui"
                    )

                    .setLabel(
                        "Rút Lui & Nhận Thưởng"
                    )

                    .setEmoji("🎁")

                    .setStyle(
                        ButtonStyle.Success
                    )
            );

    return interaction.update({

        content: "",

        embeds: [embed],

        components: [row]
    });
}
// =====================================================
// 💀 THẤT BẠI
// =====================================================

async function showDefeat(
    interaction,
    tower,
    player,
    chance
) {

    const remaining =
        Math.max(
            0,
            4 - player.dailyTower.used
        );

    const embed =
        new EmbedBuilder()

            .setTitle(
                "💀 THẤT BẠI!"
            )

            .setDescription(

                `## ${tower.emoji} ${tower.name}\n\n` +

                `🏯 **Tầng:** ${player.floor}/100\n\n` +

                `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                `🌅 **Lượt còn lại hôm nay: ${remaining}/4**\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `💀 Bạn đã bị đánh bại.\n\n` +

                `⚔️ **Lượt này đã bị trừ vì bạn thất bại.**\n\n` +

                `🎁 **Phần thưởng các tầng trước vẫn được giữ:**\n\n` +

                `💎 ${formatNumber(
                    player.pendingReward.linhThach
                )} Linh Thạch\n` +

                `🌀 ${formatNumber(
                    player.pendingReward.tuVi
                )} Tu Vi\n\n` +

                `${formatItems(
                    player.pendingReward.items
                )}\n\n` +

                `⚠️ Bạn có thể rút lui để bảo toàn phần thưởng.`
            )

            .setFooter({

                text:
                    "💀 Không phải ai cũng có thể chinh phục Bách Tháp."
            });

    const row =
        new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "thap_rut_lui"
                    )

                    .setLabel(
                        "Rút Lui & Nhận Thưởng"
                    )

                    .setEmoji("🚪")

                    .setStyle(
                        ButtonStyle.Success
                    )
            );

    return interaction.update({

        content: "",

        embeds: [embed],

        components: [row]
    });
}

// =====================================================
// 🎁 HIỂN THỊ VẬT PHẨM
// =====================================================

function formatItems(items) {

    if (
        !items ||
        !items.length
    ) {

        return "🎁 Không có vật phẩm đặc biệt";
    }

    return items

        .map(
            item =>
                `${item.name} ×${item.amount}`
        )

        .join("\n");
}
