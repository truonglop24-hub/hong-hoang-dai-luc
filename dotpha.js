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
    {
        name: "Phàm Nhân",
        max: 9,
        needTuVi: 50,
        stats: { hp: 100, cong: 20, thu: 15 }
    },
    {
        name: "Luyện Khí",
        max: 9,
        needTuVi: 100,
        stats: { hp: 300, cong: 60, thu: 40 }
    },
    {
        name: "Trúc Cơ",
        max: 9,
        needTuVi: 250,
        stats: { hp: 1000, cong: 200, thu: 140 }
    },
    {
        name: "Kim Đan",
        max: 9,
        needTuVi: 500,
        stats: { hp: 3000, cong: 600, thu: 400 }
    },
    {
        name: "Nguyên Anh",
        max: 9,
        needTuVi: 1000,
        stats: { hp: 10000, cong: 2000, thu: 1400 }
    },
    {
        name: "Hóa Thần",
        max: 9,
        needTuVi: 2000,
        stats: { hp: 30000, cong: 6000, thu: 4000 }
    },
    {
        name: "Luyện Hư",
        max: 9,
        needTuVi: 4000,
        stats: { hp: 100000, cong: 20000, thu: 14000 }
    },
    {
        name: "Hợp Thể",
        max: 9,
        needTuVi: 8000,
        stats: { hp: 300000, cong: 60000, thu: 40000 }
    },
    {
        name: "Đại Thừa",
        max: 9,
        needTuVi: 16000,
        stats: { hp: 1000000, cong: 200000, thu: 140000 }
    },
    {
        name: "Độ Kiếp",
        max: 9,
        needTuVi: 32000,
        stats: { hp: 3000000, cong: 600000, thu: 400000 }
    },
    {
        name: "Tiên Nhân",
        max: 9,
        needTuVi: 64000,
        stats: { hp: 10000000, cong: 2000000, thu: 1400000 }
    },
    {
        name: "Chân Tiên",
        max: 9,
        needTuVi: 128000,
        stats: { hp: 30000000, cong: 6000000, thu: 4000000 }
    },
    {
        name: "Thiên Tiên",
        max: 9,
        needTuVi: 256000,
        stats: { hp: 100000000, cong: 20000000, thu: 14000000 }
    },
    {
        name: "Huyền Tiên",
        max: 9,
        needTuVi: 512000,
        stats: { hp: 300000000, cong: 60000000, thu: 40000000 }
    },
    {
        name: "Kim Tiên",
        max: 9,
        needTuVi: 1024000,
        stats: { hp: 1000000000, cong: 200000000, thu: 140000000 }
    },
    {
        name: "Thánh Nhân",
        max: 9,
        needTuVi: 2048000,
        stats: {
            hp: 5000000000,
            cong: 1000000000,
            thu: 700000000
        }
    },
    {
        name: "Thiên Đạo",
        max: 9,
        needTuVi: 4096000,
        stats: {
            hp: 20000000000,
            cong: 4000000000,
            thu: 2800000000
        }
    },
    {
        name: "Đại Đạo",
        max: 9,
        needTuVi: 8192000,
        stats: {
            hp: 100000000000,
            cong: 20000000000,
            thu: 14000000000
        }
    }
];

// =====================================================
// ⚡ 9 ĐẠO LÔI KIẾP
// =====================================================

const LOI_KIEP = [
    {
        index: 1,
        name: "Thiên Lôi",
        emoji: "⚡",
        multiplier: 0.80
    },
    {
        index: 2,
        name: "Tử Tiêu Lôi",
        emoji: "🌩️",
        multiplier: 1.00
    },
    {
        index: 3,
        name: "Huyền Lôi",
        emoji: "🟣",
        multiplier: 1.30
    },
    {
        index: 4,
        name: "Diệt Thế Lôi",
        emoji: "💜",
        multiplier: 1.70
    },
    {
        index: 5,
        name: "Cửu U Lôi",
        emoji: "🌑",
        multiplier: 2.20
    },
    {
        index: 6,
        name: "Hỗn Độn Lôi",
        emoji: "🌌",
        multiplier: 2.80
    },
    {
        index: 7,
        name: "Hồng Mông Lôi",
        emoji: "✨",
        multiplier: 3.50
    },
    {
        index: 8,
        name: "Đại Đạo Lôi",
        emoji: "☄️",
        multiplier: 4.30
    },
    {
        index: 9,
        name: "Cửu Thiên Diệt Đạo Lôi",
        emoji: "🌩️",
        multiplier: 5.50
    }
];

