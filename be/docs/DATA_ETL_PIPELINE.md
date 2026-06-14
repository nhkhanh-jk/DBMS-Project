# Báo cáo quá trình xử lý dữ liệu và ETL trong dự án TNC Cinema

## 1. Mục tiêu tài liệu

Tài liệu này mô tả chi tiết cách dữ liệu được tạo, lưu trữ, chuẩn hóa, liên kết và khai thác trong dự án **TNC Cinema**. Nội dung tập trung vào:

- Nguồn dữ liệu của hệ thống.
- Cấu trúc dữ liệu chính và mối liên hệ giữa các bảng.
- Quy trình ETL theo mô hình Bronze - Silver - Gold.
- Cách dữ liệu nghiệp vụ được chuyển thành dữ liệu phân tích và dữ liệu huấn luyện mô hình ML.
- Các điểm cần lưu ý để dữ liệu nhất quán, tránh sai lệch khi vận hành.

Phân tích này dựa trên source code hiện tại trong các thư mục `be`, `fe` và `ml`.

---

## 2. Tổng quan kiến trúc dữ liệu

Dự án sử dụng **PostgreSQL** làm cơ sở dữ liệu chính và truy cập thông qua **Sequelize ORM** ở backend Node.js/Express. Cấu hình kết nối nằm tại `be/src/config/sequelize.js`.

Các model chính nằm trong `be/src/models`:

- `User.js`
- `Movie.js`
- `Cinema.js`
- `Showtime.js`
- `Booking.js`
- `Review.js`
- `ServiceRequest.js`

Tất cả các bảng nghiệp vụ chính sử dụng khóa chính dạng **UUID**. Một số trường có cấu trúc lồng nhau được lưu dưới dạng **JSONB**, ví dụ:

- `movies.genres`: danh sách thể loại phim.
- `cinemas.rooms`: danh sách phòng chiếu của rạp.
- `showtimes.bookedSeats`: danh sách ghế đã được đặt trong suất chiếu.
- `bookings.tickets`: danh sách vé trong một giao dịch đặt vé.

Cách thiết kế này giúp hệ thống linh hoạt khi dữ liệu có dạng danh sách hoặc object con. Tuy nhiên, các trường JSONB cần được xử lý cẩn thận trong ETL vì dữ liệu bên trong không được ràng buộc chặt như bảng quan hệ truyền thống.

---

## 3. Nguồn dữ liệu của hệ thống

### 3.1. Dữ liệu seed

Dữ liệu mẫu được tạo bằng script `be/src/seed/index.js`. Script này thực hiện các bước:

1. Kết nối PostgreSQL.
2. Đồng bộ schema bằng `sequelize.sync({ alter: true })`.
3. Nếu `SEED_RESET=true`, xóa dữ liệu cũ.
4. Tạo users.
5. Tạo movies từ file JSON.
6. Tạo cinemas.
7. Tạo showtimes.
8. Tạo bookings.
9. Tạo reviews.
10. Tạo service requests.

Các nguồn seed chính:

| File | Vai trò | Số lượng/đặc điểm |
|---|---|---|
| `movie_data.json` | Dữ liệu phim gốc | Nhiều phim với title, genres, description, durationMin, releaseDate, status, posterUrl |
| `userFactory.js` | Sinh tài khoản | 1 admin, 8 nhân viên, 300 khách hàng |
| `cinemaSeed.js` | Sinh rạp và phòng | 8 rạp, mỗi rạp 4-7 phòng |
| `showtimeSeed.js` | Sinh suất chiếu | 300 suất chiếu |
| `bookingSeed.js` | Sinh giao dịch đặt vé | 1000 booking |
| `reviewSeed.js` | Sinh đánh giá phim | 500 review |
| `serviceRequestSeed.js` | Sinh yêu cầu hỗ trợ | 200 yêu cầu |

### 3.2. Dữ liệu phát sinh từ API

Ngoài dữ liệu seed, hệ thống còn phát sinh dữ liệu khi người dùng thao tác:

- Đăng ký tài khoản khách hàng qua `/api/auth/register`.
- Đăng nhập và cập nhật hồ sơ qua `/api/auth/login`, `/api/users/profile`.
- Admin/nhân viên tạo hoặc cập nhật phim qua `/api/movies`.
- Admin/nhân viên tạo hoặc cập nhật suất chiếu qua `/api/showtimes`.
- Khách hàng hoặc nhân viên tạo booking qua `/api/bookings`.
- Khách hàng tạo review qua `/api/reviews`.
- Khách hàng gửi yêu cầu hỗ trợ qua `/api/service-requests`.

### 3.3. Dữ liệu phục vụ ML

Module ML trong thư mục `ml` lấy dữ liệu trực tiếp từ PostgreSQL. File `ml/train.py` truy vấn và kết hợp các bảng:

- `showtimes`
- `movies`
- `reviews`
- `bookings`

