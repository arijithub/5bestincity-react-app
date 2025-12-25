import React, { useState, useRef, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, Rating, Snackbar, Modal, IconButton } from '@mui/material';
import Slider from 'react-slick';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import PersonIcon from '@mui/icons-material/Person';
import RateReviewIcon from '@mui/icons-material/RateReview';
import YouTubeIcon from '@mui/icons-material/YouTube';
import CollectionsIcon from '@mui/icons-material/Collections';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { EnhancedCard, ContentWrapper, colors, typography } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import { BADGE_IMAGE_BASE_URL,PROFILE_LINK } from '../../config/apiConfig';
import CloseIcon from '@mui/icons-material/Close';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';

const SliderImageWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  '&:nth-of-type(1) .slick-active img': {
    width: '100%',
   overflow: 'hidden',
    objectFit: 'contain',
  
	borderRadius: '8px',
  },
  '& img': {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '8px',
    padding: '8px' // Reduced padding for images
  },
}));



// Styled component for a responsive modal without 3D effect
const ResponsiveModal = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: 'none',  // Remove the border
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2),
  width: '90%',   // Make the modal responsive by using a percentage width
  maxWidth: '600px',  // Set a max width for larger screens
  borderRadius: '8px',  // Slight border radius for smoother edges
  [theme.breakpoints.down('sm')]: {
    width: '95%',  // For small screens, make it occupy almost full width
  },
}));


const ReviewButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
  border: 0,
  borderRadius: '8px',
  // boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
  color: 'white',
  height: 48,
  padding: '0 30px',
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    //boxShadow: '0 5px 10px 2px rgba(255, 105, 135, .5)',
  },
}));

const IconOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  left: 10,
  right: 10,
  display: 'flex',
  justifyContent: 'space-between',
  pointerEvents: 'none',
  zIndex: 1,
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  pointerEvents: 'auto',
}));

const Modal3D = styled(Modal)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const removeHtmlTags = (str) => {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const styles = {
  address: {
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: colors.secondaryText,
    fontSize: '0.875rem',
    lineHeight: '1.4',
    marginTop: '4px',
    height: '4.2em',
    minHeight: '4.2em',
  },
  businessName: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    flex: 1,
    lineHeight: '1.4',
    height: '2.8em',
    minHeight: '2.8em',
    color: colors.app_primary,
    marginRight: '8px',
  },
  iconButton: {
    padding: '4px',
    marginLeft: 'auto',
    alignSelf: 'flex-start',
  },
  mediaIconButton: {
    position: 'absolute',
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    padding: 0,
    zIndex: 2,
  },
  galleryIcon: {
    bottom: '10px',
    left: '10px',
  },
  videoIcon: {
    bottom: '10px',
    right: '10px',
  },
  floatingButton: {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
  },
  icon: {
    width: '40px',
    height: '40px',
  },
};

