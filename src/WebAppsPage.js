import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Typography, Box, TextField, InputAdornment, 
  CircularProgress, Paper, ThemeProvider, createTheme, 
  Avatar, Grid, Container, Button, IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DoneIcon from '@mui/icons-material/Done';
import { red } from '@mui/material/colors';
import FooterComponent from './FooterComponent';
import { styled } from '@mui/material/styles';
import { keyframes, css } from '@emotion/react';
import { API_BASE_URL,DEFAULT_IMAGE_BASE_URL } from "./config/apiConfigext";
import MetaData from './components/MetaData';
import ScrollableLinkSection from './components/ScrollableLinkSection';
import { trackLinkClick, getRecentlyViewed, getMostViewed, removeFromRecentlyViewed, removeFromMostViewed } from './utils/linkDatabase';
import ViewedLinksSection from './components/ViewedLinksSection';

import {
  PopularLinksWrapper,
  PopularLinkItem,
  PopularLinkAvatar,
  PopularLinkText,
  ShowMoreButton,
  CategoryItemText
} from './theme-styles';

import {
  // Colors and Theme
  colors,
  
  // Container Components
  WebAppsContainer,
  WebAppsTitle,
  
  // Search Components
  SearchTextField,
  SearchEngineAvatar,
  
  // Category Components
  CategoryListBox,
  CategoryItem,
  CategoryItemAvatar,
 
  
  // Links Components
  LinksByCategoryPaper,
  LinkItem,
  LinkItemAvatar,
  LinkItemText,
  MoreButton,
  
  // Banner Components
  WebAppsBannerContainer,
  BannerImage,
  
  // Popular Links Components
  PopularLinksContainer,
  LoadingWrapper,
  SearchResultsContainer,
  GridContainer,
  SearchResultItem,
  SearchEngineContainer,
  SearchEngineItem,
  SearchEngineName,
  ErrorWrapper,
  ErrorText
} from './theme-styles';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
    },
    background: {
      default: 'transparent',
    },
  },
});

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

const SearchEngineButton = styled(Button)`
  margin: 4px;
  border-radius: 50%;
  background-color: ${(props) => (props.selected ? colors.app_primary : '#ccc')};
  min-width: 50px;
  min-height: 50px;
  width: 50px;
  height: 50px;
  padding: 0;
  position: relative;
  animation: ${css`${glowPulse} 2s infinite ease-in-out`}; // Always show glow
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) => (props.selected ? colors.app_primary : '#aaa')};
    transform: scale(1.05);
  }

  img {
    width: 60%;
    height: 60%;
    position: relative;
    z-index: 1;
  }
`;


const CategoryAvatarWithFallback = ({ category, isActive }) => {
  const [imgError, setImgError] = useState(false);
  const defaultImage = DEFAULT_IMAGE_BASE_URL;

  return (
    <Avatar
      src={imgError ? defaultImage : category.category_image}
      alt={category.category_name}
      imgProps={{
        onError: () => setImgError(true),
        loading: "lazy",
        decoding: "async",
        fetchpriority: "low"
      }}
      sx={{
        width: 40,
        height: 40,
        bgcolor: imgError ? colors.app_primary : 'transparent',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: imgError ? '#fff' : 'inherit',
        '& .MuiAvatar-img': {
          objectFit: 'contain',
          width: '100%',
          height: '100%'
        }
      }}
    >
      {imgError && category.category_name.charAt(0).toUpperCase()}
    </Avatar>
  );
};

const SearchResultAvatar = ({ link, defaultImage }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <Avatar
      src={imgError ? defaultImage : link.link_image}
      alt={link.link_name}
      imgProps={{
        onError: () => setImgError(true),
        loading: "lazy",
        decoding: "async",
        fetchpriority: "low"
      }}
      sx={{
        width: 50,
        height: 50,
        mb: 1,
        padding: '0px',
        border: '2px solid #b3b3b3',
        bgcolor: 'transparent',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        '& .MuiAvatar-img': {
          objectFit: 'contain',
          width: '100%',
          height: '100%'
        }
      }}
    />
  );
};

const SingleSearchResultItem = React.memo(({ link, onLinkClick }) => {
  const [imgError, setImgError] = useState(false);
  const defaultImage = DEFAULT_IMAGE_BASE_URL;

  const handleClick = (e) => {
    e.preventDefault();
    if (onLinkClick) {
      onLinkClick(link);
    } else {
      // Only append 'inapp:' if the URL doesn't already start with it
      const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
      window.open(modifiedUrl, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <Grid item xs={3}>
      <Box
        component="a"
        href={link.link_URL}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px',
          transition: 'box-shadow 0.3s, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transform: 'translateY(-2px)',
          },
        }}
      >
        <Avatar
          src={imgError ? defaultImage : link.link_image}
          alt={link.link_name}
          onError={() => setImgError(true)}
          imgProps={{
            loading: "lazy",
            decoding: "async",
            fetchpriority: "low"
          }}
          sx={{
            width: 50,
            height: 50,
            mb: 1,
            padding: '0px',
            border: `2px solid ${colors.app_primaryBackground}`,
            bgcolor: 'transparent',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '& .MuiAvatar-img': {
              objectFit: 'contain',
              width: '100%',
              height: '100%'
            }
          }}
        />
        <Typography
          variant="caption"
          align="center"
          sx={{
            textDecoration: 'none',
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: 'bold',
            lineHeight: '12px',
            fontSize: '11px',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            width: '100%',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            textOverflow: 'ellipsis',
          }}
        >
          {link.link_name}
        </Typography>
      </Box>
    </Grid>
  );
});

