import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLogin } from './contexts/LoginContext';
import { API_BASE_URL } from './config';
import { 
  Paper, 
  Alert, 
  AlertTitle, 
  Box, 
  CircularProgress 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';

const LoginCheck = () => {
  const { state, userId } = useParams();
  const { login, logout } = useLogin();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState({
    title: 'Processing...',
    description: 'Please wait while we verify your request.'
  });

  useEffect(() => {
    const checkStatus = async () => {
      const url = new URL(`${API_BASE_URL}loginbrowserstate.php`);
      url.searchParams.append('user_id', userId);
      url.searchParams.append('state', state);

      try {
        const response = await fetch(url.toString());
        const data = await response.json();
        
        if (data.result === 'success') {
          if (state === 'logout') {
            logout();
            setMessage({
              title: 'Logged Out Successfully',
              description: 'You have been securely logged out of your account.'
            });
          } else {
            login(data.id, data.name, data.phone);
            setMessage({
              title: 'Login Successful',
              description: `Welcome back${data.name ? ', ' + data.name : ''}! You've been successfully logged in.`
            });
          }
          setStatus('success');
          
          setTimeout(() => {
            // navigate('/');
			window.close();
          }, 2000);
        } else {
          const actionType = state === 'logout' ? 'Logout' : 'Login';
          setMessage({
            title: `${actionType} Failed`,
            description: `We couldn't verify your ${actionType.toLowerCase()} attempt. Please try again.`
          });
          setStatus('error');
        }
      } catch (error) {
        const actionType = state === 'logout' ? 'Logout' : 'Login';
        setMessage({
          title: 'Connection Error',
          description: `We encountered an error during ${actionType.toLowerCase()}. Please try again later.`
        });
        setStatus('error');
      }
    };
    
    checkStatus();
  }, [state, userId, login, logout, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon sx={{ fontSize: 28 }} />;
      case 'error':
        return <ErrorIcon sx={{ fontSize: 28 }} />;
      case 'loading':
        return <CircularProgress size={28} />;
      default:
        return <InfoIcon sx={{ fontSize: 28 }} />;
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return { severity: 'success', color: '#4caf50' };
      case 'error':
        return { severity: 'error', color: '#f44336' };
      case 'loading':
        return { severity: 'info', color: '#2196f3' };
      default:
        return { severity: 'warning', color: '#ff9800' };
    }
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        p: 2
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 480,
          p: 3,
          borderRadius: 2
        }}
      >
        <Alert 
          severity={getStatusConfig().severity}
          icon={getStatusIcon()}
          sx={{
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <AlertTitle sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
            {message.title}
          </AlertTitle>
          <Box sx={{ mt: 0.5, color: 'text.secondary' }}>
            {message.description}
          </Box>
        </Alert>
      </Paper>
    </Box>
  );
};

export default LoginCheck;