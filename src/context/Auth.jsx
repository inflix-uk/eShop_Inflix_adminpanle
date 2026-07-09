import { useContext, createContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { login, logout, setIp } from '../redux/reducers/authSlice';
import { syncAdminSession } from '../utils/apiClient';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const ip = useSelector((state) => state.auth.ip);
  const userId = user?.id || user?._id;

  useEffect(() => {
    dispatch(setIp(BACKEND_URL));
  }, [dispatch]);

  useEffect(() => {
    if (!userId) return;
    syncAdminSession();
  }, [userId]);

  const loginHandler = (user) => {
    dispatch(login(user));
  };

  const logoutHandler = () => {
    dispatch(logout());
  };
  return (
    <AuthContext.Provider value={{ user, ip, login: loginHandler, logout: logoutHandler }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const useAuth = () => {
  return useContext(AuthContext);
};

