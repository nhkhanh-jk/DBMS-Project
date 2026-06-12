const MAPS = {
  movie: { TenPhim:'title', TheLoai:'genres', MoTa:'description',
           ThoiLuong:'durationMin', NgayPhatHanh:'releaseDate', TrangThai:'status',
           AnhPoster:'posterUrl' },
  showtime: { MaPhim:'movieId', MaPhong:'roomId', ThoiGianBatDau:'startTime',
              ThoiGianKetThuc:'endTime', TrangThai:'status' },
  booking: { MaSuat:'showtimeId', MaKH:'userId', MaUuDai:'promotionCode',
             TongTien:'totalPrice', DanhSachVe:'tickets' },
  user: { TenDangNhap:'username', MatKhau:'password', HoTen:'fullName',
          Email:'email', SoDienThoai:'phoneNumber', MaRap:'cinemaId', ChucVu:'role' },
  serviceRequest: { LoaiYeuCau:'requestType', ChiTietYeuCau:'requestDetail', TrangThai:'status' },
  review: { MaPhim:'movieId', DiemSo:'rating', BinhLuan:'comment' },
};

// Merge VI keys into object, EN key has higher priority
function normalize(body, type) {
  const map = MAPS[type] || {};
  const result = { ...body };
  for (const [viKey, enKey] of Object.entries(map)) {
    if (viKey in body && !(enKey in body)) {
      result[enKey] = body[viKey];
    }
  }
  return result;
}

module.exports = { normalize, MAPS };
