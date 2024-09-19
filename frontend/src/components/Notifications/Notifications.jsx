import React from 'react'
import './Notifications.css'
import '../Post/Post.css'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
const Notifications = ({ handleNotifications }) => {
  const { likeNotifications } = useSelector(store => store.rtn)
  const { followNotifications } = useSelector(store => store.rtnFollow)
  const navigate=useNavigate()
  return (
    <div className="dialog notifications">
      {console.log(likeNotifications, followNotifications)}
      <div className="notificationRightCorner">
        <i onClick={handleNotifications} className="fa-regular fa-2xl fa-circle-xmark"></i>
      </div>
     
      <div className="dialogBox">

        {likeNotifications.map((n) => {
          return (
            
            <div className="notificationCard" onClick={handleNotifications}>
              <div onClick={() => { navigate(`/profile/${n?.user.username}`) }} className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.user.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.user.username}</div>
                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              <div className="itemRight">
                <span onClick={() => { navigate(`/${n?.postId}`)}} className='notificationMsg'>{n.message}</span>
              </div>

            </div>

          )
        })}
        {followNotifications.map((n) => {
          return (
            <div className="notificationCard" onClick={handleNotifications}>
              <div onClick={() => { navigate(`/profile/${n?.user.username}`) }} className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.user.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.user.username}</div>
                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              <div className="itemRight">
                <span onClick={() => { navigate(`/profile/${n?.otherUser}`)}} className='notificationMsg'>{n.message}</span>
              </div>

            </div>
          )
          
        })}

        {likeNotifications.length+followNotifications.length <1 && <div className="notificationMsg">No new Notifications</div>}


      </div>
    </div>
  )
}

export default Notifications
