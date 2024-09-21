import { createSlice } from "@reduxjs/toolkit";

const rtnMsg=createSlice({
    name:'rtnMsg',
    initialState:{
        msgNotifications:[]
    },
    reducers:{
        setMsgNotification:(state,action)=>{
           
            if(action.payload==null){
                state.msgNotifications=[]
            }else if (Array.isArray(action.payload)) {
                // Replace msgNotifications with the filtered array (removing notifications)
                state.msgNotifications = action.payload;
              } else {
                // Add a new notification
                // state.msgNotifications.push(action.payload);
                const exists = state.msgNotifications.some(
                    notification => notification._id === action.payload._id // Adjust this condition based on your notification structure
                    // notification => notification=== action.payload// Adjust this condition based on your notification structure
                );
                // Add a new notification only if it doesn't already exist
                if (!exists) {
                    state.msgNotifications.push(action.payload);
                }
              }
        }
    }
   
})

export const {setMsgNotification}=rtnMsg.actions;
export default rtnMsg.reducer;