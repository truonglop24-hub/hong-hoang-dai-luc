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

// =====================================================
// CHUẨN HÓA TEXT
// =====================================================

function normalizeText(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

// =====================================================
// KIỂM TRA ĐAN CÓ CHỨA LOẠI ĐƯỢC CHỌN KHÔNG
// =====================================================

function containsDan(item, danNhap) {

    const itemParts =
        String(item || "")
            .split(",")
            .map(x => normalizeText(x))
            .filter(Boolean);

    const input =
        normalizeText(danNhap);

    return itemParts.some(part => {

        return (
            part === input ||
            part.includes(input) ||
            input.includes(part)
        );
    });
}

// =====================================================
// XÓA ĐÚNG 1 LOẠI ĐAN ĐÃ DÙNG
//
// Ví dụ:
// "Đan đổi linh căn,đan đổi thể chất"
//
// dùng "Đan đổi linh căn"
//
// còn lại:
// "đan đổi thể chất"
// =====================================================

function consumeDan(list, index, danNhap) {

    const item =
        String(list[index] || "").trim();

    const input =
        normalizeText(danNhap);

    const parts =
        item
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);

    // Nếu chỉ có một loại
    if (parts.length <= 1) {
        list.splice(index, 1);
        return;
    }

    // Tìm phần cần xóa
    const removeIndex =
        parts.findIndex(part => {

            const normalized =
                normalizeText(part);

            return (
                normalized === input ||
                normalized.includes(input) ||
                input.includes(normalized)
            );
        });

    // Không tìm thấy
    if (removeIndex === -1) {
        return;
    }

    // Xóa đúng loại đã dùng
    parts.splice(removeIndex, 1);

    // Nếu không còn gì
    if (parts.length === 0) {
        list.splice(index, 1);
        return;
    }

    // Còn loại khác thì giữ lại
    list[index] = parts.join(",");
}

