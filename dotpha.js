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
// ⚡ HỆ THỐNG ĐỘ KIẾP HỒNG HOANG
// =====================================================
//
// CƠ CHẾ MỚI:
//
// ❌ Không yêu cầu đạt mốc Tu Vi
// ❌ Không yêu cầu đan dược
// ❌ Không yêu cầu vật phẩm
//
// ✅ Muốn đột phá phải vượt qua 9 đạo Lôi Kiếp
// ✅ Vượt đủ 9/9 → đột phá thành công
// 💥 Thất bại bất kỳ đạo nào → đột phá thất bại
// 📉 Thất bại bị trừ 1.000 - 10.000 Tu Vi
//
// =====================================================


// =====================================================
// ⏳ COOLDOWN
// =====================================================

const dotPhaCooldown =
    new Map();

const DOTPHA_COOLDOWN =
    20_000;

const CONFIRM_TIMEOUT =
    30_000;


// =====================================================
// ⚡ CẤU HÌNH 9 ĐẠO LÔI KIẾP
// =====================================================

const LOI_KIEP = [

    {
        index: 1,
        name: "Đệ Nhất Lôi Kiếp",
        emoji: "⚡",
        title: "Thiên Lôi Tôi Thể",
        baseRate: 92
    },

    {
        index: 2,
        name: "Đệ Nhị Lôi Kiếp",
        emoji: "🌩️",
        title: "Tử Tiêu Thiên Lôi",
        baseRate: 86
    },

    {
        index: 3,
        name: "Đệ Tam Lôi Kiếp",
        emoji: "⚡",
        title: "Huyền Thiên Lôi Phạt",
        baseRate: 80
    },

    {
        index: 4,
        name: "Đệ Tứ Lôi Kiếp",
        emoji: "🌩️",
        title: "Diệt Hồn Thiên Lôi",
        baseRate: 74
    },

    {
        index: 5,
        name: "Đệ Ngũ Lôi Kiếp",
        emoji: "⚡",
        title: "Ngũ Hành Diệt Thế Lôi",
        baseRate: 68
    },

    {
        index: 6,
        name: "Đệ Lục Lôi Kiếp",
        emoji: "🌩️",
        title: "Cửu U Ma Lôi",
        baseRate: 62
    },

    {
        index: 7,
        name: "Đệ Thất Lôi Kiếp",
        emoji: "⚡",
        title: "Hỗn Độn Thần Lôi",
        baseRate: 56
    },

    {
        index: 8,
        name: "Đệ Bát Lôi Kiếp",
        emoji: "🌩️",
        title: "Hồng Mông Tử Lôi",
        baseRate: 50
    },

    {
        index: 9,
        name: "Đệ Cửu Lôi Kiếp",
        emoji: "🌌",
        title: "Đại Đạo Thiên Phạt",
        baseRate: 44
    }
];


// =====================================================
// 🌌 12 CẢNH GIỚI
// =====================================================
//
// Mỗi cảnh giới có 12 tầng:
//
// 1 - 3   : Sơ Kỳ
// 4 - 6   : Trung Kỳ
// 7 - 9   : Hậu Kỳ
// 10 - 12: Viên Mãn
//
// =====================================================

const realms = [

    {
        name: "Phàm Nhân",
        max: 12,

        stats: {
            hp: 100,
            cong: 20,
            thu: 15
        }
    },

    {
        name: "Luyện Khí",
        max: 12,

        stats: {
            hp: 300,
            cong: 60,
            thu: 40
        }
    },

    {
        name: "Trúc Cơ",
        max: 12,

        stats: {
            hp: 1000,
            cong: 200,
            thu: 140
        }
    },

    {
        name: "Kim Đan",
        max: 12,

        stats: {
            hp: 3000,
            cong: 600,
            thu: 400
        }
    },

    {
        name: "Nguyên Anh",
        max: 12,

        stats: {
            hp: 10000,
            cong: 2000,
            thu: 1400
        }
    },

    {
        name: "Hóa Thần",
        max: 12,

        stats: {
            hp: 30000,
            cong: 6000,
            thu: 4000
        }
    },

    {
        name: "Luyện Hư",
        max: 12,

        stats: {
            hp: 100000,
            cong: 20000,
            thu: 14000
        }
    },

    {
        name: "Hợp Thể",
        max: 12,

        stats: {
            hp: 300000,
            cong: 60000,
            thu: 40000
        }
    },

    {
        name: "Đại Thừa",
        max: 12,

        stats: {
            hp: 1000000,
            cong: 200000,
            thu: 140000
        }
    },

    {
        name: "Độ Kiếp",
        max: 12,

        stats: {
            hp: 3000000,
            cong: 600000,
            thu: 400000
        }
    },

    {
        name: "Tán Tiên",
        max: 12,

        stats: {
            hp: 10000000,
            cong: 2000000,
            thu: 1400000
        }
    },

    {
        name: "Chân Tiên",
        max: 12,

        stats: {
            hp: 30000000,
            cong: 6000000,
            thu: 4000000
        }
    }
];


// =====================================================
// 🌱 GIAI ĐOẠN CẢNH GIỚI
// =====================================================

