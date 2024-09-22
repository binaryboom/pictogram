import { createSlice } from "@reduxjs/toolkit";

const rtnComment=createSlice({
    name:'rtnComment',
    initialState:{
        commentNotifications:[]
    },
    reducers:{
        setCommentNotification:(state,action)=>{
            if(action.payload==null){
                state.commentNotifications=[]
            }
            else if(action.payload.type==='comment'){
                state.commentNotifications.push(action.payload)
            }
            else if(action.payload.type==='uncommented'){
                state.commentNotifications=state.commentNotifications.filter((item) => (item.commentId !== action.payload.commentId))
            }
        },
    }
    
})

export const {setCommentNotification}=rtnComment.actions;
export default rtnComment.reducer;