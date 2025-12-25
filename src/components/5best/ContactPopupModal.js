import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  Rating,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { colors, typography } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';

const PopupContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  backgroundColor: colors.secondaryBackground,
  borderRadius: 12,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const ContactImage = styled('img')({
  width: 100,
  height: 100,
  borderRadius: '50%',
  objectFit: 'cover',
  marginBottom: 16,
});

const BadgeContainer = styled(Box)({
   display: 'flex',
  justifyContent: 'center',
  gap: 20,  // Increased gap from 16 to 20
  marginBottom: 20,  // Increased margin from 16 to 20
});

const Badge = styled('img')({
  width: 70,  // Increased size
  height: 70, // Increased size
});

const ContactButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: 20,
  textTransform: 'none',
  width: '80%',
}));

const ContactPopupModal = ({ open, onClose, listingId }) => {
  const [contactData, setContactData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContactData = async () => {
      if (!listingId) return;
      
      setLoading(true);
      try {
        const response = await fetch(`https://top5incity.com/api/extcheck.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: `lid=${listingId}`,
        });
        const data = await response.text();
        const [
          imageUrl, 
          name, 
          phone, 
          whatsapp, 
          status, 
          rating, 
          reviewCount, 
          profileUrl, 
          lastField
        ] = data.split('-->');
        
        setContactData({
          imageUrl,
          name,
          phone,
          whatsapp,
          isVerified: status.includes('verified'),
          isPrime: status.includes('prime'),
          rating: parseFloat(rating),
          reviewCount: parseInt(reviewCount),
          profileUrl,
        });
      } catch (error) {
        console.error('Error fetching contact data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open && listingId) {
      fetchContactData();
    }
  }, [open, listingId]);

  const handleCall = () => {
    if (contactData?.phone) {
      window.location.href = `tel:${contactData.phone}`;
    }
  };

  const handleWhatsApp = () => {
    if (contactData?.whatsapp) {
      window.location.href = `https://wa.me/${contactData.whatsapp}`;
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="contact-popup-title"
    >
      <PopupContent>
        {loading ? (
          <CircularProgress />
        ) : contactData ? (
          <>
            <ContactImage src={contactData.imageUrl} alt={contactData.name} />
            <BadgeContainer>
              {contactData.isVerified && (
                <Badge src="https://5bestincity.com/assets/img/badge/verified-2.svg" alt="Verified" />
              )}
              {contactData.isPrime && (
                <Badge src="https://5bestincity.com/assets/img/badge/prime.svg" alt="Prime" />
              )}
            </BadgeContainer>
            <Typography variant="h5" style={typography.h5} gutterBottom>
              {contactData.name}
            </Typography>
            <Box display="flex" alignItems="center" mb={2}>
              <Rating value={contactData.rating} readOnly precision={0.1} size="small" />
              <Typography variant="body2" style={typography.body2} ml={1}>
                ({contactData.reviewCount})
              </Typography>
            </Box>
            <ContactButton
              variant="contained"
              color="primary"
              startIcon={<PhoneIcon />}
              onClick={handleCall}
            >
              Call
            </ContactButton>
            <ContactButton
              variant="contained"
              color="success"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsApp}
            >
              WhatsApp
            </ContactButton>
            <Button onClick={onClose} sx={{ mt: 2 }}>
              Skip
            </Button>
          </>
        ) : (
          <Typography>No data available</Typography>
        )}
      </PopupContent>
    </Modal>
  );
};

export default ContactPopupModal;