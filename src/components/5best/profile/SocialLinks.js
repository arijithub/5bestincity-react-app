import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { Email, Facebook, Twitter, LinkedIn, YouTube, Language, Phone, WhatsApp, ChevronRight } from '@mui/icons-material';

const SocialLinks = ({ email, facebook, twitter, linkedin, youtube, website, phone, whatsapp }) => {
  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#fff',
    marginBottom: '10px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textDecoration: 'none',
    color: 'inherit',
  };

  const iconStyle = {
    marginRight: '10px',
  };

  const detailStyle = {
    fontSize: '0.875rem',
    color: '#666',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  };

  const formatUrl = (url, isWebsite = false) => {
    if (isWebsite) return url;
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.slice(1);
    } catch {
      return url;
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 0, mb: 3, borderRadius: '12px', backgroundColor: 'transparent' }}>
      {phone && (
        <a href={`tel:${phone}`} style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Phone sx={{ color: '#4CAF50', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Phone</Typography>
              <Typography variant="body2" sx={detailStyle}>{phone}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {whatsapp && (
        <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WhatsApp sx={{ color: '#25D366', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>WhatsApp</Typography>
              <Typography variant="body2" sx={detailStyle}>{whatsapp}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Email sx={{ color: '#D44638', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Email</Typography>
              <Typography variant="body2" sx={detailStyle}>{email}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {facebook && (
        <a href={facebook} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Facebook sx={{ color: '#3b5998', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Facebook</Typography>
              <Typography variant="body2" sx={detailStyle}>{formatUrl(facebook)}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {twitter && (
        <a href={twitter} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Twitter sx={{ color: '#1DA1F2', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Twitter</Typography>
              <Typography variant="body2" sx={detailStyle}>{formatUrl(twitter)}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {linkedin && (
        <a href={linkedin} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LinkedIn sx={{ color: '#0077b5', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>LinkedIn</Typography>
              <Typography variant="body2" sx={detailStyle}>{formatUrl(linkedin)}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {youtube && (
        <a href={youtube} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <YouTube sx={{ color: '#FF0000', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>YouTube</Typography>
              <Typography variant="body2" sx={detailStyle}>{formatUrl(youtube)}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Language sx={{ color: '#4CAF50', ...iconStyle }} />
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Website</Typography>
              <Typography variant="body2" sx={detailStyle}>{formatUrl(website, true)}</Typography>
            </Box>
          </Box>
          <ChevronRight />
        </a>
      )}
    </Paper>
  );
};

export default SocialLinks; 