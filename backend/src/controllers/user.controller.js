import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    const {name, email, password} = req.body

    if( 
        [name, email, password].some(
            (field)=> !field || field?.trim()===""
        )
    ){
        throw new ApiError(400, "All feilds are required")
    }

    const existedUser = await User.findOne({
        email
    })

    if(existedUser){
        throw new ApiError(409, "User with email already exists")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: avatar.secure_url
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user");
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );
})

const loginUser = asyncHandler(async(req, res)=>{
    const {email, password} = req.body;

    if(!email || !password){
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Password incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(
                200,
                {},
                "User logged out successfully"
            )
        );
});


export {registerUser, loginUser, logoutUser}