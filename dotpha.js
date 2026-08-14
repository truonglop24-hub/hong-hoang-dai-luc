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
// 🌌 18 CẢNH GIỚI
// =====================================================

const realms = [
    { name: "Phàm Nhân", max: 9, stats: { hp: 100, cong: 20, thu: 15 } },
    { name: "Luyện Khí", max: 9, stats: { hp: 300, cong: 60, thu: 40 } },
    { name: "Trúc Cơ", max: 9, stats: { hp: 1000, cong: 200, thu: 140 } },
    { name: "Kim Đan", max: 9, stats: { hp: 3000, cong: 600, thu: 400 } },
    { name: "Nguyên Anh", max: 9, stats: { hp: 10000, cong: 2000, thu: 1400 } },
    { name: "Hóa Thần", max: 9, stats: { hp: 30000, cong: 6000, thu: 4000 } },
    { name: "Luyện Hư", max: 9, stats: { hp: 100000, cong: 20000, thu: 14000 } },
    { name: "Hợp Thể", max: 9, stats: { hp: 300000, cong: 60000, thu: 40000 } },
    { name: "Đại Thừa", max: 9, stats: { hp: 1000000, cong: 200000, thu: 140000 } },
    { name: "Độ Kiếp", max: 9, stats: { hp: 3000000, cong: 600000, thu: 400000 } },
    { name: "Tiên Nhân", max: 9, stats: { hp: 10000000, cong: 2000000, thu: 1400000 } },
    { name: "Chân Tiên", max: 9, stats: { hp: 30000000, cong: 6000000, thu: 4000000 } },
    { name: "Thiên Tiên", max: 9, stats: { hp: 100000000, cong: 20000000, thu: 14000000 } },
    { name: "Huyền Tiên", max: 9, stats: { hp: 300000000, cong: 60000000, thu: 40000000 } },
    { name: "Kim Tiên", max: 9, stats: { hp: 1000000000, cong: 200000000, thu: 140000000 } },
    { name: "Thánh Nhân", max: 9, stats: { hp: 5000000000, cong: 1000000000, thu: 700000000 } },
    { name: "Thiên Đạo", max: 9, stats: { hp: 20000000000, cong: 4000000000, thu: 2800000000 } },
    { name: "Đại Đạo", max: 9, stats: { hp: 100000000000, cong: 20000000000, thu: 14000000000 } }
];

// =====================================================
// ⚡ 9 ĐẠO LÔI KIẾP
// =====================================================

const LOI_KIEP = [
    { index: 1, name: "Thiên Lôi", emoji: "⚡", multiplier: 0.8 },
    { index: 2, name: "Tử Tiêu Lôi", emoji: "🌩️", multiplier: 1.0 },
    { index: 3, name: "Huyền Lôi", emoji: "🟣", multiplier: 1.3 },
    { index: 4, name: "Diệt Thế Lôi", emoji: "💜", multiplier: 1.7 },
    { index: 5, name: "Cửu U Lôi", emoji: "🌑", multiplier: 2.2 },
    { index: 6, name: "Hỗn Độn Lôi", emoji: "🌌", multiplier: 2.8 },
    { index: 7, name: "Hồng Mông Lôi", emoji: "✨", multiplier: 3.5 },
    { index: 8, name: "Đại Đạo Lôi", emoji: "☄️", multiplier: 4.3 },
    { index: 9, name: "Cửu Thiên Diệt Đạo Lôi", emoji: "🌩️", multiplier: 5.5 }
];

// =====================================================
// ⚙️ CẤU HÌNH
// =====================================================

const BASE_DAMAGE_PERCENT = 0.03;
const REALM_POWER_STEP = 0.45;
const TIER_POWER_STEP = 0.05;

const MIN_LOST_TUVI = 1000;
const MAX_LOST_TUVI = 10000;

const SESSION_TIME = 120000;

const sessions = new Map();

// =====================================================
// 🔧 HÀM HỖ TRỢ
// =====================================================

function getRealmIndex(player) {
    const index = realms.findIndex(
        r => r.name === player.canhGioi
    );

    return index >= 0 ? index : 0;
}

