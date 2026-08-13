const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// COOLDOWN ĐỘT PHÁ: 20 GIÂY
// =====================================================

const dotPhaCooldown = new Map();
const DOTPHA_COOLDOWN = 20 * 1000;

// =====================================================
// 18 CẢNH GIỚI
// MỖI CẢNH GIỚI 12 TẦNG
// =====================================================

const realms = [
    {
        name: "Phàm Nhân",
        max: 12,
        needTuVi: 50,
        stats: { hp: 100, cong: 20, thu: 15 }
    },
    {
        name: "Luyện Khí",
        max: 12,
        needTuVi: 100,
        stats: { hp: 300, cong: 60, thu: 40 }
    },
    {
        name: "Trúc Cơ",
        max: 12,
        needTuVi: 250,
        stats: { hp: 1000, cong: 200, thu: 140 }
    },
    {
        name: "Kim Đan",
        max: 12,
        needTuVi: 500,
        stats: { hp: 3000, cong: 600, thu: 400 }
    },
    {
        name: "Nguyên Anh",
        max: 12,
        needTuVi: 1000,
        stats: { hp: 10000, cong: 2000, thu: 1400 }
    },
    {
        name: "Hóa Thần",
        max: 12,
        needTuVi: 2000,
        stats: { hp: 30000, cong: 6000, thu: 4000 }
    },
    {
        name: "Luyện Hư",
        max: 12,
        needTuVi: 4000,
        stats: { hp: 100000, cong: 20000, thu: 14000 }
    },
    {
        name: "Hợp Thể",
        max: 12,
        needTuVi: 8000,
        stats: { hp: 300000, cong: 60000, thu: 40000 }
    },
    {
        name: "Đại Thừa",
        max: 12,
        needTuVi: 16000,
        stats: { hp: 1000000, cong: 200000, thu: 140000 }
    },
    {
        name: "Độ Kiếp",
        max: 12,
        needTuVi: 32000,
        stats: { hp: 3000000, cong: 600000, thu: 400000 }
    },
    {
        name: "Tiên Nhân",
        max: 12,
        needTuVi: 64000,
        stats: { hp: 10000000, cong: 2000000, thu: 1400000 }
    },
    {
        name: "Chân Tiên",
        max: 12,
        needTuVi: 128000,
        stats: { hp: 30000000, cong: 6000000, thu: 4000000 }
    },
    {
        name: "Thiên Tiên",
        max: 12,
        needTuVi: 256000,
        stats: { hp: 100000000, cong: 20000000, thu: 14000000 }
    },
    {
        name: "Huyền Tiên",
        max: 12,
        needTuVi: 512000,
        stats: { hp: 300000000, cong: 60000000, thu: 40000000 }
    },
    {
        name: "Kim Tiên",
        max: 12,
        needTuVi: 1024000,
        stats: { hp: 1000000000, cong: 200000000, thu: 140000000 }
    },
    {
        name: "Thánh Nhân",
        max: 12,
        needTuVi: 2048000,
        stats: {
            hp: 5000000000,
            cong: 1000000000,
            thu: 700000000
        }
    },
    {
        name: "Thiên Đạo",
        max: 12,
        needTuVi: 4096000,
        stats: {
            hp: 20000000000,
            cong: 4000000000,
            thu: 2800000000
        }
    },
    {
        name: "Đại Đạo",
        max: 12,
        needTuVi: 8192000,
        stats: {
            hp: 100000000000,
            cong: 20000000000,
            thu: 14000000000
        }
    }
];

// =====================================================
// GIAI ĐOẠN
//
// TẦNG 1-3  = SƠ KỲ
// TẦNG 4-6  = TRUNG KỲ
// TẦNG 7-9  = HẬU KỲ
// TẦNG 10-12 = VIÊN MÃN
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
// 3 -> 4  : Trung Kỳ Đan
// 6 -> 7  : Hậu Kỳ Đan
// 9 -> 10 : Viên Mãn Đan
// 12 -> 1 cảnh giới mới : Phá Cảnh Đan
//
// Tên này phải trùng tên vật phẩm trong tuiDo.
// =====================================================

