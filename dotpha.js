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
// ⚔️ HỆ THỐNG 18 CẢNH GIỚI
// =====================================================

const realms = [
    { name: "Phàm Nhân", minTuVi: 0, maxTier: 10 },
    { name: "Luyện Khí", minTuVi: 1000, maxTier: 10 },
    { name: "Trúc Cơ", minTuVi: 10000, maxTier: 10 },
    { name: "Kim Đan", minTuVi: 100000, maxTier: 10 },
    { name: "Nguyên Anh", minTuVi: 1000000, maxTier: 10 },
    { name: "Hóa Thần", minTuVi: 10000000, maxTier: 10 },
    { name: "Luyện Hư", minTuVi: 100000000, maxTier: 10 },
    { name: "Hợp Thể", minTuVi: 1000000000, maxTier: 10 },
    { name: "Đại Thừa", minTuVi: 10000000000, maxTier: 10 },
    { name: "Độ Kiếp", minTuVi: 100000000000, maxTier: 10 },
    { name: "Tiên Nhân", minTuVi: 1000000000000, maxTier: 10 },
    { name: "Chân Tiên", minTuVi: 10000000000000, maxTier: 10 },
    { name: "Kim Tiên", minTuVi: 100000000000000, maxTier: 10 },
    { name: "Thái Ất Kim Tiên", minTuVi: 1000000000000000, maxTier: 10 },
    { name: "Đại La Kim Tiên", minTuVi: 10000000000000000, maxTier: 10 },
    { name: "Hỗn Nguyên Đại La", minTuVi: 100000000000000000, maxTier: 10 },
    { name: "Thánh Nhân", minTuVi: 1000000000000000000, maxTier: 10 },
    { name: "Đại Đạo", minTuVi: 10000000000000000000, maxTier: 10 }
];

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
// FIX:
// Database hiện tại lưu canhGioi dạng tên,
// ví dụ "Luyện Khí", không phải số.
// Hỗ trợ cả tên lẫn số để tương thích dữ liệu cũ.
// =====================================================

function getRealmIndex(player) {

    const raw =
        player?.canhGioi ??
        player?.realm ??
        player?.realmIndex ??
        0;

    // Nếu đã là số
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

    // Nếu là chuỗi số
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

    // Nếu là tên cảnh giới
    const name = String(raw)
        .trim()
        .toLowerCase();

    const index = realms.findIndex(
        realm =>
            String(realm.name)
                .trim()
                .toLowerCase() === name
    );

    // Không tìm thấy thì mặc định Phàm Nhân
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
            10,
            Number.isFinite(tier)
                ? Math.floor(tier)
                : 1
        )
    );
}

// =====================================================
// ⚡ TỶ LỆ CHỐNG LÔI KIẾP
// =====================================================

