const { SlashCommandBuilder } = require("discord.js");

const {
    getPlayer,
    updatePlayer,
    generateLinhCan
} = require("./database");

const {
    randomTheChat,
    getTheChat
} = require("./thechat");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("dungdan")
        .setDescription("Sử dụng đan dược trong túi")
        .addStringOption(option =>
            option
                .setName("dan")
                .setDescription("Nhập tên đan dược muốn sử dụng")
                .setRequired(true)
        ),

    async execute(interaction) {

        try {

            const p = getPlayer(interaction.user.id);

            if (!p) {
                return interaction.reply({
                    content: "⚠️ Hãy dùng `/batdau` trước.",
                    ephemeral: true
                });
            }

            const danNhap =
                interaction.options.getString("dan").trim();

            if (!danNhap) {
                return interaction.reply({
                    content: "❌ Vui lòng nhập tên đan dược.",
                    ephemeral: true
                });
            }

            if (!p.tuiDo) {
                return interaction.reply({
                    content: "❌ Không tìm thấy túi đồ.",
                    ephemeral: true
                });
            }

            if (!Array.isArray(p.tuiDo.danDuoc)) {
                return interaction.reply({
                    content: "❌ Túi đan dược đang trống.",
                    ephemeral: true
                });
            }

            const list = p.tuiDo.danDuoc;

            const index = list.findIndex(item =>
                String(item)
                    .trim()
                    .toLowerCase() === danNhap.toLowerCase()
            );

            if (index === -1) {
                return interaction.reply({
                    content:
                        `❌ Bạn không có **${danNhap}** trong túi đan dược.`,
                    ephemeral: true
                });
            }

            const tenDan = String(list[index]).trim();

            /*
            =====================================================
            ĐAN LINH LỰC
            =====================================================
            */

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan linh lực")
            ) {

                list.splice(index, 1);

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

            /*
            =====================================================
            ĐAN KINH NGHIỆM
            =====================================================
            */

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan kinh nghiệm")
            ) {

                list.splice(index, 1);

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

            /*
            =====================================================
            ĐAN ĐỔI LINH CĂN
            =====================================================
            */

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan đổi linh căn")
            ) {

                const linhCanCu = p.linhCan;

                const linhCanMoi =
                    generateLinhCan();

                list.splice(index, 1);

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

            /*
            =====================================================
            ĐAN ĐỔI LINH CĂN
            TRƯỜNG HỢP TÊN KHÁC
            =====================================================
            */

            if (
                tenDan
                    .toLowerCase()
                    .includes("đổi linh căn")
            ) {

                const linhCanCu = p.linhCan;

                const linhCanMoi =
                    generateLinhCan();

                list.splice(index, 1);

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

            /*
            =====================================================
            ĐAN ĐỔI THỂ CHẤT
            =====================================================
            */

            if (
                tenDan
                    .toLowerCase()
                    .includes("đan đổi thể chất") ||
                tenDan
                    .toLowerCase()
                    .includes("đổi thể chất")
            ) {

                const tenDanLower =
                    tenDan.toLowerCase();

                const marker =
                    tenDanLower.includes("đan đổi thể chất")
                        ? "đan đổi thể chất"
                        : "đổi thể chất";

                /*
                Ví dụ:

                Đan Đổi Thể Chất
                -> random 1 trong 70 thể chất

                Đan Đổi Thể Chất - Hỗn Độn Thánh Thể
                -> đổi thành Hỗn Độn Thánh Thể
                */

                const viTri =
                    tenDanLower.indexOf(marker);

                const phanSau =
                    tenDan
                        .slice(
                            viTri + marker.length
                        )
                        .replace(
                            /^[\s:：\-–—]+/,
                            ""
                        )
                        .trim();

                let theChatMoi = null;

                /*
                TÌM THEO ID
                */

                if (phanSau) {

                    const idTim =
                        phanSau
                            .toLowerCase()
                            .replace(/\s+/g, "_");

                    const timThay =
                        getTheChat(idTim);

                    if (timThay) {
                        theChatMoi = timThay;
                    }
                }

                /*
                NẾU KHÔNG TÌM ĐƯỢC ID
                THÌ TÌM THEO TÊN HIỂN THỊ
                */

                if (!theChatMoi && phanSau) {

                    const {
                        THE_CHAT
                    } = require("./thechat");

                    theChatMoi =
                        THE_CHAT.find(item =>
                            item.name
                                .toLowerCase() ===
                            phanSau.toLowerCase()
                        );
                }

                /*
                KHÔNG GHI RÕ THỂ CHẤT
                -> RANDOM
                */

                if (!theChatMoi) {
                    theChatMoi =
                        randomTheChat();
                }

                const theChatCu =
                    p.theChat || null;

                /*
                =================================================
                TÍNH CHỈ SỐ
                =================================================
                */

                const cuHp =
                    Number(theChatCu?.hp) || 100;

                const cuDefense =
                    Number(theChatCu?.defense) || 5;

                const cuPower =
                    Number(theChatCu?.power) || 10;

                const hpMoi =
                    Math.max(
                        1,
                        (Number(p.hp) || 100) +
                        Number(theChatMoi.hp || 0) -
                        cuHp
                    );

                const maxHpMoi =
                    Math.max(
                        1,
                        (Number(p.maxHp) || 100) +
                        Number(theChatMoi.hp || 0) -
                        cuHp
                    );

                const congMoi =
                    Math.max(
                        0,
                        (Number(p.cong) || 10) +
                        Number(theChatMoi.power || 0) -
                        cuPower
                    );

                const thuMoi =
                    Math.max(
                        0,
                        (Number(p.thu) || 5) +
                        Number(theChatMoi.defense || 0) -
                        cuDefense
                    );

                /*
                =================================================
                TRỪ ĐAN
                =================================================
                */

                list.splice(index, 1);

                /*
                =================================================
                LƯU THỂ CHẤT
                =================================================
                */

                updatePlayer(
                    interaction.user.id,
                    {
                        theChat: {
                            ...theChatMoi
                        },

                        hp: hpMoi,

                        maxHp: maxHpMoi,

                        cong: congMoi,

                        thu: thuMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc: list
                        }
                    }
                );

                /*
                =================================================
                THÔNG BÁO
                =================================================
                */

                return interaction.reply(
                    `🧪 Đã sử dụng **${tenDan}** thành công!\n\n` +

                    `🧬 **THỂ CHẤT ĐÃ ĐƯỢC THAY ĐỔI**\n\n` +

                    `🔻 Thể chất cũ:\n` +
                    `**${
                        theChatCu?.name ||
                        "Chưa có"
                    }**\n\n` +

                    `🔺 Thể chất mới:\n` +
                    `**${theChatMoi.name}**\n\n` +

                    `🏆 Cấp: **${theChatMoi.rank}**\n` +
                    `❤️ HP: **+${theChatMoi.hp}**\n` +
                    `🛡️ Phòng thủ: **+${theChatMoi.defense}**\n` +
                    `⚔️ Công: **+${theChatMoi.power}**\n` +
                    `⚡ Tốc độ tu luyện: **x${theChatMoi.train}**`
                );
            }

            /*
            =====================================================
            ĐAN CHƯA CÓ HIỆU ỨNG
            =====================================================
            */

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
