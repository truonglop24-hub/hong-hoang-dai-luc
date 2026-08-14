// linhcan.js
// HỆ THỐNG 100 LINH CĂN HỒNG HOANG
// Yếu -> Mạnh

const LINH_CAN = [
    // ================= PHÀM CẤP =================
    { id: "tap_can", name: "Ngũ Hành Tạp Linh Căn", rank: "Phàm", rate: 20, train: 1.00 },
    { id: "kim", name: "Kim Linh Căn", rank: "Phàm", rate: 8, train: 1.03 },
    { id: "moc", name: "Mộc Linh Căn", rank: "Phàm", rate: 8, train: 1.03 },
    { id: "thuy", name: "Thủy Linh Căn", rank: "Phàm", rate: 8, train: 1.03 },
    { id: "hoa", name: "Hỏa Linh Căn", rank: "Phàm", rate: 8, train: 1.03 },
    { id: "tho", name: "Thổ Linh Căn", rank: "Phàm", rate: 8, train: 1.03 },
    { id: "phong", name: "Phong Linh Căn", rank: "Phàm", rate: 6, train: 1.05 },
    { id: "bang", name: "Băng Linh Căn", rank: "Phàm", rate: 5, train: 1.06 },
    { id: "am", name: "Âm Linh Căn", rank: "Phàm", rate: 5, train: 1.06 },
    { id: "duong", name: "Dương Linh Căn", rank: "Phàm", rate: 5, train: 1.06 },

    // ================= LINH CẤP =================
    { id: "loi", name: "Lôi Linh Căn", rank: "Linh", rate: 4, train: 1.10 },
    { id: "doc", name: "Độc Linh Căn", rank: "Linh", rate: 3.5, train: 1.12 },
    { id: "huyet", name: "Huyết Linh Căn", rank: "Linh", rate: 3.5, train: 1.14 },
    { id: "quang", name: "Quang Linh Căn", rank: "Linh", rate: 3, train: 1.15 },
    { id: "am_quang", name: "Ám Linh Căn", rank: "Linh", rate: 3, train: 1.15 },
    { id: "kim_phong", name: "Kim Phong Linh Căn", rank: "Linh", rate: 2.8, train: 1.18 },
    { id: "huyen_bang", name: "Huyền Băng Linh Căn", rank: "Linh", rate: 2.6, train: 1.20 },
    { id: "thien_hoa", name: "Thiên Hỏa Linh Căn", rank: "Linh", rate: 2.5, train: 1.22 },
    { id: "dia_hoa", name: "Địa Hỏa Linh Căn", rank: "Linh", rate: 2.5, train: 1.20 },
    { id: "tu_loi", name: "Tử Lôi Linh Căn", rank: "Linh", rate: 2.2, train: 1.25 },

    // ================= THIÊN CẤP =================
    { id: "thien_loi", name: "Thiên Lôi Linh Căn", rank: "Thiên", rate: 1.8, train: 1.35 },
    { id: "cuu_thien_loi", name: "Cửu Thiên Lôi Linh Căn", rank: "Thiên", rate: 1.5, train: 1.42 },
    { id: "thai_am", name: "Thái Âm Linh Căn", rank: "Thiên", rate: 1.4, train: 1.45 },
    { id: "thai_duong", name: "Thái Dương Linh Căn", rank: "Thiên", rate: 1.4, train: 1.45 },
    { id: "tinh_than", name: "Tinh Thần Linh Căn", rank: "Thiên", rate: 1.2, train: 1.50 },
    { id: "hu_khong", name: "Hư Không Linh Căn", rank: "Thiên", rate: 1.1, train: 1.55 },
    { id: "khong_gian", name: "Không Gian Linh Căn", rank: "Thiên", rate: 1.0, train: 1.60 },
    { id: "thoi_gian", name: "Thời Gian Linh Căn", rank: "Thiên", rate: 0.9, train: 1.70 },
    { id: "luan_hoi", name: "Luân Hồi Linh Căn", rank: "Thiên", rate: 0.8, train: 1.75 },
    { id: "nhan_qua", name: "Nhân Quả Linh Căn", rank: "Thiên", rate: 0.7, train: 1.80 },

    { id: "sat_phat", name: "Sát Phạt Linh Căn", rank: "Thiên", rate: 0.65, train: 1.82 },
    { id: "kiem_dao", name: "Kiếm Đạo Linh Căn", rank: "Thiên", rate: 0.6, train: 1.85 },
    { id: "dao_dao", name: "Đao Đạo Linh Căn", rank: "Thiên", rate: 0.58, train: 1.85 },
    { id: "than_luc", name: "Thần Lực Linh Căn", rank: "Thiên", rate: 0.55, train: 1.88 },
    { id: "sinh_menh", name: "Sinh Mệnh Linh Căn", rank: "Thiên", rate: 0.5, train: 1.90 },
    { id: "tu_vong", name: "Tử Vong Linh Căn", rank: "Thiên", rate: 0.48, train: 1.92 },
    { id: "thanh_khi", name: "Thanh Khí Linh Căn", rank: "Thiên", rate: 0.45, train: 1.95 },
    { id: "trọc_khi", name: "Trọc Khí Linh Căn", rank: "Thiên", rate: 0.43, train: 1.95 },
    { id: "hon_phach", name: "Hồn Phách Linh Căn", rank: "Thiên", rate: 0.40, train: 2.00 },
    { id: "than_thuc", name: "Thần Thức Linh Căn", rank: "Thiên", rate: 0.38, train: 2.05 },

    // ================= THÁNH CẤP =================
    { id: "tien_thien", name: "Tiên Thiên Linh Căn", rank: "Thánh", rate: 0.35, train: 2.10 },
    { id: "tien_thien_dao", name: "Tiên Thiên Đạo Căn", rank: "Thánh", rate: 0.32, train: 2.15 },
    { id: "hon_nguyen", name: "Hỗn Nguyên Linh Căn", rank: "Thánh", rate: 0.30, train: 2.20 },
    { id: "hon_don", name: "Hỗn Độn Linh Căn", rank: "Thánh", rate: 0.28, train: 2.30 },
    { id: "hon_don_ngu_hanh", name: "Hỗn Độn Ngũ Hành Căn", rank: "Thánh", rate: 0.25, train: 2.35 },
    { id: "hon_don_am_duong", name: "Hỗn Độn Âm Dương Căn", rank: "Thánh", rate: 0.23, train: 2.40 },
    { id: "hon_don_thoi_khong", name: "Hỗn Độn Thời Không Căn", rank: "Thánh", rate: 0.20, train: 2.50 },
    { id: "hong_hoang", name: "Hồng Hoang Bản Nguyên Căn", rank: "Thánh", rate: 0.18, train: 2.60 },
    { id: "hong_mong", name: "Hồng Mông Linh Căn", rank: "Thánh", rate: 0.15, train: 2.80 },
    { id: "hong_mong_dao", name: "Hồng Mông Đạo Căn", rank: "Thánh", rate: 0.12, train: 3.00 },

    { id: "vo_cuc", name: "Vô Cực Linh Căn", rank: "Thánh", rate: 0.10, train: 3.10 },
    { id: "vo_thuong", name: "Vô Thượng Linh Căn", rank: "Thánh", rate: 0.09, train: 3.20 },
    { id: "chu_thien", name: "Chư Thiên Linh Căn", rank: "Thánh", rate: 0.08, train: 3.25 },
    { id: "van_gioi", name: "Vạn Giới Linh Căn", rank: "Thánh", rate: 0.07, train: 3.30 },
    { id: "van_phap", name: "Vạn Pháp Linh Căn", rank: "Thánh", rate: 0.065, train: 3.35 },
    { id: "vo_tan", name: "Vô Tận Linh Căn", rank: "Thánh", rate: 0.06, train: 3.40 },
    { id: "bat_diet", name: "Bất Diệt Linh Căn", rank: "Thánh", rate: 0.055, train: 3.45 },
    { id: "chi_ton", name: "Chí Tôn Linh Căn", rank: "Thánh", rate: 0.05, train: 3.50 },
    { id: "thanh_dao", name: "Thánh Đạo Linh Căn", rank: "Thánh", rate: 0.045, train: 3.55 },
    { id: "thanh_nhan", name: "Thánh Nhân Đạo Căn", rank: "Thánh", rate: 0.04, train: 3.60 },

    // ================= ĐẠI ĐẠO =================
    { id: "dai_dao", name: "Đại Đạo Linh Căn", rank: "Đại Đạo", rate: 0.035, train: 3.80 },
    { id: "dai_dao_ban_nguyen", name: "Đại Đạo Bản Nguyên Căn", rank: "Đại Đạo", rate: 0.03, train: 4.00 },
    { id: "hon_don_dai_dao", name: "Hỗn Độn Đại Đạo Căn", rank: "Đại Đạo", rate: 0.025, train: 4.20 },
    { id: "hong_mong_dai_dao", name: "Hồng Mông Đại Đạo Căn", rank: "Đại Đạo", rate: 0.02, train: 4.50 },
    { id: "vo_thuy", name: "Vô Thủy Đạo Căn", rank: "Đại Đạo", rate: 0.017, train: 4.70 },
    { id: "vo_chung", name: "Vô Chung Đạo Căn", rank: "Đại Đạo", rate: 0.015, train: 4.80 },
    { id: "chi_cao", name: "Chí Cao Đạo Căn", rank: "Đại Đạo", rate: 0.012, train: 5.00 },
    { id: "dai_dao_chi_ton", name: "Đại Đạo Chí Tôn Căn", rank: "Đại Đạo", rate: 0.01, train: 5.30 },
    { id: "hong_mong_ban_nguyen", name: "Hồng Mông Bản Nguyên Căn", rank: "Đại Đạo", rate: 0.007, train: 5.60 },
    { id: "hon_don_hong_mong", name: "Hỗn Độn Hồng Mông Đạo Căn", rank: "Đại Đạo", rate: 0.004, train: 6.00 },

    // ================= TỐI CAO =================
    { id: "thoi_gian_dai_dao", name: "Thời Gian Đại Đạo Căn", rank: "Tối Cao", rate: 0.003, train: 6.50 },
    { id: "khong_gian_dai_dao", name: "Không Gian Đại Đạo Căn", rank: "Tối Cao", rate: 0.0028, train: 6.60 },
    { id: "luan_hoi_dai_dao", name: "Luân Hồi Đại Đạo Căn", rank: "Tối Cao", rate: 0.0025, train: 6.80 },
    { id: "nhan_qua_dai_dao", name: "Nhân Quả Đại Đạo Căn", rank: "Tối Cao", rate: 0.0022, train: 7.00 },
    { id: "van_tuong", name: "Vạn Tượng Đại Đạo Căn", rank: "Tối Cao", rate: 0.002, train: 7.20 },
    { id: "van_phap_dai_dao", name: "Vạn Pháp Đại Đạo Căn", rank: "Tối Cao", rate: 0.0018, train: 7.40 },
    { id: "chu_thien_dai_dao", name: "Chư Thiên Đại Đạo Căn", rank: "Tối Cao", rate: 0.0015, train: 7.60 },
    { id: "vo_cuc_dai_dao", name: "Vô Cực Đại Đạo Căn", rank: "Tối Cao", rate: 0.0012, train: 8.00 },
    { id: "vo_thuong_dai_dao", name: "Vô Thượng Đại Đạo Căn", rank: "Tối Cao", rate: 0.0008, train: 8.50 },
    { id: "hong_mong_chi_cao", name: "Hồng Mông Chí Cao Đạo Căn", rank: "Tối Cao", rate: 0.0005, train: 9.00 },

    // ================= CỰC HẠN =================
    { id: "hon_don_ban_nguyen", name: "Hỗn Độn Bản Nguyên Đạo Căn", rank: "Cực Hạn", rate: 0.0003, train: 9.50 },
    { id: "hong_mong_ban_nguyen_dao", name: "Hồng Mông Bản Nguyên Đạo Căn", rank: "Cực Hạn", rate: 0.0002, train: 10.00 },
    { id: "vo_thuy_vo_chung", name: "Vô Thủy Vô Chung Đạo Căn", rank: "Cực Hạn", rate: 0.0001, train: 11.00 },
    { id: "dai_dao_ban_nguyen_toi_cao", name: "Đại Đạo Bản Nguyên Tối Cao Căn", rank: "Cực Hạn", rate: 0.00005, train: 12.00 },
    { id: "hong_mong_hon_don_chi_cao", name: "Hồng Mông Hỗn Độn Chí Cao Đạo Căn", rank: "Cực Hạn", rate: 0.00001, train: 15.00 }
];


// ================= RANDOM LINH CĂN =================

function randomLinhCan() {
    const total = LINH_CAN.reduce((sum, item) => sum + item.rate, 0);

    let random = Math.random() * total;

    for (const item of LINH_CAN) {
        random -= item.rate;

        if (random <= 0) {
            return { ...item };
        }
    }

    return { ...LINH_CAN[0] };
}


// ================= TÌM LINH CĂN =================

function getLinhCan(id) {
    return LINH_CAN.find(item => item.id === id);
}


// ================= XUẤT MODULE =================

module.exports = {
    LINH_CAN,
    randomLinhCan,
    getLinhCan
};
