import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

export const isAuthenticated = asyncHandler(async (req, res, next) => {
    // console.log("Cookies:", req.cookies);
    // console.log("Session:", req.session);
    if (!req.session.userId) {
        throw new ApiError(401, "Unauthorized. Please log in.");
    }

    const user = await User.findById(req.session.userId).select("-password");

    if (!user) {
        throw new ApiError(401, "User not found. Please log in again.");
    }

    req.user = user; // Attach user info to request
    next();
});
