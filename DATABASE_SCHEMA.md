# Database Schema & Entity Relationships

The EMR system utilizes a normalized NoSQL (MongoDB) mapping structure focusing heavily on decoupled references to provide maximum searchability and concurrency scaling.

Below is the visual overview of the Document relationships within the system.

```mermaid
erDiagram
    Users {
        ObjectId _id PK
        string name
        string email
        string password "Bcrypt Hashed"
        string role "SUPER_ADMIN, DOCTOR, RECEPTIONIST"
        string refreshToken "Secure Persistence"
        Date createdAt
    }

    Doctors {
        ObjectId _id PK
        ObjectId user FK "Linked User Auth Account"
        string specialization
        string contactNumber
        Array workingDays "e.g. ['Monday', 'Tuesday']"
        string defaultSessionStart "09:00"
        string defaultSessionEnd "17:00"
        number slotDuration "in minutes (e.g. 30)"
        Array breakTimes "[{ start: '13:00', end: '14:00' }]"
    }

    Patients {
        ObjectId _id PK
        string patientId "Human Readable ID (Ext Indexed)"
        string name "Text Indexed"
        number age
        string gender
        string mobileNumber "Text Indexed"
        string address
        string medicalHistory
    }

    Appointments {
        ObjectId _id PK
        ObjectId patient FK "Reference to Patients"
        ObjectId doctor FK "Reference to Doctors"
        string date "YYYY-MM-DD"
        string startTime "HH:mm"
        string endTime "HH:mm"
        string status "Scheduled, Arrived, Cancelled, Completed"
    }

    Users ||--o| Doctors : "1 to 1 (If Role=DOCTOR)"
    Patients ||--o{ Appointments : "1 to Many"
    Doctors ||--o{ Appointments : "1 to Many"
```

### Key DB Design Principles
1. **Concurrency Protection**: The `Appointments` collection utilizes a rigid native compound index: `appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true })`. This guarantees that even under extreme sub-millisecond racing conditions, MongoDB natively locks the insertion and throws a `11000` Duplicate error preventing double bookings.
2. **Decoupled Auths**: The auth schema (`Users`) is deliberately snapped apart from the domain application schema (`Doctors`, `Patients`). This prevents heavy auth requests from dragging large arrays of schedule logic into memory unnecessarily.
3. **Optimized Dashboards**: A secondary index on `{ date: 1, status: 1 }` ensures that daily aggregate queries (e.g. Receptionist Dashboard fetching "Today's Status metrics") execute via index scans rather than full collection crawls.
