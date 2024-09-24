import React, { useEffect, useState } from 'react'
import './Share.css'
import '../Notifications/Notifications.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApi } from '../../context/apiContext'
import { useAlert } from '../../context/AlertContext'
import ShareFunc from './ShareFunc'

const Share = ({ closeDialog, customClass, postId }) => {
    const [selectedChats, setSelectedChats] = useState([])
    const [allUsers, setAllUsers] = useState(null)
    const [searchedUsers, setSearchedUsers] = useState([])
    const usersToDisplay = searchedUsers.length > 0 ? searchedUsers : allUsers;
    const [loading, setLoading] = useState(false)
    const apiUrl = useApi();
    const { showAlert } = useAlert()
    const navigate = useNavigate()
    const [text, setText] = useState('')
    const [customMsg, setCustomMsg] = useState('')
    
    function handleCustomMsg(e) {
        let inputText = e.target.value;
        setCustomMsg(inputText)
    }
    function handleInput(e) {
        let inputText = e.target.value;

        setText(inputText)

        if (inputText.length >= 3 && inputText.length <= 20) {
            doSearch(inputText)
        }
        else {
            setSearchedUsers([])
        }

    }
    function handleKeyDown(e) {
        if (e.key === 'Enter' && text.trim()) {
            doSearch(text)
        }
    }
    function doSearch(inputText) {
        const filteredUsers = allUsers.filter(user =>
            user.username.toLowerCase().includes(inputText.toLowerCase())
        );
        setSearchedUsers(filteredUsers);
    }
    const properties = {
        apiUrl, setLoading, navigate, showAlert, allUsers, setAllUsers, closeDialog,customMsg,selectedChats,postId
    }

    function handleChatClick(user) {
        setSelectedChats((prevSelectedChats) => {
            if (prevSelectedChats.includes(user)) {
                // Remove chat from selectedChats if already selected
                return prevSelectedChats.filter(id => id !== user)
            } else {
                // Check if already 5 chats selected
                if (prevSelectedChats.length >= 5) {
                    showAlert({ success: false, message: 'Max 5 users can be selected' })
                    return prevSelectedChats;
                } else {
                    // Add chat to selectedChats
                    return [...prevSelectedChats, user];
                }
            }
        });
    }

    useEffect(() => {
        ShareFunc.getShareUsers(properties)
        // setAllUsers([
        //     {
        //         "_id": "66d9ea6edfeccc81e1579b8a",
        //         "username": "kunal52",
        //         "profilePicture": "",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-24T06:50:45.997Z"
        //     },
        //     {
        //         "_id": "66f0f7170524c374eaa15d16",
        //         "username": "systum",
        //         "profilePicture": "",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-23T07:27:10.985Z"
        //     },
        //     {
        //         "_id": "66f07703c4317ae7c55f3a80",
        //         "username": "dubatra09",
        //         "profilePicture": "",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-22T20:03:01.787Z"
        //     },
        //     {
        //         "_id": "66c681bdd354e6debcf4de0b",
        //         "username": "kunal",
        //         "profilePicture": "https://res.cloudinary.com/dcwfp1iaa/image/upload/v1726896080/ppyuxyloonpqqfzyl6np.png",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-22T19:25:59.792Z"
        //     },
        //     {
        //         "_id": "66ead3e0e689ed84e67d1c13",
        //         "username": "anushka96",
        //         "profilePicture": "",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-22T20:21:25.902Z"
        //     },
        //     {
        //         "_id": "66eef7a28696cd1dc31704be",
        //         "username": "riya45",
        //         "profilePicture": "",
        //         "isVerified": false,
        //         "lastSeen": "2024-09-21T16:58:19.842Z"
        //     }
        // ])
    }, [])

    if (loading || allUsers == null) {
        return (
            <div className="loader-container">
                <span className="loader"></span>
            </div>
        );
    }
    return (
        <div className={`dialog notifications ${customClass}`}>
            <div className="notificationRightCorner">
                <i onClick={closeDialog} className="fa-regular fa-2xl fa-circle-xmark"></i>
            </div>

            <div className="shareHeading">Share with Friends</div>
            <div className="notificationCard withSearchInput">
                <div>
                    <input value={text} maxLength={20} onChange={handleInput} onKeyDown={handleKeyDown} type="text" placeholder='find your friends' />
                </div>
                <div>
                    <i onClick={() => { doSearch(text) }} className='fa-solid fa-xl fa-magnifying-glass'></i>
                </div>
            </div>
            <div className="dialogBox shareDialogBox">

                <div className={`shareCardContainer`} >
                    {usersToDisplay.map((user) => usersToDisplay.length > 0 && (
                        (
                            <div key={user._id} style={{ backgroundColor: selectedChats?.includes(user) ? '#00000024' : 'white' }} className="chatOnlineCardLeft" onClick={() => handleChatClick(user)} >
                                {/* {console.log(user)} */}
                                <div className="shareUserPhoto">
                                    <img draggable='false' src={user.profilePicture || '/person.png'} alt="User photo" />
                                </div>
                                <div className="shareUserUsername">
                                    {user.username}
                                    {user.isVerified === 'true' && <abbr title="Verified"><img className="chatBlueTick" src="/verified.png" alt="Verified" /></abbr>}
                                </div>
                            </div>

                        )
                    ))}
                </div>



                {allUsers?.length < 1 && <div className="notificationMsg">No one here</div>}

            </div>
            {
                selectedChats.length > 0 &&
                <div className="chatPageRightBottom">
                    <textarea value={customMsg} onChange={handleCustomMsg} type='text' placeholder='Message......' />
                    <div className="shareWithFriends" onClick={() => { ShareFunc.sendMsg(properties) }}><button >Share</button></div>
                </div>
            }
        </div>
    )
}

export default Share
