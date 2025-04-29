import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8080/query', // Ensure this matches your Go server's endpoint
  cache: new InMemoryCache(),
});

export default client;