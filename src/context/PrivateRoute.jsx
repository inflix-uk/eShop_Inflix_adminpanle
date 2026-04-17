import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Auth";

export default function PrivateRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    if (!auth.user) {
      setLoading(false);
    } else {
      // If authenticated, finish loading
      setLoading(false);
    }
  }, [auth.user]);

  useEffect(() => {
    // Clear stored data when user is not authenticated
    if (!loading && !auth.user) {
      auth.logout(); // This will clear localStorage and Redux state
    }
  }, [loading, auth.user, auth]);

  if (loading) {
    // If authentication check is still loading, render nothing or show a loading spinner
    return <div>Loading...</div>; // Optional: show a loading spinner
  }

  if (!auth.user) {
    // Redirect to login
    return <Navigate to="/" state={{ path: location.pathname }} />;
  }

  // If authenticated, render the children components
  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired
};
