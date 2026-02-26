import mongoose, { mongo, Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new Schema({

    avatar: {
        type: {
            url: String,
            localPath: String
        },
        default: {
            url: `https://placehold.co/200`,
            localPath: ""
        }
    },

    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    fullName: {
        type: String,
        trim: true
    },

    password: {
        type: String,
        required: [true, "password is required"]
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    refreshToken: {
        type: String
    },

    forgotPasswordToken: {
        type: String
    },

    forgotPasswordExpiry: {
        type: Date
    },

    emailVerificationToken: {
        type: String
    },

    emailVerificationExpiry: {
        type: Date
    }
},
    {
        timestamps: true
    })

//defining a pre hook
//pre hook => this runs just before saving the schema data in database
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()  //this will save from the cases where password is not changed

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//In this way you can define methods in mongoose
UserSchema.methods.isPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}

//Generation of JSON web token access and refresh token 

//Data tokens
UserSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username
    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
}

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this.id
    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
}

//without data tokens
UserSchema.methods.generateTemporaryToken = function () {
    const unhashedToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto.createHash("sha256")
        .update(unhashedToken)
        .digest("hex")

    const tokenExpiry = Date.now() + (20 * 60 * 1000) //20 mins
    return {unhashedToken, hashedToken, tokenExpiry}
}


export const User = mongoose.model("User", UserSchema)

