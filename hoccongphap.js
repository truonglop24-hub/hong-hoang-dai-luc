const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

const { congPhap } =
    require("./congphap");

module.exports = {

    data: new SlashCommandBuilder()

        .setName("hoccongphap")

        .setDescription(
            "📜 Học một công pháp"
        )

        .addStringOption(option =>
            option
                .setName("congphap")
                .setDescription(
                    "ID công pháp, xem bằng /congphap"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        const p =
            getPlayer(
                interaction.user.id
            );

        if (!p) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const id =
            interaction.options
                .getString("congphap");

        const cp =
            congPhap.find(
                x => x.id === id
            );

        if (!cp) {
            return interaction.reply({
                content:
                    "❌ Không tìm thấy công pháp này.",
                ephemeral: true
            });
        }

        const currentRealm =
            Number(p.realm) ||
            Number(p.canhGioiId) ||
            1;

        if (
            currentRealm <
            cp.requiredRealm
        ) {
            return interaction.reply({
                content:
                    `❌ Cảnh giới chưa đủ.\n\n` +
                    `📜 Công pháp: **${cp.name}**\n` +
                    `🔓 Yêu cầu: **Cảnh giới ${cp.requiredRealm}**\n` +
                    `⚔️ Hiện tại: **Cảnh giới ${currentRealm}**`,
                ephemeral: true
            });
        }

        const tuiDo =
            p.tuiDo || {};

        const owned =
            tuiDo.congPhap || [];

        const already =
            owned.some(item =>
                typeof item === "string"
                    ? item === cp.id
                    : item.id === cp.id
            );

        if (already) {
            return interaction.reply({
                content:
                    `📜 Bạn đã học **${cp.name}** rồi.`,
                ephemeral: true
            });
        }

        const newList = [
            ...owned,
            {
                id: cp.id,
                name: cp.name,
                requiredRealm:
                    cp.requiredRealm,
                bonus: cp.bonus
            }
        ];

        updatePlayer(
            interaction.user.id,
            {
                tuiDo: {
                    ...tuiDo,
                    congPhap: newList
                },

                // Buff cộng dồn
                congPhapBuff:
                    (Number(p.congPhapBuff) || 0) +
                    cp.bonus
            }
        );

        const embed =
            new EmbedBuilder()

                .setColor(0x9b59b6)

                .setTitle(
                    "📜 HỌC CÔNG PHÁP THÀNH CÔNG"
                )

                .setDescription(
                    `Đạo hữu đã lĩnh ngộ **${cp.name}**!`
                )

                .addFields(
                    {
                        name:
                            "✨ Tăng tu luyện",
                        value:
                            `+${cp.bonus}%`,
                        inline: true
                    },

                    {
                        name:
                            "🔓 Cảnh giới yêu cầu",
                        value:
                            `${cp.requiredRealm}`,
                        inline: true
                    }
                );

        return interaction.reply({
            embeds: [embed]
        });
    }
};
