# Engineering Decisions

### Why did you choose your project architecture?
I went with a classic tiered architecture (Router -> Controller -> Service -> Model) because it's predictable, highly testable, and makes onboarding easier. I kept the Express controllers extremely thin—they basically just parse the request, pass it to the business logic, and format the response. I pushed repetitive stuff like role checks, JWT validation, and error handling entirely into middlewares. This means we're not constantly repeating `if (!req.user)` in every route. On the frontend, I used a strict Redux flow separated from the UI components. This allowed me to throw things like real-time socket events straight into a Redux event bus without tangling up React's render cycles.

### How did you design your MongoDB schema?
Normalization where it counts, embedding where it makes sense. I intentionally decoupled the `Doctor` schedule configurations (working days, break times, session lengths) from the generic `User` auth schema. This ensures auth logic doesn't load a massive chunk of scheduling metadata into memory on every generic login. For appointments, they reference both the patient and doctor via ObjectId rather than embedding, since patients and doctors are independent core entities that need to be queried from dozens of different relational contexts (like "My Patients" vs "Global Patient Directory").

### How did you prevent double booking?
I didn't trust application-level checks for concurrency because Node is asynchronous and two HTTP requests can hit the exact same validation block milliseconds apart. Instead, I offloaded this to MongoDB itself using a compound unique index: 
`appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });`
If two people try to snag the exact same time slot at the exact same millisecond, MongoDB's native lock handles it locally on insertion. One succeeds, the other throws a `11000 Duplicate Key` error. We just catch that specific error code in the controller and spit out a clean 409 Conflict to the user. It's foolproof and requires zero clunky external system locks.

### Which database indexes did you create and why?
Beyond the obvious unique `email` index on users:
- The big one is the compound unique index on `{ doctor: 1, date: 1, startTime: 1 }` strictly to solve double-booking.
- I indexed `{ date: 1, status: 1 }` on appointments because the dashboard aggregates "Today's Scheduled/Arrived" appointments constantly. Doing a full collection scan for a daily dashboard widget would cripple the database at scale.
- I set up text indexes on `{ name: 'text', mobileNumber: 'text', patientId: 'text' }` for patients so the receptionists can instantly search massive patient lists without relying on slow regex queries that bypass indexing.

### What security measures did you implement?
- **RBAC**: A dynamic `restrictTo` middleware that strictly locks down routes to specific string roles.
- **Tokens**: We don't just use one infinite JWT. I set up a dual-token system. The access token dies quickly, while the refresh token lives longer (7 days) and is locked inside an HTTP-only secure cookie so XSS injected scripts physically cannot touch it.
- **Axios Interceptors**: The frontend automatically rotates expired tokens in the background seamlessly, heavily utilizing Redux local storage linking to ensure page refreshes don't accidentally load dropped auth states.
- **Passwords**: Standard Bcrypt encryption. Any plaintext is killed at the model level before saving.

### What performance optimizations did you apply?
- Extracted the dynamic slot calculation (cutting up standard blocks and omitting breaks) to the Node backend instead of trying to make MongoDB aggregations do it. Node easily crushes JavaScript array manipulations, whereas asking Mongo to build custom arrays per request is expensive.
- Bypassed REST API polling entirely. I hooked up Socket.io on the backend to shoot updates directly into the frontend's Redux state cache. When an appointment is modified, the grids synthetically mutate instantaneously without triggering any new HTTP query requests. That cuts API bandwidth traffic down immensely.

### If this application needed to support millions of appointments, what architectural changes would you make?
A monolith is fine for now, but at millions of records, it’ll choke. Here’s what I'd change:
1. **Caching**: I'd throw Redis in front of the Doctor schedules. Schedule rules rarely change, but they get queried every single time someone views a calendar grid somewhere in the app. 
2. **Database Sharding**: A single replica set won't hold millions of appointments efficiently. I'd shard the MongoDB cluster using a compound key of `{ doctorId, date }` to ensure queries for a specific doctor's schedule heavily hit a single localized shard.
3. **Queueing**: Audit logging and email/SMS notifications for bookings need to get ripped out of the critical path. I'd dump those payloads into an SQS or RabbitMQ queue immediately and let a background worker process them so the HTTP response stays sub-100ms.
4. **WebSocket Scaling**: With multiple Node instances sitting behind a load balancer, standard Socket.io breaks (rooms aren't shared). I'd have to drop in the Redis Pub/Sub adapter so nodes can successfully broadcast events across the entire cluster.
