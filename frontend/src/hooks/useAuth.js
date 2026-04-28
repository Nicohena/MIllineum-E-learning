import { useAuth as useContextAuth } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and methods.
 * Provides easy access to the user object, login, and logout functions.
 */
export const useAuth = () => {
  return useContextAuth();
};

export default useAuth;
