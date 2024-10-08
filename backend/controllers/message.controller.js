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
            message,
            seenBy: [senderId]
        })
        // console.log(newMsg.message)
        let onlineSender = '';
        if (newMsg) {
            conversation.message.push(newMsg._id);
            // newMsg.save()
            // await Promise.all([
            //     conversation.save(),
            //   onlineSender=  (await newMsg.save()).populate({path:'senderId',select:'username profilePicture isVerified'})
            // ]);
            await newMsg.save();

            // Populate sender details after saving the message
            onlineSender = await newMsg.populate({ path: 'senderId', select: 'username profilePicture isVerified' })

            // Save the conversation asynchronously
            await conversation.save();
        }
        const receiverSocketId = getReceiverSocketId(receiverId)
        // const pop=await Message.findOne(newMsg)
        // .populate({path:'senderId'})
        // .populate({path:'receiverId'})
        // if (receiverSocketId) {
        //     io.to(receiverSocketId).emit('newMsg', newMsg)
        // }
        // console.log('Emitting new message to:', receiverSocketId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMsg', newMsg);
            io.to(receiverSocketId).emit('msgNotification', onlineSender);
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
            // .populate({
            //     path: 'message',
            //     options: { limit: 20, sort: { createdAt: -1 } }  // Sort messages by date and limit to 20
            // });
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
        const senderId = req.body.mainUserId;
        const receiverId = req.body.otherUserId;
        const messageId = req.params.messageId;
        console.log('mmas', senderId, receiverId)
        const conversation = await Conversation.findOne({
            participaints: { $all: [receiverId, senderId] },
            message: { $in: [messageId] }
        })
            .select('_id')
        // console.log(conversation)
        // const conversation=await Message.findById(messageId,{seen:true})
        if (!conversation) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Data !!',
            });
        }
        const msg = await Message.findByIdAndUpdate(messageId, {
            seen: true,
            $addToSet: { seenBy: { $each: [senderId, receiverId] } }
        }, { new: true }).select('_id')
        //    console.log(msg)
        return res.status(200).json({
            success: true,
            message: 'Marked as seen!!',
            conversationId: conversation,
            msgId: msg,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }

}
const markAllMsgAsSeen = async (req, res) => {
    try {
        const senderId = req.id;
        const receiverId = req.params.receiverId;
        console.log(senderId, receiverId)

        const messages = await Message.find({ receiverId: senderId, senderId: receiverId })
            .sort({ createdAt: -1 })
            .limit(5);
        // console.log('mle', messages.length)
        // Update the seenBy field for each message
        const updatedMessages = [];
        for (const message of messages) {
            if (message.seenBy.includes(senderId)) {

                // message.seenBy.push(senderId); // Add senderId to seenBy if not already present
                // let r= await message.save(); // Save the updated message
                // console.log('seen krne',r)
            }
            else {
                message.seenBy.push(senderId); // Add senderId to seenBy if not already present
                let r = await message.save(); // Save the updated message
                updatedMessages.push(r)
                // console.log('seen krne', r)
            }

        }
        if (updatedMessages.length > 0) {
            io.to(getReceiverSocketId(receiverId)).emit('multipleMsgSeen', { updatedMessages });
        }
        return res.status(200).json({
            success: true,
            message: 'Marked all as seen!!',
            updatedMessages
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });

    }
}
const getAllUsers = async (req, res, skipResponse = false) => {
    try {
        const senderId = req.id;
        const allUsers = await User.findById(senderId)
            .select('following followers')
            .populate('following', 'username profilePicture isVerified lastSeen')
            .populate('followers', 'username profilePicture isVerified lastSeen')

        const combinedUsers = [...allUsers.following, ...allUsers.followers];
        // console.log(combinedUsers)
        const uniqueUsersMap = new Map();

        combinedUsers.forEach(user => {
            uniqueUsersMap.set(user._id.toString(), user);
        });

        // Convert the map values back to an array
        const uniqueUsers = Array.from(uniqueUsersMap.values());
        if (skipResponse===true) {
            return { allUsers: uniqueUsers }; // Return users when response is skipped
        } 
        else {
            if (!allUsers) {
                return res.status(200).json({
                    success: false,
                    message: 'No users !!',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Users Found!!',
                allUsers: uniqueUsers
    
            });
        }
    } catch (error) {
        console.log(error);
        if (skipResponse===true) {
            throw error;
        } else {
            return res.status(500).json({ success: false, message: 'Server Error !!' });
        }

    }

}

const getRecentChats = async (req, res, skipResponse = false) => {
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

        if (skipResponse===true) {
            return { users: uniqueUsers }; // Return users when response is skipped
        } else {
            return res.status(200).json({
                success: true,
                users: uniqueUsers
            });
        }
    } catch (error) {
        console.error(error);
        if (skipResponse===true) {
            throw error;
        } else {
            return res.status(500).json({ success: false, message: 'Unable to fetch recent chats.' });
        }
    }

}
const getShareUsers = async (req, res) => {
    try {
        // Call getRecentChats and getAllUsers without sending responses inside them
        const recentChatsPromise = getRecentChats(req, res, true); // Pass a flag to avoid sending a response
        const allUsersPromise = getAllUsers(req, res, true); // Same here

        // Wait for both results to resolve
        const [recentChats, allUsers] = await Promise.all([recentChatsPromise, allUsersPromise]);

        // Combine results from recent chats and all users
        const combinedUsers = [...recentChats.users, ...allUsers.allUsers];

        // Filter unique users
        const uniqueUsersMap = new Map();
        combinedUsers.forEach(user => {
            uniqueUsersMap.set(user._id.toString(), user);
        });
        const uniqueUsers = Array.from(uniqueUsersMap.values());

        // Send the combined response
        return res.status(200).json({
            success: true,
            message: 'Users found!',
            users: uniqueUsers
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Unable to fetch users' });
    }
}

// async function addSeen() {
//     const done=await Message.updateMany({ seen: { $exists: false } }, { $set: { seen: true } })
//     const done2=await Message.updateMany({ seen: { $exists: true } }, { $set: { seen: true } })
// }
// addSeen()

const updateMessagesWithSeenBy = async () => {
    try {
        // Find all messages
        const messages = await Message.find();

        for (const message of messages) {
            // Check if seenBy already includes senderId or receiverId
            if (!message.seenBy.includes(message.senderId)) {
                message.seenBy.push(message.senderId);
            }
            if (!message.seenBy.includes(message.receiverId)) {
                message.seenBy.push(message.receiverId);
            }

            // Save the updated message
            await message.save();
        }

        console.log('All messages updated with seenBy field.');
    } catch (error) {
        console.error('Error updating messages:', error.message);
    }
};

// Call the function
// updateMessagesWithSeenBy();

const messageController = {
    sendMsg,
    getMsg,
    getRecentChats,
    getAllUsers,
    markMsgAsSeen,
    markAllMsgAsSeen,
    getShareUsers
}

export default messageController;