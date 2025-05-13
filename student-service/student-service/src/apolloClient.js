import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

// HTTP Link for queries and mutations
const httpLink = new HttpLink({
  uri: 'http://localhost:8080/query', // Ensure this matches your server's GraphQL endpoint
  credentials: 'same-origin', // Include credentials if needed
});

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:8080/query', // Ensure this matches your server's WebSocket endpoint
    connectionParams: {}, // Add any required connection parameters here
  })
);

// Split Link to route queries/mutations to HTTP and subscriptions to WebSocket
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

// Apollo Client configuration
const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Profile: {
        fields: {
          // Add field policies for profile fields that need to be merged
          fullName: { merge: true },
          bio: { merge: true },
          location: { merge: true },
          interests: { merge: true },
          phoneNumber: { merge: true },
          gender: { merge: true },
          email: { merge: true },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Always fetch fresh data
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'network-only', // Always fetch fresh data
    },
    mutate: {
      fetchPolicy: 'no-cache', // Avoid caching mutation results
    },
  },
});

export default client;