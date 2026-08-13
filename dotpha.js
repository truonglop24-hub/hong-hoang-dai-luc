const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// CẤU HÌNH
// =====================================================

// Cooldown 20 giây sau khi người chơi bấm
// ĐỒNG Ý hoặc TỪ CHỐI
const dotPhaCooldown = new Map();
const DOTPHA_COOLDOWN = 20_000;

// Thời gian chờ nút xác nhận
const CONFIRM_TIMEOUT = 30_000;

// =====================================================
// 12 CẢNH GIỚI
// MỖI CẢNH GIỚI 12 TẦNG
//
// TẦNG 1 - 3  : SƠ KỲ
// TẦNG 4 - 6  : TRUNG KỲ
// TẦNG 7 - 9  : HẬU KỲ
// TẦNG 10-12  : VIÊN MÃN
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        max: 12,
        needTuVi: 50,
        stats: {
            hp: 100,
            cong: 20,
            thu: 15
        }
    },

    {
        name: "Luyện Khí",
        max: 12,
        needTuVi: 100,
        stats: {
            hp: 300,
            cong: 60,
            thu: 40
        }
    },

    {
        name: "Trúc Cơ",
        max: 12,
        needTuVi: 250,
        stats: {
            hp: 1000,
            cong: 200,
            thu: 140
        }
    },

    {
        name: "Kim Đan",
        max: 12,
        needTuVi: 500,
        stats: {
            hp: 3000,
            cong: 600,
            thu: 400
        }
    },

    {
        name: "Nguyên Anh",
        max: 12,
        needTuVi: 1000,
        stats: {
            hp: 10000,
            cong: 2000,
            thu: 1400
        }
    },

    {
        name: "Hóa Thần",
        max: 12,
        needTuVi: 2000,
        stats: {
            hp: 30000,
            cong: 6000,
            thu: 4000
        }
    },

    {
        name: "Luyện Hư",
        max: 12,
        needTuVi: 4000,
        stats: {
            hp: 100000,
            cong: 20000,
            thu: 14000
        }
    },

    {
        name: "Hợp Thể",
        max: 12,
        needTuVi: 8000,
        stats: {
            hp: 300000,
            cong: 60000,
            thu: 40000
        }
    },

    {
        name: "Đại Thừa",
        max: 12,
        needTuVi: 16000,
        stats: {
            hp: 1000000,
            cong: 200000,
            thu: 140000
        }
    },

    {
        name: "Độ Kiếp",
        max: 12,
        needTuVi: 32000,
        stats: {
            hp: 3000000,
            cong: 600000,
            thu: 400000
        }
    },

    {
        name: "Tán Tiên",
        max: 12,
        needTuVi: 64000,
        stats: {
            hp: 10000000,
            cong: 2000000,
            thu: 1400000
        }
    },

    {
        name: "Chân Tiên",
        max: 12,
        needTuVi: 128000,
        stats: {
            hp: 30000000,
            cong: 6000000,
            thu: 4000000
        }
    }
];

// =====================================================
// GIAI ĐOẠN CẢNH GIỚI
// =====================================================

function getStage(tier) {
    tier = Number(tier || 1);

    if (tier <= 3) {
        return "Sơ Kỳ";
    }

    if (tier <= 6) {
        return "Trung Kỳ";
    }

    if (tier <= 9) {
        return "Hậu Kỳ";
    }

    return "Viên Mãn";
}

// =====================================================
// VẬT PHẨM YÊU CẦU
//
// Tầng 3  -> Trung Kỳ Đan
// Tầng 6  -> Hậu Kỳ Đan
// Tầng 9  -> Viên Mãn Đan
// Tầng 12 -> Phá Cảnh Đan
// =====================================================

function getRequiredItem(realmName, tier) {

    if (tier === 3) {
        return {
            type: "danDuoc",
            name: `${realmName} Trung Kỳ Đan`,
            description: "Đột phá Sơ Kỳ → Trung Kỳ"
        };
    }

    if (tier === 6) {
        return {
            type: "danDuoc",
            name: `${realmName} Hậu Kỳ Đan`,
            description: "Đột phá Trung Kỳ → Hậu Kỳ"
        };
    }

    if (tier === 9) {
        return {
            type: "danDuoc",
            name: `${realmName} Viên Mãn Đan`,
            description: "Đột phá Hậu Kỳ → Viên Mãn"
        };
    }

    if (tier === 12) {
        return {
            type: "vatPham",
            name: `${realmName} Phá Cảnh Đan`,
            description: "Đột phá Viên Mãn → cảnh giới tiếp theo"
        };
    }

    return null;
}

