const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getPlayer,
    updatePlayer
} = require("./database");

// =====================================================
// ⏳ COOLDOWN TU LUYỆN
// =====================================================

const COOLDOWN = 15 * 1000;


// =====================================================
// 🌌 CẢNH GIỚI RIÊNG 3 ĐẠO
// =====================================================

const DAO_REALMS = {

    // ⚔️ CHÍNH ĐẠO
    chinhdao: [
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
        "Tiên Nhân",
        "Chân Tiên",
        "Thiên Tiên",
        "Huyền Tiên",
        "Kim Tiên",
        "Thánh Nhân",
        "Thiên Đạo",
        "Đại Đạo"
    ],

    // 😈 MA ĐẠO
    madao: [
        "Ma Phàm",
        "Ma Khí",
        "Ma Cơ",
        "Ma Đan",
        "Ma Anh",
        "Ma Thần",
        "Ma Hư",
        "Ma Hợp",
        "Ma Thừa",
        "Ma Kiếp",
        "Ma Tiên",
        "Chân Ma",
        "Thiên Ma",
        "Huyền Ma",
        "Kim Ma",
        "Ma Thánh",
        "Ma Đạo",
        "Ma Tổ"
    ],

    // 🐺 YÊU ĐẠO
    yeudao: [
        "Yêu Phàm",
        "Yêu Khí",
        "Yêu Cơ",
        "Yêu Đan",
        "Yêu Anh",
        "Yêu Thần",
        "Yêu Hư",
        "Yêu Hợp",
        "Yêu Thừa",
        "Yêu Kiếp",
        "Yêu Tiên",
        "Chân Yêu",
        "Thiên Yêu",
        "Huyền Yêu",
        "Kim Yêu",
        "Yêu Thánh",
        "Yêu Đạo",
        "Yêu Tổ"
    ]
};


// =====================================================
// ⚡ TỐC ĐỘ TU LUYỆN ×3
// =====================================================

const CULTIVATION_SPEED = {

    // ⚔️ CHÍNH ĐẠO
    "Phàm Nhân": 1 * 3,
    "Luyện Khí": 5 * 3,
    "Trúc Cơ": 15 * 3,
    "Kim Đan": 40 * 3,
    "Nguyên Anh": 100 * 3,
    "Hóa Thần": 250 * 3,
    "Luyện Hư": 600 * 3,
    "Hợp Thể": 1500 * 3,
    "Đại Thừa": 3500 * 3,
    "Độ Kiếp": 8000 * 3,
    "Tiên Nhân": 20000 * 3,
    "Chân Tiên": 50000 * 3,
    "Thiên Tiên": 120000 * 3,
    "Huyền Tiên": 300000 * 3,
    "Kim Tiên": 750000 * 3,
    "Thánh Nhân": 2000000 * 3,
    "Thiên Đạo": 10000000 * 3,
    "Đại Đạo": 50000000 * 3,

    // 😈 MA ĐẠO
    "Ma Phàm": 1 * 3,
    "Ma Khí": 5 * 3,
    "Ma Cơ": 15 * 3,
    "Ma Đan": 40 * 3,
    "Ma Anh": 100 * 3,
    "Ma Thần": 250 * 3,
    "Ma Hư": 600 * 3,
    "Ma Hợp": 1500 * 3,
    "Ma Thừa": 3500 * 3,
    "Ma Kiếp": 8000 * 3,
    "Ma Tiên": 20000 * 3,
    "Chân Ma": 50000 * 3,
    "Thiên Ma": 120000 * 3,
    "Huyền Ma": 300000 * 3,
    "Kim Ma": 750000 * 3,
    "Ma Thánh": 2000000 * 3,
    "Ma Đạo": 10000000 * 3,
    "Ma Tổ": 50000000 * 3,

    // 🐺 YÊU ĐẠO
    "Yêu Phàm": 1 * 3,
    "Yêu Khí": 5 * 3,
    "Yêu Cơ": 15 * 3,
    "Yêu Đan": 40 * 3,
    "Yêu Anh": 100 * 3,
    "Yêu Thần": 250 * 3,
    "Yêu Hư": 600 * 3,
    "Yêu Hợp": 1500 * 3,
    "Yêu Thừa": 3500 * 3,
    "Yêu Kiếp": 8000 * 3,
    "Yêu Tiên": 20000 * 3,
    "Chân Yêu": 50000 * 3,
    "Thiên Yêu": 120000 * 3,
    "Huyền Yêu": 300000 * 3,
    "Kim Yêu": 750000 * 3,
    "Yêu Thánh": 2000000 * 3,
    "Yêu Đạo": 10000000 * 3,
    "Yêu Tổ": 50000000 * 3
};


