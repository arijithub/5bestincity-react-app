import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Card, CardActions, CardContent, CardMedia, Typography, Grid, Container,
  IconButton, Box, InputBase, Button, AppBar, Toolbar, Modal, Checkbox,
  FormGroup, FormControlLabel, CardActionArea, CircularProgress, Slide, Grow, GlobalStyles 
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { styled, alpha } from '@mui/material/styles';
import Lottie from 'react-lottie';
import Carousel from 'react-material-ui-carousel';
import loaderAnimation from './loader-animation.json';
import loadMoreAnimation from './loader-animation.json';
import he from 'he';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';
import {
  colors
} from '../../theme-styles';

import '../../styles/master.css';
import '../../styles/custom-styles.css';
import MetaData from '../../components/MetaData';




import FilterModal from './FilterModal'; // Import the new FilterModal component

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import UpdateIcon from '@mui/icons-material/Update';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FooterComponent from '../../FooterComponent';
import ProductsBanner from './ProductsBanner';

import {
  API_BASE_URL,
  ENDPOINTS,
  IMAGE_BASE_URL,
  getApiUrl,
  getEngineImageUrl,
  COLORS,
} from '../../config/apiConfigext';

import ProductCard from './ProductCard';

// Add this with your other styled components, before the ProductsPage function
const NoProductsContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.app_primaryBackground,
  padding: theme.spacing(3),
  marginTop: theme.spacing(2), // Reduced margin when no results
  minHeight: '200px',
  '& .MuiTypography-root': {
    textAlign: 'center'
  }
}));

const HeaderWrapper = styled('div')(({ theme }) => ({
  height: '80px',
  width: '100%',
  marginBottom: theme.spacing(2),
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: 'none',
  padding: theme.spacing(0.75, 2),
  minWidth: 'auto',
  fontWeight: 500,
  fontSize: '0.875rem',
}));

const SearchEngineIcon = styled('div')(({ theme }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  cursor: 'pointer',
  margin: '0 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  transition: 'all 0.3s ease',
  
  backgroundColor: colors.app_primaryBackground,
  border: '2px solid transparent',
  
  '&.selected': {
   
    border: '2px solid #ff4444',
    transform: 'scale(1.05)',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-5px',
      top: '-5px',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: '#4CAF50',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E")`,
      backgroundSize: '12px',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      border: '2px solid white'
    }
  },

  '& img': {
    width: '85%',
    height: '85%',
    objectFit: 'contain',
    borderRadius: '50%',
  }
}));

const SearchButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#007bff',
  color: 'white',
  '&:hover': {
    backgroundColor: '#0056b3',
  },
}));

const SortButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.accent2Light,
  color: '#000',
  borderRadius: 20,
  padding: theme.spacing(0.75, 2),
  [theme.breakpoints.down('sm')]: {  // Maintain consistent button size on mobile
    minWidth: 'auto',
  },
}));

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  '.sticky &': {
    flexGrow: 1,
    marginLeft: 0,
    marginRight: theme.spacing(2),
    width: '100%',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
  },
}));

const SearchButtonStyled = styled(Button)(({ theme }) => ({
  backgroundColor: colors.app_primary, // Use the purple color similar to the image
  color: '#ffffff',
  '&:hover': {
    backgroundColor: '#5e35b1', // Darker shade for hover
  },
  borderRadius: '20px',
  padding: theme.spacing(1, 3),
  textTransform: 'uppercase',
}));


const ProductGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexBasis: '50%',
    maxWidth: '50%',
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('sm')]: {
    flexBasis: '50%',
    maxWidth: '50%',
    padding: theme.spacing(0.5),
  },
  [theme.breakpoints.up('md')]: {
    flexBasis: '33.333333%',
    maxWidth: '33.333333%',
    padding: theme.spacing(0.5),
  },
}));


const ClearButton = styled(IconButton)(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  right: 0,
  top: 0,
  color: alpha(theme.palette.common.black, 0.54),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: colors.app_primaryBackground,
  color: theme.palette.text.primary,
  boxShadow: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  width: '100%',
  height: '0px',
  padding: 0,
  margin: 0,
  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden',
  willChange: 'transform',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.app_primaryBackground,
    zIndex: -1,
  },
  
  '&.sticky-header': {
    backgroundColor: colors.app_primaryBackground,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  }
}));



const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none', // Allow full width, no constraints
  padding: 0, // Remove padding if any exists
  margin: 0, // Remove margin if any exists
}));



// Spacer Element



const SearchContainer = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  backgroundColor: colors.app_primaryBackground,
  padding: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease-in-out',
}));

const HeaderSpacer = styled('div')({
  display: 'none', // We don't need the spacer anymore
});

// Update StickySearchContainer
const StickySearchContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '-webkit-fill-available',
  backgroundColor: colors.app_primaryBackground,
  padding: theme.spacing(1),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  boxShadow: 'none',
  transition: 'all 0.3s ease',
  height: '60px',
  margin: '0 8px',
  zIndex: 2, // Increased z-index
  
  '.sticky-header &': {
    backgroundColor: colors.app_primaryBackground,
  },

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: '0 8px',
  }
}));


const ContentContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  backgroundColor: colors.app_primaryBackground,
  minHeight: '100vh',
  marginTop: 0,
  width: '100%',
  padding: 0,
  display: 'flex',
  flexDirection: 'column'
}));


const SearchWrapper = styled(Box)(({ theme, expanded }) => ({
  display: 'flex',
  alignItems: 'center',
  border: '1px solid #e0e0e0',
  borderRadius: 20,
  padding: theme.spacing(0.5, 1.5),
  flex: expanded ? 1 : 'none',
  width: expanded ? '100%' : 'auto',
  marginRight: expanded ? 0 : theme.spacing(1),
  backgroundColor: colors.app_primaryBackground,
  transition: 'all 0.3s ease-in-out',
}));

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
  position: 'relative', // Ensure it stays above content
  zIndex: 2,
  '&:focus-within': {
    borderColor: isActive ? '#2196f3' : colors.searchbaractiveborder,
    boxShadow: isActive ? '0 0 0 1px rgba(33, 150, 243, 0.2)' : '0 0 5px rgba(0, 123, 255, 0.5)',
  }
}));

