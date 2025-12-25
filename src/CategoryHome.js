import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FooterComponent from './FooterComponent';
import {
  Container,
  Typography,
  TextField,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  InputAdornment,
  useTheme,
  alpha,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import {
  ENDPOINTS,
  getApiUrl,
  SEARCH_ENGINE_IMAGE_BASE_URL,
  CATEGORY_IMAGE_BASE_URL, // Import the constant
} from './config/apiConfig';

import './styles/master.css';
import './styles/custom-styles.css';
import { colors } from './theme-styles';
import { keyframes } from '@emotion/react';
import MetaData from './components/MetaData';

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

function CategoryPage() {
  const { cityId } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cityInfo, setCityInfo] = useState(null);
  const [searchEngines, setSearchEngines] = useState([]);
  const [activeEngines, setActiveEngines] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHandlingBack, setIsHandlingBack] = useState(false);

  const theme = useTheme();
  const searchRef = useRef(null);
  const headingRef = useRef(null);
  const resultsRef = useRef(null);
  
  useEffect(() => {
  const handlePopState = () => {
    const navigationHistory = sessionStorage.getItem('navigationHistory');
    const lastPosition = sessionStorage.getItem('lastCategoryPagePosition');
    
    if (navigationHistory === 'categoryToListingPage' && lastPosition) {
      requestAnimationFrame(() => {
        window.scrollTo({
          top: parseInt(lastPosition),
          behavior: 'instant'
        });
      });
      // Clear after restoration
      sessionStorage.setItem('navigationHistory', 'categoryToCityPage');
    }
  };

  window.addEventListener('popstate', handlePopState);
  return () => window.removeEventListener('popstate', handlePopState);
}, []);
  
  // Add this effect in CategoryPage component
