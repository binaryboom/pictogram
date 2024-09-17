import { createSlice } from "@reduxjs/toolkit";

const rtnFollow=createSlice({
    name:'rtnFollow',
    initialState:{
        followNotifications:[]
    },
    reducers:{
        setFollowNotification:(state,action)=>{
            console.log(action.payload)
            if(action.payload==null){
                state.followNotifications=[]
            }
            else if(action.payload.type==='follow'){
                state.followNotifications.push(action.payload)
            }
            else if(action.payload.type==='unfollow'){
                state.followNotifications=state.followNotifications.filter((item) => item.mainUserId !== action.payload.mainUserId)
            }
        },
    }
    // state.likeNotifications=state.likeNotifications.filter((item)=>item.postId!==action.payload.postId && item.user._id !== action.payload.user._id)
})

export const {setFollowNotification}=rtnFollow.actions;
export default rtnFollow.reducer;