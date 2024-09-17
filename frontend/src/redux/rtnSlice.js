import { createSlice } from "@reduxjs/toolkit";

const rtnSlice=createSlice({
    name:'rtn',
    initialState:{
        likeNotifications:[]
    },
    reducers:{
        setLikeNotification:(state,action)=>{
            if(action.payload==null){
                state.likeNotifications=[]
            }
            else if(action.payload.type==='like'){
                state.likeNotifications.push(action.payload)
            }
            else if(action.payload.type==='unlike'){
                state.likeNotifications=state.likeNotifications.filter((item) => item.postId !== action.payload.postId || item.user._id !== action.payload.user._id)
            }
        }
    }
    // state.likeNotifications=state.likeNotifications.filter((item)=>item.postId!==action.payload.postId && item.user._id !== action.payload.user._id)
})

export const {setLikeNotification}=rtnSlice.actions;
export default rtnSlice.reducer;