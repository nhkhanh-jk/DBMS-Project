# Cinema Management System - Backend

Hệ thống quản lý rạp chiếu phim tích hợp xử lý tác vụ nền và bộ nhớ đệm.

## 🚀 Công nghệ sử dụng (Tech Stack)

- **Ngôn ngữ**: Python 3.12+
- **Framework**: Flask (RESTful API)
- **Database**: MongoDB Atlas (Lưu trữ chính)
- **Caching**: Redis (Lưu danh sách phim, suất chiếu)
- **Async Tasks**: Celery (Gửi email, tính điểm tích lũy, cập nhật trạng thái tự động)
- **Authentication**: JWT (JSON Web Token) với phân quyền RBAC (Admin, Nhanvien, Khachhang)
- **Containerization**: Docker & Docker Compose

## 🏗️ Kiến trúc hệ thống

Backend được xây dựng theo mô hình phân lớp:
`Routes -> Services -> Repositories -> MongoDB`

**Điểm đặc biệt (Hybrid Compatibility):**
Hệ thống hỗ trợ song song hai ngôn ngữ ở tầng API:
- Nhận Request bằng cả tiếng Anh (chuẩn mới) và tiếng Việt (legacy).
- Trả về Response chứa đồng thời cả key tiếng Anh và tiếng Việt.
- Dữ liệu trong Database được lưu trữ 100% bằng tiếng Anh.

Chi tiết xem tại: [Kiến trúc hệ thống](./docs/architecture.md)

## 🛠️ Hướng dẫn cài đặt và khởi chạy

### Cách 1: Sử dụng Docker (Khuyên dùng)
Yêu cầu: Đã cài đặt Docker Desktop.
```bash
docker-compose up --build
```
Hệ thống sẽ khởi chạy:
- API: `http://localhost:5000`
- Redis: `localhost:6379`
- Celery Worker & Beat (Tự động chạy ngầm)

### Cách 2: Chạy thủ công
1. Tạo môi trường ảo: `python -m venv .venv`
2. Kích hoạt: `.venv\Scripts\activate` (Windows) hoặc `source .venv/bin/activate` (Linux/Mac)
3. Cài đặt thư viện: `pip install -r requirements.txt`
4. Cấu hình tệp `.env` (Xem mẫu trong [Setup Guide](./docs/setup.md))
5. Chạy ứng dụng: `python app.py`

## 📖 Tài liệu hướng dẫn chi tiết

- [Cài đặt chi tiết (Setup Guide)](./docs/setup.md)
- [Tài liệu API (API Contract)](./docs/api.md)
- [Kiến trúc & Schema Database](./docs/architecture.md)
- [Bảng ánh xạ Mock-Backend](./docs/mock_mapping.md)

## 📁 Cấu trúc thư mục chính

- `routes/`: Định nghĩa các endpoints API.
- `services/`: Xử lý logic nghiệp vụ và chuẩn hóa dữ liệu.
- `repositories/`: Thao tác trực tiếp với MongoDB.
- `models/`: Định nghĩa Schema và cấu trúc dữ liệu.
- `workers/`: Định nghĩa các tác vụ nền (Celery tasks).
- `utils/`: Các hàm tiện ích, DTO mappers, validator.
- `middleware/`: Xử lý Authentication và Authorization.
