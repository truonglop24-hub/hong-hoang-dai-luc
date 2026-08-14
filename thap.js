const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const database = require("./database.js");

const {
    getPlayer,
    updatePlayer,
    addItem
} = database;

// =====================================================
// 🛠️ TIỆN ÍCH
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
        reward: "luyen_the_tinh",
        rewardName: "🌿 Luyện Thể Tinh"
    },

    chien_than: {
        id: "chien_than",
        name: "Chiến Thần Tháp",
        emoji: "⚔️",
        difficulty: 0.95,
        description:
            "Nơi tôi luyện chiến lực và ý chí chiến đấu.",
        reward: "chien_than_tinh",
        rewardName: "⚔️ Chiến Thần Tinh"
    },

    tinh_than: {
        id: "tinh_than",
        name: "Tinh Thần Tháp",
        emoji: "🌌",
        difficulty: 1.15,
        description:
            "Tháp thử thách tinh thần và thần hồn.",
        reward: "tinh_than_tinh",
        rewardName: "🌌 Tinh Thần Tinh"
    },

    liet_hoa: {
        id: "liet_hoa",
        name: "Liệt Hỏa Tháp",
        emoji: "🔥",
        difficulty: 1.35,
        description:
            "Biển lửa vô tận thiêu đốt mọi kẻ yếu.",
        reward: "hoa_linh_dan",
        rewardName: "🔥 Hỏa Linh Đan"
    },

    han_bang: {
        id: "han_bang",
        name: "Hàn Băng Tháp",
        emoji: "❄️",
        difficulty: 1.55,
        description:
            "Hàn khí có thể đóng băng cả linh hồn.",
        reward: "han_bang_dan",
        rewardName: "❄️ Hàn Băng Đan"
    },

    loi_kiep: {
        id: "loi_kiep",
        name: "Lôi Kiếp Tháp",
        emoji: "🌩️",
        difficulty: 1.8,
        description:
            "Từng tầng đều chịu thiên lôi oanh kích.",
        reward: "loi_linh_dan",
        rewardName: "⚡ Lôi Linh Đan"
    },

    van_yeu: {
        id: "van_yeu",
        name: "Vạn Yêu Tháp",
        emoji: "🐉",
        difficulty: 2.05,
        description:
            "Nơi hội tụ vô số yêu thú Hồng Hoang.",
        reward: "yeu_linh_tinh",
        rewardName: "🐉 Yêu Linh Tinh"
    },

    tu_la: {
        id: "tu_la",
        name: "Tu La Tháp",
        emoji: "👹",
        difficulty: 2.35,
        description:
            "Tháp Tu La chứa sát khí vô tận.",
        reward: "tu_la_tinh",
        rewardName: "🩸 Tu La Tinh"
    },

    hac_am: {
        id: "hac_am",
        name: "Hắc Ám Tháp",
        emoji: "🌑",
        difficulty: 2.7,
        description:
            "Một thế giới chìm trong bóng tối.",
        reward: "hac_am_tinh",
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
        reward: "thien_dao_tinh",
        rewardName: "🌠 Thiên Đạo Tinh"
    },

    dai_dao: {
        id: "dai_dao",
        name: "Đại Đạo Tháp",
        emoji: "♾️",
        difficulty: 4.5,
        description:
            "Nơi chỉ những đại năng chân chính mới có thể tiến vào.",
        reward: "dai_dao_tinh",
        rewardName: "♾️ Đại Đạo Tinh"
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
// 📊 TRẠNG THÁI THÁP
// =====================================================

function ensureTowerState(player) {

    if (!player.towerState) {

        player.towerState = {
            tower: null,
            floor: 1,
            maxFloor: 0,

            pendingReward: {
                linhThach: 0,
                tuvi: 0,
                items: []
            },

            active: false,

            // false = chưa trừ lượt
            // true = lượt đã bị trừ
            attemptCharged: false,

            defeated: false
        };
    }

    if (!player.towerState.pendingReward) {

        player.towerState.pendingReward = {
            linhThach: 0,
            tuvi: 0,
            items: []
        };
    }

    if (!Array.isArray(player.towerState.pendingReward.items)) {
        player.towerState.pendingReward.items = [];
    }

    if (player.towerState.floor === undefined) {
        player.towerState.floor = 1;
    }

    if (player.towerState.maxFloor === undefined) {
        player.towerState.maxFloor = 0;
    }

    if (player.towerState.attemptCharged === undefined) {
        player.towerState.attemptCharged = false;
    }

    if (player.towerState.active === undefined) {
        player.towerState.active = false;
    }

    return player.towerState;
}

// =====================================================
// 🌅 LƯỢT HẰNG NGÀY
// =====================================================

function ensureDailyTower(player) {

    if (!player.dailyTower) {

        player.dailyTower = {
            date: getToday(),
            used: 0
        };
    }

    if (player.dailyTower.date !== getToday()) {

        player.dailyTower = {
            date: getToday(),
            used: 0
        };
    }

    if (
        typeof player.dailyTower.used !== "number"
    ) {
        player.dailyTower.used = 0;
    }

    return player.dailyTower;
}

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

    const floorMultiplier =
        1 + floor * 0.045;

    // HP càng cao -> quái càng mạnh
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
        tower.difficulty *
        floorMultiplier;

    let monsterAttack =
        (
            hpFactor * 12 +
            powerFactor * 10
        ) *
        tower.difficulty *
        floorMultiplier;

    if (boss) {

        monsterHP *= 2.2;
        monsterAttack *= 1.8;
    }

    monsterHP =
        Math.max(
            500,
            Math.floor(monsterHP)
        );

    monsterAttack =
        Math.max(
            100,
            Math.floor(monsterAttack)
        );

    return {

        name: boss
            ? `👑 ${MONSTERS[random(
                0,
                MONSTERS.length - 1
            )]} BOSS`
            : `👹 ${MONSTERS[random(
                0,
                MONSTERS.length - 1
            )]}`,

        hp: monsterHP,

        maxHp: monsterHP,

        attack: monsterAttack,

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
        base *
        random(2, 5);

    const tuvi =
        base *
        random(1, 3);

    const items = [];

    // Mỗi 5 tầng
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

    // Boss mỗi 10 tầng
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

        tuvi,

        items
    };
}

