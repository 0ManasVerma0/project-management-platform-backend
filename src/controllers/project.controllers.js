import {User} from "../models/user.models.js";
import {Project} from "../models/project.models.js"
import {ProjectMember} from "../models/projectmember.models.js"
import { apiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { apiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";
import { AvailableUserRole, userRoleEnums } from "../utils/constants.js";
import { pipeline } from "nodemailer/lib/xoauth2/index.js";

const getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectMember.aggregate([
    {
        $match: {
            user: new mongoose.Types.ObjectId(req.user._id)
        },
    },
    {
        $lookup: {
            from: "projects",
            localField: "projects",
            foreignField: "_id",
            as: "projects",
            pipeline: [
                {
                    $lookup: {
                        from: "projectmembers",
                        localField: "_id",
                        foreignField: "projects",
                        as: "projectmembers"
                    }
                },
                {
                    $addFields: {
                        members: {
                            $size: "$projectmembers",
                        }
                    }
                }

            ]
        }
    },
    {
        $unwind: "$project"
    },
    {
        $project: {
            project: {
                _id: 1,
                name: 1,
                description: 1,
                members: 1,
                createdAt: 1,
                createdBy: 1
            },
            role: 1,
            _id: 0
        }
    }
    ])

    return res.status(200).json(new apiResponse(200, projects, "Projects Fetched Successfully"))
})

const getProjectById = asyncHandler(async (req, res) => {
    const {projectId} = req.params
    const project = await Project.findById(projectId)
    if(!project){
        throw new apiError(404, "Project Not Found")
    }
    return res.status(200).json(new apiResponse(200, project, "Project Fetched Successfully"))
})

const createProject = asyncHandler(async (req, res)=> {
    const {name, description} = req.body
    const project = await Project.create({
        name,
        description,
        createdBy: new mongoose.Types.ObjectId(req.user._id),
    })

    await ProjectMember.create({
        user: new mongoose.Types.ObjectId(req.user._id),
        project: new mongoose.Types.ObjectId(project._id),
        role: userRoleEnums.ADMIN
    })

    return res
        .status(201)
        .json(new apiResponse(201, project, "Project created Successfully"))
})

const updateProject = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const {projectId} = req.params

    const project = await Project.findByIdAndUpdate(
        projectId,
        {
            name,
            description
        },
        {new: true}
    )

    if(!project){
        throw new apiError(404, "Project Not Found")
    }

    return res
        .status(201)
        .json(new apiResponse(200, project, "Project Updated Successfully"))
})

const deleteProject = asyncHandler(async (req, res) => {
    const {projectId} = req.params

    const project = await Project.findByIdAndDelete(projectId)

    if(!project){
        throw new apiError(404, "Project Not Found")
    }

    return res
        .status(201)
        .json(new apiResponse(200, project, "Project Deleted Successfully"))
})

const addMemberToProject = asyncHandler(async (req, res) => {
    const {email, role} = req.body
    const {projectId} = req.params

    const user = await User.findOne({email})
    if(!user){
        throw new apiError(404, "User does not exist")
    }

    await ProjectMember.findByIdAndUpdate({
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId)
    },{
        user: new mongoose.Types.ObjectId(user._id),
        project: new mongoose.Types.ObjectId(projectId),
        role: role
    },{
        new: true,
        upsert: true
    })

    return res.status(201).json(new apiResponse(201, "Project Member Added Successfully"))
})

const getProjectMembers = asyncHandler(async (req, res) => {
    const {projectId} =  req.params
    const project = await Project.findById(projectId)
    if(!project){
        throw new apiError(400, "Project Not Found")
    }

    const projectMembers = await ProjectMember.aggreage([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                user: {
                    $arrayElemAt: ["$user", 0]
                }
            }
        },
        {
            $project: {
                project: 1,
                user: 1,
                role: 1,
                createdAt: 1,
                updateAt: 1,
                _id: 1
            }
        }
    ])

    return res.status(200).json(new apiResponse(200, projectMembers, "Project Members Fetched"))
})

const updateMemberRole = asyncHandler(async (req, res) => {
    const {projectId, userId} = req.params
    const {newRole} = req.body
    
    if(!AvailableUserRole.includes(newRole)){
        throw new apiError(400, "Invalid Role")
    }

    let projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new apiError(400, "Project Member Not Found")
    }

    projectMember = await ProjectMember.findByIdAndUpdate(
        projectMember._id,
        {
            role: newRole
        },
        {new: true}
    )
    if(!projectMember){
        throw new apiError(400, "Project Member Not Found")
    }

    return res.status(200).json(new apiResponse(200, projectMember, "Updated Project Member Role"))
})

const deleteMember = asyncHandler(async (req, res) => {
    const {projectId, userId} = req.params

    let projectMember = await ProjectMember.findOne({
        project: new mongoose.Types.ObjectId(projectId),
        user: new mongoose.Types.ObjectId(userId)
    })

    if(!projectMember){
        throw new apiError(400, "Project Member Not Found")
    }

    projectMember = await ProjectMember.findByIdAndDelete(
        projectMember._id
    )
    if(!projectMember){
        throw new apiError(400, "Project Member Not Found")
    }

    return res.status(200).json(new apiResponse(200, projectMember, "Project Member Deleted Successfully"))
})

export {getProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, getProjectMembers, updateMemberRole, deleteMember}