Dữ liệu sau khi xử lý được dùng để huấn luyện mô hình `RandomForestRegressor`, dự đoán số vé bán được cho một suất chiếu.

---

## 4. Các thực thể dữ liệu chính

### 4.1. Users

Bảng `users` lưu thông tin tài khoản.

Các trường chính:

- `id`: UUID, khóa chính.
- `username`: tên đăng nhập, unique.
- `password`: mật khẩu đã hash bằng bcrypt.
- `role`: vai trò, gồm `ADMIN`, `NHANVIEN`, `KHACHHANG`.
- `fullName`: họ tên.
- `email`: email.
- `phoneNumber`: số điện thoại.
- `rewardPoints`: điểm thưởng.
- `membershipLevel`: hạng thành viên, ví dụ `bronze`, `silver`, `gold`.
- `isActive`: trạng thái tài khoản.

Vai trò trong dữ liệu:

- `ADMIN`: quản trị hệ thống, quản lý user/phim/rạp/nhân viên.
- `NHANVIEN`: nhân viên bán vé, có thể hỗ trợ đặt vé tại quầy.
- `KHACHHANG`: khách hàng đặt vé, đánh giá phim, gửi yêu cầu hỗ trợ.

### 4.2. Movies

Bảng `movies` lưu thông tin phim.

Các trường chính:

- `id`: UUID.
- `title`: tên phim.
- `genres`: JSONB, mảng thể loại.
- `description`: mô tả phim.
- `durationMin`: thời lượng phim theo phút.
- `releaseDate`: ngày phát hành.
- `status`: trạng thái phim.
- `posterUrl`: ảnh poster.

Vai trò trong hệ thống:

- Hiển thị danh sách phim trên frontend.
- Là đầu vào khi tạo suất chiếu.
- Là nguồn feature cho ML: `durationMin`, `genres`, `avg_rating`, `review_count`.

### 4.3. Cinemas

Bảng `cinemas` lưu thông tin rạp.

Các trường chính:

- `id`: UUID.
- `name`: tên rạp.
- `city`: thành phố.
- `address`: địa chỉ.
- `rooms`: JSONB, danh sách phòng chiếu.
- `phone`: số điện thoại.
- `isActive`: trạng thái hoạt động.

Cấu trúc `rooms`:

```json
[
  {
    "roomNumber": 1,
    "capacity": 140,
    "type": "imax"
  },
  {
    "roomNumber": 2,
    "capacity": 110,
    "type": "standard"
  }
]
```

Vai trò trong hệ thống:

- Một rạp có nhiều phòng.
- Một suất chiếu phải thuộc về một rạp cụ thể.
- `cinemas.rooms.roomNumber` được liên kết logic với `showtimes.roomId`.

Lưu ý: `roomId` trong `showtimes` không trỏ đến một bảng `rooms` riêng, mà trỏ đến `roomNumber` nằm trong JSONB `cinemas.rooms`. Vì vậy khi ETL hoặc validate dữ liệu, cần kiểm tra `showtimes.roomId` có tồn tại trong `cinemas.rooms` của rạp tương ứng.

### 4.4. Showtimes

Bảng `showtimes` lưu lịch chiếu.

Các trường chính:

- `id`: UUID.
- `movieId`: UUID của phim.
- `cinemaId`: UUID của rạp.
- `roomId`: số phòng chiếu.
- `startTime`: thời gian bắt đầu.
- `endTime`: thời gian kết thúc.
- `basePrice`: giá vé cơ bản.
- `status`: trạng thái suất chiếu.
- `bookedSeats`: JSONB, danh sách ghế đã đặt.

Cấu trúc `bookedSeats`:

```json
[
  {
    "seatNumber": "A1",
    "status": "BOOKED"
  },
  {
    "seatNumber": "A2",
    "status": "BOOKED"
  }
]
```

Vai trò trong hệ thống:

- Là trung tâm của nghiệp vụ đặt vé.
- Kết nối phim, rạp, phòng và booking.
- Là bảng quan trọng nhất cho phân tích ML vì mỗi dòng tương ứng với một suất chiếu cần dự đoán lượng vé.

### 4.5. Bookings

Bảng `bookings` lưu giao dịch đặt vé.

Các trường chính:

- `id`: UUID.
- `bookingCode`: mã đặt vé, unique.
- `userId`: UUID của khách hàng.
- `showtimeId`: UUID của suất chiếu.
- `staffId`: UUID của nhân viên nếu đặt tại quầy.
- `paymentMethod`: phương thức thanh toán, ví dụ `cash`, `card`, `momo`.
- `promotionCode`: mã khuyến mãi nếu có.
- `totalPrice`: tổng tiền.
- `bookingTime`: thời điểm đặt.
- `tickets`: JSONB, danh sách vé.

Cấu trúc `tickets`:

```json
[
  {
    "seatNumber": "A1",
    "price": 90000,
    "status": "CONFIRMED"
  },
  {
    "seatNumber": "A2",
    "price": 90000,
    "status": "CONFIRMED"
  }
]
```

