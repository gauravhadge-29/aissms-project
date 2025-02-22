import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

// Register user
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if ([fullName, email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) throw new ApiError(400, "Avatar file is required");

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const provider = "local";

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        email,
        password,
        provider,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    req.session.userId = user._id;  // Store userId in session
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200, { user: loggedInUser, accessToken }, "User logged in successfully")
    );
});


//loginwithgoogle
const loginWithGoogle = asyncHandler(async (req, res) => {
    const { uid, fullName, email, avatar } = req.body;

    if (!uid || !email) {
        throw new ApiError(400, "Google login failed, missing data");
    }

    let user = await User.findOne({ email });

    if (!user) {
        user = await User.create({
            uid : uid,
            fullName: fullName,
            email,
            username: email.split("@")[0], // Generate a default username
            avatar : avatar,
            provider: "google", // To track that it's a Google login
        });
    }

    console.log("Created user: ",user)

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);
    console.log(refreshToken)
    console.log(accessToken)

    // localStorage.setItem("accessToken",accessToken)
    // localStorage.setItem("refreshToken",refreshToken)
    req.session.userId = user._id;  // Store userId in session
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(200, { user, accessToken, refreshToken }, "Google login successful")
        );
});

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
    // console.log("request came")
    // console.log("Cookies received:", req.cookies);
    // console.log("Session before logout:", req.session);

    if (!req.session || !req.session.userId) {
        return res.status(401).json(new ApiResponse(401, {}, "Unauthorized: No active session"));
    }

    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            throw new ApiError(500, "Error logging out");
        }

        res.clearCookie("connect.sid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });

        return res.status(200).json(new ApiResponse(200, {}, "User logged out"));
    });
});




// Refresh access token
const refreshAccessToken = asyncHandler(async (req, res) => {
    if (!req.session.refreshToken) {
        throw new ApiError(401, "Unauthorized Access");
    }

    try {
        const decodedToken = jwt.verify(req.session.refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) throw new ApiError(401, "Invalid Refresh Token");

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        req.session.accessToken = accessToken;
        req.session.refreshToken = newRefreshToken;

        return res.status(200).json(new ApiResponse(200, { accessToken }, "Access Token Refreshed"));
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});

// Get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        req.user,
        "current user fetched successfully"
        )
    )
});



export { registerUser, loginUser,loginWithGoogle, logoutUser, refreshAccessToken, getCurrentUser };
