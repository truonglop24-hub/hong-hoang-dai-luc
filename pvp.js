const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { getPlayer } = require("./database");

const challenges = new Map();

// =====================================================
// ⚔️ 😈 🐺 BUFF 3 ĐẠO
// =====================================================

const DAO_BUFFS = {
    chinhdao: {
        name: "⚔️ Chính Đạo",
        cong: 10,
        thu: 25,
        hp: 20,
        hutMau: 0
    },

    madao: {
        name: "😈 Ma Đạo",
        cong: 30,
        thu: -10,
        hp: 0,
        hutMau: 15
    },

    yeudao: {
        name: "🐺 Yêu Đạo",
        cong: 15,
        thu: 20,
        hp: 40,
        hutMau: 0
    }
};

// =====================================================
// 🔧 CHUẨN HÓA ĐẠO
// =====================================================

function normalizeDao(player) {

    const dao =
        player?.dao ||
        player?.conDuong ||
        player?.phuongDao ||
        "chinhdao";

    const value =
        String(dao)
            .toLowerCase()
            .trim();

    if (
        value === "madao" ||
        value === "ma dao" ||
        value.includes("ma đạo")
    ) {
        return "madao";
    }

    if (
        value === "yeudao" ||
        value === "yeu dao" ||
        value.includes("yêu đạo")
    ) {
        return "yeudao";
    }

    return "chinhdao";
}

function getDaoBuff(player) {
    return DAO_BUFFS[
        normalizeDao(player)
    ];
}

// =====================================================
// ⚔️ TÍNH LỰC CHIẾN
// =====================================================

function getLucChien(player) {

    if (!player) return 0;

    const buff =
        getDaoBuff(player);

    const hp =
        Number(
            player.maxHp ??
            player.hp ??
            100
        );

    const cong =
        Number(
            player.cong ??
            0
        );

    const thu =
        Number(
            player.thu ??
            0
        );

    const linhLuc =
        Number(
            player.linhLuc ??
            0
        );

    const tuvi =
        Number(
            player.tuvi ??
            0
        );

    // Buff HP
    const buffHp =
        hp *
        (1 + buff.hp / 100);

    // Buff Công
    const buffCong =
        cong *
        (1 + buff.cong / 100);

    // Buff Thủ
    const buffThu =
        Math.max(
            0,
            thu *
            (1 + buff.thu / 100)
        );

    return Math.max(
        1,
        Math.floor(

            buffHp * 10 +

            buffCong * 100 +

            buffThu * 80 +

            linhLuc * 50 +

            Math.sqrt(
                Math.max(
                    tuvi,
                    0
                )
            ) * 10

        )
    );
}

// =====================================================
// 🎯 RANDOM KỸ NĂNG
// =====================================================

function randomSkill(player) {

    const dao =
        normalizeDao(player);

    const skills = {

        chinhdao: [
            "🔥 Hồng Hoang Chưởng",
            "⚡ Cửu Thiên Lôi Quyết",
            "🌌 Hỗn Độn Kiếm Quyết",
            "☯️ Âm Dương Đại Đạo",
            "☀️ Đại Nhật Thần Quang"
        ],

        madao: [
            "😈 Ma Thần Huyết Trảo",
            "🩸 Huyết Sát Ma Công",
            "🌑 U Minh Quỷ Trảo",
            "💀 Thiên Ma Diệt Thế",
            "🔥 Tu La Ma Quyền"
        ],

        yeudao: [
            "🐺 Yêu Lang Thiên Trảo",
            "🐉 Long Hoàng Bá Quyền",
            "🦅 Kim Sí Thiên Vũ",
            "🐯 Bạch Hổ Sát",
            "🐍 Cửu Vĩ Yêu Hỏa"
        ]
    };

    const list =
        skills[dao] ||
        skills.chinhdao;

    return list[
        Math.floor(
            Math.random() *
            list.length
        )
    ];
}

// =====================================================
// ⚔️ TÍNH SÁT THƯƠNG
// =====================================================

