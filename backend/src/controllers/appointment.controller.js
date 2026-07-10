import Appointment from "../models/appointment.model.js";
import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const emitUpdate = (req, eventName, payload) => {
    const io = req.app.get("io");
    if (io) io.emit(eventName, payload);
};

const createAppointment = asyncHandler(async (req, res) => {
    const { doctorId, date, startTime, endTime, department, purpose, notes, patientInfo } = req.body;

    // date should be parseable
    const appointmentDate = new Date(date).setUTCHours(0, 0, 0, 0);

    // Find or Create Patient
    let patient;
    if (patientInfo.mobileNumber) {
        patient = await Patient.findOne({ mobileNumber: patientInfo.mobileNumber });
    } else if (patientInfo.patientId) {
        patient = await Patient.findOne({ patientId: patientInfo.patientId });
    }

    if (!patient) {
        if (!patientInfo.name || !patientInfo.mobileNumber) {
            throw new ApiError(400, "New patient requires name and mobileNumber");
        }
        // generate simple patientId
        const generatePatientId = "PAT-" + Date.now().toString().slice(-6);
        patient = await Patient.create({
            name: patientInfo.name,
            mobileNumber: patientInfo.mobileNumber,
            patientId: generatePatientId,
            email: patientInfo.email
        });
    }

    let appointment;
    try {
        appointment = await Appointment.create({
            patient: patient._id,
            doctor: doctorId,
            department: department || (await Doctor.findById(doctorId)).department,
            date: appointmentDate,
            startTime,
            endTime,
            purpose,
            notes,
            status: "Scheduled"
        });
    } catch (error) {
        // Handle Concurrency (Double Booking) native MongoDB uniqueness error
        if (error.code === 11000) {
            throw new ApiError(409, "Slot already booked by another user");
        }
        throw error;
    }

    // Populate for response
    await appointment.populate("patient doctor");

    // Emit via WebSocket
    emitUpdate(req, "appointmentCreated", appointment);

    return res.status(201).json(new ApiResponse(201, appointment, "Appointment created successfully"));
});

const getAppointments = asyncHandler(async (req, res) => {
    const { doctorId, patientName, mobileNumber, department, status, startDate, endDate, page = 1, limit = 10 } = req.query;

    let filter = {};

    // Role based filtering
    if (req.user.role === "DOCTOR") {
        const doctorProfile = await Doctor.findOne({ user: req.user._id });
        if (!doctorProfile) throw new ApiError(404, "Doctor profile not found");
        filter.doctor = doctorProfile._id;
    } else if (doctorId) {
        filter.doctor = doctorId;
    }

    if (department) filter.department = department;
    if (status) filter.status = status;

    if (startDate && endDate) {
        filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Patient Searching requires lookup or filtering on populated path.
    // For scale, we should find matching patients first, then use their IDs
    if (patientName || mobileNumber) {
        const pQuery = {};
        if (patientName) pQuery.name = { $regex: patientName, $options: "i" };
        if (mobileNumber) pQuery.mobileNumber = mobileNumber;

        const matchingPatients = await Patient.find(pQuery).select("_id");
        filter.patient = { $in: matchingPatients.map(p => p._id) };
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
        .populate("patient", "name mobileNumber patientId")
        .populate({ path: "doctor", populate: { path: "user", select: "name" } })
        .sort({ date: 1, startTime: 1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, appointments, "Appointments fetched", {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    }));
});

const updateAppointment = asyncHandler(async (req, res) => {
    const { purpose, notes } = req.body;

    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { $set: { purpose, notes } }, // Only allow these to be modified natively
        { new: true }
    ).populate("patient");

    if (!appointment) throw new ApiError(404, "Appointment not found");

    emitUpdate(req, "appointmentUpdated", appointment);

    return res.status(200).json(new ApiResponse(200, appointment, "Appointment updated"));
});

const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(
        req.params.id,
        { $set: { status: "Cancelled" } },
        { new: true }
    );
    if (!appointment) throw new ApiError(404, "Appointment not found");

    emitUpdate(req, "appointmentCancelled", appointment);
    return res.status(200).json(new ApiResponse(200, appointment, "Appointment cancelled"));
});

const markArrived = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) throw new ApiError(404, "Appointment not found");

    if (appointment.status !== "Scheduled") {
        throw new ApiError(400, "Only scheduled appointments can be marked as arrived");
    }

    appointment.status = "Arrived";
    await appointment.save();

    emitUpdate(req, "appointmentUpdated", appointment);

    return res.status(200).json(new ApiResponse(200, appointment, "Patient marked as arrived"));
});

export { createAppointment, getAppointments, updateAppointment, deleteAppointment, markArrived };
