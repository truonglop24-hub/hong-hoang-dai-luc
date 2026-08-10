const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    UserSelectMenuBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer,
    getAllPlayers
} = require("./database");

const challenges = new Map();

const professions = {
    dan: {
        name: "Luyện Đan Sư",
        emoji: "⚗️",
        bonus: "Đan dược nhận được hiệu quả cao hơn"
    },
    khi: {
        name: "Luyện Khí Sư",
        emoji: "⚒️",
        bonus: "Công lực +10"
    },
    tran: {
        name: "Trận Pháp Sư",
        emoji: "🔮",
        bonus: "Thủ lực +10"
    }
};

const sects = {
    thanh_van: {
        name: "Thanh Vân Tông",
        emoji: "☁️",
        bonus: "Linh lực +5"
    },
    thien_kiem: {
        name: "Thiên Kiếm Tông",
        emoji: "⚔️",
        bonus: "Công lực +5"
    },
    dao_thien: {
        name: "Đạo Thiên Tông",
        emoji: "🌌",
        bonus: "Thủ lực +5"
    }
};

function getMainMenu(player, username) {
    const linhLuc = player.linhLuc ?? 0;
    const linhThach = player.linhThach ?? 0;

    const embed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle("🌌 HỒNG HOANG ĐẠI LỤC")
        .setDescription(
            `✨ **${username}**\n\n` +
            `📜 **Cảnh Giới**\n` +
            `**${player.canhGioi} tầng ${player.tang}**\n\n` +

            `💎 **Linh Thạch**\n` +
            `**${linhThach}**\n\n` +

            `💧 **Linh Lực**\n` +
            `**${linhLuc}**\n\n` +

            `🔑 **Linh Giới Lệnh**\n` +
            `**${player.linhGioiLenh ?? 0}**\n\n` +

            `🧪 **Linh Phù**\n` +
            `**${player.linhPhu ?? "0/3"}**\n\n` +

            `🌩️ **Thiên Kiếp**\n` +
            `${player.thienKiepDaVuot ? "✅ Đã vượt" : "❌ Chưa vượt"}`
        )
        .setImage(
            process.env.MENU_IMAGE_URL ||
            "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80"
        )
        .setFooter({
            text: "🌌 Hồng Hoang Đại Lục • Chọn chức năng bên dưới"
        });

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_tuluyen")
            .setLabel("Tu Luyện")
            .setEmoji("🧘")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("menu_dotpha")
            .setLabel("Đột Phá")
            .setEmoji("⚡")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("menu_tuhanh")
            .setLabel("Tu Hành")
            .setEmoji("⚙️")
            .setStyle(ButtonStyle.Secondary)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_nghenghiep")
            .setLabel("Nghề Nghiệp")
            .setEmoji("🛠️")
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId("menu_chiendau")
            .setLabel("Chiến Đấu")
            .setEmoji("🗡️")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("menu_donghanh")
            .setLabel("Đồng Hành")
            .setEmoji("🦊")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("menu_phithang")
            .setLabel("Phi Thăng")
            .setEmoji("🦋")
            .setStyle(ButtonStyle.Primary)
    );

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_tongmon")
            .setLabel("Tông Môn")
            .setEmoji("🏯")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("menu_pvp")
            .setLabel("PvP")
            .setEmoji("⚔️")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("menu_thienkiep")
            .setLabel("Vượt Thiên Kiếp")
            .setEmoji("🌩️")
            .setStyle(ButtonStyle.Danger)
    );

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_sugia")
            .setLabel("Sứ Giả")
            .setEmoji("👹")
            .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
            .setCustomId("menu_dongphu")
            .setLabel("Động Phủ")
            .setEmoji("🏔️")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("menu_xephang")
            .setLabel("Xếp Hạng")
            .setEmoji("🏆")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("menu_khac")
            .setLabel("Khác")
            .setEmoji("📦")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("menu_dong")
            .setLabel("Đóng")
            .setEmoji("🔒")
            .setStyle(ButtonStyle.Secondary)
    );

    const row5 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_giaodich")
            .setLabel("Giao Dịch")
            .setEmoji("🔄")
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId("menu_khodo")
            .setLabel("Kho Đồ")
            .setEmoji("🎒")
            .setStyle(ButtonStyle.Success)
    );

    return {
        embeds: [embed],
        components: [row1, row2, row3, row4, row5]
    };
}

function backButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("menu_home")
            .setLabel("Quay lại Menu")
            .setEmoji("🏠")
            .setStyle(ButtonStyle.Primary)
    );
}

async function runCommand(interaction, commandName) {
    const command = require(`./${commandName}.js`);
    return command.execute(interaction);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("menu")
        .setDescription("Mở giao diện Hồng Hoang Đại Lục"),

    async execute(interaction) {
        const player = getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ Đạo hữu chưa có nhân vật!\nHãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        return interaction.reply(
            getMainMenu(player, interaction.user.username)
        );
    },

    async handleComponent(interaction) {
        const id = interaction.customId;
        const player = getPlayer(interaction.user.id);

        if (!player) {
            return interaction.reply({
                content: "❌ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =========================
        // QUAY LẠI MENU
        // =========================

        if (id === "menu_home") {
            return interaction.update(
                getMainMenu(
                    getPlayer(interaction.user.id),
                    interaction.user.username
                )
            );
        }

        // =========================
        // ĐÓNG MENU
        // =========================

        if (id === "menu_dong") {
            return interaction.message.delete().catch(() => {});
        }

        // =========================
        // TU LUYỆN
        // =========================

        if (id === "menu_tuluyen") {
            return runCommand(interaction, "tuluyen");
        }

        // =========================
        // ĐỘT PHÁ
        // =========================

        if (id === "menu_dotpha") {
            return runCommand(interaction, "dotpha");
        }

        // =========================
        // TU HÀNH
        // =========================

        if (id === "menu_tuhanh") {
            const p = getPlayer(interaction.user.id);

            const embed = new EmbedBuilder()
                .setTitle("⚙️ TU HÀNH")
                .setColor(0x5865f2)
                .addFields(
                    {
                        name: "🌱 Cảnh giới",
                        value: `${p.canhGioi} tầng ${p.tang}`,
                        inline: true
                    },
                    {
                        name: "🔥 Linh lực",
                        value: `${p.linhLuc}`,
                        inline: true
                    },
                    {
                        name: "✨ Kinh nghiệm",
                        value: `${p.kinhNghiem}`,
                        inline: true
                    },
                    {
                        name: "❤️ HP",
                        value: `${p.hp}/${p.maxHp}`,
                        inline: true
                    },
                    {
                        name: "⚔️ Công",
                        value: `${p.cong}`,
                        inline: true
                    },
                    {
                        name: "🛡️ Thủ",
                        value: `${p.thu}`,
                        inline: true
                    }
                );

            return interaction.update({
                embeds: [embed],
                components: [backButton()]
            });
        }

        // =========================
        // NGHỀ NGHIỆP
        // =========================

        if (id === "menu_nghenghiep") {
            const current = player.ngheNghiep
                ? professions[player.ngheNghiep]?.name
                : "Chưa chọn";

            const menu = new StringSelectMenuBuilder()
                .setCustomId("menu_select_nghenghiep")
                .setPlaceholder("Chọn nghề nghiệp")
                .addOptions(
                    {
                        label: "Luyện Đan Sư",
                        description: "Chuyên luyện chế đan dược",
                        value: "dan",
                        emoji: "⚗️"
                    },
                    {
                        label: "Luyện Khí Sư",
                        description: "Tăng cường công lực",
                        value: "khi",
                        emoji: "⚒️"
                    },
                    {
                        label: "Trận Pháp Sư",
                        description: "Tăng cường phòng thủ",
                        value: "tran",
                        emoji: "🔮"
                    }
                );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🛠️ NGHỀ NGHIỆP")
                        .setDescription(
                            `Nghề hiện tại: **${current}**\n\n` +
                            "Chọn một nghề bên dưới để gia nhập."
                        )
                ],
                components: [
                    new ActionRowBuilder().addComponents(menu),
                    backButton()
                ]
            });
        }

        // =========================
        // CHIẾN ĐẤU
        // =========================

        if (id === "menu_chiendau") {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("menu_boss")
                    .setLabel("Đánh Boss")
                    .setEmoji("🐉")
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId("menu_phoban")
                    .setLabel("Phó Bản")
                    .setEmoji("🏯")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("menu_pvp")
                    .setLabel("PvP")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Danger)
            );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🗡️ CHIẾN ĐẤU")
                        .setDescription(
                            "Chọn một hình thức chiến đấu:"
                        )
                ],
                components: [row, backButton()]
            });
        }

        if (id === "menu_boss") {
            return runCommand(interaction, "boss");
        }

        if (id === "menu_phoban") {
            return runCommand(interaction, "phoban");
        }

        // =========================
        // ĐỒNG HÀNH
        // =========================

        if (id === "menu_donghanh") {
            return runCommand(interaction, "linhthu");
        }

        // =========================
        // PHI THĂNG
        // =========================

        if (id === "menu_phithang") {
            const p = getPlayer(interaction.user.id);

            if (p.canhGioi !== "Đại Thừa" || p.tang < 9) {
                return interaction.reply({
                    content:
                        "🦋 **Chưa đủ điều kiện phi thăng!**\n\n" +
                        "Yêu cầu: **Đại Thừa tầng 9**.",
                    ephemeral: true
                });
            }

            const need = 16000;

            if (p.kinhNghiem < need) {
                return interaction.reply({
                    content:
                        `❌ Chưa đủ kinh nghiệm.\n` +
                        `Cần **${need}**, hiện có **${p.kinhNghiem}**.`,
                    ephemeral: true
                });
            }

            const success = Math.random() * 100 < 60;

            if (!success) {
                updatePlayer(interaction.user.id, {
                    kinhNghiem: Math.max(0, p.kinhNghiem - 2000)
                });

                return interaction.reply({
                    content:
                        "🌩️ **Phi thăng thất bại!**\n" +
                        "Bạn bị thiên đạo đánh lui và mất **2000 kinh nghiệm**."
                });
            }

            updatePlayer(interaction.user.id, {
                canhGioi: "Độ Kiếp",
                tang: 1,
                kinhNghiem: p.kinhNghiem - need,
                maxHp: p.maxHp + 100,
                hp: p.maxHp + 100,
                cong: p.cong + 25,
                thu: p.thu + 20,
                thienKiepDaVuot: true
            });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🦋 PHI THĂNG THÀNH CÔNG")
                        .setDescription(
                            "🌌 Thiên môn mở rộng!\n\n" +
                            "**Đại Thừa tầng 9 → Độ Kiếp tầng 1**"
                        )
                        .addFields({
                            name: "📈 Tỷ lệ thành công",
                            value: "60%"
                        })
                ]
            });
        }

        // =========================
        // TÔNG MÔN
        // =========================

        if (id === "menu_tongmon") {
            const current = player.tongMon
                ? sects[player.tongMon]?.name
                : "Chưa gia nhập";

            const menu = new StringSelectMenuBuilder()
                .setCustomId("menu_select_tongmon")
                .setPlaceholder("Chọn Tông Môn")
                .addOptions(
                    {
                        label: "Thanh Vân Tông",
                        description: "Tăng linh lực",
                        value: "thanh_van",
                        emoji: "☁️"
                    },
                    {
                        label: "Thiên Kiếm Tông",
                        description: "Tăng công lực",
                        value: "thien_kiem",
                        emoji: "⚔️"
                    },
                    {
                        label: "Đạo Thiên Tông",
                        description: "Tăng thủ lực",
                        value: "dao_thien",
                        emoji: "🌌"
                    }
                );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏯 TÔNG MÔN")
                        .setDescription(
                            `Tông môn hiện tại: **${current}**\n\n` +
                            "⚠️ Gia nhập tông môn sẽ cộng chỉ số."
                        )
                ],
                components: [
                    new ActionRowBuilder().addComponents(menu),
                    backButton()
                ]
            });
        }

        // =========================
        // PVP
        // =========================

        if (id === "menu_pvp") {
            const selector = new UserSelectMenuBuilder()
                .setCustomId("menu_pvp_select")
                .setPlaceholder("Chọn đạo hữu muốn khiêu chiến")
                .setMinValues(1)
                .setMaxValues(1);

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("⚔️ PVP")
                        .setDescription(
                            "Chọn một đạo hữu để gửi lời khiêu chiến."
                        )
                ],
                components: [
                    new ActionRowBuilder().addComponents(selector),
                    backButton()
                ]
            });
        }

        // =========================
        // THIÊN KIẾP
        // =========================

        if (id === "menu_thienkiep") {
            const p = getPlayer(interaction.user.id);

            if (p.canhGioi !== "Đại Thừa" || p.tang < 9) {
                return interaction.reply({
                    content:
                        "🌩️ Bạn chưa đạt **Đại Thừa tầng 9** để vượt Thiên Kiếp.",
                    ephemeral: true
                });
            }

            const success = Math.random() * 100 < 50;

            if (!success) {
                updatePlayer(interaction.user.id, {
                    hp: Math.max(1, p.hp - 50)
                });

                return interaction.reply(
                    "🌩️ **Thiên Kiếp thất bại!**\n❤️ Bạn bị Thiên Lôi đánh trúng."
                );
            }

            updatePlayer(interaction.user.id, {
                thienKiepDaVuot: true,
                hp: p.maxHp
            });

            return interaction.reply(
                "🌩️ **VƯỢT THIÊN KIẾP THÀNH CÔNG!**\n✨ Thiên đạo công nhận đạo hạnh của bạn."
            );
        }

        // =========================
        // SỨ GIẢ
        // =========================

        if (id === "menu_sugia") {
            const now = Date.now();
            const last = player.lastSuGia || 0;
            const cooldown = 24 * 60 * 60 * 1000;

            if (now - last < cooldown) {
                const remain = cooldown - (now - last);

                return interaction.reply({
                    content:
                        `👹 Sứ Giả chưa quay lại.\n` +
                        `⏳ Còn khoảng **${Math.ceil(remain / 3600000)} giờ**.`,
                    ephemeral: true
                });
            }

            const reward = Math.floor(Math.random() * 201) + 100;

            updatePlayer(interaction.user.id, {
                linhThach: player.linhThach + reward,
                lastSuGia: now
            });

            return interaction.reply(
                `👹 **Sứ Giả ban thưởng!**\n💎 +${reward} linh thạch.`
            );
        }

        // =========================
        // ĐỘNG PHỦ
        // =========================

        if (id === "menu_dongphu") {
            if (player.beQuan) {
                return runCommand(interaction, "xuatquan");
            }

            return runCommand(interaction, "bequan");
        }

        // =========================
        // XẾP HẠNG
        // =========================

        if (id === "menu_xephang") {
            return runCommand(interaction, "top");
        }

        // =========================
        // KHO ĐỒ
        // =========================

        if (id === "menu_khodo") {
            return runCommand(interaction, "tuido");
        }

        // =========================
        // GIAO DỊCH / CỬA HÀNG
        // =========================

        if (id === "menu_giaodich") {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("menu_shop")
                    .setLabel("Cửa Hàng")
                    .setEmoji("🏪")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("menu_linhthu_shop")
                    .setLabel("Mua Linh Thú")
                    .setEmoji("🐉")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🔄 GIAO DỊCH")
                        .setDescription(
                            "Chọn chức năng giao dịch:"
                        )
                ],
                components: [row, backButton()]
            });
        }

        if (id === "menu_shop") {
            return runCommand(interaction, "cuahang");
        }

        if (id === "menu_linhthu_shop") {
            return runCommand(interaction, "linhthu");
        }

        // =========================
        // KHÁC
        // =========================

        if (id === "menu_khac") {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("menu_thongtin")
                    .setLabel("Thông Tin")
                    .setEmoji("📜")
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId("menu_dan")
                    .setLabel("Dùng Đan")
                    .setEmoji("🧪")
                    .setStyle(ButtonStyle.Success)
            );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("📦 KHÁC")
                        .setDescription(
                            "Các chức năng phụ của đạo hữu."
                        )
                ],
                components: [row, backButton()]
            });
        }

        if (id === "menu_thongtin") {
            return runCommand(interaction, "thongtin");
        }

        if (id === "menu_dan") {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("menu_dan_linh")
                    .setLabel("Đan Linh Lực")
                    .setEmoji("🔥")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("menu_dan_exp")
                    .setLabel("Đan Kinh Nghiệm")
                    .setEmoji("✨")
                    .setStyle(ButtonStyle.Primary)
            );

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🧪 ĐAN DƯỢC")
                        .setDescription("Chọn loại đan muốn sử dụng.")
                ],
                components: [row, backButton()]
            });
        }

        if (id === "menu_dan_linh") {
            const cmd = require("./dando.js");

            const fake = interaction;

            fake.options = {
                getString: () => "linhluc"
            };

            return cmd.execute(fake);
        }

        if (id === "menu_dan_exp") {
            const cmd = require("./dando.js");

            const fake = interaction;

            fake.options = {
                getString: () => "kinhnghiem"
            };

            return cmd.execute(fake);
        }

        // =========================
        // SELECT NGHỀ
        // =========================

        if (id === "menu_select_nghenghiep") {
            const type = interaction.values[0];
            const job = professions[type];

            const old = player.ngheNghiep;

            if (old === type) {
                return interaction.reply({
                    content: `⚠️ Bạn đã là **${job.emoji} ${job.name}**.`,
                    ephemeral: true
                });
            }

            let cong = player.cong;
            let thu = player.thu;

            if (old === "khi") cong -= 10;
            if (old === "tran") thu -= 10;

            if (type === "khi") cong += 10;
            if (type === "tran") thu += 10;

            updatePlayer(interaction.user.id, {
                ngheNghiep: type,
                cong,
                thu
            });

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🛠️ GIA NHẬP NGHỀ NGHIỆP")
                        .setDescription(
                            `${job.emoji} Bạn đã trở thành **${job.name}**!\n\n` +
                            `🎁 ${job.bonus}`
                        )
                ],
                components: [backButton()]
            });
        }

        // =========================
        // SELECT TÔNG MÔN
        // =========================

        if (id === "menu_select_tongmon") {
            const type = interaction.values[0];
            const sect = sects[type];

            let linhLuc = player.linhLuc;
            let cong = player.cong;
            let thu = player.thu;

            if (player.tongMon === "thanh_van") linhLuc -= 5;
            if (player.tongMon === "thien_kiem") cong -= 5;
            if (player.tongMon === "dao_thien") thu -= 5;

            if (type === "thanh_van") linhLuc += 5;
            if (type === "thien_kiem") cong += 5;
            if (type === "dao_thien") thu += 5;

            updatePlayer(interaction.user.id, {
                tongMon: type,
                linhLuc,
                cong,
                thu
            });

            return interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🏯 GIA NHẬP TÔNG MÔN")
                        .setDescription(
                            `${sect.emoji} **${sect.name}**\n\n` +
                            `🎁 ${sect.bonus}`
                        )
                ],
                components: [backButton()]
            });
        }

        // =========================
        // PVP CHỌN NGƯỜI
        // =========================

        if (id === "menu_pvp_select") {
            const targetId = interaction.values[0];

            if (targetId === interaction.user.id) {
                return interaction.reply({
                    content: "❌ Không thể tự khiêu chiến chính mình.",
                    ephemeral: true
                });
            }

            const target = getPlayer(targetId);

            if (!target) {
                return interaction.reply({
                    content: "❌ Người này chưa bắt đầu tu luyện.",
                    ephemeral: true
                });
            }

            const challengeId =
                `${interaction.user.id}_${targetId}_${Date.now()}`;

            challenges.set(challengeId, {
                from: interaction.user.id,
                to: targetId
            });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`pvp_accept_${challengeId}`)
                    .setLabel("Chấp nhận")
                    .setEmoji("⚔️")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId(`pvp_decline_${challengeId}`)
                    .setLabel("Từ chối")
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Danger)
            );

            return interaction.reply({
                content:
                    `<@${targetId}> ⚔️ **${interaction.user.username}** ` +
                    `đã gửi lời khiêu chiến PvP!`,
                components: [row]
            });
        }

        // =========================
        // PVP CHẤP NHẬN
        // =========================

        if (id.startsWith("pvp_accept_")) {
            const challengeId = id.replace("pvp_accept_", "");
            const challenge = challenges.get(challengeId);

            if (!challenge) {
                return interaction.reply({
                    content: "❌ Lời khiêu chiến đã hết hạn.",
                    ephemeral: true
                });
            }

            if (interaction.user.id !== challenge.to) {
                return interaction.reply({
                    content: "❌ Bạn không phải người được khiêu chiến.",
                    ephemeral: true
                });
            }

            const a = getPlayer(challenge.from);
            const b = getPlayer(challenge.to);

            if (!a || !b) {
                return interaction.reply({
                    content: "❌ Không tìm thấy dữ liệu người chơi.",
                    ephemeral: true
                });
            }

            const powerA =
                a.cong * 2 +
                a.thu +
                Math.floor(a.linhLuc / 10) +
                Math.floor(Math.random() * 100);

            const powerB =
                b.cong * 2 +
                b.thu +
                Math.floor(b.linhLuc / 10) +
                Math.floor(Math.random() * 100);

            const winner = powerA >= powerB ? a : b;
            const loser = powerA >= powerB ? b : a;

            updatePlayer(loser.id, {
                hp: Math.max(1, loser.hp - 20)
            });

            challenges.delete(challengeId);

            return interaction.update({
                content:
                    `⚔️ **KẾT QUẢ PVP**\n\n` +
                    `🏆 Người thắng: **${winner.username}**\n` +
                    `💀 Người thua: **${loser.username}**\n\n` +
                    `⚔️ ${a.username}: **${powerA}**\n` +
                    `⚔️ ${b.username}: **${powerB}**`,
                components: []
            });
        }

        // =========================
        // PVP TỪ CHỐI
        // =========================

        if (id.startsWith("pvp_decline_")) {
            const challengeId = id.replace("pvp_decline_", "");
            const challenge = challenges.get(challengeId);

            if (!challenge) {
                return interaction.reply({
                    content: "❌ Lời khiêu chiến đã hết hạn.",
                    ephemeral: true
                });
            }

            if (interaction.user.id !== challenge.to) {
                return interaction.reply({
                    content: "❌ Bạn không phải người được khiêu chiến.",
                    ephemeral: true
                });
            }

            challenges.delete(challengeId);

            return interaction.update({
                content: "❌ Lời khiêu chiến đã bị từ chối.",
                components: []
            });
        }

        return interaction.reply({
            content: "❌ Chức năng chưa được nhận diện.",
            ephemeral: true
        });
    }
};
