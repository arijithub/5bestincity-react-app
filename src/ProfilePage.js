import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Paper, styled, Typography, Button, Box, Chip, CircularProgress,
  List, ListItem, ListItemIcon, ListItemText, Divider, Modal, useTheme, IconButton,
  Snackbar, Alert
} from '@mui/material';
import { 
  Phone, WhatsApp, Language, LinkedIn, Email, CalendarToday, 
  CheckCircleOutline, LocationOn, Star, Facebook, Twitter, Instagram, YouTube, LocalOffer
} from '@mui/icons-material';

import YouTubeIcon from '@mui/icons-material/YouTube';
import CollectionsIcon from '@mui/icons-material/Collections';

import './styles/master.css';
import './styles/custom-styles.css';

import parse from 'html-react-parser';

// Assume these components are properly implemented in your project
import Header from './components/5best/profile/Header';
import BasicInfo from './components/5best/profile/BasicInfo';
import Description from './components/5best/profile/Description';
import Location from './components/5best/profile/Location'; 
import ContactPopupModal from './components/5best/ContactPopupModal';
import EnquiryForm from './components/5best/EnquiryForm';
import ReviewsPage from './components/5best/ReviewsPage';

import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import MetaData from './components/MetaData';


import { EnhancedCard, ContentWrapper, colors, typography } from './theme-styles';
import { useLogin } from './contexts/LoginContext';
import FooterComponent from './FooterComponent';
import { getApiUrl, ENDPOINTS } from './config/apiConfig';
import { getImageUrl } from './config/apiConfig';
import PromotionalVideo from './components/5best/profile/PromotionalVideo';
import BusinessSince from './components/5best/profile/BusinessSince';
import SocialLinks from './components/5best/profile/SocialLinks';

import timingIcon from './assets/images/timing.svg';
import offerIcon from './assets/images/offer.svg';
import certificateIcon from './assets/images/certificates.svg';
import pricingIcon from './assets/images/pricing.svg';
import achievementIcon from './assets/images/achievement.svg';
import servicesIcon from './assets/images/services.svg';
import aboutIcon from './assets/images/about.svg';


import { openDB } from 'idb';

const userLoggedIn= localStorage.getItem('loginState')== 'logged_in';
  const userId = localStorage.getItem('user_id');



// Styled modal components
const ResponsiveModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: 'none',  // Remove border
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2),
  width: '90%',   // Make the modal responsive
  maxWidth: '600px',  // Set max width for large screens
  borderRadius: '8px',  // Rounded corners for a clean look
  [theme.breakpoints.down('sm')]: {
    width: '95%',  // For small screens, almost full width
  },
}));


const Card3D = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  margin: theme.spacing(1, 0),
  transition: 'transform 0.3s, box-shadow 0.3s',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px) rotateX(5deg)',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(-8px) rotateX(8deg) scale(1.02)',
    boxShadow: '0 25px 35px rgba(0, 0, 0, 0.3)',
  },
}));

const ContactButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const BadgeImage = styled('img')({
  width: '100px', // Adjust the width for a smaller badge
  height: 'auto', // Keeps the aspect ratio intact
  margin: '0 3px', // Adjust the margin to reduce spacing between badges
  verticalAlign: 'middle', // Ensures the badge aligns with text vertically
  loading: "lazy",
  decoding: "async",
  fetchpriority: "low"
});


