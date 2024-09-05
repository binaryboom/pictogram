import React from 'react'
import PostDialogFunc from './PostDialogFunc.js'
import { useState } from "react";
import { useApi } from "../../context/apiContext";
import { useAlert } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";



const PostDialog = ({ handleDialog, user, post }) => {

    const apiUrl=useApi()
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const navigate=useNavigate();
    const properties={
        apiUrl,setLoading,navigate,showAlert
    }
    return (
        <div className="dialog">
            <div className="dialogBox">
                {user._id !== post.author._id && (
                    <div style={{ color: '#ED4956' }} className="dialogItem">Unfollow</div>
                )}
                <div className="dialogItem">Add to favourites</div>
                <div className="dialogItem">About this account</div>
                <div className="dialogItem">Share</div>
                {user._id === post.author._id && (
                    <div onClick={()=>{PostDialogFunc.deletePost(post._id, properties)}} style={{ color: '#ED4956' }} className="dialogItem">Delete</div>
                )}
                <div onClick={() => handleDialog()} className="dialogItem">Cancel</div>
            </div>
        </div>
    )
}

export default PostDialog
