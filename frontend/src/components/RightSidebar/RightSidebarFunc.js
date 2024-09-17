import { setAuthUser } from "../../redux/authSlice";
import { setPosts } from "../../redux/postSlice";
import { produce } from 'immer';

const getSuggestedUsers = async (properties) => {
    const { apiUrl, setLoading, navigate, showAlert,setSuggestedUsers} = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/user/suggested`, {
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
        setLoading(false)
        if (res.success) {
            setSuggestedUsers(res.suggestedUsers)
        }
        else {
            showAlert(res)
        }
    }
}

const RightSidebarFunc = {
    getSuggestedUsers,
};

export default RightSidebarFunc;