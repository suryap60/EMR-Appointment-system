import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { searchPatients, getPatients, getMyPatients } from "../controllers/patient.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/search").get(searchPatients);
router.route("/my-patients").get(getMyPatients);
router.route("/").get(getPatients);

export default router;
