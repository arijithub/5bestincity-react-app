import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import axios from 'axios';
import { Box, Card, CardMedia, Link } from '@mui/material';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { getApiUrl, ENDPOINTS, IMAGE_BASE_URL } from "../../config/apiConfigext";
import { styled } from '@mui/material/styles';
import {
  // Colors and Theme
  colors
} from '../../theme-styles';

// Updated styled components to match the reference design
const StyledSlider = styled(Slider)(({ theme }) => ({
  '.slick-list': {
    overflow: 'hidden',
  },
  '.slick-dots': {
    bottom: '16px',
    '& li': {
      margin: '0 4px',
      width: '8px',
      height: '8px',
      '& button': {
        padding: 0,
        width: '8px',
        height: '8px',
        '&:before': {
          content: '""',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#fff',
          opacity: 0.5,
          position: 'absolute',
          top: 0,
          left: 0,
        },
      },
      '&.slick-active button:before': {
        opacity: 1,
      },
    },
  },
  '.slick-prev, .slick-next': {
    display: 'none !important',
  },
}));

const CarouselContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  margin: '0 auto',
  backgroundColor: colors.app_primaryBackground,
  overflow: 'hidden',
});

const StyledCard = styled(Card)({
  position: 'relative',
  backgroundColor: 'transparent',
  boxShadow: 'none',
  width: '100%',
  height: '280px', // Fixed height for banner
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  borderRadius: '8px'
});

const StyledCardMedia = styled(CardMedia)({
  width: '98%',
  height: '100%',
  objectFit: 'cover',
  objectPosition: 'center',
});

const HeaderCarousel = () => {
  const [bannerData, setBannerData] = useState([]);

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const response = await axios.get(getApiUrl(ENDPOINTS.COLLECTIONS));
        setBannerData(response.data.bannerdata);
      } catch (error) {
        console.error('Error fetching banner data:', error);
      }
    };

    fetchBannerData();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 600,
        settings: {
          dots: true,
        },
      },
    ],
  };

  return (
    <CarouselContainer>
      <StyledSlider {...settings}>
        {bannerData.map((banner) => (
          <Box key={banner.gallery_id}>
            <StyledCard>
              <Link 
                href={banner.gallery_URL} 
                target="_blank" 
                rel="noopener"
                sx={{ 
                  display: 'block',
                  width: '100%',
                  height: '100%',
                }}
              >
                <StyledCardMedia
                  component="img"
                  image={`${banner.gallery_image}`}
                  alt={banner.gallery_name}
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              </Link>
            </StyledCard>
          </Box>
        ))}
      </StyledSlider>
    </CarouselContainer>
  );
};

export default HeaderCarousel;