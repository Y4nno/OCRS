import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE, DELETE_PROFILE } from './graphql';
import './Profile.css';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

// Helper function to calculate age
const calculateAge = (birthdate) => {
  if (!birthdate) return 'N/A';
  const birthDateObj = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  return age;
};

export default function Profile({ onUsernameChange }) {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [formData, setFormData] = useState({
    username: username,
    fullName: '',
    bio: '',
    location: '',
    interests: '',
    phoneNumber: '',
    gender: '',
    email: '',
    birthdate: '',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Fetch profile data
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { username },
    skip: !username,
    onError: (err) => console.error('GraphQL error:', err),
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [deleteProfile] = useMutation(DELETE_PROFILE);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data?.getProfile) {
      setFormData({
        username: data.getProfile.username || '',
        fullName: data.getProfile.fullName || '',
        bio: data.getProfile.bio || '',
        location: data.getProfile.location || '',
        interests: data.getProfile.interests || '',
        phoneNumber: data.getProfile.phoneNumber || '',
        gender: data.getProfile.gender || '',
        email: data.getProfile.email || '',
        birthdate: data.getProfile.birthdate
          ? new Date(data.getProfile.birthdate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const input = {
        currentUsername: username,
        newUsername: formData.username.trim() ? formData.username : undefined,
        fullName: formData.fullName.trim() ? formData.fullName : undefined,
        bio: formData.bio.trim() ? formData.bio : undefined,
        location: formData.location.trim() ? formData.location : undefined,
        interests: formData.interests.trim() ? formData.interests : undefined,
        phoneNumber: formData.phoneNumber.trim() ? formData.phoneNumber : undefined,
        gender: formData.gender.trim() ? formData.gender : undefined,
        email: formData.email.trim() ? formData.email : undefined,
        birthdate: formData.birthdate.trim() ? formData.birthdate : undefined,
      };

      await updateProfile({ variables: { input } });

      // Update the username in the frontend if it was changed
      if (formData.username.trim() && formData.username !== username) {
        localStorage.setItem('username', formData.username);
        setUsername(formData.username);
        if (onUsernameChange) {
          onUsernameChange(formData.username);
        }
      }

      alert('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data } = await deleteProfile({
        variables: { username },
      });

      if (data.deleteProfile) {
        setDeleteSuccessMessage('Successfully deleted account.');

        // Add a click event listener to redirect to the RegisterLogin page
        const handlePageClick = () => {
          navigate('/');
          window.removeEventListener('click', handlePageClick); // Remove the event listener after redirection
        };

        window.addEventListener('click', handlePageClick);
      } else {
        alert('Failed to delete account. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('An error occurred. Please try again.');
    }
  };

  if (!username) {
    return <p>Error: Username is missing. Please log in again.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile: {error.message}</p>;

  return (
    <div className="profile-container">
      <h1>Profile Details</h1>
      {editing ? (
        <div className="profile-edit">
          <label className="form-label">Full Name:</label>
          <input
            className="form-control"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
          />
          <label>Bio:</label>
          <input
            className="form-control"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
          <label>Location:</label>
          <input
            className="form-control"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />
          <label>Interests:</label>
          <input
            className="form-control"
            name="interests"
            type="text"
            value={formData.interests}
            onChange={handleChange}
          />
          <label>Phone Number:</label>
          <input
            className="form-control"
            name="phoneNumber"
            type="text"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          <label>Gender:</label>
          <input
            className="form-control"
            name="gender"
            type="text"
            value={formData.gender}
            onChange={handleChange}
          />
          <label>Email:</label>
          <input
            className="form-control"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
          <label>Birthdate:</label>
          <input
            className="form-control"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
          />
          <label>Username:</label>
          <input
            className="form-control"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
          />
          <button onClick={handleSave} className="btn btn-outline-dark">
            Save
          </button>
          <button onClick={() => setEditing(false)} className="btn btn-outline-dark">
            Cancel
          </button>
        </div>
      ) : (
        <div className="profile-view">
          <p><strong>Full Name:</strong> {formData.fullName}</p>
          <p><strong>Age:</strong> {calculateAge(formData.birthdate)}</p>
          <p><strong>Gender:</strong> {formData.gender || 'N/A'}</p>
          <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
          <p><strong>Bio:</strong> {formData.bio || 'N/A'}</p>
          <p><strong>Interests:</strong> {formData.interests || 'N/A'}</p>
          <p><strong>Phone Number:</strong> {formData.phoneNumber || 'N/A'}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Birthdate:</strong> {formData.birthdate || 'N/A'}</p>
          <button onClick={() => setEditing(true)} className="btn btn-outline-dark">
            Edit Profile
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn btn-outline-danger"
          >
            Delete Profile
          </button>
        </div>
      )}

      {/* Bootstrap Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteSuccessMessage ? (
            <p className="text-success text-center">{deleteSuccessMessage}</p>
          ) : (
            <>
              <p>Are you sure you want to delete this account?</p>
              <p>Type <strong>DELETE</strong> below to confirm:</p>
              <input
                type="text"
                className="form-control"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE to confirm"
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {deleteSuccessMessage ? (
            <Button variant="primary" onClick={() => navigate('/')}>
              Go to Login
            </Button>
          ) : (
            <>
              <Button
                variant="danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE'}
              >
                Delete Account
              </Button>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
