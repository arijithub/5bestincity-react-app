import React, { useState, useEffect } from 'react';
import { useLogin } from './contexts/LoginContext';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Alert,
  Box,
  Paper,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { API_BASE_URL,API_EASY_PROFILE_URL } from './config/apiConfig';
import MetaData from './components/MetaData';
import { colors } from './theme-styles';

const DeleteMyInfo = () => {
  const { userLoggedIn, userId } = useLogin();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    deleteAccount: false,
    deleteActivity: false,
    deleteLikes: false,
    deleteReviews: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const styles = {
	  checkboxItem: {background: '#00000010', borderRadius: '10px', height: '50px', margin: '5px',},
	  checkboxLabel: {color: '#333', fontSize: '15px',},
	  checkboxBox: {color: '#666', '&.Mui-checked': {color: '#FF5733',}},
	  submitButton: {background: '#FF5733', color: '#fff', width: '100%', height: '40px', borderRadius: '35px', textTransform: 'none', boxShadow: 'none', fontSize: '18px', '&:hover': {background: '#ff000080', boxShadow: 'none', }}
  };
  
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (userLoggedIn && userId) {
        try {
          console.log('Fetching user data for ID:', userId);
          const response = await fetch(`${API_EASY_PROFILE_URL}easy_profile.php?user_id=${userId}`);
          const data = await response.json();
          console.log('API Response:', data);
          
          if (data && data.email) {
            console.log('Setting email:', data.email);
            setFormData(prev => ({
              ...prev,
              email: data.email,
              phone: data.phone || prev.phone
            }));
          } else {
            console.log('No email in response data');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
      const userPhone = localStorage.getItem('phone');
      if (userPhone) {
        setFormData(prev => ({
          ...prev,
          phone: userPhone
        }));
      }
    }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [userLoggedIn, userId]);

  if (isLoading) {
    return (
      <Box 
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#f5f5f5'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!userLoggedIn) {
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
        <Alert 
          severity="warning"
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 400,
            bgcolor: '#f57c00',
            '& .MuiAlert-message': {
              width: '100%'
            },
            '& .MuiAlert-icon': {
              fontSize: '2rem'
            }
          }}
        >
          <Typography variant="h6" component="h1" gutterBottom sx={{ color: 'white' }}>
            Login Required
          </Typography>
          <Typography variant="body1" sx={{ color: 'white' }}>
            Please log in to access the account deletion page.
          </Typography>
        </Alert>
      </Box>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userLoggedIn) {
      setError('Please log in to delete your information');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (!formData.email && !formData.phone) {
      setError('Please enter either email or phone number');
      return;
    }
    
    if (!formData.deleteAccount && !formData.deleteActivity && !formData.deleteLikes && !formData.deleteReviews) {
      setError('Please select at least one option to delete');
      return;
    }
    
    try {
      const response = await fetch(`${API_EASY_PROFILE_URL}easy_profile.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          req_type: "delete",
          user_id: userId,
          request_details: {
            deleteAccount: formData.deleteAccount,
            deleteActivity: formData.deleteActivity,
            deleteLikes: formData.deleteLikes,
            deleteReviews: formData.deleteReviews,
            email: formData.email,
            phone: formData.phone
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit deletion request');
      }
      
      setError('');
      setSuccess(true);
      
      
    } catch (error) {
      setError('Failed to submit request. Please try again.');
    }
  };

  return (
    <>
      <MetaData component="DeleteInfo" />
      
      {success && (
        <Alert 
          severity="success"
          sx={{ mb: 3 }}
        >
          <AlertTitle>Request Submitted Successfully</AlertTitle>
          Your deletion request has been received. The process may take up to 15 days to complete.
        </Alert>
      )}

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        bgcolor: '#fff',
        pt: 4
      }}>
        <Card sx={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: colors.app_primary,
				textAlign: 'center',
				marginBottom: '10px',
                fontSize: { xs: '1.3rem', sm: '1.5rem' }
              }}
            >
            Delete My Info from 5BestInCity
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                type="email"
                placeholder="Enter your email address"
                  fullWidth
                value={formData.email}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '35px',
                      bgcolor: '#fff',
                      '& fieldset': {
                        borderColor: '#ddd',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ccc',
                      },
                    }
                  }}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
              
                <TextField
                type="tel"
                placeholder="Enter your phone number"
                  fullWidth
                value={formData.phone}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '35px',
                      bgcolor: '#fff',
                      '& fieldset': {
                        borderColor: '#ddd',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ccc',
                      },
                    }
                  }}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
              />
              
                <Box sx={{mt: 1,backgroundColor: colors.primaryBackground, padding: '20px', borderRadius: '15px',}}>
					
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 500,
                      color: colors.primaryText,
                    }}
                  >
                    Select the data you wish to delete:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <FormControlLabel sx={styles.checkboxItem}
                      control={
                    <Checkbox
                      checked={formData.deleteAccount}
                          size="medium"
                          sx={styles.checkboxBox}
                          onChange={(e) => setFormData(prev => ({
                        ...prev,
                            deleteAccount: e.target.checked
                          }))}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={styles.checkboxLabel}>
                          Delete my account
                        </Typography>
                      }
                    />
                    
                    <FormControlLabel sx={styles.checkboxItem}
                      control={
                    <Checkbox
                      checked={formData.deleteActivity}
                          size="medium"
                          sx={styles.checkboxBox}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deleteActivity: e.target.checked
                          }))}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={styles.checkboxLabel}>
                          Delete my activity history
                        </Typography>
                      }
                    />

                    <FormControlLabel sx={styles.checkboxItem}
                      control={
                        <Checkbox
                          checked={formData.deleteLikes}
                          size="medium"
                          sx={styles.checkboxBox}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deleteLikes: e.target.checked
                          }))}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={styles.checkboxLabel}>
                          Delete my likes
                        </Typography>
                      }
                    />

                    <FormControlLabel sx={styles.checkboxItem}
                      control={
						  
                        <Checkbox
                          checked={formData.deleteReviews}
                          size="medium"
                          sx={styles.checkboxBox}
                          onChange={(e) => setFormData(prev => ({
                        ...prev,
                            deleteReviews: e.target.checked
                          }))}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={styles.checkboxLabel}>
                          Delete my reviews
                        </Typography>
                      }
                    />
                  </Box>
                </Box>

            {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 2,
                      '& .MuiAlert-message': {
                        fontSize: '0.875rem'
                      }
                    }}
                  >
                    {error}
              </Alert>
            )}

                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    type="submit" 
                    variant="contained"
                    sx={styles.submitButton}
                  >
              Submit
            </Button>
                </Box>

                <Box 
                  sx={{ 
                    mt: 3,
                    p: 2,
                   // border: '1px dashed #ff0000',
                    borderRadius: '15px',
                    background: colors.primaryBackground,
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="div"
                    sx={{ 
                      color: '#333',
                      '& .highlight': {
                        color: '#ff0000'
                      }
                    }}
                  >
                    <Box sx={{ fontWeight: 600, mb: 1 }}>Please Note :</Box>
                    <ul style={{ 
                      margin: 0, 
                      paddingLeft: '20px',
                      '& li': {
                        marginBottom: '4px'
                      }
                    }}>
                      <li>
                        To delete your account, enter the exact email address and/or phone number with which you signed up and are <span className="highlight">currently</span> logged in.
                      </li>
                      <li>
                        Deletion process may take up to <span className="highlight">15 days</span> to take effect.
                      </li>
                      <li>
                        If you are still receiving newsletters or posts from us after requesting deletion, please contact us at <span className="highlight">contact@5bestincity.com</span>.
                      </li>
                      <li>
                        You can always come back and <span className="highlight">sign up</span> as a new user at any time.
                      </li>
              </ul>
                  </Typography>
                </Box>
              </Box>
            </form>
        </CardContent>
      </Card>
      </Box>
    </>
  );
};

export default DeleteMyInfo;