import React, { useEffect, useState, useRef, useCallback, useMemo, Suspense, lazy } from "react";
import {
	Avatar,
	AppBar,
	Badge,
	Toolbar,
  Container,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
  Collapse,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  InputBase,
  Link,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from '@mui/icons-material/Search';
import { styled, keyframes } from '@mui/material/styles';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import Lottie from "lottie-react";
import loaderAnimation from "./loader-animation.json";
import { openDB } from 'idb';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
//import HeaderCarousel from './HeaderCarousel';
import ClearIcon from '@mui/icons-material/Clear';
import InputAdornment from '@mui/material/InputAdornment';
import { debounce } from 'lodash'; // Make sure to install lodash if you haven't already
import ShareIcon from '@mui/icons-material/Share';
import { Tooltip } from '@mui/material';
import clsx from 'clsx';  
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'; // General Collection Icon
import ErrorBoundary from './ErrorBoundary'; 
import { throttle } from 'lodash';
import FooterComponent from '../../FooterComponent';
import MetaData from '../../components/MetaData';
import {
  // Colors and Theme
  colors
} from '../../theme-styles';
import CloseIcon from '@mui/icons-material/Close';
import { getApiUrl, getApiUrlfilter, ENDPOINTS, IMAGE_BASE_URL } from "../../config/apiConfigext";
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CollectionCard from './CollectionCard'; // Ensure this import is correct

// Define styled components OUTSIDE of the main component
const HeaderWrapper = styled('div')(({ theme }) => ({
  height: '80px',
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.app_primaryBackground,
  boxShadow: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  height: '72px',
  display: 'flex',
  alignItems: 'center',
  padding: '8px 0',
  zIndex: 1100,
  width: '100%',
  transform: 'translateZ(0)',
  willChange: 'transform',
  transition: 'all 0.2s ease',
  '&.sticky': {
    height: '64px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
    padding: '4px 0',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
  },
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    marginRight: 0,
    width: '100%',
    height: '64px',
    padding: '4px 0',
    '&.sticky': {
      height: '56px',
    }
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  gap: '8px',
  padding: '0 16px',
  height: '100%',
  '& .MuiSvgIcon-root': {
    color: colors.app_primary
  },
  [theme.breakpoints.down('sm')]: {
    padding: '0 8px',
    gap: '4px'
  }
}));

// Simple SearchBarWrapper
const SearchBarWrapper = styled(Box)(({ theme, expanded, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: expanded ? 1 : '1 1 auto',
  backgroundColor: '#ffffff',
  borderRadius: '24px',
  padding: '4px 12px',
  height: '40px',
  maxWidth: expanded ? '100%' : '70%',
  border: '1px solid transparent',
  transition: 'border-color 0.2s ease',
  '&:focus-within': {
    borderColor: isActive ? colors.searchbaractiveborder : 'transparent',
    boxShadow: isActive ? `0 0 5px rgba(0, 123, 255, 0.5)` : 'none',
  }
}));
// collections page
const FilterCount = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '20px',
  height: '20px',
  borderRadius: '10px',
  backgroundColor: colors.categoryActive,
  color: theme.palette.common.white,
  fontSize: '0.75rem',
  fontWeight: 'bold',
  marginLeft: theme.spacing(0.5),
  padding: '0 6px',
}));

const ActionButton = styled('button')(({ theme }) => ({
  backgroundColor: colors.accent2Light,
  border: 'none',
  borderRadius: '24px',
  padding: '8px 16px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'all 0.2s ease',
  fontFamily: theme.typography.fontFamily,
  fontSize: '0.875rem',
  fontWeight: 500,
  minWidth: 'auto',
  color: '#000000',
  outline: 'none',
  WebkitTapHighlightColor: 'transparent',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    backgroundColor: colors.app_primary,
  },
  
  '&:active': {
    transform: 'translateY(0)',
    backgroundColor: `${colors.app_primary} !important`,
    color: '#FFFFFF',
  },
  
  '&:focus': {
    backgroundColor: colors.accent2Light,
  },
  
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
    transition: 'color 0.2s ease',
  },

  '&:active .MuiSvgIcon-root': {
    color: '#FFFFFF',
  }
}));

// Debounce utility function
const debounceSearch = debounce((func) => func(), 300);

//const throttledLoadMore = useCallback(throttle(loadMore, 2000), [currentPage, hasMore, filtersApplied]);

const LazyHeaderCarousel = lazy(() => import('./HeaderCarousel'));

const SearchEngineIcon = styled('div')(({ theme, isSelected }) => ({
  width: 50,
  height: 50,
  borderRadius: '50%',
  cursor: 'pointer',
  margin: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  backgroundColor: isSelected ? 'red' : 'gray',
  '&:hover': {
    transform: 'scale(1.1)',
  },
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
}));

// Add this with the other styled components at the top of the file, after HeaderWrapper
const HeaderSpacer = styled(Box)(({ theme }) => ({
  height: '72px',
  width: '100%',
  visibility: 'hidden',
  [theme.breakpoints.down('sm')]: {
    height: '64px'
  }
}));


const StickySearchBar = styled("div")(({ theme, isSticky }) => ({
  position: isSticky ? "fixed" : "sticky",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
  backgroundColor: "#fff",
  padding: "10px",
  boxShadow: isSticky ? "0 2px 5px rgba(0,0,0,0.1)" : "none",
  transition: "all 0.3s ease",
  width: '100%',
}));

const SearchBarPlaceholder = styled("div")(({ isSticky }) => ({
  height: isSticky ? '56px' : '0', // Adjust this value based on your search bar's height
  transition: 'height 0.3s ease',
}));



// Loader style using Box from MUI
const Loader = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
});

// Favicon container and style
const FaviconContainer = styled(Box)({
  display: "flex",
  flexWrap: "wrap",
  gap: "5px",
  marginBottom: "10px",
});

const Favicon = styled("img")({
  width: "16px",
  height: "16px",
  objectFit: "contain",
});

// Function to load a Lottie animation as a loader

const LottieLoader = () => (
  <Loader>
    <Lottie
      animationData={loaderAnimation}
      style={{ width: 100, height: 100 }}
      loop={true}
      autoplay={true}
    />
  </Loader>
);

/*
 const LottieLoader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
      <Lottie
        animationData={loaderAnimation}
        style={{ width: 100, height: 100, filter: 'brightness(0) invert(1)' }}
        loop={true}
        autoplay={true}
      />
    </Box>
  );
  */

// Function to generate favicon URL from a given URL
const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&size=64`;
  } catch (error) {
    console.error("Invalid URL:", url);
    return null;
  }
};

const styles = `
  .sticky-header {
    transform-origin: top;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }

  .sticky-header.MuiAppBar-root {
    background-color: #FFFFFF !important;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15) !important;
    width: 110% !important;
    padding: 6px 12px !important;
    border-radius: 0 !important;
    margin-left: -5% !important;
  }

  .sticky-header .MuiToolbar-root {
    padding: 0 16px !important;
  }