const ProductGridContainer = styled(Box)(({ theme, padTop }) => ({
  position: 'relative',
  zIndex: 1,
  backgroundColor: colors.app_primaryBackground,
  padding: theme.spacing(0.5),
  paddingTop: padTop ? theme.spacing(10) : 0,
  width: '100%',
  minHeight: '50vh',
  '& .MuiGrid-container': {
    margin: 0,
    width: '100%'
  }
}));


const SearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '0.875rem',
}));

const StyledSearchInput = styled(InputBase)(({ theme }) => ({
  marginLeft: theme.spacing(1),
  flex: 1,
  fontSize: '0.875rem',
}));





const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  backgroundColor: colors.app_primaryBackground,
  boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  padding: theme.spacing(1),
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
  marginBottom: theme.spacing(0.5),
  padding: theme.spacing(0.5),
}));


const DiscountBadge = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  color: '#ff7043',
  padding: theme.spacing(0.5, 2),
  borderRadius: '24px', // Rounded corners to match the desired design
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
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: '1.2',
  margin: '4px 0',
});




const PageBackground = styled(Container)(({ theme }) => ({
  backgroundColor: colors.app_primaryBackground,
  minHeight: '100vh',
  padding: 0,
  margin: 0,
  maxWidth: '100% !important',
  position: 'relative',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column'
}));


const ExpandIconButton = styled(IconButton)(({ expanded }) => ({
  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
  transition: 'transform 0.6s ease-in-out',
}));

const LoaderContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  zIndex: 9999,
}));

const BannerImage = styled('img')({
  width: '100%',
  height: '300px',
  objectFit: 'cover',
  padding: '8px',
  borderRadius: '20px',
  display: 'block'
});



const NoResultsMessage = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '100%',
  maxWidth: '500px', // Wider modal for better visibility
  backgroundColor: theme.palette.background.paper,
  borderRadius: '12px', // Rounded corners for a modern look
  boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.15)', // Softer, more prominent shadow
  padding: theme.spacing(3), // More padding for better spacing
  transition: 'all 0.3s ease', // Smooth transition for a modern feel
}));

const FilterButton = styled(Button)(({ theme }) => ({
  backgroundColor: colors.accent2Light,
  color: '#000',
  borderRadius: 20,
  padding: theme.spacing(0.75, 2),
  [theme.breakpoints.down('sm')]: {  // Maintain consistent button size on mobile
    minWidth: 'auto',
  },
}));

const FilterCount = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '24px',
  height: '24px',
  borderRadius: '12px',
  backgroundColor: colors.categoryActive,
  color: theme.palette.common.white,
  fontSize: '0.85rem',
  fontWeight: 'bold',
  marginLeft: theme.spacing(1),
  padding: '0 8px',
}));




const loadMoreOptions = {
  loop: true,
  autoplay: true,
  animationData: loadMoreAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};


function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
 
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const appBarRef = useRef(null);
  const searchInputRef = useRef(null);
  const [filterOptions, setFilterOptions] = useState({
  Price: [
    'Rs. 100 and Below',
    'Rs. 101 - Rs. 300',
    'Rs. 301 - Rs. 500',
    'Rs. 501 - Rs. 700',
    'Rs. 700 and Above'
  ],
  'F-Assured': ['F-Assured'],
  Brand: [],
  'Customer Ratings': ['4★ & above', '3★ & above'],
  Discount: ['50% or more', '40% or more', '30% or more', '20% or more', '10% or more'],
  Availability: ['Include Out of Stock'],
  'Corded/Cordless': ['Corded', 'Corded & Cordless', 'Cordless'],
  'Ideal for': ['Men', 'Women'],
  'GST Invoice Available': ['GST Invoice Available'],
  Offers: ['Buy More, Save More', 'Special Price'],
  Category: [] // This will be populated from the API
});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const loaderRef = useRef(null);
  const searchBarRef = useRef(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const [noMoreProducts, setNoMoreProducts] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
   const [searchEngines, setSearchEngines] = useState([]);
  const [selectedEngines, setSelectedEngines] = useState([]);
  const [displayedProductCount, setDisplayedProductCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
	const [isSearchFocused, setIsSearchFocused] = useState(false);
  
      const [maxChars, setMaxChars] = useState(50);
	  
	  const handleSearchFocus = () => setIsSearchFocused(true);
     // const handleSearchBlur = () => setIsSearchFocused(false);
	 const [sortOpen, setSortOpen] = useState(false);
	 
	 const handleSortOpen = () => {
        setSortOpen(true); // Open the sort modal
     };

     const handleSortClose = () => {
       setSortOpen(false); // Close the sort modal
     };
	const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
    const [advancedSelectedFilters, setAdvancedSelectedFilters] = useState({});
	
	const handleAdvancedFilterOpen = () => setAdvancedFilterOpen(true);
    const handleAdvancedFilterClose = () => setAdvancedFilterOpen(false);
	const [sortOption, setSortOption] = useState('');
	const [newFilterCategories, setNewFilterCategories] = useState([]); // State to store fetched categories for new filter
    const [newSelectedFilters, setNewSelectedFilters] = useState({});   // State to store selected filters
    const [newFilterOpen, setNewFilterOpen] = useState(false);          // State for modal visibility
	
	const [newFilteredProducts, setNewFilteredProducts] = useState([]);
	const [noProductsMessage, setNoProductsMessage] = useState('');
	const [tempSelectedFilters, setTempSelectedFilters] = useState({});
	const [allProducts, setAllProducts] = useState([]);
	
	 const productGridRef = useRef(null);
     
	const [userScrolled, setUserScrolled] = useState(false);   // NEW

		useEffect(() => {
		  if (products.length > 0) {
			setNewFilteredProducts(products);
		  }
		}, [products]);

  useEffect(() => {
    const updateMaxChars = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) {
        setMaxChars(30); // Set shorter max length for smaller screens
      } else {
        setMaxChars(50); // Set longer max length for larger screens
      }
    };

    // Set initial maxChars
    updateMaxChars();

    // Add event listener for resizing window
    window.addEventListener('resize', updateMaxChars);
    return () => {
      window.removeEventListener('resize', updateMaxChars);
    };
  }, []);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };


  
  const handleProductClick = (url) => {
  window.open(url, '_blank');
};

useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [selectedFilters, products]);
  
   const isFiltersApplied = () => {
    return Object.values(selectedFilters).some(category => 
      Object.values(category).some(isSelected => isSelected)
    );
  };

  
  
 // Add this useEffect to fetch categories from the filter API
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.AMAZON_FILTER));
      const categoryData = await response.json();
      const categories = categoryData.amazondata.map(category => ({
        id: category.store_id.toString(),  // Convert to string if necessary
        name: category.store_name,
      }));
      setFilterOptions(prev => ({
        ...prev,
        Category: categories,
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  fetchCategories();
}, []);



useEffect(() => {
  const fetchNewCategories = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.AMAZON_FILTER));
      const data = await response.json();
      
      setNewFilterCategories(data.amazondata);  // Store categories data
    } catch (error) {
      console.error('Error fetching new filter categories:', error);
    }
  };

  fetchNewCategories();  // Call function when component mounts
}, []);





   useEffect(() => {
    fetchProducts();
    fetchSearchEngines();
  }, []);

  const fetchSearchEngines = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.AMAZON_API, 'page=1'));
      const data = await response.json();
      setSearchEngines(data.searchengine.searchenginedata);
      // Set the first engine as selected by default
      const defaultEngines = [data.searchengine.searchenginedata[0]];
      setSelectedEngines(defaultEngines);
    } catch (error) {
      console.error('Error fetching search engines:', error);
    }
  };

  const handleEngineToggle = (engine) => {
    setSelectedEngines(prev => 
      prev.some(e => e.searchenginename === engine.searchenginename)
        ? prev.filter(e => e.searchenginename !== engine.searchenginename)
        : [...prev, engine]
    );
  };

const handleExternalSearch = useCallback((e) => {
  if (e.key === 'Enter' || e.type === 'click') {
	  //alert(e.key);
    if (selectedEngines.length > 0 && searchTerm) {
      const encodedQuery = encodeURIComponent(searchTerm);
      const searchUrls = selectedEngines.map(engine => 
        `${engine.searchengineurl}${encodedQuery}`
      ).join('/~');

      if (searchUrls) {
        window.open(`collections:${searchUrls}`, '_blank');
      }
    }
  }
}, [selectedEngines, searchTerm]);

  
const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
  