function getStage(tier) {

    tier =
        Number(tier || 1);

    if (tier <= 3) {
        return "Sơ Kỳ";
    }

    if (tier <= 6) {
        return "Trung Kỳ";
    }

    if (tier <= 9) {
        return "Hậu Kỳ";
    }

    return "Viên Mãn";
}


// =====================================================
// ⚡ LẤY TỶ LỆ LÔI KIẾP
// =====================================================
//
// Cảnh giới càng cao → Lôi Kiếp càng mạnh.
//
// Mỗi cảnh giới cao hơn sẽ giảm tỷ lệ một chút.
// Tuy nhiên không để tỷ lệ xuống dưới 10%.
//
// =====================================================

function getLightningRate(
    realmIndex,
    lightningIndex
) {

    const lightning =
        LOI_KIEP[
            lightningIndex - 1
        ];

    if (!lightning) {
        return 10;
    }

    // Mỗi cảnh giới cao hơn khó hơn
    const realmPenalty =
        realmIndex * 2;

    // Mỗi tầng cao hơn khó hơn một chút
    const tierPenalty =
        Math.max(
            0,
            lightningIndex - 1
        ) * 1;

    const rate =
        lightning.baseRate -
        realmPenalty -
        tierPenalty;

    return Math.max(
        10,
        Math.min(
            95,
            rate
        )
    );
}


// =====================================================
// 🎲 RANDOM
// =====================================================

function randomPercent() {

    return (
        Math.floor(
            Math.random() * 100
        ) + 1
    );
}


// =====================================================
// 📉 TÍNH TU VI PHẢN PHỆ
// =====================================================

function calculateLostTuVi(
    currentTuVi
) {

    // Luôn random 1.000 → 10.000
    const damage =
        Math.floor(
            Math.random() *
            9001
        ) + 1000;

    return Math.min(
        Math.max(
            0,
            Number(
                currentTuVi || 0
            )
        ),
        damage
    );
}


// =====================================================
// 🌩️ THANH TIẾN TRÌNH 9 ĐẠO
// =====================================================

function createLightningProgress(
    current
) {

    let result = "";

    for (
        let i = 1;
        i <= 9;
        i++
    ) {

        if (
            i < current
        ) {

            result +=
                "⚡ ";

        } else if (
            i === current
        ) {

            result +=
                "🌩️ ";

        } else {

            result +=
                "▫️ ";
        }
    }

    return result.trim();
}


// =====================================================
// 📜 TẠO MÔ TẢ LÔI KIẾP
// =====================================================

function createLightningDescription(
    realm,
    stage,
    tier,
    lightningIndex,
    rate
) {

    const lightning =
        LOI_KIEP[
            lightningIndex - 1
        ];

    return [

        `🌌 **${realm.name} ${stage} tầng ${tier}**`,

        "",

        `${lightning.emoji} **${lightning.name}**`,
        `☁️ ${lightning.title}`,

        "",

        createLightningProgress(
            lightningIndex
        ),

        "",

        `🛡️ Khả năng chống chịu: **${rate}%**`,

        "",

        "⚔️ Chống chịu được thiên lôi",
        "💥 Thất bại sẽ chịu phản phệ",
        "✨ Vượt qua để tiến tới đạo tiếp theo"

    ].join("\n");
}


// =====================================================
// 📊 TẠO EMBED THÔNG TIN ĐỘ KIẾP
// =====================================================

function createLightningEmbed(
    realm,
    stage,
    tier,
    lightningIndex,
    rate,
    currentTuVi
) {

    const lightning =
        LOI_KIEP[
            lightningIndex - 1
        ];

    return new EmbedBuilder()

        .setColor(
            0x5865f2
        )

        .setTitle(
            `${lightning.emoji} ${lightning.name}`
        )

        .setDescription(
            createLightningDescription(
                realm,
                stage,
                tier,
                lightningIndex,
                rate
            )
        )

        .addFields(

            {
                name:
                    "⚡ Lôi Kiếp",

                value:
                    `**${lightningIndex}/9**`,

                inline:
                    true
            },

            {
                name:
                    "🛡️ Tỷ lệ chống chịu",

                value:
                    `**${rate}%**`,

                inline:
                    true
            },

            {
                name:
                    "⚔️ Tu Vi",

                value:
                    `**${Number(
                        currentTuVi || 0
                    ).toLocaleString()}**`,

                inline:
                    true
            }

        )

        .setFooter({
            text:
                "🌩️ Vượt qua đủ 9 đạo Lôi Kiếp để đột phá!"
        });
}


// =====================================================
// 🔄 TÌM CẢNH GIỚI
// =====================================================

function getRealmIndex(
    player
) {

    const name =
        String(
            player.canhGioi ||
            ""
        ).trim();

    const index =
        realms.findIndex(
            realm =>
                realm.name === name
        );

    if (
        index !== -1
    ) {

        return index;
    }

    // Dữ liệu cũ không hợp lệ
    return 0;
}


// =====================================================
// 🌱 LẤY TẦNG
// =====================================================

function getCurrentTier(
    player
) {

    const tier =
        Number(
            player.tang || 1
        );

    return Math.max(
        1,
        Math.min(
            12,
            tier
        )
    );
}


