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
// COOLDOWN 5 PHÚT
// ==========================================
const COOLDOWN = 5 * 60 * 1000;

// ==========================================
// 20 PHÓ BẢN HỒNG HOANG
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
        desc: "Thánh địa của những Chân Long cổ đại.",
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
        desc: "Nơi bất tử hỏa thiêu đốt vạn vật.",
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
        desc: "Không gian hỗn loạn có thể nghiền nát thần hồn.",
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
// RANDOM
// ==========================================
function random(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

// ==========================================
// HỆ THỐNG RƠI ĐỒ
// ==========================================

const LOOT_TABLE = [
    {
        rarity: "⚪ Phàm Phẩm",
        chance: 35,
        multiplier: 1
    },
    {
        rarity: "🟢 Linh Phẩm",
        chance: 25,
        multiplier: 2
    },
    {
        rarity: "🔵 Huyền Phẩm",
        chance: 18,
        multiplier: 4
    },
    {
        rarity: "🟣 Địa Phẩm",
        chance: 10,
        multiplier: 8
    },
    {
        rarity: "🟠 Thiên Phẩm",
        chance: 6,
        multiplier: 15
    },
    {
        rarity: "🔴 Thánh Phẩm",
        chance: 4,
        multiplier: 30
    },
    {
        rarity: "🌌 Hỗn Nguyên",
        chance: 1.7,
        multiplier: 60
    },
    {
        rarity: "☯️ Hồng Mông",
        chance: 0.3,
        multiplier: 150
    }
];

const LOOT_NAMES = [
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
// QUAY PHẨM CẤP
// ==========================================

function rollRarity(dungeonIndex) {

    let roll = Math.random() * 100;

    // Phó bản càng cao càng tăng cơ hội đồ hiếm
    const bonus = dungeonIndex * 1.2;

    let current = 0;

    for (const rarity of LOOT_TABLE) {

        current += rarity.chance;

        if (
            roll <
            current + bonus
        ) {
            return rarity;
        }
    }

    return LOOT_TABLE[0];
}

// ==========================================
// TẠO ITEM
// ==========================================

function generateLoot(dungeonIndex) {

    const rarity =
        rollRarity(dungeonIndex);

    const name =
        LOOT_NAMES[
            random(
                0,
                LOOT_NAMES.length - 1
            )
        ];

    const power =
        random(10, 50) *
        rarity.multiplier *
        (1 + dungeonIndex * 0.1);

    return {

        id:
            `loot_${Date.now()}_${Math.floor(
                Math.random() * 100000
            )}`,

        ten:
            name,

        phamCap:
            rarity.rarity,

        sucManh:
            Math.floor(power),

        moTa:
            `Báu vật rơi ra từ phó bản Hồng Hoang.`,

        createdAt:
            Date.now()
    };
}

// ==========================================
// MENU PHÓ BẢN
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
                                    .slice(0, 100),

                            value:
                                id,

                            description:
                                dungeon.desc
                                    .slice(0, 100)
                        })
                    )
                )
        );
}

