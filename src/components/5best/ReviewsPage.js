import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Box, Typography, Rating, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, Paper, Avatar,
  List, ListItem, ListItemText, ListItemAvatar, Divider,
  ToggleButtonGroup, ToggleButton, CircularProgress, Snackbar, Modal, IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ShareIcon from '@mui/icons-material/Share';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
//import { useLoginState } from '../../hooks/useLoginState';
import { setLike, getLike, removeLike } from './indexedDB';
import { keyframes } from '@mui/system';
import { EnhancedCard, ContentWrapper, colors, typography} from '../../theme-styles';
import { useLogin } from '../../contexts/LoginContext';
import { getApiUrl, ENDPOINTS } from '../../config/apiConfig';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import FooterComponent from '../../FooterComponent';


// Keyframes for the thumbs-up animation
const thumbsUpAnimation = keyframes`
  0% {
    transform: scale(1);
    color: grey;
  }
  50% {
    transform: scale(1.5);
    color: white;
  }
  100% {
    transform: scale(1);
    color: white;
  }
`;

// Styled component for the animated thumbs-up button
const AnimatedThumbUpIcon = styled(ThumbUpAltIcon)(({ liked }) => ({
  color: liked ? 'white' : 'grey',
  animation: liked ? `${thumbsUpAnimation} 0.5s ease` : 'none',
}));

// Wrapper for the verification icons with 3D effect
const VerificationIconWrapper = styled('div')(({ theme, verifiedColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  backgroundColor: verifiedColor,
 // boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease-in-out',
  '& svg': {
    fontSize: '0.9rem',
  },
  '&:hover': {
    transform: 'translateY(-3px)',
   // boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
  }
}));

// Wrapper for the tick mark with 3D effect
const TickIconWrapper = styled('div')(({ theme, tickColor }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.5rem',
  height: '1.5rem',
  borderRadius: '50%',
  backgroundColor: tickColor,
  boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
  marginRight: theme.spacing(1),
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.3)',
  }
}));

const growAnimation = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const ProfileCompletenessWrapper = styled(Box)(({ theme, value }) => ({
  position: 'relative',
  display: 'inline-flex',
  marginLeft: '0px',
  width: '24px',
  height: '24px',
  '& .MuiCircularProgress-circle': {
    strokeDashoffset: 100 - value,
    animation: `${growAnimation} 1.5s ease-out forwards`,
  },
  '& .MuiCircularProgress-root': {
    backgroundColor: 'transparent',
    width: '24px !important',
    height: '24px !important',
  }
}));

const CompletionLabel = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontSize: '0.5rem',
  fontWeight: 'bold',
  color: theme.palette.text.primary,
  backgroundColor: "none"
}));


const ReplySection = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[100],
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginLeft: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'flex-start',
}));

const VibrantIcon = styled('span')(({ theme, isVerified }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginLeft: theme.spacing(0.5),
width: '1.25rem',
height: '1.25rem',
  borderRadius: '50%',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
  },
  '& svg': {
    fontSize: '0.875rem',
    color: isVerified ? theme.palette.common.white : theme.palette.grey[400],
  },
}));

const EmailIconWrapper = styled(VibrantIcon)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

const PhoneIconWrapper = styled(VibrantIcon)(({ theme, isVerified }) => ({
  backgroundColor: isVerified ? '#2196f3' : theme.palette.grey[300],
}));

const WhatsAppIconWrapper = styled(VibrantIcon)(({ theme, isVerified }) => ({
  backgroundColor: isVerified ? '#25D366' : theme.palette.grey[300],
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  paddingRight: theme.spacing(2),
}));

const SummaryPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  marginBottom: theme.spacing(4),

}));

const RatingBar = styled(Box)(({ theme, value }) => ({
  height: 6,
  width: '100%',
  backgroundColor: theme.palette.grey[300],
  borderRadius: 3,
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    height: '100%',
    width: `${value}%`,
    backgroundColor: theme.palette.warning.main,
    borderRadius: 3,
  },
}));

const LikeButton = styled(Button)(({ theme, liked }) => ({
  backgroundColor: liked ? theme.palette.primary.main : 'white',
  color: liked ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: liked ? theme.palette.primary.dark : theme.palette.grey[100],
  },
}));

const ScrollableToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'flex',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  width: '100%',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none',
  '& .MuiToggleButtonGroup-grouped': {
    border: 0,
    '&:not(:first-of-type)': {
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
  },
}));

const ScrollContainer = styled(Box)(({ theme }) => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  whiteSpace: 'nowrap',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none',
  '-ms-overflow-style': 'none',
  padding: theme.spacing(1, 0),
}));

const FlexToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  display: 'inline-flex',
  borderRadius: theme.shape.borderRadius,
  '& .MuiToggleButton-root': {
    flexShrink: 0,
    '&:not(:first-of-type)': {
      marginLeft: '0px',
    },
  },
}));


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



