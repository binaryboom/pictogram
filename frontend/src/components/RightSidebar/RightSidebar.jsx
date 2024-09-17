import React, { useEffect, useState } from 'react'
import './RightSidebar.css'
import RightSidebarFunc from './RightSidebarFunc.js'
import { useDispatch, useSelector } from 'react-redux'
import { useApi } from '../../context/apiContext.jsx'
import { useAlert } from '../../context/AlertContext.jsx'
import { useNavigate } from 'react-router-dom'
import PostDialogFunc from '../PostDialog/PostDialogFunc.js'


const RightSidebar = () => {
  const { user } = useSelector(store => store.auth)
  const [loading, setLoading] = useState(false)
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [suggestedUsers, setSuggestedUsers] = useState([])
  function handleSuggested(users) {
    setSuggestedUsers(users);
  }
  const properties = {
    apiUrl, setLoading, navigate, showAlert, dispatch, user, setSuggestedUsers
  }
  useEffect(() => {
    RightSidebarFunc.getSuggestedUsers(properties)
  }, [])

  return (
    <div className='rightSidebar'>

      <div className="mainUserInfo container"> 
        <div onClick={()=>{navigate(`/profile/${user.username}`)}} className="itemLeft">
          <div className="suggestedUserPhoto">
            <img draggable='false' src={user.profilePicture || '/person.png'} alt="photo" />
          </div>
          <div className="suggestedUserUsername">{user.username}</div>
          {user.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}   
        </div>
        <div className="itemRight">
          <span className='followSuggested' style={{ color: '#0095F6' }}>Switch</span>
        </div>
      </div>

      <div className="suggestedText">Suggested For You :</div>

      {suggestedUsers.map((s) => {
        return (
          <div className="otherUserInfo container">
            <div onClick={()=>{navigate(`/profile/${s.username}`)}} className="itemLeft">
              <div className="suggestedUserPhoto">
                <img draggable='false' src={s.profilePicture ||'/person.png'} alt="photo" />
              </div>
              <div className="suggestedUserUsername">{s.username}</div>
              {s.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}   
            </div>
            <div className="itemRight">
              <span onClick={()=>{PostDialogFunc.followUnfollow(s._id, properties)}} style={{color:user.following.includes(s._id)?'#ED4956':'#0095F6'}} className='followSuggested'>{user.following.includes(s._id)?'Unfollow':'Follow'}</span>
            </div>
          </div>
        )
      })}

    </div>
  )
}

export default RightSidebar
