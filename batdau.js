const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const db =
    require("./database");

// =====================================================
// ⚔️ /BATDAU
// =====================================================
// Khi người chơi chưa có nhân vật:
//
// /batdau
//      ↓
// Chọn con đường
//      ↓
// ⚔️ Chính Đạo
// ☠️ Ma Đạo
//
// Người đã có nhân vật sẽ không bị tạo lại.
// =====================================================


module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("batdau")
            .setDescription(
                "🌌 Bắt đầu con đường tu luyện tại Hồng Hoang"
            ),


    async execute(
        interaction
    ) {

        const userId =
            interaction.user.id;

        const username =
            interaction.user.username;


        // =================================================
        // 🔍 KIỂM TRA NHÂN VẬT
        // =================================================

        let player =
            db.getPlayer(
                userId
            );


        // =================================================
        // 👤 ĐÃ CÓ NHÂN VẬT
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


            // =============================================
            // ⚔️ HIỂN THỊ CON ĐƯỜNG
            // =============================================

            let daoText =
                "⚔️ Chính Đạo";

            if (
                player.dao ===
                    "madao" ||
                player.conDuong ===
                    "madao"
            ) {

                daoText =
                    "☠️ Ma Đạo";
            }


            // =============================================
            // ☠️ THÔNG TIN MA ĐẠO
            // =============================================

            let maDaoText =
                "";

            if (
                player.dao ===
                    "madao" ||
                player.conDuong ===
                    "madao"
            ) {

                maDaoText =
                    `\n☠️ **Ma Tu Vi:** ${
                        Number(
                            player.maTuVi ||
                            0
                        ).toLocaleString()
                    }\n` +

                    `👹 **Cảnh giới Ma Đạo:** ${
                        player.maCanhGioi ||
                        "Ma Đồ"
                    } tầng ${
                        player.maTang ||
                        1
                    }\n`;
            }


            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(
                            player.dao ===
                                "madao"
                                ? 0x8b0000
                                : 0x3498db
                        )

                        .setTitle(
                            "🌌 HỒNG HOANG ĐẠI LỤC"
                        )

                        .setDescription(

                            `⚠️ **${username}** đã có nhân vật tại Hồng Hoang.\n\n` +

                            `🛤️ **Con đường:** ${daoText}\n\n` +

                            `🧬 **Linh Căn:** ${linhCanText}\n` +

                            `💠 **Phẩm cấp:** ${phamCapText}\n` +

                            `🌈 **Thuộc tính:** ${thuocTinhText}\n\n` +

                            `🌱 **Cảnh giới:** ${
                                player.canhGioi ||
                                "Luyện Khí"
                            } tầng ${
                                player.tang ||
                                1
                            }\n` +

                            `⚔️ **Tu Vi:** ${
                                Number(
                                    player.tuvi
                                ).toLocaleString()
                            }\n` +

                            maDaoText +

                            `\n📜 Dùng \`/tuvi\` để xem toàn bộ thông tin.`
                        )

                ],

                ephemeral:
                    true
            });
        }


        // =================================================
        // 🛤️ CHỌN CON ĐƯỜNG
        // =================================================

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId(
                    `batdau_conduong_${userId}`
                )

                .setPlaceholder(
                    "🛤️ Chọn con đường tu luyện..."
                )

                .addOptions([

                    // =========================================
                    // ⚔️ CHÍNH ĐẠO
                    // =========================================

                    {
                        label:
                            "⚔️ Chính Đạo",

                        description:
                            "Tu luyện linh lực, chứng đạo thành tiên",

                        value:
                            "chinhdao",

                        emoji:
                            "⚔️"
                    },


                    // =========================================
                    // ☠️ MA ĐẠO
                    // =========================================

                    {
                        label:
                            "☠️ Ma Đạo",

                        description:
                            "Tu luyện ma khí, bước lên con đường Ma Tổ",

                        value:
                            "madao",

                        emoji:
                            "☠️"
                    }

                ]);


        const row =
            new ActionRowBuilder()
                .addComponents(
                    menu
                );


        // =================================================
        // 🌌 EMBED CHỌN ĐẠO
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    0x8e44ad
                )

                .setTitle(
                    "🌌 HỒNG HOANG ĐẠI LỤC"
                )

                .setDescription(

                    `✨ **${username}**, ngươi đã bước vào Hồng Hoang.\n\n` +

                    `## 🛤️ HÃY CHỌN CON ĐƯỜNG CỦA NGƯƠI\n\n` +

                    `⚔️ **CHÍNH ĐẠO**\n` +
                    `> Tu luyện linh lực, hấp thu thiên địa linh khí.\n` +
                    `> Cảnh giới: **Luyện Khí → Đại Đạo**\n\n` +

                    `☠️ **MA ĐẠO**\n` +
                    `> Tu luyện ma khí, thôn phệ vạn vật, nghịch thiên chứng đạo.\n` +
                    `> Cảnh giới: **Ma Đồ → Ma Đạo Chí Tôn**\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `⚠️ **Hãy lựa chọn cẩn thận!**\n` +
                    `Con đường được chọn sẽ trở thành con đường tu luyện của ngươi.`
                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục • Thiên mệnh đã định"
                });


        // =================================================
        // 📤 GỬI MENU
        // =================================================

        return interaction.reply({

            embeds: [
                embed
            ],

            components: [
                row
            ],

            ephemeral:
                true
        });
    },


    // =====================================================
    // 🔽 XỬ LÝ SELECT MENU
    // =====================================================

    async handleSelect(
        interaction
    ) {

        const customId =
            interaction.customId || "";


        // Không phải menu của /batdau
        if (
            !customId.startsWith(
                "batdau_conduong_"
            )
        ) {

            return false;
        }


        // =================================================
        // 🔒 LẤY USER ID TỪ MENU
        // =================================================

        const menuUserId =
            customId.replace(
                "batdau_conduong_",
                ""
            );


        // =================================================
        // 🚫 NGƯỜI KHÁC KHÔNG ĐƯỢC CHỌN
        // =================================================

        if (
            menuUserId !==
            interaction.user.id
        ) {

            return interaction.reply({

                content:
                    "❌ Menu này không dành cho bạn.",

                ephemeral:
                    true
            });
        }


        // =================================================
        // 🔍 KIỂM TRA PLAYER
        // =================================================

        let player =
            db.getPlayer(
                menuUserId
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
        // 🎯 LẤY CON ĐƯỜNG
        // =================================================

        const choice =
            interaction.values[0];


        if (
            choice !==
                "chinhdao" &&
            choice !==
                "madao"
        ) {

            return interaction.reply({

                content:
                    "❌ Lựa chọn không hợp lệ.",

                ephemeral:
                    true
            });
        }


        // =================================================
        // 👤 TẠO NHÂN VẬT
        // =================================================

        player =
            db.createPlayer(
                menuUserId,
                interaction.user.username
            );


        // =================================================
        // 🛤️ THIẾT LẬP CON ĐƯỜNG
        // =================================================

        let dao =
            "chinhdao";


        if (
            choice ===
            "madao"
        ) {

            dao =
                "madao";
        }


        // =================================================
        // 🧬 QUAY LINH CĂN
        // =================================================

        const linhCan =
            db.generateLinhCan();


        // =================================================
        // 📊 CHỈ SỐ BAN ĐẦU
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
        // 🌟 BUFF LINH CĂN
        // =================================================

        const buff =
            linhCan.buff ||
            {};


        const hp =
            Math.round(

                baseHp *

                (
                    1 +

                    (
                        Number(
                            buff.hp
                        ) || 0
                    ) / 100
                )
            );


        const linhLuc =
            Math.round(

                baseLinhLuc +

                (
                    Number(
                        buff.linhLuc
                    ) || 0
                )
            );


        const cong =
            Math.round(

                baseCong *

                (
                    1 +

                    (
                        Number(
                            buff.cong
                        ) || 0
                    ) / 100
                )
            );


        const thu =
            Math.round(

                baseThu *

                (
                    1 +

                    (
                        Number(
                            buff.thu
                        ) || 0
                    ) / 100
                )
            );


        // =================================================
        // 💾 DATA CHUNG
        // =================================================

        const commonData = {

            linhCan:

                linhCan,

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

            dao:
                dao,

            conDuong:
                dao
        };


        // =================================================
        // ⚔️ CHÍNH ĐẠO
        // =================================================

        if (
            choice ===
            "chinhdao"
        ) {

            Object.assign(
                commonData,
                {

                    canhGioi:
                        "Luyện Khí",

                    tang:
                        1,

                    realm:
                        1,

                    tuvi:
                        0,

                    maTuVi:
                        0,

                    maCanhGioi:
                        null,

                    maTang:
                        0
                }
            );
        }


        // =================================================
        // ☠️ MA ĐẠO
        // =================================================

        if (
            choice ===
            "madao"
        ) {

            Object.assign(
                commonData,
                {

                    // =====================================
                    // CHỈ SỐ CHÍNH ĐẠO VẪN GIỮ
                    // =====================================

                    canhGioi:
                        "Luyện Khí",

                    tang:
                        1,

                    realm:
                        1,

                    tuvi:
                        0,


                    // =====================================
                    // ☠️ MA ĐẠO
                    // =====================================

                    maTuVi:
                        0,

                    maCanhGioi:
                        "Ma Đồ",

                    maTang:
                        1
                }
            );
        }


        // =================================================
        // 💾 LƯU NHÂN VẬT
        // =================================================

        player =
            db.updatePlayer(

                menuUserId,

                commonData
            );


        // =================================================
        // 📊 FORMAT BUFF
        // =================================================

        const buffText =

            `⚔️ Tu luyện: **+${buff.tuLuyen || 0}%**\n` +

            `❤️ Sinh lực: **+${buff.hp || 0}%**\n` +

            `🔥 Linh lực: **+${buff.linhLuc || 0}%**\n` +

            `🗡️ Công: **+${buff.cong || 0}%**\n` +

            `🛡️ Thủ: **+${buff.thu || 0}%**\n` +

            `🌟 Đột phá: **+${buff.dotPha || 0}%**`;


        // =================================================
        // ☠️ MA ĐẠO
        // =================================================

        if (
            choice ===
            "madao"
        ) {

            const embed =
                new EmbedBuilder()

                    .setColor(
                        0x8b0000
                    )

                    .setTitle(
                        "☠️ MA ĐẠO • HỒNG HOANG ĐẠI LỤC"
                    )

                    .setDescription(

                        `🩸 **${interaction.user.username}** đã lựa chọn con đường **MA ĐẠO**!\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `☠️ **CON ĐƯỜNG MA ĐẠO ĐÃ MỞ**\n\n` +

                        `👹 **Cảnh giới:** Ma Đồ\n` +

                        `⚫ **Tầng:** 1/9\n` +

                        `🩸 **Ma Tu Vi:** 0\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `📊 **Chỉ số ban đầu**\n\n` +

                        `❤️ HP: **+${hp}**\n` +

                        `⚔️ Công: **+${cong}**\n` +

                        `🛡️ Thủ: **+${thu}**\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `🧬 **Linh Căn thức tỉnh**\n\n` +

                        `## ${linhCan.ten}\n\n` +

                        `💠 **Phẩm cấp:** ${linhCan.phamCap}\n` +

                        `🌈 **Thuộc tính:** ${linhCan.thuocTinh}\n\n` +

                        `📜 ${linhCan.moTa}\n\n` +

                        `━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `📊 **Thiên Phú**\n\n` +

                        buffText +

                        `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +

                        `☠️ Ma Đạo đã được kích hoạt.\n` +

                        `🔥 Hãy dùng các lệnh Ma Đạo để bắt đầu tu luyện!`
                    )

                    .setFooter({

                        text:
                            "Hồng Hoang Đại Lục • Ma Đạo"
                    });


            return interaction.update({

                embeds: [
                    embed
                ],

                components: []
            });
        }


        // =================================================
        // ⚔️ CHÍNH ĐẠO
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    0xf1c40f
                )

                .setTitle(
                    "⚔️ CHÍNH ĐẠO • HỒNG HOANG ĐẠI LỤC"
                )

                .setDescription(

                    `✨ **${interaction.user.username}** đã lựa chọn **CHÍNH ĐẠO**!\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `⚔️ **CON ĐƯỜNG CHÍNH ĐẠO ĐÃ MỞ**\n\n` +

                    `🌱 **Cảnh giới:** Luyện Khí\n` +

                    `🔢 **Tầng:** 1\n` +

                    `⚔️ **Tu Vi:** 0\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🧬 **Linh Căn thức tỉnh**\n\n` +

                    `## ${linhCan.ten}\n\n` +

                    `💠 **Phẩm cấp:** ${linhCan.phamCap}\n` +

                    `🌈 **Thuộc tính:** ${linhCan.thuocTinh}\n\n` +

                    `📜 ${linhCan.moTa}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `📊 **Thiên Phú**\n\n` +

                    buffText +

                    `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `⚔️ Con đường chứng đạo của ngươi... chính thức bắt đầu!`
                )

                .setFooter({

                    text:
                        "Hồng Hoang Đại Lục • Chính Đạo"
                });


        return interaction.update({

            embeds: [
                embed
            ],

            components: []
        });
    }
};
