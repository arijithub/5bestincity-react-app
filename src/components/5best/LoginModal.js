import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const LoginModal = ({ open, onClose, onLogin }) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="login-modal-title" variant="h6" component="h2">
          Login Required
        </Typography>
        <Typography id="login-modal-description" sx={{ mt: 2 }}>
          Please log in to perform this action.
        </Typography>
        <Button onClick={onLogin} sx={{ mt: 2 }}>
          Log In
        </Button>
      </Box>
    </Modal>
  );
};

export default LoginModal;