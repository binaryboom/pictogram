import { createSlice } from "@reduxjs/toolkit";

const rtnMsg=createSlice({
    name:'rtnMsg',
    initialState:{
        msgNotifications:[]
    },
    reducers:{
        setMsgNotification:(state,action)=>{
            // state.msgNotifications=new Array(state.msgNotifications.length)
            if(action.payload==null){
                state.msgNotifications=[]
            }
            else{
                state.msgNotifications.push(action.payload)
            }
        }
    }
    // state.likeNotifications=state.likeNotifications.filter((item)=>item.postId!==action.payload.postId && item.user._id !== action.payload.user._id)
})

export const {setMsgNotification}=rtnMsg.actions;
export default rtnMsg.reducer;