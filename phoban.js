const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer,
    addItem
} = require("./database");

// ==========================================
// ⏱️ COOLDOWN 5 PHÚT
// ==========================================

const COOLDOWN = 5 * 60 * 1000;

// ==========================================
// 🏯 20 PHÓ BẢN HỒNG HOANG
// ==========================================

const DUNGEONS = {

    "thung-lung-hong-hoang": {
        name: "🌋 Thung Lũng Hồng Hoang",
        desc: "Yêu thú cổ đại hung bạo.",
        hpMin: 10000,
        hpMax: 20000,
        atkMin: 1500,
        atkMax: 3500,
        expMin: 500,
        expMax: 1500,
        stoneMin: 500,
        stoneMax: 2000
    },

    "son-hai-bi-canh": {
        name: "🏔️ Sơn Hải Bí Cảnh",
        desc: "Bí cảnh cổ xưa đầy đại yêu.",
        hpMin: 15000,
        hpMax: 30000,
        atkMin: 2000,
        atkMax: 4500,
        expMin: 800,
        expMax: 2500,
        stoneMin: 800,
        stoneMax: 3000
    },

    "yeu-hoang-coc": {
        name: "🐉 Yêu Hoàng Cốc",
        desc: "Lãnh địa của Yêu Hoàng.",
        hpMin: 25000,
        hpMax: 50000,
        atkMin: 3000,
        atkMax: 6500,
        expMin: 1200,
        expMax: 4000,
        stoneMin: 1200,
        stoneMax: 5000
    },

    "bat-hoang-co-gioi": {
        name: "⚔️ Bát Hoang Cổ Giới",
        desc: "Cổ giới tử địa.",
        hpMin: 40000,
        hpMax: 80000,
        atkMin: 5000,
        atkMax: 10000,
        expMin: 2000,
        expMax: 7000,
        stoneMin: 2000,
        stoneMax: 8000
    },

    "hon-don-thap": {
        name: "🌌 Hỗn Độn Tháp",
        desc: "Hỗn Độn yêu thú cực mạnh.",
        hpMin: 70000,
        hpMax: 150000,
        atkMin: 8000,
        atkMax: 18000,
        expMin: 4000,
        expMax: 12000,
        stoneMin: 4000,
        stoneMax: 15000
    },

    "thien-dao-cam-dia": {
        name: "☯️ Thiên Đạo Cấm Địa",
        desc: "Cấm địa tối thượng Hồng Hoang.",
        hpMin: 150000,
        hpMax: 300000,
        atkMin: 15000,
        atkMax: 35000,
        expMin: 10000,
        expMax: 30000,
        stoneMin: 10000,
        stoneMax: 50000
    },

    "van-co-than-son": {
        name: "⛰️ Vạn Cổ Thần Sơn",
        desc: "Thần sơn tồn tại từ thời khai thiên.",
        hpMin: 250000,
        hpMax: 500000,
        atkMin: 25000,
        atkMax: 50000,
        expMin: 15000,
        expMax: 40000,
        stoneMin: 15000,
        stoneMax: 70000
    },

    "long-toc-thanh-dia": {
        name: "🐲 Long Tộc Thánh Địa",
        desc: "Thánh địa của Chân Long cổ đại.",
        hpMin: 400000,
        hpMax: 800000,
        atkMin: 40000,
        atkMax: 80000,
        expMin: 20000,
        expMax: 60000,
        stoneMin: 20000,
        stoneMax: 100000
    },

    "phuong-hoang-niet-ban": {
        name: "🔥 Phượng Hoàng Niết Bàn",
        desc: "Bất tử hỏa thiêu đốt vạn vật.",
        hpMin: 600000,
        hpMax: 1200000,
        atkMin: 60000,
        atkMax: 120000,
        expMin: 30000,
        expMax: 90000,
        stoneMin: 30000,
        stoneMax: 150000
    },

    "ky-lan-than-vuc": {
        name: "🦄 Kỳ Lân Thần Vực",
        desc: "Thần vực của Thượng Cổ Kỳ Lân.",
        hpMin: 900000,
        hpMax: 1800000,
        atkMin: 90000,
        atkMax: 180000,
        expMin: 40000,
        expMax: 120000,
        stoneMin: 40000,
        stoneMax: 200000
    },

    "thai-co-ma-vuc": {
        name: "👹 Thái Cổ Ma Vực",
        desc: "Ma khí bao phủ toàn bộ thiên địa.",
        hpMin: 1200000,
        hpMax: 2500000,
        atkMin: 120000,
        atkMax: 250000,
        expMin: 60000,
        expMax: 180000,
        stoneMin: 60000,
        stoneMax: 300000
    },

    "vo-tan-huyet-hai": {
        name: "🩸 Vô Tận Huyết Hải",
        desc: "Huyết hải nơi vô số đại năng vẫn lạc.",
        hpMin: 1800000,
        hpMax: 3500000,
        atkMin: 180000,
        atkMax: 350000,
        expMin: 80000,
        expMax: 250000,
        stoneMin: 80000,
        stoneMax: 400000
    },

    "thoi-khong-loan-luu": {
        name: "🌀 Thời Không Loạn Lưu",
        desc: "Không gian hỗn loạn nghiền nát thần hồn.",
        hpMin: 2500000,
        hpMax: 5000000,
        atkMin: 250000,
        atkMax: 500000,
        expMin: 100000,
        expMax: 350000,
        stoneMin: 100000,
        stoneMax: 500000
    },

    "hon-nguyen-thanh-canh": {
        name: "☯️ Hỗn Nguyên Thánh Cảnh",
        desc: "Thánh cảnh của cường giả đỉnh cao.",
        hpMin: 3500000,
        hpMax: 7000000,
        atkMin: 350000,
        atkMax: 700000,
        expMin: 150000,
        expMax: 500000,
        stoneMin: 150000,
        stoneMax: 700000
    },

    "thien-dinh-phe-khu": {
        name: "🏯 Thiên Đình Phế Khư",
        desc: "Tàn tích Thiên Đình cổ đại.",
        hpMin: 5000000,
        hpMax: 10000000,
        atkMin: 500000,
        atkMax: 1000000,
        expMin: 200000,
        expMax: 700000,
        stoneMin: 200000,
        stoneMax: 1000000
    },

    "dia-phu-u-minh": {
        name: "💀 Địa Phủ U Minh",
        desc: "U Minh giới nơi vạn hồn tụ hội.",
        hpMin: 7000000,
        hpMax: 14000000,
        atkMin: 700000,
        atkMax: 1400000,
        expMin: 300000,
        expMax: 1000000,
        stoneMin: 300000,
        stoneMax: 1500000
    },

    "thanh-thien-co-lo": {
        name: "🌌 Thanh Thiên Cổ Lộ",
        desc: "Con đường cổ dẫn tới cảnh giới tối cao.",
        hpMin: 10000000,
        hpMax: 20000000,
        atkMin: 1000000,
        atkMax: 2000000,
        expMin: 500000,
        expMax: 1500000,
        stoneMin: 500000,
        stoneMax: 2500000
    },

    "dai-dao-cam-khu": {
        name: "⚡ Đại Đạo Cấm Khu",
        desc: "Cấm khu bị Đại Đạo nguyền rủa.",
        hpMin: 15000000,
        hpMax: 30000000,
        atkMin: 1500000,
        atkMax: 3000000,
        expMin: 800000,
        expMax: 2500000,
        stoneMin: 800000,
        stoneMax: 4000000
    },

    "vo-thuong-than-vuc": {
        name: "👑 Vô Thượng Thần Vực",
        desc: "Thần vực của những tồn tại vô thượng.",
        hpMin: 25000000,
        hpMax: 50000000,
        atkMin: 2500000,
        atkMax: 5000000,
        expMin: 1500000,
        expMax: 5000000,
        stoneMin: 1500000,
        stoneMax: 8000000
    },

    "hong-hoang-chung-cuc": {
        name: "🌠 HỒNG HOANG CHUNG CỰC",
        desc: "Phó bản cuối cùng của Hồng Hoang.",
        hpMin: 50000000,
        hpMax: 100000000,
        atkMin: 5000000,
        atkMax: 10000000,
        expMin: 3000000,
        expMax: 10000000,
        stoneMin: 3000000,
        stoneMax: 20000000
    }
};

