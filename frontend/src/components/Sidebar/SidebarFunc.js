import { setAuthUser } from "../../redux/authSlice";
import { setFollowNotification } from "../../redux/rtnFollow";
import { setMsgNotification } from "../../redux/rtnMsg";
import { setLikeNotification } from "../../redux/rtnSlice";


const logout = async (properties) => {
    const {apiUrl,setLoading,navigate,showAlert,dispatch} =properties;
    console.log('logout from sidebar')
    let res;
    try {
      setLoading(true)
      let req = await fetch(`${apiUrl}/user/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      res = await req.json()
      console.log(res)

    } catch (error) {
      res = { success: false, message: 'Unable to connect with server' }
      console.log(error)
      showAlert(res)
    }
    finally {
      if (res.success) {
        dispatch(setMsgNotification(null));
        dispatch(setLikeNotification(null));
        dispatch(setFollowNotification(null));
        dispatch(setAuthUser(null))
        navigate('/login');
      }
      showAlert(res)
      setLoading(false)
    }
  }
const SidebarFunc = {
   logout
};

export default SidebarFunc;