`;



// Styled "My Collections" Button with Constant Animation
const MyCollectionsButton = styled(Button)(({ theme }) => ({
  background: colors.app_primary,  // Direct use of app_primary instead of gradient
  borderRadius: '50px',
  border: 0,
  color: 'white',
  padding: '10px 30px',
  fontSize: '16px',
  fontWeight: 'bold',
  boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
  animation: `${pulse} 2s infinite`,
  transition: 'border-radius 0.5s ease',
  '&:hover': {
    background: colors.app_primary,  // Keep the same color on hover
    borderRadius: '25px',
  },
}));


const textGlow = keyframes`
  0%, 100% { text-shadow: 0 0 5px #ffffff, 0 0 10px #64b5f6; }
  50% { text-shadow: 0 0 10px #ffffff, 0 0 20px #2196F3; }
`;


const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200%; }
  100% { background-position: 200%; }
`;

const particleAnimation = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

// Custom styled card with parallax and 3D perspective effect
const StyledCard = styled(Card)({
  borderRadius: '20px',
  boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.2)',
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(12px)',
  perspective: '1000px',
  transition: 'transform 0.4s ease, box-shadow 0.4s ease',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: '0px 15px 50px rgba(0, 0, 0, 0.3)',
    transform: 'rotateY(8deg) scale(1.1)',
  },
  '&:hover .card-media': {
    transform: 'scale(1.1)',
    filter: 'brightness(1.2)',
  },
});

// Particle animation effect for header background



// Custom button with advanced effects
const AnimatedButton = styled(Button)({
  background: 'linear-gradient(90deg, #42a5f5, #64b5f6, #42a5f5)',
  backgroundSize: '200% 200%',
  color: '#FFFFFF',
  padding: '10px 25px',
  borderRadius: '25px',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  fontSize: '1rem',
  animation: `${shimmer} 3s infinite linear, ${pulse} 4s infinite ease-in-out`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 10px 25px rgba(100, 181, 246, 0.6)',
  },
});

const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    background: 'rgba(255, 255, 255, 0.75)',
    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
  },
});

// Enhanced button with better visual effects
const StyledButton = styled(Button)({
  color: '#FFFFFF',
  background: 'linear-gradient(90deg, #2196F3, #21CBF3)',
  padding: '8px 24px',
  borderRadius: '25px',
  fontWeight: 'bold',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0px 5px 20px rgba(33, 203, 243, 0.5)',
  },
});

// IconButton for the top-right close button
const CloseButton = styled(IconButton)({
  position: 'absolute',
  right: 16,
  top: 16,
  color: '#ffffff',
  backgroundColor: '#ff4081',
  '&:hover': {
    backgroundColor: '#ff79b0',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
});



// Styled button for snowfall effect and text glow
const GlowingButton = styled(Button)({
  color: '#FFFFFF',
  background: 'linear-gradient(90deg, #42a5f5, #64b5f6)',
  padding: '10px 25px',
  borderRadius: '25px',
  textTransform: 'uppercase',
  fontWeight: 'bold',
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  textShadow: '0 0 12px rgba(255, 255, 255, 1), 0 0 24px rgba(100, 181, 246, 0.8), 0 0 36px rgba(100, 181, 246, 0.6)', // Enhanced Text Glow Effect
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 20px rgba(100, 181, 246, 0.5)',
  },
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
});


// Update to ensure that the spacer appears immediately
const PageSpacer = ({ pageNumber }) => (
  <Grid item xs={12}>
    <Box
      sx={{
        width: '100%',
        height: '56px', // Explicitly set height to ensure it takes up space immediately
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        my: 2,
        backgroundColor: '#f5f5f5', // Light background color to make the spacer visible early
        opacity: 0.8, // Semi-transparent to differentiate the spacer from other components
      }}
    >
    
    </Box>
  </Grid>
);

// Loader at the bottom of the page for infinite scroll
const InfiniteLoader = ({ isLoading }) => (
  <Box
    sx={{
      width: '100%',
      height: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      my: 4,
    }}
  >
    {isLoading && (
      <Lottie
        animationData={loaderAnimation}
        style={{ width: 80, height: 80 }}
        loop={true}
        autoplay={true}
      />
    )}
  </Box>
);



const transitionStyles = {
  transform: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
};


// Main CollectionsPage component
const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [isSearching, setIsSearching] = useState(false); // State to track if searching is active
  const [likedItems, setLikedItems] = useState({});
  const [pinnedItems, setPinnedItems] = useState({});
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [likeCounts, setLikeCounts] = useState({});
  const [pinnedCollections, setPinnedCollections] = useState([]);
  const [pinnedCollectionsOpen, setPinnedCollectionsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [tempSelectedFilters, setTempSelectedFilters] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [allCollections, setAllCollections] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [filteredBeforeSearch, setFilteredBeforeSearch] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchEngines, setSearchEngines] = useState([]);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const searchBarRef = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [clickedCardId, setClickedCardId] = useState(null);
  // Add this to your state declarations at the top of the component
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  const infiniteScrollRef = useRef(null);
  const [isRestoringScroll, setIsRestoringScroll] = useState(false);
  
   useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('collectionsScrollPosition');
    const isReturnedFromDetails = sessionStorage.getItem('returnedFromDetails');
	//alert(savedScrollPosition);
	//alert('hh'+isReturnedFromDetails);
    
    if (savedScrollPosition && isReturnedFromDetails) {
      setIsRestoringScroll(true);
      const scrollPosition = parseInt(savedScrollPosition, 10);
      
      // Wait for content to render before restoring scroll
      const timer = setTimeout(() => {
		//alert(scrollPosition);
        window.scrollTo(0, scrollPosition);
        setIsRestoringScroll(false);
       // sessionStorage.removeItem('returnedFromDetails');
      }, 500);
      
      return () => clearTimeout(timer);
      
     
    }else{
		// window.scrollTo(0, 0);
		sessionStorage.removeItem('returnedFromDetails');
	}
  }, []);
  
  


  
   useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
  }, []);

  
useEffect(() => {
  let lastScroll = 0;
  let ticking = false;
  const threshold = 0;

  const handleScroll = () => {
	const scrollPosition = window.pageYOffset;
        sessionStorage.setItem('collectionsScrollPosition', scrollPosition.toString());  
	  
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = Math.max(0, window.pageYOffset);
        const header = document.querySelector('.MuiAppBar-root');
        
        if (header) {
          if (currentScroll > threshold) {
            if (!header.classList.contains('sticky')) {
              header.classList.add('sticky');
            }
          } else {
            header.classList.remove('sticky');
          }
        }
        
        lastScroll = currentScroll;
        ticking = false;
      });
      
      ticking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);




   


  const handleOpenFilterModal = () => {
    setTempSelectedFilters(selectedFilters);
    setFilterOpen(true);
  };
  
