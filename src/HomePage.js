import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Container, Grid, Typography, Card, CardContent, CardMedia, CircularProgress, Box, TextField, InputAdornment, IconButton, Button } from '@mui/material';
import { debounce } from '@mui/material/utils';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { openDB } from 'idb'; // Import idb library for IndexedDB interaction
import { Tooltip } from '@mui/material';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import PushPinIcon from '@mui/icons-material/PushPin';
import ShareIcon from '@mui/icons-material/Share';
import { CardActionArea } from '@mui/material';
import { styled } from '@mui/material/styles';
import he from 'he';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Snackbar, Alert } from '@mui/material';
import { Chip } from '@mui/material';
import { PushPin as PushPinFilledIcon } from '@mui/icons-material'; // Updated Icons
import FooterComponent from './FooterComponent';
import { v4 as uuidv4 } from 'uuid';
import {
  colors
} from './theme-styles';
import { API_ENDPOINTS,DEFAULT_IMAGE_BASE_URL,VIEW_MORE_LINK } from './config/apiConfigext';
import { BADGE_IMAGE_BASE_URL } from './config/apiConfig';
import { keyframes } from '@mui/material/styles';
import MetaData from './components/MetaData';

import './styles/master.css';
import './styles/custom-styles.css';

// First, import the CollectionCard component at the top of the file
import CollectionCard from './components/collections/CollectionCard';

// First, add the import for ListingCard at the top of HomePage.js
import ListingCard from './components/5best/ListingCard';

// Add import for ProductCard
import ProductCard from './components/amazon/ProductCard';

