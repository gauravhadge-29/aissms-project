import { Router } from "express";
import {registerUser, 
        loginUser, 
        logoutUser, 
        refreshAccessToken, 
        loginWithGoogle,
        getCurrentUser,  

} from "../controllers/user.controller.js";

import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { isAuthenticated } from "../middlewares/isauthenticated.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount: 1
        },
    ]),
    
    registerUser)

router.route("/login").post(loginUser)
router.route("/auth/google").post(loginWithGoogle)


//secured routes
router.route("/logout").post(isAuthenticated, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
// router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(isAuthenticated,getCurrentUser)
// router.route("/avatar",).patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
// router.route("/c/:username").get(verifyJWT,getCurrentUserProfile)


export default router