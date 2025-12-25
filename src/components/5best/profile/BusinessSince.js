import React from 'react';
import { Typography, Box } from '@mui/material';
import { ContentWrapper, colors } from '../../../theme-styles';
import { BusinessCenter } from '@mui/icons-material';

const BusinessSince = ({ since }) => (
  <ContentWrapper sx={{ 
    padding: '24px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    mb: 3
  }}>
    <Typography 
      variant="h6" 
      component="h2" 
      sx={{ 
        fontWeight: 'bold',
        color: colors.app_primary,
        fontSize: '1.25rem',
        mb: 3
      }}
    >
      In Business Since
    </Typography>

    <Box sx={{ 
      backgroundColor: colors.lightBackground,
      padding: '16px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <BusinessCenter sx={{ 
        color: colors.app_primary,
        mr: 2,
        fontSize: '24px'
      }} />
      <Typography 
        sx={{ 
          color: colors.primaryText,
          fontSize: '1.1rem',
          fontWeight: 500
        }}
      >
        {since}
      </Typography>
    </Box>
  </ContentWrapper>
);

export default BusinessSince; 