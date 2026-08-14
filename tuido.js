const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const { getPlayer } = require("./database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("tuido")
        .setDescription("🎒 Xem túi đồ của bạn"),

    async execute(interaction) {

        try {

            const p = getPlayer(interaction.user.id);

            // ==============================
            // KIỂM TRA NHÂN VẬT
            // ==============================

            if (!p) {
                return interaction.reply({
                    content:
                        "⚠️ Hãy dùng `/batdau` trước để tạo nhân vật.",
                    ephemeral: true
                });
            }

            // ==============================
            // TÚI ĐỒ
            // ==============================

            const tuiDo =
                p.tuiDo &&
                typeof p.tuiDo === "object"
                    ? p.tuiDo
                    : {};

            const dan =
                Array.isArray(tuiDo.danDuoc)
                    ? tuiDo.danDuoc
                    : [];

            const vatPham =
                Array.isArray(tuiDo.vatPham)
                    ? tuiDo.vatPham
                    : [];

            const linhThu =
                Array.isArray(tuiDo.linhThu)
                    ? tuiDo.linhThu
                    : [];

            const congPhap =
                Array.isArray(tuiDo.congPhap)
                    ? tuiDo.congPhap
                    : [];

            const phapBao =
                Array.isArray(tuiDo.phapBao)
                    ? tuiDo.phapBao
                    : [];

            const buaChu =
                Array.isArray(tuiDo.buaChu)
                    ? tuiDo.buaChu
                    : [];

            // ==============================
            // FORMAT ITEM
            // ==============================

            const format = (
                list,
                mode = "normal"
            ) => {

                if (!Array.isArray(list) || list.length === 0) {
                    return "📭 *Trống*";
                }

                const result = [];

                for (let i = 0; i < list.length; i++) {

                    const item = list[i];

                    // Item dạng string
                    if (typeof item === "string") {

                        result.push(
                            `**${i + 1}.** ${item}`
                        );

                        continue;
                    }

                    // Item null / lỗi
                    if (
                        !item ||
                        typeof item !== "object"
                    ) {

                        result.push(
                            `**${i + 1}.** ❓ Vật phẩm không xác định`
                        );

                        continue;
                    }

                    const name =
                        item.name ||
                        item.id ||
                        item.itemId ||
                        "Vật phẩm không tên";

                    const bonus =
                        Number(item.bonus || 0);

                    const quantity =
                        Number(
                            item.quantity ??
                            item.soLuong ??
                            item.amount ??
                            1
                        );

                    // ==========================
                    // LINH THÚ
                    // ==========================

                    if (mode === "pet") {

                        result.push(
                            `**${i + 1}.** 🐉 ${name} — ⚔️ +${bonus} Công`
                        );

                        continue;
                    }

                    // ==========================
                    // CÔNG PHÁP
                    // ==========================

                    if (mode === "congphap") {

                        result.push(
                            `**${i + 1}.** 📜 ${name} — ✨ +${bonus}% tu luyện`
                        );

                        continue;
                    }

                    // ==========================
                    // ITEM CÓ BONUS
                    // ==========================

                    if (bonus) {

                        result.push(
                            `**${i + 1}.** ${name} — ✨ +${bonus}`
                        );

                        continue;
                    }

                    // ==========================
                    // ITEM CÓ SỐ LƯỢNG
                    // ==========================

                    if (quantity > 1) {

                        result.push(
                            `**${i + 1}.** ${name} ×${quantity}`
                        );

                        continue;
                    }

                    // ==========================
                    // ITEM BÌNH THƯỜNG
                    // ==========================

                    result.push(
                        `**${i + 1}.** ${name}`
                    );
                }

                if (!result.length) {
                    return "📭 *Trống*";
                }

                return result.join("\n");
            };

            // ==============================
            // GIỚI HẠN FIELD DISCORD
            // ==============================

            const safeText = (
                text,
                max = 1000
            ) => {

                if (!text) {
                    return "📭 *Trống*";
                }

                if (text.length <= max) {
                    return text;
                }

                const cut =
                    text.slice(0, max - 80);

                return (
                    cut +
                    "\n\n" +
                    "━━━━━━━━━━━━━━\n" +
                    "📦 *Danh sách quá dài, một số vật phẩm được ẩn...*"
                );
            };

            // ==============================
            // NỘI DUNG
            // ==============================

            const danText =
                safeText(
                    format(dan)
                );

            const vatPhamText =
                safeText(
                    format(vatPham)
                );

            const congPhapText =
                safeText(
                    format(
                        congPhap,
                        "congphap"
                    )
                );

            const linhThuText =
                safeText(
                    format(
                        linhThu,
                        "pet"
                    )
                );

            const phapBaoText =
                safeText(
                    format(phapBao)
                );

            const buaChuText =
                safeText(
                    format(buaChu)
                );

            // ==============================
            // TỔNG SỐ
            // ==============================

            const tongVatPham =
                dan.length +
                vatPham.length +
                linhThu.length +
                congPhap.length +
                phapBao.length +
                buaChu.length;

            // ==============================
            // EMBED
            // ==============================

            const embed =
                new EmbedBuilder()

                    .setColor(0x5865F2)

                    .setTitle(
                        `🎒 TÚI ĐỒ • ${p.username || interaction.user.username}`
                    )

                    .setDescription([
                        "✨ **Kho báu cá nhân của ngươi**",
                        "",
                        `📦 Tổng vật phẩm: **${tongVatPham}**`,
                        "",
                        "━━━━━━━━━━━━━━━━━━━━"
                    ].join("\n"))

                    // ==========================
                    // ĐAN DƯỢC
                    // ==========================

                    .addFields({
                        name: "💊 ĐAN DƯỢC",
                        value: danText,
                        inline: false
                    })

                    // ==========================
                    // VẬT PHẨM
                    // ==========================

                    .addFields({
                        name: "📦 VẬT PHẨM",
                        value: vatPhamText,
                        inline: false
                    })

                    // ==========================
                    // CÔNG PHÁP
                    // ==========================

                    .addFields({
                        name: "📜 CÔNG PHÁP",
                        value: congPhapText,
                        inline: false
                    })

                    // ==========================
                    // LINH THÚ
                    // ==========================

                    .addFields({
                        name: "🐉 LINH THÚ",
                        value: linhThuText,
                        inline: false
                    })

                    // ==========================
                    // PHÁP BẢO
                    // ==========================

                    .addFields({
                        name: "⚔️ PHÁP BẢO",
                        value: phapBaoText,
                        inline: false
                    })

                    // ==========================
                    // BÙA CHÚ
                    // ==========================

                    .addFields({
                        name: "🧿 BÙA CHÚ",
                        value: buaChuText,
                        inline: false
                    })

                    .setFooter({
                        text:
                            "🌌 Hồng Hoang Đại Lục • Túi đồ"
                    });

            // ==============================
            // GỬI
            // ==============================

            return interaction.reply({
                embeds: [embed]
            });

        } catch (error) {

            console.error(
                "❌ Lỗi /tuido:",
                error
            );

            // ==============================
            // XỬ LÝ LỖI DISCORD
            // ==============================

            const errorMessage = {
                content:
                    "❌ **Không thể mở túi đồ!**\n" +
                    "🔧 Đã xảy ra lỗi khi đọc dữ liệu túi đồ.\n" +
                    "📋 Lỗi đã được ghi vào console.",
                ephemeral: true
            };

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.editReply(
                    errorMessage
                );

            }

            return interaction.reply(
                errorMessage
            );
        }
    }
};
