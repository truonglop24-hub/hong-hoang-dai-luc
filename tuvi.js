const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("./database");

// =====================================================
// ⚔️ 😈 🐺 BUFF 3 ĐẠO
// =====================================================

const DAO_BUFFS = {

    // =================================================
    // ⚔️ CHÍNH ĐẠO
    // =================================================

    chinhdao: {
        name: "⚔️ Chính Đạo",
        color: 0x3498db,

        tuVi: 20,
        tuLuyen: 15,
        hp: 20,
        linhLuc: 0,
        cong: 10,
        thu: 25,
        dotPha: 5,
        hutMau: 0
    },

    // =================================================
    // 😈 MA ĐẠO
    // =================================================

    madao: {
        name: "😈 Ma Đạo",
        color: 0x8e44ad,

        tuVi: 15,
        tuLuyen: 10,
        hp: 0,
        linhLuc: 0,
        cong: 30,
        thu: -10,
        dotPha: 15,
        hutMau: 15
    },

    // =================================================
    // 🐺 YÊU ĐẠO
    // =================================================

    yeudao: {
        name: "🐺 Yêu Đạo",
        color: 0xe67e22,

        tuVi: 10,
        tuLuyen: 5,
        hp: 40,
        linhLuc: 0,
        cong: 15,
        thu: 20,
        dotPha: 0,
        hutMau: 0
    }
};

// =====================================================
// 🌌 12 CẢNH GIỚI
// =====================================================

const REALMS = [
    "Phàm Nhân",
    "Luyện Khí",
    "Trúc Cơ",
    "Kim Đan",
    "Nguyên Anh",
    "Hóa Thần",
    "Luyện Hư",
    "Hợp Thể",
    "Đại Thừa",
    "Độ Kiếp",
    "Chân Tiên",
    "Đại Đạo"
];

// =====================================================
// 📊 GIAI ĐOẠN CẢNH GIỚI
// =====================================================
//
// Tầng 1 - 3  : Sơ kỳ
// Tầng 4 - 6  : Trung kỳ
// Tầng 7 - 9  : Hậu kỳ
// Tầng 10 -11 : Viên mãn
// Tầng 12     : Đỉnh phong
//

function getStage(tang) {

    tang = Number(tang) || 1;

    if (tang <= 3) {
        return "Sơ kỳ";
    }

    if (tang <= 6) {
        return "Trung kỳ";
    }

    if (tang <= 9) {
        return "Hậu kỳ";
    }

    if (tang <= 11) {
        return "Viên mãn";
    }

    return "Đỉnh phong";
}

// =====================================================
// 📜 HIỂN THỊ CẢNH GIỚI
// =====================================================

function getRealmName(canhGioi) {

    if (typeof canhGioi === "number") {

        const index = Math.max(
            0,
            Math.min(
                REALMS.length - 1,
                Math.floor(canhGioi)
            )
        );

        return REALMS[index];
    }

    const name = String(
        canhGioi || "Luyện Khí"
    );

    return name;
}

// =====================================================
// 📊 LẤY TẦNG
// =====================================================

function getTier(player) {

    let tang = Number(
        player?.tang ??
        player?.tier ??
        1
    );

    if (!Number.isFinite(tang)) {
        tang = 1;
    }

    return Math.max(
        1,
        Math.min(
            12,
            Math.floor(tang)
        )
    );
}

// =====================================================
// 🌌 HIỂN THỊ CẢNH GIỚI + GIAI ĐOẠN
// =====================================================

function getRealmDisplay(player) {

    const realm =
        getRealmName(
            player?.canhGioi ||
            player?.realm ||
            "Luyện Khí"
        );

    const tang =
        getTier(player);

    const stage =
        getStage(tang);

    return `${realm} ${stage} tầng ${tang}`;
}

// =====================================================
// 🔧 CHUẨN HÓA TÊN ĐẠO
// =====================================================

