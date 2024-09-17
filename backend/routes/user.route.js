import express from "express";
import userController from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";


const router = express.Router()

router.route('/register').post(userController.register)
router.route('/login').post(userController.login)
router.route('/logout').get(userController.logout)
router.route('/profile/:username').get(userController.getProfile)
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'),userController.editProfile)
router.route('/suggested').get(isAuthenticated,userController.getSuggestedUsers)
router.route('/:id/followUnfollow').post(isAuthenticated,userController.followUnfollow)
router.route('/setLastSeen').post(userController.setLastSeen)

export default router;