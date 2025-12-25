import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  IconButton,
  Box,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
  Tooltip,
  styled,
  Snackbar,
  Alert,
} from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ShareIcon from '@mui/icons-material/Share';
import PushPinIcon from '@mui/icons-material/PushPin';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CloseIcon from '@mui/icons-material/Close';
import { DEFAULT_IMAGE_COLLECTION_URL } from '../../config/apiConfigext';
import {
  // Colors and Theme
  colors
} from '../../theme-styles';
import { openDB } from 'idb';
import axios from 'axios';
import { getApiUrl, ENDPOINTS } from '../../config/apiConfigext';

const LikeAnimation = styled('span')(({ theme }) => ({
  display: 'inline-flex',
  '@keyframes likeAnimation': {
    '0%': {
      transform: 'scale(1)',
    },
    '25%': {
      transform: 'scale(1.2) rotate(-15deg)',
    },
    '50%': {
      transform: 'scale(0.95)',
    },
    '75%': {
      transform: 'scale(1.1) rotate(15deg)',
    },
    '100%': {
      transform: 'scale(1)',
    }
  }
}));

const CollectionCard = ({
  item,
  isClicked,
  onCardClick,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [openDescriptionModal, setOpenDescriptionModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    checkInitialState();
  }, [item.data_id]);

  // Add event listener for like status changes
  useEffect(() => {
    const handleLikeStatusChange = (event) => {
      const { collectionId, isLiked } = event.detail;
      if (collectionId === item.data_id) {
        setIsLiked(isLiked);
      }
    };

    window.addEventListener('likeStatusChanged', handleLikeStatusChange);
    return () => {
      window.removeEventListener('likeStatusChanged', handleLikeStatusChange);
    };
  }, [item.data_id]);

  const checkInitialState = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      
      // Check like status
      const likeStore = db.transaction('likes', 'readonly').objectStore('likes');
      const existingLike = await likeStore.get(`current_user_${item.data_id}`);
      setIsLiked(!!existingLike);

      // Check pin status
      const pinStore = db.transaction('pins', 'readonly').objectStore('pins');
      const existingPin = await pinStore.get(item.data_id);
      setIsPinned(existingPin?.action === 'pin');
    } catch (error) {
      console.error('Error checking initial state:', error);
    }
  };

  const handleLikeClick = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const db = await openDB('collectionsDB', 3);
      const userId = 'current_user';
      const likeId = `${userId}_${item.data_id}`;

      // Optimistic UI update
      setIsLiked(!isLiked);

      try {
        const response = await axios.post(getApiUrl(ENDPOINTS.UPDATE_COUNT), {
          collectionId: item.data_id,
          increment: !isLiked
        });

        if (response.data.success) {
          const tx = db.transaction(['likes', 'globalCounts'], 'readwrite');
          const likeStore = tx.objectStore('likes');
          const globalCountsStore = tx.objectStore('globalCounts');

          if (!isLiked) {
            await likeStore.put({
              id: likeId,
              userId,
              collectionId: item.data_id,
              timestamp: new Date().toISOString()
            });
          } else {
            await likeStore.delete(likeId);
          }

          await tx.done;

          // Broadcast the change
          const likeEvent = new CustomEvent('likeStatusChanged', {
            detail: {
              collectionId: item.data_id,
              isLiked: !isLiked
            }
          });
          window.dispatchEvent(likeEvent);
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsLiked(isLiked);
        console.error('Error updating like:', error);
      }
    } catch (error) {
      console.error('Error handling like:', error);
    }
  };

  const handlePinClick = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      
      // Check if pin exists
      const existingPin = await pinStore.get(item.data_id);
      const currentAction = existingPin?.action === 'pin' ? 'unpin' : 'pin';
      
      // Create or update pin entry
      const pinData = {
        dataId: item.data_id,
        pinid: item?.id?.toString() || '',
        type: 'collection',
        timestamp: new Date().toISOString(),
        action: currentAction,
        synced: false,
        synced_at: null,
        metadata: {}
      };

      // Update or add the pin
      await pinStore.put(pinData);

      // Update local state
      setIsPinned(currentAction === 'pin');
      
      // Show snackbar message
      setSnackbarMessage(currentAction === 'pin' ? 'Collection pinned successfully' : 'Collection unpinned successfully');
      setSnackbarOpen(true);

      // Broadcast the change
      const pinEvent = new CustomEvent('pinStatusChanged', {
        detail: {
          collectionId: item.data_id,
          isPinned: currentAction === 'pin'
        }
      });
      window.dispatchEvent(pinEvent);

    } catch (error) {
      console.error('Error handling pin:', error);
      setSnackbarMessage('Error updating pin status');
      setSnackbarOpen(true);
    }
  };

  const handleShareClick = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (navigator.share) {
      navigator.share({
        title: 'Check out this collection!',
        text: 'Take a look at this amazing collection!',
        url: `https://yourapp.com/collections/${item.data_id}`,
      });
    } else {
      alert('Sharing not supported in this browser.');
    }
  };

  const handleCardClick = (e) => {
    if (e.target.closest('.MuiIconButton-root') || 
        e.target.closest('.action-buttons')) {
      return;
    }

    if (item.middle_page === '1') {
	   const scrollPosition = window.pageYOffset;
	   //alert(scrollPosition);
	   sessionStorage.setItem('returnedFromDetails', 'true');
       sessionStorage.setItem('collectionsScrollPosition', scrollPosition.toString());
      window.location.href = `/collections/${item.data_id}`;
      return;
    }

    onCardClick(item.data_id);
    
    const urls = [
      item?.item1,
      item?.item2,
      item?.item3,
      item?.item4,
      item?.item5,
      item?.item6,
      item?.item7,
      item?.item8,
      item?.item9,
      item?.item10,
    ].filter(url => url);

    const concatenatedUrl = urls.join('\\~\\');
    if (concatenatedUrl) {
      if (window.isNativeApp) {
        window.location.href = 'collections:' + concatenatedUrl;
      } else {
        window.open('collections:' + concatenatedUrl, '_blank');
      }
    }
  };

  const truncatedTitle = item.title || '';
  
  const truncatedDescription = item.description?.length > 100 ? 
    `${item.description.slice(0, 100)}...` : 
    item.description;

  const handleExpandClick = (event) => {
    event.stopPropagation();
    setExpanded(!expanded);
  };

  const handleReadMore = (event) => {
    event.stopPropagation();
    setOpenDescriptionModal(true);
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        sx={{
          height: expanded ? 'auto' : '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          boxShadow: isClicked ? 'none' : 3,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: isClicked 
              ? 'none'
              : 6,
            transform: 'scale(1.02)',
          },
          cursor: 'pointer',
          backgroundColor: 'white',
          position: 'relative',
          '&::before': isClicked ? {
            content: '""',
            position: 'absolute',
            top: -8,
            left: -8,
            right: -8,
            bottom: -8,
            borderRadius: 'inherit',
            background: 'transparent',
            animation: 'bulbGlow 2s ease-in-out infinite',
            zIndex: -1,
            pointerEvents: 'none',
          } : {},
          '&::after': isClicked ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 2,
            border: '2px solid rgba(33, 150, 243, 0.6)',
            pointerEvents: 'none',
            animation: 'borderPulse 2s ease-in-out infinite',
          } : {},
          '@keyframes bulbGlow': {
            '0%': {
              boxShadow: `
                0 0 20px 5px rgba(33, 150, 243, 0.3),
                0 0 35px 10px rgba(33, 150, 243, 0.2),
                0 0 55px 15px rgba(33, 150, 243, 0.1),
                inset 0 0 20px 5px rgba(33, 150, 243, 0.1)
              `,
            },
            '50%': {
              boxShadow: `
                0 0 30px 8px rgba(33, 150, 243, 0.4),
                0 0 50px 15px rgba(33, 150, 243, 0.3),
                0 0 70px 20px rgba(33, 150, 243, 0.2),
                inset 0 0 30px 8px rgba(33, 150, 243, 0.2)
              `,
            },
            '100%': {
              boxShadow: `
                0 0 20px 5px rgba(33, 150, 243, 0.3),
                0 0 35px 10px rgba(33, 150, 243, 0.2),
                0 0 55px 15px rgba(33, 150, 243, 0.1),
                inset 0 0 20px 5px rgba(33, 150, 243, 0.1)
              `,
            },
          },
          '@keyframes borderPulse': {
            '0%': {
              borderColor: 'rgba(33, 150, 243, 0.4)',
            },
            '50%': {
              borderColor: 'rgba(33, 150, 243, 0.8)',
            },
            '100%': {
              borderColor: 'rgba(33, 150, 243, 0.4)',
            },
          },
        }}
      >
        <Box 
          display="flex" 
          alignItems="center" 
          padding="6px 8px"
          sx={{ 
            height: '36px',
            width: '100%'
          }}
        >
          <CardMedia
            component="img"
            image={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            fetchpriority="low"
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              marginRight: '4px',
              flexShrink: 0,
              border: '1.5px solid',
              borderColor: colors.default_category_avatar,
            }}
          />
          <Box 
            sx={{ 
              flex: 1,
              maxWidth: 'calc(100% - 30px)',
              overflow: 'hidden',
            }}
          >
            <Typography 
              variant="subtitle1" 
              component="div"
              noWrap={false}
              sx={{ 
                fontSize: '0.70rem',
                lineHeight: '1.9em',
                height: '1.8em',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                textOverflow: 'ellipsis',
                width: '100%',
                margin: 0,
                whiteSpace: 'normal',
                WebkitBoxOrient: 'vertical !important',
                WebkitLineClamp: '2 !important',
                '&::after': {
                  content: 'none',
                }
              }}
            >
              {item.name}
            </Typography>
          </Box>
        </Box>

        <CardMedia
          component="img"
          height="140"
          image={item.featured_image}
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = DEFAULT_IMAGE_COLLECTION_URL;
          }}
          alt={item.title}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          sx={{
            height: '140px',
            objectFit: 'cover',
          }}
        />

        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            '&:last-child': { paddingBottom: '16px' },
          }}
        >
          <Box>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start"
              sx={{ 
                position: 'relative',
                paddingRight: '32px',
                minHeight: '2.4em',
              }}
            >
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  letterSpacing: '0.01em',
                  marginBottom: 1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: expanded ? 'unset' : 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: expanded ? 'clip' : 'ellipsis',
                  flex: 1,
                  transition: 'all 0.3s ease',
                  wordBreak: 'break-word',
                  width: '100%',
                  whiteSpace: 'normal',
                  height: expanded ? 'auto' : '2.4em',
                  padding: '0 2px',
                  hyphens: 'none',
                }}
              >
                {item.title}
              </Typography>
              
              <IconButton
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  handleExpandClick(event);
                }}
                sx={{ 
                  padding: '2px',
                  position: 'absolute',
                  right: 0,
                  top: '2px',
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease',
                  width: '24px',
                  height: '24px',
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.2rem'
                  }
                }}
              >
                <ExpandMoreIcon />
              </IconButton>
            </Box>
            
            {expanded && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: '0.75rem',
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  marginBottom: 1,
                  wordBreak: 'break-word',
                  '& .MuiLink-root': {
                    fontSize: '0.85rem',
                    marginTop: 0.5,
                  }
                }}
              >
                {item.description}
                {item.description?.length > 100 && (
                  <Link
                    component="button"
                    variant="body2"
                    onClick={handleReadMore}
                    sx={{ 
                      display: 'block',
                      marginTop: '4px',
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      }
                    }}
                  >
                    Read More
                  </Link>
                )}
              </Typography>
            )}
          </Box>

          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="space-between" 
            mt="auto"
            className="action-buttons"
            sx={{ height: '48px' }}
          >
            <Tooltip title="Like">
              <IconButton 
                onClick={handleLikeClick}
              >
                <LikeAnimation
                  sx={{
                    animation: isLiked ? 'likeAnimation 0.5s ease-in-out' : 'none',
                    display: 'inline-flex',
                  }}
                >
                  {isLiked ? (
                    <ThumbUpAltIcon 
                      sx={{ 
                        color: 'primary.main',
                        transform: 'scale(1)',
                        transition: 'transform 0.2s ease-in-out',
                      }} 
                    />
                  ) : (
                    <ThumbUpOffAltIcon 
                      sx={{
                        transform: 'scale(1)',
                        transition: 'transform 0.2s ease-in-out',
                      }}
                    />
                  )}
                </LikeAnimation>
              </IconButton>
            </Tooltip>

            <Tooltip title="Share">
              <IconButton onClick={handleShareClick}>
                <ShareIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={isPinned ? "Unpin" : "Pin"}>
              <IconButton onClick={handlePinClick}>
                {isPinned ? (
                  <PushPinIcon sx={{ color: colors.categoryActive }} />
                ) : (
                  <PushPinOutlinedIcon />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
		sx={{ mb:4 }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Dialog
        open={openDescriptionModal}
        onClose={() => setOpenDescriptionModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1
          }
        }}
      >
        <DialogTitle sx={{ pr: 6 }}>
          {item.title}
          <IconButton
            aria-label="close"
            onClick={() => setOpenDescriptionModal(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            {item.description || 'No description available.'}
          </Typography>
        </DialogContent>
      </Dialog>
    </>
  );
};


export default CollectionCard; 