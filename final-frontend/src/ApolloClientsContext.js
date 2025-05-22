import React, { createContext, useContext } from "react";
import clientCourse from "./components/apollo/apolloClient-Course";
import clientStudent from "./components/apollo/apolloClient-Student";
import clientRegis from "./components/apollo/apolloClient-Regis";
import clientPayment from "./components/apollo/apolloClient-Payment";

const ApolloClientsContext = createContext({
  course: clientCourse,
  student: clientStudent,
  regis: clientRegis,
  payment: clientPayment,
});

export const useApolloClients = () => useContext(ApolloClientsContext);

export const ApolloClientsProvider = ({ children }) => (
  <ApolloClientsContext.Provider
    value={{
      course: clientCourse,
      student: clientStudent,
      regis: clientRegis,
      payment: clientPayment,
    }}
  >
    {children}
  </ApolloClientsContext.Provider>
);