// =====================================================
// 💎 LẤY TU VI
// =====================================================

function getCurrentTuVi(
    player
) {

    return Math.max(
        0,
        Number(
            player.tuvi || 0
        )
    );
}
// =====================================================
// 🌌 XÁC ĐỊNH CẢNH GIỚI TIẾP THEO
// =====================================================

function getNextRealm(
    realmIndex,
    tier
) {

    realmIndex =
        Number(realmIndex || 0);

    tier =
        Number(tier || 1);


    // =============================================
    // ⚡ TẦNG 1 → 11
    // =============================================

    if (
        tier < 12
    ) {

        return {

            realmIndex,

            tier:
                tier + 1,

            isMax:
                false
        };
    }


    // =============================================
    // 🌌 TẦNG 12 → CẢNH GIỚI MỚI
    // =============================================

    if (
        realmIndex <
        realms.length - 1
    ) {

        return {

            realmIndex:
                realmIndex + 1,

            tier:
                1,

            isMax:
                false
        };
    }


    // =============================================
    // 🌠 ĐÃ ĐẾN CẢNH GIỚI CUỐI
    // =============================================

    return {

        realmIndex,

        tier: 12,

        isMax:
            true
    };
}


// =====================================================
// 📈 TÍNH BONUS KHI ĐỘT PHÁ
// =====================================================

function calculateBreakthroughStats(
    oldRealmIndex,
    newRealmIndex,
    oldTier,
    newTier
) {

    const oldRealm =
        realms[
            oldRealmIndex
        ];

    const newRealm =
        realms[
            newRealmIndex
        ];


    if (!newRealm) {

        return {

            hp: 0,
            cong: 0,
            thu: 0
        };
    }


    // =============================================
    // 🌱 TĂNG THEO TẦNG
    // =============================================

    let multiplier =
        1;


    if (
        newRealmIndex >
        oldRealmIndex
    ) {

        // Sang cảnh giới mới
        multiplier =
            1.5;

    } else {

        // Đột phá tầng
        multiplier =
            1.15;
    }


    // =============================================
    // ⚔️ BONUS
    // =============================================

    const hp =
        Math.floor(
            Number(
                newRealm.stats.hp
            ) *
            multiplier
        );


    const cong =
        Math.floor(
            Number(
                newRealm.stats.cong
            ) *
            multiplier
        );


    const thu =
        Math.floor(
            Number(
                newRealm.stats.thu
            ) *
            multiplier
        );


    return {

        hp,
        cong,
        thu
    };
}


// =====================================================
// ✨ ÁP DỤNG CHỈ SỐ ĐỘT PHÁ
// =====================================================

function applyBreakthroughStats(
    player,
    oldRealmIndex,
    newRealmIndex,
    oldTier,
    newTier
) {

    const bonus =
        calculateBreakthroughStats(
            oldRealmIndex,
            newRealmIndex,
            oldTier,
            newTier
        );


    // =============================================
    // ❤️ HP
    // =============================================

    player.hp =
        Number(
            player.hp || 0
        ) +
        bonus.hp;


    player.maxHp =
        Number(
            player.maxHp ||
            player.hp
        ) +
        bonus.hp;


    // =============================================
    // ⚔️ CÔNG
    // =============================================

    player.cong =
        Number(
            player.cong || 0
        ) +
        bonus.cong;


    player.attack =
        Number(
            player.attack || 0
        ) +
        bonus.cong;


    // =============================================
    // 🛡️ THỦ
    // =============================================

    player.thu =
        Number(
            player.thu || 0
        ) +
        bonus.thu;


    player.defense =
        Number(
            player.defense || 0
        ) +
        bonus.thu;


    return bonus;
}


// =====================================================
// 🌟 CẬP NHẬT CẢNH GIỚI
// =====================================================

function applyNewRealm(
    player,
    realmIndex,
    tier
) {

    const realm =
        realms[
            realmIndex
        ];


    if (!realm) {

        return false;
    }


    player.canhGioi =
        realm.name;


    player.realm =
        realm.name;


    player.realmIndex =
        realmIndex;


    player.canhGioiIndex =
        realmIndex;


    player.tang =
        tier;


    player.tangGioi =
        tier;


    return true;
}


// =====================================================
// 🌩️ TẠO EMBED THÀNH CÔNG
// =====================================================

function createSuccessEmbed(
    oldRealm,
    oldTier,
    newRealm,
    newTier,
    bonus,
    tuVi
) {

    const crossedRealm =
        oldRealm !==
        newRealm;


    const title =
        crossedRealm

            ? "🌌 ĐỘT PHÁ CẢNH GIỚI THÀNH CÔNG!"

            : "✨ ĐỘT PHÁ TẦNG THÀNH CÔNG!";


    return new EmbedBuilder()

        .setColor(
            0x57f287
        )

        .setTitle(
            title
        )

        .setDescription([

            "╔══════════════════════╗",

            "      ⚡ **CỬU KIẾP ĐÃ VƯỢT**",

            "╚══════════════════════╝",

            "",

            "🌩️ **9/9 Đạo Lôi Kiếp đã bị chinh phục!**",

            "",

            `🌱 **${oldRealm}** • Tầng **${oldTier}**`,

            "⬇️",

            `🌌 **${newRealm}** • Tầng **${newTier}**`,

            "",

            "━━━━━━━━━━━━━━━━━━━━",

            "💪 **Thể chất được cường hóa**",

            `❤️ HP: **+${bonus.hp.toLocaleString()}**`,

            `⚔️ Công: **+${bonus.cong.toLocaleString()}**`,

            `🛡️ Thủ: **+${bonus.thu.toLocaleString()}**`,

            "",

            `✨ Tu Vi hiện tại: **${Number(
                tuVi
            ).toLocaleString()}**`

        ].join("\n"))

        .setFooter({

            text:
                "🌌 Đại Đạo vô tận — con đường phía trước vẫn còn rất dài!"
        });
}


