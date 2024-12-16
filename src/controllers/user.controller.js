import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.models.js';//this user can directy interact with mongodb because it is made using mongoose
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


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
    const existedUser = User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser) {
        throw new ApiError(409,"User with username or email already exists.");
    }
    // 4
    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;
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

export {registerUser}