// =====================================================
// MODULE
// =====================================================

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

            // =================================================
            // 👤 NGƯỜI CHƠI
            // =================================================

            const userId =
                interaction.user.id;

            const p =
                getPlayer(userId);

            if (!p) {

                return interaction.reply({
                    content:
                        "⚠️ Hãy dùng `/batdau` trước.",
                    ephemeral: true
                });
            }

            // =================================================
            // 🧪 TÊN ĐAN NHẬP
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

            const danNhapLower =
                normalizeText(danNhap);

            // =================================================
            // 📦 KIỂM TRA TÚI
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
                [...p.tuiDo.danDuoc];

            // =================================================
            // 🔎 TÌM ĐAN
            //
            // Có thể tìm trong:
            //
            // Đan đổi linh căn
            //
            // hoặc:
            //
            // Đan đổi linh căn,đan đổi thể chất
            // =================================================

            const index =
                list.findIndex(item =>
                    containsDan(
                        item,
                        danNhap
                    )
                );

            if (index === -1) {

                return interaction.reply({
                    content:
                        `❌ Bạn không có **${danNhap}** trong túi đan dược.`,
                    ephemeral: true
                });
            }

            const tenDan =
                String(
                    list[index]
                ).trim();

            // =================================================
            // 🧪 XÁC ĐỊNH LOẠI ĐAN THEO
            // THỨ NGƯỜI CHƠI NHẬP
            // =================================================

            const isLinhLuc =
                danNhapLower.includes(
                    "dan linh luc"
                ) ||
                danNhapLower.includes(
                    "linh luc"
                );

            const isKinhNghiem =
                danNhapLower.includes(
                    "dan kinh nghiem"
                ) ||
                danNhapLower.includes(
                    "kinh nghiem"
                );

            const isLinhCan =
                danNhapLower.includes(
                    "dan doi linh can"
                ) ||
                danNhapLower.includes(
                    "doi linh can"
                );

            const isTheChat =
                danNhapLower.includes(
                    "dan doi the chat"
                ) ||
                danNhapLower.includes(
                    "doi the chat"
                );

            // =================================================
            // 🔴 NẾU KHÔNG NHẬN DIỆN ĐƯỢC
            // KHÔNG TRỪ ĐAN
            // =================================================

            if (
                !isLinhLuc &&
                !isKinhNghiem &&
                !isLinhCan &&
                !isTheChat
            ) {

                return interaction.reply({
                    content:
                        `⚠️ **${danNhap}** chưa được khai báo hiệu ứng.\n` +
                        `📦 Đan dược **không bị mất**.`,
                    ephemeral: true
                });
            }

            // =================================================
            // 🔥 ĐAN LINH LỰC
            // =================================================

            if (isLinhLuc) {

                const newList =
                    [...list];

                consumeDan(
                    newList,
                    index,
                    danNhap
                );

                const linhLucMoi =
                    (Number(p.linhLuc) || 0)
                    + 100;

                updatePlayer(
                    userId,
                    {
                        linhLuc:
                            linhLucMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc:
                                newList
                        }
                    }
                );

                return interaction.reply(
                    `🧪 Đã sử dụng **${danNhap}**.\n\n` +
                    `🔥 Linh lực **+100**.\n` +
                    `💠 Linh lực hiện tại: **${linhLucMoi}**`
                );
            }

            // =================================================
            // ✨ ĐAN KINH NGHIỆM
            // =================================================

            if (isKinhNghiem) {

                const newList =
                    [...list];

                consumeDan(
                    newList,
                    index,
                    danNhap
                );

                const kinhNghiemMoi =
                    (Number(p.kinhNghiem) || 0)
                    + 100;

                updatePlayer(
                    userId,
                    {
                        kinhNghiem:
                            kinhNghiemMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc:
                                newList
                        }
                    }
                );

                return interaction.reply(
                    `🧪 Đã sử dụng **${danNhap}**.\n\n` +
                    `✨ Kinh nghiệm **+100**.\n` +
                    `📖 Kinh nghiệm hiện tại: **${kinhNghiemMoi}**`
                );
            }

            // =================================================
            // 🧬 ĐAN ĐỔI LINH CĂN
            // =================================================

            if (isLinhCan) {

                const linhCanCu =
                    p.linhCan;

                const linhCanMoi =
                    generateLinhCan();

                const newList =
                    [...list];

                // Chỉ xóa "Đan đổi linh căn"
                // nếu item có cả hai loại
                consumeDan(
                    newList,
                    index,
                    danNhap
                );

                updatePlayer(
                    userId,
                    {
                        linhCan:
                            linhCanMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc:
                                newList
                        }
                    }
                );

                let message =
                    `🧪 Đã sử dụng **${danNhap}**!\n\n` +
                    `🧬 **LINH CĂN ĐÃ ĐƯỢC THAY ĐỔI**\n\n`;

                message +=
                    `🔻 Linh căn cũ:\n` +
                    `**${
                        linhCanCu?.ten ||
                        "Chưa có"
                    }**\n\n`;

                message +=
                    `🔺 Linh căn mới:\n` +
                    `**${linhCanMoi.ten}**\n\n` +

                    `🏆 Phẩm cấp: **${linhCanMoi.phamCap}**\n` +
                    `🌟 Thuộc tính: **${linhCanMoi.thuocTinh}**\n\n` +

                    `📜 ${linhCanMoi.moTa}`;

                return interaction.reply(
                    message
                );
            }

            // =================================================
            // 💠 ĐAN ĐỔI THỂ CHẤT
            // =================================================

            if (isTheChat) {

                const newList =
                    [...list];

                // =================================================
                // 🔎 XÁC ĐỊNH PHẦN TÊN THỂ CHẤT
                //
                // Ví dụ:
                //
                // Đan đổi thể chất
                //
                // Đan đổi thể chất - Hỗn Độn Thánh Thể
                // =================================================

                let phanSau = "";

                const marker =
                    danNhapLower.includes(
                        "dan doi the chat"
                    )
                        ? "dan doi the chat"
                        : "doi the chat";

                const viTri =
                    danNhapLower.indexOf(
                        marker
                    );

                if (viTri !== -1) {

                    phanSau =
                        danNhap
                            .slice(
                                viTri +
                                marker.length
                            )
                            .replace(
                                /^[\s:：\-–—]+/,
                                ""
                            )
                            .trim();
                }

                let theChatMoi =
                    null;

                // =================================================
                // 🔎 TÌM THEO ID
                // =================================================

                if (phanSau) {

                    const idTim =
                        normalizeText(
                            phanSau
                        )
                        .replace(
                            /\s+/g,
                            "_"
                        );

                    const timThay =
                        getTheChat(
                            idTim
                        );

                    if (timThay) {
                        theChatMoi =
                            timThay;
                    }
                }

                // =================================================
                // 🔎 TÌM THEO TÊN
                // =================================================

                if (
                    !theChatMoi &&
                    phanSau
                ) {

                    const {
                        THE_CHAT
                    } =
                        require("./thechat");

                    theChatMoi =
                        THE_CHAT.find(
                            item =>
                                normalizeText(
                                    item.name
                                ) ===
                                normalizeText(
                                    phanSau
                                )
                        );
                }

                // =================================================
                // 🎲 KHÔNG CHỈ ĐỊNH
                // RANDOM
                // =================================================

                if (!theChatMoi) {

                    theChatMoi =
                        randomTheChat();
                }

                const theChatCu =
                    p.theChat ||
                    null;

                // =================================================
                // 📊 CHỈ SỐ THỂ CHẤT CŨ
                // =================================================

                const cuHp =
                    Number(
                        theChatCu?.hp
                    ) || 100;

                const cuDefense =
                    Number(
                        theChatCu?.defense
                    ) || 5;

                const cuPower =
                    Number(
                        theChatCu?.power
                    ) || 10;

                // =================================================
                // 📊 CHỈ SỐ THỂ CHẤT MỚI
                // =================================================

                const hpMoi =
                    Math.max(
                        1,

                        (Number(p.hp) || 100)

                        +

                        Number(
                            theChatMoi.hp || 0
                        )

                        -

                        cuHp
                    );

                const maxHpMoi =
                    Math.max(
                        1,

                        (Number(p.maxHp) || 100)

                        +

                        Number(
                            theChatMoi.hp || 0
                        )

                        -

                        cuHp
                    );

                const congMoi =
                    Math.max(
                        0,

                        (Number(p.cong) || 10)

                        +

                        Number(
                            theChatMoi.power || 0
                        )

                        -

                        cuPower
                    );

                const thuMoi =
                    Math.max(
                        0,

                        (Number(p.thu) || 5)

                        +

                        Number(
                            theChatMoi.defense || 0
                        )

                        -

                        cuDefense
                    );

                // =================================================
                // 📦 TRỪ ĐÚNG ĐAN ĐỔI THỂ CHẤT
                // =================================================

                consumeDan(
                    newList,
                    index,
                    danNhap
                );

                // =================================================
                // 💾 LƯU
                // =================================================

                updatePlayer(
                    userId,
                    {
                        theChat: {
                            ...theChatMoi
                        },

                        hp:
                            hpMoi,

                        maxHp:
                            maxHpMoi,

                        cong:
                            congMoi,

                        thu:
                            thuMoi,

                        tuiDo: {
                            ...p.tuiDo,
                            danDuoc:
                                newList
                        }
                    }
                );

                // =================================================
                // 📜 THÔNG BÁO
                // =================================================

                return interaction.reply(
                    `🧪 Đã sử dụng **${danNhap}** thành công!\n\n` +

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

            // =================================================
            // ⚠️ KHÔNG CÓ HIỆU ỨNG
            // =================================================

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

            // =================================================
            // ❌ ĐÃ REPLY
            // =================================================

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

            // =================================================
            // ❌ CHƯA REPLY
            // =================================================

            return interaction.reply({
                content:
                    "❌ Đã xảy ra lỗi khi sử dụng đan dược.",
                ephemeral: true
            });
        }
    }
};
