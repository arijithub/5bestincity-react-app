import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import '../../styles/master.css';
import '../../styles/custom-styles.css';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#fce4ec',
    borderRadius: '8px',
    maxWidth: '400px',
    width: '100%'
  }
}));

const StyledButton = styled(Button)(({ isactive }) => ({
  backgroundColor: isactive === 'true' ? '#2e7d32' : '#81c784',
  color: 'white',
  '&:hover': {
    backgroundColor: isactive === 'true' ? '#1b5e20' : '#66bb6a',
  },
  '&.Mui-disabled': {
    backgroundColor: '#c8e6c9',
    color: '#a5d6a7',
  },
}));

const ThankYouContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '24px',
});

const IconWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '24px',
});

const CloseButton = styled(Button)({
  backgroundColor: '#4CAF50',
  color: 'white',
  '&:hover': {
    backgroundColor: '#45a049',
  },
  borderRadius: '25px',
  padding: '10px 24px',
  fontSize: '16px',
  marginTop: '24px',
});

const EnquiryForm = ({ open, onClose, businessName, businessImage, cityname, subcatname, listingId, cityurlslug, subcaturlslug  }) => {
  const [message, setMessage] = useState('');
  const [isMessageEntered, setIsMessageEntered] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    setIsMessageEntered(message.trim().length > 0);
  }, [message]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (isMessageEntered) {
        const formData = new URLSearchParams({
            wpno: localStorage.getItem('phone'),
            name1: localStorage.getItem('name'),
            bid1: businessName,
            msg: message,
            lid: listingId,  // Ensure this is passed as a prop to EnquiryForm
            purl: `https://top5incity.com/${subcaturlslug}-in-${cityurlslug}`
        }).toString();

        fetch('https://top5incity.com/api/notverifieddata.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
          
        })
        .catch((error) => {
            console.error('Error:', error);
        });
		
		  setMessage('');
            setShowThankYou(true);
    }
};


  const handleClose = () => {
    if (showThankYou) {
      setShowThankYou(false);
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <StyledDialog open={open} onClose={handleClose}>
      {!showThankYou ? (
        <>
          <DialogTitle>
            <Typography variant="h6" align="center">Enquiry</Typography>
          </DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
              <img
                src={businessImage}
                alt={businessName}
                className="enquiry-image"
              />
              <Typography variant="subtitle1" mt={1}>
                {businessName}
              </Typography>
              <Typography variant="body2">
                {cityname}
              </Typography>
              <Typography variant="body2" mb={1}>
                {subcatname}
              </Typography>
            </Box>
            <form onSubmit={handleSubmit} className="enquiry-form">
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Enter your message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="enquiry-textarea"
              />
              <StyledButton
                type="submit"
                fullWidth
                variant="contained"
                isactive={isMessageEntered.toString()}
                disabled={!isMessageEntered}
              >
                Submit
              </StyledButton>
            </form>
          </DialogContent>
        </>
      ) : (
        <ThankYouContent>
          <IconWrapper>
            <CheckCircleOutlineIcon style={{ fontSize: 80, color: '#4CAF50' }} />
          </IconWrapper>
          <Typography variant="h5" align="center" gutterBottom>
            Thank You!
          </Typography>
          <Typography variant="body1" align="center" paragraph>
            Your enquiry has been submitted successfully. We'll get back to you soon.
          </Typography>
          <CloseButton onClick={handleClose}>
            Close
          </CloseButton>
        </ThankYouContent>
      )}
    </StyledDialog>
  );
};

export default EnquiryForm;