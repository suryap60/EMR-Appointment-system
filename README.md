# EMR Appointment Management System

## Project Overview
This project is a highly-scalable, production-ready Full-Stack Electronic Medical Record (EMR) Appointment Management System. Built on the MERN stack (MongoDB, Express, React, Node.js) styled with Tailwind CSS, this platform handles complex multi-role scheduling. It seamlessly manages concurrent double-booking protections, dynamically allocates visual time-slots around doctors' shift and break intervals, and broadcasts real-time grid changes to all connected users utilizing socket protocols via Redux Event Busses without requiring manual API polling.

## Folder Structure
```
c:\EMR-Appointment-System\
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & Database connections
│   │   ├── controllers/     # Route handlers & Http logic parsing
│   │   ├── middlewares/     # Auth, RBAC Role guards, Error Handlers
│   │   ├── models/          # Mongoose Schemas (User, Doctor, Appointment, Patient)
│   │   ├── routes/          # Express API Router definitions
│   │   ├── services/        # Decoupled logic (Dynamic slot iteration algorithms)
│   │   ├── utils/           # Helper classes (ApiError, ApiResponse, asyncHandler)
│   │   ├── socket.js        # Backend Socket.IO singleton manager
│   │   └── app.js           # Express App setup & middleware injection
│   ├── server.js            # Node Entry Point
│   └── ENGINEERING_DECISIONS.md # Detailed backend architectural documentation
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable Layouts, Wrappers, Providers (SocketProvider)
    │   ├── hooks/           # Custom React capabilities (useSocket)
    │   ├── lib/             # Third-party instance wrappers (axios `api.ts`, `socket.ts`)
    │   ├── pages/           # High-Level Component Page Views (Dashboards, Schedulers)
    │   ├── redux/           # Global Store config & Slices (Auth, Doctors, Appointments)
    │   ├── services/        # Dedicated client-side wrappers for endpoint fetching
    │   └── types/           # TypeScript generic interfaces mapping the DB schema
    ├── index.html           # Document root
    └── vite.config.ts       # React Bundler configuration
```

## Architecture Overview
The application operates on a strict Layered Architecture to guarantee minimal code duplication:
- **Client (Frontend)**: Utilizes a reactive `Redux <-> HTTP Service` flow separating business networks from components. Instead of component prop-drilling, robust state managers control user authentication caches securely.
- **Transport (Real-Time)**: Employs Axios interceptors for standard synchronous DB lookups, but pairs it tightly against a single clustered `Socket.IO` listener providing highly-reactive asynchronous data synchronizations.
- **Server (Backend)**: Follows the `Router -> Controller -> Service -> Model` design pattern to cleanly segregate concerns. Express strictly delegates complex multi-entity calculations to service files rather than blocking the controller router flow natively.

## Database Design
Heavily normalized across four core Collections:
1. **Users**: Authentication layer strictly. Manages PBKDF2/Bcrypt hash iterations, Refresh Tokens, and hierarchical Role definitions (`SUPER_ADMIN`, `RECEPTIONIST`, `DOCTOR`).
2. **Doctors**: Stores advanced granular schedule configurations (working days, individual session start/end pairs, configurable length breaks, slot duration times).
3. **Patients**: Independent patient roster utilizing MongoDB Text Indexing on Name/ID/Mobile for high-performance localized searching. 
4. **Appointments**: The central bridge schema binding ObjectId references across Patient and Doctor profiles. Strictly enforces native Compound Unique Indices `{ doctor: 1, date: 1, startTime: 1 }` to lock double-bookings asynchronously at the DB level.

## API Documentation
The REST API conforms to strict structured `ApiResponse` schemas format.
- **Auth**: `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/seed-admin`
- **Doctors**: `GET /doctors`, `POST /doctors`, `PUT /doctors/:id/schedule`
- **Slots**: `GET /slots?doctorId=...&date=YYYY-MM-DD` *(Computed dynamically over schedules)*
- **Patients**: `GET /patients`, `GET /patients/my-patients`
- **Appointments**: 
  - `GET /appointments` (Query params: `limit`, `page`, `status`, `startDate`)
  - `POST /appointments`
  - `PUT /appointments/:id`
  - `DELETE /appointments/:id`

## Environment Variables
The application needs dual `.env` files.

### `backend/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pwd>@cluster...
ACCESS_TOKEN_SECRET=your_dev_access_secret
REFRESH_TOKEN_SECRET=your_dev_refresh_secret
CLIENT_URL=http://localhost:5173
```
### `frontend/.env`
```env
VITE_API_URL=http://localhost:5000
```

## Installation Instructions
1. Ensure `Node.js` (v18+) and `Git` are installed.
2. Clone the repository.
3. Open a terminal to the `/backend` folder and run `npm install`.
4. Open a terminal to the `/frontend` folder and run `npm install`.
5. Duplicate the `.env.example` templates mapping in your genuine database connection sequences.

## Running the Project
1. **Backend**: Navigate to `/backend` and execute `npm run dev`. Ensure the terminal confirms `MONGO db connection failed !!!` avoids firing, signaling successful mounting.
2. **Frontend**: In a secondary terminal, navigate to `/frontend` and execute `npm run dev`.
3. Open your browser to the local Vite portal (usually `http://localhost:5173`).
4. To initialize the DB natively, issue a raw `POST` via Postman to `/api/v1/auth/seed-admin` to create your initial `SUPER_ADMIN` login.

## Assumptions Made
1. Roles operate in an unmodifiable hierarchy. Doctors can only view their own appointment schedules, while Receptionists and Admins hold generalized localized facility viewing powers globally.
2. Break times cannot overlap within themselves structurally.
3. Node application instances are isolated deployments. (The current socket wrapper runs within a clustered node environment seamlessly but omits an external Pub/Sub memory wrapper initially).

## Known Limitations
1. A user navigating locally via F5 clears all non-cached persistent React memory; however, token regeneration via Axios silently recovers the session state (with fraction-of-a-second delays).
2. Deleting a parent Doctor/User document does not physically cascade cascade-deletes onto corresponding Appointment records.
3. Currently, text-searching leverages raw `$regex` querying in cases where text indexes don't perfectly blanket partial matching fields for extremely large scale collections.

## Future Improvements
1. **Microservice Socket Extraction**: Detach `Socket.IO` out to an independent Microservice bound via Redis Pub/Sub adapter to ensure scaling across hundreds of replicated server nodes won't drift real-time data syncs.
2. **Redis Caching**: Integrate a fast `Redis` cache block locally to memory-hold static properties like Doctor availability/session rulesets to alleviate repeated Database lookups every time the `Scheduler` generates grid configurations.
3. **PDF Generation / Exporting**: Expand the frontend Table interfaces with generic PDF/CSV downloading utility modules for offline record-filing tasks heavily utilized by administrators.
