import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
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

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($username: String!, $newPassword: String!) {
    resetPassword(username: $username, newPassword: $newPassword) {
      success
      message
    }
  }
`;

export default function RegisterLogin() {
  const [activeTab, setActiveTab] = useState('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [register] = useMutation(REGISTER_MUTATION);
  const [login] = useMutation(LOGIN_MUTATION);
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION);
  const navigate = useNavigate();
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

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
      const { data } = await login({
        variables: { input },
      });

      if (data.login.success) {
        localStorage.setItem('username', input.username);
        navigate('/profile');
        setLoginErrorMessage(''); // Clear any previous error messages
      } else {
        setLoginErrorMessage(data.login.message || 'Incorrect username or password.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      setLoginErrorMessage('An error occurred. Please try again.');
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotUsername || !newPassword) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    try {
      const { data } = await resetPassword({
        variables: { username: forgotUsername, newPassword },
      });

      console.log('Reset Password Response:', data);

      if (data.resetPassword.success) {
        alert('Password reset successfully!');
        setShowForgotPasswordModal(false);
        setForgotUsername('');
        setNewPassword('');
        setErrorMessage('');
      } else {
        setErrorMessage(data.resetPassword.message || 'An error occurred.');
      }
    } catch (err) {
      console.error('Error resetting password:', err);
      setErrorMessage('An error occurred. Please try again.');
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
            {loginErrorMessage && <p className="text-danger">{loginErrorMessage}</p>}
            <button type="submit" className="submit-btn">
              Sign in
            </button>
          </form>
        )}
        <div className="forgot-password">
          <button
            type="button"
            className="btn btn-link forgot-password-link"
            onClick={() => setShowForgotPasswordModal(true)}
          >
            Forgot Password?
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showForgotPasswordModal} onHide={() => setShowForgotPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Enter your username and a new password.</p>
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Username"
            value={forgotUsername}
            onChange={(e) => setForgotUsername(e.target.value)}
          />
          <input
            type="password"
            className="form-control mb-3"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {errorMessage && <p className="text-danger">{errorMessage}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleForgotPassword}>
            Reset Password
          </Button>
          <Button variant="secondary" onClick={() => setShowForgotPasswordModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}