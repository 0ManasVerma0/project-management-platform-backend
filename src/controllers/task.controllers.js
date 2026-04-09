import {User} from "../models/user.models.js";
import {Project} from "../models/project.models.js"
import {tasks} from "../models/task.models.js"
import {subtask} from "../models/subtask.models.js"
import { apiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { apiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { AvailableUserRole, userRoleEnums } from "../utils/constants.js";

const getTask = asyncHandler(async(req, res) => {

})

const createTask = asyncHandler(async(req, res) => {

})

const getTaskById = asyncHandler(async(req, res) => {

})

const updateTask = asyncHandler(async(req, res) => {

})

const deleteTask = asyncHandler(async(req, res) => {

})

const createSubtask = asyncHandler(async(req, res) => {

})

const updateSubtask = asyncHandler(async(req, res) => {

})

const deleteSubtask = asyncHandler(async(req, res) => {

})

export {getTask, createTask, getTaskById,updateTask, deleteTask, createSubtask, updateSubtask, deleteSubtask}
