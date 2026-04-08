import { Router } from "express";
import { getProjects, getProjectById, createProject, updateProject, deleteProject, addMemberToProject, getProjectMembers, updateMemberRole, deleteMember } from "../controllers/project.controllers.js";
import { validate } from "../middleware/validator.middleware.js";
import { addMemberToProject, addMembersToProjectValidator, createProjectValidator } from "../validators/index.js";
import { verifyJWT, validateProjectPermission } from "../middleware/auth.middleware.js";
import { AvailableUserRole, userRoleEnums } from "../utils/constants.js";
const router = Router();
router.use(verifyJWT)

router
    .route("/")
    .get(getProjects)
    .post(createProjectValidator(), validate, createProject)

router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getProjectById)
    .put(validateProjectPermission([userRoleEnums.ADMIN]), createProjectValidator(), validate, updateProject)
    .delete(validateProjectPermission([userRoleEnums.ADMIN]), deleteProject)

router
    .route("/:projectId/members")
    .get(getProjectMembers)
    .post(validateProjectPermission(userRoleEnums.ADMIN), addMembersToProjectValidator(), validate, addMemberToProject)

router
    .route("/:projectId/members/:userId")
    .put(validateProjectPermission([userRoleEnums.ADMIN]), updateMemberRole)
    .delete(validateProjectPermission([userRoleEnums.ADMIN]), deleteMember)

export default router