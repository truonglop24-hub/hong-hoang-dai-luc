const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 30 * 60 * 1000;

const bosses = [
    { name: "🐉 Hắc Long", hp: 400, reward: 250 },
    { name: "👹 Thao Thiết", hp: 550, reward: 350 },
    { name: "🔥 Chu Tước Ma Vương", hp: 700, reward: 500 },
    { name: "🌑 Cửu U Ma Đế", hp: 900, reward: 750 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boss")
        .setDescription("Thách đấu Boss Hồng Hoang"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        const remaining = COOLDOWN - (Date.now() - (p.lastBoss || 0));

        if (remaining > 0) {
            return interaction.reply({
                content: `⏳ Boss chưa xuất hiện lại. Còn **${Math.ceil(remaining / 60000)} phút**.`,
                ephemeral: true
            });
        }

        const boss = bosses[Math.floor(Math.random() * bosses.length)];
        const playerPower = p.cong * 2 + p.thu + Math.floor(p.linhLuc / 10);
        const roll = Math.random() * 300;
        const win = playerPower + roll >= boss.hp;

        if (!win) {
            updatePlayer(interaction.user.id, {
                lastBoss: Date.now(),
                hp: Math.max(1, p.hp - 30)
            });

            return interaction.reply({
                content:
                    `💀 **${boss.name}** quá mạnh!\n` +
                    `⚔️ Sức chiến đấu của bạn: **${playerPower}**\n` +
                    `❤️ HP còn: **${Math.max(1, p.hp - 30)}**`
            });
        }

        const exp = boss.reward;
        const stones = boss.reward;

        updatePlayer(interaction.user.id, {
            lastBoss: Date.now(),
            kinhNghiem: p.kinhNghiem + exp,
            linhThach: p.linhThach + stones,
            bossDaGiet: p.bossDaGiet + 1
        });

        const embed = new EmbedBuilder()
            .setTitle("🏆 BOSS BỊ ĐÁNH BẠI")
            .setDescription(`Bạn đã chém giết **${boss.name}**!`)
            .addFields(
                { name: "✨ Kinh nghiệm", value: `+${exp}`, inline: true },
                { name: "💎 Linh thạch", value: `+${stones}`, inline: true }
            )
            .setFooter({ text: "Boss sẽ hồi sinh sau 30 phút" });

        return interaction.reply({ embeds: [embed] });
    }
};
