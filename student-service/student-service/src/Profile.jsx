import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE } from './graphql';
import './Profile.css';

// Helper function to calculate age
const calculateAge = (birthdate) => {
  if (!birthdate) return 'N/A'; // Return 'N/A' if birthdate is not provided
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

  // Fetch profile data
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { username },
    skip: !username, // Skip the query if username is not available
    onError: (err) => console.error('GraphQL error:', err),
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data?.getProfile) {
      setFormData({
        username: data.getProfile.username || '', // Add username
        fullName: data.getProfile.fullName || '',
        bio: data.getProfile.bio || '',
        location: data.getProfile.location || '',
        interests: data.getProfile.interests || '',
        phoneNumber: data.getProfile.phoneNumber || '',
        gender: data.getProfile.gender || '',
        email: data.getProfile.email || '',
        birthdate: data.getProfile.birthdate
          ? new Date(data.getProfile.birthdate).toISOString().split('T')[0] // Format to "yyyy-MM-dd"
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

      const response = await updateProfile({
        variables: { input },
      });

      // Update the username in the frontend if it was changed
      if (formData.username.trim() && formData.username !== username) {
        localStorage.setItem('username', formData.username); // Update localStorage
        setUsername(formData.username); // Update the state variable
        if (onUsernameChange) {
          onUsernameChange(formData.username); // Notify the parent component
        }
      }

      alert('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (!username) {
    return <p>Error: Username is missing</p>;
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile</p>;

  return (
    <div className="profile-container">
      <h1>Profile Details</h1>
      {editing ? (
        <div className="profile-edit">
          
            <label class="form-label">Full Name:</label>
            <input class="form-control" name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}/>
         
          <label>
            Bio:
            <input class="form-control"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </label>
          <label>
            Location:
            <input class="form-control"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
            />
          </label>
          <label>
            Interests:
            <input class="form-control"
              name="interests"
              type="text"
              value={formData.interests}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone Number:
            <input class="form-control"
              name="phoneNumber"
              type="text"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </label>
          <label>
            Gender:
            <input class="form-control"
              name="gender"
              type="text"
              value={formData.gender}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input class="form-control"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Birthdate:
            <input class="form-control"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </label>
          <label>
            Username:
            <input
              className="form-control"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
            />
          </label>
          <button onClick={handleSave} class="btn btn-outline-dark">Save</button>
          <button onClick={() => setEditing(false)} className="btn btn-outline-dark">Cancel</button>
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
          <button onClick={() => setEditing(true)} className="btn btn-outline-dark">Edit Profile</button>
        </div>
      )}
    </div>
  );
}