const ReviewsPage = ({ listingId }) => {
  const params = useParams();
  const [overallRating, setOverallRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingsDistribution, setRatingsDistribution] = useState([]);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('most_relevant');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [error, setError] = useState(null);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', userId: '' });
  const [categoryData, setCategoryData] = useState({ category: '', subcategory: '', categoryId: null, subcategoryId: null });
  const [locationData, setLocationData] = useState({ city: '', state: '', country: '', cityId: null, stateId: null, countryId: null });
  const [apiUserData, setApiUserData] = useState({
  name: localStorage.getItem('name') || '',
  email: '',
  is_owner: '0',
  user_id: localStorage.getItem('user_id') || ''  // Initialize with localStorage
});

  const [sortedReviews, setSortedReviews] = useState([]);
  const [lastVisibleReviewId, setLastVisibleReviewId] = useState(null);
  const lastReviewRef = useRef(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [openEditReviewDialog, setOpenEditReviewDialog] = useState(false);
  const [openEditReplyDialog, setOpenEditReplyDialog] = useState(false);
  const [editingReply, setEditingReply] = useState(null);
  const [replyError, setReplyError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [likeLoading, setLikeLoading] = useState({});
  const {  login, logout } = useLogin();
  const [expandedReviews, setExpandedReviews] = useState({});
  const [loginModalMessage, setLoginModalMessage] = useState('Please log in to write a review');
  const [resetRatingKey, setResetRatingKey] = useState(0);
  const navigate = useNavigate();
   
   useEffect(() => {
  // Small delay to ensure content is ready
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
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


const isUserLoggedIn = () => {
    const sessionLoginState = localStorage.getItem('loginState');
    const cookieLoginState = getCookie('loginState');
    const cookieUserId = getCookie('user_id');
    
    return (sessionLoginState === 'logged_in' || cookieLoginState === 'logged_in') && 
           (localStorage.getItem('user_id') || cookieUserId);
  };
 
// alert(localStorage.getItem('loginState'));
   const userLoggedIn = isUserLoggedIn();
  const userId = localStorage.getItem('user_id') || getCookie('user_id');
 
 
 
  
useEffect(() => {
 

  
 if (userLoggedIn) {
      const cookieUserId = getCookie('user_id');
      setUserData({
        name: localStorage.getItem('name') || '',
        email: localStorage.getItem('email') || '',
        userId: userId || cookieUserId || ''
      });
    }

   const effectiveListingId = listingId || params.listingId;
    if (effectiveListingId) {
      fetchReviewData(effectiveListingId);
    } else {
      setError("No listing ID provided");
      setLoading(false);
    }
  }, [userLoggedIn, userId, listingId, params.listingId]);

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + parseFloat(review.rating), 0);
    return sum / reviews.length;
  };
  
   const checkIsBusinessOwner = () => {
    const businessOwners = localStorage.getItem('businessOwners')?.split(',') || [];
    const userIdFromCookie = getCookie('user_id');
    const userIdFromStorage = localStorage.getItem('user_id');
    const effectiveUserId = userIdFromStorage || userIdFromCookie;
    
    return effectiveUserId && businessOwners.includes(effectiveUserId);
  };
  


  const renderProfileCompleteness = (review) => {
    if (review.complete_percentage !== null && review.complete_percentage !== '') {
      return (
        <Box position="relative" display="inline-flex" ml={1} sx={{  margin:colors.sectionmb  }}>
          <CircularProgress
            variant="determinate"
            value={parseInt(review.complete_percentage)}
            size={24}
            thickness={4}
          />
          <Box
            top={0}
            left={0}
            bottom={0}
            right={0}
            position="absolute"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="caption" component="div" color="text.secondary" style={{ fontSize: '0.6rem' }}>
              {`${Math.round(review.complete_percentage)}%`}
            </Typography>
          </Box>
        </Box>
      );
    }
    return null;
  };
  
useEffect(() => {
  sortReviews(sortBy);
}, [reviews, sortBy]);

useEffect(() => {
  if (reviews && reviews.length > 0) {
    const sorted = sortReviews(sortBy);
    setSortedReviews(sorted);
  }
}, [reviews, sortBy]);

const fetchReviewData = async (id, isInitial = true) => {
  try {
    setLoading(isInitial);
    setLoadingMore(!isInitial);
    
    const url = isInitial 
      ? getApiUrl(ENDPOINTS.REVIEW_API, `lid=${id}`)
      : getApiUrl(ENDPOINTS.REVIEW_API_MORE, `lid=${id}&page=${page}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    setApiUserData({
      name: localStorage.getItem('name') || '',
      email: data.user_email || '',
      is_owner: data.is_owner || '0',
      user_id: localStorage.getItem('user_id') || '1'
    });
	
		  
  const businessOwners = data.business_owners ? data.business_owners.split(',') : [];
  const loggedInUserId = localStorage.getItem('user_id');
  const isBusinessOwner = checkIsBusinessOwner();
  localStorage.setItem('isBusinessOwner',isBusinessOwner);

if (data.reviewdata && Array.isArray(data.reviewdata)) {
      // Step 1: Collect all review_ids from the replies
      const replyIds = new Set();
      data.reviewdata.forEach(review => {
        if (review.replies && Array.isArray(review.replies)) {
          review.replies.forEach(reply => {
            replyIds.add(reply.review_id); // Collect all review_ids from the replies
          });
        }
      });

      // Step 2: Filter out reviews whose review_id matches any review_id in replyIds
      const filteredReviews = data.reviewdata.filter(review => !replyIds.has(review.review_id));

      // Step 3: Process the filtered reviews
      const parsedReviews = await Promise.all(filteredReviews.map(async review => {
        const liked = await getLike(review.review_id);
		
		  const parsedReplies = await Promise.all((review.replies || []).map(async reply1 => {
          const replyLiked = await getLike(reply1.review_id);
          return {
            ...reply1,
            liked: replyLiked,
            like_count: parseInt(reply1.like_count) || 0,
          };
        }));
		
		
        return {
          ...review,
          rating: parseFloat(review.rating),
          like_count: parseInt(review.like_count) || 0,
          liked,
          review_datetime: new Date(review.review_datetime),
          replies: parsedReplies // Attach replies if needed
        };
      }));
	  
	   const parsedReviews1 = await Promise.all(data.reviewdata.map(async review1 => {
        const liked1 = await getLike(review1.review_id);
        return {
          ...review1,
          rating: parseFloat(review1.rating),
          like_count: parseInt(review1.like_count) || 0,
          liked1,
          review_datetime: new Date(review1.review_datetime),
          replies: review1.replies || []
        };
      }));

      // Step 4: Update state based on whether it's an initial load or loading more reviews
      if (isInitial) {
        setReviews(parsedReviews);
        setTotalReviews(parsedReviews.length);
        setOverallRating(calculateAverageRating(parsedReviews));
        
        setCategoryData({
          category: data.category || '',
          subcategory: data.subcategory || '',
          categoryId: data.category_id || null,
          subcategoryId: data.subcategory_id || null
        });

        setLocationData({
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          cityId: data.city_id || null,
          stateId: data.state_id || null,
          countryId: data.country_id || null
        });

        const distribution = [5, 4, 3, 2, 1].map(star => ({
          rating: star,
          count: parsedReviews.filter(review => Math.round(review.rating) === star).length
        }));
        setRatingsDistribution(distribution);
      } else {
        setReviews(prevReviews => [...prevReviews, ...parsedReviews]);
        setTotalReviews(prevTotal => prevTotal + parsedReviews.length);
      }
      
      setHasMore(parsedReviews1.length === 15);
    } else {
      setError("No review data found");
    }
  } catch (error) {
    console.error("Failed to fetch review data", error);
    setError("Failed to fetch reviews. Please try again later.");
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};
  
  const calculateRelevanceScore = useCallback((review) => {
    const currentDate = new Date();
    const reviewDate = new Date(review.review_datetime);
    const daysSinceReview = (currentDate - reviewDate) / (1000 * 60 * 60 * 24);

    // Factors for relevance score
    const ratingWeight = 0.3;
    const recencyWeight = 0.3;
    const likesWeight = 0.2;
    const verificationWeight = 0.1;
    const textLengthWeight = 0.1;

    // Calculate individual scores
    const ratingScore = review.rating / 5; // Normalize rating to 0-1
    const recencyScore = Math.max(0, 1 - daysSinceReview / 365); // Newer reviews score higher
    const likesScore = Math.min(1, review.like_count / 100); // Cap at 100 likes for 1.0 score
    const verificationScore = (review.phone_verification_time ? 0.5 : 0) + (review.whatsapp_verification_time ? 0.5 : 0);
    const textLengthScore = Math.min(1, review.review_comment.length / 500); // Cap at 500 characters for 1.0 score

    // Calculate total relevance score
    const relevanceScore = 
      (ratingScore * ratingWeight) +
      (recencyScore * recencyWeight) +
      (likesScore * likesWeight) +
      (verificationScore * verificationWeight) +
      (textLengthScore * textLengthWeight);

    return relevanceScore;
  }, []); 
 
  
 const sortReviews = useCallback((sortType) => {
    if (!reviews || reviews.length === 0) {
      console.log("No reviews to sort");
      return [];
    }

    let sorted = [...reviews];
    switch (sortType) {
      case 'most_relevant':
        sorted.sort((a, b) => calculateRelevanceScore(b) - calculateRelevanceScore(a));
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.review_datetime) - new Date(a.review_datetime));
        break;
      case 'highest':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.rating - b.rating);
        break;
      case 'phone_verification':
        sorted = sorted.filter(review => review.phone_verification_time != null && review.phone_verification_time !== '');
        break;
      case 'whatsapp_verification':
        sorted = sorted.filter(review => review.whatsapp_verification_time != null && review.whatsapp_verification_time !== '');
        break;
      default:
        // Keep the original order
        break;
    }
    return sorted;
  }, [reviews, calculateRelevanceScore]);

const handleSortChange = (event, newSortBy) => {
  if (newSortBy !== null) {
    setSortBy(newSortBy);
    const sorted = sortReviews(newSortBy);
    if (sorted.length === 0) {
      //setSnackbarMessage('No reviews match this filter.');
      //setSnackbarOpen(true);
      setSortedReviews([]);  // Clear the sorted reviews
    } else {
      setSortedReviews(sorted);
    }
  }
};

const handleRatingClick = (newValue) => {
  if (isUserLoggedIn()) {
    setNewReview(prev => ({ 
      ...prev, 
      rating: newValue,
      review_reply_id: '0'
    }));
    setOpenReviewDialog(true);
  } else {
    // Don't update the rating state if user is not logged in
    setLoginModalMessage('Please log in to write a review');
    setOpenLoginModal(true);
  }
};

  const handleCloseDialog = () => {
    setOpenReviewDialog(false);
    setNewReview({ rating: 0, comment: '' });
    setResetRatingKey(prevKey => prevKey + 1); // Force re-render of Rating component
  };
  
   const handleEditReviewClick = (review) => {
    setEditingReview(review);
    setOpenEditReviewDialog(true);
  };
  
  const handleReplyClick = (review) => {
  setReplyingTo(review);
  setReplyText('');
  setOpenReplyModal(true);
};
  
  const handleEditReplyClick = (review) => {
	 
    setEditingReply({
      review_id: review.review_id,
      review_comment: review.review_comment || ''
    });
    setOpenEditReplyDialog(true);
  };
  
   const handleCloseEditReplyDialog = () => {
    setOpenEditReplyDialog(false);
    setEditingReply(null);
    setReplyError('');
  };
  
  const handleSubmitEditReply = async () => {
  if (editingReply.review_comment.length < 10) {
    setReplyError('Please enter at least 10 characters');
    return;
  }

  try {
   const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_REVIEW), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        review_id: editingReply.review_id,
        review_comment: editingReply.review_comment,
      }),
    });

    if (response.ok) {
      setSnackbarMessage('Reply updated successfully!');
      setSnackbarOpen(true);
      fetchReviewData(listingId || params.listingId);
      handleCloseEditReplyDialog();
    } else {
      throw new Error('Failed to update reply');
    }
  } catch (error) {
    console.error('Error updating reply:', error);
    setSnackbarMessage('Failed to update reply. Please try again.');
    setSnackbarOpen(true);
  }
};

const handleSubmitReply = async () => {
  if (replyText.trim().length < 10) {
    setSnackbarMessage('Please enter at least 10 characters');
    setSnackbarOpen(true);
    return;
  }

  const requiredFields = {
    glid: listingId || params.listingId,
    grn: apiUserData.name,
    gml: apiUserData.email,
    gcm: replyText.trim(),
    grt: 0, // Rating is not applicable for replies
    gcat: categoryData.category || '',
    gsubcat: categoryData.subcategory || '',
    gcity: locationData.city || '',
    gstate: locationData.state || '',
    gcountry: locationData.country || '',
    user_id: apiUserData.user_id || '',
    is_owner: '1', // This is a reply from the owner
    review_reply_id: "0",
	rev_upd_id: replyingTo.review_id
  };

  try {
   const response = await fetch(getApiUrl(ENDPOINTS.SUBMIT_REVIEW), {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requiredFields),
    });

    if (response.ok) {
      setSnackbarMessage('Reply submitted successfully!');
      setSnackbarOpen(true);
      setOpenReplyModal(false);
      fetchReviewData(listingId || params.listingId);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit reply');
    }
  } catch (error) {
    console.error('Error submitting reply:', error);
    setSnackbarMessage(`Failed to submit reply: ${error.message}`);
    setSnackbarOpen(true);
  }
};

const handleSubmitReview = async () => {
  if (!newReview.comment.trim()) {
    setSnackbarMessage('Please enter a review comment.');
    setSnackbarOpen(true);
    return;
  }

  const userId = localStorage.getItem('user_id') || apiUserData.user_id;
  if (!userId) {
    setSnackbarMessage('User ID not found. Please log in again.');
    setSnackbarOpen(true);
    return;
  }

  // Ensure all required fields are present
  const requiredFields = {
    glid: listingId || params.listingId,
    grn: apiUserData.name,
    gml: apiUserData.email,
    gcm: newReview.comment.trim(),
    grt: newReview.rating,
    gcat: categoryData.category || '',
    gsubcat: categoryData.subcategory || '',
    gcity: locationData.city || '',
    gstate: locationData.state || '',
    gcountry: locationData.country || '',
    user_id: userId, // Use the retrieved userId
    is_owner: apiUserData.is_owner || '0',
    review_reply_id: newReview.review_reply_id || ''
  };

  try {
    const response = await fetch(getApiUrl(ENDPOINTS.SUBMIT_REVIEW), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requiredFields),
    });

    if (response.ok) {
      handleCloseDialog();
      setSnackbarMessage('Review submitted successfully!');
      setSnackbarOpen(true);
      fetchReviewData(listingId || params.listingId);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit review');
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    setSnackbarMessage(`Failed to submit review: ${error.message}`);
    setSnackbarOpen(true);
  }
};
  
  const handleSubmitEditReview = async () => {
  if (editingReview.review_comment.length < 10) {
    setReviewError('Please enter at least 10 characters');
    return;
  }

  try {
    const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_REVIEW), {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        review_id: editingReview.review_id,
        review_comment: editingReview.review_comment
       
      }),
    });

    if (response.ok) {
      setSnackbarMessage('Review updated successfully!');
      setSnackbarOpen(true);
      fetchReviewData(listingId || params.listingId);
      handleCloseEditReviewDialog();
    } else {
      throw new Error('Failed to update review');
    }
  } catch (error) {
    console.error('Error updating review:', error);
    setSnackbarMessage('Failed to update review. Please try again.');
    setSnackbarOpen(true);
  }
};

  const handleShowMore = async () => {
    setLoadingMore(true);
    setPage(prevPage => prevPage + 1);
    
    // Store the current scroll position
    const scrollPosition = window.pageYOffset;
    
    // Fetch new reviews
    await fetchReviewData(listingId || params.listingId, false);
    
    // Restore the scroll position after the new reviews are loaded
    window.scrollTo(0, scrollPosition);
    
    setLoadingMore(false);
  };

  useEffect(() => {
    if (lastVisibleReviewId && lastReviewRef.current) {
      lastReviewRef.current.scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }, [sortedReviews]);



 const handleLike = async (reviewId) => {
    if (!isUserLoggedIn()) {
      setLoginModalMessage('Please log in to like a review');
      setOpenLoginModal(true);
      return;
    }


  try {
    const currentLiked = await getLike(reviewId);
    const newLiked = !currentLiked;

    if (newLiked) {
      await setLike(reviewId, true);
    } else {
      await removeLike(reviewId);
    }

    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.review_id === reviewId) {
          return {
            ...review,
            liked: newLiked,
            like_count: newLiked ? review.like_count + 1 : review.like_count - 1,
          };
        }
        const updatedReplies = review.replies.map((reply) =>
          reply.review_id === reviewId
            ? {
                ...reply,
                liked: newLiked,
                like_count: newLiked ? reply.like_count + 1 : reply.like_count - 1,
              }
            : reply
        );
        return { ...review, replies: updatedReplies };
      })
    );

    // Send the like/unlike action to the server
    await fetch(getApiUrl(ENDPOINTS.TOGGLE_LIKE), {

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        review_id: reviewId,
        type: newLiked ? 'up' : 'down',
      }),
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    setSnackbarMessage('Failed to update like. Please try again.');
    setSnackbarOpen(true);
  }
};



  const handleShare = (reviewId) => {
    setSnackbarMessage('Review shared!');
    setSnackbarOpen(true);
  };

const handleLogin = () => {
  setOpenLoginModal(false);
  // Reset the rating if user is not logged in
  if (!isUserLoggedIn()) {
    setNewReview({ rating: 0, comment: '' });
    setResetRatingKey(prevKey => prevKey + 1); // Increment to force re-render
  }
};

const handleCloseLoginModal = () => {
 
  if (!isUserLoggedIn()) {
	  //alert('sdsd');
    setNewReview({ rating: 0, comment: '' });
    setResetRatingKey(prevKey => prevKey + 1); // Increment to force re-render
  }
   setOpenLoginModal(false);
};



if (loading) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh', // This ensures full viewport height
        width: '100%'
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}
  

   const handleEditClick = (review) => {
    setEditingReview(review);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingReview(null);
  };
  
    const handleCloseEditReviewDialog = () => {
    setOpenEditReviewDialog(false);
    setEditingReview(null);
  };

  const handleSubmitEdit = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.UPDATE_REVIEW), {

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: editingReview.review_id,
          review_comment: editingReview.review_comment,
        }),
      });

      if (response.ok) {
        setSnackbarMessage('Reply updated successfully!');
        setSnackbarOpen(true);
        fetchReviewData(listingId || params.listingId);
        handleCloseEditDialog();
      } else {
        throw new Error('Failed to update reply');
      }
    } catch (error) {
      console.error('Error updating reply:', error);
      setSnackbarMessage('Failed to update reply. Please try again.');
      setSnackbarOpen(true);
    }
  };

const renderReplySection = (review) => {
  // Check if review exists and review_reply_id is valid
  if (!review || !review.review_reply_id || review.review_reply_id === '0' || review.review_reply_id === '') {
    return null;
  }

  const replyDate = review.reply_datetime ? new Date(review.reply_datetime).toLocaleDateString() : '';
  const loggedInUserId = sessionStorage.getItem('user_id');
  const canEdit = review.user_id === localStorage.getItem('user_id');

  return (
    <ReplySection>
      <Avatar 
        src={review.review_reply_image || undefined} 
        alt={review.review_reply_name || ''}
        sx={{ marginRight: 2 }}
        imgProps={{
          loading: "lazy",
          decoding: "async",
          fetchpriority: "low"
        }}
      >
        {!review.review_reply_image && review.review_reply_name?.[0]?.toUpperCase()}
      </Avatar>
      <Box flexGrow={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight="bold">
            {review.review_reply_name || ''}
          </Typography>
          {canEdit && (
            <IconButton onClick={() => handleEditReplyClick(review)} size="small">
              <EditIcon />
            </IconButton>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {replyDate}
        </Typography>
        <Typography variant="body2">
          {review.reply_text || ''}
        </Typography>
      </Box>
    </ReplySection>
  );
};

const ReplyPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  marginLeft: theme.spacing(6),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
  borderRadius: '10px',
  boxShadow: '5px 5px 15px #d1d1d1, -5px -5px 15px #ffffff',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '8px 8px 20px #d1d1d1, -8px -8px 20px #ffffff',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '20px',
    left: '-10px',
    width: '20px',
    height: '20px',
    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
    transform: 'rotate(45deg)',
    boxShadow: '-5px 5px 15px #d1d1d1',
    zIndex: -1,
  },
}));

const ReplyAvatar = styled(Avatar)(({ theme }) => ({
  border: `2px solid ${theme.palette.background.paper}`,
  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
}));

const ReplyActionButton = styled(Button)(({ theme, liked }) => ({
  backgroundColor: liked ? theme.palette.primary.main : 'transparent',
  color: liked ? theme.palette.primary.contrastText : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: liked ? theme.palette.primary.dark : theme.palette.action.hover,
    boxShadow: 'inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff',
  },
}));


const LikeButton = styled(Button)(({ theme, liked }) => ({
  backgroundColor: liked ? theme.palette.primary.main : 'white',
  color: liked ? 'white' : theme.palette.text.primary,
  '&:hover': {
    backgroundColor: liked ? theme.palette.primary.dark : theme.palette.grey[100],
  },
}));

const renderVerificationIcons = (review) => {
  // Colors for ticks and icons
  const lightBlueTick = '#ADD8E6'; // Light blue for email
  const deepBlueTick = review.phone_verification_time ? '#1E90FF' : '#B0BEC5'; // Deep blue if verified, gray if not
  const greenTick = review.whatsapp_verification_time ? '#4CAF50' : '#B0BEC5'; // Green if verified, gray if not

  return (
    <Box display="flex" alignItems="center" mt={1} sx={{ marginBottom:'10px' }}>
      {/* Light Blue Tick with Email Icon */}
     
      <VerificationIconWrapper verifiedColor="#1976D2"> {/* Email is always verified */}
        <EmailIcon style={{ color: '#FFFFFF' }} />
      </VerificationIconWrapper>

      {/* Deep Blue Tick with Phone Icon */}
     
      <VerificationIconWrapper verifiedColor={review.phone_verification_time ? colors.callbuttonbg : '#B0BEC5'}>
        <PhoneIcon style={{ color: '#FFFFFF' }} />
      </VerificationIconWrapper>

      {/* Green Tick with WhatsApp Icon */}
     
      <VerificationIconWrapper verifiedColor={review.whatsapp_verification_time ? colors.whatsappbuttonbg : '#B0BEC5'}>
        <WhatsAppIcon style={{ color: '#FFFFFF' }} />
      </VerificationIconWrapper>

      {/* Profile Completion Circular Progress */}
      {review.complete_percentage && (
    <ProfileCompletenessWrapper value={review.complete_percentage}>
          <CircularProgress
            variant="determinate"
            value={review.complete_percentage}
            size={36}
            thickness={4}
            sx={{
              backgroundColor: 'transparent',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <CompletionLabel>{`${Math.round(review.complete_percentage)}%`}</CompletionLabel>
        </ProfileCompletenessWrapper>
      )}
    </Box>
  );
};




const MAX_LENGTH = 300; // Set max length for review comment

const renderReview = (review, isReply = false, handleLike, handleShare, handleReplyClick, handleEditReviewClick) => {
  // Get logged in user ID from storage or cookie
  const loggedInUserId = localStorage.getItem('user_id') || getCookie('user_id');
  
  // Safely compare user IDs, converting both to strings and handling null/undefined cases
  const isReviewAuthor = loggedInUserId && review.user_id && 
    String(review.user_id).trim() === String(loggedInUserId).trim();
	
	  const toggleReadMore = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // Determine if the review text is expanded or truncated
  const isExpanded = expandedReviews[review.review_id];
  const truncatedComment =
    review.review_comment.length > MAX_LENGTH && !isExpanded
      ? review.review_comment.slice(0, MAX_LENGTH) + '...'
      : review.review_comment;
	  
	   const userLoggedIn = localStorage.getItem('loginState') === 'logged_in';

  return (
    <Box mb={isReply ? 0 : 2}>
      <ListItem alignItems="flex-start" disableGutters>
        <ListItemAvatar>
          <Avatar 
            src={review.user_image || undefined}
            imgProps={{
              loading: "lazy",
              decoding: "async",
              fetchpriority: "low"
            }}
          >
            {!review.user_image && (review.reviewer_name?.[0]?.toUpperCase() || 'U')}
          </Avatar>
        </ListItemAvatar>
        <Box flexGrow={1}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box display="flex" alignItems="center">
              <Typography 
                variant="subtitle1" 
                fontWeight="bold"
                sx={{ mr: 1 }}
              >
                {review.reviewer_name || 'Anonymous'}
              </Typography>
              {renderVerificationIcons(review)}
            </Box>
          </Box>

          <Box>
            <Box display="flex" alignItems="center">
              <Rating value={parseFloat(review.rating)} readOnly size="small" />
              <Typography variant="caption" color="text.secondary" ml={1}>
                {new Date(review.review_datetime).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="body1"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              overflowWrap: 'break-word',
              mt: 1,
              mb: 1
            }}
          >
            {truncatedComment}
          </Typography>

          {review.review_comment.length > MAX_LENGTH && (
            <Button 
              onClick={() => toggleReadMore(review.review_id)} 
              size="small"
              sx={{ mb: 1 }}
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </Button>
          )}

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <ReplyActionButton
                startIcon={<AnimatedThumbUpIcon liked={review.liked} />}
                onClick={() => handleLike(review.review_id)}
                size="small"
                liked={review.liked}
              >
                {review.like_count > 0
                  ? `${review.like_count} Like${review.like_count > 1 ? 's' : ''}`
                  : 'Like'}
              </ReplyActionButton>

              {localStorage.getItem('isBusinessOwner') === 'true' && (
                <ReplyActionButton
                  startIcon={<ReplyIcon />}
                  onClick={() => handleReplyClick(review)}
                  size="small"
                  disabled={review.replies && review.replies.length > 0}
                  sx={{
                    opacity: review.replies && review.replies.length > 0 ? 0.5 : 1,
                    '&.Mui-disabled': {
                      color: 'text.secondary',
                    },
                  }}
                >
                  {review.replies && review.replies.length > 0 ? 'Replied' : 'Reply'}
                </ReplyActionButton>
              )}
            </Box>

            {isReviewAuthor && (
              <IconButton 
                onClick={() => handleEditReviewClick(review)} 
                size="small"
                sx={{ p: 0.5 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      </ListItem>
    </Box>
  );
};


  return (
     <Container maxWidth="md" sx={{paddingTop:'20px', backgroundColor:colors.app_primaryBackground, minHeight:'100vh'}}>
      <SummaryPaper elevation={3}>
	  {totalReviews > 0 && (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h3" component="div" fontWeight="bold">
            {overallRating > 0 ? overallRating.toFixed(1) : '0.0'}
          </Typography>
		  
          <Box textAlign="right">
            <Rating 
              value={overallRating}
              readOnly 
              precision={0.1} 
              size="large"
            />
            <Typography variant="body2" color="text.secondary">
              {totalReviews > 0 ? `(${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'})` : '(0 reviews)'}
            </Typography>
          </Box>
		 
        </Box>
          )}
        <Box mb={3}>
          {ratingsDistribution.map(({ rating, count }) => (
            <Box key={rating} display="flex" alignItems="center" mb={0.5}>
              <Typography variant="body2" minWidth={20}>{rating}</Typography>
              <RatingBar 
                value={(count / totalReviews) * 100} 
                sx={{ mx: 1, flexGrow: 1 }} 
              />
              <Typography variant="body2" minWidth={30}>{count}</Typography>
            </Box>
          ))}
        </Box>

	<Box textAlign="center">
	  <Avatar sx={{ width: 60, height: 60, margin: 'auto', bgcolor: 'primary.main' }}>
		<StarBorderIcon fontSize="large" />
	  </Avatar>
	  <Typography variant="body1" mt={1} mb={2}>
		Rate and review
	  </Typography>
	  <Typography variant="body2" color="text.secondary" mb={2}>
		Share your experience to help others
	  </Typography>
	  <Rating
		  key={resetRatingKey}
		  name="simple-controlled"
		  value={newReview.rating}
		  onChange={(event, newValue) => {
			handleRatingClick(newValue);
		  }}
		  size="large"
		/>
	</Box>
      </SummaryPaper>

         {totalReviews > 0 ? (
  <>
<Box mb={2}>
    <Typography variant="h6" gutterBottom>Reviews</Typography>
    <ScrollContainer>
      <FlexToggleButtonGroup
        value={sortBy}
        exclusive
        onChange={handleSortChange}
        aria-label="sort reviews"
      >
        <ToggleButton value="newest" aria-label="newest">
          Newest
        </ToggleButton>
        <ToggleButton value="highest" aria-label="highest rating">
          Highest
        </ToggleButton>
        <ToggleButton value="lowest" aria-label="lowest rating">
          Lowest
        </ToggleButton>
        <ToggleButton value="phone_verification" aria-label="phone verified">
          Phone Verified
        </ToggleButton>
        <ToggleButton value="whatsapp_verification" aria-label="whatsapp verified">
          WhatsApp Verified
        </ToggleButton>
      </FlexToggleButtonGroup>
    </ScrollContainer>
  </Box>
        
{sortedReviews.length > 0 ? (
        <List>
          {sortedReviews.map((review, index) => (
            <React.Fragment key={review.review_id}>
              {renderReview(
                review,
                false,
                handleLike,
                handleShare,
                handleReplyClick,
                handleEditReviewClick
              )}
              {index < sortedReviews.length - 1 && <Divider variant="fullWidth" component="li" />}
            </React.Fragment>
          ))}
        </List>
      ) : (
	  <Box>
        <Box mt={2} textAlign="center">
          <Typography variant="h6">No reviews match the selected filter</Typography>
        </Box>
		<FooterComponent />
		</Box>
      )}
   
    
    {hasMore && sortedReviews.length > 0 && (
      <Box  mb={6} display="flex" justifyContent="center">
        <Button 
          variant="contained" 
          onClick={handleShowMore}
          disabled={loadingMore}
		  sx={{backgroundColor:colors.app_primary}}
        >
          {loadingMore ? 'Loading...' : 'Show More Reviews'}
        </Button>
		
      </Box>

    )}
  </>
) : (
  <Box mt={2} textAlign="center">
    <Typography variant="h6">No reviews to show</Typography>
  </Box>
)}
      <Dialog open={openReviewDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Write a Review</DialogTitle>
		<Box mx={3} mb={-1} mt={-3}>
			<Typography variant="caption" sx={{ color:'red',fontWeight:'600' }}>
			  Rating once given cannot be changed
			</Typography>
		  </Box>
        <DialogContent>
          <Rating
            name="review-rating"
            value={newReview.rating}
            onChange={(event, newValue) => {
              setNewReview(prev => ({ ...prev, rating: newValue }));
            }}
            size="large"
            sx={{ mb: 2 }}
          />
          <TextField
            autoFocus
            margin="dense"
            id="review"
            label="Your Review"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained" color="primary">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
	  
 <Dialog open={openEditReviewDialog} onClose={handleCloseEditReviewDialog} fullWidth maxWidth="sm">
  <DialogTitle>Update your comment</DialogTitle>
  <DialogContent>
   
    <TextField
      autoFocus
      margin="dense"
      id="edit-review"
      label="Your Review"
      type="text"
      fullWidth
      variant="outlined"
      multiline
      rows={4}
      value={editingReview?.review_comment || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditingReview(prev => ({ ...prev, review_comment: newText }));
        if (newText.length < 10) {
          setReviewError('Please enter at least 10 characters');
        } else {
          setReviewError('');
        }
      }}
      error={!!reviewError}
      helperText={reviewError}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseEditReviewDialog}>Cancel</Button>
    <Button onClick={handleSubmitEditReview} variant="contained" color="primary" disabled={!!reviewError}>
      Update Review
    </Button>
  </DialogActions>
</Dialog>
	  
	  <Dialog open={openEditReplyDialog} onClose={handleCloseEditReplyDialog} fullWidth maxWidth="sm">
  <DialogTitle>Edit Reply</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      id="edit-reply"
      label="Your Reply"
      type="text"
      fullWidth
      variant="outlined"
      multiline
      rows={4}
      value={editingReply?.review_comment || ''}
      onChange={(e) => {
        const newText = e.target.value;
        setEditingReply(prev => ({ ...prev, review_comment: newText }));
        if (newText.length < 10) {
          setReplyError('Please enter at least 10 characters');
        } else {
          setReplyError('');
        }
      }}
      error={!!replyError}
      helperText={replyError}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseEditReplyDialog}>Cancel</Button>
    <Button onClick={handleSubmitEditReply} variant="contained" color="primary" disabled={!!replyError}>
      Update Reply
    </Button>
  </DialogActions>
</Dialog>

<Dialog open={openReplyModal} onClose={() => setOpenReplyModal(false)} fullWidth maxWidth="sm">
  <DialogTitle>Reply to Review</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      id="reply"
      label="Your Reply"
      type="text"
      fullWidth
      variant="outlined"
      multiline
      rows={4}
      value={replyText}
      onChange={(e) => setReplyText(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenReplyModal(false)}>Cancel</Button>
    <Button onClick={handleSubmitReply} variant="contained" color="primary">
      Submit Reply
    </Button>
  </DialogActions>
</Dialog>

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
      Please click on the profile icon to login.
    </Typography>
    <Button onClick={handleLogin} sx={{ mt: 2, color: 'red' }}>
      Close
    </Button>
  </Box>
</Modal>


	  
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
      Please Click on the profile icon to login.  {/* Display dynamic message */}
    </Typography>
    <Button onClick={handleLogin} sx={{ mt: 2,color:'red' }}>
      Close
    </Button>
  </Box>
</Modal>


      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <Button color="secondary" size="small" onClick={() => setSnackbarOpen(false)}>
            Close
          </Button>
        }
      />
	  
	    {hasMore && sortedReviews.length > 0 && (
      	 <FooterComponent />
		 
		)}
    </Container>
  );
};

export default ReviewsPage;