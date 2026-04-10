import { body } from "express-validator";
import {AvailableUserRole, AvailableTaskStatuses} from "../utils/constants.js"

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

const createProjectValidator = () => {
    return [
        body("name").notEmpty().withMessage("Name is Required"),
        body("description").optional()
    ]
}

const addMembersToProjectValidator = () => {
    return [
        body("email").trim().notEmpty().withMessage("email is required").isEmail().withMessage("email is invalid"),
        body("role").notEmpty().withMessage("Role is Required").isIn(AvailableUserRole).withMessage("Role is Invalid")

    ]
}

const createTaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("Title is Required"),
        body("description").optional().trim(),
        body("assignedTo").optional().isMongoId().withMessage("Invalid assignedTo user id"),
        body("status").optional().isIn(AvailableTaskStatuses).withMessage("Invalid task status")
    ]
}

const updateTaskValidator = () => {
    return [
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("description").optional().trim(),
        body("status").optional().isIn(AvailableTaskStatuses).withMessage("Invalid task status")
    ]
}

const createSubtaskValidator = () => {
    return [
        body("title").trim().notEmpty().withMessage("Subtask title is Required")
    ]
}

const updateSubtaskValidator = () => {
    return [
        body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
        body("isCompleted").optional().isBoolean().withMessage("isCompleted must be a boolean")
    ]
}

export {userRegisterValidator, userLoginValidator, userChangeCurrentPasswordValidator, userForgotPasswordValidator, userResetForgotPasswordValidator, createProjectValidator, addMembersToProjectValidator, createTaskValidator, updateTaskValidator, createSubtaskValidator, updateSubtaskValidator}