// =====================================================
// 💥 TẠO EMBED THẤT BẠI
// =====================================================

function createFailureEmbed(
    realm,
    tier,
    lightningIndex,
    lostTuVi,
    remainingTuVi
) {

    const lightning =
        LOI_KIEP[
            lightningIndex - 1
        ];


    return new EmbedBuilder()

        .setColor(
            0xed4245
        )

        .setTitle(
            "💥 LÔI KIẾP THẤT BẠI!"
        )

        .setDescription([

            "╔══════════════════════╗",

            "       ⚡ **ĐỘ KIẾP THẤT BẠI**",

            "╚══════════════════════╝",

            "",

            `${lightning?.emoji || "⚡"} **${lightning?.name || `Đạo ${lightningIndex}`}** đã đánh tan hộ thể!`,

            "",

            `🌌 Cảnh giới: **${realm.name}**`,

            `🌱 Tầng: **${tier}**`,

            `⚡ Thất bại tại: **${lightningIndex}/9**`,

            "",

            "━━━━━━━━━━━━━━━━━━━━",

            `💔 Tu Vi phản phệ: **-${lostTuVi.toLocaleString()}**`,

            `📉 Tu Vi còn lại: **${remainingTuVi.toLocaleString()}**`,

            "",

            "❌ Không thể đột phá cảnh giới.",

            "🛡️ Hãy tu luyện thêm rồi thử lại!"

        ].join("\n"))

        .setFooter({

            text:
                "🌩️ Thiên kiếp chưa qua — đạo tâm cần được tôi luyện thêm."
        });
}


// =====================================================
// ⚠️ TẠO EMBED CẢNH BÁO
// =====================================================

function createWarningEmbed(
    realm,
    tier
) {

    return new EmbedBuilder()

        .setColor(
            0xfee75c
        )

        .setTitle(
            "🌩️ CHUẨN BỊ ĐỘ KIẾP"
        )

        .setDescription([

            `🌌 Cảnh giới hiện tại: **${realm.name}**`,

            `🌱 Tầng: **${tier}**`,

            "",

            "⚡ Ngươi sắp phải đối mặt với **9 đạo Lôi Kiếp**.",

            "",

            "🛡️ Vượt qua toàn bộ → **Đột phá thành công**",

            "💥 Thất bại → **Mất 1.000–10.000 Tu Vi**",

            "",

            "⚠️ Một khi bắt đầu, thiên kiếp sẽ không dừng lại!"

        ].join("\n"))

        .setFooter({

            text:
                "⏳ Xác nhận trong 30 giây."
        });
}


// =====================================================
// 🔘 NÚT XÁC NHẬN ĐỘ KIẾP
// =====================================================

function createConfirmButtons(
    userId
) {

    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `dotpha_confirm_${userId}`
                )

                .setLabel(
                    "⚡ Bắt đầu Độ Kiếp"
                )

                .setEmoji(
                    "🌩️"
                )

                .setStyle(
                    ButtonStyle.Danger
                ),


            new ButtonBuilder()

                .setCustomId(
                    `dotpha_cancel_${userId}`
                )

                .setLabel(
                    "🛑 Hủy"
                )

                .setStyle(
                    ButtonStyle.Secondary
                )

        );
}


// =====================================================
// ⚡ TẠO EMBED ĐẠO LÔI KIẾP
// =====================================================

function createActiveLightningEmbed(
    player,
    realm,
    tier,
    lightningIndex
) {

    const rate =
        getLightningRate(
            getRealmIndex(
                player
            ),
            lightningIndex
        );


    return createLightningEmbed(

        realm,

        getStage(
            tier
        ),

        tier,

        lightningIndex,

        rate,

        getCurrentTuVi(
            player
        )

    );
}


// =====================================================
// 🌩️ CHUẨN BỊ LƯỢT ĐỘ KIẾP
// =====================================================

function createLightningSession(
    userId,
    player,
    realmIndex,
    tier
) {

    return {

        userId,

        realmIndex,

        tier,

        lightningIndex:
            1,

        passed:
            0,

        failed:
            false,

        startedAt:
            Date.now(),

        originalTuVi:
            getCurrentTuVi(
                player
            )
    };
}


// =====================================================
// 🗃️ SESSION ĐỘ KIẾP
// =====================================================

const lightningSessions =
    new Map();


// =====================================================
// 🔐 KIỂM TRA SESSION
// =====================================================

