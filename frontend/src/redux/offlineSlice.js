import { createSlice } from "@reduxjs/toolkit";

const offlineSlice=createSlice({
    name:'offlineSlice',
    initialState:{
        offlineUsers:[]
    },
    reducers:{
        setOfflineUsers:(state,action)=>{
            state.offlineUsers=action.payload
        }
    }
})
export const {setOfflineUsers}=offlineSlice.actions;
export default offlineSlice.reducer;