Vai trò trong hệ thống:

- Là dữ liệu giao dịch thực tế.
- Là nguồn tính doanh thu.
- Là nguồn tính số vé đã bán.
- Là target chính cho bài toán dự đoán số vé.

### 4.6. Reviews

Bảng `reviews` lưu đánh giá phim.

Các trường chính:

- `id`: UUID.
- `movieId`: UUID của phim.
- `userId`: UUID của khách hàng.
- `rating`: điểm đánh giá từ 1 đến 5.
- `comment`: nội dung đánh giá.
- `reviewedAt`: thời điểm đánh giá.

Vai trò trong hệ thống:

- Hiển thị phản hồi của khách hàng.
- Tính `avg_rating` và `review_count` cho phim.
- Cung cấp feature cho mô hình dự đoán.

### 4.7. Service requests

Bảng `service_requests` lưu yêu cầu hỗ trợ.

Các trường chính:

- `id`: UUID.
- `userId`: UUID của khách hàng.
- `requestType`: loại yêu cầu.
- `requestDetail`: nội dung yêu cầu.
- `status`: trạng thái xử lý.

Ví dụ `requestType`:

- `REFUND`
- `CHANGE_TICKET`
- `FOOD_SERVICE`
- `MEMBERSHIP`
- `TECHNICAL_SUPPORT`

Vai trò trong hệ thống:

- Theo dõi hỗ trợ khách hàng.
- Có thể phân tích chất lượng dịch vụ, tỉ lệ hoàn vé, nhu cầu đổi vé hoặc vấn đề kỹ thuật.

---

## 5. Mối liên hệ giữa các dữ liệu

### 5.1. Sơ đồ quan hệ logic

```text
users
  |-- bookings.userId
  |-- reviews.userId
  `-- service_requests.userId

movies
  |-- showtimes.movieId
  `-- reviews.movieId

cinemas
  `-- showtimes.cinemaId
        |
        |-- showtimes.roomId liên kết logic với cinemas.rooms[].roomNumber
        |
        `-- bookings.showtimeId
              |
              `-- bookings.tickets[].seatNumber liên kết logic với showtimes.bookedSeats[].seatNumber
```

### 5.2. Quan hệ User - Booking

Một khách hàng có thể có nhiều booking.

- `users.id` liên kết với `bookings.userId`.
- Nếu booking được tạo bởi nhân viên, `users.id` của nhân viên liên kết với `bookings.staffId`.

Ý nghĩa:

- Truy xuất lịch sử vé của khách hàng.
- Phân biệt booking online và booking tại quầy.
- Phân tích hành vi khách hàng theo membership level, reward points hoặc tần suất mua vé.

### 5.3. Quan hệ Movie - Showtime

Một phim có thể có nhiều suất chiếu.

- `movies.id` liên kết với `showtimes.movieId`.

Ý nghĩa:

- Từ một phim có thể xem các lịch chiếu tương ứng.
- Khi dự đoán vé, thông tin phim như `durationMin`, `genres`, rating được gắn vào từng suất chiếu.
- Khi báo cáo theo phim, booking được tổng hợp thông qua showtime.

Ví dụ luồng tổng hợp:

```text
movies.id
  -> showtimes.movieId
  -> bookings.showtimeId
  -> SUM(bookings.totalPrice), COUNT(tickets)
```

### 5.4. Quan hệ Cinema - Room - Showtime

Một rạp có nhiều phòng. Một suất chiếu diễn ra tại một phòng của một rạp.

- `cinemas.id` liên kết với `showtimes.cinemaId`.
- `showtimes.roomId` liên kết logic với `cinemas.rooms[].roomNumber`.

Ý nghĩa:

- Xác định suất chiếu diễn ra ở rạp nào, phòng nào.
- Tính tỷ lệ lấp đầy theo phòng hoặc theo rạp.
- Kiểm tra sức chứa phòng khi bán vé.

Điểm cần lưu ý:

Hiện tại phòng chiếu không nằm trong bảng riêng mà nằm trong JSONB `cinemas.rooms`. Vì vậy, nếu cần phân tích sâu theo phòng hoặc kiểm soát lịch chiếu chặt hơn, nên cân nhắc tách `rooms` thành bảng riêng.

### 5.5. Quan hệ Showtime - Booking - Seat

Một suất chiếu có nhiều booking. Một booking có nhiều vé. Mỗi vé tương ứng một ghế.

- `showtimes.id` liên kết với `bookings.showtimeId`.
- `bookings.tickets[].seatNumber` phải tương ứng với `showtimes.bookedSeats[].seatNumber`.

Khi tạo booking, `bookingService.createBooking()` thực hiện:

1. Kiểm tra `showtimeId` tồn tại.
2. Không cho đặt nếu suất chiếu có status `COMPLETED` hoặc `CANCELLED`.
3. Chuẩn hóa danh sách vé từ `tickets` hoặc `seats`.
4. Kiểm tra từng vé có `seatNumber` và `price`.
5. Lấy danh sách ghế đã đặt từ `showtime.bookedSeats`.
6. Tìm ghế trùng giữa ghế yêu cầu và ghế đã đặt.
7. Nếu có trùng, trả lỗi conflict.
8. Nếu hợp lệ, tạo booking.
9. Cập nhật thêm ghế mới vào `showtime.bookedSeats`.

Đây là mối liên hệ quan trọng nhất để đảm bảo không bán trùng ghế.

### 5.6. Quan hệ Movie - Review - ML feature

Một phim có nhiều review.

- `movies.id` liên kết với `reviews.movieId`.

Trong `ml/train.py`, dữ liệu review được gom nhóm:

```sql
SELECT "movieId",
       AVG(rating) AS avg_rating,
       COUNT(*) AS review_count
