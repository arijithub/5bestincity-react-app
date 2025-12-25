import React from 'react';
import { Typography, Box } from '@mui/material';
import { LocationOn } from '@mui/icons-material'; 
import { colors, typography } from '../../../theme-styles';

const Location = ({ mapUrl }) => (
  <Box sx={{ borderRadius: '8px', overflow: 'hidden' }}>
    <iframe
      src={mapUrl}
      width="100%"
      height="300"
      style={{ border: 0 }}
      allowFullScreen=""
      loading="lazy"
      title="Business Location"
    />
  </Box>
);

export default Location;
