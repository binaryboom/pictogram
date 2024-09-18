import React, { useEffect, useRef, useState } from 'react'
import './Chat.css'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import ChatFunc from './ChatFunc'
import { format, formatDistance, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import useGetRTM from '../../hooks/useGetRTM'

const Chat = () => {
  const location = useLocation();
  const profile = location.state?.profile;
  // console.log(profile)
  const [prevDate, setPrevDate] = useState('');
  const formatDate = (date) => format(new Date(date), 'MMM d, yyyy');
  const { user } = useSelector(store => store.auth)
  const [selectedChat, setSelectedChat] = useState(null);
  const { onlineUsers } = useSelector(store => store.chat)
  const { offlineUsers } = useSelector(store => store.offlineSlice)
  // console.log(offlineUsers)
  const [loading, setLoading] = useState(false)
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [text, setText] = useState('')
  const [recentChats, setRecentChats] = useState(null)
  const [allUsers, setAllUsers] = useState(null)
  const [messages, setMessages] = useState([])
  const [showAllUsers, setShowAllUsers] = useState(false)

  // const isOnline = onlineUsers?.some((user) => user._id === selectedChat?._id);
  const isUserOnline = (userId) => onlineUsers?.some((user) => user._id === userId);
  const getUserLastSeen = (date) => {
    const lastSeenDate = new Date(date);
    if (isToday(lastSeenDate)) {
      return `last seen today at ${format(lastSeenDate, 'hh:mm a')}`;
    } else if (isYesterday(lastSeenDate)) {
      return `last seen yesterday at ${format(lastSeenDate, 'hh:mm a')}`;
    } else {
      return `last seen on ${format(lastSeenDate, 'MMM d, yy')} at ${format(lastSeenDate, 'hh:mm a')}`;
    }
  };
  const properties = {
    apiUrl, setLoading, navigate, showAlert, dispatch, user, text, setText,recentChats,selectedChat, setRecentChats, setAllUsers, setMessages
  }

  const [dialog, showDialog] = useState(false);
  function handleDialog() {
    showDialog(!dialog);
  }
  function handleInput(e) {
    let inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText)
    }
    else {
      setText('')
    }
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line when Shift + Enter is pressed
        return;
      }
      e.preventDefault(); // Prevents adding a newline
      if (text.trim()) {
        ChatFunc.sendMsg(selectedChat._id, properties);
        setText(''); // Clear the input after sending the message
      }
    }
  };
  function handleChatClick(chat) {
    // console.log(chat)
    setMessages([])
    ChatFunc.getAllMsg(chat._id, properties)
    setSelectedChat(chat);
  }
  const handleBackButtonClick = () => {
    // Set selectedChat to null after updating recentChats
    setSelectedChat(null);
  };
  useEffect(() => {
    if (profile) {
      handleChatClick(profile)
    }
    ChatFunc.getRecentChats(properties);
    ChatFunc.getAllUsers(properties);
  }, [])

  useEffect(() => {
    console.log('onlineUsers changed:', onlineUsers);
    ChatFunc.getAllUsers(properties);
    ChatFunc.getRecentChats(properties);
  }, [onlineUsers])



  const chatEndRef = useRef(null);

  useGetRTM({ setMessages })

  useEffect(() => {
    // Scroll to bottom whenever messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages])
  if (!recentChats) {

    return (
      <div className="loader-container">
        <span className="loader"></span>
      </div>
    )
  }
  return (
    <div className='chatPage'>
      <div className={`chatPageLeft ${selectedChat ? 'hide' : ''}`}>
        <div className="chatPageLeftTop">
          {/* <div className="mainUserUsername">username</div> */}
          <div className="chatTitle">Messages</div>
        </div>

        <div className="chatPageLeftBody">

          {/* gpt */}
          <div className={`onlineCardContainer ${onlineUsers.length > 1 ? 'onlineCardContainerHeight' : ''}`} >
            {onlineUsers.map((onlineUser) => (
              onlineUser.username !== user.username && onlineUsers.length > 1 && (
                <div style={{ backgroundColor: selectedChat?._id === onlineUser._id ? '#00000024' : 'white' }} className="chatOnlineCardLeft" onClick={() => handleChatClick(onlineUser)} >
                  {/* {console.log(onlineUser)} */}
                  <div className="chatOnlineUserPhoto">
                    <img draggable='false' src={onlineUser.profilePicture || '/person.png'} alt="User photo" />
                  </div>
                  <div className="chatOnlineUserUsername">
                    <span style={{ color: '#03C03C', marginRight: '0.1rem', fontSize: '0.7rem' }}><i className="fa-solid fa-xs fa-circle"></i></span>
                    {onlineUser.username}
                    {onlineUser.isVerified === 'true' && <abbr title="Verified"><img className="chatBlueTick" src="/verified.png" alt="Verified" /></abbr>}
                  </div>
                </div>

              )
            ))}

          </div>
          {/* gpt */}
          {!showAllUsers ? <>
            <div className="allChatsTitle">Recent Chats</div>
            {recentChats.map((rc) => (
              <div style={{ backgroundColor: selectedChat?._id === rc._id ? '#00000024' : 'white' }} className="chatLeftCard" onClick={() => handleChatClick(rc)}>
                <div className="chatLeftCardLeft" >
                  <div className="chatLeftUserPhoto"><img draggable='false' src={rc.profilePicture || '/person.png'} alt="photo" /></div>
                </div>
                <div className="chatLeftCardRight">
                  <div className="chatLeftUserUsername">{rc.username}
                    {rc.isVerified && <abbr title="Founder (Pictogram)"><img className="chatBlueTick" src="/verified.png" alt="" /></abbr>}
                  </div>
                  <div className="chatLeftCardLastMsg">{isUserOnline(rc._id) ? 'online' : `${getUserLastSeen(rc.lastSeen)}`}</div>
                  {/* <div className="chatLeftCardLastMsg">{isUserOnline(rc._id) ? 'online' : `Last seen ${formatDistanceToNow(new Date(getUserLastSeen(rc._id)))}`}</div> */}
                </div>
              </div>
            ))}
          </>
            : <>
              <div className="allChatsTitle">Followers and Following</div>
              {allUsers.map((rc) => (
                <div style={{ backgroundColor: selectedChat?._id === rc._id ? '#00000024' : 'white' }} className="chatLeftCard" onClick={() => handleChatClick(rc)}>
                  <div className="chatLeftCardLeft" >
                    <div className="chatLeftUserPhoto"><img draggable='false' src={rc.profilePicture || '/person.png'} alt="photo" /></div>
                  </div>
                  <div className="chatLeftCardRight">
                    <div className="chatLeftUserUsername">{rc.username}
                      {rc.isVerified && <abbr title="Founder (Pictogram)"><img className="chatBlueTick" src="/verified.png" alt="" /></abbr>}
                    </div>
                    <div className="chatLeftCardLastMsg">{isUserOnline(rc._id) ? 'online' : `${getUserLastSeen(rc.lastSeen)}`}</div>
                  </div>
                </div>
              ))}
            </>
          }


          <span onClick={() => setShowAllUsers(!showAllUsers)} className="getAllUsers"><i class="fa-solid fa-xl fa-message"></i></span>
        </div>
      </div>
      <div className={`chatPageRight ${selectedChat ? 'show' : ''}`}>
        {!selectedChat ?
          <>

            <div className='center-container'>
              <div>
                <i class="fa-solid fa-user-group"></i>
                <div className='noChatSelected'>Select a friend to message</div>
              </div>
            </div>
          </>
          :
          <>
            <div className="chatPageRightTop">

              <div className="chatRightCard1">
                <div className="chatRightCardLeft" >
                  <div onClick={() => { handleBackButtonClick() }} className="mobBackBtn"><i className="fa-xl fa-solid fa-circle-left"></i></div>
                  <div onClick={() => { navigate(`/profile/${selectedChat.username}`) }} className="chatRightUserPhoto"><img draggable='false' src={selectedChat.profilePicture||'/person.png'} alt="photo" /></div>
                </div>
                <div className="chatRightCardRight">
                  <div onClick={() => { navigate(`/profile/${selectedChat.username}`) }} className="chatRightCardUserUsername">{selectedChat.username}
                    {selectedChat.isVerified && <abbr title="Founder (Pictogram)"><img className="chatBlueTick" src="/verified.png" alt="" /></abbr>}
                  </div>

                  <div style={{ color: isUserOnline(selectedChat._id) ? 'green' : 'red' }} className="chatRightCardLastSeen">{isUserOnline(selectedChat._id) ? 'online' : `${getUserLastSeen(selectedChat.lastSeen)}`}</div>
                </div>
              </div>



            </div>

            <div className="chatPageRightMiddle">
              {/* {messages?.length > 0 && messages.map((m) => (
                m.senderId === user._id ?
                  <div className="mainUserMsg">
                    <span>{m.message}</span>
                    <sub className="messageTime">{format(new Date(m.createdAt), 'hh:mm a')}</sub>
                  </div>

                  :
                  <div className="otherUserMsg">
                    <span>{m.message}</span>
                    <div className="messageTime">{format(new Date(m.createdAt), 'hh:mm a')}</div>
                  </div>
              ))} */}

              {/* {messages?.length > 0 && messages.map((m, index) => {
                const messageDate = formatDate(m.createdAt);
                const showDate = lastRenderedDate !== messageDate;
      
                // Update the lastRenderedDate to the current message's date
                if (showDate) {
                  lastRenderedDate = messageDate;
                }
      

                return (
                  <>
                    {showDate || index==0  && <div className="messageDate">{isToday(messageDate)?'Today':isYesterday(messageDate)?'Yesterday':messageDate}</div>}
                  <div key={m._id} className={`messageWrapper ${m.senderId === user._id ? 'mainUserMsg' : 'otherUserMsg'}`}>
                    <span>{m.message}</span>
                    <sub className="messageTime">{format(new Date(m.createdAt), 'hh:mm a')}</sub>
                  </div>
                  </>
                );
              })} */}
              {messages?.length > 0 && (() => {
                let lastRenderedDate = ''; // Declare lastRenderedDate outside of the map

                return messages.map((m, index) => {
                  const messageDate = formatDate(m.createdAt);
                  const showDate = lastRenderedDate !== messageDate;

                  // Update the lastRenderedDate to the current message's date
                  if (showDate) {
                    lastRenderedDate = messageDate;
                  }

                  return (
                    <React.Fragment key={m._id}> {/* Using React.Fragment with key */}
                      {(showDate || index === 0) && (
                        <div className="messageDate">
                          {isToday(messageDate) ? 'Today' : isYesterday(messageDate) ? 'Yesterday' : messageDate}
                        </div>
                      )}
                      <div className={`messageWrapper ${m.senderId === user._id ? 'mainUserMsg' : 'otherUserMsg'}`}>
                        <span>{m.message}</span>
                        <sub className="messageTime">{format(new Date(m.createdAt), 'hh:mm a')}</sub>
                      </div>
                    </React.Fragment>
                  );
                });
              })()}
              <div ref={chatEndRef} />

            </div>

            <div className="chatPageRightBottom">
              {/* <div className="chatRightCardLeft"> */}
              <textarea onKeyDown={handleKeyDown} value={text} onChange={handleInput} type='text' placeholder='Message......' />
              {/* </div> */}
              {/* <div className="chatRightCardRight"> */}
              {text && <button onClick={() => {  ChatFunc.sendMsg(selectedChat._id, properties)}} className='sendMsgBtn'>Send</button>}
              {/* </div> */}
            </div>
          </>
        }
      </div>
    </div>
  )
}

export default Chat
