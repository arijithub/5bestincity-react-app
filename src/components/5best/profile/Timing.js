import React from 'react';
import { Typography, Box, Paper } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import { ContentWrapper, colors, typography } from '../../../theme-styles';

const Timing = ({ timing }) => {
  const timings = timing.replace(/\\r\\n/g, '\n').split('\n').filter(t => t.trim());

  return (
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
        Business Hours
      </Typography>

      <Box sx={{ 
        backgroundColor: colors.lightBackground,
        padding: '16px',
        borderRadius: '8px'
      }}>
        {timings.map((time, index) => (
          <Box 
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < timings.length - 1 ? `1px solid ${colors.primary}10` : 'none'
            }}
          >
            <Typography 
              sx={{ 
                color: colors.primaryText,
                fontWeight: time.toLowerCase().includes('open') ? 600 : 400,
                fontSize: '0.95rem'
              }}
            >
              {time}
            </Typography>
            {time.toLowerCase().includes('open 24') && (
              <Box 
                sx={{ 
                  backgroundColor: colors.success + '20',
                  color: colors.success,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}
              >
                24/7 Available
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </ContentWrapper>
  );
};

export default Timing;