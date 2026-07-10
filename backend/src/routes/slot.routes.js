import express from "express";
import { getAvailableSlots } from "../controllers/slot.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.route("/").get(verifyJWT, getAvailableSlots);

export default router;
