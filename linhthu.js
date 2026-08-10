const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const pets = {
    "ho-ly": { name: "🦊 Hồ Ly", cost: 300, bonus: 8 },
    "bach-ho": { name: "🐯 Bạch Hổ", cost: 500, bonus: 15 },
    "thanh-long": { name: "🐉 Thanh Long", cost: 1000, bonus: 30 }
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName("linhthu")
        .setDescription("Quản lý linh thú")
        .addSubcommand(sub =>
            sub.setName("xem").setDescription("Xem linh thú đang sở hữu")
        )
        .addSubcommand(sub =>
            sub.setName("mua")
                .setDescription("Mua linh thú")
                .addStringOption(option =>
                    option.setName("loai")
                        .setDescription("Loại linh thú")
                        .setRequired(true)
                        .addChoices(
                            { name: "🦊 Hồ Ly - 300", value: "ho-ly" },
                            { name: "🐯 Bạch Hổ - 500", value: "bach-ho" },
                            { name: "🐉 Thanh Long - 1000", value: "thanh-long" }
                        )
                )
        ),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        if (interaction.options.getSubcommand() === "xem") {
            const petsOwned = p.tuiDo.linhThu || [];

            if (!petsOwned.length) {
                return interaction.reply("🐾 Bạn chưa sở hữu linh thú nào.");
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🐉 LINH THÚ CỦA BẠN")
                        .setDescription(
                            petsOwned.map((pet, i) =>
                                `${i + 1}. ${pet.name} • ⚔️ +${pet.bonus} công`
                            ).join("\n")
                        )
                ]
            });
        }

        const type = interaction.options.getString("loai");
        const pet = pets[type];

        if (p.linhThach < pet.cost) {
            return interaction.reply({
                content: `❌ Không đủ linh thạch. Cần **${pet.cost}**, bạn có **${p.linhThach}**.`,
                ephemeral: true
            });
        }

        const owned = [...(p.tuiDo.linhThu || []), pet];

        updatePlayer(interaction.user.id, {
            linhThach: p.linhThach - pet.cost,
            cong: p.cong + pet.bonus,
            tuiDo: {
                ...p.tuiDo,
                linhThu: owned
            }
        });

        return interaction.reply(
            `🎉 Bạn đã mua **${pet.name}**!\n` +
            `⚔️ Công lực tăng **+${pet.bonus}**.`
        );
    }
};
