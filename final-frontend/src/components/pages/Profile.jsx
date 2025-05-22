import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE, DELETE_PROFILE } from './graphql';
import '../css/profile.css';
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
  const [editing, setEditing] = useState(false);
  const [modal, setModal] = useState({ show: false, message: '', title: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const studentId = localStorage.getItem('studentId') || '';

  // Fetch profile data
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { username },
    fetchPolicy: 'network-only',
    skip: !username,
    onError: (err) => console.error('GraphQL error:', err),
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [deleteProfile] = useMutation(DELETE_PROFILE);

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

      setShowSuccessModal(true);
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setModal({ show: true, message: "Error updating profile.", title: "Error" });
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
          window.removeEventListener('click', handlePageClick);
        };

        window.addEventListener('click', handlePageClick);
      } else {
        setModal({ show: true, message: "Failed to delete account. Please try again.", title: "Error" });
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      setModal({ show: true, message: "An error occurred. Please try again.", title: "Error" });
    }
  };

  if (!username) {
    return <p>Error: Username is missing. Please log in again.</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile: {error.message}</p>;

  return (
    <div className="profile-container">
      <h1 style={{ textAlign: 'center' }}>Profile Details</h1>
      {/* <h2>{studentId}</h2> */}
      {editing ? (
        <div className="profile-edit">
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1.9 }}>
              <label>Full Name</label>
              <input
                className="form-control"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            <div style={{ flex: 1.5 }}>
              <label>Username</label>
              <input
                className="form-control"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 2 }}>
              <label>Email</label>
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
            </div>
            <div style={{ flex: 1.3 }}>
            <label>Gender</label>
                <select 
                className="form-select"
                name="gender"
                aria-label="Default select example"
                onChange={handleChange}
                value={formData.gender}
                >
                  <option value="Prefer not to say">Prefer not to say</option>            
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select> 
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1.5 }}>
              <label>Phone Number</label>
              <input
                className="form-control"
                name="phoneNumber"
                type="text"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
            </div>

            <div style={{ flex: 1.5 }}>
              <label>Birthdate</label>
              <input
                className="form-control"
                name="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Location</label>
          <input
            className="form-control"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleChange}
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1.5 }}>
              <label>Bio</label>
              <input
                className="form-control"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
              </div>
              <div style={{ flex: 1.5 }}>
              <label>Interests</label>
              <input
                className="form-control"
                name="interests"
                type="text"
                value={formData.interests}
                onChange={handleChange}
              />
              </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'end' }} >
            <button onClick={handleSave} className="btn btn-outline-dark">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn btn-outline-dark">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* This is your original "img" div, unchanged */}
          <div className="img" style={{ display: 'inline-flex', paddingTop: '5%', justifyContent: 'space-evenly' }}>
            <div style={{ textAlign: 'center' }}>
              <img
                src="https://media.tenor.com/RgS6G4wM5uMAAAAe/bro-what-surprised.png"
                alt="Profile"
                className="profile-image"
                style={{ width: '200px', height: '200px', borderRadius: '50%' }}
              />
              <h2 style={{ marginTop: '20px' }}>{formData.fullName}</h2>
              <p>{formData.username}</p>
              <p>{formData.email}</p>
            </div>
            <div className="profile-view">
              <p><strong>Age:</strong> {calculateAge(formData.birthdate)}</p>              
              <p><strong>Bio:</strong> {formData.bio || 'N/A'}</p>
              <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
              <p><strong>Interests:</strong> {formData.interests || 'N/A'}</p>
              <p><strong>Phone Number:</strong> {formData.phoneNumber || 'N/A'}</p>
              <p><strong>Gender:</strong> {formData.gender || 'N/A'}</p>
              <p><strong>Birthdate:</strong> {formData.birthdate || 'N/A'}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', gap: '10px' }}>
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
            </div>
          </div>
        </>
      )}

      {/* Bootstrap Modal for Delete Confirmation*/}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {deleteSuccessMessage ? (
            <p className="text-success text-center">{deleteSuccessMessage}</p>
          ) : (
            <>
              <p style={{ fontSize: '14px' }}>Are you sure you want to delete this account?
                <br />Type <strong>DELETE</strong> below to confirm:</p>
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
              <Button variant="primary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>

      {/* Bootstrap Modal for Success Message*/}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Profile Updated</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Profile updated successfully!</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => setShowSuccessModal(false)}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}