import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { TextField, IconButton, InputAdornment, Box, Typography, Grid, Button, CircularProgress, Tabs, Tab } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CityList from './components/5best/CityList';
import CityDataList from './components/5best/CityDataList';
import axios from 'axios';
import FooterComponent from './FooterComponent';
import { ENDPOINTS, getApiUrl, SEARCH_ENGINE_IMAGE_BASE_URL } from './config/apiConfig'; // Import API configuration
import './styles/master.css';
import './styles/custom-styles.css';
import { colors } from './theme-styles';
import debounce from 'lodash/debounce';
import memoize from 'lodash/memoize';
import { keyframes, css } from '@emotion/react';
import { styled } from '@mui/material/styles';
import MetaData from './components/MetaData';
import { useLocation, useNavigate } from 'react-router-dom';


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

const GlowingIconButton = styled(IconButton)`
  margin: 4px;
  border-radius: 50%;
  background-color: ${(props) => (props.selected ? colors.app_primary : '#ccc')};
  min-width: 50px;
  min-height: 50px;
  width: 50px;
  height: 50px;
  padding: 0;
  position: relative;
  animation: ${css`${glowPulse} 2s infinite ease-in-out`};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.selected ? colors.app_primary : '#aaa')};
    transform: scale(1.05);
  }

  img {
    width: 40px;
    height: 40px;
    position: relative;
    z-index: 1;
  }
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
      background: '#cf5f39',
      boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)',
      animation: `${glowPulse} 2s infinite ease-in-out`,
    },
    '&:nth-of-type(2)': {
      background: '#cf5f39',
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

const CityPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [countryName, setCountryName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [cityDataAll, setCityDataAll] = useState([]);
  const [searchEngines, setSearchEngines] = useState([]);
  const [showSearchEngines, setShowSearchEngines] = useState(false);
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [isHandlingBack, setIsHandlingBack] = useState(false);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(true);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const [tabValue, setTabValue] = useState(1); // Default to "Show All"

  const searchRef = useRef(null);
  const topCitiesRef = useRef(null);
  const searchResultsRef = useRef(null);
  
  useEffect(() => {
    if (!isLoading && !hasRestoredScroll) {
      let scrollPosition = null;

      // First try to get position from location state
      if (location.state?.fromCityPage && location.state?.scrollPosition) {
        scrollPosition = location.state.scrollPosition;
      }
      // Fallback to sessionStorage
      else {
        const storedPosition = sessionStorage.getItem('cityScrollPosition');
        if (storedPosition) {
          scrollPosition = parseInt(storedPosition, 10);
        }
      }

      if (scrollPosition !== null) {
        // Use requestAnimationFrame for more reliable scroll restoration
        requestAnimationFrame(() => {
          window.scrollTo({
            top: scrollPosition,
            behavior: 'instant'
          });
          
          // Clear the stored position after restoration
          sessionStorage.removeItem('cityScrollPosition');
          setHasRestoredScroll(true);
        });
      }
    }
  }, [isLoading, location.state, hasRestoredScroll]);
  
  useEffect(() => {
    const handlePopState = () => {
      setHasRestoredScroll(false);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (!window.location.pathname.includes('/categorypage')) {
        sessionStorage.removeItem('cityScrollData');
      }
    };
  }, []);
  
  useEffect(() => {
    const fetchCities = async () => {
      try {
       // setIsLoading(true);
        const url = getApiUrl(ENDPOINTS.CITY, 'cid=1'); // Use the CITY endpoint
        const response = await axios.get(url);
        const data = response.data;

        setCountryName(data.country_name);
        setCities(data.topcities);
        setFilteredCities(data.citydataall);
        setCityDataAll(data.citydataall);

        const initializedEngines = data.searchengine.searchenginedata.map(engine => ({
          ...engine,
          selected: engine.selected === "true"
        }));
        setSearchEngines(initializedEngines);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCities();

    const handleScroll = () => {
      if (searchRef.current && topCitiesRef.current && !isSearchClicked) {
        const searchRect = searchRef.current.getBoundingClientRect();
        const topCitiesRect = topCitiesRef.current.getBoundingClientRect();
        
        if (topCitiesRect.bottom <= 0) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSearchClicked]);

  const cityDataLookup = useMemo(() => {
    return cityDataAll.reduce((acc, city) => {
      acc[city.city_name.toLowerCase()] = true;
      if (city.related_keywords) {
        city.related_keywords.toLowerCase().split(',').forEach(keyword => {
          acc[keyword.trim()] = true;
        });
      }
      return acc;
    }, {});
  }, [cityDataAll]);

  // Create an optimized search index when cityDataAll changes
  const searchIndex = useMemo(() => {
    const index = new Map();
    cityDataAll.forEach((city, idx) => {
      // Index the city name
      const cityNameLower = city.city_name.toLowerCase();
      index.set(cityNameLower, idx);

      // Index each keyword
      if (city.related_keywords) {
        city.related_keywords.toLowerCase().split(',').forEach(keyword => {
          const trimmedKeyword = keyword.trim();
          if (!index.has(trimmedKeyword)) {
            index.set(trimmedKeyword, idx);
          }
        });
      }
    });
    return index;
  }, [cityDataAll]);

  // Memoized function to get matching cities
  const getMatchingCities = useMemo(() => 
    memoize((searchTerm, cities, index) => {
      if (!searchTerm) return cities;

      const term = searchTerm.toLowerCase();
      const matchedIndices = new Set();

      // First check exact matches
      index.forEach((idx, key) => {
        if (key === term) {
          matchedIndices.add(idx);
        }
      });

      // Then check partial matches if no exact matches found
      if (matchedIndices.size === 0) {
        index.forEach((idx, key) => {
          if (key.includes(term)) {
            matchedIndices.add(idx);
          }
        });
      }

      return Array.from(matchedIndices).map(idx => cities[idx]);
    }),
    []
  );

  // Optimized search handler with debouncing
  const handleSearchTermChange = useCallback((term) => {
	  if (isHandlingBack) {
    setIsHandlingBack(false);
    return;
  }  
	  
    setSearchTerm(term);
	
	// Update URL for non-empty searches
  if (term.trim()) {
    window.history.pushState({ search: term }, '', `?q=${encodeURIComponent(term)}`);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
    
    if (term === '') {
      setFilteredCities(cityDataAll);
      setShowSearchEngines(false);
      return;
    }

    const results = getMatchingCities(term, cityDataAll, searchIndex);
    setFilteredCities(results);
    setShowSearchEngines(results.length === 0);

    // Always scroll to top when search results change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [cityDataAll, searchIndex, getMatchingCities, isHandlingBack]);

  // Update handleSearchFocus function
  const handleSearchFocus = useCallback(() => {
    setIsSearchClicked(true);
    // Hide tab panel immediately when search is focused
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Clean up memoized function on unmount
  useEffect(() => {
    return () => {
      getMatchingCities.cache.clear();
    };
  }, [getMatchingCities]);

  const handleClear = () => {
	  
	   // Clear URL state
  window.history.replaceState(null, '', window.location.pathname);
  
		  setSearchTerm('');
		  setFilteredCities(cityDataAll);
		  setIsSearchClicked(false);
		  setIsSticky(false);
		  
		  // Scroll back to the top of the page
		  window.scrollTo({
			top: 0,
			behavior: 'smooth'
		  });
		};

const handleSearch = useCallback(() => {
    let searchUrls = '';
    searchEngines.forEach(engine => {
      if (engine.selected) {
        // Remove the trailing slash and concatenate with tilde
        searchUrls += `${engine.searchengineurl}${searchTerm}/~`;
      }
    });
    if (searchUrls) {
      const finalUrls = searchUrls.slice(0, -1);  // Remove the last tilde
      window.open('collections:'+finalUrls, '_blank');
    }
}, [searchEngines, searchTerm]);

  const toggleEngineSelection = useCallback((clickedEngine) => {
    setSearchEngines(
      searchEngines.map(engine =>
        engine.searchenginename === clickedEngine
          ? { ...engine, selected: !engine.selected }
          : engine
      )
    );
  }, [searchEngines]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }, [handleSearch]);
  
useEffect(() => {
  const handleBackButton = (event) => {
    if (searchTerm) {
      event.preventDefault();
      
      // Batch all state updates
      Promise.resolve().then(() => {
        // Clear URL immediately
        window.history.replaceState(null, '', window.location.pathname);
        
        // Reset all states synchronously
        setSearchTerm('');
        setFilteredCities(cityDataAll);
        setIsSearchClicked(false);
        setIsSticky(false);
        setShowSearchEngines(false);
        
        // Scroll back to top immediately
        window.scrollTo({
          top: 0,
          behavior: 'instant'
        });
      });
    }
  };

  window.addEventListener('popstate', handleBackButton);
  return () => window.removeEventListener('popstate', handleBackButton);
}, [searchTerm, cityDataAll]);


// Add this useEffect near your other useEffect hooks
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('q');
  
  if (initialSearch) {
    setSearchTerm(initialSearch);
    setIsSearchClicked(true);
    const results = getMatchingCities(initialSearch, cityDataAll, searchIndex);
    setFilteredCities(results);
    setShowSearchEngines(results.length === 0);
  }
}, [cityDataAll, searchIndex, getMatchingCities]);

const handleTabChange = (event, newValue) => {
  setTabValue(newValue);
  if (newValue === 0) {
    navigate('/businesses');
  }
};

useEffect(() => {
  // Update tab value based on current route
  setTabValue(location.pathname === '/businesses' ? 0 : 1);
}, [location.pathname]);

  return (
    <Box
      sx={{
        padding: '16px 24px',
        background: colors.app_primaryBackground,
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <MetaData component="CityPage" />

      {/* Tab Panel - Hide when search is clicked */}
      {!isSearchClicked && (
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
            marginTop: '10px',
          }}
        >
          <StyledTabs
            value={tabValue}
            onChange={handleTabChange}
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
      )}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="calc(100vh - 100px)">
          <CircularProgress sx={{ color: colors.app_primary }} />
        </Box>
      ) : (
        <>
          <Box ref={topCitiesRef} sx={{
              width: '100%',
              maxWidth: '1200px',
              position: 'relative',
              zIndex: 1,
              backgroundColor: colors.app_primaryBackground,
              marginBottom: '20px'
            }}>
            {!isSearchClicked && (
              <>
                <Typography
                  variant="h5"
                  className="page-title"
                  component="div"
                  textAlign="center"
                  gutterBottom
                  sx={{ paddingBottom: '20px' }}
                >
                  Top cities in {countryName}
                </Typography>

                <Box sx={{
                    position: 'relative',
                    zIndex: 1,
                    backgroundColor: colors.app_primaryBackground,
                    marginBottom: '20px'
                  }}>
                  <CityList cities={cities} />
                </Box>
              </>
            )}
          </Box>

          <Box sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <Box
              ref={searchRef}
              sx={{
                position: isSticky || isSearchClicked ? 'fixed' : 'relative',
                top: 0, // Always stick to the very top when fixed
                left: 0,
                right: 0,
                zIndex: 1100,
                backgroundColor: isSticky || isSearchClicked ? colors.app_primaryBackground : 'transparent',
                padding: (isSticky || isSearchClicked) ? '10px 15px' : '0px',
                transition: 'all 0.3s ease',
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                boxShadow: isSticky || isSearchClicked ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <TextField
                fullWidth
                placeholder="Search..." 
                value={searchTerm} 
                onFocus={handleSearchFocus}
                onChange={(e) => handleSearchTermChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="search-field"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon style={{ 
                        color: '#888', 
                        width: '18px', 
                        height: '18px',
                        marginLeft: '12px' 
                      }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClear} size="small">
                        <CloseIcon style={{ width: '16px', height: '16px', color: '#888' }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    height: '40px',
                    border: '1px solid transparent',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused': {
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                    '& input': {
                      padding: '8px 4px',
                      fontSize: '14px',
                      '&::placeholder': {
                        color: '#888',
                        opacity: 1,
                      }
                    },
                    '& .MuiInputAdornment-root': {
                      marginLeft: '4px',
                      marginRight: '8px',
                      height: '100%',
                    }
                  },
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.05))',
                  transition: 'all 0.2s ease',
                  marginTop: !(isSticky || isSearchClicked) ? '10px' : '0',
                }}
              />
            </Box>

            <Box
              ref={searchResultsRef}
              sx={{
                paddingTop: isSticky || isSearchClicked ? '50px' : '0', // Reduced padding
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto',
                marginTop: !(isSticky || isSearchClicked) ? '20px' : '0',
              }}
            >
              {searchTerm ? (
                <>
                {filteredCities.length === 0 ? (
                  <Box textAlign="center" mt={4}>
                    <Typography color="error" variant="h6">No cities to show</Typography>
                    <Grid container justifyContent="center" spacing={2} mt={2}>
                        {searchEngines.map((engine) => (
                          <Grid item key={engine.searchenginename}>
                            <IconButton
                              onClick={() => toggleEngineSelection(engine.searchenginename)}
                              sx={{
                                backgroundColor: engine.selected ? colors.app_primary : '#ccc',
                                borderRadius: '50%',
                                width: '50px',
                                height: '50px',
                                position: 'relative',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: engine.selected ? colors.app_primary : '#aaa',
                                  transform: 'scale(1.05)',
                                },
                              }}
                            >
                              <img
                                src={`${SEARCH_ENGINE_IMAGE_BASE_URL}${engine.searchengineimage.replace('../', '')}`}
                                alt={engine.searchenginename}
                                loading="lazy"
                                decoding="async"
                                fetchpriority="low"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  position: 'relative',
                                  zIndex: 1
                                }}
                              />
                            </IconButton>
                          </Grid>
                        ))}
                      </Grid>
                      <Button
                        variant="outlined"
                        onClick={handleSearch}
                        sx={{
                          marginTop: 2,
                          backgroundColor: colors.app_primary,
                          color: '#FFFFFF',
                          borderRadius: '20px',
                          '&:hover': {
                            backgroundColor: colors.app_primary,
                            opacity: 0.9
                          },
                        }}
                      >
                        Search
                      </Button>
                  </Box>
                ) : (
                  <CityDataList cityDataAll={filteredCities} />
                )}
                </>
              ) : (
                 <CityDataList cityDataAll={cityDataAll} />
              )}
            </Box>
          </Box>
        </>
      )}
      <FooterComponent />
    </Box>
  );
};

export default CityPage;