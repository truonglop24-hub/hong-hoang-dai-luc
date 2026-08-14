// thechat.js
// Hệ thống 70 Thể Chất Hồng Hoang
// Từ yếu -> mạnh

const THE_CHAT = [
    // ===== PHÀM CẤP =====
    { id: "pham_nhan", name: "Phàm Nhân Chi Thể", rank: "Phàm", rate: 20, hp: 100, defense: 5, power: 5, train: 1.00 },
    { id: "cuong_than", name: "Cường Thân Thể", rank: "Phàm", rate: 12, hp: 130, defense: 8, power: 8, train: 1.02 },
    { id: "thiet_cot", name: "Thiết Cốt Thể", rank: "Phàm", rate: 10, hp: 160, defense: 12, power: 10, train: 1.03 },
    { id: "dong_bi", name: "Đồng Bì Thể", rank: "Phàm", rate: 9, hp: 180, defense: 15, power: 12, train: 1.04 },
    { id: "bach_luyen", name: "Bách Luyện Thể", rank: "Phàm", rate: 8, hp: 220, defense: 18, power: 15, train: 1.05 },
    { id: "ngoc_cot", name: "Ngọc Cốt Thể", rank: "Phàm", rate: 7, hp: 260, defense: 22, power: 18, train: 1.06 },
    { id: "kim_cuong", name: "Kim Cương Thể", rank: "Phàm", rate: 6, hp: 320, defense: 28, power: 22, train: 1.08 },
    { id: "huyen_thiet", name: "Huyền Thiết Thể", rank: "Phàm", rate: 5, hp: 380, defense: 35, power: 25, train: 1.10 },
    { id: "linh_the", name: "Linh Thể", rank: "Phàm", rate: 4, hp: 450, defense: 42, power: 30, train: 1.12 },
    { id: "tien_thien_linh", name: "Tiên Thiên Linh Thể", rank: "Phàm", rate: 3, hp: 550, defense: 50, power: 38, train: 1.15 },

    // ===== LINH CẤP =====
    { id: "huyen_vu", name: "Huyền Vũ Thể", rank: "Linh", rate: 2.5, hp: 700, defense: 70, power: 50, train: 1.18 },
    { id: "thanh_moc", name: "Thanh Mộc Thể", rank: "Linh", rate: 2.2, hp: 680, defense: 55, power: 55, train: 1.20 },
    { id: "xich_viem", name: "Xích Viêm Thể", rank: "Linh", rate: 2, hp: 650, defense: 50, power: 70, train: 1.22 },
    { id: "han_bang", name: "Hàn Băng Thể", rank: "Linh", rate: 1.8, hp: 700, defense: 60, power: 75, train: 1.24 },
    { id: "tu_loi", name: "Tử Lôi Thể", rank: "Linh", rate: 1.6, hp: 720, defense: 55, power: 90, train: 1.27 },
    { id: "cuu_am", name: "Cửu Âm Thể", rank: "Linh", rate: 1.4, hp: 800, defense: 70, power: 95, train: 1.30 },
    { id: "cuu_duong", name: "Cửu Dương Thể", rank: "Linh", rate: 1.3, hp: 850, defense: 65, power: 110, train: 1.32 },
    { id: "thai_am", name: "Thái Âm Thể", rank: "Linh", rate: 1.1, hp: 900, defense: 80, power: 125, train: 1.35 },
    { id: "thai_duong", name: "Thái Dương Thể", rank: "Linh", rate: 1, hp: 950, defense: 75, power: 140, train: 1.38 },
    { id: "am_duong_linh", name: "Âm Dương Linh Thể", rank: "Linh", rate: 0.8, hp: 1100, defense: 100, power: 160, train: 1.42 },

    // ===== THIÊN CẤP =====
    { id: "thien_loi_thanh", name: "Thiên Lôi Thánh Thể", rank: "Thiên", rate: 0.6, hp: 1300, defense: 120, power: 200, train: 1.50 },
    { id: "cuu_duong_thanh", name: "Cửu Dương Thánh Thể", rank: "Thiên", rate: 0.55, hp: 1400, defense: 125, power: 220, train: 1.55 },
    { id: "cuu_am_thanh", name: "Cửu Âm Thánh Thể", rank: "Thiên", rate: 0.5, hp: 1400, defense: 130, power: 225, train: 1.58 },
    { id: "thai_so", name: "Thái Sơ Thánh Thể", rank: "Thiên", rate: 0.45, hp: 1600, defense: 150, power: 250, train: 1.62 },
    { id: "tinh_than", name: "Tinh Thần Thánh Thể", rank: "Thiên", rate: 0.4, hp: 1700, defense: 155, power: 280, train: 1.68 },
    { id: "hu_khong_thanh", name: "Hư Không Thánh Thể", rank: "Thiên", rate: 0.35, hp: 1800, defense: 170, power: 300, train: 1.72 },
    { id: "thoi_khong_thanh", name: "Thời Không Thánh Thể", rank: "Thiên", rate: 0.3, hp: 2000, defense: 190, power: 340, train: 1.78 },
    { id: "luan_hoi_thanh", name: "Luân Hồi Thánh Thể", rank: "Thiên", rate: 0.25, hp: 2200, defense: 200, power: 380, train: 1.85 },
    { id: "nhan_qua_thanh", name: "Nhân Quả Thánh Thể", rank: "Thiên", rate: 0.2, hp: 2300, defense: 210, power: 420, train: 1.90 },
    { id: "bat_diet_thanh", name: "Bất Diệt Thánh Thể", rank: "Thiên", rate: 0.15, hp: 2600, defense: 250, power: 500, train: 2.00 },

    // ===== HỒNG HOANG =====
    { id: "chan_long", name: "Chân Long Thể", rank: "Hồng Hoang", rate: 0.12, hp: 3200, defense: 300, power: 650, train: 2.10 },
    { id: "nguyen_phuong", name: "Nguyên Phượng Thể", rank: "Hồng Hoang", rate: 0.11, hp: 3000, defense: 280, power: 700, train: 2.12 },
    { id: "ky_lan", name: "Kỳ Lân Thể", rank: "Hồng Hoang", rate: 0.1, hp: 3500, defense: 350, power: 650, train: 2.15 },
    { id: "kim_o", name: "Kim Ô Thể", rank: "Hồng Hoang", rate: 0.09, hp: 3100, defense: 270, power: 800, train: 2.20 },
    { id: "con_bang", name: "Côn Bằng Thể", rank: "Hồng Hoang", rate: 0.08, hp: 3600, defense: 300, power: 850, train: 2.25 },
    { id: "bach_ho", name: "Bạch Hổ Thần Thể", rank: "Hồng Hoang", rate: 0.07, hp: 3400, defense: 320, power: 900, train: 2.30 },
    { id: "chu_tuoc", name: "Chu Tước Thần Thể", rank: "Hồng Hoang", rate: 0.06, hp: 3300, defense: 300, power: 950, train: 2.35 },
    { id: "ma_than", name: "Ma Thần Thể", rank: "Hồng Hoang", rate: 0.05, hp: 4000, defense: 380, power: 1100, train: 2.40 },
    { id: "hong_hoang_than", name: "Hồng Hoang Thần Thể", rank: "Hồng Hoang", rate: 0.04, hp: 4500, defense: 420, power: 1300, train: 2.50 },

    // ===== HỖN ĐỘN =====
    { id: "hon_nguyen", name: "Hỗn Nguyên Thánh Thể", rank: "Hỗn Độn", rate: 0.03, hp: 5000, defense: 500, power: 1600, train: 2.70 },
    { id: "hon_don", name: "Hỗn Độn Thánh Thể", rank: "Hỗn Độn", rate: 0.025, hp: 6000, defense: 600, power: 2000, train: 3.00 },
    { id: "hon_don_bat_diet", name: "Hỗn Độn Bất Diệt Thể", rank: "Hỗn Độn", rate: 0.02, hp: 7500, defense: 750, power: 2500, train: 3.20 },
    { id: "hon_don_am_duong", name: "Hỗn Độn Âm Dương Thể", rank: "Hỗn Độn", rate: 0.018, hp: 8000, defense: 800, power: 2800, train: 3.30 },
    { id: "hon_don_ngu_hanh", name: "Hỗn Độn Ngũ Hành Thể", rank: "Hỗn Độn", rate: 0.016, hp: 8500, defense: 850, power: 3000, train: 3.40 },
    { id: "hon_don_thoi_khong", name: "Hỗn Độn Thời Không Thể", rank: "Hỗn Độn", rate: 0.014, hp: 9000, defense: 900, power: 3500, train: 3.50 },
    { id: "hon_don_luan_hoi", name: "Hỗn Độn Luân Hồi Thể", rank: "Hỗn Độn", rate: 0.012, hp: 9500, defense: 950, power: 4000, train: 3.60 },
    { id: "hong_mong_thanh", name: "Hồng Mông Thánh Thể", rank: "Hỗn Độn", rate: 0.01, hp: 11000, defense: 1100, power: 5000, train: 3.80 },
    { id: "hong_mong_dao", name: "Hồng Mông Đạo Thể", rank: "Hỗn Độn", rate: 0.008, hp: 13000, defense: 1300, power: 6000, train: 4.00 },
    { id: "hong_mong_hon_don", name: "Hồng Mông Hỗn Độn Thể", rank: "Hỗn Độn", rate: 0.005, hp: 15000, defense: 1500, power: 7500, train: 4.30 },

    // ===== ĐẠI ĐẠO =====
    { id: "vo_cuc_than", name: "Vô Cực Thần Thể", rank: "Đại Đạo", rate: 0.004, hp: 18000, defense: 1800, power: 9000, train: 4.50 },
    { id: "vo_thuong_than", name: "Vô Thượng Thần Thể", rank: "Đại Đạo", rate: 0.0035, hp: 22000, defense: 2200, power: 11000, train: 4.80 },
    { id: "dai_dao_than", name: "Đại Đạo Thần Thể", rank: "Đại Đạo", rate: 0.003, hp: 26000, defense: 2600, power: 14000, train: 5.00 },
    { id: "dai_dao_bat_diet", name: "Đại Đạo Bất Diệt Thể", rank: "Đại Đạo", rate: 0.0025, hp: 30000, defense: 3000, power: 17000, train: 5.30 },
    { id: "dai_dao_ban_nguyen", name: "Đại Đạo Bản Nguyên Thể", rank: "Đại Đạo", rate: 0.002, hp: 35000, defense: 3500, power: 20000, train: 5.60 },
    { id: "hon_don_dai_dao", name: "Hỗn Độn Đại Đạo Thể", rank: "Đại Đạo", rate: 0.0015, hp: 40000, defense: 4000, power: 25000, train: 6.00 },
    { id: "hong_mong_dai_dao", name: "Hồng Mông Đại Đạo Thể", rank: "Đại Đạo", rate: 0.001, hp: 50000, defense: 5000, power: 30000, train: 6.50 },
    { id: "ban_co", name: "Bàn Cổ Thể", rank: "Đại Đạo", rate: 0.0005, hp: 70000, defense: 7000, power: 50000, train: 7.00 },
    { id: "vo_thuy_vo_chung", name: "Vô Thủy Vô Chung Thể", rank: "Đại Đạo", rate: 0.0002, hp: 100000, defense: 10000, power: 80000, train: 8.00 },
    { id: "chi_cao_hon_don", name: "Chí Cao Hỗn Độn Đại Đạo Thể", rank: "Đại Đạo", rate: 0.00005, hp: 150000, defense: 15000, power: 150000, train: 10.00 }
];

function randomTheChat() {
    const total = THE_CHAT.reduce((sum, item) => sum + item.rate, 0);
    let random = Math.random() * total;

    for (const item of THE_CHAT) {
        random -= item.rate;

        if (random <= 0) {
            return { ...item };
        }
    }

    return { ...THE_CHAT[0] };
}

function getTheChat(id) {
    return THE_CHAT.find(item => item.id === id);
}

module.exports = {
    THE_CHAT,
    randomTheChat,
    getTheChat
};
