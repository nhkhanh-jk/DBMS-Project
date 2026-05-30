# Hướng dẫn Cấu trúc Dữ liệu & Nhập liệu (PostgreSQL) — Cinema TNC

Tài liệu này cung cấp hướng dẫn tổng quan về cấu trúc các bảng trong cơ sở dữ liệu **PostgreSQL** của hệ thống rạp phim TNC, định dạng các trường dữ liệu JSONB và cung cấp mẫu dữ liệu mẫu giúp nhóm dễ dàng lấy hoặc tạo dữ liệu (Seeding).

---

## 1. Tổng quan kiến trúc dữ liệu
Hệ thống sử dụng **Sequelize ORM** kết nối **PostgreSQL**:
- **Khóa chính (`id`)** của tất cả các bảng đều sử dụng dạng **UUID** (chuỗi 36 ký tự, ví dụ: `d3b07384-d113-4956-a5cc-48419dd1e231`).
- Các trường chứa mảng hoặc cấu trúc đối tượng phức tạp (`rooms`, `bookedSeats`, `tickets`, `genres`) được lưu dưới dạng cột **JSONB** để tối giản hóa thiết kế và tối ưu truy vấn.

---

## 2. Chi tiết các bảng & Định dạng nhập liệu

### Bảng 1: Phim (`movies`)
Lưu trữ thông tin chi tiết của các bộ phim.
- **`id`**: UUID (Khóa chính, tự sinh)
- **`title`**: Chuỗi (Tên phim, Bắt buộc)
- **`genres`**: **JSONB** (Mảng các chuỗi thể loại, ví dụ: `["Hành động", "Viễn tưởng"]`)
- **`description`**: Văn bản (Mô tả nội dung phim)
- **`durationMin`**: Số nguyên (Thời lượng phim tính bằng phút)
- **`releaseDate`**: Ngày giờ (Ngày khởi chiếu)
- **`status`**: Chuỗi (Trạng thái phim: `ACTIVE` - Đang chiếu, `SCHEDULED` - Sắp chiếu, `SNEAK_SHOW` - Suất chiếu đặc biệt)

**Mẫu dữ liệu JSON chèn vào DB:**
```json
{
  "title": "Quỷ Nhập Tràng 2",
  "genres": ["Kinh Dị", "Giật Gân"],
  "description": "Phim kinh dị tiếp nối câu chuyện rùng rợn phần 1...",
  "durationMin": 126,
  "releaseDate": "2026-06-15T00:00:00.000Z",
  "status": "ACTIVE"
}
```

---

### Bảng 2: Rạp Chiếu (`cinemas`)
Lưu trữ thông tin các chi nhánh rạp phim và danh sách phòng.
- **`id`**: UUID (Khóa chính)
- **`name`**: Chuỗi (Tên rạp, ví dụ: `TNC Vincom Đà Nẵng`)
- **`city`**: Chuỗi (Thành phố, ví dụ: `Đà Nẵng`)
- **`address`**: Chuỗi (Địa chỉ chi tiết)
- **`phone`**: Chuỗi (Số điện thoại liên hệ)
- **`isActive`**: Boolean (Trạng thái hoạt động: `true` / `false`)
- **`rooms`**: **JSONB** (Mảng các phòng chiếu). Mỗi phòng là 1 đối tượng:
  - `roomNumber` (Số phòng - Số nguyên)
  - `capacity` (Sức chứa / Số ghế - Số nguyên)
  - `type` (Loại phòng: `standard`, `vip`, `imax`)

**Mẫu dữ liệu JSON chèn vào DB:**
```json
{
  "name": "TNC Vincom Đà Nẵng",
  "city": "Đà Nẵng",
  "address": "Vincom Plaza, 910A Ngô Quyền, Sơn Trà, Đà Nẵng",
  "phone": "0236 399 9999",
  "isActive": true,
  "rooms": [
    { "roomNumber": 1, "capacity": 120, "type": "standard" },
    { "roomNumber": 2, "capacity": 80, "type": "vip" },
    { "roomNumber": 3, "capacity": 60, "type": "imax" }
  ]
}
```

---

