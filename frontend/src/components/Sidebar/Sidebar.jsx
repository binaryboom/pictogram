import React, { useState } from 'react'
import Logo from '../Logo/Logo'
import CreatePost from '../CreatePost/CreatePost'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import { useNavigate } from 'react-router-dom'
import store from '../../redux/store'
import './Sidebar.css'
import { useDispatch, useSelector } from 'react-redux'
import { setAuthUser } from '../../redux/authSlice'
import { setLikeNotification } from '../../redux/rtnSlice'
import { setFollowNotification } from '../../redux/rtnFollow'
import { setMsgNotification } from '../../redux/rtnMsg'
import Notifications from '../Notifications/Notifications'




const Sidebar = () => {
  const dispatch=useDispatch()
  const {user}=useSelector(store=>store.auth)
  const {likeNotifications}=useSelector(store=>store.rtn)
  // const {msgNotifications}=useSelector(store=>store.rtn)
  const msgNotifications = useSelector(state => state.rtnMsg.msgNotifications); 
  const followNotifications = useSelector(state => state.rtnFollow.followNotifications);
  console.log(msgNotifications)
  console.log(likeNotifications)
  const navigate = useNavigate();
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0)
  const [createPost,setCreatePost] = useState(false)
  const [notification,setNotification] = useState(false)

  function handleActive(idx) {
    setActiveIdx(idx);
  }
  function handleCreatePost(){
    setNotification(false)
    setCreatePost(!createPost);
  }
  function handleProfile(){
    setNotification(false)
    navigate(`/profile/${user.username}`)
  }
  function handleHome(){
    setNotification(false)
    navigate(`/`)
  }
  function handleChats(){
    setNotification(false)
    navigate(`/chats`)
  }
  function handleNotifications(){
    setNotification(!notification)
  }
  const logout = async () => {
    setNotification(false)
    let res;
    try {
      setLoading(true)
      let req = await fetch(`${apiUrl}/user/logout`, {
        method: 'GET',
        credentials: 'include'
      });
      res = await req.json()
      console.log(res)

    } catch (error) {
      res = { success: false, message: 'Unable to connect with server' }
      console.log(error)
      showAlert(res)
    }
    finally {
      if (res.success) {
        dispatch(setMsgNotification(null));
        dispatch(setLikeNotification(null));
        dispatch(setFollowNotification(null));
        dispatch(setAuthUser(null))
        navigate('/login');
      }
      showAlert(res)
      setLoading(false)
    }
  }

  const items = [
    { iconClass: 'fa-solid fa-house', text: 'Home', divClass: 'sidebarHome',onClick:handleHome },
    { iconClass: 'fa-solid fa-magnifying-glass', text: 'Search', divClass: 'sidebarSearch', isMob: true },
    { iconClass: 'fa-regular fa-compass', text: 'Explore', divClass: 'sidebarExplore' },
    { iconClass: 'fa-regular fa-message', text: 'Messages', divClass: 'sidebarMessages',onClick:handleChats },
    { iconClass: 'fa-regular fa-heart', text: `Notifications`, divClass: 'sidebarNotifications', isMob: true ,onClick:handleNotifications},
    { iconClass: 'fa-regular fa-square-plus', text: 'Create', divClass: 'sidebarCreate' ,onClick:handleCreatePost},
    { iconClass: 'profile', text: 'Profile', divClass: 'sidebarProfile' ,onClick:handleProfile},
    { iconClass: 'fa-solid fa-right-from-bracket', text: 'Logout', divClass: 'sidebarLogout', isMob: true, onClick: logout },
  ]

  return (
    <>
      <div className="mobNavbar">
        <Logo customStyle={'mobLogo'} />
        {items.filter((item) => item.isMob).map((i, idx) => {
          const customIdx=idx+10;
          return (
            <div
              className={`${i.divClass} mobNavbarIcons sidebarItems ${customIdx === activeIdx ? 'active' : ''}`}
              key={customIdx}
              onClick={() => {
                handleActive(customIdx);
                i.onClick();
              }}
            >

              <i className={`fa-xl ${i.iconClass}`}></i>
              {i.iconClass==='fa-regular fa-heart' && likeNotifications.length +followNotifications.length>0 && <sup className='notificationCount'>{likeNotifications.length+followNotifications.length}</sup>}
        
            </div>
          )})}

      </div>


      <div className='sidebar'>
        {loading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        <Logo customStyle='sidebarLogo' />
        {items.map((i, idx) => (
          <div className={`${i.divClass} sidebarItems ${idx === activeIdx ? 'active' : ''}`} key={idx}
            onClick={() => { handleActive(idx); i.onClick(); }}>
            {i.iconClass === 'profile' ?
              (<img draggable='false' className='sidebarProfileImg' src={user?.profilePicture || '/person.png'} alt='profile'></img>) :
              <>
              <i className={`fa-lg ${i.iconClass}`}></i>
                
              </>
            }
            <span className='sidebarIconInfo sidebarIconDisplay'>{i.text}
            {i.iconClass==='fa-regular fa-heart' && likeNotifications.length+followNotifications.length>0 && <sup className='notificationCount'>{likeNotifications.length+followNotifications.length}</sup>}
            </span>
            {i.iconClass==='fa-regular fa-message' && msgNotifications?.length>0 && <sup className='notificationCount'>{msgNotifications?.length}</sup>}
          </div>
        ))}
      </div>
      {createPost && <CreatePost user={user} handleCreatePost={handleCreatePost} />}
      {notification && <Notifications handleNotifications={handleNotifications} />}
    </>
  )
}

export default Sidebar