function getResistanceRate(player, index) {

    const realmIndex =
        getRealmIndex(player);

    const tier =
        getTier(player);

    const buff =
        getDaoBuff(player);

    let rate = 50;

    // Buff đạo
    rate += Number(buff.loiKiep || 0);

    // Cảnh giới càng cao
    rate -= realmIndex * 1.5;

    // Tầng càng cao
    rate -= (tier - 1) * 0.5;

    // Lôi kiếp càng cao càng khó
    rate -= (index - 1) * 4;

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

function getLightningDamage(player, index) {

    const lightning =
        LOI_KIEP[index - 1];

    if (!lightning) {
        return 0;
    }

    const buff =
        getDaoBuff(player);

    let damage =
        Number(lightning.damage);

    // Thủ dương giảm sát thương
    if (buff.thu > 0) {
        damage *=
            1 - (buff.thu / 200);
    }

    // Ma Đạo thủ âm
    if (buff.thu < 0) {
        damage *=
            1 +
            (Math.abs(buff.thu) / 100);
    }

    // HP cao giảm sát thương
    if (buff.hp > 0) {
        damage *=
            1 - (buff.hp / 400);
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
            (1 + buff.hp / 100)
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
        (1 + buff.cong / 100)
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
            (1 + buff.thu / 100)
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

    const currentHp =
        Number(
            player.hp ||
            player.maxHp ||
            100
        );

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
                        value: `+${dao.cong}%`,
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
                        value: `+${dao.hp}%`,
                        inline: true
                    },
                    {
                        name: "⚡ Buff Lôi Kiếp",
                        value: `+${dao.loiKiep}%`,
                        inline: true
                    }
                );

        const nextIndex =
            index + 1;

        // Còn lôi kiếp
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

    // Bảo vệ dữ liệu lỗi
    if (!currentRealm) {

        return interaction.update({
            content:
                "❌ Dữ liệu cảnh giới không hợp lệ. Vui lòng kiểm tra lại nhân vật.",
            embeds: [],
            components: []
        });
    }

    const nextRealmIndex =
        Math.min(
            realms.length - 1,
            realmIndex + 1
        );

    const nextRealm =
        realms[nextRealmIndex];

    // =================================================
    // 👑 ĐẠI ĐẠO
    // =================================================

    if (
        realmIndex >=
        realms.length - 1
    ) {

        const finalEmbed =
            new EmbedBuilder()
                .setTitle(
                    "👑 ĐẠI ĐẠO — ĐỈNH PHONG"
                )
                .setDescription(
                    `🌌 **${getDaoBuff(player).name}**\n\n` +
                    `⚡ Bạn đã vượt qua **Cửu Trọng Lôi Kiếp**!\n\n` +
                    `👑 Bạn đã đạt cảnh giới cao nhất:\n` +
                    `# **${currentRealm.name}**\n\n` +
                    `🌠 **Không còn cảnh giới nào phía trên!**`
                )
                .setColor(0xFFD700);

        return interaction.update({
            embeds: [finalEmbed],
            components: []
        });
    }

    // =================================================
    // 📈 TĂNG CẢNH GIỚI
    // =================================================

    const newRealmIndex =
        nextRealmIndex;

    const newTier = 1;

    // =================================================
    // ⚔️ TĂNG CHỈ SỐ
    // =================================================

    const buff =
        getDaoBuff(player);

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
    // =================================================
    // FIX:
    // canhGioi phải lưu TÊN cảnh giới.
    // realm và realmIndex vẫn lưu số để tương thích.
    // =================================================

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
    // 👑 EMBED ĐỘT PHÁ
    // =================================================

    const embed =
        new EmbedBuilder()
            .setTitle(
                "👑 ĐỘT PHÁ THÀNH CÔNG!"
            )
            .setDescription(
                `⚔️ **Cửu Trọng Lôi Kiếp đã bị chinh phục!**\n\n` +
                `🌌 Con đường: **${buff.name}**\n\n` +
                `📜 Cảnh giới cũ:\n` +
                `**${currentRealm.name}**\n\n` +
                `⬇️\n\n` +
                `👑 Cảnh giới mới:\n` +
                `# **${nextRealm.name}**\n\n` +
                `✨ Tầng: **${newTier}**`
            )
            .addFields(
                {
                    name: "⚔️ Công",
                    value:
                        `+${Math.max(
                            0,
                            newCong - oldCong
                        )}`,
                    inline: true
                },
                {
                    name: "🛡️ Thủ",
                    value:
                        `+${Math.max(
                            0,
                            newThu - oldThu
                        )}`,
                    inline: true
                },
                {
                    name: "❤️ HP",
                    value:
                        `+${Math.max(
                            0,
                            newHp - oldHp
                        )}`,
                    inline: true
                }
            )
            .setColor(0x9B59B6);

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
                "Độ kiếp và đột phá cảnh giới"
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

        // Bảo vệ dữ liệu
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
                            `✨ Đây là cảnh giới tối cao.\n` +
                            `⚡ Không còn cảnh giới nào để đột phá.`
                        )
                        .setColor(0xFFD700)

                ],
                ephemeral: true
            });
        }

        // =================================================
        // 📈 TU VI
        // =================================================

        const tuVi =
            Number(
                player.tuvi ||
                player.tuVi ||
                0
            );

        const nextRealm =
            realms[
                realmIndex + 1
            ];

        const requiredTuVi =
            Number(
                nextRealm.minTuVi
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
                            `🌌 Cảnh giới hiện tại: **${realm.name}**\n` +
                            `📊 Tầng: **${tier}/10**\n\n` +
                            `💠 Tu Vi hiện tại: **${tuVi.toLocaleString()}**\n` +
                            `💠 Cần: **${requiredTuVi.toLocaleString()}**\n\n` +
                            `📉 Còn thiếu: **${(
                                requiredTuVi -
                                tuVi
                            ).toLocaleString()} Tu Vi**`
                        )
                        .setColor(0xED4245)

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
                    `**${realm.name} — Tầng ${tier}**\n\n` +
                    `👑 Cảnh giới sắp đột phá:\n` +
                    `**${nextRealm.name}**\n\n` +
                    `⚡ Bạn phải vượt qua **9 tầng Lôi Kiếp**!\n\n` +
                    `🎯 Tỷ lệ Lôi Kiếp cơ bản: **50%**\n` +
                    `✨ Buff đạo: **+${dao.loiKiep}%**`
                )
                .addFields(
                    {
                        name: "⚔️ Công",
                        value: `+${dao.cong}%`,
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
                        value: `+${dao.hp}%`,
                        inline: true
                    }
                )
                .setColor(0x5865F2);

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
    getBuffedThu
};