function getTier(player) {
    return Math.max(
        1,
        Number(player.tang || 1)
    );
}

function getLightning(index) {
    return LOI_KIEP[index - 1];
}

function randomInt(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1)
    ) + min;
}

function formatNumber(number) {
    return Number(number || 0).toLocaleString("vi-VN");
}

// =====================================================
// 💥 SÁT THƯƠNG LÔI KIẾP
// =====================================================

function calculateLightningDamage(player, index) {

    const lightning = getLightning(index);

    if (!lightning) return 0;

    const realmIndex = getRealmIndex(player);
    const tier = getTier(player);

    const maxHp = Math.max(
        1,
        Number(player.maxHp || player.hp || 1)
    );

    // Cảnh giới càng cao → lôi càng mạnh
    const realmMultiplier =
        1 + realmIndex * REALM_POWER_STEP;

    // Tầng càng cao → lôi càng mạnh
    const tierMultiplier =
        1 + (tier - 1) * TIER_POWER_STEP;

    const damage =
        maxHp *
        BASE_DAMAGE_PERCENT *
        realmMultiplier *
        tierMultiplier *
        lightning.multiplier;

    return Math.max(
        1,
        Math.floor(damage)
    );
}

// =====================================================
// 🎲 TỶ LỆ CHỐNG CHỊU
// =====================================================

function getResistanceRate(player, index) {

    const realmIndex = getRealmIndex(player);
    const tier = getTier(player);

    // Cảnh giới càng cao càng khó
    const realmPenalty =
        realmIndex * 1.5;

    // Tầng càng cao càng khó
    const tierPenalty =
        (tier - 1) * 0.5;

    // Đạo càng cao càng khó
    const lightningPenalty =
        (index - 1) * 4;

    let rate =
        95 -
        realmPenalty -
        tierPenalty -
        lightningPenalty;

    // Luôn nằm trong 1-100%
    rate = Math.max(
        1,
        Math.min(100, rate)
    );

    return Math.floor(rate);
}

// =====================================================
// 🌩️ GIAO DIỆN CHUẨN BỊ
// =====================================================

function createPrepareEmbed(player) {

    const realmIndex =
        getRealmIndex(player);

    const realm =
        realms[realmIndex];

    const tier =
        getTier(player);

    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🌩️ CỬU ĐẠO LÔI KIẾP")
        .setDescription([
            "╔════════════════════════╗",
            "       ⚡ **ĐỘ KIẾP**",
            "╚════════════════════════╝",
            "",
            `🌌 Cảnh giới: **${realm.name}**`,
            `🌱 Tầng: **${tier}**`,
            "",
            "⚡ Thiên Đạo sẽ giáng xuống",
            "🔥 **9 đạo Lôi Kiếp liên tiếp**.",
            "",
            "🎲 Mỗi đạo sẽ random **1–100**.",
            "📊 So sánh với tỷ lệ chống chịu.",
            "",
            "📈 Cảnh giới càng cao",
            "→ Lôi Kiếp càng mạnh.",
            "",
            "📈 Đạo càng cao",
            "→ Sát thương càng lớn.",
            "",
            `💀 Thất bại → mất **${formatNumber(MIN_LOST_TUVI)}–${formatNumber(MAX_LOST_TUVI)} Tu Vi**.`,
            "",
            "✨ Vượt qua đủ 9 đạo",
            "→ **Đột phá thành công!**"
        ].join("\n"))
        .setFooter({
            text: "🌌 Hồng Hoang Đại Lục • Cửu Đạo Lôi Kiếp"
        });
}

// =====================================================
// 🔘 NÚT BẮT ĐẦU
// =====================================================

function startButton(userId) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `dotpha_start_${userId}`
                )
                .setLabel("Bắt đầu Độ Kiếp")
                .setEmoji("⚡")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId(
                    `dotpha_cancel_${userId}`
                )
                .setLabel("Hủy")
                .setEmoji("🛑")
                .setStyle(ButtonStyle.Secondary)

        );
}