function normalizeDao(dao) {

    if (!dao) {
        return "chinhdao";
    }

    const value =
        String(dao)
            .trim()
            .toLowerCase();

    if (
        value === "chinhdao" ||
        value === "chính đạo" ||
        value === "chinh dao" ||
        value.includes("chính đạo")
    ) {
        return "chinhdao";
    }

    if (
        value === "madao" ||
        value === "ma đạo" ||
        value === "ma dao" ||
        value.includes("ma đạo")
    ) {
        return "madao";
    }

    if (
        value === "yeudao" ||
        value === "yêu đạo" ||
        value === "yeu dao" ||
        value.includes("yêu đạo")
    ) {
        return "yeudao";
    }

    return "chinhdao";
}

// =====================================================
// 🎯 LẤY BUFF ĐẠO
// =====================================================

function getDaoBuff(player) {

    const dao =
        normalizeDao(
            player?.dao ||
            player?.conDuong ||
            player?.phuongDao
        );

    return (
        DAO_BUFFS[dao] ||
        DAO_BUFFS.chinhdao
    );
}

// =====================================================
// 📊 FORMAT SỐ
// =====================================================

function format(value) {

    return Number(
        value || 0
    ).toLocaleString();
}

// =====================================================
// 📈 FORMAT BUFF
// =====================================================

function formatBuff(value) {

    const number =
        Number(value || 0);

    if (number > 0) {
        return `+${number}%`;
    }

    if (number < 0) {
        return `${number}%`;
    }

    return "0%";
}

// =====================================================
// 🌌 TÊN ĐẠO
// =====================================================

function getDaoName(player) {

    const buff =
        getDaoBuff(player);

    return buff.name;
}

// =====================================================
// 🎨 MÀU ĐẠO
// =====================================================

function getDaoColor(player) {

    const buff =
        getDaoBuff(player);

    return buff.color;
}

// =====================================================
// 📜 MÔ TẢ BUFF
// =====================================================

function getDaoDescription(player) {

    const dao =
        normalizeDao(
            player?.dao ||
            player?.conDuong ||
            player?.phuongDao
        );

    if (dao === "madao") {

        return [
            "😈 **Ma Đạo** thiên về sát phạt.",
            "",
            "💀 Sát thương cực cao.",
            "🩸 Có khả năng hút máu.",
            "🌟 Tỷ lệ đột phá tăng mạnh.",
            "⚠️ Đổi lại phòng thủ bị giảm."
        ].join("\n");
    }

    if (dao === "yeudao") {

        return [
            "🐺 **Yêu Đạo** thiên về thể chất.",
            "",
            "❤️ Sinh lực cực cao.",
            "⚔️ Công kích mạnh.",
            "🛡️ Phòng thủ cao.",
            "✨ Tu vi và tốc độ tu luyện được tăng."
        ].join("\n");
    }

    return [
        "⚔️ **Chính Đạo** thiên về ổn định.",
        "",
        "✨ Tu vi nhận được cao.",
        "🛡️ Phòng thủ mạnh.",
        "❤️ Sinh lực tăng.",
        "⚡ Tốc độ tu luyện tăng.",
        "🌟 Tỷ lệ đột phá tăng."
    ].join("\n");
}

// =====================================================
// 📊 THÔNG TIN BUFF ĐẠO
// =====================================================

function getDaoBuffText(player) {

    const buff =
        getDaoBuff(player);

    return [

        `✨ Tu Vi: **${formatBuff(buff.tuVi)}**`,

        `⚡ Tốc độ tu luyện: **${formatBuff(
            buff.tuLuyen
        )}**`,

        `❤️ Sinh lực: **${formatBuff(
            buff.hp
        )}**`,

        `🔥 Linh lực: **${formatBuff(
            buff.linhLuc
        )}**`,

        `⚔️ Sát thương: **${formatBuff(
            buff.cong
        )}**`,

        `🛡️ Phòng thủ: **${formatBuff(
            buff.thu
        )}**`,

        `🌟 Đột phá: **${formatBuff(
            buff.dotPha
        )}**`,

        `🩸 Hút máu: **${formatBuff(
            buff.hutMau
        )}**`

    ].join("\n");
}

// =====================================================
// 📊 THÔNG TIN 12 TẦNG
// =====================================================

