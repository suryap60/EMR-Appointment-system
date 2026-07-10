import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import AuditLog from "../models/auditLog.model.js";

const auditLogger = (action, entity) => {
    return asyncHandler(async (req, res, next) => {
        // Run after the main controller
        res.on("finish", async () => {
            if (req.user && res.statusCode < 400) {
                try {
                    await AuditLog.create({
                        user: req.user._id,
                        role: req.user.role,
                        action: action,
                        entity: entity,
                        details: req.body || req.params
                    });
                } catch (error) {
                    console.error("Audit Logging Failed", error);
                }
            }
        });
        next();
    });
};

export { auditLogger };