// =====================================================
// ⚡ GIAO DIỆN TỪNG ĐẠO
// =====================================================

function createLightningEmbed(player, index) {

    const lightning =
        getLightning(index);

    const realmIndex =
        getRealmIndex(player);

    const realm =
        realms[realmIndex];

    const tier =
        getTier(player);

    const damage =
        calculateLightningDamage(
            player,
            index
        );

    const rate =
        getResistanceRate(
            player,
            index
        );

    const hp =
        Math.max(
            0,
            Number(player.hp || 0)
        );

    const maxHp =
        Math.max(
            1,
            Number(player.maxHp || 1)
        );

    return new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(
            `${lightning.emoji} LÔI KIẾP ${index}/9`
        )
        .setDescription([
            "╔════════════════════════╗",
            `    ${lightning.emoji} **${lightning.name}**`,
            "╚════════════════════════╝",
            "",
            `🌌 **${realm.name}**`,
            `🌱 Tầng **${tier}**`,
            "",
            `🎲 Tỷ lệ chống chịu: **${rate}%**`,
            `💥 Sát thương: **-${formatNumber(damage)} HP**`,
            `❤️ HP: **${formatNumber(hp)} / ${formatNumber(maxHp)}**`,
            "",
            "━━━━━━━━━━━━━━━━━━━━",
            `⚡ Tiến độ: **${index}/9**`,
            "",
            index >= 7
                ? "☠️ **Lôi Kiếp cuối cực kỳ nguy hiểm!**"
                : "🔥 Hãy chuẩn bị chống chịu đạo lôi tiếp theo."
        ].join("\n"))
        .setFooter({
            text:
                `⚡ ${lightning.name} • Đạo ${index}/9`
        });
}

// =====================================================
// 🔘 NÚT CHỊU LÔI
// =====================================================

function lightningButton(userId, index) {

    const lightning =
        getLightning(index);

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `dotpha_lightning_${userId}_${index}`
                )
                .setLabel(
                    `Chịu ${index}/9`
                )
                .setEmoji(
                    lightning.emoji
                )
                .setStyle(
                    ButtonStyle.Danger
                )

        );
}

// =====================================================
// ❌ THẤT BẠI
// =====================================================

async function failBreakthrough(
    interaction,
    player,
    userId,
    index,
    damage,
    roll,
    rate
) {

    const lightning =
        getLightning(index);

    const oldHp =
        Math.max(
            0,
            Number(player.hp || 0)
        );

    const lostTuVi =
        randomInt(
            MIN_LOST_TUVI,
            MAX_LOST_TUVI
        );

    const currentTuVi =
        Math.max(
            0,
            Number(player.tuvi || 0)
        );

    const newTuVi =
        Math.max(
            0,
            currentTuVi - lostTuVi
        );

    const newHp =
        Math.max(
            0,
            oldHp - damage
        );

    updatePlayer(
        userId,
        {
            hp: newHp,
            tuvi: newTuVi
        }
    );

    sessions.delete(userId);

    const embed =
        new EmbedBuilder()
            .setColor(0xed4245)
            .setTitle("💥 ĐỘ KIẾP THẤT BẠI")
            .setDescription([
                `${lightning.emoji} **${lightning.name}** đã đánh bại ngươi!`,
                "",
                `⚡ Thất bại tại **đạo ${index}/9**.`,
                "",
                `🎲 Kết quả random: **${roll}/100**`,
                `🛡️ Tỷ lệ thành công: **${rate}%**`,
                "",
                `💥 Sát thương: **-${formatNumber(damage)} HP**`,
                `❤️ HP còn lại: **${formatNumber(newHp)}**`,
                "",
                `🌱 Tu Vi mất: **-${formatNumber(lostTuVi)}**`,
                `🌱 Tu Vi còn: **${formatNumber(newTuVi)}**`,
                "",
                "❌ **Lôi Kiếp đã đánh bại ngươi!**",
                "🧘 Hãy tu luyện thêm rồi thử lại."
            ].join("\n"))
            .setFooter({
                text: "🌩️ Thiên kiếp đã kết thúc."
            });

    await interaction.update({
        embeds: [embed],
        components: []
    });
}

