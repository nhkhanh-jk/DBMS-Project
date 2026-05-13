# CLAUDE.md — Hướng dẫn cho Agent: Migration Cinema System sang MERN

## Vai trò của bạn

Bạn là agent thực hiện chuyển đổi backend Cinema Management System từ Python/Flask sang Node.js/Express. Đọc file này **trước mọi hành động**.

---

## Quy tắc bất biến (KHÔNG được vi phạm)

### 1. API Contract phải giữ nguyên 100%

Mọi endpoint trong `docs/api.md` phải hoạt động **giống hệt** bản Python:
- URL paths không đổi (ví dụ: `/api/auth/register`, `/api/movies/{id}`)
- HTTP methods không đổi
- Request body fields không đổi (cả EN lẫn VI đều phải được chấp nhận)
- Response JSON shape không đổi — kể cả tên key, kiểu dữ liệu, cấu trúc lồng nhau

**Không được thêm, đổi tên, hay bỏ bất kỳ field nào trong response mà không có chỉ thị rõ ràng.**

### 2. Hybrid Compatibility Layer là bắt buộc

Mọi endpoint phải:
- **Nhận** request body với cả English key (chuẩn) và Vietnamese key (legacy)
- **Trả về** response chứa đồng thời cả hai bộ key

Đây là tính năng cốt lõi, không phải optional.

### 3. Database schema không được thay đổi

MongoDB collections và field names phải giữ nguyên 100% như định nghĩa trong `architecture.md`:
- `users`, `cinemas`, `movies`, `showtimes`, `bookings`, `reviews`, `service_requests`
- Tất cả field dùng **camelCase tiếng Anh** (ví dụ: `fullName`, `durationMin`, `startTime`)

---

## Kiến trúc & Luồng xử lý

```
Request → Route → Middleware (Auth/RBAC) → Service → Repository → MongoDB
                                         ↓
                              legacyNormalizer (VI key → EN key)
                                         ↓
                              Business Logic
                                         ↓
                              dtoMapper (EN + VI → Response)
                                         ↓
Response ←─────────────────────────────────────────────────────
```

### Phân công trách nhiệm

| Layer | File | Trách nhiệm |
|---|---|---|
| Route | `routes/*.js` | Parse URL params, gọi service, trả response |
| Middleware | `middleware/auth.js` | Verify JWT, đính `req.user`, kiểm tra role |
| Service | `services/*.js` | Gọi `legacyNormalizer`, chạy business logic, gọi repository, gọi `dtoMapper` |
| Repository | `repositories/*.js` | Chỉ thao tác Mongoose — không có logic |
| Utils | `utils/legacyNormalizer.js` | Chuẩn hoá key VI → EN |
| Utils | `utils/dtoMappers.js` | Build response object với cả hai bộ key |
| Cache | `cache/redisClient.js` | Get/set cache, invalidate |

---

## Hướng dẫn implement từng thành phần

### Legacy Key Normalizer

```js
// utils/legacyNormalizer.js

const MAPS = {
  movie: { TenPhim:'title', TheLoai:'genres', MoTa:'description',
           ThoiLuong:'durationMin', NgayPhatHanh:'releaseDate', TrangThai:'status' },
  showtime: { MaPhim:'movieId', MaPhong:'roomId', ThoiGianBatDau:'startTime',
              ThoiGianKetThuc:'endTime', TrangThai:'status' },
  booking: { MaSuat:'showtimeId', MaKH:'userId', MaUuDai:'promotionCode',
             TongTien:'totalPrice', DanhSachVe:'tickets' },
  user: { TenDangNhap:'username', MatKhau:'password', HoTen:'fullName',
          Email:'email', SoDienThoai:'phoneNumber', MaRap:'cinemaId', ChucVu:'role' },
  serviceRequest: { LoaiYeuCau:'requestType', ChiTietYeuCau:'requestDetail', TrangThai:'status' },
  review: { MaPhim:'movieId', DiemSo:'rating', BinhLuan:'comment' },
};

// Merge VI keys vào object, EN key có độ ưu tiên cao hơn
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
```

### DTO Mappers

```js
// utils/dtoMappers.js — Mỗi mapper PHẢI trả về cả EN + VI key

function mapMovieDTO(movie) {
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

function mapShowtimeDTO(showtime, movieTitle, roomName) {
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

// Implement tương tự cho: mapUserDTO, mapBookingDTO, mapReviewDTO, mapServiceRequestDTO
```

### Error Response Format

Luôn dùng format này, không được thay đổi:

