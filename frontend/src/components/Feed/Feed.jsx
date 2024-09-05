import React, { useState } from 'react'
import Post from '../Post/Post'
import FullPost from '../FullPost/FullPost'
import './Feed.css'
import { useSelector } from 'react-redux'


const Feed = () => {
  const [loading,setLoading]=useState(true)
  const {posts} = useSelector(store => store.post )
 
  if (posts.length<=0) {
    return (
      <>
      {loading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      </>
    ) 
  }

  return (
    <div className='feed'>
      {posts.map((post) => (
        <Post key={post._id} post={post}/>
      ))}
    </div>
  )
}

export default Feed
