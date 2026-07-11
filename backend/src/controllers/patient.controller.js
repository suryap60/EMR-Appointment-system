import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";

// @desc    Search patients by name or mobile
// @route   GET /api/v1/patients/search?q=...
// @access  Private
export const searchPatients = asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(200).json(new ApiResponse(200, [], "Empty query"));
    }

    const regex = new RegExp(q, "i");
    const patients = await Patient.find({
        $or: [{ name: regex }, { mobileNumber: regex }, { patientId: regex }]
    }).limit(10);

    return res.status(200).json(new ApiResponse(200, patients, "Patients fetched"));
});

// @desc    Get all patients with pagination and search
// @route   GET /api/v1/patients
// @access  Private (Admin, Receptionist)
export const getPatients = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = {};
    if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [{ name: regex }, { mobileNumber: regex }, { patientId: regex }];
    }

    const skip = (page - 1) * limit;
    const patients = await Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Patient.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, patients, "Patients fetched", {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
    }));
});

// @desc    Get patients specific to the logged-in doctor
// @route   GET /api/v1/patients/my-patients
// @access  Private (Doctor)
export const getMyPatients = asyncHandler(async (req, res) => {
    if (req.user.role !== "DOCTOR") {
        return res.status(403).json(new ApiResponse(403, null, "Only doctors can access this route"));
    }

    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile) {
        return res.status(404).json(new ApiResponse(404, null, "Doctor profile not found"));
    }

    const { page = 1, limit = 10, search = "" } = req.query;

    // Find distinct patients who have booked appointments with this doctor
    const uniquePatientIds = await Appointment.distinct("patient", { doctor: doctorProfile._id, status: { $ne: "Cancelled" } });

    const query = { _id: { $in: uniquePatientIds } };
    if (search) {
        const regex = new RegExp(search, "i");
        query.$or = [{ name: regex }, { mobileNumber: regex }, { patientId: regex }];
    }

    const skip = (page - 1) * limit;
    const patients = await Patient.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Patient.countDocuments(query);

    return res.status(200).json(new ApiResponse(200, patients, "My patients fetched", {
        total,
        page: parseInt(page),
        limit: parseInt(limit)
    }));
});
