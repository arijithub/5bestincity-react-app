// src/hooks/useLoginState.js
import { useLogin } from '../contexts/LoginContext';

export const useLoginState = () => {
  const { isLoggedIn } = useLogin();
  return isLoggedIn;
};