import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js"
import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import Comment from '../models/comment.model.js'
import mongoose from "mongoose";

const handleError = (res, statusCode, message) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

const createPost = async (req, res) => {
    try {
        const caption = req.body.caption;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(401).json({
                success: false,
                message: 'Image required !!'
            })
        }
        // optimizing image quality and size
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ height: 800, width: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer()

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudResp = await cloudinary.uploader.upload(fileUri)

        const post = await Post.create({
            author: authorId,
            caption,
            image: cloudResp.secure_url
        })
        if (!post) {
            return res.status(401).json({
                success: false,
                message: 'Unable to create post , please retry !!'
            })
        }

        const user = await User.findById(authorId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found !!'
            });
        }

        user.posts.push(post._id);
        await user.save()
        // .catch(()=>{
        //     handleError(res,400,'Unable to save post , please retry !!')
        // })

        await post.populate({ path: 'author', select: '-password' });
        return res.status(200).json({
            success: true,
            message: 'Post created successfully !!',
            post
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getAllPosts = async (req, res) => {
    try {
        const allPosts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({ path: 'comments', select: 'username profilePicture' })
        return res.status(200).json({
            success: true,
            allPosts
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getPostByUser = async (req, res) => {
    try {
        const authorId = req.id;
        const allPosts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({ path: 'comments', select: 'username profilePicture' })
        return res.status(200).json({
            success: true,
            allPosts
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}
const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(404).json({
                success: false,
                message: 'Post not found !!'
            });
        }
        const post = await Post.findOne({ _id: postId })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({ path: 'comments', select: 'username profilePicture' })

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found !!'
            });
        }
        return res.status(200).json({
            success: true,
            post
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const likeUnlike = async (req, res) => {
    try {
        const mainUserId = req.id;
        const postId = req.params.id;

        const mainUser = await User.findById(mainUserId);
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found !!'
            });
        }

        if (!mainUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found !!'
            });
        }

        const isLiked = post.likes.includes(mainUserId);
        if (isLiked) {
            // doUnlike
            await post.updateOne({ $pull: { likes: mainUserId } })
            return res.status(200).json({
                success: true,
                message: 'Post unliked successfully !!'
            });
        }
        else {
            // do Like
            await post.updateOne({ $addToSet: { likes: mainUserId } })
            return res.status(200).json({
                success: true,
                message: 'Post liked successfully !!'
            });
        }

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }
}

const likePost = async (req, res) => {
    try {
        const mainUser = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found !!'
            });
        }

        await post.updateOne({ $addToSet: { likes: mainUser } })
        return res.status(200).json({
            success: true,
            message: 'Post liked successfully !!'
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const unlikePost = async (req, res) => {
    try {
        const mainUser = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found !!'
            });
        }

        await post.updateOne({ $pull: { likes: mainUser } })
        return res.status(200).json({
            success: true,
            message: 'Post unliked successfully !!'
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const addComment = async (req, res) => {
    try {
        const postId = req.params.id;
        const mainUser = req.id;
        const text = req.body.text;
        if (!text) {
            return res.status(400).json({
                success: false,
                message: 'Text is required !!'
            });
        }
        const post = await Post.findById(postId);
        const comment = await Comment.create({
            text,
            post: postId,
            author: mainUser
        })
            .populate({ path: 'author', select: 'username profilePicture' })

        post.comments.push(comment._id)
        await post.save()

        return res.status(201).json({
            success: true,
            comment,
            message: 'Commented successfully !!'
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getCommentsByPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const allComments = await Comment.find({ post: postId }).populate({ path: 'user', select: 'username profilePicture' })
        if (!allComments) {
            return res.status(404).json({
                success: false,
                message: 'Comments not found !!'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Comments found !!',
            allComments
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }
}

const deletePost = async (req, res) => {
    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        const mainUser = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(400).json({
                success: false,
                message: 'Post not found !!'
            });
        }
        if (post.author.toString() !== mainUser) {
            return res.status(403).json({
                success: false,
                message: 'User not authorized !!'
            });
        }
        const delPost = await post.deleteOne({ session });
        const delComments = await Comment.deleteMany({ post: postId }, { session });
        const user = await User.findByIdAndUpdate(mainUser, { $pull: { posts: postId } }, { session })
        if (!delPost || !delComments || !user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Unable to delete post !!'
            });
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json({
            success: true,
            message: 'Post deleted !!'
        });
    } catch (error) {
        console.log(error);
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const handleSavedPost = async (req, res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId)
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post || !user) {
            return res.status(400).json({
                success: false,
                message: 'User/Post not found !!'
            });
        }
        if (user.saved.includes(postId)) {
            // unsave
            await user.updateOne({ $pull: { saved: postId } })
            return res.status(200).json({
                success: true,
                message: 'Post unsaved !!'
            });
        }
        else {
            //save
            await user.updateOne({ $push: { saved: postId } })
            return res.status(200).json({
                success: true,
                message: 'Post saved !!'
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const postController = {
    createPost,
    getAllPosts,
    getPostByUser,
    getPostById,
    likeUnlike,
    likePost,
    unlikePost,
    addComment,
    getCommentsByPost,
    deletePost,
    handleSavedPost
}

export default postController;