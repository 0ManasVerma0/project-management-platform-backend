import {apiResponse} from "../utils/api-response.js"
import { asyncHandler } from "../utils/async-handler.js"

// const healthCheck = async (req, res, next) => {
//     try {
//         res.status(200).json(new apiResponse(200, {message: "Server is running"}))
//     } 
//     catch (error) {
//         next(error)
//     }
// }

// both the method to handle healthcheck is ok that can be seen above and below here 

const healthCheck = asyncHandler(async (req, res) => {
    res.status(200).json(new apiResponse(200, {message: "Server is running"}))
})

export {healthCheck}