const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getPlayer } = require("./database");

const challenges = new Map();

function getLucChien(player) {
    if (!player) return 0;

    const hp = Number(player.maxHp ?? player.hp ?? 100);
    const cong = Number(player.cong ?? 0);
    const thu = Number(player.thu ?? 0);
    const linhLuc = Number(player.linhLuc ?? 0);
    const tuvi = Number(player.tuvi ?? 0);

    return Math.max(
        1,
        Math.floor(
            hp * 10 +
            cong * 100 +
            thu * 80 +
            linhLuc * 50 +
            Math.sqrt(Math.max(tuvi, 0)) * 10
        )
    );
}

function randomSkill() {
    const skills = [
        "🔥 Hồng Hoang Chưởng",
        "⚡ Cửu Thiên Lôi Quyết",
        "🌌 Hỗn Độn Kiếm Quyết",
        "🌪️ Phong Thần Bộ",
        "❄️ Băng Phong Vạn Lý",
        "☯️ Âm Dương Đại Đạo",
        "🌑 U Minh Quỷ Trảo",
        "☀️ Đại Nhật Thần Quang"
    ];

    return skills[Math.floor(Math.random() * skills.length)];
}

function fight(player1, player2) {
    let hp1 = 100;
    let hp2 = 100;

    const luc1 = getLucChien(player1);
    const luc2 = getLucChien(player2);

    const log = [];

    let turn = 0;

    while (hp1 > 0 && hp2 > 0 && turn < 10) {
        turn++;

        // Lợi thế lực chiến nhưng vẫn có random
        const chance1 =
            Math.min(85, Math.max(15, 50 + ((luc1 - luc2) / Math.max(luc1, luc2)) * 35));

        const attack1 = Math.random() * 100 < chance1;

        if (attack1) {
            let damage = Math.floor(8 + Math.random() * 20);

            // Chí mạng
            if (Math.random() < 0.15) {
                damage *= 2;
                log.push(
                    `💥 **${player1.username}** dùng **${randomSkill()}** → **CHÍ MẠNG ${damage} sát thương!**`
                );
            } else {
                log.push(
                    `⚔️ **${player1.username}** dùng **${randomSkill()}** → ${damage} sát thương!`
                );
            }

            hp2 -= damage;
        } else {
            let damage = Math.floor(8 + Math.random() * 20);

            if (Math.random() < 0.15) {
                damage *= 2;

                log.push(
                    `💥 **${player2.username}** dùng **${randomSkill()}** → **CHÍ MẠNG ${damage} sát thương!**`
                );
            } else {
                log.push(
                    `⚔️ **${player2.username}** dùng **${randomSkill()}** → ${damage} sát thương!`
                );
            }

            hp1 -= damage;
        }

        // Né đòn
        if (Math.random() < 0.10) {
            if (Math.random() < 0.5) {
                hp1 += 5;
                log.push(`🛡️ **${player1.username}** né được một đòn và hồi lại chút HP!`);
            } else {
                hp2 += 5;
                log.push(`🛡️ **${player2.username}** né được một đòn và hồi lại chút HP!`);
            }
        }
    }

    const winner =
        hp1 > hp2
            ? player1
            : hp2 > hp1
                ? player2
                : Math.random() < 0.5
                    ? player1
                    : player2;

    return {
        winner,
        hp1: Math.max(0, hp1),
        hp2: Math.max(0, hp2),
        log
    };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pvp")
        .setDescription("⚔️ PvP vui vẻ với người chơi khác")
        .addUserOption(option =>
            option
                .setName("nguoi_choi")
                .setDescription("Người muốn thách đấu")
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("nguoi_choi");

        if (target.bot) {
            return interaction.reply({
                content: "❌ Không thể PvP với bot!",
                ephemeral: true
            });
        }

        if (target.id === interaction.user.id) {
            return interaction.reply({
                content: "❌ Không thể tự PvP với chính mình!",
                ephemeral: true
            });
        }

        const challenger = getPlayer(interaction.user.id);
        const opponent = getPlayer(target.id);

        if (!challenger) {
            return interaction.reply({
                content: "❌ Bạn chưa bắt đầu tu luyện! Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        if (!opponent) {
            return interaction.reply({
                content: `❌ **${target.username}** chưa bắt đầu tu luyện!`,
                ephemeral: true
            });
        }

        const key = `${interaction.user.id}-${target.id}`;

        if (challenges.has(key)) {
            return interaction.reply({
                content: "⚠️ Lời thách đấu này đang chờ đối phương!",
                ephemeral: true
            });
        }

        const luc1 = getLucChien(challenger);
        const luc2 = getLucChien(opponent);

        const embed = new EmbedBuilder()
            .setTitle("⚔️ THÁCH ĐẤU HỒNG HOANG")
            .setDescription(
                `**${interaction.user.username}** đã gửi lời thách đấu tới **${target.username}**!\n\n` +
                `⚔️ Lực chiến: **${luc1.toLocaleString()}**\n` +
                `⚔️ Lực chiến đối thủ: **${luc2.toLocaleString()}**\n\n` +
                `❤️ PvP chỉ để vui vẻ — **không mất Tu Vi, Linh Thạch hay vật phẩm.**`
            )
            .setFooter({
                text: "Lời mời sẽ hết hạn sau 30 giây."
            });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`pvp_accept_${interaction.user.id}_${target.id}`)
                .setLabel("⚔️ Chấp nhận")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`pvp_decline_${interaction.user.id}_${target.id}`)
                .setLabel("❌ Từ chối")
                .setStyle(ButtonStyle.Danger)
        );

        challenges.set(key, Date.now());

        await interaction.reply({
            content: `<@${target.id}>`,
            embeds: [embed],
            components: [row]
        });

        setTimeout(() => {
            if (!challenges.has(key)) return;

            challenges.delete(key);

            interaction.editReply({
                content: "⌛ Lời thách đấu đã hết hạn.",
                embeds: [],
                components: []
            }).catch(() => {});
        }, 30000);
    },

    async handleButton(interaction) {
        const id = interaction.customId;

        if (!id.startsWith("pvp_")) return;

        const parts = id.split("_");

        const action = parts[1];
        const challengerId = parts[2];
        const opponentId = parts[3];

        const key = `${challengerId}-${opponentId}`;

        if (!challenges.has(key)) {
            return interaction.reply({
                content: "⌛ Lời thách đấu đã hết hạn.",
                ephemeral: true
            });
        }

        if (interaction.user.id !== opponentId) {
            return interaction.reply({
                content: "❌ Chỉ người được thách đấu mới có thể chọn!",
                ephemeral: true
            });
        }

        challenges.delete(key);

        if (action === "decline") {
            return interaction.update({
                content: `❌ **${interaction.user.username}** đã từ chối lời thách đấu.`,
                embeds: [],
                components: []
            });
        }

        const player1 = getPlayer(challengerId);
        const player2 = getPlayer(opponentId);

        if (!player1 || !player2) {
            return interaction.update({
                content: "❌ Không thể bắt đầu trận PvP.",
                embeds: [],
                components: []
            });
        }

        const result = fight(player1, player2);

        const embed = new EmbedBuilder()
            .setTitle("⚔️ ĐẠI CHIẾN HỒNG HOANG")
            .setDescription(
                `🔥 **${player1.username}** VS **${player2.username}**\n\n` +
                result.log.slice(0, 8).join("\n") +
                `\n\n🏆 **${result.winner.username} CHIẾN THẮNG!**\n\n` +
                `❤️ ${player1.username}: **${result.hp1} HP**\n` +
                `❤️ ${player2.username}: **${result.hp2} HP**\n\n` +
                `🎁 Đây là PvP vui vẻ — **không mất tài nguyên!**`
            );

        return interaction.update({
            content: "⚔️ **TRẬN ĐẤU KẾT THÚC!**",
            embeds: [embed],
            components: []
        });
    }
};

module.exports.getLucChien = getLucChien;
