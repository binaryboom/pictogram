import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js"
import Post from '../models/post.model.js'
import User from '../models/user.model.js'
import Comment from '../models/comment.model.js'
import mongoose from "mongoose";
import { getReceiverSocketId, io } from "../socket/socket.js";

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

        // //gpt
        // const imageFormat = image.mimetype.split('/')[1]; // e.g., 'jpeg', 'png'

        // // Optimize image quality and size while preserving original format
        // const optimizedImageBuffer = await sharp(image.buffer)
        //     .resize({ height: 800, width: 800, fit: 'inside' })
        //     .toFormat(imageFormat, { quality: 80 })
        //     .toBuffer();

        // const fileUri = `data:image/${imageFormat};base64,${optimizedImageBuffer.toString('base64')}`;
        // const cloudResp = await cloudinary.uploader.upload(fileUri, {
        //     resource_type: 'auto' // Automatically detects the file type
        // });
        // //gpt ends


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
            .catch(() => {
                handleError(res, 400, 'Unable to save post , please retry !!')
            })

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
            .populate({ path: 'author', select: 'username profilePicture isVerified' })
            .populate({ path: 'comments', select: 'username profilePicture isVerified' })
            .populate({ path: 'likes', select: 'username profilePicture isVerified',options: { sort: { createdAt: -1 } } })
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
            .populate({ path: 'comments', select: 'username profilePicture',options: { sort: { createdAt: -1 } } })
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
            .populate({ path: 'author', select: 'username profilePicture isVerified' })
            .populate({
                path: 'comments', // Populate the comments field
                populate: {
                    path: 'author', // Within each comment, populate the author field
                    select: 'username profilePicture isVerified' // Select the fields you want from the User model
                },
                options: { sort: { createdAt: -1 } }
            })
            .populate({ path: 'likes', select: 'username profilePicture isVerified',options: { sort: { createdAt: -1 } } })
        // .populate({ path: 'comments', select: 'username profilePicture' })

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
            const postLikes = await Post.findById(postId).select('likes')
            if(post.author.toString()!==mainUserId){
                const notification={
                    type:'unlike',
                    user:mainUser,
                    postId,
                    message: ``
                }
                const postAuthorSocketId=getReceiverSocketId(post.author.toString())
                io.to(postAuthorSocketId).emit('notifications',notification)
            }
            return res.status(200).json({
                success: true,
                message: 'Post unliked successfully !!',
                postLikes
            });
        }
        else {
            // do Like
            await post.updateOne({ $addToSet: { likes: mainUserId } })
            const postLikes = await Post.findById(postId).select('likes')
            const mainUser=await User.findById(mainUserId).select('username profilePicture')
            // if(post.author._id)
            if(post.author.toString()!==mainUserId){
                const notification={
                    type:'like',
                    user:mainUser,
                    postId,
                    message: ` liked your post`
                }
                const postAuthorSocketId=getReceiverSocketId(post.author.toString())
                io.to(postAuthorSocketId).emit('notifications',notification)
            }
            return res.status(200).json({
                success: true,
                message: 'Post liked successfully !!',
                postLikes
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
        // console.log(req.body)
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
        // .populate({ path: 'author', select: 'username profilePicture' })

        post.comments.push(comment._id)
        await post.save()
        const postComments = await Post.findById(postId)
            .select('comments')
            .populate({
                path: 'comments', // Populate the comments field
                populate: {
                    path: 'author', // Within each comment, populate the author field
                    select: 'username profilePicture isVerified' // Select the fields you want from the User model
                },
                options: { sort: { createdAt: -1 } } // Use the 'options' field to specify sorting
            })
            
        return res.status(201).json({
            success: true,
            postComments,
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
        const allComments = await Comment.find({ post: postId }).populate({ path: 'user', select: 'username profilePicture isVerified' })
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
            const userSaved = await User.findById(userId).select('saved')
            // console.log(userSaved)
            return res.status(200).json({
                success: true,
                message: 'Post unsaved !!',
                userSaved
            });
        }
        else {
            //save
            await user.updateOne({ $push: { saved: postId } })
            const userSaved = await User.findById(userId).select('saved')
            // console.log(userSaved)
            return res.status(200).json({
                success: true,
                message: 'Post saved !!',
                userSaved
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