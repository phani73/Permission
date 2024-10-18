import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './SFPages.css';
import { FaClock } from 'react-icons/fa'; // Import FaClock for the time symbol
import { useParams } from 'react-router-dom';
import moment from 'moment'; // Import moment for time formatting

const socket = io('http://localhost:5000');

const FacultyPage = () => {
  const { username, year } = useParams(); // Fetch username and year from route params
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/faculty/permissions?facultyUsername=${username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        // Filter to show only accepted permissions
        const acceptedPermissions = data.filter(permission => permission.status === 'accepted');
        setPermissions(acceptedPermissions);
        setError(null);
      } catch (error) {
        console.error('Fetch permissions error:', error.message);
        setError(error.message);
      }
    };

    fetchPermissions();

    socket.emit('join', username);

    socket.on('permission-accepted', (updatedPermission) => {
        console.log('Received permission-accepted event:', updatedPermission);
      if (updatedPermission.year === year) { // Only update if the year matches
        setPermissions((prevPermissions) => {
          // Check if the permission is already in the list
          const existingPermissionIndex = prevPermissions.findIndex(p => p._id === updatedPermission._id);
          
          // Update or add the accepted permission
          if (updatedPermission.status === 'accepted') {
            if (existingPermissionIndex > -1) {
              // Update the existing permission
              return prevPermissions.map((permission, index) =>
                index === existingPermissionIndex ? updatedPermission : permission
              );
            } else {
              // Add new accepted permission
              return [...prevPermissions, updatedPermission];
            }
          } else {
            // Remove the rejected permission if it was previously accepted
            return prevPermissions.filter(permission => permission._id !== updatedPermission._id);
          }
        });
      }
    });

    socket.on('permission-rejected', (updatedPermission) => {
      if (updatedPermission.year === year) { // Only update if the year matches
        setPermissions((prevPermissions) =>
          prevPermissions.filter(permission => permission._id !== updatedPermission._id) // Remove rejected permission
        );
      }
    });

    return () => {
      socket.off('permission-accepted');
      socket.off('permission-rejected');
    };
  }, [username, year]);

  return (
    <div className="faculty-page">
      <h1>Faculty Page</h1>
      {error && <p className="error-message">Error: {error}</p>}
      {permissions.length === 0 ? (
        <p className="no-permissions">No permissions have been requested by students at this time.</p>
      ) : (
        <ul className="permission-list">
          {permissions.map((permission) => (
            <li key={permission._id} className="permission-item">
              <p>Roll No: {permission.username}</p>
              <p>Year: {permission.year}</p>
              <p>Request Type: {permission.requestType}</p>
              <p>Status: <u>{permission.status}</u></p>
              <div className="time-stamp1">
                <FaClock /> {moment(permission.acceptanceDate).format('HH:mm')} {/* Display time */}
              </div>
              <p>Date: {permission.date}</p>
              {permission.startTime && permission.endTime && (
                <p>Time: {permission.startTime} - {permission.endTime}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FacultyPage;