// =====================================================
// 🎁 CỘNG PHẦN THƯỞNG THẲNG VÀO NHÂN VẬT
// =====================================================

function giveReward(
    player,
    reward
) {

    if (!reward) return;

    // ---------------------------------------------
    // 💎 LINH THẠCH
    // ---------------------------------------------

    player.linhThach =
        Number(
            player.linhThach || 0
        ) +
        Number(
            reward.linhThach || 0
        );

    // ---------------------------------------------
    // 🌀 TU VI
    // ---------------------------------------------

    player.tuvi =
        Number(
            player.tuvi || 0
        ) +
        Number(
            reward.tuvi || 0
        );

    // ---------------------------------------------
    // 🎁 VẬT PHẨM
    // ---------------------------------------------

    if (!player.tuiDo) {

        player.tuiDo = {

            danDuoc: [],

            vatPham: [],

            linhThu: []
        };
    }

    if (
        !Array.isArray(
            player.tuiDo.vatPham
        )
    ) {

        player.tuiDo.vatPham = [];
    }

    for (
        const item
        of reward.items || []
    ) {

        for (
            let i = 0;
            i < Number(item.amount || 1);
            i++
        ) {

            player.tuiDo.vatPham.push({

                id: item.id,

                name: item.name,

                amount: 1,

                source: "thap",

                obtainedAt:
                    new Date().toISOString()
            });
        }
    }
}

// =====================================================
// 🎁 CỘNG TOÀN BỘ THƯỞNG ĐANG GIỮ
// =====================================================

function claimPendingReward(
    player
) {

    const state =
        ensureTowerState(player);

    const reward = {

        linhThach:
            Number(
                state.pendingReward.linhThach || 0
            ),

        tuvi:
            Number(
                state.pendingReward.tuvi || 0
            ),

        items:
            Array.isArray(
                state.pendingReward.items
            )
                ? state.pendingReward.items
                : []
    };

    giveReward(
        player,
        reward
    );

    return reward;
}

// =====================================================
// 🧹 RESET PHIÊN THÁP
// =====================================================