const handleClearSearch = () => {
  setSearchTerm('');
  setIsSearchActive(false);
  setIsSearching(false);
  setCurrentPage(1);
  setFilteredCollections([]);
  setIsSearchFocused(false);
  
  // Enable infinite scroll again and set hasMore to true
  setHasMore(true);

  // Fetch collections for the first page again
  if (filtersApplied) {
    let filterCategory = Object.entries(selectedFilters)
      .flatMap(([category, subCategories]) =>
        Object.keys(subCategories).filter(subCatId => subCategories[subCatId]))
      .join(",");

    const apiUrl = getApiUrl(ENDPOINTS.COLLECTIONS, `filterCategory=${filterCategory}`);
    fetchCollections(apiUrl, true);
  } else {
    const apiUrl = getApiUrl(ENDPOINTS.COLLECTIONS, "page=1");
    fetchCollections(apiUrl, true);
  }
};



		
	const generateUserId = () => {
  return 'user_' + Math.random().toString(36).substr(2, 9);
};

const fetchGlobalCounts = async () => {
try {
  const apiUrl = getApiUrl(ENDPOINTS.GET_COUNTS);
  const response = await axios.get(apiUrl);
  return response.data.counts || {};
} catch (error) {
  console.error('Error fetching global counts:', error);
  return {};
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
  
// Initialize the database
const initializeDatabase = async () => {
  try {
    const db = await openDB('collectionsDB', 3, {
      upgrade(db) {
        // Likes store for local user state
        if (!db.objectStoreNames.contains('likes')) {
          const likeStore = db.createObjectStore('likes', { keyPath: 'id' });
          likeStore.createIndex('byCollection', 'collectionId');
          likeStore.createIndex('byUser', 'userId');
        }

        // Store for cached global counts
        if (!db.objectStoreNames.contains('globalCounts')) {
          db.createObjectStore('globalCounts', { keyPath: 'collectionId' });
        }

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'userId' });
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

// Initialize database when the component mounts
useEffect(() => {
  initializeDatabase();
}, []);



useEffect(() => {
  const fetchPinnedItemsFromDB = async () => {
    try {
      const pinnedDataIds = await getPinnedCollections();
      const newPinnedItems = pinnedDataIds.reduce((acc, id) => {
        acc[id] = true;
        return acc;
      }, {});
      setPinnedItems(newPinnedItems);
    } catch (error) {
      console.error('Error fetching pinned items from IndexedDB:', error);
    }
  };

  fetchPinnedItemsFromDB();
}, []);

useEffect(() => {
  const fetchLikedItemsFromDB = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const likes = await db.getAll('likes');
      
      const newLikedItems = likes.reduce((acc, like) => {
        acc[like.collectionId] = true;
        return acc;
      }, {});

      setLikedItems(newLikedItems);
      //console.log('Fetched liked items from IndexedDB:', newLikedItems);
    } catch (error) {
      //console.error('Error fetching liked items from IndexedDB:', error);
    }
  };

  fetchLikedItemsFromDB();
}, []);


useEffect(() => {
  const handleLikeUpdate = (event) => {
    const { collectionId, isLiked } = event.detail;

    // Update the likedItems state based on the received event data
    setLikedItems((prev) => ({
      ...prev,
      [collectionId]: isLiked,
    }));
  };

  // Listen for broadcasted like updates
  window.addEventListener('likeUpdated', handleLikeUpdate);

  return () => {
    // Clean up the listener on unmount
    window.removeEventListener('likeUpdated', handleLikeUpdate);
  };
}, []);




  // Handle Like Button Click
// Helper function to broadcast like events
// Helper function to broadcast like events
const broadcastLikeUpdate = (collectionId, isLiked) => {
  const event = new CustomEvent('likeUpdated', {
    detail: { collectionId, isLiked },
  });
  window.dispatchEvent(event);
};


  
const handleMyCollectionsClick = async () => {
  // Step 1: Fetch pinned IDs from IndexedDB
  const pinnedDataIds = await getPinnedCollections();
  //console.log("Pinned Data IDs fetched:", pinnedDataIds);

  if (pinnedDataIds.length === 0) {
    // If no pinned IDs are found, simply open the modal with no data
    setPinnedCollections([]);
    setPinnedCollectionsOpen(true);
    return;
  }

  try {
    // Step 2: Fetch full details of pinned collections using collectionsapi.php
    const apiUrl = getApiUrl(ENDPOINTS.COLLECTIONS, `ids=${pinnedDataIds.join(',')}`);
    const response = await axios.get(apiUrl);

    const fetchedCollections = response.data.collectionsdata || [];

    // Step 3: Enrich and verify data for rendering in the CollectionCard component
    const enrichedCollections = fetchedCollections.map(item => ({
      ...item,
      title: item.title || "Untitled",
      image: item.image || "https://via.placeholder.com/150",
      name: item.name || "Unknown User",
      featured_image: item.featured_image || "https://via.placeholder.com/300x140",
      likeCount: item.likeCount || 0,
    }));

    // Update state with fetched pinned collections
    setPinnedCollections(enrichedCollections);
    //console.log("Pinned Collections after API call:", enrichedCollections); // Debugging line to verify data
    setPinnedCollectionsOpen(true);
  } catch (error) {
    console.error("Error fetching pinned collections from API:", error);
    setPinnedCollections([]);
    setPinnedCollectionsOpen(true);
  }
};







  
const getPinnedCollections = async () => {
  const db = await openDB('collectionsDB', 3);
  const pins = await db.getAll('pins');
  const pinnedDataIds = pins
    .filter(pin => pin.action === 'pin') // Only get pins with action='pin'
    .map(pin => pin.dataId);
  return pinnedDataIds;
};


  
 // const classes = useStyles();


 const handleSearch = useCallback((e) => {
  const searchTermValue = e.target.value.trim().toLowerCase();
  setSearchTerm(searchTermValue);
  setIsSearchActive(searchTermValue.length > 0);
  setIsSearching(true);  // Set searching state to true

  debounceSearch(() => {
    setCurrentPage(1);
    setHasMore(false); // Disable infinite scroll during search

    let filterCategory = "";
    if (filtersApplied) {
      filterCategory = Object.entries(selectedFilters)
        .flatMap(([category, subCategories]) => 
          Object.keys(subCategories).filter(subCatId => subCategories[subCatId]))
        .join(",");
    }

    if (searchTermValue.length > 0) {
      // Fetch search results without incrementing the page count
     fetchCollections(
  getApiUrl(ENDPOINTS.COLLECTIONS, `filterCategory=${filterCategory}&searchTerm=${searchTermValue}`),
  true
);

    } else {
      handleClearSearch(); // Reset search if search term is empty
    }
  });

  if (e.key === 'Enter') {
    debounceSearch.cancel(); // Cancel any pending debounced searches
    handleExternalSearch();
  }
});



const handleEngineToggle = (engine) => {
  setSelectedEngines(prev => 
    prev.some(e => e.searchenginename === engine.searchenginename)
      ? prev.filter(e => e.searchenginename !== engine.searchenginename)
      : [...prev, engine]
  );
};

const handleExternalSearch = () => {
  if (selectedEngines.length > 0 && searchTerm) {
    const encodedQuery = encodeURIComponent(searchTerm);
    const searchUrls = selectedEngines.map(engine => 
      `${engine.searchengineurl}${encodedQuery}`
    ).join('/~');
    window.open(`collections:${searchUrls}`, '_blank');
  }
};




const fetchCollections = async (url, shouldClear = false) => {
  if (isLoading) return;

  setIsLoading(true);
  setError(null);

  try {
    //console.log('Fetching from URL:', url);
    const response = await axios.get(url);
    //console.log('API Response:', response.data);

    // Check if response has the expected structure
    if (!response.data || !response.data.collectionsdata) {
      throw new Error('Invalid data structure received from API');
    }

    const newCollections = response.data.collectionsdata;
    
    // Process collections to ensure all required fields exist
    const processedCollections = newCollections.map(collection => ({
      ...collection,
      data_id: collection.data_id || collection.id || Math.random().toString(),
      title: collection.title || 'Untitled',
      description: collection.description || '',
      image: collection.image || 'https://via.placeholder.com/150',
      featured_image: collection.featured_image || 'https://via.placeholder.com/300x140',
      name: collection.name || 'Unknown User',
      categories: collection.categories || []
    }));

    //console.log('Processed Collections:', processedCollections);

    if (shouldClear) {
      setAllCollections(processedCollections);
      setFilteredCollections(processedCollections);
    } else {
      setAllCollections(prev => [...prev, ...processedCollections]);
      setFilteredCollections(prev => [...prev, ...processedCollections]);
    }

    setHasMore(processedCollections.length >= 10);
    setIsLoading(false);

  } catch (error) {
    console.error('Error fetching collections:', error);
    setError('Failed to fetch collections. Please try again.');
    setHasMore(false);
    setIsLoading(false);
  }
};




useEffect(() => {
  const initializeFilters = async () => {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.COLLECTIONS_FILTER));

      const data = response.data.collectionsdata || [];
      
      // Group the filter options by category
      const groupedOptions = data.reduce((acc, item) => {
        if (!acc[item.category_name]) {
          acc[item.category_name] = {};
        }
        acc[item.category_name][item.sub_category_id] = item;
        return acc;
      }, {});

      setFilterOptions(groupedOptions);

      // Initialize filter states
      const initialFilters = Object.keys(groupedOptions).reduce((acc, category) => {
        acc[category] = Object.keys(groupedOptions[category]).reduce((subAcc, id) => {
          subAcc[id] = false;
          return subAcc;
        }, {});
        return acc;
      }, {});

      setSelectedFilters(initialFilters);
      setTempSelectedFilters(initialFilters);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  initializeFilters();
}, []);


useEffect(() => {
  //console.log("Fetching initial collections data...");
 fetchCollections(getApiUrl(ENDPOINTS.COLLECTIONS, "page=1"));

  fetchSearchEngines();
}, []);

const fetchSearchEngines = async () => {
  try {
   const response = await axios.get(getApiUrl(ENDPOINTS.COLLECTIONS));

    const data = response.data.searchengine.searchenginedata;
    setSearchEngines(data);
    const defaultSelected = data.filter(engine => engine.selected === "true");
    setSelectedEngines(defaultSelected.length > 0 ? defaultSelected : [data.find(e => e.searchenginename === "google")]);
  } catch (error) {
    console.error('Error fetching search engines:', error);
  }
};

  // Function to load more collections on scroll
const loadMore = async () => {
   if (!hasMore || isFetchingMore || isRestoringScroll) return;

  // Show the loader
  setIsFetchingMore(true);

  // Ensure loader is rendered immediately
  requestAnimationFrame(() => {
    setTimeout(async () => {
      try {
        //console.log('Loading more items...');
        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);

        let filterCategory = "";
        if (filtersApplied) {
          filterCategory = Object.entries(selectedFilters)
            .flatMap(([category, subCategories]) =>
              Object.keys(subCategories).filter((subCatId) => subCategories[subCatId]))
              .join(",");
        }

        const apiUrl = getApiUrl(ENDPOINTS.COLLECTIONS, `${filtersApplied ? `filterCategory=${filterCategory}&` : ""}page=${nextPage}`);


        const response = await axios.get(apiUrl, { timeout: 10000 });

        const newCollections = response.data.collectionsdata || [];
        if (newCollections.length > 0) {
          setAllCollections((prevAll) => [...prevAll, ...newCollections]);
          setFilteredCollections((prevFiltered) => [...prevFiltered, ...newCollections]);
          setHasMore(newCollections.length >= itemsPerPage);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading more data:", error);
        setTimeout(loadMore, 5000);
        setError("Failed to load more collections. Retrying...");
      } finally {
        setIsFetchingMore(false);
      }
    }, 0);
  });
};







  
  
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    if (!isFiltering) {
      setFilteredCollections(collections);
    }
  }, [collections, isFiltering]);



  // Function to handle the expansion of the card to show more information
	/*const handleExpandClick = (dataId) => {
		  setExpandedIds(prevState => ({
			...prevState,
			[dataId]: !prevState[dataId]
		  }));
		};
	*/	
 const handleFilterChange = (category, subCategoryId) => {
  setTempSelectedFilters(prev => ({
    ...prev,
    [category]: {
      ...prev[category],
      [subCategoryId]: !prev[category]?.[subCategoryId]
    }
  }));
};


  // Filtering collections based on search term
		useEffect(() => {
		  const filtered = collections.filter((collection) =>
			collection.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(collection.description &&
			  collection.description.toLowerCase().includes(searchTerm.toLowerCase()))
		  );
		  setFilteredCollections(filtered);
		}, [collections, searchTerm]);
		
		
		useEffect(() => {
           fetchFilterOptions();
        }, []);
		