// =====================================================
// ⚙️ CẤU HÌNH
// =====================================================

// Lôi Kiếp cơ bản tính theo % Max HP.
// Cảnh giới thấp sẽ rất nhẹ,
// cảnh giới cao sẽ tăng dần.
const BASE_DAMAGE_PERCENT = 0.03;

// Cảnh giới tăng sức mạnh Lôi Kiếp.
const REALM_POWER_STEP = 0.45;

// Tầng tăng nhẹ sức mạnh Lôi Kiếp.
const TIER_POWER_STEP = 0.05;

// Tu Vi mất khi thất bại.
const MIN_LOST_TUVI = 1000;
const MAX_LOST_TUVI = 10000;

// Thời gian tối đa cho một phiên.
const SESSION_TIME = 120000;

// =====================================================
// 🗃️ SESSION
// =====================================================

const sessions = new Map();

// =====================================================
// 🔎 HỖ TRỢ
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
    return Number(
        number || 0
    ).toLocaleString("vi-VN");
}

// =====================================================
// 💥 TÍNH SÁT THƯƠNG LÔI KIẾP
// =====================================================

function calculateLightningDamage(
    player,
    lightningIndex
) {
    const lightning =
        getLightning(lightningIndex);

    if (!lightning) return 0;

    const realmIndex =
        getRealmIndex(player);

    const tier =
        getTier(player);

    const maxHp =
        Math.max(
            1,
            Number(player.maxHp || 0)
        );

    // -----------------------------------------------
    // 🌱 CẢNH GIỚI
    // -----------------------------------------------

    const realmMultiplier =
        1 +
        realmIndex *
        REALM_POWER_STEP;

    // -----------------------------------------------
    // 🌱 TẦNG
    // -----------------------------------------------

    const tierMultiplier =
        1 +
        (tier - 1) *
        TIER_POWER_STEP;

    // -----------------------------------------------
    // 💥 SÁT THƯƠNG
    // -----------------------------------------------

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
// 🛡️ TỶ LỆ CHỐNG CHỊU
// =====================================================

// Cảnh giới thấp dễ vượt qua.
// Cảnh giới cao càng khó.
function getResistanceRate(
    player,
    lightningIndex
) {
    const realmIndex =
        getRealmIndex(player);

    const tier =
        getTier(player);

    const lightning =
        getLightning(lightningIndex);

    if (!lightning) return 0;

    // Tỷ lệ cơ bản giảm dần theo đạo.
    const lightningPenalty =
        (lightningIndex - 1) * 4;

    // Cảnh giới càng cao càng khó.
    const realmPenalty =
        realmIndex * 1.5;

    // Tầng càng cao khó hơn một chút.
    const tierPenalty =
        (tier - 1) * 0.5;

    let rate =
        95 -
        lightningPenalty -
        realmPenalty -
        tierPenalty;

    // Không thấp hơn 15%.
    rate = Math.max(
        15,
        rate
    );

    return Math.floor(rate);
}

// =====================================================
// 🌩️ EMBED CHUẨN BỊ
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

        .setTitle(
            "🌩️ CỬU ĐẠO LÔI KIẾP"
        )

        .setDescription([

            "╔════════════════════════╗",
            "      ⚡ **ĐỘ KIẾP**",
            "╚════════════════════════╝",

            "",

            `🌌 Cảnh giới: **${realm.name}**`,
            `🌱 Tầng: **${tier}**`,

            "",

            "⚡ Thiên Đạo sẽ giáng xuống",
            "🔥 **9 đạo Lôi Kiếp liên tiếp**.",

            "",

            "📈 Cảnh giới càng cao",
            "→ Lôi Kiếp càng mạnh.",

            "",

            "📈 Đạo càng cao",
            "→ Sát thương càng lớn.",

            "",

            "💥 Nếu không chống chịu nổi:",
            `→ Mất **${formatNumber(MIN_LOST_TUVI)}–${formatNumber(MAX_LOST_TUVI)} Tu Vi**.`,

            "",

            "✨ Vượt qua 9/9:",
            "→ **Đột phá thành công!**"

        ].join("\n"))

        .setFooter({
            text:
                "🌌 Hồng Hoang Đại Lục • Cửu Đạo Lôi Kiếp"
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
                .setLabel(
                    "Bắt đầu Độ Kiếp"
                )
                .setEmoji("⚡")
                .setStyle(
                    ButtonStyle.Danger
                ),

            new ButtonBuilder()
                .setCustomId(
                    `dotpha_cancel_${userId}`
                )
                .setLabel(
                    "Hủy"
                )
                .setEmoji("🛑")
                .setStyle(
                    ButtonStyle.Secondary
                )
        );
}

// =====================================================
// ⚡ EMBED LÔI KIẾP
// =====================================================

function createLightningEmbed(
    player,
    index
) {
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

            `💥 Sát thương: **-${formatNumber(damage)} HP**`,

            `❤️ HP: **${formatNumber(hp)} / ${formatNumber(maxHp)}**`,

            `🛡️ Khả năng chống chịu: **${rate}%**`,

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

function lightningButton(
    userId,
    index
) {
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
// 💥 THẤT BẠI
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
            currentTuVi -
            lostTuVi
        );

    // HP sau khi chịu lôi.
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

    sessions.delete(
        userId
    );

    const embed =
        new EmbedBuilder()

            .setColor(0xed4245)

            .setTitle(
                "💥 ĐỘ KIẾP THẤT BẠI"
            )

            .setDescription([

                `${lightning.emoji} **${lightning.name}** đã đánh bại ngươi!`,

                "",

                `⚡ Thất bại tại **đạo ${index}/9**.`,

                "",

                `🎲 Kết quả chống chịu: **${roll}**`,
                `🛡️ Tỷ lệ chống chịu: **${rate}%**`,

                "",

                `💥 Sát thương nhận: **-${formatNumber(damage)} HP**`,
                `❤️ HP còn lại: **${formatNumber(newHp)}**`,

                "",

                `🌱 Tu Vi mất: **-${formatNumber(lostTuVi)}**`,
                `🌱 Tu Vi còn: **${formatNumber(newTuVi)}**`,

                "",

                "❌ **Lôi Kiếp đã đánh bại ngươi!**",
                "🧘 Hãy tu luyện thêm và thử lại."

            ].join("\n"))

            .setFooter({
                text:
                    "🌩️ Thiên kiếp đã kết thúc."
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

    // -----------------------------------------------
    // TẦNG 9 → CẢNH GIỚI TIẾP
    // -----------------------------------------------

    if (
        newTier >
        oldRealm.max
    ) {
        newRealmIndex =
            oldRealmIndex + 1;

        newTier = 1;
    }

    // -----------------------------------------------
    // ĐẠI ĐẠO TẦNG 9
    // -----------------------------------------------

    if (
        !realms[newRealmIndex]
    ) {

        sessions.delete(
            userId
        );

        await interaction.update({

            embeds: [

                new EmbedBuilder()

                    .setColor(0xf1c40f)

                    .setTitle(
                        "👑 ĐẠI ĐẠO TỐI CAO"
                    )

                    .setDescription([

                        "🌩️ Ngươi đã vượt qua",

                        "⚡ **9/9 đạo Lôi Kiếp!**",

                        "",

                        "👑 **Đại Đạo tầng 9**",

                        "",

                        "🌌 Đây đã là cảnh giới tối cao."

                    ].join("\n"))

            ],

            components: []

        });

        return;
    }

    const newRealm =
        realms[newRealmIndex];

    // -----------------------------------------------
    // 📈 HỆ SỐ X9 GIỮ NGUYÊN
    // -----------------------------------------------

    const BREAKTHROUGH_MULTIPLIER = 9;

    const tierMultiplier =
        newTier;

    // -----------------------------------------------
    // ❤️ HP
    // -----------------------------------------------

    const hpIncrease =
        Math.floor(
            newRealm.stats.hp *
            tierMultiplier *
            BREAKTHROUGH_MULTIPLIER
        );

    // -----------------------------------------------
    // ⚔️ CÔNG
    // -----------------------------------------------

    const congIncrease =
        Math.floor(
            newRealm.stats.cong *
            tierMultiplier *
            BREAKTHROUGH_MULTIPLIER
        );

    // -----------------------------------------------
    // 🛡️ THỦ
    // -----------------------------------------------

    const thuIncrease =
        Math.floor(
            newRealm.stats.thu *
            tierMultiplier *
            BREAKTHROUGH_MULTIPLIER
        );

    // -----------------------------------------------
    // CHỈ SỐ CŨ
    // -----------------------------------------------

    const oldMaxHp =
        Number(
            player.maxHp || 0
        );

    const oldHp =
        Number(
            player.hp || 0
        );

    const oldCong =
        Number(
            player.cong || 0
        );

    const oldThu =
        Number(
            player.thu || 0
        );

    // -----------------------------------------------
    // CHỈ SỐ MỚI
    // -----------------------------------------------

    const newMaxHp =
        oldMaxHp +
        hpIncrease;

    const newHp =
        Math.min(
            newMaxHp,
            oldHp +
            hpIncrease
        );

    const newCong =
        oldCong +
        congIncrease;

    const newThu =
        oldThu +
        thuIncrease;

    // -----------------------------------------------
    // TU VI GIỮ NGUYÊN
    // -----------------------------------------------

    const remainingTuVi =
        Number(
            player.tuvi || 0
        );

    const remainingKinhNghiem =
        Number(
            player.kinhNghiem || 0
        );

    // -----------------------------------------------
    // 💾 DATABASE
    // -----------------------------------------------

    updatePlayer(
        userId,
        {
            canhGioi:
                newRealm.name,

            tang:
                newTier,

            tuvi:
                remainingTuVi,

            kinhNghiem:
                remainingKinhNghiem,

            maxHp:
                newMaxHp,

            hp:
                newHp,

            cong:
                newCong,

            thu:
                newThu
        }
    );

    sessions.delete(
        userId
    );

    // -----------------------------------------------
    // 🎉 THÀNH CÔNG
    // -----------------------------------------------

    const embed =
        new EmbedBuilder()

            .setColor(0x57f287)

            .setTitle(
                "🌩️ CỬU KIẾP VƯỢT QUA!"
            )

            .setDescription([

                "╔════════════════════════╗",
                "    ⚡ **ĐỘT PHÁ THÀNH CÔNG**",
                "╚════════════════════════╝",

                "",

                "🌩️ **9/9 đạo Lôi Kiếp đã bị chinh phục!**",

                "",

                `🌱 ${oldRealm.name} tầng ${oldTier}`,

                "⬇️",

                `✨ **${newRealm.name} tầng ${newTier}**`,

                "",

                "━━━━━━━━━━━━━━━━━━━━",

                "📈 **Chỉ số tăng trưởng**",

                `❤️ HP: **+${formatNumber(hpIncrease)}**`,
                `⚔️ Công: **+${formatNumber(congIncrease)}**`,
                `🛡️ Thủ: **+${formatNumber(thuIncrease)}**`,

                "",

                `❤️ HP tổng: **${formatNumber(newMaxHp)}**`,
                `⚔️ Công tổng: **${formatNumber(newCong)}**`,
                `🛡️ Thủ tổng: **${formatNumber(newThu)}**`,

                "",

                `🌱 Tu Vi: **${formatNumber(remainingTuVi)}**`

            ].join("\n"))

            .setFooter({
                text:
                    "🌌 Hồng Hoang Đại Lục • Cửu Đạo Lôi Kiếp • Chỉ số x9"
            });

    await interaction.update({
        embeds: [embed],
        components: []
    });
}

// =====================================================
// ⚡ XỬ LÝ 1 ĐẠO LÔI
// =====================================================

async function processLightning(
    interaction,
    player,
    userId,
    index
) {
    const lightning =
        getLightning(index);

    if (!lightning) {
        return;
    }

    // -----------------------------------------------
    // 🎲 RANDOM
    // -----------------------------------------------

    const roll =
        randomInt(
            1,
            100
        );

    const rate =
        getResistanceRate(
            player,
            index
        );

    // -----------------------------------------------
    // 💥 SÁT THƯƠNG
    // -----------------------------------------------

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
            oldHp -
            damage
        );

    // -----------------------------------------------
    // ❌ KHÔNG CHỊU NỔI
    // -----------------------------------------------

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

    // -----------------------------------------------
    // ❤️ QUA ĐƯỢC
    // -----------------------------------------------

    updatePlayer(
        userId,
        {
            hp: newHp
        }
    );

    // -----------------------------------------------
    // 🌩️ ĐẠO 9
    // -----------------------------------------------

    if (
        index >= 9
    ) {

        const updatedPlayer =
            getPlayer(
                userId
            );

        return completeBreakthrough(
            interaction,
            updatedPlayer,
            userId
        );
    }

    // -----------------------------------------------
    // ⚡ ĐẠO TIẾP
    // -----------------------------------------------

    const updatedPlayer =
        getPlayer(
            userId
        );

    const nextIndex =
        index + 1;

    const embed =
        createLightningEmbed(
            updatedPlayer,
            nextIndex
        );

    const button =
        lightningButton(
            userId,
            nextIndex
        );

    await interaction.update({

        embeds: [embed],

        components: [button]

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
            getPlayer(
                userId
            );

        // -----------------------------------------------
        // 👤 CHƯA CÓ NHÂN VẬT
        // -----------------------------------------------

        if (!player) {

            return interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước.",

                ephemeral:
                    true

            });
        }

        // -----------------------------------------------
        // 🔒 ĐANG ĐỘ KIẾP
        // -----------------------------------------------

        if (
            sessions.has(userId)
        ) {

            return interaction.reply({

                content:
                    "🌩️ **Bạn đang trong quá trình Độ Kiếp!**",

                ephemeral:
                    true

            });
        }

        // -----------------------------------------------
        // 👑 KIỂM TRA TỐI CAO
        // -----------------------------------------------

        const realmIndex =
            getRealmIndex(
                player
            );

        const tier =
            getTier(
                player
            );

        if (
            realmIndex ===
            realms.length - 1 &&
            tier >= 9
        ) {

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(
                            0xf1c40f
                        )

                        .setTitle(
                            "👑 ĐẠI ĐẠO TỐI CAO"
                        )

                        .setDescription([

                            "🌌 Bạn đã đạt",

                            "",

                            "👑 **Đại Đạo tầng 9**",

                            "",

                            "✨ Không còn cảnh giới nào cao hơn."

                        ].join("\n"))

                ],

                ephemeral:
                    true

            });
        }

        // -----------------------------------------------
        // 🗃️ SESSION
        // -----------------------------------------------

        sessions.set(
            userId,
            {
                currentLightning: 0,
                startedAt:
                    Date.now()
            }
        );

        // -----------------------------------------------
        // 📜 GIAO DIỆN
        // -----------------------------------------------

        const message =
            await interaction.reply({

                embeds: [
                    createPrepareEmbed(
                        player
                    )
                ],

                components: [
                    startButton(
                        userId
                    )
                ],

                fetchReply:
                    true

            });

        // -----------------------------------------------
        // 🔘 COLLECTOR
        // -----------------------------------------------

        const collector =
            message.createMessageComponentCollector({

                time:
                    SESSION_TIME

            });

        collector.on(
            "collect",
            async buttonInteraction => {

                // ---------------------------------------
                // 🔐 CHỦ NHÂN
                // ---------------------------------------

                if (
                    buttonInteraction.user.id !==
                    userId
                ) {

                    return buttonInteraction.reply({

                        content:
                            "🚫 Đây không phải Lôi Kiếp của bạn!",

                        ephemeral:
                            true

                    });
                }

                // ---------------------------------------
                // ⚡ BẮT ĐẦU
                // ---------------------------------------

                if (
                    buttonInteraction.customId ===
                    `dotpha_start_${userId}`
                ) {

                    const currentPlayer =
                        getPlayer(
                            userId
                        );

                    if (!currentPlayer) {

                        sessions.delete(
                            userId
                        );

                        collector.stop(
                            "error"
                        );

                        return buttonInteraction.update({

                            content:
                                "❌ Không tìm thấy nhân vật.",

                            embeds: [],

                            components: []

                        });
                    }

                    const embed =
                        createLightningEmbed(
                            currentPlayer,
                            1
                        );

                    const button =
                        lightningButton(
                            userId,
                            1
                        );

                    return buttonInteraction.update({

                        embeds: [embed],

                        components: [button]

                    });
                }

                // ---------------------------------------
                // 🛑 HỦY
                // ---------------------------------------

                if (
                    buttonInteraction.customId ===
                    `dotpha_cancel_${userId}`
                ) {

                    sessions.delete(
                        userId
                    );

                    collector.stop(
                        "cancel"
                    );

                    return buttonInteraction.update({

                        content:
                            "🛑 **Đã hủy Độ Kiếp.**\n🌩️ Thiên kiếp tạm thời tan biến.",

                        embeds: [],

                        components: []

                    });
                }

                // ---------------------------------------
                // 🌩️ CHỊU LÔI
                // ---------------------------------------

                if (
                    buttonInteraction.customId.startsWith(
                        `dotpha_lightning_${userId}_`
                    )
                ) {

                    const parts =
                        buttonInteraction.customId.split(
                            "_"
                        );

                    const index =
                        Number(
                            parts[
                                parts.length - 1
                            ]
                        );

                    const session =
                        sessions.get(
                            userId
                        );

                    if (!session) {

                        return buttonInteraction.reply({

                            content:
                                "⏰ Phiên Độ Kiếp đã hết hạn.",

                            ephemeral:
                                true

                        });
                    }

                    // -----------------------------------
                    // ⏳ KIỂM TRA THỜI GIAN
                    // -----------------------------------

                    if (
                        Date.now() -
                        session.startedAt >
                        SESSION_TIME
                    ) {

                        sessions.delete(
                            userId
                        );

                        collector.stop(
                            "timeout"
                        );

                        return buttonInteraction.update({

                            content:
                                "⏰ **Độ Kiếp đã hết thời gian!**",

                            embeds: [],

                            components: []

                        });
                    }

                    const currentPlayer =
                        getPlayer(
                            userId
                        );

                    if (!currentPlayer) {

                        sessions.delete(
                            userId
                        );

                        collector.stop(
                            "error"
                        );

                        return buttonInteraction.reply({

                            content:
                                "❌ Không tìm thấy nhân vật.",

                            ephemeral:
                                true

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
                            !sessions.has(
                                userId
                            )
                        ) {

                            collector.stop(
                                "finished"
                            );
                        }

                    } catch (error) {

                        console.error(
                            "❌ Lỗi Độ Kiếp:",
                            error
                        );

                        sessions.delete(
                            userId
                        );

                        collector.stop(
                            "error"
                        );

                        try {

                            if (
                                !buttonInteraction.replied &&
                                !buttonInteraction.deferred
                            ) {

                                await buttonInteraction.reply({

                                    content:
                                        "❌ Độ Kiếp xảy ra lỗi. Hãy thử lại.",

                                    ephemeral:
                                        true

                                });
                            }

                        } catch (e) {

                            console.error(
                                "❌ Không thể gửi lỗi:",
                                e
                            );
                        }
                    }
                }
            }
        );

        // -----------------------------------------------
        // ⏰ TIMEOUT
        // -----------------------------------------------

        collector.on(
            "end",
            async (
                collected,
                reason
            ) => {

                sessions.delete(
                    userId
                );

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

    // Cho phép file khác sử dụng nếu cần.
    realms,
    LOI_KIEP,
    sessions
};
