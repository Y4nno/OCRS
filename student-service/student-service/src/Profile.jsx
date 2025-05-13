import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE } from './graphql';
import './Profile.css';

export default function Profile() {
  const username = localStorage.getItem('username');

  // Fetch profile data
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { username },
    skip: !username,
    onError: (err) => console.error('GraphQL error:', err),
  });

  const [updateProfile] = useMutation(UPDATE_PROFILE);
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    location: '',
    interests: '',
    phoneNumber: '',
    gender: '',
    email: '',
    birthdate: '',
  });

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (data?.getProfile) {
      setFormData({
        fullName: data.getProfile.fullName || '',
        bio: data.getProfile.bio || '',
        location: data.getProfile.location || '',
        interests: data.getProfile.interests || '',
        phoneNumber: data.getProfile.phoneNumber || '',
        gender: data.getProfile.gender || '',
        email: data.getProfile.email || '',
        birthdate: data.getProfile.birthdate || '',
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        variables: { input: { username, ...formData } },
      });
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
          <label>
            Full Name:
            <input
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
            />
          </label>
          <label>
            Bio:
            <input
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </label>
          <label>
            Location:
            <input
              name="location"
              type="text"
              value={formData.location}
              onChange={handleChange}
            />
          </label>
          <label>
            Interests:
            <input
              name="interests"
              type="text"
              value={formData.interests}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone Number:
            <input
              name="phoneNumber"
              type="text"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </label>
          <label>
            Gender:
            <input
              name="gender"
              type="text"
              value={formData.gender}
              onChange={handleChange}
            />
          </label>
          <label>
            Email:
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Birthdate:
            <input
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
            />
          </label>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-view">
          <p><strong>Full Name:</strong> {formData.fullName}</p>
          <p><strong>Bio:</strong> {formData.bio || 'N/A'}</p>
          <p><strong>Location:</strong> {formData.location || 'N/A'}</p>
          <p><strong>Interests:</strong> {formData.interests || 'N/A'}</p>
          <p><strong>Phone Number:</strong> {formData.phoneNumber || 'N/A'}</p>
          <p><strong>Gender:</strong> {formData.gender || 'N/A'}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Birthdate:</strong> {formData.birthdate || 'N/A'}</p>
          <button onClick={() => setEditing(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
}