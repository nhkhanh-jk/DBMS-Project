# API Contract

Base URL: `/api`

> **Note on Compatibility**: All endpoints support both English (preferred) and legacy Vietnamese field names for requests. Responses return both formats.

All errors follow:
```json
{
  "error": "message",
  "code": 400
}
```

## Auth

### POST `/api/auth/register`
- Body: `username`, `password`, `fullName`, `email`, `phoneNumber` (Legacy: `TenDangNhap`, `MatKhau`, `HoTen`, `Email`, `SoDienThoai`)
- Response: customer profile DTO

### POST `/api/auth/register-employee` (ADMIN)
- Body: `username`, `password`, `cinemaId`, `fullName`, `role` (Legacy: `TenDangNhap`, `MatKhau`, `MaRap`, `HoTen`, `ChucVu`)
- Response: employee profile DTO

### POST `/api/auth/login`
- Body: `username`, `password` (Legacy: `TenDangNhap`, `MatKhau`)
- Response:
```json
{
  "accessToken": "jwt",
  "profile": {}
}
```

### GET `/api/auth/profile`
- JWT required

## Movies

### GET `/api/movies?status=...`
- Cached in Redis

### GET `/api/movies/{id}`

### POST `/api/movies` (ADMIN, NHANVIEN)
- Body: `title`, `genres`, `description`, `durationMin`, `releaseDate`, `status`
- Legacy support: `TenPhim`, `TheLoai`, `MoTa`, `ThoiLuong`, `NgayPhatHanh`, `TrangThai`

### PATCH `/api/movies/{id}` (ADMIN, NHANVIEN)

## Showtimes

### GET `/api/showtimes?movieId={id}`
- Cached in Redis when no filter

### GET `/api/showtimes/{id}`

### POST `/api/showtimes` (ADMIN, NHANVIEN)
- Body: `movieId`, `roomId`, `startTime`, `endTime`, `basePrice`, `status`
- Legacy support: `MaPhim`, `MaPhong`, `ThoiGianBatDau`, `ThoiGianKetThuc`, `TrangThai`

### PATCH `/api/showtimes/{id}` (ADMIN, NHANVIEN)

## Booking

### POST `/api/bookings` (JWT)
- Body:
```json
{
  "showtimeId": "663d...",
  "userId": "663d...",
  "promotionCode": null,
  "totalPrice": 180000,
  "tickets": [
    { "seatNumber": "A1", "price": 90000 },
    { "seatNumber": "A2", "price": 90000 }
  ]
}
```
- Legacy support for `MaSuat`, `MaKH`, `MaUuDai`, `TongTien`, `DanhSachVe`.
- For `KHACHHANG`, `userId` is derived from token.

### GET `/api/bookings/{id}` (JWT)

## Seats

### GET `/api/seats/showtime/{showtimeId}`
- Returns seat list with booking state.

## Reviews

### GET `/api/reviews/movie/{movieId}`

### POST `/api/reviews` (KHACHHANG)
- Body: `movieId`, `rating`, `comment` (Legacy: `MaPhim`, `DiemSo`, `BinhLuan`)

## Service Requests

### POST `/api/service-requests` (KHACHHANG)
- Body: `requestType`, `requestDetail` (Legacy: `LoaiYeuCau`, `ChiTietYeuCau`)

### GET `/api/service-requests` (JWT)
- Customer sees own requests; staff/admin sees all.

### PATCH `/api/service-requests/{id}/status` (ADMIN, NHANVIEN)
- Body: `status` (Legacy: `TrangThai`)