// =====================================================
// SO SÁNH TÊN VẬT PHẨM
// =====================================================

function sameItemName(item, requiredName) {

    if (typeof item === "string") {
        return (
            item.trim().toLowerCase() ===
            requiredName.trim().toLowerCase()
        );
    }

    if (item && typeof item === "object") {

        const name =
            item.name ||
            item.ten ||
            item.itemName;

        if (!name) {
            return false;
        }

        return (
            String(name)
                .trim()
                .toLowerCase() ===
            requiredName
                .trim()
                .toLowerCase()
        );
    }

    return false;
}

// =====================================================
// KIỂM TRA VẬT PHẨM
// =====================================================

function hasRequiredItem(player, requiredItem) {

    if (!player || !player.tuiDo) {
        return false;
    }

    const list =
        player.tuiDo[requiredItem.type];

    if (!Array.isArray(list)) {
        return false;
    }

    return list.some(item =>
        sameItemName(
            item,
            requiredItem.name
        )
    );
}

// =====================================================
// TRỪ 1 VẬT PHẨM
// =====================================================

function consumeItem(player, requiredItem) {

    if (!player || !player.tuiDo) {
        return false;
    }

    const list =
        player.tuiDo[requiredItem.type];

    if (!Array.isArray(list)) {
        return false;
    }

    const index =
        list.findIndex(item =>
            sameItemName(
                item,
                requiredItem.name
            )
        );

    if (index === -1) {
        return false;
    }

    const item = list[index];

    // -------------------------------------------------
    // Trường hợp túi đồ lưu chuỗi
    // -------------------------------------------------

    if (typeof item === "string") {
        list.splice(index, 1);
        return true;
    }

    // -------------------------------------------------
    // Trường hợp túi đồ lưu object có quantity
    // -------------------------------------------------

    if (
        item &&
        typeof item === "object" &&
        typeof item.quantity === "number"
    ) {

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            list.splice(index, 1);
        }

        return true;
    }

    // -------------------------------------------------
    // Trường hợp object có soLuong
    // -------------------------------------------------

    if (
        item &&
        typeof item === "object" &&
        typeof item.soLuong === "number"
    ) {

        if (item.soLuong > 1) {
            item.soLuong -= 1;
        } else {
            list.splice(index, 1);
        }

        return true;
    }

    // Nếu là object nhưng không có số lượng
    list.splice(index, 1);

    return true;
}

// =====================================================
// TẠO EMBED THIẾU TU VI
// =====================================================

function createMissingTuViEmbed(
    realm,
    stage,
    tier,
    currentTuVi,
    requiredTuVi
) {

    const missing =
        requiredTuVi - currentTuVi;

    return new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("⚠️ CHƯA ĐỦ TU VI")
        .setDescription(
            `🌱 **${realm.name} ${stage} tầng ${tier}**`
        )
        .addFields(
            {
                name: "⚔️ Tu Vi hiện tại",
                value:
                    currentTuVi.toLocaleString(),
                inline: true
            },
            {
                name: "🔓 Tu Vi yêu cầu",
                value:
                    requiredTuVi.toLocaleString(),
                inline: true
            },
            {
                name: "📉 Còn thiếu",
                value:
                    missing.toLocaleString(),
                inline: true
            }
        )
        .setFooter({
            text:
                "Cần đủ Tu Vi mới có thể đột phá."
        });
}

