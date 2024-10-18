import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Modal from 'react-modal';
import "./HodPermissionPage.css";
import moment from 'moment-timezone';

const socket = io('http://localhost:5000');

Modal.setAppElement('#root'); // Ensure accessibility for screen readers

function HodPermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [selectedPermission, setSelectedPermission] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/hod/permissions')
      .then((response) => {
        setPermissions(response.data);
      })
      .catch((error) => {
        console.error('Error fetching permissions:', error);
      });

    socket.emit('join', 'HOD');

    socket.on("permissionUpdate", (updatedPermission) => {
      setPermissions(prevPermissions =>
        prevPermissions.map(permission =>
          permission._id === updatedPermission._id ? updatedPermission : permission
        )
      );

      if (updatedPermission.status === "accepted") {
        alert(`Permission request from ${updatedPermission.username} has been accepted.`);
      } else if (updatedPermission.status === "rejected") {
        alert(`Permission request from ${updatedPermission.username} has been rejected.`);
      }
    });

    return () => {
      socket.off("permissionUpdate");
    };
  }, []);

  const handleAccept = (id) => {
    axios.post(`http://localhost:5000/hod/permissions/${id}/accept`)
      .then((response) => {
        const acceptedPermission = response.data;
        const formattedTime = moment().format("HH:mm"); // Use current time
        socket.emit('permissionAcceptedToFaculty', { ...acceptedPermission, year: acceptedPermission.year, formattedTime });
        socket.emit('permissionAcceptedToStudent', { ...acceptedPermission, formattedTime });
        setPermissions(prevPermissions =>
          prevPermissions.filter(permission => permission._id !== id)
        );
        console.log("Request has been accepted");
        closeModal();
      })
      .catch((error) => {
        console.error('Error accepting permission:', error);
        alert('Failed to accept permission. Please try again.');
      });
  };

  const handleReject = (id) => {
    axios.post(`http://localhost:5000/hod/permissions/${id}/reject`, {
      rejectMessage: rejectionReason,
    })
      .then((response) => {
        const rejectedPermission = response.data;
        const formattedTime = moment().format("HH:mm"); // Use current time
        socket.emit('permissionRejectedToFaculty', { ...rejectedPermission, year: rejectedPermission.year, formattedTime });
        socket.emit('permissionRejectedToStudent', { ...rejectedPermission, formattedTime });
        setPermissions(prevPermissions =>
          prevPermissions.filter(permission => permission._id !== id)
        );
        console.log("Request has been rejected");
        closeModal();
      })
      .catch((error) => {
        console.error('Error rejecting permission:', error);
        alert('Failed to reject permission. Please try again.');
      });
  };

  const openModal = (permission, type) => {
    setSelectedPermission(permission);
    setDialogType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPermission(null);
    setDialogType(null);
    setRejectionReason('');
  };

  const confirmAction = () => {
    if (dialogType === 'accept') {
      handleAccept(selectedPermission._id);
    } else if (dialogType === 'reject') {
      if (!rejectionReason.trim()) {
        alert('Please provide a reason for rejection.');
        return;
      }
      handleReject(selectedPermission._id);
    }
  };

  return (
    <div className="card">
      <div className='header'>
        <span className='icon'>
          <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path clipRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" fillRule="evenodd" />
          </svg>
        </span>
        <p className='message'>Pending Permission Requests</p>
      </div>
      {permissions.length === 0 ? (
        <p>No pending requests.</p>
      ) : (
        permissions.map((permission) => (
          <div key={permission._id} className="permission-card">
            <p><strong>Username:</strong> {permission.username}</p>
            <p><strong>Year:</strong> {permission.year}</p>
            <p><strong>Request Type:</strong> {permission.requestType}</p>
            <p><strong>Details:</strong> {permission.details}</p>
            <p><strong>Date:</strong>  {moment(permission.date).tz('Your/Timezone').format('YYYY-MM-DD')}</p>
            {permission.startTime && <p><strong>Start Time:</strong> {permission.startTime}</p>}
            {permission.endTime && <p><strong>End Time:</strong> {permission.endTime}</p>}
            {permission.file && (
              <p>
                <strong>Letter:</strong>
                <a href={`http://localhost:5000/uploads/${permission.file}`} target="_blank" rel="noopener noreferrer">View Letter</a>
              </p>
            )}
            <button className='accept' onClick={() => openModal(permission, 'accept')}>Accept</button>
            <button className='reject' onClick={() => openModal(permission, 'reject')}>Reject</button>
          </div>
        ))
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Confirmation Dialog"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <h3>{dialogType === 'accept' ? 'Are you sure you want to accept this permission?' : 'Are you sure you want to reject this permission?'}</h3>
        <p>You may not be able to undo this action.</p>

        {dialogType === 'reject' && (
          <div>
            <textarea
              placeholder="Add a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4" columns="4"
              style={{ width: '100%', marginBottom: '15px' }}
              required
            />
          </div>
        )}

        <div className="dialog-actions">
          <button onClick={closeModal}>Cancel</button>
          <button onClick={confirmAction}>
            {dialogType === 'accept' ? 'Accept Permission' : 'Reject Permission'}
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default HodPermissionPage;
