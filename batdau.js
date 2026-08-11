const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db =
    require("./database");

// =====================================================
// /BATDAU
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
        // KIỂM TRA NHÂN VẬT
        // =================================================

        let player =
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
                            0x3498db
                        )

                        .setTitle(
                            "🌌 HỒNG HOANG ĐẠI LỤC"
                        )

                        .setDescription(

                            `⚠️ **${username}** đã có nhân vật tại Hồng Hoang.\n\n` +

                            `🧬 **Linh Căn:** ${linhCanText}\n` +

                            `💠 **Phẩm cấp:** ${phamCapText}\n` +

                            `🌈 **Thuộc tính:** ${thuocTinhText}\n\n` +

                            `🌱 **Cảnh giới:** ${player.canhGioi || "Luyện Khí"} tầng ${player.tang || 1}\n` +

                            `⚔️ **Tu Vi:** ${(Number(player.tuvi) || 0).toLocaleString()}\n\n` +

                            `📜 Dùng \`/tuvi\` để xem toàn bộ thông tin.`
                        )

                ],

                ephemeral:
                    true
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
        // TÍNH CHỈ SỐ BAN ĐẦU
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
        // BUFF LINH CĂN
        // =================================================

        const buff =
            linhCan.buff || {};

        const hp =
            Math.round(
                baseHp *
                (
                    1 +
                    (
                        Number(
                            buff.hp
                        ) || 0
                    ) /
                    100
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
                    ) /
                    100
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
                    ) /
                    100
                )
            );

        // =================================================
        // LƯU NHÂN VẬT
        // =================================================

        player =
            db.updatePlayer(

                userId,

                {

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

                        thu
                }
            );

        // =================================================
        // FORMAT BUFF
        // =================================================

        const buffText =

            `⚔️ Tu luyện: **+${buff.tuLuyen || 0}%**\n` +

            `❤️ Sinh lực: **+${buff.hp || 0}%**\n` +

            `🔥 Linh lực: **+${buff.linhLuc || 0}%**\n` +

            `🗡️ Công: **+${buff.cong || 0}%**\n` +

            `🛡️ Thủ: **+${buff.thu || 0}%**\n` +

            `🌟 Đột phá: **+${buff.dotPha || 0}%**`;

        // =================================================
        // EMBED
        // =================================================

        const embed =

            new EmbedBuilder()

                .setColor(
                    0xf1c40f
                )

                .setTitle(
                    "🌌 HỒNG HOANG ĐẠI LỤC"
                )

                .setDescription(

                    `✨ **${username}** đã bước chân vào Hồng Hoang!\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🧬 **LINH CĂN THỨC TỈNH**\n\n` +

                    `## ${linhCan.ten}\n\n` +

                    `💠 **Phẩm cấp:** ${linhCan.phamCap}\n\n` +

                    `🌈 **Thuộc tính:** ${linhCan.thuocTinh}\n\n` +

                    `📜 ${linhCan.moTa}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `📊 **THIÊN PHÚ**\n\n` +

                    buffText +

                    `\n\n━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🌱 **Cảnh giới:** Luyện Khí tầng 1\n` +

                    `⚔️ **Tu Vi:** 0\n` +

                    `🔥 **Linh lực:** ${player.linhLuc}\n` +

                    `💎 **Linh thạch:** ${player.linhThach}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `⚔️ Con đường chứng đạo của ngươi... chính thức bắt đầu!`
                )

                .setFooter({

                    text:
                        "Hồng Hoang Đại Lục • Thiên mệnh đã định"
                });

        return interaction.reply({

            embeds: [
                embed
            ]
        });
    }
};
