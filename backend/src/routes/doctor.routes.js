import express from "express";
import { createDoctor, getDoctors } from "../controllers/doctor.controller.js";
import { verifyJWT, restrictTo } from "../middlewares/auth.middleware.js";
import { auditLogger } from "../middlewares/audit.middleware.js";

const router = express.Router();

router.route("/")
    .get(verifyJWT, getDoctors)
    .post(verifyJWT, restrictTo("SUPER_ADMIN"), auditLogger("CREATE_DOCTOR", "Doctor"), createDoctor);

export default router;
