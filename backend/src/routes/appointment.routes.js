import express from "express";
import { verifyJWT, restrictTo } from "../middlewares/auth.middleware.js";
import { auditLogger } from "../middlewares/audit.middleware.js";
import {
    createAppointment,
    getAppointments,
    updateAppointment,
    deleteAppointment,
    markArrived
} from "../controllers/appointment.controller.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
    .post(restrictTo("RECEPTIONIST", "SUPER_ADMIN"), auditLogger("CREATE", "Appointment"), createAppointment)
    .get(getAppointments);

router.route("/:id")
    .put(restrictTo("RECEPTIONIST", "SUPER_ADMIN", "DOCTOR"), auditLogger("UPDATE", "Appointment"), updateAppointment)
    .delete(restrictTo("RECEPTIONIST", "SUPER_ADMIN"), auditLogger("CANCEL", "Appointment"), deleteAppointment);

router.route("/:id/arrive")
    .post(restrictTo("RECEPTIONIST", "SUPER_ADMIN"), auditLogger("MARK_ARRIVED", "Appointment"), markArrived);

export default router;
