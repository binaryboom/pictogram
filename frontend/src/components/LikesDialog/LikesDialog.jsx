import React from 'react'
import PostDialogFunc from './PostDialogFunc.js'
import { useState } from "react";
import { useApi } from "../../context/apiContext";
import { useAlert } from "../../context/AlertContext";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import PostFunc from '../Post/PostFunc.js';




const LikesDialog = ({ handleDialog, user, post }) => {
    const { posts } = useSelector(store => store.post)
    const dispatch = useDispatch()
    const apiUrl = useApi()
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const properties = {
        apiUrl, setLoading, navigate, showAlert, posts, dispatch, handleDialog, user
    }
    return (
        <div className="dialog">
            <div className="dialogBox">
                {user._id !== post.author._id && (
                    <div onClick={() => { PostDialogFunc.followUnfollow(post.author._id, properties) }} style={{ color: user.following.includes(post.author._id) ? '#ED4956' : '#0095F6' }} className="dialogItem">{user.following.includes(post.author._id) ? 'Unfollow' : 'Follow'}</div>
                )}

                <div onClick={()=>{navigate(`/profile/${post.author.username}`)}} className="dialogItem">About this account</div>

                <div style={{ color: user.saved.includes(post._id) ? '#ED4956' : '#0095F6' }} onClick={() => { PostFunc.handleSavedPost(post._id, properties) }} className="dialogItem">{user.saved.includes(post._id) ? 'Remove from favourites' : 'Add to favourites'}</div>

                <div className="dialogItem">Share</div>

                {user._id === post.author._id && (
                    <div onClick={() => { PostDialogFunc.deletePost(post._id, properties) }} style={{ color: '#ED4956' }} className="dialogItem">Delete</div>
                )}
                
                <div onClick={() => handleDialog()} className="dialogItem">Cancel</div>
            </div>
        </div>
    )
}

export default LikesDialog
