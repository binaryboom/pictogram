import React from 'react'
import './Friends.css'
import '../Notifications/Notifications.css'
import { useNavigate } from 'react-router-dom'

const Friends = ({ fr, closeDialog, heading }) => {
    const navigate = useNavigate()
    return (
        <div className="dialog notifications">
            <div className="notificationRightCorner">
                <i onClick={closeDialog} className="fa-regular fa-2xl fa-circle-xmark"></i>
            </div>

            <div className="dialogBox">
                <div className="followersCount">{heading}</div>
                {fr.map((n) => {
                    return (

                        <div className="notificationCard" onClick={() => { closeDialog(); navigate(`/profile/${n?.username}`) }}>
                            <div className="itemLeft">
                                <div className="suggestedUserPhoto">
                                    <img draggable='false' src={n?.profilePicture || '/person.png'} alt="photo" />
                                </div>

                                <div className="suggestedUserUsername">{n?.username}</div>
                                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
                            </div>

                        </div>

                    )
                })}


                {fr.length < 1 && <div className="notificationMsg">No one here</div>}


            </div>
        </div>
    )
}

export default Friends
