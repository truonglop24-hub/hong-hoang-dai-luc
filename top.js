const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getAllPlayers } = require("./database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("top")
        .setDescription("Xem bảng xếp hạng tu tiên"),

    async execute(interaction) {
        const players = getAllPlayers()
            .sort((a, b) =>
                (b.linhLuc + b.kinhNghiem + b.linhThach) -
                (a.linhLuc + a.kinhNghiem + a.linhThach)
            )
            .slice(0, 10);

        if (!players.length) {
            return interaction.reply("📜 Chưa có người tu luyện.");
        }

        const text = players.map((p, i) =>
            `**${i + 1}.** ${p.username} — ${p.canhGioi} ${p.tang} • 🔥 ${p.linhLuc}`
        ).join("\n");

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🏆 BẢNG XẾP HẠNG HỒNG HOANG")
                    .setDescription(text)
            ]
        });
    }
};
