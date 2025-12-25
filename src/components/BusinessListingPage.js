import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  CircularProgress, 
  Card, 
  CardMedia, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Link,
  Tabs,
  Tab
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LocalOfferIcon from '@mui/icons-material/LocalOffer'; // Icon for category/service
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Icon for location
import NearMeIcon from '@mui/icons-material/NearMe'; // <-- Add this import
import axios from 'axios';
import './BusinessListingPage.css';
import { styled } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS, getApiUrl, API_BASE_URL } from '../config/apiConfig';
import MetaData from './MetaData';

// Base URL for assets
const ASSET_BASE_URL = 'https://ind.5bestincity.com';

// Function to render Material-UI stars (Keep this function)
const renderStars = (rating) => {
  const stars = [];
  const totalStars = 5;
  
  for (let i = 1; i <= totalStars; i++) {
    if (i <= rating) {
      stars.push(<StarIcon key={`star-${i}`} className="star-icon" />);
    } else if (i - 0.5 <= rating) {
      stars.push(<StarHalfIcon key={`star-${i}`} className="star-icon" />);
    } else {
      stars.push(<StarOutlineIcon key={`star-${i}`} className="star-icon" />);
    }
  }
  return <Box className="stars-container">{stars}</Box>;
};

// Function to parse HTML and extract data
const parseBusinessData = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  
  const cardElement = doc.querySelector('.business-card');
  if (!cardElement) return null;

  const data = {};

  // Profile URL
  data.profileUrl = cardElement.querySelector('a')?.href || '#';

  // Image URLs
  data.imageUrls = Array.from(cardElement.querySelectorAll('.image-slider img'))
                          .map(img => img.src)
                          .filter(src => !!src);
  if (data.imageUrls.length === 0) {
    // Add default image if none found
    data.imageUrls.push(`${ASSET_BASE_URL}/assets/img/logo-small.png`); 
  }

  // Badge URLs
  data.badgeUrls = Array.from(cardElement.querySelectorAll('.badge-icon img'))
                          .map(img => {
                             const src = img.getAttribute('src');
                             return src?.startsWith('/') ? ASSET_BASE_URL + src : src;
                           })
                           .filter(src => !!src);

  // Business Name
  data.name = cardElement.querySelector('.business-name')?.textContent?.trim() || 'N/A';

  // Rating
  const starsDiv = cardElement.querySelector('.stars');
  let rating = 5; // Default
  if (starsDiv) {
    // Updated selector to match the actual API response
    const filledStars = starsDiv.querySelectorAll('.fas.fa-star.filled').length;
    // Check for half stars if any exist
    const halfStars = starsDiv.querySelectorAll('.fas.fa-star-half.filled').length;
    rating = filledStars + (halfStars * 0.5);
    
    // Fallback: if we didn't detect any stars with the new selectors, try counting all filled stars
    if (filledStars === 0 && halfStars === 0) {
      const allFilledElements = starsDiv.querySelectorAll('.filled');
      rating = allFilledElements.length;
    }
    
    // Ensure rating is valid (between 0-5)
    rating = Math.min(5, Math.max(0, rating));
  }
  data.rating = rating;

  // Category Text
  const categoryDiv = cardElement.querySelector('.business-category');
  data.categoryText = categoryDiv?.textContent?.replace(categoryDiv.querySelector('i')?.textContent || '', '').trim() || '';
  
  // Location Text
  const locationDiv = cardElement.querySelector('.business-location span');
  data.locationText = locationDiv?.textContent?.trim() || '';

  return data;
};

// Add these styled components
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

