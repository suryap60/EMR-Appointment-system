import express from "express";
import { loginUser, logoutUser, refreshAccessToken, seedAdmin } from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.route("/seed-admin").post(seedAdmin); // Development only
router.route("/login").post(loginUser);
router.route("/refresh").post(refreshAccessToken);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
