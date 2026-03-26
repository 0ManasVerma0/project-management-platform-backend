import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email is invalid"),
        body("username").trim().notEmpty().withMessage("Username is required").isLowercase().withMessage("Must me in lowercase").isLength({min: 3}).withMessage("Username must be atleast 3 characters long"),
        body("password").trim().notEmpty().withMessage("Password is required"),
        body("fullName").optional().trim()
    ]
}

export {userRegisterValidator}