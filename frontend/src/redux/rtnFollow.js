import { createSlice } from "@reduxjs/toolkit";

const rtnFollow=createSlice({
    name:'rtnFollow',
    initialState:{
        followNotifications:[]
    },
    reducers:{
        setFollowNotification:(state,action)=>{
            if(action.payload==null){
                state.followNotifications=[]
            }
            else if(action.payload.type==='follow'){
                state.followNotifications.push(action.payload)
            }
            else if(action.payload.type==='unfollow'){
                state.followNotifications=state.followNotifications.filter((item) => !(item.user.username === action.payload.user.username && item.otherUser === action.payload.otherUser))
            }
        },
    }
    
})

export const {setFollowNotification}=rtnFollow.actions;
export default rtnFollow.reducer;