import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDynamicSlots } from "../services/slot.service.js";

// GET /api/v1/slots?doctorId=123&date=YYYY-MM-DD
const getAvailableSlots = asyncHandler(async (req, res) => {
    const { doctorId, date } = req.query;
    if (!doctorId || !date) throw new ApiError(400, "doctorId and date are required");

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new ApiError(404, "Doctor not found");

    const parsedDate = new Date(date);
    if (parsedDate < new Date().setHours(0, 0, 0, 0)) {
        throw new ApiError(400, "Cannot fetch slots for past dates");
    }

    // Generate possible slots based on config
    const generatedSlots = generateDynamicSlots(doctor, date);

    // Fetch already booked slots for this doctor on this exact date (ignoring cancelled ones)
    const startOfDay = new Date(parsedDate.setUTCHours(0, 0, 0, 0));

    // Exact date match (ensure time is normalized)
    const bookings = await Appointment.find({
        doctor: doctorId,
        date: startOfDay,
        status: { $ne: "Cancelled" }
    }).select("startTime endTime");

    const bookedTimeStrings = bookings.map(b => b.startTime);

    // Filter out booked slots
    const availableSlots = generatedSlots.filter(s => !bookedTimeStrings.includes(s.start));
    const bookedSlots = generatedSlots.filter(s => bookedTimeStrings.includes(s.start));

    const results = {
        available: availableSlots,
        booked: bookedSlots
    }

    return res.status(200).json(new ApiResponse(200, results, "Slots fetched successfully"));
});

export { getAvailableSlots };
