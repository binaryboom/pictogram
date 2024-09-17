import React, { useState } from 'react';
import Feed from '../Feed/Feed';
import { Outlet } from 'react-router-dom';
import RightSidebar from '../RightSidebar/RightSidebar';
import './Home.css';
import useGetAllPosts from '../../hooks/useGetAllPosts';
import { useDispatch } from 'react-redux';
import { setPosts } from '../../redux/postSlice.js';
import { useAlert } from '../../context/AlertContext.jsx';
import { useApi } from '../../context/apiContext.jsx';
import PullToRefresh from 'react-pull-to-refresh';
import MobilePullToRefresh from 'react-simple-pull-to-refresh';

const Home2 = () => {
  useGetAllPosts();
  const [loading, setLoading] = useState(false);
  const apiUrl = useApi();
  const { showAlert } = useAlert();
  const dispatch = useDispatch();

  const fetchAllPosts = async () => {
    setLoading(true);
    let res;
    try {
      let req = await fetch(`${apiUrl}/post/allPosts`, {
        method: 'GET',
        credentials: 'include',
      });
      res = await req.json();
      console.log(res);
    } catch (error) {
      res = { success: false, message: 'Unable to connect with server' };
      console.log(error);
      showAlert(res);
    } finally {
      res.success ? dispatch(setPosts(res.allPosts)) : showAlert(res);
      setLoading(false);
    }
  };

  const handleRefreshPC = () => {
    return new Promise((resolve) => {
      // setLoading(true);
      fetchAllPosts().then(() => {
        // setLoading(false);
        resolve();  // Resolve the promise once the data is fetched
      });
    });
  };
  const handleRefreshMobile = () => {
    return new Promise((resolve) => {
      fetchAllPosts().then(() => {
        resolve();  // Resolve the promise once the data is fetched
      });
    });
  };

  return (
    <div className="home">
      {loading && (
        <div className="loader-container">
          <span className="loader"></span>
        </div>
      )}
      <div className="forMobile">
      <MobilePullToRefresh onRefresh={handleRefreshMobile}>
          <div>
            <Feed />
            <Outlet />
          </div>
        </MobilePullToRefresh>
      </div>
      <div className="forPC">
        <PullToRefresh onRefresh={handleRefreshPC}>
          <div>
            <Feed />
            <Outlet />
          </div>
        </PullToRefresh>
      </div>
    </div>
  );
};

export default Home2;
