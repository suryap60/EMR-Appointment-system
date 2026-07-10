# EMR Appointment Management System (Backend Module)

## Project Overview
This project contains the backend implementation for a production-ready, scalable Appointment Management module for an EMR system using the MERN stack (Node.js, Express, MongoDB).

## Folder Structure
```
c:\EMR-Appointment-System\
└── backend/
    ├── src/
    │   ├── config/          # Configurations
    │   ├── controllers/     # Route handlers & API logic
    │   ├── database/        # DB connection setup
    │   ├── middlewares/     # Auth, RBAC, Auditing, Error Handlers
    │   ├── models/          # Mongoose Schemas
    │   ├── routes/          # Express Routers
    │   ├── services/        # Business logic (e.g., dynamic slot generation)
    │   ├── utils/           # utility classes (ApiError, ApiResponse, asyncHandler)
    │   └── app.js           # Express App setup
    ├── server.js            # Server entry point
    └── package.json
```

## Architecture Overview
The backend follows a layered architecture (Controllers -> Services -> Models). This ensures separation of concerns. Cross-cutting concerns like Error Handling, Authorization and Logging are extracted into strict middlewares. Responses are strictly standardized using `ApiResponse`.

## Database Design
- **User**: Authentication, PBKDF2/Bcrypt hash, Role mapping (SUPER_ADMIN, RECEPTIONIST, DOCTOR).
- **Doctor**: Configuration for working days, sessions, and break times.
- **Patient**: Patient details.
- **Appointment**: The bridge between patient and doctor. Holds concurrency lock.
- **AuditLog**: Automatically populated by a middleware attached to sensitive mutations.

## How to Run The Project
1. Navigate to the `backend` directory.
2. Install dependencies: `npm install`
3. Setup `.env`: `cp .env.example .env` (Populate MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET)
4. Start the server: `npm start` or `npm run dev` for nodemon.

## API Documentation
The API adheres strictly to standards:

- **Auth**: `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/seed-admin`
- **Doctors**: `GET /api/v1/doctors`, `POST /api/v1/doctors` (Super Admin Only)
- **Slots**: `GET /api/v1/slots?doctorId=...&date=YYYY-MM-DD`
- **Appointments**: 
  - `POST /api/v1/appointments`
  - `GET /api/v1/appointments` (Paginated, filters via query params)
  - `PUT /api/v1/appointments/:id`
  - `DELETE /api/v1/appointments/:id`
  - `POST /api/v1/appointments/:id/arrive`

## Known Limitations & Future Improvements
- Due to strict time limitations, the core focus was entirely shifted towards delivering a production-ready, highly-coupled Backend with robust Concurrency handling. The React UI is missing. 
- In future iterations, REDIS could be added to cache generated slots.
