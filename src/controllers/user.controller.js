import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.models.js';//this user can directy interact with mongodb because it is made using mongoose
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});//no validation:(no passwd check) before saving in mongodb

        return {accessToken,refreshToken};

    } catch (error) {
        throw new ApiError(500,error?.message || "Something went wrong while generating access and refresh tokens");
    }
}

const registerUser = asyncHandler(async(req,res) => {
    // STEPS FOR REGISTERING
    // 1.get user details from frontend
    // 2.validate - not empty,etc
    // 3.check if user already exists: using username,email
    // 4.check for images/avatar
    // 5.upload them to cloudinary,avatar
    // 6.create user object - to create entry in DB
    // 7.remove password and refresh token field from the response
    // 8.check for user creation
    // 9.return response with user details

    // 1
    const {username,fullName,email,password} = req.body;
    console.log(username);
    // 2
    if(
        [username,fullName,email,password].some((field) => 
            field?.trim() === ""
        )
    ) {
        throw new ApiError(400,"All fields are required");
    }
    // 3
    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser) {
        throw new ApiError(409,"User with username or email already exists.");
    }
    // 4
    const avatarLocalPath = req.files?.avatar[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;
    // instead of line 40 write line 42 to 45: so that if coverimage is not inserted then no error may occur
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }
    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar is required.");
    }
    // 5
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if(!avatar) {
        throw new ApiError(400,"Avatar is required.");
    }
    // 6
    const user = await User.create({
        username: username.toLowerCase(),
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password
    })
    // TO CHECK WHETHER THE ABOVE USER IS SUCCESSFULLY CREATED AND ENTERED IN DB
    // 7 : to remove password and refreshToken from the response
    const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
    )
    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering user");
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered successfully !")
    )

});

const loginUser = asyncHandler(async(req,res) => {
    // 1. get data from req body 
    // 2. username or email
    // 3. check if user exists:find user
    // 4. check password(if user exists)
    // 5. if password is correct then generate access and refresh tokens
    // 6. send cookie(with tokens)

    // 1 and 2
    const {username,email,password} = req.body;
    if(!username && !email) {
        throw new ApiError(400,"Username or email is required")
    }
    // 3
    const user = await User.findOne({
        $or: [{username},{email}]
    });
    if(!user) {
        throw new ApiError(404,"User does not exists !");
    }
    // 4
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(404,"Wrong password");
    }   
    // 5 created special method
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

    // 6
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure:true//by these 2 options we are saying that this cookie should only be accessed or modifiable by server
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(
        new ApiResponse(
            200,
            {
                user:loggedInUser,accessToken,refreshToken
            },
            "User logged in successfully !"
        )
    )
});


const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken: undefined}
        },
        {
            new:true
        }
    )
    const cookieOptions = {
        httpOnly: true,
        secure:true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(
        new ApiResponse(200,{},"User logged out successfully !!!")
    )
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request: No refresh token provided");
        }

        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh token: User not found");
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or mismatched");
        }

        const cookieOptions = {
            httpOnly: true,
            secure: true,
        };
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", newRefreshToken, cookieOptions)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully!!!"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "An error occurred while refreshing tokens");
    }
});




export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}