function getLightningSession(
    userId
) {

    return lightningSessions.get(
        userId
    );
}


// =====================================================
// 🧹 XÓA SESSION
// =====================================================

function deleteLightningSession(
    userId
) {

    lightningSessions.delete(
        userId
    );
}
// =====================================================
// ⚡ XỬ LÝ 1 ĐẠO LÔI KIẾP
// =====================================================

async function processLightningStrike(
    interaction,
    session
) {

    const player =
        getPlayer(
            session.userId
        );

    if (!player) {

        deleteLightningSession(
            session.userId
        );

        return;
    }


    const realmIndex =
        getRealmIndex(
            player
        );

    const tier =
        getCurrentTier(
            player
        );

    const realm =
        realms[
            realmIndex
        ];


    // =================================================
    // 🛡️ KIỂM TRA ĐÃ ĐỦ 9 ĐẠO
    // =================================================

    if (
        session.lightningIndex >
        9
    ) {

        return finishBreakthrough(
            interaction,
            session
        );
    }


    // =================================================
    // ⚡ LẤY TỶ LỆ
    // =================================================

    const rate =
        getLightningRate(
            realmIndex,
            session.lightningIndex
        );


    // =================================================
    // 🎲 THỬ THÁCH LÔI KIẾP
    // =================================================

    const roll =
        randomPercent();


    const success =
        roll <= rate;


    // =================================================
    // 💥 THẤT BẠI
    // =================================================

    if (!success) {

        const currentTuVi =
            getCurrentTuVi(
                player
            );


        const lostTuVi =
            calculateLostTuVi(
                currentTuVi
            );


        const remainingTuVi =
            Math.max(
                0,
                currentTuVi -
                lostTuVi
            );


        // ---------------------------------------------
        // 📉 TRỪ TU VI
        // ---------------------------------------------

        player.tuvi =
            remainingTuVi;


        // Một số database cũ có thể dùng tuVi
        if (
            Object.prototype.hasOwnProperty.call(
                player,
                "tuVi"
            )
        ) {

            player.tuVi =
                remainingTuVi;
        }


        updatePlayer(
            session.userId,
            player
        );


        // ---------------------------------------------
        // 💥 EMBED THẤT BẠI
        // ---------------------------------------------

        const failureEmbed =
            createFailureEmbed(
                realm,
                tier,
                session.lightningIndex,
                lostTuVi,
                remainingTuVi
            );


        deleteLightningSession(
            session.userId
        );


        dotPhaCooldown.set(
            session.userId,
            Date.now()
        );


        try {

            await interaction.update({

                embeds: [
                    failureEmbed
                ],

                components: []
            });

        } catch (
            error
        ) {

            console.error(
                "❌ Lỗi gửi thất bại Lôi Kiếp:",
                error
            );
        }


        return;
    }


    // =================================================
    // ✨ VƯỢT QUA ĐẠO LÔI KIẾP
    // =================================================

    session.passed++;

    session.lightningIndex++;


    // =================================================
    // 🌩️ ĐÃ VƯỢT 9/9
    // =================================================

    if (
        session.passed >= 9
    ) {

        return finishBreakthrough(
            interaction,
            session
        );
    }


    // =================================================
    // ⚡ CHUYỂN SANG ĐẠO TIẾP THEO
    // =================================================

    const nextIndex =
        session.lightningIndex;


    const nextRate =
        getLightningRate(
            realmIndex,
            nextIndex
        );


    const nextEmbed =
        createLightningEmbed(

            realm,

            getStage(
                tier
            ),

            tier,

            nextIndex,

            nextRate,

            getCurrentTuVi(
                player
            )
        );


    const nextButton =
        createLightningButton(
            session.userId,
            nextIndex
        );


    try {

        await interaction.update({

            embeds: [
                nextEmbed
            ],

            components: [
                nextButton
            ]
        });

    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi chuyển đạo Lôi Kiếp:",
            error
        );

        deleteLightningSession(
            session.userId
        );
    }
}


// =====================================================
// 🔘 NÚT CHỊU LÔI KIẾP
// =====================================================

function createLightningButton(
    userId,
    lightningIndex
) {

    const lightning =
        LOI_KIEP[
            lightningIndex - 1
        ];


    return new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()

                .setCustomId(
                    `dotpha_strike_${userId}_${lightningIndex}`
                )

                .setLabel(
                    `Chịu ${lightningIndex}/9`
                )

                .setEmoji(
                    lightning?.emoji ||
                    "⚡"
                )

                .setStyle(
                    ButtonStyle.Danger
                )

        );
}


// =====================================================
// 🌌 HOÀN THÀNH 9 ĐẠO
// =====================================================

