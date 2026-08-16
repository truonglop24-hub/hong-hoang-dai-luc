const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// ⚔️ HỆ THỐNG CẢNH GIỚI
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        minTuVi: 0,
        maxTier: 12
    },
    {
        name: "Luyện Khí",
        minTuVi: 1000,
        maxTier: 12
    },
    {
        name: "Trúc Cơ",
        minTuVi: 10000,
        maxTier: 12
    },
    {
        name: "Kim Đan",
        minTuVi: 100000,
        maxTier: 12
    },
    {
        name: "Nguyên Anh",
        minTuVi: 1000000,
        maxTier: 12
    },
    {
        name: "Hóa Thần",
        minTuVi: 10000000,
        maxTier: 12
    },
    {
        name: "Luyện Hư",
        minTuVi: 100000000,
        maxTier: 12
    },
    {
        name: "Hợp Thể",
        minTuVi: 1000000000,
        maxTier: 12
    },
    {
        name: "Đại Thừa",
        minTuVi: 10000000000,
        maxTier: 12
    },
    {
        name: "Độ Kiếp",
        minTuVi: 100000000000,
        maxTier: 12
    },
    {
        name: "Chân Tiên",
        minTuVi: 10000000000000,
        maxTier: 12
    },
    {
        name: "Đại Đạo",
        minTuVi: 10000000000000000000,
        maxTier: 12
    }
];

// =====================================================
// 📊 GIAI ĐOẠN CẢNH GIỚI
// =====================================================

function getStage(tier) {
    tier = Number(tier) || 1;

    if (tier >= 1 && tier <= 3) {
        return "Sơ kỳ";
    }

    if (tier >= 4 && tier <= 6) {
        return "Trung kỳ";
    }

    if (tier >= 7 && tier <= 9) {
        return "Hậu kỳ";
    }

    if (tier >= 10 && tier <= 11) {
        return "Viên mãn";
    }

    return "Đỉnh phong";
}

// =====================================================
// 📜 HIỂN THỊ CẢNH GIỚI
// =====================================================

function getRealmDisplay(realmName, tier) {
    return `${realmName} ${getStage(tier)} tầng ${tier}`;
}

// =====================================================
// ⚡ 9 TRỌNG LÔI KIẾP
// =====================================================

const LOI_KIEP = [
    {
        name: "Nhất Trọng Lôi Kiếp",
        damage: 100
    },
    {
        name: "Nhị Trọng Lôi Kiếp",
        damage: 200
    },
    {
        name: "Tam Trọng Lôi Kiếp",
        damage: 300
    },
    {
        name: "Tứ Trọng Lôi Kiếp",
        damage: 400
    },
    {
        name: "Ngũ Trọng Lôi Kiếp",
        damage: 500
    },
    {
        name: "Lục Trọng Lôi Kiếp",
        damage: 600
    },
    {
        name: "Thất Trọng Lôi Kiếp",
        damage: 700
    },
    {
        name: "Bát Trọng Lôi Kiếp",
        damage: 800
    },
    {
        name: "Cửu Trọng Lôi Kiếp",
        damage: 900
    }
];

// =====================================================
// ⚔️ BUFF 3 ĐẠO
// =====================================================

const DAO_BUFFS = {
    chinhdao: {
        name: "⚔️ Chính Đạo",
        cong: 10,
        thu: 25,
        hp: 20,
        loiKiep: 5
    },

    madao: {
        name: "😈 Ma Đạo",
        cong: 30,
        thu: -10,
        hp: 0,
        loiKiep: 10
    },

    yeudao: {
        name: "🐺 Yêu Đạo",
        cong: 15,
        thu: 20,
        hp: 40,
        loiKiep: 5
    }
};

// =====================================================
// 🔧 CHUẨN HÓA ĐẠO
// =====================================================

function normalizeDao(player) {
    const dao = String(
        player?.dao ||
        player?.conDuong ||
        player?.phuongDao ||
        "chinhdao"
    )
        .toLowerCase()
        .trim();

    if (
        dao === "madao" ||
        dao === "ma dao" ||
        dao.includes("ma đạo")
    ) {
        return "madao";
    }

    if (
        dao === "yeudao" ||
        dao === "yeu dao" ||
        dao.includes("yêu đạo")
    ) {
        return "yeudao";
    }

    return "chinhdao";
}

