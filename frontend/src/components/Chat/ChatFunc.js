import { setAuthUser } from "../../redux/authSlice";
import { setOfflineUsers } from "../../redux/offlineSlice";
import { setPosts } from "../../redux/postSlice";





const sendMsg = async (receiverId, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, text, setText, setMessages } = properties;
    let res;
    try {
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
        if (res.success ) {
            setMessages((prev=[])=>(
                [...prev,res.newMsg]
            ))
            setText('');
        }
        else{

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
        else{

            showAlert(res)
        }
        //   setLoading(false)
    }
}

const getRecentChats = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, setRecentChats } = properties;
    let res;
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
            setOfflineUsers(res.users)
        }
        else {
            showAlert(res)
        }
    }
}
const getAllUsers = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert, dispatch, user, setAllUsers } = properties;
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
            // setOfflineUsers(res.allUsers)
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
    getAllMsg
};

export default ChatFunc;