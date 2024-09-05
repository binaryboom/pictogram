import React, { useContext, useRef, useState } from 'react'
import './CreatePost.css'
import { useAlert } from '../../context/AlertContext';
import { useApi } from '../../context/apiContext';
import {useNavigate} from 'react-router-dom'

const CreatePost = ({ handleCreatePost ,user}) => {
  const navigate=useNavigate();
  const apiUrl=useApi()
  const [loading, setLoading] = useState(false);
  const { showAlert } = useAlert();
  const imgRef = useRef()
  const [imagePreview, setImagePreview] = useState(null);
  const [caption, setCaption] = useState('')
  function handleCaptionInput(e) {
    let text = e.target.value;
    if (text.trim()) {
      setCaption(text);
    }
    else {
      setCaption('');
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {  // Check if the file is an image
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl); // Set the image preview URL
      console.log(imageUrl)
    } else {
      showAlert({success:false,message:'Please select a valid image file.'});
      setImagePreview(null);  // Clear the preview if the file is not valid
    }
  }
 async function handleSubmit(){
    console.log(imgRef.current.files[0],caption)
    let res;
    try {
      setLoading(true)
      const formData = new FormData();
        formData.append('image', imgRef.current.files[0]);
        formData.append('caption', caption);
      

      let req=await fetch(`${apiUrl}/post/createPost`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      res=await req.json()
      console.log(res)

    } catch (error) {
      res={success:false,message:'Unable to connect with server'}
      console.log(error)
      showAlert(res)
    }
    finally {
      res.success? (handleCreatePost(),navigate('/') ):null
      showAlert(res)
      setLoading(false)
    }
  }
  return (
    <div className='dialog'>
      {loading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <div className="fullPostRightCorner">
        <i onClick={handleCreatePost} className="fa-regular fa-2xl fa-circle-xmark"></i>
      </div>
      <div className="createPostBox">
        <div className='createPostTitle'>Create New Post</div>
        <div className="userInfo">
          <div className="postCardLeft">
            <div className="authorImg">
              <img src={user.profilePicture || 'person.png'} alt="photo" />
            </div>
            <div className="authorUsername">{user.username}</div>
          </div>
        </div>
        <div className="postUploads">
          <div className='createPostCaption'>
            <input value={caption} onChange={handleCaptionInput} type='text' placeholder='write some caption' />
          </div>
          <div className="createPostPhoto">
            {imagePreview && (
              <div className="imagePreview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
            <input onChange={handleImageUpload} ref={imgRef} accept="image/*" type="file" />
            {!imagePreview && <button onClick={() => { imgRef.current.click() }} className='uploadPhotoBtn'>Upload from Gallery</button>}
          </div>
          <div className="createPostBtn">
          {imagePreview && <button onClick={handleSubmit} className='uploadPhotoBtn'>Create Post</button>}  
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
