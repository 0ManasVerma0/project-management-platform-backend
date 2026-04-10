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
    const {projectId} = req.params

    const project = await Project.findById(projectId)

    if(!project){
        throw new apiError(404, "Project Not Found")
    }

    const tasks = await tasks.find({
        project: new mongoose.Types.ObjectId(projectId)
    }).populate("assignedTo", "avatar username fullName")

    return res
        .status(200)
        .json(new apiResponse(200, tasks, "Task Fetched Successfully"))
})

const createTask = asyncHandler(async(req, res) => {
    const {title, description, assignedTo, status} = req.body
    const {projectId} = req.params

    const project = await Project.findById(projectId)

    if(!project){
        throw new apiError(404, "Project Not Found")
    }

    const files = req.files || []
    const attachments = files.map((file) => {
        return {
            url: `${process.env.SERVER_URL}/images/${file.originalname}`,
            mimetype: file.mimetype,
            size: file.size
        }
    })
    const task = await tasks.create({
        title,
        description,
        project: new mongoose.Types.ObjectId(projectId),
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        status,
        assignedBy: new mongoose.Types.ObjectId(req.user._id),
        attachments
    })

    return res
        .status(201)
        .json(new apiResponse(201, task, "Task created Successfully"))
})

const getTaskById = asyncHandler(async(req, res) => {
    const {taskId} = req.params
    const task = await tasks.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(taskId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo",
                pipeline: [
                    {
                        _id: 1,
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                ]
            }
        },
        {
            $lookup:{
                from: "subtasks",
                localField: "_id",
                foreignField: "task",
                as: "subtask",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {$project: {
                                    _id: 1,
                                    username: 1,
                                    fullName: 1,
                                    avatar: 1
                                }}
                            ]
                        }
                    },
                    {
                        $addFields: {
                            createdBy: {
                                $arrayElemAt: ["$createdBy", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                assignedTo: {
                    $arrayElemAt: ["$assignedTo", 0]
                }
            }
        }
    ])

    if(!task || task.length == 0){
        throw new apiError(404, "Task not found" )
    }
    return res.status(200).json(new apiResponse(200, task[0], "Task Fetched Successfully"))
})

const updateTask = asyncHandler(async(req, res) => {
    const {title, description} = req.body
    const {taskId} = req.params

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        throw new apiError(400, "Invalid task id")
    }

    const updatePayload = {}

    if(typeof title !== "undefined"){
        updatePayload.title = title
    }

    if(typeof description !== "undefined"){
        updatePayload.description = description
    }

    if(Object.keys(updatePayload).length === 0){
        throw new apiError(400, "No fields provided to update")
    }

    const task = await tasks.findByIdAndUpdate(
        taskId,
        {$set: updatePayload},
        {
            new: true,
            runValidators: true
        }
    )

    if(!task){
        throw new apiError(404, "Task Not Found")
    }
    return res
        .status(200)
        .json(new apiResponse(200, task, "Task updated Successfully"))
})

const deleteTask = asyncHandler(async(req, res) => {
    const {taskId} = req.params

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        throw new apiError(400, "Invalid task id")
    }

    const task = await tasks.findByIdAndDelete(taskId)
    if(!task){
        throw new apiError(404, "Task Not Found")
    }
    return res
        .status(200)
        .json(new apiResponse(200, task, "Task Deleted Successfully"))
})

const createSubtask = asyncHandler(async(req, res) => {
const {title} = req.body
    const {taskId} = req.params

    if(!mongoose.Types.ObjectId.isValid(taskId)){
        throw new apiError(400, "Invalid task id")
    }

    const task = await tasks.findById(taskId)

    if(!task){
        throw new apiError(404, "Task Not Found")
    }

    const newSubtask = await subtask.create({
        title,
        task: new mongoose.Types.ObjectId(taskId),
        createdBy: new mongoose.Types.ObjectId(req.user._id)
    })

    return res
        .status(201)
        .json(new apiResponse(201, newSubtask, "Subtask created Successfully"))
})

const updateSubtask = asyncHandler(async(req, res) => {
    const {title, isCompleted} = req.body
    const {subtaskId} = req.params

    if(!mongoose.Types.ObjectId.isValid(subtaskId)){
        throw new apiError(400, "Invalid subtask id")
    }

    const updatePayload = {}

    if(typeof title !== "undefined"){
        updatePayload.title = title
    }

    if(typeof isCompleted !== "undefined"){
        updatePayload.isCompleted = isCompleted
    }

    if(Object.keys(updatePayload).length === 0){
        throw new apiError(400, "No fields provided to update")
    }

    const updatedSubtask = await subtask.findByIdAndUpdate(
        subtaskId,
        {$set: updatePayload},
        {
            new: true,
            runValidators: true
        }
    )

    if(!updatedSubtask){
        throw new apiError(404, "Subtask Not Found")
    }

    return res
        .status(200)
        .json(new apiResponse(200, updatedSubtask, "Subtask updated Successfully"))
})

const deleteSubtask = asyncHandler(async(req, res) => {
    const {subtaskId} = req.params

    if(!mongoose.Types.ObjectId.isValid(subtaskId)){
        throw new apiError(400, "Invalid subtask id")
    }

    const deletedSubtask = await subtask.findByIdAndDelete(subtaskId)

    if(!deletedSubtask){
        throw new apiError(404, "Subtask Not Found")
    }

    return res
        .status(200)
        .json(new apiResponse(200, deletedSubtask, "Subtask Deleted Successfully"))
})

export {getTask, createTask, getTaskById,updateTask, deleteTask, createSubtask, updateSubtask, deleteSubtask}
