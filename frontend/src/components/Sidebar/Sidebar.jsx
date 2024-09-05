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


const Sidebar = () => {
  const dispatch=useDispatch()
  const {user}=useSelector(store=>store.auth)
  const navigate = useNavigate();
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0)
  const [createPost,setCreatePost] = useState(false)
  function handleActive(idx) {
    setActiveIdx(idx);
  }
  function handleCreatePost(){
    setCreatePost(!createPost);
  }

  const logout = async () => {
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
      res.success ? (navigate('/login'),dispatch(setAuthUser(null))) : null
      showAlert(res)
      setLoading(false)
    }
  }

  const items = [
    { iconClass: 'fa-solid fa-house', text: 'Home', divClass: 'sidebarHome' },
    { iconClass: 'fa-solid fa-magnifying-glass', text: 'Search', divClass: 'sidebarSearch', isMob: true },
    { iconClass: 'fa-regular fa-compass', text: 'Explore', divClass: 'sidebarExplore' },
    { iconClass: 'fa-regular fa-message', text: 'Messages', divClass: 'sidebarMessages' },
    { iconClass: 'fa-regular fa-heart', text: 'Notifications', divClass: 'sidebarNotifications', isMob: true },
    { iconClass: 'fa-regular fa-square-plus', text: 'Create', divClass: 'sidebarCreate' ,onClick:handleCreatePost},
    { iconClass: 'profile', text: 'Profile', divClass: 'sidebarProfile' },
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
              (<img className='sidebarProfileImg' src={user?.profilePicture || '/person.png'} alt='profile'></img>) :
              (<i className={`fa-lg ${i.iconClass}`}></i>)
            }
            <span className='sidebarIconInfo sidebarIconDisplay'>{i.text}</span>
          </div>
        ))}
      </div>
      {createPost && <CreatePost user={user} handleCreatePost={handleCreatePost} />}
    </>
  )
}

export default Sidebar