import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Add this near the top of the file, after imports
const ViewMore = ({ href, color = '#2196f3', hoverColor = '#1976d2' }) => (
  <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}
      >
  <Button
    variant="contained"
    onClick={() => window.location.href = VIEW_MORE_LINK+href}
    sx={{
      marginLeft: '0px',
      marginTop: '22px',
      backgroundColor: colors.app_primary,
      color: 'white',
      borderRadius: '20px',
      padding: '8px 24px',
      textTransform: 'none',
      fontWeight: 600,
      boxShadow: `0 4px 12px ${color}33`,
      '&:hover': {
        backgroundColor: hoverColor,
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 16px ${color}4D`,
      },
      transition: 'all 0.3s ease',
    }}
  >
    View More
  </Button>
  </Box>
);

// Add these imports at the top of the file


// Add the glowPulse animation definition
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

// Add this near the top of the file with other imports

// Component for HomePage
const HomePage = () => {
  const [webappProducts, setWebappProducts] = useState([]);
  const [amazonProducts, setAmazonProducts] = useState([]);
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [popularLinks, setPopularLinks] = useState([]);
  const [categoryLinks, setCategoryLinks] = useState([]);
  const [searchEngines, setSearchEngines] = useState([]);
  const [pinnedCollections, setPinnedCollections] = useState([]); // State for pinned collections
  const [pinnedBusinesses, setPinnedBusinesses] = useState([]); // State for pinned businesses
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllPopularLinks, setShowAllPopularLinks] = useState(false);
  const [headerBanner, setHeaderBanner] = useState([]);
  const [footerBanner, setFooterBanner] = useState([]);
  const [likedCollections, setLikedCollections] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [featuredBusinesses, setFeaturedBusinesses] = useState([]);
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [likedItems, setLikedItems] = useState({});
  const [businessSearchResults, setBusinessSearchResults] = useState([]);
  const [collectionsData, setCollectionsData] = useState([]); // Assuming this data is fetched from collectionsapi.php
  const [isSearching, setIsSearching] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [searchEngineIcon, setSearchEngineIcon] = useState(null);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [showEngines, setShowEngines] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [clickedCardId, setClickedCardId] = useState(null);
  const [collectionProductsPin, setCollectionProductsPin] = useState([]);
  const [pinnedSearchResults, setPinnedSearchResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [isHandlingBack, setIsHandlingBack] = useState(false);
  const [isBackNavigating, setIsBackNavigating] = useState(false);
  // Add snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
 

  // Add handleClearSearch function
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults({
      businesses: [],
      collections: [],
      amazonProducts: [],
      categoryLinks: [],
      popularLinks: [],
      favoriteCollections: [],
      pinnedBusinesses: []
    });
    setPinnedSearchResults([]);
    setShowClearButton(false);
    setShowBanner(true);
    setShowEngines(false);
    setIsSearching(false);
	
	// Clear search history
  setSearchHistory([]);
  setCurrentSearchIndex(-1);
  
  // Update browser history
  window.history.replaceState(null, '', window.location.pathname);
  }, []);

  // Add new state for debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const searchResultsRef = useRef(null);
  
  // Move scrollToSearchResults before debouncedSearch
  const scrollToSearchResults = useCallback(() => {
    if (searchResultsRef.current) {
      // Get viewport height and adjust for mobile keyboard
      const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
      const scrollOffset = window.visualViewport ? window.visualViewport.offsetTop : 0;
      
      // Calculate position
      const elementTop = searchResultsRef.current.getBoundingClientRect().top;
      const offsetPosition = elementTop + window.pageYOffset - scrollOffset;

      // Smooth scroll to adjusted position
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Create memoized debounced search function
const debouncedSearch = useMemo(
  () =>
    debounce(async (searchValue) => {
      if (!searchValue.trim()) {
        setSearchResults({
          businesses: [],
          collections: [],
          amazonProducts: [],
          categoryLinks: [],
          popularLinks: [],
          favoriteCollections: [],
          pinnedBusinesses: []
        });
        setPinnedSearchResults([]);
        setShowClearButton(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      try {
        const db = await openDB('collectionsDB', 3);
        const pinnedItems = await db.getAll('pins');
        
        // Filter business pins
        const businessPins = pinnedItems.filter(pin => 
          pin.type === 'business' && 
          pin.action === 'pin' &&
          pin.dataId
        );

        // Get pinned business details
        const pinnedBusinessPromises = businessPins.map(pin =>
          axios.get(`${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${pin.dataId.replace('business_', '')}`)
            .then(response => response.data)
            .catch(error => {
              console.error(`Error fetching business details for ${pin.dataId}:`, error);
              return null;
            })
        );

        const pinnedBusinessesDetails = (await Promise.all(pinnedBusinessPromises))
          .filter(business => business !== null)
          .filter(business => {
            const searchLower = searchValue.toLowerCase();
            const businessName = business.listdata?.business_name?.toLowerCase() || '';
            const businessDescription = business.listdata?.business_description?.toLowerCase() || '';
            const businessAddress = business.listdata?.business_address?.toLowerCase() || '';
            
            return businessName.includes(searchLower) || 
                   businessDescription.includes(searchLower) || 
                   businessAddress.includes(searchLower);
          });

        // Get pinned collection IDs
        const pinnedCollectionPins = pinnedItems.filter(pin => 
          pin.type === 'collection' && 
          pin.action === 'pin' &&
          pin.dataId
        );

        const pinnedCollectionIds = pinnedCollectionPins
          .map(pin => pin.dataId)
          .filter(id => id)
          .join(',');

        // Make all API calls in parallel
        const [
          amazonResponse, 
          collectionsResponse, 
          categoryLinksResponse, 
          popularLinksResponse,
          featuredBusinessResponse
        ] = await Promise.all([
          axios.get(`${API_ENDPOINTS.AMAZON}?search=${encodeURIComponent(searchValue)}&page=1&is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.COLLECTIONS}?filterCategory=&searchTerm=${encodeURIComponent(searchValue)}&is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.WEB_APPS}?search=${encodeURIComponent(searchValue)}&is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.WEB_APPS}?is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.FEATURED_BIZ}?search=${encodeURIComponent(searchValue)}`)
        ]);

        // Fetch pinned collections separately if we have any
        let pinnedCollectionsData = [];
        if (pinnedCollectionIds) {
          const pinnedResponse = await axios.get(
            `${API_ENDPOINTS.COLLECTIONS}?ids=${pinnedCollectionIds}`
          );
          
          // Filter pinned collections to only show ones that match the search term
          pinnedCollectionsData = (pinnedResponse.data?.collectionsdata || [])
            .filter(collection => {
              const searchLower = searchValue.toLowerCase();
              return (
                collection.title?.toLowerCase().includes(searchLower) ||
                collection.description?.toLowerCase().includes(searchLower)
              );
            });
        }

        // Process category links
        const formattedCategoryLinks = categoryLinksResponse?.data?.linkdata?.map(category => ({
          ...category,
          items: category.links || []
        })) || [];

        // Process popular links
        const filteredPopularLinks = popularLinksResponse?.data?.popular_links?.filter(link =>
          link && (
            (link?.link_name || '').toLowerCase().includes(searchValue.toLowerCase()) ||
            (link?.link_description || '').toLowerCase().includes(searchValue.toLowerCase())
          )
        ) || [];

        // Process featured businesses
        const featuredBusinessIds = featuredBusinessResponse?.data?.status === 'success' 
          ? featuredBusinessResponse.data.data.split(',').filter(id => id.trim())
          : [];

        let featuredBusinesses = [];
        if (featuredBusinessIds.length > 0) {
          const businessDetailsPromises = featuredBusinessIds.map(id =>
            axios.get(`${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${id}`)
              .then(response => response.data)
              .catch(error => {
                console.error(`Error fetching business details for ${id}:`, error);
                return null;
              })
          );

          featuredBusinesses = (await Promise.all(businessDetailsPromises))
            .filter(business => business !== null);
        }

        // Get regular collections (excluding pinned ones)
        const regularCollections = (collectionsResponse.data?.collectionsdata || [])
          .filter(collection => 
            !pinnedCollectionsData.some(
              pinnedCollection => pinnedCollection.data_id === collection.data_id
            )
          );

        // Set all search results
        setSearchResults({
          businesses: featuredBusinesses,
          collections: regularCollections,
          amazonProducts: amazonResponse?.data?.amazondata || [],
          categoryLinks: formattedCategoryLinks,
          popularLinks: filteredPopularLinks,
          favoriteCollections: pinnedCollectionsData, // Using pinned collections as favorite collections
          pinnedBusinesses: pinnedBusinessesDetails
        });

        // Set pinned search results separately
        setPinnedSearchResults(pinnedCollectionsData);

        // Handle scroll
        setTimeout(() => {
          const isKeyboardOpen = window.visualViewport && 
            (window.innerHeight - window.visualViewport.height > 150);

          if (isKeyboardOpen) {
            setTimeout(scrollToSearchResults, 300);
          } else {
            scrollToSearchResults();
          }
        }, 100);

      } catch (error) {
        console.error('Error fetching search results:', error);
        setSnackbarMessage('Error fetching search results');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        
        setSearchResults({
          businesses: [],
          collections: [],
          amazonProducts: [],
          categoryLinks: [],
          popularLinks: [],
          favoriteCollections: [],
          pinnedBusinesses: []
        });
        setPinnedSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 800),
  [scrollToSearchResults]
);

  // Listen for pin status changes
  useEffect(() => {
    const handlePinStatusChange = async (event) => {
      const { collectionId, isPinned } = event.detail;
      
      try {
        if (isPinned) {
          // Find the collection from all available collections
          const combinedCollections = [...collectionProductsPin, ...collectionProducts];
          const collectionToAdd = combinedCollections.find(
            prod => String(prod.data_id) === String(collectionId)
          );
          
          if (collectionToAdd) {
            // Update pinnedCollections with the new pin
            setPinnedCollections(prev => [
              ...prev,
              { dataId: collectionId, action: 'pin' }
            ]);
            
            setSnackbar({
              open: true,
              message: 'Collection pinned successfully',
              severity: 'success'
            });
          }
        } else {
          // Remove from pinnedCollections
          setPinnedCollections(prev => 
            prev.filter(pin => String(pin.dataId) !== String(collectionId))
          );
          
          setSnackbar({
            open: true,
            message: 'Collection unpinned successfully',
            severity: 'success'
          });
        }
      } catch (error) {
        console.error('Error handling pin status change:', error);
        setSnackbar({
          open: true,
          message: 'Error updating pinned collections',
          severity: 'error'
        });
      }
    };

    window.addEventListener('pinStatusChanged', handlePinStatusChange);
    return () => window.removeEventListener('pinStatusChanged', handlePinStatusChange);
  }, [collectionProducts, collectionProductsPin]);

  // Add validPinnedCollections computation
  const validPinnedCollections = useMemo(() => {
    return pinnedCollections.filter(pin => 
      pin?.action === 'pin' && 
      pin?.dataId && 
      [...collectionProductsPin, ...collectionProducts].some(
        prod => String(prod.data_id) === String(pin.dataId)
      )
    );
  }, [pinnedCollections, collectionProducts, collectionProductsPin]);

  // Add business pin handling function
  const handleBusinessPinClick = async (businessId) => {
    // Get current pin status - check both pinnedBusinesses and search results
    const isCurrentlyPinned = pinnedBusinesses.some(
      business => business.listdata.listing_id === businessId
    ) || (searchResults.pinnedBusinesses || []).some(
      business => business.listdata.listing_id === businessId
    );
    const currentAction = isCurrentlyPinned ? 'unpin' : 'pin';

    // Immediately update UI state
    setPinnedBusinesses(prev => {
      if (currentAction === 'unpin') {
        return prev.filter(business => business.listdata.listing_id !== businessId);
      } else {
        // Check if we already have the business data in any of our lists
        const existingBusiness = [
          ...prev,
          ...featuredBusinesses,
          ...(searchResults.businesses || []),
          ...(searchResults.pinnedBusinesses || [])
        ].find(business => business?.listdata?.listing_id === businessId);

        if (existingBusiness && !prev.some(b => b.listdata.listing_id === businessId)) {
          return [...prev, existingBusiness];
        }
      }
      return prev;
    });

    // Also update search results if needed
    if (searchResults.pinnedBusinesses) {
      setSearchResults(prev => ({
        ...prev,
        pinnedBusinesses: currentAction === 'unpin'
          ? (prev.pinnedBusinesses || []).filter(business => business.listdata.listing_id !== businessId)
          : prev.pinnedBusinesses
      }));
    }

    // Show initial status
    setSnackbarMessage(currentAction === 'pin' ? 'Pinning...' : 'Unpinning...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);

    try {
      // Run async operations in parallel
      const [db, businessDetails] = await Promise.all([
        openDB('collectionsDB', 3),
        currentAction === 'pin' && !pinnedBusinesses.some(b => b.listdata.listing_id === businessId)
          ? axios.get(`${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${businessId}`).catch(() => null)
          : Promise.resolve(null)
      ]);

      // Update IndexedDB
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      const pinData = {
        dataId: `business_${businessId}`,
        pinid: businessId,
        type: 'business',
        timestamp: new Date().toISOString(),
        action: currentAction,
        synced: false,
        synced_at: null,
        metadata: {}
      };

      await pinStore.put(pinData);

      // Update business details if we got them
      if (businessDetails?.data) {
        setPinnedBusinesses(prev => {
          if (!prev.some(b => b.listdata.listing_id === businessId)) {
            return [...prev, businessDetails.data];
          }
          return prev;
        });
      }

      // Show success message
      setSnackbarMessage(
        currentAction === 'pin' 
          ? 'Business pinned successfully' 
          : 'Business unpinned successfully'
      );
      setSnackbarSeverity('success');

    } catch (error) {
      console.error('Error handling business pin:', error);
      
      // Show error message
      setSnackbarMessage('Error updating pin status');
      setSnackbarSeverity('error');

      // Revert UI state on error
      setPinnedBusinesses(prev => {
        if (currentAction === 'unpin') {
          const business = [...featuredBusinesses, ...searchResults.businesses]
            .find(b => b.listdata.listing_id === businessId);
          return business ? [...prev, business] : prev;
        } else {
          return prev.filter(business => business.listdata.listing_id !== businessId);
        }
      });

      // Revert search results state on error
      if (searchResults.pinnedBusinesses) {
        setSearchResults(prev => ({
          ...prev,
          pinnedBusinesses: currentAction === 'unpin'
            ? [...(prev.pinnedBusinesses || []), 
               ...(prev.businesses || []).filter(b => b.listdata.listing_id === businessId)]
            : (prev.pinnedBusinesses || []).filter(b => b.listdata.listing_id !== businessId)
        }));
      }
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Define state for like counts (stores the count of likes for each collection)
  const [likeCounts, setLikeCounts] = useState({});
  
  const [searchResults, setSearchResults] = useState({
  businesses: [],
  collections: [],
  amazonProducts: [],
  categoryLinks: [],
  popularLinks: [],
  favoriteCollections: [],
  pinnedBusinesses: []
});

  const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

  // Handler to toggle "View More" and show all popular links
  
const initializeDatabase = async () => {
  try {
    const db = await openDB('collectionsDB', 3, {
      upgrade(db) {
        // Likes store for local user state
        if (!db.objectStoreNames.contains('likes')) {
          const likeStore = db.createObjectStore('likes', { keyPath: 'id' });
          likeStore.createIndex('byCollection', 'collectionId');
          likeStore.createIndex('byUser', 'userId');
          
          // Add default empty like entry
          likeStore.put({
            id: 'default',
            collectionId: '',
            userId: '',
            timestamp: new Date().toISOString()
          });
        }

        // Store for cached global counts
        if (!db.objectStoreNames.contains('globalCounts')) {
          const globalCountStore = db.createObjectStore('globalCounts', { keyPath: 'collectionId' });
          
          // Add default empty count entry
          globalCountStore.put({
            collectionId: 'default',
            count: 0,
            lastUpdated: new Date().toISOString()
          });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'userId' });
          
          // Add default empty user entry
          userStore.put({
            userId: 'default',
            value: '',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            preferences: {},
            settings: {}
          });
        }

        // Updated Pins store with new structure
        if (!db.objectStoreNames.contains('pins')) {
          const pinsStore = db.createObjectStore('pins', { keyPath: 'dataId' });
          pinsStore.createIndex('byType', 'type');
          pinsStore.createIndex('byTimestamp', 'timestamp');
          pinsStore.createIndex('byAction', 'action');
          
          // Add default empty pin entry with new structure
          pinsStore.put({
            dataId: 'default',
            pinid: '',
            type: '',
            timestamp: new Date().toISOString(),
            action: 'unpin', // Default action is unpin
            synced: false,
            synced_at: null,
            metadata: {}
          });
        }
      }
    });

    // Initialize user
    const userId = await ensureUserExists(db);
    
    // Fetch initial global counts
    await refreshGlobalCounts();
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

const fetchGlobalCounts = async () => {
  try {
    const response = await axios.get(API_ENDPOINTS.GET_COUNTS);
    return response.data.counts || {};
  } catch (error) {
    console.error('Error fetching global counts:', error);
    return {};
  }
};

const updateGlobalCount = async (collectionId, increment) => {
  try {
     const response = await axios.post(API_ENDPOINTS.UPDATE_COUNT, {
      collectionId,
      increment: increment ? 1 : -1,
    });
    return response.data.newCount;
  } catch (error) {
    console.error('Error updating global count:', error);
    throw error;
  }
};

const refreshGlobalCounts = async () => {
  try {
    const counts = await fetchGlobalCounts();
    const db = await openDB('collectionsDB', 3);
    
    // Update IndexedDB cache
    const tx = db.transaction('globalCounts', 'readwrite');
    const store = tx.objectStore('globalCounts');
    
    for (const [collectionId, count] of Object.entries(counts)) {
      await store.put({
        collectionId,
        count,
        lastUpdated: new Date().toISOString()
      });
    }
    
    return counts;
  } catch (error) {
    console.error('Error refreshing global counts:', error);
    return {};
  }
};

// Add these state declarations at the top of your component
const [activeEngines, setActiveEngines] = useState([]);

// Add this effect to set initial active engines - runs only once
useEffect(() => {
  const defaultEngines = searchEngines
    .filter(engine => engine.selected === 'true')
    .map(engine => ({
      name: engine.searchenginename,
      url: engine.searchengineurl,
      image: engine.searchengineimage
    }));
  setActiveEngines(defaultEngines);
}, [searchEngines]);

// Simplified search handler
const handleSearch = (event) => {
  // Return if no query or no active engines
  if (!searchQuery.trim() || !activeEngines.length) return;

  // For Enter key, check if it's the right key
  if (event.type === 'keypress' && event.key !== 'Enter') return;

  // Create search URL
  const searchUrls = activeEngines
    .map(engine => `${engine.url}${encodeURIComponent(searchQuery.trim())}`)
    .join('/~');

  // Open in new tab
  window.open(`collections:${searchUrls}`, '_blank');
};

// Simplified engine toggle
const toggleEngine = (engineName) => {
  const engine = searchEngines.find(e => e.searchenginename === engineName);
  if (!engine) return;

  setActiveEngines(prev => {
    const isActive = prev.some(e => e.name === engineName);
    if (isActive) {
      return prev.filter(e => e.name !== engineName);
    }
    return [...prev, {
      name: engine.searchenginename,
      url: engine.searchengineurl,
      image: engine.searchengineimage
    }];
  });
};

// 2. User Management
const ensureUserExists = async (db) => {
  const userStore = db.transaction('users', 'readwrite').objectStore('users');
  const existingUser = await userStore.get('current_user');
  
  if (!existingUser) {
    const userId = generateUserId();
    await userStore.put({
      userId: 'current_user',
      value: userId,
      createdAt: new Date().toISOString()
    });
    return userId;
  }
  
  return existingUser.value;
};

useEffect(() => {
  initializeDatabase();
}, []);

// Add initial search state handling
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('q');
  
  if (initialSearch) {
    setSearchQuery(initialSearch);
    setShowBanner(false);
    setShowEngines(true);
    setShowClearButton(true);
    debouncedSearch(initialSearch);
    
    // Add initial state to history
    window.history.replaceState({ search: initialSearch }, '', window.location.search);
  }
}, []);

// Add useEffect for fetching pinned collections
useEffect(() => {
  const fetchPinnedCollectionsData = async () => {
  try {
    const db = await openDB('collectionsDB', 3);
    const allPins = await db.getAll('pins') || [];
    
      // Filter only valid collection pins that are pinned
      const pinnedCollectionPins = allPins.filter(pin => 
      pin?.type === 'collection' && 
      pin?.dataId && 
      pin?.action === 'pin'
    );
    
      // Get the collection data for each pinned item
      const pinnedCollectionsWithData = pinnedCollectionPins.map(pin => {
        const collection = [...collectionProducts, ...collectionProductsPin]
          .find(c => c.data_id === pin.dataId);
        
        return {
          ...pin,
          collectionData: collection
        };
      }).filter(item => item.collectionData); // Only keep items where we found the collection data

      setPinnedCollections(pinnedCollectionsWithData);
  } catch (error) {
      console.error('Error fetching pinned collections:', error);
    }
  };

  fetchPinnedCollectionsData();
}, [collectionProducts, collectionProductsPin]); // Re-run when collection data changes
 
  useEffect(() => {
    let isSubscribed = true;

    const fetchAllData = async () => {
      try {
        if (!isSubscribed) return;

        // Get all required data from IndexedDB first
        const db = await openDB('collectionsDB', 3);
        const [pinnedItems, likedItems] = await Promise.all([
          db.getAll('pins'),
          db.getAll('likes')
        ]);

        // Filter business pins
        const businessPins = pinnedItems.filter(pin => 
          pin.type === 'business' && 
          pin.action === 'pin' &&
          pin.dataId
        );

        // Fetch pinned business details
        const pinnedBusinessPromises = businessPins.map(pin => 
          axios.get(`${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${pin.dataId.replace('business_', '')}`)
            .then(response => response.data)
            .catch(error => {
              console.error(`Error fetching business details for ${pin.dataId}:`, error);
              return null;
            })
        );

        const pinnedBusinessesData = (await Promise.all(pinnedBusinessPromises))
          .filter(business => business !== null);

        if (isSubscribed) {
          setPinnedBusinesses(pinnedBusinessesData);
        }

        const pinnedCollectionIds = pinnedItems
          .filter(item => item.dataId)
          .map(item => item.dataId)
          .join(',');

        // Make all API calls in parallel
        const [
          webAppsResponse,
          pinnedCollectionsResponse,
          homePageCollectionsResponse,
          amazonResponse,
          featuredBusinessesResponse
        ] = await Promise.all([
          axios.get(`${API_ENDPOINTS.WEB_APPS}?is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.COLLECTIONS}?ids=${pinnedCollectionIds}`),
          axios.get(`${API_ENDPOINTS.COLLECTIONS}?is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.AMAZON}?is_homepage=yes`),
          axios.get(`${API_ENDPOINTS.FEATURED_BIZ}`)
        ]);

        if (!isSubscribed) return;

        // Set all states from responses
        const webAppsData = webAppsResponse.data;
        setHeaderBanner(webAppsData.header_banner || []);
        setFooterBanner(webAppsData.footer_banner || []);
        setPopularLinks(Array.isArray(webAppsData.popular_links) ? webAppsData.popular_links : []);
        setSearchEngines(webAppsData.searchengine?.searchenginedata || []);
        
        if (webAppsData.linkdata) {
          setCategoryLinks(webAppsData.linkdata.map(category => ({
            category_id: category.category_id,
            category_name: category.category_name,
            category_image: category.category_image,
            links: category.links.slice(0, 3),
          })));
        }

        // Set pinned collections
        if (pinnedCollectionIds) {
          setPinnedCollections(pinnedItems.map(item => ({
            ...item,
            dataId: item.dataId,
            type: item.type || 'collection'
          })));
        }

        // Set homepage collections
        setCollectionProducts(homePageCollectionsResponse.data.collectionsdata || []);
        setCollectionProductsPin(pinnedCollectionsResponse.data.collectionsdata || []);

        // Set amazon products
        setAmazonProducts(amazonResponse.data.amazondata || []);

        // Get featured business IDs from API response and fetch their details
        const featuredBusinessIds = featuredBusinessesResponse.data.status === 'success' 
          ? featuredBusinessesResponse.data.data.split(',').filter(id => id.trim())
          : [];

        if (featuredBusinessIds.length > 0) {
          const businessDetailsPromises = featuredBusinessIds.map(id =>
            axios.get(`${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${id}`)
          );

          const businessDetailsResponses = await Promise.all(businessDetailsPromises);
          const businessDetails = businessDetailsResponses.map(response => response.data);
          setFeaturedBusinesses(businessDetails);
        }

        // Set liked items
        const likedMap = likedItems.reduce((acc, like) => {
          acc[like.collectionId] = true;
          return acc;
        }, {});
        setLikedItems(likedMap);
        setLikedCollections(likedItems.map(item => item.dataId));

      } catch (error) {
        if (isSubscribed) {
          console.error('Error fetching data:', error);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAllData();

    return () => {
      isSubscribed = false;
    };
  }, []); // Empty dependency array
  
  useEffect(() => {
 const fetchLikedCollections = async () => {
    try {
      const db = await openDB('collectionsDB', 3); // Use version 3
      const allLiked = await db.getAll('likes');
      const likedIds = allLiked.map((item) => item.dataId);
      setLikedCollections(likedIds);
    } catch (error) {
      console.error('Error fetching liked collections:', error);
    }
  };
  fetchLikedCollections();
}, []);


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

const handleSearchSubmit = (e) => {
  if (e.key === 'Enter' && searchQuery.trim() !== "") {
    const selectedEngines = searchEngines.filter((engine) => engine.selected === 'true');
    if (selectedEngines.length > 0) {
      const combinedUrls = selectedEngines.map((engine) => {
        return `${engine.searchengineurl}${encodeURIComponent(searchQuery)}`;
      }).join('/~');

      const finalUrl = `collections:${combinedUrls}`;
    //  console.log(finalUrl); // Debugging: check the final URL in console

      // Open the combined URL in a new tab
      window.open(finalUrl, '_blank');
    }
  }
};


const handleLike = async (collectionId, event) => {
  if (event) {
    event.stopPropagation();
  }
  
  try {
    const db = await openDB('collectionsDB', 3);
    const userId = 'current_user';
    const likeId = `${userId}_${collectionId}`; // Consistent like ID format

    // Optimistic UI update
    const isCurrentlyLiked = likedItems[collectionId];
    
    setLikedItems(prev => ({
      ...prev,
      [collectionId]: !isCurrentlyLiked
    }));
    
    setLikeCounts(prev => ({
      ...prev,
      [collectionId]: (prev[collectionId] || 0) + (!isCurrentlyLiked ? 1 : -1)
    }));

    // Update backend
    try {
      const response = await axios.post(API_ENDPOINTS.UPDATE_COUNT, {
        collectionId,
        increment: !isCurrentlyLiked
      });

      if (response.data.success) {
        // Update IndexedDB
        const tx = db.transaction(['likes', 'globalCounts'], 'readwrite');
        const likeStore = tx.objectStore('likes');
        const globalCountsStore = tx.objectStore('globalCounts');

        if (!isCurrentlyLiked) {
          await likeStore.put({
            id: likeId,
            userId,
            collectionId,
            timestamp: new Date().toISOString()
          });
        } else {
          await likeStore.delete(likeId);
        }

        // Update global count
        const newCount = (likeCounts[collectionId] || 0) + (!isCurrentlyLiked ? 1 : -1);
        await globalCountsStore.put({
          collectionId,
          count: newCount,
          lastUpdated: new Date().toISOString()
        });

        // Broadcast the change
        const likeEvent = new CustomEvent('likeStatusChanged', {
          detail: {
            collectionId,
            isLiked: !isCurrentlyLiked,
            count: newCount
          }
        });
        window.dispatchEvent(likeEvent);

        await tx.done;
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic updates
      setLikedItems(prev => ({
        ...prev,
        [collectionId]: isCurrentlyLiked
      }));
      setLikeCounts(prev => ({
        ...prev,
        [collectionId]: prev[collectionId] || 0
      }));
    }
  } catch (error) {
    console.error('Error handling like:', error);
  }
};


useEffect(() => {
  const loadInitialState = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const userId = await ensureUserExists(db);
      
      // Load user's liked items
      const likeStore = db.transaction('likes', 'readonly').objectStore('likes');
      const userLikes = await likeStore.index('byUser').getAll(userId);
      
      const likedState = userLikes.reduce((acc, like) => {
        acc[like.collectionId] = true;
        return acc;
      }, {});
      
      setLikedItems(likedState);
      
      // Load global counts
      const counts = await refreshGlobalCounts();
      setLikeCounts(counts);
    } catch (error) {
      console.error('Error loading initial state:', error);
    }
  };

  // Load initial state
  loadInitialState();

  // Set up periodic refresh
  const refreshInterval = setInterval(async () => {
    const counts = await refreshGlobalCounts();
    setLikeCounts(counts);
  }, 30000); // Refresh every 30 seconds

  return () => clearInterval(refreshInterval);
}, []);



useEffect(() => {
  const loadLikesData = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      
      // Get current user
      const userStore = db.transaction('users', 'readonly').objectStore('users');
      const userRecord = await userStore.get('current_user');
      const userId = userRecord?.value;

      if (!userId) return;

      // Get all likes
      const likeStore = db.transaction('likes', 'readonly').objectStore('likes');
      const allLikes = await likeStore.getAll();

      // Calculate liked status for current user
      const userLikes = {};
      const likeCounts = {};

      allLikes.forEach(like => {
        // Track user's likes
        if (like.userId === userId) {
          userLikes[like.collectionId] = true;
        }
        
        // Count total likes per collection
        if (!likeCounts[like.collectionId]) {
          likeCounts[like.collectionId] = 0;
        }
        likeCounts[like.collectionId]++;
      });

      setLikedItems(userLikes);
      setLikeCounts(likeCounts);

    } catch (error) {
      console.error('Error loading likes data:', error);
    }
  };

  loadLikesData();
}, []);

useEffect(() => {
  const handleLikeUpdate = (event) => {
    const { collectionId, isLiked } = event.detail;

    setLikedItems((prev) => ({
      ...prev,
      [collectionId]: isLiked,
    }));
  };

  window.addEventListener('likeUpdated', handleLikeUpdate);

  return () => {
    window.removeEventListener('likeUpdated', handleLikeUpdate);
  };
}, []);

  
// Helper function to broadcast like events
const broadcastLikeUpdate = (collectionId, isLiked) => {
  const event = new CustomEvent('likeUpdated', {
    detail: { collectionId, isLiked },
  });
  window.dispatchEvent(event);
};

const handleLikeClick = async (collectionId) => {
  try {
    const db = await openDB('collectionsDB', 3);
    
    // First, ensure we have a userId
    const userId = 'current_user'; // Replace with actual user ID if available
    const likeId = `${userId}_${collectionId}`; // Use this as the unique identifier
    
    const isCurrentlyLiked = likedItems[collectionId];
    
    // Optimistic UI update
    setLikedItems((prev) => ({
      ...prev,
      [collectionId]: !isCurrentlyLiked,
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [collectionId]: (prev[collectionId] || 0) + (!isCurrentlyLiked ? 1 : -1),
    }));
    
    if (!isCurrentlyLiked) {
      // If not liked, add to IndexedDB
      await db.put('likes', { dataId: collectionId, userId, timestamp: new Date().toISOString() });
      //console.log(`Liked collection with ID: ${collectionId}`);
    } else {
      // If liked, remove from IndexedDB
      await db.delete('likes', likeId);
     // console.log(`Unliked collection with ID: ${collectionId}`);
    }

    // Broadcast the like update to ensure all components are synced
    broadcastLikeUpdate(collectionId, !isCurrentlyLiked);

  } catch (error) {
    console.error('Error updating like in IndexedDB:', error);
    
    // Revert UI change in case of error
    setLikedItems((prev) => ({
      ...prev,
      [collectionId]: likedItems[collectionId],
    }));
    setLikeCounts((prev) => ({
      ...prev,
      [collectionId]: Math.max(0, prev[collectionId]),
    }));
  }
};














		const handleShareClick = (collectionId) => {
		  if (navigator.share) {
			navigator.share({
			  title: 'Check out this collection!',
			  text: 'Take a look at this amazing collection!',
			  url: `https://yourapp.com/collections/${collectionId}`,
			})
			.then(() => console.log('Collection shared successfully'))
			.catch((error) => console.error('Error sharing collection:', error));
		  } else {
			//console.log(`Shared collection with ID: ${collectionId}`);
			alert('Your browser does not support the Web Share API. Please share manually.');
		  }
		};

