import React from 'react';
import Slider from 'react-slick';
import { Card, CardMedia, Box, GlobalStyles } from '@mui/material';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../styles/custom-styles.css';

const Banner = ({ banners }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden',  marginTop: 6,  position: 'relative' }}>
      {/* Inject global styles to target slick dots */}
      <GlobalStyles styles={{
        '.slick-dots li button:before': {
          fontSize: '12px',          // Increase dot size
          color: 'white',            // Dot color
          opacity: 0.75,             // Dot opacity
        },
        '.slick-dots li.slick-active button:before': {
          color: 'white',            // Active dot color
          opacity: 1,                // Active dot opacity
        },
        '.slick-dots': {
          bottom: '10px',            // Position dots above the bottom edge
        }
      }} />
      <Slider {...settings}>
        {banners.map((banner, index) => (
          <div key={index}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 'none',
                overflow: 'hidden',
                cursor: 'pointer',
                background: 'transparent',
              }}
              onClick={() => window.location.href = banner.gallery_URL}
            >
              <CardMedia
                component="img"
                image={banner.gallery_image}
                alt={banner.gallery_name}
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: { xs: '300px', sm: '400px', md: '500px' },
                  display: 'block',
                  objectFit: 'contain',
                }}
              />
            </Card>
          </div>
        ))}
      </Slider>
    </Box>
  );
};

export default Banner;