FROM reviews
GROUP BY "movieId"
```

Sau đó join vào dữ liệu suất chiếu. Nhờ vậy, mỗi showtime có thêm:

- `avg_rating`: điểm đánh giá trung bình của phim.
- `review_count`: số lượng đánh giá.

Ý nghĩa:

- Phim có rating cao hoặc nhiều review có thể có nhu cầu xem cao hơn.
- Đây là tín hiệu giúp mô hình dự đoán số vé tốt hơn so với chỉ dùng giờ chiếu và giá vé.

### 5.7. Quan hệ User - ServiceRequest

Một khách hàng có thể tạo nhiều yêu cầu hỗ trợ.

- `users.id` liên kết với `service_requests.userId`.

Ý nghĩa:

- Khách hàng xem yêu cầu của mình.
- Nhân viên/admin xem và cập nhật trạng thái xử lý.
- Có thể phân tích loại vấn đề thường gặp và chất lượng dịch vụ.

---

## 6. Quy trình ETL dữ liệu

ETL trong dự án có thể chia thành ba tầng: **Bronze**, **Silver**, **Gold**.

---

## 7. Bronze layer - dữ liệu thô

Bronze là tầng dữ liệu đầu vào, giữ dữ liệu gần với trạng thái ban đầu.

### 7.1. Nguồn Bronze

Các nguồn Bronze gồm:

- File JSON phim: `be/src/seed/movie_data.json`.
- Dữ liệu sinh bằng Faker: users, cinemas, showtimes, bookings, reviews, service requests.
- Dữ liệu người dùng nhập qua API.

### 7.2. Đặc điểm dữ liệu Bronze

Dữ liệu Bronze có các đặc điểm:

- Có thể đến từ nhiều nguồn khác nhau.
- Có thể dùng field tiếng Anh hoặc field tiếng Việt cũ.
- Một số trường là JSONB, cần parse khi phân tích.
- Một số dữ liệu được sinh ngẫu nhiên nên cần validate trước khi đưa vào tầng nghiệp vụ.

Ví dụ dữ liệu phim thô:

```json
{
  "id": "6c4b87b6-4561-420a-a22a-6c119253696a",
  "title": "Tên phim",
  "genres": ["Phim Kinh Dị", "Phim Gây Cấn"],
  "description": "...",
  "durationMin": 108,
  "releaseDate": "2026-05-13T00:00:00Z",
  "status": "RELEASED",
  "posterUrl": "https://..."
}
```

### 7.3. Rủi ro tại Bronze

- Dữ liệu text có thể lỗi encoding nếu file được lưu sai charset.
- `genres`, `rooms`, `tickets`, `bookedSeats` cần đúng cấu trúc mảng.
- `roomId` có thể không tồn tại trong `cinemas.rooms`.
- Booking có thể tạo ghế trùng nếu không kiểm tra.
- Dữ liệu seed ngẫu nhiên có thể không phản ánh xu hướng kinh doanh thật.

---

## 8. Silver layer - chuẩn hóa, validate và liên kết dữ liệu

Silver là tầng xử lý dữ liệu để đảm bảo dữ liệu hợp lệ, thống nhất và có thể sử dụng ổn định trong API, frontend và ML.

### 8.1. Chuẩn hóa field tiếng Việt và tiếng Anh

File `be/src/utils/legacyNormalizer.js` định nghĩa mapping field tiếng Việt sang field tiếng Anh.

Ví dụ với movie:

| Field tiếng Việt | Field tiếng Anh |
|---|---|
| `TenPhim` | `title` |
| `TheLoai` | `genres` |
| `MoTa` | `description` |
| `ThoiLuong` | `durationMin` |
| `NgayPhatHanh` | `releaseDate` |
| `TrangThai` | `status` |
| `AnhPoster` | `posterUrl` |

Nguyên tắc:

- Nếu request có field tiếng Anh, ưu tiên field tiếng Anh.
- Nếu request chỉ có field tiếng Việt, hệ thống tự chuyển sang field tiếng Anh.
- Service layer luôn xử lý trên field tiếng Anh.

Điều này giúp backend hỗ trợ được cả frontend mới và các tích hợp cũ.

### 8.2. Validate dữ liệu phim

Trong `movieService`:

- `title`, `genres`, `durationMin`, `releaseDate` là bắt buộc.
- `genres` phải là mảng không rỗng.
- Mỗi genre phải là string.
- `durationMin` phải là số nguyên dương.
- `releaseDate` phải parse được thành Date.
- `status` phải thuộc danh sách hợp lệ.

Sau validate, dữ liệu được lưu vào bảng `movies`.

### 8.3. Validate dữ liệu suất chiếu

Trong `showtimeService`:

- `movieId`, `cinemaId`, `roomId`, `startTime`, `endTime` là dữ liệu quan trọng.
- Kiểm tra phim tồn tại.
- Kiểm tra rạp tồn tại.
- `startTime` và `endTime` phải hợp lệ.
- `endTime` phải lớn hơn `startTime`.
- `basePrice` không được âm.
- `status` phải thuộc `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`.

Sau validate, suất chiếu được lưu vào `showtimes`.

### 8.4. Validate dữ liệu booking

Trong `bookingService`:

- Chuẩn hóa payload bằng `normalize(payload, 'booking')`.
- Hỗ trợ hai format:
  - `tickets: [{ seatNumber, price }]`
  - `seats: ["A1", "A2"]`
- Nếu chỉ có `seats`, service tự tạo `tickets` dựa trên `showtime.basePrice`.
- Kiểm tra showtime tồn tại.
- Không cho đặt showtime đã `COMPLETED` hoặc `CANCELLED`.
- Kiểm tra ghế đã được đặt chưa.
- Tính lại `totalPrice` từ danh sách vé, không tin hoàn toàn vào tổng tiền client gửi.
- Tạo `bookingCode`.
- Lưu booking.
- Cập nhật `showtimes.bookedSeats`.

Đây là bước Silver quan trọng vì nó bảo vệ tính nhất quán của dữ liệu giao dịch.

### 8.5. Chuẩn hóa response DTO

Các service trả response gồm cả field tiếng Anh và tiếng Việt.

Ví dụ movie DTO:

```json
{
  "id": "...",
  "title": "Tên phim",
  "genres": ["Phim Hành Động"],
  "durationMin": 120,
  "MaPhim": "...",
  "TenPhim": "Tên phim",
  "TheLoai": ["Phim Hành Động"],
  "ThoiLuong": 120
}
```

Lợi ích:

- Frontend mới dùng field tiếng Anh.
- Tài liệu/bài tập hoặc hệ thống cũ có thể dùng field tiếng Việt.
- Giảm rủi ro mismatch khi chuyển đổi tên trường.

Lưu ý: file `be/src/utils/dtoMappers.js` vẫn còn một số dấu hiệu của kiến trúc cũ dùng `_id`/MongoDB. Trong code service hiện tại, nhiều DTO đã được viết trực tiếp trong từng service và dùng `id` UUID của Sequelize. Khi cập nhật tài liệu hoặc refactor, nên đồng bộ lại `dtoMappers.js` cho đúng PostgreSQL/Sequelize.

---

## 9. Gold layer - dữ liệu phục vụ báo cáo, phân tích và ML

Gold là tầng dữ liệu đã được tổng hợp hoặc biến đổi để phục vụ người dùng cuối, dashboard, báo cáo và mô hình dự đoán.

### 9.1. Gold cho dashboard nghiệp vụ

Các dashboard frontend nằm trong:

- `fe/src/pages/quanly/index.jsx`
- `fe/src/pages/quanly/doanh-thu.jsx`
- `fe/src/pages/quanly/bao-cao-phim.jsx`
- `fe/src/pages/quanly/bao-cao-rap.jsx`

Các chỉ số Gold có thể tính từ dữ liệu thật:

| Chỉ số | Cách tính từ dữ liệu |
|---|---|
| Tổng doanh thu | `SUM(bookings.totalPrice)` |
| Tổng vé bán | Tổng số phần tử trong `bookings.tickets` hoặc tổng `jsonb_array_length(tickets)` |
| Doanh thu theo phim | `movies -> showtimes -> bookings` |
| Doanh thu theo rạp | `cinemas -> showtimes -> bookings` |
| Tỷ lệ lấp đầy | `số ghế đã bán / capacity của phòng` |
| Phim bán chạy | Nhóm theo `movieId`, tính tổng vé |
| Giờ cao điểm | Nhóm theo `hour(startTime)`, tính trung bình vé |
| Ngày cao điểm | Nhóm theo `day_of_week(startTime)`, tính trung bình vé |

### 9.2. Gold cho ML

File `ml/train.py` tạo dataset Gold cho model bằng câu truy vấn:

```sql
SELECT
    s.id                AS showtime_id,
    s."startTime"       AS start_time,
    s."basePrice"       AS base_price,
    s."bookedSeats"     AS booked_seats_json,
    s.status            AS showtime_status,
    m."durationMin"     AS duration_min,
    m.genres            AS genres_json,
    COALESCE(r.avg_rating, 0)   AS avg_rating,
    COALESCE(r.review_count, 0) AS review_count,
    COALESCE(b.ticket_count, 0) AS actual_ticket_count
