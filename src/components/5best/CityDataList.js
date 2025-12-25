import React, { useCallback } from 'react';
import { Box, Typography, List, ListItem, Avatar, ListItemText } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';

// Styled component for the list item with enhanced effects
const StyledListItem = styled(ListItem)({
  borderRadius: '12px',
  marginBottom: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  padding: '12px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
});

// Adding ripple effect
const RippleEffect = styled('span')({
  position: 'absolute',
  borderRadius: '50%',
  transform: 'scale(0)',
  animation: 'ripple 0.6s linear',
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  '@keyframes ripple': {
    to: {
      transform: 'scale(4)',
      opacity: 0,
    },
  },
});

const CityDataList = ({ cityDataAll }) => {
  const navigate = useNavigate();

const handleClick = useCallback((e, cityId) => {
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Store in sessionStorage as backup
  sessionStorage.setItem('cityScrollPosition', scrollPosition.toString());
  
  // Navigate with state
  navigate(`/categorypage/${cityId}`, {
    state: { fromCityPage: true, scrollPosition }
  });

  // Create ripple effect
  const rippleSpan = document.createElement('span');
  const diameter = Math.max(e.target.clientWidth, e.target.clientHeight);
  const radius = diameter / 2;
  rippleSpan.style.width = rippleSpan.style.height = `${diameter}px`;
  rippleSpan.style.left = `${e.clientX - e.target.offsetLeft - radius}px`;
  rippleSpan.style.top = `${e.clientY - e.target.offsetTop - radius}px`;

  const rippleContainer = e.currentTarget.querySelector('.ripple-container');
  if (rippleContainer) {
    rippleContainer.appendChild(rippleSpan);
    setTimeout(() => {
      rippleSpan.remove();
    }, 300);
  }
}, [navigate]);

  return (
    <Box sx={{ marginTop: 4 }}>
      <List>
        {cityDataAll.map((city) => (
          <StyledListItem key={city.city_id} onClick={(e) => handleClick(e, city.city_id)} sx={{ padding: '4px 12px' }} className="city-item">
            <Avatar
              src={`https://5bestincity.com/images/public/country/${city.city_image}`}
              alt={city.city_name}
              sx={{ width: 50, height: 50, marginRight: 2 }}
              imgProps={{
                loading: "lazy",
                decoding: "async",
                fetchpriority: "low"
              }}
            />
            <ListItemText
              primary={
                <Typography variant="h6" sx={{ fontSize: '13px', fontWeight: 'bold' }}>
                  {city.city_name}
                </Typography>
              }
              secondary={
                <Typography sx={{ fontSize: '11px', fontWeight: 'normal', color: '#979797' }}>
                  {city.state_name}
                </Typography>
              }
            />
            <span className="ripple-container" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', borderRadius: '12px' }} />
          </StyledListItem>
        ))}
      </List>
    </Box>
  );
};

export default React.memo(CityDataList);