import React, { useState, useEffect } from 'react';
import { Typography, Rating, Button, Box, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton, Snackbar, Alert } from '@mui/material';
import { Phone, Email, Directions, WhatsApp, LocationOn } from '@mui/icons-material';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { ContentWrapper, colors, typography } from '../../../theme-styles';

const userLoggedIn = localStorage.getItem('loginState') === 'logged_in';
const userId = localStorage.getItem('user_id');

const LoginRequiredModal = ({ open, onClose, onLogin }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="login-required-dialog-title"
      aria-describedby="login-required-dialog-description"
    >
      <DialogTitle id="login-required-dialog-title">Login Required</DialogTitle>
      <DialogContent>
        <DialogContentText id="login-required-dialog-description">
          Please log in to access this feature.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogin} color="primary" autoFocus>
          LOG IN
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const BasicInfo = ({
  name,
  listingId,
  rating,
  ratingCount,
  address,
  phone,
  phoneAlt,
  email,
  badgeinfo,
  contactinfo,
  contactPopupData,
  onOpenEnquiry,
  onOpenContactModal,
  directionurl,
  isPinned,
  onPinClick
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const isbadge = !badgeinfo || badgeinfo.length === 0;
  const showContactModal = contactPopupData;

  const handleButtonClick = (action) => {
    if (isbadge) {
      if (userLoggedIn) {
        if (showContactModal) {
          onOpenContactModal(action, { contactPopupData });
        } else {
          onOpenEnquiry();
        }
      } else {
        setIsLoginModalOpen(true);
      }
    } else {
      switch(action) {
        case 'call':
          window.location.href = `tel:${phone}`;
          break;
        case 'whatsapp':
          window.location.href = `https://wa.me/${phone}`;
          break;
        case 'direction':
          window.location.href = `${directionurl}`;
          break;
        default:
          console.log('Unhandled action:', action);
      }
    }
  };

  const handleLogin = () => {
    console.log('Login button clicked');
    setIsLoginModalOpen(false);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  // CSS Keyframes for icon vibration
  const vibrationAnimation = {
    '@keyframes vibrate': {
      '0%': { transform: 'translate(0)' },
      '20%': { transform: 'translate(-1px, 1px)' },
      '40%': { transform: 'translate(1px, -1px)' },
      '60%': { transform: 'translate(-1px, -1px)' },
      '80%': { transform: 'translate(1px, 1px)' },
      '100%': { transform: 'translate(0)' }
    }
  };

  return (
    <ContentWrapper sx={{ 
      padding: '24px',
      borderRadius: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      {/* Business Name and Rating */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 0.5
        }}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontSize: '1.4rem', 
              fontWeight: 'bold',
              color: colors.app_primary,
              flex: 1
            }}
          >
            {name}
          </Typography>
          {badgeinfo && badgeinfo.length > 0 && (
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onPinClick();
              }}
              sx={{
                padding: '4px',
                marginLeft: 1,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              {isPinned ? (
                <PushPinIcon sx={{ 
                  color: colors.categoryActive, 
                  fontSize: '1.2rem',
                  transition: 'color 0.3s ease',
                  transform: 'scale(1.1)' 
                }} />
              ) : (
                <PushPinOutlinedIcon sx={{ 
                  color: colors.app_primary, 
                  fontSize: '1.2rem',
                  transition: 'color 0.3s ease'
                }} />
              )}
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '20px',
              mr: 1
            }}
          >
            {rating ? rating : ''}
          </Typography>
          <Rating 
            value={parseFloat(rating)} 
            readOnly 
            precision={0.1} 
            sx={{ 
              color: '#FFB400',
              '& .MuiRating-iconFilled': {
                color: '#FFB400'
              },
              '& .MuiRating-iconHover': {
                color: '#FFB400'
              }
            }} 
          />
          <Typography 
            sx={{ 
              ml: 1,
              color: colors.secondaryText,
              fontSize: '0.9rem'
            }}
          >
            {ratingCount > 0 ? `(${ratingCount} reviews)` : ''}
          </Typography>
        </Box>
      </Box>

      {/* Contact Information */}
      <Box sx={{ mb: 4 }}>
        {/* Address */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-start',
          mb: 2
        }}>
          <LocationOn sx={{ 
            color: '#ccc', 
            mr: 1.5,
            mt: 0.5
          }} />
          <Box>
            <Typography 
              sx={{ 
                color: colors.primaryText,
                whiteSpace: 'normal',  // Allows text to wrap
                wordBreak: 'break-word',  // Breaks long words if needed
                overflow: 'visible',  // Ensures no content is hidden
                display: 'block',  // Ensures block-level display
                lineHeight: 1.5  // Improves readability for multiple lines
              }}
            >
              {address}
            </Typography>
            {contactinfo.is_direction === "true" && (
              <Button
                variant="text"
                startIcon={<Directions />}
                sx={{
                  color: '#0D6EFD',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  padding: '4px 8px',
                  backgroundColor: 'rgba(13, 110, 253, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(13, 110, 253, 0.1)'
                  }
                }}
                onClick={() => handleButtonClick('direction')}
              >
                Get Directions
              </Button>
            )}
          </Box>
        </Box>

        {/* Phone */}
        {phone && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2
          }}>
            <Phone sx={{ color: '#ccc', mr: 1.5 }} />
            <Typography sx={{ color: colors.primaryText }}>
              {phone}
            </Typography>
          </Box>
        )}

        {/* Phone Alt */}
        {phoneAlt && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2
          }}>
            <Phone sx={{ color: '#ccc', mr: 1.5 }} />
            <Typography sx={{ color: colors.primaryText }}>
              {phoneAlt}
            </Typography>
          </Box>
        )}

        {/* Email */}
        {email && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center'
          }}>
            <Email sx={{ color: '#ccc', mr: 1.5 }} />
            <Typography sx={{ color: colors.primaryText }}>
              {email}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ 
        display: 'flex', 
        gap: 2
      }}>
        {contactinfo.is_call === 'true' && (
          <Button
            variant="contained"
            disableElevation
            startIcon={
              <Phone sx={{
                animation: 'shake 1s infinite',
                '@keyframes shake': {
                  '0%, 100%': { transform: 'rotate(0deg)' },
                  '20%, 60%': { transform: 'rotate(-10deg)' },
                  '40%, 80%': { transform: 'rotate(10deg)' }
                }
              }} />
            }
            onClick={() => handleButtonClick('call')}
            fullWidth
            sx={{
              backgroundColor: colors.callbuttonbg,
              color: colors.commonbtnbg,
              borderRadius: '100px',
              padding: '6px 16px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
              border: 'none',
              boxShadow: '0 2px 4px rgba(255, 107, 0, 0.4)',
              '&:hover': {
                backgroundColor: colors.callbuttonbg,
                boxShadow: '0 4px 8px rgba(255, 107, 0, 0.4)',
              },
            }}
          >
            Call
          </Button>
        )}

        {contactinfo.is_whatsapp === 'true' && (
          <Button
            variant="text"
            disableRipple
            startIcon={<WhatsApp />}
            onClick={() => handleButtonClick('whatsapp')}
            fullWidth
            sx={{
              backgroundColor: colors.commonbtnbg,
              color: colors.callbuttonbg,
              borderRadius: '100px',
              padding: '6px 16px',
              textTransform: 'none',
              fontSize: '14px',
              fontWeight: 500,
             /*  border: `2px solid ${colors.callbuttonbg}`, */
              boxShadow: '0 4px 8px rgba(255, 107, 0, 0.4)',
              '&:hover': {
                backgroundColor: colors.commonbtnbg,
                boxShadow: '0 4px 8px rgba(255, 107, 0, 0.4)',
              },
              '& .MuiSvgIcon-root': {
                color: colors.callbuttonbg,
              },
            }}
          >
            Chat
          </Button>
        )}
      </Box>

      {/* Snackbar for pin notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ContentWrapper>
  );
};

export default BasicInfo;