FROM showtimes s
JOIN movies m ON s."movieId" = m.id
LEFT JOIN (
    SELECT "movieId",
           AVG(rating) AS avg_rating,
           COUNT(*) AS review_count
    FROM reviews
    GROUP BY "movieId"
) r ON r."movieId" = m.id
LEFT JOIN (
    SELECT "showtimeId",
           SUM(jsonb_array_length(tickets)) AS ticket_count
    FROM bookings
    GROUP BY "showtimeId"
) b ON b."showtimeId" = s.id
ORDER BY s."startTime"
```

Dataset sau truy vấn có mỗi dòng là một suất chiếu. Đây là cách thiết kế đúng cho bài toán dự đoán số vé theo suất chiếu.

---

## 10. Feature engineering cho ML

Trong `ml/train.py`, hàm `engineer_features()` biến đổi dữ liệu Gold thành feature cho mô hình.

### 10.1. Target: booked_count

Target của mô hình là `booked_count`.

Quy tắc:

1. Ưu tiên lấy từ `actual_ticket_count`, tức số vé trong bảng `bookings`.
2. Nếu `actual_ticket_count = 0`, fallback sang số ghế có status `BOOKED` trong `showtimes.bookedSeats`.

Lý do:

- `bookings` là dữ liệu giao dịch chuẩn hơn vì có mã đơn, tổng tiền, vé và phương thức thanh toán.
- `bookedSeats` vẫn hữu ích khi cần phản ánh ghế đã bán nhưng thiếu booking tương ứng.

### 10.2. Feature thời gian

Từ `start_time`, hệ thống tạo:

- `day_of_week`: thứ trong tuần, 0 là thứ 2, 6 là chủ nhật.
- `hour_of_day`: giờ chiếu.
- `is_weekend`: 1 nếu là thứ 7/chủ nhật.
- `is_evening`: 1 nếu giờ chiếu từ 17h trở đi.
- `is_morning`: 1 nếu giờ chiếu trước hoặc bằng 11h.
- `month`: tháng chiếu.

Ý nghĩa:

- Khán giả thường đi xem phim nhiều hơn vào cuối tuần.
- Suất tối thường có nhu cầu cao hơn suất sáng.
- Một số tháng có thể có nhu cầu cao do kỳ nghỉ, mùa lễ hoặc lịch phát hành phim lớn.

### 10.3. Feature giá vé

Từ `base_price`, hệ thống tạo:

- `base_price`: giá gốc.
- `price_tier`: phân tầng giá:
  - dưới 60.000: tier 0
  - 60.000 đến dưới 80.000: tier 1
  - 80.000 đến dưới 100.000: tier 2
  - từ 100.000 trở lên: tier 3

Ý nghĩa:

- Giá vé ảnh hưởng đến nhu cầu.
- Phân tầng giúp mô hình học quan hệ phi tuyến giữa giá và số vé.

### 10.4. Feature phim

Từ bảng `movies` và `reviews`, hệ thống tạo:

- `duration_min`: thời lượng phim.
- `avg_rating`: rating trung bình.
- `review_count`: số lượng review.

Ý nghĩa:

- Phim dài/ngắn có thể ảnh hưởng đến lựa chọn suất chiếu.
- Rating cao có thể làm tăng nhu cầu.
- Review count phản ánh mức độ quan tâm của khán giả.

### 10.5. Feature thể loại

Trường `genres_json` được parse thành danh sách thể loại, sau đó one-hot encoding thành các cột:

```text
genre_phim_hành_động
genre_phim_kinh_dị
genre_phim_hài
...
```

Trong `feature_config.json`, hệ thống lưu:

- `feature_cols`: thứ tự các feature dùng khi train/predict.
- `genre_values`: danh sách thể loại đã thấy khi train.
- `model_type`: `RandomForestRegressor`.
- `version`: version model.

Điều này rất quan trọng vì khi predict, input mới phải được biến đổi thành đúng thứ tự cột như lúc train.

---

## 11. Luồng dữ liệu từ thao tác người dùng đến báo cáo

### 11.1. Luồng đặt vé

```text
Customer/Staff chọn suất chiếu và ghế
  -> POST /api/bookings
  -> bookingService.validate()
  -> tạo bookings record
  -> cập nhật showtimes.bookedSeats
  -> frontend /vecuatoi hiển thị vé
  -> analytics/ML dùng bookings và bookedSeats để tính số vé bán
