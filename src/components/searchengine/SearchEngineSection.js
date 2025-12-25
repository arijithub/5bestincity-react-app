// SearchEngineSection.js

import React from 'react';
import { Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import {
  colors
} from '../../theme-styles';
import { IMAGE_BASE_URL } from '../../config/apiConfigext';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import { keyframes } from '@mui/material/styles';

const glowPulse = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.5),
                0 0 10px rgba(33, 150, 243, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(33, 150, 243, 0.8),
                0 0 30px rgba(33, 150, 243, 0.5);
  }
  100% {
    box-shadow: 0 0 5px rgba(33, 150, 243, 0.5),
                0 0 10px rgba(33, 150, 243, 0.3);
  }
`;

const getEngineImage = (engineImage) => {
	
  return engineImage;
};

const SearchEngineSection = ({ 
  onSearch, 
  onClick, 
  isSticky, 
  onKeyDown, 
  searchEngines, 
  onEngineSelect, 
  showEngines, // Prop that indicates whether the search button should show
  searchValue,
  onClear
}) => {
  const handleSearch = (event) => {
    const newValue = event.target.value;
    onSearch(newValue);
  };

  const handleClear = () => {
    onClear();
  };

  const handleEngineClick = (engine) => {
    onEngineSelect(engine);
  };
  
  const handleInputFocus = () => {
  onClick(); // This will call handleSearchClick in the parent component
};

  const handleSearchButtonClick = () => {
    let query = searchValue.trim();
    if (query) {
      let searchUrls = searchEngines
        .filter(engine => engine.selected)
        .map(engine => `${engine.searchengineurl}${query}`)
        .join('/~');
      if (searchUrls) {
        window.open('collections:'+searchUrls, '_blank');
      }
    }
  };

  return (
    <Box
      onClick={onClick} 
      className='category-search-box'
      sx={{
        display: 'flex',
        marginLeft: '0px',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isSticky ? '12px 16px 8px' : 2,
        mb: isSticky ? 0 : 4,
        position: isSticky ? 'fixed' : 'relative',
        top: isSticky ? 0 : 'auto',
        zIndex: isSticky ? 1100 : 'auto',
        width: '100%', 
        transition: 'all 0.2s ease-out',
        left: isSticky ? '0' : 'auto',
        right: isSticky ? '0' : 'auto',
        background: colors.app_primaryBackground,
      }}
    >
      <TextField
      className='category-search-textfield'
        fullWidth
        placeholder="Search..."
        variant="outlined"
        value={searchValue}
        onChange={handleSearch}
        onKeyDown={onKeyDown}
		 onFocus={handleInputFocus} 
        sx={{
          backgroundColor: colors.app_secondaryBackground,
          borderRadius: '50px',
          maxWidth: isSticky ? '95%' : 500,
          '& .MuiOutlinedInput-root': {
            borderRadius: '50px',
            padding: '5px 15px',
            transition: 'all 0.3s ease-in-out',
            height: '40px',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: colors.searchbaractiveborder,
            boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
			 borderWidth: '0.5px',
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchValue && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end" size="small">
                <CloseIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      {showEngines && (
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
          {searchEngines.map((engine) => (
            <Button
              key={engine.searchenginename}
              onClick={() => handleEngineClick(engine)}
              sx={{
                margin: '4px',
                borderRadius: '50%',
                backgroundColor: engine.selected ? colors.app_primary : '#ccc',
                color: 'white',
                minWidth: '50px',
                minHeight: '50px',
                width: '50px',
                height: '50px',
                padding: '0',
                position: 'relative',
                animation: `${glowPulse} 2s infinite ease-in-out`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: engine.selected ? colors.app_primary : '#aaa',
                  transform: 'scale(1.05)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: '50%',
                  background: 'transparent',
                  zIndex: -1,
                }
              }}
            >
              <img 
                src={getEngineImage(engine.searchengineimage)} 
                alt={engine.searchenginename} 
                style={{ 
                  width: '60%', 
                  height: '60%',
                  position: 'relative',
                  zIndex: 1
                }} 
              />
            </Button>
          ))}
        </Box>
      )}

      {/* Conditionally show the Search button */}
      {showEngines && (
  
		<Button
		  variant="contained"
		  onClick={handleSearchButtonClick}
		  sx={{
			  mt:3,
			backgroundColor: colors.app_primary,       // Set the button background color
			color: '#FFFFFF',                      // Ensure the text color contrasts well with accent2
			borderRadius: '20px',
			'&:hover': {
			  backgroundColor: colors.app_primary,     // Maintain accent2 color on hover
			  opacity: 0.9                         // Slightly decrease opacity for hover effect
			},
		  }}
		>
		  Search
		</Button>
      )}
    </Box>
  );
};

export default SearchEngineSection;