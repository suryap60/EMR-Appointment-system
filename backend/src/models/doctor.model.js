import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        department: { type: String, required: true },
        specialization: { type: String, required: true, default: "General" },
        experience: { type: Number, required: true, default: 0 },
        consultationFee: { type: Number, required: true, default: 0 },
        qualifications: [{ type: String }],
        workingDays: [{ type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] }],
        sessions: [
            {
                start: { type: String, required: true }, // Format HH:mm (e.g. 09:00)
                end: { type: String, required: true }
            }
        ],
        slotDuration: { type: Number, required: true, default: 15 }, // In minutes
        breaks: [
            {
                start: { type: String, required: true },
                end: { type: String, required: true }
            }
        ]
    },
    { timestamps: true }
);

export default mongoose.model("Doctor", doctorSchema);
