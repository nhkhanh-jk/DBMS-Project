# PLAN.md — Kế hoạch chuyển đổi Cinema Management System: Python/Flask → MERN Stack

## 1. Tổng quan dự án

**Nguồn:** Python 3.12 + Flask + MongoDB Atlas + Redis + Celery + JWT  
**Đích:** Node.js + Express + MongoDB Atlas + Redis + BullMQ + JWT  
**Nguyên tắc bất biến:** Toàn bộ API contract (URL, method, request body, response shape) phải giữ nguyên 100% so với bản gốc Python.

---

## 2. Ánh xạ công nghệ (Tech Stack Mapping)

| Thành phần | Python (cũ) | MERN Node.js (mới) |
|---|---|---|
| Runtime | Python 3.12 | Node.js 20 LTS |
| Web Framework | Flask | Express.js |
| ODM / DB Driver | PyMongo trực tiếp | Mongoose |
| Caching | redis-py | ioredis |
| Background Jobs | Celery + Celery Beat | BullMQ + BullMQ Scheduler |
| Auth | PyJWT + bcrypt | jsonwebtoken + bcryptjs |
| Email | Celery task (SMTP) | BullMQ worker (Nodemailer) |
| Container | Docker Compose | Docker Compose (giữ nguyên) |
| Testing | pytest | Jest + Supertest |

> **Frontend (React):** Không nằm trong scope tài liệu này. Backend cung cấp API hoàn toàn độc lập.

---

## 3. Cấu trúc thư mục đích

```
cinema-backend-mern/
├── src/
│   ├── app.js                  # Express app factory
│   ├── server.js               # Entry point
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   ├── redis.js            # Redis client
│   │   └── env.js              # Biến môi trường
│   ├── models/                 # Mongoose schemas (1-1 với DB schema gốc)
│   │   ├── User.js
│   │   ├── Cinema.js
│   │   ├── Movie.js
│   │   ├── Showtime.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │   └── ServiceRequest.js
│   ├── repositories/           # Thao tác DB thuần túy
│   │   ├── userRepository.js
│   │   ├── movieRepository.js
│   │   ├── showtimeRepository.js
│   │   ├── bookingRepository.js
│   │   ├── reviewRepository.js
│   │   └── serviceRequestRepository.js
│   ├── services/               # Business logic + legacy key normalization
│   │   ├── authService.js
│   │   ├── movieService.js
│   │   ├── showtimeService.js
│   │   ├── bookingService.js
│   │   ├── seatService.js
│   │   ├── reviewService.js
│   │   └── serviceRequestService.js
│   ├── routes/                 # Express routers
│   │   ├── auth.js
│   │   ├── movies.js
│   │   ├── showtimes.js
│   │   ├── bookings.js
│   │   ├── seats.js
│   │   ├── reviews.js
│   │   └── serviceRequests.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verify + RBAC
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── dtoMappers.js       # Hybrid EN+VI response (port từ dto_mappers.py)
│   │   ├── legacyNormalizer.js # Chuẩn hoá key VI → EN
│   │   └── validators.js
│   ├── cache/
│   │   └── redisClient.js
│   └── workers/
│       ├── queue.js            # BullMQ queue definitions
│       ├── emailWorker.js      # Gửi email xác nhận booking
│       ├── pointsWorker.js     # Tính điểm tích lũy
│       └── showtimeScheduler.js# Cập nhật trạng thái suất chiếu tự động
├── tests/
│   ├── auth.test.js
│   ├── movies.test.js
│   ├── showtimes.test.js
│   ├── bookings.test.js
│   └── ...
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .env.example
└── CLAUDE.md
```

---

## 4. Các giai đoạn thực hiện

### Giai đoạn 1 — Nền tảng & Cấu hình (Foundation)

**Mục tiêu:** Server Express chạy được, kết nối DB và Redis thành công.

- [ ] Khởi tạo project Node.js, cài dependencies
- [ ] Cấu hình Express app factory (`app.js`) với middleware cơ bản (cors, helmet, express.json)
- [ ] Kết nối MongoDB Atlas qua Mongoose (`config/db.js`)
- [ ] Kết nối Redis (`config/redis.js`, `cache/redisClient.js`)
- [ ] Cấu hình biến môi trường (`config/env.js`, `.env.example`)
- [ ] Thiết lập Docker Compose (Node app + Redis, giữ MongoDB Atlas external)
- [ ] Error handler middleware trả về đúng format `{ "error": "...", "code": ... }`

**Deliverable:** `GET /api/health` trả về 200.

---