// =====================================================
// /DOTPHA
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dotpha")
            .setDescription(
                "⚡ Đột phá cảnh giới bằng Tu Vi"
            ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        const p =
            getPlayer(userId);

        // =================================================
        // KIỂM TRA NHÂN VẬT
        // =================================================

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA COOLDOWN
        // =================================================

        const now =
            Date.now();

        const lastAttempt =
            dotPhaCooldown.get(userId) || 0;

        const remainingCooldown =
            DOTPHA_COOLDOWN -
            (now - lastAttempt);

        if (remainingCooldown > 0) {

            const seconds =
                Math.ceil(
                    remainingCooldown / 1000
                );

            return interaction.reply({
                content:
                    `⏳ **Thiên kiếp đang hồi phục!**\n` +
                    `Bạn phải chờ **${seconds} giây** nữa mới có thể dùng \`/dotpha\`.`,
                ephemeral: true
            });
        }

        // =================================================
        // TÌM CẢNH GIỚI
        // =================================================

        let index =
            realms.findIndex(
                realm =>
                    realm.name === p.canhGioi
            );

        // Nếu dữ liệu cũ không còn nằm trong 12 cảnh giới
        // thì đưa về cảnh giới cuối cùng thay vì làm bot crash.

        if (index === -1) {

            index =
                realms.findIndex(
                    realm =>
                        realm.name === "Chân Tiên"
                );

            if (index === -1) {
                index = 0;
            }
        }

        const realm =
            realms[index];

        // =================================================
        // TẦNG HIỆN TẠI
        // =================================================

        const currentTier =
            Math.max(
                1,
                Math.min(
                    12,
                    Number(p.tang || 1)
                )
            );

        const currentStage =
            getStage(currentTier);

        // =================================================
        // TU VI
        // =================================================

        const currentTuVi =
            Number(p.tuvi || 0);

        // =================================================
        // TU VI YÊU CẦU
        // =================================================

        const requiredTuVi =
            realm.needTuVi *
            currentTier;

        // =================================================
        // KIỂM TRA ĐỦ TU VI
        // =================================================

        if (
            currentTuVi <
            requiredTuVi
        ) {

            return interaction.reply({
                embeds: [
                    createMissingTuViEmbed(
                        realm,
                        currentStage,
                        currentTier,
                        currentTuVi,
                        requiredTuVi
                    )
                ],
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA VẬT PHẨM
        // =================================================

        const requiredItem =
            getRequiredItem(
                realm.name,
                currentTier
            );

        if (
            requiredItem &&
            !hasRequiredItem(
                p,
                requiredItem
            )
        ) {

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(0xe67e22)
                        .setTitle(
                            "❌ THIẾU VẬT PHẨM ĐỘT PHÁ"
                        )
                        .setDescription(
                            `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**\n\n` +
                            `${requiredItem.description}`
                        )
                        .addFields(
                            {
                                name:
                                    "💊 Vật phẩm yêu cầu",
                                value:
                                    `**${requiredItem.name}**`,
                                inline: false
                            },
                            {
                                name:
                                    "🏪 Cách kiếm",
                                value:
                                    "• Cửa hàng\n" +
                                    "• Phó bản",
                                inline: false
                            }
                        )
                        .setFooter({
                            text:
                                "Vật phẩm chỉ mất khi đột phá thành công."
                        })

                ],

                ephemeral: true
            });
        }

        // =================================================
        // NÚT ĐỒNG Ý
        // =================================================

        const confirmButton =
            new ButtonBuilder()
                .setCustomId(
                    `dotpha_confirm_${userId}`
                )
                .setLabel(
                    "Đồng ý đột phá"
                )
                .setEmoji("⚡")
                .setStyle(
                    ButtonStyle.Success
                );

        // =================================================
        // NÚT TỪ CHỐI
        // =================================================

        const cancelButton =
            new ButtonBuilder()
                .setCustomId(
                    `dotpha_cancel_${userId}`
                )
                .setLabel(
                    "Từ chối đột phá"
                )
                .setEmoji("❌")
                .setStyle(
                    ButtonStyle.Danger
                );

        const row =
            new ActionRowBuilder()
                .addComponents(
                    confirmButton,
                    cancelButton
                );

        // =================================================
        // EMBED XÁC NHẬN
        // =================================================

        let itemText =
            "Không yêu cầu";

        if (requiredItem) {
            itemText =
                `**${requiredItem.name}**`;
        }

        const confirmEmbed =
            new EmbedBuilder()
                .setColor(0x9b59b6)
                .setTitle(
                    "⚡ XÁC NHẬN ĐỘT PHÁ"
                )
                .setDescription(
                    `Bạn có chắc chắn muốn đột phá không?\n\n` +

                    `🌱 **Cảnh giới hiện tại:**\n` +
                    `**${realm.name} ${currentStage} tầng ${currentTier}**\n\n` +

                    `⚔️ **Tu Vi:** ` +
                    `${currentTuVi.toLocaleString()}\n` +

                    `🔓 **Tu Vi yêu cầu:** ` +
                    `${requiredTuVi.toLocaleString()}\n\n` +

                    `💊 **Vật phẩm:**\n` +
                    `${itemText}\n\n` +

                    `🎲 **Tỷ lệ thành công:** ngẫu nhiên 1 - 100%\n` +

                    `⚠️ **Nếu thất bại có thể mất 1 - 10.000 Tu Vi.**`
                )
                .setFooter({
                    text:
                        "Chọn Đồng ý hoặc Từ chối bên dưới."
                });

        // =================================================
        // GỬI XÁC NHẬN
        // =================================================

        const confirmationMessage =
            await interaction.reply({

                embeds: [
                    confirmEmbed
                ],

                components: [
                    row
                ],

                fetchReply: true
            });

        // =================================================
        // CHỜ BẤM NÚT
        // =================================================

        let buttonInteraction;

        try {

            buttonInteraction =
                await confirmationMessage
                    .awaitMessageComponent({

                        filter:
                            button => {

                                return (
                                    button.user.id ===
                                    userId
                                );
                            },

                        time:
                            CONFIRM_TIMEOUT
                    });

        } catch (error) {

            // Không bấm trong 30 giây
            // Không tính cooldown

            const expiredEmbed =
                new EmbedBuilder()
                    .setColor(0x7f8c8d)
                    .setTitle(
                        "⌛ HẾT THỜI GIAN XÁC NHẬN"
                    )
                    .setDescription(
                        "Bạn không lựa chọn trong 30 giây.\n\n" +
                        "Lượt đột phá đã được hủy."
                    )
                    .setFooter({
                        text:
                            "Không mất Tu Vi, không mất vật phẩm và không bị cooldown."
                    });

            return interaction.editReply({

                embeds: [
                    expiredEmbed
                ],

                components: []
            });
        }

        // =================================================
        // QUAN TRỌNG
        //
        // BẤM ĐỒNG Ý:
        // → COOLDOWN 20 GIÂY
        //
        // BẤM TỪ CHỐI:
        // → CŨNG COOLDOWN 20 GIÂY
        //
        // KHÔNG BẤM:
        // → KHÔNG COOLDOWN
        // =================================================

        dotPhaCooldown.set(
            userId,
            Date.now()
        );

        // =================================================
        // TỪ CHỐI ĐỘT PHÁ
        // =================================================

        if (
            buttonInteraction.customId ===
            `dotpha_cancel_${userId}`
        ) {

            const cancelEmbed =
                new EmbedBuilder()
                    .setColor(0xe74c3c)
                    .setTitle(
                        "❌ ĐÃ TỪ CHỐI ĐỘT PHÁ"
                    )
                    .setDescription(
                        "Bạn đã hủy lần đột phá này.\n\n" +

                        "💎 Tu Vi: **Không mất**\n" +

                        "💊 Vật phẩm: **Không mất**\n" +

                        "⏳ Cooldown: **20 giây**"
                    )
                    .setFooter({
                        text:
                            "Bạn vẫn phải chờ 20 giây trước khi dùng /dotpha lại."
                    });

            await buttonInteraction.update({

                embeds: [
                    cancelEmbed
                ],

                components: []
            });

            return;
        }

        // =================================================
        // ĐỒNG Ý ĐỘT PHÁ
        // =================================================

        if (
            buttonInteraction.customId ===
            `dotpha_confirm_${userId}`
        ) {

            await buttonInteraction.update({

                embeds: [

                    new EmbedBuilder()
                        .setColor(0xf1c40f)
                        .setTitle(
                            "⚡ ĐANG ĐỘT PHÁ..."
                        )
                        .setDescription(
                            "🌩️ Thiên kiếp đang giáng xuống...\n\n" +

                            `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**\n\n` +

                            "⚔️ Đang tính toán kết quả..."
                        )
                        .setFooter({
                            text:
                                "Kết quả đang được tính..."
                        })

                ],

                components: []
            });

            // =================================================
            // RANDOM TỶ LỆ
            // =================================================

            const successRate =
                Math.floor(
                    Math.random() * 100
                ) + 1;

            const roll =
                Math.floor(
                    Math.random() * 100
                ) + 1;

            const success =
                roll <= successRate;

            // =================================================
            // ĐỘT PHÁ THẤT BẠI
            // =================================================

            if (!success) {

                // Mất ngẫu nhiên 1 → 10.000 Tu Vi
                const lostTuVi =
                    Math.min(
                        currentTuVi,
                        Math.floor(
                            Math.random() *
                            10000
                        ) + 1
                    );

                const newTuVi =
                    Math.max(
                        0,
                        currentTuVi -
                        lostTuVi
                    );

                updatePlayer(
                    userId,
                    {
                        tuvi:
                            newTuVi
                    }
                );

                const failEmbed =
                    new EmbedBuilder()
                        .setColor(0xe74c3c)
                        .setTitle(
                            "💥 ĐỘT PHÁ THẤT BẠI"
                        )
                        .setDescription(
                            `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**\n\n` +

                            "Thiên kiếp phản phệ, Tu Vi bị tổn hao!"
                        )
                        .addFields(

                            {
                                name:
                                    "🎲 Tỷ lệ thành công",
                                value:
                                    `${successRate}%`,
                                inline: true
                            },

                            {
                                name:
                                    "🎯 Kết quả",
                                value:
                                    `${roll}`,
                                inline: true
                            },

                            {
                                name:
                                    "💥 Tu Vi mất",
                                value:
                                    `-${lostTuVi.toLocaleString()}`,
                                inline: true
                            },

                            {
                                name:
                                    "⚔️ Tu Vi còn lại",
                                value:
                                    newTuVi.toLocaleString(),
                                inline: true
                            },

                            {
                                name:
                                    "💊 Vật phẩm",
                                value:
                                    requiredItem
                                        ? "Không bị mất"
                                        : "Không yêu cầu",
                                inline: true
                            }
                        )
                        .setFooter({
                            text:
                                "Có thể dùng /dotpha lại sau 20 giây."
                        });

                return buttonInteraction.editReply({

                    embeds: [
                        failEmbed
                    ],

                    components: []
                });
            }

            // =================================================
            // XÁC ĐỊNH CẢNH GIỚI / TẦNG MỚI
            // =================================================

            let newRealmIndex =
                index;

            let newTier =
                currentTier + 1;

            // =================================================
            // TẦNG 12 → CẢNH GIỚI TIẾP THEO
            // =================================================

            if (
                newTier >
                realm.max
            ) {

                // -------------------------------------------------
                // ĐÃ ĐẠT CẢNH GIỚI CUỐI
                // -------------------------------------------------

                if (
                    !realms[index + 1]
                ) {

                    const maxEmbed =
                        new EmbedBuilder()
                            .setColor(0x9b59b6)
                            .setTitle(
                                "🌌 CHÂN TIÊN VIÊN MÃN"
                            )
                            .setDescription(
                                "Bạn đã đạt:\n\n" +

                                "**Chân Tiên Viên Mãn tầng 12**\n\n" +

                                "Đây là cảnh giới cao nhất trong hệ thống 12 cảnh giới."
                            )
                            .setFooter({
                                text:
                                    "Cooldown 20 giây vẫn được áp dụng."
                            });

                    return buttonInteraction.editReply({

                        embeds: [
                            maxEmbed
                        ],

                        components: []
                    });
                }

                // Sang cảnh giới tiếp theo
                newRealmIndex =
                    index + 1;

                newTier = 1;
            }

            const newRealm =
                realms[newRealmIndex];

            const newStage =
                getStage(newTier);

            // =================================================
            // TRỪ VẬT PHẨM
            //
            // CHỈ TRỪ KHI THÀNH CÔNG
            // =================================================

            if (requiredItem) {

                const consumed =
                    consumeItem(
                        p,
                        requiredItem
                    );

                if (!consumed) {

                    return buttonInteraction.editReply({

                        embeds: [

                            new EmbedBuilder()
                                .setColor(0xe74c3c)
                                .setTitle(
                                    "❌ KHÔNG THỂ HOÀN TẤT ĐỘT PHÁ"
                                )
                                .setDescription(
                                    "Vật phẩm yêu cầu không còn trong túi đồ.\n\n" +

                                    `💊 Vật phẩm: **${requiredItem.name}**\n\n` +

                                    "Đột phá chưa được lưu."
                                )
                                .setFooter({
                                    text:
                                        "Cooldown 20 giây vẫn được áp dụng."
                                })

                        ],

                        components: []
                    });
                }
            }

            // =================================================
            // HỆ SỐ TĂNG CHỈ SỐ
            // =================================================

            const BREAKTHROUGH_MULTIPLIER =
                9;

            const tierMultiplier =
                newTier;

            // =================================================
            // TĂNG HP
            // =================================================

            const hpIncrease =
                Math.floor(
                    newRealm.stats.hp *
                    tierMultiplier *
                    BREAKTHROUGH_MULTIPLIER
                );

            // =================================================
            // TĂNG CÔNG
            // =================================================

            const congIncrease =
                Math.floor(
                    newRealm.stats.cong *
                    tierMultiplier *
                    BREAKTHROUGH_MULTIPLIER
                );

            // =================================================
            // TĂNG THỦ
            // =================================================

            const thuIncrease =
                Math.floor(
                    newRealm.stats.thu *
                    tierMultiplier *
                    BREAKTHROUGH_MULTIPLIER
                );

            // =================================================
            // CHỈ SỐ CŨ
            // =================================================

            const oldMaxHp =
                Number(
                    p.maxHp || 0
                );

            const oldHp =
                Number(
                    p.hp || 0
                );

            const oldCong =
                Number(
                    p.cong || 0
                );

            const oldThu =
                Number(
                    p.thu || 0
                );

            // =================================================
            // CHỈ SỐ MỚI
            // =================================================

            const newMaxHp =
                oldMaxHp +
                hpIncrease;

            const newHp =
                oldHp +
                hpIncrease;

            const newCong =
                oldCong +
                congIncrease;

            const newThu =
                oldThu +
                thuIncrease;

            // =================================================
            // TU VI GIỮ NGUYÊN
            // =================================================

            const remainingTuVi =
                currentTuVi;

            // =================================================
            // KINH NGHIỆM GIỮ NGUYÊN
            // =================================================

            const remainingKinhNghiem =
                Number(
                    p.kinhNghiem || 0
                );

            // =================================================
            // LƯU DATABASE
            // =================================================

            updatePlayer(
                userId,
                {
                    canhGioi:
                        newRealm.name,

                    tang:
                        newTier,

                    tuvi:
                        remainingTuVi,

                    kinhNghiem:
                        remainingKinhNghiem,

                    tuiDo:
                        p.tuiDo,

                    maxHp:
                        newMaxHp,

                    hp:
                        newHp,

                    cong:
                        newCong,

                    thu:
                        newThu
                }
            );

            // =================================================
            // HIỂN THỊ VẬT PHẨM
            // =================================================

            let itemText =
                "";

            if (requiredItem) {

                itemText =
                    `\n💊 **Đã sử dụng:** ${requiredItem.name}`;
            }

            // =================================================
            // THÔNG BÁO THÀNH CÔNG
            // =================================================

            const successEmbed =
                new EmbedBuilder()
                    .setColor(0x2ecc71)
                    .setTitle(
                        "⚡ ĐỘT PHÁ THÀNH CÔNG!"
                    )
                    .setDescription(

                        `🌌 **${realm.name} ${currentStage} tầng ${currentTier}**\n` +

                        `⬇️\n` +

                        `✨ **${newRealm.name} ${newStage} tầng ${newTier}**` +

                        itemText
                    )
                    .addFields(

                        {
                            name:
                                "📈 Tỷ lệ thành công",
                            value:
                                `${successRate}%`,
                            inline: true
                        },

                        {
                            name:
                                "🎯 Kết quả",
                            value:
                                `${roll}`,
                            inline: true
                        },

                        {
                            name:
                                "⚔️ Tu Vi",
                            value:
                                remainingTuVi.toLocaleString(),
                            inline: true
                        },

                        {
                            name:
                                "🌱 Cảnh giới",
                            value:
                                `**${newRealm.name} ${newStage} tầng ${newTier}**`,
                            inline: false
                        },

                        {
                            name:
                                "❤️ HP",
                            value:
                                `+${hpIncrease.toLocaleString()}\n` +
                                `Tổng: **${newMaxHp.toLocaleString()}**`,
                            inline: true
                        },

                        {
                            name:
                                "⚔️ Công",
                            value:
                                `+${congIncrease.toLocaleString()}\n` +
                                `Tổng: **${newCong.toLocaleString()}**`,
                            inline: true
                        },

                        {
                            name:
                                "🛡️ Thủ",
                            value:
                                `+${thuIncrease.toLocaleString()}\n` +
                                `Tổng: **${newThu.toLocaleString()}**`,
                            inline: true
                        }
                    )
                    .setFooter({
                        text:
                            "Hồng Hoang Đại Lục • 12 cảnh giới • 12 tầng • Cooldown 20 giây"
                    });

            return buttonInteraction.editReply({

                embeds: [
                    successEmbed
                ],

                components: []
            });
        }
    }
};
