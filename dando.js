const { SlashCommandBuilder } = require("discord.js");

const {
    getPlayer,
    updatePlayer,
    generateLinhCan
} = require("./database");

module.exports = {

    // =====================================================
    // SLASH COMMAND
    // =====================================================

    data: new SlashCommandBuilder()
        .setName("dungdan")
        .setDescription("Sử dụng đan dược trong túi")
        .addStringOption(option =>
            option
                .setName("dan")
                .setDescription("Nhập tên đan dược muốn sử dụng")
                .setRequired(true)
        ),

    // =====================================================
    // EXECUTE
    // =====================================================

    async execute(interaction) {

        try {

            const p = getPlayer(
                interaction.user.id
            );

            // =================================================
            // CHƯA CÓ NHÂN VẬT
            // =================================================

            if (!p) {

                return interaction.reply({
                    content:
                        "⚠️ Hãy dùng `/batdau` trước.",
                    ephemeral: true
                });

            }

            // =================================================
            // LẤY TÊN ĐAN
            // =================================================

            const danNhap =
                interaction.options
                    .getString("dan")
                    .trim();

            if (!danNhap) {

                return interaction.reply({
                    content:
                        "❌ Vui lòng nhập tên đan dược.",
                    ephemeral: true
                });

            }

            // =================================================
            // KIỂM TRA TÚI ĐỒ
            // =================================================

            if (!p.tuiDo) {

                return interaction.reply({
                    content:
                        "❌ Không tìm thấy túi đồ.",
                    ephemeral: true
                });

            }

            if (
                !Array.isArray(
                    p.tuiDo.danDuoc
                )
            ) {

                return interaction.reply({
                    content:
                        "❌ Túi đan dược đang trống.",
                    ephemeral: true
                });

            }

            const list =
                p.tuiDo.danDuoc;

            // =================================================
            // TÌM ĐAN
            // Không phân biệt hoa thường
            // =================================================

            const index =
                list.findIndex(item =>
                    String(item)
                        .trim()
                        .toLowerCase() ===
                    danNhap.toLowerCase()
                );

            // =================================================
            // KHÔNG CÓ ĐAN
            // =================================================

            if (index === -1) {

                return interaction.reply({
                    content:
                        `❌ Bạn không có **${danNhap}** trong túi đan dược.`,
                    ephemeral: true
                });

            }

            // =================================================
            // TÊN ĐAN THỰC TẾ
            // =================================================

            const tenDan =
                String(list[index]).trim();

            // =================================================
            // XÓA 1 VIÊN ĐAN
            // =================================================

            list.splice(index, 1);

            // =================================================
            // ĐAN LINH LỰC
            // =================================================

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan linh lực")
            ) {

                const linhLucMoi =
                    (Number(p.linhLuc) || 0) + 100;

                updatePlayer(
                    interaction.user.id,
                    {
                        linhLuc: linhLucMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc: list
                        }
                    }
                );

                return interaction.reply(
                    `🧪 Đã sử dụng **${tenDan}**.\n` +
                    `🔥 Linh lực **+100**.\n` +
                    `💠 Linh lực hiện tại: **${linhLucMoi}**`
                );

            }

            // =================================================
            // ĐAN KINH NGHIỆM
            // =================================================

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan kinh nghiệm")
            ) {

                const kinhNghiemMoi =
                    (Number(p.kinhNghiem) || 0) + 100;

                updatePlayer(
                    interaction.user.id,
                    {
                        kinhNghiem: kinhNghiemMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc: list
                        }
                    }
                );

                return interaction.reply(
                    `🧪 Đã sử dụng **${tenDan}**.\n` +
                    `✨ Kinh nghiệm **+100**.\n` +
                    `📖 Kinh nghiệm hiện tại: **${kinhNghiemMoi}**`
                );

            }

            // =================================================
            // ĐAN ĐỔI LINH CĂN
            // =================================================

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan đổi linh căn")
            ) {

                // ---------------------------------------------
                // LINH CĂN CŨ
                // ---------------------------------------------

                const linhCanCu =
                    p.linhCan;

                // ---------------------------------------------
                // TẠO LINH CĂN MỚI
                // ---------------------------------------------

                const linhCanMoi =
                    generateLinhCan();

                // ---------------------------------------------
                // CẬP NHẬT DATABASE
                // ---------------------------------------------

                updatePlayer(
                    interaction.user.id,
                    {
                        linhCan: linhCanMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc: list
                        }
                    }
                );

                // ---------------------------------------------
                // HIỂN THỊ
                // ---------------------------------------------

                let message =
                    `🧪 Đã sử dụng **${tenDan}**!\n\n` +
                    `🧬 **LINH CĂN ĐÃ ĐƯỢC THAY ĐỔI**\n\n`;

                if (linhCanCu) {

                    message +=
                        `🔻 Linh căn cũ:\n` +
                        `**${linhCanCu.ten || "Không rõ"}**\n\n`;

                } else {

                    message +=
                        `🔻 Linh căn cũ:\n` +
                        `**Chưa có**\n\n`;

                }

                message +=
                    `🔺 Linh căn mới:\n` +
                    `**${linhCanMoi.ten}**\n\n` +

                    `🏆 Phẩm cấp: **${linhCanMoi.phamCap}**\n` +
                    `🌟 Thuộc tính: **${linhCanMoi.thuocTinh}**\n\n` +

                    `📜 ${linhCanMoi.moTa}`;

                return interaction.reply(message);

            }

            // =================================================
            // ĐAN ĐỔI LINH CĂN - TRƯỜNG HỢP KHÁC CÁCH VIẾT
            // =================================================

            if (
                tenDan
                    .toLowerCase()
                    .includes("đổi linh căn")
            ) {

                const linhCanCu =
                    p.linhCan;

                const linhCanMoi =
                    generateLinhCan();

                updatePlayer(
                    interaction.user.id,
                    {
                        linhCan: linhCanMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc: list
                        }
                    }
                );

                return interaction.reply(
                    `🧪 Đã sử dụng **${tenDan}**!\n\n` +

                    `🧬 **LINH CĂN ĐÃ ĐƯỢC THAY ĐỔI**\n\n` +

                    `🔻 Cũ: **${
                        linhCanCu?.ten || "Chưa có"
                    }**\n\n` +

                    `🔺 Mới: **${linhCanMoi.ten}**\n` +

                    `🏆 Phẩm cấp: **${linhCanMoi.phamCap}**\n` +

                    `🌟 Thuộc tính: **${linhCanMoi.thuocTinh}**\n\n` +

                    `📜 ${linhCanMoi.moTa}`
                );

            }

            // =================================================
            // ĐAN CHƯA CÓ HIỆU ỨNG
            // =================================================

            // Quan trọng:
            // Nếu đan không phải các loại trên,
            // KHÔNG âm thầm mất đan.
            //
            // Hoàn lại viên đan nếu chưa có hiệu ứng.

            list.splice(
                index,
                0,
                tenDan
            );

            updatePlayer(
                interaction.user.id,
                {
                    tuiDo: {
                        ...p.tuiDo,
                        danDuoc: list
                    }
                }
            );

            return interaction.reply({
                content:
                    `⚠️ **${tenDan}** chưa được khai báo hiệu ứng.\n` +
                    `📦 Đan dược **không bị mất**.`,
                ephemeral: true
            });

        } catch (error) {

            console.error(
                "❌ Lỗi /dungdan:",
                error
            );

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                return interaction.followUp({
                    content:
                        "❌ Đã xảy ra lỗi khi sử dụng đan dược.",
                    ephemeral: true
                });

            }

            return interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi sử dụng đan dược.",
                ephemeral: true
            });

        }

    }

};