### Giai đoạn 2 — Models & Repositories

**Mục tiêu:** Mongoose schemas khớp 1-1 với DB schema gốc (camelCase tiếng Anh).

**Models cần tạo** (field names phải giống hệt Python schema):

| Model | Key fields |
|---|---|
| `User` | `username`, `password`, `role`, `fullName`, `dateOfBirth`, `gender`, `email`, `phoneNumber`, `rewardPoints`, `membershipLevel` |
| `Cinema` | `name`, `city`, `address`, `rooms` |
| `Movie` | `title`, `genres`, `description`, `durationMin`, `releaseDate`, `status` |
| `Showtime` | `movieId`, `cinemaId`, `roomId`, `startTime`, `endTime`, `basePrice`, `status`, `bookedSeats` |
| `Booking` | `bookingCode`, `userId`, `staffId`, `showtimeId`, `bookingTime`, `paymentMethod`, `promotionCode`, `totalPrice`, `tickets` |
| `Review` | `movieId`, `userId`, `rating`, `comment`, `reviewedAt` |
| `ServiceRequest` | `userId`, `requestType`, `requestDetail`, `status` |

- [ ] Tạo tất cả Mongoose schemas
- [ ] Tạo repositories (CRUD thuần, không có logic)

---

### Giai đoạn 3 — Compatibility Layer (QUAN TRỌNG NHẤT)

**Mục tiêu:** Port chính xác `dto_mappers.py` và `legacyNormalizer` sang JavaScript.

#### 3a. Legacy Key Normalizer (`utils/legacyNormalizer.js`)

Map request body từ tiếng Việt → tiếng Anh trước khi vào service:

```js
// Ví dụ mapping
const MOVIE_VI_TO_EN = {
  TenPhim: 'title',
  TheLoai: 'genres',
  MoTa: 'description',
  ThoiLuong: 'durationMin',
  NgayPhatHanh: 'releaseDate',
  TrangThai: 'status',
};

const SHOWTIME_VI_TO_EN = {
  MaPhim: 'movieId',
  MaPhong: 'roomId',
  ThoiGianBatDau: 'startTime',
  ThoiGianKetThuc: 'endTime',
  TrangThai: 'status',
};

const BOOKING_VI_TO_EN = {
  MaSuat: 'showtimeId',
  MaKH: 'userId',
  MaUuDai: 'promotionCode',
  TongTien: 'totalPrice',
  DanhSachVe: 'tickets',
};

const USER_VI_TO_EN = {
  TenDangNhap: 'username',
  MatKhau: 'password',
  HoTen: 'fullName',
  Email: 'email',
  SoDienThoai: 'phoneNumber',
  MaRap: 'cinemaId',
  ChucVu: 'role',
};

const SERVICE_REQUEST_VI_TO_EN = {
  LoaiYeuCau: 'requestType',
  ChiTietYeuCau: 'requestDetail',
  TrangThai: 'status',
};

const REVIEW_VI_TO_EN = {
  MaPhim: 'movieId',
  DiemSo: 'rating',
  BinhLuan: 'comment',
};
```

Hàm normalize: merge EN key vào object, ưu tiên EN nếu cả hai tồn tại.

#### 3b. DTO Mappers (`utils/dtoMappers.js`)

Response phải chứa **đồng thời** cả key EN và VI:

```js
// Ví dụ Movie DTO
function mapMovieDTO(movie) {
  return {
    // English keys
    id: movie._id,
    title: movie.title,
    genres: movie.genres,
    description: movie.description,
    durationMin: movie.durationMin,
    releaseDate: movie.releaseDate,
    status: movie.status,
    // Vietnamese legacy keys
    MaPhim: movie._id,
    TenPhim: movie.title,
    TheLoai: movie.genres,
    MoTa: movie.description,
    ThoiLuong: movie.durationMin,
    NgayPhatHanh: movie.releaseDate,
    TrangThai: movie.status,
  };
}
```

Tương tự cho User, Showtime (bao gồm `movieTitle`/`TenPhim`, `roomName`/`TenPhong`), Booking, Review, ServiceRequest.

- [ ] Implement toàn bộ normalizers
- [ ] Implement toàn bộ DTO mappers
- [ ] Unit test mappers với cả EN và VI input

---

### Giai đoạn 4 — Authentication & Middleware

