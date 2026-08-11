const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const db = require("./database");

// =====================================================
// FILE CODE
// =====================================================

const CODE_FILE = "/app/data/admin_codes.json";

// =====================================================
// ĐỌC CODE
// =====================================================

function loadCodes() {
    try {
        if (!fs.existsSync(CODE_FILE)) {
            return {};
        }

        return JSON.parse(
            fs.readFileSync(
                CODE_FILE,
                "utf8"
            )
        );

    } catch (error) {

        console.error(
            "❌ Không thể đọc admin_codes.json:",
            error
        );

        return {};
    }
}

// =====================================================
// LƯU CODE
// =====================================================

function saveCodes(codes) {

    try {

        fs.writeFileSync(
            CODE_FILE,
            JSON.stringify(
                codes,
                null,
                2
            ),
            "utf8"
        );

        return true;

    } catch (error) {

        console.error(
            "❌ Không thể lưu admin_codes.json:",
            error
        );

        return false;
    }
}

// =====================================================
// LỆNH /NHAPCODE
// =====================================================

module.exports = {

    data: new SlashCommandBuilder()
        .setName("nhapcode")
        .setDescription(
            "🔑 Nhập code nhận phần thưởng"
        )
        .addStringOption(option =>
            option
                .setName("code")
                .setDescription(
                    "Nhập mã code"
                )
                .setRequired(true)
        ),

    async execute(interaction) {

        // =================================================
        // LẤY CODE
        // =================================================

        const code =
            interaction.options
                .getString("code")
                .trim()
                .toUpperCase();

        // =================================================
        // ĐỌC DATABASE CODE
        // =================================================

        const codes =
            loadCodes();

        const data =
            codes[code];

        // =================================================
        // CODE KHÔNG TỒN TẠI
        // =================================================

        if (!data) {

            return interaction.reply({
                content:
                    "❌ **Code không tồn tại hoặc đã bị xóa!**",
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA USED BY
        // =================================================

        if (!Array.isArray(data.usedBy)) {
            data.usedBy = [];
        }

        const userId =
            interaction.user.id;

        // =================================================
        // ĐÃ NHẬP CODE
        // =================================================

        if (
            data.usedBy.includes(
                userId
            )
        ) {

            return interaction.reply({
                content:
                    "⚠️ **Bạn đã sử dụng code này rồi!**",
                ephemeral: true
            });
        }

        // =================================================
        // KIỂM TRA PHẦN THƯỞNG
        // =================================================

        const reward =
            String(
                data.reward || ""
            ).toLowerCase();

        const amount =
            Number(
                data.amount
            );

        if (
    ![
        "tuvi",
        "linhthach",
        "danduoc"
    ].includes(reward)
) {
              return interaction.reply({
                content:
                    "❌ Code có phần thưởng không hợp lệ!",
                ephemeral: true
            });
        }

        if (
            !Number.isSafeInteger(amount) ||
            amount <= 0
        ) {

            return interaction.reply({
                content:
                    "❌ Số lượng phần thưởng không hợp lệ!",
                ephemeral: true
            });
        }

        // =================================================
        // LẤY PLAYER
        // =================================================

        let player =
            db.getPlayer(userId);

        // =================================================
        // CHƯA CÓ PLAYER
        // =================================================

        if (!player) {

            try {

                player =
                    db.createPlayer(
                        userId,
                        interaction.user.username
                    );

            } catch (error) {

                console.error(
                    "❌ Không thể tạo player:",
                    error
                );

                return interaction.reply({
                    content:
                        "❌ Không thể tạo nhân vật của bạn!",
                    ephemeral: true
                });
            }
        }

        // =================================================
        // NHẬN TU VI
        // =================================================

        if (
            reward === "tuvi"
        ) {

            const oldTuvi =
                Number(
                    player.tuvi
                ) || 0;

            const newTuvi =
                oldTuvi + amount;

            // ---------------------------------------------
            // TỰ TÍNH CẢNH GIỚI
            // ---------------------------------------------

            const realms = [

                {
                    id: 0,
                    name: "Phàm Nhân",
                    max: 1000
                },

                {
                    id: 1,
                    name: "Luyện Khí",
                    max: 10000
                },

                {
                    id: 2,
                    name: "Trúc Cơ",
                    max: 30000
                },

                {
                    id: 3,
                    name: "Kim Đan",
                    max: 80000
                },

                {
                    id: 4,
                    name: "Nguyên Anh",
                    max: 200000
                },

                {
                    id: 5,
                    name: "Hóa Thần",
                    max: 500000
                },

                {
                    id: 6,
                    name: "Luyện Hư",
                    max: 1000000
                },

                {
                    id: 7,
                    name: "Hợp Thể",
                    max: 3000000
                },

                {
                    id: 8,
                    name: "Đại Thừa",
                    max: 10000000
                },

                {
                    id: 9,
                    name: "Độ Kiếp",
                    max: 30000000
                },

                {
                    id: 10,
                    name: "Tiên Nhân",
                    max: 100000000
                },

                {
                    id: 11,
                    name: "Chân Tiên",
                    max: 500000000
                },

                {
                    id: 12,
                    name: "Thiên Tiên",
                    max: 1000000000
                },

                {
                    id: 13,
                    name: "Huyền Tiên",
                    max: 5000000000
                },

                {
                    id: 14,
                    name: "Kim Tiên",
                    max: 30000000000
                },

                {
                    id: 15,
                    name: "Thánh Nhân",
                    max: 100000000000
                },

                {
                    id: 16,
                    name: "Thiên Đạo",
                    max: 10000000000000
                },

                {
                    id: 17,
                    name: "Đại Đạo",
                    max: 99999999999999
                }
            ];

            let index =
                realms.findIndex(
                    realm =>
                        newTuvi <= realm.max
                );

            if (index === -1) {
                index =
                    realms.length - 1;
            }

            const realm =
                realms[index];

            let tier = 1;

            if (
                index === realms.length - 1 &&
                newTuvi >= realm.max
            ) {

                tier = 10;

            } else if (index > 0) {

                const previous =
                    realms[index - 1];

                const range =
                    realm.max -
                    previous.max;

                const progress =
                    newTuvi -
                    previous.max;

                tier =
                    Math.ceil(
                        (progress / range) *
                        10
                    );

                tier =
                    Math.max(
                        1,
                        Math.min(
                            10,
                            tier
                        )
                    );
            }

            // ---------------------------------------------
            // LƯU
            // ---------------------------------------------

            db.updatePlayer(
                userId,
                {
                    tuvi: newTuvi,

                    canhGioi:
                        realm.name,

                    realm:
                        realm.id,

                    tang:
                        tier
                }
            );

            // ---------------------------------------------
            // ĐÁNH DẤU ĐÃ DÙNG
            // ---------------------------------------------

            data.usedBy.push(
                userId
            );

            if (!saveCodes(codes)) {

                return interaction.reply({
                    content:
                        "❌ Có lỗi khi lưu trạng thái code!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // THÔNG BÁO
            // ---------------------------------------------

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0xf1c40f
                        )

                        .setTitle(
                            "🎁 NHẬP CODE THÀNH CÔNG"
                        )

                        .setDescription(

                            `🔑 **Code:** \`${code}\`\n\n` +

                            `⚔️ **Tu Vi nhận:** +${amount.toLocaleString()}\n\n` +

                            `⚔️ **Tu Vi hiện tại:** ${newTuvi.toLocaleString()}\n\n` +

                            `🌱 **Cảnh giới:** ${realm.name}\n\n` +

                            `🔢 **Tầng:** ${tier}`
                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // NHẬN LINH THẠCH
        // =================================================

        if (
            reward === "linhthach"
        ) {

            const oldLinhThach =
                Number(
                    player.linhThach
                ) || 0;

            const newLinhThach =
                oldLinhThach + amount;

            // ---------------------------------------------
            // LƯU
            // ---------------------------------------------

            db.updatePlayer(
                userId,
                {
                    linhThach:
                        newLinhThach
                }
            );

            // ---------------------------------------------
            // ĐÁNH DẤU ĐÃ DÙNG
            // ---------------------------------------------

            data.usedBy.push(
                userId
            );

            if (!saveCodes(codes)) {

                return interaction.reply({
                    content:
                        "❌ Có lỗi khi lưu trạng thái code!",
                    ephemeral: true
                });
            }

            // ---------------------------------------------
            // THÔNG BÁO
            // ---------------------------------------------

            return interaction.reply({

                embeds: [

                    new EmbedBuilder()
                        .setColor(
                            0x3498db
                        )

                        .setTitle(
                            "🎁 NHẬP CODE THÀNH CÔNG"
                        )

                        .setDescription(

                            `🔑 **Code:** \`${code}\`\n\n` +

                            `💎 **Linh Thạch nhận:** +${amount.toLocaleString()}\n\n` +

                            `💎 **Linh Thạch hiện tại:** ${newLinhThach.toLocaleString()}`
                        )

                ],

                ephemeral: true
            });
        }

        // =================================================
        // FALLBACK
        // =================================================

        return interaction.reply({
            content:
                "❌ Không xác định được phần thưởng của code!",
            ephemeral: true
        });
    }
};
