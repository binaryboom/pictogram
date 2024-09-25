import React, { useState } from 'react'
import '../Notifications/Notifications.css'
import './Search.css'
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../context/apiContext';
import { useAlert } from '../../context/AlertContext';

const Search = ({ handleSearch }) => {
  const navigate = useNavigate();
  const apiUrl = useApi();
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(false);
  const [searchedUsers, setSearchedUsers] = useState([])
  const [text, setText] = useState('')
  function handleInput(e) {
    let inputText = e.target.value;

    setText(inputText)

    if (inputText.length >= 3 && inputText.length <=20) {
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
  const doSearch = async (username) => {
    let res;
    try {
      setLoading(true)
      if(username.length>=3 && username.length<=20){

        let req = await fetch(`${apiUrl}/user/find/${username}`, {
          method: 'GET',
          credentials: 'include',
        });
        res = await req.json()
        console.log(res)
      }

    } catch (error) {
      res = { success: false, message: 'Unable to connect with server' }
      console.log(error)
      showAlert(res)
    }
    finally {
      setLoading(false)
      if (res.success) {
        setSearchedUsers(res.user)
      }
      else {
        showAlert(res)
        setSearchedUsers([])
      }
    }
  }

  return (
    <div className="dialog notifications searchPage">
      <div className="notificationRightCorner">
        <i onClick={handleSearch} className="fa-regular fa-2xl fa-circle-xmark"></i>
      </div>

      <div className="dialogBox">
        {loading && (
          <div className="loader-container">
            <span className="loader"></span>
          </div>
        )}
        <div className="notificationCard withSearchInput">
          <div>
            <input value={text} maxLength={20} onChange={handleInput} onKeyDown={handleKeyDown} type="text" placeholder='find your friends' />
          </div>
          <div>
            <i onClick={()=>{doSearch(text)}} className='fa-solid fa-xl fa-magnifying-glass'></i>
          </div>
        </div>

        {searchedUsers.length > 0 ? searchedUsers.map((n) => {
          return (

            <div className="notificationCard" onClick={() => { handleSearch(); navigate(`/profile/${n?.username}`) }}>
              <div className="itemLeft">
                <div className="suggestedUserPhoto">
                  <img draggable='false' src={n?.profilePicture || '/person.png'} alt="photo" />
                </div>

                <div className="suggestedUserUsername">{n?.username}</div>
                {n.isVerified && <div className="postBlueTick"><abbr title="Founder (Pictogram)"><img src="/verified.png" alt="" /></abbr></div>}
              </div>

              {n?.bio.trim().length > 0 && <div className="itemBottom">
                <span className='notificationMsg'>{n?.bio}</span>
              </div>}

            </div>

          )
        }) :
          <div className="notificationMsg">No Users Found</div>
        }


      </div>
    </div>
  )
}

export default Search