```

Điểm cần nhất quán:

- Ghế trong `bookings.tickets` phải xuất hiện trong `showtimes.bookedSeats`.
- `totalPrice` phải bằng tổng `tickets.price`.
- `showtimeId` phải tồn tại.
- `userId` phải là khách hàng hợp lệ.
- `staffId` chỉ có khi nhân viên/admin tạo booking.

### 11.2. Luồng tạo suất chiếu

```text
Admin/Nhân viên tạo suất chiếu
  -> POST /api/showtimes
  -> kiểm tra movieId tồn tại
  -> kiểm tra cinemaId tồn tại
  -> kiểm tra thời gian hợp lệ
  -> lưu showtimes
  -> suất chiếu xuất hiện ở frontend và có thể đặt vé
```

Điểm cần nhất quán:

- `endTime` nên được tính từ `startTime + movie.durationMin`.
- `roomId` nên tồn tại trong `cinemas.rooms`.
- Không nên để hai suất chiếu trùng phòng và trùng thời gian.

Hiện tại code có kiểm tra thời gian bắt đầu/kết thúc, nhưng chưa thấy logic chống trùng lịch phòng. Đây là điểm nên bổ sung.

### 11.3. Luồng đánh giá phim

```text
Customer gửi review
  -> POST /api/reviews
  -> lưu reviews
  -> ML query tính avg_rating và review_count
  -> model dùng rating/review_count làm feature
