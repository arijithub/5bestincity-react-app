import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const LoginContext = createContext();

// Helper function to set cookie
const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Helper function to get cookie
const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

// Helper function to delete cookie
const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const LoginProvider = ({ children }) => {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loginState = sessionStorage.getItem('loginState');
    const cookieLoginState = getCookie('loginState');
    const cookieUserId = getCookie('user_id');
    
    if (cookieLoginState === 'logged_in' || loginState === 'logged_in') {
      setUserLoggedIn(true);
      setUserId(cookieUserId || localStorage.getItem('user_id'));
    }
  }, []);

  const login = (newUserId, name, phone) => {
    // Set session storage
    sessionStorage.setItem('loginState', 'logged_in');
    
    // Set local storage
    localStorage.setItem('loginState', 'logged_in');
    localStorage.setItem('user_id', newUserId);
    localStorage.setItem('name', name);
    localStorage.setItem('phone', phone);
    
    // Set cookies
    setCookie('loginState', 'logged_in');
    setCookie('user_id', newUserId);
    
    // Update state
    setUserLoggedIn(true);
    setUserId(newUserId);
  };

  const logout = useCallback(() => {
    // Clear session storage
    sessionStorage.removeItem('loginState');
    
    // Clear local storage
    localStorage.removeItem('loginState');
    localStorage.removeItem('user_id');
    localStorage.removeItem('name');
    localStorage.removeItem('phone');
    
    // Clear cookies
    deleteCookie('loginState');
    deleteCookie('user_id');
    
    // Update state
    setUserId(null);
    setUserLoggedIn(false);
  }, []);

  return (
    <LoginContext.Provider value={{ userLoggedIn, userId, login, logout }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (context === undefined) {
    throw new Error('useLogin must be used within a LoginProvider');
  }
  return context;
};