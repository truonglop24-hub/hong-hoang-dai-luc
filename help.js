const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

const command = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Xem toàn bộ hệ thống và lệnh của Hồng Hoang Đại Lục"),

    async execute(interaction) {

        const createEmbed = (title, description, color = 0x8e44ad) => {
            return new EmbedBuilder()
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setFooter({
                    text: "🌌 Hồng Hoang Đại Lục • Con đường tu tiên"
                })
                .setTimestamp();
        };

        const mainEmbed = createEmbed(
            "🌌 HỒNG HOANG ĐẠI LỤC",
            `
**📖 BẢNG HƯỚNG DẪN HỆ THỐNG**

Chào mừng đạo hữu đến với **Hồng Hoang Đại Lục**!

Tại đây, đạo hữu có thể:
👤 Phát triển nhân vật
🌟 Tu luyện và đột phá cảnh giới
📜 Học tập công pháp
💊 Luyện chế và sử dụng đan dược
⚒️ Luyện khí, chế tạo pháp bảo
💑 Kết duyên đạo lữ
💰 Thu thập linh thạch
🏆 Tranh đoạt thứ hạng
🔒 Sử dụng hệ thống quản trị dành cho Admin

**📌 Hãy chọn một danh mục bên dưới để xem chi tiết lệnh.**
            `
        );

        const menu = new StringSelectMenuBuilder()
            .setCustomId("help_menu")
            .setPlaceholder("🌌 Chọn danh mục muốn xem...")
            .addOptions([
                {
                    label: "Nhân vật",
                    description: "Thông tin nhân vật và chỉ số",
                    value: "nhanvat",
                    emoji: "👤"
                },
                {
                    label: "Cảnh giới",
                    description: "Hệ thống cảnh giới tu tiên",
                    value: "canhgioi",
                    emoji: "🌟"
                },
                {
                    label: "Tu luyện",
                    description: "Tu luyện và đột phá",
                    value: "tuluyen",
                    emoji: "🧘"
                },
                {
                    label: "Đạo lữ",
                    description: "Hệ thống kết duyên",
                    value: "daolu",
                    emoji: "💑"
                },
                {
                    label: "Công pháp",
                    description: "Học và sử dụng công pháp",
                    value: "congphap",
                    emoji: "📜"
                },
                {
                    label: "Đan dược",
                    description: "Đan dược và luyện đan",
                    value: "danduoc",
                    emoji: "💊"
                },
                {
                    label: "Luyện khí",
                    description: "Chế tạo pháp bảo và trang bị",
                    value: "luyenkhi",
                    emoji: "⚒️"
                },
                {
                    label: "Linh thạch",
                    description: "Linh thạch, shop và phần thưởng",
                    value: "linhthach",
                    emoji: "💰"
                },
                {
                    label: "Xếp hạng",
                    description: "Bảng xếp hạng người chơi",
                    value: "xephang",
                    emoji: "🏆"
                },
                {
                    label: "Admin",
                    description: "Toàn bộ lệnh quản trị",
                    value: "admin",
                    emoji: "🔒"
                }
            ]);

        const row = new ActionRowBuilder()
            .addComponents(menu);

        await interaction.reply({
            embeds: [mainEmbed],
            components: [row]
        });

        const collector = interaction.channel.createMessageComponentCollector({
            time: 300000
        });

        collector.on("collect", async (i) => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ Đây không phải bảng Help của bạn!",
                    ephemeral: true
                });
            }

            let embed;

            switch (i.values[0]) {

                // =========================
                // NHÂN VẬT
                // =========================

                case "nhanvat":
                    embed = createEmbed(
                        "👤 NHÂN VẬT",
                        `
**/nhanvat**
→ Xem thông tin nhân vật của bản thân.

**/thongtin @nguoichoi**
→ Xem thông tin tu tiên của người chơi khác.

**Thông tin nhân vật có thể bao gồm:**
• Tên nhân vật
• Tu vi
• Cảnh giới
• Linh căn
• Linh thạch
• Công pháp
• Đan dược
• Trang bị
• Đạo lữ

📌 Đây là trung tâm dữ liệu của mỗi tu sĩ.
                        `,
                        0x3498db
                    );
                    break;

                // =========================
                // CẢNH GIỚI
                // =========================

                case "canhgioi":
                    embed = createEmbed(
                        "🌟 CẢNH GIỚI TU TIÊN",
                        `
**/realms**
→ Xem toàn bộ cảnh giới trong Hồng Hoang Đại Lục.

**/tuvi**
→ Xem tu vi và cảnh giới hiện tại.

**/dotpha**
→ Tiến hành đột phá khi đạt đủ điều kiện.

**Hệ thống cảnh giới:**
• Phàm Nhân
• Luyện Khí
• Trúc Cơ
• Kim Đan
• Nguyên Anh
• Hóa Thần
• Luyện Hư
• Hợp Thể
• Đại Thừa
• Độ Kiếp
• Tán Tiên
• Chân Tiên
• Kim Tiên
• Tiên Vương
• Tiên Đế
• Thánh Nhân
• Thiên Đạo
• Đại Đạo

⚡ Càng lên cảnh giới cao, lượng tu vi cần thiết càng lớn.
                        `,
                        0xf1c40f
                    );
                    break;

                // =========================
                // TU LUYỆN
                // =========================

                case "tuluyen":
                    embed = createEmbed(
                        "🧘 TU LUYỆN",
                        `
**/batdau**
→ Bắt đầu con đường tu tiên.

**/tuluyen**
→ Tiến hành tu luyện và nhận tu vi.

**/tuvi**
→ Kiểm tra lượng tu vi hiện tại.

**/dotpha**
→ Đột phá cảnh giới.

**/rank**
→ Xem bảng xếp hạng tu vi.

💡 Tu sĩ cần thường xuyên tu luyện để nâng cao tu vi và tiến vào cảnh giới cao hơn.
                        `,
                        0x2ecc71
                    );
                    break;

                // =========================
                // ĐẠO LỮ
                // =========================

                case "daolu":
                    embed = createEmbed(
                        "💑 ĐẠO LỮ",
                        `
**/daolu**
→ Xem thông tin hệ thống đạo lữ.

**/ketduyen @nguoichoi**
→ Gửi lời mời kết duyên.

**/lyhon**
→ Kết thúc quan hệ đạo lữ.

💞 Đạo hữu có thể cùng đạo lữ đồng hành trên con đường tu tiên.

📌 Hệ thống đạo lữ có thể được mở rộng thêm:
• Cấp độ đạo lữ
• Nhiệm vụ chung
• Phần thưởng
• Buff hỗ trợ
                        `,
                        0xe91e63
                    );
                    break;

                // =========================
                // CÔNG PHÁP
                // =========================

                case "congphap":
                    embed = createEmbed(
                        "📜 CÔNG PHÁP",
                        `
**/congphap**
→ Xem danh sách công pháp.

**/hoccongphap**
→ Học một công pháp.

**/congphapcuatoi**
→ Xem các công pháp bản thân đang sở hữu.

📖 Công pháp giúp tu sĩ:
• Tăng hiệu quả tu luyện
• Tăng sức mạnh
• Mở khóa khả năng đặc biệt
• Hỗ trợ chiến đấu

⚡ Công pháp càng cao cấp, yêu cầu tu vi càng lớn.
                        `,
                        0x9b59b6
                    );
                    break;

                // =========================
                // ĐAN DƯỢC
                // =========================

                case "danduoc":
                    embed = createEmbed(
                        "💊 ĐAN DƯỢC",
                        `
**/danduoc**
→ Xem danh sách đan dược.

**/tuidan**
→ Xem đan dược đang sở hữu.

**/suandung**
→ Sử dụng đan dược.

💊 Đan dược có thể được sử dụng để:
• Hỗ trợ tu luyện
• Tăng tu vi
• Hỗ trợ đột phá
• Khôi phục tài nguyên
• Tạo các hiệu ứng đặc biệt

📌 Mỗi loại đan dược có công dụng khác nhau.
                        `,
                        0xe67e22
                    );
                    break;

                // =========================
                // LUYỆN KHÍ
                // =========================

                case "luyenkhi":
                    embed = createEmbed(
                        "⚒️ LUYỆN KHÍ",
                        `
**/luyenkhi**
→ Xem hệ thống luyện khí.

**/chetao**
→ Chế tạo pháp bảo/trang bị.

**/tutrangbi**
→ Xem trang bị đang sở hữu hoặc sử dụng.

⚒️ Hệ thống luyện khí cho phép tu sĩ:
• Chế tạo pháp bảo
• Nâng cấp trang bị
• Sử dụng nguyên liệu
• Tăng sức mạnh nhân vật

🔥 Pháp bảo càng cao cấp càng cần nguyên liệu quý hiếm.
                        `,
                        0xd35400
                    );
                    break;

                // =========================
                // LINH THẠCH
                // =========================

                case "linhthach":
                    embed = createEmbed(
                        "💰 LINH THẠCH",
                        `
**/linhthach**
→ Kiểm tra số linh thạch hiện có.

**/daily**
→ Nhận phần thưởng hằng ngày.

**/shop**
→ Mở cửa hàng tu tiên.

💰 Linh thạch có thể được sử dụng để:
• Mua vật phẩm
• Mua đan dược
• Mua nguyên liệu
• Giao dịch
• Sử dụng các hệ thống khác

📌 Hãy tích lũy linh thạch để phát triển nhanh hơn.
                        `,
                        0xf39c12
                    );
                    break;

                // =========================
                // XẾP HẠNG
                // =========================

                case "xephang":
                    embed = createEmbed(
                        "🏆 XẾP HẠNG",
                        `
**/rank**
→ Xem bảng xếp hạng tu vi.

🏆 Bảng xếp hạng có thể hiển thị:
• Top tu vi
• Cảnh giới
• Tên tu sĩ
• Thứ hạng

⚔️ Hãy không ngừng tu luyện để tranh đoạt vị trí cao nhất Hồng Hoang Đại Lục!
                        `,
                        0xf1c40f
                    );
                    break;

                // =========================
                // ADMIN
                // =========================

                case "admin":
                    embed = createEmbed(
                        "🔒 LỆNH QUẢN TRỊ ADMIN",
                        `
⚠️ **CÁC LỆNH DƯỚI ĐÂY DÀNH CHO ADMIN**

**/admin-addtuvi @user <số_lượng>**
→ Cộng tu vi cho người chơi.

**/admin-removetuvi @user <số_lượng>**
→ Trừ tu vi của người chơi.

**/admin-addlinhthach @user <số_lượng>**
→ Cộng linh thạch.

**/admin-removelinhtach @user <số_lượng>**
→ Trừ linh thạch.

**/admin-setrealm @user <cảnh_giới>**
→ Thiết lập cảnh giới cho người chơi.

**/admin-reset @user**
→ Reset dữ liệu người chơi.

**/admin-giveitem @user <item> <số_lượng>**
→ Trao vật phẩm cho người chơi.

**/admin-setcooldown @user <thời_gian>**
→ Thiết lập cooldown.

━━━━━━━━━━━━━━━━━━━━

🔧 **Lưu ý:**
Các lệnh Admin vẫn được hiển thị trong `/help`.

⚠️ Người không có quyền Admin sẽ không thể sử dụng các lệnh quản trị nếu phần kiểm tra quyền trong từng lệnh được thiết lập đúng.
                        `,
                        0xe74c3c
                    );
                    break;
            }

            await i.update({
                embeds: [embed],
                components: [row]
            });
        });
    }
};

module.exports = command;