const ProfilePage = () => {
  const [profileData, setProfileData] = useState(null);
  const [contactPopup, setContactPopup] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openEnquiry, setOpenEnquiry] = useState(false);
  const { id } = useParams();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);  // 'youtube' or 'gallery'
  const [bannerData, setBannerData] = useState([]);
  const [bannerPositions, setBannerPositions] = useState([]);
  const [openContactModal, setOpenContactModal] = useState(false);
  const [openEnquiryModal, setOpenEnquiryModal] = useState(false);
  const [contactPopupData, setContactPopupData] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const theme = useTheme();
  const isUserLoggedIn = userLoggedIn; // Replace with actual login check
  const [openContactPopup, setOpenContactPopup] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const navigate = useNavigate();
   
   useEffect(() => {
  // Small delay to ensure content is ready
  setTimeout(() => {
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  }, 0);
}, []); // Empty dependency array = runs once on mount

  // Add effect to handle hardware back button
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Set flag and position when leaving profile page
      sessionStorage.setItem('fromProfilePage', 'true');
      const storedPosition = sessionStorage.getItem('listingPageScrollPosition');
	  //alert(storedPosition);
      if (storedPosition) {
        // Keep the stored position if it exists
        sessionStorage.setItem('listingPageScrollPosition', storedPosition);
      }
    };

    // Add event listener for page unload (includes hardware back button)
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Also handle component unmount (includes navigation)
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
    
 // const profileUrl = getApiUrl(ENDPOINTS.PROFILE_DETAILS, `proid=${id}`);
 // const listingUrl = getApiUrl(ENDPOINTS.LISTING_API, `listid=${subcat_urlslug}-in-${city_urlslug}`);
 