const imageCache = new Map();
const defaultImage = DEFAULT_IMAGE_BASE_URL;


const WebAppsPage = () => {
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
   const [showSearchButton, setShowSearchButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [visibleCategory, setVisibleCategory] = useState(null);
   const [links, setLinks] = useState([]);
   const [filteredItems, setFilteredItems] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const categoryListRef = useRef(null);
  const contentRef = useRef(null);
const clearButtonRef = useRef(null);
  const isUserScrolling = useRef(true);
  const [isClickScrolling, setIsClickScrolling] = useState(false);

  // Initialize IndexedDB and load viewed links
  useEffect(() => {
    const initializeDB = async () => {
      try {
        // Load viewed links data
        const [recent, most] = await Promise.all([
          getRecentlyViewed(),
          getMostViewed()
        ]);
        console.log('Initial load of viewed links:', { recent, most });
        setRecentlyViewed(recent);
        setMostViewed(most);
      } catch (error) {
        console.error('Error initializing viewed links:', error);
      }
    };

    initializeDB();
  }, []);
   
    useEffect(() => {
    const restoreScrollPosition = () => {
      // Check if we're returning from CategoryPage
      const isReturning = sessionStorage.getItem('isReturningToWebApps');
      
      if (isReturning) {
        const savedPosition = sessionStorage.getItem('webappsScrollPosition');
        const lastCategory = sessionStorage.getItem('lastVisitedCategory');

        if (savedPosition) {
          // Wait for content to be rendered
          requestAnimationFrame(() => {
            window.scrollTo({
              top: parseInt(savedPosition),
              behavior: 'instant'
            });

            // If there was an active category, restore it
            if (lastCategory) {
              setActiveCategory(lastCategory);
            }
          });
        }

        // Clean up storage
        sessionStorage.removeItem('isReturningToWebApps');
        sessionStorage.removeItem('webappsScrollPosition');
        sessionStorage.removeItem('lastVisitedCategory');
      }
    };

    // Call restore function after data is loaded
    if (data && !isLoading) {
      restoreScrollPosition();
    }
  }, [data, isLoading]); // Depend on data and loading state

useEffect(() => {
  fetch(`${API_BASE_URL}webappsapi.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then((jsonData) => {
      setData(jsonData);

      // Set the default selected engines where "selected" is true
      const defaultEngines = (jsonData.searchengine.searchenginedata || [])
        .filter(engine => engine.selected === "true")
        .map(engine => engine.searchenginename);

      setSelectedEngines(defaultEngines); // Set selected engines state

      setFilteredItems(jsonData.categories); // Set the initial category list
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      setError(error.message);
      setIsLoading(false);
    });
}, []);
   
   useEffect(() => {
  if (!searchQuery.trim()) return;

  setIsLoading(false);
  setError(null);

  fetch(`${API_BASE_URL}webappsapi.php?search=${encodeURIComponent(searchQuery.trim())}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.json();
    })
    .then(jsonData => {
      if (jsonData.linkdata && jsonData.linkdata.length > 0) {
        const searchResultLinks = jsonData.linkdata.flatMap(category => category.links || []);
        setLinks(searchResultLinks);
      } else {
        setLinks([]);
      }
    })
    .catch(error => {
      console.error('Error fetching search data:', error);
      setError(error.message);
      setLinks([]);
    });
}, [searchQuery]);

useEffect(() => {
  // Initially hide the search button on page load
  setShowSearchButton(false);
}, []);

useEffect(() => {
  fetch(`${API_BASE_URL}webappsapi.php`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return response.json();
    })
    .then((jsonData) => {
      setData(jsonData);
      setFilteredItems(jsonData.categories); // Set the initial category list
      setIsLoading(false);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
      setError(error.message);
      setIsLoading(false);
    });
}, []);
  
