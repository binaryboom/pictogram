import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { setPosts } from '../redux/postSlice.js';
import { useAlert } from '../context/AlertContext';
import { useApi } from '../context/apiContext';

const useGetAllPosts = () => {
    const apiUrl=useApi()
    const {showAlert}=useAlert()
    const [loading, setLoading] = useState(false);
    const dispatch=useDispatch()
    const fetchAllPosts = async () => {
        let res;
        try {
            setLoading(true)
            let req = await fetch(`${apiUrl}/post/allPosts`, {
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
            res.success ? (dispatch(setPosts(res.allPosts))) : null
            // showAlert(res)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAllPosts()
    },[])
}

export default useGetAllPosts
