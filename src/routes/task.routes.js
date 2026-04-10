import { Router } from "express";
import { 
    getTask, 
    createTask, 
    getTaskById, 
    updateTask, 
    deleteTask, 
    createSubtask, 
    updateSubtask, 
    deleteSubtask 
} from "../controllers/task.controllers.js";
import { validate } from "../middleware/validator.middleware.js";
import { 
    createTaskValidator, 
    updateTaskValidator, 
    createSubtaskValidator, 
    updateSubtaskValidator 
} from "../validators/index.js";
import { verifyJWT, validateProjectPermission } from "../middleware/auth.middleware.js";
import { AvailableUserRole, userRoleEnums } from "../utils/constants.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();
router.use(verifyJWT);

// Task routes
// GET /:projectId - List project tasks (secured, role-based)
router
    .route("/:projectId")
    .get(validateProjectPermission(AvailableUserRole), getTask)
    // POST /:projectId - Create task (secured, Admin/Project Admin)
    .post(
        validateProjectPermission([userRoleEnums.ADMIN, userRoleEnums.PROJECT_ADMIN]),
        upload.array("attachments", 5),
        createTaskValidator(),
        validate,
        createTask
    );

// Task details route
// GET /:projectId/t/:taskId - Get task details (secured, role-based)
router
    .route("/:projectId/t/:taskId")
    .get(validateProjectPermission(AvailableUserRole), getTaskById)
    // PUT /:projectId/t/:taskId - Update task (secured, Admin/Project Admin)
    .put(
        validateProjectPermission([userRoleEnums.ADMIN, userRoleEnums.PROJECT_ADMIN]),
        updateTaskValidator(),
        validate,
        updateTask
    )
    // DELETE /:projectId/t/:taskId - Delete task (secured, Admin/Project Admin)
    .delete(
        validateProjectPermission([userRoleEnums.ADMIN, userRoleEnums.PROJECT_ADMIN]),
        deleteTask
    );

// Subtask routes
// POST /:projectId/t/:taskId/subtasks - Create subtask (secured, Admin/Project Admin)
router
    .route("/:projectId/t/:taskId/subtasks")
    .post(
        validateProjectPermission([userRoleEnums.ADMIN, userRoleEnums.PROJECT_ADMIN]),
        createSubtaskValidator(),
        validate,
        createSubtask
    );

// Subtask details route
// PUT /:projectId/st/:subtaskId - Update subtask (secured, role-based - all members can update status)
router
    .route("/:projectId/st/:subtaskId")
    .put(
        validateProjectPermission(AvailableUserRole),
        updateSubtaskValidator(),
        validate,
        updateSubtask
    )
    // DELETE /:projectId/st/:subtaskId - Delete subtask (secured, Admin/Project Admin)
    .delete(
        validateProjectPermission([userRoleEnums.ADMIN, userRoleEnums.PROJECT_ADMIN]),
        deleteSubtask
    );

export default router;
