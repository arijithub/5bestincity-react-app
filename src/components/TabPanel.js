import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 4px rgba(33, 150, 243, 0.3); }
  50% { box-shadow: 0 0 12px rgba(33, 150, 243, 0.5); }
  100% { box-shadow: 0 0 4px rgba(33, 150, 243, 0.3); }
`;

const StyledTabs = styled(Tabs)({
  background: '#ffffff',
  borderRadius: '25px',
  padding: '5px',
  boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
  minHeight: 'auto',
  width: 'fit-content',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  '& .MuiTabs-flexContainer': {
    justifyContent: 'center',
  }
});

const StyledTab = styled(Tab)({
  borderRadius: '20px',
  minHeight: '32px',
  padding: '6px 20px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  minWidth: '100px',
  opacity: 1,
  transition: 'all 0.3s ease',
  
  '&.Mui-selected': {
    color: '#fff',
    '&:nth-of-type(1)': {
      background: 'linear-gradient(45deg, #2196F3, #1976D2)',
      boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
      animation: `${pulseGlow} 2s infinite ease-in-out`,
    },
    '&:nth-of-type(2)': {
      background: '#E67E22',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
  },
  
  '&:not(.Mui-selected)': {
    color: '#666',
    background: 'transparent',
    '&:hover': {
      backgroundColor: '#f5f5f5',
      color: '#333',
    },
  }
});

const TabPanel = () => {
  const navigate = useNavigate();
  const [value, setValue] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 0) {
      navigate('/businesses');
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: '#f5f5f5',
        padding: '16px 0',
        display: 'flex',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}
    >
      <StyledTabs
        value={value}
        onChange={handleChange}
        aria-label="business listing tabs"
      >
        <StyledTab 
          label="All Verified" 
          value={0}
        />
        <StyledTab 
          label="Show All" 
          value={1}
        />
      </StyledTabs>
    </Box>
  );
};

export default TabPanel; 