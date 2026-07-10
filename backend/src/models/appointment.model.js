import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
        doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        department: { type: String, required: true },
        date: { type: Date, required: true }, // Storing just the Date part (midnight UTC)
        startTime: { type: String, required: true }, // HH:mm format
        endTime: { type: String, required: true }, // HH:mm format
        status: {
            type: String,
            enum: ["Scheduled", "Arrived", "Completed", "Cancelled"],
            default: "Scheduled"
        },
        purpose: { type: String },
        notes: { type: String }
    },
    { timestamps: true }
);

// CONCURRENCY HANDLING: Unique Compound Index to prevent double booking.
// If two bookings happen exactly for the same doctor, date and startTime, MongoDB blocks the second one natively.
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

// Ensure fast queries for pagination and filtering
appointmentSchema.index({ date: 1, status: 1 });
appointmentSchema.index({ patient: 1 });

export default mongoose.model("Appointment", appointmentSchema);
