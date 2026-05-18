import { Router } from "express";
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    updateAccountDetails,
    updateProfilePhoto,
    getUserChannelProfile,
    followUnfollowUser,
    getUserFollowers,
    getUserFollowing
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([{ name: "profilePhoto", maxCount: 1 }]),
    registerUser
);

router.route("/login").post(loginUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/logout").post(verifyJWT, logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

router.route("/update-profile-photo").patch(
    verifyJWT,
    upload.single("profilePhoto"),
    updateProfilePhoto
);

router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

router.route("/c/:username/followers").get(verifyJWT, getUserFollowers);

router.route("/c/:username/following").get(verifyJWT, getUserFollowing);

router.route("/follow/:userId").post(verifyJWT, followUnfollowUser);

export default router;
