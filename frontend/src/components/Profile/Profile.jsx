import React from 'react'
import './p2.css'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useApi } from '../../context/apiContext.jsx'
import { useAlert } from '../../context/AlertContext.jsx'
import { useNavigate, useParams } from 'react-router-dom'
import ProfileFunc from './ProfileFunc.js'
import PostDialogFunc from '../PostDialog/PostDialogFunc.js'





const Profile = () => {

  const { username } = useParams()
  const [active, setActive] = useState('posts')
  const { user } = useSelector(store => store.auth)
  const [loading, setLoading] = useState(false)
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [profile, setProfile] = useState(null)
  function handleProfile(profile) {
    setProfile(profile);
  }
  const properties = {
    apiUrl, setLoading, navigate, showAlert, dispatch, user, handleProfile
  }
  useEffect(() => {
    ProfileFunc.getUserProfile(username, properties);
  }, [username])
  if (loading || !profile) {
    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    );
  }
  return (
    <div className='profilePage'>
      <div className="profileContainer">
        <div className="fixed">
          <div className="profileUserInfo">
            <div className="profileItemsLeft">
              <img draggable='false' src={profile.profilePicture || '/person.png'} alt="" />
            </div>
            <div className="profileItemsRight">
              <div className="subItemsRight">
                <div className="profileUsername">{profile.username}{profile.isVerified && <span className="profileBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></span>}
                </div>
                {user._id === profile._id && <div className="editProfileBtn">
                  <button onClick={() => { navigate('/profile/edit') }} className='editProfileBtn'>Edit Profile</button>
                </div>}
                {user._id !== profile._id && (
                  <div onClick={() => { navigate('/chats', { state: { profile } }) }} className="profileUserFollowBtn"><button className='profileMsgBtn'><span className='notForMobText'>Message&nbsp;&nbsp;</span><i class=" fa-xl fa-solid fa-message"></i></button></div>
                )}
                {user._id !== profile._id && (
                  <div onClick={() => { PostDialogFunc.followUnfollow(profile._id, properties) }} className="profileUserFollowBtn">
                    <button style={{ backgroundColor: user.following.includes(profile._id) ? '#ED4956' : '#0095F6' }}>{user.following.includes(profile._id) ? 'Unfollow' : 'Follow'}</button></div>
                )}

              </div>
              <div className="subItemsRight">
                <div className="profileBio">{profile.bio}</div>
              </div>
            </div>
          </div>

          <div className="profileOtherInfo">
            <div className="postCount">{profile.posts.length > 1 ? `${profile.posts.length} Posts` : `${profile.posts.length} Post`}</div>
            <div className="followersCount">{profile.followers.length > 1 ? `${profile.followers.length} Followers` : `${profile.followers.length} Follower`}</div>
            <div className="followingCount">{profile.following.length + ' Following'}</div>
          </div>
          <div className="profilePostOptions">
            <div onClick={() => { setActive('posts') }} className={active === 'posts' ? 'activeProfileIcon' : ''}><i className="fa-xl fa-solid fa-table-cells"></i></div>
            <div onClick={() => { setActive('saved') }} className={active === 'saved' ? 'activeProfileIcon' : ''}><i className="fa-xl fa-regular fa-bookmark"></i></div>
          </div>

        </div>
        <div className="profilePostContainer">
          {active === 'posts' && (
            <>
              {profile.posts.length > 0 ? (
                profile.posts.map((post) => (
                  <div key={post._id} onClick={() => { navigate(`/${post._id}`) }} className="profilePostCard">
                    <img draggable='false' src={post.image || '/person.png'} alt="post" />
                  </div>
                ))
              ) : (
                <div className="noPosts">No posts available.</div>
              )}
            </>
          )}

          {active === 'saved' && (
            <>
              {profile.saved.length > 0 ? (
                profile.saved.map((post) => (
                  <div key={post._id} onClick={() => { navigate(`/${post._id}`) }} className="profilePostCard">
                    <img draggable='false' src={post.image || '/person.png'} alt="post" />
                  </div>
                ))
              ) : (
                <div className="noPosts">No saved posts available.</div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profile
