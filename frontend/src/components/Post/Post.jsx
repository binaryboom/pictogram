import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './Post.css'
import { useDispatch, useSelector } from 'react-redux'
import PostDialog from '../PostDialog/PostDialog'
import PostFunc from './PostFunc.js'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import { formatDistanceToNow } from 'date-fns';
import PostDialogFunc from '../PostDialog/PostDialogFunc.js'
import ProfileFunc from '../Profile/ProfileFunc.js'
// import data from '@emoji-mart/data'
// import Picker from '@emoji-mart/react'
import EmojiPicker from 'emoji-picker-react';




const Post = ({ post }) => {
    const [showPicker, setShowPicker] = useState(false);
    const { posts } = useSelector(store => store.post)
    const { user } = useSelector(store => store.auth)
    const [loading, setLoading] = useState(false)
    const location = useLocation()
    const apiUrl = useApi();
    const { showAlert } = useAlert()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const properties = {
        apiUrl, setLoading, navigate, showAlert, dispatch, posts, user
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
    const addEmoji = (emoji) => {
        console.log(emoji)
        setText(text + emoji.emoji);
        setShowPicker(false); // Hide the picker after selecting an emoji
    };
    function handleKeyDown(e) {
        if (e.key === 'Enter' && text.trim()) {
            PostFunc.doComment(post._id, text, properties);
            setText('');
        }
    }

    return (

        <div className='postCard'>
            <div className="userInfo">
                <div className="postCardLeft">
                    <div onClick={() => { navigate(`/profile/${post.author.username}`) }} className="authorImg">
                        <img draggable='false' src={post.author.profilePicture || '/person.png'} alt="photo" />
                    </div>
                    <div onClick={() => { navigate(`/profile/${post.author.username}`) }} className="authorUsername">{post.author.username}</div>
                    {post.author.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
                    <div className="otherInfo">
                        <div className="postCreationTime">&bull; {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                        {user._id !== post.author._id && (
                            <div onClick={() => { PostDialogFunc.followUnfollow(post.author._id, properties) }} style={{ color: user.following.includes(post.author._id) ? '#ED4956' : '#0095F6' }} className="postUserFollow">{user.following.includes(post.author._id) ? 'Unfollow' : 'Follow'}</div>
                        )}
                    </div>
                </div>
                <div className="postCardRight">
                    <i onClick={() => { showDialog(!dialog) }} className="fa-solid fa-ellipsis"></i>
                </div>

            </div>
            <div className="postPhoto">
                <img draggable='false' src={post.image || './person.png'} alt="photo" />
            </div>
            <div className="postButtons">
                <div className="postCardLeft">
                    <i onClick={() => { PostFunc.likeUnlike(post._id, properties) }} style={{ color: post.likes.includes(user._id) ? 'red' : '' }} className={`fa-heart ${post.likes.includes(user._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                    <i onClick={() => { navigate(`/${post._id}`) }} className="fa-regular fa-comment"></i>
                    <i className="fa-regular fa-share-from-square"></i>
                </div>
                <div className="postCardRight">
                    <i onClick={() => { PostFunc.handleSavedPost(post._id, properties) }} className={`fa-bookmark ${user.saved.includes(post._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                </div>
            </div>
            <div className='likeCount' style={{ display: post.likes.length > 0 ? '' : 'none' }}>{post.likes.length > 1
                ? ` ${post.likes.length} likes`
                : ` ${post.likes.length} like`}</div>
            <div className='caption'><span>{post.author.username} :</span> {post.caption}</div>
            <div className='viewAllComments' onClick={() => { navigate(`/${post._id}`) }} style={{ display: post.comments.length > 0 ? '' : 'none' }}>View all {post.comments.length} comments</div>
            <div className='createComment'>
                <div className="postCardLeft">
                    <input onKeyDown={handleKeyDown} value={text} onChange={handleInput} type='text' placeholder='add a comment' />
                </div>
                <div className="postCardRight">
                    {/* <i onClick={() => { setShowPicker(!showPicker) }} class="fa-regular fa-xl fa-face-smile" ></i> */}
                    {text && <button onClick={() => { PostFunc.doComment(post._id, text, properties); setText('') }} className='postCommentBtn'>Post</button>}
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

            {/* {showPicker &&<> <EmojiPicker onEmojiClick={addEmoji} skinTonesDisabled={true} style={{position:'absolute',left:'1vw',right:'1vw'}}  height={'80%'} width={'95%'} previewConfig={{showPreview:false}}/></>} */}
            {dialog && <PostDialog handleDialog={handleDialog} user={user} post={post} />}
        </div>

    )
}

export default Post
