import { useEffect, useRef, useState } from 'react'
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
import { setCommentNotification } from './redux/rtnComment'


function App() {
  const msgNotifications = useSelector(state => state.rtnMsg.msgNotifications);
  const [selectedChat, setSelectedChat] = useState(null);
  const [recentChats, setRecentChats] = useState(null)
  const selectedChatRef = useRef(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const receiveAudioRef = useRef(null);
  const sendAudioRef2 = useRef(null);


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


      socketIo.on('notifications', (notification) => {
        receiveAudioRef.current.play(); 
        // console.log('Notifications received:', onlineSender);
        dispatch(setLikeNotification(notification))
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
        receiveAudioRef.current.play(); 
        // console.log('Follow Notifications received:', onlineSender);
        dispatch(setFollowNotification(onlineSender))
      })
      socketIo.on('commentNotification', (notification) => {
        receiveAudioRef.current.play(); 
        // console.log('Follow Notifications received:', onlineSender);
        dispatch(setCommentNotification(notification))
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
        if (selectedChatRef.current._id && onlineSender.senderId._id === selectedChatRef.current._id) {
          sendAudioRef2.current.play(); 
          socket.emit('markMessagesAsSeen', { otherUserId: selectedChatRef.current._id, mainUserId: user._id, message: onlineSender });
          dispatch(setMsgNotification(
            msgNotifications.filter((m) => (m.senderId !== selectedChatRef.current._id))
          ))
        } else {
          dispatch(setMsgNotification(onlineSender))
          receiveAudioRef.current.play(); 
        }
        // setRecentChats((prevChats=[]) => {
        //   const chatToUpdate = prevChats?.find((rc) => rc._id === onlineSender.senderId?._id || rc._id === onlineSender.senderId);

        //   if (chatToUpdate) {
        //     return [
        //       { ...onlineSender.senderId },
        //       ...prevChats.filter((rc) => rc._id !== onlineSender.senderId._id),
        //     ];
        //   } else {
        //     return [{ ...onlineSender.senderId }, ...prevChats];
        //   }
        // });
        setRecentChats((prevChats = []) => {
          // Ensure prevChats is always an array by default
          const safePrevChats = Array.isArray(prevChats) ? prevChats : [];
        
          const chatToUpdate = safePrevChats.find(
            (rc) => rc._id === onlineSender.senderId?._id || rc._id === onlineSender.senderId
          );
        
          if (chatToUpdate) {
            return [
              { ...onlineSender.senderId },
              ...safePrevChats.filter((rc) => rc._id !== onlineSender.senderId._id),
            ];
          } else {
            return [{ ...onlineSender.senderId }, ...safePrevChats];
          }
        });
      })

      return () => {
        socket.off('msgNotification');
      };
    }
  }, [user, socket, dispatch, msgNotifications]);
  return (
    <>
      <audio style={{ display: 'none' }} ref={sendAudioRef2} src="/send.mp3" />
      <audio style={{ display: 'none' }} ref={receiveAudioRef} src="/receive.mp3" />
      <RouterProvider router={browserRouter} />

    </>
  )
}

export default App
