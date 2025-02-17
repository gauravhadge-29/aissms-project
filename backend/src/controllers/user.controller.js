import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import  jwt  from "jsonwebtoken";



const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        // console.log(user)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        
        // console.log("Generated access Token: ",accessToken)
        // console.log("Generated refresh Token: ",refreshToken)

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false}) 

        
        return {accessToken,refreshToken}


    } catch (error) {
        throw new ApiError(500, "Sometthing Went wrong while generating access Token")
    }
}

const registerUser = asyncHandler( async (req,res)=>{
//steps
//get user details from front end
//validation
//check if user already exist
//checl for images, avatar
//upload them to cloudinary , avatar
//create user object -create entry in ddb
//remove password and refresh token from response
//check for user creation
//return res 




const {fullName,email,username,password} = req.body
//console.log("Email : ", email);

//validation
// if(fullName===""){
//     throw new ApiError(400, "Full name is required")
// }

if ([fullName,email,username,password].some((field)=>
        (field?.trim()===""))
) {
    throw new ApiError(400,"All fields are required..")
}

const existedUser = await User.findOne({
    $or: [{ username }, { email }]
})

if (existedUser) {
    throw new ApiError(409,"username or email already exists")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
let coverImageLocalPath ;

if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageLocalPath = req.files.coverImage[0].path
}

if(!avatarLocalPath){
    throw new ApiError(400,"Avatar File is required");
}



const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage  = await uploadOnCloudinary(coverImageLocalPath)
const provider = "local"

const user = await  User.create({
    fullName,
    avatar: avatar.url,
    coverImage:  coverImage?.url || "",
    email,
    password,
    provider,
    username: username.toLowerCase()
    
})

const createdUser  = await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering user")
}

return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered Successfully")
)
})

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

    const cookieOptions = {
        httpOnly: true,
        secure: false,
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

const loginUser = asyncHandler(async (req,res) => {
    //take data from req.body
    console.log(req.body)
    //username or email
    //find the user
    //password check
    //access and refresh token generate
    //send cookies
    //return response


    const {email, password} = req.body

    console.log(req.body)
    
    if (!email){
        throw new ApiError(400, "username or email is required")
    }
    
    const user= await User.findOne({
        email
    }).select("+password")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    console.log("came here")
    console.log(password)
    const isPasswordValid = await user.isPasswordCorrect(password)
    console.log("came here")

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Creditianls")
    }

    console.log("Password Verified")

    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id)
    // console.log("Access and refresh tokens: ",accessToken,refreshToken)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure:false,
    }

    console.log(loggedInUser)
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1
            }
        },{
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }
    localStorage.clear();
    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json( new ApiResponse (200,{}, "User Logged out successfully"))

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Access");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Expired");
        }

        // Generate new access & refresh tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        // Update stored refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }
});


const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword} = req.body

    const user  = await User.findById(req.user?._id)

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new ApiError(400, "Password Incorrect")
    }

    user.password = newPassword

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed Successfully"
        )
    )
})

const updateAccountDetails = asyncHandler( async(req,res)=>{
    const {fullName,email } = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
        $set:{
            fullName,
            email: email
        }
    },
    {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Account Details Updated")
    )

})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        req.user,
        "current user fetched successfully"
        )
    )
})


export {registerUser, loginUser,loginWithGoogle, logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser }





