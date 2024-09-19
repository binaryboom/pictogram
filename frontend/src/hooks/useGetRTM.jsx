import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';

const useGetRTM = ({setMessages}) => {
  
    const {socket}=useSelector(store=>store.socketio)
    // const {msgNotifications}=useSelector(store=>store.rtn)
   
    useEffect(() => {
        
            // socket?.on('newMsg',(newMsg)=>{
            //     setMessages(messages=>[...messages,newMsg])
            // })
            // return ()=>{
            //     socket?.off('newMsg')
            // }

            const handleNewMessage = (newMsg) => {
                console.log('New message received:', newMsg); // Debugging
                setMessages((prevMessages) => {
                    if (!prevMessages || prevMessages.length === 0) {
                        return [newMsg]; // Set only the new message
                    }
                    return [...prevMessages, newMsg];
                });
                

            };
        
            if (socket) {
                console.log('Socket is available. Setting up listener.'); // Debugging
                socket.on('newMsg', handleNewMessage);
            }
        
            return () => {
                if (socket) {
                    console.log('Removing socket listener.'); // Debugging
                    socket.off('newMsg', handleNewMessage);
                }
            };
        
    },[socket,setMessages])
}

export default useGetRTM