const ListingCard = ({ 
  listingData, 
  handleClick, 
  settings, 
  badgeIconStyle, 
  buttonStyle, 
  callButtonStyle, 
  isLoggedIn, 
  onOpenEnquiry,
  calculationData,
  extCheckData,
  allowRedirect,
  isPinned,
  onPinClick
}) => {
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const showCallButton = listingData.contactinfo.is_call === "true";
  const showChatButton = listingData.contactinfo.is_whatsapp === "true";
  const isAd = listingData.is_ad === true;
  const hasBadge = listingData.badgeinfo && listingData.badgeinfo.length > 0;
  const hasGallery = listingData.listdata.is_microsite;
  const hasVideo = listingData.listdata.promotional_video_URL;

   const images = listingData.listdata 
    ? [listingData.listdata.sub_list_image_1, listingData.listdata.sub_list_image_2, listingData.listdata.sub_list_image_3]
        .filter(img => img && img.trim() !== '') // Filter out invalid or empty images
    : []; // Fallback to an empty array if listingData or listdata is undefined

  const sliderSettings = {
    ...settings,
    dots: images.length > 1,
    infinite: images.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: images.length > 1,
    autoplaySpeed: 3000,
    arrows: images.length > 1,
    dotsClass: "slick-dots custom-dots",
    appendDots: dots => (
      <div style={{ bottom: '-20px' }}>
        {dots}
      </div>
    )
  };
  
  const sliderSettings1 = {
    dots: true,
    infinite: images.length > 1, // Only enable infinite if there are more than one image
    slidesToShow: 1, // Always show one image at a time
    slidesToScroll: 1,
    autoplay: images.length > 1, // Autoplay only if more than one image
    autoplaySpeed: 3000,
    centerMode: images.length === 1, // Only center if there's one image
    centerPadding: images.length === 1 ? '0px' : '50px', // Remove padding if there's only one image, else use 50px
  };

  const handleAction = (action) => {
    handleClick(listingData, action);
  };

const handleViewProfile = (event) => {
  event.stopPropagation();
  const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
  sessionStorage.setItem('listingPageScrollPosition', currentPosition.toString());
  sessionStorage.setItem('fromProfilePage', 'true');
  navigate(`/profile/${listingData.listdata.listing_id}`);
};


  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

 const handleCardClick = (event) => {
  if (allowRedirect === "yes" && !event.target.closest('button')) {
    navigate(`/profile/${listingData.listdata.listing_id}`);
  }
};
   
  const handleReviewsClick = () => {
     // Store the current scroll position
  const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
  //alert(currentPosition);
  sessionStorage.setItem('listingPageScrollPosition', currentPosition.toString());
  sessionStorage.setItem('fromListingPage', 'true');
  
  // Navigate to reviews
  navigate(`/reviews/${listingData.listdata.listing_id}`);
  };

  const handleGalleryClick = (e) => {
    e.stopPropagation();
    setModalContent('gallery');
    setModalOpen(true);
  };

  const handleVideoClick = (e) => {
    e.stopPropagation();
    setModalContent('video');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalContent(null);
  };
  
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const modalRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!modalRef.current) return;
      const { left, top, width, height } = modalRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width;
      const y = (e.clientY - top) / height;
      
      // Adjust the multiplier for more pronounced effect
      const rotationX = (0.5 - y) * 20; // Invert Y-axis for natural movement
      const rotationY = (x - 0.5) * 20;
      
      setRotation({ x: rotationX, y: rotationY });
    };

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.addEventListener('mousemove', handleMouseMove);
      modalElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (modalElement) {
        modalElement.removeEventListener('mousemove', handleMouseMove);
        modalElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Card 
        sx={{ 
          boxShadow: 3, 
          transition: 'transform 0.5s', 
          '&:hover': { transform: 'scale3d(1.05, 1.05, 1.05)' },
          cursor: allowRedirect === "yes" ? 'pointer' : 'default',
          position: 'relative',
          borderRadius: '8px',
          overflow: 'hidden',
          height: '100%',
		  minWidth: '280px',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={handleCardClick}
      >
        <Box className="slider-container" sx={{ 
          flexShrink: 0,
          position: 'relative',
          mb: listingData.badgeinfo?.length > 0 ? 1 : 0
        }}>
          <Box className="slider-image-wrapper">
            {images.length === 1 ? (
              <SliderImageWrapper>
                <img src={images[0]} alt="Business" loading="lazy" decoding="async" fetchpriority="low" />
              </SliderImageWrapper>
            ) : (
              <Slider {...sliderSettings}>
                {images.map((img, index) => (
                  <SliderImageWrapper key={index}>
                    <img src={img} alt={`Slide ${index + 1}`} loading="lazy" decoding="async" fetchpriority="low" />
                  </SliderImageWrapper>
                ))}
              </Slider>
            )}
            <IconOverlay>
              {hasGallery && (
                <StyledIconButton onClick={handleGalleryClick}>
                  <CollectionsIcon />
                </StyledIconButton>
              )}
              {hasVideo && (
                <StyledIconButton 
                  onClick={handleVideoClick}
                  sx={{ marginLeft: 'auto' }}
                >
                  <YouTubeIcon />
                </StyledIconButton>
              )}
            </IconOverlay>
          </Box>
          
          <Box className="badge-container" sx={{ 
            minHeight: listingData.badgeinfo?.length > 0 ? '20px' : '0',
            display: 'flex',
            alignItems: 'center',
            padding: listingData.badgeinfo?.length > 0 ? '8px 12px' : '0',
            marginTop: listingData.badgeinfo?.length > 0 ? '8px' : 0,
            marginBottom: listingData.badgeinfo?.length > 0 ? 0.5 : 0,
            height: listingData.badgeinfo?.length > 0 ? 'auto' : '0'
          }}>
            <Box className="badges-wrapper" sx={{ display: 'flex', gap: 1 }}>
			  {listingData.badgeinfo.map((badge, index) => (
				<img 
				  key={index} 
				  src={`${BADGE_IMAGE_BASE_URL}${badge.badge_url}`}
				  alt="Badge" 
				  loading="lazy"
				  decoding="async"
				  fetchpriority="low"
				  style={{
					...badgeIconStyle,
					width: '70px',
					height: '20px',
					objectFit: 'contain'
				  }} 
				/>
			  ))}
			</Box>
            {isAd && (
              <Box
                sx={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  marginLeft: 'auto',
                }}
              >
                Ad
              </Box>
            )}
          </Box>
        </Box>
        <CardContent className="card-content" sx={{ 
          borderRadius: '8px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          padding: '12px',
          paddingTop: '0',
          '&:last-child': { 
            paddingBottom: '12px'
          }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 0.5,
            marginTop: listingData.badgeinfo?.length > 0 ? 0 : 1
          }}>
            <Typography 
              className="business-name" 
              variant="h5" 
              component="div" 
              sx={styles.businessName}
              dangerouslySetInnerHTML={{ 
                __html: listingData.listdata.business_name 
              }}
            />
            {hasBadge && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPinClick) {
                    onPinClick();
                  }
                }}
                sx={styles.iconButton}
                aria-label={isPinned ? "Unpin business" : "Pin business"}
              >
                {isPinned ? (
                  <PushPinIcon sx={{ color: colors.categoryActive, fontSize: '1.2rem' }} />
                ) : (
                  <PushPinOutlinedIcon sx={{ color: colors.app_primary, fontSize: '1.2rem' }} />
                )}
              </IconButton>
            )}
          </Box>
          <Box className="rating-container" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            textAlign: 'center',
            marginTop: -0.5
          }}>
            <Typography variant="body2" sx={{ marginRight: 1, fontWeight: 'bold', fontSize: '1.2rem' }}>
              {listingData.listdata.customer_rating ? listingData.listdata.customer_rating : ''}
            </Typography>
            <Rating name="read-only" value={listingData.listdata.customer_rating || 0} readOnly precision={0.5} sx={{ marginRight: 1 }} />
            <Typography className="review-count" variant="body2">
              {listingData.listdata.customer_reviews > 0 
                ? `${listingData.listdata.customer_reviews} reviews` 
                : ''}
            </Typography>
          </Box>
          <Typography 
            className="address" 
            variant="body2" 
            sx={styles.address}
          >
            {listingData.listdata.address_line_1}, {listingData.listdata.city_name}, {listingData.listdata.state_name} - {listingData.listdata.address_pincode}, {listingData.listdata.country_name}
          </Typography>
 <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: showCallButton && !showChatButton ? 'center' : 'space-between',
      marginTop: 2,
      gap: 2
    }}
  >
    {showCallButton && listingData.badgeinfo?.length > 0 && (
      <Button 
        onClick={() => handleAction('call')}
        variant="contained" 
        color="primary" 
        startIcon={<PhoneIcon />} 
        sx={{ 
          ...callButtonStyle, 
          backgroundColor: colors.callbuttonbg,
          fontSize: '0.9rem',
          padding: '8px 20px',
          minWidth: '120px',
          height: '40px'
        }}
      >
        Call
      </Button>
    )}
    {showChatButton && listingData.badgeinfo?.length > 0 && (
      <Button 
        onClick={() => handleAction('chat')}
        variant="contained" 
        color="success" 
        startIcon={<WhatsAppIcon />}  
        sx={{ 
          ...buttonStyle, 
          backgroundColor: colors.commonbtnbg,
          color: colors.callbuttonbg,
          fontSize: '0.9rem',
          padding: '8px 20px',
          minWidth: '120px',
          height: '40px'
        }}
      >
        Chat
      </Button>
    )}

  {!listingData.badgeinfo?.length > 0 && allowRedirect === "yes" && ( 
    <Button 
      onClick={handleViewProfile}
      variant="contained" 
      color="primary"
      startIcon={<PersonIcon />}
      sx={{ 
        ...buttonStyle, 
        backgroundColor: colors.commonbtnbg, 
        color: colors.commonbtntextcolor
      }}
    >
      View Profile
    </Button>
  )}