function getRequiredItem(realmName, tier) {
    if (tier === 3) {
        return {
            type: "danDuoc",
            name: realmName + " Trung Kỳ Đan",
            description:
                "Cần đan dược để từ Sơ Kỳ tiến vào Trung Kỳ."
        };
    }

    if (tier === 6) {
        return {
            type: "danDuoc",
            name: realmName + " Hậu Kỳ Đan",
            description:
                "Cần đan dược để từ Trung Kỳ tiến vào Hậu Kỳ."
        };
    }

    if (tier === 9) {
        return {
            type: "danDuoc",
            name: realmName + " Viên Mãn Đan",
            description:
                "Cần đan dược để từ Hậu Kỳ tiến vào Viên Mãn."
        };
    }

    if (tier === 12) {
        return {
            type: "vatPham",
            name: realmName + " Phá Cảnh Đan",
            description:
                "Cần vật phẩm phá cảnh để tiến vào cảnh giới tiếp theo."
        };
    }

    return null;
}

// =====================================================
// TÌM VẬT PHẨM
// =====================================================

function findItem(player, requiredItem) {
    if (!player || !player.tuiDo) {
        return -1;
    }

    if (!Array.isArray(player.tuiDo[requiredItem.type])) {
        return -1;
    }

    const list = player.tuiDo[requiredItem.type];

    const target =
        String(requiredItem.name)
            .trim()
            .toLowerCase();

    return list.findIndex(function(item) {
        return String(item)
            .trim()
            .toLowerCase() === target;
    });
}

// =====================================================
// XÓA 1 VẬT PHẨM
// =====================================================

function consumeItem(player, requiredItem) {
    if (!player || !player.tuiDo) {
        return false;
    }

    if (!Array.isArray(player.tuiDo[requiredItem.type])) {
        return false;
    }

    const list =
        [...player.tuiDo[requiredItem.type]];

    const target =
        String(requiredItem.name)
            .trim()
            .toLowerCase();

    const index =
        list.findIndex(function(item) {
            return String(item)
                .trim()
                .toLowerCase() === target;
        });

    if (index === -1) {
        return false;
    }

    list.splice(index, 1);

    player.tuiDo[requiredItem.type] = list;

    return true;
}

