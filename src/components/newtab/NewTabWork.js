import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container, Grid, Typography, Box, TextField, InputAdornment, IconButton, Button, InputBase, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { colors } from '../../theme-styles';
import { API_ENDPOINTS, DEFAULT_IMAGE_BASE_URL } from '../../config/apiConfigext';
import { keyframes } from '@mui/material/styles';
import { trackLinkClick, getRecentlyViewed, getMostViewed, removeFromRecentlyViewed, removeFromMostViewed } from '../../utils/linkDatabase';

// Add the glowPulse animation
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

const SearchBarWrapper = styled(Box)(({ theme, expanded, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
  borderRadius: 20,
  padding: theme.spacing(0.5, 1.5),
  backgroundColor: '#ffffff',
  flex: 1,
  height: '40px',
  marginRight: theme.spacing(1),
  position: 'relative',
  zIndex: 2,
  '&:focus-within': {
    borderColor: isActive ? '#2196f3' : colors.searchbaractiveborder,
    boxShadow: isActive ? '0 0 0 1px rgba(33, 150, 243, 0.2)' : '0 0 5px rgba(0, 123, 255, 0.5)',
  }
}));

const StyledSearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '0.875rem',
}));

const NewTabWork = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEngines, setSearchEngines] = useState([]);
  const [popularLinks, setPopularLinks] = useState([]);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [showClearButton, setShowClearButton] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const searchInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.WEB_APPS);
        setPopularLinks(Array.isArray(response.data.popular_links) ? response.data.popular_links : []);
        
        if (response.data.searchengine && response.data.searchengine.searchenginedata) {
          setSearchEngines(response.data.searchengine.searchenginedata);
          // Set default selected engines
          const defaultEngines = response.data.searchengine.searchenginedata.filter(engine => 
            engine.selected === "true"
          );
          setSelectedEngines(defaultEngines);
        }

        // Load viewed links data
        const [recent, most] = await Promise.all([
          getRecentlyViewed(),
          getMostViewed()
        ]);
        setRecentlyViewed(recent);
        setMostViewed(most);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    setShowClearButton(value !== "");
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setShowClearButton(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleSearchEngineClick = (index) => {
    setSearchEngines((prevEngines) =>
      prevEngines.map((engine, i) => {
        if (i === index) {
          return { ...engine, selected: engine.selected === 'true' ? 'false' : 'true' };
        }
        return engine;
      })
    );
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;

    const selectedEnginesList = searchEngines.filter(engine => engine.selected === 'true');
    
    if (selectedEnginesList.length === 0) return;

    if (selectedEnginesList.length === 1) {
      // If only one engine is selected, redirect directly to that search engine
      const engine = selectedEnginesList[0];
      window.location.href = `${engine.searchengineurl}${encodeURIComponent(searchTerm)}`;
    } else {
      // If multiple engines are selected
      const firstEngine = selectedEnginesList[0];
      const remainingEngines = selectedEnginesList.slice(1);
      
      // First open remaining engines in new tabs using collections protocol
      if (remainingEngines.length > 0) {
        const combinedUrls = remainingEngines
          .map(engine => `${engine.searchengineurl}${encodeURIComponent(searchTerm)}`)
          .join('/~');
        
        window.open(`collections:${combinedUrls}`, '_blank');
        
        // After opening collections, redirect current page to first search engine
        setTimeout(() => {
          window.location.href = `${firstEngine.searchengineurl}${encodeURIComponent(searchTerm)}`;
        }, 100);
      }
    }
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleSearchButtonClick = () => {
    handleSearch(searchQuery);
  };

  const handleSearchFocus = () => setIsSearchFocused(true);
  const handleSearchBlur = () => {
    if (!searchQuery) {
      setIsSearchFocused(false);
    }
  };

  const handleLinkClick = useCallback(async (link) => {
    if (isEditMode) return;

    try {
      const linkToTrack = {
        link_id: link.link_id,
        link_name: link.link_name,
        link_URL: link.link_URL,
        link_image: link.link_image,
      };

      console.log("Tracking click for:", linkToTrack);
      await trackLinkClick(linkToTrack);
      
      const [recent, most] = await Promise.all([
        getRecentlyViewed(),
        getMostViewed()
      ]);
      setRecentlyViewed(recent);
      setMostViewed(most);

         // Only append 'inapp:' if the URL doesn't already start with it
    const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
    window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error handling link click:', error);
      if (!isEditMode) {
        const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
        window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, [isEditMode]);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleRemoveFromRecently = async (linkId) => {
    try {
      await removeFromRecentlyViewed(linkId);
      setRecentlyViewed(prev => prev.filter(link => link.link_id !== linkId));
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
      const recent = await getRecentlyViewed();
      setRecentlyViewed(recent);
    }
  };

  const handleRemoveFromMost = async (linkId) => {
    try {
      await removeFromMostViewed(linkId);
      setMostViewed(prev => prev.filter(link => link.link_id !== linkId));
    } catch (error) {
      console.error('Error removing from most viewed:', error);
      const most = await getMostViewed();
      setMostViewed(most);
    }
  };

  return (
    <Container 
      sx={{ 
        backgroundColor: colors.app_primaryBackground,
        minHeight: '100vh',
        paddingTop: 3
      }}
    >
      {/* Search Bar */}
      <Box sx={{ marginBottom: 4 }}>
        <SearchBarWrapper expanded={isSearchFocused} isActive={isSearchFocused}>
          <IconButton
            onClick={handleSearchFocus}
            sx={{ padding: 0.5 }}
            aria-label="search"
          >
            <SearchIcon sx={{ color: colors.app_primaryText, fontSize: '1.25rem' }} />
          </IconButton>
          <StyledSearchInput
            placeholder="Search the web"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            inputRef={searchInputRef}
            fullWidth
          />
          {showClearButton && (
            <IconButton
              onClick={handleClearSearch}
              sx={{ padding: 0.5 }}
              aria-label="clear search"
            >
              <ClearIcon sx={{ color: colors.app_primaryText, fontSize: '1.25rem' }} />
            </IconButton>
          )}
        </SearchBarWrapper>
      </Box>

      {/* Search Engines */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={4}>
        <Box 
          display="flex" 
          justifyContent="center" 
          flexWrap="wrap" 
          gap={2}
        >
          {searchEngines.map((engine, index) => (
            <Box
              key={index}
              onClick={() => handleSearchEngineClick(index)}
              sx={{
                backgroundColor: engine.selected === 'true' ? colors.app_primary : '#E8E8E8',
                borderRadius: '50%',
                padding: '5px',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                '&::after': engine.selected === 'true' ? {
                  content: '""',
                  position: 'absolute',
                  right: -2,
                  top: -2,
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#4CAF50',
                  border: '2px solid white',
                  zIndex: 1
                } : {}
              }}
            >
              <img
                src={engine.searchengineimage}
                alt={engine.searchenginename}
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                style={{
                  width: 30,
                  height: 30,
                  opacity: engine.selected === 'true' ? 1 : 0.7,
                }}
              />
            </Box>
          ))}
        </Box>

        <Button
          variant="contained"
          onClick={handleSearchButtonClick}
          sx={{
            bgcolor: colors.app_primary,
            color: 'white',
            textTransform: 'none',
            borderRadius: '20px',
            px: 4,
            py: 1,
            fontSize: '1rem',
            '&:hover': {
              bgcolor: '#5B3FEF'
            }
          }}
        >
          SEARCH
        </Button>
      </Box>

      {/* Your Favorites */}
      {(recentlyViewed.length > 0 || mostViewed.length > 0) && (
        <Box
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: 2,
            marginBottom: 4,
            position: 'relative'
          }}
        >
          <Typography variant="h6" gutterBottom>
            Your Favorites
          </Typography>
          
          <IconButton 
            onClick={toggleEditMode}
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: colors.app_primary
            }}
            size="small"
          >
            {isEditMode ? <DoneIcon fontSize="small" /> : <EditIcon fontSize="small" />}
          </IconButton>
          
          {recentlyViewed.length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Recently Viewed
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  width: '100%',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {recentlyViewed.map((link) => (
                  <Box
                    key={`recent-${link.link_id}`}
                    onClick={isEditMode ? undefined : () => handleLinkClick(link)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isEditMode ? 'default' : 'pointer',
                      position: 'relative',
                      mr: 2,
                      flex: '0 0 auto',
                      width: '80px',
                      paddingTop: isEditMode ? '12px' : '2px',
                      '&:hover': !isEditMode ? {
                        '& img': { transform: 'scale(1.05)' },
                        '& .MuiTypography-root': { color: colors.app_primary }
                      } : {}
                    }}
                  >
                    {isEditMode && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromRecently(link.link_id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: '#fff',
                          zIndex: 1,
                          width: 20,
                          height: 20,
                          padding: 0,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 0, 0, 0.9)'
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    <Box
                      component="img"
                      src={link.link_image || DEFAULT_IMAGE_BASE_URL}
                      alt={link.link_name}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE_BASE_URL;
                      }}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        marginBottom: 1,
                        border: '2px solid #f0f0f0',
                        transition: 'transform 0.3s ease',
                        objectFit: 'contain',
                        opacity: isEditMode ? 0.7 : 1
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        maxWidth: 70,
                        width: '100%',
                        textAlign: 'center',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {link.link_name.length > 10 ? `${link.link_name.substring(0, 10)}...` : link.link_name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {mostViewed.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Most Viewed
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  width: '100%',
                  pb: 1,
                  '&::-webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {mostViewed.map((link) => (
                  <Box
                    key={`most-${link.link_id}`}
                    onClick={isEditMode ? undefined : () => handleLinkClick(link)}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: isEditMode ? 'default' : 'pointer',
                      position: 'relative',
                      mr: 2,
                      flex: '0 0 auto',
                      width: '80px',
                      paddingTop: isEditMode ? '12px' : '2px',
                      '&:hover': !isEditMode ? {
                        '& img': { transform: 'scale(1.05)' },
                        '& .MuiTypography-root': { color: colors.app_primary }
                      } : {}
                    }}
                  >
                    {isEditMode && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromMost(link.link_id);
                        }}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 0, 0, 0.7)',
                          color: '#fff',
                          zIndex: 1,
                          width: 20,
                          height: 20,
                          padding: 0,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 0, 0, 0.9)'
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                    <Box
                      component="img"
                      src={link.link_image || DEFAULT_IMAGE_BASE_URL}
                      alt={link.link_name}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_IMAGE_BASE_URL;
                      }}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        marginBottom: 1,
                        border: '2px solid #f0f0f0',
                        transition: 'transform 0.3s ease',
                        objectFit: 'contain',
                        opacity: isEditMode ? 0.7 : 1
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      noWrap 
                      sx={{ 
                        maxWidth: 70,
                        width: '100%',
                        textAlign: 'center',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {link.link_name.length > 10 ? `${link.link_name.substring(0, 10)}...` : link.link_name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Popular Links */}
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: 2,
          marginBottom: 4,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Popular
        </Typography>

        <Grid container spacing={2} alignItems="center">
          {popularLinks.map((link, index) => (
            <Grid item xs={3} key={index}>
              <Box
                onClick={() => handleLinkClick(link)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    '& img': { transform: 'scale(1.05)' },
                    '& .MuiTypography-root': { color: colors.app_primary }
                  }
                }}
              >
                <Box
                  component="img"
                  src={link.link_image}
                  alt={link.link_name}
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = DEFAULT_IMAGE_BASE_URL;
                  }}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    marginBottom: 1,
                    border: '2px solid #f0f0f0',
                    transition: 'transform 0.3s ease',
                    objectFit: 'contain'
                  }}
                />
                <Typography 
                  variant="body2" 
                  noWrap 
                  sx={{ 
                    maxWidth: 70,
                    transition: 'color 0.3s ease'
                  }}
                >
                  {link.link_name.length > 10 ? `${link.link_name.substring(0, 10)}...` : link.link_name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

      </Box>
    </Container>
  );
};

export default NewTabWork; 