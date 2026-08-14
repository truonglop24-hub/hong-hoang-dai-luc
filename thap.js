const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database (2)(10).js");

// =====================================================
// 🏯 BÁCH THÁP HỒNG HOANG
// =====================================================

const MAX_FLOOR = 100;
const MAX_DAILY_RUNS = 4;

// =====================================================
// 🧰 TIỆN ÍCH
// =====================================================

function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function formatNumber(number) {
    return Number(number || 0)
        .toLocaleString("vi-VN");
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
// 👤 KHỞI TẠO DỮ LIỆU THÁP
// =====================================================

function initTowerData(player) {

    let changed = false;

    if (!player.thap) {

        player.thap = {

            tower: null,

            floor: 1,

            maxFloor: 0,

            pendingReward: {

                linhThach: 0,

                tuVi: 0,

                items: []
            },

            defeated: false
        };

        changed = true;
    }

    if (!player.thap.pendingReward) {

        player.thap.pendingReward = {

            linhThach: 0,

            tuVi: 0,

            items: []
        };

        changed = true;
    }

    if (
        !Array.isArray(
            player.thap.pendingReward.items
        )
    ) {

        player.thap.pendingReward.items = [];

        changed = true;
    }

    if (!player.dailyTower) {

        player.dailyTower = {

            date: getToday(),

            used: 0
        };

        changed = true;
    }

    if (
        player.dailyTower.date !==
        getToday()
    ) {

        player.dailyTower = {

            date: getToday(),

            used: 0
        };

        changed = true;
    }

    if (changed) {
        database.save();
    }

    return player;
}

// =====================================================
// 🏯 DANH SÁCH THÁP
// =====================================================

const TOWERS = {

    luyen_the: {

        id: "luyen_the",

        name: "Luyện Thể Tháp",

        emoji: "🌿",

        difficulty: 0.75,

        rewardName:
            "💎 Linh Thạch + 🌀 Tu Vi",

        description:
            "Tháp dành cho tu sĩ mới bước vào con đường tu luyện."
    },

    chien_than: {

        id: "chien_than",

        name: "Chiến Thần Tháp",

        emoji: "⚔️",

        difficulty: 0.95,

        rewardName:
            "⚔️ Chiến Lực + 💎 Linh Thạch",

        description:
            "Nơi tôi luyện chiến lực và ý chí chiến đấu."
    },

    tinh_than: {

        id: "tinh_than",

        name: "Tinh Thần Tháp",

        emoji: "🌌",

        difficulty: 1.15,

        rewardName:
            "🌀 Tu Vi + 💎 Linh Thạch",

        description:
            "Tháp thử thách tinh thần và thần hồn."
    },

    liet_hoa: {

        id: "liet_hoa",

        name: "Liệt Hỏa Tháp",

        emoji: "🔥",

        difficulty: 1.35,

        rewardName:
            "🔥 Hỏa Linh Đan",

        description:
            "Biển lửa vô tận thiêu đốt mọi kẻ yếu."
    },

    han_bang: {

        id: "han_bang",

        name: "Hàn Băng Tháp",

        emoji: "❄️",

        difficulty: 1.55,

        rewardName:
            "❄️ Hàn Băng Đan",

        description:
            "Hàn khí có thể đóng băng cả linh hồn."
    },

    loi_kiep: {

        id: "loi_kiep",

        name: "Lôi Kiếp Tháp",

        emoji: "🌩️",

        difficulty: 1.8,

        rewardName:
            "⚡ Lôi Linh Đan",

        description:
            "Từng tầng đều chịu thiên lôi oanh kích."
    },

    van_yeu: {

        id: "van_yeu",

        name: "Vạn Yêu Tháp",

        emoji: "🐉",

        difficulty: 2.05,

        rewardName:
            "🐉 Yêu Linh Tinh",

        description:
            "Nơi hội tụ vô số yêu thú Hồng Hoang."
    },

    tu_la: {

        id: "tu_la",

        name: "Tu La Tháp",

        emoji: "👹",

        difficulty: 2.35,

        rewardName:
            "🩸 Tu La Tinh",

        description:
            "Tháp Tu La chứa sát khí vô tận."
    },

    hac_am: {

        id: "hac_am",

        name: "Hắc Ám Tháp",

        emoji: "🌑",

        difficulty: 2.7,

        rewardName:
            "🌑 Hắc Ám Tinh",

        description:
            "Một thế giới chìm trong bóng tối."
    },

    hong_hoang: {

        id: "hong_hoang",

        name: "Hồng Hoang Tháp",

        emoji: "🏯",

        difficulty: 3.1,

        rewardName:
            "✨ Pháp Bảo",

        description:
            "Tháp cổ chứa sức mạnh của Hồng Hoang."
    },

    thien_dao: {

        id: "thien_dao",

        name: "Thiên Đạo Tháp",

        emoji: "🌠",

        difficulty: 3.6,

        rewardName:
            "🌠 Thiên Đạo Tinh",

        description:
            "Mỗi bước đều bị Thiên Đạo khảo nghiệm."
    },

    dai_dao: {

        id: "dai_dao",

        name: "Đại Đạo Tháp",

        emoji: "♾️",

        difficulty: 4.5,

        rewardName:
            "♾️ Đại Đạo Tinh",

        description:
            "Nơi chỉ đại năng chân chính mới có thể tiến vào."
    }
};

// =====================================================
// 👹 DANH SÁCH QUÁI
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

// =====================================================
// 👹 TẠO QUÁI
// =====================================================

function createMonster(
    tower,
    floor,
    playerHP,
    playerPower
) {

    const boss =
        floor % 10 === 0;

    const towerMultiplier =
        tower.difficulty;

    const floorMultiplier =
        1 + floor * 0.045;

    // ❤️ HP càng cao → quái càng mạnh
    const hpFactor =
        Math.sqrt(
            Math.max(
                playerHP,
                1
            )
        );

    const powerFactor =
        Math.sqrt(
            Math.max(
                playerPower,
                1
            )
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

    return {

        name:
            boss

                ? `👑 ${MONSTERS[
                    random(
                        0,
                        MONSTERS.length - 1
                    )
                ]} BOSS`

                : `👹 ${MONSTERS[
                    random(
                        0,
                        MONSTERS.length - 1
                    )
                ]}`,

        hp:
            Math.max(
                500,
                Math.floor(monsterHP)
            ),

        maxHp:
            Math.max(
                500,
                Math.floor(monsterHP)
            ),

        attack:
            Math.max(
                100,
                Math.floor(monsterAttack)
            ),

        boss
    };
}

// =====================================================
// 🎁 TẠO PHẦN THƯỞNG
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

    // 🎁 Mỗi 5 tầng có vật phẩm
    if (
        floor % 5 === 0
    ) {

        items.push({

            id:
                `${tower.id}_floor`,

            name:
                tower.rewardName,

            amount:
                floor >= 50
                    ? 2
                    : 1
        });
    }

    // 👑 Boss mỗi 10 tầng
    if (
        floor % 10 === 0
    ) {

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

    Object.values(TOWERS)
        .forEach(
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
        "━━━━━━━━━━━━━━━━━━━━\n" +
        "🌅 **Mỗi ngày chỉ được leo 4 lượt.**\n" +
        "⚔️ **Một lượt chỉ bị trừ khi bạn thất bại hoặc rút lui.**\n" +
        "🏆 **Thắng tầng không trừ lượt.**";

    return text;
}

// =====================================================
// 🔘 TẠO NÚT CHỌN THÁP
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
                tower => {

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
// 🎁 CỘNG PHẦN THƯỞNG TRỰC TIẾP VÀO NHÂN VẬT
// =====================================================

function addRewardToPlayer(
    player,
    reward
) {

    // 💎 LINH THẠCH
    if (
        Number(reward.linhThach || 0) > 0
    ) {

        player.linhThach =
            Number(
                player.linhThach || 0
            ) +
            Number(
                reward.linhThach || 0
            );
    }

    // 🌀 TU VI
    if (
        Number(reward.tuVi || 0) > 0
    ) {

        player.tuvi =
            Number(
                player.tuvi || 0
            ) +
            Number(
                reward.tuVi || 0
            );
    }

    // 🎒 VẬT PHẨM
    if (
        !player.tuiDo
    ) {

        player.tuiDo = {

            danDuoc: {},

            vatPham: {},

            linhThu: {}
        };
    }

    if (
        !player.tuiDo.vatPham
    ) {

        player.tuiDo.vatPham = {};
    }

    for (
        const item
        of reward.items || []
    ) {

        const itemId =
            item.id ||
            item.name;

        if (
            !player.tuiDo.vatPham[itemId]
        ) {

            player.tuiDo.vatPham[itemId] = {

                name:
                    item.name,

                amount: 0
            };
        }

        player.tuiDo.vatPham[itemId].amount +=
            Number(
                item.amount || 1
            );
    }

    // 💾 LƯU DATABASE CHÍNH
    database.save();
}

// =====================================================
// 🎁 CỘNG TOÀN BỘ THƯỞNG ĐANG GIỮ
// =====================================================

function claimPendingReward(
    player
) {

    const pending =
        player.thap.pendingReward;

    if (!pending) {

        return {
            linhThach: 0,
            tuVi: 0,
            items: []
        };
    }

    const reward = {

        linhThach:
            Number(
                pending.linhThach || 0
            ),

        tuVi:
            Number(
                pending.tuVi || 0
            ),

        items:
            Array.isArray(
                pending.items
            )
                ? pending.items
                : []
    };

    // ================================================
    // 💰 CỘNG TRỰC TIẾP VÀO NHÂN VẬT
    // ================================================

    addRewardToPlayer(
        player,
        reward
    );

    // ================================================
    // 🧹 XÓA THƯỞNG ĐANG GIỮ
    // ================================================

    player.thap.pendingReward = {

        linhThach: 0,

        tuVi: 0,

        items: []
    };

    database.save();

    return reward;
}

// =====================================================
// 🎁 HIỂN THỊ ITEM
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

// =====================================================
// 📊 HIỂN THỊ PHẦN THƯỞNG ĐANG GIỮ
// =====================================================

function formatPendingReward(
    player
) {

    const reward =
        player.thap.pendingReward;

    return (

        `💎 **${formatNumber(
            reward.linhThach
        )}** Linh Thạch\n` +

        `🌀 **${formatNumber(
            reward.tuVi
        )}** Tu Vi\n\n` +

        formatItems(
            reward.items
        )
    );
}

// =====================================================
// 🎮 LỆNH /THAP
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName("thap")

            .setDescription(
                "🏯 Bách Tháp Hồng Hoang"
            ),

    async execute(interaction) {

        const player =
            database.getPlayer(
                interaction.user.id
            );

        initTowerData(player);

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🏯 BÁCH THÁP HỒNG HOANG"
                )

                .setDescription(
                    createTowerList()
                )

                .setFooter({
                    text:
                        "⚔️ Hồng Hoang Đại Lục • 4 lượt mỗi ngày"
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

        const player =
            database.getPlayer(
                interaction.user.id
            );

        initTowerData(player);

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

            player.thap.tower =
                towerId;

            player.thap.floor =
                1;

            player.thap.maxFloor =
                0;

            player.thap.pendingReward = {

                linhThach: 0,

                tuVi: 0,

                items: []
            };

            player.thap.defeated =
                false;

            database.save();

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

            if (
                !player.thap.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            // =========================================
            // 🌅 KIỂM TRA LƯỢT
            // =========================================

            if (
                player.dailyTower.used >=
                MAX_DAILY_RUNS
            ) {

                return interaction.reply({

                    content:

                        "⛔ **BẠN ĐÃ HẾT LƯỢT LEO THÁP HÔM NAY!**\n\n" +

                        "🌅 Mỗi ngày được leo tối đa **4 lượt**.\n\n" +

                        `⚔️ Đã dùng: **${player.dailyTower.used}/4**\n\n` +

                        "✨ Ngày mai lượt sẽ tự động reset.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[
                    player.thap.tower
                ];

            // =========================================
            // ❤️ LẤY HP NHÂN VẬT
            // =========================================

            const playerHP =
                Number(
                    player.hp ||
                    player.maxHp ||
                    player.thongTin?.hp ||
                    10000
                );

            // =========================================
            // ⚔️ LẤY LỰC CHIẾN
            // =========================================

            const playerPower =
                Number(
                    player.lucChien ||
                    player.power ||
                    player.thongTin?.lucChien ||
                    5000
                );

            // =========================================
            // 👹 TẠO QUÁI
            // =========================================

            const monster =
                createMonster(

                    tower,

                    player.thap.floor,

                    playerHP,

                    playerPower
                );

            // =========================================
            // 🎲 TÍNH TỶ LỆ
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
                player.thap.floor *
                0.12;

            if (
                monster.boss
            ) {

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

            if (
                roll <= chance
            ) {

                const reward =
                    createReward(

                        tower,

                        player.thap.floor
                    );

                // =====================================
                // 🎁 THƯỞNG TẦNG ĐƯỢC CỘNG NGAY
                // =====================================

                addRewardToPlayer(
                    player,
                    reward
                );

                player.thap.maxFloor =
                    Math.max(

                        player.thap.maxFloor || 0,

                        player.thap.floor
                    );

                player.thap.defeated =
                    true;

                database.save();

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

            player.thap.defeated =
                false;

            database.save();

            return showDefeat(

                interaction,

                tower,

                player,

                chance
            );
        }
                // =============================================
        // ⚔️ TẦNG TIẾP THEO
        // =============================================

        if (
            id === "thap_tiep"
        ) {

            if (
                !player.thap.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn hiện không ở trong tháp.",

                    ephemeral: true
                });
            }

            if (
                !player.thap.defeated
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa vượt qua tầng hiện tại.",

                    ephemeral: true
                });
            }

            // =========================================
            // 🏆 HOÀN THÀNH 100 TẦNG
            // =========================================

            if (
                player.thap.floor >=
                MAX_FLOOR
            ) {

                const tower =
                    TOWERS[
                        player.thap.tower
                    ];

                // =====================================
                // 🎁 THƯỞNG HOÀN THÀNH THÁP
                // =====================================

                const completionReward = {

                    linhThach:
                        Math.floor(
                            500 *
                            tower.difficulty *
                            100 *
                            5
                        ),

                    tuVi:
                        Math.floor(
                            500 *
                            tower.difficulty *
                            100 *
                            3
                        ),

                    items: [

                        {

                            id:
                                `${tower.id}_hoan_thanh`,

                            name:
                                `🏆 ${tower.name} Hoàn Thành`,

                            amount: 1
                        }
                    ]
                };

                // =====================================
                // 💰 CỘNG THẲNG VÀO NHÂN VẬT
                // =====================================

                addRewardToPlayer(

                    player,

                    completionReward
                );

                // =====================================
                // 🧹 KẾT THÚC CHUYẾN LEO
                // =====================================

                player.thap.tower =
                    null;

                player.thap.floor =
                    1;

                player.thap.maxFloor =
                    Math.max(
                        player.thap.maxFloor || 0,
                        MAX_FLOOR
                    );

                player.thap.defeated =
                    false;

                player.thap.pendingReward = {

                    linhThach: 0,

                    tuVi: 0,

                    items: []
                };

                database.save();

                return interaction.update({

                    content:

                        `# 🏆 HOÀN THÀNH THÁP!\n\n` +

                        `${tower.emoji} **${tower.name}**\n\n` +

                        `🎉 Bạn đã chinh phục toàn bộ **100 tầng**!\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `🎁 **PHẦN THƯỞNG ĐÃ CỘNG VÀO NHÂN VẬT**\n\n` +

                        `💎 +**${formatNumber(
                            completionReward.linhThach
                        )}** Linh Thạch\n\n` +

                        `🌀 +**${formatNumber(
                            completionReward.tuVi
                        )}** Tu Vi\n\n` +

                        `${formatItems(
                            completionReward.items
                        )}\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `💾 Phần thưởng đã được lưu trực tiếp vào database.\n` +

                        `⚔️ Lượt leo của chuyến này đã hoàn tất.`,

                    embeds: [],

                    components: []
                });
            }

            // =========================================
            // ➡️ SANG TẦNG TIẾP
            // =========================================

            player.thap.floor++;

            player.thap.defeated =
                false;

            database.save();

            const tower =
                TOWERS[
                    player.thap.tower
                ];

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

            if (
                !player.thap.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn hiện không ở trong tháp.",

                    ephemeral: true
                });
            }

            // =========================================
            // 🚪 RÚT LUI = TRỪ 1 LƯỢT
            // =========================================

            if (
                player.dailyTower.used >=
                MAX_DAILY_RUNS
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn đã hết lượt leo tháp hôm nay.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[
                    player.thap.tower
                ];

            const reachedFloor =
                Math.max(

                    0,

                    (
                        player.thap.maxFloor ||
                        player.thap.floor - 1
                    )
                );

            // =========================================
            // 🎁 THƯỞNG RÚT LUI
            // =========================================

            const reward =
                claimPendingReward(
                    player
                );

            // =========================================
            // 🌅 TRỪ 1 LƯỢT
            // =========================================

            player.dailyTower.used++;

            // =========================================
            // 🧹 KẾT THÚC CHUYẾN LEO
            // =========================================

            player.thap.tower =
                null;

            player.thap.floor =
                1;

            player.thap.defeated =
                false;

            player.thap.pendingReward = {

                linhThach: 0,

                tuVi: 0,

                items: []
            };

            database.save();

            const remaining =
                Math.max(

                    0,

                    MAX_DAILY_RUNS -
                    player.dailyTower.used
                );

            return interaction.update({

                content:

                    `# 🚪 RÚT LUI THÀNH CÔNG\n\n` +

                    `${tower.emoji} **${tower.name}**\n\n` +

                    `🏯 Đã vượt qua: **${reachedFloor} tầng**\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🎁 **PHẦN THƯỞNG ĐÃ CỘNG VÀO NHÂN VẬT**\n\n` +

                    `💎 +**${formatNumber(
                        reward.linhThach
                    )}** Linh Thạch\n\n` +

                    `🌀 +**${formatNumber(
                        reward.tuVi
                    )}** Tu Vi\n\n` +

                    `${formatItems(
                        reward.items
                    )}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🌅 Lượt còn lại hôm nay: **${remaining}/4**\n\n` +

                    `💾 Tất cả phần thưởng đã được lưu vào nhân vật.`,

                embeds: [],

                components: []
            });
        }

        // =============================================
        // 📜 THÔNG TIN THÁP
        // =============================================

        if (
            id === "thap_info"
        ) {

            if (
                !player.thap.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[
                    player.thap.tower
                ];

            const remaining =
                Math.max(

                    0,

                    MAX_DAILY_RUNS -
                    player.dailyTower.used
                );

            return interaction.reply({

                content:

                    `🏯 **${tower.name}**\n\n` +

                    `📊 Tầng hiện tại: **${player.thap.floor}/${MAX_FLOOR}**\n` +

                    `🏆 Cao nhất chuyến này: **${player.thap.maxFloor}**\n\n` +

                    `🌅 Lượt còn lại hôm nay: **${remaining}/4**\n\n` +

                    `🎁 **Phần thưởng đã nhận trực tiếp:**\n` +

                    `💎 ${formatNumber(
                        player.linhThach
                    )} Linh Thạch\n` +

                    `🌀 ${formatNumber(
                        player.tuvi
                    )} Tu Vi\n\n` +

                    `${tower.description}`,

                ephemeral: true
            });
        }
    }
        // =============================================
        // 🏯 CÁC HÀM HIỂN THỊ THÁP
        // =============================================

        async function showTower(
            interaction,
            tower,
            player
        ) {

            const floor =
                player.thap.floor;

            const boss =
                floor % 10 === 0;

            const remaining =
                Math.max(
                    0,
                    MAX_DAILY_RUNS -
                    player.dailyTower.used
                );

            let difficulty;

            if (tower.difficulty <= 1) {

                difficulty =
                    "🟢 Dễ";
            }
            else if (
                tower.difficulty <= 1.8
            ) {

                difficulty =
                    "🟡 Trung Bình";
            }
            else if (
                tower.difficulty <= 2.7
            ) {

                difficulty =
                    "🟠 Khó";
            }
            else if (
                tower.difficulty <= 3.6
            ) {

                difficulty =
                    "🔴 Rất Khó";
            }
            else {

                difficulty =
                    "⚫ Đại Đạo";
            }

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        `${tower.emoji} ${tower.name}`
                    )

                    .setDescription(

                        `## 🏯 TẦNG ${floor}/${MAX_FLOOR}\n\n` +

                        `📈 **Độ khó:** ${difficulty}\n` +

                        `🌅 **Lượt còn lại:** ${remaining}/4\n\n` +

                        `🎁 **Phần thưởng:** ${tower.rewardName}\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        (
                            boss

                                ? "👑 **BOSS TẦNG!**\n" +
                                  "⚠️ Boss mạnh hơn bình thường rất nhiều!\n\n"

                                : ""
                        ) +

                        `🎁 **THƯỞNG ĐÃ NHẬN TRONG CHUYẾN NÀY**\n\n` +

                        `💎 Phần thưởng mỗi tầng được cộng **ngay lập tức** vào nhân vật.\n\n` +

                        `❤️ **HP càng cao → quái càng mạnh.**\n\n` +

                        `⚔️ **Thắng tầng không mất lượt.**\n` +

                        `🚪 **Rút lui hoặc thất bại mới mất 1 lượt.**`
                    )

                    .setFooter({

                        text:
                            "⚔️ Hồng Hoang Đại Lục • Bách Tháp"
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

        // =============================================
        // 🏆 THẮNG TẦNG
        // =============================================

        async function showVictory(
            interaction,
            tower,
            player,
            reward,
            chance
        ) {

            const floor =
                player.thap.floor;

            const boss =
                floor % 10 === 0;

            const remaining =
                Math.max(
                    0,
                    MAX_DAILY_RUNS -
                    player.dailyTower.used
                );

            const embed =
                new EmbedBuilder()

                    .setTitle(

                        boss

                            ? "👑 BOSS ĐÃ BỊ ĐÁNH BẠI!"

                            : "⚔️ VƯỢT QUA TẦNG!"
                    )

                    .setDescription(

                        `## ${tower.emoji} ${tower.name}\n\n` +

                        `🏯 **Tầng ${floor}/${MAX_FLOOR}**\n\n` +

                        `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                        `🌅 Lượt còn lại: **${remaining}/4**\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `🎁 **PHẦN THƯỞNG ĐÃ CỘNG VÀO NHÂN VẬT**\n\n` +

                        `💎 +${formatNumber(
                            reward.linhThach
                        )} Linh Thạch\n` +

                        `🌀 +${formatNumber(
                            reward.tuVi
                        )} Tu Vi\n\n` +

                        `${formatItems(
                            reward.items
                        )}\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `💾 Phần thưởng đã được lưu trực tiếp.\n\n` +

                        `⚔️ Tiếp tục leo sẽ **không trừ thêm lượt**.`
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
                                "Rút Lui"
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

        // =============================================
        // 💀 THẤT BẠI
        // =============================================

        async function showDefeat(
            interaction,
            tower,
            player,
            chance
        ) {

            const remaining =
                Math.max(
                    0,
                    MAX_DAILY_RUNS -
                    player.dailyTower.used
                );

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "💀 THẤT BẠI!"
                    )

                    .setDescription(

                        `## ${tower.emoji} ${tower.name}\n\n` +

                        `🏯 **Tầng ${player.thap.floor}/${MAX_FLOOR}**\n\n` +

                        `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `💀 Bạn đã bị đánh bại.\n\n` +

                        `❌ **1 lượt leo đã bị trừ.**\n\n` +

                        `🌅 Lượt còn lại: **${remaining}/4**\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `🎁 Các phần thưởng của những tầng đã vượt qua đã được cộng trực tiếp vào nhân vật.\n\n` +

                        `💎 Linh Thạch hiện tại: **${formatNumber(
                            player.linhThach
                        )}**\n\n` +

                        `🌀 Tu Vi hiện tại: **${formatNumber(
                            player.tuvi
                        )}**\n\n` +

                        `🚪 Bạn có thể rút lui để kết thúc chuyến leo.`
                    )

                    .setFooter({

                        text:
                            "💀 Thất bại không làm mất phần thưởng đã nhận."
                    });

            const row =
                new ActionRowBuilder()
                    .addComponents(

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
                            )
                    );

            return interaction.update({

                content: "",

                embeds: [embed],

                components: [row]
            });
        }