### Bảng 3: Suất Chiếu (`showtimes`)
Lưu trữ các khung giờ chiếu của từng phim tại phòng chiếu cụ thể.
- **`id`**: UUID (Khóa chính)
- **`movieId`**: UUID (Khóa ngoại trỏ đến phim)
- **`cinemaId`**: UUID (Khóa ngoại trỏ đến rạp)
- **`roomId`**: Số nguyên (Mã số phòng, ví dụ: `1` tương ứng `roomNumber` trong Rạp)
- **`startTime`**: Ngày giờ (Thời gian bắt đầu chiếu)
- **`endTime`**: Ngày giờ (Thời gian kết thúc chiếu)
- **`basePrice`**: Số nguyên (Giá vé cơ bản, ví dụ: `90000`)
- **`status`**: Chuỗi (Trạng thái: `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
- **`bookedSeats`**: **JSONB** (Mảng lưu các ghế đã được đặt). Định dạng: `[{"seatNumber": "A3", "status": "BOOKED"}, ...]`

**Mẫu dữ liệu JSON chèn vào DB:**
```json
{
  "movieId": "d3b07384-d113-4956-a5cc-48419dd1e231", 
  "cinemaId": "a1a8c0ef-fa72-4d22-b5e1-5dbbc882772a",
  "roomId": 1,
  "startTime": "2026-05-30T19:00:00.000Z",
  "endTime": "2026-05-30T21:06:00.000Z",
  "basePrice": 90000,
  "status": "ACTIVE",
  "bookedSeats": [
    { "seatNumber": "A3", "status": "BOOKED" },
    { "seatNumber": "A4", "status": "BOOKED" }
  ]
}
```

---

### Bảng 4: Đặt Vé (`bookings`)
Lưu trữ thông tin các giao dịch đặt vé của khách hàng.
- **`id`**: UUID (Khóa chính)
- **`bookingCode`**: Chuỗi (Mã đặt vé tự sinh duy nhất, ví dụ: `BK-L3F8D2`)
- **`userId`**: UUID (Khóa ngoại trỏ đến khách hàng đặt vé)
- **`showtimeId`**: UUID (Khóa ngoại trỏ đến suất chiếu)
- **`staffId`**: UUID (Khóa ngoại trỏ đến nhân viên thực hiện nếu đặt tại quầy)
- **`paymentMethod`**: Chuỗi (Phương thức thanh toán: `cash`, `card`, `momo`)
- **`promotionCode`**: Chuỗi (Mã ưu đãi nếu có)
- **`totalPrice`**: Số nguyên (Tổng số tiền giao dịch)
- **`bookingTime`**: Ngày giờ (Thời gian thanh toán giao dịch)
- **`tickets`**: **JSONB** (Mảng thông tin chi tiết vé đã đặt). Mỗi vé gồm:
  - `seatNumber` (Mã số ghế)
  - `price` (Giá vé)
  - `status` (Trạng thái vé: `CONFIRMED`, `CANCELLED`, `REFUNDED`)

**Mẫu dữ liệu JSON chèn vào DB:**
```json
{
  "bookingCode": "BK-L3F8D2",
  "userId": "b59d80d1-0f72-42da-91ab-cc882772a15c",
  "showtimeId": "e7b07384-e113-4956-a5cc-48419dd1e456",
  "paymentMethod": "momo",
  "promotionCode": "TNCWELCOME",
  "totalPrice": 180000,
  "tickets": [
    { "seatNumber": "A3", "price": 90000, "status": "CONFIRMED" },
    { "seatNumber": "A4", "price": 90000, "status": "CONFIRMED" }
  ]
}
```

---

### Bảng 5: Đánh Giá Phim (`reviews`)
Lưu trữ các đánh giá và nhận xét phim từ người dùng.
- **`id`**: UUID (Khóa chính)
- **`movieId`**: UUID (Khóa ngoại)
- **`userId`**: UUID (Khóa ngoại)
- **`rating`**: Số nguyên (Điểm đánh giá: `1` đến `5` sao)
- **`comment`**: Văn bản (Nội dung nhận xét)
- **`reviewedAt`**: Ngày giờ (Thời gian đánh giá)

---

### Bảng 6: Yêu Cầu Phục Vụ (`service_requests`)
Lưu trữ các phản hồi, hỗ trợ từ khách hàng.
- **`id`**: UUID (Khóa chính)
- **`userId`**: UUID (Khóa ngoại)
- **`requestType`**: Chuỗi (Loại hỗ trợ)
- **`requestDetail`**: Văn bản (Chi tiết yêu cầu)
- **`status`**: Chuỗi (Trạng thái xử lý: `PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`)

---

## 3. Cách thức tạo dữ liệu mẫu (Seeding)
Bạn đó có thể sử dụng các thư viện như **Faker.js** hoặc viết trực tiếp các hàm chèn dữ liệu bằng Sequelize trong Backend. 
Mẫu script seeding nhanh dữ liệu cho bảng `movies` bằng Sequelize:

```javascript
const Movie = require('./src/models/Movie');

async function seedData() {
  await Movie.bulkCreate([
    {
      title: "Thoát Khỏi Tận Thế",
      genres: ["Hành Động", "Phiêu Lưu"],
      description: "Hành trình sinh tồn rực lửa...",
      durationMin: 135,
      releaseDate: new Date(),
      status: "ACTIVE"
    },
    {
      title: "Siêu Trộm Quyết Chiến",
      genres: ["Hài Hước", "Hành Động"],
      description: "Vụ trộm thế kỷ rực rỡ...",
      durationMin: 118,
      releaseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày sau
      status: "SCHEDULED"
    }
  ]);
  console.log("Seeding movies completed!");
}
```