// =====================================================
// 🔥 LẤY BUFF ĐẠO
// =====================================================

function getDaoBuff(player) {
    return DAO_BUFFS[normalizeDao(player)];
}

// =====================================================
// 📊 LẤY INDEX CẢNH GIỚI
// =====================================================

function getRealmIndex(player) {
    const raw =
        player?.canhGioi ??
        player?.realm ??
        player?.realmIndex ??
        0;

    if (
        typeof raw === "number" &&
        Number.isFinite(raw)
    ) {
        return Math.max(
            0,
            Math.min(
                realms.length - 1,
                Math.floor(raw)
            )
        );
    }

    const numeric = Number(raw);

    if (Number.isFinite(numeric)) {
        return Math.max(
            0,
            Math.min(
                realms.length - 1,
                Math.floor(numeric)
            )
        );
    }

    const name = String(raw)
        .trim()
        .toLowerCase();

    const index = realms.findIndex(
        realm =>
            String(realm.name)
                .trim()
                .toLowerCase() === name
    );

    return index >= 0 ? index : 0;
}

// =====================================================
// 📊 LẤY TẦNG
// =====================================================

function getTier(player) {
    const tier = Number(
        player?.tang ??
        player?.tier ??
        1
    );

    return Math.max(
        1,
        Math.min(
            12,
            Number.isFinite(tier)
                ? Math.floor(tier)
                : 1
        )
    );
}

// =====================================================
// 💠 TU VI CẦN CHO TỪNG TẦNG
// =====================================================

function getTierRequiredTuVi(
    realmIndex,
    targetTier
) {
    const currentRealm =
        realms[realmIndex];

    if (!currentRealm) {
        return 0;
    }

    const nextRealm =
        realms[
            Math.min(
                realmIndex + 1,
                realms.length - 1
            )
        ];

    if (
        realmIndex >=
        realms.length - 1
    ) {
        return Number(
            currentRealm.minTuVi
        );
    }

    const currentMin =
        Number(
            currentRealm.minTuVi
        );

    const nextMin =
        Number(
            nextRealm.minTuVi
        );

    const tier = Math.max(
        1,
        Math.min(
            12,
            Number(targetTier) || 1
        )
    );

    const progress =
        (tier - 1) / 11;

    return Math.floor(
        currentMin +
        (
            nextMin -
            currentMin
        ) * progress
    );
}

// =====================================================
// ⚡ DAME LÔI KIẾP
// =====================================================
//
// DAME GỐC = 40%
//
// Sau đó tăng theo:
// 1. Cảnh giới
// 2. Tầng 1 → 12
// 3. Trọng Lôi Kiếp 1 → 9
//
// Không random tỷ lệ vượt kiếp.
// =====================================================

