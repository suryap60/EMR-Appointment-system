import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const createDoctor = asyncHandler(async (req, res) => {
    // Only Super Admin can do this based on RBAC logic, assumed already guarded by middleware
    const { name, email, password, department, workingDays, sessions, slotDuration, breaks } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw new ApiError(400, "User with this email already exists");

    let createdUser;
    let createdDoctor;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        createdUser = new User({ name, email, password, role: "DOCTOR" });
        await createdUser.save({ session });

        createdDoctor = new Doctor({
            user: createdUser._id,
            department,
            workingDays,
            sessions,
            slotDuration,
            breaks
        });
        await createdDoctor.save({ session });

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new ApiError(500, "Error creating doctor profile: " + error.message);
    } finally {
        session.endSession();
    }

    return res.status(201).json(new ApiResponse(201, { user: createdUser, doctor: createdDoctor }, "Doctor created successfully"));
});

const getDoctors = asyncHandler(async (req, res) => {
    // Support filtering by department etc. if needed via req.query later
    const filters = {};
    if (req.query.department) filters.department = req.query.department;

    // Server-side Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optimize with index? For now simply find.
    const doctors = await Doctor.find(filters).populate("user", "name email role").skip(skip).limit(limit);
    const total = await Doctor.countDocuments(filters);

    return res.status(200).json(new ApiResponse(200, doctors, "Doctors fetched successfully", { page, limit, total }));
});

export { createDoctor, getDoctors };
