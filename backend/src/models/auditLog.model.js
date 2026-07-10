import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, required: true },
        action: { type: String, required: true },
        entity: { type: String, required: true }, // e.g., Appointment, Doctor
        details: { type: mongoose.Schema.Types.Mixed }
    },
    { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