const handlePinClick = async (collectionId) => {
  try {
    // Show initial status
    setSnackbarMessage('Processing...');
    setSnackbarOpen(true);

    const db = await openDB('collectionsDB', 3);
    const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
    
    // Check if pin exists
    const existingPin = await pinStore.get(collectionId);
    const currentAction = existingPin?.action === 'pin' ? 'unpin' : 'pin';
    
    // Find the collection to get its id
    const collection = [...collectionProducts, ...collectionProductsPin]
      .find(c => c.data_id === collectionId);
    
    // Create or update pin entry
    const pinData = {
      dataId: collectionId,
      pinid: collection?.id?.toString() || '', // Using the collection's id field as pinid
      type: 'collection',
      timestamp: new Date().toISOString(),
      action: currentAction,
      synced: false,
      synced_at: null,
      metadata: {}
    };

    // Update or add the pin
    await pinStore.put(pinData);

    // Update pinnedCollections state for real-time UI update
    if (currentAction === 'pin' && collection) {
      // Add to pinned collections if pinning
      setPinnedCollections(prev => {
        // Check if collection is already in the array to avoid duplicates
        const isAlreadyPinned = prev.some(item => item.dataId === collectionId);
        if (!isAlreadyPinned) {
          return [...prev, { ...pinData, collectionData: collection }];
        }
        return prev;
      });
    } else {
      // Remove from pinned collections if unpinning
      setPinnedCollections(prev => prev.filter(item => item.dataId !== collectionId));
    }

    setSnackbarMessage(currentAction === 'pin' ? 'Item pinned successfully' : 'Item unpinned successfully');
    setSnackbarSeverity('success');

  } catch (error) {
    console.error('Error handling pin click:', error);
    setSnackbarMessage('Error updating pin status');
    setSnackbarSeverity('error');
  }
  setSnackbarOpen(true);
};



