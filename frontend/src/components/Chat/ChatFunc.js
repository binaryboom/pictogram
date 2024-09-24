import { setAuthUser } from "../../redux/authSlice";
import { setOfflineUsers } from "../../redux/offlineSlice";
import { setPosts } from "../../redux/postSlice";





const sendMsg = async (receiverId, properties) => {
    const { apiUrl, showAlert, text, setText, setMessages, recentChats, setRecentChats, selectedChat, setSelectedChat } = properties;
    let res;
    try {
        console.log(selectedChat)
        //   setLoading(true)
        let req = await fetch(`${apiUrl}/message/sendMsg/${receiverId}`, {
            method: 'POST',
            body: JSON.stringify({ text }),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        // res.success? (handleCreatePost(),navigate('/') ):null
        if (res.success) {
            setMessages((prev = []) => (
                [...prev, res.newMsg]
            ))
            setText('');
            const chatToUpdate = recentChats.find((rc) => rc._id === selectedChat._id);
            if (chatToUpdate) {
                // Update selectedChat
                setSelectedChat((prev) => ({
                    ...prev,
                    lastSeen: chatToUpdate.lastSeen,
                }));

                // Update recentChats
                setRecentChats((prev) => [
                    { ...selectedChat, lastSeen: chatToUpdate.lastSeen },
                    ...prev.filter((rc) => rc._id !== selectedChat._id),
                ]);
            }
            else {
                setRecentChats((prev) => [
                    { ...selectedChat },
                    ...prev
                ]);
            }
        }
        else {

            showAlert(res)
        }
        //   setLoading(false)
    }
}

const getAllMsg = async (receiverId, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, text, setText, setMessages } = properties;
    let res;
    try {
        //   setLoading(true)
        let req = await fetch(`${apiUrl}/message/getAllMsg/${receiverId}`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        // res.success? (handleCreatePost(),navigate('/') ):null
        if (res.success) {
            setMessages(res.newMsg.message)
        }
        else {

            showAlert(res)
        }
        //   setLoading(false)
    }
}

const getRecentChats = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, selectedChat, setRecentChats, setSelectedChat } = properties;
    let res;
    // console.log('setRecentChats:', setRecentChats);
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/message/getRecentChats`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        // setLoading(false)
        if (res.success) {
            // handleProfile(res.user)
            // if(res.user._id===user._id){
            //     dispatch(setAuthUser({...user,bio:res.user.bio,gender:res.user.gender,profilePicture:res.user.profilePicture}))
            // }
            setRecentChats(res.users)
            const userToUpdate = res.users.find((rc) => rc._id === selectedChat._id);
            if (userToUpdate) {
                // Create a new object to avoid directly mutating the state
                setSelectedChat((prevSelectedChat) => ({
                    ...prevSelectedChat,
                    lastSeen: userToUpdate.lastSeen,
                }));
            }
            // setOfflineUsers(res.users)
        }
        else {
            showAlert(res)
        }
    }
}
const getAllUsers = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, setAllUsers, selectedChat, allUsers, setSelectedChat } = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/message/getAllUsers`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        // setLoading(false)
        if (res.success) {
            // handleProfile(res.user)
            // if(res.user._id===user._id){
            //     dispatch(setAuthUser({...user,bio:res.user.bio,gender:res.user.gender,profilePicture:res.user.profilePicture}))
            // }
            setAllUsers(res.allUsers)
            const userToUpdate = res.allUsers.find((rc) => rc._id === selectedChat._id);
            if (userToUpdate) {
                console.log(userToUpdate)
                // Create a new object to avoid directly mutating the state
                setSelectedChat((prevSelectedChat) => ({
                    ...prevSelectedChat,
                    lastSeen: userToUpdate.lastSeen,
                }));
            }
            // setOfflineUsers(res.allUsers)
        }
        else {
            showAlert(res)
        }
    }
}
const seenAllMsg = async (receiverId, properties) => {
    const { apiUrl, showAlert, dispatch, user, setAllUsers, selectedChat, allUsers, setMessages, setSelectedChat } = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/message/seen/all/${receiverId}`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        // setLoading(false)
        // if (res.success) {
        //     const updatedMessages=res.updatedMessages
        //     setMessages((prevMessages) => {

        //         if (prevMessages) {
        //             return prevMessages.map((m) => {
        //                 // Return a new object for each message with 'seen' set to true
        //                 return { ...m, seen: true,seenBy:updatedMessages.find((u)=>{u._id===m._id?u.seenBy:m.seenBy}) };
        //             });
        //         }
        //         return prevMessages;
        //     });


        // }
        if (res.success) {
            const updatedMessages = res.updatedMessages;
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
        else {
            showAlert(res)
        }
    }
}

const ChatFunc = {
    sendMsg,
    getRecentChats,
    getAllUsers,
    getAllMsg,
    seenAllMsg
};

export default ChatFunc;