function calculateDamage(
    attacker,
    defender
) {

    const buff =
        getDaoBuff(attacker);

    const attackerCong =
        Number(
            attacker.cong ??
            0
        ) *
        (
            1 +
            buff.cong / 100
        );

    const defenderThu =
        Number(
            defender.thu ??
            0
        ) *
        (
            1 +
            getDaoBuff(defender).thu /
            100
        );

    // Công - thủ có ảnh hưởng nhẹ
    const statDamage =
        Math.max(
            3,
            Math.floor(
                attackerCong /
                Math.max(
                    1,
                    1 +
                    defenderThu /
                    500
                )
            )
        );

    const randomDamage =
        Math.floor(
            8 +
            Math.random() *
            20
        );

    return Math.max(
        8,
        Math.floor(
            randomDamage +
            statDamage * 0.05
        )
    );
}

// =====================================================
// 🩸 HÚT MÁU MA ĐẠO
// =====================================================

function applyLifesteal(
    attacker,
    damage
) {

    const buff =
        getDaoBuff(attacker);

    if (
        buff.hutMau <= 0
    ) {
        return 0;
    }

    if (
        Math.random() >
        buff.hutMau / 100
    ) {
        return 0;
    }

    return Math.max(
        1,
        Math.floor(
            damage * 0.20
        )
    );
}

// =====================================================
// ⚔️ CHIẾN ĐẤU
// =====================================================

function fight(
    player1,
    player2
) {

    let hp1 = 100;
    let hp2 = 100;

    const luc1 =
        getLucChien(
            player1
        );

    const luc2 =
        getLucChien(
            player2
        );

    const buff1 =
        getDaoBuff(
            player1
        );

    const buff2 =
        getDaoBuff(
            player2
        );

    const log = [];

    let turn = 0;

    while (
        hp1 > 0 &&
        hp2 > 0 &&
        turn < 10
    ) {

        turn++;

        // =================================================
        // 🎯 TỶ LỆ ĐÁNH
        // =================================================

        const chance1 =
            Math.min(
                85,
                Math.max(
                    15,
                    50 +
                    (
                        (luc1 - luc2) /
                        Math.max(
                            luc1,
                            luc2
                        )
                    ) *
                    35
                )
            );

        const attack1 =
            Math.random() * 100 <
            chance1;

        // =================================================
        // PLAYER 1 ĐÁNH
        // =================================================

        if (attack1) {

            let damage =
                calculateDamage(
                    player1,
                    player2
                );

            let critical =
                false;

            if (
                Math.random() <
                0.15
            ) {

                damage *= 2;

                critical =
                    true;
            }

            const heal =
                applyLifesteal(
                    player1,
                    damage
                );

            hp2 -= damage;

            hp1 =
                Math.min(
                    100,
                    hp1 +
                    heal
                );

            if (critical) {

                log.push(

                    `💥 **${player1.username}** ` +
                    `(${buff1.name}) dùng ` +
                    `**${randomSkill(player1)}** → ` +
                    `**CHÍ MẠNG ${damage} sát thương!**`

                );

            } else {

                log.push(

                    `⚔️ **${player1.username}** ` +
                    `(${buff1.name}) dùng ` +
                    `**${randomSkill(player1)}** → ` +
                    `**${damage} sát thương!**`

                );
            }

            if (
                heal > 0
            ) {

                log.push(

                    `🩸 **${player1.username}** ` +
                    `hút ${heal} HP!`

                );
            }

        } else {

            // =================================================
            // PLAYER 2 ĐÁNH
            // =================================================

            let damage =
                calculateDamage(
                    player2,
                    player1
                );

            let critical =
                false;

            if (
                Math.random() <
                0.15
            ) {

                damage *= 2;

                critical =
                    true;
            }

            const heal =
                applyLifesteal(
                    player2,
                    damage
                );

            hp1 -= damage;

            hp2 =
                Math.min(
                    100,
                    hp2 +
                    heal
                );

            if (critical) {

                log.push(

                    `💥 **${player2.username}** ` +
                    `(${buff2.name}) dùng ` +
                    `**${randomSkill(player2)}** → ` +
                    `**CHÍ MẠNG ${damage} sát thương!**`

                );

            } else {

                log.push(

                    `⚔️ **${player2.username}** ` +
                    `(${buff2.name}) dùng ` +
                    `**${randomSkill(player2)}** → ` +
                    `**${damage} sát thương!**`

                );
            }

            if (
                heal > 0
            ) {

                log.push(

                    `🩸 **${player2.username}** ` +
                    `hút ${heal} HP!`

                );
            }
        }

        // =================================================
        // 🛡️ NÉ ĐÒN
        // =================================================

        if (
            Math.random() <
            0.10
        ) {

            if (
                Math.random() <
                0.5
            ) {

                hp1 += 5;

                log.push(
                    `🛡️ **${player1.username}** né được một đòn và hồi lại chút HP!`
                );

            } else {

                hp2 += 5;

                log.push(
                    `🛡️ **${player2.username}** né được một đòn và hồi lại chút HP!`
                );
            }
        }
    }

    // =================================================
    // 🏆 NGƯỜI THẮNG
    // =================================================

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

        hp1:
            Math.max(
                0,
                hp1
            ),

        hp2:
            Math.max(
                0,
                hp2
            ),

        log
    };
}

