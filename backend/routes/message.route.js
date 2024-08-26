import express from "express";
import messageController from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router()

router.route('/sendMsg/:id').post(isAuthenticated,messageController.sendMsg)
router.route('/allMsg/:id').get(isAuthenticated,messageController.getMsg)

export default router;