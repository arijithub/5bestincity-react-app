import React, { memo } from 'react';

// Memoize the component to prevent unnecessary re-renders

import { Box, Card, CardMedia } from '@mui/material';
import Carousel from 'react-material-ui-carousel';

const ProductsBanner = ({ banners }) => {
  if (!banners || banners.length === 0) return null;

  return (
    <Box 
      sx={{ 
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        marginTop: { xs: '60px', sm: '70px' },
        marginBottom: '16px',
        padding: '0 8px',
      }}
    >
      <Carousel
        animation="slide"
        autoPlay={true}
        indicators={true}
        navButtonsAlwaysInvisible={false}
        navButtonsProps={{
          style: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            color: '#000',
            borderRadius: '50%',
            padding: '8px',
          }
        }}
        indicatorContainerProps={{
          style: {
            position: 'absolute',
            bottom: '16px',
            zIndex: 1,
          }
        }}
        indicatorIconButtonProps={{
          style: {
            color: 'rgba(255, 255, 255, 0.6)',
          }
        }}
        activeIndicatorIconButtonProps={{
          style: {
            color: '#fff',
          }
        }}
      >
        {banners.map((banner, index) => (
          <Card
            key={banner.gallery_id || index}
            sx={{
              boxShadow: 'none',
              borderRadius: '12px',
              overflow: 'hidden',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={() => window.open(banner.gallery_URL, '_blank')}
          >
            <CardMedia
              component="img"
              image={banner.gallery_image}
              alt={banner.gallery_name || `Banner ${index + 1}`}
              loading="lazy"
              decoding="async"
              fetchpriority="low"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '100%',
                objectFit: 'cover',
                borderRadius: '12px',
              }}
            />
          </Card>
        ))}
      </Carousel>
    </Box>
  );
};

export default ProductsBanner;