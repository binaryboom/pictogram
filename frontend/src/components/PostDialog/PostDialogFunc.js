import { setAuthUser } from "../../redux/authSlice";
import { setPosts } from "../../redux/postSlice";


const deletePost = async (id, properties) => {
    const {apiUrl,setLoading,navigate,showAlert,posts,dispatch} =properties;
    let res;
    try {
        setLoading(true)
        let req = await fetch(`${apiUrl}/post/${id}/delete`, {
            method: 'DELETE',
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
        setLoading(false)
        showAlert(res)
        if(res.success){
            const updatedPosts=posts.filter((i)=>(
                i._id !== id
            ))
            dispatch(setPosts(updatedPosts))
            const currentPath = window.location.pathname;
            // console.log(currentPath)
            if (currentPath !== '/' && currentPath.split('/').length > 1) {
                navigate('/');
            }
        }
    }
}

const followUnfollow = async (id, properties) => {
    const {apiUrl,setLoading,navigate,showAlert,dispatch,user} =properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/user/${id}/followUnfollow`, {
            method: 'POST',
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
        // setLoading(false)
        if(res.success){
            dispatch(setAuthUser({...user,following:res.followList.following,followers:res.followList.followers}));
            // handleDialog()
        }
        else{
            showAlert(res)
        }
    }
}

const PostDialogFunc = {
   deletePost,
   followUnfollow,
};

export default PostDialogFunc;