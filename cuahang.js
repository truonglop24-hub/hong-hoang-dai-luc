const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { getPlayer, updatePlayer } = require("./database");

// =====================================================
// 🏪 CỬA HÀNG HỒNG HOANG
// =====================================================

const items = {

    // =================================================
    // 📜 CÔNG PHÁP
    // =================================================

    "cong-phap-luyen-khi": {
        name: "📜 Công Pháp Luyện Khí Quyết",
        cost: 500,
        type: "congPhap"
    },

    "cong-phap-huyen-nguyen": {
        name: "📜 Huyền Nguyên Công",
        cost: 2500,
        type: "congPhap"
    },

    "cong-phap-thien-cuong": {
        name: "📜 Thiên Cương Quyết",
        cost: 10000,
        type: "congPhap"
    },

    "cong-phap-cuu-chuyen": {
        name: "📜 Cửu Chuyển Kim Thân Quyết",
        cost: 50000,
        type: "congPhap"
    },

    "cong-phap-hong-hoang": {
        name: "📜 Hồng Hoang Đạo Kinh",
        cost: 250000,
        type: "congPhap"
    },

    // =================================================
    // 💊 ĐAN DƯỢC
    // =================================================

    "tui-mau": {
        name: "❤️ Túi Hồi Máu",
        cost: 100,
        type: "vatPham"
    },

    "dan-linh-luc": {
        name: "🔥 Đan Linh Lực",
        cost: 150,
        type: "danDuoc"
    },

    "dan-kinh-nghiem": {
        name: "✨ Đan Kinh Nghiệm",
        cost: 200,
        type: "danDuoc"
    },

    "dan-tu-vi": {
        name: "💠 Đan Tăng Tu Vi",
        cost: 1000,
        type: "danDuoc"
    },

    "dan-dot-pha": {
        name: "🌟 Đan Đột Phá",
        cost: 5000,
        type: "danDuoc"
    },

    "dan-hoi-nguyen": {
        name: "🔮 Hồi Nguyên Đan",
        cost: 15000,
        type: "danDuoc"
    },

    // =================================================
    // 🐉 LINH THÚ
    // =================================================

    "linh-thu-tieu-ho": {
        name: "🐯 Tiểu Hổ Linh Thú",
        cost: 3000,
        type: "linhThu"
    },

    "linh-thu-thanh-lang": {
        name: "🐺 Thanh Lang",
        cost: 10000,
        type: "linhThu"
    },

    "linh-thu-hoa-phung": {
        name: "🔥 Hỏa Phượng",
        cost: 50000,
        type: "linhThu"
    },

    "linh-thu-giao-long": {
        name: "🐉 Giao Long",
        cost: 250000,
        type: "linhThu"
    },

    "linh-thu-ky-lan": {
        name: "🦄 Kỳ Lân",
        cost: 1000000,
        type: "linhThu"
    },

    // =================================================
    // ⚔️ PHÁP BẢO
    // =================================================

    "phap-bao-thanh-phong": {
        name: "⚔️ Thanh Phong Kiếm",
        cost: 5000,
        type: "phapBao"
    },

    "phap-bao-huyen-thiet": {
        name: "🗡️ Huyền Thiết Đao",
        cost: 15000,
        type: "phapBao"
    },

    "phap-bao-tu-kim-chung": {
        name: "🔔 Tử Kim Chung",
        cost: 50000,
        type: "phapBao"
    },

    "phap-bao-tran-thien": {
        name: "🏯 Trấn Thiên Tháp",
        cost: 250000,
        type: "phapBao"
    },

    "phap-bao-hong-hoang": {
        name: "🌌 Hồng Hoang Thần Khí",
        cost: 2000000,
        type: "phapBao"
    },

    // =================================================
    // 🧿 BÙA CHÚ
    // =================================================

    "bua-tang-cong": {
        name: "⚔️ Bùa Tăng Công",
        cost: 1000,
        type: "buaChu"
    },

    "bua-tang-thu": {
        name: "🛡️ Bùa Tăng Thủ",
        cost: 1000,
        type: "buaChu"
    },

    "bua-tang-hp": {
        name: "❤️ Bùa Hộ Mệnh",
        cost: 1500,
        type: "buaChu"
    },

    "bua-tu-luyen": {
        name: "✨ Bùa Tụ Linh",
        cost: 3000,
        type: "buaChu"
    },

    "bua-ho-than": {
        name: "🌟 Bùa Hộ Thần",
        cost: 10000,
        type: "buaChu"
    }
};

// =====================================================
// 📋 CHOICE CHO LỆNH MUA
// Discord giới hạn tối đa 25 choices
// =====================================================

const choices = Object.entries(items).map(
    ([id, item]) => ({
        name: `${item.name} - ${item.cost.toLocaleString()}`,
        value: id
    })
);

