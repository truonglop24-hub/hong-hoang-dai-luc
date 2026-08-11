const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db =
    require("./database");

// =====================================================
// /TUVI
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()

            .setName("tuvi")

            .setDescription(
                "📜 Xem thông tin tu vi và linh căn"
            ),

    async execute(
        interaction
    ) {

        const p =
            db.getPlayer(
                interaction.user.id
            );

        // =================================================
        // CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {

            return interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước để bước vào Hồng Hoang.",

                ephemeral:
                    true
            });
        }

        // =================================================
        // TU VI
        // =================================================

        const tuvi =
            Number(
                p.tuvi
            ) || 0;

        // =================================================
        // LINH CĂN
        // =================================================

        const linhCan =
            p.linhCan;

        let linhCanName =
            "❓ Chưa thức tỉnh";

        let phamCap =
            "Chưa xác định";

        let thuocTinh =
            "Chưa xác định";

        let moTa =
            "Chưa có linh căn.";

        let buff = {

            tuLuyen: 0,

            hp: 0,

            linhLuc: 0,

            cong: 0,

            thu: 0,

            dotPha: 0
        };

        if (
            linhCan &&
            typeof linhCan ===
                "object"
        ) {

            linhCanName =
                linhCan.ten ||
                linhCanName;

            phamCap =
                linhCan.phamCap ||
                phamCap;

            thuocTinh =
                linhCan.thuocTinh ||
                thuocTinh;

            moTa =
                linhCan.moTa ||
                moTa;

            if (
                linhCan.buff
            ) {

                buff = {

                    ...buff,

                    ...linhCan.buff
                };
            }

        } else if (
            typeof linhCan ===
            "string"
        ) {

            // =================================================
            // HỖ TRỢ DỮ LIỆU CŨ
            // =================================================

            linhCanName =
                linhCan;

        }

        // =================================================
        // FORMAT SỐ
        // =================================================

        const format =
            value =>
                Number(
                    value || 0
                ).toLocaleString();

        // =================================================
        // EMBED
        // =================================================

        const embed =

            new EmbedBuilder()

                .setColor(
                    0x8e44ad
                )

                .setTitle(

                    `📜 TU VI • ${interaction.user.username}`
                )

                .setDescription(

                    `🌌 **HỒNG HOANG ĐẠI LỤC**\n\n` +

                    `🧬 **${linhCanName}**`
                )

                // =================================================
                // LINH CĂN
                // =================================================

                .addFields(

                    {
                        name:
                            "💠 Phẩm cấp",

                        value:
                            `${phamCap}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🌈 Thuộc tính",

                        value:
                            `${thuocTinh}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "📜 Thiên phú",

                        value:
                            `${moTa}`,

                        inline:
                            false
                    },

                    // =================================================
                    // CẢNH GIỚI
                    // =================================================

                    {
                        name:
                            "🌱 Cảnh giới",

                        value:
                            `**${p.canhGioi || "Luyện Khí"} tầng ${p.tang || 1}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "⚔️ Tu Vi",

                        value:
                            `**${format(tuvi)}**`,

                        inline:
                            true
                    },

                    {
                        name:
                            "✨ Kinh nghiệm",

                        value:
                            `${format(p.kinhNghiem)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // TÀI NGUYÊN
                    // =================================================

                    {
                        name:
                            "🔥 Linh lực",

                        value:
                            `${format(p.linhLuc)}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "💎 Linh thạch",

                        value:
                            `${format(p.linhThach)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // CHỈ SỐ
                    // =================================================

                    {
                        name:
                            "❤️ HP",

                        value:
                            `${format(p.hp)} / ${format(p.maxHp)}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "⚔️ Công",

                        value:
                            `${format(p.cong)}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🛡️ Thủ",

                        value:
                            `${format(p.thu)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // THIÊN PHÚ
                    // =================================================

                    {
                        name:
                            "🌟 Thiên Phú Linh Căn",

                        value:

                            `⚔️ Tu luyện: **+${buff.tuLuyen}%**\n` +

                            `❤️ Sinh lực: **+${buff.hp}%**\n` +

                            `🔥 Linh lực: **+${buff.linhLuc}%**\n` +

                            `🗡️ Công: **+${buff.cong}%**\n` +

                            `🛡️ Thủ: **+${buff.thu}%**\n` +

                            `🌟 Đột phá: **+${buff.dotPha}%**`,

                        inline:
                            false
                    },

                    // =================================================
                    // THỐNG KÊ
                    // =================================================

                    {
                        name:
                            "🐉 Boss đã hạ",

                        value:
                            `${format(p.bossDaGiet)}`,

                        inline:
                            true
                    },

                    {
                        name:
                            "🏯 Phó bản",

                        value:
                            `${format(p.phoBanDaHoanThanh)}`,

                        inline:
                            true
                    }
                )

                .setFooter({

                    text:
                        "Hồng Hoang Đại Lục • Con đường chứng đạo"
                });

        return interaction.reply({

            embeds: [
                embed
            ]
        });
    }
};
