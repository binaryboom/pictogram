import { setAuthUser } from "../../redux/authSlice";
import { setPosts } from "../../redux/postSlice";






const getUserProfile = async (username,properties) => {
    const { apiUrl, setLoading, navigate, showAlert,handleProfile,dispatch,user} = properties;
    let res;
    try {
        setLoading(true)
        let req = await fetch(`${apiUrl}/user/profile/${username}`, {
            method: 'GET',
            credentials: 'include',
        });
        res = await req.json()
        console.log(res)

    } catch (error) {
        res = { success: false, message: 'Unable to connect with server' }
        console.log(error)
        showAlert(res)
        setLoading(false)
        navigate('/')
    }
    finally {
        setLoading(false)
        if (res.success) {
            handleProfile(res.user)
            if(res.user._id===user._id){
                dispatch(setAuthUser({...user,bio:res.user.bio,gender:res.user.gender,profilePicture:res.user.profilePicture}))
            }
        }
        else {
            showAlert(res)
            navigate('/')
        }
    }
}

const ProfileFunc = {
    getUserProfile,
};

export default ProfileFunc;