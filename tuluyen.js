const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 15 * 1000;

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tuluyen")
        .setDescription("🧘 Tu luyện để nhận linh lực và kinh nghiệm"),

    async execute(interaction) {

        const p = getPlayer(interaction.user.id);

        // =================================================
        // CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {
            return interaction.reply({
                content: "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // BẾ QUAN
        // =================================================

        if (p.beQuan) {
            return interaction.reply({
                content:
                    "🧘 Bạn đang bế quan. Hãy dùng `/xuatquan` khi hoàn thành.",
                ephemeral: true
            });
        }

        // =================================================
        // COOLDOWN 15 GIÂY
        // =================================================

        const remaining =
            COOLDOWN - (Date.now() - (p.lastTrain || 0));

        if (remaining > 0) {
            return interaction.reply({
                content:
                    `⏳ Bạn cần chờ **${Math.ceil(
                        remaining / 1000
                    )} giây** nữa.`,
                ephemeral: true
            });
        }

        // =================================================
        // CẢNH GIỚI
        // =================================================

        const canhGioi =
            p.canhGioi || "Phàm Nhân";

        const tang =
            Number(p.tang) || 1;

        // =================================================
        // 🧘 TỐC ĐỘ TU LUYỆN BÌNH THƯỜNG
        // Không nhân theo cảnh giới
        // =================================================

        const speed = 1;

        // =================================================
        // 🧬 LINH CĂN
        // Linh căn vẫn được cộng % tốc độ
        // =================================================

        let linhCanBuff = 0;

        if (
            p.linhCan &&
            typeof p.linhCan === "object" &&
            p.linhCan.buff
        ) {
            linhCanBuff =
                Number(
                    p.linhCan.buff.tuLuyen
                ) || 0;
        }

        const buffMultiplier =
            1 + (linhCanBuff / 100);

        // =================================================
        // 🔥 LINH LỰC
        // Cơ bản: 20 - 50
        // =================================================

        const baseLinhLuc =
            Math.floor(
                Math.random() * 31
            ) + 20;

        const linhLuc =
            Math.floor(
                baseLinhLuc *
                speed *
                buffMultiplier
            );

        // =================================================
        // ✨ KINH NGHIỆM
        // Cơ bản: 10 - 30
        // =================================================

        const baseExp =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const exp =
            Math.floor(
                baseExp *
                speed *
                buffMultiplier
            );

        // =================================================
        // 💾 CẬP NHẬT DATA
        // =================================================

        updatePlayer(
            interaction.user.id,
            {
                linhLuc:
                    (Number(p.linhLuc) || 0)
                    + linhLuc,

                kinhNghiem:
                    (Number(p.kinhNghiem) || 0)
                    + exp,

                lastTrain:
                    Date.now()
            }
        );

        // =================================================
        // FORMAT SỐ
        // =================================================

        const format =
            value =>
                Number(value || 0)
                    .toLocaleString();

        // =================================================
        // EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x8e44ad)

                .setTitle(
                    "⚔️ TU LUYỆN THÀNH CÔNG"
                )

                .setDescription(
                    `**${interaction.user.username}** ` +
                    `vận chuyển linh khí trong kinh mạch.\n\n` +

                    `🌌 **Cảnh giới:** ` +
                    `**${canhGioi} tầng ${tang}**\n` +

                    `⚡ **Tốc độ tu luyện:** ` +
                    `**Bình thường ×1**`
                )

                .addFields(

                    {
                        name: "🔥 Linh lực",
                        value:
                            `+**${format(linhLuc)}**`,
                        inline: true
                    },

                    {
                        name: "✨ Kinh nghiệm",
                        value:
                            `+**${format(exp)}**`,
                        inline: true
                    },

                    {
                        name: "🧬 Linh căn",
                        value:
                            `+${linhCanBuff}%`,
                        inline: true
                    }

                )

                .setFooter({
                    text:
                        "⏳ Cooldown: 15 giây • Hồng Hoang Đại Lục"
                });

        // =================================================
        // TRẢ KẾT QUẢ
        // =================================================

        return interaction.reply({
            embeds: [embed]
        });
    }
};
