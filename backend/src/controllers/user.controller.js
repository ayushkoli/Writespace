import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getDefaultPhotoUrl, uploadImageOrFallback } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { getCookieOptions } from "../utils/cookieOptions.js";
import jwt from "jsonwebtoken";;

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, password, name, age } = req.body;

    if (
        [username, email, password, name].some(field => !field?.trim()) ||
        age == null
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with this email or username already exists");
    }

    const profilePhotoImagePath = req.files?.profilePhoto?.[0]?.path;
    let uploadWarning = null;

    const { url: profilePhotoUrl, warning: photoWarning } = await uploadImageOrFallback(
        profilePhotoImagePath,
        getDefaultPhotoUrl()
    );
    if (photoWarning) uploadWarning = photoWarning;

    const user = await User.create({
        name,
        email,
        password,
        age,
        username: username.toLowerCase(),
        profilePhoto: profilePhotoUrl
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const response = new ApiResponse(201, createdUser, "User created successfully");
    if (uploadWarning) response.uploadWarning = uploadWarning;

    return res.status(201).json(response);
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    // Clients often send a single field (e.g. `email`) even when the user typed a username.
    const loginId = (email || username || "").trim().toLowerCase();

    if (!loginId) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    const user = await User.findOne({
        $or: [{ email: loginId }, { username: loginId }]
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = getCookieOptions();

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: { refreshToken: 1 }
        },
        {
            new: true
        }
    );

    const options = getCookieOptions();

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = getCookieOptions();

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { name, bio, age, country, website } = req.body;

    if (!name && !bio && !age && !country && !website) {
        throw new ApiError(400, "At least one field is required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name,
                bio,
                age,
                country,
                website
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateProfilePhoto = asyncHandler(async (req, res) => {
    const profilePhotoPath = req.file?.path;

    if (!profilePhotoPath) {
        throw new ApiError(400, "Profile photo is required");
    }

    const currentUser = await User.findById(req.user?._id).select("profilePhoto");
    const fallbackUrl = currentUser?.profilePhoto || getDefaultPhotoUrl();

    const { url: profilePhotoUrl, uploaded, warning } = await uploadImageOrFallback(
        profilePhotoPath,
        fallbackUrl
    );

    if (!uploaded) {
        const user = await User.findById(req.user?._id).select("-password -refreshToken");
        const response = new ApiResponse(
            200,
            user,
            "Profile photo could not be uploaded. Your previous photo was kept."
        );
        if (warning) response.uploadWarning = warning;
        return res.status(200).json(response);
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                profilePhoto: profilePhotoUrl
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json(new ApiResponse(200, user, "Profile photo updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "userId",
                as: "posts"
            }
        },
        {
            $addFields: {
                postsCount: {
                    $size: "$posts"
                },
                followersCount: {
                    $size: "$followers"
                },
                followingCount: {
                    $size: "$following"
                },
                isFollowed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followers"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                username: 1,
                bio: 1,
                profilePhoto: 1,
                country: 1,
                website: 1,
                isVerified: 1,
                postsCount: 1,
                followersCount: 1,
                followingCount: 1,
                isFollowed: 1
            }
        }
    ]);

    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists");
    }

    return res.status(200).json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const followUnfollowUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!userId?.trim()) {
        throw new ApiError(400, "userId is missing");
    }

    if (req.user._id.toString() === userId) {
        throw new ApiError(400, "Cannot follow yourself");
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
        throw new ApiError(404, "User not found");
    }

    const isFollowing = req.user.following.includes(userId);

    if (isFollowing) {
        await User.findByIdAndUpdate(req.user._id, { $pull: { following: userId } });
        await User.findByIdAndUpdate(userId, { $pull: { followers: req.user._id } });
    } else {
        await User.findByIdAndUpdate(req.user._id, { $push: { following: userId } });
        await User.findByIdAndUpdate(userId, { $push: { followers: req.user._id } });
    }

    const updatedUser = await User.findById(req.user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, updatedUser, isFollowing ? "Unfollowed successfully" : "Followed successfully")
    );
});

const getUserFollowers = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const user = await User.findOne({ username: username.toLowerCase() })
        .populate("followers", "username name profilePhoto bio isVerified")
        .select("followers");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user.followers, "Followers fetched successfully")
    );
});

const getUserFollowing = asyncHandler(async (req, res) => {
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const user = await User.findOne({ username: username.toLowerCase() })
        .populate("following", "username name profilePhoto bio isVerified")
        .select("following");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, user.following, "Following fetched successfully")
    );
});

export {
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
};