// =====================================================
// 📜 LỆNH /PVP
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName(
                "pvp"
            )

            .setDescription(
                "⚔️ PvP vui vẻ với người chơi khác"
            )

            .addUserOption(
                option =>

                    option

                        .setName(
                            "nguoi_choi"
                        )

                        .setDescription(
                            "Người muốn thách đấu"
                        )

                        .setRequired(
                            true
                        )
            ),

    // =================================================
    // ⚔️ EXECUTE
    // =================================================

    async execute(
        interaction
    ) {

        const target =
            interaction.options.getUser(
                "nguoi_choi"
            );

        // =================================================
        // BOT
        // =================================================

        if (
            target.bot
        ) {

            return interaction.reply({

                content:
                    "❌ Không thể PvP với bot!",

                ephemeral:
                    true
            });
        }

        // =================================================
        // TỰ ĐẤU
        // =================================================

        if (
            target.id ===
            interaction.user.id
        ) {

            return interaction.reply({

                content:
                    "❌ Không thể tự PvP với chính mình!",

                ephemeral:
                    true
            });
        }

        // =================================================
        // PLAYER
        // =================================================

        const challenger =
            getPlayer(
                interaction.user.id
            );

        const opponent =
            getPlayer(
                target.id
            );

        if (
            !challenger
        ) {

            return interaction.reply({

                content:
                    "❌ Bạn chưa bắt đầu tu luyện! Hãy dùng `/batdau` trước.",

                ephemeral:
                    true
            });
        }

        if (
            !opponent
        ) {

            return interaction.reply({

                content:
                    `❌ **${target.username}** chưa bắt đầu tu luyện!`,

                ephemeral:
                    true
            });
        }

        // =================================================
        // KEY
        // =================================================

        const key =
            `${interaction.user.id}-${target.id}`;

        if (
            challenges.has(key)
        ) {

            return interaction.reply({

                content:
                    "⚠️ Lời thách đấu này đang chờ đối phương!",

                ephemeral:
                    true
            });
        }

        // =================================================
        // LỰC CHIẾN
        // =================================================

        const luc1 =
            getLucChien(
                challenger
            );

        const luc2 =
            getLucChien(
                opponent
            );

        const dao1 =
            getDaoBuff(
                challenger
            );

        const dao2 =
            getDaoBuff(
                opponent
            );

        // =================================================
        // EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "⚔️ THÁCH ĐẤU HỒNG HOANG"
                )

                .setDescription(

                    `**${interaction.user.username}** đã gửi lời thách đấu tới **${target.username}**!\n\n` +

                    `🌌 Đạo: **${dao1.name}**\n` +

                    `⚔️ Lực chiến: **${luc1.toLocaleString()}**\n\n` +

                    `🌌 Đạo đối thủ: **${dao2.name}**\n` +

                    `⚔️ Lực chiến đối thủ: **${luc2.toLocaleString()}**\n\n` +

                    `❤️ PvP chỉ để vui vẻ — **không mất Tu Vi, Linh Thạch hay vật phẩm.**`

                )

                .setFooter({

                    text:
                        "Lời mời sẽ hết hạn sau 30 giây."
                });

        // =================================================
        // BUTTON
        // =================================================

        const row =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `pvp_accept_${interaction.user.id}_${target.id}`
                        )

                        .setLabel(
                            "⚔️ Chấp nhận"
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),

                    new ButtonBuilder()

                        .setCustomId(
                            `pvp_decline_${interaction.user.id}_${target.id}`
                        )

                        .setLabel(
                            "❌ Từ chối"
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        challenges.set(
            key,
            Date.now()
        );

        await interaction.reply({

            content:
                `<@${target.id}>`,

            embeds:
                [embed],

            components:
                [row]
        });

        // =================================================
        // ⏰ HẾT HẠN
        // =================================================

        setTimeout(
            () => {

                if (
                    !challenges.has(
                        key
                    )
                ) {
                    return;
                }

                challenges.delete(
                    key
                );

                interaction
                    .editReply({

                        content:
                            "⌛ Lời thách đấu đã hết hạn.",

                        embeds:
                            [],

                        components:
                            []

                    })
                    .catch(
                        () => {}
                    );

            },
            30000
        );
    },

    // =================================================
    // 🔘 HANDLE BUTTON
    // =================================================

    async handleButton(
        interaction
    ) {

        const id =
            interaction.customId;

        if (
            !id.startsWith(
                "pvp_"
            )
        ) {
            return;
        }

        const parts =
            id.split("_");

        const action =
            parts[1];

        const challengerId =
            parts[2];

        const opponentId =
            parts[3];

        const key =
            `${challengerId}-${opponentId}`;

        // =================================================
        // CHECK THÁCH ĐẤU
        // =================================================

        if (
            !challenges.has(
                key
            )
        ) {

            return interaction.reply({

                content:
                    "⌛ Lời thách đấu đã hết hạn.",

                ephemeral:
                    true
            });
        }

        // =================================================
        // CHECK NGƯỜI NHẬN
        // =================================================

        if (
            interaction.user.id !==
            opponentId
        ) {

            return interaction.reply({

                content:
                    "❌ Chỉ người được thách đấu mới có thể chọn!",

                ephemeral:
                    true
            });
        }

        challenges.delete(
            key
        );

        // =================================================
        // TỪ CHỐI
        // =================================================

        if (
            action ===
            "decline"
        ) {

            return interaction.update({

                content:
                    `❌ **${interaction.user.username}** đã từ chối lời thách đấu.`,

                embeds:
                    [],

                components:
                    []
            });
        }

        // =================================================
        // PLAYER
        // =================================================

        const player1 =
            getPlayer(
                challengerId
            );

        const player2 =
            getPlayer(
                opponentId
            );

        if (
            !player1 ||
            !player2
        ) {

            return interaction.update({

                content:
                    "❌ Không thể bắt đầu trận PvP.",

                embeds:
                    [],

                components:
                    []
            });
        }

        // =================================================
        // CHIẾN ĐẤU
        // =================================================

        const result =
            fight(
                player1,
                player2
            );

        const dao1 =
            getDaoBuff(
                player1
            );

        const dao2 =
            getDaoBuff(
                player2
            );

        // =================================================
        // KẾT QUẢ
        // =================================================

        const embed =
            new EmbedBuilder()

                .setTitle(
                    "⚔️ ĐẠI CHIẾN HỒNG HOANG"
                )

                .setDescription(

                    `🔥 **${player1.username}** VS **${player2.username}**\n\n` +

                    `🌌 ${dao1.name} VS ${dao2.name}\n\n` +

                    result.log
                        .slice(
                            0,
                            8
                        )
                        .join(
                            "\n"
                        ) +

                    `\n\n🏆 **${result.winner.username} CHIẾN THẮNG!**\n\n` +

                    `❤️ ${player1.username}: **${result.hp1} HP**\n` +

                    `❤️ ${player2.username}: **${result.hp2} HP**\n\n` +

                    `🎁 Đây là PvP vui vẻ — **không mất tài nguyên!**`

                );

        return interaction.update({

            content:
                "⚔️ **TRẬN ĐẤU KẾT THÚC!**",

            embeds:
                [embed],

            components:
                []
        });
    }
};

// =====================================================
// EXPORT LỰC CHIẾN
// =====================================================

module.exports.getLucChien =
    getLucChien;

module.exports.DAO_BUFFS =
    DAO_BUFFS;
