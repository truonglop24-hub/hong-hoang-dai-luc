const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const db = require("./database");

// =====================================================
// 🌌 THÔNG TIN 3 CON ĐƯỜNG
// =====================================================

const DAO_PATHS = {

    chinhdao: {
        name: "⚔️ CHÍNH ĐẠO",
        value: "chinhdao",
        description:
            "Tu luyện chính thống, cân bằng công và thủ.",
        color: 0x3498db,

        hpMultiplier: 1.00,
        linhLucMultiplier: 1.00,
        congMultiplier: 1.00,
        thuMultiplier: 1.10,

        icon: "⚔️"
    },

    maDao: {
        name: "☠️ MA ĐẠO",
        value: "madao",
        description:
            "Ma lực mạnh mẽ, thiên về công kích và sức mạnh.",
        color: 0x8e44ad,

        hpMultiplier: 1.10,
        linhLucMultiplier: 1.15,
        congMultiplier: 1.30,
        thuMultiplier: 0.95,

        icon: "☠️"
    },

    yeuDao: {
        name: "🐉 YÊU ĐẠO",
        value: "yeudao",
        description:
            "Huyết mạch Yêu tộc, thân thể cực mạnh và sức chiến đấu vượt trội.",
        color: 0xe67e22,

        // 🐉 YÊU ĐẠO MẠNH HƠN
        hpMultiplier: 1.50,
        linhLucMultiplier: 1.35,
        congMultiplier: 1.60,
        thuMultiplier: 1.45,

        icon: "🐉"
    }
};

// =====================================================
// 🐉 BUFF YÊU ĐẠO
// =====================================================

const YEU_DAO_BUFF = {
    hp: 50,
    linhLuc: 35,
    cong: 60,
    thu: 45,
    tuLuyen: 30,
    dotPha: 20
};

// =====================================================
// ☠️ BUFF MA ĐẠO
// =====================================================

const MA_DAO_BUFF = {
    hp: 10,
    linhLuc: 15,
    cong: 30,
    thu: 0,
    tuLuyen: 15,
    dotPha: 10
};

// =====================================================
// ⚔️ BUFF CHÍNH ĐẠO
// =====================================================

const CHINH_DAO_BUFF = {
    hp: 5,
    linhLuc: 5,
    cong: 10,
    thu: 15,
    tuLuyen: 10,
    dotPha: 5
};

// =====================================================
// 🔧 LẤY BUFF THEO ĐẠO
// =====================================================

function getDaoBuff(dao) {

    if (dao === "yeudao") {
        return {
            ...YEU_DAO_BUFF
        };
    }

    if (dao === "madao") {
        return {
            ...MA_DAO_BUFF
        };
    }

    return {
        ...CHINH_DAO_BUFF
    };
}

// =====================================================
// 🏷️ TÊN ĐẠO
// =====================================================

function getDaoName(dao) {

    if (dao === "yeudao") {
        return "🐉 Yêu Đạo";
    }

    if (dao === "madao") {
        return "☠️ Ma Đạo";
    }

    return "⚔️ Chính Đạo";
}

// =====================================================
// 🎨 MÀU ĐẠO
// =====================================================

function getDaoColor(dao) {

    if (dao === "yeudao") {
        return 0xe67e22;
    }

    if (dao === "madao") {
        return 0x8e44ad;
    }

    return 0x3498db;
}

// =====================================================
// 📜 MÔ TẢ ĐẠO
// =====================================================

function getDaoDescription(dao) {

    if (dao === "yeudao") {

        return [
            "🐉 **YÊU ĐẠO**",
            "",
            "🌟 Huyết mạch Yêu tộc thức tỉnh.",
            "💪 Thân thể mạnh mẽ hơn người tu tiên.",
            "⚔️ Công kích tăng mạnh.",
            "🛡️ Phòng thủ tăng mạnh.",
            "❤️ Sinh lực tăng mạnh.",
            "🔥 Linh lực tăng cao.",
            "",
            "⭐ **Đặc biệt:** Yêu Đạo có sức mạnh tộc cao hơn."
        ].join("\n");
    }

    if (dao === "madao") {

        return [
            "☠️ **MA ĐẠO**",
            "",
            "🔥 Ma lực hung bạo.",
            "⚔️ Công kích cao.",
            "❤️ Sinh lực khá cao.",
            "🔥 Linh lực mạnh.",
            "⚡ Tốc độ tu luyện tốt.",
            "",
            "☠️ Con đường lấy sát phạt chứng đạo."
        ].join("\n");
    }

    return [
        "⚔️ **CHÍNH ĐẠO**",
        "",
        "🌟 Tu luyện chính thống.",
        "🛡️ Phòng thủ ổn định.",
        "⚔️ Công kích cân bằng.",
        "🔥 Linh lực ổn định.",
        "",
        "⚔️ Con đường chính đạo lấy tu thân chứng đạo."
    ].join("\n");
}

