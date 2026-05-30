# Mock to Backend Mapping

The backend uses English field names in MongoDB. However, the API (via DTO layer) returns both English and legacy Vietnamese fields to maintain compatibility with different frontend versions.

## Field Mapping Table

| Frontend Mock | Legacy Vietnamese API Field | Actual Backend DB Field (English) |
| --- | --- | --- |
| **Movies** | | |
| `id` | `id` | `_id` |
| `title` | `TenPhim` | `title` |
| `genre` | `TheLoai` | `genres` (array) |
| `description` | `MoTa` | `description` |
| `duration` | `ThoiLuong` / `durationMin` | `durationMin` |
| `releaseDate` | `NgayPhatHanh` | `releaseDate` |
| `status` | `TrangThai` | `status` |
| **Showtimes** | | |
| `id` | `MaSuat` | `_id` |
| `movieId` | `MaPhim` | `movieId` |
| `roomId` | `MaPhong` | `roomId` |
| `startTime` | `ThoiGianBatDau` | `startTime` |
| `endTime` | `ThoiGianKetThuc` | `endTime` |
| `status` | `TrangThai` | `status` |
| **Booking** | | |
| `id` | `MaDon` | `_id` |
| `bookingCode` | `MaDatVe` | `bookingCode` |
| `customerId` | `MaKH` | `userId` |
| `staffId` | `MaNV` | `staffId` |
| `showtimeId` | `MaSuat` | `showtimeId` |
| `bookedAt` | `ThoiGianDat` | `bookingTime` |
| `totalPrice` | `TongTien` | `totalPrice` |
| `promotionId` | `MaUuDai` | `promotionCode` |
| `ticket.seatId` | `MaGhe` | `seatNumber` |
| `ticket.price` | `GiaVe` | `price` |
| `ticket.status` | `TrangThai` | `status` |
| **Reviews** | | |
| `id` | `MaDanhGia` | `_id` |
| `movieId` | `MaPhim` | `movieId` |
| `customerId` | `MaKH` | `userId` |
| `rating` | `DiemSo` | `rating` |
| `comment` | `BinhLuan` | `comment` |
| `reviewedAt` | `NgayDanhGia` | `reviewedAt` |
| **Service Requests** | | |
| `id` | `MaYeuCau` | `_id` |
| `customerId` | `MaKH` | `userId` |
| `requestType` | `LoaiYeuCau` | `requestType` |
| `requestDetail` | `ChiTietYeuCau` | `requestDetail` |
| `status` | `TrangThai` | `status` |