// ==========================================
// RANDOM CHỈ DÙNG ĐỂ TẠO CHỈ SỐ / PHẦN THƯỞNG
// Không dùng để quyết định thắng thua
// ==========================================

function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

// ==========================================
// PHẨM CẤP ĐỒ
// ==========================================

const RARITIES = [
    {
        name: "⚪ Phàm Phẩm",
        weight: 45,
        multiplier: 1
    },
    {
        name: "🟢 Linh Phẩm",
        weight: 25,
        multiplier: 2
    },
    {
        name: "🔵 Huyền Phẩm",
        weight: 14,
        multiplier: 4
    },
    {
        name: "🟣 Địa Phẩm",
        weight: 8,
        multiplier: 8
    },
    {
        name: "🟠 Thiên Phẩm",
        weight: 5,
        multiplier: 15
    },
    {
        name: "🔴 Thánh Phẩm",
        weight: 2,
        multiplier: 30
    },
    {
        name: "🌌 Hỗn Nguyên",
        weight: 0.8,
        multiplier: 60
    },
    {
        name: "☯️ Hồng Mông",
        weight: 0.2,
        multiplier: 150
    }
];

// ==========================================
// DANH SÁCH VẬT PHẨM
// ==========================================

const ITEM_NAMES = [
    "🗡️ Hồng Hoang Chiến Kiếm",
    "⚔️ Thái Cổ Sát Kiếm",
    "🛡️ Hỗn Độn Thần Thuẫn",
    "👑 Vạn Cổ Đế Quan",
    "💍 Cửu Thiên Thần Giới",
    "📜 Hồng Mông Đạo Kinh",
    "🔥 Phượng Hoàng Thần Hỏa",
    "🐉 Chân Long Tinh Huyết",
    "🌌 Hỗn Độn Linh Châu",
    "☯️ Âm Dương Thần Ngọc",
    "⚡ Đại Đạo Lôi Châu",
    "🌀 Thời Không Thần Thạch"
];