useEffect(() => {
  const handleScroll = () => {
    if (isClickScrolling) return; // Ignore scroll if it's from a click

    // Monitor category list and determine if the right-side content needs adjustment
    if (categoryListRef.current) {
      const { top } = categoryListRef.current.getBoundingClientRect();
      const newIsSticky = top <= 20;
      setIsSticky(newIsSticky);

      const categoryElements = document.querySelectorAll('[id^="category-"]');
      let currentVisibleCategory = null;
      let smallestDistance = Infinity;
      const scrollThreshold = 100; // Adjust this value as needed

      // Reset all active categories first
      categoryElements.forEach((element) => {
        element.style.backgroundColor = ''; // Reset background color
        element.style.transform = 'scale(1)'; // Reset transform
      });

      // Check if we're at the very top of the page
      if (window.scrollY === 0) {
        if (categoryElements.length > 0) {
          currentVisibleCategory = categoryElements[0].id.split('-')[1];
        }
      } else {
        // Find the category closest to the viewport top
        categoryElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top - scrollThreshold);
          
          if (distanceFromTop < smallestDistance && rect.top <= window.innerHeight) {
            smallestDistance = distanceFromTop;
            currentVisibleCategory = element.id.split('-')[1];
          }
        });
      }

      // Update visible category if one is found
      if (currentVisibleCategory && currentVisibleCategory !== visibleCategory) {
        // Deactivate previous category if exists
        if (visibleCategory) {
          const prevElement = document.getElementById(`category-${visibleCategory}`);
          if (prevElement) {
            prevElement.style.backgroundColor = '';
            prevElement.style.transform = 'scale(1)';
          }
        }

        // Activate new category
        const newElement = document.getElementById(`category-${currentVisibleCategory}`);
        if (newElement) {
          newElement.style.backgroundColor = colors.accent2Light;
          newElement.style.transform = 'scale(1.05)';
        }

        setVisibleCategory(currentVisibleCategory);
        setActiveCategory(currentVisibleCategory);

        // Handle category list scrolling
        const listItem = document.getElementById(`list-item-${currentVisibleCategory}`);
        if (listItem && isSticky) {
          const listItemRect = listItem.getBoundingClientRect();
          if (listItemRect.top < 0 || listItemRect.top > window.innerHeight) {
            listItem.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest'
            });
          }
        }
      }
    }
  };

  // Add scroll event listener with throttling
  let ticking = false;
  const scrollListener = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', scrollListener);
  
  // Initial check on mount
  handleScroll();

  return () => window.removeEventListener('scroll', scrollListener);
}, [visibleCategory, isClickScrolling, isSticky]);

const clearSearch = useCallback(() => {
  setSearchQuery(''); // Clear the search query
  setShowSearchButton(false); // Hide the search button
  setLinks([]); // Clear search result links specifically
  setIsLoading(true); 
  fetch(`${API_BASE_URL}webappsapi.php`)
    .then((response) => {
      if (!response.ok) throw new Error('Failed to fetch data');
      return response.json();
    })
    .then((jsonData) => {
      setData(jsonData); // Reset data to the initial fetched data
      setFilteredItems(jsonData.categories || []); // Reset the category list
      const defaultEngines = (jsonData.searchengine.searchenginedata || [])
        .filter(engine => engine.selected === "true")
        .map(engine => engine.searchenginename);
      setSelectedEngines(defaultEngines); // Reset selected engines
      setIsLoading(false); // Stop loading
      setError(null); // Clear any previous error
    })
    .catch((error) => {
      console.error('Error resetting data:', error);
      setError(error.message);
      setIsLoading(false);
    });
}, []);