async function finishBreakthrough(
    interaction,
    session
) {

    const player =
        getPlayer(
            session.userId
        );


    if (!player) {

        deleteLightningSession(
            session.userId
        );

        return;
    }


    const oldRealmIndex =
        getRealmIndex(
            player
        );


    const oldTier =
        getCurrentTier(
            player
        );


    const oldRealm =
        realms[
            oldRealmIndex
        ];


    // =================================================
    // 🏆 TÌM CẢNH GIỚI TIẾP THEO
    // =================================================

    const next =
        getNextRealm(
            oldRealmIndex,
            oldTier
        );


    // =================================================
    // 🌠 ĐÃ MAX CẢNH GIỚI
    // =================================================

    if (
        next.isMax
    ) {

        deleteLightningSession(
            session.userId
        );


        const maxEmbed =
            new EmbedBuilder()

                .setColor(
                    0xf1c40f
                )

                .setTitle(
                    "🌌 ĐẠI ĐẠO ĐÃ ĐẾN ĐỈNH!"
                )

                .setDescription([

                    "⚡ Ngươi đã vượt qua **9/9 đạo Lôi Kiếp**!",

                    "",

                    `🌌 Cảnh giới: **${oldRealm.name}**`,

                    `🌱 Tầng: **${oldTier}**`,

                    "",

                    "👑 Ngươi đã đạt cảnh giới tối cao của hệ thống.",

                    "✨ Không thể tiếp tục đột phá."

                ].join("\n"))

                .setFooter({

                    text:
                        "🌠 Con đường Đại Đạo đã đi tới cực hạn."
                });


        try {

            await interaction.update({

                embeds: [
                    maxEmbed
                ],

                components: []
            });

        } catch (
            error
        ) {

            console.error(
                "❌ Lỗi max cảnh giới:",
                error
            );
        }


        return;
    }


    // =================================================
    // ✨ TÍNH CHỈ SỐ
    // =================================================

    const bonus =
        calculateBreakthroughStats(

            oldRealmIndex,

            next.realmIndex,

            oldTier,

            next.tier

        );


    // =================================================
    // 🌌 CẬP NHẬT CẢNH GIỚI
    // =================================================

    applyNewRealm(

        player,

        next.realmIndex,

        next.tier

    );


    // =================================================
    // 💪 CỘNG CHỈ SỐ
    // =================================================

    applyBreakthroughStats(

        player,

        oldRealmIndex,

        next.realmIndex,

        oldTier,

        next.tier

    );


    // =================================================
    // 💾 LƯU
    // =================================================

    updatePlayer(

        session.userId,

        player

    );


    // =================================================
    // 🎉 EMBED THÀNH CÔNG
    // =================================================

    const successEmbed =
        createSuccessEmbed(

            oldRealm.name,

            oldTier,

            realms[
                next.realmIndex
            ].name,

            next.tier,

            bonus,

            getCurrentTuVi(
                player
            )

        );


    // =================================================
    // 🧹 XÓA SESSION
    // =================================================

    deleteLightningSession(
        session.userId
    );


    dotPhaCooldown.set(
        session.userId,
        Date.now()
    );


    try {

        await interaction.update({

            embeds: [
                successEmbed
            ],

            components: []
        });

    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi gửi đột phá thành công:",
            error
        );
    }
}


// =====================================================
// 🛡️ KIỂM TRA COOLDOWN
// =====================================================

function getRemainingCooldown(
    userId
) {

    const last =
        dotPhaCooldown.get(
            userId
        );


    if (!last) {

        return 0;
    }


    const elapsed =
        Date.now() -
        last;


    const remaining =
        DOTPHA_COOLDOWN -
        elapsed;


    if (
        remaining <= 0
    ) {

        dotPhaCooldown.delete(
            userId
        );

        return 0;
    }


    return remaining;
}


// =====================================================
// ⚡ BẮT ĐẦU ĐỘ KIẾP
// =====================================================

async function startLightningTribulation(
    interaction
) {

    const userId =
        interaction.user.id;


    const player =
        getPlayer(
            userId
        );


    if (!player) {

        return interaction.reply({

            content:
                "❌ **Bạn chưa có nhân vật!**\n🌱 Hãy dùng `/batdau` trước.",

            ephemeral:
                true
        });
    }


    // =================================================
    // ⏳ COOLDOWN
    // =================================================

    const remaining =
        getRemainingCooldown(
            userId
        );


    if (
        remaining > 0
    ) {

        const seconds =
            Math.ceil(
                remaining / 1000
            );


        return interaction.reply({

            content: [
                "⏳ **ĐẠO HỮU ĐANG HỒI PHỤC**",
                "",
                `⚡ Hãy chờ **${seconds} giây** rồi mới độ kiếp tiếp.`,
                "",
                "🌩️ Thiên kiếp không thể cưỡng cầu!"
            ].join("\n"),

            ephemeral:
                true
        });
    }


    // =================================================
    // 🔒 ĐANG ĐỘ KIẾP
    // =================================================

    if (
        getLightningSession(
            userId
        )
    ) {

        return interaction.reply({

            content:
                "🌩️ **Bạn đang trong Lôi Kiếp!**\n⚡ Hãy hoàn thành 9 đạo trước.",

            ephemeral:
                true
        });
    }


    // =================================================
    // 🌌 LẤY CẢNH GIỚI
    // =================================================

    const realmIndex =
        getRealmIndex(
            player
        );


    const tier =
        getCurrentTier(
            player
        );


    const realm =
        realms[
            realmIndex
        ];


    // =================================================
    // ⚠️ CẢNH BÁO
    // =================================================

    const warning =
        createWarningEmbed(
            realm,
            tier
        );


    const buttons =
        createConfirmButtons(
            userId
        );


    return interaction.reply({

        embeds: [
            warning
        ],

        components: [
            buttons
        ],

        ephemeral:
            false
    });
}


