const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// 🏪 DỮ LIỆU CỬA HÀNG
// =====================================================

const SHOP = {
    congPhap: {
        "hoa-van-quyet": {
            name: "🔥 Hỏa Vân Quyết",
            cost: 500,
            requiredRealm: 1,
            bonus: 10
        },
        "bang-tam-quyet": {
            name: "❄️ Băng Tâm Quyết",
            cost: 2500,
            requiredRealm: 2,
            bonus: 15
        },
        "cuu-thien-loi-quyet": {
            name: "⚡ Cửu Thiên Lôi Quyết",
            cost: 10000,
            requiredRealm: 5,
            bonus: 30
        },
        "hong-hoang-dao-kinh": {
            name: "🌌 Hồng Hoang Đạo Kinh",
            cost: 250000,
            requiredRealm: 10,
            bonus: 50
        },
        "dai-dao-kinh": {
            name: "☯️ Đại Đạo Kinh",
            cost: 2000000,
            requiredRealm: 16,
            bonus: 100
        }
    },

    danDuoc: {
        "tui-mau": {
            name: "❤️ Túi Hồi Máu",
            cost: 100
        },
        "dan-linh-luc": {
            name: "🔥 Đan Linh Lực",
            cost: 150
        },
        "dan-kinh-nghiem": {
            name: "✨ Đan Kinh Nghiệm",
            cost: 200
        },
        "dan-tu-vi": {
            name: "💠 Đan Tăng Tu Vi",
            cost: 1000
        },
        "dan-dot-pha": {
            name: "🌟 Đan Đột Phá",
            cost: 5000
        }
    },

    linhThu: {
        "ho-ly": {
            name: "🦊 Hồ Ly",
            cost: 300,
            bonus: 8
        },
        "bach-ho": {
            name: "🐯 Bạch Hổ",
            cost: 500,
            bonus: 15
        },
        "thanh-long": {
            name: "🐉 Thanh Long",
            cost: 1000,
            bonus: 30
        },
        "hoa-phuong": {
            name: "🔥 Hỏa Phượng",
            cost: 5000,
            bonus: 60
        },
        "ky-lan": {
            name: "🦄 Kỳ Lân",
            cost: 25000,
            bonus: 100
        }
    },

    phapBao: {
        "thanh-phong-kiem": {
            name: "⚔️ Thanh Phong Kiếm",
            cost: 5000,
            bonus: 20
        },
        "huyen-thiet-dao": {
            name: "🗡️ Huyền Thiết Đao",
            cost: 15000,
            bonus: 50
        },
        "tu-kim-chung": {
            name: "🔔 Tử Kim Chung",
            cost: 50000,
            bonus: 100
        },
        "tran-thien-thap": {
            name: "🏯 Trấn Thiên Tháp",
            cost: 250000,
            bonus: 250
        },
        "hong-hoang-than-khi": {
            name: "🌌 Hồng Hoang Thần Khí",
            cost: 2000000,
            bonus: 1000
        }
    },

    buaChu: {
        "bua-tang-cong": {
            name: "⚔️ Bùa Tăng Công",
            cost: 1000,
            bonus: 20
        },
        "bua-tang-thu": {
            name: "🛡️ Bùa Tăng Thủ",
            cost: 1000,
            bonus: 20
        },
        "bua-ho-menh": {
            name: "❤️ Bùa Hộ Mệnh",
            cost: 1500,
            bonus: 30
        },
        "bua-tu-luyen": {
            name: "✨ Bùa Tụ Linh",
            cost: 3000,
            bonus: 25
        },
        "bua-ho-than": {
            name: "🌟 Bùa Hộ Thần",
            cost: 10000,
            bonus: 100
        }
    }
};

// =====================================================
// TÊN DANH MỤC
// =====================================================

const CATEGORY_NAME = {
    congPhap: "📜 Công pháp",
    danDuoc: "💊 Đan dược",
    linhThu: "🐉 Linh thú",
    phapBao: "⚔️ Pháp bảo",
    buaChu: "🧿 Bùa chú"
};

// =====================================================
// COMMAND
// =====================================================