// =====================================================
// 🧬 TẠO MENU CHỌN ĐẠO
// =====================================================

function createDaoMenu(userId) {

    const menu =
        new StringSelectMenuBuilder()
            .setCustomId(
                `batdau_dao_${userId}`
            )
            .setPlaceholder(
                "🌌 Chọn con đường chứng đạo..."
            )
            .addOptions(

                {
                    label:
                        "⚔️ Chính Đạo",
                    description:
                        "Con đường tu luyện chính thống, cân bằng.",
                    value:
                        "chinhdao",
                    emoji:
                        "⚔️"
                },

                {
                    label:
                        "☠️ Ma Đạo",
                    description:
                        "Ma lực mạnh mẽ, công kích cao.",
                    value:
                        "madao",
                    emoji:
                        "☠️"
                },

                {
                    label:
                        "🐉 Yêu Đạo",
                    description:
                        "Yêu tộc huyết mạch mạnh, sức mạnh vượt trội.",
                    value:
                        "yeudao",
                    emoji:
                        "🐉"
                }
            );

    return new ActionRowBuilder()
        .addComponents(menu);
}

// =====================================================
// 🌌 EMBED CHỌN ĐẠO
// =====================================================

function createDaoEmbed(username) {

    return new EmbedBuilder()

        .setColor(0xf1c40f)

        .setTitle(
            "🌌 HỒNG HOANG ĐẠI LỤC"
        )

        .setDescription(

            `✨ **${username}**, ngươi đã bước vào Hồng Hoang.\n\n` +

            `━━━━━━━━━━━━━━━━━━━━\n\n` +

            `🌌 **THIÊN ĐẠO BAN CHO NGƯƠI 3 CON ĐƯỜNG**\n\n` +

            `⚔️ **CHÍNH ĐẠO**\n` +
            `> Tu luyện chính thống, công thủ cân bằng.\n\n` +

            `☠️ **MA ĐẠO**\n` +
            `> Ma lực mạnh mẽ, lấy sát phạt chứng đạo.\n\n` +

            `🐉 **YÊU ĐẠO**\n` +
            `> Huyết mạch Yêu tộc, thân thể và sức mạnh vượt trội.\n\n` +

            `━━━━━━━━━━━━━━━━━━━━\n\n` +

            `⚠️ **Hãy lựa chọn con đường của ngươi.**\n` +
            `Lựa chọn này sẽ quyết định sức mạnh và con đường tu luyện của nhân vật.`
        )

        .setFooter({
            text:
                "🌌 Hồng Hoang Đại Lục • Thiên mệnh đã định"
        });
}

// =====================================================
// 🧬 TẠO NHÂN VẬT SAU KHI CHỌN ĐẠO
// =====================================================

