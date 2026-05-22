import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImageOrFallback } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";

const createPost = asyncHandler(async (req, res) => {
    const { title, content, color } = req.body;

    if ([title].some(field => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const imagePath = req.files?.image?.[0]?.path;
    const { url: imageUrl, warning: uploadWarning } = await uploadImageOrFallback(imagePath, "");

    const post = await Post.create({
        title,
        content,
        image: imageUrl,
        userId: req.user._id,
        color: color || "default"
    });

    if (!post) {
        throw new ApiError(500, "Post not created");
    }

    const response = new ApiResponse(201, post, "Post created successfully");
    if (uploadWarning) response.uploadWarning = uploadWarning;

    res.status(201).json(response);
});

const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate("userId", "username name profilePhoto")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, posts, "Posts fetched successfully")
    );
});

const getFollowingFeed = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user._id).select("following");

    if (!currentUser?.following?.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "Following feed fetched successfully")
        );
    }

    const posts = await Post.find({ userId: { $in: currentUser.following } })
        .populate("userId", "username name profilePhoto")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, posts, "Following feed fetched successfully")
    );
});

const getPostById = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId)
        .populate("userId", "username name profilePhoto")
        .populate("comments.writtenBy", "username name profilePhoto");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(
        new ApiResponse(200, post, "Post fetched successfully")
    );
});

const updatePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { title, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to update this post");
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $set: { title, content } },
        { new: true }
    ).populate("userId", "username name profilePhoto");

    return res.status(200).json(
        new ApiResponse(200, updatedPost, "Post updated successfully")
    );
});

const deletePost = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this post");
    }

    await Post.findByIdAndDelete(postId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Post deleted successfully")
    );
});

const toggleLike = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const isLiked = post.likes.includes(req.user._id);

    if (isLiked) {
        await Post.findByIdAndUpdate(postId, { $pull: { likes: req.user._id } });
    } else {
        await Post.findByIdAndUpdate(postId, { $push: { likes: req.user._id } });
    }

    const updatedPost = await Post.findById(postId).populate("userId", "username name profilePhoto");

    return res.status(200).json(
        new ApiResponse(200, updatedPost, isLiked ? "Post unliked" : "Post liked")
    );
});

const toggleSave = asyncHandler(async (req, res) => {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const isSaved = post.saves.includes(req.user._id);

    if (isSaved) {
        await Post.findByIdAndUpdate(postId, { $pull: { saves: req.user._id } });
    } else {
        await Post.findByIdAndUpdate(postId, { $push: { saves: req.user._id } });
    }

    const updatedPost = await Post.findById(postId).populate("userId", "username name profilePhoto");

    return res.status(200).json(
        new ApiResponse(200, updatedPost, isSaved ? "Post unsaved" : "Post saved")
    );
});

const addComment = asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid post ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = {
        content,
        writtenBy: req.user._id
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(postId).populate("comments.writtenBy", "username name profilePhoto");

    return res.status(201).json(
        new ApiResponse(200, updatedPost, "Comment added successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid post or comment ID");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.writtenBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized to delete this comment");
    }

    post.comments.pull(commentId);
    await post.save();

    return res.status(200).json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    );
});

const getSavedPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find({ saves: req.user._id })
        .populate("userId", "username name profilePhoto")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, posts, "Saved posts fetched successfully")
    );
});

const getUserPosts = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    const posts = await Post.find({ userId })
        .populate("userId", "username name profilePhoto")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, posts, "User posts fetched successfully")
    );
});

export {
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
};
