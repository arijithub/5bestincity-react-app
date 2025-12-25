import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Grid, Typography, Modal, Box, Button, Snackbar, Alert } from '@mui/material';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { keyframes } from '@emotion/react';
import ListingCard from './components/5best/ListingCard';
import EnquiryForm from './components/5best/EnquiryForm';
import ContactPopupModal from './components/5best/ContactPopupModal';
import { styled } from '@mui/material/styles';
import { useLogin } from './contexts/LoginContext';
import FooterComponent from './FooterComponent';
import { getApiUrl, ENDPOINTS } from './config/apiConfig';
import { getImageUrl } from './config/apiConfig';
import './styles/master.css';
import './styles/custom-styles.css';
import { colors } from './theme-styles';
import { openDB } from 'idb';
import MetaData from './components/MetaData';


const getCookie = (name) => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=').map(c => c.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

const isUserLoggedIn = () => {
  const sessionLoginState = localStorage.getItem('loginState');
  const cookieLoginState = getCookie('loginState');
  const cookieUserId = getCookie('user_id');
  
  return (sessionLoginState === 'logged_in' || cookieLoginState === 'logged_in') && 
         (localStorage.getItem('user_id') || cookieUserId);
};

const userLoggedIn= localStorage.getItem('loginState')== 'logged_in';
  const userId = localStorage.getItem('user_id');

const FadeSlider = styled(Slider)(({ theme }) => ({
  '.slick-slide': {
    opacity: 0,
    transition: 'opacity 500ms ease-in-out',
  },
  '.slick-slide.slick-active': {
    opacity: 1,
  },
}));

const BannerImage = styled('img')(({ theme }) => ({
  width: '100%',
  height: '250px', // Increased height for desktop
  objectFit: 'cover',
  objectPosition: 'center',
  borderRadius: '8px',
  loading: "lazy",
  decoding: "async",
  fetchpriority: "low",
  [theme.breakpoints.down('sm')]: {
    height: '50px', // Increased height specifically for mobile screens
  },
}));

// BannerSlider component remains the sameee
const BannerSlider = ({ bannerData }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    fade: true,
    cssEase: 'linear'
  };

  return (
    <Box sx={{ 
      '& .slick-dots': { 
        display: 'none' 
      }
    }}>
      <FadeSlider {...settings}>
        {bannerData.map((banner, index) => (
          <div key={index}>
            <a href={banner.url} target="_blank" rel="noopener noreferrer">
              <BannerImage
                src={`https://5bestincity.com/images/public/banner/${banner.imagesize1}`}
                alt={banner.business_name}
              />
            </a>
          </div>
        ))}
      </FadeSlider>
    </Box>
  );
};


const ListingPage = () => {
  const { subcategoryslug, cityslug } = useParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openEnquiry, setOpenEnquiry] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [subcatName, setSubcatName] = useState('');
  const [vibrateIcon, setVibrateIcon] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openContactPopup, setOpenContactPopup] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [contactPopupData, setContactPopupData] = useState('');
  const [bannerData, setBannerData] = useState([]);
  const [bannerPositions, setBannerPositions] = useState([]);
  const [pinnedBusinesses, setPinnedBusinesses] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate(); // Add this hook
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRestoringScroll, setIsRestoringScroll] = useState(true);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const [shouldRestoreScroll, setShouldRestoreScroll] = useState(false);
  const [lastKnownScrollPosition, setLastKnownScrollPosition] = useState(0);
  
  // Add this useEffect near your other effects in ListingPage
// Add this useEffect near your other effects in ListingPage
// Add these effects in ListingPage
useEffect(() => {
  return () => {
    // Clear navigation state if going to a page other than category or profile
    const currentPath = window.location.pathname;
    if (!currentPath.includes('/categorypage/') && !currentPath.includes('/profile/')) {
      sessionStorage.removeItem('navigationState');
    }
  };
}, []);

