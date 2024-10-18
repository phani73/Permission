import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Badge, Form } from 'react-bootstrap';
import io from 'socket.io-client';
import "./HodDashboard.css";
import { IonIcon } from '@ionic/react';
import HodPermissionPage from "./HodPermissionPage";

const socket = io('http://localhost:5000');

function HodDashboard() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [showPermission, setShowPermission] = useState(false);
  const [permissionCount, setPermissionCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [loading,setLoading]=useState(false)
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
      .finally(()=>{
        setLoading(false)
      })
  };

  const togglePermission = () => {
    setShowPermission(!showPermission);
  };

  const handleHistory = () => {
    navigate('/hod/history');
  };

  const handleSearch = () => {
    navigate('/search');
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const fetchPermissions = () => {
    axios.get('http://localhost:5000/api/hod/permissions', {
      params: {
        hodId: 'HOD123', // replace with the current HOD's ID
        date: selectedDate,
      },
    })
      .then(response => {
        setPermissions(response.data.permissions);
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    const fetchPermissionCount = () => {
      axios.get('http://localhost:5000/api/hod/permission-count', {
        params: {
          hodId: 'HOD123', // replace with the current HOD's ID
        },
      })
        .then(response => {
          setPermissionCount(response.data.count);
        })
        .catch(error => {
          console.error(error);
        });
    };

    fetchPermissionCount();
    fetchPermissions();

    socket.on('new-permission', fetchPermissionCount);

    return () => {
      socket.off('new-permission', fetchPermissionCount);
    };
  }, [selectedDate]);

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
          <Button variant="danger" className="menu-item red-badge" data-count={permissionCount} onClick={togglePermission}>
            Permission
            <Badge bg="danger" pill style={{ marginLeft: '5px' }}>
          
            </Badge>
          </Button>
         
          <button className="btn1" onClick={handleHistory}>History</button>
          <button className="btn1" onClick={handleSearch}>Search</button>
        </div>
       
        <div className="content-container">
          {showPermission ? (
            <HodPermissionPage username={username} permissions={permissions} />
          ) : (
            <div className="profile">
              <h2 className="profile-heading">HOD PROFILE</h2>
              {/* Add more profile content here */}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}

export default HodDashboard;
