import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Post.css'
import { useSelector } from 'react-redux'
import PostDialog from '../PostDialog/PostDialog'
import PostFunc from './PostFunc.js'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'




const Post = ({ post }) => {
    const { user } = useSelector(store => store.auth)
    const [loading, setLoading] = useState(false)
    const location=useLocation()
    const apiUrl = useApi();
    const { showAlert } = useAlert()
    const navigate = useNavigate()
    const properties = {
        apiUrl, setLoading, navigate, showAlert,location
    }
    const [dialog, showDialog] = useState(false);
    function handleDialog() {
        showDialog(!dialog);
    }
    const [text, setText] = useState('')
    function handleInput(e) {
        let inputText = e.target.value;
        if (inputText.trim()) {
            setText(inputText)
        }
        else {
            setText('')
        }
    }

    return (
        <div className='postCard'>
            <div className="userInfo">
                <div className="postCardLeft">
                    <div className="authorImg">
                        <img src={post.author.profilePicture || 'person.png'} alt="photo" />
                    </div>
                    <div className="authorUsername">{post.author.username}</div>
                </div>
                <div className="postCardRight">
                    <i onClick={() => { showDialog(!dialog) }} className="fa-solid fa-ellipsis"></i>
                </div>

            </div>
            <div className="postPhoto">
                <img src={post.image || './person.png'} alt="photo" />
            </div>
            <div className="postButtons">
                <div className="postCardLeft">
                    <i onClick={() => { PostFunc.likeUnlike(post._id, properties) }} style={{ color: post.likes.includes(user._id) ? 'red' : '' }} className={`fa-heart ${post.likes.includes(user._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                    <i onClick={() => { navigate(`/${post._id}`) }} className="fa-regular fa-comment"></i>
                    <i className="fa-regular fa-share-from-square"></i>
                </div>
                <div className="postCardRight">
                    <i className="fa-regular fa-bookmark"></i>
                </div>
            </div>
            <div className='likeCount' style={{ display: post.likes.length > 0 ? '' : 'none' }}>{post.likes.length} Likes</div>
            <div className='caption'><span>{post.author.username} :</span> {post.caption}</div>
            <div className='allComments' style={{ display: post.comments.length > 0 ? '' : 'none' }}>View all {post.comments.length} comments</div>
            <div className='createComment'>
                <div className="postCardLeft">
                    <input value={text} onChange={handleInput} type='text' placeholder='add a comment' />
                </div>
                <div className="postCardRight">
                    {text && <button className='postCommentBtn'>Post</button>}
                </div>
            </div>

            {/* {dialog && (
                <div className="dialog">
                    <div className="dialogBox">
                        <div style={{ color: '#ED4956' }} className="dialogItem">Unfollow</div>
                        <div className="dialogItem">Add to favourites</div>
                        <div className="dialogItem">About this account</div>
                        <div className="dialogItem">Share</div>
                     { user._id === post.author._id &&  <div  style={{ color: '#ED4956'}} className="dialogItem">Delete</div> }
                        <div onClick={() => showDialog(!dialog)} className="dialogItem">Cancel</div>
                    </div>
                </div>
            )} */}
            {dialog && <PostDialog handleDialog={handleDialog} user={user} post={post} />}
        </div>
    )
}

export default Post
