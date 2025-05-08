import React, { useState } from 'react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { GET_PROFILE, UPDATE_PROFILE } from './graphql';
import './Profile.css';

const PROFILE_UPDATED = gql`
  subscription ProfileUpdated($username: String!) {
    profileUpdated(username: $username) {
      fullName
      bio
      location
      interests
      phoneNumber
      gender
      email
    }
  }
`;

export default function Profile() {
  const username = localStorage.getItem('username'); // Retrieve username from localStorage

  // Fetch profile data
  const { data, loading, error } = useQuery(GET_PROFILE, {
    variables: { username },
    skip: !username, // Skip the query if username is not available
  });

  // Subscription for profile updates
  const { data: subscriptionData, loading: subscriptionLoading } = useSubscription(PROFILE_UPDATED, {
    variables: { username },
  });

  // Mutation to update profile
  const [updateProfile] = useMutation(UPDATE_PROFILE);

  // State for editing and form data
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  // Handle cases where username is not available
  if (!username) return <p>Error: Username is not defined. Please log in again.</p>;
  if (loading || subscriptionLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const profile = subscriptionData?.profileUpdated || data.getProfile;

  // Enable editing mode and populate form data
  const handleEdit = () => {
    setEditing(true);
    setFormData({
      fullName: profile.fullName || '',
      bio: profile.bio || '',
      location: profile.location || '',
      interests: profile.interests || '', // Convert array to comma-separated string
      phoneNumber: profile.phoneNumber || '',
      gender: profile.gender || '',
      email: profile.email || '',
    });
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save updated profile data
  const handleSave = async () => {
    try {
      const input = {
        fullName: formData.fullName,
        bio: formData.bio,
        location: formData.location,
        interests: formData.interests,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
        email: formData.email,
        username: username,
      };

      console.log('UpdateProfile input:', input); // Debugging

      await updateProfile({
        variables: { input },
      });
      setEditing(false); // Exit editing mode
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  return (
    <div className="profile-container">
      <h1>Profile Details</h1>
      <p><strong>Full Name:</strong> {profile.fullName}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Phone Number:</strong> {profile.phoneNumber || 'N/A'}</p>
      <p><strong>Age:</strong> {profile.age || 'N/A'}</p>
      <p><strong>Bio:</strong> {profile.bio || 'N/A'}</p>
      <p><strong>Location:</strong> {profile.location || 'N/A'}</p>
      <p><strong>Interests:</strong> {profile.interests || 'N/A'}</p>
      <p><strong>Gender:</strong> {profile.gender || 'N/A'}</p>
      {editing ? (
        <div className="profile-edit">
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <input
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Bio"
          />
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Location"
          />
          <input
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            placeholder="Interests (comma-separated)"
          />
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <input
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            placeholder="Gender"
          />
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
          />
          <button onClick={handleSave} className="save-btn">Save</button>
          <button onClick={() => setEditing(false)} className="cancel-btn">Cancel</button>
        </div>
      ) : (
        <button onClick={handleEdit} className="edit-btn">Edit Profile</button>
      )}
    </div>
  );
}