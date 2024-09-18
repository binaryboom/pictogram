import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import Signup from './components/Signup/Signup'
import Login from './components/Login/Login'
import MainLayout from './components/MainLayout/MainLayout'
import Home from './components/Home/Home'
import Profile from './components/Profile/Profile'
import FullPost from './components/FullPost/FullPost'
import Home2 from './components/Home/Home2'
import EditProfile from './components/EditProfile/EditProfile'
import Chat from './components/Chat/Chat'
import { io } from 'socket.io-client'
import { useDispatch, useSelector } from 'react-redux'
import { setSocket } from './redux/socketSlice'
import { setOnlineUsers } from './redux/chatSlice'
import { setLikeNotification } from './redux/rtnSlice'
import { setMsgNotification } from './redux/rtnMsg'
import { setFollowNotification } from './redux/rtnFollow'
import { setOfflineUsers } from './redux/offlineSlice'
import { useApi } from './context/apiContext'
import ProtectedRoute from './components/MainLayout/ProtectedRoute'


function App() {
  const browserRouter = createBrowserRouter([
    {
      path: '/',
      element: <ProtectedRoute> <MainLayout /> </ProtectedRoute>,
      children: [
        {
          path: '/',
          element: <ProtectedRoute> <Home2 /></ProtectedRoute>
        },
        {
          path: '/profile/:username',
          element:<ProtectedRoute> <Profile /></ProtectedRoute>
        },
        {
          path: '/profile/edit',
          element: <ProtectedRoute><EditProfile /></ProtectedRoute>
        },
        {
          path: '/:id',
          element: <ProtectedRoute><FullPost /></ProtectedRoute>
        },
        {
          path: '/chats',
          element: <ProtectedRoute> <Chat /></ProtectedRoute>
        },
      ]
    },
    {
      path: '/signup',
      element: <Signup />
    },
    {
      path: '/login',
      element: <Login />
    },

  ])
  const dispatch = useDispatch()
  const { user } = useSelector(store => store.auth)
  const { socket } = useSelector(store => store.socketio)
  const apiUrl=useApi()
  useEffect(() => {
    if (user) {
      console.log(user.isVerified)
      const socketIo = io('http://192.168.1.46:3000', {
        query: {
          userId: user?._id,
          username: user?.username, // Add these details
          profilePicture: user?.profilePicture, // Add these details
          isVerified: Boolean(user?.isVerified)
        },
        transports: ['websocket']
      })
      dispatch(setSocket(socketIo))

      socketIo.on('getOnlineUsers', (onlineUsers) => {
        console.log('Online users received:', onlineUsers);
        dispatch(setOnlineUsers(onlineUsers))
      })
      // socketIo.on('userLastSeen', ({ userId, lastSeen }) => {
      //   console.log('offline users received:', userId,lastSeen);
      //   // dispatch(setOfflineUsers(offlineUsers))
       
      //   const setLastSeen = async () => {
      //     const apiUrl= `http://192.168.1.46:3000/api/v1`;
      //     let res;
      //     try {
      //       //   setLoading(true)
      //       let req = await fetch(`${apiUrl}/user/setLastSeen`, {
      //         method: 'POST',
      //         body: JSON.stringify({userId, lastSeen: new Date() }),
      //         headers: {
      //           'Content-Type': 'application/json'
      //         },
      //         credentials: 'include',
      //       });
      //       res = await req.text()
      //       console.log(res)

      //     } catch (error) {
      //       res = { success: false, message: 'Unable to connect with server' }
      //       console.log(error)
      //     //   showAlert(res)
      //     }
          
      //   }

      //   setLastSeen()
      // })
      socketIo.on('notifications', (notifications) => {
        // console.log('Notifications received:', notifications);
        dispatch(setLikeNotification(notifications))
      })
      socketIo.on('msgNotification', (notifications) => {
        // console.log('Notifications received:', notifications);
        dispatch(setMsgNotification(notifications))
      })
      socketIo.on('followNotification', (notifications) => {
        console.log('Follow Notifications received:', notifications);
        dispatch(setFollowNotification(notifications))
      })


      return () => {
        if (socketIo) {
          socketIo.close()
          dispatch(setSocket(null))
          // dispatch(setOnlineUsers(null))
        }
      }
    }
    // else if(socket){
    //   socket.close()
    //   dispatch(setSocket(null))
    // }
  }, [user, dispatch])
  return (
    <>

      <RouterProvider router={browserRouter} />

    </>
  )
}

export default App