useEffect(() => {
  // Store the category page scroll position when navigating to listing
  const handleBeforeUnload = () => {
    if (window.location.pathname.includes('/listing/')) {
      const position = window.pageYOffset || document.documentElement.scrollTop;
      sessionStorage.setItem('lastCategoryPagePosition', position.toString());
      sessionStorage.setItem('navigationHistory', 'categoryToListingPage');
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    
    // When leaving category page
    if (window.location.pathname.includes('/listing/')) {
      const position = window.pageYOffset || document.documentElement.scrollTop;
      sessionStorage.setItem('lastCategoryPagePosition', position.toString());
      sessionStorage.setItem('navigationHistory', 'categoryToListingPage');
    } else if (window.location.pathname === '/') {
      // Only clear when going back to city page
      sessionStorage.removeItem('lastCategoryPagePosition');
      sessionStorage.removeItem('navigationHistory');
    }
  };
}, []);

  useEffect(() => {
	
    fetchCategories();
    window.scrollTo(0, 0);

    const handleScroll = () => {
      if (!searchRef.current || !headingRef.current) return;
      
      const searchBarOriginalPosition = headingRef.current.offsetHeight;
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;

      setIsSticky(currentScrollPosition > searchBarOriginalPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [cityId]);

  const fetchCategories = async () => {
   // setIsLoading(true);
    try {
      const url = getApiUrl(ENDPOINTS.CATEGORY, `cityid=${cityId}`);
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.categories || []);
      setFilteredCategories(data.categories || []);
      setCityInfo({ 
        city_name: data.city_name, 
        state_name: data.state_name, 
        city_urlslug: data.city_urlslug
      });
      setSearchEngines(data.searchengine.searchenginedata || []);

      const preSelectedEngines = data.searchengine.searchenginedata
        .filter((engine) => engine.selected === 'true')
        .map((engine) => engine.searchenginename);
      setActiveEngines(preSelectedEngines);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
  // Cleanup function that runs when component unmounts
  return () => {
    // Only clear if we're not navigating to a listing
    // We can check the current URL to determine this
    if (!window.location.pathname.includes('/listing/')) {
    //  sessionStorage.removeItem('categoryPageScrollPosition');
    }
  };
}, []); // Empty deps array means this runs on mount/unmount only
  
  useEffect(() => {
    // Check if there's a saved scroll position
  const savedScrollPosition = sessionStorage.getItem('categoryPageScrollPosition');
  
  const fetchAndScroll = async () => {
    try {
      const url = getApiUrl(ENDPOINTS.CATEGORY, `cityid=${cityId}`);
      const response = await fetch(url);
      const data = await response.json();
      setCategories(data.categories || []);
      setFilteredCategories(data.categories || []);
      setCityInfo({ 
        city_name: data.city_name, 
        state_name: data.state_name, 
        city_urlslug: data.city_urlslug
      });
      setSearchEngines(data.searchengine.searchenginedata || []);

      const preSelectedEngines = data.searchengine.searchenginedata
        .filter((engine) => engine.selected === 'true')
        .map((engine) => engine.searchenginename);
      setActiveEngines(preSelectedEngines);

      // After data is loaded, restore scroll position
      if (savedScrollPosition && isInitialLoad) {
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition),
            behavior: 'instant'
          });
          sessionStorage.removeItem('categoryPageScrollPosition');
          setIsInitialLoad(false);
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAndScroll();
}, [cityId, isInitialLoad]);

  
const handleCategoryClick = (category) => {
  // First scroll to top immediately (not smooth)
 const currentPosition = window.scrollY;
  sessionStorage.setItem('categoryPageScrollPosition', currentPosition.toString());
  
  // Navigate immediately after scroll
  navigate(`/${category.subcat_urlslug}/${cityInfo.city_urlslug}`);
};

  const scrollToResults = () => {
    if (resultsRef.current && isSticky) {
      const yOffset = -70; // Adjust this value based on your sticky header height
      const element = resultsRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearch = (event) => {
	if (isHandlingBack) {
    setIsHandlingBack(false);
    return;
  }  
	  
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
	
	 // Update URL for non-empty searches
  if (term.trim()) {
    window.history.pushState({ search: term }, '', `?q=${encodeURIComponent(term)}`);
  } else {
    window.history.replaceState(null, '', window.location.pathname);
  }
    
    if (term) {
      const filtered = categories.filter(
        (category) =>
          category.sub_category_name.toLowerCase().includes(term) ||
          (category.related_keywords && category.related_keywords.toLowerCase().includes(term))
      );
      setFilteredCategories(filtered);
      setTimeout(scrollToResults, 100);
    } else {
      setFilteredCategories(categories);
    }
  };

  const handleClearSearch = () => {
	 window.history.replaceState(null, '', window.location.pathname);  
	  
    setSearchTerm('');
    setFilteredCategories(categories);
    setActiveEngines(
      searchEngines
        .filter((engine) => engine.selected === 'true')
        .map((engine) => engine.searchenginename)
    );
  };

  const handleExternalSearch = () => {
    if (!searchTerm || activeEngines.length === 0) return;
    const searchUrls = searchEngines
      .filter((engine) => activeEngines.includes(engine.searchenginename))
      .map((engine) => `${engine.searchengineurl}${encodeURIComponent(searchTerm)}`);
    const combinedUrl = `collections:${searchUrls.join('/~')}`;
    window.open(combinedUrl, '_blank');
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleExternalSearch();
    }
  };

  const handleEngineClick = (engineName) => {
    setActiveEngines((prevActiveEngines) =>
      prevActiveEngines.includes(engineName)
        ? prevActiveEngines.filter((name) => name !== engineName)
        : [...prevActiveEngines, engineName]
    );
  };
  
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('q');
  
  if (initialSearch) {
    setSearchTerm(initialSearch);
    const filtered = categories.filter(
      (category) =>
        category.sub_category_name.toLowerCase().includes(initialSearch.toLowerCase()) ||
        (category.related_keywords && category.related_keywords.toLowerCase().includes(initialSearch.toLowerCase()))
    );
    setFilteredCategories(filtered);
  }
}, [categories]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(
        (category) =>
          category.sub_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (category.related_keywords && category.related_keywords.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [categories, searchTerm]);
  
useEffect(() => {
  const handleBackButton = (event) => {
    // Only handle if we have an active search
    if (searchTerm) {
      event.preventDefault();
      
      // Clear URL immediately
      window.history.replaceState(null, '', window.location.pathname);
      
      // Clear all states synchronously
      setIsHandlingBack(true);
      setSearchTerm('');
      setFilteredCategories(categories);
      setActiveEngines(
        searchEngines
          .filter((engine) => engine.selected === 'true')
          .map((engine) => engine.searchenginename)
      );
      
      // Reset scroll position instantly
      window.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
  };

  window.addEventListener('popstate', handleBackButton);
  return () => {
    window.removeEventListener('popstate', handleBackButton);
    setIsHandlingBack(false);
  };
}, [searchTerm, categories, searchEngines]);


  if (isLoading) {
    return (
      <Container className="category-container">
        <Box className="loading-container">
          <CircularProgress sx={{ color: colors.app_primary }} />
        </Box>
      </Container>
    );
  }
  
  

return (
  <Container
    maxWidth="sm"
    sx={{
      background: colors.app_primaryBackground,
      minHeight: '100vh',
      padding: '5px 16px',
    }}
  >
    <MetaData 
      component="CategoryHome" 
      cityInfo={cityInfo} 
    />
    <Box my={1} className="category-content">
      <Typography 
        ref={headingRef}
        variant="h6" 
        gutterBottom 
        align="center" 
        sx={{ 
          marginBottom: '16px',
        }}
      >
        {cityInfo ? `${cityInfo.city_name}, ${cityInfo.state_name}` : 'Categories'}
      </Typography>

      <Box
        ref={searchRef}
        sx={{
          position: isSticky ? 'fixed' : 'static',
          top: isSticky ? 0 : 'auto',
          left: isSticky ? '50%' : 'auto',
          transform: isSticky ? 'translateX(-50%)' : 'none',
          zIndex: 1000,
          backgroundColor: colors.app_primaryBackground,
          padding: isSticky ? '10px 16px' : '0px',
          transition: 'all 0.3s ease',
          width: '100%',
          maxWidth: {
            xs: '100%',
            sm: '600px'
          },
          margin: '0 auto'
         // boxShadow: isSticky ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <TextField
          fullWidth
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          onKeyPress={handleKeyPress}
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
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon style={{ width: '16px', height: '16px', color: '#888' }} />
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
          }}
        />
      </Box>

      <Box
        ref={resultsRef}
        sx={{
          marginTop: isSticky ? '60px' : '8px',
          width: '100%',
          paddingTop: 0,
          position: isSticky ? 'relative' : 'static',
          zIndex: isSticky ? 999 : 'auto',
        }}
      >
        {filteredCategories.length > 0 ? (
          <List 
            className="category-list"
            sx={{
              width: '100%',
              padding: 0,
              margin: 0,
              position: 'relative',
              '& .MuiListItem-root': {
                marginBottom: '8px',
                padding: '12px 16px',
                '&:first-of-type': {
                  marginTop: 0,
                },
              }
            }}
          >
            {filteredCategories.map((category) => (
              <ListItem
                key={category.sub_category_name}
                onClick={() => handleCategoryClick(category)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  borderRadius: '8px',
                  backgroundColor: colors.secondaryBackground,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                  
                    transform: 'translateY(-2px)'
                    
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Box sx={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    padding: '4px',
                    mr: '20px',
                  }}>
                    {category.sub_category_image ? (
                      <img
                        src={`${CATEGORY_IMAGE_BASE_URL}${category.sub_category_image}`}
                        alt={category.sub_category_name}
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: '2px',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${category.sub_category_name.charAt(0).toUpperCase()}</text></svg>`;
                        }}
                      />
                    ) : (
                      <Typography variant="subtitle1" color="textSecondary">
                        {category.sub_category_name.charAt(0).toUpperCase()}
                      </Typography>
                    )}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={category.sub_category_name}
                  sx={{
                    '& .MuiTypography-root': {
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: '#333',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box className="no-results-container">
            <Typography variant="h6" gutterBottom>No categories to show</Typography>
    <Box display="flex" justifyContent="center" mb={2}>
  {searchEngines.map((engine) => (
    <IconButton
      key={engine.searchenginename}
      onClick={() => handleEngineClick(engine.searchenginename)}
      sx={{
        width: 60,
        height: 60,
        mx: 1,
        backgroundColor: activeEngines.includes(engine.searchenginename)
          ? colors.app_primary
          : '#ccc',
        position: 'relative',
        animation: `${glowPulse} 2s infinite ease-in-out`,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: activeEngines.includes(engine.searchenginename)
            ? colors.app_primary
            : '#aaa',
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
  ))}
</Box>
            <Button variant="contained"  sx={{
			  mt:3,
			backgroundColor: colors.app_primary,       // Set the button background color
			color: '#FFFFFF',                      // Ensure the text color contrasts well with accent2
			borderRadius: '20px',
			'&:hover': {
			  backgroundColor: colors.app_primary,     // Maintain accent2 color on hover
			  opacity: 0.9                         // Slightly decrease opacity for hover effect
			},
		  }} onClick={handleExternalSearch}>
              SEARCH
            </Button>
          </Box>
        )}
      </Box>
    </Box>
	<FooterComponent />
  </Container>
);
}

export default CategoryPage;