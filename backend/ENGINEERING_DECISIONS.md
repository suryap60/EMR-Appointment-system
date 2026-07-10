# Engineering Decisions

### Why did you choose your project architecture?
I went with a layered separation of concerns (Routers -> Controllers -> Services/Utils -> Models). 
- **Controllers** are kept thin and strictly handle HTTP concerns. 
- **Middlewares** like `verifyJWT`, `restrictTo`, and the `auditLogger` decouple security logic from business logic.
- Standardized responses via `ApiResponse` and `ApiError` ensure consistent JSON structure across all endpoints.
- **Frontend Layer**: I implemented a strict `Types -> Service Client -> Redux Thunk -> Component View` pattern in React to completely decouple business network logic from UI rendering, heavily leveraging `dayjs` and `react-hook-form` to optimize validation performance without cascading re-renders.

### How did you design your MongoDB schema?
The database was highly normalized with clear mappings. The `Doctor` schema contains scheduling configs (availability, sessions, break durations) independently. The `User` schema contains only auth logic. 

### How did you prevent double booking?
Concurrency was handled entirely in the Database layer using a native MongoDB Compound Unique Index on the `Appointment` collection:
```javascript
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });
```
When two users try to book exactly the same slot simultaneously via HTTP requests, Node.js fires them into the DB connection pool. MongoDB leverages its native locking system on index constraint insertion, causing exactly one document to succeed and throwing `MongoServerError: 11000 (Duplicate Key)` for the trailing request. We catch this exact error in our async controller and return a clean `409 Conflict`. 

### Which database indexes did you create and why?
- `userSchema.index({ email: 1 }, { unique: true })`
- `appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true })` for concurrency locking.
- `appointmentSchema.index({ date: 1, status: 1 })` for optimal retrieval during dashboard aggregation.
- `patientSchema.index({ name: 'text', mobileNumber: 'text', patientId: 'text' })` to support complex searching. 

### What security measures did you implement?
- **RBAC**: A strict `restrictTo(...roles)` factory middleware.
- **Passwords**: Bcrypt with Salt factor 10.
- **Tokens**: Dual token system (Access Token for short term 10mins + HTTPOnly Secure Refresh Token for 7d).
- **Helmet**: Native protection against XSS and clickjacking.

### What performance optimizations did you apply?
- Extracted dynamic slot generation into the backend rather than keeping it inside MongoDB aggregation logic, saving DB CPU cycles.
- Paginated Appointment searching endpoints natively through MongoDB `skip` and `limit`.

### If this application needed to support millions of appointments, what architectural changes would you make?
1. **Caching**: Redis should cache the `Doctor` schedule configs since they rarely change. 
2. **MQ Integration**: Extract Audit logging from a Middleware to an independent RabbitMQ/Kafka queue to unblock the Express thread pool completely.
3. **Database Sharding**: Shard MongoDB based on `date` and `doctorId`. 
4. **WebSocket Segregation**: Move Socket.IO into its own scaled out Microservice via Redis Pub/Sub adapter to prevent state drift amongst nodes.

### Engineering Challenge: Real-Time Appointment Sync
To solve the **WebSockets** requirement while preventing duplicate concurrency requests from colliding on the frontend, I utilized `Socket.IO` emitting `appointmentCreated` globally. When the React `Scheduler.tsx` component catches this event and validates the date/doctor payload matches the currently viewed Grid, it silently re-fetches the dynamic generated slots API. This gracefully and instantly updates the DOM to show the new blocked slots (colored Red) for all receptionists seamlessly without page reloads or conflicting state mutation.