```

Điểm cần nhất quán:

- `rating` phải từ 1 đến 5.
- `movieId` phải tồn tại.
- `userId` phải là khách hàng hợp lệ.

### 11.4. Luồng phân tích doanh thu

```text
bookings
  -> group by showtimeId
  -> join showtimes
  -> join movies/cinemas
  -> tính doanh thu theo phim/rạp/ngày/giờ
  -> dashboard quản lý
```

Các phép tổng hợp quan trọng:

- Doanh thu: `SUM(totalPrice)`.
- Vé bán: tổng số vé trong `tickets`.
- Vé theo phim: join `bookings.showtimeId = showtimes.id`, sau đó group by `showtimes.movieId`.
- Vé theo rạp: join `showtimes.cinemaId`.
- Tỷ lệ lấp đầy: `số ghế đã bán / capacity`.

---

## 12. Luồng dữ liệu cho API dự đoán

### 12.1. Train model

```text
PostgreSQL
  -> ml/train.py load_data()
  -> engineer_features()
  -> train RandomForestRegressor
  -> save model.pkl
  -> save feature_config.json
```

Kết quả:

- `ml/model.pkl`: model đã train.
- `ml/feature_config.json`: cấu hình feature.

### 12.2. Predict

```text
Admin/Nhân viên gửi request
  -> POST /api/ml/predict
  -> backend Express proxy sang FastAPI /predict
  -> FastAPI build_feature_vector()
  -> model.predict()
  -> trả predicted_tickets, confidence_range, advice
```

Input cần có:

- `start_time`
- `base_price`
- `duration_min`
- `genres`
- `avg_rating`
- `review_count`

Output:

- `predicted_tickets`: số vé dự đoán.
- `confidence_range`: khoảng dao động dựa trên độ lệch giữa các cây trong Random Forest.
- `features_used`: feature đã dùng.
- `advice`: khuyến nghị vận hành.

---

## 13. Các ràng buộc dữ liệu nên đảm bảo

### 13.1. Ràng buộc định danh

- `movies.id` phải tồn tại trước khi tạo `showtimes.movieId`.
- `cinemas.id` phải tồn tại trước khi tạo `showtimes.cinemaId`.
- `showtimes.id` phải tồn tại trước khi tạo `bookings.showtimeId`.
- `users.id` phải tồn tại trước khi tạo `bookings.userId`, `reviews.userId`, `service_requests.userId`.

### 13.2. Ràng buộc thời gian

- `showtimes.endTime > showtimes.startTime`.
- `showtimes.startTime` không nên nằm trong quá khứ khi tạo suất chiếu mới.
- Không nên có hai suất chiếu cùng `cinemaId`, `roomId` bị overlap thời gian.
- `bookingTime` nên nhỏ hơn `showtimes.startTime` trong booking online thông thường.

### 13.3. Ràng buộc ghế

- Một ghế chỉ được bán một lần trong cùng một suất chiếu.
- Mỗi `tickets[].seatNumber` phải được thêm vào `showtimes.bookedSeats`.
- Không nên có ghế trong `bookedSeats` nhưng không có booking tương ứng, trừ trường hợp migrate dữ liệu hoặc dữ liệu cũ.
- Số ghế bán không được vượt quá `capacity` của phòng.

### 13.4. Ràng buộc tiền

- `bookings.totalPrice = SUM(bookings.tickets[].price)`.
- `tickets[].price` nên dựa trên `showtimes.basePrice` cộng phụ phí nếu có.
- `promotionCode` nếu có nên được validate bằng bảng khuyến mãi riêng trong tương lai.

### 13.5. Ràng buộc trạng thái

Movie status nên thống nhất, ví dụ:

- `SCHEDULED`
- `RELEASED`
- `COMING_SOON`
- `END_OF_SHOW`
- `ACTIVE`
- `SNEAK_SHOW`

Showtime status:

- `SCHEDULED`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`

