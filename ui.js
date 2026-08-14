const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

const COLORS = {
    main: 0x6C5CE7,
    success: 0x2ECC71,
    warning: 0xF1C40F,
    danger: 0xE74C3C,
    info: 0x3498DB,
    dark: 0x1F1B2E
};

const COMMAND_TITLES = {
    batdau: "🌌 KHỞI ĐẦU HỒNG HOANG",
    tuvi: "✨ TU VI CỦA ĐẠO HỮU",
    tuluyen: "⚡ TU LUYỆN",
    dotpha: "🔥 ĐỘT PHÁ CẢNH GIỚI",
    bequan: "🧘 BẾ QUAN",
    xuatquan: "🚪 XUẤT QUAN",
    pvp: "⚔️ ĐẤU TRƯỜNG HỒNG HOANG",
    boss: "👹 HỒNG HOANG BOSS",
    phoban: "🐉 PHÓ BẢN",
    cuahang: "🛒 CỬA HÀNG HỒNG HOANG",
    dando: "💊 ĐAN DƯỢC",
    tuido: "🎒 TÚI ĐỒ",
    linhthu: "🐲 LINH THÚ",
    bangxephang: "🏆 THIÊN KIÊU BẢNG",
    top: "🏆 XẾP HẠNG",
    thongtin: "👤 HỒ SƠ TU TIÊN",
    help: "📖 HƯỚNG DẪN HỒNG HOANG",
    linhcan: "🌿 LINH CĂN",
    thechat: "🧬 THỂ CHẤT",
    luyenkhi: "⚒️ LUYỆN KHÍ",
    chetao: "🔨 CHẾ TẠO",
    congphap: "📜 CÔNG PHÁP",
    daolu: "☯️ ĐẠO LỘ",
    nhapcode: "🎁 NHẬP CODE",
    admin: "🔐 QUẢN TRỊ HỒNG HOANG"
};

function titleFor(commandName) {
    return COMMAND_TITLES[commandName] || `🌌 HỒNG HOANG • /${commandName}`;
}

function premiumEmbed(content, commandName, options = {}) {
    const embed = new EmbedBuilder()
        .setColor(options.color || COLORS.main)
        .setTitle(options.title || titleFor(commandName))
        .setDescription(String(content || ""))
        .setFooter({
            text: "🌌 Hồng Hoang Đại Lục • Premium UI"
        })
        .setTimestamp();

    return embed;
}

function navigationRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ui_home")
            .setLabel("Trang chủ")
            .setEmoji("🏠")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("ui_profile")
            .setLabel("Hồ sơ")
            .setEmoji("👤")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("ui_help")
            .setLabel("Hướng dẫn")
            .setEmoji("📖")
            .setStyle(ButtonStyle.Secondary)
    );
}

function addNavigation(payload, commandName) {
    if (!payload || typeof payload !== "object") return payload;

    const result = { ...payload };

    // Không tự chèn UI vào autocomplete hoặc payload đặc biệt.
    if (result.autocomplete) return result;

    // Nếu command chỉ trả text -> chuyển thành Premium Embed.
    if (result.content && (!result.embeds || result.embeds.length === 0)) {
        result.embeds = [premiumEmbed(result.content, commandName)];
        delete result.content;
    }

    // Nếu command đã có Embed thì giữ nguyên Embed hiện tại.
    // Chỉ thêm footer Premium nếu Embed chưa có footer.
    if (Array.isArray(result.embeds) && result.embeds.length) {
        result.embeds = result.embeds.map(raw => {
            try {
                const data = typeof raw.toJSON === "function" ? raw.toJSON() : { ...raw };
                if (!data.footer) data.footer = { text: "🌌 Hồng Hoang Đại Lục • Premium UI" };
                if (!data.timestamp) data.timestamp = new Date().toISOString();
                return data;
            } catch {
                return raw;
            }
        });
    }

    // Không phá UI riêng của command. Chỉ thêm thanh điều hướng nếu còn chỗ.
    const rows = Array.isArray(result.components) ? [...result.components] : [];
    if (rows.length < 5) rows.push(navigationRow());
    result.components = rows;

    return result;
}

function installPremiumUI(interaction, commandName) {
    if (!interaction || interaction.__premiumUIInstalled) return;
    interaction.__premiumUIInstalled = true;

    const originalReply = interaction.reply.bind(interaction);
    const originalEditReply = interaction.editReply.bind(interaction);
    const originalFollowUp = interaction.followUp.bind(interaction);

    interaction.reply = (payload) => {
        if (typeof payload === "string") payload = { content: payload };
        return originalReply(addNavigation(payload, commandName));
    };

    interaction.editReply = (payload) => {
        if (typeof payload === "string") payload = { content: payload };
        return originalEditReply(addNavigation(payload, commandName));
    };

    interaction.followUp = (payload) => {
        if (typeof payload === "string") payload = { content: payload };
        return originalFollowUp(addNavigation(payload, commandName));
    };
}

module.exports = {
    COLORS,
    titleFor,
    premiumEmbed,
    navigationRow,
    addNavigation,
    installPremiumUI
};