// =====================================================
// 🔧 CHUẨN HÓA ĐẠO
// =====================================================

function normalizeDao(player) {

    const dao = String(
        player?.dao ||
        player?.conDuong ||
        player?.phuongDao ||
        "chinhdao"
    ).toLowerCase().trim();

    if (
        dao === "madao" ||
        dao === "ma dao" ||
        dao.includes("ma đạo")
    ) {
        return "madao";
    }

    if (
        dao === "yeudao" ||
        dao === "yeu dao" ||
        dao.includes("yêu đạo")
    ) {
        return "yeudao";
    }

    return "chinhdao";
}


// =====================================================
// 🏷️ TÊN ĐẠO
// =====================================================

function getDaoName(dao) {

    if (dao === "madao") {
        return "😈 Ma Đạo";
    }

    if (dao === "yeudao") {
        return "🐺 Yêu Đạo";
    }

    return "⚔️ Chính Đạo";
}


// =====================================================
// 🌌 LẤY CẢNH GIỚI THEO ĐẠO
// =====================================================

function getDaoRealm(player) {

    const dao = normalizeDao(player);

    const realms =
        DAO_REALMS[dao] ||
        DAO_REALMS.chinhdao;

    let index = Number(
        player?.realmIndex ??
        player?.realm ??
        NaN
    );

    if (!Number.isFinite(index)) {

        const current =
            String(
                player?.canhGioi || ""
            ).trim().toLowerCase();

        index =
            realms.findIndex(
                name =>
                    name.toLowerCase() === current
            );
    }

    if (
        !Number.isFinite(index) ||
        index < 0
    ) {
        index = 0;
    }

    index = Math.min(
        realms.length - 1,
        Math.floor(index)
    );

    return {
        dao,
        index,
        name: realms[index]
    };
}


// =====================================================
// 📊 GIAI ĐOẠN 12 TẦNG
// =====================================================

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
// 🌟 HIỂN THỊ CẢNH GIỚI
// =====================================================

function getRealmDisplay(player) {

    const realm =
        getDaoRealm(player);

    const tang =
        Math.max(
            1,
            Math.min(
                12,
                Number(player?.tang) || 1
            )
        );

    return `${realm.name} ${getStage(tang)} tầng ${tang}`;
}


// =====================================================
// ⚡ LẤY TỐC ĐỘ
// =====================================================

function getCultivationSpeed(canhGioi) {

    return Math.max(
        1,
        Math.floor(
            CULTIVATION_SPEED[canhGio] || 1
        )
    );
}


// =====================================================
// 📦 COMMAND
// =====================================================

