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
// ⚔️ HỆ THỐNG 12 CẢNH GIỚI
// =====================================================

const realms = [
    { name: "Phàm Nhân", minTuVi: 0, maxTier: 12 },
    { name: "Luyện Khí", minTuVi: 1000, maxTier: 12 },
    { name: "Trúc Cơ", minTuVi: 10000, maxTier: 12 },
    { name: "Kim Đan", minTuVi: 100000, maxTier: 12 },
    { name: "Nguyên Anh", minTuVi: 1000000, maxTier: 12 },
    { name: "Hóa Thần", minTuVi: 10000000, maxTier: 12 },
    { name: "Luyện Hư", minTuVi: 100000000, maxTier: 12 },
    { name: "Hợp Thể", minTuVi: 1000000000, maxTier: 12 },
    { name: "Đại Thừa", minTuVi: 10000000000, maxTier: 12 },
    { name: "Độ Kiếp", minTuVi: 100000000000, maxTier: 12 },
    { name: "Chân Tiên", minTuVi: 10000000000000, maxTier: 12 },
    { name: "Đại Đạo", minTuVi: 10000000000000000000, maxTier: 12 }
];

// =====================================================
// 📊 GIAI ĐOẠN CẢNH GIỚI
// =====================================================

function getStage(tier) {
    tier = Number(tier) || 1;

    if (tier <= 3) {
        return "Sơ kỳ";
    }

    if (tier <= 6) {
        return "Trung kỳ";
    }

    if (tier <= 9) {
        return "Hậu kỳ";
    }

    if (tier <= 11) {
        return "Viên mãn";
    }

    return "Đỉnh phong";
}

function getRealmDisplay(realmName, tier) {
    return `${realmName} ${getStage(tier)} tầng ${tier}`;
}

// =====================================================
// ⚡ 9 LÔI KIẾP
// =====================================================

