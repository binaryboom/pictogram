import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setMsgNotification } from '../redux/rtnMsg';

const useGetRTM = ({ setMessages, selectedChat }) => {
    const msgNotifications = useSelector(store => store.rtnMsg.msgNotifications);
    const { socket } = useSelector(store => store.socketio)
    const dispatch = useDispatch()
    // const {msgNotifications}=useSelector(store=>store.rtn)

    useEffect(() => {



        const handleNewMessage = (newMsg) => {
            // console.log('New message received:', newMsg); // Debugging
            // console.log('sel chat:', selectedChat); // Debugging
            if (selectedChat._id === newMsg.senderId) {

                setMessages((prevMessages) => {
                    if (!prevMessages || prevMessages.length === 0) {
                        return [newMsg]; // Set only the new message
                    }
                    // return [...prevMessages, newMsg];
                });
                console.log('before', msgNotifications)
                dispatch(setMsgNotification(
                    msgNotifications.filter((m) => (m.senderId !== selectedChat._id))
                ))
                console.log('after', msgNotifications)
            }


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

    }, [socket, setMessages, selectedChat, msgNotifications, dispatch])
}

export default useGetRTM