// =====================================================
// ⚡ XÁC NHẬN BẮT ĐẦU
// =====================================================

async function confirmLightning(
    interaction
) {

    const userId =
        interaction.user.id;


    // =================================================
    // 🌌 LẤY PLAYER
    // =================================================

    const player =
        getPlayer(
            userId
        );


    if (!player) {

        return interaction.update({

            content:
                "❌ Không tìm thấy nhân vật.",

            embeds: [],

            components: []
        });
    }


    // =================================================
    // 🔒 KIỂM TRA SESSION
    // =================================================

    if (
        getLightningSession(
            userId
        )
    ) {

        return interaction.update({

            content:
                "🌩️ Bạn đang có một Lôi Kiếp khác.",

            embeds: [],

            components: []
        });
    }


    // =================================================
    // 🌌 LẤY CẢNH GIỚI
    // =================================================

    const realmIndex =
        getRealmIndex(
            player
        );


    const tier =
        getCurrentTier(
            player
        );


    const realm =
        realms[
            realmIndex
        ];


    // =================================================
    // 🗃️ TẠO SESSION
    // =================================================

    const session =
        createLightningSession(

            userId,

            player,

            realmIndex,

            tier

        );


    lightningSessions.set(
        userId,
        session
    );


    // =================================================
    // ⚡ ĐẠO 1
    // =================================================

    const rate =
        getLightningRate(
            realmIndex,
            1
        );


    const embed =
        createLightningEmbed(

            realm,

            getStage(
                tier
            ),

            tier,

            1,

            rate,

            getCurrentTuVi(
                player
            )

        );


    const button =
        createLightningButton(
            userId,
            1
        );


    try {

        await interaction.update({

            embeds: [
                embed
            ],

            components: [
                button
            ]
        });

    } catch (
        error
    ) {

        deleteLightningSession(
            userId
        );

        console.error(
            "❌ Lỗi bắt đầu Lôi Kiếp:",
            error
        );
    }
}


// =====================================================
// 🛑 HỦY ĐỘ KIẾP
// =====================================================

async function cancelLightning(
    interaction
) {

    const userId =
        interaction.user.id;


    deleteLightningSession(
        userId
    );


    try {

        await interaction.update({

            content: [
                "🛑 **ĐÃ HỦY ĐỘ KIẾP**",
                "",
                "🌩️ Thiên Lôi tạm thời tan biến.",
                "🌱 Khi chuẩn bị đầy đủ, hãy quay lại thử sức."
            ].join("\n"),

            embeds: [],

            components: []
        });

    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi hủy Độ Kiếp:",
            error
        );
    }
}


// =====================================================
// 🧹 TỰ ĐỘNG XÓA SESSION HẾT HẠN
// =====================================================

function cleanupExpiredSessions() {

    const now =
        Date.now();


    for (
        const [
            userId,
            session
        ]
        of lightningSessions.entries()
    ) {

        if (
            now -
            session.startedAt >
            CONFIRM_TIMEOUT * 10
        ) {

            lightningSessions.delete(
                userId
            );
        }
    }
}


setInterval(
    cleanupExpiredSessions,
    10_000
);
// =====================================================
// ⚡ SLASH COMMAND /DOTPHA
// =====================================================

const data =
    new SlashCommandBuilder()

        .setName("dotpha")

        .setDescription(
            "🌩️ Độ kiếp bằng cách vượt qua 9 đạo Lôi Kiếp để đột phá."
        );


// =====================================================
// ⚡ EXECUTE /DOTPHA
// =====================================================

async function execute(
    interaction
) {

    try {

        await startLightningTribulation(
            interaction
        );

    } catch (
        error
    ) {

        console.error(
            "❌ Lỗi /dotpha:",
            error
        );


        const message =
            "❌ **Đã xảy ra lỗi khi bắt đầu Độ Kiếp.**";


        try {

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp({

                    content:
                        message,

                    ephemeral:
                        true
                });

            } else {

                await interaction.reply({

                    content:
                        message,

                    ephemeral:
                        true
                });
            }

        } catch (
            replyError
        ) {

            console.error(
                "❌ Không thể gửi thông báo lỗi:",
                replyError
            );
        }
    }
}


// =====================================================
// 🔘 XỬ LÝ BUTTON
// =====================================================

