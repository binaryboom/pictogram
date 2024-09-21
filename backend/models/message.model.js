import mongoose from "mongoose";

const messageSchema=new mongoose.Schema({
    message:{type:String,required:true},
    senderId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    receiverId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    seen: { type: Boolean, default: false }
},{timestamps:true})

const Message=mongoose.model('Message',messageSchema);
export default Message;