import mongoose from "mongoose";

const conversationSchema=new mongoose.Schema({
    message:[{type:mongoose.Schema.Types.ObjectId,ref:'Message'}],
    participaints:[{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true}],
    
},{timestamps:true})

const Conversation=mongoose.model('Conversation',conversationSchema);
export default Conversation;