// ==========================================
// QUAY PHẨM
// ==========================================

function rollRarity(dungeonIndex) {

    const bonus =
        Math.min(
            dungeonIndex * 0.35,
            7
        );

    const total =
        RARITIES.reduce(
            (sum, item) =>
                sum + item.weight,
            0
        );

    let roll =
        Math.random() * total;

    for (
        let i = 0;
        i < RARITIES.length;
        i++
    ) {

        let weight =
            RARITIES[i].weight;

        if (i >= 4) {
            weight += bonus;
        }

        if (roll < weight) {
            return RARITIES[i];
        }

        roll -= weight;
    }

    return RARITIES[0];
}

// ==========================================
// TẠO ĐỒ RƠI
// ==========================================

function generateLoot(
    dungeonIndex,
    dungeonName
) {

    const rarity =
        rollRarity(
            dungeonIndex
        );

    const name =
        ITEM_NAMES[
            random(
                0,
                ITEM_NAMES.length - 1
            )
        ];

    const basePower =
        random(10, 50);

    const power =
        Math.floor(
            basePower *
            rarity.multiplier *
            (
                1 +
                dungeonIndex * 0.12
            )
        );

    return {

        id:
            `dungeon_${Date.now()}_${Math.floor(
                Math.random() * 999999
            )}`,

        ten:
            name,

        phamCap:
            rarity.name,

        sucManh:
            power,

        moTa:
            `Báu vật rơi ra từ ${dungeonName}.`,

        createdAt:
            Date.now()
    };
}

// ==========================================
// MENU CHỌN PHÓ BẢN
// ==========================================

function getDungeonMenu() {

    return new ActionRowBuilder()
        .addComponents(

            new StringSelectMenuBuilder()
                .setCustomId(
                    "chon_pho_ban"
                )
                .setPlaceholder(
                    "🏯 Chọn phó bản Hồng Hoang..."
                )
                .addOptions(

                    Object.entries(
                        DUNGEONS
                    ).map(
                        ([id, dungeon]) => ({

                            label:
                                dungeon.name
                                    .replace(
                                        /^.+?\s/,
                                        ""
                                    )
                                    .slice(
                                        0,
                                        100
                                    ),

                            value:
                                id,

                            description:
                                dungeon.desc
                                    .slice(
                                        0,
                                        100
                                    )
                        })
                    )
                )
        );
}

