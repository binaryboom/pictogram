import React, { useState, useEffect } from 'react'
import '../Post/Post.css'
import './FullPost.css'
import { useAlert } from '../../context/AlertContext'
import { useApi } from '../../context/apiContext'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PostDialog from '../PostDialog/PostDialog'
import { useDispatch, useSelector } from 'react-redux'
import PostFunc from '../Post/PostFunc'
import { formatDistanceToNow ,formatDistanceToNowStrict } from 'date-fns';
import PostDialogFunc from '../PostDialog/PostDialogFunc'
import Friends from '../Profile/Friends'
import Share from '../Share/Share'
import Linkify from 'react-linkify';


const FullPost = () => {
    const formatTimeAgo = (date) => {
        const timeAgo = formatDistanceToNowStrict(new Date(date), { addSuffix: true });
        if (timeAgo.includes('second')) {
            return 'just now';
          }
        // Shorten the units: convert to first letter or abbreviation
        const shortTimeAgo = timeAgo
        //   .replace('seconds', 's')
        //   .replace('second', 's')
          .replace('minutes', 'min')
          .replace('minute', 'min')
          .replace('hours', 'h')
          .replace('hour', 'h')
          .replace(' days', 'd')
          .replace(' day', 'd')
          .replace(' weeks', 'w')
          .replace(' week', 'w')
          .replace(' months', 'm')
          .replace(' month', 'm')
          .replace(' years', 'y')
          .replace(' year', 'y');
      
        return shortTimeAgo;
      };
    const dispatch = useDispatch()
    const { user } = useSelector(store => store.auth)
    const { posts } = useSelector(store => store.post)
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [share, setShare] = useState(false);
    function handleShareDialog(){
        setShare(!share)
    }
    function handleFullPost(newPost, newComments) {
        if (newPost) {
            setPost(newPost)
        }
        if (newComments) {
            setComments(newComments)
        }
    }
    const location = useLocation();
    const navigate = useNavigate()
    const { id } = useParams()
    const apiUrl = useApi()
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const properties = {
        apiUrl, setLoading, navigate, showAlert, location, dispatch, posts, user, handleFullPost
    }
    const [showLikes,setShowLikes] = useState(false)
    function handleLikes() {
        setShowLikes(!showLikes)
    }
    const fetchPostById = async (id) => {
        let res;
        try {
            setLoading(true)
            let req = await fetch(`${apiUrl}/post/${id}`, {
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
            // res.success ? (setPost(res.post),setComments(res.post.comments)) : (showAlert(res),setTimeout(()=>{navigate('/')},3000))
            if (res.success) {
                setPost(res.post);
                setComments(res.post.comments);
                // console.log(comments)
            } else {
                showAlert(res); // Show an alert with the error message
                setTimeout(() => { navigate('/'); }, 3000); // Redirect after 3 seconds
            }

            setLoading(false)
        }
    }

    // useEffect(() => {
    //     fetchPostById(id)
    // })
    useEffect(() => {
        fetchPostById(id)
    }, [])
    const [dialog, showDialog] = useState(false);
    function handleDialog() {
        showDialog(!dialog)
    }
    // const [fullPostdialog, showFullPostDialog] = useState(false);
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
    function handleKeyDown(e) {
        if (e.key === 'Enter' && text.trim()) {
            PostFunc.doComment(post._id, text, properties);
            setText('');
        }
    }
    // if (res == '' || res.post.length < 1) {
    //     return (
    //         <div>
    //             {loading && (
    //                 <div className="loader-container">
    //                     <span className="loader"></span>
    //                 </div>
    //             )}
    //         </div>
    //     )
    // }
    if (loading || !post || !comments) {
        return (
            <div className="loader-container">
                <span className="loader"></span>
            </div>
        );
    }
    return (
        <div className="dialog">
            <div className='fullPostCard'>
                <div className="fullPostCardLeft">
                {showLikes && <Friends fr={post.likes} closeDialog={handleLikes} heading={'Liked By :'} customClass={'fullPostLikes'} />}
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
                    <div className="fullPostPhoto">
                        <img draggable='false' src={post.image || '/person.png'} alt="photo" />
                    </div>
                    <div className="postButtons">
                        <div className="postCardLeft">
                            <i onClick={() => { PostFunc.likeUnlike(post._id, properties) }} style={{ color: post.likes.some(like => like._id === user._id) ? 'red' : '' }} className={`fa-heart ${post.likes.some(like => like._id === user._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                            {/* <i className="fa-regular fa-comment"></i> */}
                            <i onClick={()=>{handleShareDialog()}} className="fa-regular fa-share-from-square"></i>
                        </div>
                        <div className="postCardRight">
                            <i onClick={() => { PostFunc.handleSavedPost(post._id, properties) }} className={`fa-bookmark ${user.saved.includes(post._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                        </div>
                    </div>
                    <div onClick={handleLikes} className='likeCount' style={{ display: post.likes.length > 0 ? '' : 'none' }}>{post.likes.length > 1
                        ? `${post.likes.length} likes`
                        : `${post.likes.length} like`}</div>
                </div>
                <div className="fullPostCardRight">
                    <div className='caption fullPostCaption'><span>{post.author.username} :</span> {post.caption}</div>
                    <div className="allComments">
                        {comments.map((c) => (
                            <div className="item">
                                <div onClick={() => { navigate(`/profile/${c.author.username}`) }} className="itemLeft">
                                    <div className="commentUserPhoto"><img draggable='false' src={c.author.profilePicture || '/person.png'} alt="photo" /></div>
                                    <div className="commentUserUsername">{c.author.username + ':'}{c.author.isVerified && <sup className="commentBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></sup>}
                                    <div className='commentTime'>&bull; {formatTimeAgo(c.createdAt)}</div>
                                    </div>

                                </div>
                                <div className="itemRight">
                                    <div className="commentUserText"><Linkify>{c.text}</Linkify></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='fullPostCreateComment'>
                        <div className="postCardLeft">
                            <input onKeyDown={handleKeyDown} value={text} onChange={handleInput} type='text' placeholder='add a comment' />
                        </div>
                        <div className="postCardRight">
                            {text && <span onClick={() => { PostFunc.doComment(post._id, text, properties); setText('') }} className='postCommentBtn'>Post</span>}
                        </div>
                    </div>
                </div>


                {/* {dialog && (
                    <div className="dialog">
                        <div className="dialogBox">
                            <div style={{ color: '#ED4956' }} className="dialogItem">Unfollow</div>
                            <div className="dialogItem">Add to favourites</div>
                            <div className="dialogItem">About this account</div>
                            <div className="dialogItem">Share</div>
                            <div style={{ color: '#ED4956' }} className="dialogItem">Delete</div>
                            <div onClick={() => showDialog(!dialog)} className="dialogItem">Cancel</div>
                        </div>
                    </div>
                )} */}
                {dialog && <PostDialog handleDialog={handleDialog} user={user} post={post} handleShareDialog={handleShareDialog} />}
                {share && <Share closeDialog={handleShareDialog}  postId={post._id} customClass={'sharePage'}/>}
            </div>
            <div className="fullPostRightCorner">
                <i onClick={() => { navigate(-1) }} className="fa-regular fa-2xl fa-circle-xmark"></i>
            </div>
        </div>
    )
}

export default FullPost
