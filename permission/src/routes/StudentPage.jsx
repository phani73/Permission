import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import "./SFPages.css";
import { FaFileDownload } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { IonIcon } from '@ionic/react';
import { timeOutline } from 'ionicons/icons';

const socket = io("http://localhost:5000");

const StudentPage = () => {
  const { username } = useParams();
  const [permissions, setPermissions] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  const userNamesArray = ["22A81A0548", "22A81A0542", "22A81A0541"];

  useEffect(() => {
    console.log("Connecting to socket for username:", username);
    socket.emit("join", username);

    socket.on("permissionUpdated", (updatedPermission) => {
      console.log("Updated Permission received:", updatedPermission);
      console.log("Formatted Time (accepted):", updatedPermission.formattedTime);

      setPermissions((prevPermissions) =>
        prevPermissions.map((permission) =>
          permission._id === updatedPermission._id
            ? { ...permission, ...updatedPermission }
            : permission
        )
      );
    });

    socket.on("permissionRejectedToStudent", (rejectedPermission) => {
      console.log("Rejected Permission received:", rejectedPermission);
      console.log("Formatted Time (rejected):", rejectedPermission.formattedTime);

      setPermissions((prevPermissions) =>
        prevPermissions.map((permission) =>
          permission._id === rejectedPermission._id
            ? {
                ...permission,
                status: "rejected",
                rejectMessage: rejectedPermission.rejectMessage,
                formattedTime: rejectedPermission.formattedTime,
              }
            : permission
        )
      );
    });

    return () => {
      socket.off("permissionUpdated");
      socket.off("permissionRejectedToStudent");
    };
  }, [username]);

  const fetchPermissions = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/student/permissions?username=${username}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Fetched Permissions:", data); // Log fetched data
      setPermissions(data);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDownload = (permission) => {
    const content = `
      Username: ${username}\n
      Reason: ${permission.requestType}\n
      Status: ${permission.status}\n
      Approved by: Head of Department\n
      Time: ${permission.formattedTime || "N/A"}
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `permission-slip-${permission._id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchPermissions();
  }, [username]);

  const filteredPermissions = permissions.filter((permission) => {
    if (!userNamesArray.includes(username)) return false;
    if (filter === "all") return true;
    return permission.status === filter;
  });

  const counts = permissions.reduce((acc, permission) => {
    acc[permission.status] = (acc[permission.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="student-page">
      <h1>Student Page</h1>
      <p>User: {username}</p>
      {error && <p className="error-message">Error: {error}</p>}

      <div className="radio-tabs">
        <input
          type="radio"
          id="radio-all"
          name="filter"
          value="all"
          checked={filter === "all"}
          onChange={(e) => setFilter(e.target.value)}
        />
        <label htmlFor="radio-all">
          All <span className="badge">{permissions.length}</span>
        </label>

        <input
          type="radio"
          id="radio-accepted"
          name="filter"
          value="accepted"
          checked={filter === "accepted"}
          onChange={(e) => setFilter(e.target.value)}
        />
        <label htmlFor="radio-accepted">
          Accepted <span className="badge">{counts["accepted"] || 0}</span>
        </label>

        <input
          type="radio"
          id="radio-rejected"
          name="filter"
          value="rejected"
          checked={filter === "rejected"}
          onChange={(e) => setFilter(e.target.value)}
        />
        <label htmlFor="radio-rejected">
          Rejected <span className="badge">{counts["rejected"] || 0}</span>
        </label>

        <input
          type="radio"
          id="radio-pending"
          name="filter"
          value="pending"
          checked={filter === "pending"}
          onChange={(e) => setFilter(e.target.value)}
        />
        <label htmlFor="radio-pending">
          Pending <span className="badge">{counts["pending"] || 0}</span>
        </label>
      </div>

      {filteredPermissions.length === 0 ? (
        <p className="no-permissions-message">
          There are no {filter} permissions at this time.
        </p>
      ) : (
        <ul className="permission-list">
          {filteredPermissions.map((permission) => {
            console.log("Rendering permission:", permission);
            console.log("Formatted Time in rendering:", permission.formattedTime); // Log the time

            return (
              <li key={permission._id} className="permission-item">
                <p>
                  The request for the {permission.requestType} reason has been{" "}
                  <u>{permission.status}</u> by the Head of Department.
                  {permission.status === "rejected" && permission.rejectMessage && (
                    <p className="rejection-reason">
                      <strong>Rejection Reason:</strong> {permission.rejectMessage}
                    </p>
                  )}
                </p>
                {permission.formattedTime && (
                  <p className="time-stamp">
                    <IonIcon icon={timeOutline} />
                    {permission.formattedTime}
                  </p>
                )}
                <div className="button-group">
                  <button
                    onClick={() => handleDownload(permission)}
                    className="download-button"
                  >
                    <FaFileDownload />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default StudentPage;
