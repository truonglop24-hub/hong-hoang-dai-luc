const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    getAllPlayers
} = require("./database");

// =====================================================
// XẾP HẠNG LINH CĂN
// =====================================================

const LINH_CAN_RANK = {
    "Hồng Mông": 10,
    "Hỗn Độn": 9,
    "Hỗn Nguyên": 8,
    "Tiên Thiên": 7,
    "Thánh Phẩm": 6,
    "Thiên Phẩm": 5,
    "Địa Phẩm": 4,
    "Huyền Phẩm": 3,
    "Hoàng Phẩm": 2,
    "Phàm Phẩm": 1
};

// =====================================================
// TÍNH LỰC CHIẾN
// =====================================================

function getLucChien(player) {

    if (!player) return 0;

    const hp =
        Number(player.maxHp ?? player.hp ?? 100);

    const cong =
        Number(player.cong ?? 0);

    const thu =
        Number(player.thu ?? 0);

    const linhLuc =
        Number(player.linhLuc ?? 0);

    const tuvi =
        Number(player.tuvi ?? 0);

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

// =====================================================
// LẤY HẠNG LINH CĂN
// =====================================================

function getLinhCanRank(player) {

    if (!player || !player.linhCan) {
        return 0;
    }

    return (
        LINH_CAN_RANK[
            player.linhCan.phamCap
        ] || 0
    );
}

// =====================================================
// LẤY TÊN RANK
// =====================================================

function getRank(index) {

    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";

    return `**${index + 1}.**`;
}

// =====================================================
// COMMAND /TOP
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("top")

        .setDescription(
            "🏆 Bảng xếp hạng Hồng Hoang"
        )

        .addStringOption(option =>

            option
                .setName("loai")

                .setDescription(
                    "Chọn bảng xếp hạng"
                )

                .setRequired(true)

                .addChoices(

                    {
                        name: "💰 Giàu nhất",
                        value: "giau"
                    },

                    {
                        name: "⚔️ Lực chiến",
                        value: "lucchien"
                    },

                    {
                        name: "🌌 Linh căn",
                        value: "linhcan"
                    }

                )
        ),

    async execute(interaction) {

        const type =
            interaction.options.getString("loai");

        // =================================================
        // LẤY TOÀN BỘ PLAYER
        // =================================================

        let players =
            getAllPlayers();

        if (!players.length) {

            return interaction.reply({
                content:
                    "❌ Chưa có người chơi nào!",
                ephemeral: true
            });

        }

        // =================================================
        // TOP GIÀU
        // =================================================

        if (type === "giau") {

            players.sort((a, b) =>

                Number(b.linhThach || 0) -
                Number(a.linhThach || 0)

            );

        }

        // =================================================
        // TOP LỰC CHIẾN
        // =================================================

        if (type === "lucchien") {

            players.sort((a, b) =>

                getLucChien(b) -
                getLucChien(a)

            );

        }

        // =================================================
        // TOP LINH CĂN
        // =================================================

        if (type === "linhcan") {

            players.sort((a, b) => {

                const rankA =
                    getLinhCanRank(a);

                const rankB =
                    getLinhCanRank(b);

                // Ưu tiên phẩm cấp linh căn
                if (rankB !== rankA) {

                    return rankB - rankA;

                }

                // Nếu cùng phẩm cấp
                // thì xét lực chiến

                return (
                    getLucChien(b) -
                    getLucChien(a)
                );

            });

        }

        // =================================================
        // CHỈ LẤY TOP 10
        // =================================================

        players =
            players.slice(0, 10);

        // =================================================
        // TIÊU ĐỀ
        // =================================================

        let title = "";

        if (type === "giau") {

            title =
                "💰 TOP 10 GIÀU NHẤT";

        }

        if (type === "lucchien") {

            title =
                "⚔️ TOP 10 LỰC CHIẾN";

        }

        if (type === "linhcan") {

            title =
                "🌌 TOP 10 LINH CĂN";

        }

        // =================================================
        // TẠO DANH SÁCH
        // =================================================

        let description = "";

        players.forEach((player, index) => {

            const rank =
                getRank(index);

            // -----------------------------
            // GIÀU
            // -----------------------------

            if (type === "giau") {

                description +=
                    `${rank} **${player.username}**\n` +
                    `💰 **${Number(
                        player.linhThach || 0
                    ).toLocaleString()}** Linh Thạch\n\n`;

            }

            // -----------------------------
            // LỰC CHIẾN
            // -----------------------------

            if (type === "lucchien") {

                description +=
                    `${rank} **${player.username}**\n` +
                    `⚔️ **${getLucChien(
                        player
                    ).toLocaleString()}** Lực Chiến\n\n`;

            }

            // -----------------------------
            // LINH CĂN
            // -----------------------------

            if (type === "linhcan") {

                const linhCan =
                    player.linhCan;

                if (linhCan) {

                    description +=
                        `${rank} **${player.username}**\n` +
                        `🌌 ${linhCan.ten}\n` +
                        `✨ **${linhCan.phamCap}**\n` +
                        `⚔️ Lực chiến: **${getLucChien(
                            player
                        ).toLocaleString()}**\n\n`;

                } else {

                    description +=
                        `${rank} **${player.username}**\n` +
                        `🌌 Chưa có Linh Căn\n\n`;

                }

            }

        });

        // =================================================
        // HẠNG CỦA NGƯỜI ĐANG XEM
        // =================================================

        const me =
            getPlayer(
                interaction.user.id
            );

        let myRank = 0;

        if (me) {

            const all =
                getAllPlayers();

            if (type === "giau") {

                all.sort((a, b) =>

                    Number(b.linhThach || 0) -
                    Number(a.linhThach || 0)

                );

            }

            if (type === "lucchien") {

                all.sort((a, b) =>

                    getLucChien(b) -
                    getLucChien(a)

                );

            }

            if (type === "linhcan") {

                all.sort((a, b) => {

                    const rankA =
                        getLinhCanRank(a);

                    const rankB =
                        getLinhCanRank(b);

                    if (rankB !== rankA) {

                        return rankB - rankA;

                    }

                    return (
                        getLucChien(b) -
                        getLucChien(a)
                    );

                });

            }

            const index =
                all.findIndex(
                    p => p.id === me.id
                );

            if (index !== -1) {

                myRank =
                    index + 1;

            }

        }

        // =================================================
        // FOOTER
        // =================================================

        let footer =
            "🌌 Hồng Hoang Đại Lục";

        if (myRank > 0) {

            footer +=
                ` • Hạng của bạn: #${myRank}`;

        }

        // =================================================
        // EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setTitle(title)

                .setDescription(
                    description ||
                    "❌ Chưa có dữ liệu."
                )

                .setFooter({
                    text: footer
                });

        // =================================================
        // GỬI
        // =================================================

        return interaction.reply({

            embeds: [
                embed
            ]

        });

    }

};
