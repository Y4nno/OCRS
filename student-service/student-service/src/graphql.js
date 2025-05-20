import { gql } from '@apollo/client';

// Query: Get Profile
export const GET_PROFILE = gql`
  query GetProfile($username: String!) {
    getProfile(username: $username) {
      fullName
      age
      bio
      location
      interests
      phoneNumber
      gender
      email
      birthdate
    }
  }
`;

// Mutation: Update Profile
export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      fullName
      age
      bio
      location
      interests
      phoneNumber
      gender
      email
      birthdate
    }
  }
`;

// Mutation: Delete Profile
export const DELETE_PROFILE = gql`
  mutation DeleteProfile($username: String!) {
    deleteProfile(username: $username)
  }
`;