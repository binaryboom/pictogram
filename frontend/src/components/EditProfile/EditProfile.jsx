import React, { useRef, useState } from 'react'
import './EditProfile.css'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../context/apiContext';
import { useAlert } from '../../context/AlertContext';
import { setAuthUser } from '../../redux/authSlice';


const EditProfile = () => {
    const { user } = useSelector(store => store.auth)
    const [bio, setBio] = useState(user.bio || '');
    const [gender, setGender] = useState(user.gender || 'undefined');
    const [showAllPosts, setShowAllPosts] = useState(true); // default value
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const apiUrl = useApi()
    const [loading, setLoading] = useState(false);
    const { showAlert } = useAlert();
    const imgRef = useRef()
    const [imagePreview, setImagePreview] = useState(null);

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {  // Check if the file is an image
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl); // Set the image preview URL
            console.log(imageUrl)
        } else {
            showAlert({ success: false, message: 'Please select a valid image file.' });
            setImagePreview(null);  // Clear the preview if the file is not valid
        }
    }
    async function handleSubmit() {
        // console.log(imgRef.current.files[0])
        let res;
        try {
            setLoading(true)
            const formData = new FormData();
            formData.append('profilePicture', imgRef.current.files[0]);
            formData.append('bio', bio); // use state for bio
            formData.append('gender', gender); // use state for gender
            // formData.append('showAllPosts', showAllPosts);

            let req = await fetch(`${apiUrl}/user/profile/edit`, {
                method: 'POST',
                body: formData,
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
            // res.success? (handleCreatePost(),navigate('/') ):null
            if (res.success) {
                dispatch(setAuthUser(res.user));
                navigate(`/profile/${res.user.username}`)
            }

            showAlert(res)
            setLoading(false)
        }
    } 
    return (
        <div className="editProfilePage">
            {loading && (
                <div className="loader-container">
                    <span className="loader"></span>
                </div>
            )}
            <div className="editProfileTitle">Edit Profile</div>
            <div className="editForm">

                <div className="editUserInfo1">
                    <div className="editItemLeft">
                        <div className="editUserPhoto"><img draggable='false' src={imagePreview || user.profilePicture || '/person.png'} alt="photo" /></div>
                        <div className="editUserUsername">{user.username}</div>
                        {user.isVerified && <abbr title="Founder (Pictogram)"><img className="editBlueTick" src="/verified.png" alt="" /></abbr>}
                    </div>
                    <div className="editItemRight">
                        <div className="createPostPhoto">
                            <input onChange={handleImageUpload} ref={imgRef} accept="image/*" type="file" />
                            <button onClick={() => { imgRef.current.click() }} className='uploadPhotoBtn'>Change Photo</button>
                        </div>
                    </div>
                </div>

                <div className="editUserInfo2">
                    <div className="editItemLeft">
                        <span className='editBioLabel'><label htmlFor="editBioTextArea">Bio</label></span>
                    </div>
                    <div className="editItemRight">
                        <textarea onChange={(e) => setBio(e.target.value)} maxLength={150} value={bio} name="" id="editBioTextArea"></textarea>
                    </div>
                </div>

                <div className="editUserInfo2">
                    <div className="editItemLeft">
                        <span className='editGenderLabel'><label htmlFor="editBioGender">Gender</label></span>
                    </div>
                    <div className="editItemRight">
                        <select value={gender} onChange={(e) => setGender(e.target.value)} name="gender" id="editBioGender">
                            <option value="undefined">Select your Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>

                <div className="editUserInfo2">
                    <div className="editItemLeft">
                        <span className='editPostPrefLabel'><abbr title="To disable this option you must have atleast 5 followers">Show posts of all users</abbr></span>
                    </div>
                    <div className="editItemRight">
                        <label class="switch">
                            <input checked={showAllPosts} onChange={(e) => setShowAllPosts(e.target.checked)} type="checkbox" />
                            <span class="slider round"></span>
                        </label>
                    </div>
                </div>

                <div className="updateUserInfo">
                    <button onClick={handleSubmit} className='updateProfileBtn'>Update Profile</button>
                </div>


            </div>
        </div>
    )
}

export default EditProfile
