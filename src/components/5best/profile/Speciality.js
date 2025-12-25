import React from 'react';
import { Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { Check } from '@mui/icons-material';
import { ContentWrapper, colors, typography } from '../../../theme-styles';

const Speciality = ({ specialities }) => (
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
      Services
    </Typography>

    <List sx={{ 
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
      gap: 2,
      padding: 0
    }}>
      {specialities.map((spec, index) => (
        <ListItem 
          key={index} 
          sx={{ 
            padding: '12px',
            backgroundColor: colors.lightBackground,
            borderRadius: '8px',
            mb: 1,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: colors.app_primary + '08'
            }
          }}
        >
          <ListItemIcon 
            sx={{ 
              minWidth: '36px'
            }}
          >
            <Check sx={{ 
              color: colors.app_primary,
              fontSize: '20px'
            }} />
          </ListItemIcon>
          <ListItemText 
            primary={spec.trim()} 
            primaryTypographyProps={{ 
              sx: {
                color: colors.primaryText,
                fontSize: '0.95rem'
              }
            }} 
          />
        </ListItem>
      ))}
    </List>
  </ContentWrapper>
);

export default Speciality;