- [ ] `POST /api/auth/register` — tạo KHACHHANG
- [ ] `POST /api/auth/register-employee` — tạo NHANVIEN (ADMIN only)
- [ ] `POST /api/auth/login` — trả về `{ accessToken, profile }`
- [ ] `GET /api/auth/profile` — JWT required
- [ ] Middleware `auth.js`: verify JWT, đính `req.user`, kiểm tra role
- [ ] RBAC: `requireRole('ADMIN')`, `requireRole('ADMIN', 'NHANVIEN')`

---

### Giai đoạn 5 — Các API Endpoint

Implement theo thứ tự phụ thuộc:

#### 5a. Movies
- [ ] `GET /api/movies?status=...` — Redis cache
- [ ] `GET /api/movies/:id`
- [ ] `POST /api/movies` (ADMIN, NHANVIEN)
- [ ] `PATCH /api/movies/:id` (ADMIN, NHANVIEN)

#### 5b. Showtimes
- [ ] `GET /api/showtimes?movieId=` — Redis cache (khi không có filter)
- [ ] `GET /api/showtimes/:id` — populate `movieTitle`, `roomName`
- [ ] `POST /api/showtimes` (ADMIN, NHANVIEN)
- [ ] `PATCH /api/showtimes/:id` (ADMIN, NHANVIEN)

#### 5c. Seats
- [ ] `GET /api/seats/showtime/:showtimeId` — trả về seat list + booking state

#### 5d. Bookings
- [ ] `POST /api/bookings` (JWT) — với logic KHACHHANG override userId từ token
- [ ] `GET /api/bookings/:id` (JWT)

#### 5e. Reviews
- [ ] `GET /api/reviews/movie/:movieId`
- [ ] `POST /api/reviews` (KHACHHANG)

#### 5f. Service Requests
- [ ] `POST /api/service-requests` (KHACHHANG)
- [ ] `GET /api/service-requests` (JWT) — phân quyền theo role
- [ ] `PATCH /api/service-requests/:id/status` (ADMIN, NHANVIEN)

---

### Giai đoạn 6 — Background Workers (BullMQ)

Thay thế Celery tasks:

| Task gốc (Celery) | Worker mới (BullMQ) |
|---|---|
| Gửi email xác nhận booking | `emailWorker.js` — trigger khi booking thành công |
| Tính điểm tích lũy (rewardPoints) | `pointsWorker.js` — trigger sau booking |
| Cập nhật trạng thái suất chiếu | `showtimeScheduler.js` — BullMQ repeatable job (thay Celery Beat) |

- [ ] Định nghĩa queues trong `workers/queue.js`
- [ ] Implement từng worker
- [ ] Cấu hình repeatable job cho showtime scheduler

---

### Giai đoạn 7 — Testing & Validation

- [ ] Integration tests cho toàn bộ endpoints (Jest + Supertest)
- [ ] Test với cả EN key và VI key trong request body
- [ ] Verify response luôn chứa cả hai bộ key
- [ ] Test Redis cache hit/miss
- [ ] Test RBAC (đúng role / sai role / không có token)
- [ ] So sánh response shape với bản Python gốc (snapshot test)

---

### Giai đoạn 8 — Docker & Deployment

- [ ] Viết `Dockerfile` cho Node.js app
- [ ] Cập nhật `docker-compose.yml` (thay Flask service bằng Node service)
- [ ] Giữ nguyên Redis service
- [ ] Health check endpoint
- [ ] Environment variables documented trong `.env.example`

---

## 5. Rủi ro & Biện pháp xử lý

| Rủi ro | Mức độ | Biện pháp |
|---|---|---|
| DTO response thiếu key VI hoặc EN | Cao | Unit test từng mapper, snapshot test |
| Legacy VI key trong request không được nhận | Cao | Test cả hai bộ key ở mọi endpoint |
| Redis cache invalidation không đúng | Trung bình | Test cache sau write operations |
| BullMQ scheduler lệch Celery Beat | Trung bình | Verify cron expression và timezone |
| `userId` override cho KHACHHANG không đúng | Cao | Test riêng case KHACHHANG vs ADMIN |

---

## 6. Thứ tự đọc code gốc (khi source được cung cấp)

Khi có thể đọc repo Python, agent đọc theo thứ tự:

1. `utils/dto_mappers.py` — **ưu tiên cao nhất**, đây là nguồn sự thật của response shape
2. `services/` — logic chuẩn hoá key và business rules
3. `repositories/` — query patterns cần port
4. `middleware/auth.py` — JWT và RBAC implementation
5. `cache/redis_client.py` — cache keys và TTL
6. `workers/tasks.py` — Celery task definitions
7. `models/` — confirm field names (đã có trong architecture.md)
8. `routes/` — confirm URL patterns (đã có trong api.md)
