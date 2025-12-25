import React from 'react';
import { Grid, Box, Typography } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

// Styled component for circular city image with 3D hover effects
const CityImage = styled('img')({
  width: '60px',
  height: '60px',
  borderRadius: '50%',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  loading: "lazy",
  decoding: "async",
  fetchpriority: "low",
  '&:hover': {
    transform: 'scale(1.2) rotate(5deg)',
    boxShadow: '0px 12px 30px rgba(0, 0, 0, 0.4)',
  },
  '&:active': {
    transform: 'scale(1.1)',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
  },
});

const CityList = ({ cities }) => {
  const navigate = useNavigate();

  const handleCityClick = (cityId) => {
    navigate(`/categorypage/${cityId}`);
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      {cities.map((city) => (
        <Grid item xs={3} sm={3} md={3} lg={2} key={city.city_id} style={{ textAlign: 'center' }}>
          <Box sx={{ marginBottom: 2 }} onClick={() => handleCityClick(city.city_id)} style={{ cursor: 'pointer' }}>
            <CityImage
              src={`https://5bestincity.com/images/public/country/${city.city_image}`}
              alt={city.city_name}
            />
            <Typography variant="h6" component="div" mt={2} sx={{fontSize: '12px', marginTop:'0px' }}>
              {city.city_name }
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default CityList;