module.exports = {
    data: new SlashCommandBuilder()
        .setName("cuahang")
        .setDescription("🏪 Cửa hàng Hồng Hoang")

        .addSubcommand(sub =>
            sub
                .setName("xem")
                .setDescription("📜 Xem cửa hàng")
        )

        .addSubcommand(sub =>
            sub
                .setName("mua")
                .setDescription("🛒 Mua vật phẩm")

                .addStringOption(option =>
                    option
                        .setName("danhmuc")
                        .setDescription("Chọn danh mục")
                        .setRequired(true)
                        .addChoices(
                            {
                                name: "📜 Công pháp",
                                value: "congPhap"
                            },
                            {
                                name: "💊 Đan dược",
                                value: "danDuoc"
                            },
                            {
                                name: "🐉 Linh thú",
                                value: "linhThu"
                            },
                            {
                                name: "⚔️ Pháp bảo",
                                value: "phapBao"
                            },
                            {
                                name: "🧿 Bùa chú",
                                value: "buaChu"
                            }
                        )
                )

                .addStringOption(option =>
                    option
                        .setName("vatpham")
                        .setDescription("ID vật phẩm muốn mua")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {

        const p = getPlayer(interaction.user.id);

        if (!p) {
            return interaction.reply({
                content: "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        const subcommand =
            interaction.options.getSubcommand();

        // =================================================
        // XEM SHOP
        // =================================================

        if (subcommand === "xem") {

            let text = "";

            for (const [category, list] of Object.entries(SHOP)) {

                text += `\n### ${CATEGORY_NAME[category]}\n`;

                for (const [id, item] of Object.entries(list)) {

                    text +=
                        `\`${id}\` — **${item.name}** — 💎 **${item.cost.toLocaleString()}**`;

                    if (item.bonus) {
                        text += ` — +${item.bonus}`;
                    }

                    text += "\n";
                }
            }

            const embed = new EmbedBuilder()
                .setColor(0x8e44ad)
                .setTitle("🏪 CỬA HÀNG HỒNG HOANG")
                .setDescription(
                    "💎 Thanh toán bằng **Linh Thạch**.\n" +
                    "Dùng `/cuahang mua` rồi nhập **danh mục** và **ID vật phẩm**.\n\n" +
                    text
                )
                .setFooter({
                    text: "Hồng Hoang Đại Lục"
                });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =================================================
        // MUA
        // =================================================

        const category =
            interaction.options.getString("danhmuc");

        const itemId =
            interaction.options.getString("vatpham");

        const categoryItems =
            SHOP[category];

        if (!categoryItems) {
            return interaction.reply({
                content: "❌ Danh mục không tồn tại.",
                ephemeral: true
            });
        }

        const item =
            categoryItems[itemId];

        if (!item) {
            return interaction.reply({
                content:
                    `❌ Không tìm thấy vật phẩm \`${itemId}\` trong ${CATEGORY_NAME[category]}.\n` +
                    `Dùng \`/cuahang xem\` để xem ID vật phẩm.`,
                ephemeral: true
            });
        }

        const linhThach =
            Number(p.linhThach) || 0;

        if (linhThach < item.cost) {
            return interaction.reply({
                content:
                    `❌ Không đủ linh thạch.\n\n` +
                    `💎 Giá: **${item.cost.toLocaleString()}**\n` +
                    `💎 Bạn có: **${linhThach.toLocaleString()}**`,
                ephemeral: true
            });
        }

        const tuiDo = p.tuiDo || {};

        const owned =
            Array.isArray(tuiDo[category])
                ? [...tuiDo[category]]
                : [];

        // =================================================
        // LINH THÚ
        // =================================================

        if (category === "linhThu") {

            owned.push({
                name: item.name,
                bonus: item.bonus
            });

            updatePlayer(interaction.user.id, {
                linhThach:
                    linhThach - item.cost,

                cong:
                    (Number(p.cong) || 0) +
                    item.bonus,

                tuiDo: {
                    ...tuiDo,
                    linhThu: owned
                }
            });

        // =================================================
        // CÔNG PHÁP
        // =================================================

        } else if (category === "congPhap") {

            owned.push({
                id: itemId,
                name: item.name,
                requiredRealm: item.requiredRealm,
                bonus: item.bonus
            });

            updatePlayer(interaction.user.id, {
                linhThach:
                    linhThach - item.cost,

                tuiDo: {
                    ...tuiDo,
                    congPhap: owned
                }
            });

        // =================================================
        // CÁC VẬT PHẨM KHÁC
        // =================================================

        } else {

            owned.push({
                id: itemId,
                name: item.name,
                bonus: item.bonus || 0
            });

            updatePlayer(interaction.user.id, {
                linhThach:
                    linhThach - item.cost,

                tuiDo: {
                    ...tuiDo,
                    [category]: owned
                }
            });
        }

        return interaction.reply(
            `🛒 **MUA THÀNH CÔNG!**\n\n` +
            `${item.name}\n` +
            `📦 Loại: **${CATEGORY_NAME[category]}**\n` +
            `💎 Giá: **${item.cost.toLocaleString()}** linh thạch\n` +
            `💰 Còn lại: **${(linhThach - item.cost).toLocaleString()}**`
        );
    }
};