function getLightningDamage(
    player,
    index
) {
    const lightning =
        LOI_KIEP[index - 1];

    if (!lightning) {
        return 0;
    }

    const buff =
        getDaoBuff(player);

    const realmIndex =
        getRealmIndex(player);

    const tier =
        getTier(player);

    // ================================================
    // ⚡ DAME GỐC CHỈ CÒN 40%
    // ================================================

    let damage =
        Number(
            lightning.damage
        ) * 0.4;

    // ================================================
    // 📈 HỆ SỐ CẢNH GIỚI
    // ================================================

    const realmMultiplier = [
        1,      // Phàm Nhân
        2,      // Luyện Khí
        3,      // Trúc Cơ
        4,      // Kim Đan
        5,      // Nguyên Anh
        7,      // Hóa Thần
        9,      // Luyện Hư
        12,     // Hợp Thể
        15,     // Đại Thừa
        18,     // Độ Kiếp
        22,     // Chân Tiên
        30      // Đại Đạo
    ];

    const realmBonus =
        realmMultiplier[
            Math.min(
                Math.max(
                    0,
                    realmIndex
                ),
                realmMultiplier.length - 1
            )
        ] || 1;

    damage *= realmBonus;

    // ================================================
    // 📊 HỆ SỐ TẦNG 1 → 12
    //
    // Tầng 1  = x1.00
    // Tầng 2  = x1.08
    // ...
    // Tầng 12 = x1.88
    // ================================================

    const tierMultiplier =
        1 +
        (
            (tier - 1) * 0.08
        );

    damage *= tierMultiplier;

    // ================================================
    // ⚡ HỆ SỐ TRỌNG LÔI KIẾP
    //
    // Nhất trọng = x1.00
    // Nhị trọng  = x1.10
    // ...
    // Cửu trọng  = x1.80
    // ================================================

    const lightningMultiplier =
        1 +
        (
            (index - 1) * 0.10
        );

    damage *= lightningMultiplier;

    // ================================================
    // 🛡️ BUFF THỦ
    // ================================================

    if (buff.thu > 0) {
        damage *=
            1 -
            (
                buff.thu / 200
            );
    }

    if (buff.thu < 0) {
        damage *=
            1 +
            (
                Math.abs(buff.thu) / 100
            );
    }

    // ================================================
    // ❤️ BUFF HP
    // ================================================

    if (buff.hp > 0) {
        damage *=
            1 -
            (
                buff.hp / 400
            );
    }

    return Math.max(
        1,
        Math.floor(damage)
    );
}

// =====================================================
// ❤️ HP SAU BUFF
// =====================================================

function getBuffedHp(player) {
    const buff =
        getDaoBuff(player);

    const hp =
        Number(
            player?.hp ||
            player?.maxHp ||
            100
        );

    return Math.max(
        1,
        Math.floor(
            hp *
            (
                1 +
                buff.hp / 100
            )
        )
    );
}

// =====================================================
// ⚔️ CÔNG SAU BUFF
// =====================================================

function getBuffedCong(player) {
    const buff =
        getDaoBuff(player);

    const cong =
        Number(
            player?.cong ||
            0
        );

    return Math.floor(
        cong *
        (
            1 +
            buff.cong / 100
        )
    );
}

// =====================================================
// 🛡️ THỦ SAU BUFF
// =====================================================

function getBuffedThu(player) {
    const buff =
        getDaoBuff(player);

    const thu =
        Number(
            player?.thu ||
            0
        );

    return Math.max(
        0,
        Math.floor(
            thu *
            (
                1 +
                buff.thu / 100
            )
        )
    );
}

// =====================================================
// ⚡ XỬ LÝ MỘT TRỌNG LÔI KIẾP
// =====================================================

