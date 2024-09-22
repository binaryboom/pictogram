import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setMsgNotification } from '../redux/rtnMsg';

const useGetRTM = ({ setMessages, selectedChat ,setRecentChats}) => {
    // const msgNotifications = useSelector(store => store.rtnMsg.msgNotifications);
    const { socket } = useSelector(store => store.socketio)
    // const dispatch = useDispatch()
    // const {msgNotifications}=useSelector(store=>store.rtn)

    useEffect(() => {



        const handleNewMessage = (newMsg) => {
            console.log('New message received:', newMsg); // Debugging
            console.log('sel chat:', selectedChat); // Debugging
            if (selectedChat?._id === newMsg?.senderId?._id || selectedChat?._id === newMsg?.senderId) {

                setMessages((prevMessages) => {
                    if (!prevMessages || prevMessages.length === 0) {
                        return [newMsg]; // Set only the new message
                    }
                    return [...prevMessages, newMsg];
                });
            }


        };
        const handleSeen2 = () => {

            setMessages((prevMessages) => {
                if (prevMessages) {
                    return prevMessages.map((m) => (
                        m._id === messageId ? m.seen = true : ''
                    ));
                }
            });

        };
        const handleSeen = ({ messageId }) => {
            console.log('handle seen')
            setMessages((prevMessages) => {
                if (prevMessages) {
                    return prevMessages.map((m) => {
                        // Return a new object for the message with the updated 'seen' property
                        if (m._id === messageId) {
                            return { ...m, seen: true, seenBy: Array.from(new Set([...m.seenBy, m.senderId._id, m.receiverId])) }; // Create a new object with 'seen' set to true
                        }
                        return m; // Return the message unchanged if it doesn't match
                    });
                }
                return prevMessages;
            });
        };
        function handleMultipleSeen({ updatedMessages }) {
            // console.log('multi', updatedMessages)
            setMessages((prevMessages) => {
                if (prevMessages) {
                    return prevMessages.map((m) => {
                        const updatedMessage = updatedMessages.find((u) => u._id === m._id);
                        // Return a new object for each message with 'seen' set to true and updated 'seenBy' if found
                        return {
                            ...m,
                            seen: true,
                            seenBy: updatedMessage ? updatedMessage.seenBy : m.seenBy
                        };
                    });
                }
                return prevMessages;
            });
        }

        if (socket) {
            console.log('Socket is available. Setting up listener.'); // Debugging
            socket.on('newMsg', handleNewMessage);
            socket.on('singleMsgSeen', handleSeen);
            socket.on('multipleMsgSeen', handleMultipleSeen);

        }

        return () => {
            if (socket) {
                console.log('Removing socket listener.'); // Debugging
                socket.off('newMsg', handleNewMessage);
                socket.off('singleMsgSeen', handleSeen);
            }
        };

    }, [socket, setMessages, selectedChat])
}

export default useGetRTM
