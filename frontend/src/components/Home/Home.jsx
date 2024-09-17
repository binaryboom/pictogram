import React, { useEffect, useState } from 'react'
import Feed from '../Feed/Feed'
import { Outlet,useLocation } from 'react-router-dom'
import RightSidebar from '../RightSidebar/RightSidebar'
import './Home.css'
import useGetAllPosts from '../../hooks/useGetAllPosts'
import { useDispatch } from 'react-redux';
import { setPosts } from '../../redux/postSlice.js';
import { useAlert } from '../../context/AlertContext.jsx'
import { useApi } from '../../context/apiContext.jsx'


const Home = () => {
  useGetAllPosts()
  const [loading,setLoading]=useState(false);
  const apiUrl = useApi();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();

  // const fetchAllPosts = async () => {
  //   let res;
  //   try {
  //     let req = await fetch(`${apiUrl}/post/allPosts`, {
  //       method: 'GET',
  //       credentials: 'include',
  //     });
  //     res = await req.json();
  //     console.log(res);

  //   } catch (error) {
  //     res = { success: false, message: 'Unable to connect with server' };
  //     console.log(error);
  //     showAlert(res);
  //   }
  //   finally {
  //     res.success ? dispatch(setPosts(res.allPosts)) : null;
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchAllPosts();
  // });

  return (
  <div className='home'>
    {loading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <Feed/>
      <Outlet/>
   
  </div>
  )
}

export default Home
