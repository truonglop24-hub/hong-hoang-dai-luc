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
            "Tu luyện chính thống, thiên về tu vi, phòng thủ và ổn định.",
        color: 0x3498db,

        hpMultiplier: 1.20,
        linhLucMultiplier: 1.00,
        congMultiplier: 1.10,
        thuMultiplier: 1.25,

        icon: "⚔️"
    },

    madao: {
        name: "😈 MA ĐẠO",
        value: "madao",
        description:
            "Ma lực hung bạo, thiên về sát thương, hút máu và đột phá.",
        color: 0x8e44ad,

        hpMultiplier: 1.00,
        linhLucMultiplier: 1.00,
        congMultiplier: 1.30,
        thuMultiplier: 0.90,

        icon: "😈"
    },

    yeudao: {
        name: "🐺 YÊU ĐẠO",
        value: "yeudao",
        description:
            "Yêu tộc thiên về thể chất, HP, sức mạnh và phòng thủ.",
        color: 0xe67e22,

        hpMultiplier: 1.40,
        linhLucMultiplier: 1.00,
        congMultiplier: 1.15,
        thuMultiplier: 1.20,

        icon: "🐺"
    }
};


// =====================================================
// ⚔️ BUFF CHÍNH ĐẠO
// =====================================================

const CHINH_DAO_BUFF = {

    tuVi: 20,
    hp: 20,
    linhLuc: 0,
    cong: 10,
    thu: 25,
    tuLuyen: 15,
    dotPha: 5,
    hutMau: 0
};


// =====================================================
// 😈 BUFF MA ĐẠO
// =====================================================

const MA_DAO_BUFF = {

    tuVi: 15,
    hp: 0,
    linhLuc: 0,
    cong: 30,
    thu: -10,
    tuLuyen: 10,
    dotPha: 15,
    hutMau: 15
};


// =====================================================
// 🐺 BUFF YÊU ĐẠO
// =====================================================

const YEU_DAO_BUFF = {

    tuVi: 10,
    hp: 40,
    linhLuc: 0,
    cong: 15,
    thu: 20,
    tuLuyen: 5,
    dotPha: 0,
    hutMau: 0
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
        return "🐺 Yêu Đạo";
    }

    if (dao === "madao") {
        return "😈 Ma Đạo";
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
            "🐺 **YÊU ĐẠO**",
            "",
            "🌟 Huyết mạch Yêu tộc thức tỉnh.",
            "❤️ Sinh lực tăng cực mạnh.",
            "⚔️ Công kích tăng mạnh.",
            "🛡️ Phòng thủ tăng mạnh.",
            "✨ Tu vi nhận được tăng.",
            "⚡ Tốc độ tu luyện được tăng.",
            "",
            "⭐ **Đặc biệt:** Yêu Đạo thiên về thể chất và sức mạnh."
        ].join("\n");
    }

    if (dao === "madao") {

        return [
            "😈 **MA ĐẠO**",
            "",
            "🔥 Ma lực hung bạo.",
            "💀 Sát thương tăng cực mạnh.",
            "🩸 Có khả năng hút máu.",
            "✨ Tu vi nhận được tăng.",
            "🌟 Tỷ lệ đột phá tăng mạnh.",
            "🛡️ Phòng thủ giảm.",
            "",
            "☠️ **Đặc biệt:** Ma Đạo lấy sát phạt chứng đạo."
        ].join("\n");
    }

    return [
        "⚔️ **CHÍNH ĐẠO**",
        "",
        "🌟 Tu luyện chính thống.",
        "🛡️ Phòng thủ tăng mạnh.",
        "❤️ Sinh lực tăng.",
        "⚔️ Công kích tăng.",
        "✨ Tu vi nhận được tăng cao.",
        "⚡ Tốc độ tu luyện tăng.",
        "🌟 Tỷ lệ đột phá tăng.",
        "",
        "⚔️ **Đặc biệt:** Chính Đạo cân bằng và ổn định."
    ].join("\n");
}


// =====================================================
// 📊 FORMAT BUFF
// =====================================================

