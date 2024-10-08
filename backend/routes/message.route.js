import express from "express";
import messageController from "../controllers/message.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router()

router.route('/sendMsg/:id').post(isAuthenticated,messageController.sendMsg)
router.route('/getAllMsg/:id').get(isAuthenticated,messageController.getMsg)
router.route('/getRecentChats').get(isAuthenticated,messageController.getRecentChats)
router.route('/getAllUsers').get(isAuthenticated,messageController.getAllUsers)
router.route('/seen/:messageId').post(messageController.markMsgAsSeen)
router.route('/seen/all/:receiverId').get(isAuthenticated,messageController.markAllMsgAsSeen)
router.route('/getShareUsers').get(isAuthenticated,messageController.getShareUsers)

export default router;