const handleNewFilterReset = () => {
  //console.log("Resetting filters while maintaining sort order");

  // Clear filter selections
  setNewSelectedFilters({});
  setTempSelectedFilters({});

  // Keep the current sort option
  const currentSortOption = sortOption;

  // Re-fetch products with no filters but maintain sort option
  const newPage = 1;
  
  // Safely scroll to top
  try {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } catch (error) {
    console.error('Error scrolling:', error);
  }

  // Fetch products with reset filters
  fetchProducts('', newPage, {}, currentSortOption)
    .then(() => {
      setPage(newPage);
      setNewFilterOpen(false);
    })
    .catch(error => {
      console.error('Error resetting filters:', error);
    });
};






  useEffect(() => {
    const fetchInitialProducts = async () => {
      setIsFetchingMore(true);
      try {
        const response = await fetch(getApiUrl(ENDPOINTS.AMAZON_API, 'page=1'));
        const data = await response.json();
        if (data.amazondata && data.amazondata.length > 0) {
          setProducts(data.amazondata);
          setPage(1);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setHasMore(false);
      } finally {
        setIsFetchingMore(false);
      }
    };

    fetchInitialProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      // ①  sticky‑header logic (unchanged)
      if (!isSticky && scrollY > 0)        setIsSticky(true);
      if (isSticky  && scrollY === 0)      setIsSticky(false);

      // ②  mark that the user has really scrolled
      if (!userScrolled && scrollY > 100)  setUserScrolled(true);
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky, userScrolled]);  // ← include userScrolled




    useEffect(() => {
    if (!isInitialLoad) {
      const filtered = products.filter(product => 
        (searchTerm === '' || 
         product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
         product.offer_price.toString().includes(searchTerm)
        ) &&
        (Object.values(selectedFilters).every(v => v === false) || selectedFilters[product.store_id])
      );
	  //scrollToTop();
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products, selectedFilters, isInitialLoad]);

const formatPrice = (price) => {
  if (price === null || price === undefined || price === '0') {
    return ''; // If offer price is missing or zero, return an empty string
  }
  return `₹${parseFloat(price).toFixed(2)}`;
};

const formatPriced = (price) => {
  if (price === 'N/A' || isNaN(parseFloat(price))) {
    return 'N/A';
  }
  return `₹${parseFloat(price)}`;
};

  const handleExpandClick = (productId) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
 /*
const handleSearchFocus = () => {
  setIsSearchFocused(true);  // Expand the search bar
};
*/

/*
const handleSearchBlur = () => {
  if (!searchTerm) {
    setIsSearchFocused(false);  // Collapse the search bar if empty
  }
};
*/

const handleAdvancedFilterChange = (category, filter, isChecked) => {
  setAdvancedSelectedFilters((prev) => ({
    ...prev,
    [category]: {
      ...prev[category],
      [filter]: isChecked,
    },
  }));
};



const handleSearch = (event) => {
  const newSearchTerm = event.target.value.toLowerCase();
  setSearchTerm(newSearchTerm);
  setPage(1); // Reset page to 1 when searching

  // Fetch products with the updated search term, filters, and sorting options
  fetchProducts(newSearchTerm, 1, newSelectedFilters, sortOption);
  
   if (event.key === 'Enter') {
    handleExternalSearch(event);
  }
};







const handleClearSearch = () => {
  // Clear search term only, but keep filters and sort options intact
  setSearchTerm('');
  setPage(1); // Reset to page 1 for consistency

 // console.log('Clearing search and fetching products with current filters and sort options');
  
  setIsSearchFocused(false);
  setSearchExpanded(false);
  
   if (searchInputRef.current) {
    searchInputRef.current.blur();
    searchInputRef.current.value = '';
  }

  // Re-fetch products with current filters and sort options
  fetchProducts('', 1, newSelectedFilters, sortOption);
};



const handleFilterChange = (category, filter, isChecked) => {
 // console.log(`Filter changed: Category - ${category}, Filter - ${filter}, Checked - ${isChecked}`);
  setSelectedFilters(prev => {
    const updatedFilters = {
      ...prev,
      [category]: {
        ...prev[category],
        [filter]: isChecked
      }
    };
    
    // Re-fetch products with updated filters, search term, and sorting options
    const newPage = 1;
    fetchProducts(searchTerm, newPage, updatedFilters, sortOption);
    setPage(newPage); // Reset page number to 1 after filter change
    
    return updatedFilters;
  });
};


  const handleFilterReset = () => {
	  localStorage.setItem('isfilter','no');
    setSelectedFilters({});
    // Reset your product list here
  };

 const handleFilterApply = (appliedFilters) => {
    //console.log("Applying filters:", appliedFilters);
    setSelectedFilters(appliedFilters);
    setFilterOpen(false);
    setIsFiltering(true);
	localStorage.setItem('isfilter','yes');
    //setPage(1);
    setHasMore(true);
    applyFilters(appliedFilters);
  };


 
const handleSearchExpand = () => {
  setIsExpanded(true);
  if (searchInputRef.current) {
    searchInputRef.current.focus();
  }
};
  
    const handleSearchCollapse = () => {
    if (!searchTerm) {
      setIsExpanded(false);
    }
  };

  
// New function to handle displaying the filtered products
const displayFilteredProducts = (filtered) => {
	
  if (filtered.length === 0) {
	  setHasMore(false);
 //   console.log("No products found matching your criteria.");
  } else {
	  localStorage.setItem('flength',filtered.length);
   // console.log(`Displaying ${filtered.length} filtered products.`);
  }

  setFilteredProducts(filtered); // Still use this internally to update state
};

const applyFilters = (currentFilters = selectedFilters) => {
  let filtered = [...products];
 // console.log("Total products before filtering:", filtered.length);

  // Iterate over each filter category
  Object.entries(currentFilters).forEach(([category, filters]) => {
    const activeFilters = Object.entries(filters).filter(([_, isActive]) => isActive).map(([filter]) => filter);
    
    if (activeFilters.length > 0) {
     // console.log(`Applying ${category} filters:`, activeFilters);
      filtered = filtered.filter(product => {
        switch (category) {
          case 'Price':
            const price = parseFloat(product.offer_price || product.product_price) || 0;
            return activeFilters.some(filter => {
              switch (filter) {
                case 'Rs. 100 and Below':
                  return price <= 100;
                case 'Rs. 101 - Rs. 300':
                  return price > 100 && price <= 300;
                case 'Rs. 301 - Rs. 500':
                  return price > 300 && price <= 500;
                case 'Rs. 501 - Rs. 700':
                  return price > 500 && price <= 700;
                case 'Rs. 700 and Above':
                  return price > 700;
                default:
                  return false;
              }
            });

          case 'F-Assured':
            return product.is_f_assured === "1";

          case 'Brand':
            return activeFilters.includes(product.brand);

          case 'Customer Ratings':
            const rating = parseFloat(product.star_rating) || 0;
            return activeFilters.some(filter => {
              const minRating = parseFloat(filter.split('★')[0]);
              return rating >= minRating;
            });

          case 'Discount':
            const discount = parseFloat(product.discount_percentage) || 0;
            return activeFilters.some(filter => {
              const minDiscount = parseFloat(filter.replace(/[^0-9.-]+/g, ""));
              return discount >= minDiscount;
            });

          case 'Availability':
            return activeFilters.includes('Include Out of Stock') ? true : product.availability === "Now";

          case 'Corded/Cordless':
            return activeFilters.includes(product.corded_cordless);

          case 'Ideal for':
            return activeFilters.some(filter => 
              product.description.toLowerCase().includes(filter.toLowerCase())
            );

          case 'GST Invoice Available':
            return product.gst_invoice_available === "1";

          case 'Offers':
            return activeFilters.some(offer => 
              product.description.toLowerCase().includes(offer.toLowerCase())
            );

          case 'Category':
            // Filter products based on store_id that matches the active category filters
            return activeFilters.includes(product.store_id.toString());
			
          default:
            return true;
        }
      });
    }
  });

 // console.log("Filtered products:", filtered.length);
  filtered.forEach(product => {
   // console.log(`Product: ${product.product_name}, Price: ${product.offer_price || product.product_price}`);
  });
  
    setFilteredProducts(filtered);
	
    setIsFiltering(false);
  
    // Use the new function to display filtered products
    displayFilteredProducts(filtered);
};


const applyNewFilters = (filters = newSelectedFilters, sort = sortOption) => {
  let filtered = [...products];

  // Apply Filtering by Store ID
  const activeStoreFilters = Object.entries(filters)
    .filter(([_, isActive]) => isActive)
    .map(([storeId]) => storeId);

  if (activeStoreFilters.length > 0) {
   // console.log(`Filtering products by store IDs: ${activeStoreFilters}`);
    filtered = filtered.filter((product) => activeStoreFilters.includes(product.storeid.toString()));
  }

  //console.log("Products after filtering:", filtered.length);
  filtered.forEach((product) => {
  //  console.log(`Product ID: ${product.product_id}, Name: ${product.product_name}, Store ID: ${product.storeid}`);
  });

  // Apply Sorting
  if (sort) {
   // console.log(`Sorting products based on option: ${sort}`);
    switch (sort) {
      case 'popularity':
        filtered.sort((a, b) => b.sales_rank - a.sales_rank); // Assuming `sales_rank` defines popularity
        break;
      case 'latest':
        filtered.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
        break;
      case 'priceHighToLow':
        filtered.sort((a, b) => parseFloat(b.offer_price || b.product_price) - parseFloat(a.offer_price || a.product_price));
        break;
      case 'priceLowToHigh':
        filtered.sort((a, b) => parseFloat(a.offer_price || a.product_price) - parseFloat(b.offer_price || b.product_price));
        break;
      default:
        break;
    }
  }

 // console.log("Products after sorting:", filtered.length);
  filtered.forEach((product) => {
   // console.log(`Product ID: ${product.product_id}, Name: ${product.product_name}, Price: ${product.offer_price || product.product_price}`);
  });

  setNewFilteredProducts(filtered);
};





const handleNewFilterChange = (storeId, isChecked) => {
   // console.log(`Filter changed for store ID: ${storeId}, Checked: ${isChecked}`);
    
    setTempSelectedFilters((prev) => {
        return {
            ...prev,
            [storeId]: isChecked,
        };
    });
};


const applyFiltersFromModal = () => {
    //console.log("Applying filters from modal:", tempSelectedFilters);

    // Set the selected filters to the temporary filters
    setNewSelectedFilters(tempSelectedFilters);

    // Check if any filters are selected
    const hasActiveFilters = Object.values(tempSelectedFilters).some(isSelected => isSelected);

    // Apply the filters to update the filtered products
    fetchProducts(searchTerm, 1, tempSelectedFilters, sortOption)
        .then(() => {
            // After fetching, check if we have any products
            if (filteredProducts.length === 0 && hasActiveFilters) {
                setNoProductsMessage('No products found for selected filters');
            } else {
                setNoProductsMessage('');
            }
        });

    // Close the modal
    setNewFilterOpen(false);
};








const handleSortChange = (option) => {
    //console.log(`Sort option selected: ${option}`);
    setSortOption(option);
    
    // Reset scroll position
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // Reset states
    setPage(1);
    setIsLoading(true);
    
    // Fetch sorted products with reset pagination
    fetchProducts(searchTerm, 1, newSelectedFilters, option)
        .finally(() => {
            setIsLoading(false);
        });
    
    handleSortClose();
};




const getSelectedFiltersCount = () => {
  return Object.values(newSelectedFilters).filter(isSelected => isSelected).length;
};





  const defaultOptions = {
    loop: true,
    autoplay: true, 
    animationData: loaderAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  
const fetchProducts = async (
  searchTerm = '',
  currentPage = 1,
  filters = {},
  sort = '',
  abortSignal
) => {
    /* -------------------------------------------
     * If we are (re)loading the first page of a
     * new query  →  clear paging guards so that
     * the next scroll can fetch ?page=2 again.
     * ----------------------------------------- */
    if (currentPage === 1) {
      loadedPagesRef.current = new Set([1]); // we will (re‑)load page 1
      inFlightRef.current.clear();
      abortMapRef.current.forEach(ac => ac.abort());
      abortMapRef.current.clear();
    }

    setIsLoading(true);
    const isLoadingMore = currentPage > 1;
    setIsFetchingMore(isLoadingMore);
        setIsInitialLoad(currentPage === 1);

    try {
        let queryString = `search=${encodeURIComponent(searchTerm)}&page=${currentPage}`;

        // Include filters in the query string
        if (Object.keys(filters).length > 0) {
            const activeStoreFilters = Object.entries(filters)
                .filter(([_, isActive]) => isActive)
                .map(([storeId]) => storeId);
            if (activeStoreFilters.length > 0) {
                queryString += `&store_ids=${encodeURIComponent(activeStoreFilters.join(','))}`;
            }
        }

        // Include sort option in the query string
        if (sort) {
            queryString += `&sort_by=${encodeURIComponent(sort)}`;
        }

       const response = await fetch(
         getApiUrl(ENDPOINTS.AMAZON_API, queryString),
         { signal: abortSignal }
       );

        const data = await response.json();

        if (data.message === "No products found" || !data.amazondata || data.amazondata.length === 0) {
            setNoMoreProducts(true);
            if (currentPage === 1) {
                setAllProducts([]);
                setProducts([]);
                setFilteredProducts([]);
            }
            setHasMore(false);
        } else {
            const newProducts = data.amazondata;

            // Update allProducts state
            if (currentPage === 1) {
                setAllProducts(newProducts);
                setProducts(newProducts);
                setFilteredProducts(applySortToProducts(newProducts, sort));
                setDisplayedProductCount(newProducts.length);
                if (data.bannerdata && Array.isArray(data.bannerdata)) {
                    setBanners(data.bannerdata);
                }
            } else {
                const updatedAllProducts = [...allProducts, ...newProducts];
                setAllProducts(updatedAllProducts);
                setProducts(prevProducts => [...prevProducts, ...newProducts]);
                setFilteredProducts(applySortToProducts(updatedAllProducts, sort));
                setDisplayedProductCount(prev => prev + newProducts.length);
            }

            setTotalProducts(prev => prev + newProducts.length);
            setHasMore(newProducts.length > 0);
            setPage(currentPage);
            setNoMoreProducts(false);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        setHasMore(false);
        setNoMoreProducts(true);
    } finally {
        setIsFetchingMore(false);
        setIsLoading(false);
        setIsInitialLoad(false);
    }
};



const applySortToProducts = (products, sortOption) => {
    if (!sortOption || products.length === 0) return products;

    const sortedProducts = [...products];
    
    switch (sortOption) {
        case 'popularity':
            return sortedProducts.sort((a, b) => 
                (b.sales_rank || 0) - (a.sales_rank || 0)
            );
            
        case 'latest':
            return sortedProducts.sort((a, b) => 
                new Date(b.creation_date || 0) - new Date(a.creation_date || 0)
            );
            
        case 'priceHighToLow':
            return sortedProducts.sort((a, b) => {
                const priceA = parseFloat(b.offer_price || b.product_price) || 0;
                const priceB = parseFloat(a.offer_price || a.product_price) || 0;
                return priceA - priceB;
            });
            
        case 'priceLowToHigh':
            return sortedProducts.sort((a, b) => {
                const priceA = parseFloat(a.offer_price || a.product_price) || 0;
                const priceB = parseFloat(b.offer_price || b.product_price) || 0;
                return priceA - priceB;
            });
            
        default:
            return sortedProducts;
    }
};





const applyFiltersAndSort = (filters = newSelectedFilters, sort = sortOption) => {
    let filtered = [...products];

    // Apply Filtering by Categories
    const activeStoreFilters = Object.entries(filters)
        .filter(([_, isActive]) => isActive)
        .map(([storeId]) => storeId);

    if (activeStoreFilters.length > 0) {
      //  console.log(`Filtering products by store IDs: ${activeStoreFilters}`);
        filtered = filtered.filter((product) => activeStoreFilters.includes(product.store_id.toString()));
    }

   // console.log("Products after filtering:", filtered.length);
    filtered.forEach((product) => {
       // console.log(`Product ID: ${product.product_id}, Name: ${product.product_name}, Store ID: ${product.store_id}`);
    });

    // Apply Sorting
    if (sort) {
        //console.log(`Sorting products based on option: ${sort}`);
        switch (sort) {
            case 'popularity':
                filtered.sort((a, b) => b.sales_rank - a.sales_rank); // Assuming `sales_rank` defines popularity
                break;
            case 'latest':
                filtered.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
                break;
            case 'priceHighToLow':
                filtered.sort((a, b) => parseFloat(b.offer_price || b.product_price) - parseFloat(a.offer_price || a.product_price));
                break;
            case 'priceLowToHigh':
                filtered.sort((a, b) => parseFloat(a.offer_price || a.product_price) - parseFloat(b.offer_price || b.product_price));
                break;
            default:
                break;
        }
    }

    console.log("Products after sorting:", filtered.length);
    filtered.forEach((product) => {
       // console.log(`Product ID: ${product.product_id}, Name: ${product.product_name}, Price: ${product.offer_price || product.product_price}`);
    });

    // Update the filtered products state
    setNewFilteredProducts(filtered);
};





		const handleFilterOpen = () => {
		  setNewFilterOpen(true); // Open the filter modal
		};


  
 /* const handleFilterOpen = () => {
    setFilterOpen(true);
  }; */

		const handleFilterClose = () => {
		  setNewFilterOpen(false); // Close the filter modal
		};
		  

  
  
useEffect(() => {
  const handleBackButton = (event) => {
    if (searchTerm) {
      event.preventDefault(); // Prevent default navigation
      handleClearSearch();    // Clear the search field
    }
  };

  // Add a listener for the popstate event
  window.addEventListener('popstate', handleBackButton);

  // Push a dummy state to the history stack
  window.history.pushState(null, '', window.location.pathname);

  // Cleanup listener on component unmount
  return () => {
    window.removeEventListener('popstate', handleBackButton);
  };
}, [searchTerm, handleClearSearch]);

useEffect(() => {
  // Update the displayedProductCount based on the filtered products
  setDisplayedProductCount(filteredProducts.length);
}, [filteredProducts]);


// ─────────────────────────────────────────
// 1.  Refs that survive renders
// ─────────────────────────────────────────
const loadedPagesRef  = useRef(new Set([1]));   // page 1 is fetched at mount
const inFlightRef     = useRef(new Set());      // pages currently being fetched
const abortMapRef     = useRef(new Map());      // page → AbortController

// ─────────────────────────────────────────
// 2.  fetchMoreProducts – extra guard for searchTerm
const fetchMoreProducts = useCallback(async () => {
  const nextPage = page + 1;

  // Already fetched / running OR we are inside a text‑search
  if (loadedPagesRef.current.has(nextPage) ||
      inFlightRef.current.has(nextPage)     ||
      !hasMore                              ||
      isLoading                             ||
      searchTerm !== '') {                  // ← NEW guard
    return;
  }

  // Mark as in‑flight
  inFlightRef.current.add(nextPage);

  // Abort‑controller for safety
  const ac = new AbortController();
  abortMapRef.current.set(nextPage, ac);

  try {
    await fetchProducts(
      searchTerm,
      nextPage,
      newSelectedFilters,
      sortOption,
      ac.signal
    );
    loadedPagesRef.current.add(nextPage);
  } catch (err) {
    if (err.name !== 'AbortError') console.error(err);
  } finally {
    inFlightRef.current.delete(nextPage);
    abortMapRef.current.delete(nextPage);
  }
}, [
  page, hasMore, isLoading,
  searchTerm, newSelectedFilters, sortOption,
  fetchProducts
]);

// ─────────────────────────────────────────
// 3.  IntersectionObserver – same extra guard
// ─────────────────────────────────────────
useEffect(() => {
  if (!loaderRef.current) return;

  const observer = new IntersectionObserver(entries => {
    const [entry] = entries;

    if (entry.isIntersecting &&
        hasMore            &&
        !isLoading         &&
        userScrolled       &&
        searchTerm === '') {              // ← NEW guard
      observer.unobserve(entry.target);
      fetchMoreProducts().finally(() => {
        if (hasMore && loaderRef.current) observer.observe(loaderRef.current);
      });
    }
  }, { threshold: 0.1 });

  observer.observe(loaderRef.current);
  return () => observer.disconnect();
}, [fetchMoreProducts, hasMore, isLoading, userScrolled, searchTerm]);

// ─────────────────────────────────────────
// 4.  Optional: cancel pending fetches on unmount
// ─────────────────────────────────────────
useEffect(() => {
  return () => {
    abortMapRef.current.forEach(ac => ac.abort());
  };
}, []);

  return (
    <>
   <GlobalStyles
        styles={{
          '.focused': {
            width: '100% !important',
            transition: 'all 0.3s ease-in-out',
          },
        }}
      />
  
 




<MetaData component="ProductsPage" />
 <PageBackground className="page-background" sx={{ backgroundColor:colors.app_primaryBackground }}>
  <StyledAppBar ref={appBarRef} className={clsx({ 'sticky-header': isSticky })}>
    <StyledToolbar>
      <StickySearchContainer className={clsx(isSearchFocused && 'focused')}>
        <SearchBarWrapper expanded={isSearchFocused}>
  <IconButton
    onClick={handleSearchFocus}
    sx={{ padding: 0.5 }}
    aria-label="search"
  >
    <SearchIcon sx={{ color: colors.app_primaryText, fontSize: '1.25rem' }} />
  </IconButton>
  <StyledSearchInput
    className="search-input"
    placeholder="Search products..."
    inputProps={{ 'aria-label': 'search' }}
    value={searchTerm}
    onChange={handleSearch}
    onFocus={handleSearchFocus}
	onKeyPress={(e) => {
					if (e.key === 'Enter') {
					  handleExternalSearch(e);
					}
				  }}
    ref={searchInputRef}
  />
  {isSearchFocused && (
    <IconButton
      onClick={handleClearSearch}
      sx={{ padding: 0.5 }}
      aria-label="clear search"
    >
      <ClearIcon sx={{ color: colors.app_primaryText,fontSize: '1.25rem' }} />
    </IconButton>
  )}
</SearchBarWrapper>

      {/* Conditionally hide Sort and Filter buttons when search is focused */}
      {!isSearchFocused && (
        <Box display="flex" gap={1}>
      <SortButton variant="contained" startIcon={<SortIcon />} onClick={handleSortOpen} className="action-button sort-button">
        Sort
     </SortButton>


			<FilterButton variant="contained" startIcon={<FilterListIcon />} onClick={handleFilterOpen}>
			  Filter
			  {getSelectedFiltersCount() > 0 && (
				<FilterCount>
				  {getSelectedFiltersCount()}
				</FilterCount>
			  )}
			</FilterButton>



        </Box>
      )}
   </StickySearchContainer>
    </StyledToolbar>
  </StyledAppBar>


   
       <ContentContainer>
  {!searchTerm && <ProductsBanner banners={banners} />}
	  
	  
	   <div ref={productGridRef}>
	  
<ProductGridContainer padTop={searchTerm !== ''}>
  <Grid container spacing={0.5} sx={{ backgroundColor: colors.app_primaryBackground }}>
    {(filteredProducts.length === 0 && (searchTerm !== '' || Object.values(newSelectedFilters).some(Boolean))) ? (
      <NoProductsContainer>
        <Typography 
          variant="h6" 
          sx={{ 
            color: 'text.secondary',
            mb: 2,
            textAlign: 'center'
          }}
        >
          {searchTerm !== '' 
            ? 'No products found matching your search' 
            : 'No products found for selected filters'}
        </Typography>
        
        {/* Only show Reset Filters if filters are actually selected */}
        {Object.values(newSelectedFilters).some(Boolean) && (
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {`${getSelectedFiltersCount()} filter${getSelectedFiltersCount() > 1 ? 's' : ''} selected`}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleNewFilterReset}
              sx={{
                mt: 1,
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Reset Filters
            </Button>
          </Box>
        )}

        {searchTerm !== '' && (
          <>
            <Typography variant="body1" mt={2}>
              Try searching on these platforms:
            </Typography>
            <Box display="flex" justifyContent="center" mt={2} mb={2}>
              {searchEngines.map((engine, index) => (
                <SearchEngineIcon
                  key={engine.searchenginename}
                  className={selectedEngines.some(e => e.searchenginename === engine.searchenginename) ? 'selected' : ''}
                  onClick={() => handleEngineToggle(engine)}
                >
                  <img 
                    src={`${IMAGE_BASE_URL}${engine.searchengineimage.replace('../', '')}`}
                    alt={engine.searchenginename}
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                </SearchEngineIcon>
              ))}
            </Box>
            <SearchButtonStyled
              variant=""
              onClick={(e) => handleExternalSearch({ type: 'click' })}
              disabled={selectedEngines.length === 0}
            >
              SEARCH
            </SearchButtonStyled>
          </>
        )}
      </NoProductsContainer>
    ) : (
      filteredProducts.map((product) => (
        <Grid item key={product.product_id} xs={6} sm={6} md={4} sx={{ padding: 0.5 }}>
          <ProductCard 
            product={product}
            onClick={(url) => window.open(url, '_blank')}
          />
        </Grid>
      ))
    )}
  </Grid>
  {loading && hasMore && (
    <LoaderContainer>
      <Lottie 
        options={defaultOptions}
        height={100}
        width={100}
      />
    </LoaderContainer>
  )}

  {isFetchingMore && (
    <LoaderContainer>
      <Lottie options={loadMoreOptions} height={100} width={100} />
    </LoaderContainer>
  )}

  {hasMore && !isFetchingMore && (
    <div ref={loaderRef} style={{ height: '20px', margin: '20px 0' }} />
  )}

  {noMoreProducts && !isFetchingMore && searchTerm === '' && filteredProducts.length !== 0 && (
    <Typography 
      variant="body1" 
      align="center" 
      sx={{ my: 3, color: '#666' }}
    >
      No more products found
    </Typography>
  )}
</ProductGridContainer>

	  </div>
     </ContentContainer>



<Modal open={sortOpen} onClose={handleSortClose} closeAfterTransition BackdropProps={{ invisible: true }}>
  <Slide in={sortOpen} direction="up">
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        p: 2,
        borderRadius: '12px 12px 0 0',
        boxShadow: 3,
        width: '100%',
        mb: '50px',
        '& .MuiButton-root': {
          mb: 1, // Add margin bottom to buttons
        },
        '& .MuiButton-root:last-child': {
          mb: 2, // Add extra margin to last button
        }
      }}
    >
      {/* Sort modal content remains the same */}
      <Typography variant="h6" gutterBottom>
        Sort By
      </Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          startIcon={<TrendingUpIcon />}
          onClick={() => {
            handleSortChange('popularity');
            handleSortClose();
          }}
          sx={{
            justifyContent: 'flex-start',
            color: sortOption === 'popularity' ? '#ff7043' : '#000',
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Popularity
        </Button>
        <Button
          startIcon={<UpdateIcon />}
          onClick={() => {
            handleSortChange('latest');
            handleSortClose();
          }}
          sx={{
            justifyContent: 'flex-start',
            color: sortOption === 'latest' ? '#ff7043' : '#000',
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Latest
        </Button>
        <Button
          startIcon={<ArrowDownwardIcon />}
          onClick={() => {
            handleSortChange('priceHighToLow');
            handleSortClose();
          }}
          sx={{
            justifyContent: 'flex-start',
            color: sortOption === 'priceHighToLow' ? '#ff7043' : '#000',
            textTransform: 'none',
            fontSize: '1rem',
          }}
        >
          Price: High to Low
        </Button>
        <Button
          startIcon={<ArrowUpwardIcon />}
          onClick={() => {
            handleSortChange('priceLowToHigh');
            handleSortClose();
          }}
          sx={{
            justifyContent: 'flex-start',
            color: sortOption === 'priceLowToHigh' ? '#ff7043' : '#000',
            textTransform: 'none',
            fontSize: '1rem',
            marginBottom: '16px', // Add bottom margin to last button
          }}
        >
          Price: Low to High
        </Button>
      </Box>
    </Box>
  </Slide>
</Modal>


<Modal
  open={newFilterOpen}
  onClose={() => setNewFilterOpen(false)}
  closeAfterTransition
  BackdropProps={{ invisible: true }}
>
  <Slide in={newFilterOpen} direction="up">
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'background.paper',
        borderRadius: '12px 12px 0 0',
        boxShadow: 3,
        width: '100%',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '66px',
        '& .MuiFormGroup-root': {
          mb: 2,
        },
        '& .MuiFormControlLabel-root': {
          mb: 1,
        }
      }}
    >
      {/* Header Section - REDUCED HEIGHT */}
      <Box sx={{ 
        p: 1.5, // Reduced padding from 2 to 1.5
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        position: 'sticky',
        top: 0,
        bgcolor: 'background.paper',
        zIndex: 1,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        minHeight: '40px', // Added explicit minimum height
        display: 'flex',
        alignItems: 'center' // Center content vertically
      }}>
        <Typography 
          variant="subtitle1" 
          component="h2"
          sx={{ 
            fontSize: '0.95rem',
            fontWeight: 500
          }}
        >
          Filters
        </Typography>
        <IconButton
          sx={{
            position: 'absolute',
            top: 4, // Adjusted position
            right: 8,
            color: 'black',
          }}
          onClick={() => setNewFilterOpen(false)}
        >
          <CloseIcon sx={{ fontSize: '1.2rem' }} />
        </IconButton>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ 
        overflowY: 'auto',
        flex: 1,
        p: 2,
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '3px',
        },
      }}>
        <FormGroup>
          {newFilterCategories.length > 0 ? (
            newFilterCategories.map((category) => (
              <FormControlLabel
                key={category.store_id}
                control={
                  <Checkbox
                    checked={tempSelectedFilters[category.store_id] || false}
                    onChange={(e) =>
                      handleNewFilterChange(category.store_id.toString(), e.target.checked)
                    }
                    sx={{ 
                      '& .MuiSvgIcon-root': { 
                        fontSize: '1.2rem' 
                      }
                    }}
                  />
                }
                label={
                  <Box display="flex" alignItems="center">
                    {category.store_icon_url && (
                      <img
                        src={category.store_icon_url}
                        alt={he.decode(category.store_name)}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.85rem',
                        fontWeight: 400
                      }}
                    >
                      {he.decode(category.store_name)}
                    </Typography>
                  </Box>
                }
                sx={{
                  margin: '4px 0',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.85rem'
                  }
                }}
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Loading filters...</Typography>
          )}
        </FormGroup>
      </Box>

      {/* Footer Actions - REDUCED HEIGHT AND REMOVED TOP BORDER */}
      <Box sx={{ 
        p: 1.5, // Reduced padding from 2 to 1.5
        borderTop: 'none', // Removed top border
        position: 'sticky',
        bottom: 0,
        bgcolor: 'background.paper',
        display: 'flex',
        justifyContent: 'space-between',
        zIndex: 1,
        minHeight: '40px', // Added explicit minimum height
        alignItems: 'center' // Center content vertically
      }}>
        <Button 
          onClick={handleNewFilterReset}
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'transparent',
            },
            padding: '4px 8px' // Reduced padding
          }}
        >
          CLEAR ALL
        </Button>
        <Button
          variant="contained"
          onClick={applyFiltersFromModal}
          sx={{
            backgroundColor: colors.app_primary,
            color: '#fff',
            minWidth: '120px',
            borderRadius: '20px',
            '&:hover': {
              backgroundColor: colors.primary,
              opacity: 0.9,
            },
            fontWeight: 500,
            padding: '4px 12px' // Reduced padding
          }}
        >
          APPLY
        </Button>
      </Box>
    </Box>
  </Slide>
</Modal>






<FooterComponent />   
</PageBackground>
    </>
  );
}

export default ProductsPage;