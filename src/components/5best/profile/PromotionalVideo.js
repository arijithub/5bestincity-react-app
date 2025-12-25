import React from 'react';
import { Typography, Box } from '@mui/material';
import { ContentWrapper, colors } from '../../../theme-styles';
import { YouTube } from '@mui/icons-material';

const PromotionalVideo = ({ videoUrl }) => (
  <ContentWrapper sx={{ 
    padding: '24px',
    borderRadius: '16px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    mb: 3
  }}>
   { /* <Typography 
      variant="h6" 
      component="h2" 
      sx={{ 
        fontWeight: 'bold',
        color: colors.app_primary,
        fontSize: '1.25rem',
        mb: 3
      }}
    >
      Promotional Video
    </Typography> */}

    <Box sx={{ 
      position: 'relative',
      paddingBottom: '56.25%', // 16:9 aspect ratio
      height: 0,
      overflow: 'hidden',
      borderRadius: '8px',
      backgroundColor: colors.lightBackground
    }}>
      <iframe
        src={videoUrl}
        title="Promotional Video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  </ContentWrapper>
);

export default PromotionalVideo; 