```javascript
const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// COOLDOWN ĐỘT PHÁ: 20 GIÂY / LẦN THỬ
// =====================================================

const dotPhaCooldown = new Map();

const DOTPHA_COOLDOWN = 20_000;

// =====================================================
// CẤU TRÚC GIAI ĐOẠN
// =====================================================
//
// Tầng 1 - 3  : Sơ Kỳ
// Tầng 4 - 6  : Trung Kỳ
// Tầng 7 - 9  : Hậu Kỳ
// Tầng 10-12  : Viên Mãn
//
// Mốc đột phá:
// 3  -> 4  : cần Đan Trung Kỳ
// 6  -> 7  : cần Đan Hậu Kỳ
// 9  -> 10 : cần Đan Viên Mãn
// 12 -> cảnh giới mới tầng 1 : cần Phá Cảnh Đan
// =====================================================

function getGiaiDoan(tang) {

    const tier =
        Math.max(
            1,
            Math.min(
                12,
                Number(tang || 1)
            )
        );

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
// TÊN VẬT PHẨM YÊU CẦU
// =====================================================

function getRequiredItem(
    realmName,
    currentTier
) {

    if (currentTier === 3) {

        return {
            type: "danDuoc",
            name: `${realmName} Trung Kỳ Đan`,
            reason: `Đột phá ${realmName} Sơ Kỳ → Trung Kỳ`
        };
    }

    if (currentTier === 6) {

        return {
            type: "danDuoc",
            name: `${realmName} Hậu Kỳ Đan`,
            reason: `Đột phá ${realmName} Trung Kỳ → Hậu Kỳ`
        };
    }

    if (currentTier === 9) {

        return {
            type: "danDuoc",
            name: `${realmName} Viên Mãn Đan`,
            reason: `Đột phá ${realmName} Hậu Kỳ → Viên Mãn`
        };
    }

    if (currentTier === 12) {

        return {
            type: "vatPham",
            name: `${realmName} Phá Cảnh Đan`,
            reason: `Đột phá ${realmName} Viên Mãn → cảnh giới tiếp theo`
        };
    }

    return null;
}

// =====================================================
// TÌM ITEM TRONG TÚI
// Hỗ trợ item là string hoặc object có name/ten
// =====================================================

function getItemName(item) {

    if (typeof item === "string") {
        return item;
    }

    if (
        item &&
        typeof item === "object"
    ) {

        return (
            item.name ||
            item.ten ||
            item.itemName ||
            item.tenItem ||
            ""
        );
    }

    return "";
}

// =====================================================
// KIỂM TRA ITEM
// =====================================================

function findRequiredItem(
    player,
    requiredItem
) {

    if (
        !player ||
        !player.tuiDo ||
        !requiredItem
    ) {
        return -1;
    }

    const inventory =
        Array.isArray(
            player.tuiDo[requiredItem.type]
        )
            ? player.tuiDo[requiredItem.type]
            : [];

    const target =
        requiredItem.name
            .trim()
            .toLowerCase();

    return inventory.findIndex(
        item =>
            getItemName(item)
                .trim()
                .toLowerCase() === target
    );
}

// =====================================================
// XÓA 1 ITEM KHI ĐỘT PHÁ THÀNH CÔNG
// =====================================================

function consumeRequiredItem(
    player,
    requiredItem
) {

    if (
        !player ||
        !player.tuiDo ||
        !requiredItem
    ) {
        return false;
    }

    const inventory =
        Array.isArray(
            player.tuiDo[requiredItem.type]
        )
            ? [...player.tuiDo[requiredItem.type]]
            : [];

    const targetIndex =
        inventory.findIndex(
            item =>
                getItemName(item)
                    .trim()
                    .toLowerCase() ===
                requiredItem.name
                    .trim()
                    .toLowerCase()
        );

    if (targetIndex === -1) {
        return false;
    }

    // Mất đúng 1 vật phẩm
    inventory.splice(
        targetIndex,
        1
    );

    player.tuiDo = {
        ...player.tuiDo,
        [requiredItem.type]:
            inventory
    };

    return true;
}

// =====================================================
// 18 ĐẠI CẢNH GIỚI
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
        name: "Tiên Nhân",
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
    },

    {
        name: "Thiên Tiên",
        max: 12,
        needTuVi: 256000,
        stats: {
            hp: 100000000,
            cong: 20000000,
            thu: 14000000
        }
    },

    {
        name: "Huyền Tiên",
        max: 12,
        needTuVi: 512000,
        stats: {
            hp: 300000000,
            cong: 60000000,
            thu: 40000000
        }
    },

    {
        name: "Kim Tiên",
        max: 12,
        needTuVi: 1024000,
        stats: {
            hp: 1000000000,
            cong: 200000000,
            thu: 140000000
        }
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
        // KIỂM TRA COOLDOWN 20 GIÂY
        // =================================================

        const now =
            Date.now();

        const lastAttempt =
            dotPhaCooldown.get(userId) || 0;

        const remainingCooldown =
            DOTPHA_COOLDOWN -
            (now - lastAttempt);

        if (
            remainingCooldown > 0
        ) {

            const seconds =
                Math.ceil(
                    remainingCooldown / 1000
                );

            return interaction.reply({

                content:
                    `⏳ **Thiên kiếp đang hồi phục!**\n` +
                    `Bạn phải chờ **${seconds} giây** nữa mới có thể đột phá tiếp.`,

                ephemeral: true
            });
        }

        // =================================================
        // TÌM CẢNH GIỚI
        // =================================================

        let index =
            realms.findIndex(
                r =>
                    r.name ===
                    p.canhGioi
            );

        // Hỗ trợ dữ liệu cũ
        if (index === -1) {
            index = 0;
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
                    Number(
                        p.tang || 1
                    )
                )
            );

        const currentStage =
            getGiaiDoan(
                currentTier
            );

        // =================================================
        // TU VI HIỆN TẠI
        // =================================================

        const currentTuVi =
            Number(
                p.tuvi || 0
            );

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

            const missing =
                requiredTuVi -
                currentTuVi;

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                        .setColor(
                            0xf1c40f
                        )

                        .setTitle(
                            "⚠️ CHƯA ĐỦ TU VI"
                        )

                        .setDescription(
                            `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**`
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
                                "Cần đủ Tu Vi mới có thể đột phá"
                        })

                ],

                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA ĐAN DƯỢC / VẬT PHẨM
        // =================================================

        const requiredItem =
            getRequiredItem(
                realm.name,
                currentTier
            );

        if (requiredItem) {

            const itemIndex =
                findRequiredItem(
                    p,
                    requiredItem
                );

            if (itemIndex === -1) {

                return interaction.reply({

                    embeds: [

                        new EmbedBuilder()

                            .setColor(
                                0xe67e22
                            )

                            .setTitle(
                                "❌ THIẾU VẬT PHẨM ĐỘT PHÁ"
                            )

                            .setDescription(
                                `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**`
                            )

                            .addFields(

                                {
                                    name:
                                        "🔓 Yêu cầu",

                                    value:
                                        requiredItem.reason,

                                    inline: false
                                },

                                {
                                    name:
                                        "💊 Vật phẩm cần có",

                                    value:
                                        `**${requiredItem.name}**`,

                                    inline: false
                                },

                                {
                                    name:
                                        "📦 Nơi kiếm",

                                    value:
                                        "🏪 Cửa hàng\n⚔️ Phó bản",

                                    inline: false
                                }

                            )

                            .setFooter({
                                text:
                                    "Có đủ Tu Vi và vật phẩm mới có thể đột phá"
                            })

                    ],

                    ephemeral: true
                });
            }
        }

        // =================================================
        // BẮT ĐẦU LƯỢT ĐỘT PHÁ
        // KHÓA 20 GIÂY
        // =================================================

        dotPhaCooldown.set(
            userId,
            Date.now()
        );

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

            // Không mất vật phẩm
            // Chỉ mất 1.000 - 10.000 Tu Vi

            const lostTuVi =
                Math.min(
                    currentTuVi,
                    Math.floor(
                        Math.random() *
                        9001
                    ) + 1000
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

                        .setColor(
                            0xe74c3c
                        )

                        .setTitle(
                            "💥 ĐỘT PHÁ THẤT BẠI"
                        )

                        .setDescription(

                            `🌱 **${realm.name} ${currentStage} tầng ${currentTier}**\n\n` +

                            `Thiên kiếp phản phệ, Tu Vi bị tổn hao!`
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
                                    `${newTuVi.toLocaleString()}`,

                                inline: true
                            },

                            {
                                name:
                                    "📦 Vật phẩm",

                                value:
                                    requiredItem
                                        ? "Không bị mất"
                                        : "Không yêu cầu",

                                inline: true
                            }

                        )

                        .setFooter({
                            text:
                                "Thất bại không mất đan dược/vật phẩm • Có thể thử lại sau 20 giây"
                        })

                ]

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

            // Đại Đạo tầng 12
            if (
                !realms[
                    index + 1
                ]
            ) {

                return interaction.reply({

                    content:

                        "🌌 **ĐẠI ĐẠO TỐI CAO!**\n\n" +

                        "Bạn đã đạt **Đại Đạo Viên Mãn tầng 12**.\n\n" +

                        "Không còn cảnh giới nào cao hơn.",

                    ephemeral: true
                });
            }

            newRealmIndex =
                index + 1;

            newTier = 1;
        }

        const newRealm =
            realms[
                newRealmIndex
            ];

        const newStage =
            getGiaiDoan(
                newTier
            );

        // =================================================
        // TRỪ VẬT PHẨM YÊU CẦU
        // CHỈ TRỪ SAU KHI ĐỘT PHÁ THÀNH CÔNG
        // =================================================

        let newInventory =
            p.tuiDo
                ? {
                    ...p.tuiDo
                }
                : {
                    danDuoc: [],
                    vatPham: [],
                    linhThu: []
                };

        if (
            requiredItem
        ) {

            const copiedPlayer = {
                ...p,
                tuiDo: {
                    ...newInventory,

                    danDuoc:
                        Array.isArray(
                            newInventory.danDuoc
                        )
                            ? [
                                ...newInventory.danDuoc
                            ]
                            : [],

                    vatPham:
                        Array.isArray(
                            newInventory.vatPham
                        )
                            ? [
                                ...newInventory.vatPham
                            ]
                            : []
                }
            };

            const consumed =
                consumeRequiredItem(
                    copiedPlayer,
                    requiredItem
                );

            if (!consumed) {

                return interaction.reply({

                    content:
                        "❌ Vật phẩm đột phá không còn trong túi. Vui lòng thử lại.",

                    ephemeral: true
                });
            }

            newInventory =
                copiedPlayer.tuiDo;
        }

        // =================================================
        // TĂNG CHỈ SỐ
        // HỆ SỐ x9 GIỮ NGUYÊN
        // =================================================

        const BREAKTHROUGH_MULTIPLIER =
            9;

        const tierMultiplier =
            newTier;

        // =================================================
        // HP
        // =================================================

        const hpIncrease =
            Math.floor(

                newRealm.stats.hp *
                tierMultiplier *
                BREAKTHROUGH_MULTIPLIER

            );

        // =================================================
        // CÔNG
        // =================================================

        const congIncrease =
            Math.floor(

                newRealm.stats.cong *
                tierMultiplier *
                BREAKTHROUGH_MULTIPLIER

            );

        // =================================================
        // THỦ
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

                giaiDoan:
                    newStage,

                tuvi:
                    remainingTuVi,

                kinhNghiem:
                    remainingKinhNghiem,

                tuiDo:
                    newInventory,

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
        // THÔNG BÁO ITEM ĐÃ DÙNG
        // =================================================

        const itemUsedText =
            requiredItem
                ? `\n💊 **Đã sử dụng:** ${requiredItem.name}`
                : "";

        // =================================================
        // THÔNG BÁO THÀNH CÔNG
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    0x2ecc71
                )

                .setTitle(
                    "⚡ ĐỘT PHÁ THÀNH CÔNG!"
                )

                .setDescription(

                    `🌌 **${realm.name} ${currentStage} tầng ${currentTier}**\n` +

                    `⬇️\n` +

                    `✨ **${newRealm.name} ${newStage} tầng ${newTier}**` +

                    itemUsedText
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
                            `${remainingTuVi.toLocaleString()}`,

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
                        "Hồng Hoang Đại Lục • Đột phá bằng Tu Vi • Chỉ số x9 • Cooldown 20 giây"

                });

        return interaction.reply({

            embeds: [
                embed
            ]

        });
    }
};
```
