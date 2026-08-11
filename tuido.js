const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { getPlayer } = require("./database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tuido")
        .setDescription("🎒 Xem túi đồ"),

    async execute(interaction) {

        const p =
            getPlayer(interaction.user.id);

        if (!p) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const tuiDo =
            p.tuiDo || {};

        const dan =
            tuiDo.danDuoc || [];

        const vatPham =
            tuiDo.vatPham || [];

        const linhThu =
            tuiDo.linhThu || [];

        const congPhap =
            tuiDo.congPhap || [];

        const phapBao =
            tuiDo.phapBao || [];

        const buaChu =
            tuiDo.buaChu || [];

        const format = (list, mode = "normal") => {

            if (!list.length) {
                return "Trống";
            }

            return list
                .map(item => {

                    if (typeof item === "string") {
                        return `• ${item}`;
                    }

                    if (mode === "pet") {
                        return `• ${item.name} — ⚔️ +${item.bonus || 0} Công`;
                    }

                    if (mode === "congphap") {
                        return `• ${item.name} — ✨ +${item.bonus || 0}% tu luyện`;
                    }

                    if (item.bonus) {
                        return `• ${item.name} — +${item.bonus}`;
                    }

                    return `• ${item.name}`;

                })
                .join("\n");
        };

        const embed =
            new EmbedBuilder()

                .setColor(0x8e44ad)

                .setTitle(
                    `🎒 TÚI ĐỒ • ${p.username}`
                )

                .addFields(

                    {
                        name: "💊 Đan dược",
                        value: format(dan),
                        inline: false
                    },

                    {
                        name: "📦 Vật phẩm",
                        value: format(vatPham),
                        inline: false
                    },

                    {
                        name: "📜 Công pháp",
                        value: format(
                            congPhap,
                            "congphap"
                        ),
                        inline: false
                    },

                    {
                        name: "🐉 Linh thú",
                        value: format(
                            linhThu,
                            "pet"
                        ),
                        inline: false
                    },

                    {
                        name: "⚔️ Pháp bảo",
                        value: format(phapBao),
                        inline: false
                    },

                    {
                        name: "🧿 Bùa chú",
                        value: format(buaChu),
                        inline: false
                    }
                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