</Box>
<Box className="review-button-container">
  {listingData.badgeinfo?.length > 0 ? (
    <Button
     onClick={(e) => {
      e.stopPropagation();
      const position = window.scrollY;
	 // alert(position);
        const currentPosition = window.pageYOffset || document.documentElement.scrollTop;
        const currentPath = window.location.pathname;
        
        // Save both position and path in sessionStorage
        const navigationState = {
          listingPosition: currentPosition,
          categoryPosition: sessionStorage.getItem('categoryPageScrollPosition'),
          lastPath: currentPath,
          timestamp: Date.now()
        };
        
        sessionStorage.setItem('navigationState', JSON.stringify(navigationState));
      navigate(`/profile/${listingData.listdata.listing_id}`);
    }}
      fullWidth
      sx={{
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        border: 0,
        borderRadius: 3,
       // boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
        color: 'white',
        height: 48,
        padding: '0 30px',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-3px) scale(1.05)',
         // boxShadow: '0 5px 10px 2px rgba(255, 105, 135, .5)',
        },
      }}
    >
      VIEW PROFILE
    </Button>
  ) : (
    <ReviewButton
      onClick={handleReviewsClick}
      startIcon={<RateReviewIcon />}
      fullWidth
    >
      Read and Write Reviews
    </ReviewButton>
  )}