async function processLightning(
    interaction,
    player,
    userId,
    index
) {
    const lightning =
        LOI_KIEP[index - 1];

    if (!lightning) {
        return;
    }

    const dao =
        getDaoBuff(player);

    const damage =
        getLightningDamage(
            player,
            index
        );

    // =================================================
    // ⚠️ KHÔNG RANDOM
    // =================================================
    //
    // Người chơi bấm chịu Lôi Kiếp:
    // => LUÔN THÀNH CÔNG
    //
    // =================================================

    const success = true;

    if (success) {

        const embed =
            new EmbedBuilder()
                .setTitle(
                    `⚡ ${lightning.name}`
                )
                .setDescription(
                    `🌌 **${dao.name}**\n\n` +
                    `⚡ Thiên Lôi giáng xuống!\n\n` +
                    `💥 Sát thương Lôi Kiếp: **${damage}**\n\n` +
                    `✨ **Đã vượt qua Lôi Kiếp ${index}/9!**`
                )
                .addFields(
                    {
                        name: "⚔️ Công",
                        value:
                            `+${dao.cong}%`,
                        inline: true
                    },
                    {
                        name: "🛡️ Thủ",
                        value:
                            `${dao.thu >= 0 ? "+" : ""}${dao.thu}%`,
                        inline: true
                    },
                    {
                        name: "❤️ HP",
                        value:
                            `+${dao.hp}%`,
                        inline: true
                    },
                    {
                        name: "⚡ Dame Lôi Kiếp",
                        value:
                            `40% dame gốc + hệ số cảnh giới/tầng/trọng`,
                        inline: true
                    }
                )
                .setColor(
                    0xF1C40F
                );

        // =============================================
        // ⚡ CÒN LÔI KIẾP
        // =============================================

        const nextIndex =
            index + 1;

        if (
            nextIndex <=
            LOI_KIEP.length
        ) {

            updatePlayer(
                userId,
                {
                    doKiep:
                        nextIndex
                }
            );

            const nextLightning =
                LOI_KIEP[
                    nextIndex - 1
                ];

            const nextDamage =
                getLightningDamage(
                    player,
                    nextIndex
                );

            const row =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `do_kiep_${nextIndex}`
                            )
                            .setLabel(
                                `⚡ Chịu Lôi Kiếp ${nextIndex}/9`
                            )
                            .setStyle(
                                ButtonStyle.Danger
                            ),

                        new ButtonBuilder()
                            .setCustomId(
                                "do_kiep_cancel"
                            )
                            .setLabel(
                                "❌ Bỏ cuộc"
                            )
                            .setStyle(
                                ButtonStyle.Secondary
                            )
                    );

            const nextEmbed =
                new EmbedBuilder()
                    .setTitle(
                        `⚡ ${nextLightning.name}`
                    )
                    .setDescription(
                        `🌌 **${dao.name}**\n\n` +
                        `⚡ **Lôi Kiếp ${nextIndex}/9**\n\n` +
                        `💥 Sát thương: **${nextDamage}**\n\n` +
                        `✨ **Không random — chắc chắn vượt qua khi bấm chịu Lôi Kiếp.**`
                    )
                    .setColor(
                        0xF1C40F
                    );

            return interaction.update({
                embeds: [
                    nextEmbed
                ],
                components: [
                    row
                ]
            });
        }

        // =============================================
        // 👑 ĐỦ 9/9
        // =============================================

        updatePlayer(
            userId,
            {
                doKiep: 0
            }
        );

        return completeBreakthrough(
            interaction,
            player,
            userId
        );
    }
}

// =====================================================
// 👑 HOÀN THÀNH ĐỘT PHÁ
// =====================================================

