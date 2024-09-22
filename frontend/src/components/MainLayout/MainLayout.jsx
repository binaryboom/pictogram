import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Home from '../Home/Home'
import RightSidebar from '../RightSidebar/RightSidebar'
import './MainLayout.css'
import Profile from '../Profile/Profile'
import EditProfile from '../EditProfile/EditProfile'
import Chat from '../Chat/Chat'


const MainLayout = ({selectedChat,setSelectedChat,recentChats,setRecentChats}) => {
  const location = useLocation();
  const isEditProfile=location.pathname === '/profile/edit' 
  const isChat=location.pathname === '/chats' 
  const isProfilePage = location.pathname.startsWith('/profile') && !isEditProfile;
  const notHome=!isEditProfile && !isProfilePage && !isChat
  const isHome= location.pathname.startsWith('/') && notHome
  useEffect(() => {
    if (!isChat) {
      setSelectedChat(null);
    }
  }, [isChat, setSelectedChat]);
  return (
    <div className='mainLayout'>
    <Sidebar/>
    
      {/* <div className='mainRight'>
        <Outlet/>
      </div>
    <RightSidebar/> */}
    {isHome && (
        <>
          <div className='mainRight'>
            <Outlet />
          </div>
          <RightSidebar />
        </>
      )}

    {isEditProfile && ( <div className='mainRight'><EditProfile /></div>)}
    {isProfilePage && ( <div className='mainRight'><Profile /></div>)}
    {isChat && ( <div  className='chatMainRight'><Chat selectedChat={selectedChat} setSelectedChat={setSelectedChat} recentChats={recentChats} setRecentChats={setRecentChats} /></div>)}




    </div>
  )
}

export default MainLayout