useEffect(() => {
  const handleScrollRestoration = () => {
    try {
      const navigationStateStr = sessionStorage.getItem('navigationState');
      if (navigationStateStr) {
        const navigationState = JSON.parse(navigationStateStr);
        
        // Check if state is recent (within last 5 minutes)
        const isRecent = (Date.now() - navigationState.timestamp) < 5 * 60 * 1000;
        
        if (isRecent && navigationState.listingPosition) {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: parseInt(navigationState.listingPosition),
              behavior: 'instant'
            });
          });
        }
      }
    } catch (error) {
      console.error('Error restoring scroll position:', error);
    }
  };

  const handlePopState = () => {
    handleScrollRestoration();
  };

  // Attach popstate listener
  window.addEventListener('popstate', handlePopState);

  // Initial scroll restoration
  if (!loading) {
    handleScrollRestoration();
  }

  // Cleanup
  return () => {
    window.removeEventListener('popstate', handlePopState);
    
    // Store current position before leaving
    if (window.location.pathname.includes('/categorypage/')) {
      const currentState = JSON.parse(sessionStorage.getItem('navigationState') || '{}');
      currentState.timestamp = Date.now();
      sessionStorage.setItem('navigationState', JSON.stringify(currentState));
    }
  };
}, [loading]);
  
     useEffect(() => {
  // Small delay to ensure content is read
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });

}, []); // Empty dependency array = runs once on mount


  // Add effect for scroll position restoration
  useEffect(() => {
    if (!loading) {
      const fromProfilePage = sessionStorage.getItem('fromProfilePage') === 'true';
      const savedPosition = sessionStorage.getItem('listingPageScrollPosition');
	  
	 //alert(savedPosition);
     //alert(fromProfilePage);
	 //alert(isInitialLoad);
	 
	 if(isInitialLoad){
		 	  window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
		 
	 }

      if (fromProfilePage && savedPosition) {
        const position = parseInt(savedPosition, 10);
        
        // Use requestAnimationFrame for smoother restoration
        requestAnimationFrame(() => {
          window.scrollTo({
            top: position,
            behavior: 'instant'
          });
          
          // Clear session storage after restoration
          //sessionStorage.removeItem('listingPageScrollPosition');
          //sessionStorage.removeItem('fromProfilePage');
          setIsInitialLoad(false);
        });
      }else{
	
		  
	  }
    }
  }, [loading, isInitialLoad]);

  // Add effect to detect hardware back button navigation
  useEffect(() => {
    const handlePopState = () => {
      // Hardware back button was pressed
      const fromProfilePage = sessionStorage.getItem('fromProfilePage') === 'true';
      const savedPosition = sessionStorage.getItem('listingPageScrollPosition');
      
      if (fromProfilePage && savedPosition) {
        const position = parseInt(savedPosition, 10);
        requestAnimationFrame(() => {
          window.scrollTo({
            top: position,
            behavior: 'instant'
          });
          
          // Clear session storage
          sessionStorage.removeItem('listingPageScrollPosition');
          sessionStorage.removeItem('fromProfilePage');
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  


  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setVibrateIcon(prev => !prev);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);
  



 const handleBackButton = () => {
    // Navigate back
    navigate(-1);
  };
  


  useEffect(() => {
    const loginState = sessionStorage.getItem('loginState');
    setIsLoggedIn(userLoggedIn);  
	setIsLoggedIn(isUserLoggedIn());
	//alert(localStorage.getItem('phone'));
	
	 
    
    const fetchListings = async () => {
		
	 setLoading(true);	
      try {
		const listingUrl = getApiUrl(ENDPOINTS.LISTING_API, `listid=${subcategoryslug}-in-${cityslug}`);
        const response = await fetch(listingUrl);
        const data = await response.json();
		
		//scrollToTop();
		
        setListings(data.listalldata);
        setContactPopupData(data.contact_popup);

        if (data.listalldata.length > 0) {
          setCityName(data.listalldata[0].listdata.city_name);
          setStateName(data.listalldata[0].listdata.state_name);
          setSubcatName(data.listalldata[0].listdata.sub_category_name);
        }
		
		//data.banner="6481620854999,7835723583677";

        // Fetch banner data
        if (data.banner) {
          const bannerResponse = await fetch('https://5bestincity.com/api/bannerfetchinfo.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${data.banner}`,
          });
          const bannerData = await bannerResponse.json();
          setBannerData(bannerData.data);
          setBannerPositions(bannerData.position.split(',').map(Number));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchListings();
  }, [subcategoryslug, cityslug]);

  useEffect(() => {
    const initializeDatabase = async () => {
      if (!listings || !listings.length) return; // Don't proceed if listings aren't loaded yet

      try {
        const db = await openDB('collectionsDB', 3);
        
        // Fetch initial pinned businesses
        const allPins = await db.getAll('pins') || [];
        const businessPins = allPins.filter(pin => 
          pin.type === 'business' && 
          pin.action === 'pin' &&
          pin.dataId
        );

        // Instead of fetching from API, match with current listings
        const pinnedBusinessesDetails = businessPins
          .map(pin => {
            const businessId = pin.dataId.replace('business_', '');
            // Find matching business in current listings
            const matchingBusiness = listings.find(listing => 
              listing && 
              listing.listdata && 
              String(listing.listdata.listing_id) === String(businessId)
            );
            return matchingBusiness || null;
          })
          .filter(business => business !== null && business.listdata);

        setPinnedBusinesses(pinnedBusinessesDetails);

      } catch (error) {
        console.error('Database initialization error:', error);
      }
    };

    initializeDatabase();
  }, [listings]); // Run when listings change

  const handleBusinessPinClick = async (businessId) => {
    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      const pinId = `business_${businessId}`;
      
      // Check if already pinned
      const existingPin = await pinStore.get(pinId);
      const isCurrentlyPinned = existingPin?.action === 'pin';
      const currentAction = isCurrentlyPinned ? 'unpin' : 'pin';

      // Find the business data with proper validation
      const businessData = listings?.find(item => 
        item && 
        item.listdata && 
        String(item.listdata.listing_id) === String(businessId)
      );

      if (!businessData || !businessData.listdata) {
        throw new Error('Business data not found or invalid');
      }

      // Optimistic UI update with validation
      setPinnedBusinesses(prev => {
        if (currentAction === 'unpin') {
          return prev.filter(b => 
            b && 
            b.listdata && 
            String(b.listdata.listing_id) !== String(businessId)
          );
        } else {
          if (!prev.some(b => 
            b && 
            b.listdata && 
            String(b.listdata.listing_id) === String(businessId)
          )) {
            return [...prev, businessData];
          }
          return prev;
        }
      });

      // Show initial status
      setSnackbarMessage(currentAction === 'pin' ? 'Pinning...' : 'Unpinning...');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);

      // Update IndexedDB
      const pinData = {
        dataId: pinId,
        pinid: businessId,
        type: 'business',
        timestamp: new Date().toISOString(),
        action: currentAction,
        synced: false,
        synced_at: null,
        metadata: {
          businessName: businessData.listdata.business_name || '',
          cityName: businessData.listdata.city_name || ''
        }
      };

      await pinStore.put(pinData);

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

      // Revert UI state on error with validation
      setPinnedBusinesses(prev => {
        const businessData = listings?.find(item => 
          item && 
          item.listdata && 
          String(item.listdata.listing_id) === String(businessId)
        );
        if (businessData && businessData.listdata) {
          const isCurrentlyInList = prev.some(b => 
            b && 
            b.listdata && 
            String(b.listdata.listing_id) === String(businessId)
          );
          if (isCurrentlyInList) {
            return prev.filter(b => 
              b && 
              b.listdata && 
              String(b.listdata.listing_id) !== String(businessId)
            );
          } else {
            return [...prev, businessData];
          }
        }
        return prev;
      });
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

const handleClick = (listing, type) => {
  const hasBadge = listing.badgeinfo && listing.badgeinfo.length > 0;

  if (hasBadge) {
    // Direct actions for listings with badges
    switch(type) {
      case 'call':
        window.location.href = `tel:${listing.listdata.business_phone_1}`;
        break;
      case 'chat':
        window.location.href = `https://wa.me/${listing.listdata.business_whatsapp}`;
        break;
      case 'direction':
        window.open(listing.listdata.direction_URL, '_blank');
        break;
      default:
        break;
    }
  } else if (!isUserLoggedIn()) {  // Use the new authentication check
    setOpenLoginModal(true);
  } else if (contactPopupData) {
    setSelectedListingId(contactPopupData);
    setOpenContactPopup(true);
  } else {
    handleOpenEnquiry(listing);
  }
};

  const handleOpenEnquiry = (listing) => {
    setSelectedListing(listing);
    setOpenEnquiry(true);
  };

  const handleCloseEnquiry = () => {
    setOpenEnquiry(false);
  };

  const handleCloseContactPopup = () => {
    setOpenContactPopup(false);
  };

  const handleCloseLoginModal = () => {
    setOpenLoginModal(false);
  };

		const handleLogin = () => {
		  // Set both localStorage and cookie
		  localStorage.setItem('loginState', 'logged_in');
		  document.cookie = `loginState=logged_in; path=/`;
		  
		  const userId = localStorage.getItem('user_id') || getCookie('user_id');
		  if (userId) {
			document.cookie = `user_id=${userId}; path=/`;
		  }
		  
		  setIsLoggedIn(true);
		  setOpenLoginModal(false);
		};
   
  if (loading) {
    return <Typography component="div" sx={{ textAlign: 'center', marginTop: 4 }}>Loading...</Typography>;
  }

  if (!listings.length) {
    return <Typography component="div" sx={{ textAlign: 'center', marginTop: 4 }}>No Listings Found</Typography>;
  }

  const settings = {
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
  };
  
  const iconAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  `;

  const vibrateAnimation = keyframes`
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-10deg); }
    50% { transform: rotate(10deg); }
    75% { transform: rotate(-5deg); }
    100% { transform: rotate(0deg); }
  `;

  const badgeIconStyle = {
  width: '80px', // Reduced from 100px
  height: 'auto',
  filter: 'brightness(1.1) contrast(1.1)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
  },
};
  
  const buttonStyle = {
    fontSize: '0.75rem',
    padding: '6px 12px',
    minWidth: '80px',
    borderRadius: '20px',
    textTransform: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:hover .MuiSvgIcon-root': {
      animation: `${iconAnimation} 0.5s ease-in-out`,
    },
  };
  
  const callButtonStyle = {
    ...buttonStyle,
    '& .MuiSvgIcon-root': {
      animation: vibrateIcon ? `${vibrateAnimation} 0.5s ease-in-out` : 'none',
    },
  };

  return (
    
    <Container 
      className="listing-container" 
      sx={{ 
        backgroundColor: colors.app_primaryBackground, // Set the background color
        minHeight: '100vh', // Ensure it covers the full height of the viewport
        padding: 2 // Optional: Add some padding if needed
      }}
    >
    <MetaData 
		  component="ListingPage" 
		  pageInfo={{
			cityName: cityName,
			stateName: stateName,
			subcatName: subcatName
		  }}
		/>
      <Typography 
        variant="h6" 
        className="page-title"
        sx={{ 
          lineHeight: 1.2,
          mb: 3, // margin bottom
          mt: 3, // margin top to match
          fontWeight: 'bold',
          color: colors.primaryText,
        }}
      >
        {`5 Best ${subcatName} in ${cityName}, ${stateName}`}
      </Typography>

      <Grid container className="listings-grid" spacing={4}>
 {listings.map((listingData, index) => {
  // Define hasBadge here based on the listingData
  const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;

  return (
    <React.Fragment key={listingData.listdata.listing_id}>
      {bannerPositions.includes(index + 1) && (
        <Grid item xs={12}>
          <BannerSlider bannerData={bannerData} />
        </Grid>
      )}
      <ListingCard 
        listingData={listingData}
        handleClick={handleClick}
        settings={settings}
        badgeIconStyle={badgeIconStyle}
        buttonStyle={buttonStyle}
        callButtonStyle={callButtonStyle}
        isLoggedIn={isLoggedIn}
        onOpenEnquiry={handleOpenEnquiry}
        allowRedirect={hasBadge ? "yes" : "no"}
        isPinned={hasBadge && pinnedBusinesses?.some(business => 
          business && 
          business.listdata && 
          listingData && 
          listingData.listdata && 
          String(business.listdata.listing_id) === String(listingData.listdata.listing_id)
        )}
        onPinClick={hasBadge ? () => handleBusinessPinClick(listingData.listdata.listing_id) : undefined}
      />
    </React.Fragment>
  );
})}
        {bannerPositions.includes(6) && (
          <Grid item xs={12}>
            <BannerSlider bannerData={bannerData} />
          </Grid>
        )}
      </Grid>

      {selectedListing && (
        <EnquiryForm
          open={openEnquiry}
          onClose={handleCloseEnquiry}
          businessName={selectedListing.listdata.business_name}
          businessImage={selectedListing.listdata.sub_list_image_1}
          cityname={selectedListing.listdata.city_name}
          subcatname={selectedListing.listdata.sub_category_name}
		  cityurlslug={cityslug}
		  subcaturlslug={subcategoryslug}
		  listingId={selectedListing.listdata.listing_id}
        />
      )}

      <ContactPopupModal
        open={openContactPopup}
        onClose={handleCloseContactPopup}
        listingId={selectedListingId}
        contactPopupData={contactPopupData}
      />

      <Modal
        open={openLoginModal}
        onClose={handleCloseLoginModal}
        aria-labelledby="login-modal-title"
        aria-describedby="login-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          <Typography id="login-modal-title" variant="h6" component="h2">
            Login Required
          </Typography>
          <Typography id="login-modal-description" sx={{ mt: 2 }}>
            Please log in to view contact details.
          </Typography>
          <Button onClick={handleLogin} sx={{ mt: 2 }}>
            Log In
          </Button>
        </Box>
      </Modal>
	  <FooterComponent />
      
      <Snackbar
      sx={{ marginBottom: '40px' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
	
  );
};

export default ListingPage;