module.exports = {

    data:
        new SlashCommandBuilder()
            .setName("tuluyen")
            .setDescription(
                "🧘 Tu luyện để nhận linh lực, tu vi và kinh nghiệm"
            ),

    async execute(interaction) {

        const userId =
            interaction.user.id;

        let p;

        // =================================================
        // 👤 LẤY PLAYER
        // =================================================

        try {

            p =
                getPlayer(userId);

        } catch (error) {

            console.error(
                "❌ LỖI getPlayer /tuluyen:",
                error
            );

            return interaction.reply({
                content:
                    "❌ Không thể đọc dữ liệu nhân vật. Hãy kiểm tra Railway Console.",
                ephemeral: true
            });
        }


        // =================================================
        // ❌ CHƯA CÓ NHÂN VẬT
        // =================================================

        if (!p) {

            return interaction.reply({
                content:
                    "⚠️ Hãy dùng `/batdau` trước.",
                ephemeral: true
            });
        }


        // =================================================
        // 🧘 ĐANG BẾ QUAN
        // =================================================

        if (p.beQuan) {

            return interaction.reply({
                content:
                    "🧘 Bạn đang bế quan. Hãy dùng `/xuatquan` khi hoàn thành.",
                ephemeral: true
            });
        }


        // =================================================
        // ⏳ COOLDOWN 15 GIÂY
        // =================================================

        const remaining =
            COOLDOWN -
            (
                Date.now() -
                (
                    p.lastTrain || 0
                )
            );

        if (remaining > 0) {

            return interaction.reply({
                content:
                    `⏳ Bạn cần chờ **${Math.ceil(
                        remaining / 1000
                    )} giây** nữa.`,
                ephemeral: true
            });
        }


        // =================================================
        // 🌌 ĐẠO HIỆN TẠI
        // =================================================

        const dao =
            normalizeDao(p);


        // =================================================
        // 🌌 CẢNH GIỚI RIÊNG CỦA ĐẠO
        // =================================================

        const realm =
            getDaoRealm(p);


        // =================================================
        // 🔢 TẦNG
        // =================================================

        const tang =
            Math.max(
                1,
                Math.min(
                    12,
                    Number(p.tang) || 1
                )
            );


        // =================================================
        // 📜 GIAI ĐOẠN
        // =================================================

        const stage =
            getStage(tang);


        // =================================================
        // ⚡ TỐC ĐỘ ×3
        // =================================================

        const speed =
            getCultivationSpeed(
                realm.name
            );


        // =================================================
        // 🧬 BUFF LINH CĂN
        // =================================================

        let linhCanBuff = 0;

        if (
            p.linhCan &&
            typeof p.linhCan === "object" &&
            p.linhCan.buff
        ) {

            linhCanBuff =
                Number(
                    p.linhCan.buff.tuLuyen
                ) || 0;
        }


        // =================================================
        // ⚔️ BUFF ĐẠO
        // =================================================

        let daoBuff = 0;

        if (
            p.daoBuff &&
            typeof p.daoBuff === "object"
        ) {

            daoBuff =
                Number(
                    p.daoBuff.tuLuyen
                ) || 0;
        }


        // =================================================
        // ✨ TỔNG BUFF
        // =================================================

        const buffMultiplier =
            1 +
            (
                linhCanBuff +
                daoBuff
            ) / 100;


        // =================================================
        // 🔥 LINH LỰC
        // =================================================

        const baseLinhLuc =
            Math.floor(
                Math.random() * 31
            ) + 20;

        const linhLuc =
            Math.max(
                1,
                Math.floor(
                    baseLinhLuc *
                    speed *
                    buffMultiplier
                )
            );


        // =================================================
        // ⚔️ TU VI
        // =================================================

        const baseTuVi =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const tuvi =
            Math.max(
                1,
                Math.floor(
                    baseTuVi *
                    speed *
                    buffMultiplier
                )
            );


        // =================================================
        // ✨ KINH NGHIỆM
        // =================================================

        const baseExp =
            Math.floor(
                Math.random() * 21
            ) + 10;

        const exp =
            Math.max(
                1,
                Math.floor(
                    baseExp *
                    speed *
                    buffMultiplier
                )
            );


        // =================================================
        // 📈 TU VI HIỆN TẠI
        // =================================================

        const tuViHienTai =
            (
                Number(p.tuvi) || 0
            ) + tuvi;


        // =================================================
        // 🔥 LINH LỰC HIỆN TẠI
        // =================================================

        const linhLucHienTai =
            (
                Number(p.linhLuc) || 0
            ) + linhLuc;


        // =================================================
        // ✨ KINH NGHIỆM
        // =================================================

        const kinhNghiemHienTai =
            (
                Number(p.kinhNghiem) || 0
            ) + exp;


        // =================================================
        // 💾 LƯU DATA
        // =================================================

        try {

            const updated =
                updatePlayer(
                    userId,
                    {

                        dao:
                            dao,

                        conDuong:
                            dao,

                        phuongDao:
                            dao,

                        realm:
                            realm.index,

                        realmIndex:
                            realm.index,

                        // ❗ KHÔNG TỰ TĂNG TẦNG
                        tang:
                            tang,

                        tier:
                            tang,

                        // Cảnh giới luôn theo đạo
                        canhGioi:
                            realm.name,

                        linhLuc:
                            linhLucHienTai,

                        tuvi:
                            tuViHienTai,

                        kinhNghiem:
                            kinhNghiemHienTai,

                        lastTrain:
                            Date.now()
                    }
                );


            if (!updated) {

                console.error(
                    "❌ updatePlayer /tuluyen trả về null/undefined.",
                    {
                        userId
                    }
                );

                return interaction.reply({
                    content:
                        "❌ Không thể lưu dữ liệu tu luyện. Hãy kiểm tra Railway Console.",
                    ephemeral: true
                });
            }

        } catch (error) {

            console.error(
                "❌ LỖI updatePlayer /tuluyen:",
                error
            );

            console.error(
                "❌ Stack:",
                error?.stack
            );

            return interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi lưu dữ liệu tu luyện. Hãy kiểm tra Railway Console.",
                ephemeral: true
            });
        }


        // =================================================
        // 🔢 FORMAT
        // =================================================

        const format =
            value =>
                Number(
                    value || 0
                ).toLocaleString();


        // =================================================
        // 🎨 MÀU
        // =================================================

        let color = 0x3498db;

        if (dao === "madao") {
            color = 0x8e44ad;
        }

        if (dao === "yeudao") {
            color = 0xe67e22;
        }


        // =================================================
        // 🌌 TÊN ĐẠO
        // =================================================

        const daoName =
            getDaoName(dao);


        // =================================================
        // 📜 EMBED
        // =================================================

        const embed =
            new EmbedBuilder()

                .setColor(color)

                .setTitle(
                    `${daoName} • TU LUYỆN THÀNH CÔNG`
                )

                .setDescription(
                    `**${interaction.user.username}** vận chuyển linh khí trong kinh mạch.\n\n` +

                    `━━━━━━━━━━━━━━━━━━━━\n\n` +

                    `🌌 **Con đường:**\n` +
                    `**${daoName}**\n\n` +

                    `👑 **Cảnh giới hiện tại:**\n` +
                    `# **${realm.name}**\n\n` +

                    `✨ **${stage} • Tầng ${tang}/12**\n\n` +

                    `⚠️ Cảnh giới này thuộc **${daoName}**.\n` +

                    `⚔️ Muốn lên tầng tiếp theo phải sử dụng **/dotpha**.\n\n` +

                    `⚡ **Tốc độ tu luyện:** ×${format(speed)}`
                )

                .addFields(

                    {
                        name: "🔥 Linh lực",
                        value:
                            `+**${format(linhLuc)}**`,
                        inline: true
                    },

                    {
                        name: "⚔️ Tu Vi",
                        value:
                            `+**${format(tuvi)}**`,
                        inline: true
                    },

                    {
                        name: "✨ Kinh nghiệm",
                        value:
                            `+**${format(exp)}**`,
                        inline: true
                    },

                    {
                        name: "📈 Tu Vi hiện tại",
                        value:
                            `**${format(tuViHienTai)}**`,
                        inline: true
                    },

                    {
                        name: "🧬 Buff linh căn",
                        value:
                            `+${linhCanBuff}%`,
                        inline: true
                    },

                    {
                        name: "⚡ Buff đạo",
                        value:
                            `+${daoBuff}%`,
                        inline: true
                    }
                )

                .setFooter({
                    text:
                        `⏳ Cooldown: 15 giây • ${daoName} • Tốc độ ×3`
                });


        // =================================================
        // 📤 GỬI
        // =================================================

        return interaction.reply({
            embeds: [embed]
        });
    }
};


// =====================================================
// 📦 EXPORT HÀM
// =====================================================

module.exports.getCultivationSpeed =
    getCultivationSpeed;

module.exports.getStage =
    getStage;

module.exports.getDaoRealm =
    getDaoRealm;

module.exports.getRealmDisplay =
    getRealmDisplay;

module.exports.normalizeDao =
    normalizeDao;

module.exports.DAO_REALMS =
    DAO_REALMS;

module.exports.CULTIVATION_SPEED =
    CULTIVATION_SPEED;
