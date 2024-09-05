const likeUnlike = async (id, properties) => {
    const {apiUrl,setLoading,navigate,showAlert} =properties;
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
        showAlert(res)
        res.success ? (setTimeout(()=>{navigate('/')},3000)) : ''
    }
}

const SidebarFunc = {
   likeUnlike,
};

export default SidebarFunc;