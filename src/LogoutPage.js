import React, { useEffect,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { API_BASE_URL } from './config'; // Make sure this path is correct

function LogoutPage() {
  const navigate = useNavigate();
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [userId, setUserId] = useState(null);


  useEffect(() => {
    const performLogout = async () => {
      // Remove items from localStorage
      localStorage.removeItem('user_id');
      localStorage.removeItem('email');

      // Remove items from sessionStorage
       setUserId(null);
       setUserLoggedIn(false);
       sessionStorage.removeItem('loginState');
	   localStorage.removeItem('loginState');
	   
	 //  alert('hello');

      // Remove cookies
      Cookies.remove('loginState');
      Cookies.remove('user_id');
      Cookies.remove('email');

      // Call the logout API
      const userId = localStorage.getItem('user_id');
      const email = localStorage.getItem('email');

      if (userId || email) {
        try {
          const url = new URL(`${API_BASE_URL}loginbrowserstate.php`);
          url.searchParams.append('user_id', userId || '');
          url.searchParams.append('email', email || '');
          url.searchParams.append('state', 'logout');

          await fetch(url.toString(), { method: 'GET' });
        } catch (error) {
          console.error('Error during logout:', error);
        }
      }

      // Redirect to home page or login page
      //navigate('/login');
    };

    performLogout();
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
      <p>Please wait while we log you out.</p>
    </div>
  );
}

export default LogoutPage;