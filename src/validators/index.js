import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email is invalid"),
        body("username").trim().notEmpty().withMessage("Username is required").isLowercase().withMessage("Must me in lowercase").isLength({min: 3}).withMessage("Username must be atleast 3 characters long"),
        body("password").trim().notEmpty().withMessage("Password is required"),
        body("fullName").optional().trim()
    ]
}

const userLoginValidator = () => {
    return [
        body("email").optional().isEmail().withMessage("Email is Invalid"),
        body("password").notEmpty().withMessage("Password is required")
    ]
}

const userChangeCurrentPasswordValidator = () => {
    return [
        body("oldPassword").notEmpty().withMessage("Old Password is Required"),
        body("newPasswrod").notEmpty().withMessage("New Password is Required")
    ]
}

const userForgotPasswordValidator = () => {
    return [
        body("email").notEmpty().withMessage("Email is Required").isEmail().withMessage("Email is Invalid")
    ]
}

const userResetForgotPasswordValidator = () => {
    return [
        body("newPassword").notEmpty().withMessage("Password is Required")
    ]
}

export {userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userResetForgotPasswordValidator}