function getStageProgress(tang) {

    tang = getTier({
        tang
    });

    if (tang <= 3) {

        return {
            stage: "Sơ kỳ",
            progress: `${tang}/3`,
            next: `Tầng ${tang + 1}`
        };
    }

    if (tang <= 6) {

        return {
            stage: "Trung kỳ",
            progress: `${tang - 3}/3`,
            next: `Tầng ${tang + 1}`
        };
    }

    if (tang <= 9) {

        return {
            stage: "Hậu kỳ",
            progress: `${tang - 6}/3`,
            next: `Tầng ${tang + 1}`
        };
    }

    if (tang <= 11) {

        return {
            stage: "Viên mãn",
            progress: `${tang - 9}/2`,
            next: `Tầng ${tang + 1}`
        };
    }

    return {
        stage: "Đỉnh phong",
        progress: "1/1",
        next: "Đột phá cảnh giới"
    };
}

// =====================================================
// /TUVI
// =====================================================

module.exports = {

    data:

        new SlashCommandBuilder()

            .setName(
                "tuvi"
            )

            .setDescription(
                "📜 Xem thông tin tu vi, đạo và linh căn"
            ),

    // =================================================
    // EXECUTE
    // =================================================

    async execute(
        interaction
    ) {

        const p =
            db.getPlayer(
                interaction.user.id
            );

        // =================================================
        // CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {

            return interaction.reply({

                content:
                    "⚠️ Hãy dùng `/batdau` trước để bước vào Hồng Hoang.",

                ephemeral:
                    true
            });
        }

        // =================================================
        // TU VI
        // =================================================

        const tuvi =
            Number(
                p.tuvi
            ) || 0;

        // =================================================
        // CẢNH GIỚI
        // =================================================

        const tang =
            getTier(p);

        const stage =
            getStage(tang);

        const realm =
            getRealmName(
                p.canhGioi ||
                p.realm ||
                "Luyện Khí"
            );

        const realmDisplay =
            `${realm} ${stage} tầng ${tang}`;

        const stageProgress =
            getStageProgress(tang);

        // =================================================
        // LINH CĂN
        // =================================================

        const linhCan =
            p.linhCan;

        let linhCanName =
            "❓ Chưa thức tỉnh";

        let phamCap =
            "Chưa xác định";

        let thuocTinh =
            "Chưa xác định";

        let moTa =
            "Chưa có linh căn";

        let buff = {

            tuLuyen: 0,

            hp: 0,

            linhLuc: 0,

            cong: 0,

            thu: 0,

            dotPha: 0
        };

        // =================================================
        // LINH CĂN OBJECT
        // =================================================

        if (
            linhCan &&
            typeof linhCan ===
                "object"
        ) {

            linhCanName =
                linhCan.ten ||
                linhCanName;

            phamCap =
                linhCan.phamCap ||
                phamCap;

            thuocTinh =
                linhCan.thuocTinh ||
                thuocTinh;

            moTa =
                linhCan.moTa ||
                moTa;

            if (
                linhCan.buff
            ) {

                buff = {

                    ...buff,

                    ...linhCan.buff
                };
            }

        } else if (
            typeof linhCan ===
                "string"
        ) {

            // Hỗ trợ dữ liệu cũ

            linhCanName =
                linhCan;
        }

        // =================================================
        // ⚔️ 😈 🐺 BUFF ĐẠO
        // =================================================

        const dao =
            p.dao ||
            p.conDuong ||
            p.phuongDao ||
            "chinhdao";

        const daoBuff =
            getDaoBuff(p);

        const daoName =
            getDaoName(p);

        const daoColor =
            getDaoColor(p);

        // =================================================
        // EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(
                    daoColor
                )

                .setTitle(
                    `📜 TU VI • ${interaction.user.username}`
                )

                .setDescription(

                    `🌌 **HỒNG HOANG ĐẠI LỤC**\n\n` +

                    `${daoName}\n\n` +

                    `${getDaoDescription(p)}\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🧬 **${linhCanName}**`
                )

                // =================================================
                // ⚔️ ĐẠO
                // =================================================

                .addFields({

                    name:
                        "🌌 Con đường chứng đạo",

                    value:

                        `${daoName}\n\n` +

                        `${getDaoBuffText(p)}`,

                    inline:
                        false
                })

                // =================================================
                // LINH CĂN
                // =================================================

                .addFields(

                    {

                        name:
                            "💠 Phẩm cấp",

                        value:
                            `${phamCap}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "🌈 Thuộc tính",

                        value:
                            `${thuocTinh}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "📜 Thiên phú",

                        value:
                            `${moTa}`,

                        inline:
                            false
                    },

                    // =================================================
                    // 🌱 CẢNH GIỚI
                    // =================================================

                    {

                        name:
                            "🌱 Cảnh giới",

                        value:
                            `**${realmDisplay}**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "📊 Giai đoạn",

                        value:
                            `**${stage}**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "🔢 Tầng",

                        value:
                            `**${tang}/12**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "📈 Tiến độ giai đoạn",

                        value:
                            `**${stageProgress.progress}**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "➡️ Tiếp theo",

                        value:
                            `**${stageProgress.next}**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "⚔️ Tu Vi",

                        value:
                            `**${format(tuvi)}**`,

                        inline:
                            true
                    },

                    {

                        name:
                            "✨ Kinh nghiệm",

                        value:
                            `${format(p.kinhNghiem)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // TÀI NGUYÊN
                    // =================================================

                    {

                        name:
                            "🔥 Linh lực",

                        value:
                            `${format(p.linhLuc)}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "💎 Linh thạch",

                        value:
                            `${format(p.linhThach)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // CHỈ SỐ
                    // =================================================

                    {

                        name:
                            "❤️ HP",

                        value:
                            `${format(p.hp)} / ${format(p.maxHp)}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "⚔️ Công",

                        value:
                            `${format(p.cong)}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "🛡️ Thủ",

                        value:
                            `${format(p.thu)}`,

                        inline:
                            true
                    },

                    // =================================================
                    // 🌟 THIÊN PHÚ LINH CĂN
                    // =================================================

                    {

                        name:
                            "🌟 Thiên Phú Linh Căn",

                        value:

                            `⚔️ Tu luyện: **+${buff.tuLuyen}%**\n` +

                            `❤️ Sinh lực: **+${buff.hp}%**\n` +

                            `🔥 Linh lực: **+${buff.linhLuc}%**\n` +

                            `🗡️ Công: **+${buff.cong}%**\n` +

                            `🛡️ Thủ: **+${buff.thu}%**\n` +

                            `🌟 Đột phá: **+${buff.dotPha}%**`,

                        inline:
                            false
                    },

                    // =================================================
                    // 🌌 TỔNG BUFF ĐẠO
                    // =================================================

                    {

                        name:
                            `🌌 Buff ${daoName}`,

                        value:

                            `✨ Tu Vi: **${formatBuff(
                                daoBuff.tuVi
                            )}**\n` +

                            `⚡ Tu luyện: **${formatBuff(
                                daoBuff.tuLuyen
                            )}**\n` +

                            `❤️ HP: **${formatBuff(
                                daoBuff.hp
                            )}**\n` +

                            `⚔️ Công: **${formatBuff(
                                daoBuff.cong
                            )}**\n` +

                            `🛡️ Thủ: **${formatBuff(
                                daoBuff.thu
                            )}**\n` +

                            `🌟 Đột phá: **${formatBuff(
                                daoBuff.dotPha
                            )}**\n` +

                            `🩸 Hút máu: **${formatBuff(
                                daoBuff.hutMau
                            )}**`,

                        inline:
                            false
                    },

                    // =================================================
                    // THỐNG KÊ
                    // =================================================

                    {

                        name:
                            "🐉 Boss đã hạ",

                        value:
                            `${format(
                                p.bossDaGiet
                            )}`,

                        inline:
                            true
                    },

                    {

                        name:
                            "🏯 Phó bản",

                        value:
                            `${format(
                                p.phoBanDaHoanThanh
                            )}`,

                        inline:
                            true
                    }
                )

                .setFooter({

                    text:
                        "Hồng Hoang Đại Lục • 12 Cảnh Giới • 12 Tầng/Cảnh Giới"
                });

        // =================================================
        // 📤 GỬI
        // =================================================

        return interaction.reply({

            embeds: [
                embed
            ]
        });
    },

    // =====================================================
    // 📦 EXPORT DÙNG CHO FILE KHÁC
    // =====================================================

    DAO_BUFFS,

    REALMS,

    getStage,

    getTier,

    getRealmDisplay,

    getDaoBuff,

    getDaoName,

    getDaoColor,

    normalizeDao
};