Ticket status:

- `CONFIRMED`
- `CANCELLED`
- `REFUNDED`

Service request status:

- `PENDING`
- `IN_PROGRESS`
- `RESOLVED`
- `REJECTED`

Nên tránh dùng nhiều biến thể trạng thái cùng nghĩa, vì sẽ gây khó khăn khi lọc dữ liệu và phân tích.

---

## 14. Đề xuất cải thiện ETL và mô hình dữ liệu

### 14.1. Tách bảng Rooms

Hiện `rooms` đang nằm trong JSONB của `cinemas`. Thiết kế này đơn giản cho demo nhưng hạn chế khi:

- Cần kiểm tra trùng lịch phòng.
- Cần tính tỷ lệ lấp đầy chính xác theo phòng.
- Cần bảo trì phòng.
- Cần quản lý loại ghế theo phòng.

Đề xuất tạo bảng `rooms`:

```text
rooms
  id
  cinemaId
  roomNumber
  capacity
  type
  seatMap
  isActive
```

Khi đó `showtimes.roomId` nên trỏ đến `rooms.id` thay vì `roomNumber`.

### 14.2. Tách bảng Seats hoặc SeatMap

Hiện ghế được sinh logic trong `SeatService` và lưu ghế đã bán trong `bookedSeats`. Để quản lý tốt hơn, có thể bổ sung:

```text
seat_maps
  id
  roomId
  seatNumber
  seatType
  baseSurcharge
  isActive
```

Lợi ích:

- Hỗ trợ phòng có sơ đồ ghế khác nhau.
- Tính giá chính xác theo loại ghế.
- Không phải hard-code sơ đồ ghế 10x10 hoặc 15x20.

### 14.3. Tạo bảng Promotions

Hiện `promotionCode` chỉ là string trong booking. Nên có bảng:

```text
promotions
  id
  code
  discountType
  discountValue
  startDate
  endDate
  usageLimit
  isActive
```

Lợi ích:

- Validate mã giảm giá.
- Phân tích hiệu quả chiến dịch khuyến mãi.
- Tạo thêm feature cho ML.

### 14.4. Tạo bảng PaymentTransactions

Hiện thanh toán được lưu đơn giản trong `bookings.paymentMethod`. Nếu tích hợp thanh toán thật, nên tách:

```text
payment_transactions
  id
  bookingId
  provider
  amount
  status
  transactionCode
  paidAt
```

Lợi ích:

- Theo dõi thanh toán thành công/thất bại.
- Đối soát giao dịch.
- Hỗ trợ hoàn tiền.

### 14.5. Tạo data mart cho báo cáo

Khi dữ liệu lớn, không nên tính dashboard trực tiếp từ bảng giao dịch mỗi lần request. Có thể tạo bảng tổng hợp:

```text
daily_revenue_summary
  date
  cinemaId
  movieId
  totalTickets
  totalRevenue
  avgOccupancy
```

Lợi ích:

- Dashboard nhanh hơn.
- Tránh truy vấn JSONB nặng nhiều lần.
- Dễ export báo cáo.

---

## 15. Kết luận

Quy trình xử lý dữ liệu trong dự án TNC Cinema đã có nền tảng tương đối rõ:

- Dữ liệu thô được tạo từ JSON và seed script.
- Dữ liệu nghiệp vụ được lưu trong PostgreSQL bằng Sequelize.
- Service layer thực hiện chuẩn hóa, validate và bảo vệ tính nhất quán.
- Booking là trung tâm của dữ liệu doanh thu và số vé bán.
- Showtime là trung tâm liên kết phim, rạp, phòng và giao dịch.
- Review bổ sung tín hiệu chất lượng phim cho mô hình ML.
- Pipeline ML đã chuyển dữ liệu nghiệp vụ thành feature phục vụ dự đoán số vé.

Mối liên hệ quan trọng nhất cần giữ nhất quán là:

```text
Movie -> Showtime -> Booking -> Tickets
Cinema -> Room -> Showtime
User -> Booking / Review / ServiceRequest
Review -> Movie -> ML features
```

Nếu các quan hệ này được đảm bảo, hệ thống có thể phục vụ tốt các chức năng đặt vé, quản lý rạp, báo cáo doanh thu và dự đoán lượng khách. Trong các giai đoạn tiếp theo, nên ưu tiên chuẩn hóa thêm bảng `rooms`, `seats`, `promotions`, `payment_transactions` và xây dựng data mart cho dashboard để hệ thống đủ vững khi chuyển từ demo sang vận hành thực tế.
