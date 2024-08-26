import Conversation from '../models/conversation.model.js'
import Message from '../models/message.model.js';

const sendMsg = async (req,res) => {
    try {
        const senderId=req.id;
        const receiverId=req.params.id;
        const message=req.body.msg;

        // find existing conversation
        let conversation=await Conversation.findOne({
            participaints:{$all:[senderId,receiverId]}
        })
        // start new conversation if not exists
        if(!conversation){
            conversation=await Conversation.create({
                participaints:[senderId,receiverId]
            })
        }
        const newMsg=await Message.create({
            senderId,
            receiverId,
            message
        })
        if(newMsg){
            conversation.message.push(newMsg._id);
            newMsg.save()
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

const getMsg=async (req,res) => {
    try {
        const senderId=req.id;
        const receiverId=req.params.id;
        const conversation=await Conversation.find({
            participaints:{$all:[senderId,receiverId]}
        })
        if(!conversation){
            return res.status(200).json({
                success: true,
                message: 'No new messages !!',
                newMsg:[]
            });
        }
        return res.status(200).json({
            success: true,
            message: 'New messages Found!!',
            newMsg:conversation?.message
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server Error !!'
        });
        
    }
    
}

const messageController={
    sendMsg,
    getMsg
}

export default messageController;