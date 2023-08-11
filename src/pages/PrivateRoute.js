import React from 'react';
import { Redirect } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  // If there is no authenticated user, redirect to the login page
  if (!currentUser) {
    return <Redirect to='/login' />;
  }

  // If there is an authenticated user, render the child components
  return children;
};

export default ProtectedRoute;
