import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { username } = useParams();

  const handleLogout = () => {
    setLoading(true);
    axios.post('http://localhost:5000/logout')
      .then((response) => {
        console.log(response);
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
        alert('An error occurred during logout. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePermission = () => {
    navigate(`/permission/${username}`);
  };

  const handleMessages = () => {
    navigate(`/messages/${username}`);
  };

  return (
    <div>
     {loading && (
  <div className={`loader-container ${loading ? 'loading' : ''}`}>
    <div className="dot-spinner">
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
      <div className="dot-spinner__dot"></div>
    </div>
  </div>
)}
      <div className="dashboard-container">
        <div className="header">
          <span className="welcome">Hi...{username}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className="content">
          <div className="menu">
            <button className="menu-item" onClick={handlePermission}>Permission</button>
            <button className="menu-item" onClick={handleMessages}>Messages</button>
          </div>
          <div className="content-container">
            <div className="permission-page"></div>
          </div>
          <div className="profile">
            <h2 className="profile-heading">STUDENT PROFILE</h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
