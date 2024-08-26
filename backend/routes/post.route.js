import express from "express";
import postController from "../controllers/post.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router()

router.route('/createPost').post(isAuthenticated,upload.single('image'),postController.createPost);
router.route('/allPost').post(isAuthenticated,postController.getAllPosts);
router.route('/userPost/all').post(isAuthenticated,postController.getPostByUser);
router.route(':id/like').get(isAuthenticated,postController.likePost);
router.route(':id/unlike').get(isAuthenticated,postController.unlikePost);
router.route(':id/newComment').get(isAuthenticated,postController.addComment);
router.route(':id/comment/all').get(isAuthenticated,postController.getCommentsByPost);
router.route(':id/delete').get(isAuthenticated,postController.deletePost);
router.route(':id/handleSavedPost').get(isAuthenticated,postController.handleSavedPost);



export default router;