async function completeBreakthrough(
    interaction,
    player,
    userId
) {
    const realmIndex =
        getRealmIndex(player);

    const currentRealm =
        realms[realmIndex];

    const currentTier =
        getTier(player);

    const buff =
        getDaoBuff(player);

    // =================================================
    // 👑 ĐẠI ĐẠO TẦNG 12
    // =================================================

    if (
        realmIndex >=
        realms.length - 1 &&
        currentTier >= 12
    ) {

        const finalEmbed =
            new EmbedBuilder()
                .setTitle(
                    "👑 ĐẠI ĐẠO — ĐỈNH PHONG"
                )
                .setDescription(
                    `🌌 **${buff.name}**\n\n` +
                    `⚡ Bạn đã vượt qua toàn bộ **Cửu Trọng Lôi Kiếp**!\n\n` +
                    `👑 Cảnh giới:\n` +
                    `# **${currentRealm.name}**\n\n` +
                    `✨ **Đỉnh phong tầng 12**\n\n` +
                    `🌠 Bạn đã đạt cảnh giới cao nhất!`
                )
                .setColor(
                    0xFFD700
                );

        return interaction.update({
            embeds: [
                finalEmbed
            ],
            components: []
        });
    }

    // =================================================
    // 📈 TẦNG 1 → 12
    // =================================================

    if (currentTier < 12) {

        const newTier =
            currentTier + 1;

        const oldCong =
            Number(
                player.cong ||
                0
            );

        const oldThu =
            Number(
                player.thu ||
                0
            );

        const oldHp =
            Number(
                player.maxHp ||
                player.hp ||
                100
            );

        const tierBonus =
            1 +
            (
                realmIndex *
                0.15
            ) +
            (
                newTier *
                0.05
            );

        const congIncrease =
            Math.floor(
                30 *
                tierBonus
            );

        const thuIncrease =
            Math.floor(
                20 *
                tierBonus
            );

        const hpIncrease =
            Math.floor(
                120 *
                tierBonus
            );

        const newCong =
            oldCong +
            congIncrease;

        const newThu =
            oldThu +
            thuIncrease;

        const newHp =
            oldHp +
            hpIncrease;

        // =============================================
        // 💾 LƯU TẦNG MỚI
        // =============================================

        updatePlayer(
            userId,
            {
                tang:
                    newTier,

                tier:
                    newTier,

                cong:
                    newCong,

                thu:
                    newThu,

                hp:
                    newHp,

                maxHp:
                    newHp,

                doKiep:
                    0
            }
        );

        const embed =
            new EmbedBuilder()
                .setTitle(
                    "✨ ĐỘT PHÁ TẦNG THÀNH CÔNG!"
                )
                .setDescription(
                    `⚡ **Cửu Trọng Lôi Kiếp đã bị chinh phục!**\n\n` +

                    `🌌 Con đường: **${buff.name}**\n\n` +

                    `📜 Cảnh giới:\n` +
                    `**${currentRealm.name}**\n\n` +

                    `📊 Tầng cũ:\n` +
                    `**${getStage(currentTier)} tầng ${currentTier}**\n\n` +

                    `⬇️\n\n` +

                    `👑 Tầng mới:\n` +
                    `**${getStage(newTier)} tầng ${newTier}**\n\n` +

                    `🔥 Muốn lên tầng tiếp theo, **bắt buộc phải /dotpha lần nữa!**`
                )
                .addFields(
                    {
                        name: "⚔️ Công",
                        value:
                            `+${congIncrease}`,
                        inline: true
                    },
                    {
                        name: "🛡️ Thủ",
                        value:
                            `+${thuIncrease}`,
                        inline: true
                    },
                    {
                        name: "❤️ HP",
                        value:
                            `+${hpIncrease}`,
                        inline: true
                    },
                    {
                        name: "📊 Tiến độ",
                        value:
                            `**${newTier}/12 tầng**`,
                        inline: true
                    }
                )
                .setColor(
                    0x9B59B6
                );

        return interaction.update({
            embeds: [
                embed
            ],
            components: []
        });
    }

    // =================================================
    // 👑 TẦNG 12 → CẢNH GIỚI MỚI
    // =================================================

    const nextRealmIndex =
        realmIndex + 1;

    const nextRealm =
        realms[
            nextRealmIndex
        ];

    if (!nextRealm) {

        return interaction.update({
            content:
                "❌ Không còn cảnh giới tiếp theo.",
            embeds: [],
            components: []
        });
    }

    const newTier = 1;

    // =================================================
    // ⚔️ TĂNG CHỈ SỐ
    // =================================================

    const oldCong =
        Number(
            player.cong ||
            0
        );

    const oldThu =
        Number(
            player.thu ||
            0
        );

    const oldHp =
        Number(
            player.maxHp ||
            player.hp ||
            100
        );

    const realmBonus =
        1 +
        (
            nextRealmIndex *
            0.15
        );

    const congIncrease =
        Math.floor(
            100 *
            realmBonus
        );

    const thuIncrease =
        Math.floor(
            80 *
            realmBonus
        );

    const hpIncrease =
        Math.floor(
            500 *
            realmBonus
        );

    const newCong =
        oldCong +
        congIncrease;

    const newThu =
        oldThu +
        thuIncrease;

    const newHp =
        oldHp +
        hpIncrease;

    // =================================================
    // 💾 LƯU CẢNH GIỚI MỚI
    // =================================================

    updatePlayer(
        userId,
        {
            canhGioi:
                nextRealm.name,

            realm:
                nextRealmIndex,

            realmIndex:
                nextRealmIndex,

            tang:
                newTier,

            tier:
                newTier,

            cong:
                newCong,

            thu:
                newThu,

            hp:
                newHp,

            maxHp:
                newHp,

            doKiep:
                0
        }
    );

    // =================================================
    // 👑 HIỂN THỊ
    // =================================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                "👑 ĐỘT PHÁ CẢNH GIỚI THÀNH CÔNG!"
            )
            .setDescription(
                `⚡ **Cửu Trọng Lôi Kiếp đã bị chinh phục!**\n\n` +

                `🌌 Con đường: **${buff.name}**\n\n` +

                `📜 Cảnh giới cũ:\n` +
                `**${currentRealm.name} Đỉnh phong tầng 12**\n\n` +

                `⬇️\n\n` +

                `👑 Cảnh giới mới:\n` +
                `# **${nextRealm.name} Sơ kỳ tầng 1**\n\n` +

                `🔥 Từ đây muốn lên tầng 2 cũng phải **/dotpha** tiếp.`
            )
            .addFields(
                {
                    name: "⚔️ Công",
                    value:
                        `+${congIncrease}`,
                    inline: true
                },
                {
                    name: "🛡️ Thủ",
                    value:
                        `+${thuIncrease}`,
                    inline: true
                },
                {
                    name: "❤️ HP",
                    value:
                        `+${hpIncrease}`,
                    inline: true
                },
                {
                    name: "📊 Tầng",
                    value:
                        "**1/12**",
                    inline: true
                }
            )
            .setColor(
                0x9B59B6
            );

    return interaction.update({
        embeds: [
            embed
        ],
        components: []
    });
}