// =====================================================
// ✨ ĐỘT PHÁ THÀNH CÔNG
// =====================================================

async function completeBreakthrough(
    interaction,
    player,
    userId
) {

    const oldRealmIndex =
        getRealmIndex(player);

    const oldRealm =
        realms[oldRealmIndex];

    const oldTier =
        getTier(player);

    let newRealmIndex =
        oldRealmIndex;

    let newTier =
        oldTier + 1;

    if (newTier > oldRealm.max) {

        newRealmIndex =
            oldRealmIndex + 1;

        newTier = 1;
    }

    // Đại Đạo tầng 9
    if (!realms[newRealmIndex]) {

        sessions.delete(userId);

        await interaction.update({

            embeds: [
                new EmbedBuilder()
                    .setColor(0xf1c40f)
                    .setTitle("👑 ĐẠI ĐẠO TỐI CAO")
                    .setDescription([
                        "🌩️ Ngươi đã vượt qua",
                        "",
                        "⚡ **9/9 đạo Lôi Kiếp!**",
                        "",
                        "👑 **Đại Đạo tầng 9**",
                        "",
                        "🌌 Đây là cảnh giới tối cao."
                    ].join("\n"))
            ],

            components: []

        });

        return;
    }

    const newRealm =
        realms[newRealmIndex];

    const BREAKTHROUGH_MULTIPLIER = 9;

    const hpIncrease =
        Math.floor(
            newRealm.stats.hp *
            newTier *
            BREAKTHROUGH_MULTIPLIER
        );

    const congIncrease =
        Math.floor(
            newRealm.stats.cong *
            newTier *
            BREAKTHROUGH_MULTIPLIER
        );

    const thuIncrease =
        Math.floor(
            newRealm.stats.thu *
            newTier *
            BREAKTHROUGH_MULTIPLIER
        );

    const oldMaxHp =
        Number(player.maxHp || 0);

    const oldHp =
        Number(player.hp || 0);

    const oldCong =
        Number(player.cong || 0);

    const oldThu =
        Number(player.thu || 0);

    const newMaxHp =
        oldMaxHp + hpIncrease;

    const newHp =
        Math.min(
            newMaxHp,
            oldHp + hpIncrease
        );

    const newCong =
        oldCong + congIncrease;

    const newThu =
        oldThu + thuIncrease;

    updatePlayer(
        userId,
        {
            canhGioi: newRealm.name,
            tang: newTier,
            maxHp: newMaxHp,
            hp: newHp,
            cong: newCong,
            thu: newThu
        }
    );

    sessions.delete(userId);

    const embed =
        new EmbedBuilder()
            .setColor(0x57f287)
            .setTitle("🌩️ CỬU KIẾP VƯỢT QUA!")
            .setDescription([
                "╔════════════════════════╗",
                "    ⚡ **ĐỘT PHÁ THÀNH CÔNG**",
                "╚════════════════════════╝",
                "",
                "🌩️ **9/9 đạo Lôi Kiếp đã bị chinh phục!**",
                "",
                `🌱 ${oldRealm.name} tầng ${oldTier}`,
                "",
                "⬇️",
                "",
                `✨ **${newRealm.name} tầng ${newTier}**`,
                "",
                "━━━━━━━━━━━━━━━━━━━━",
                "📈 **Chỉ số tăng trưởng**",
                "",
                `❤️ HP: **+${formatNumber(hpIncrease)}**`,
                `⚔️ Công: **+${formatNumber(congIncrease)}**`,
                `🛡️ Thủ: **+${formatNumber(thuIncrease)}**`,
                "",
                `❤️ HP tổng: **${formatNumber(newMaxHp)}**`,
                `⚔️ Công tổng: **${formatNumber(newCong)}**`,
                `🛡️ Thủ tổng: **${formatNumber(newThu)}**`,
                "",
                `🌱 Tu Vi: **${formatNumber(player.tuvi)}**`
            ].join("\n"))
            .setFooter({
                text:
                    "🌌 Hồng Hoang Đại Lục • Cửu Đạo Lôi Kiếp"
            });

    await interaction.update({
        embeds: [embed],
        components: []
    });
}

