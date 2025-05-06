import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

// Define the GraphQL mutation for login
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
    }
  }
`;

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Use Apollo Client's useMutation hook
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ variables: { input: formData } });
      alert(response.data.login.message);
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </form>
  );
}