async function handleButton(
    interaction
) {

    if (
        !interaction.isButton()
    ) {

        return false;
    }


    const customId =
        interaction.customId;


    // =================================================
    // ⚡ XÁC NHẬN ĐỘ KIẾP
    // =================================================

    if (
        customId.startsWith(
            "dotpha_confirm_"
        )
    ) {

        const userId =
            customId.replace(
                "dotpha_confirm_",
                ""
            );


        // ---------------------------------------------
        // 🔐 CHỈ CHỦ NHÂN ĐƯỢC BẤM
        // ---------------------------------------------

        if (
            interaction.user.id !==
            userId
        ) {

            await interaction.reply({

                content:
                    "🚫 **Đây không phải Lôi Kiếp của ngươi!**",

                ephemeral:
                    true
            });

            return true;
        }


        await confirmLightning(
            interaction
        );


        return true;
    }


    // =================================================
    // 🛑 HỦY ĐỘ KIẾP
    // =================================================

    if (
        customId.startsWith(
            "dotpha_cancel_"
        )
    ) {

        const userId =
            customId.replace(
                "dotpha_cancel_",
                ""
            );


        if (
            interaction.user.id !==
            userId
        ) {

            await interaction.reply({

                content:
                    "🚫 **Đây không phải Lôi Kiếp của ngươi!**",

                ephemeral:
                    true
            });

            return true;
        }


        await cancelLightning(
            interaction
        );


        return true;
    }


    // =================================================
    // ⚡ CHỊU LÔI KIẾP
    // =================================================

    if (
        customId.startsWith(
            "dotpha_strike_"
        )
    ) {

        const parts =
            customId.split("_");


        /*
            dotpha_strike_USERID_INDEX

            Ví dụ:

            dotpha_strike_123456789_5
        */


        const userId =
            parts[2];


        const lightningIndex =
            Number(
                parts[3]
            );


        // ---------------------------------------------
        // 🔐 KIỂM TRA NGƯỜI BẤM
        // ---------------------------------------------

        if (
            interaction.user.id !==
            userId
        ) {

            await interaction.reply({

                content:
                    "🚫 **Đây không phải Lôi Kiếp của ngươi!**",

                ephemeral:
                    true
            });

            return true;
        }


        // ---------------------------------------------
        // 🗃️ LẤY SESSION
        // ---------------------------------------------

        const session =
            getLightningSession(
                userId
            );


        if (!session) {

            await interaction.reply({

                content: [
                    "❌ **Lôi Kiếp đã kết thúc hoặc hết hạn.**",
                    "",
                    "🌩️ Hãy dùng `/dotpha` để bắt đầu lại."
                ].join("\n"),

                ephemeral:
                    true
            });

            return true;
        }


        // ---------------------------------------------
        // 🔢 KIỂM TRA ĐẠO HIỆN TẠI
        // ---------------------------------------------

        if (
            session.lightningIndex !==
            lightningIndex
        ) {

            await interaction.reply({

                content:
                    "⚠️ **Đạo Lôi Kiếp này đã thay đổi!**",

                ephemeral:
                    true
            });

            return true;
        }


        // ---------------------------------------------
        // ⏳ DEFER
        // ---------------------------------------------

        try {

            await interaction.deferUpdate();

        } catch (
            error
        ) {

            console.error(
                "❌ deferUpdate lỗi:",
                error
            );

            return true;
        }


        // ---------------------------------------------
        // ⚡ XỬ LÝ LÔI KIẾP
        // ---------------------------------------------

        await processLightningStrike(

            interaction,

            session

        );


        return true;
    }


    // Không phải button của /dotpha
    return false;
}


// =====================================================
// 🔘 HANDLE INTERACTION
// =====================================================

async function handleInteraction(
    interaction
) {

    if (
        !interaction.isButton()
    ) {

        return false;
    }


    return handleButton(
        interaction
    );
}


// =====================================================
// 📊 THÔNG TIN HỆ THỐNG
// =====================================================

function getLightningInfo() {

    return {

        total:
            LOI_KIEP.length,

        lightning:
            LOI_KIEP.map(
                item => ({
                    index:
                        item.index,

                    name:
                        item.name,

                    title:
                        item.title,

                    baseRate:
                        item.baseRate
                })
            ),

        realms:
            realms.length,

        tiersPerRealm:
            12
    };
}


// =====================================================
// 🔎 LẤY THÔNG TIN 1 ĐẠO
// =====================================================

function getLightning(
    index
) {

    index =
        Number(index);


    return (
        LOI_KIEP[
            index - 1
        ] ||
        null
    );
}


// =====================================================
// 🌌 LẤY THÔNG TIN CẢNH GIỚI
// =====================================================

function getRealm(
    index
) {

    index =
        Number(index);


    return (
        realms[index] ||
        null
    );
}


// =====================================================
// 🧹 DỌN SESSION
// =====================================================

function clearUserSession(
    userId
) {

    if (
        !userId
    ) {

        return false;
    }


    return lightningSessions.delete(
        userId
    );
}


// =====================================================
// 📤 EXPORT
// =====================================================

module.exports = {

    // Slash command
    data,
    execute,


    // Interaction
    handleButton,
    handleInteraction,


    // Hệ thống Lôi Kiếp
    LOI_KIEP,
    realms,


    // Session
    lightningSessions,


    // Functions
    startLightningTribulation,
    confirmLightning,
    cancelLightning,
    processLightningStrike,
    finishBreakthrough,


    // Helpers
    getLightningRate,
    getLightningInfo,
    getLightning,
    getRealm,
    getRealmIndex,
    getCurrentTier,
    getCurrentTuVi,
    getNextRealm,
    getStage,
    calculateLostTuVi,
    calculateBreakthroughStats,
    applyBreakthroughStats,
    applyNewRealm,
    clearUserSession
};