// =====================================================
// ⚡ XỬ LÝ LÔI KIẾP
// =====================================================

async function processLightning(
    interaction,
    player,
    userId,
    index
) {

    const lightning =
        getLightning(index);

    if (!lightning) return;

    // 🎲 RANDOM 1-100
    const roll =
        randomInt(1, 100);

    // 📊 TỶ LỆ THÀNH CÔNG
    const rate =
        getResistanceRate(
            player,
            index
        );

    // 💥 SÁT THƯƠNG
    const damage =
        calculateLightningDamage(
            player,
            index
        );

    const oldHp =
        Math.max(
            0,
            Number(player.hp || 0)
        );

    const newHp =
        Math.max(
            0,
            oldHp - damage
        );

    // =================================================
    // 🎲 RANDOM 1-100
    //
    // roll <= rate
    // → THÀNH CÔNG
    //
    // roll > rate
    // → THẤT BẠI
    // =================================================

    if (
        roll > rate ||
        newHp <= 0
    ) {

        return failBreakthrough(
            interaction,
            player,
            userId,
            index,
            damage,
            roll,
            rate
        );
    }

    // =================================================
    // ✅ VƯỢT QUA ĐẠO LÔI
    // =================================================

    updatePlayer(
        userId,
        {
            hp: newHp
        }
    );

    // =================================================
    // 🌩️ VƯỢT QUA ĐẠO 9
    // =================================================

    if (index >= 9) {

        const updatedPlayer =
            getPlayer(userId);

        return completeBreakthrough(
            interaction,
            updatedPlayer,
            userId
        );
    }

    // =================================================
    // ⚡ ĐẠO TIẾP THEO
    // =================================================

    const updatedPlayer =
        getPlayer(userId);

    const nextIndex =
        index + 1;

    await interaction.update({

        embeds: [
            createLightningEmbed(
                updatedPlayer,
                nextIndex
            )
        ],

        components: [
            lightningButton(
                userId,
                nextIndex
            )
        ]

    });
}