function resetTowerRun(player) {

    player.towerState = {

        tower: null,

        floor: 1,

        maxFloor: 0,

        pendingReward: {

            linhThach: 0,

            tuvi: 0,

            items: []
        },

        active: false,

        attemptCharged: false,

        defeated: false
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

                if (
                    tower.difficulty <= 1
                ) {
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

                text +=

                    `**${index + 1}. ${tower.emoji} ${tower.name}**\n` +

                    `> ${difficulty} • 🎁 ${tower.rewardName}\n` +

                    `> ${tower.description}\n\n`;
            }
        );

    text +=

        "⚔️ **Chọn một tháp để bắt đầu thử thách.**\n\n" +

        "🌅 **Mỗi ngày chỉ được sử dụng tối đa 4 lượt.**\n\n" +

        "ℹ️ Khiêu chiến từng tầng **không trừ lượt**.\n" +

        "🚪 Rút lui hoặc bị đánh bại mới tính **1 lượt**.";

    return text;
}

// =====================================================
// 🔘 NÚT THÁP
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
// 📦 FORMAT ITEM
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
// 🏯 HIỂN THỊ TẦNG
// =====================================================

async function showTower(
    interaction,
    tower,
    player
) {

    const state =
        ensureTowerState(player);

    const floor =
        state.floor;

    const boss =
        floor % 10 === 0;

    const daily =
        ensureDailyTower(player);

    const remaining =
        Math.max(
            0,
            4 - daily.used
        );

    let difficulty;

    if (
        tower.difficulty <= 1
    ) {
        difficulty = "🟢 Dễ";
    }
    else if (
        tower.difficulty <= 1.8
    ) {
        difficulty = "🟡 Trung Bình";
    }
    else if (
        tower.difficulty <= 2.7
    ) {
        difficulty = "🟠 Khó";
    }
    else if (
        tower.difficulty <= 3.6
    ) {
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

                `⚔️ **Lượt đã dùng:** ${daily.used}/4\n` +

                `🌅 **Lượt còn lại:** ${remaining}/4\n\n` +

                `ℹ️ Leo tầng **không trừ lượt**.\n` +

                `🚪 Rút lui hoặc thất bại mới tính 1 lượt.\n\n` +

                `🎁 **Phần thưởng đang giữ**\n\n` +

                `💎 ${formatNumber(
                    state.pendingReward.linhThach
                )} Linh Thạch\n` +

                `🌀 ${formatNumber(
                    state.pendingReward.tuvi
                )} Tu Vi\n\n` +

                `${formatItems(
                    state.pendingReward.items
                )}\n\n` +

                (
                    boss
                        ? "👑 **BOSS TẦNG!**\n⚠️ Tầng này khó hơn bình thường rất nhiều!\n\n"
                        : ""
                ) +

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
                        "Rút Lui & Nhận Thưởng"
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
// 🏆 HIỂN THỊ THẮNG
// =====================================================

async function showVictory(
    interaction,
    tower,
    player,
    reward,
    chance
) {

    const state =
        ensureTowerState(player);

    const daily =
        ensureDailyTower(player);

    const boss =
        state.floor % 10 === 0;

    const embed =
        new EmbedBuilder()

            .setTitle(

                boss
                    ? "👑 BOSS BỊ ĐÁNH BẠI!"
                    : "⚔️ VƯỢT QUA TẦNG!"
            )

            .setDescription(

                `## ${tower.emoji} ${tower.name}\n\n` +

                `🏯 **Tầng ${state.floor} / 100**\n\n` +

                `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                `🌅 **Lượt đã dùng: ${daily.used}/4**\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🎁 **PHẦN THƯỞNG TẦNG NÀY**\n\n` +

                `💎 +${formatNumber(
                    reward.linhThach
                )} Linh Thạch\n` +

                `🌀 +${formatNumber(
                    reward.tuvi
                )} Tu Vi\n\n` +

                `${formatItems(
                    reward.items
                )}\n\n` +

                `💰 **TỔNG ĐANG GIỮ**\n\n` +

                `💎 ${formatNumber(
                    state.pendingReward.linhThach
                )}\n` +

                `🌀 ${formatNumber(
                    state.pendingReward.tuvi
                )}\n\n` +

                `⚠️ Tiếp tục leo sẽ **không trừ thêm lượt**.\n` +

                `🚪 Rút lui sẽ tính **1 lượt duy nhất** và nhận toàn bộ thưởng.`
            );

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
// 💀 HIỂN THỊ THẤT BẠI
// =====================================================

async function showDefeat(
    interaction,
    tower,
    player,
    chance
) {

    const state =
        ensureTowerState(player);

    const daily =
        ensureDailyTower(player);

    const embed =
        new EmbedBuilder()

            .setTitle(
                "💀 BẠN ĐÃ BỊ ĐÁNH BẠI!"
            )

            .setDescription(

                `## ${tower.emoji} ${tower.name}\n\n` +

                `🏯 **Tầng:** ${state.floor}/100\n\n` +

                `🎲 Tỷ lệ thắng: **${chance.toFixed(1)}%**\n\n` +

                `🌅 **Lượt đã dùng:** ${daily.used}/4\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `💀 Bạn đã bị đánh bại.\n\n` +

                `⚔️ Lần thất bại này đã tính **1 lượt**.\n\n` +

                `🎁 **Phần thưởng các tầng trước vẫn được giữ:**\n\n` +

                `💎 ${formatNumber(
                    state.pendingReward.linhThach
                )} Linh Thạch\n` +

                `🌀 ${formatNumber(
                    state.pendingReward.tuvi
                )} Tu Vi\n\n` +

                `${formatItems(
                    state.pendingReward.items
                )}\n\n` +

                `🚪 Bấm **Rút Lui & Nhận Thưởng**.\n` +

                `⚠️ Rút lui lúc này **không trừ thêm lượt**.`
            );

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
// 🎮 /THAP
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName("thap")

            .setDescription(
                "🏯 Bách Tháp Hồng Hoang"
            ),

    // =================================================
    // EXECUTE
    // =================================================

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
                        "⚔️ Bách Tháp • 4 lượt mỗi ngày"
                });

        return interaction.reply({

            embeds: [embed],

            components:
                createTowerButtons()
        });
    },

    // =================================================
    // BUTTON HANDLER
    // =================================================

    async buttonHandler(interaction) {

        const id =
            interaction.customId;

        let player =
            getPlayer(
                interaction.user.id
            );

        if (!player) {

            return interaction.reply({

                content:
                    "❌ Bạn chưa đăng ký nhân vật. Hãy dùng lệnh đăng ký trước.",

                ephemeral: true
            });
        }

        ensureDailyTower(player);

        const state =
            ensureTowerState(player);

        updatePlayer(
            interaction.user.id,
            {
                dailyTower:
                    player.dailyTower,
                towerState:
                    player.towerState
            }
        );

        // =================================================
        // 🏯 CHỌN THÁP
        // =================================================

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

            // Không cho đổi tháp khi đang giữ thưởng
            if (
                state.active &&
                (
                    state.pendingReward.linhThach > 0 ||
                    state.pendingReward.tuvi > 0 ||
                    state.pendingReward.items.length > 0
                )
            ) {

                return interaction.reply({

                    content:
                        "⚠️ Bạn đang ở trong một lượt leo tháp.\n\n" +
                        "🚪 Hãy **Rút Lui & Nhận Thưởng** trước khi chọn tháp khác.",

                    ephemeral: true
                });
            }

            state.tower =
                towerId;

            state.floor =
                1;

            state.maxFloor =
                0;

            state.pendingReward = {

                linhThach: 0,

                tuvi: 0,

                items: []
            };

            state.active =
                true;

            state.attemptCharged =
                false;

            state.defeated =
                false;

            updatePlayer(
                interaction.user.id,
                {
                    towerState:
                        player.towerState
                }
            );

            return showTower(
                interaction,
                tower,
                player
            );
        }

        // =================================================
        // ⚔️ KHIÊU CHIẾN
        // =================================================

        if (
            id ===
            "thap_khieu_chien"
        ) {

            if (
                !state.active ||
                !state.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            // =================================================
            // ❗ QUAN TRỌNG:
            // KHÔNG TRỪ LƯỢT Ở ĐÂY
            // =================================================

            const tower =
                TOWERS[state.tower];

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
                    state.floor,
                    playerHP,
                    playerPower
                );

            // =================================================
            // 🎲 TỶ LỆ THẮNG
            // =================================================

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
                state.floor * 0.12;

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

            // =================================================
            // 🏆 THẮNG
            // =================================================

            if (
                roll <= chance
            ) {

                const reward =
                    createReward(
                        tower,
                        state.floor
                    );

                state.pendingReward.linhThach +=
                    reward.linhThach;

                state.pendingReward.tuvi +=
                    reward.tuvi;

                state.pendingReward.items.push(
                    ...reward.items
                );

                state.maxFloor =
                    Math.max(
                        state.maxFloor,
                        state.floor
                    );

                state.defeated =
                    false;

                updatePlayer(
                    interaction.user.id,
                    {
                        towerState:
                            player.towerState
                    }
                );

                return showVictory(
                    interaction,
                    tower,
                    player,
                    reward,
                    chance
                );
            }

            // =================================================
            // 💀 THẤT BẠI
            // =================================================

            state.defeated =
                true;

            // ================================================
            // ⚠️ CHỈ TRỪ 1 LƯỢT Ở LẦN THẤT BẠI
            // ================================================

            if (
                !state.attemptCharged
            ) {

                const daily =
                    ensureDailyTower(player);

                if (
                    daily.used >= 4
                ) {

                    return interaction.reply({

                        content:
                            "⛔ Bạn đã hết 4 lượt hôm nay.",

                        ephemeral: true
                    });
                }

                daily.used++;

                state.attemptCharged =
                    true;

                player.dailyTower =
                    daily;
            }

            updatePlayer(
                interaction.user.id,
                {
                    dailyTower:
                        player.dailyTower,

                    towerState:
                        player.towerState
                }
            );

            return showDefeat(
                interaction,
                tower,
                player,
                chance
            );
        }

        // =================================================
        // ⚔️ TẦNG TIẾP
        // =================================================

        if (
            id ===
            "thap_tiep"
        ) {

            if (
                !state.active ||
                !state.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn không ở trong tháp.",

                    ephemeral: true
                });
            }

            if (
                state.defeated
            ) {

                return interaction.reply({

                    content:
                        "💀 Bạn đã bị đánh bại. Hãy rút lui.",

                    ephemeral: true
                });
            }

            if (
                state.floor >= 100
            ) {

                // =========================================
                // 🏆 HOÀN THÀNH THÁP
                // =========================================

                const reward =
                    claimPendingReward(
                        player
                    );

                updatePlayer(
                    interaction.user.id,
                    {
                        linhThach:
                            player.linhThach,

                        tuvi:
                            player.tuvi,

                        tuiDo:
                            player.tuiDo
                    }
                );

                const tower =
                    TOWERS[state.tower];

                resetTowerRun(
                    player
                );

                updatePlayer(
                    interaction.user.id,
                    {
                        towerState:
                            player.towerState
                    }
                );

                return interaction.update({

                    content:

                        `🏆 **HOÀN THÀNH THÁP!**\n\n` +

                        `🏯 **${tower.name}**\n\n` +

                        `🎉 Bạn đã chinh phục **100/100 tầng**!\n\n` +

                        `🎁 **Phần thưởng đã tự động cộng vào nhân vật:**\n\n` +

                        `💎 +${formatNumber(
                            reward.linhThach
                        )} Linh Thạch\n` +

                        `🌀 +${formatNumber(
                            reward.tuvi
                        )} Tu Vi\n\n` +

                        `${formatItems(
                            reward.items
                        )}\n\n` +

                        `💰 Linh Thạch hiện tại:\n` +

                        `**${formatNumber(
                            player.linhThach
                        )}**\n\n` +

                        `🌀 Tu Vi hiện tại:\n` +

                        `**${formatNumber(
                            player.tuvi
                        )}**`,

                    embeds: [],

                    components: []
                });
            }

            // =========================================
            // ➡️ TĂNG TẦNG
            // =========================================

            state.floor++;

            state.defeated =
                false;

            updatePlayer(
                interaction.user.id,
                {
                    towerState:
                        player.towerState
                }
            );

            const tower =
                TOWERS[state.tower];

            return showTower(
                interaction,
                tower,
                player
            );
        }

        // =================================================
        // 🚪 RÚT LUI
        // =================================================

        if (
            id ===
            "thap_rut_lui"
        ) {

            if (
                !state.active ||
                !state.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn hiện không ở trong tháp.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[state.tower];

            // ================================================
            // 🌅 RÚT LUI CHỈ TRỪ 1 LƯỢT
            // ================================================

            if (
                !state.attemptCharged
            ) {

                const daily =
                    ensureDailyTower(player);

                if (
                    daily.used >= 4
                ) {

                    return interaction.reply({

                        content:
                            "⛔ Bạn đã hết lượt hôm nay.",

                        ephemeral: true
                    });
                }

                daily.used++;

                state.attemptCharged =
                    true;

                player.dailyTower =
                    daily;
            }

            // ================================================
            // 🎁 CỘNG THƯỞNG VÀO NHÂN VẬT
            // ================================================

            const reward =
                claimPendingReward(
                    player
                );

            // ================================================
            // 💾 LƯU DATABASE
            // ================================================

            updatePlayer(
                interaction.user.id,
                {

                    linhThach:
                        player.linhThach,

                    tuvi:
                        player.tuvi,

                    tuiDo:
                        player.tuiDo,

                    dailyTower:
                        player.dailyTower
                }
            );

            const used =
                player.dailyTower.used;

            const currentLinhThach =
                Number(
                    player.linhThach || 0
                );

            const currentTuVi =
                Number(
                    player.tuvi || 0
                );

            // ================================================
            // 🧹 RESET SAU KHI ĐÃ NHẬN
            // ================================================

            resetTowerRun(
                player
            );

            updatePlayer(
                interaction.user.id,
                {
                    towerState:
                        player.towerState
                }
            );

            return interaction.update({

                content:

                    `## 🚪 RÚT LUI THÀNH CÔNG\n\n` +

                    `🏯 **${tower.name}**\n\n` +

                    `📊 **Đã vượt:** ${state.maxFloor} tầng\n\n` +

                    `🌅 **Lượt hôm nay:** ${used}/4\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🎁 **PHẦN THƯỞNG ĐÃ CỘNG VÀO NHÂN VẬT**\n\n` +

                    `💎 +${formatNumber(
                        reward.linhThach
                    )} Linh Thạch\n` +

                    `🌀 +${formatNumber(
                        reward.tuvi
                    )} Tu Vi\n\n` +

                    `${formatItems(
                        reward.items
                    )}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `💰 **Linh Thạch hiện tại:**\n` +

                    `**${formatNumber(
                        currentLinhThach
                    )}**\n\n` +

                    `🌀 **Tu Vi hiện tại:**\n` +

                    `**${formatNumber(
                        currentTuVi
                    )}**\n\n` +

                    `✅ Phần thưởng đã được lưu vào nhân vật.\n` +

                    `❗ Lượt leo chỉ bị trừ **1 lần**.`,

                embeds: [],

                components: []
            });
        }

        // =================================================
        // 📜 THÔNG TIN
        // =================================================

        if (
            id ===
            "thap_info"
        ) {

            if (
                !state.active ||
                !state.tower
            ) {

                return interaction.reply({

                    content:
                        "❌ Bạn chưa chọn tháp.",

                    ephemeral: true
                });
            }

            const tower =
                TOWERS[state.tower];

            const daily =
                ensureDailyTower(player);

            const remaining =
                Math.max(
                    0,
                    4 - daily.used
                );

            return interaction.reply({

                content:

                    `🏯 **${tower.name}**\n\n` +

                    `📊 Tầng hiện tại:\n` +

                    `**${state.floor}/100**\n\n` +

                    `🏆 Tầng cao nhất:\n` +

                    `**${state.maxFloor}**\n\n` +

                    `🌅 Lượt đã dùng:\n` +

                    `**${daily.used}/4**\n\n` +

                    `🌅 Lượt còn lại:\n` +

                    `**${remaining}/4**\n\n` +

                    `🎁 Phần thưởng đang giữ:\n` +

                    `💎 ${formatNumber(
                        state.pendingReward.linhThach
                    )} Linh Thạch\n` +

                    `🌀 ${formatNumber(
                        state.pendingReward.tuvi
                    )} Tu Vi\n\n` +

                    `${formatItems(
                        state.pendingReward.items
                    )}\n\n` +

                    `❤️ HP càng cao → quái càng mạnh.\n\n` +

                    `⚔️ Khiêu chiến tầng không trừ lượt.\n` +

                    `🚪 Rút lui mới tính 1 lượt nếu chưa bị đánh bại.`,

                ephemeral: true
            });
        }
    }
};