const StyledTabs = styled(Tabs)({
  marginTop: '22px',
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

// Update the NearMeButton component to accept viewMode as a prop
const NearMeButton = ({ setBusinesses, setPage, setHasMore, setViewMode, setLoading, viewMode }) => {
  const [animate, setAnimate] = useState(false);
  const [isActive, setIsActive] = useState(viewMode === 'nearby'); // Initialize based on current viewMode
  const [buttonLoading, setButtonLoading] = useState(false); // Add loading state for button
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isActive) { // Only animate when not active
        setAnimate(true);
        setTimeout(() => setAnimate(false), 500); // Keep animation short
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  const handleClick = () => {
    const newActiveState = !isActive;
    
    // Scroll to top immediately
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    if (newActiveState) {
      // Switching to "nearby" mode
      if (navigator.geolocation) {
        // Start button loading
        setButtonLoading(true);
        
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
          const r = Math.floor(Math.random() * 10000);
          
          // Show loading indicator
          setLoading(true);
          setBusinesses([]); // Clear existing businesses
          setPage(1);      // Reset page
          setHasMore(true); // Keep hasMore true to allow infinite scroll
          setViewMode('nearby'); // Set viewMode to nearby
          
          fetch(`${API_BASE_URL}find-nearby-cities-app.php?lat=${latitude}&lon=${longitude}&r=${r}`)
            .then(response => response.json())
            .then(data => {
              if (data.cities && data.cities.length > 0) {
                const cityIds = data.cities.map(city => city.city_id).join(',');
                const random = Math.floor(Math.random() * 10000);
                
                return fetch(`${API_BASE_URL}all-nearby-list-app.php?city_id=${cityIds}&random=${random}`);
              } else {
                console.log("No nearby cities found.");
                alert("Could not find any registered cities near your location.");
                setBusinesses([]); // Ensure list is empty
                setLoading(false);
                setViewMode('all'); // Switch back to all mode
                setPage(1); // Reset page for regular fetch
                setIsActive(false); // Reset active state since we couldn't find nearby cities
                setButtonLoading(false); // Stop button loading
                return Promise.reject("No nearby cities"); 
              }
            })
            .then(response => {
                if (!response) return; // Skip if previous promise was rejected
                return response.json();
            })
            .then(data => {
               if (data && data.businesses && data.businesses.length > 0) {
                 // Parse the HTML strings into business data objects
                 const parsedNearbyBusinesses = data.businesses
                                                  .map(parseBusinessData) // Use the existing parser
                                                  .filter(data => data !== null); 

                 setBusinesses(parsedNearbyBusinesses); // Update state with parsed data
                 setHasMore(data.has_more); // Set hasMore based on API response
                 
                 // Only set button to active state on successful data
                 setIsActive(true);
                 
                 // Even if there are no more nearby businesses, keep the button active
                 if (!data.has_more) {
                   console.log("No more nearby businesses available but keeping button active");
                 }
                 
               } else if (data) {
                   console.log("Nearby cities found, but no businesses listed for them.");
                   alert("Found nearby cities, but no businesses listed for them.");
                   setBusinesses([]); // Clear list
                   setViewMode('all'); // Switch back to all mode
                   setPage(1); // Reset page for regular fetch
                   setIsActive(false); // Reset active state since we found no businesses
               }
               setLoading(false);
               setButtonLoading(false); // Stop button loading
            })
            .catch(error => {
              if (error !== "No nearby cities") { 
                 console.error("Error fetching nearby businesses:", error);
                 alert("Could not fetch nearby businesses. Please try again later.");
                 setBusinesses([]); // Clear list on error
                 setViewMode('all'); // Switch back to all mode
                 setPage(1); // Reset page for regular fetch
                 setIsActive(false); // Reset active state on error
              }
              setLoading(false);
              setButtonLoading(false); // Stop button loading
            });
        }, (error) => {
            console.error("Geolocation error:", error);
            alert("Could not get your location. Please ensure location services are enabled and permissions are granted.");
            setBusinesses([]); // Clear list on geo error
            setLoading(false);
            setViewMode('all'); // Stay in all mode
            setIsActive(false); // Reset active state on error
            setButtonLoading(false); // Stop button loading
        });
      } else {
        alert("Geolocation is not supported by your browser");
        setIsActive(false); // Reset active state if geolocation not supported
      }
    } else {
      // Switching to "all" mode - reset to normal view
      setViewMode('all');
      setPage(1);
      setHasMore(true);
      setBusinesses([]); // Clear businesses to start fresh
      setLoading(true);
      setIsActive(false); // Make sure active state is false
      
      // Let the regular fetchBusinesses handle loading the data
      // It will be triggered by the useEffect watching viewMode and page
    }
  };
  
  // Remove the useEffect that was resetting active state when viewMode changes
  
  return (
    <button 
      className={`near-me-button ${animate ? 'animate' : ''} ${isActive ? 'active' : ''}`}
      onClick={handleClick}
      aria-label="Find Businesses Near Me" 
      disabled={buttonLoading}
    >
      <div className="near-me-content">
        {buttonLoading ? (
          <CircularProgress size={24} sx={{ color: '#fff' }} />
        ) : (
          <>
            <NearMeIcon />
            <div className="near-me-text">Near Me</div>
          </>
        )}
      </div>
    </button>
  );
};

const BusinessListingPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState('all'); // Add viewMode state to track current view
  const observer = useRef();
  const loadingRef = useRef(null); // Use ref for intersection observer target
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0); // 0 = "All Verified" for business page

  const fetchBusinesses = useCallback(async () => {
    setLoading(true);
    try {
      const random = Math.floor(Math.random() * 10000);
      
      // If we've reached the end of nearby data but keeping viewMode as 'nearby'
      // we should load from the regular endpoint but NOT switch modes
      if (viewMode === 'nearby' && page > 1 && !hasMore) {
        console.log(`Continuing to load regular businesses (page ${page}) while maintaining nearby mode`);
        
        // Load from regular endpoint but keep viewMode as 'nearby'
        const response = await axios.get(
          `${API_BASE_URL}all-featured-list-app.php?page=${page}&cities=&categories=&random=${random}`
        );
        
        const parsedBusinesses = response.data.businesses
                                  .map(parseBusinessData)
                                  .filter(data => data !== null);
        
        setBusinesses(prev => [...prev, ...parsedBusinesses]);
        setHasMore(response.data.has_more);
        setLoading(false);
        return;
      }
      
      // If we're in "all" mode, fetch from the original endpoint
      if (viewMode === 'all') {
        const response = await axios.get(
          `${API_BASE_URL}all-featured-list-app.php?page=${page}&cities=&categories=&random=${random}`
        );
        
        const parsedBusinesses = response.data.businesses
                                  .map(parseBusinessData)
                                  .filter(data => data !== null);

        setBusinesses(prev => [...prev, ...parsedBusinesses]);
        setHasMore(response.data.has_more);
      } 
      // If we're in "nearby" mode and there are more pages, we would fetch more here
      // Currently, the nearby API doesn't seem to support pagination, so we just log it
      else if (viewMode === 'nearby' && page > 1) {
        console.log("Reached end of nearby results, will continue with regular listings");
        
        // Load from regular endpoint but keep viewMode as 'nearby'
        const response = await axios.get(
          `${API_BASE_URL}all-featured-list-app.php?page=${page-1}&cities=&categories=&random=${random}`
        );
        
        const parsedBusinesses = response.data.businesses
                                  .map(parseBusinessData)
                                  .filter(data => data !== null);
        
        setBusinesses(prev => [...prev, ...parsedBusinesses]);
        setHasMore(response.data.has_more);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setHasMore(false); // Stop fetching on error
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [page, viewMode, hasMore]);

  // Infinite scroll observer setup
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '200px', // Load slightly earlier
      threshold: 0, // Trigger as soon as visible
    };

    const currentObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && !initialLoading) {
        // 1) If we finished nearby list (hasMore === false) switch to loading from all feed
        // but keep the viewMode as 'nearby' to maintain the button state
        if (viewMode === 'nearby' && !hasMore) {
          console.log("End of nearby data, loading from regular feed while maintaining nearby mode");
          // Do NOT change viewMode here - keep it as 'nearby'
          
          // Instead directly trigger a fetch from the regular endpoint
          const fetchRegularBusinesses = async () => {
            setLoading(true);
            try {
              const random = Math.floor(Math.random() * 10000);
              const response = await axios.get(
                `${API_BASE_URL}all-featured-list-app.php?page=1&cities=&categories=&random=${random}`
              );
              
              const parsedBusinesses = response.data.businesses
                .map(parseBusinessData)
                .filter(data => data !== null);
              
              setBusinesses(prev => [...prev, ...parsedBusinesses]);
              setHasMore(response.data.has_more);
              setPage(2); // Set to page 2 for next fetch
            } catch (error) {
              console.error('Error fetching businesses:', error);
              setHasMore(false);
            } finally {
              setLoading(false);
            }
          };
          
          fetchRegularBusinesses();
          return;
        }

        // 2) Normal infinite‑scroll when more data is available
        if (hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      }
    }, options);

    const currentLoadingRef = loadingRef.current;
    if (currentLoadingRef) {
      currentObserver.observe(currentLoadingRef);
    }

    return () => {
      if (currentLoadingRef) {
        currentObserver.unobserve(currentLoadingRef);
      }
    };
  }, [hasMore, loading, initialLoading, viewMode]);

  // Fetch initial data
  useEffect(() => {
    // Initial load in "all" mode always fetches page 1
    if (viewMode === 'all' && page === 1) {
      fetchBusinesses();
    } 
    // In "nearby" mode, the NearMeButton fetches the data, so we don't need to do it here
  }, [fetchBusinesses, viewMode]);

  // Fetch subsequent pages when page number increments
  useEffect(() => {
    if (page > 1) {
      fetchBusinesses();
    }
  }, [page, fetchBusinesses]);

  // Add this handler
  const handleTabChange = (event, newValue) => {
    if (newValue === 1) { // When "Show All" is clicked
      navigate('/cities'); // Navigate to cities page
    }
  };

  // Loading animation component
  const LoadingAnimation = ({ message }) => (
    <Box className="page-loader-container">
      <CircularProgress sx={{ color: '#cf5f39' }} /> {/* Hardcoded blue color */}
      <div className="loading-text">{message}</div>
    </Box>
  );

  if (initialLoading) {
    return (
      <Box className="full-page-loader">
        <LoadingAnimation message="Loading Verified Businesses..." />
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Tab Panel */}
      <Box 
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
          marginTop: '0px',
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

      {/* Content Area */}
      <Box sx={{ padding: '12px', minHeight: 'calc(100vh - 80px)' }}>
        <Grid container spacing={1} className="business-grid">
          {businesses.map((business, index) => (
            <Grid item key={`${business.profileUrl}-${index}`} xs={12} sm={6} md={4} lg={3}>
              <Link href={business.profileUrl} underline="none" target="_blank" rel="noopener noreferrer">
                <Card className="business-card-mui" 
                      elevation={0}
                      sx={{ 
                        animation: `fadeInUp ${0.2 + index % 10 * 0.05}s ease-out forwards`,
                        animationDelay: `${index % 10 * 0.05}s`
                      }}>
                  {/* === Image === */}
                  {business.imageUrls.length > 0 && (
                    <CardMedia
                      component="img"
                      className="business-image-mui"
                      image={business.imageUrls[0]}
                      alt={`${business.name} image`}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                    />
                  )}

                  {/* === Badge Container - Moved Here === */}
                  {business.badgeUrls.length > 0 && (
                    <Box className="badge-container-mui">
                      {business.badgeUrls.map((url, idx) => (
                        <img 
                          key={`badge-${idx}`} 
                          src={url} 
                          alt="badge" 
                          className="badge-image-mui" 
                          loading="lazy"
                          decoding="async"
                          fetchpriority="low"
                        />
                      ))}
                    </Box>
                  )}

                  {/* === Content === */}
                  <CardContent className="business-content-mui">
                    {/* Name */}
                    <Typography variant="h6" className="business-name-mui">
                      {business.name}
                    </Typography>
                    
                    {/* Stars */}
                    {renderStars(business.rating)}

                    {/* Category */}
                    {business.categoryText && (
                      <Typography variant="body2" className="business-category-mui">
                        <LocalOfferIcon className="inline-icon" /> {business.categoryText}
                      </Typography>
                    )}

                    {/* Location */}
                    {business.locationText && (
                      <Typography variant="body2" className="business-location-mui">
                        <LocationOnIcon className="inline-icon" /> {business.locationText}
                      </Typography>
                    )}

                    {/* Button */}
                    <Button variant="contained" className="view-profile-btn-mui" fullWidth>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
        
        {/* Loading indicator at bottom */}
        <Box 
          ref={loadingRef}
          sx={{ height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}
        >
          {loading && !initialLoading && <LoadingAnimation message="Loading More Businesses..." />}
          {!loading && !hasMore && businesses.length > 0 && (
              <Typography sx={{ color: '#777', mt: 2 }}>No more businesses found.</Typography>
          )}
          {/* Add message for empty results */}
          {!loading && businesses.length === 0 && !initialLoading && (
              <Typography sx={{ color: '#777', mt: 2 }}>No businesses found.</Typography>
          )}
        </Box>
      </Box>
      {/* Pass viewMode along with other props */}
      <NearMeButton 
        setBusinesses={setBusinesses}
        setPage={setPage}
        setHasMore={setHasMore} 
        setViewMode={setViewMode}
        setLoading={setLoading}
        viewMode={viewMode}
      />
    </Box>
  );
};

export default BusinessListingPage; 