const LOI_KIEP = [
    { name: "⚡ Nhất Trọng Lôi Kiếp", damage: 100 },
    { name: "⚡ Nhị Trọng Lôi Kiếp", damage: 200 },
    { name: "⚡ Tam Trọng Lôi Kiếp", damage: 300 },
    { name: "⚡ Tứ Trọng Lôi Kiếp", damage: 400 },
    { name: "⚡ Ngũ Trọng Lôi Kiếp", damage: 500 },
    { name: "⚡ Lục Trọng Lôi Kiếp", damage: 600 },
    { name: "⚡ Thất Trọng Lôi Kiếp", damage: 700 },
    { name: "⚡ Bát Trọng Lôi Kiếp", damage: 800 },
    { name: "⚡ Cửu Trọng Lôi Kiếp", damage: 900 }
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
// 📊 LẤY CẢNH GIỚI
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
// 💠 TU VI CẦN THIẾT CHO TỪNG TẦNG
// =====================================================

function getTierRequiredTuVi(realmIndex, targetTier) {
    const currentRealm = realms[realmIndex];

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

    // Đại Đạo là cảnh giới cuối
    if (realmIndex >= realms.length - 1) {
        return Number(currentRealm.minTuVi);
    }

    const currentMin =
        Number(currentRealm.minTuVi);

    const nextMin =
        Number(nextRealm.minTuVi);

    const tier =
        Math.max(
            1,
            Math.min(
                12,
                Number(targetTier) || 1
            )
        );

    /*
     * Tầng 1:
     *   = mốc đầu cảnh giới
     *
     * Tầng 12:
     *   = mốc cảnh giới kế tiếp
     *
     * Các tầng ở giữa được chia đều.
     */

    const progress =
        (tier - 1) / 11;

    return Math.floor(
        currentMin +
        (
            nextMin -
            currentMin
        ) *
        progress
    );
}

// =====================================================
// ⚡ TỶ LỆ CHỐNG LÔI KIẾP
// =====================================================

function getResistanceRate(
    player,
    index
) {
    const realmIndex =
        getRealmIndex(player);

    const tier =
        getTier(player);

    const buff =
        getDaoBuff(player);

    // CƠ BẢN 50%
    let rate = 50;

    // Buff đạo
    rate += Number(
        buff.loiKiep || 0
    );

    // Cảnh giới càng cao càng khó
    rate -=
        realmIndex * 1.5;

    // Tầng càng cao càng khó
    rate -=
        (tier - 1) * 0.5;

    // Lôi kiếp càng cao càng khó
    rate -=
        (index - 1) * 4;

    return Math.max(
        1,
        Math.min(
            100,
            Math.floor(rate)
        )
    );
}

// =====================================================
// ⚔️ SÁT THƯƠNG LÔI KIẾP
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

    let damage =
        Number(
            lightning.damage
        );

    if (buff.thu > 0) {
        damage *=
            1 -
            (
                buff.thu /
                200
            );
    }

    if (buff.thu < 0) {
        damage *=
            1 +
            (
                Math.abs(
                    buff.thu
                ) / 100
            );
    }

    if (buff.hp > 0) {
        damage *=
            1 -
            (
                buff.hp /
                400
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
            player?.cong || 0
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
            player?.thu || 0
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
// ⚡ XỬ LÝ 1 LÔI KIẾP
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

    const successRate =
        getResistanceRate(
            player,
            index
        );

    const damage =
        getLightningDamage(
            player,
            index
        );

    const success =
        Math.random() * 100 <
        successRate;

    // =================================================
    // ⚡ THÀNH CÔNG
    // =================================================

    if (success) {
        const embed =
            new EmbedBuilder()
                .setTitle(
                    `⚡ ${lightning.name}`
                )
                .setDescription(
                    `🌌 **${dao.name}**\n\n` +
                    `⚡ Thiên Lôi giáng xuống!\n\n` +
                    `🛡️ Tỷ lệ vượt kiếp: **${successRate}%**\n` +
                    `❤️ Sát thương: **${damage}**\n\n` +
                    `✨ **Bạn đã vượt qua Lôi Kiếp thứ ${index}/9!**`
                )
                .addFields(
                    {
                        name: "⚔️ Buff Công",
                        value:
                            `+${dao.cong}%`,
                        inline: true
                    },
                    {
                        name: "🛡️ Buff Thủ",
                        value:
                            `${dao.thu >= 0 ? "+" : ""}${dao.thu}%`,
                        inline: true
                    },
                    {
                        name: "❤️ Buff HP",
                        value:
                            `+${dao.hp}%`,
                        inline: true
                    },
                    {
                        name: "⚡ Buff Lôi Kiếp",
                        value:
                            `+${dao.loiKiep}%`,
                        inline: true
                    }
                );

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

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `do_kiep_${nextIndex}`
                            )
                            .setLabel(
                                `⚡ Độ Kiếp ${nextIndex}/9`
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

            return interaction.update({
                embeds: [embed],
                components: [row]
            });
        }

        // =================================================
        // 👑 VƯỢT 9/9
        // =================================================

        updatePlayer(
            userId,
            {
                doKiep: 0
            }
        );

        return completeBreakthrough(
            interaction,
            player,
            userId,
            embed
        );
    }

    // =================================================
    // 💀 THẤT BẠI
    // =================================================

    const loss =
        Math.floor(
            1000 +
            Math.random() * 9001
        );

    const currentTuVi =
        Number(
            player.tuvi ||
            player.tuVi ||
            0
        );

    const newTuVi =
        Math.max(
            0,
            currentTuVi - loss
        );

    updatePlayer(
        userId,
        {
            tuvi: newTuVi,
            tuVi: newTuVi,
            lastDoKiep: Date.now(),
            doKiep: 0
        }
    );

    const failEmbed =
        new EmbedBuilder()
            .setTitle(
                "💀 ĐỘ KIẾP THẤT BẠI"
            )
            .setDescription(
                `🌌 **${dao.name}**\n\n` +
                `⚡ **${lightning.name}** đã đánh trúng bạn!\n\n` +
                `❌ Tỷ lệ vượt kiếp: **${successRate}%**\n` +
                `💥 Sát thương: **${damage}**\n\n` +
                `📉 Tu Vi mất: **-${loss.toLocaleString()}**\n` +
                `📊 Tu Vi còn: **${newTuVi.toLocaleString()}**`
            )
            .setFooter({
                text:
                    "Thiên kiếp thất bại — hãy tu luyện lại."
            });

    return interaction.update({
        embeds: [failEmbed],
        components: []
    });
}

// =====================================================
// 👑 HOÀN THÀNH ĐỘ KIẾP
// =====================================================

function completeBreakthrough(
    interaction,
    player,
    userId,
    previousEmbed
) {
    const realmIndex =
        getRealmIndex(player);

    const currentRealm =
        realms[realmIndex];

    if (!currentRealm) {
        return interaction.update({
            content:
                "❌ Dữ liệu cảnh giới không hợp lệ. Vui lòng kiểm tra lại nhân vật.",
            embeds: [],
            components: []
        });
    }

    const currentTier =
        getTier(player);

    const buff =
        getDaoBuff(player);

    // =================================================
    // 👑 ĐẠI ĐẠO — CẢNH GIỚI CUỐI
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
                    `⚡ Bạn đã vượt qua **Cửu Trọng Lôi Kiếp**!\n\n` +
                    `👑 Bạn đã đạt cảnh giới cao nhất:\n` +
                    `# **${currentRealm.name}**\n\n` +
                    `✨ **Đỉnh phong tầng 12**\n\n` +
                    `🌠 **Không còn tầng hoặc cảnh giới nào phía trên!**`
                )
                .setColor(
                    0xFFD700
                );

        return interaction.update({
            embeds: [finalEmbed],
            components: []
        });
    }

    // =================================================
    // 📈 ĐỘT PHÁ TẦNG — TẦNG 1 → 12
    // =================================================

    /*
     * Mỗi lần /dotpha thành công:
     *
     * Tầng 1  → Tầng 2
     * Tầng 2  → Tầng 3
     * Tầng 3  → Tầng 4
     * ...
     * Tầng 11 → Tầng 12
     *
     * Chỉ khi đã ở tầng 12 mới được
     * đột phá sang cảnh giới tiếp theo.
     */

    if (currentTier < 12) {
        const newTier =
            currentTier + 1;

        const oldCong =
            Number(
                player.cong || 0
            );

        const oldThu =
            Number(
                player.thu || 0
            );

        const oldHp =
            Number(
                player.maxHp ||
                player.hp ||
                100
            );

        // Mỗi lần tăng tầng nhận thêm chỉ số
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

        const newCong =
            Math.floor(
                oldCong +
                (
                    30 *
                    tierBonus
                )
            );

        const newThu =
            Math.floor(
                oldThu +
                (
                    20 *
                    tierBonus
                )
            );

        const newHp =
            Math.floor(
                oldHp +
                (
                    120 *
                    tierBonus
                )
            );

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
                    `⚔️ **Cửu Trọng Lôi Kiếp đã bị chinh phục!**\n\n` +
                    `🌌 Con đường: **${buff.name}**\n\n` +
                    `📜 Cảnh giới:\n` +
                    `**${currentRealm.name}**\n\n` +
                    `📊 Tầng cũ: **${getStage(currentTier)} tầng ${currentTier}**\n` +
                    `⬇️\n` +
                    `👑 Tầng mới: **${currentRealm.name} ${getStage(newTier)} tầng ${newTier}**\n\n` +
                    `🔥 Muốn lên tầng tiếp theo, bạn **bắt buộc phải /dotpha** lần nữa!`
                )
                .addFields(
                    {
                        name: "⚔️ Công",
                        value:
                            `+${Math.max(
                                0,
                                newCong -
                                oldCong
                            )}`,
                        inline: true
                    },
                    {
                        name: "🛡️ Thủ",
                        value:
                            `+${Math.max(
                                0,
                                newThu -
                                oldThu
                            )}`,
                        inline: true
                    },
                    {
                        name: "❤️ HP",
                        value:
                            `+${Math.max(
                                0,
                                newHp -
                                oldHp
                            )}`,
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
            embeds: [embed],
            components: []
        });
    }

    // =================================================
    // 👑 TẦNG 12 → CẢNH GIỚI TIẾP THEO
    // =================================================

    const nextRealmIndex =
        Math.min(
            realms.length - 1,
            realmIndex + 1
        );

    const nextRealm =
        realms[nextRealmIndex];

    if (
        !nextRealm ||
        nextRealmIndex === realmIndex
    ) {
        return interaction.update({
            content:
                "❌ Không còn cảnh giới tiếp theo.",
            embeds: [],
            components: []
        });
    }

    const newTier = 1;

    // =================================================
    // ⚔️ TĂNG CHỈ SỐ KHI LÊN CẢNH GIỚI
    // =================================================

    const oldCong =
        Number(
            player.cong || 0
        );

    const oldThu =
        Number(
            player.thu || 0
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
            newRealmIndex *
            0.15
        );

    const newCong =
        Math.floor(
            oldCong +
            (
                100 *
                realmBonus
            )
        );

    const newThu =
        Math.floor(
            oldThu +
            (
                80 *
                realmBonus
            )
        );

    const newHp =
        Math.floor(
            oldHp +
            (
                500 *
                realmBonus
            )
        );

    // =================================================
    // 💾 LƯU NHÂN VẬT
    // =====================================================

    updatePlayer(
        userId,
        {
            canhGioi:
                nextRealm.name,

            realm:
                newRealmIndex,

            realmIndex:
                newRealmIndex,

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
    // 👑 EMBED ĐỘT PHÁ CẢNH GIỚI
    // =================================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                "👑 ĐỘT PHÁ CẢNH GIỚI THÀNH CÔNG!"
            )
            .setDescription(
                `⚔️ **Cửu Trọng Lôi Kiếp đã bị chinh phục!**\n\n` +
                `🌌 Con đường: **${buff.name}**\n\n` +
                `📜 Cảnh giới cũ:\n` +
                `**${currentRealm.name} ${getStage(12)} tầng 12**\n\n` +
                `⬇️\n\n` +
                `👑 Cảnh giới mới:\n` +
                `# **${nextRealm.name} ${getStage(1)} tầng 1**`
            )
            .addFields(
                {
                    name: "⚔️ Công",
                    value:
                        `+${Math.max(
                            0,
                            newCong -
                            oldCong
                        )}`,
                    inline: true
                },
                {
                    name: "🛡️ Thủ",
                    value:
                        `+${Math.max(
                            0,
                            newThu -
                            oldThu
                        )}`,
                    inline: true
                },
                {
                    name: "❤️ HP",
                    value:
                        `+${Math.max(
                            0,
                            newHp -
                            oldHp
                        )}`,
                    inline: true
                }
            )
            .setColor(
                0x9B59B6
            );

    return interaction.update({
        embeds: [embed],
        components: []
    });
}