async function createCharacter(
    interaction,
    dao
) {

    const userId =
        interaction.user.id;

    const username =
        interaction.user.username;

    // =================================================
    // KIỂM TRA LẠI NHÂN VẬT
    // =================================================

    let player =
        db.getPlayer(
            userId
        );

    if (player) {

        return interaction.update({

            content:
                "⚠️ Bạn đã có nhân vật rồi.",

            embeds: [],

            components: []
        });
    }

    // =================================================
    // TẠO NHÂN VẬT
    // =================================================

    player =
        db.createPlayer(
            userId,
            username
        );

    // =================================================
    // QUAY LINH CĂN
    // =================================================

    const linhCan =
        db.generateLinhCan();

    // =================================================
    // BUFF LINH CĂN
    // =================================================

    const linhCanBuff =
        linhCan.buff || {};

    // =================================================
    // BUFF ĐẠO
    // =================================================

    const daoBuff =
        getDaoBuff(
            dao
        );

    // =================================================
    // CHỈ SỐ CƠ BẢN
    // =================================================

    const baseHp =
        Number(
            player.maxHp
        ) || 100;

    const baseLinhLuc =
        Number(
            player.linhLuc
        ) || 0;

    const baseCong =
        Number(
            player.cong
        ) || 10;

    const baseThu =
        Number(
            player.thu
        ) || 5;

    // =================================================
    // ❤️ HP
    // =================================================

    let hp =
        Math.round(
            baseHp *

            (
                1 +

                (
                    Number(
                        linhCanBuff.hp
                    ) || 0
                ) / 100
            )
        );

    hp =
        Math.round(
            hp *
            (
                1 +
                daoBuff.hp / 100
            )
        );

    // =================================================
    // 🔥 LINH LỰC
    // =================================================

    let linhLuc =
        Math.round(
            baseLinhLuc +

            (
                Number(
                    linhCanBuff.linhLuc
                ) || 0
            )
        );

    linhLuc =
        Math.round(
            linhLuc *
            (
                1 +
                daoBuff.linhLuc / 100
            )
        );

    // =================================================
    // ⚔️ CÔNG
    // =================================================

    let cong =
        Math.round(
            baseCong *

            (
                1 +

                (
                    Number(
                        linhCanBuff.cong
                    ) || 0
                ) / 100
            )
        );

    cong =
        Math.round(
            cong *
            (
                1 +
                daoBuff.cong / 100
            )
        );

    // =================================================
    // 🛡️ THỦ
    // =================================================

    let thu =
        Math.round(
            baseThu *

            (
                1 +

                (
                    Number(
                        linhCanBuff.thu
                    ) || 0
                ) / 100
            )
        );

    thu =
        Math.round(
            thu *
            (
                1 +
                daoBuff.thu / 100
            )
        );

    // =================================================
    // 💾 LƯU NHÂN VẬT
    // =================================================

    player =
        db.updatePlayer(

            userId,

            {

                // ===============================
                // 🌌 CON ĐƯỜNG
                // ===============================

                dao:
                    dao,

                conDuong:
                    dao,

                phuongDao:
                    dao,

                // ===============================
                // 🧬 LINH CĂN
                // ===============================

                linhCan:
                    linhCan,

                // ===============================
                // ❤️ CHỈ SỐ
                // ===============================

                hp:
                    hp,

                maxHp:
                    hp,

                linhLuc:
                    linhLuc,

                cong:
                    cong,

                thu:
                    thu,

                // ===============================
                // 🌱 CẢNH GIỚI
                // ===============================

                canhGioi:
                    player.canhGioi ||
                    "Luyện Khí",

                tang:
                    player.tang ||
                    1,

                // ===============================
                // ✨ TU VI
                // ===============================

                tuvi:
                    Number(
                        player.tuvi
                    ) || 0
            }
        );

    // =================================================
    // 📊 BUFF HIỂN THỊ
    // =================================================

    const buffText =

        `⚔️ Tu luyện: **+${daoBuff.tuLuyen}%**\n` +

        `❤️ Sinh lực: **+${daoBuff.hp}%**\n` +

        `🔥 Linh lực: **+${daoBuff.linhLuc}%**\n` +

        `🗡️ Công: **+${daoBuff.cong}%**\n` +

        `🛡️ Thủ: **+${daoBuff.thu}%**\n` +

        `🌟 Đột phá: **+${daoBuff.dotPha}%**`;

    // =================================================
    // 🌌 EMBED KẾT QUẢ
    // =================================================

    const embed =

        new EmbedBuilder()

            .setColor(
                getDaoColor(
                    dao
                )
            )

            .setTitle(
                `${getDaoName(dao)} • HỒNG HOANG ĐẠI LỤC`
            )

            .setDescription(

                `✨ **${username}** đã chọn con đường **${getDaoName(dao)}**!\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🌌 **CON ĐƯỜNG CHỨNG ĐẠO**\n\n` +

                `${getDaoDescription(dao)}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🧬 **LINH CĂN THỨC TỈNH**\n\n` +

                `## ${linhCan.ten}\n\n` +

                `💠 **Phẩm cấp:** ${linhCan.phamCap}\n\n` +

                `🌈 **Thuộc tính:** ${linhCan.thuocTinh}\n\n` +

                `📜 ${linhCan.moTa}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `📊 **THIÊN PHÚ CỦA ${getDaoName(dao).toUpperCase()}**\n\n` +

                buffText +

                `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +

                `🌱 **Cảnh giới:** ${player.canhGioi || "Luyện Khí"} tầng ${player.tang || 1}\n` +

                `⚔️ **Tu Vi:** ${Number(player.tuvi || 0).toLocaleString()}\n` +

                `🔥 **Linh lực:** ${Number(player.linhLuc || 0).toLocaleString()}\n` +

                `❤️ **Sinh lực:** ${Number(player.hp || 0).toLocaleString()}/${Number(player.maxHp || 0).toLocaleString()}\n` +

                `🗡️ **Công:** ${Number(player.cong || 0).toLocaleString()}\n` +

                `🛡️ **Thủ:** ${Number(player.thu || 0).toLocaleString()}\n` +

                `💎 **Linh thạch:** ${Number(player.linhThach || 0).toLocaleString()}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

                `${getDaoName(dao)} đã được ghi nhận.\n` +

                `⚔️ Con đường chứng đạo của ngươi chính thức bắt đầu!`
            )

            .setFooter({

                text:
                    `Hồng Hoang Đại Lục • ${getDaoName(dao)}`
            });

    // =================================================
    // 📤 HIỂN THỊ
    // =================================================

    return interaction.update({

        embeds: [
            embed
        ],

        components: []
    });
}

// =====================================================
// /BATDAU
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName(
                "batdau"
            )

            .setDescription(
                "🌌 Bắt đầu con đường tu luyện tại Hồng Hoang"
            ),

    // =================================================
    // ⚙️ EXECUTE
    // =================================================

    async execute(
        interaction
    ) {

        const userId =
            interaction.user.id;

        const username =
            interaction.user.username;

        // =================================================
        // KIỂM TRA NHÂN VẬT
        // =================================================

        const player =
            db.getPlayer(
                userId
            );

        // =================================================
        // ĐÃ CÓ NHÂN VẬT
        // =================================================

        if (player) {

            const linhCan =
                player.linhCan;

            let linhCanText =
                "❓ Chưa thức tỉnh";

            let phamCapText =
                "Chưa xác định";

            let thuocTinhText =
                "Chưa xác định";

            if (
                linhCan &&
                typeof linhCan ===
                    "object"
            ) {

                linhCanText =
                    linhCan.ten ||
                    "Chưa thức tỉnh";

                phamCapText =
                    linhCan.phamCap ||
                    "Chưa xác định";

                thuocTinhText =
                    linhCan.thuocTinh ||
                    "Chưa xác định";
            }

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(
                            getDaoColor(
                                player.dao ||
                                player.conDuong ||
                                "chinhdao"
                            )
                        )

                        .setTitle(
                            "🌌 HỒNG HOANG ĐẠI LỤC"
                        )

                        .setDescription(

                            `⚠️ **${username}** đã có nhân vật tại Hồng Hoang.\n\n` +

                            `🌌 **Con đường:** ${getDaoName(
                                player.dao ||
                                player.conDuong ||
                                "chinhdao"
                            )}\n\n` +

                            `🧬 **Linh Căn:** ${linhCanText}\n` +

                            `💠 **Phẩm cấp:** ${phamCapText}\n` +

                            `🌈 **Thuộc tính:** ${thuocTinhText}\n\n` +

                            `🌱 **Cảnh giới:** ${player.canhGioi || "Luyện Khí"} tầng ${player.tang || 1}\n` +

                            `⚔️ **Tu Vi:** ${Number(player.tuvi || 0).toLocaleString()}\n\n` +

                            `📜 Dùng \`/tuvi\` để xem toàn bộ thông tin.`
                        )
                ],

                ephemeral:
                    true
            });
        }

        // =================================================
        // 🛡️ MENU CHỌN ĐẠO
        // =================================================

        const embed =
            createDaoEmbed(
                username
            );

        const row =
            createDaoMenu(
                userId
            );

        const message =
            await interaction.reply({

                embeds: [
                    embed
                ],

                components: [
                    row
                ],

                fetchReply:
                    true
            });

        // =================================================
        // 🎯 COLLECTOR
        // =================================================

        const collector =
            message.createMessageComponentCollector({

                filter:
                    i =>
                        i.user.id ===
                        userId &&
                        i.customId ===
                        `batdau_dao_${userId}`,

                time:
                    120000,

                max:
                    1
            });

        // =================================================
        // 🖱️ CHỌN ĐẠO
        // =================================================

        collector.on(
            "collect",
            async selectInteraction => {

                const dao =
                    selectInteraction
                        .values[0];

                await createCharacter(

                    selectInteraction,

                    dao
                );

                collector.stop(
                    "selected"
                );
            }
        );

        // =================================================
        // ⏰ HẾT THỜI GIAN
        // =================================================

        collector.on(
            "end",
            async (
                collected,
                reason
            ) => {

                if (
                    reason !==
                    "time"
                ) {
                    return;
                }

                try {

                    await interaction.editReply({

                        embeds: [

                            new EmbedBuilder()

                                .setColor(
                                    0x7f8c8d
                                )

                                .setTitle(
                                    "⏰ ĐÃ HẾT THỜI GIAN"
                                )

                                .setDescription(

                                    `⚠️ **${username}** chưa chọn con đường tu luyện.\n\n` +

                                    `Hãy sử dụng lại \`/batdau\` để lựa chọn:\n\n` +

                                    `⚔️ Chính Đạo\n` +

                                    `☠️ Ma Đạo\n` +

                                    `🐉 Yêu Đạo`
                                )
                        ],

                        components: []
                    });

                } catch (error) {

                    console.error(
                        "Lỗi batdau collector:",
                        error
                    );
                }
            }
        );
    }
};
