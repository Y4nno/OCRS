import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import './RegisterLogin.css';

// GraphQL Mutation for Registration
const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
    }
  }
`;

// GraphQL Mutation for Login
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
    }
  }
`;

export default function RegisterLogin() {
  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [register] = useMutation(REGISTER_MUTATION);
  const [login] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  // Handle Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const input = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const { data } = await register({ variables: { input } });
      if (data.register.success) {
        alert(data.register.message);
        localStorage.setItem('username', input.username); // Store username in localStorage
        navigate('/profile'); // Redirect to profile page after successful registration
      } else {
        alert(data.register.message);
      }
    } catch (err) {
      console.error('Error during registration:', err);
      alert('Registration failed. Please try again.');
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const input = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const { data } = await login({ variables: { input } });
      if (data.login.success) {
        localStorage.setItem('username', input.username); // Store username in localStorage
        navigate('/profile'); // Redirect to profile page after successful login
      } else {
        alert(data.login.message);
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="register-login-container">
      <div className="left-panel">
        <h1>
          Start <br />
          Learning <br />
          with <br />
          <span className="brand-name">LionHeart</span>
        </h1>
      </div>
      <div className="right-panel">
        <div className="tabs">
          <button
            className={activeTab === 'register' ? 'active' : ''}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
          <button
            className={activeTab === 'login' ? 'active' : ''}
            onClick={() => setActiveTab('login')}
          >
            Sign in
          </button>
        </div>
        {activeTab === 'register' ? (
          <form className="form" onSubmit={handleRegister}>
            <input type="text" name="fullName" placeholder="Full Name" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="text" name="username" placeholder="Public username" required />
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button type="submit" className="submit-btn">
              Create an account for free
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleLogin}>
            <input type="text" name="username" placeholder="Username" required />
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button type="submit" className="submit-btn">
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}