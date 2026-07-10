import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";

// @desc    Create new receptionist
// @route   POST /api/v1/receptionists
// @access  Private (Super Admin)
export const createReceptionist = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new ApiError(400, "All fields are required");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new ApiError(400, "User with this email already exists");
    }

    const user = await User.create({
        name,
        email,
        password,
        role: "RECEPTIONIST"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    res.status(201).json(new ApiResponse(201, createdUser, "Receptionist created successfully"));
});

// @desc    Get all receptionists
// @route   GET /api/v1/receptionists
// @access  Private (Super Admin)
export const getReceptionists = asyncHandler(async (req, res) => {
    const receptionists = await User.find({ role: "RECEPTIONIST" }).select("-password -refreshToken");
    res.status(200).json(new ApiResponse(200, receptionists, "Receptionists retrieved successfully"));
});
