import React from 'react';
import ReactDOM from 'react-dom/client'; // Use 'react-dom/client' for React 18
import { ApolloProvider } from '@apollo/client';
import client from './apolloClient'; // Import the Apollo Client configuration
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root
root.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
);