const likeUnlike = async (id, properties) => {
    const { apiUrl, setLoading, navigate, showAlert, location } = properties;
    let res;
    try {
        setLoading(true)
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
        console.log(location.pathname)
        // res.success ? (navigate('/'),location.pathname!='/'?setTimeout(() => {  navigate(location.pathname) }, 1):'') : showAlert(res)
        res.success? (setTimeout(() => {  navigate(0) }, 1)) : showAlert(res)
    }
}

const PostFunc = {
    likeUnlike,
};

export default PostFunc;