// Modified filter option fetching
// Add this utility function at the top of your component or in a separate utils file
const decodeHtmlEntities = (text) => {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

// Modify the fetchFilterOptions function to decode the data when it's received
const fetchFilterOptions = async () => {
  try {
    const response = await axios.get(getApiUrl(ENDPOINTS.COLLECTIONS_FILTER));

    if (response.data && response.data.collectionsdata) {
      const data = response.data.collectionsdata;
      // Group data by category_name and decode HTML entities
      const groupedData = data.reduce((acc, item) => {
        const categoryName = decodeHtmlEntities(item.category_name);
        if (!acc[categoryName]) {
          acc[categoryName] = {};
        }
        acc[categoryName][item.sub_category_id] = {
          ...item,
          sub_category_name: decodeHtmlEntities(item.sub_category_name),
          checked: false
        };
        return acc;
      }, {});
      setFilterOptions(groupedData);
      
      // Initialize filters with decoded names
      const initialFilters = Object.keys(groupedData).reduce((acc, category) => {
        acc[category] = Object.keys(groupedData[category]).reduce((subAcc, subCatId) => {
          subAcc[subCatId] = false;
          return subAcc;
        }, {});
        return acc;
      }, {});
      setSelectedFilters(initialFilters);
      setTempSelectedFilters(initialFilters);
    }
  } catch (error) {
    console.error("Error fetching filter options:", error);
  }
};


		
 const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
const applyFilters = async () => {
  try {
    setIsFilterLoading(true); // Use separate loading state for filters
    setSelectedFilters(tempSelectedFilters);
    setCurrentPage(1);

    const hasActiveFilters = Object.values(tempSelectedFilters).some(category => 
      Object.values(category).some(val => val)
    );

    setFiltersApplied(hasActiveFilters);

    let filterCategory = "";
    if (hasActiveFilters) {
      filterCategory = Object.entries(tempSelectedFilters)
        .flatMap(([category, subCategories]) => 
          Object.entries(subCategories)
            .filter(([subCatId, isSelected]) => isSelected)
            .map(([subCatId]) => subCatId))
        .join(",");
    }

    const baseUrl = getApiUrlfilter(ENDPOINTS.COLLECTIONS);

    const queryParams = new URLSearchParams();
    
    if (hasActiveFilters) {
      queryParams.append("filterCategory", filterCategory);
    }
    
    if (searchTerm) {
      queryParams.append("searchTerm", searchTerm);
    }
    
    queryParams.append("page", "1");
    
    const apiUrl = `${baseUrl}?${queryParams.toString()}`;
    //console.log('Applying filters with URL:', apiUrl);

    const response = await axios.get(apiUrl);
    //console.log('Filter Response:', response.data);

    if (response.data && response.data.collectionsdata) {
      const processedData = response.data.collectionsdata.map(collection => ({
        ...collection,
        data_id: collection.data_id || collection.id || Math.random().toString(),
        title: collection.title || 'Untitled',
        description: collection.description || '',
        image: collection.image || 'https://via.placeholder.com/150',
        featured_image: collection.featured_image || 'https://via.placeholder.com/300x140',
        name: collection.name || 'Unknown User',
        categories: Array.isArray(collection.categories) ? collection.categories : []
      }));

      // Update states in sequence
      setAllCollections(processedData);
      setFilteredCollections(processedData);
      setHasMore(processedData.length >= 10);
      
      // Close filter dialog after successful update
      setFilterOpen(false);
    } else {
      setAllCollections([]);
      setFilteredCollections([]);
      setHasMore(false);
    }

  } catch (error) {
    console.error('Error applying filters:', error);
    setError('Failed to apply filters. Please try again.');
  } finally {
    setIsFilterLoading(false);
    setIsLoading(false);
  }
};




  const getSelectedFiltersCount = () => {
    return Object.values(selectedFilters).reduce((count, categoryFilters) => 
      count + Object.values(categoryFilters).filter(Boolean).length, 0
    );
  };
  
   const filterCount = getSelectedFiltersCount(selectedFilters);


  
// Updated resetFilters function with proper state management
// Updated resetFilters function with proper state management and data fetching
const resetFilters = async () => {
  try {
    setIsFilterLoading(true);
    
    // Reset all filter-related states
    const initialFilters = Object.keys(filterOptions).reduce((acc, category) => {
      acc[category] = Object.keys(filterOptions[category]).reduce((subAcc, subCatId) => {
        subAcc[subCatId] = false;
        return subAcc;
      }, {});
      return acc;
    }, {});

    // Reset all states in the correct order
    setTempSelectedFilters(initialFilters);
    setSelectedFilters(initialFilters);
    setFiltersApplied(false);
    setIsFiltering(false);
    setCurrentPage(1);
    setHasMore(true);
    setSearchTerm(''); // Also reset search term
    setIsSearchActive(false);
    setIsSearching(false);

    // Fetch fresh data from the API
   const response = await axios.get(getApiUrl(ENDPOINTS.COLLECTIONS, "page=1"));

    
    if (response.data && response.data.collectionsdata) {
      // Process the fetched data
      const processedData = response.data.collectionsdata.map(collection => ({
        ...collection,
        data_id: collection.data_id || collection.id || Math.random().toString(),
        title: collection.title || 'Untitled',
        description: collection.description || '',
        image: collection.image || 'https://via.placeholder.com/150',
        featured_image: collection.featured_image || 'https://via.placeholder.com/300x140',
        name: collection.name || 'Unknown User',
        categories: collection.categories || []
      }));

      // Update states with new data
      setAllCollections(processedData);
      setFilteredCollections(processedData);
      
      // Show success message
      setSnackbarMessage('Filters have been reset successfully');
      setSnackbarOpen(true);
    } else {
      throw new Error('Invalid data structure received from API');
    }

  } catch (error) {
    console.error('Error resetting filters:', error);
    setError('Failed to reset filters. Please try again.');
    setSnackbarMessage('Failed to reset filters. Please try again.');
    setSnackbarOpen(true);
  } finally {
    setIsFilterLoading(false);
    setFilterOpen(false); // Close the filter dialog
  }
};
  
    
 const handleExpandClick = (event, itemId) => {
    event.stopPropagation();
    setExpandedItemId(itemId);
  };
  
  const handleCloseDialog = () => {
    setExpandedItemId(null);
  };
  
const MemoizedCollectionCard = React.memo(CollectionCard); 

const memoizedFilteredCollections = useMemo(() => {
 // console.log('Recalculating memoized collections');
 // console.log('All Collections:', allCollections);
 // console.log('Search Term:', searchTerm);
 // console.log('Filters Applied:', filtersApplied);

  // Start with all collections
  let result = allCollections;

  // Apply search filter if there's a search term
  if (searchTerm) {
    result = result.filter((collection) => {
      const title = (collection.title || '').toLowerCase();
      const description = (collection.description || '').toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      return title.includes(searchLower) || description.includes(searchLower);
    });
  }

  // Apply selected filters if filters are applied
  if (filtersApplied) {
    result = result.filter((collection) => {
      const collectionCategories = collection.categories || [];
      
      return Object.entries(selectedFilters).every(([category, subCategories]) => {
        const hasSelectedSubCategories = Object.values(subCategories).some(value => value);
        if (!hasSelectedSubCategories) {
          return true;
        }

        return Object.entries(subCategories).some(([subCategoryId, isSelected]) => {
          if (!isSelected) {
            return false;
          }
          return Array.isArray(collectionCategories) && 
                 collectionCategories.includes(subCategoryId);
        });
      });
    });
  }

 // console.log('Filtered Result:', result);
  return result;
}, [allCollections, searchTerm, selectedFilters, filtersApplied]);

// Add this keyframe animation near the top with other styled components
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

// First, I'll update the initialization code for likes
useEffect(() => {
  const initializeAndFetchLikedCollections = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const userId = 'current_user';
      
      // Get all likes and counts in parallel
      const tx = db.transaction(['likes', 'globalCounts'], 'readonly');
      const likeStore = tx.objectStore('likes');
      const globalCountsStore = tx.objectStore('globalCounts');
      
      const [allLikes, allCounts] = await Promise.all([
        likeStore.getAll(),
        globalCountsStore.getAll()
      ]);

      // Process likes
      const likedState = {};
      const countState = {};
      
      allLikes.forEach(like => {
        if (like.id.startsWith(`${userId}_`)) {
          const collectionId = like.collectionId;
          likedState[collectionId] = true;
        }
      });

      allCounts.forEach(count => {
        countState[count.collectionId] = count.count;
      });

      setLikedItems(likedState);
      setLikeCounts(countState);
      
    } catch (error) {
      console.error('Error initializing database or fetching liked collections:', error);
    }
  };

  initializeAndFetchLikedCollections();
}, []);

