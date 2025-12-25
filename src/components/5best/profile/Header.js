import React, { useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { colors } from '../../../theme-styles';



const Header = ({ images, badges }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  
   const validImages = images?.filter(img => img && img.trim() !== '') || [];

  const hasMultipleImages = validImages.length > 1;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    beforeChange: (current, next) => {
      setCurrentSlide(next);
      setLoading(true);
    },
    afterChange: (current) => {
      setLoading(false);
    },
    customPaging: (i) => (
      <div
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: i === currentSlide ? colors.primary : colors.alternate,
          transition: 'all 0.3s ease',
          margin: '0 5px',
		  display: hasMultipleImages ? 'block' : 'none'
        }}
      />
    ),
  };

  return (
    <Box sx={{ 
      position: 'relative', 
      mb: 4,
      '& .slick-slider': {
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      },
      '& .slick-dots': {
        bottom: '16px',

        display: hasMultipleImages ? 'block !important' : 'none !important'

      },

      '& .slick-arrow': {

        display: hasMultipleImages ? 'block !important' : 'none !important'
      }
    }}>
       {validImages.length > 0 ? (

        validImages.length === 1 ? (
          <img 
            src={images[0]} 
            alt="Business Image" 
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            style={{ 
              width: '100%', 
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '16px'
            }} 
          />
        ) : (
          <Slider {...settings}>
              {validImages.map((image, index) => (
              <div key={index}>
                <img 
                  src={image} 
                  alt={`Business Image ${index + 1}`} 
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    objectFit: 'cover'
                  }} 
                />
              </div>
            ))}
          </Slider>
        )
      ) : (
        <Box 
          sx={{ 
            width: '100%', 
            height: 'auto',
            backgroundColor: colors.alternate,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px'
          }}
        />
      )}
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <CircularProgress size={30} sx={{ color: colors.primary }} />
        </Box>
      )}
	  
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 2, 
        position: 'absolute', 
        bottom: -50, 
        left: 0, 
        right: 0 
      }}>
        {badges && badges.map((badge, index) => (
          <img 
            key={index}
            src={badge.badge_url} 
            alt={badge.badge_icon} 
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'contain',
              margin: '0 8px'
            }} 
          />
        ))}
      </Box>
    </Box>
  );
};

export default Header;