import { setAuthUser } from "../../redux/authSlice";
import { setPosts } from "../../redux/postSlice";
import { produce } from 'immer';

const likeUnlike = async (id, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, location, posts, dispatch, user, handleFullPost } = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/post/${id}/likeUnlike`, {
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
        setLoading(false)
        
        if (res.success) {
            // const updatedPosts = posts.map((post) => {
            //     if (post._id === id) {
            //         // Create a new likes array based on the current one
            //         const updatedLikes = post.likes.includes(user._id)
            //             ? post.likes.filter((like) => like !== user._id)
            //             : [...post.likes, user._id];

            //         return { ...post, likes: updatedLikes };
            //     }
            //     return post;
            // });

            const updatedPosts = produce(posts, draft => {
                const post = draft.find(p => p._id === id);
                if (post) {
                    // const index = post.likes.indexOf(user._id);
                    // if (index === -1) {
                    //     post.likes.push(user._id);
                    // } else {
                    //     post.likes.splice(index, 1);
                    // }
                    post.likes = res.postLikes.likes
                }

            });
            const updatedPost = updatedPosts.find(p => p._id === id);
            if (handleFullPost && updatedPost) {
                handleFullPost(updatedPost, null); // Update the full post
            }

            // console.log("Dispatching updatedPosts:", updatedPosts);
            dispatch(setPosts(updatedPosts))
            // const currentPath = window.location.pathname;
            // // console.log(currentPath)
            // if (currentPath !== '/' && currentPath.split('/').length > 1) {
            //     navigate('/');
            // }
        }
        else{
            showAlert(res)
        }
    }
}

const handleSavedPost = async (id, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, location, posts, dispatch, user } = properties;
    let res;
    try {
        // setLoading(true)
        let req = await fetch(`${apiUrl}/post/${id}/handleSavedPost`, {
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
        // setLoading(false)
        if (res.success) {
            dispatch(setAuthUser({ ...user, saved: res.userSaved.saved }))
           
        }
        else {
            showAlert(res)
        }
    }
}

const doComment = async (id, data, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, location, posts, dispatch, user, handleFullPost } = properties;
    let res;
    try {
        let req = await fetch(`${apiUrl}/post/${id}/newComment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: data
            }),
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

        if (res.success) {
            const updatedPosts = produce(posts, draft => {
                const post = draft.find(p => p._id === id);
                if (post) {
                    post.comments = res.postComments.comments
                }
            });

            // console.log("Dispatching updatedPosts:", updatedPosts);
            dispatch(setPosts(updatedPosts))
            if (handleFullPost) {
                handleFullPost(null,res.postComments.comments)
            }

            // const currentPath = window.location.pathname;
            // // console.log(currentPath)
            // if (currentPath !== '/' && currentPath.split('/').length > 1) {
            //     navigate('/');
            // }
        }
        else {
            showAlert(res)
        }
    }
}

const PostFunc = {
    likeUnlike,
    handleSavedPost,
    doComment
};

export default PostFunc;