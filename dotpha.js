const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const realms = [
    { name: "Luyện Khí", max: 9, needExp: 100 },
    { name: "Trúc Cơ", max: 9, needExp: 250 },
    { name: "Kim Đan", max: 9, needExp: 500 },
    { name: "Nguyên Anh", max: 9, needExp: 1000 },
    { name: "Hóa Thần", max: 9, needExp: 2000 },
    { name: "Luyện Hư", max: 9, needExp: 4000 },
    { name: "Hợp Thể", max: 9, needExp: 8000 },
    { name: "Đại Thừa", max: 9, needExp: 16000 }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dotpha")
        .setDescription("Đột phá cảnh giới"),

    async execute(interaction) {
        const p = getPlayer(interaction.user.id);

        if (!p) return interaction.reply({ content: "⚠️ Hãy dùng `/batdau` trước.", ephemeral: true });

        const index = realms.findIndex(r => r.name === p.canhGioi);
        const realm = realms[index];

        if (!realm) return interaction.reply({ content: "❌ Cảnh giới dữ liệu không hợp lệ.", ephemeral: true });

        if (p.kinhNghiem < realm.needExp) {
            return interaction.reply({
                content: `❌ Chưa đủ kinh nghiệm. Cần **${realm.needExp}**, hiện có **${p.kinhNghiem}**.`,
                ephemeral: true
            });
        }

        const successRate = Math.min(95, 55 + p.tang * 4);
        const success = Math.random() * 100 < successRate;

        if (!success) {
            updatePlayer(interaction.user.id, {
                kinhNghiem: Math.max(0, p.kinhNghiem - Math.floor(realm.needExp * 0.15))
            });

            return interaction.reply({
                content: `⚡ **Đột phá thất bại!**\nTỷ lệ thành công: **${successRate}%**.\nBạn mất một phần kinh nghiệm.`,
            });
        }

        let newRealm = p.canhGioi;
        let newTier = p.tang + 1;

        if (newTier > realm.max) {
            if (!realms[index + 1]) {
                return interaction.reply("🌌 Bạn đã đạt cảnh giới cao nhất trong hệ thống hiện tại!");
            }

            newRealm = realms[index + 1].name;
            newTier = 1;
        }

        updatePlayer(interaction.user.id, {
            canhGioi: newRealm,
            tang: newTier,
            kinhNghiem: p.kinhNghiem - realm.needExp,
            maxHp: p.maxHp + 20,
            hp: p.maxHp + 20,
            cong: p.cong + 5,
            thu: p.thu + 3
        });

        const embed = new EmbedBuilder()
            .setTitle("⚡ ĐỘT PHÁ THÀNH CÔNG")
            .setDescription(`🌌 **${p.canhGioi} ${p.tang} → ${newRealm} ${newTier}**`)
            .addFields({
                name: "📈 Tỷ lệ thành công",
                value: `${successRate}%`
            });

        return interaction.reply({ embeds: [embed] });
    }
};
