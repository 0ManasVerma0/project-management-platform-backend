import mongoose, {mongo, Schema} from "mongoose";
import bcrypt from "bcrypt";

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
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()  //this will save from the cases where password is not changed

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

//In this way you can define methods in mongoose
UserSchema.methods.isPassword = async function(password){
    return await bcrypt.compare(password, this.password)
}

export const User = mongoose.model("User", UserSchema)

