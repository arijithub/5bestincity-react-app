// src/hooks/useLoginState.js
import { useState, useEffect } from 'react';

export const SessionManager = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginState = () => {
      const loginState = sessionStorage.getItem('loginState');
      setIsLoggedIn(loginState === 'logged_in');
    };

    checkLoginState();
    window.addEventListener('storage', checkLoginState);

    return () => {
      window.removeEventListener('storage', checkLoginState);
    };
  }, []);

  return isLoggedIn;
};