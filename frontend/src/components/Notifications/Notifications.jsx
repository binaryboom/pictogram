import React from 'react'
import './Notifications.css'
import '../Post/Post.css'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setLikeNotification } from '../../redux/rtnSlice'
import { setFollowNotification } from '../../redux/rtnFollow'
import { setCommentNotification } from '../../redux/rtnComment'


const Notifications = ({ handleNotifications }) => {
  const { likeNotifications } = useSelector(store => store.rtn)
  const { followNotifications } = useSelector(store => store.rtnFollow)
  const { commentNotifications } = useSelector(store => store.rtnComment)
  const navigate = useNavigate()
  const dispatch = useDispatch();
  return (
    <div className="dialog notifications">
      {/* {console.log(likeNotifications, followNotifications)} */}
      <div className="notificationRightCorner">
        <i onClick={handleNotifications} className="fa-regular fa-2xl fa-circle-xmark"></i>
      </div>

      <div className="dialogBox">
      <div className="followersCount">Notifications :</div>
        {likeNotifications.map((n) => {
          return (

            <div className="notificationCard" onClick={() => { handleNotifications(); dispatch(setLikeNotification({ ...n, type: 'unlike' })) }}>
              <div onClick={() => { navigate(`/profile/${n?.user.username}`) }} className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.user.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.user.username}</div>
                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              <div className="itemRight">
                <span onClick={() => { navigate(`/${n?.postId}`) }} className='notificationMsg'>{n.message}</span>
              </div>

            </div>

          )
        })}

        {commentNotifications.map((n) => {
          console.log(n)
          return (

            <div className="notificationCard" onClick={() => { handleNotifications(); dispatch(setCommentNotification({ ...n, type: 'uncommented' })) }}>
              <div onClick={() => { navigate(`/profile/${n?.user.username}`) }} className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.user.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.user.username}</div>
                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              <div className="itemRight">
                <span onClick={() => { navigate(`/${n?.postId}`) }} className='notificationMsg'>{n.message}</span>
              </div>

            </div>

          )
        })}
        {followNotifications.map((n) => {
          return (
            <div className="notificationCard" onClick={() => { handleNotifications(); dispatch(setFollowNotification({ ...n, type: 'unfollow' })) }}>
              <div onClick={() => { navigate(`/profile/${n?.user.username}`) }} className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.user.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.user.username}</div>
                {n?.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              <div className="itemRight">
                <span onClick={() => { navigate(`/profile/${n?.otherUser}`) }} className='notificationMsg'>{n.message}</span>
              </div>

            </div>
          )

        })}

        {likeNotifications.length +commentNotifications.length+ followNotifications.length < 1 && <div className="notificationMsg">No new Notifications</div>}


      </div>
    </div>
  )
}

export default Notifications
