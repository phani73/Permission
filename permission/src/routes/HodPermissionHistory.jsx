import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HodPermissionHistory.css';
import { FaFileDownload } from 'react-icons/fa';

const HodPermissionHistory = () => {
  const [historyPermissions, setHistoryPermissions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = () => {
    axios.get('http://localhost:5000/hod/history')
      .then((response) => {
        console.log('Fetched history:', response.data);
        setHistoryPermissions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching history permissions:', error);
        setError('Failed to fetch history permissions. Please try again.');
      });
  };

  const handleDownload = (permission) => {
    const content = `
      Username: ${permission.username}\n
      Year:${permission.year}\n
      Request Type: ${permission.requestType}\n
      Details: ${permission.details}\n
      Date: ${permission.date}\n
      ${permission.startTime ? `Start Time: ${permission.startTime}\n` : ''}
      ${permission.endTime ? `End Time: ${permission.endTime}\n` : ''}
      Status: ${permission.status}\n
      Approved by: Head of Department
    `;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `permission-slip-${permission._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    axios.delete('http://localhost:5000/api/clearHistory')
      .then((response) => {
        setHistoryPermissions([]); // Clear the state
        setError(null); // Clear any existing errors
      })
      .catch((error) => {
        console.error('Error clearing history:', error);
        setError('Failed to clear history. Please try again.');
      });
  };

  return (
    <div className="history-section">
      <h2>History of Permissions</h2>
      {error && <p className="error-message">{error}</p>}
      {historyPermissions.length === 0 ? (
        <p className="no-history">No history found.</p>
      ) : (
        <div>
          <button className="clear-history-button" onClick={clearHistory}>
            Clear History
          </button>
          <div className="permission-list">
            {historyPermissions.map((historyPermission) => (
              <div key={historyPermission._id} className="permission-card">
                <div className="permission-content">
                  <p><strong>Username:</strong> {historyPermission.username}</p>
                  <p><strong>Year:</strong> {historyPermission.year}</p>
                  <p><strong>Request Type:</strong> {historyPermission.requestType}</p>
                  <p><strong>Details:</strong> {historyPermission.details}</p>
                  <p><strong>Date:</strong> {historyPermission.date}</p>
                  {historyPermission.startTime && <p><strong>Start Time:</strong> {historyPermission.startTime}</p>}
                  {historyPermission.endTime && <p><strong>End Time:</strong> {historyPermission.endTime}</p>}
                  {historyPermission.file && (
                    <p>
                      <strong>Letter:</strong>
                      <a href={`http://localhost:5000/uploads/${historyPermission.file}`} target="_blank" rel="noopener noreferrer">View Letter</a>
                    </p>
                  )}
                  <p className="status"><strong>Status:</strong> {historyPermission.status}</p>
                  <div className="button-group">
                    <button className="download-button" onClick={() => handleDownload(historyPermission)}>
                      <FaFileDownload />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HodPermissionHistory;
