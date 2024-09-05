import { useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Signup from './components/Signup/Signup'
import Login from './components/Login/Login'
import MainLayout from './components/MainLayout/MainLayout'
import Home from './components/Home/Home'
import Profile from './components/Profile/profile'
import FullPost from './components/FullPost/FullPost'


function App() {
  const browserRouter = createBrowserRouter([
    {
      path: '/',
      element: <MainLayout />,
      children: [
        {
          path: '/',
          element: <Home />
        },
        {
          path: '/profile',
          element: <Profile />
        },
        {
          path: '/:id',
          element: <FullPost />
        },
      ]
    },
    {
      path:'/signup',
      element:<Signup/>
    },
    {
      path:'/login',
      element:<Login/>
    },
  ])

  return (
    <>
    <RouterProvider router={browserRouter}/>
    
    </>
  )
}

export default App
