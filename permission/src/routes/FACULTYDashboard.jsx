import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import moment from 'moment-timezone';
import { joinRoom, onPermissionAccepted } from '/src/services/socketService'; // Adjust the path as needed
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function FACULTYDashboard() {
  const navigate = useNavigate();
  const { username } = useParams();  
  const [userYear, setUserYear] = useState('');
  const [permissions, setPermissions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false); // Added this line to define the loading state

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/getUserData/${username}`);
        const userData = response.data;
        setUserYear(userData.year);
        joinRoom(username, userData.year);

        onPermissionAccepted((permission) => {
          setPermissions((prevPermissions) => [permission, ...prevPermissions]);
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to fetch user data.');
      }
    };

    fetchUserData();
  }, [username]);

  // Function to format date to local timezone
  const formatDateToLocal = (date) => {
    return moment.utc(date).tz('Asia/Kolkata').format('YYYY-MM-DD');
  };

  const fetchPermissions = async () => {
    try {
      // Convert selectedDate to start of the selected day in local time
      const formattedDate = selectedDate
        ? moment(selectedDate).startOf('day').tz('Asia/Kolkata').format('YYYY-MM-DD')
        : null;
      console.log('Formatted Date:', formattedDate);

      // Fetch permissions from the server
      const response = await axios.get('http://localhost:5000/faculty/permissions/filter', {
        params: { facultyUsername: username, date: formattedDate }
      });

      console.log('Permissions Response:', response.data);

      const filteredPermissions = response.data.filter((permission) => {
        const permissionDate = formatDateToLocal(permission.date);
        return !formattedDate || permissionDate === formattedDate;
      });
      console.log('Filtered Permissions:', filteredPermissions);
      setPermissions(filteredPermissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const handleLogout = () => {
    setLoading(true); 
    axios.post('http://localhost:5000/logout')
      .then(() => {
        navigate('/');
      })
      .catch((error) => {
        console.log(error);
        alert('An error occurred during logout. Please try again.');
      })
      .finally(() => {
        setLoading(false); // Hide the loader after the request is complete
      });
  };

  const handleMessages = () => {
    navigate(`/message/${username}/${userYear}`);
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
            <button className="menu-item" onClick={handleMessages}>Messages</button>
          </div>
          <div className="profile">
            <h2 className="profile-heading">FACULTY PROFILE</h2>
            <p>Year: {userYear}</p>
            <div className="date-filter">
              <label>Date Filter:</label>
              <div className="search">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  dateFormat="yyyy-MM-dd"
                  className="input"
                  placeholderText="Select a date"
                />
                <button type="submit" onClick={fetchPermissions}>Filter</button>
              </div>
            </div>

            <div className="permission-list">
              <h3>Permissions</h3>
              <div className='permission-list-container'>
                {permissions.length === 0 ? (
                  <p>No permissions for the selected date.</p>
                ) : (
                  permissions.map((permission) => {
                    console.log('Rendering Permission:', permission); // Debugging line
                    return (
                      <div key={permission._id} className="permission-card">
                        <p><strong>Username:</strong> {permission.username}</p>
                        <p><strong>Year:</strong> {permission.year}</p>
                        <p><strong>Request Type:</strong> {permission.requestType}</p>
                        <p><strong>Details:</strong> {permission.details}</p>
                        <p><strong>Date:</strong> {moment(permission.date).format('YYYY-MM-DD')}</p> {/* Use moment for consistency */}
                        {permission.startTime && <p><strong>Start Time:</strong> {permission.startTime}</p>}
                        {permission.endTime && <p><strong>End Time:</strong> {permission.endTime}</p>}
                        {permission.file && (
                          <p>
                            <strong>Letter:</strong>
                            <a href={`http://localhost:5000/uploads/${permission.file}`} target="_blank" rel="noopener noreferrer">View Letter</a>
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FACULTYDashboard;