// Add event listener for like status changes
useEffect(() => {
  const handleLikeStatusChange = (event) => {
    const { collectionId, isLiked, count } = event.detail;
    
    setLikedItems(prev => ({
      ...prev,
      [collectionId]: isLiked
    }));
    
    setLikeCounts(prev => ({
      ...prev,
      [collectionId]: count
    }));
  };

  window.addEventListener('likeStatusChanged', handleLikeStatusChange);

  return () => {
    window.removeEventListener('likeStatusChanged', handleLikeStatusChange);
  };
}, []);

// Add periodic refresh of global counts
useEffect(() => {
  const refreshGlobalCounts = async () => {
    try {
      const response = await axios.get(getApiUrl(ENDPOINTS.GET_COUNTS));
      const counts = response.data.counts || {};
      
      const db = await openDB('collectionsDB', 3);
      const tx = db.transaction('globalCounts', 'readwrite');
      const store = tx.objectStore('globalCounts');
      
      // Update all counts in IndexedDB and state
      for (const [collectionId, count] of Object.entries(counts)) {
        await store.put({
          collectionId,
          count,
          lastUpdated: new Date().toISOString()
        });
      }
      
      await tx.done;
      setLikeCounts(counts);
    } catch (error) {
      console.error('Error refreshing global counts:', error);
    }
  };

  // Initial refresh
  refreshGlobalCounts();

  // Set up periodic refresh
  const intervalId = setInterval(refreshGlobalCounts, 30000); // Refresh every 30 seconds

  return () => clearInterval(intervalId);
}, []);

