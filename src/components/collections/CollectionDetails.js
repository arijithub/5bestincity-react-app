import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Container, Avatar, Button, CircularProgress, keyframes } from '@mui/material';
import axios from 'axios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import PushPinIcon from '@mui/icons-material/PushPin';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { getApiUrl, ENDPOINTS,API_BASE_URL,DEFAULT_IMAGE_BASE_URL } from '../../config/apiConfigext';
import FooterComponent from '../../FooterComponent';
import { openDB } from 'idb';
import { Snackbar, Alert } from '@mui/material';
import MetaData from '../../components/MetaData';
import {
  // Colors and Theme
  colors
} from '../../theme-styles';

// Add animation keyframes
const likeAnimation = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  15% {
    transform: scale(1.2);
    opacity: 0.9;
  }
  30% {
    transform: scale(0.95);
    opacity: 0.95;
  }
  45% {
    transform: scale(1.1);
    opacity: 1;
  }
  60% {
    transform: scale(0.98);
    opacity: 0.95;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const rippleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(2);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const pinAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
`;

const shareAnimation = keyframes`
  0% { transform: scale(1) rotate(0); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

const thumbAnimation = keyframes`
  0% {
    transform: scale(1) translateY(0);
  }
  25% {
    transform: scale(1.2) translateY(-2px);
  }
  50% {
    transform: scale(0.9) translateY(1px);
  }
  75% {
    transform: scale(1.1) translateY(-1px);
  }
  100% {
    transform: scale(1) translateY(0);
  }
`;

const styles = {
  root: {
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
  },
  headerContainer: {
    backgroundColor: 'transparent',
    color: colors.primaryText,
    position: 'relative',
    padding: '16px',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'white',
    cursor: 'pointer',
  },
  creatorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
  },
  creatorInfo: {
    display: 'flex',
    flexDirection: 'column',
    ml: 1,
  },
  creatorName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: colors.primaryText,
  },
  creatorStats: {
    fontSize: '0.8rem',
    color: colors.secondaryText,
  },
  featuredImageContainer: {
    width: '100%',
    height: '200px',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredImage: {
    width: '90%',
    height: '90%',
    objectFit: 'cover',
    borderRadius: '10px',
  },
  collectionNameContainer: {
    padding: '16px',
    backgroundColor: 'transparent',
    color: colors.primaryText,
  },
  collectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 500,
    color: colors.primaryText,
    marginBottom: '8px',
  },
  actionsContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '12px',
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    color: colors.primaryText,
    cursor: 'pointer',
  },
  actionIcon: {
    fontSize: '24px',
    height: '50px',
    width: '50px',
    marginBottom: '4px',
    backgroundColor: '#00000010',
    borderRadius: '50px',
    padding: '10px',
  },
  actionText: {
    fontSize: '0.8rem',
    color: colors.secondaryText,
  },
  statsContainer: {
    display: 'flex',
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 8px',
  },
  statsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: '#00000010',
    borderRadius: '10px',
    padding: '10px',
  },
  statsLabel: {
    fontSize: '0.75rem',
    color: colors.secondaryText,
    textTransform: 'uppercase',
  },
  statsValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: colors.primaryText,
    fontSize: '0.9rem',
  },
  divider: {
    width: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',

  },
  scrollSection: {
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: '0.75rem',
    color: colors.secondaryText,
    textTransform: 'uppercase',
    marginBottom: '12px',
    paddingLeft: '16px',
    paddingTop: '16px',
  },
  scrollContainer: {
    display: 'flex',
    overflowX: 'auto',
    gap: '8px',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '-ms-overflow-style': 'none',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '16px',
  },
  categoryChip: {
    backgroundColor: '#00000010',
    color: colors.primaryText,
    padding: '6px 12px',
    borderRadius: '16px',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
  },
  tagChip: {
    backgroundColor: 'transparent',
    color: colors.secondaryText,
    padding: '6px 12px',
    borderRadius: '16px',
    whiteSpace: 'nowrap',
    fontSize: '0.9rem',
  },
  metaContainer: {
    display: 'flex',
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '6px 8px',
  },
  metaSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: '#00000010',
    borderRadius: '10px',
    padding: '10px',
  },
  metaLabel: {
    fontSize: '0.75rem',
    color: colors.secondaryText,
    textTransform: 'uppercase',
  },
  metaValue: {
    color: colors.primaryText,
    fontSize: '0.9rem',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
  },
  metaDivider: {
    width: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: '0 4px',
  },
  linkSection: {
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px',
  },
  faviconContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingLeft: '8px',
  },
  faviconStack: {
    display: 'flex',
    alignItems: 'center',
  },
  favicon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    marginRight: '-8px', // Creates overlapping effect
    border: '2px solid #00000010',
  },
  moreCount: {
    backgroundColor: '#00000010',
    color: colors.primaryText,
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    marginLeft: '4px',
  },
  descriptionSection: {
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '8px',
  },
  descriptionText: {
    color: colors.secondaryText,
    fontSize: '0.9rem',
    lineHeight: '1.5',
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  primaryActionContainer: {
    position: 'fixed',
    bottom: '50px',
    left: '0',
    right: '0',
    padding: '16px',
    backgroundColor: 'transparent',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
  },
  primaryActionButton: {
    backgroundColor: colors.primary,
    color: 'white',
    fontSize: '18px',
    padding: '12px 24px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
    cursor: 'pointer',
    textTransform: 'none',
    '&:hover': {
      backgroundColor: '#1976d2',
    },
  },
  footerComponent: {
    backgroundColor: 'transparent',
	paddingBottom: '120px'
  },
};