function formatBuffValue(value) {

    return value >= 0
        ? `+${value}%`
        : `${value}%`;
}


// =====================================================
// 📊 HIỂN THỊ BUFF ĐẠO
// =====================================================

function getDaoBuffText(dao) {

    const buff =
        getDaoBuff(dao);

    return [
        `✨ Tu Vi: **${formatBuffValue(buff.tuVi)}**`,
        `❤️ Sinh lực: **${formatBuffValue(buff.hp)}**`,
        `🔥 Linh lực: **${formatBuffValue(buff.linhLuc)}**`,
        `⚔️ Sát thương: **${formatBuffValue(buff.cong)}**`,
        `🛡️ Phòng thủ: **${formatBuffValue(buff.thu)}**`,
        `⚡ Tốc độ tu luyện: **${formatBuffValue(buff.tuLuyen)}**`,
        `🌟 Đột phá: **${formatBuffValue(buff.dotPha)}**`,
        `🩸 Hút máu: **${formatBuffValue(buff.hutMau)}**`
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
                        "Tu vi, phòng thủ và tu luyện ổn định.",

                    value:
                        "chinhdao",

                    emoji:
                        "⚔️"
                },

                {
                    label:
                        "😈 Ma Đạo",

                    description:
                        "Sát thương, hút máu và đột phá mạnh.",

                    value:
                        "madao",

                    emoji:
                        "😈"
                },

                {
                    label:
                        "🐺 Yêu Đạo",

                    description:
                        "HP, công và phòng thủ cực mạnh.",

                    value:
                        "yeudao",

                    emoji:
                        "🐺"
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

        .setColor(
            0xf1c40f
        )

        .setTitle(
            "🌌 HỒNG HOANG ĐẠI LỤC"
        )

        .setDescription(

            `✨ **${username}**, ngươi đã bước vào Hồng Hoang.\n\n` +

            `━━━━━━━━━━━━━━━━━━━━\n\n` +

            `🌌 **THIÊN ĐẠO BAN CHO NGƯƠI 3 CON ĐƯỜNG**\n\n` +

            `⚔️ **CHÍNH ĐẠO**\n` +
            `> Tu vi +20% • Thủ +25% • HP +20%\n` +
            `> Tốc độ tu luyện +15% • Đột phá +5%\n\n` +

            `😈 **MA ĐẠO**\n` +
            `> Sát thương +30% • Hút máu +15%\n` +
            `> Tu vi +15% • Đột phá +15%\n` +
            `> Thủ -10%\n\n` +

            `🐺 **YÊU ĐẠO**\n` +
            `> HP +40% • Công +15% • Thủ +20%\n` +
            `> Tu vi +10% • Tốc độ tu luyện +5%\n\n` +

            `━━━━━━━━━━━━━━━━━━━━\n\n` +

            `⚠️ **Hãy lựa chọn con đường của ngươi.**\n\n` +

            `Lựa chọn này sẽ quyết định sức mạnh và con đường tu luyện của nhân vật.`
        )

        .setFooter({
            text:
                "🌌 Hồng Hoang Đại Lục • Thiên mệnh đã định"
        });
}


// =====================================================
// 🧭 MENU CHỨC NĂNG RIÊNG THEO ĐẠO
// =====================================================

const DAO_FUNCTIONS = [

    {
        value: "tuvi",
        label: "📊 Tu Vi",
        description:
            "Xem cảnh giới, tầng và tu vi"
    },

    {
        value: "dotpha",
        label: "⚡ Đột Phá",
        description:
            "Đột phá tầng bằng Cửu Trọng Lôi Kiếp"
    },

    {
        value: "cuahang",
        label: "🏪 Cửa Hàng",
        description:
            "Mua pháp bảo, đan dược và vật phẩm"
    },

    {
        value: "dando",
        label: "💊 Đan Dược",
        description:
            "Xem và sử dụng đan dược"
    },

    {
        value: "boss",
        label: "🐉 Boss",
        description:
            "Khiêu chiến Boss Hồng Hoang"
    },

    {
        value: "pvp",
        label: "⚔️ PVP",
        description:
            "Giao chiến với người chơi khác"
    },

    {
        value: "bxh",
        label: "🏆 Bảng Xếp Hạng",
        description:
            "Xem các bảng xếp hạng"
    },

    {
        value: "help",
        label: "📖 Hướng Dẫn",
        description:
            "Xem hướng dẫn hệ thống"
    }
];


// =====================================================
// 🧭 TẠO MENU CHỨC NĂNG
// =====================================================

function createDaoFunctionMenu(
    userId,
    dao
) {

    const path =
        DAO_PATHS[dao] ||
        DAO_PATHS.chinhdao;

    const menu =
        new StringSelectMenuBuilder()

            .setCustomId(
                `dao_functions_${userId}_${dao}`
            )

            .setPlaceholder(
                `${path.icon} Chọn chức năng ${path.name}...`
            )

            .addOptions(

                DAO_FUNCTIONS.map(
                    item => ({

                        label:
                            item.label,

                        description:
                            item.description,

                        value:
                            item.value
                    })
                )
            );

    return new ActionRowBuilder()
        .addComponents(menu);
}


// =====================================================
// 🧭 EMBED MENU CHỨC NĂNG
// =====================================================

function createDaoFunctionEmbed(
    username,
    dao,
    player
) {

    const path =
        DAO_PATHS[dao] ||
        DAO_PATHS.chinhdao;

    return new EmbedBuilder()

        .setColor(
            path.color
        )

        .setTitle(
            `${path.icon} MENU ${path.name}`
        )

        .setDescription(

            `✨ **${username}**, đây là menu riêng của **${path.name}**.\n\n` +

            `📌 Các chức năng giống nhau cho cả 3 đạo, nhưng menu và giao diện được tách riêng theo con đường tu luyện.\n\n` +

            `🌱 **Cảnh giới:** ${player?.canhGioi || "Luyện Khí"} tầng ${player?.tang || 1}\n` +

            `⚔️ **Tu Vi:** ${Number(player?.tuvi || 0).toLocaleString()}\n` +

            `💎 **Linh Thạch:** ${Number(player?.linhThach || 0).toLocaleString()}\n\n` +

            `👇 **Chọn chức năng bên dưới để sử dụng.**`
        )

        .setFooter({
            text:
                `Hồng Hoang Đại Lục • ${path.name}`
        });
}


// =====================================================
// ⚙️ GẮN XỬ LÝ MENU
// =====================================================

async function attachDaoFunctionMenu(
    message,
    client,
    userId,
    dao
) {

    const collector =
        message.createMessageComponentCollector({

            filter:
                i =>
                    i.user.id ===
                        userId &&

                    i.customId ===
                        `dao_functions_${userId}_${dao}`,

            time:
                300000
        });


    collector.on(
        "collect",
        async selectInteraction => {

            const commandName =
                selectInteraction
                    .values[0];

            const command =
                client?.commands?.get(
                    commandName
                );


            if (
                !command ||
                typeof command.execute !==
                    "function"
            ) {

                return selectInteraction.reply({

                    content:
                        `❌ Lệnh **/${commandName}** chưa được nạp trong bot. Hãy kiểm tra file lệnh hoặc index.js.`,

                    ephemeral:
                        true
                });
            }


            try {

                await command.execute(
                    selectInteraction
                );

            } catch (error) {

                console.error(
                    `Lỗi chạy menu ${dao} -> /${commandName}:`,
                    error
                );


                if (
                    !selectInteraction.replied &&
                    !selectInteraction.deferred
                ) {

                    await selectInteraction.reply({

                        content:
                            `❌ Không thể mở chức năng **/${commandName}**. Kiểm tra file lệnh này có yêu cầu ChatInputCommandInteraction/options hay không.`,

                        ephemeral:
                            true
                    }).catch(
                        () => {}
                    );
                }
            }
        }
    );


    collector.on(
        "end",
        async () => {

            try {

                const rows =
                    message.components?.map(
                        row => {

                            const components =
                                row.components?.map(
                                    component => {

                                        if (
                                            component.type !==
                                            3
                                        ) {
                                            return component;
                                        }

                                        return {
                                            ...component,
                                            disabled: true
                                        };
                                    }
                                );

                            return {
                                ...row,
                                components
                            };
                        }
                    );


                if (rows) {

                    await message.edit({

                        components:
                            rows

                    }).catch(
                        () => {}
                    );
                }

            } catch (_) {}
        }
    );


    return collector;
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
    // KIỂM TRA ĐẠO
    // =================================================

    if (
        !DAO_PATHS[dao]
    ) {

        return interaction.update({

            content:
                "❌ Con đường tu luyện không hợp lệ.",

            embeds: [],

            components: []
        });
    }


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
    // ✨ TU VI BAN ĐẦU
    // =================================================

    const baseTuVi =
        Number(
            player.tuvi
        ) || 0;


    const tuVi =
        Math.floor(

            baseTuVi *

            (
                1 +
                daoBuff.tuVi / 100
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
                    tuVi,


                // ===============================
                // 📊 BUFF ĐẠO
                // ===============================

                daoBuff: {

                    tuVi:
                        daoBuff.tuVi,

                    hp:
                        daoBuff.hp,

                    linhLuc:
                        daoBuff.linhLuc,

                    cong:
                        daoBuff.cong,

                    thu:
                        daoBuff.thu,

                    tuLuyen:
                        daoBuff.tuLuyen,

                    dotPha:
                        daoBuff.dotPha,

                    hutMau:
                        daoBuff.hutMau
                }
            }
        );


    // =================================================
    // 📊 BUFF HIỂN THỊ
    // =================================================

    const buffText =
        getDaoBuffText(
            dao
        );


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

                `📊 **BUFF ${getDaoName(dao).toUpperCase()}**\n\n` +

                `${buffText}\n\n` +

                `━━━━━━━━━━━━━━━━━━━━\n\n` +

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

    const updatedMessage =
        await interaction.update({

            embeds: [
                embed,
                createDaoFunctionEmbed(
                    username,
                    dao,
                    player
                )
            ],

            components: [
                createDaoFunctionMenu(
                    userId,
                    dao
                )
            ],

            fetchReply:
                true
        });


    await attachDaoFunctionMenu(

        updatedMessage,

        interaction.client,

        userId,

        dao
    );


    return updatedMessage;
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


            const dao =
                player.dao ||
                player.conDuong ||
                "chinhdao";


            const existingMessage =
                await interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                getDaoColor(
                                    dao
                                )
                            )

                            .setTitle(
                                "🌌 HỒNG HOANG ĐẠI LỤC"
                            )

                            .setDescription(

                                `⚠️ **${username}** đã có nhân vật tại Hồng Hoang.\n\n` +

                                `🌌 **Con đường:** ${getDaoName(dao)}\n\n` +

                                `📊 **Buff hiện tại:**\n` +

                                `${getDaoBuffText(dao)}\n\n` +

                                `🧬 **Linh Căn:** ${linhCanText}\n` +

                                `💠 **Phẩm cấp:** ${phamCapText}\n` +

                                `🌈 **Thuộc tính:** ${thuocTinhText}\n\n` +

                                `🌱 **Cảnh giới:** ${player.canhGioi || "Luyện Khí"} tầng ${player.tang || 1}\n` +

                                `⚔️ **Tu Vi:** ${Number(player.tuvi || 0).toLocaleString()}\n\n` +

                                `👇 Chọn chức năng ${getDaoName(dao)} ở menu bên dưới.`
                            )
                    ],

                    components: [

                        createDaoFunctionMenu(
                            userId,
                            dao
                        )
                    ],

                    fetchReply:
                        true
                });


            await attachDaoFunctionMenu(

                existingMessage,

                interaction.client,

                userId,

                dao
            );


            return existingMessage;
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

                                    `😈 Ma Đạo\n` +

                                    `🐺 Yêu Đạo`
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