// =====================================================
// ⚡ /DOTPHA
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dotpha")
            .setDescription(
                "Đột phá từng tầng bằng Cửu Trọng Lôi Kiếp"
            ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        const player =
            getPlayer(userId);

        // =================================================
        // ❌ CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!player) {

            return interaction.reply({
                content:
                    "⚠️ Bạn chưa có nhân vật. Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // 📊 LẤY CẢNH GIỚI
        // =================================================

        const realmIndex =
            getRealmIndex(player);

        const tier =
            getTier(player);

        const realm =
            realms[realmIndex];

        if (!realm) {

            return interaction.reply({
                content:
                    "❌ Dữ liệu cảnh giới không hợp lệ.",
                ephemeral: true
            });
        }

        // =================================================
        // 👑 ĐẠI ĐẠO TẦNG 12
        // =================================================

        if (
            realmIndex >=
            realms.length - 1 &&
            tier >= 12
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "👑 ĐẠI ĐẠO"
                        )
                        .setDescription(
                            `🌌 Bạn đã đạt:\n\n` +
                            `# **${realm.name}**\n\n` +
                            `✨ **Đỉnh phong tầng 12**\n\n` +
                            `🌠 Không còn cảnh giới nào phía trên.`
                        )
                        .setColor(
                            0xFFD700
                        )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // 🎯 XÁC ĐỊNH MỤC TIÊU
        // =================================================

        const isRealmBreakthrough =
            tier >= 12;

        const targetTier =
            isRealmBreakthrough
                ? 1
                : tier + 1;

        const targetRealm =
            isRealmBreakthrough
                ? realms[
                    realmIndex + 1
                ]
                : realm;

        if (!targetRealm) {

            return interaction.reply({
                content:
                    "❌ Không tìm thấy cảnh giới tiếp theo.",
                ephemeral: true
            });
        }

        // =================================================
        // 💠 TU VI YÊU CẦU
        // =================================================

        const requiredTuVi =
            isRealmBreakthrough
                ? Number(
                    targetRealm.minTuVi
                )
                : getTierRequiredTuVi(
                    realmIndex,
                    targetTier
                );

        const tuVi =
            Number(
                player.tuvi ||
                player.tuVi ||
                0
            );

        // =================================================
        // ❌ CHƯA ĐỦ TU VI
        // =================================================

        if (
            tuVi <
            requiredTuVi
        ) {

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "❌ CHƯA ĐỦ TU VI ĐỂ ĐỘT PHÁ"
                        )
                        .setDescription(
                            `🌌 Cảnh giới hiện tại:\n` +
                            `**${realm.name} ${getStage(tier)} tầng ${tier}**\n\n` +

                            `🎯 Mục tiêu:\n` +
                            `**${targetRealm.name} ${getStage(targetTier)} tầng ${targetTier}**\n\n` +

                            `💠 Tu Vi hiện tại:\n` +
                            `**${tuVi.toLocaleString()}**\n\n` +

                            `💠 Tu Vi cần:\n` +
                            `**${requiredTuVi.toLocaleString()}**\n\n` +

                            `📉 Còn thiếu:\n` +
                            `**${Math.max(
                                0,
                                requiredTuVi -
                                tuVi
                            ).toLocaleString()} Tu Vi**\n\n` +

                            `⚡ Đủ Tu Vi rồi mới có thể bắt đầu Cửu Trọng Lôi Kiếp.`
                        )
                        .setColor(
                            0xED4245
                        )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // 🌌 BUFF ĐẠO
        // =================================================

        const dao =
            getDaoBuff(player);

        // =================================================
        // ⚡ BẮT ĐẦU ĐỘ KIẾP
        // =================================================

        const firstLightning =
            LOI_KIEP[0];

        const firstDamage =
            getLightningDamage(
                player,
                1
            );

        const startEmbed =
            new EmbedBuilder()
                .setTitle(
                    "⚡ CỬU TRỌNG LÔI KIẾP"
                )
                .setDescription(
                    `🌌 Con đường: **${dao.name}**\n\n` +

                    `📜 Cảnh giới hiện tại:\n` +
                    `**${realm.name} ${getStage(tier)} tầng ${tier}**\n\n` +

                    `👑 Mục tiêu:\n` +
                    `**${targetRealm.name} ${getStage(targetTier)} tầng ${targetTier}**\n\n` +

                    `💠 Tu Vi yêu cầu:\n` +
                    `**${requiredTuVi.toLocaleString()}**\n\n` +

                    `⚡ Sắp đối mặt với **9 Trọng Lôi Kiếp**.\n\n` +

                    `💥 Dame Lôi Kiếp: **40% dame gốc + tăng theo cảnh giới/tầng/trọng**\n\n` +

                    `✨ **Không có random tỷ lệ. Bấm chịu Lôi Kiếp là chắc chắn vượt qua.**`
                )
                .addFields(
                    {
                        name: "⚔️ Công",
                        value:
                            `+${dao.cong}%`,
                        inline: true
                    },
                    {
                        name: "🛡️ Thủ",
                        value:
                            `${dao.thu >= 0 ? "+" : ""}${dao.thu}%`,
                        inline: true
                    },
                    {
                        name: "❤️ HP",
                        value:
                            `+${dao.hp}%`,
                        inline: true
                    },
                    {
                        name: "⚡ Lôi Kiếp đầu tiên",
                        value:
                            `${firstLightning.name}\nDame: **${firstDamage}**`,
                        inline: false
                    }
                )
                .setColor(
                    0x5865F2
                );

        // =================================================
        // 🎮 NÚT BẮT ĐẦU
        // =================================================

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "do_kiep_start"
                        )
                        .setLabel(
                            "⚡ Bắt đầu Lôi Kiếp"
                        )
                        .setStyle(
                            ButtonStyle.Danger
                        ),

                    new ButtonBuilder()
                        .setCustomId(
                            "do_kiep_cancel"
                        )
                        .setLabel(
                            "❌ Hủy"
                        )
                        .setStyle(
                            ButtonStyle.Secondary
                        )
                );

        const response =
            await interaction.reply({
                embeds: [
                    startEmbed
                ],
                components: [
                    row
                ],
                fetchReply: true
            });

        // =================================================
        // 🎮 COLLECTOR BẮT ĐẦU
        // =================================================

        const collector =
            response.createMessageComponentCollector({
                time: 120000
            });

        collector.on(
            "collect",
            async button => {

                if (
                    button.user.id !==
                    userId
                ) {

                    return button.reply({
                        content:
                            "❌ Đây không phải phiên Độ Kiếp của bạn.",
                        ephemeral: true
                    });
                }

                // =========================================
                // ❌ HỦY
                // =========================================

                if (
                    button.customId ===
                    "do_kiep_cancel"
                ) {

                    collector.stop(
                        "cancel"
                    );

                    return button.update({
                        content:
                            "❌ Bạn đã hủy Độ Kiếp.",
                        embeds: [],
                        components: []
                    });
                }

                // =========================================
                // ⚡ BẮT ĐẦU
                // =========================================

                if (
                    button.customId ===
                    "do_kiep_start"
                ) {

                    collector.stop(
                        "start"
                    );

                    const freshPlayer =
                        getPlayer(userId);

                    if (!freshPlayer) {

                        return button.update({
                            content:
                                "❌ Không tìm thấy nhân vật.",
                            embeds: [],
                            components: []
                        });
                    }

                    updatePlayer(
                        userId,
                        {
                            doKiep: 1
                        }
                    );

                    const lightning =
                        LOI_KIEP[0];

                    const damage =
                        getLightningDamage(
                            freshPlayer,
                            1
                        );

                    const embed =
                        new EmbedBuilder()
                            .setTitle(
                                "⚡ LÔI KIẾP 1/9"
                            )
                            .setDescription(
                                `🌌 **${dao.name}**\n\n` +

                                `⚡ **${lightning.name}**\n\n` +

                                `💥 Sát thương:\n` +
                                `**${damage}**\n\n` +

                                `✨ **Không random — chắc chắn vượt qua!**`
                            )
                            .setColor(
                                0xF1C40F
                            );

                    const lightningRow =
                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        "do_kiep_1"
                                    )
                                    .setLabel(
                                        "⚡ Chịu Lôi Kiếp 1/9"
                                    )
                                    .setStyle(
                                        ButtonStyle.Danger
                                    ),

                                new ButtonBuilder()
                                    .setCustomId(
                                        "do_kiep_cancel"
                                    )
                                    .setLabel(
                                        "❌ Bỏ cuộc"
                                    )
                                    .setStyle(
                                        ButtonStyle.Secondary
                                    )
                            );

                    const msg =
                        await button.update({
                            embeds: [
                                embed
                            ],
                            components: [
                                lightningRow
                            ],
                            fetchReply: true
                        });

                    // =====================================
                    // ⚡ COLLECTOR LÔI KIẾP
                    // =====================================

                    const lightningCollector =
                        msg.createMessageComponentCollector({
                            time: 180000
                        });

                    lightningCollector.on(
                        "collect",
                        async lightningButton => {

                            if (
                                lightningButton.user.id !==
                                userId
                            ) {

                                return lightningButton.reply({
                                    content:
                                        "❌ Đây không phải phiên Độ Kiếp của bạn.",
                                    ephemeral: true
                                });
                            }

                            // =============================
                            // ❌ BỎ CUỘC
                            // =============================

                            if (
                                lightningButton.customId ===
                                "do_kiep_cancel"
                            ) {

                                lightningCollector.stop(
                                    "cancel"
                                );

                                updatePlayer(
                                    userId,
                                    {
                                        doKiep: 0
                                    }
                                );

                                return lightningButton.update({
                                    content:
                                        "❌ Bạn đã bỏ cuộc giữa Lôi Kiếp.",
                                    embeds: [],
                                    components: []
                                });
                            }

                            // =============================
                            // ⚡ LÔI KIẾP
                            // =============================

                            if (
                                lightningButton.customId.startsWith(
                                    "do_kiep_"
                                )
                            ) {

                                const parts =
                                    lightningButton
                                        .customId
                                        .split("_");

                                const index =
                                    Number(
                                        parts[2]
                                    );

                                if (
                                    !Number.isInteger(
                                        index
                                    ) ||
                                    index < 1 ||
                                    index > 9
                                ) {
                                    return;
                                }

                                const currentPlayer =
                                    getPlayer(
                                        userId
                                    );

                                if (
                                    !currentPlayer
                                ) {

                                    return lightningButton.update({
                                        content:
                                            "❌ Không tìm thấy nhân vật.",
                                        embeds: [],
                                        components: []
                                    });
                                }

                                await processLightning(
                                    lightningButton,
                                    currentPlayer,
                                    userId,
                                    index
                                );
                            }
                        }
                    );
                }
            }
        );

        collector.on(
            "end",
            async () => {}
        );
    },

    // =====================================================
    // 📦 EXPORT
    // =====================================================

    realms,

    LOI_KIEP,

    DAO_BUFFS,

    getDaoBuff,

    getLightningDamage,

    getBuffedHp,

    getBuffedCong,

    getBuffedThu,

    getStage,

    getRealmDisplay,

    getTierRequiredTuVi
};