// =====================================================
// ⚡ LỆNH /DOTPHA
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dotpha")
            .setDescription(
                "Độ kiếp và đột phá từng tầng/cảnh giới"
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
        // 📊 CẢNH GIỚI
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
                    "❌ Dữ liệu cảnh giới của nhân vật không hợp lệ.",
                ephemeral: true
            });
        }

        // =================================================
        // 👑 ĐẠI ĐẠO
        // =================================================

        if (
            realmIndex >=
            realms.length - 1
        ) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(
                            "👑 ĐẠI ĐẠO"
                        )
                        .setDescription(
                            `🌌 Bạn đã đạt **${realm.name}**.\n\n` +
                            `✨ Giai đoạn: **${getStage(tier)}**\n` +
                            `📊 Tầng: **${tier}/12**\n\n` +
                            (
                                tier < 12
                                    ? `⚡ Bạn vẫn phải tiếp tục **/dotpha** để tiến lên tầng ${tier + 1}.`
                                    : `⚡ Bạn đã đạt cảnh giới cao nhất, không còn tầng hoặc cảnh giới nào phía trên.`
                            )
                        )
                        .setColor(
                            0xFFD700
                        )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // 📈 XÁC ĐỊNH MỤC TIÊU
        // =================================================

        const isRealmBreakthrough =
            tier >= 12;

        const targetTier =
            isRealmBreakthrough
                ? 1
                : tier + 1;

        const nextRealm =
            realms[
                isRealmBreakthrough
                    ? realmIndex + 1
                    : realmIndex
            ];

        // =================================================
        // 💠 TU VI YÊU CẦU
        // =================================================

        const requiredTuVi =
            isRealmBreakthrough
                ? Number(
                    nextRealm?.minTuVi ||
                    0
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
                            "❌ CHƯA ĐỦ TU VI"
                        )
                        .setDescription(
                            `🌌 Cảnh giới hiện tại:\n` +
                            `**${realm.name} ${getStage(tier)} tầng ${tier}**\n\n` +

                            `🎯 Muốn đột phá lên:\n` +
                            `**${nextRealm?.name || realm.name} ${getStage(targetTier)} tầng ${targetTier}**\n\n` +

                            `💠 Tu Vi hiện tại: **${tuVi.toLocaleString()}**\n` +
                            `💠 Tu Vi cần đạt: **${requiredTuVi.toLocaleString()}**\n\n` +

                            `📉 Còn thiếu: **${Math.max(
                                0,
                                requiredTuVi -
                                tuVi
                            ).toLocaleString()} Tu Vi**\n\n` +

                            `⚡ Đủ Tu Vi rồi vẫn phải vượt qua **Cửu Trọng Lôi Kiếp** bằng **/dotpha**.`
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

        const startEmbed =
            new EmbedBuilder()
                .setTitle(
                    "⚡ THIÊN KIẾP GIÁNG LÂM"
                )
                .setDescription(
                    `🌌 Con đường: **${dao.name}**\n\n` +

                    `📜 Cảnh giới hiện tại:\n` +
                    `**${realm.name} ${getStage(tier)} tầng ${tier}**\n\n` +

                    `👑 Mục tiêu đột phá:\n` +
                    `**${nextRealm.name} ${getStage(targetTier)} tầng ${targetTier}**\n\n` +

                    `💠 Tu Vi yêu cầu: **${requiredTuVi.toLocaleString()}**\n\n` +

                    `⚡ Bạn phải vượt qua **9 tầng Lôi Kiếp**!\n\n` +

                    `🎯 Tỷ lệ Lôi Kiếp cơ bản: **50%**\n` +
                    `✨ Buff đạo: **+${dao.loiKiep}%**`
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
                embeds: [startEmbed],
                components: [row],
                fetchReply: true
            });

        // =================================================
        // 🎮 COLLECTOR
        // =================================================

        const collector =
            response.createMessageComponentCollector({
                time: 120000
            });

        collector.on(
            "collect",
            async button => {

                // =========================================
                // 🔒 CHỈ NGƯỜI GỌI
                // =========================================

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

                    // Lưu tiến độ
                    updatePlayer(
                        userId,
                        {
                            doKiep: 1
                        }
                    );

                    const firstRate =
                        getResistanceRate(
                            freshPlayer,
                            1
                        );

                    const firstLightning =
                        LOI_KIEP[0];

                    const firstDamage =
                        getLightningDamage(
                            freshPlayer,
                            1
                        );

                    const firstEmbed =
                        new EmbedBuilder()
                            .setTitle(
                                "⚡ LÔI KIẾP 1/9"
                            )
                            .setDescription(
                                `🌌 **${dao.name}**\n\n` +
                                `⚡ ${firstLightning.name}\n\n` +
                                `🎯 Tỷ lệ vượt kiếp: **${firstRate}%**\n` +
                                `💥 Sát thương: **${firstDamage}**\n\n` +
                                `⚔️ Hãy chuẩn bị nghênh đón Thiên Lôi!`
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
                                        "⚡ Chịu Lôi Kiếp"
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
                            embeds: [firstEmbed],
                            components: [lightningRow],
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
                            // ⚡ XỬ LÝ LÔI KIẾP
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
                                    !Number.isInteger(index) ||
                                    index < 1 ||
                                    index > 9
                                ) {
                                    return;
                                }

                                const currentPlayer =
                                    getPlayer(userId);

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

                    lightningCollector.on(
                        "end",
                        async () => {}
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
    getResistanceRate,
    getLightningDamage,
    getBuffedHp,
    getBuffedCong,
    getBuffedThu,
    getStage,
    getRealmDisplay,
    getTierRequiredTuVi
};
