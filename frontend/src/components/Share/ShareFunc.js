const getShareUsers = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert, location,setAllUsers } = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/message/getShareUsers`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        // console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
    }
    finally {
        if (res.success) {
            setAllUsers(res.users)
        }
        else {
            showAlert(res)
        }
    }
}

const sendMsg = async (properties) => {

    const { apiUrl, showAlert, text, selectedChats, postId, customMsg,closeDialog } = properties;
    let allSuccess = true;
    for (let chat of selectedChats) {

        let res;
        try {
            //   setLoading(true)
            let req = await fetch(`${apiUrl}/message/sendMsg/${chat._id}`, {
                method: 'POST',
                body: JSON.stringify({ text: customMsg.length > 0 ? `https://pictogram-wqnp.onrender.com/${postId}\n${customMsg}` : `Hey ${chat.username} ,\nCheckout this post :\nhttps://pictogram-wqnp.onrender.com/${postId}` }),
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
                
            }
            else {
                
                // showAlert(res)
                showAlert({ success: false, message: `Failed to share with ${chat.username}` })

            }
            //   setLoading(false)
        }
    }
    if(allSuccess){
        showAlert({ success: true, message: `Shared successfully !!` })
        closeDialog()
    }
}

const ShareFunc = {
    getShareUsers,
    sendMsg
};

export default ShareFunc