// =====================================================
// COMMAND
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()

        .setName("cuahang")

        .setDescription("🏪 Cửa hàng Hồng Hoang")

        // =================================================
        // XEM SHOP
        // =================================================

        .addSubcommand(sub =>
            sub
                .setName("xem")
                .setDescription("📜 Xem cửa hàng")
        )

        // =================================================
        // MUA
        // =================================================

        .addSubcommand(sub =>
            sub
                .setName("mua")
                .setDescription("🛒 Mua vật phẩm")

                .addStringOption(option =>
                    option
                        .setName("vatpham")
                        .setDescription("Chọn vật phẩm muốn mua")
                        .setRequired(true)
                        .addChoices(...choices)
                )
        ),

    // =====================================================
    // EXECUTE
    // =====================================================

    async execute(interaction) {

        const p = getPlayer(
            interaction.user.id
        );

        // =================================================
        // CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {
            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // XEM CỬA HÀNG
        // =================================================

        if (
            interaction.options.getSubcommand() ===
            "xem"
        ) {

            const embed =
                new EmbedBuilder()

                    .setColor(0x8e44ad)

                    .setTitle(
                        "🏪 CỬA HÀNG HỒNG HOANG"
                    )

                    .setDescription(
                        "💎 **Thanh toán bằng Linh Thạch**\n\n" +

                        "📜 **CÔNG PHÁP**\n" +
                        "📜 Luyện Khí Quyết — **500**\n" +
                        "📜 Huyền Nguyên Công — **2.500**\n" +
                        "📜 Thiên Cương Quyết — **10.000**\n" +
                        "📜 Cửu Chuyển Kim Thân Quyết — **50.000**\n" +
                        "📜 Hồng Hoang Đạo Kinh — **250.000**\n\n" +

                        "💊 **ĐAN DƯỢC**\n" +
                        "❤️ Túi Hồi Máu — **100**\n" +
                        "🔥 Đan Linh Lực — **150**\n" +
                        "✨ Đan Kinh Nghiệm — **200**\n" +
                        "💠 Đan Tăng Tu Vi — **1.000**\n" +
                        "🌟 Đan Đột Phá — **5.000**\n" +
                        "🔮 Hồi Nguyên Đan — **15.000**\n\n" +

                        "🐉 **LINH THÚ**\n" +
                        "🐯 Tiểu Hổ — **3.000**\n" +
                        "🐺 Thanh Lang — **10.000**\n" +
                        "🔥 Hỏa Phượng — **50.000**\n" +
                        "🐉 Giao Long — **250.000**\n" +
                        "🦄 Kỳ Lân — **1.000.000**\n\n" +

                        "⚔️ **PHÁP BẢO**\n" +
                        "⚔️ Thanh Phong Kiếm — **5.000**\n" +
                        "🗡️ Huyền Thiết Đao — **15.000**\n" +
                        "🔔 Tử Kim Chung — **50.000**\n" +
                        "🏯 Trấn Thiên Tháp — **250.000**\n" +
                        "🌌 Hồng Hoang Thần Khí — **2.000.000**\n\n" +

                        "🧿 **BÙA CHÚ**\n" +
                        "⚔️ Bùa Tăng Công — **1.000**\n" +
                        "🛡️ Bùa Tăng Thủ — **1.000**\n" +
                        "❤️ Bùa Hộ Mệnh — **1.500**\n" +
                        "✨ Bùa Tụ Linh — **3.000**\n" +
                        "🌟 Bùa Hộ Thần — **10.000**"
                    )

                    .setFooter({
                        text:
                            "🛒 Dùng /cuahang mua để mua vật phẩm"
                    });

            return interaction.reply({
                embeds: [embed]
            });
        }

        // =================================================
        // LẤY VẬT PHẨM
        // =================================================

        const id =
            interaction.options.getString(
                "vatpham"
            );

        const item =
            items[id];

        if (!item) {
            return interaction.reply({
                content:
                    "❌ Vật phẩm không tồn tại.",
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA LINH THẠCH
        // =================================================

        const linhThach =
            Number(p.linhThach) || 0;

        if (
            linhThach <
            item.cost
        ) {

            return interaction.reply({
                content:
                    `❌ Không đủ linh thạch.\n` +
                    `💎 Cần: **${item.cost.toLocaleString()}**\n` +
                    `💎 Hiện có: **${linhThach.toLocaleString()}**`,
                ephemeral: true
            });
        }

        // =================================================
        // TÚI ĐỒ
        // =================================================

        const tuiDo =
            p.tuiDo || {};

        const list = [
            ...(tuiDo[item.type] || []),
            item.name
        ];

        // =================================================
        // CẬP NHẬT
        // =================================================

        const changes = {

            linhThach:
                linhThach -
                item.cost,

            tuiDo: {

                ...tuiDo,

                [item.type]:
                    list
            }
        };

        updatePlayer(
            interaction.user.id,
            changes
        );

        // =================================================
        // THÔNG BÁO
        // =================================================

        const typeNames = {

            vatPham:
                "🎒 Vật phẩm",

            danDuoc:
                "💊 Đan dược",

            congPhap:
                "📜 Công pháp",

            linhThu:
                "🐉 Linh thú",

            phapBao:
                "⚔️ Pháp bảo",

            buaChu:
                "🧿 Bùa chú"
        };

        const embed =
            new EmbedBuilder()

                .setColor(0x2ecc71)

                .setTitle(
                    "🛒 MUA HÀNG THÀNH CÔNG"
                )

                .setDescription(
                    `Bạn đã mua thành công **${item.name}**.`
                )

                .addFields(

                    {
                        name:
                            "📦 Loại",
                        value:
                            typeNames[item.type] ||
                            "Vật phẩm",
                        inline: true
                    },

                    {
                        name:
                            "💎 Giá",
                        value:
                            `${item.cost.toLocaleString()} Linh Thạch`,
                        inline: true
                    },

                    {
                        name:
                            "💰 Linh thạch còn lại",
                        value:
                            `${(
                                linhThach -
                                item.cost
                            ).toLocaleString()}`,
                        inline: true
                    }
                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục • Cửa hàng"
                });

        return interaction.reply({
            embeds: [embed]
        });
    }
};
