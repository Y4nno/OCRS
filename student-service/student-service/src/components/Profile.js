const PROFILE_UPDATED_SUBSCRIPTION = gql`
  subscription ProfileUpdated($username: String!) {
    profileUpdated(username: $username) {
      fullName
      email
      bio
      location
      interests
      phoneNumber
      gender
    }
  }
`;

// Add this inside your component
const { data: profileData, loading: profileLoading } = useQuery(GET_PROFILE_QUERY, {
  variables: { username: currentUsername }
});

useSubscription(PROFILE_UPDATED_SUBSCRIPTION, {
  variables: { username: currentUsername },
  onData: ({ data }) => {
    if (data?.data?.profileUpdated) {
      // Manually update the cache with the new data
      client.cache.writeQuery({
        query: GET_PROFILE_QUERY,
        variables: { username: currentUsername },
        data: {
          getProfile: data.data.profileUpdated
        }
      });
    }
  }
});