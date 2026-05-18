import { Router } from "express";
import {
    createPost,
    getAllPosts,
    getFollowingFeed,
    getPostById,
    updatePost,
    deletePost,
    toggleLike,
    toggleSave,
    addComment,
    deleteComment,
    getSavedPosts,
    getUserPosts
} from "../controllers/post.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/").get(getAllPosts);

router.route("/create").post(
    verifyJWT,
    upload.fields([{ name: "image", maxCount: 1 }]),
    createPost
);

router.route("/saved").get(verifyJWT, getSavedPosts);

router.route("/following").get(verifyJWT, getFollowingFeed);

router.route("/user/:userId").get(getUserPosts);

router.route("/:postId")
    .get(getPostById)
    .patch(verifyJWT, updatePost)
    .delete(verifyJWT, deletePost);

router.route("/like/:postId").post(verifyJWT, toggleLike);

router.route("/save/:postId").post(verifyJWT, toggleSave);

router.route("/comment/:postId").post(verifyJWT, addComment);

router.route("/comment/:postId/:commentId").delete(verifyJWT, deleteComment);

export default router;
