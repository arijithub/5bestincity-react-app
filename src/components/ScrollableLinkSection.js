import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors } from '../theme-styles';

const ScrollContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  padding: '16px 0',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  '-webkit-overflow-scrolling': 'touch'
});

const LinkItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  minWidth: '100px',
  margin: '0 8px',
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)'
  }
});

const LinkTitle = styled(Typography)({
  fontSize: '11px',
  fontWeight: 'bold',
  textAlign: 'center',
  marginTop: '8px',
  color: 'rgba(0, 0, 0, 0.87)',
  width: '100%',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  WebkitLineClamp: 2,
  lineHeight: '1.2'
});

const SectionTitle = styled(Typography)({
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '12px',
  fontSize: '20px'
});

const ScrollableLinkSection = ({ title, links, onLinkClick, defaultImage }) => {
  if (!links || links.length === 0) return null;

  return (
    <Box sx={{ mt: 3, mb: 2 }}>
      <SectionTitle>{title}</SectionTitle>
      <ScrollContainer>
        {links.map((link) => (
          <LinkItem
            key={link.link_id}
            onClick={(e) => onLinkClick(e, link)}
          >
            <Avatar
              src={link.link_image}
              alt={link.link_name}
              sx={{
                width: 50,
                height: 50,
                padding: '0px',
                border: `2px solid ${colors.app_primaryBackground}`,
                bgcolor: 'transparent',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                '& .MuiAvatar-img': {
                  objectFit: 'contain',
                  width: '100%',
                  height: '100%'
                }
              }}
              imgProps={{
                onError: (e) => {
                  e.target.src = defaultImage;
                }
              }}
            />
            <LinkTitle>{link.link_name}</LinkTitle>
          </LinkItem>
        ))}
      </ScrollContainer>
    </Box>
  );
};

export default ScrollableLinkSection; 