const formatLanguages = (languageString) => {
  return languageString.split(',').map(lang => lang.trim()).join(', ');
};

const getLocation = (region, country) => {
  if (region) return region;
  if (country) return country;
  return 'N/A';
};

const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

const getValidItems = (collection) => {
  return Object.keys(collection)
    .filter(key => key.startsWith('item') && collection[key])
    .map(key => collection[key]);
};

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (e) {
    return null;
  }
};

const fetchGlobalCounts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}${ENDPOINTS.GET_COUNTS}`);
    return response.data.counts || {};
  } catch (error) {
    console.error('Error fetching global counts:', error);
    return {};
  }
};

const CollectionDetails = () => {
  const { id } = useParams(); // Get the collection ID from URL
  const navigate = useNavigate();
  const [collectionData, setCollectionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [likedItems, setLikedItems] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  useEffect(() => {
    const initializeLikeStatus = async () => {
      try {
        const db = await openDB('collectionsDB', 3);
        const userId = 'current_user';
        const likeId = `${userId}_${id}`;

        // Check if collection is liked
        const tx = db.transaction(['likes', 'globalCounts'], 'readonly');
        const likeStore = tx.objectStore('likes');
        const globalCountsStore = tx.objectStore('globalCounts');

        const [like, globalCount] = await Promise.all([
          likeStore.get(likeId),
          globalCountsStore.get(id)
        ]);

        setIsLiked(!!like);
        setLikeCount(globalCount?.count || 0);
      } catch (error) {
        console.error('Error initializing like status:', error);
      }
    };

    if (id) {
      initializeLikeStatus();
    }
  }, [id]);

  useEffect(() => {
    const initializeAndFetchData = async () => {
      try {
        const db = await openDB('collectionsDB', 3);
        
        // First fetch all data in parallel
        const [apiResponse, globalCountsResponse] = await Promise.all([
          axios.get(getApiUrl(ENDPOINTS.COLLECTIONS_DETAILS, `data_id=${id}`)),
          fetchGlobalCounts()
        ]);

        if (apiResponse.data.status === 'success') {
          setCollectionData(apiResponse.data.data);
          
          // Get the user ID
          const userId = 'current_user';
          const likeId = `${userId}_${id}`; // Consistent like ID format
          
          // Check likes and pins in IndexedDB
          const tx = db.transaction(['likes', 'pins', 'globalCounts'], 'readonly');
          const likeStore = tx.objectStore('likes');
          const pinStore = tx.objectStore('pins');
          
          // Get like status and pin status
          const [likeStatus, pinStatus] = await Promise.all([
            likeStore.get(likeId),
            pinStore.get(id)
          ]);

          // Set initial states
          setIsLiked(!!likeStatus);
          setIsPinned(pinStatus?.action === 'pin'); // Check for action === 'pin'
          
          // Get and set like count
          const apiCount = apiResponse.data.data.collection.like_count || 0;
          const globalCount = globalCountsResponse[id] || apiCount;
          setLikeCount(globalCount);

          // Update global count in IndexedDB if needed
          if (globalCount !== apiCount) {
            const countTx = db.transaction('globalCounts', 'readwrite');
            const globalCountsStore = countTx.objectStore('globalCounts');
            await globalCountsStore.put({
              collectionId: id,
              count: globalCount,
              lastUpdated: new Date().toISOString()
            });
          }

        } else {
          throw new Error('Failed to fetch collection details');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load collection details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initializeAndFetchData();
    }
  }, [id]);

  // Add periodic refresh of global counts
  useEffect(() => {
    const refreshGlobalCount = async () => {
      try {
        const globalCounts = await fetchGlobalCounts();
        const currentCount = globalCounts[id];
        
        if (typeof currentCount === 'number') {
          const db = await openDB('collectionsDB', 3);
          const tx = db.transaction('globalCounts', 'readwrite');
          const store = tx.objectStore('globalCounts');
          
          await store.put({
            collectionId: id,
            count: currentCount,
            lastUpdated: new Date().toISOString()
          });
          
          await tx.done;
          setLikeCount(currentCount);
        }
      } catch (error) {
        console.error('Error refreshing global count:', error);
      }
    };

    const intervalId = setInterval(refreshGlobalCount, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [id]);

  const handleLike = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const userId = 'current_user';
      const likeId = `${userId}_${id}`;

      // Optimistic UI update
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setLikeCount(prev => prev + (newIsLiked ? 1 : -1));

      try {
        // Update backend first
        const response = await axios.post(`${API_BASE_URL}${ENDPOINTS.UPDATE_COUNT}`, {
          collectionId: id,
          increment: newIsLiked
        });

        if (response.data.success) {
          // If backend update successful, update local stores
          const tx = db.transaction(['likes', 'globalCounts'], 'readwrite');
          const likeStore = tx.objectStore('likes');
          const globalCountsStore = tx.objectStore('globalCounts');

          // Get current global count within transaction
          const currentGlobalCount = await globalCountsStore.get(id) || { count: 0 };
          const newCount = newIsLiked ? (currentGlobalCount.count || 0) + 1 : Math.max(0, (currentGlobalCount.count || 1) - 1);

          // Update UI with new count
          setLikeCount(newCount);

          // Dispatch event for other components
          const likeEvent = new CustomEvent('likeStatusChanged', {
            detail: {
              collectionId: id,
              isLiked: newIsLiked,
              count: newCount
            }
          });
          window.dispatchEvent(likeEvent);

          // Update stores within the same transaction
          if (newIsLiked) {
            await likeStore.put({
              id: likeId,
              userId,
              collectionId: id,
              timestamp: new Date().toISOString()
            });
          } else {
            await likeStore.delete(likeId);
          }

          await globalCountsStore.put({
            collectionId: id,
            count: newCount,
            lastUpdated: new Date().toISOString()
          });

          // Wait for transaction to complete
          await tx.done;

          setSnackbarMessage(newIsLiked ? 'Collection liked successfully' : 'Collection unliked');
          setSnackbarSeverity('success');
        } else {
          throw new Error('Backend update failed');
        }
      } catch (error) {
        console.error('Error updating backend:', error);
        // Revert optimistic updates on backend failure
        setIsLiked(!newIsLiked);
        setLikeCount(prev => prev - (newIsLiked ? 1 : -1));
        setSnackbarMessage('Error updating like status');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error handling like:', error);
      setSnackbarMessage('Error updating like status');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handlePin = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      
      // Check if pin exists
      const existingPin = await pinStore.get(id);
      const currentAction = existingPin?.action === 'pin' ? 'unpin' : 'pin';
      
      // Find the collection to get its id
      const collection = collectionData?.collection;
      
      // Create or update pin entry
      const pinData = {
        dataId: id,
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

      // Update UI state
      setIsPinned(currentAction === 'pin');
      
      setSnackbarMessage(currentAction === 'pin' ? 'Collection pinned successfully' : 'Collection unpinned');
      setSnackbarSeverity('success');

    } catch (error) {
      console.error('Error handling pin:', error);
      setSnackbarMessage('Error updating pin status');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: collectionData?.collection?.title || 'Check out this collection!',
        text: collectionData?.collection?.description || 'Take a look at this amazing collection!',
        url: window.location.href,
      })
      .then(() => {
        setSnackbarMessage('Collection shared successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        setSnackbarMessage('Error sharing collection');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setSnackbarMessage('Link copied to clipboard');
          setSnackbarSeverity('success');
          setSnackbarOpen(true);
        })
        .catch(() => {
          setSnackbarMessage('Error copying link');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    }
  };

const handleBack = () => {
  // Convert boolean to string for sessionStorage
  sessionStorage.setItem('returnedFromDetails', 'true');
  navigate(-1);
};


  
  
  useEffect(() => {
    const handleLikeStatusChange = (event) => {
      const { collectionId, isLiked, count } = event.detail;
      
      // Only update if this is the current collection being viewed
      if (collectionId === id) {
        setIsLiked(isLiked);
        setLikeCount(count);
      }
    };

    window.addEventListener('likeStatusChanged', handleLikeStatusChange);

    return () => {
      window.removeEventListener('likeStatusChanged', handleLikeStatusChange);
    };
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!collectionData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>No collection data found</Typography>
      </Box>
    );
  }

  const { creator, collection } = collectionData;

  return (
    <Box sx={styles.root}>
	<MetaData 
		  component="CollectionDetails"
		  collectionData={collectionData}
		/>
      <Box sx={styles.headerContainer}>
        <ArrowBackIcon 
          sx={styles.backButton} 
          onClick={handleBack}
        />
        <Box sx={styles.creatorBox}>
          <Avatar 
            src={creator.image} 
            alt={creator.name}
            sx={styles.creatorAvatar}
            imgProps={{
              loading: "lazy",
              decoding: "async",
              fetchpriority: "low"
            }}
          />
          <Box sx={styles.creatorInfo}>
            <Typography sx={styles.creatorName}>
              {creator.name}
            </Typography>
            <Typography sx={styles.creatorStats}>
              {[
                creator.followers && `${formatNumber(parseInt(creator.followers))} followers`,
                creator.public_collection_count && `${formatNumber(parseInt(creator.public_collection_count))} public collections`
              ].filter(Boolean).join(' • ')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={styles.featuredImageContainer}>
       <img 
          src={collection.featured_image || DEFAULT_IMAGE_BASE_URL}
          alt={collection.title}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = DEFAULT_IMAGE_BASE_URL;
          }}
          style={styles.featuredImage}
        />
      </Box>

      <Box sx={styles.collectionNameContainer}>
        <Typography sx={styles.collectionTitle}>
          {collection.title}
        </Typography>
      </Box>

      <Box sx={styles.actionsContainer}>
        <Box 
          sx={{
            ...styles.actionButton,
            position: 'relative',
            overflow: 'hidden',
            '&::after': isLiked ? {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '20px',
              height: '20px',
              backgroundColor: `${colors.app_primary}40`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%) scale(0)',
              animation: `${rippleAnimation} 0.6s ease-out`,
            } : {},
            '& .MuiSvgIcon-root': {
              animation: isLiked ? `${likeAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)` : 'none',
              color: isLiked ? colors.app_primary : 'inherit',
              transition: 'color 0.3s ease, transform 0.2s ease',
              transform: isLiked ? 'scale(1)' : 'scale(1)',
              '&:hover': {
                transform: 'scale(1.1)',
              },
              '& path': {
                animation: isLiked ? `${thumbAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)` : 'none',
                transformOrigin: 'center',
              }
            },
            '&:hover': {
              '& .MuiSvgIcon-root': {
                color: isLiked ? colors.app_primary : colors.app_primary_light,
                '& path': {
                  transform: 'scale(1.1) translateY(-1px)',
                  transition: 'transform 0.2s ease',
                }
              }
            }
          }}
          onClick={handleLike}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiSvgIcon-root': {
                '& path': {
                  transformOrigin: 'center',
                  transition: 'transform 0.2s ease',
                }
              }
            }}
          >
            {isLiked ? (
              <ThumbUpIcon 
                sx={{
                  ...styles.actionIcon,
                  color: colors.app_primary,
                  position: 'relative',
                  zIndex: 2,
                  '& path': {
                    animation: `${thumbAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
                  }
                }} 
              />
            ) : (
              <ThumbUpOutlinedIcon 
                sx={{
                  ...styles.actionIcon,
                  position: 'relative',
                  zIndex: 2,
                  '& path': {
                    transition: 'transform 0.2s ease',
                  }
                }} 
              />
            )}
          </Box>
          <Typography 
            sx={{
              ...styles.actionText,
              color: isLiked ? colors.app_primary : 'inherit',
              transition: 'color 0.3s ease',
              position: 'relative',
              zIndex: 2,
            }}
          >
            Like ({likeCount})
          </Typography>
        </Box>

        <Box 
          sx={{
            ...styles.actionButton,
            '& .MuiSvgIcon-root': {
              animation: `${shareAnimation} 0.5s ease-in-out`,
            }
          }}
          onClick={handleShare}
        >
          <ShareIcon sx={styles.actionIcon} />
          <Typography sx={styles.actionText}>Share</Typography>
        </Box>

        <Box 
          sx={{
            ...styles.actionButton,
            '& .MuiSvgIcon-root': {
              animation: isPinned ? `${pinAnimation} 0.5s ease-in-out` : 'none',
              color: isPinned ? colors.app_primary : 'inherit'
            }
          }}
          onClick={handlePin}
        >
          {isPinned ? <PushPinIcon sx={styles.actionIcon} /> : <PushPinOutlinedIcon sx={styles.actionIcon} />}
          <Typography sx={styles.actionText}>Pin</Typography>
        </Box>
      </Box>

      <Box sx={styles.statsContainer}>
        <Box sx={styles.statsSection}>
          <Typography sx={styles.statsLabel}>
            Created
          </Typography>
          <Typography sx={styles.statsValue}>
            {new Date(collection.created_at).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </Typography>
        </Box>

        <Box sx={styles.divider} />

        <Box sx={styles.statsSection}>
          <Typography sx={styles.statsLabel}>
            Likes
          </Typography>
          <Typography 
            sx={{
              ...styles.statsValue,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                '& .MuiSvgIcon-root': {
                  '& path': {
                    transformOrigin: 'center',
                    animation: isLiked ? `${thumbAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)` : 'none',
                  }
                }
              }}
            >
              {isLiked ? (
                <ThumbUpIcon 
                  sx={{ 
                    fontSize: '16px',
                    color: colors.app_primary,
                    animation: `${likeAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
                    '& path': {
                      animation: `${thumbAnimation} 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)`,
                    }
                  }} 
                />
              ) : (
                <ThumbUpOutlinedIcon 
                  sx={{ 
                    fontSize: '16px',
                    '& path': {
                      transition: 'transform 0.2s ease',
                    }
                  }} 
                />
              )}
            </Box>
            {`${likeCount} ${likeCount === 1 ? 'person' : 'people'} liked`}
          </Typography>
        </Box>
      </Box>

      {/* Categories Section */}
      <Box sx={styles.scrollSection}>
        <Typography sx={styles.sectionTitle}>
          Category:
        </Typography>
        <Box sx={styles.scrollContainer}>
          {collection.categories.map((category) => (
            <Box
              key={category.id}
              sx={styles.categoryChip}
            >
              {category.name}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tags Section */}
      <Box sx={styles.scrollSection}>
        <Typography sx={styles.sectionTitle}>
          Tags:
        </Typography>
        <Box sx={styles.scrollContainer}>
          {collection.tags.split(',').map((tag, index) => (
            <Box
              key={index}
              sx={styles.tagChip}
            >
              {`#${tag.trim()}`}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Language and Region Section */}
      <Box sx={styles.metaContainer}>
        <Box sx={styles.metaSection}>
          <Typography sx={styles.metaLabel}>
            Language
          </Typography>
          <Typography sx={styles.metaValue}>
            {formatLanguages(collection.language)}
          </Typography>
        </Box>

        <Box sx={styles.metaDivider} />

        <Box sx={styles.metaSection}>
          <Typography sx={styles.metaLabel}>
            Location
          </Typography>
          <Typography sx={styles.metaValue}>
            {getLocation(collection.region, collection.country)}
          </Typography>
        </Box>
      </Box>

      {/* Link Details Section */}
      <Box sx={styles.linkSection}>
        <Typography sx={styles.sectionTitle}>
          Links
        </Typography>
        <Box sx={styles.faviconContainer}>
          <Box sx={styles.faviconStack}>
            {getValidItems(collection).slice(0, 5).map((url, index) => (
              <img
                key={index}
                src={getFaviconUrl(url)}
                alt={`Site ${index + 1}`}
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                style={styles.favicon}
              />
            ))}
            {getValidItems(collection).length > 5 && (
              <Box sx={styles.moreCount}>
                +{getValidItems(collection).length - 5}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Description Section */}
      <Box sx={styles.descriptionSection}>
        <Typography sx={styles.sectionTitle}>
           Description
        </Typography>
        <Typography sx={styles.descriptionText}>
          {collection.description}
        </Typography>
      </Box>

      {/* Primary Action Button */}
      <Box sx={styles.primaryActionContainer}>
        <Button
          variant="contained"
          sx={styles.primaryActionButton}
          onClick={() => {
            const urls = getValidItems(collection);
            const concatenatedUrl = urls.join('\\~\\');
            if (concatenatedUrl) {
              window.open(`collections:${concatenatedUrl}`, '_blank');
            }
          }}
        >
          Open this collection
        </Button>
      </Box>

      {/* Add margin bottom to prevent content from being hidden behind the fixed button */}
      <Box sx={styles.footerComponent} />
	  
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CollectionDetails;
