import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './PermissionPage.css';

function PermissionPage() {
  const navigate = useNavigate();
  const { username } = useParams();

  //state for handling the permission form 
  const [permissionType, setPermissionType] = useState('normal');
  const [requestType, setRequestType] = useState('');
  const [year, setyear] = useState('');
  const [details, setDetails] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [file, setFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false); // New state variable
  const [requestPermission, setRequestPermission] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Function to handle permission type change
  const handlePermissionTypeChange = (type) => {
    setPermissionType(type);
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
  e.preventDefault();

  if (!requestPermission) {
    alert('Please check the request permission box to submit the form.');
    return;
  }

  setLoading(true);

  const localDate = selectedDate ? new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000).toISOString() : '';

  const formData = new FormData();
  formData.append('hodId', '668fbd4b1b4ab4fe7758294d');
  formData.append('username', username);
  formData.append('year', year);
  formData.append('requestType', requestType);
  formData.append('details', details);
  formData.append('date', localDate);  
  if (permissionType === 'time-based') {
    formData.append('startTime', startTime);
    formData.append('endTime', endTime);
  }
  if (file) {
    formData.append('file', file);
  }

  axios.post('http://localhost:5000/submit-permission', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
    .then((response) => {
      console.log(response.data);
      setLoading(false);
      setSuccessMessage('Permission request submitted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        // Reset form fields except username
        setyear('');
        setRequestType('');
        setDetails('');
        setSelectedDate(null);
        setStartTime('');
        setEndTime('');
        setFile(null);
        setFileUploaded(false);
        setRequestPermission(false);
      }, 3000);
    })
    .catch((error) => {
      console.error('Error submitting permission:', error);
      setLoading(false);
      alert('An error occurred. Please try again.');
    });
};


  const handleBack = () => {
    navigate(`/dashboard/${username}`);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileUploaded(true); // Set fileUploaded state to true
  };

  return (
    <div className='permission-card'>
      <div className="permission-page">
        <h2>Permission Request</h2>
        <div className="permission-type">
          <label>
            <input
              type="radio"
              value="normal"
              name="permissionType"
              checked={permissionType === 'normal'}
              onChange={() => handlePermissionTypeChange('normal')}
            />
            Normal Permission
          </label>
          <label>
            <input
              type="radio"
              value="time-based"
              name="permissionType"
              checked={permissionType === 'time-based'}
              onChange={() => handlePermissionTypeChange('time-based')}
            />
            Time-Based Permission
          </label>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            readOnly
            placeholder="Username"
          />
          <select
            value={year}
            onChange={(e) => setyear(e.target.value)}
            required
          >
            <option value="">Select Year</option>
            <option value="I">I</option>
            <option value="II">II</option>
            <option value="III">III</option>
            <option value="IV">IV</option>
          </select>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            required
          >
            <option value="">Select Request Type</option>
            <option value="Health">Health</option>
            <option value="Uniform">Uniform</option>
            <option value="Late Submissions">Late Submissions</option>
            <option value="Event">Event</option>
            <option value="other">Other</option>
          </select>
          <textarea
            placeholder="Details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            required
          />
          <label>
            Date:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="date-picker"
            placeholderText="Select a date"
            required={permissionType === 'normal'}
          />
          {permissionType === 'time-based' && (
            <div className="time-inputs">
              <label>
                Start Time:
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </label>
              <label>
                End Time:
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </label>
            </div>
          )}
          <label>Upload Letter (optional):</label>
          <label htmlFor="file-input" className="file-input-label">
            Upload
            {fileUploaded && <span className="tick-symbol">✔️</span>}
          </label>
          <input
            id="file-input"
            type="file"
            onChange={handleFileChange}
          />
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={requestPermission}
              onChange={(e) => setRequestPermission(e.target.checked)}
            />
            <span>Request Permission</span>
          </label>
          <button type="submit">Submit</button>
        </form>
        <button type="button" onClick={handleBack}>Back</button>
        {loading && <div className="spinner show"></div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
}

export default PermissionPage;