const handleSearchChange = (e) => {
  const value = e?.target?.value?.toLowerCase() || '';
  
  // Update URL only when necessary
  if (value.trim() !== searchQuery.trim()) {
    if (value.trim()) {
      window.history.pushState({ search: value }, '', `?q=${encodeURIComponent(value)}`);
    } else {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }

  // Batch state updates
  Promise.resolve().then(() => {
    setSearchQuery(value);
    setShowBanner(!value);
    setShowEngines(!!value.trim());
    setShowClearButton(!!value);

    if (value.trim()) {
      setIsSearching(true);
      setSearchResults({
        businesses: [],
        collections: [],
        amazonProducts: [],
        categoryLinks: [],
        popularLinks: [],
        favoriteCollections: [],
        pinnedBusinesses: []
      });
      setPinnedSearchResults([]);
      debouncedSearch(value);
    } else {
      setIsSearching(false);
      setSearchResults({
        businesses: [],
        collections: [],
        amazonProducts: [],
        categoryLinks: [],
        popularLinks: [],
        favoriteCollections: [],
        pinnedBusinesses: []
      });
      setPinnedSearchResults([]);
    }
  });
};

// Cleanup debounced search on unmount
useEffect(() => {
  return () => {
    debouncedSearch.clear();
  };
}, [debouncedSearch]);


useEffect(() => {
  const handleBackButton = (event) => {
    if (searchQuery) {
      event.preventDefault(); // Prevent default back navigation
      handleClearSearch();    // Clear the search field
    }
  };

  // Add listener for popstate event
  window.addEventListener('popstate', handleBackButton);

  // Push a dummy history state to prevent page refresh
  window.history.pushState(null, '', window.location.pathname);

  // Cleanup listener on component unmount
  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, [searchQuery, handleClearSearch]);








  // Filter top deals based on a specific property, e.g., discount or high rating
// Updated top deals logic to be more flexible
  const topDeals = amazonProducts
    .filter((product) => {
      const hasHighDiscount = product.is_discounted && parseFloat(product.discount_percentage) > 30;
      const hasHighRating = product.star_rating && parseFloat(product.star_rating) >= 4.0;
      const isGoodSalesRank = product.sales_rank && product.sales_rank < 100000;

      return hasHighDiscount || hasHighRating || isGoodSalesRank;
    })
    .sort((a, b) => {
      // Sort products with higher discount first, then by rating, then by sales rank
      if (parseFloat(b.discount_percentage) - parseFloat(a.discount_percentage) !== 0) {
        return parseFloat(b.discount_percentage) - parseFloat(a.discount_percentage);
      }
      if (parseFloat(b.star_rating) - parseFloat(a.star_rating) !== 0) {
        return parseFloat(b.star_rating) - parseFloat(a.star_rating);
      }
      return a.sales_rank - b.sales_rank;
    })
    .slice(0, 10);

// If no products match the criteria, use the first 10 Amazon products as fallback
const topDealsToShow = topDeals.length > 0 ? topDeals.slice(0, 10) : amazonProducts.slice(0, 10);
// Fallback to display top 10 products if none match the filter criteria

const handleViewMore = () => {
    setShowAllPopularLinks(!showAllPopularLinks);
   };
   
   const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  backgroundColor: '#ffffff',
  boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  transition: '0.3s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0px 5px 20px rgba(0,0,0,0.2)',
  },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: '150px',
  width: '100%',
  objectFit: 'contain',
  marginBottom: theme.spacing(1),
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  color: '#ff7043',
  padding: theme.spacing(0.5, 2),
  borderRadius: '24px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '0.85rem',
  marginTop: theme.spacing(1),
  alignSelf: 'center',
}));

