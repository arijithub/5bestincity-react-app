import React, { useState } from 'react';
import { Box, Typography, Avatar, Paper, IconButton, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../theme-styles';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { 
  removeFromRecentlyViewed, 
  removeFromMostViewed,
  getRecentlyViewed,
  getMostViewed
} from '../utils/linkDatabase';
import { DEFAULT_IMAGE_BASE_URL } from '../config/apiConfigext';

const ScrollContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '2px 0',
  position: 'relative',
  width: '100%',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '& > *': {
    flex: '0 0 auto',
    marginRight: '12px',
    width: '80px'
  }
});

const LinkItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  padding: '2px',
  '&:hover': {
    transform: 'scale(1.05)'
  }
});

const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '12px',
  fontSize: '20px',
  textAlign: 'center'
});

// Reusable Link Item component for Favorites
const FavoriteLinkItem = ({ link, isEditMode, onRemove, onClick, defaultImage }) => (
  <Box
    onClick={isEditMode ? undefined : () => onClick(link)}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      cursor: isEditMode ? 'default' : 'pointer',
      position: 'relative',
      width: '80px',
      flex: '0 0 auto',
      marginRight: '12px',
      paddingTop: isEditMode ? '12px' : '2px',
      '&:hover': !isEditMode ? {
        '& img': { transform: 'scale(1.05)' },
        '& .MuiTypography-root': { color: colors.app_primary }
      } : {}
    }}
  >
    {isEditMode && (
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation(); // Prevent link click
          onRemove(link.link_id);
        }}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          color: '#fff',
          zIndex: 1,
          width: 20,
          height: 20,
          padding: 0,
          '&:hover': {
            backgroundColor: 'rgba(255, 0, 0, 0.9)',
          }
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    )}
    <Box
      component="img"
      src={link.link_image || defaultImage}
      alt={link.link_name}
      loading="lazy"
      decoding="async"
      fetchpriority="low"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = defaultImage;
      }}
      sx={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        marginBottom: 1,
        border: '2px solid #f0f0f0',
        transition: 'transform 0.3s ease',
        objectFit: 'contain',
        opacity: isEditMode ? 0.7 : 1
      }}
    />
    <Typography
      variant="body2"
      noWrap
      sx={{
        maxWidth: 70,
        width: '100%',
        textAlign: 'center',
        transition: 'color 0.3s ease'
      }}
    >
      {link.link_name?.length > 10 ? `${link.link_name.substring(0, 10)}...` : link.link_name}
    </Typography>
  </Box>
);

const ViewedLinksSection = ({ 
  recentlyViewed, 
  mostViewed, 
  onLinkClick, 
  defaultImage = DEFAULT_IMAGE_BASE_URL,
  isEditMode,
  onToggleEdit,
  onRemoveRecently,
  onRemoveMost
}) => {
  if (recentlyViewed.length === 0 && mostViewed.length === 0) {
    return null; // Don't render if both are empty
  }

  return (
    <Paper 
      elevation={1}
      sx={{ 
        p: 1.5, 
        mb: 3, 
        backgroundColor: '#fff',
        borderRadius: '10px'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        mb: 0.5,
        position: 'relative'
      }}>
        <SectionTitle>Your Favorites</SectionTitle>
        <IconButton 
          onClick={onToggleEdit}
          sx={{ 
            color: colors.app_primary,
            position: 'absolute',
            right: 0,
            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          {isEditMode ? <DoneIcon /> : <EditIcon />}
        </IconButton>
      </Box>

      {recentlyViewed.length > 0 && (
        <Box mb={2}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Recently Viewed
          </Typography>
          <ScrollContainer>
            {recentlyViewed.map((link) => (
              <FavoriteLinkItem
                key={`recent-${link.link_id}`}
                link={link}
                isEditMode={isEditMode}
                onRemove={onRemoveRecently}
                onClick={onLinkClick}
                defaultImage={defaultImage}
              />
            ))}
          </ScrollContainer>
        </Box>
      )}

      {mostViewed.length > 0 && (
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Most Viewed
          </Typography>
          <ScrollContainer>
            {mostViewed.map((link) => (
              <FavoriteLinkItem
                key={`most-${link.link_id}`}
                link={link}
                isEditMode={isEditMode}
                onRemove={onRemoveMost}
                onClick={onLinkClick}
                defaultImage={defaultImage}
              />
            ))}
          </ScrollContainer>
        </Box>
      )}
    </Paper>
  );
};

export default ViewedLinksSection; 