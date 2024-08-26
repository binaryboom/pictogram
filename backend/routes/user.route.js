import express from "express";
import userController from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";


const router = express.Router()

router.route('/register').post(userController.register)
router.route('/login').post(userController.login)
router.route('/logout').get(userController.logout)
router.route('/:id/profile').get(isAuthenticated,userController.getProfile)
router.route('/profile/edit').post(isAuthenticated,upload.single('profilePicture'),userController.editProfile)
router.route('/suggested').get(isAuthenticated,userController.getSuggestedUsers)
router.route('/followUnfollow/:id').post(isAuthenticated,userController.followUnfollow)

export default router;