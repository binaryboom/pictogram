import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar'
import Home from '../Home/Home'
import RightSidebar from '../RightSidebar/RightSidebar'
import './MainLayout.css'

const MainLayout = () => {
  return (
    <div className='mainLayout'>
    <Sidebar/>
    
      <div className='mainRight'>
        <Outlet/>
      </div>
    <RightSidebar/>
    </div>
  )
}

export default MainLayout