</Box>
        </CardContent>
      </Card>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Sorry this listing is not verified."
      />
<ResponsiveModal
  open={modalOpen}
  onClose={handleCloseModal}
  aria-labelledby="responsive-modal-title"
  aria-describedby="responsive-modal-description"
>
  <ModalContent>
    {modalContent === 'gallery' && listingData.listdata.is_microsite && (
      <iframe
        src={listingData.listdata.is_microsite}
        title="Gallery"
        width="100%"
        height="100%"
        style={{ border: 'none', borderRadius: '8px', height: '80vh', width: '100vw', position: 'absolute', top: 0, left: 0}}
      />
    )}
    {modalContent === 'video' && listingData.listdata.promotional_video_URL && (
      <iframe
        src={listingData.listdata.promotional_video_URL}
        title="YouTube video player"
        width="100%"
        height="300px"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ borderRadius: '8px' }}
      />
    )}

<Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 2
        }}
      >
    <Button 
      onClick={handleCloseModal} 
      variant="contained" 
      sx={{ 
        borderRadius: '20px', 
        padding: '8px 16px', 
        backgroundColor: 'white', 
        textTransform: 'none',
        color: 'black', 
        display: 'flex', 
        alignItems: 'center',
        position: 'fixed',
        bottom: '10vh',
        '&:hover': {
          backgroundColor: 'white',
        }
      }}
    >
      <CloseIcon sx={{ marginRight: 1 }} />
      Close
    </Button>
    </Box>
  </ModalContent>
</ResponsiveModal>

    </Grid>
  );
};

export default ListingCard;