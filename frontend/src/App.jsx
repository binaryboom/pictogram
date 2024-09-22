import { useEffect, useState } from 'react'
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom'
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
  const msgNotifications = useSelector(state => state.rtnMsg.msgNotifications);
  const [selectedChat, setSelectedChat] = useState(null);
  const [recentChats, setRecentChats] = useState(null)
  // const location = useLocation();
  // useEffect(() => {
  //   // Reset selectedChat when navigating to a different page
  //   setSelectedChat(null);
  // }, [location.pathname]); // This will run when the path changes

  const browserRouter = createBrowserRouter([
    {
      path: '/',
      element: <ProtectedRoute> <MainLayout selectedChat={selectedChat} setSelectedChat={setSelectedChat} recentChats={recentChats} setRecentChats={setRecentChats} /> </ProtectedRoute>,
      children: [
        {
          path: '/',
          element: <ProtectedRoute> <Home2 /></ProtectedRoute>
        },
        {
          path: '/profile/:username',
          element: <ProtectedRoute> <Profile /></ProtectedRoute>
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
  const apiUrl = useApi()
  useEffect(() => {
    if (user) {
      console.log(user.isVerified)
      const socketIo = io(process.env.URL, {
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
        // console.log('Online users received:', onlineUsers);
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
      socketIo.on('onlineSender', (onlineSender) => {
        // console.log('Notifications received:', onlineSender);
        dispatch(setLikeNotification(onlineSender))
      })
      // socketIo.on('msgNotification', (onlineSender) => {
      //   // console.log('Notifications received:', onlineSender);
      //   if (selectedChat && onlineSender.senderId === selectedChat._id) {
      //     dispatch(setMsgNotification(
      //       msgNotifications.filter((m) => (m.senderId !== selectedChat._id))
      //     ))

      //   } else {
      //     dispatch(setMsgNotification(onlineSender))
      //   }
      // })

      socketIo.on('followNotification', (onlineSender) => {
        // console.log('Follow Notifications received:', onlineSender);
        dispatch(setFollowNotification(onlineSender))
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

  useEffect(() => {
    if (socket) {
      socket.on('msgNotification', (onlineSender) => {
        console.log('Notifications received:', onlineSender);
        if (selectedChat && onlineSender.senderId === selectedChat._id) {
          socket.emit('markMessagesAsSeen', { otherUserId: selectedChat._id, mainUserId: user._id ,message:onlineSender});
          dispatch(setMsgNotification(
            msgNotifications.filter((m) => (m.senderId !== selectedChat._id))
          ))

        } else {
          dispatch(setMsgNotification(onlineSender))
        }
        setRecentChats((prevChats) => {
          const chatToUpdate = prevChats.find((rc) => rc._id === onlineSender.senderId?._id || rc._id === onlineSender.senderId);

          if (chatToUpdate) {
              return [
                  { ...onlineSender.senderId},
                  ...prevChats.filter((rc) => rc._id !== onlineSender.senderId._id),
              ];
          } else {
              return [{ ...onlineSender.senderId }, ...prevChats];
          }
      });
      })

      return () => {
        socket.off('msgNotification');
      };
    }
  }, [user, socket, dispatch,msgNotifications]);
  return (
    <>

      <RouterProvider router={browserRouter} />

    </>
  )
}

export default App
