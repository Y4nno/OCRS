import React from 'react';
import './custom.css';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import EnrollmentPage from './components/EnrollmentPage';
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP link for queries and mutations
const httpLink = new HttpLink({
    uri: 'http://localhost:8080/query',
});

// WebSocket link for subscriptions
const wsLink = new WebSocketLink({
    uri: 'ws://localhost:8080/query',
    options: {
        reconnect: true,
    },
});

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink
);

// Apollo Client instance
const client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
});

export default function App() {
    return (
        <ApolloProvider client={client}>
            <Navbar />
            <Routes>
                <Route path="/enrollment" element={<EnrollmentPage />} />
            </Routes>
        </ApolloProvider>
    );
}