const TruncatedTypography = styled(Typography)({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2, // Limit to 2 lines
  WebkitBoxOrient: 'vertical',
});

const bannerSettings = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
};

const imageSliderSettings = {
 dots: false,
 infinite: false, // Changed from true
 speed: 500,
 slidesToShow: 1.05,
 slidesToScroll: 1,
 autoplay: false, // Changed from true
 autoplaySpeed: 3000,
 focusOnSelect: true,
 centerMode: true,
 centerPadding: '10px',
 arrows: true
};

const SearchEngineIcon = styled('div')(({ theme }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  cursor: 'pointer',
  margin: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  backgroundColor: 'gray', // Unselected state
  '&.selected': {
    backgroundColor: 'red', // Selected state
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '50%',
  },
}));

const handleEngineToggle = useCallback((engine) => {
  setSelectedEngines(prev => 
    prev.some(e => e.searchenginename === engine.searchenginename)
      ? prev.filter(e => e.searchenginename !== engine.searchenginename)
      : [...prev, engine]
  );
}, []);

const handleExternalSearch = useCallback((e) => {
  if (e.key === 'Enter' || e.type === 'click') {
    if (selectedEngines.length > 0 && searchQuery) {
      const encodedQuery = encodeURIComponent(searchQuery);
      const searchUrls = selectedEngines.map(engine => 
        `${engine.searchengineurl}${encodedQuery}`
      ).join('/~');

      if (searchUrls) {
        window.open(`collections:${searchUrls}`, '_blank');
      }
    }
  }
}, [selectedEngines, searchQuery]);

