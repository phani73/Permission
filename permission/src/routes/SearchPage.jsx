import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import './SearchPage.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [student, setStudent] = useState(null);
  const [permissionDetails, setPermissionDetails] = useState(null);
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/hod/search-student?username=${query}`);
      console.log(response.data);
      setStudent(response.data);
      setPermissionDetails(null); // Reset details on new search
    } catch (error) {
      console.error("Error fetching search results:", error);
      setStudent(null);
      setPermissionDetails(null);
    }
  };

  const fetchPermissionDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/hod/student-permissions?username=${student.username}`);
      setPermissionDetails(response.data);
    } catch (error) {
      console.error("Error fetching permission details:", error);
      setPermissionDetails(null);
    }
  };

  const handleBack = () => {
    navigate(`/hod-dashboard/HOD`);
  };

  return (
    <div className="search-page">
      <h2>Search Student Permissions</h2>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Enter username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="student-box">
        {student ? (
          <>
            <div className="student-info">
              <p>Username: {student.username}</p>
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="details-icon"
                onClick={fetchPermissionDetails}
              />
            </div>
            {permissionDetails && (
              <div className="permission-details">
                <h3>Permission Details</h3>
                <p>Total Permissions: {permissionDetails.totalPermissions}</p>
                <p>Accepted: {permissionDetails.accepted}</p>
                <p>Rejected: {permissionDetails.rejected}</p>
                <p>Pending: {permissionDetails.pending}</p>
              </div>
            )}
          </>
        ) : (
          <p className="no-results">No results found</p>
        )}
        <button type="button" className="btn" onClick={handleBack}>Back</button>
      </div>
    </div>
  );
};

export default SearchPage;