// ==========================================
// COMMAND /PHOBAN
// ==========================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("phoban")
            .setDescription(
                "Mở danh sách phó bản Hồng Hoang"
            ),

    async execute(interaction) {

        const p =
            getPlayer(
                interaction.user.id
            );

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const remaining =
            COOLDOWN -
            (
                Date.now() -
                (p.lastDungeon || 0)
            );

        if (remaining > 0) {

            return interaction.reply({

                content:
                    `⏳ Phó bản đang hồi phục. Còn **${Math.ceil(
                        remaining / 60000
                    )} phút**.`,

                ephemeral: true
            });
        }

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🏯 PHÓ BẢN HỒNG HOANG"
                )
                .setDescription(
                    "⚔️ **20 PHÓ BẢN HỒNG HOANG**\n\n" +
                    "Chọn phó bản bên dưới để chiến đấu.\n" +
                    "📈 Độ khó tăng dần rất mạnh.\n" +
                    "⚔️ Kết quả dựa hoàn toàn vào Dame/Thủ/HP.\n" +
                    "🎁 Phó bản càng cao càng có cơ hội rơi đồ hiếm.\n" +
                    "⏱️ Cooldown: **5 phút**"
                )
                .setFooter({
                    text:
                        "⚔️ Hồng Hoang không dành cho kẻ yếu!"
                });

        return interaction.reply({

            embeds: [
                embed
            ],

            components: [
                getDungeonMenu()
            ]
        });
    },

    // ==========================================
    // XỬ LÝ SELECT MENU
    // ==========================================

    async handleSelect(interaction) {

        if (
            !interaction.isStringSelectMenu() ||
            interaction.customId !==
                "chon_pho_ban"
        ) {
            return false;
        }

        const p =
            getPlayer(
                interaction.user.id
            );

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const remaining =
            COOLDOWN -
            (
                Date.now() -
                (p.lastDungeon || 0)
            );

        if (remaining > 0) {

            return interaction.reply({

                content:
                    `⏳ Phó bản đang hồi phục. Còn **${Math.ceil(
                        remaining / 60000
                    )} phút**.`,

                ephemeral: true
            });
        }

        const dungeonId =
            interaction.values[0];

        const dungeon =
            DUNGEONS[dungeonId];

        if (!dungeon) {

            return interaction.reply({
                content:
                    "❌ Không tìm thấy phó bản.",
                ephemeral: true
            });
        }

        // ======================================
        // CHỈ SỐ BOSS
        // ======================================

        const dungeonIndex =
            Object.keys(
                DUNGEONS
            ).indexOf(
                dungeonId
            );

        const enemyHp =
            random(
                dungeon.hpMin,
                dungeon.hpMax
            );

        const enemyAtk =
            random(
                dungeon.atkMin,
                dungeon.atkMax
            );

        // ======================================
        // DAME NGƯỜI CHƠI
        // ======================================

        const playerDamage =
            Math.max(
                1,

                Number(
                    p.cong || 0
                ) +

                Math.floor(
                    Number(
                        p.linhLuc || 0
                    ) / 20
                )
            );

        // ======================================
        // THỦ NGƯỜI CHƠI
        // ======================================

        const playerDefense =
            Math.max(
                0,
                Number(
                    p.thu || 0
                )
            );

        // ======================================
        // DAME BOSS SAU PHÒNG THỦ
        // ======================================

        const bossDamage =
            Math.max(
                1,
                enemyAtk -
                playerDefense
            );

        // ======================================
        // HP CHIẾN ĐẤU
        // ======================================

        let bossHp =
            enemyHp;

        let playerHp =
            Math.max(
                1,
                Number(
                    p.hp || 1
                )
            );

        let turns = 0;

        let totalDamageDealt = 0;

        let totalDamageTaken = 0;

        // ======================================
        // ⚔️ CHIẾN ĐẤU THỰC TẾ
        //
        // KHÔNG RANDOM THẮNG / THUA
        // ======================================

        while (
            playerHp > 0 &&
            bossHp > 0
        ) {

            turns++;

            // Người chơi đánh
            const dealt =
                Math.min(
                    playerDamage,
                    bossHp
                );

            bossHp -= dealt;

            totalDamageDealt +=
                dealt;

            // Boss chết
            if (
                bossHp <= 0
            ) {
                break;
            }

            // Boss đánh lại
            const taken =
                Math.min(
                    bossDamage,
                    playerHp
                );

            playerHp -= taken;

            totalDamageTaken +=
                taken;

            // An toàn chống vòng lặp vô hạn
            if (
                turns >= 100000
            ) {
                break;
            }
        }

        const win =
            bossHp <= 0;

        // ======================================
        // LƯU COOLDOWN
        // ======================================

        if (!win) {

            updatePlayer(
                interaction.user.id,
                {

                    lastDungeon:
                        Date.now(),

                    hp:
                        Math.max(
                            1,
                            playerHp
                        )
                }
            );

            return interaction.update({

                embeds: [

                    new EmbedBuilder()
                        .setTitle(
                            "💀 PHÓ BẢN THẤT BẠI"
                        )
                        .setDescription(
                            `Bạn đã chiến đấu trực tiếp với **${dungeon.name}** nhưng không thể hạ được yêu thú.`
                        )
                        .addFields(

                            {
                                name:
                                    "👹 HP yêu thú",
                                value:
                                    enemyHp.toLocaleString(),
                                inline:
                                    true
                            },

                            {
                                name:
                                    "⚔️ Dame yêu thú",
                                value:
                                    enemyAtk.toLocaleString(),
                                inline:
                                    true
                            },

                            {
                                name:
                                    "⚔️ Dame của bạn",
                                value:
                                    playerDamage.toLocaleString(),
                                inline:
                                    true
                            },

                            {
                                name:
                                    "🛡️ Thủ của bạn",
                                value:
                                    playerDefense.toLocaleString(),
                                inline:
                                    true
                            },

                            {
                                name:
                                    "❤️ HP còn lại",
                                value:
                                    playerHp.toLocaleString(),
                                inline:
                                    true
                            },

                            {
                                name:
                                    "🔄 Số lượt đánh",
                                value:
                                    turns.toLocaleString(),
                                inline:
                                    true
                            }
                        )
                        .setFooter({
                            text:
                                "⏱️ Lượt phó bản tiếp theo sau 5 phút."
                        })
                ],

                components: []
            });
        }

        // ======================================
        // PHẦN THƯỞNG
        // ======================================

        const exp =
            random(
                dungeon.expMin,
                dungeon.expMax
            );

        const stones =
            random(
                dungeon.stoneMin,
                dungeon.stoneMax
            );

        // ======================================
        // 🎁 RƠI ĐỒ
        // ======================================

        const loot =
            generateLoot(
                dungeonIndex,
                dungeon.name
            );

        // ======================================
        // LƯU ĐỒ VÀO TÚI
        // ======================================

        addItem(
            interaction.user.id,
            "vatPham",
            loot
        );

        // ======================================
        // CẬP NHẬT NHÂN VẬT
        // ======================================

        updatePlayer(
            interaction.user.id,
            {

                lastDungeon:
                    Date.now(),

                kinhNghiem:
                    Number(
                        p.kinhNghiem || 0
                    ) +
                    exp,

                linhThach:
                    Number(
                        p.linhThach || 0
                    ) +
                    stones,

                phoBanDaHoanThanh:
                    Number(
                        p.phoBanDaHoanThanh || 0
                    ) +
                    1,

                hp:
                    Math.min(
                        Number(
                            p.maxHp || 100
                        ),
                        Math.max(
                            1,
                            playerHp
                        )
                    )
            }
        );

        // ======================================
        // 🏆 KẾT QUẢ
        // ======================================

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "🏆 PHÓ BẢN HOÀN THÀNH"
                )
                .setDescription(
                    `🔥 Bạn đã chinh phục **${dungeon.name}**!\n\n` +

                    `⚔️ **KẾT QUẢ CHIẾN ĐẤU**\n` +
                    `• Dame mỗi lượt: **${playerDamage.toLocaleString()}**\n` +
                    `• Dame boss mỗi lượt: **${bossDamage.toLocaleString()}**\n` +
                    `• Tổng dame gây ra: **${totalDamageDealt.toLocaleString()}**\n` +
                    `• Tổng dame nhận: **${totalDamageTaken.toLocaleString()}**\n` +
                    `• Số lượt đánh: **${turns.toLocaleString()}**\n\n` +

                    `🎁 **VẬT PHẨM RƠI**\n` +
                    `**${loot.ten}**\n` +
                    `${loot.phamCap}\n` +
                    `⚔️ Sức mạnh: **${loot.sucManh.toLocaleString()}**`
                )
                .addFields(

                    {
                        name:
                            "✨ Kinh nghiệm",
                        value:
                            `+${exp.toLocaleString()}`,
                        inline:
                            true
                    },

                    {
                        name:
                            "💎 Linh thạch",
                        value:
                            `+${stones.toLocaleString()}`,
                        inline:
                            true
                    },

                    {
                        name:
                            "❤️ HP còn lại",
                        value:
                            playerHp.toLocaleString(),
                        inline:
                            true
                    },

                    {
                        name:
                            "🎁 Phẩm cấp",
                        value:
                            loot.phamCap,
                        inline:
                            true
                    },

                    {
                        name:
                            "⚔️ Sức mạnh đồ",
                        value:
                            loot.sucManh.toLocaleString(),
                        inline:
                            true
                    },

                    {
                        name:
                            "⏱️ Lượt tiếp theo",
                        value:
                            "Sau 5 phút",
                        inline:
                            true
                    }
                )
                .setFooter({
                    text:
                        "🎁 Vật phẩm đã được lưu vào túi đồ!"
                });

        return interaction.update({

            embeds: [
                embed
            ],

            components: []
        });
    }
};
