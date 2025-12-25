import React from 'react';
import { Box, Typography } from '@mui/material';
import {
  colors
} from './theme-styles';

const FooterComponent = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: colors.app_primaryBackground,
        color: '#fff',
        padding: '10px',
        textAlign: 'center',
      
      }}
    >
      {/* Spacer - this adds space above the footer */}
      <Box sx={{ height: '50px' }} /> {/* Adjust the height of the spacer as needed */}

     
    </Box>
  );
};

export default FooterComponent;
