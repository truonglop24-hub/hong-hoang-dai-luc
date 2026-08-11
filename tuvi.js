const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer
} = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tuvi")
        .setDescription("Xem thông tin tu vi của bản thân"),

    async execute(interaction) {

        // ==============================
        // LẤY DỮ LIỆU NGƯỜI CHƠI
        // ==============================

        const p = getPlayer(
            interaction.user.id
        );

        // ==============================
        // CHƯA CÓ NHÂN VẬT
        // ==============================

        if (!p) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // ==============================
        // TU VI
        // ==============================

        const tuvi =
            Number(p.tuvi) || 0;

        // ==============================
        // LINH THẠCH
        // ==============================

        const linhThach =
            Number(p.linhThach) || 0;

        // ==============================
        // TẠO BẢNG TU VI
        // ==============================

        const embed =
            new EmbedBuilder()
                .setTitle(
                    `📜 TU VI • ${interaction.user.username}`
                )
                .setDescription(
                    "━━━━━━━━━━━━━━━━━━━━"
                )
                .addFields(

                    // TU VI
                    {
                        name: "⚔️ Tu Vi",
                        value:
                            `**${tuvi.toLocaleString()}**`,
                        inline: true
                    },

                    // CẢNH GIỚI
                    {
                        name: "🌱 Cảnh giới",
                        value:
                            `${p.canhGioi} tầng ${p.tang}`,
                        inline: true
                    },

                    // LINH LỰC
                    {
                        name: "🔥 Linh lực",
                        value:
                            `${Number(p.linhLuc || 0).toLocaleString()}`,
                        inline: true
                    },

                    // LINH THẠCH
                    {
                        name: "💎 Linh thạch",
                        value:
                            `${linhThach.toLocaleString()}`,
                        inline: true
                    },

                    // HP
                    {
                        name: "❤️ HP",
                        value:
                            `${p.hp}/${p.maxHp}`,
                        inline: true
                    },

                    // CÔNG
                    {
                        name: "⚔️ Công",
                        value:
                            `${Number(p.cong || 0).toLocaleString()}`,
                        inline: true
                    },

                    // THỦ
                    {
                        name: "🛡️ Thủ",
                        value:
                            `${Number(p.thu || 0).toLocaleString()}`,
                        inline: true
                    },

                    // KINH NGHIỆM
                    {
                        name: "✨ Kinh nghiệm",
                        value:
                            `${Number(p.kinhNghiem || 0).toLocaleString()}`,
                        inline: true
                    },

                    // BOSS
                    {
                        name: "🐉 Boss đã hạ",
                        value:
                            `${Number(p.bossDaGiet || 0).toLocaleString()}`,
                        inline: true
                    },

                    // PHÓ BẢN
                    {
                        name: "🏯 Phó bản",
                        value:
                            `${Number(p.phoBanDaHoanThanh || 0).toLocaleString()}`,
                        inline: true
                    }
                )
                .setTimestamp();

        // ==============================
        // GỬI BẢNG
        // ==============================

        return interaction.reply({
            embeds: [embed]
        });
    }
};
