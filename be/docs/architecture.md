# Backend Architecture

## Overview
- Backend location: `DBMS-bao-backend`
- Stack: Flask, MongoDB, Redis, Celery, JWT, bcrypt
- Flow: `routes -> services -> repositories -> database`

## Project Structure
```text
DBMS-bao-backend/
|-- app.py
|-- config/
|-- db/
|-- models/
|-- repositories/
|-- services/
|-- routes/
|-- middleware/
|-- utils/
|-- cache/
|-- workers/
|-- docs/
|-- docker-compose.yml
|-- requirements.txt
`-- .env
```

## Data Source of Truth (Database Schema)
The MongoDB database uses **English (camelCase)** field names.

- `users`: `username`, `password`, `role`, `fullName`, `dateOfBirth`, `gender`, `email`, `phoneNumber`, `rewardPoints`, `membershipLevel`
- `cinemas`: `name`, `city`, `address`, `rooms`
- `movies`: `title`, `genres`, `description`, `durationMin`, `releaseDate`, `status`
- `showtimes`: `movieId`, `cinemaId`, `roomId`, `startTime`, `endTime`, `basePrice`, `status`, `bookedSeats`
- `bookings`: `bookingCode`, `userId`, `staffId`, `showtimeId`, `bookingTime`, `paymentMethod`, `promotionCode`, `totalPrice`, `tickets`
- `reviews`: `movieId`, `userId`, `rating`, `comment`, `reviewedAt`
- `service_requests`: `userId`, `requestType`, `requestDetail`, `status`

## Hybrid API Compatibility Layer
To support legacy integrations, the backend implements a compatibility layer:
- **Requests**: Services (in `services/`) are designed to accept both English keys and legacy Vietnamese keys (e.g., both `title` and `TenPhim` are accepted for movie creation).
- **Responses**: DTO Mappers (in `utils/dto_mappers.py`) return a hybrid JSON object containing both English and Vietnamese keys.
- **Recommendations**: All new integrations should prefer the English field names.

## Core Components
- `routes/`: HTTP endpoints and request parsing.
- `services/`: Business rules, validation, DTO mapping, and legacy key normalization.
- `repositories/`: MongoDB read/write operations using English schema.
- `middleware/auth.py`: JWT authentication and role-based access control.
- `cache/redis_client.py`: Redis caching for frequently accessed lists.
- `workers/tasks.py`: Background jobs:
  - Booking confirmation emails
  - Loyalty point calculations
  - Automated showtime status updates (via Celery Beat)