// Update your SearchButton styled component if not already defined
const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#007bff',
  color: 'white',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
  '&:disabled': {
    backgroundColor: '#cccccc',
    cursor: 'not-allowed',
  },
}));

// Update the useEffect for fetching search engines
useEffect(() => {
  const fetchSearchEngines = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.WEB_APPS}?is_homepage=yes`); // Changed from AMAZON to WEB_APPS
      const data = await response.json();
      if (data.searchengine && data.searchengine.searchenginedata) {
        setSearchEngines(data.searchengine.searchenginedata);
        // Set default selected engines
        const defaultEngines = data.searchengine.searchenginedata.filter(engine => 
          engine.selected === "true"
        );
        setSelectedEngines(defaultEngines);
      }
    } catch (error) {
      console.error('Error fetching search engines:', error);
    }
  };

  fetchSearchEngines();
}, []);


const LikeButton = ({ collectionId }) => {
  if (!collectionId) {
    console.warn('LikeButton: Missing collectionId prop');
    return null;
  }

  const isLiked = likedItems[collectionId];
  const count = likeCounts[collectionId] || 0;

  return (
    <Box display="flex" alignItems="center" sx={{ marginLeft: '-10px' }}>
      <IconButton
        onClick={(e) => handleLike(collectionId, e)}
        style={{
          backgroundColor: isLiked ? '#ffcccb' : 'transparent',
          transition: 'background-color 0.3s ease',
        }}
      >
        {isLiked ? (
          <FavoriteIcon style={{ color: '#ff1744' }} />
        ) : (
          <FavoriteBorderIcon style={{ color: '#757575' }} />
        )}
      </IconButton>
      <Typography variant="caption" sx={{ marginLeft: 1 }}>
        {count} {count === 1 ? 'Like' : 'Likes'}
      </Typography>
    </Box>
  );
};


if (loading) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <CircularProgress sx={{ color: colors.app_primary }} />
    </Box>
  );
}


  return (
    <>
      <MetaData component="HomePage" />
      <Container 
        className="home-container" 
        sx={{ 
          backgroundColor: colors.app_primaryBackground,
          minHeight: '100vh', // Ensure container takes full height
          position: 'relative', // Add position relative
          zIndex: 1, // Lower z-index than sticky search
        }}
      >
        {/* Search Bar */}
        <Box 
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            width: '100vw',
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            padding: '10px 0',
            marginBottom: '0px',
            transition: 'background-color 0.3s ease', // Smooth transition
          }}
        >
          <Container maxWidth="lg">
            <TextField
              variant="outlined"
              placeholder="Search the web"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearchSubmit}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  backgroundColor: '#fff',
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                    borderWidth: '1px',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: colors.primary,
                  },
                },
                '& .MuiOutlinedInput-input': {
                  padding: '10px 14px',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: colors.searchbaractiveborder,
                  boxShadow: '0 0 5px rgba(0, 123, 255, 0.5)',
                },
              }}
              InputProps={{
                startAdornment: ( // Changed from endAdornment to startAdornment
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.app_primaryText }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : showClearButton ? (
                      <IconButton onClick={handleClearSearch} sx={{ color: colors.app_primaryText }}>
                        <ClearIcon />
                      </IconButton>
                    ) : null}
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
          </Container>
        </Box>
	  








      {/* Display Search Engine Icons */}
		{/* Display Search Engine Icons */}
		<Box display="flex" flexDirection="column" alignItems="center" gap={2}>
  <Box className="search-engines-container">
    {searchEngines.map((engine, index) => (
      <Box
        key={index}
        textAlign="center"
        marginX={1}
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
          animation: `${glowPulse} 2s infinite ease-in-out`,
          position: 'relative',
          '&:hover': {
            transform: 'scale(1.05)',
            backgroundColor: engine.selected === 'true' ? colors.app_primary : '#aaa',
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
          src={engine.searchengineimage}
          alt={engine.searchenginename}
          style={{
            width: 30,
            height: 30,
            position: 'relative',
            zIndex: 1
          }}
        />
      </Box>
    ))}
  </Box>

  {/* Search Button */}
    <Button
      variant="contained"
      onClick={(e) => handleSearch(e, 'click')}
      sx={{
        bgcolor: colors.app_primary,
        color: 'white',
        textTransform: 'none',
        borderRadius: '20px',
        px: 4,
        py: 1,
        fontSize: '1rem',
        marginBottom: 2,
		
        '&:hover': {
          bgcolor: '#5B3FEF'
        }
      }}
    >
      SEARCH
    </Button>

</Box>

		
		{showBanner && headerBanner && headerBanner.length > 0 && (
  headerBanner.length === 1 ? (
    <div style={{ width: '100%' }}>
      <img
        src={headerBanner[0].gallery_image}
        alt={headerBanner[0].gallery_name}
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  ) : (
    <Slider {...bannerSettings}>
      {headerBanner.map((banner, index) => (
        <div key={index}>
          <img
            src={banner.gallery_image}
            alt={banner.gallery_name}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      ))}
    </Slider>
  )
)}

{searchQuery && (
  <Box 
    ref={searchResultsRef}
    sx={{ 
      mt: { xs: 2, sm: 4 },
      mb: { xs: 2, sm: 4 },
      position: 'relative',
      zIndex: 2
    }}
  >
    {isSearching ? (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 4 }}>
        <CircularProgress size={40} sx={{ color: colors.app_primary }} />
        <Typography variant="body1" color="text.secondary">
          Searching...
        </Typography>
      </Box>
    ) : (
      Object.values(searchResults).every(arr => arr.length === 0) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, my: 8 }}>
          <Typography variant="h5" color="text.secondary">
            No results found for "{searchQuery}"
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try searching with a different term
          </Typography>
        </Box>
      )
    )}
  </Box>
)}


{searchQuery && Array.isArray(pinnedSearchResults) && pinnedSearchResults.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Pinned Collections
    </Typography>
    <Grid container spacing={3}>
      {pinnedSearchResults.map((collection, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <Box>
            <CollectionCard 
              item={collection}
              isClicked={clickedCardId === collection.data_id}
              onCardClick={(id) => {
                setClickedCardId(id);
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
  </>
)}


	  



{!searchQuery && validPinnedCollections.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Pinned Collections
    </Typography>
    <Grid container spacing={3}>
      {validPinnedCollections.map((pin, index) => {
        // Find the matching collection data
        const combinedCollections = [...collectionProductsPin, ...collectionProducts];
        const matchingCollection = combinedCollections.find(
          prod => String(prod.data_id) === String(pin.dataId)
        );

        if (!matchingCollection) return null;

        return (
          <Grid item xs={6} sm={6} md={4} key={index}>
            <Box>
              <CollectionCard
                item={matchingCollection}
                isClicked={clickedCardId === matchingCollection.data_id}
                onCardClick={(id) => {
                  setClickedCardId(id);
                }}
              />
            </Box>
          </Grid>
        );
      })}
    </Grid>
    <ViewMore href="/collections" />
  </>
)}




{!searchQuery && (
  <Box
    className="popular-links-section"
    sx={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: 2,
      position: 'relative',
      marginBottom: 4,
    }}
  >
    <Typography variant="h6" gutterBottom>
      Popular
    </Typography>

    <Grid container spacing={2} alignItems="center">
      {popularLinks.slice(0, isExpanded ? popularLinks.length : 4).map((link, index) => (
        <Grid item xs={3} key={index}>
          <Box
            onClick={() => window.open('inapp:'+link.link_URL, '_blank')}
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
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
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

    {/* More/Less Button */}
    {popularLinks.length > 4 && (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}
      >
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            backgroundColor: '#fff0ee',
            color: '#ff4b26',
            border: '1px solid #ff4b26',
            borderRadius: '4px',
            padding: '4px 16px',
            textTransform: 'none',
            minWidth: '80px',
            '&:hover': {
              backgroundColor: '#ffe4e0',
            }
          }}
        >
          {isExpanded ? 'LESS' : 'MORE'}
        </Button>
      </Box>
    )}
  </Box>
)}


{searchQuery && (
  <Box sx={{ mt: 4, mb: 4 }}>
    {/* Popular Links Section with Error Handling */}
    {Array.isArray(searchResults?.popularLinks) && searchResults.popularLinks.length > 0 && (
      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: 2,
          position: 'relative',
          marginBottom: 4,
          marginTop: 4,
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 600, marginBottom: 1 }}>
          Popular
        </Typography>

        {/* View More/Less Button */}
       

        {/* Popular Links Grid */}
        <Grid container spacing={2} justifyContent="center">
          {searchResults.popularLinks
            .slice(0, isExpanded ? searchResults.popularLinks.length : 4)
            .map((link, index) => (
              <Grid 
                item 
                xs={4} 
                sm={4} 
                md={3} 
                key={link?.id || index} 
                display="flex" 
                justifyContent="center"
              >
                <Box
                  onClick={() => {
                    if (link?.link_URL) {
                      window.open('inapp:'+link.link_URL, '_blank');
                    }
                  }}
                  sx={{
                    cursor: link?.link_URL ? 'pointer' : 'default',
                    textAlign: 'center',
                    marginX: 1,
                    '&:hover': {
                      transform: link?.link_URL ? 'scale(1.05)' : 'none',
                    },
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <CardMedia
                    component="img"
                    image={link?.link_image || 'https://via.placeholder.com/140'}
                    alt={link?.link_name || 'Link image'}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      marginBottom: 1,
                      border: '2px solid',
                      borderColor: 'grey.300',
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/140';
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    noWrap 
                    sx={{ 
                      maxWidth: 70,
                      color: link?.link_URL ? 'inherit' : 'text.disabled'
                    }}
                  >
                    {link?.link_name 
                      ? (link.link_name.length > 10 
                          ? `${link.link_name.substring(0, 10)}...` 
                          : link.link_name)
                      : 'Untitled'}
                  </Typography>
                </Box>
              </Grid>
            ))}
        </Grid>

        {/* Error Message for Invalid Links */}
        {searchResults.popularLinks.some(link => !link?.link_URL) && (
          <Typography 
            variant="caption" 
            color="error" 
            sx={{ 
              display: 'block', 
              textAlign: 'center',
              mt: 2 
            }}
          >
            Some links may be unavailable
          </Typography>
        )}
      </Box>
    )}
  </Box>
)}


{searchQuery && Array.isArray(searchResults.collections) && searchResults.collections.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Top Collections
    </Typography>
    <Grid container spacing={3}>
      {searchResults.collections.slice(0, 10).map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <Box>
            <CollectionCard 
              item={product}
              isClicked={clickedCardId === product.data_id}
              onCardClick={(id) => {
                setClickedCardId(id);
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
    <ViewMore href="/collections" />
  </>
)}



{!searchQuery && collectionProducts?.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Top Collections
    </Typography>
    <Grid container spacing={3}>
      {collectionProducts.slice(0, 10).map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <Box>
            <CollectionCard 
              item={product}
              isClicked={clickedCardId === product.data_id}
              onCardClick={(id) => {
                setClickedCardId(id);
              }}
            />
          </Box>
        </Grid>
      ))}
    </Grid>
    <ViewMore href="/collections" />
  </>
)}


{pinnedBusinesses.length > 0 && !searchQuery && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Pinned Businesses
    </Typography>
    <Grid container className="listings-grid" spacing={4}>
      {pinnedBusinesses.map((listingData, index) => {
        const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;
        
        const processedListingData = {
          ...listingData,
          badgeinfo: listingData.badgeinfo?.map(badge => ({
            ...badge,
            badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
          }))
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={listingData.listdata.listing_id}>
            <ListingCard 
              listingData={processedListingData}
              handleClick={(listing, type) => {
                if (type === 'call') {
                  window.location.href = `tel:${listing.listdata.business_phone_1}`;
                } else if (type === 'chat') {
                  window.location.href = `https://wa.me/${listing.listdata.business_whatsapp}`;
                }
              }}
              settings={{
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                cssEase: 'linear',
                centerMode: true,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 0.4,
                      centerPadding: '100px',
                      margin: '0px 50px'
                    }
                  }
                ]
              }}
              badgeIconStyle={{
                width: '80px',
                height: 'auto',
                filter: 'brightness(1.1) contrast(1.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              buttonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              callButtonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              isLoggedIn={true}
              allowRedirect={hasBadge ? "yes" : "no"}
              isPinned={pinnedBusinesses.some(business => 
                business.listdata.listing_id === listingData.listdata.listing_id
              )}
              onPinClick={() => handleBusinessPinClick(listingData.listdata.listing_id)}
            />
          </Grid>
        );
      })}
    </Grid>
    <ViewMore href="/cities" />
  </>
)}