// In ProfilePage.js, update the handleBackButton
// In ProfilePage.js
const handleBackButton = () => {

  
  // Add a small delay before navigation
  setTimeout(() => {
    navigate(-1);
  }, 50);
};


  // Fetch profile data on component mount or when the `id` changes
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
		const profileUrl = getApiUrl(ENDPOINTS.PROFILE_DETAILS, `proid=${id}`);
        const response = await fetch(profileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        const data = await response.json();
        //console.log(data); // Log the data to check for special_discount
        if (data && data.listdata) {
          setProfileData(data);
        } else {
          throw new Error('Invalid data structure received from API');
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  // Fetch listing data when profile data is available
  useEffect(() => {
    const fetchListingData = async () => {
      try {
        if (!profileData) return;

        const { subcat_urlslug, city_urlslug } = profileData.listdata;

        // Construct the dynamic URL
		const listingUrl = getApiUrl(ENDPOINTS.LISTING_API, `listid=${subcat_urlslug}-in-${city_urlslug}`);
        const dynamicUrl = listingUrl;

        const response = await fetch(dynamicUrl);
        const data = await response.json();
        setContactPopupData(data.contact_popup);

       // data.banner = "6481620854999,7835723583677";

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
      } catch (error) {
        setError('Failed to fetch listing data');
      }
    };

    fetchListingData();
  }, [profileData]); // Only runs when `profileData` is available
  
  

  const handleOpenEnquiry = () => setOpenEnquiry(true);
  const handleCloseEnquiry = () => setOpenEnquiry(false);
  

  // Add effect to check if business is pinned
  useEffect(() => {
    const checkIfPinned = async () => {
      if (!id) return;
      
      try {
        const db = await openDB('collectionsDB', 3);
        const pinId = `business_${id}`;
        const existingPin = await db.get('pins', pinId);
        setIsPinned(!!existingPin);
      } catch (error) {
        console.error('Error checking pin status:', error);
        setIsPinned(false);
      }
    };

    checkIfPinned();
  }, [id]);

  // Add pin/unpin handler
  const handlePinClick = async () => {
    if (!id) return;
    
    try {
      const db = await openDB('collectionsDB', 3);
      const pinId = `business_${id}`;
      const existingPin = await db.get('pins', pinId);

      if (existingPin) {
        await db.delete('pins', pinId);
        setIsPinned(false);
        setSnackbarMessage('Business unpinned successfully');
      } else {
        const newPin = {
          dataId: pinId,
          type: 'business',
          businessId: id,
          timestamp: new Date().toISOString()
        };
        await db.put('pins', newPin);
        setIsPinned(true);
        setSnackbarMessage('Business pinned successfully');
      }
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error updating pin status:', error);
      setSnackbarMessage('Error updating pin status');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  // Add handleSnackbarClose function
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress sx={{ color: colors.app_primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  if (!profileData || !profileData.listdata) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>No data available</Typography>
      </Box>
    );
  }
  
 

  const handleOpenModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };


 const handleOpenContactModal = (action, { contactPopupData }) => {
    // Optionally use `action` and details to determine modal behavior
    setSelectedListingId(contactPopupData);  // Assuming `phone` is your listingId for this example
    setOpenContactPopup(true);
  };

  const handleCloseContactPopup = () => {
    setOpenContactPopup(false);
  };
  
  const handleButtonClick = (action, value) => {
	  
 const showContactModal = contactPopupData;
 
		//alert(showContactModal);
		if(showContactModal){
      // If contactPopupData is present, trigger the modal
     setSelectedListingId(contactPopupData);  // Assuming `phone` is your listingId for this example
    setOpenContactPopup(true);
		}else{
			
			handleOpenEnquiry();
		}
};

  const { listdata, badgeinfo = [], contactinfo = {} } = profileData;

  const images = [
    listdata.sub_list_image_1,
    listdata.sub_list_image_2,
    listdata.sub_list_image_3
  ].filter(img => img != null);

  const serviceDetails = listdata.service_details ? listdata.service_details.split('\r\n') : [];
  const timingDetails = listdata.timing ? listdata.timing.split('\r\n') : [];
  const pricingDetails = listdata.service_pricing ? listdata.service_pricing.split('\r\n') : [];
  const onlypricingDetails = listdata.service_pricing !== '$$]]';
  const achievementDetails = listdata.achievement_awards ? listdata.achievement_awards.split('\r\n') : [];
  const discountDetails = listdata.discount ? listdata.discount.split('\r\n') : [];
  const hasDiscounts = listdata.discount && listdata.discount !== '$$]]';

  const showEnquiryForm = badgeinfo.length === 0;
  
    const bannerSliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    fade: true,
    cssEase: 'linear',
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false
  };

  const sectionHeaderStyle = {
    ...typography.h5,
    color: colors.primary,
    fontSize: '18px',
    fontWeight: 'bold',
    mb: 2
  };

  // Define common styles outside the JSX
  const commonButtonStyles = {
    backgroundColor: '#eee',
    color: '#333',
    '&:hover': {
      backgroundColor: colors.app_primary_hover,
    },
    '&:active': {
      backgroundColor: '#eee',
      color: '#333',
    },
    '&.Mui-focusVisible': {
      backgroundColor: '#eee',
      color: '#333',
    },
    '&:visited': {
      backgroundColor: '#eee',
      color: '#333',
    },
    width: '100%',
    height: 'auto',
    aspectRatio: '1',
    fontSize: '28px'
  };

  const sectionPaper= {
    p: 3,
    mt: 6,
    mb: 3,
    borderRadius: '12px',
    backgroundColor: colors.secondaryBackground,
  };

  const sectionPaperOffer= {
    p: 3,
    mt: 6,
    mb: 3,
    borderRadius: '12px',
    backgroundColor: colors.primary,
  };
  
  const sectionBox= {
    mb: 2,
    mt: 3,
    position: 'relative',
  };
  
  const sectionImg= {
    width: '80px',
    height: '80px',
    position: 'absolute',
    top: '-80px',
    left: '-25px',
    backgroundColor: colors.secondaryBackground,
    borderRadius: '20px 20px 20px 0px',
    padding: '10px',
  };
  
  const sectionTypoH6= {
    color: colors.app_primary,
    fontWeight: 'bold',
    fontSize: '1.2rem',
  };

  const sectionTypoH6Offer= {
    color: colors.accent1,
    fontWeight: 'bold',
    fontSize: '1.5rem',
  };

  return (
    <Container 
      className="profile-container"
      sx={{
        background: colors.app_primaryBackground,
        py: 3,  // Add some padding top and bottom
        minHeight: '100vh'  // Ensure background covers full viewport height
      }}
    >
     <MetaData 
		  component="ProfilePage"
		  profileData={profileData}
		/>
	  {/* Banner Slider Section */}
      {bannerData.length > 0 && (
        <Box sx={{ 
          borderRadius: '5px',
          overflow: 'hidden',
          mb: 3,
          '& .slick-list': {
            borderRadius: '5px !important'
          },
          '& .slick-slide': {
            borderRadius: '5px !important'
          }
        }}>
          <Slider {...bannerSliderSettings}>
            {bannerData.map((banner, index) => (
              <div key={index}>
                <img
                  src={`https://5bestincity.com/images/public/banner/${banner.imagesize1}`}
                  alt={`Banner ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                  style={{
                    width: '100%',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '5px',
                    display: 'block'
                  }}
                />
              </div>
            ))}
          </Slider>
        </Box>
      )}

      

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ p: 0, mb: 3, borderRadius: '12px', backgroundColor: colors.primaryBackground }}>
              <Header images={images} businessName={listdata.business_name || ''} />
            </Paper>

            {badgeinfo && badgeinfo.length > 0 && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mb: 3, 
                    borderRadius: '12px', 
                    backgroundColor: colors.primaryBackground,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                    {badgeinfo.map((badge, index) => (
                      <Box 
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          gap: 1
                        }}
                      >
                        <BadgeImage
                          src={badge.badge_url}
                          alt={badge.badge_icon}
                        />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: colors.primaryText,
                            fontWeight: 'medium',
                            maxWidth: '100px',
                            textAlign: 'center'
                          }}
                        >
                          {badge.badge_name}
                        </Typography>
                      </Box>
                    ))}
              </Paper>
            )}

            <Paper elevation={0} sx={{ p: 0, mb: 3, borderRadius: '12px', backgroundColor: 'transparent' }}>
              <BasicInfo 
                name={listdata.business_name || ''}
                rating={listdata.customer_rating || 0}
                ratingCount={listdata.customer_reviews || 0}
                address={`${listdata.address_line_1 || ''}...`}
                phone={listdata.business_phone_1 || ''}
                phoneAlt={listdata.business_phone || ''}
                email={listdata.business_email || ''}
                contactinfo={contactinfo}
                badgeinfo={badgeinfo}
                onOpenEnquiry={handleOpenEnquiry}
                contactPopupData={contactPopupData}
                onOpenContactModal={handleOpenContactModal}
                directionurl={listdata.direction_URL || ''}
                listingId={profileData.listdata.listing_id}
                isPinned={isPinned}
                onPinClick={handlePinClick}
              />
            </Paper>

            {listdata.special_discount && (
              <Paper elevation={0} sx={sectionPaperOffer}>
                <Box sx={sectionBox}>
                  <img 
                    src={offerIcon} 
                    alt="Offer Icon" 
                    style={sectionImg} 
                  />
                  <Typography variant="h6" sx={sectionTypoH6Offer}>
                    Special Offer!
                  </Typography>
                </Box>

                  <Typography 
                    component="div" 
                    sx={{ 
                      '& strong': { 
                        fontWeight: 'bold',
                        color: colors.accent1,
                      },
                      '& u': { textDecoration: 'underline' },
                      '& i': { fontStyle: 'italic' },
                      fontSize: '1.1rem',
                      color: colors.secondaryBackground,
                      lineHeight: 1.6,
                      '& p': { mb: 1 },
                      position: 'relative',
                      zIndex: 1
                    }}
                  >
                    {parse(listdata.special_discount || '')}
                  </Typography>

              </Paper>
            )}

            {listdata.promotional_video_URL && (
              <Paper elevation={0} sx={{ mb: 3, borderRadius: '12px', backgroundColor: colors.primaryBackground }}>
                {/* <Typography variant="h6" sx={{ fontWeight: 'bold', color: colors.app_primary, fontSize: '1.25rem', mb: 3 }}>
                  Promotional Video
                </Typography> */}
                <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '8px', overflow: 'hidden' }}>
                  <iframe
                    src={listdata.promotional_video_URL}
                    title="Promotional Video"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allowFullScreen
                  />
                </Box>
              </Paper>
            )}

            {listdata.business_since && (
              <Paper elevation={0} sx={sectionPaper}>
                <Typography sx={{ color: colors.primaryText, fontSize: '1rem' }}>
                  In Business Since
                </Typography>
                <Typography sx={{ fontWeight: 'bold', color: colors.app_primary, fontSize: '1.5rem'}}>{listdata.business_since}</Typography>
              </Paper>
            )}

            <Paper 
              elevation={0}
              sx={sectionPaper}
            >
              <Box sx={sectionBox}>
                <img 
                  src={aboutIcon} 
                  alt="About Icon" 
                  style={sectionImg} 
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
                <Typography sx={sectionTypoH6}>
                  About Us
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography 
                  component="div" 
                  sx={{ 
                    '& strong': { fontWeight: 'bold' },
                    '& u': { textDecoration: 'underline' },
                    '& i': { fontStyle: 'italic' },
                    '& ul': { 
                      listStyleType: 'disc',
                      marginLeft: 2,
                      marginTop: 1,
                      marginBottom: 1
                    },
                    '& li': { marginBottom: 0.5 },
                    '& a': { 
                      color: colors.app_primary,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }
                  }}
                >
                  {parse(listdata.list_about || '')}
                </Typography>
              </Box>
            </Paper>

            {serviceDetails && serviceDetails.length > 0 && (
              <Paper elevation={0} sx={sectionPaper}>
                <Box sx={sectionBox}>
                  <img 
                    src={servicesIcon} 
                    alt="Services Icon" 
                    style={sectionImg} 
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                <Typography sx={sectionTypoH6}>
                      Services
                    </Typography>
                    <List sx={{ listStyleType: 'none' }}>
                      {serviceDetails.map((service, index) => (
                        <ListItem key={index} sx={{ padding: '4px 0' }}>
                          <ListItemIcon sx={{ minWidth: '30px' }}>
                            <CheckCircleOutline sx={{ color: colors.tertiary }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography component="div" sx={{ 
                                '& strong': { fontWeight: 'bold' },
                                '& u': { textDecoration: 'underline' },
                                '& i': { fontStyle: 'italic' }
                              }}>
                                {parse(service.trim())}
                              </Typography>
                            } 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Paper>
              )}

              {pricingDetails && pricingDetails.length > 0 && onlypricingDetails && (
              <Paper elevation={0} sx={sectionPaper}>
                <Box sx={sectionBox}>
                  <img 
                    src={pricingIcon} 
                    alt="Pricing Icon" 
                    style={sectionImg} 
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                <Typography sx={sectionTypoH6}>
                      Pricing
                    </Typography>
                    <List sx={{ listStyleType: 'none' }}>
                      {pricingDetails.map((price, index) => (
                        <ListItem key={index} sx={{ padding: '4px 0' }}>
                          <ListItemText 
                            primary={
                              <Typography component="div" sx={{ 
                                '& strong': { fontWeight: 'bold' },
                                '& u': { textDecoration: 'underline' },
                                '& i': { fontStyle: 'italic' },
                                fontSize: '14px',
                                color: colors.primaryText,
                                pl: 0  // Remove left padding since there's no icon
                              }}>
                                {parse(price.trim())}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Paper>
              )}



            {timingDetails.length > 0 && (
              <Paper elevation={0} sx={sectionPaper}>
                <Box sx={sectionBox}>
                  <img 
                    src={timingIcon} 
                    alt="Business Hours Icon" 
                    style={sectionImg} 
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                  <Typography sx={sectionTypoH6}>
                    Business Hours
                  </Typography>
                </Box>
                <List sx={{ listStyleType: 'none' }}>
                  {timingDetails.map((timing, index) => (
                    <ListItem key={index} sx={{ padding: '4px 0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ListItemText 
                          primary={
                            <Typography component="div" sx={{ 
                              '& strong': { fontWeight: 'bold' },
                              '& u': { textDecoration: 'underline' },
                              '& i': { fontStyle: 'italic' },
                              fontSize: '14px',
                              color: colors.primaryText
                            }}>
                              {parse(timing.trim())}
                            </Typography>
                          }
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}



            {/* Certification/License Section */}
            {listdata.certification_license && listdata.certification_license.split('\r\n').length > 0 && (
              <Paper elevation={0} sx={sectionPaper}>
                <Box sx={sectionBox}>
                  <img 
                    src={certificateIcon} 
                    alt="Certificate Icon" 
                    style={sectionImg} 
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                <Typography sx={sectionTypoH6}>
                    Certification & License
                  </Typography>
                  <List sx={{ listStyleType: 'none' }}>
                    {listdata.certification_license.split('\r\n')
                      .filter(cert => cert.trim())
                      .map((cert, index) => (
                        <ListItem key={index} sx={{ padding: '4px 0' }}>
                          <ListItemIcon sx={{ minWidth: '30px' }}>
                            <CheckCircleOutline sx={{ color: colors.tertiary }} />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Typography component="div" sx={{ 
                                '& strong': { fontWeight: 'bold' },
                                '& u': { textDecoration: 'underline' },
                                '& i': { fontStyle: 'italic' },
                                fontSize: '14px',
                                color: colors.primaryText
                              }}>
                                {parse(cert.trim())}
                              </Typography>
                            }
                          />
                        </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            )}

            {/* Awards/Achievements Section (if you have one) */}
            {achievementDetails && achievementDetails.length > 0 && (
              <Paper elevation={0} sx={sectionPaper}>
                <Box sx={sectionBox}>
                    <img 
                      src={achievementIcon} 
                      alt="Award Acheivement Icon" 
                      style={sectionImg} 
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                    />
                  <Typography sx={sectionTypoH6}>
                    Awards & Achievements
                  </Typography>
                  <List sx={{ listStyleType: 'none' }}>
                    {achievementDetails.map((achievement, index) => (
                      <ListItem key={index} sx={{ padding: '4px 0' }}>
                        <ListItemIcon sx={{ minWidth: '30px' }}>
                          <Star sx={{ color: colors.tertiary }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography component="div" sx={{ 
                              '& strong': { fontWeight: 'bold' },
                              '& u': { textDecoration: 'underline' },
                              '& i': { fontStyle: 'italic' },
                              '& a': { 
                                color: colors.app_primary,
                                textDecoration: 'none',
                                '&:hover': { textDecoration: 'underline' }
                              }
                            }}>
                              {parse(achievement.trim())}
                            </Typography>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Paper>
            )}

            {/* New Social Links Section */}
            <SocialLinks 
              email={listdata.business_email}
              facebook={listdata.profile_URL_fb}
              twitter={listdata.profile_URL_tw}
              linkedin={listdata.profile_URL_linkdn}
              youtube={listdata.profile_URL_youtube}
              website={listdata.website_URL}
              phone={listdata.business_phone_1}
              whatsapp={listdata.business_whatsapp}
            />
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          {listdata.map_location && listdata.map_location.trim() !== '' && (
            <Paper elevation={3} sx={{ mb: 3, borderRadius: '12px', backgroundColor: colors.primaryBackground }}>
              {/* <Typography variant="h6" sx={{ pt: 2, pl: 2, fontWeight: 'bold', color: colors.app_primary, fontSize: '1.25rem', mb: 3 }}>
                Location
              </Typography> */}
              <Location mapUrl={listdata.map_location} />
            </Paper>
          )}

          {listdata.threesixtyurl && (
            <Paper elevation={3} sx={{ mb: 3, borderRadius: '12px', backgroundColor: colors.primaryBackground, overflow: 'hidden' }}>
              <Box sx={{ 
                position: 'relative',
                paddingBottom: '75%', // 4:3 aspect ratio
                height: 0,
              }}>
                <iframe
                  src={listdata.threesixtyurl}
                  title="360 Degree View"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </Box>
            </Paper>
          )}

          <Box sx={{ mb: 3 , backgroundColor:colors.app_primaryBackground }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 , backgroundColor:colors.app_primaryBackground }}>
              <ReviewsPage listingId={id} />
            </Box>
          </Box>
        </Grid>
      </Grid>
	   <ContactPopupModal
        open={openContactPopup}
        onClose={handleCloseContactPopup}
        listingId={selectedListingId}
        contactPopupData={contactPopupData}
      />
      <EnquiryForm 
        open={openEnquiry} 
        onClose={handleCloseEnquiry} 
        businessName={listdata.business_name || ''} 
        businessImage={images[0] || ''}
		subcatname={listdata.sub_category_name || ''}
        cityname={listdata.city_name || ''}
		cityurlslug={listdata.city_urlslug}
		subcaturlslug={listdata.subcat_urlslug}
		listingId={listdata.listing_id}
      />
	  
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ marginBottom: '40px' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <FooterComponent />
    </Container>
  );
};

export default ProfilePage;