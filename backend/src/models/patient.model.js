import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        mobileNumber: { type: String, required: true, unique: true },
        patientId: { type: String, required: true, unique: true }, // E.g., custom generated like PAT-1001
        email: { type: String },
        dob: { type: Date }
    },
    { timestamps: true }
);

patientSchema.index({ name: 'text', mobileNumber: 'text', patientId: 'text' });

export default mongoose.model("Patient", patientSchema);