{searchQuery && searchResults.pinnedBusinesses && searchResults.pinnedBusinesses.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Pinned Businesses
    </Typography>
    <Grid container className="listings-grid" spacing={4}>
      {searchResults.pinnedBusinesses.map((listingData) => {
        const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;
        
        const processedListingData = {
          ...listingData,
          badgeinfo: listingData.badgeinfo?.map(badge => ({
            ...badge,
            badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
          }))
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={listingData.listdata.listing_id}>
            <ListingCard 
              listingData={processedListingData}
              handleClick={(listing, type) => {
                if (type === 'call') {
                  window.location.href = `tel:${listing.listdata.business_phone_1}`;
                } else if (type === 'chat') {
                  window.location.href = `https://wa.me/${listing.listdata.business_whatsapp}`;
                }
              }}
              settings={{
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                cssEase: 'linear',
                centerMode: true,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 0.4,
                      centerPadding: '100px',
                      margin: '0px 50px'
                    }
                  }
                ]
              }}
              badgeIconStyle={{
                width: '80px',
                height: 'auto',
                filter: 'brightness(1.1) contrast(1.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              buttonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              callButtonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              isLoggedIn={true}
              allowRedirect={hasBadge ? "yes" : "no"}
              isPinned={true}
              onPinClick={() => handleBusinessPinClick(listingData.listdata.listing_id)}
            />
          </Grid>
        );
      })}
    </Grid>
  </>
)}

{!searchQuery && featuredBusinesses?.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Featured Businesses
    </Typography>
    <Grid container className="listings-grid" spacing={4}>
      {featuredBusinesses.map((listingData, index) => {
        const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;
        
        const processedListingData = {
          ...listingData,
          badgeinfo: listingData.badgeinfo?.map(badge => ({
            ...badge,
            badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
          }))
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={listingData.listdata.listing_id}>
            <ListingCard 
              listingData={processedListingData}
              handleClick={(listing, type) => {
                if (type === 'call') {
                  window.location.href = `tel:${listing.listdata.business_phone_1}`;
                } else if (type === 'chat') {
                  window.location.href = `https://wa.me/${listing.listdata.business_whatsapp}`;
                }
              }}
              settings={{
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                cssEase: 'linear',
                centerMode: true,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 0.4,
                      centerPadding: '100px',
                      margin: '0px 50px'
                    }
                  }
                ]
              }}
              badgeIconStyle={{
                width: '80px',
                height: 'auto',
                filter: 'brightness(1.1) contrast(1.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              buttonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              callButtonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              isLoggedIn={true}
              allowRedirect={hasBadge ? "yes" : "no"}
              isPinned={pinnedBusinesses.some(business => 
                business.listdata.listing_id === listingData.listdata.listing_id
              )}
              onPinClick={() => handleBusinessPinClick(listingData.listdata.listing_id)}
            />
          </Grid>
        );
      })}
    </Grid>
    <ViewMore href="/cities" />
  </>
)}

