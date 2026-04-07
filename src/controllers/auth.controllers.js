import {User} from "../models/user.models.js";
import { apiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { apiResponse } from "../utils/api-response.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import Mailgen from "mailgen";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new apiError(
            500, 
            "something went wrong while generating tokens"
        )
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password, role} = req.body

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
    })

    if(existedUser){
        throw new apiError(409, "User with username or email already exists", [])
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false 
    })

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail(
        {
            email: user?.email,
            subject: "Please verify your email",
            mailgenContent: emailVerificationMailgenContent(
                user.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify/email/${unhashedToken}`
            ),
        }
    )

    const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    if(!createdUser){
        throw new apiError(500, "Something went wrong while registerting the user")
    }

    return res
    .status(201)
    .json(
        new apiResponse(
            200,
            {user: createdUser},
            "User registered successfully and verification email is sent to your email address"
        )
    )
})

const login = asyncHandler(async (req, res) => {
    const {email, password, username} = req.body

    if(!email){
        throw new apiError(400, "email is required")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new apiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordValid(password)
    if(!isPasswordValid){
        throw new apiError(400, "Invalid credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

    const looggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new apiResponse(
                200,
                {
                    user: looggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: "",
            }
        },
        {
            new: true,
        },
    )
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out"))
})

export {registerUser, login, logoutUser};