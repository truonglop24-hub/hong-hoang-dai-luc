const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    db
} = require("../../database/database");

const realms = require("./data/realms");

const cooldowns = new Map();

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tu-luyen")
        .setDescription("Tu luyện để gia tăng tu vi"),

    async execute(interaction) {

        const userId = interaction.user.id;

        // Kiểm tra nhân vật
        const player = getPlayer(userId);

        if (!player) {
            return interaction.reply({
                content:
                    "❌ Bạn chưa bước vào con đường tu tiên!\n" +
                    "Hãy sử dụng `/batdau` trước.",
                ephemeral: true
            });
        }

        // Cooldown 60 giây
        const now = Date.now();
        const cooldown = cooldowns.get(userId) || 0;

        if (now < cooldown) {

            const remaining =
                Math.ceil((cooldown - now) / 1000);

            return interaction.reply({
                content:
                    `⏳ Đạo hữu cần tĩnh tâm thêm **${remaining} giây**.`,
                ephemeral: true
            });
        }

        // Đặt cooldown
        cooldowns.set(
            userId,
            now + 60 * 1000
        );

        // Tu vi cơ bản
        let amount =
            Math.floor(Math.random() * 501) + 500;

        // Linh căn
        let rootBonus = 1;

        switch (player.spirit_root) {

            case "Hỗn Độn":
                rootBonus = 2.0;
                break;

            case "Ngũ Hành":
                rootBonus = 1.5;
                break;

            case "Thiên Linh":
                rootBonus = 1.3;
                break;

            default:
                rootBonus = 1;
        }

        // Thiên phú
        let talentBonus = 1;

        switch (player.talent) {

            case "Hồng Mông Đạo Thể":
                talentBonus = 2.0;
                break;

            case "Hỗn Độn Thể":
                talentBonus = 1.7;
                break;

            case "Thiên Linh Thể":
                talentBonus = 1.4;
                break;

            case "Linh Thể":
                talentBonus = 1.2;
                break;

            default:
                talentBonus = 1;
        }

        // Khí vận
        const luckBonus =
            1 + (player.luck * 0.01);

        // Tổng tu vi nhận được
        amount = Math.floor(
            amount *
            rootBonus *
            talentBonus *
            luckBonus
        );

        // Sự kiện ngộ đạo
        let eventText =
            "🧘 Đạo hữu bình tâm tu luyện.";

        const random =
            Math.random();

        if (random < 0.05) {

            const bonus =
                Math.floor(amount * 2);

            amount += bonus;

            eventText =
                "🌌 **NGỘ ĐẠO!**\n" +
                `Đạo vận hiển hóa, nhận thêm **${bonus} tu vi**!`;
        }

        // Tẩu hỏa nhập ma
        else if (random > 0.97) {

            const loss =
                Math.floor(amount * 0.3);

            amount -= loss;

            if (amount < 0) {
                amount = 0;
            }

            eventText =
                "😈 **TẨU HỎA NHẬP MA!**\n" +
                `Tâm ma quấy nhiễu, mất **${loss} tu vi**!`;
        }

        // Cộng tu vi vào database
        db.prepare(`
            UPDATE players
            SET cultivation = cultivation + ?
            WHERE user_id = ?
        `).run(
            amount,
            userId
        );

        // Lấy dữ liệu mới
        const updated =
            getPlayer(userId);

        const realm =
            realms.find(
                r => r.id === updated.realm
            );

        const maxCultivation =
            realm
                ? realm.maxCultivation
                : 1000;

        const embed =
            new EmbedBuilder()
                .setTitle("🧘 Tu Luyện Hồng Hoang")
                .setDescription(
                    `**${updated.name}** đang vận chuyển linh khí trong cơ thể...`
                )
                .addFields(
                    {
                        name: "✨ Tu vi nhận được",
                        value: `+${amount}`,
                        inline: true
                    },
                    {
                        name: "🌀 Tu vi hiện tại",
                        value:
                            `${updated.cultivation}/${maxCultivation}`,
                        inline: true
                    },
                    {
                        name: "🌿 Linh căn",
                        value:
                            updated.spirit_root,
                        inline: true
                    },
                    {
                        name: "⭐ Thiên phú",
                        value:
                            updated.talent,
                        inline: true
                    },
                    {
                        name: "🍀 Khí vận",
                        value:
                            `${updated.luck}`,
                        inline: true
                    },
                    {
                        name: "📜 Đạo vận",
                        value:
                            eventText,
                        inline: false
                    }
                )
                .setFooter({
                    text:
                        "⏳ Có thể tu luyện lại sau 60 giây."
                });

        await interaction.reply({
            embeds: [embed]
        });
    }
};