// =====================================================
// MODULE
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("dotpha")
            .setDescription(
                "⚡ Đột phá cảnh giới bằng Tu Vi"
            ),

    // =================================================
    // EXECUTE
    // =================================================

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
        // COOLDOWN 20 GIÂY
        // =================================================

        const now =
            Date.now();

        const lastTime =
            dotPhaCooldown.get(userId) || 0;

        const remaining =
            DOTPHA_COOLDOWN -
            (now - lastTime);

        if (remaining > 0) {

            const seconds =
                Math.ceil(
                    remaining / 1000
                );

            return interaction.reply({
                content:
                    "⏳ **Bạn vừa đột phá!**\n\n" +
                    "Hãy chờ **" +
                    seconds +
                    " giây** nữa mới có thể đột phá tiếp.",
                ephemeral: true
            });
        }

        // =================================================
        // TÌM CẢNH GIỚI
        // =================================================

        let realmIndex =
            realms.findIndex(function(realm) {
                return realm.name === p.canhGioi;
            });

        if (realmIndex === -1) {
            realmIndex = 0;
        }

        const realm =
            realms[realmIndex];

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
            Number(realm.needTuVi) *
            currentTier;

        // =================================================
        // KIỂM TRA TU VI
        // =================================================

        if (currentTuVi < requiredTuVi) {

            const missing =
                requiredTuVi -
                currentTuVi;

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xf1c40f)

                        .setTitle(
                            "⚠️ CHƯA ĐỦ TU VI"
                        )

                        .setDescription(
                            "🌱 **" +
                            realm.name +
                            " " +
                            currentStage +
                            " tầng " +
                            currentTier +
                            "**"
                        )

                        .addFields(

                            {
                                name:
                                    "⚔️ Tu Vi hiện tại",
                                value:
                                    currentTuVi
                                        .toLocaleString(),
                                inline: true
                            },

                            {
                                name:
                                    "🔓 Tu Vi yêu cầu",
                                value:
                                    requiredTuVi
                                        .toLocaleString(),
                                inline: true
                            },

                            {
                                name:
                                    "📉 Còn thiếu",
                                value:
                                    missing
                                        .toLocaleString(),
                                inline: true
                            }

                        )

                        .setFooter({
                            text:
                                "Cần đủ Tu Vi mới có thể đột phá."
                        })

                ],

                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA VẬT PHẨM YÊU CẦU
        // =================================================

        const requiredItem =
            getRequiredItem(
                realm.name,
                currentTier
            );

        if (requiredItem) {

            const itemIndex =
                findItem(
                    p,
                    requiredItem
                );

            if (itemIndex === -1) {

                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(0xe67e22)

                            .setTitle(
                                "❌ THIẾU VẬT PHẨM ĐỘT PHÁ"
                            )

                            .setDescription(
                                "🌱 **" +
                                realm.name +
                                " " +
                                currentStage +
                                " tầng " +
                                currentTier +
                                "**\n\n" +
                                requiredItem.description
                            )

                            .addFields(

                                {
                                    name:
                                        "💊 Vật phẩm yêu cầu",
                                    value:
                                        "**" +
                                        requiredItem.name +
                                        "**",
                                    inline: false
                                },

                                {
                                    name:
                                        "🏪 Cách kiếm",
                                    value:
                                        "• Có thể bán trong cửa hàng.\n" +
                                        "• Có thể rơi từ phó bản.",
                                    inline: false
                                },

                                {
                                    name:
                                        "📦 Túi đồ",
                                    value:
                                        "Bạn chưa có vật phẩm này.",
                                    inline: false
                                }

                            )

                            .setFooter({
                                text:
                                    "Vật phẩm chỉ bị mất khi đột phá thành công."
                            })

                    ],

                    ephemeral: true
                });
            }
        }

        // =================================================
        // KHÓA COOLDOWN
        // =================================================

        dotPhaCooldown.set(
            userId,
            Date.now()
        );

        // =================================================
        // TỶ LỆ THÀNH CÔNG
        //
        // GIỮ CƠ CHẾ CŨ:
        // RANDOM 1-100%
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
        // THẤT BẠI
        // MẤT 1 - 10.000 TU VI
        // KHÔNG MẤT VẬT PHẨM
        // =================================================

        if (!success) {

            const lostTuVi =
                Math.min(
                    currentTuVi,
                    Math.floor(
                        Math.random() * 10000
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

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(0xe74c3c)

                        .setTitle(
                            "💥 ĐỘT PHÁ THẤT BẠI"
                        )

                        .setDescription(
                            "🌱 **" +
                            realm.name +
                            " " +
                            currentStage +
                            " tầng " +
                            currentTier +
                            "**\n\n" +
                            "Thiên kiếp phản phệ, Tu Vi bị tổn hao!"
                        )

                        .addFields(

                            {
                                name:
                                    "🎲 Tỷ lệ thành công",
                                value:
                                    successRate + "%",
                                inline: true
                            },

                            {
                                name:
                                    "🎯 Kết quả",
                                value:
                                    String(roll),
                                inline: true
                            },

                            {
                                name:
                                    "💥 Tu Vi mất",
                                value:
                                    "-" +
                                    lostTuVi
                                        .toLocaleString(),
                                inline: true
                            },

                            {
                                name:
                                    "⚔️ Tu Vi còn lại",
                                value:
                                    newTuVi
                                        .toLocaleString(),
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
                                "Có thể đột phá lại sau 20 giây."
                        })

                ]

            });
        }

        // =================================================
        // XÁC ĐỊNH CẢNH GIỚI / TẦNG MỚI
        // =================================================

        let newRealmIndex =
            realmIndex;

        let newTier =
            currentTier + 1;

        // =================================================
        // TẦNG 12 → CẢNH GIỚI TIẾP THEO
        // =================================================

        if (newTier > 12) {

            if (!realms[realmIndex + 1]) {

                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(0x9b59b6)

                            .setTitle(
                                "🌌 ĐẠI ĐẠO TỐI CAO"
                            )

                            .setDescription(
                                "Bạn đã đạt **Đại Đạo Viên Mãn tầng 12**.\n\n" +
                                "Không còn cảnh giới nào cao hơn."
                            )

                    ]

                });
            }

            newRealmIndex =
                realmIndex + 1;

            newTier = 1;
        }

        const newRealm =
            realms[newRealmIndex];

        const newStage =
            getStage(newTier);

        // =================================================
        // TRỪ VẬT PHẨM
        //
        // CHỈ TRỪ SAU KHI XÁC ĐỊNH THÀNH CÔNG
        // =================================================

        if (requiredItem) {

            const consumed =
                consumeItem(
                    p,
                    requiredItem
                );

            if (!consumed) {

                return interaction.reply({

                    content:
                        "❌ Không thể tìm thấy vật phẩm yêu cầu trong túi.\n" +
                        "Đột phá chưa được lưu và vật phẩm không bị trừ.",

                    ephemeral: true

                });
            }
        }

        // =================================================
        // HỆ SỐ CHỈ SỐ
        // GIỮ X9 NHƯ CODE CŨ
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
            Number(p.maxHp || 0);

        const oldHp =
            Number(p.hp || 0);

        const oldCong =
            Number(p.cong || 0);

        const oldThu =
            Number(p.thu || 0);

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
        // TU VI GIỮ NGUYÊN KHI THÀNH CÔNG
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
        // TEXT VẬT PHẨM
        // =================================================

        let itemText =
            "";

        if (requiredItem) {

            itemText =
                "\n💊 **Đã sử dụng:** " +
                requiredItem.name;
        }

        // =================================================
        // EMBED THÀNH CÔNG
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(0x2ecc71)

                .setTitle(
                    "⚡ ĐỘT PHÁ THÀNH CÔNG!"
                )

                .setDescription(

                    "🌌 **" +
                    realm.name +
                    " " +
                    currentStage +
                    " tầng " +
                    currentTier +
                    "**\n" +

                    "⬇️\n" +

                    "✨ **" +
                    newRealm.name +
                    " " +
                    newStage +
                    " tầng " +
                    newTier +
                    "**" +

                    itemText

                )

                .addFields(

                    {
                        name:
                            "📈 Tỷ lệ thành công",
                        value:
                            successRate + "%",
                        inline: true
                    },

                    {
                        name:
                            "🎯 Kết quả",
                        value:
                            String(roll),
                        inline: true
                    },

                    {
                        name:
                            "⚔️ Tu Vi",
                        value:
                            remainingTuVi
                                .toLocaleString(),
                        inline: true
                    },

                    {
                        name:
                            "🌱 Cảnh giới",
                        value:
                            "**" +
                            newRealm.name +
                            " " +
                            newStage +
                            " tầng " +
                            newTier +
                            "**",
                        inline: false
                    },

                    {
                        name:
                            "❤️ HP",
                        value:
                            "+" +
                            hpIncrease
                                .toLocaleString() +
                            "\nTổng: **" +
                            newMaxHp
                                .toLocaleString() +
                            "**",
                        inline: true
                    },

                    {
                        name:
                            "⚔️ Công",
                        value:
                            "+" +
                            congIncrease
                                .toLocaleString() +
                            "\nTổng: **" +
                            newCong
                                .toLocaleString() +
                            "**",
                        inline: true
                    },

                    {
                        name:
                            "🛡️ Thủ",
                        value:
                            "+" +
                            thuIncrease
                                .toLocaleString() +
                            "\nTổng: **" +
                            newThu
                                .toLocaleString() +
                            "**",
                        inline: true
                    }

                )

                .setFooter({
                    text:
                        "Hồng Hoang Đại Lục • 12 tầng • Cooldown 20 giây • Thất bại mất 1-10.000 Tu Vi"
                });

        return interaction.reply({
            embeds: [
                embed
            ]
        });
    }
};