{searchQuery && Array.isArray(searchResults?.businesses) && searchResults.businesses.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Featured Businesses
    </Typography>
    <Grid container className="listings-grid" spacing={4}>
      {searchResults.businesses.map((listingData, index) => {
        const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;
        
        const processedListingData = {
          ...listingData,
          badgeinfo: listingData.badgeinfo?.map(badge => ({
            ...badge,
            badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
          }))
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={listingData.listdata.listing_id}>
            <ListingCard 
              listingData={processedListingData}
              handleClick={(listing, type) => {
                if (type === 'call') {
                  window.location.href = `tel:${listing.listdata.business_phone_1}`;
                } else if (type === 'chat') {
                  window.location.href = `https://wa.me/${listing.listdata.business_whatsapp}`;
                }
              }}
              settings={{
                dots: true,
                infinite: true,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                cssEase: 'linear',
                centerMode: true,
                responsive: [
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 0.4,
                      centerPadding: '100px',
                      margin: '0px 50px'
                    }
                  }
                ]
              }}
              badgeIconStyle={{
                width: '80px',
                height: 'auto',
                filter: 'brightness(1.1) contrast(1.1)',
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.1)',
                },
              }}
              buttonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              callButtonStyle={{
                fontSize: '0.75rem',
                padding: '6px 12px',
                minWidth: '80px',
                borderRadius: '20px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
              isLoggedIn={true}
              allowRedirect={hasBadge ? "yes" : "no"}
              isPinned={pinnedBusinesses.some(business => 
                business.listdata.listing_id === listingData.listdata.listing_id
              )}
              onPinClick={() => handleBusinessPinClick(listingData.listdata.listing_id)}
            />
          </Grid>
        );
      })}
    </Grid>
  </>
)}







{!searchQuery && Array.isArray(amazonProducts) && amazonProducts.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Amazon Products
    </Typography>
    <Grid container spacing={2}>
      {amazonProducts.slice(0, 10).map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <ProductCard 
            product={product}
            onClick={(url) => window.open(url, '_blank')}
          />
        </Grid>
      ))}
    </Grid>
    <ViewMore href="/amazon" />
  </>
)}


{searchQuery && Array.isArray(searchResults?.amazonProducts) && searchResults.amazonProducts.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Amazon Products
    </Typography>
    <Grid container spacing={2}>
      {searchResults.amazonProducts.map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <ProductCard 
            product={product}
            onClick={(url) => window.open(url, '_blank')}
          />
        </Grid>
      ))}
      <Grid item xs={12}>
        <ViewMore href="/amazon" />
      </Grid>
    </Grid>
  </>
)}


{!searchQuery && topDealsToShow?.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
      Top Deals
    </Typography>
    <Grid container spacing={2}>
      {topDealsToShow.map((product, index) => (
        <Grid item xs={6} sm={6} md={4} key={index}>
          <ProductCard 
            product={product}
            onClick={(url) => window.open(url, '_blank')}
          />
        </Grid>
      ))}
    </Grid>
    <ViewMore href="/amazon" />
  </>
)}

{searchQuery && Array.isArray(searchResults?.categoryLinks) && searchResults.categoryLinks.length > 0 && (
  <>
    <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
     
    </Typography>
    {searchResults.categoryLinks.map((category, index) => (
      <Box key={index} marginBottom={4} sx={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        padding: 2,
        position: 'relative',
        marginBottom: 4,
      }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          borderBottom: '1px solid rgba(0,0,0,0.1)',
          paddingBottom: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              {category.category_name}
            </Typography>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={() => {
                const categoryId = category.category_id;
                if (categoryId) {
                  window.location.href=`${VIEW_MORE_LINK}/category/${categoryId}`;
                }
              }}
              sx={{
                backgroundColor: colors.app_primary,
                color: 'white',
                textTransform: 'none',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.85rem',
                minWidth: 'auto',
                height: '28px',
                '&:hover': {
                  backgroundColor: colors.app_primary,
                  opacity: 0.9,
                  '& .MuiSvgIcon-root': {
                    transform: 'translateX(4px)',
                  },
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1rem',
                  transition: 'transform 0.3s ease',
                },
              }}
            >
              Visit
            </Button>
          </Box>
        </Box>
        <Grid container spacing={2}>
          {(category.items || category.links || []).slice(0, 4).map((item, idx) => (
            <Grid item xs={3} key={idx}>
              <Box
                onClick={() => window.open(item.url || item.link_URL, '_blank')}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    '& img': { transform: 'scale(1.05)' },
                    '& .itemName': { color: colors.app_primary }
                  }
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mb: 1,
                    border: '2px solid #f0f0f0'
                  }}
                >
                  <img
                    src={item.icon || item.link_image || 'https://via.placeholder.com/140'}
                    alt={item.name || item.link_name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </Box>
                <Typography
                  className="itemName"
                  variant="body2"
                  align="center"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#666',
                    transition: 'color 0.3s ease',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {item.name || item.link_name}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    ))}
  </>
)}


      {!searchQuery && categoryLinks?.length > 0 && (
	   <>
      <Typography variant="h5" gutterBottom style={{ marginTop: '2rem' }}>
       
      </Typography>
      {categoryLinks.map((category, index) => (
        <Box key={index} marginBottom={4} sx={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: 2,
          position: 'relative',
          marginBottom: 4,
        }}>
          <Typography variant="h6" gutterBottom>
            {category.category_name}
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            {category.links.slice(0, 4).map((link, linkIndex) => ( 
              <Grid item xs={3} key={linkIndex}> 
                <Box
                  onClick={() => window.open(link.link_URL, '_blank')}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <Box
                    component="img"
                    src={link.link_image}
                    alt={link.link_name}
                    onError={(e) => {
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = DEFAULT_IMAGE_BASE_URL;
                    }}
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      marginBottom: 1,
                      border: '2px solid',
                      borderColor: 'grey.300',
                      objectFit: 'contain'
                    }}
                  />
                  <Typography variant="body2" noWrap sx={{ maxWidth: 70 }}>
                    {link.link_name.length > 10 ? `${link.link_name.substring(0, 10)}...` : link.link_name}
                  </Typography>
                </Box>
              </Grid>
            ))}
            <Grid item xs={3}>
              <Box
                onClick={() => {
                  const categoryId = category.category_id;
                  if (categoryId) {
                    window.location.href=`${VIEW_MORE_LINK}/category/${categoryId}`;
                  }
                }}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  height: '100%',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    backgroundColor: colors.app_primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      '& .MuiSvgIcon-root': {
                        transform: 'translateX(2px)',
                      },
                    },
                  }}
                >
                  <ArrowForwardIcon sx={{ 
                    color: 'white',
                    transition: 'transform 0.3s ease',
                  }} />
                </Box>
                <Typography 
                  variant="body2" 
                  align="center" 
                  sx={{ 
                    marginTop: 1,
                    color: colors.app_primary,
                    fontWeight: 500,
                  }}
                >
                More
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      ))}
	  </>
	  )}
	  
{!searchQuery && footerBanner && footerBanner.length > 0 && (
 footerBanner.length === 1 ? (
   <div style={{ width: '100%' }}>
     <img
       src={footerBanner[0].gallery_image}
       alt={footerBanner[0].gallery_name}
       style={{ width: '100%', height: 'auto' }}
     />
   </div>
 ) : (
   <Slider {...bannerSettings}>
     {footerBanner.map((banner, index) => (
       <div key={index}>
         <img
           src={banner.gallery_image}
           alt={banner.gallery_name}
           style={{ width: '100%', height: 'auto' }}
         />
       </div>
     ))}
   </Slider>
 )
)}
	 <Snackbar
   sx={{ marginBottom: '40px' }}
  open={snackbar.open}
  autoHideDuration={3000}
  onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
    {snackbar.message}
  </Alert>
</Snackbar>
	   <FooterComponent />
 
    </Container>
  </>
  );
};

// Add this function before the return statement in HomePage component

export default HomePage;