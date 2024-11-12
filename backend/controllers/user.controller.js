import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getDataUri from '../utils/datauri.js';
import cloudinary from '../utils/cloudinary.js';
import { getReceiverSocketId, io } from '../socket/socket.js';


const register = async (req, res) => {
    try {
        let { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                success: false,
                message: 'Some details are missing !!'
            })
        }


        const existingEmail = await User.findOne({ email });
        const existingUsername = await User.findOne({ username });
        const bothExisting=await User.findOne({ email }) && await User.findOne({ username })
        if (bothExisting) {
            return res.status(401).json({
                success: false,
                message: 'User is already registered with provided email and username !',
            });
        }
        if (existingEmail) {
            return res.status(401).json({
                success: false,
                message: 'Email is already registered!',
            });
        }

        if (existingUsername) {
            return res.status(401).json({
                success: false,
                message: 'Username is already taken!',
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({
            success: true,
            message: 'Account created sucessfully !!'
        })
    }
    catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const login = async (req, res) => {
    try {
        let { usernameEmail, password } = req.body;
        if (!usernameEmail || !password) {
            return res.status(401).json({
                success: false,
                message: 'Some details are missing !!'
            })
        }
        const user = await User.findOne({ email: usernameEmail }) || await User.findOne({ username: usernameEmail })
            .populate('posts')
        // .select('-password')
        // console.log(user)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist !!'
            })
        }
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect Password !!'
            })
        }
        user.password = null;
        //    let { password:pw, ...userData } = user._doc;
        // user={
        //     userId:user._id,
        //     username:user.username,
        //     email:user.email,
        //     bio:user.bio,
        //     profilePicture:user.profilePicture,
        //     followers:user.followers,
        //     following:user.following,
        //     posts:user.posts
        // }
        const token = jwt.sign({ userId: user._id }, process.env.SecretKey, { expiresIn: '31d' });
        return res.cookie('token', token, { httpOnly: true, sameSite: 'strict', maxAge: 31 * 24 * 60 * 60 * 1000 }).json({
            success: true,
            message: `Welcome Back ${user.username} !!`,
            user
        })

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const logout = async (req, res) => {
    try {
        return res.cookie('token', '', { maxAge: 0 }).json({
            success: true,
            message: 'Logged out successfully !!'
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getProfile = async (req, res) => {
    try {
        // let userId=req.params.id;
        let userId = req.params.username;
        // let user= await User.findById(userId).select('-password');
        let user = await User.findOne({ username: userId })
            .select('-password')
            .populate({
                path: 'posts',
                select: 'image _id',
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'saved',
                select: 'image _id',
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'followers',
                select: '_id username profilePicture isVerified',
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'following',
                select: '_id username profilePicture isVerified',
                options: { sort: { createdAt: -1 } }
            })

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist !!'
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}
const findUserByUsername = async (req, res) => {
    try {
        let username = req.params.username;
        let user = await User.find({ username: { $regex: username, $options: 'i' } })
            .select('username profilePicture bio isVerified')

        if (!user || user.length <= 0) {
            return res.status(404).json({
                success: false,
                message: 'No Users Found !!'
            })
        }
        return res.status(200).json({
            success: true,
            user
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const editProfile = async (req, res) => {
    try {
        // console.log(req.file); // Should contain the image file info
        // console.log(req.body); 
        let userId = req.id;
        let { bio, gender } = req.body;
        const image = req.file;
        let cloudResp;
        let user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User does not exist !!'
            })
        }
        if (image) {
            const fileUri = getDataUri(image);
            cloudResp = await cloudinary.uploader.upload(fileUri)
            user.profilePicture = cloudResp.secure_url;
        }
        if (bio) user.bio = bio;
        if (gender == 'male' || gender == 'female') user.gender = gender;

        await user.save()
        user = await User.findById(userId).select('-password');
        return res.status(200).json({
            success: true,
            message: 'Profile updated !!',
            user
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getSuggestedUsers = async (req, res) => {
    try {
        const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select('profilePicture username _id isVerified').limit(5)
        if (!suggestedUsers) {
            return res.status(404).json({
                success: false,
                message: 'No suggested users !!'
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Users found !!',
            suggestedUsers
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}
const setLastSeen = async (req, res) => {
    try {
        console.log(req.body)
        const { userId } = req.body;
        const lastSeen = req.body.lastSeen;
        let user = await User.findById(userId).select('-password');
        if (!lastSeen || isNaN(new Date(lastSeen))) {
            return res.status(400).json({
                success: false,
                message: 'Invalid lastSeen value!',
            });
        }
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User does not exist !!'
            })
        }
        user.lastSeen = new Date(lastSeen);
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Last seen updated !!',
            lastSeen: user.lastSeen
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const followUnfollow = async (req, res) => {
    try {
        const mainUserId = req.id;
        const otherUserId = req.params.id;

        if (mainUserId === otherUserId) {
            return res.status(400).json({
                success: false,
                message: 'You cannot follow/unfollow yourself !!'
            });
        }

        const mainUser = await User.findById(mainUserId);
        const otherUser = await User.findById(otherUserId);

        if (!mainUser || !otherUser) {
            return res.status(400).json({
                success: false,
                message: 'User not found !!'
            });
        }

        const isFollowing = mainUser.following.includes(otherUserId);
        if (isFollowing) {
            // do unfollow
            await Promise.all([
                User.findByIdAndUpdate(mainUserId, { $pull: { following: otherUserId } }),
                User.findByIdAndUpdate(otherUserId, { $pull: { followers: mainUserId } })
            ])
            const followList = await User.findById(mainUserId).select('followers following')
            const notification = {
                type: 'unfollow',
                user: mainUser,
                otherUser: otherUser.username,
                message: `You got unfollowed by ${mainUser.username}`
            }
            const otherUserSocketId = getReceiverSocketId(otherUserId.toString())
            console.log('Emitting followNotification:', notification, otherUserSocketId);
            io.to(otherUserSocketId).emit('followNotification', notification)
            return res.status(200).json({
                success: true,
                message: 'User unfollowed !!',
                followList
            })
        } else {
            // do follow
            await Promise.all([
                User.findByIdAndUpdate(mainUserId, { $push: { following: otherUserId } }),
                User.findByIdAndUpdate(otherUserId, { $push: { followers: mainUserId } })
            ])
            const followList = await User.findById(mainUserId).select('followers following')
            const notification = {
                type: 'follow',
                user: mainUser,
                otherUser: otherUser.username,
                message: `started to follow you`
            }
            const otherUserSocketId = getReceiverSocketId(otherUserId.toString())
            io.to(otherUserSocketId).emit('followNotification', notification)
            console.log('Emitting followNotification:', notification, otherUserSocketId);
            return res.status(200).json({
                success: true,
                message: 'User followed !!',
                followList
            })
        }

    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }
}
async function addIsVerifiedToUsers() {
    try {
        // Update all users that do not have the 'isVerified' field
        await User.updateMany({ isVerified: { $exists: false } }, { $set: { isVerified: false } });
        console.log('Updated all users with the isVerified field');
    } catch (error) {
        console.error('Error updating users:', error);
    }
}

async function lastSeen() {
    try {
        // Update all users that do not have the 'isVerified' field
        await User.updateMany({ lastSeen: { $exists: false } }, { $set: { lastSeen: new Date() } });
        console.log('Updated all users with the isVerified field');
    } catch (error) {
        console.error('Error updating users:', error);
    }
}

async function verifyRaghav() {
    try {
        // Update user with username 'raghav' and set 'isVerified' to true
        const result = await User.updateOne({ username: 'raghav' }, { $set: { isVerified: true } });
        console.log('User updated:', result);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

const formatUsernames = async () => {
    try {
        // Find all users with uppercase letters or spaces in their usernames
        const users = await User.find({
            username: { $regex: /[A-Z ]/ }  // This regex matches any uppercase letters or spaces
        });

        // Iterate through each user and update their username
        for (const user of users) {
            const formattedUsername = user.username.replace(/\s+/g, '').toLowerCase(); // Remove spaces and convert to lowercase
            await User.updateOne({ _id: user._id }, { $set: { username: formattedUsername } });
        }

        console.log('All usernames have been formatted (spaces removed and lowercase).');
    } catch (error) {
        console.error('Error updating usernames:', error);
    }
};

// Call the function
//   formatUsernames();


const userController = {
    register,
    login,
    logout,
    getProfile,
    findUserByUsername,
    editProfile,
    getSuggestedUsers,
    followUnfollow,
    setLastSeen
};

export default userController;