const handleCategoryClick = useCallback((categoryId) => {
  setIsClickScrolling(true);
  setActiveCategory(categoryId);
  setVisibleCategory(categoryId);

  const clickedElement = document.getElementById(`category-${categoryId}`);
  if (clickedElement) {
    const header = document.querySelector('header');
    const headerHeight = header ? header.offsetHeight : 0;
    const stickyCategories = document.querySelector('.sticky-category');
    const stickyOffset = stickyCategories && stickyCategories.offsetHeight > 0 ? 20 : 0;

    const y = clickedElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - stickyOffset;

    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });

    clickedElement.style.backgroundColor = colors.accent2Light;
  }

  setTimeout(() => {
    setIsClickScrolling(false);
  }, 1000);
}, []);

  useEffect(() => {
    const resetRedBackgrounds = () => {
      // Get all elements whose ID starts with "category-"
      const elements = document.querySelectorAll('[id^="category-"]');
      elements.forEach((element) => {
        const bgColor = window.getComputedStyle(element).backgroundColor;
        // If background color is red, reset it
       
          element.style.backgroundColor = '';  // Reset to default background
        
      });
    };

    const handleClickOutside = (event) => {
      // Check if the click is outside both the left (category list) and right (content) sections
      if (
        categoryListRef.current && !categoryListRef.current.contains(event.target) && // Click outside left section
        contentRef.current && !contentRef.current.contains(event.target) // Click outside right section
      ) {
        setActiveCategory(null); // Reset activeCategory to null
        resetRedBackgrounds();   // Reset all red backgrounds
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSelectEngine = useCallback((engineName) => {
    setSelectedEngines(prevState =>
      prevState.includes(engineName)
        ? prevState.filter(name => name !== engineName)
        : [...prevState, engineName]
    );
  }, []);

const handleSearch = useCallback((e) => {
  const query = searchQuery.trim().toLowerCase();

  if (query !== '') {
    setShowSearchButton(true); // Show the search button when there's a query

    // Handle "Enter" or click events for search
    if (e.key === 'Enter' || e.type === 'click') {
      const searchUrls = selectedEngines.map(engineName => {
        const engine = data.searchengine.searchenginedata.find(se => se.searchenginename === engineName);
        return engine.searchengineurl + encodeURIComponent(query);
      }).join('/~');

      if (searchUrls) {
        window.open(`collections:${searchUrls}`, '_blank');
      }
    } else {
      // Filter the data for search results
      const filteredPopularLinks = (data.popular_links || []).filter(link =>
        link.link_name.toLowerCase().includes(query)
      );

      const filteredLinkData = data.linkdata.reduce((acc, category) => {
        const filteredLinks = (category.links || []).filter(link =>
          link.link_name.toLowerCase().includes(query)
        );
        if (filteredLinks.length > 0) {
          acc.push({ ...category, links: filteredLinks });
        }
        return acc;
      }, []);

      // Update both links and categories dynamically
      setLinks(filteredLinkData.flatMap(category => category.links)); // Update filtered links
      setFilteredItems(data.categories.filter(category =>
        filteredLinkData.some(filteredCategory => filteredCategory.category_id === category.category_id)
      )); // Update categories for the sticky menu

      setIsLoading(false);
    }
  } else {
    // Reset everything to the initial state
    clearSearch();
  }
}, [searchQuery, selectedEngines, data, clearSearch]);

const handleSearchChange = (event) => {
  const query = event.target.value; // Do not trim here
  setSearchQuery(query); // Set the raw query with spaces
};

const handleSearchKeyUp = (event) => {
  if (event.key === 'Enter') {
    const query = searchQuery.trim();
    if (query !== '') {
      // Combine all selected engine URLs with the '~' separator
      const searchUrls = selectedEngines.map(engineName => {
        const engine = data.searchengine.searchenginedata.find(
          se => se.searchenginename === engineName
        );
        return engine.searchengineurl + encodeURIComponent(query);
      }).join('/~');

      // Open the combined URLs in a single new tab
      if (searchUrls) {
        window.open(`collections:${searchUrls}`, '_blank', 'noopener,noreferrer');
      }
    }
  }
};
  
    const handleSearchBtn = useCallback(() => {
    handleSearch({ type: 'click' });
  }, [handleSearch]);

  const handleViewedLinkClick = useCallback(async (link) => {
    // Prevent link navigation in edit mode
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
      console.log("Refreshed viewed lists:", { recent, most });
      setRecentlyViewed(recent);
      setMostViewed(most);

      // Only append 'inapp:' if the URL doesn't already start with it
      const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
      window.open(modifiedUrl, '_blank', 'noopener,noreferrer');

    } catch (error) {
      console.error('Error handling link click:', error);
      // Still open the link even if tracking fails
      if (!isEditMode) {
        // Only append 'inapp:' if the URL doesn't already start with it
        const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
        window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
      }
    }
  }, [setRecentlyViewed, setMostViewed, isEditMode]);

  const shouldShowFavoritesDuringSearch = useMemo(() => {
    if (!searchQuery || !links || links.length === 0) {
      return false;
    }
    const recentlyViewedIds = new Set(recentlyViewed.map(l => l.link_id));
    const mostViewedIds = new Set(mostViewed.map(l => l.link_id));
    
    return links.some(link => 
        recentlyViewedIds.has(link.link_id) || mostViewedIds.has(link.link_id)
    );
  }, [searchQuery, links, recentlyViewed, mostViewed]);

  const displayData = data;

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const handleRemoveFromRecently = async (linkId) => {
    try {
      await removeFromRecentlyViewed(linkId);
      // Update state immediately for responsiveness
      setRecentlyViewed(prev => prev.filter(link => link.link_id !== linkId));
      // Optionally, refetch to ensure consistency, though direct state update is often sufficient
      // const recent = await getRecentlyViewed();
      // setRecentlyViewed(recent);
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
      // Optionally refetch on error
      const recent = await getRecentlyViewed();
      setRecentlyViewed(recent);
    }
  };

  const handleRemoveFromMost = async (linkId) => {
    try {
      await removeFromMostViewed(linkId);
      // Update state immediately
      setMostViewed(prev => prev.filter(link => link.link_id !== linkId));
      // Optionally, refetch
      // const most = await getMostViewed();
      // setMostViewed(most);
    } catch (error) {
      console.error('Error removing from most viewed:', error);
      // Optionally refetch on error
      const most = await getMostViewed();
      setMostViewed(most);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: colors.app_primaryBackground, minHeight: '100vh' }}>
        <MetaData component="WebAppsPage" />
        <WebAppsContainer maxWidth="lg">
          <WebAppsTitle variant="h4">
            
          </WebAppsTitle>

          {isLoading && (
            <LoadingWrapper>
              <CircularProgress sx={{ color: colors.app_primary }} />
            </LoadingWrapper>
          )}
          {error && <ErrorDisplay message={error} />}

          {!isLoading && !error && displayData && (
            <Box>
              {!searchQuery && displayData.header_banner && displayData.header_banner.length > 0 && (
                <Box mt={2} mb={4}>
                  <BannerSlider banners={displayData.header_banner} />
                </Box>
              )}

              <Box sx={{ mb: 4 }}>
                <SearchTextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search for apps..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyUp={handleSearchKeyUp}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton onClick={clearSearch} edge="end" size="small">
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {displayData.searchengine && displayData.searchengine.searchenginedata && (
                  <Box 
                    display="flex" 
                    justifyContent="center" 
                    flexWrap="wrap" 
                    mb={2} 
                    mt={2}
                    sx={{
                      gap: '8px',
                      padding: '12px'
                    }}
                  >
                    {displayData.searchengine.searchenginedata.map((engine) => {
                      const isSelected = selectedEngines.includes(engine.searchenginename);
                      return (
                        <SearchEngineButton
                          key={engine.searchenginename}
                          onClick={() => handleSelectEngine(engine.searchenginename)}
                          selected={isSelected}
                        >
                          <img
                            src={engine.searchengineimage.replace("../", "https://liveapps.5bestincity.com/")}
                            alt={engine.searchenginename}
                            loading="lazy"
                            decoding="async"
                            fetchpriority="low"
                          />
                        </SearchEngineButton>
                      );
                    })}
                  </Box>
                )}

                {searchQuery && (
                  <Box textAlign="center" mt={2}>
                    <Button
                      variant="contained"
                      onClick={handleSearchBtn}
                      sx={{
                        backgroundColor: colors.app_primary,
                        color: '#FFFFFF',
                        borderRadius: '20px',
                        padding: '6px 24px',
                        '&:hover': {
                          backgroundColor: colors.app_primary,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Search
                    </Button>
                  </Box>
                )}
              </Box>

              {searchQuery && links.length === 0 && !isLoading && (
                 <Typography sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
                   No apps found matching your search.
                 </Typography>
              )}
              {searchQuery && links.length > 0 && (
                <Box mt={4} mb={3}> 
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', textAlign:'center' }}>Search Results</Typography>
                  <Grid container spacing={2}>
                    {links.map((link) => (
                      <SingleSearchResultItem 
                        key={link.link_id} 
                        link={link} 
                        onLinkClick={handleViewedLinkClick}
                      />
                    ))}
                  </Grid>
                </Box>
              )}

              {((!searchQuery || shouldShowFavoritesDuringSearch) && (recentlyViewed.length > 0 || mostViewed.length > 0)) && (
                <ViewedLinksSection
                  recentlyViewed={recentlyViewed}
                  mostViewed={mostViewed}
                  onLinkClick={handleViewedLinkClick}
                  defaultImage={defaultImage}
                  isEditMode={isEditMode}
                  onToggleEdit={toggleEditMode}
                  onRemoveRecently={handleRemoveFromRecently}
                  onRemoveMost={handleRemoveFromMost}
                />
              )}

              {!searchQuery && displayData.popular_links && displayData.popular_links.length > 0 && (
                <PopularLinks 
                  popularLinks={displayData.popular_links}
                  setRecentlyViewed={setRecentlyViewed}
                  setMostViewed={setMostViewed}
                />
              )}

              <Box
                ref={categoryListRef}
                sx={{
                  display: 'flex',
                  flexDirection: isSticky ? 'row' : 'column',
                  width: '100%',
                  mt: 3,
                }}
              >
                {displayData.categories.length > 0 && (
                  <CategoryList
                    categories={filteredItems.length > 0 ? filteredItems : displayData.categories} 
                    onCategoryClick={handleCategoryClick}
                    activeCategory={activeCategory}
                    isSticky={isSticky}
                  />
                )}

                <Box
                  ref={contentRef}
                  sx={{ flex: 1, pl: isSticky ? 2 : 0, pt: isSticky ? 0 : 2 }}
                >
                  {displayData.linkdata.length > 0 && (
                    <LinksByCategory 
                      linkData={displayData.linkdata} 
                      activeCategory={activeCategory}
                      isSticky={isSticky}
                      setRecentlyViewed={setRecentlyViewed}
                      setMostViewed={setMostViewed}
                    />
                  )}
                </Box>
              </Box>

              {!searchQuery && displayData.footer_banner && displayData.footer_banner.length > 0 && (
                <Box mt={4}>
                  <BannerSlider banners={displayData.footer_banner} />
                </Box>
              )}
            </Box>
          )}
        </WebAppsContainer>

        {!isLoading && !error && !displayData && (
          <Typography>No data available. Please try again later.</Typography>
        )}

        <FooterComponent />
      </Box>
    </ThemeProvider>
  );
};

const SearchEngines = ({ searchEngines, selectedEngines, onSelectEngine }) => (
  <Box display="flex" justifyContent="center" mb={2}>
    {searchEngines.map((engine) => {
      const isSelected = selectedEngines.includes(engine.searchenginename);
      return (
        <Box 
          key={engine.searchenginename} 
          mx={1} 
          textAlign="center"
          onClick={() => onSelectEngine(engine.searchenginename)}
          sx={{
            cursor: 'pointer',
          }}
        >
          <SearchEngineAvatar
            src={engine.searchengineimage}
            alt={engine.searchenginename}
            sx={{ 
              width: 40, 
              height: 40, padding:'8px',
              bgcolor: isSelected ? colors.app_primary : '#ccc'
            }}
          >
            {engine.searchenginename.charAt(0).toUpperCase()}
          </SearchEngineAvatar>
          <CategoryItemText>
          {engine.searchenginename}
           </CategoryItemText>
        </Box>
      );
    })}
  </Box>
);

const PopularLinkItemWithFallback = ({ link, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const defaultImage = DEFAULT_IMAGE_BASE_URL;

  return (
    <PopularLinkItem onClick={onClick}>
      <Avatar
        component="div"
        src={link.link_image}
        imgProps={{
          onError: () => setImgError(true),
          loading: "lazy",
          decoding: "async",
          fetchpriority: "low"
        }}
        sx={{
          width: 50,
          height: 50,
          mb: 1,
          padding: '0px',
          border: `2px solid #b3b3b3`,
          bgcolor: 'transparent',
          backgroundImage: `url(${imgError ? defaultImage : link.link_image})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          '& .MuiAvatar-img': {
            objectFit: 'contain',
            width: '100%',
            height: '100%'
          }
        }}
      />
      <PopularLinkText>
        {link.link_name}
      </PopularLinkText>
    </PopularLinkItem>
  );
};

const PopularLinks = ({ popularLinks, setRecentlyViewed, setMostViewed }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedLinks = showAll ? popularLinks : popularLinks.slice(0, 4);
  const [imageErrors, setImageErrors] = useState({});
  const defaultImage = DEFAULT_IMAGE_BASE_URL;

  const handlePopularLinkClick = useCallback(async (link) => {
      try {
          const linkToTrack = {
              link_id: link.link_id,
              link_name: link.link_name,
              link_URL: link.link_URL,
              link_image: link.link_image
          };
          await trackLinkClick(linkToTrack);
          const [recent, most] = await Promise.all([getRecentlyViewed(), getMostViewed()]);
          setRecentlyViewed(recent);
          setMostViewed(most);
          
          let url = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
          window.open(url, '_blank', 'noopener,noreferrer');
      } catch (error) {
        console.error('Error handling popular link click:', error);
        const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
        window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
      }
  }, [setRecentlyViewed, setMostViewed]);

  return (
    <PopularLinksWrapper elevation={1}>
      <CategoryItemText 
        variant="h3"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'center',
          fontSize: '20px',
          mb: 2,
        }}
      >
        Popular
      </CategoryItemText>

      <Grid container spacing={2}>
        {displayedLinks.map((link) => (
          <Grid item xs={3} key={link.link_id}>
            <PopularLinkItem onClick={() => handlePopularLinkClick(link)} >
              <Avatar
                src={imageErrors[link.link_id] ? defaultImage : link.link_image}
                alt={link.link_name}
                imgProps={{
                  onError: () => setImageErrors(prev => ({
                    ...prev,
                    [link.link_id]: true
                  })),
                  loading: "lazy",
                  decoding: "async",
                  fetchpriority: "low"
                }}
                sx={{
                  width: 50,
                  height: 50,
                  mb: 1,
                  padding: '0px',
                  border: `2px solid ${colors.app_primaryBackground}`,
                  bgcolor: 'transparent',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  '& .MuiAvatar-img': {
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }
                }}
              />
              <PopularLinkText>
                {link.link_name}
              </PopularLinkText>
            </PopularLinkItem>
          </Grid>
        ))}
      </Grid>

      {!showAll && popularLinks.length > 4 && (
        <Box textAlign="center">
          <ShowMoreButton 
            variant="outlined" 
            sx={{backgroundColor:colors.accent2Light,color:colors.app_primary,border:`2px solid ${colors.app_primary}`,fontWeight:'500'}}
            onClick={() => setShowAll(true)}
          >
            More
          </ShowMoreButton>
        </Box>
      )}

      {showAll && (
        <Box textAlign="center">
          <ShowMoreButton 
            variant="outlined" 
            sx={{backgroundColor:colors.accent2Light,color:colors.app_primary,border:`2px solid ${colors.app_primary}`,fontWeight:'500'}}
            onClick={() => setShowAll(false)}
          >
            Less
          </ShowMoreButton>
        </Box>
      )}
    </PopularLinksWrapper>
  );
};


const CategoryList = ({ categories, onCategoryClick, activeCategory, isSticky }) => {
  const categoryListRef = useRef(null); // Reference to the category list container

  useEffect(() => {
    if (activeCategory && categoryListRef.current) {
      // Find the active category element
      const activeCategoryElement = document.querySelector(`[data-category-id="${activeCategory}"]`);
      
      if (activeCategoryElement) {
        // Calculate the scroll position to bring the active category a bit below the top
        const categoryListTop = categoryListRef.current.getBoundingClientRect().top;
        const activeCategoryTop = activeCategoryElement.getBoundingClientRect().top;
        const scrollOffset = activeCategoryTop - categoryListTop - 40; // Scroll so that it's 40px below the top

        // Scroll the category list smoothly
        categoryListRef.current.scrollTo({
          top: categoryListRef.current.scrollTop + scrollOffset,
          behavior: 'smooth',
        });
      }
    }
  }, [activeCategory]); // Effect runs when activeCategory changes

  return (
    <CategoryListBox 
    ref={categoryListRef} // Attach ref to the category list container
  className={isSticky ? 'sticky-category' : ''}  // Add a class when sticky
    sx={{
      display:isSticky ? 'flex' : '-webkit-inline-box;',
      flexDirection: isSticky ? 'column' : 'row',
      overflowX: isSticky ? 'visible' : 'auto',
      overflowY: isSticky ? 'auto' : 'visible',
      position: isSticky ? 'sticky' : 'static',
      top: isSticky ? '0px' : 'auto', 
      maxHeight: isSticky ? 'calc(100vh - 40px)' : 'auto',
      width: isSticky ? '78px' : '100%',
      py: 2,
      bgcolor: isSticky ?'#fff' : 'transparent' ,
      zIndex: 1,
      '&::-webkit-scrollbar': {
    display: 'none', // Hides the scrollbar
       },
        '-ms-overflow-style': 'none', // For Internet Explorer and Edge
       'scrollbar-width': 'none', // For Firefox
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(0,0,0,.2)',
        borderRadius: '3px',
      },
    }}
  >
      {categories.map((category) => {
        const isActive = String(activeCategory) === String(category.category_id);

        return (
          <CategoryItem
            key={category.category_id}
			 data-category-id={category.category_id}
            onClick={() => onCategoryClick(category.category_id)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingleft: '0px',
              paddingTop: '4px !important',
              paddingBottom: '4px !important',
              width: isSticky ? 'auto' : '76px',
              marginRight: '4px !important',
              marginLeft: '4px !important',
              border: '1px solid #d7cdcd',
              marginTop: '0px !important',
              marginBottom: isSticky ? '6px !important' : '0px',
              border: isSticky ? '0px solid #d9c3c3' :'1px solid #d9c3c3',
              borderRadius: isSticky ? '8px' : '8px',
              height: isSticky ? '100px' : 'auto', 
              fontSize: '9px',
              m: 1, 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.05)' : 'scale(1)',
              backgroundColor:isActive? colors.categoryActive : '#ffffff',
              '&:hover': {
                transform: 'scale(1.05)',
              },
              
            }}
          >
            <Box
              sx={{
            
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: isActive ? 'transparent' : 'background.paper',
                border: isActive ? '2px solid' : 'none',
                borderColor: colors.app_primary,
                transition: 'all 0.3s ease',
              }}
            >
               <CategoryAvatarWithFallback 
  category={category}
  isActive={String(activeCategory) === String(category.category_id)}
/>
            </Box>
          <CategoryItemText isActive={String(activeCategory) === String(category.category_id)}>
           {category.category_name.length <= 12 
             ? category.category_name 
             : `${category.category_name.substring(0, 12)}...`}
          </CategoryItemText>
          </CategoryItem>
        );
      })}
    </CategoryListBox>
  );
};

const LinksByCategory = ({ 
  linkData, 
  activeCategory, 
  isSticky, 
  setRecentlyViewed,
  setMostViewed 
}) => {
  const LinkItemComponent = ({ link }) => {
    const [imgError, setImgError] = useState(false);

    const handleCategoryLinkClick = useCallback(async (e) => {
      e.preventDefault();
      try {
          const linkToTrack = {
              link_id: link.link_id,
              link_name: link.link_name,
              link_URL: link.link_URL,
              link_image: link.link_image
          };
          await trackLinkClick(linkToTrack);
          const [recent, most] = await Promise.all([getRecentlyViewed(), getMostViewed()]);
          setRecentlyViewed(recent);
          setMostViewed(most);
          
          // Only append 'inapp:' if the URL doesn't already start with it
          const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
          window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
      } catch (error) {
          console.error('Error handling category link click:', error);
          // Only append 'inapp:' if the URL doesn't already start with it
          const modifiedUrl = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
          window.open(modifiedUrl, '_blank', 'noopener,noreferrer');
      }
    }, [setRecentlyViewed, setMostViewed]);

    return (
      <Box
        component="a"
        href={link.link_URL}
        onClick={handleCategoryLinkClick}
        sx={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px',
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      >
        <Avatar
          src={imgError ? defaultImage : link.link_image}
          alt={link.link_name}
          onError={() => setImgError(true)}
          imgProps={{
            loading: "lazy",
            decoding: "async",
            fetchpriority: "low"
          }}
          sx={{
            width: 50,
            height: 50,
            mb: 1,
            padding: '0px',
            border: `2px solid ${colors.app_primaryBackground}`,
            bgcolor: 'transparent',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            '& .MuiAvatar-img': {
              objectFit: 'contain',
              width: '100%',
              height: '100%'
            }
          }}
        />
        <Typography
          variant="caption"
          align="center"
          sx={{
            color: 'rgba(0, 0, 0, 0.87)',
            fontWeight: 'bold',
            lineHeight: '12px',
            fontSize: '11px',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            width: '100%',
            overflow: 'hidden',
            WebkitLineClamp: 2,
            textOverflow: 'ellipsis',
          }}
        >
          {link.link_name}
        </Typography>
      </Box>
    );
  };

  const handleMoreClick = (categoryId, event) => {
    // Save both scroll position and category ID when clicking More
    const scrollPosition = window.scrollY;
    sessionStorage.setItem('webappsScrollPosition', scrollPosition.toString());
    sessionStorage.setItem('lastVisitedCategory', categoryId);
  }; 
	
  return (
    <Box>
      {linkData.map((category) => {
        const isActive = String(category.category_id) === String(activeCategory);
        const showMoreButton = category.links.length > 14;

        return (
          <Paper
            key={category.category_id}
            elevation={isActive ? 8 : 1}
            sx={{
              p: 2,
              mb: 1,
              marginTop: '15px',
              bgcolor: isActive ? colors.accent2Light : 'white',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.02)' : 'scale(1)',
              borderRadius: '10px',
              position: 'relative',
              overflow: 'visible',
            }}
            id={`category-${category.category_id}`}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '500' }}>
              {category.sub_category_name}
            </Typography>
            <Grid container spacing={1.5}>
              {category.links.slice(0, 14).map((link) => (
                <Grid item xs={4} md={2} sm={4} key={link.link_id}>
                  <LinkItemComponent link={link} />
                </Grid>
              ))}
            </Grid>

            {showMoreButton && (
              <Box mt={2} textAlign="center">
                <Typography
                  component="a"
                  href={`/category/${category.category_id}`}
				  onClick={(e) => handleMoreClick(category.category_id, e)}
                  rel="noopener noreferrer"
                  sx={{
                    textDecoration: 'none',
                    color: colors.app_primary,
                    fontWeight: '600',
                    border: `2px solid ${colors.app_primary}`,
                    borderRadius: '50%',
                    fontSize: '11px',
                    width: '50px',
                    display: 'block',
                    height: '50px',
                    margin: '0 auto',
                    paddingTop: '14px',
                    background: colors.accent2Light,
                    '&:hover': {
                      textDecoration: 'underline',
                      transform: 'scale(1.05)',
                      transition: 'all 0.3s ease',
                      color: colors.app_primary,
                    },
                    '&:active': {
                      color: colors.app_primary,
                    },
                    '&:visited': {
                      color: colors.app_primary,
                    },
                    WebkitTapHighlightColor: 'transparent',
                    userSelect: 'none',
                  }}
                >
                  More
                </Typography>
              </Box>
            )}
          </Paper>
        );
      })}
    </Box>
  );
};



const BannerSlider = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timeoutRef = useRef(null);

  // Clear timeout to prevent memory leaks
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Set a new timeout for banner transitions
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(
      () =>
        setCurrentIndex((prevIndex) =>
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        ),
      3000
    );

    return () => {
      resetTimeout();
    };
  }, [currentIndex, banners.length]);

  if (banners.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        height: '250px',
        overflow: 'hidden',
        marginTop: '-20px',
        borderRadius: '15px',
        backgroundColor: '#ffffff',
      }}
    >
      {banners.map((banner, index) => (
        <Box
          key={banner.gallery_id}
          component="img"
          src={banner.gallery_image}
          alt={banner.gallery_name}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '15px',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
          }}
        />
      ))}

      {banners.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
          }}
        >
          {banners.map((_, idx) => (
            <Box
              key={idx}
              sx={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: idx === currentIndex ? '#007bff' : '#ccc',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </Box>
      )}

      <Box sx={{ height: '200px', backgroundColor: 'transparent' }} />
    </Box>
  );
};

const ErrorDisplay = ({ message }) => (
  <Box textAlign="center">
    <Typography variant="h6" color="error">
      Error: {message}
    </Typography>
  </Box>
);

export default WebAppsPage;