// ==========================================
// COMMAND
// ==========================================

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName("phoban")

            .setDescription(
                "Mở danh sách phó bản Hồng Hoang"
            ),

    // ======================================
    // /PHOBAN
    // ======================================

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
                    "📈 Độ khó tăng dần.\n" +
                    "🎁 Phó bản càng cao càng dễ rơi đồ hiếm.\n" +
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

    // ======================================
    // XỬ LÝ MENU
    // ======================================

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

            await interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước.",

                ephemeral: true
            });

            return true;
        }

        const remaining =
            COOLDOWN -
            (
                Date.now() -
                (p.lastDungeon || 0)
            );

        if (remaining > 0) {

            await interaction.reply({

                content:
                    `⏳ Phó bản đang hồi phục. Còn **${Math.ceil(
                        remaining / 60000
                    )} phút**.`,

                ephemeral: true
            });

            return true;
        }

        const dungeonId =
            interaction.values[0];

        const dungeon =
            DUNGEONS[dungeonId];

        if (!dungeon) {

            await interaction.reply({

                content:
                    "❌ Không tìm thấy phó bản.",

                ephemeral: true
            });

            return true;
        }

        const dungeonIndex =
            Object.keys(
                DUNGEONS
            ).indexOf(
                dungeonId
            );

        // ==================================
        // TẠO QUÁI
        // ==================================

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

        const power =
            (p.cong || 0) +
            (p.thu || 0) +
            Math.floor(
                (p.linhLuc || 0) / 20
            );

        // ==================================
        // TỶ LỆ THẮNG
        // ==================================

        const winChance =
            Math.min(
                0.85,

                Math.max(
                    0.03,

                    power /
                    (enemyHp * 1.5)
                )
            );

        const win =
            Math.random() <
            winChance;

        // ==================================
        // THẤT BẠI
        // ==================================

        if (!win) {

            const damage =
                Math.floor(
                    enemyAtk / 2
                );

            const newHp =
                Math.max(
                    1,
                    (p.hp || 1) -
                    damage
                );

            updatePlayer(

                interaction.user.id,

                {
                    lastDungeon:
                        Date.now(),

                    hp:
                        newHp
                }
            );

            await interaction.update({

                embeds: [

                    new EmbedBuilder()

                        .setTitle(
                            "💀 PHÓ BẢN THẤT BẠI"
                        )

                        .setDescription(
                            `Bạn bị đánh lui khỏi **${dungeon.name}**.`
                        )

                        .addFields(

                            {
                                name:
                                    "👹 HP yêu thú",

                                value:
                                    enemyHp
                                        .toLocaleString(),

                                inline:
                                    true
                            },

                            {
                                name:
                                    "⚔️ Công yêu thú",

                                value:
                                    enemyAtk
                                        .toLocaleString(),

                                inline:
                                    true
                            },

                            {
                                name:
                                    "❤️ HP còn",

                                value:
                                    newHp
                                        .toLocaleString(),

                                inline:
                                    true
                            },

                            {
                                name:
                                    "📊 Tỷ lệ thắng",

                                value:
                                    `${(
                                        winChance *
                                        100
                                    ).toFixed(1)}%`,

                                inline:
                                    true
                            },

                            {
                                name:
                                    "⏱️ Hồi lại",

                                value:
                                    "5 phút",

                                inline:
                                    true
                            }
                        )

                        .setFooter({

                            text:
                                "⚔️ Hồng Hoang đã đánh bại bạn!"
                        })
                ],

                components: []
            });

            return true;
        }

        // ==================================
        // THẮNG
        // ==================================

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

        // ==================================
        // RƠI ĐỒ
        // ==================================

        const loot =
            generateLoot(
                dungeonIndex
            );

        // Lưu vào túi đồ
        addItem(
            interaction.user.id,
            "vatPham",
            loot
        );

        // ==================================
        // CẬP NHẬT PLAYER
        // ==================================

        updatePlayer(

            interaction.user.id,

            {

                lastDungeon:
                    Date.now(),

                kinhNghiem:
                    (p.kinhNghiem || 0) +
                    exp,

                linhThach:
                    (p.linhThach || 0) +
                    stones,

                phoBanDaHoanThanh:
                    (p.phoBanDaHoanThanh || 0) +
                    1,

                hp:
                    Math.min(
                        p.maxHp || 100,
                        (p.hp || 1) +
                        20
                    )
            }
        );

        // ==================================
        // KẾT QUẢ
        // ==================================

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "🏆 PHÓ BẢN HOÀN THÀNH"
                )

                .setDescription(
                    `🔥 Bạn đã chinh phục **${dungeon.name}**!\n\n` +
                    `🎁 **ĐỒ RƠI:**\n` +
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
                            "❤️ Hồi phục",

                        value:
                            "+20 HP",

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
                            loot.sucManh
                                .toLocaleString(),

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

        await interaction.update({

            embeds: [
                embed
            ],

            components: []
        });

        return true;
    }
};