useEffect(() => {
  const handleBackButton = (event) => {
    if (searchTerm) {
      event.preventDefault(); // Prevent default back navigation
      handleClearSearch();    // Clear the search
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
}, [searchTerm, handleClearSearch]);


return (
 <Container 
  maxWidth="lg" 
  sx={{
    backgroundColor: colors.app_primaryBackground,
    paddingTop: 0,
    marginTop: 0,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '100%',
    px: 0,
	minHeight: '100vh'
  }}
  ref={infiniteScrollRef}
  
>
<MetaData component="CollectionsPage" />
   <HeaderSpacer isSticky={isSticky} sx={{ px: { xs: 2 } }} />
   <StyledAppBar className={isSticky ? 'sticky' : ''}>
     <SearchContainer>
       <SearchBarWrapper 
         expanded={isSearchFocused} 
         isActive={!!searchTerm || isSearchFocused}
         sx={{ mx: { xs: 2 } }}
       >
         <SearchIcon style={{color:colors.app_primaryText}} />
         <InputBase
  placeholder="Search collections..."
  value={searchTerm}
  onChange={handleSearch}
  onKeyDown={(e) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      e.preventDefault();
      handleExternalSearch();
    }
  }}
  onFocus={() => setIsSearchFocused(true)}
  onBlur={(e) => {
    if (!e.relatedTarget || !e.relatedTarget.closest('.clear-button')) {
      if (!searchTerm) {
        setIsSearchFocused(false);
      }
    }
  }}
  fullWidth
/>
         {(isSearchFocused || searchTerm) && (
           <IconButton 
             onClick={(e) => {
               e.preventDefault();
               handleClearSearch();
               setIsSearchFocused(false);
             }}
             size="small"
             className="clear-button"
             sx={{
               padding: '4px',
               visibility: searchTerm ? 'visible' : 'visible',
               '&:hover': {
                 backgroundColor: 'rgba(0, 0, 0, 0.04)'
               }
             }}
           >
             <ClearIcon style={{color:colors.app_primaryText}} />
           </IconButton>
         )}
       </SearchBarWrapper>
       
       {!isSearchFocused && (
         <>
           <ActionButton 
             onClick={handleMyCollectionsClick}
             sx={{
               backgroundColor: pinnedCollectionsOpen ? colors.app_primary : colors.accent2Light,
               color: pinnedCollectionsOpen ? '#FFFFFF' : '#000000',
               '& .MuiSvgIcon-root': {
                 color: pinnedCollectionsOpen ? '#FFFFFF' : 'inherit',
               },
               '&:focus': {
                 backgroundColor: pinnedCollectionsOpen ? colors.app_primary : colors.accent2Light,
               },
               '-webkit-tap-highlight-color': 'transparent',
             }}
           >
             MY FAVORITES
           </ActionButton>
           <ActionButton 
			  onClick={() => setFilterOpen(true)}
			  sx={{
				backgroundColor: filterOpen ? colors.app_primary : colors.accent2Light,
				color: filterOpen ? '#FFFFFF' : '#000000',
				'& .MuiSvgIcon-root': {
				  color: filterOpen ? '#FFFFFF' : 'inherit',
				},
				'&:focus': {
				  backgroundColor: filterOpen ? colors.app_primary : colors.accent2Light,
				},
				'-webkit-tap-highlight-color': 'transparent',
			  }}
			>
			  <FilterListIcon /> 
			  Filter
			  {filterCount > 0 && (
				<FilterCount>
				  {filterCount}
				</FilterCount>
			  )}
			</ActionButton>
         </>
       )}
     </SearchContainer>
   </StyledAppBar>
   <Box sx={{ 
     width: '100%',
     marginBottom: 1,
     marginTop: 2,
     px: { xs: 1, sm: 2 },
   }}>
     {!isSearchActive &&
       <ErrorBoundary>
         <Suspense fallback={
           <Box 
             sx={{ 
               display: 'flex', 
               justifyContent: 'center', 
               alignItems: 'center',
               minHeight: '250px',
               width: '100%',
               backgroundColor: '#f5f5f5',
               borderRadius: '12px',
             }}
           >
             <CircularProgress size={40} sx={{ color:colors.app_primary  }} />
           </Box>
         }>
           <LazyHeaderCarousel />
         </Suspense>
       </ErrorBoundary>
     }
   </Box>
   {/* Display error message if error occurs */}
   {error && (
     <Typography color="error" align="center">
       {error}
     </Typography>
   )}
   {filteredCollections.length === 0 && (isFiltering || isSearching) && !isLoading ? (
     <Box textAlign="center" mt={2}>
       <Typography 
         variant="h6" 
         color="textSecondary"
         sx={{ 
           mb: 1, // Add margin bottom for spacing between lines
           fontSize: '1rem', // Adjust font size if needed
           fontWeight: 'normal' // Make the font weight normal
         }}
       >
         No collections found.
       </Typography>
       <Typography 
         variant="h6" 
         color="textSecondary"
         sx={{ 
           fontSize: '1rem', // Match the font size
           fontWeight: 'normal',
           marginTop: '18px'
         }}
       >
         Try searching on these platforms:
       </Typography>
       <Box display="flex" justifyContent="center" mt={2} mb={2}>
         {searchEngines.map((engine) => (
           <IconButton
             key={engine.searchenginename}
             onClick={() => handleEngineToggle(engine)}
             sx={{
               margin: '4px',
               borderRadius: '50%',
               backgroundColor: selectedEngines.some(e => e.searchenginename === engine.searchenginename)
                 ? colors.app_primary
                 : '#ccc',
               color: '#fff',
               width: '50px',
               height: '50px',
               position: 'relative',
               animation: `${glowPulse} 2s infinite ease-in-out`,
               transition: 'all 0.3s ease',
               '&:hover': {
                 backgroundColor: selectedEngines.some(e => e.searchenginename === engine.searchenginename)
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
             <Avatar
               src={`${IMAGE_BASE_URL}/${engine.searchengineimage.replace('../', '')}`}
               alt={engine.searchenginename}
               sx={{ 
                 width: '100%', 
                 height: '100%',
                 position: 'relative',
                 zIndex: 1
               }}
             />
           </IconButton>
         ))}
       </Box>
       <Button
         variant=""
         color=""
         onClick={handleExternalSearch}
         sx={{
           marginTop: '16px',
           padding: '10px 20px',
           backgroundColor: colors.app_primary,
           color: '#ffffff',
           borderRadius: '30px',
           '&:hover': {
             backgroundColor: colors.app_primary,
           },
           boxShadow: '0 4px 14px rgba(149, 117, 205, 0.4)',
         }}
       >
         SEARCH
       </Button>
     </Box>
   ) : (
     <InfiniteScroll
       dataLength={filteredCollections.length}
       next={!isSearching ? loadMore : null}
       hasMore={!isSearching && hasMore}
       loader={<InfiniteLoader isLoading={isFetchingMore} />}
       threshold={800}
       endMessage={
         !isSearching && !hasMore && (
           <>
             <Typography 
               textAlign="center" 
               mt={1} 
               color="textSecondary"
             >
               {filteredCollections.length === 0 ? 'No collections found.' : 'No more collections to load.'}
             </Typography>
             {/* Increased height and margin-bottom */}
             <Box 
               sx={{ 
                 height: '100px', // Increased from 60px to 100px
                 width: '100%',
                 mb: 4 // Increased from 2 to 4 (32px)
               }} 
             />
           </>
         )
       }
     >
       {isFilterLoading ? (
         <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
           <LottieLoader />
         </Box>
       ) : (
         <>
           <Box sx={{ px: { xs: 1, sm: 2 } }}>
             <Grid 
               container 
               spacing={1}
               sx={{ 
                 m: 0,
                 width: '100%',
               }}
             >
               {filteredCollections.map((item, index) => (
                 <Grid 
                   item 
                   key={item.data_id} 
                   xs={6} 
                   sm={6} 
                   md={4} 
                   lg={3} 
                   sx={{ 
                     mb: { xs: 1, sm: 2 },
                     p: { xs: 0.5 },
                   }}
                 >
                   <Box sx={{ height: '100%' }}>
                     <CollectionCard 
                       item={item}
                       //handleLikeClick={() => handleLikeClick(item.data_id)}
                       //handleShareClick={() => handleShareClick(item.data_id)}
                       //handlePinClick={() => handlePinClick(item.data_id)}
                       likedItems={likedItems}
                       pinnedItems={pinnedItems}
                       onCardClick={(id) => {
                         setClickedCardId(id);
                        // handleCollectionCardClick(item);
                       }}
                       isClicked={clickedCardId === item.data_id}
                     />
                   </Box>
                 </Grid>
               ))}
             </Grid>
           </Box>
         </>
       )}
     </InfiniteScroll>
   )}
   {/* Dialog for Pinned Collections */}
   <Dialog 
     open={pinnedCollectionsOpen} 
     onClose={() => setPinnedCollectionsOpen(false)} 
     fullWidth 
     maxWidth="md" 
     sx={{
       '& .MuiDialog-paper': {
         borderRadius: '12px',
         overflow: 'hidden',
         // Dynamically set height based on whether there are pinned collections
         height: pinnedCollections.length === 0 ? '150px' : '500px',
         top: '-12px',
         transition: 'height 0.3s ease' // Add smooth transition for height changes
       }
     }}
   >
     <DialogTitle
       sx={{
         background: colors.app_primary,
         padding: '12px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'space-between',
         color: 'white',
         borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
         minHeight: '48px',
         fontSize: '0.95rem',
         fontWeight: 'bold',
         position: 'relative'
       }}
     >
       <Box sx={{ flex: 1, textAlign: 'center' }}>MY FAVORITES</Box>
       <IconButton
         onClick={() => setPinnedCollectionsOpen(false)}
         sx={{
           position: 'absolute',
           right: 8,
           top: '50%',
           transform: 'translateY(-50%)',
           color: '#FFFFFF',
           padding: '8px',
           '&:hover': {
             backgroundColor: 'rgba(255, 255, 255, 0.1)'
           }
         }}
       >
         <CloseIcon sx={{ fontSize: '1.2rem' }} />
       </IconButton>
     </DialogTitle>
     <DialogContent
       dividers
       sx={{
         padding: '16px',
         background: 'linear-gradient(to bottom, #ffffff, #f3f7fa)',
         overflowY: 'auto',
         '&::-webkit-scrollbar': {
           width: '8px',
         },
         '&::-webkit-scrollbar-track': {
           background: '#f1f1f1',
           borderRadius: '4px',
         },
         '&::-webkit-scrollbar-thumb': {
           background: colors.app_primary,
           borderRadius: '4px',
           '&:hover': {
             background: colors.app_primary_dark,
           },
         },
       }}
     >
       {pinnedCollections.length === 0 ? (
         <Typography variant="body1" color="textSecondary" textAlign="center">
           No pinned collections available.
         </Typography>
       ) : (
         <Grid container spacing={2}>
           {pinnedCollections.map((item) => (
             <Grid item key={item.data_id} xs={12} sm={6} md={6} lg={4}>
               <CollectionCard 
                 item={item}
                 //handleLikeClick={() => handleLikeClick(item.data_id)}
                 //handleShareClick={() => handleShareClick(item.data_id)}
                 //handlePinClick={() => handlePinClick(item.data_id)}
                 likedItems={likedItems}
                 pinnedItems={pinnedItems}
                 onCardClick={(id) => {
                   setClickedCardId(id);
                   //handleCollectionCardClick(item);
                 }}
                 isClicked={clickedCardId === item.data_id}
               />
             </Grid>
           ))}
         </Grid>
       )}
     </DialogContent>
     <DialogActions
       sx={{
         padding: '8px 10px',
         backgroundColor: '#f5f5f5',
         justifyContent: 'center',
       }}
     >
       <Button
         onClick={() => setPinnedCollectionsOpen(false)}
         sx={{
           fontWeight: 800,
           color: colors.app_primary,
           border: `1px solid ${colors.app_primary}`,
           padding: '6px 16px',
           '&:hover': {
             backgroundColor: 'rgba(25, 118, 210, 0.04)',
             transform: 'scale(1.05)',
           },
           transition: 'all 0.3s ease-in-out',
         }}
       >
         CLOSE
       </Button>
     </DialogActions>
   </Dialog>
   <StyledDialog open={expandedItemId !== null} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
     {expandedItemId && (
       // Define expandedItem based on expandedItemId
       (() => {
         const expandedItem = filteredCollections.find(item => item.data_id === expandedItemId);
         return (
           <>
             {/* Dialog Header with Simple Styling */}
             <DialogTitle
               sx={{
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 padding: '16px',
                 backgroundColor: '#ffffff',
                 borderBottom: '1px solid #e0e0e0',
               }}
             >
               <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                 {expandedItem?.title}
               </Typography>
               <IconButton
                 onClick={handleCloseDialog}
                 sx={{
                   position: 'absolute',
                   top: 8,
                   right: 8,
                 }}
               >
                 <CloseIcon />
               </IconButton>
             </DialogTitle>
             {/* Main Content Area */}
             <DialogContent
               sx={{
                 padding: '16px',
                 backgroundColor: '#f9f9f9',
               }}
             >
               <Typography variant="body2" color="textSecondary">
                 {expandedItem?.description || 'No description available.'}
               </Typography>
             </DialogContent>
             {/* Footer Section with Simple Button */}
             <DialogActions sx={{ padding: '8px', justifyContent: 'flex-end' }}>
               <Button
                 onClick={handleCloseDialog}
                 variant="outlined"
                 color="primary"
                 sx={{
                   borderRadius: '8px',
                   padding: '6px 12px',
                   textTransform: 'none',
                 }}
               >
                 Close
               </Button>
             </DialogActions>
           </>
         );
       })()
     )}
   </StyledDialog>
   {/* Snackbar for notifications */}
   <Snackbar
     open={snackbarOpen}
     autoHideDuration={2000}
     onClose={() => setSnackbarOpen(false)}
     anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
     sx={{
       bottom: { xs: '24px', sm: '24px' },
       zIndex: 9999,
       marginBottom: '20px'
     }}
   >
     <Alert 
       onClose={() => setSnackbarOpen(false)} 
       severity={snackbarSeverity}
       variant="filled"
       elevation={6}
       sx={{ 
         width: '100%',
         minWidth: '200px',
         boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
         '& .MuiAlert-message': {
           fontSize: '0.95rem',
           fontWeight: 500,
           display: 'flex',
           alignItems: 'center'
         },
         '& .MuiAlert-icon': {
           fontSize: '1.5rem'
         }
       }}
     >
       {snackbarMessage}
     </Alert>
   </Snackbar>
   <Dialog 
     open={filterOpen} 
     onClose={() => setFilterOpen(false)} 
     fullWidth 
     maxWidth="sm" 
     sx={{
       '& .MuiDialog-paper': {
         margin: { xs: '16px', sm: '32px' },
         width: { xs: 'calc(100% - 32px)', sm: '600px' },
         borderRadius: '12px',
         overflow: 'hidden',
         height: '535px',
		 top: '-10px'
       }
     }}
   >
     <DialogTitle
       sx={{
         background: colors.app_primary,
         color: '#FFFFFF',
         textAlign: 'center',
         fontWeight: 'bold',
         padding: '12px 40px 12px 12px', // Added right padding for the close icon
         fontSize: '0.95rem',
         position: 'relative', // For positioning the close icon
         minHeight: '48px',
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center'
       }}
     >
       Filter
       <IconButton
         onClick={() => setFilterOpen(false)}
         sx={{
           position: 'absolute',
           right: 8,
           top: '50%',
           transform: 'translateY(-50%)',
           color: '#FFFFFF',
           padding: '8px',
           '&:hover': {
             backgroundColor: 'rgba(255, 255, 255, 0.1)'
           }
         }}
       >
         <CloseIcon sx={{ fontSize: '1.2rem' }} />
       </IconButton>
     </DialogTitle>

     <DialogContent
       sx={{
         background: 'linear-gradient(to bottom, #ffffff, #f0f4f8)',
         padding: '16px',
         overflowY: 'auto',
         '& .MuiFormControlLabel-root': {
           marginY: '4px' // Reduce vertical spacing between checkboxes
         }
       }}
     >
       {Object.entries(filterOptions).map(([category, subCategories]) => (
         <Box key={category} mb={2}> {/* Reduced margin bottom */}
           <Typography
             variant="h6"
             sx={{
               fontWeight: '600',
               marginBottom: '8px',
               color: colors.categoryActive,
               fontSize: '0.9rem', // Reduced font size
               textDecoration: 'underline'
             }}
           >
             {category}
           </Typography>
           <FormGroup>
             {Object.entries(subCategories).map(([subCategoryId, subCategory]) => (
               <FormControlLabel
                 key={subCategoryId}
                 control={
                   <Checkbox
                     checked={tempSelectedFilters[category]?.[subCategoryId] || false}
                     onChange={() => handleFilterChange(category, subCategoryId)}
                     sx={{
                       padding: '6px', // Reduced padding
                       '&.Mui-checked': {
                         color: '#ff4081',
                       }
                     }}
                   />
                 }
                 label={
                   <Box
                     display="flex"
                     alignItems="center"
                     sx={{
                       '&:hover': {
                         backgroundColor: 'rgba(255, 64, 129, 0.1)',
                         borderRadius: '8px',
                         padding: '2px',
                       },
                       transition: 'all 0.3s ease',
                     }}
                   >
                   
                     <Typography sx={{ fontSize: '0.85rem' }}> {/* Reduced font size */}
                       {subCategory.sub_category_name}
                     </Typography>
                   </Box>
                 }
                 sx={{
                   margin: '2px 0', // Reduced margin
                   '& .MuiTypography-root': {
                     fontSize: '0.85rem' // Consistent font size
                   }
                 }}
               />
             ))}
           </FormGroup>
         </Box>
       ))}
     </DialogContent>

     <DialogActions
       sx={{
         background: '#f9f9f9',
         padding: '8px 16px',
         justifyContent: 'space-between',
         borderTop: '1px solid rgba(0, 0, 0, 0.1)',
       }}
     >
       <Button
         onClick={resetFilters}
         variant="outlined"
         disabled={isFilterLoading}
         sx={{
           fontWeight: '600',
           padding: '6px 16px',
           borderRadius: '20px',
           minHeight: '32px',
           fontSize: '0.85rem',
           textTransform: 'none',
           color: colors.app_categoryActive,
           '&:hover': {
             backgroundColor: '#ff4081',
             transform: 'scale(1.05)',
             color: colors.app_categoryActive,
           },
         }}
       >
         Reset
       </Button>
       <Button
         onClick={applyFilters}
         variant="contained"
         color="primary"
         disabled={isFilterLoading}
         sx={{
           fontWeight: '600',
           padding: '6px 20px',
           borderRadius: '20px',
           minHeight: '32px',
           fontSize: '0.85rem',
           textTransform: 'none',
           background: colors.app_primary,
           boxShadow: '0px 2px 8px rgba(255, 64, 129, 0.3)',
           '&:hover': {
             transform: 'scale(1.05)',
             boxShadow: '0px 4px 12px rgba(255, 64, 129, 0.5)',
           },
         }}
       >
         {isFilterLoading ? 'Applying...' : 'Apply'}
       </Button>
     </DialogActions>
   </Dialog>
  
 </Container>
);


};

export default CollectionsPage;