```js
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {
  const code = err.status || err.code || 500;
  res.status(code).json({ error: err.message || 'Internal server error', code });
}

// Trong route/service, throw error có property .status:
const err = new Error('Không tìm thấy phim');
err.status = 404;
throw err;
```

### Redis Caching

Cache các list endpoint theo đúng pattern gốc:

```js
// cache/redisClient.js
const CACHE_KEYS = {
  MOVIES_ALL: 'movies:all',
  MOVIES_BY_STATUS: (status) => `movies:status:${status}`,
  SHOWTIMES_ALL: 'showtimes:all',
};

const CACHE_TTL = {
  MOVIES: 300,      // 5 phút
  SHOWTIMES: 120,   // 2 phút
};
```

Invalidate cache khi có write (POST, PATCH) trên movies hoặc showtimes.

### JWT & RBAC

```js
// middleware/auth.js
const roles = { ADMIN: 'ADMIN', NHANVIEN: 'NHANVIEN', KHACHHANG: 'KHACHHANG' };

function requireAuth(req, res, next) {
  // Verify JWT, đính req.user = { id, role, username }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Forbidden', code: 403 });
    }
    next();
  };
}
```

**Lưu ý đặc biệt — Booking:**
Khi role là `KHACHHANG`, bỏ qua `userId` trong request body và lấy từ `req.user.id`.
Khi role là `ADMIN` hoặc `NHANVIEN`, cho phép chỉ định `userId` tùy ý.

### BullMQ Workers

```js
// workers/queue.js
const { Queue } = require('bullmq');
const connection = require('../config/redis');

const emailQueue = new Queue('email', { connection });
const pointsQueue = new Queue('points', { connection });
const showtimeQueue = new Queue('showtime-status', { connection });
```

Trigger trong service sau khi booking thành công:
```js
await emailQueue.add('booking-confirmation', { bookingId, userId });
await pointsQueue.add('calculate-points', { userId, totalPrice });
```

Scheduler cho showtime (thay Celery Beat):
```js
// workers/showtimeScheduler.js
await showtimeQueue.add('update-statuses', {}, {
  repeat: { cron: '*/5 * * * *' }, // Chạy mỗi 5 phút
  jobId: 'showtime-status-update',
});
```

---

## Thứ tự làm việc khi có source code Python

**Khi được cung cấp file Python, đọc theo thứ tự sau:**

1. **`utils/dto_mappers.py`** — Đây là nguồn sự thật của response. Port chính xác từng field.
2. **`services/*.py`** — Tìm tất cả mapping VI→EN và business logic
3. **`repositories/*.py`** — Query patterns, aggregation pipelines
4. **`middleware/auth.py`** — JWT decode, role check logic
5. **`cache/redis_client.py`** — Cache keys, TTL values
6. **`workers/tasks.py`** — Task names, trigger conditions, payload shape
7. **`routes/*.py`** — Confirm URL patterns và HTTP methods

---

## Checklist trước khi hoàn thành mỗi endpoint

- [ ] URL và HTTP method khớp với `api.md`
- [ ] Request body nhận được cả EN key và VI key
- [ ] Response chứa cả EN key và VI key
- [ ] Error trả về đúng format `{ "error": "...", "code": ... }`
- [ ] Auth/RBAC hoạt động đúng (test 401, 403)
- [ ] Redis cache được set/invalidate đúng (với movies và showtimes)
- [ ] Logic đặc biệt của KHACHHANG được xử lý (userId từ token)

---

## Checklist trước khi kết thúc toàn bộ migration

- [ ] Tất cả endpoints trong `api.md` đã được implement
- [ ] Integration tests pass với cả EN key và VI key
- [ ] Snapshot test response shape khớp với bản Python
- [ ] Docker Compose chạy được (`docker-compose up --build`)
- [ ] Background workers khởi động cùng app
- [ ] `.env.example` có đủ tất cả biến cần thiết
- [ ] `README.md` được cập nhật cho MERN stack

---

## Variables môi trường cần thiết

```env
# .env.example
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/cinema

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Email (cho BullMQ email worker)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=no-reply@cinema.com
```

---

## Dependencies chính

```json
{
  "dependencies": {
    "express": "^4.18",
    "mongoose": "^8",
    "ioredis": "^5",
    "bullmq": "^5",
    "jsonwebtoken": "^9",
    "bcryptjs": "^2.4",
    "nodemailer": "^6",
    "cors": "^2",
    "helmet": "^7",
    "dotenv": "^16"
  },
  "devDependencies": {
    "jest": "^29",
    "supertest": "^6",
    "nodemon": "^3"
  }
}
```
