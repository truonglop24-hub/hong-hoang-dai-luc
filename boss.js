const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

const COOLDOWN = 30 * 60 * 1000;

// =====================================================
// DANH SÁCH BOSS
// =====================================================

const bosses = [
    {
        name: "🐺 Lang Yêu",
        hp: 800,
        reward: 300,
        item: "🐺 Lang Nha",
        dropChance: 100
    },
    {
        name: "🦂 Huyết Hạt Ma",
        hp: 1500,
        reward: 600,
        item: "🦂 Huyết Tinh",
        dropChance: 100
    },
    {
        name: "🐍 Thanh Xà Vương",
        hp: 2500,
        reward: 1000,
        item: "🐍 Thanh Xà Lân",
        dropChance: 100
    },
    {
        name: "🦅 Kim Sí Điểu",
        hp: 4000,
        reward: 1600,
        item: "🪶 Kim Sí Vũ",
        dropChance: 100
    },
    {
        name: "🐉 Hắc Long",
        hp: 6500,
        reward: 2500,
        item: "🐉 Hắc Long Lân",
        dropChance: 100
    },
    {
        name: "👹 Thao Thiết",
        hp: 9500,
        reward: 4000,
        item: "🦴 Thao Thiết Cốt",
        dropChance: 100
    },
    {
        name: "🔥 Chu Tước Ma Vương",
        hp: 14000,
        reward: 6500,
        item: "🔥 Chu Tước Hỏa Tinh",
        dropChance: 100
    },
    {
        name: "🌊 Huyền Vũ Ma Thần",
        hp: 20000,
        reward: 9000,
        item: "🐢 Huyền Vũ Giáp",
        dropChance: 100
    },
    {
        name: "⚡ Lôi Đình Ma Quân",
        hp: 28000,
        reward: 13000,
        item: "⚡ Lôi Đình Tinh",
        dropChance: 100
    },
    {
        name: "🌑 Cửu U Ma Đế",
        hp: 38000,
        reward: 18000,
        item: "🌑 Cửu U Hồn Tinh",
        dropChance: 100
    },
    {
        name: "👁️ Thiên Nhãn Ma Tôn",
        hp: 50000,
        reward: 25000,
        item: "👁️ Thiên Nhãn Tinh",
        dropChance: 100
    },
    {
        name: "☠️ Vạn Cổ Thi Ma",
        hp: 65000,
        reward: 33000,
        item: "☠️ Thi Ma Cốt",
        dropChance: 100
    },
    {
        name: "🌌 Hỗn Độn Ma Thần",
        hp: 85000,
        reward: 45000,
        item: "🌌 Hỗn Độn Tinh",
        dropChance: 100
    },
    {
        name: "👑 Hồng Hoang Ma Tổ",
        hp: 110000,
        reward: 60000,
        item: "🩸 Ma Tổ Chi Huyết",
        dropChance: 100
    },

    // =================================================
    // BOSS CUỐI
    // =================================================

    {
        name: "🔱 THIÊN ĐẠO MA THẦN",
        hp: 150000,
        reward: 100000,
        item: "🔱 Thiên Đạo Ma Hạch",
        dropChance: 100,
        keyDropChance: 0.5
    }
];

// =====================================================
// THÊM VẬT PHẨM
// =====================================================

function addItem(player, itemName, amount = 1) {
    if (!player.tuiDo) {
        player.tuiDo = {
            danDuoc: [],
            vatPham: [],
            linhThu: []
        };
    }

    if (!Array.isArray(player.tuiDo.vatPham)) {
        player.tuiDo.vatPham = [];
    }

    const list = player.tuiDo.vatPham;

    const foundObject = list.find(
        item =>
            typeof item === "object" &&
            item !== null &&
            String(item.name).toLowerCase() ===
                itemName.toLowerCase()
    );

    if (foundObject) {
        foundObject.amount =
            Number(foundObject.amount || 0) + amount;
        return;
    }

    const foundStringIndex = list.findIndex(
        item =>
            typeof item === "string" &&
            item.toLowerCase() === itemName.toLowerCase()
    );

    if (foundStringIndex !== -1) {
        list.splice(foundStringIndex, 1);

        list.push({
            name: itemName,
            amount: amount + 1
        });

        return;
    }

    list.push({
        name: itemName,
        amount
    });
}

// =====================================================
// TỶ LỆ
// =====================================================

function rollPercent(chance) {
    return Math.random() * 100 < chance;
}

