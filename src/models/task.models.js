import mongoose, {Schema} from "mongoose";
import {AvailableTaskStatuses, TaskStatusEnums} from "../utils/constants.js"

const tasksSchema = new Schema({
    title:{
        type: String,
        required: true,
        trim: true
    },
    description: String,
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    assignedTo:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    status: {
        type: String,
        enum: AvailableTaskStatuses,
        default: TaskStatusEnums.TODO
    },
    attachments: {
        type: [{
            url: String,
            mimetype: String,
            size: Number
        }],
        default: []
    }
}, {timestamps: true})

export const tasks = mongoose.model("TaskSchema", tasksSchema)