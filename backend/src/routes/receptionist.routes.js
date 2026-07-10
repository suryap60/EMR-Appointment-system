import { Router } from "express";
import { verifyJWT, restrictTo } from "../middlewares/auth.middleware.js";
import { createReceptionist, getReceptionists } from "../controllers/receptionist.controller.js";

const router = Router();

// Only Super Admins can manage receptionists
router.use(verifyJWT);
router.use(restrictTo("SUPER_ADMIN"));

router.route("/")
    .get(getReceptionists)
    .post(createReceptionist);

export default router;
