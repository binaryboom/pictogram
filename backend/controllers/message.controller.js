import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { getReceiverSocketId, io } from '../socket/socket.js';

const sendMsg = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const message = req.body.text;

        // find existing conversation
        let conversation = await Conversation.findOne({
            participaints: { $all: [senderId, receiverId] }
        })
        // start new conversation if not exists
        if (!conversation) {
            conversation = await Conversation.create({
                participaints: [senderId, receiverId]
            })
        }
        const newMsg = await Message.create({
            senderId,
            receiverId,
            message
        })
        console.log(newMsg.message)
        if (newMsg) {
            conversation.message.push(newMsg._id);
            // newMsg.save()
            await Promise.all([
                conversation.save(),
                newMsg.save()
            ]);
        }
        const receiverSocketId = getReceiverSocketId(receiverId)
        // const pop=await Message.findOne(newMsg)
        // .populate({path:'senderId'})
        // .populate({path:'receiverId'})
        // if (receiverSocketId) {
        //     io.to(receiverSocketId).emit('newMsg', newMsg)
        // }
        console.log('Emitting new message to:', receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMsg', newMsg);
            io.to(receiverSocketId).emit('msgNotification', newMsg);
        }
        // await Promise.all([
        //     conversation.save(),newMsg.save()
        // ])

        return res.status(200).json({
            success: true,
            message: 'Messages found !!',
            newMsg
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
    }
}

const getMsg = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.id;
        const conversation = await Conversation.findOne({
            participaints: { $all: [senderId, receiverId] }
        })
            .populate('message')
        if (!conversation) {
            return res.status(200).json({
                success: true,
                message: 'No new messages !!',
                newMsg: []
            });
        }
        return res.status(200).json({
            success: true,
            message: 'New messages Found!!',
            newMsg: conversation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }

}
const markMsgAsSeen = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.receiverId;
        const messageId = req.params.messageId;
        const conversation = await Conversation.findOne({
            participaints: { $all: [senderId, receiverId] },
            message:messageId
        })
            .populate('message')
        if (!conversation) {
            return res.status(200).json({
                success: true,
                message: 'Invalid Data !!',
                newMsg: []
            });
        }
        console.log(conversation)
        return res.status(200).json({
            success: true,
            message: 'New messages Found!!',
            newMsg: conversation
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }

}
const getAllUsers = async (req, res) => {
    try {
        const senderId = req.id;
        const allUsers = await User.findById(senderId)
            .select('following followers')
            .populate('following', 'username profilePicture isVerified lastSeen')
            .populate('followers', 'username profilePicture isVerified lastSeen')

        


            const combinedUsers =[...allUsers.following, ...allUsers.followers];
            // console.log(combinedUsers)
            const uniqueUsersMap = new Map();

            combinedUsers.forEach(user => {
                uniqueUsersMap.set(user._id.toString(), user);
            });
            
            // Convert the map values back to an array
            const uniqueUsers = Array.from(uniqueUsersMap.values());

        if (!allUsers) {
            return res.status(200).json({
                success: false,
                message: 'No users !!',
            });
        }
        return res.status(200).json({
            success: true,
            message: 'Users Found!!',
            allUsers:uniqueUsers

        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }

}

const getRecentChats = async (req, res) => {
    try {
        const userId = req.id; // Assuming you have the user's ID from the auth middleware

        // Find the most recent messages involving the user
        const recentMessages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }],
        })
            .sort({ createdAt: -1 }) // Sort messages by most recent
            .populate('senderId receiverId', 'username profilePicture isVerified lastSeen') // Populate sender and receiver details


        // Extract unique chat partners
        const uniqueUsers = [];
        const userSet = new Set();

        recentMessages.forEach((message) => {
            const otherUser =
                message.senderId._id.equals(userId) ? message.receiverId : message.senderId;

            // Add the user to the list if not already added
            if (!userSet.has(otherUser._id.toString())) {
                userSet.add(otherUser._id.toString());
                uniqueUsers.push(otherUser);
            }
        });
        res.status(200).json({
            success: true,
            users: uniqueUsers
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Unable to fetch recent chats.' });
    }

}


const messageController = {
    sendMsg,
    getMsg,
    getRecentChats,
    getAllUsers,
    markMsgAsSeen
}

export default messageController;