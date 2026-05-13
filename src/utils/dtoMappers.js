// utils/dtoMappers.js — Mỗi mapper PHẢI trả về cả EN + VI key

function toMovieDTO(movie) {
  const m = movie.toObject ? movie.toObject() : movie;
  return {
    // English
    id: m._id, title: m.title, genres: m.genres,
    description: m.description, durationMin: m.durationMin,
    releaseDate: m.releaseDate, status: m.status,
    // Vietnamese
    MaPhim: m._id, TenPhim: m.title, TheLoai: m.genres,
    MoTa: m.description, ThoiLuong: m.durationMin,
    NgayPhatHanh: m.releaseDate, TrangThai: m.status,
  };
}

function toShowtimeDTO(showtime, movieTitle, roomName) {
  const s = showtime.toObject ? showtime.toObject() : showtime;
  return {
    // English
    id: s._id, movieId: s.movieId, roomId: s.roomId,
    cinemaId: s.cinemaId, startTime: s.startTime, endTime: s.endTime,
    basePrice: s.basePrice, status: s.status, bookedSeats: s.bookedSeats,
    movieTitle: movieTitle || null,
    roomName: roomName || null,
    // Vietnamese
    MaSuat: s._id, MaPhim: s.movieId, MaPhong: s.roomId,
    ThoiGianBatDau: s.startTime, ThoiGianKetThuc: s.endTime,
    TrangThai: s.status,
    TenPhim: movieTitle || null,
    TenPhong: roomName || null,
  };
}

function toUserDTO(user) {
  const u = user.toObject ? user.toObject() : user;
  return {
    // English
    id: u._id, username: u.username, role: u.role,
    fullName: u.fullName, email: u.email, phoneNumber: u.phoneNumber,
    dateOfBirth: u.dateOfBirth, gender: u.gender,
    rewardPoints: u.rewardPoints, membershipLevel: u.membershipLevel,
    // Vietnamese
    MaND: u._id, TenDangNhap: u.username, MatKhau: u.password,
    HoTen: u.fullName, Email: u.email, SoDienThoai: u.phoneNumber,
    NgaySinh: u.dateOfBirth, GioiTinh: u.gender,
    DiemThuong: u.rewardPoints, CapDoThanhVien: u.membershipLevel,
  };
}

function toBookingDTO(booking) {
  const b = booking.toObject ? booking.toObject() : booking;
  // Convert tickets array to proper format
  const tickets = (b.tickets || []).map(ticket => ({
    seatNumber: ticket.seatNumber,
    price: ticket.price,
    status: ticket.status,
    MaGhe: ticket.seatNumber,
    GiaVe: ticket.price,
    TrangThai: ticket.status,
  }));

  return {
    // English
    id: b._id, bookingCode: b.bookingCode, userId: b.userId,
    staffId: b.staffId, showtimeId: b.showtimeId, bookingTime: b.bookingTime,
    paymentMethod: b.paymentMethod, promotionCode: b.promotionCode,
    totalPrice: b.totalPrice, tickets: tickets,
    // Vietnamese
    MaDon: b._id, MaDatVe: b.bookingCode, MaKH: b.userId,
    MaNV: b.staffId, MaSuat: b.showtimeId, ThoiGianDat: b.bookingTime,
    TongTien: b.totalPrice, DanhSachVe: tickets,
  };
}

function toReviewDTO(review) {
  const r = review.toObject ? review.toObject() : review;
  return {
    // English
    id: r._id, movieId: r.movieId, userId: r.userId,
    rating: r.rating, comment: r.comment, reviewedAt: r.reviewedAt,
    // Vietnamese
    MaPhim: r.movieId, DiemSo: r.rating, BinhLuan: r.comment,
    MaND: r.userId, ThoiGianDanhGia: r.reviewedAt,
  };
}

function toServiceRequestDTO(serviceRequest) {
  const sr = serviceRequest.toObject ? serviceRequest.toObject() : serviceRequest;
  return {
    // English
    id: sr._id, userId: sr.userId, requestType: sr.requestType,
    requestDetail: sr.requestDetail, status: sr.status,
    // Vietnamese
    MaYC: sr._id, MaKH: sr.userId, LoaiYeuCau: sr.requestType,
    ChiTietYeuCau: sr.requestDetail, TrangThai: sr.status,
  };
}

module.exports = {
  toMovieDTO,
  toShowtimeDTO,
  toUserDTO,
  toBookingDTO,
  toReviewDTO,
  toServiceRequestDTO,
};