// =====================================================
// /DOTPHA
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dotpha")
            .setDescription(
                "🌩️ Vượt qua 9 đạo Lôi Kiếp để đột phá cảnh giới"
            ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        const player =
            getPlayer(userId);

        if (!player) {

            return interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước.",

                ephemeral: true

            });
        }

        if (sessions.has(userId)) {

            return interaction.reply({

                content:
                    "🌩️ **Bạn đang trong quá trình Độ Kiếp!**",

                ephemeral: true

            });
        }

        const realmIndex =
            getRealmIndex(player);

        const tier =
            getTier(player);

        // =================================================
        // 👑 ĐẠI ĐẠO TẦNG 9
        // =================================================

        if (
            realmIndex === realms.length - 1 &&
            tier >= 9
        ) {

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(0xf1c40f)
                        .setTitle("👑 ĐẠI ĐẠO TỐI CAO")
                        .setDescription([
                            "🌌 Bạn đã đạt",
                            "",
                            "👑 **Đại Đạo tầng 9**",
                            "",
                            "✨ Không còn cảnh giới nào cao hơn."
                        ].join("\n"))

                ],

                ephemeral: true

            });
        }

        // =================================================
        // SESSION
        // =================================================

        sessions.set(
            userId,
            {
                currentLightning: 0,
                startedAt: Date.now()
            }
        );

        const message =
            await interaction.reply({

                embeds: [
                    createPrepareEmbed(player)
                ],

                components: [
                    startButton(userId)
                ],

                fetchReply: true

            });

        // =================================================
        // COLLECTOR
        // =================================================

        const collector =
            message.createMessageComponentCollector({

                time: SESSION_TIME

            });

        collector.on(
            "collect",
            async buttonInteraction => {

                if (
                    buttonInteraction.user.id !==
                    userId
                ) {

                    return buttonInteraction.reply({

                        content:
                            "🚫 Đây không phải Lôi Kiếp của bạn!",

                        ephemeral: true

                    });
                }

                // =================================================
                // ⚡ BẮT ĐẦU
                // =================================================

                if (
                    buttonInteraction.customId ===
                    `dotpha_start_${userId}`
                ) {

                    const currentPlayer =
                        getPlayer(userId);

                    if (!currentPlayer) {

                        sessions.delete(userId);
                        collector.stop("error");

                        return buttonInteraction.update({

                            content:
                                "❌ Không tìm thấy nhân vật.",

                            embeds: [],
                            components: []

                        });
                    }

                    return buttonInteraction.update({

                        embeds: [
                            createLightningEmbed(
                                currentPlayer,
                                1
                            )
                        ],

                        components: [
                            lightningButton(
                                userId,
                                1
                            )
                        ]

                    });
                }

                // =================================================
                // 🛑 HỦY
                // =================================================

                if (
                    buttonInteraction.customId ===
                    `dotpha_cancel_${userId}`
                ) {

                    sessions.delete(userId);
                    collector.stop("cancel");

                    return buttonInteraction.update({

                        content:
                            "🛑 **Đã hủy Độ Kiếp.**\n🌩️ Thiên kiếp tạm thời tan biến.",

                        embeds: [],
                        components: []

                    });
                }

                // =================================================
                // 🌩️ CHỊU LÔI
                // =================================================

                if (
                    buttonInteraction.customId.startsWith(
                        `dotpha_lightning_${userId}_`
                    )
                ) {

                    const parts =
                        buttonInteraction.customId.split("_");

                    const index =
                        Number(
                            parts[parts.length - 1]
                        );

                    const session =
                        sessions.get(userId);

                    if (!session) {

                        return buttonInteraction.reply({

                            content:
                                "⏰ Phiên Độ Kiếp đã hết hạn.",

                            ephemeral: true

                        });
                    }

                    if (
                        Date.now() -
                        session.startedAt >
                        SESSION_TIME
                    ) {

                        sessions.delete(userId);
                        collector.stop("timeout");

                        return buttonInteraction.update({

                            content:
                                "⏰ **Độ Kiếp đã hết thời gian!**",

                            embeds: [],
                            components: []

                        });
                    }

                    const currentPlayer =
                        getPlayer(userId);

                    if (!currentPlayer) {

                        sessions.delete(userId);
                        collector.stop("error");

                        return buttonInteraction.reply({

                            content:
                                "❌ Không tìm thấy nhân vật.",

                            ephemeral: true

                        });
                    }

                    try {

                        await processLightning(

                            buttonInteraction,
                            currentPlayer,
                            userId,
                            index

                        );

                        if (
                            !sessions.has(userId)
                        ) {

                            collector.stop("finished");
                        }

                    } catch (error) {

                        console.error(
                            "❌ Lỗi Độ Kiếp:",
                            error
                        );

                        sessions.delete(userId);
                        collector.stop("error");

                        try {

                            if (
                                !buttonInteraction.replied &&
                                !buttonInteraction.deferred
                            ) {

                                await buttonInteraction.reply({

                                    content:
                                        "❌ Độ Kiếp xảy ra lỗi. Hãy thử lại.",

                                    ephemeral: true

                                });
                            }

                        } catch (e) {

                            console.error(e);
                        }
                    }
                }
            }
        );

        // =================================================
        // ⏰ TIMEOUT
        // =================================================

        collector.on(
            "end",
            async (collected, reason) => {

                sessions.delete(userId);

                if (
                    reason === "finished" ||
                    reason === "cancel" ||
                    reason === "error"
                ) {
                    return;
                }

                try {

                    await interaction.editReply({

                        content:
                            "⏰ **Độ Kiếp đã hết thời gian!**\n🌩️ Thiên kiếp đã tan.",

                        embeds: [],
                        components: []

                    });

                } catch (error) {

                    console.error(
                        "❌ Lỗi timeout:",
                        error
                    );
                }
            }
        );
    },

    realms,
    LOI_KIEP,
    sessions
};
