import React, { useState, useEffect } from 'react'
import '../Post/Post.css'
import './FullPost.css'
import { useAlert } from '../../context/AlertContext'
import { useApi } from '../../context/apiContext'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import PostDialog from '../PostDialog/PostDialog'
import { useSelector } from 'react-redux'
import PostFunc from '../Post/PostFunc'




const FullPost = () => {
    const {user}=useSelector(store=>store.auth)
    const [post, setPost] = useState(null); 
    const location = useLocation(); 
    const navigate=useNavigate()
    const {id}=useParams()
    const apiUrl=useApi()
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const properties={
        apiUrl,setLoading,navigate,showAlert,location
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
            res.success ? (setPost(res.post)) : (showAlert(res),setTimeout(()=>{navigate('/')},3000))
            setLoading(false)
        }
    }

    // useEffect(() => {
    //     fetchPostById(id)
    // })
    useEffect(() => {
        fetchPostById(id)
    }, [id])
    const [dialog, showDialog] = useState(false);
    function handleDialog(){
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
    if (loading || !post) {
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
                    <div className="fullPostPhoto">
                        <img src={post.image || 'person.png'} alt="photo" />
                    </div>
                    <div className="postButtons">
                        <div className="postCardLeft">
                        <i onClick={() => { PostFunc.likeUnlike(post._id, properties) }} style={{ color: post.likes.includes(user._id) ? 'red' : '' }} className={`fa-heart ${post.likes.includes(user._id) ? 'fa-solid' : 'fa-regular'} `} ></i>
                            {/* <i className="fa-regular fa-comment"></i> */}
                            <i className="fa-regular fa-share-from-square"></i>
                        </div>
                        <div className="postCardRight">
                            <i className="fa-regular fa-bookmark"></i>
                        </div>
                    </div>
                    <div className='likeCount' style={{display:post.likes.length>0?'':'none'}}>{post.likes.length} Likes</div>
                </div>
                <div className="fullPostCardRight">
                    <div className='caption fullPostCaption'><span>{post.author.username} :</span> {post.caption}</div>
                    <div className="allComments">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Praesentium ea, sapiente perferendis nemo neque hic consequatur dolores dolorum fuga tempore voluptatum aperiam numquam reprehenderit minus quod ut? Voluptatibus, ipsa deleniti. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Exercitationem, labore beatae laborum voluptatem sed quas suscipit delectus cupiditate cumque tempora vitae repellendus perferendis ea, quos repellat totam! Porro, vel doloremque. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae similique labore, eligendi voluptas repudiandae maiores alias fugiat numquam minima. Harum ipsa odit iste blanditiis dolorem est nesciunt sit nostrum suscipit! Lorem, ipsum dolor sit amet consectetur adipisicing elit. Similique laudantium tenetur in, sequi quod saepe corporis id officiis, quis cumque at molestias amet sit nobis aut dolores, eius est deserunt!
                    </div>
                    <div className='fullPostCreateComment'>
                        <div className="postCardLeft">
                            <input value={text} onChange={handleInput} type='text' placeholder='add a comment' />
                        </div>
                        <div className="postCardRight">
                            {text && <span className='postCommentBtn'>Post</span>}
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
                {dialog && <PostDialog handleDialog={handleDialog} user={user} post={post}/>}  
            </div>
            <div className="fullPostRightCorner">
                <i onClick={()=>{navigate('/')}} className="fa-regular fa-2xl fa-circle-xmark"></i>
            </div>
        </div>
    )
}

export default FullPost