// =====================================================
// COMMAND BOSS
// =====================================================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("boss")
        .setDescription("Thách đấu Boss Hồng Hoang"),

    async execute(interaction) {
        try {
            const p = getPlayer(interaction.user.id);

            if (!p) {
                return interaction.reply({
                    content: "⚠️ Hãy dùng `/batdau` trước.",
                    ephemeral: true
                });
            }

            // =================================================
            // COOLDOWN
            // =================================================

            const remaining =
                COOLDOWN -
                (Date.now() - (p.lastBoss || 0));

            if (remaining > 0) {
                return interaction.reply({
                    content:
                        `⏳ Boss chưa xuất hiện lại.\n` +
                        `Còn **${Math.ceil(
                            remaining / 60000
                        )} phút**.`,
                    ephemeral: true
                });
            }

            // =================================================
            // CHỌN BOSS
            // =================================================

            const boss =
                bosses[
                    Math.floor(
                        Math.random() * bosses.length
                    )
                ];

            // =================================================
            // SỨC CHIẾN ĐẤU
            // =================================================

            const playerPower =
                (Number(p.cong) || 0) * 2 +
                (Number(p.thu) || 0) +
                Math.floor(
                    (Number(p.linhLuc) || 0) / 10
                );

            const roll = Math.random() * 300;

            const win =
                playerPower + roll >= boss.hp;

            // =================================================
            // THUA
            // =================================================

            if (!win) {
                const hpMoi =
                    Math.max(
                        1,
                        (Number(p.hp) || 100) - 30
                    );

                updatePlayer(
                    interaction.user.id,
                    {
                        lastBoss: Date.now(),
                        hp: hpMoi
                    }
                );

                return interaction.reply({
                    content:
                        `💀 **${boss.name}** quá mạnh!\n\n` +
                        `⚔️ Sức chiến đấu: **${playerPower}**\n` +
                        `👹 HP Boss: **${boss.hp}**\n` +
                        `🎲 May mắn: **${Math.floor(roll)}**\n\n` +
                        `❤️ HP còn lại: **${hpMoi}**`
                });
            }

            // =================================================
            // THẮNG
            // =================================================

            const exp = Number(boss.reward) || 0;
            const stones = Number(boss.reward) || 0;

            // =================================================
            // COPY TÚI ĐỒ
            // =================================================

            const tuiDo = {
                ...(p.tuiDo || {}),

                danDuoc: Array.isArray(p.tuiDo?.danDuoc)
                    ? [...p.tuiDo.danDuoc]
                    : [],

                vatPham: Array.isArray(p.tuiDo?.vatPham)
                    ? [...p.tuiDo.vatPham]
                    : [],

                linhThu: Array.isArray(p.tuiDo?.linhThu)
                    ? [...p.tuiDo.linhThu]
                    : []
            };

            const playerTemp = {
                ...p,
                tuiDo
            };

            // =================================================
            // DROP VẬT PHẨM BOSS
            // =================================================

            let dropText = `🎁 **${boss.item} ×1**`;

            if (rollPercent(boss.dropChance)) {
                addItem(
                    playerTemp,
                    boss.item,
                    1
                );
            } else {
                dropText =
                    `❌ ${boss.item} không rơi`;
            }

            // =================================================
            // CHÌA KHÓA TIÊN GIỚI
            // =================================================

            let keyDropped = false;

            if (
                boss.keyDropChance &&
                rollPercent(boss.keyDropChance)
            ) {
                addItem(
                    playerTemp,
                    "🔑 Chìa Khóa Tiên Giới",
                    1
                );

                keyDropped = true;
            }

            // =================================================
            // LƯU
            // =================================================

            updatePlayer(
                interaction.user.id,
                {
                    lastBoss: Date.now(),

                    kinhNghiem:
                        (Number(p.kinhNghiem) || 0) +
                        exp,

                    linhThach:
                        (Number(p.linhThach) || 0) +
                        stones,

                    bossDaGiet:
                        (Number(p.bossDaGiet) || 0) +
                        1,

                    tuiDo: playerTemp.tuiDo
                }
            );

            // =================================================
            // EMBED
            // =================================================

            const embed =
                new EmbedBuilder()
                    .setTitle("🏆 BOSS BỊ ĐÁNH BẠI")
                    .setDescription(
                        `Bạn đã chém giết **${boss.name}**!`
                    )
                    .addFields(
                        {
                            name: "⚔️ Sức chiến đấu",
                            value: `${playerPower}`,
                            inline: true
                        },
                        {
                            name: "👹 HP Boss",
                            value: `${boss.hp}`,
                            inline: true
                        },
                        {
                            name: "✨ Kinh nghiệm",
                            value: `+${exp}`,
                            inline: true
                        },
                        {
                            name: "💎 Linh thạch",
                            value: `+${stones}`,
                            inline: true
                        },
                        {
                            name: "🎁 Vật phẩm rơi",
                            value: dropText,
                            inline: false
                        }
                    )
                    .setFooter({
                        text:
                            "Boss sẽ hồi sinh sau 30 phút"
                    });

            // =================================================
            // RƠI CHÌA KHÓA
            // =================================================

            if (keyDropped) {
                embed.addFields({
                    name: "🌟 ĐẠI CƠ DUYÊN!",
                    value:
                        "🔑 **CHÌA KHÓA TIÊN GIỚI ×1**\n" +
                        "Bạn đã may mắn nhận được chìa khóa mở đường lên Tiên Giới!",
                    inline: false
                });

                embed.setTitle(
                    "🌌 THIÊN ĐẠO GIÁNG LÂM!"
                );
            } else if (boss.keyDropChance) {
                embed.addFields({
                    name: "🔑 Chìa Khóa Tiên Giới",
                    value:
                        `Không rơi lần này.\n` +
                        `Tỷ lệ rơi: **${boss.keyDropChance}%**`,
                    inline: false
                });
            }

            return interaction.reply({
                embeds: [embed]
            });

        } catch (error) {
            console.error(
                "LỖI BOSS:",
                error
            );

            if (!interaction.replied) {
                return interaction.reply({
                    content:
                        "❌ Có lỗi xảy ra khi đánh Boss.",
                    ephemeral: true
                });
            }
        }
    }
};
