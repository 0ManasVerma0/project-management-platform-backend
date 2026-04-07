import {User} from "../models/user.models.js";
import { apiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { apiResponse } from "../utils/api-response.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mail.js";
import Mailgen from "mailgen";
import jwt from "jsonwebtoken";

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

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new apiResponse(200, req.user, "Current User fetched Successfully")
        )
})

const verifyEmail = asyncHandler(async (req, res) => {
    const {verificationToken} = req.params

    if(!verificationToken){
        throw new apiError(400, "Email verification Token is missing")
    }
    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex")

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: {$gt: Date.now()}
        })

        if(!user){
            throw new apiError(400, "Token is invalid or expired")
        }

        user.emailVerificationToken = undefined;
        user.emailVerificationExpiry = undefined;

        user.isEmailVerified = true
        await user.save({validateBeforeSave: false})

        return res  
            .status(200)
            .json(
                new apiResponse(200, {isEmailVerified: true}, "Email is Verified")
            )
})

const resendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new apiError(404, "User does not exist")
    }
    if(user.isEmailVerified){
        throw new apiError(409, "Email is already verified")
    }

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

    return res  
        .status(200)
        .json(
            new apiResponse(200, {}, "New mail has been sent to your email ID")
        )

})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new apiError(401, "Unauthorized Access")
    }

    try {
        jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new apiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken != user?.refreshToken){
            throw new apiError(401, "refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);

        user.refreshToken = newRefreshToken;
        await user.save();

        return res  
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new apiResponse(
                    200,
                    {accessToken, refreshToken: newRefreshToken},
                    "Access Token Refreshed"
                )
            )
    } catch (error) {
        throw new apiError(401, "Invalid Refresh Token")
    }
})

const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body
    const user = await User.findOne({email})
    if(!user){
        throw new apiError(404, "User Does Not Exists", [])
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()
    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
            subject: "Password Reset Request",
            mailgenContent: forgotPasswordMailgenContent(
                user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`
            ),

    })

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {},
                "Password reset mail has been sent to your email address"
            )
        )
})

const resetForgotPassword = asyncHandler(async (req, res) => {
    const {resetToken} = req.params
    const {newPassword} = req.body

    let hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: {$gt: Date.now()}
    })

    if(!user){
        throw new apiError(489, "Token is Invalid or Expired")
    }

    user.forgotPasswordExpiry = undefined
    user.forgotPasswordToken = undefined

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "Password reset Successfully")
        )
})

const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id);

    const isPasswordValid = await isPasswordCorrect(oldPassword)

    if(!isPasswordValid){
        throw new apiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
        .status(200)
        .json(
            new apiResponse(200, {}, "Password Changed Successfully")
        )

})

export {registerUser, login, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, 
    forgotPasswordRequest, resetForgotPassword, changePassword};