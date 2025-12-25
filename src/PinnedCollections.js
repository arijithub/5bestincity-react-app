import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  IconButton, 
  Grid,
  InputAdornment,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  Switch,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import PushPinIcon from '@mui/icons-material/PushPin';
import { ReactSortable } from "react-sortablejs";
import { openDB } from 'idb';
import axios from 'axios';
import { API_ENDPOINTS, DEFAULT_IMAGE_COLLECTION_URL } from './config/apiConfigext';
import { colors } from './theme-styles';
import CollectionCard from './components/collections/CollectionCard';
import MetaData from './components/MetaData';

const PinnedCollections = () => {
  const [isGridView, setIsGridView] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [pinnedCollections, setPinnedCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearButton, setShowClearButton] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [clickedItem, setClickedItem] = useState(null);

  useEffect(() => {
    fetchPinnedCollections();
  }, []);

  useEffect(() => {
    filterCollections();
  }, [searchQuery, pinnedCollections]);

  // Listen for pin status changes
  useEffect(() => {
    const handlePinStatusChange = (event) => {
      const { collectionId, isPinned } = event.detail;
      if (!isPinned) {
        // Remove the unpinned collection from the list
        setPinnedCollections(prev => prev.filter(c => c.data_id !== collectionId));
        setFilteredCollections(prev => prev.filter(c => c.data_id !== collectionId));
      }
    };

    window.addEventListener('pinStatusChanged', handlePinStatusChange);
    return () => window.removeEventListener('pinStatusChanged', handlePinStatusChange);
  }, []);

  // Add styles for sortable animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sortable-drag {
        opacity: 0.8;
        background: white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      .sortable-ghost {
        opacity: 0.4;
        background: ${colors.app_primary}10;
      }
      .sortable-chosen {
        background: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchPinnedCollections = async () => {
    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readonly').objectStore('pins');
      const pins = await pinStore.getAll();

      // Get all pins regardless of type (excluding default)
      const sortedPins = pins
        .filter(pin => pin.dataId && pin.dataId !== 'default' && pin.action === 'pin')
        .sort((a, b) => {
          if (a.order !== undefined && b.order !== undefined) {
            return a.order - b.order;
          }
          return 0;
        });

      // Extract collection IDs for API call
      const collectionPinIds = sortedPins
        .map(pin => pin.dataId)
        .join(',');

      if (!collectionPinIds) {
        setPinnedCollections([]);
        setLoading(false);
        return;
      }

      const response = await axios.get(`${API_ENDPOINTS.COLLECTIONS}?ids=${collectionPinIds}`);
      
      if (response.data && response.data.collectionsdata) {
        const orderedCollections = sortedPins
          .map(pin => 
            response.data.collectionsdata.find(collection => 
              collection.data_id === pin.dataId
            )
          )
          .filter(Boolean);

        setPinnedCollections(orderedCollections);
        setFilteredCollections(orderedCollections);
      }
    } catch (error) {
      console.error('Error fetching pinned collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCollections = () => {
    if (!searchQuery.trim()) {
      setFilteredCollections(pinnedCollections);
      return;
    }

    const filtered = pinnedCollections.filter(collection =>
      collection.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCollections(filtered);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowClearButton(!!value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowClearButton(false);
  };

  const handleSortEnd = async (newState) => {
    try {
      setFilteredCollections(newState);
      setPinnedCollections(newState);

      const db = await openDB('collectionsDB', 3);
      const tx = db.transaction('pins', 'readwrite');
      const pinStore = tx.objectStore('pins');

      // Get all pins first
      const allPins = await pinStore.getAll();
      
      // Update orders for all pins
      const updates = allPins.map(async (pin) => {
        if (!pin.dataId || pin.dataId === 'default') return;

        // Find position in reordered items
        const newPosition = newState.findIndex(item => item.data_id === pin.dataId);
        
        // Update pin with new order
        await pinStore.put({
          ...pin,
          order: newPosition >= 0 ? newPosition : pin.order
        });
      });

      await Promise.all(updates);
      await tx.done;

    } catch (error) {
      console.error('Error updating pin order:', error);
    }
  };

  const handleCardClick = (collection) => {
    if (collection.middle_page === '1') {
      window.location.href = `/collections/${collection.data_id}`;
    } else {
      const urls = [
        collection.item1,
        collection.item2,
        collection.item3,
        collection.item4,
        collection.item5,
        collection.item6,
        collection.item7,
        collection.item8,
        collection.item9,
        collection.item10
      ].filter(url => url);

      const concatenatedUrl = urls.join('\\~\\');

      if (concatenatedUrl) {
        if (window.isNativeApp) {
          window.location.href = 'collections:' + concatenatedUrl;
        } else {
          window.open('collections:' + concatenatedUrl, '_blank');
        }
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUnpin = async (event, collection) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      
      // Create unpin entry
      const pinData = {
        dataId: collection.data_id,
        pinid: collection.id?.toString() || '',
        type: 'collection',
        timestamp: new Date().toISOString(),
        action: 'unpin',
        synced: false,
        synced_at: null,
        metadata: {}
      };

      // Update the pin
      await pinStore.put(pinData);

      // Broadcast the change
      const pinEvent = new CustomEvent('pinStatusChanged', {
        detail: {
          collectionId: collection.data_id,
          isPinned: false
        }
      });
      window.dispatchEvent(pinEvent);

      // Show success message
      setSnackbar({
        open: true,
        message: 'Collection unpinned successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error handling unpin:', error);
      setSnackbar({
        open: true,
        message: 'Error unpinning collection',
        severity: 'error'
      });
    }
  };



  const ListViewItem = ({ collection }) => (	
	<ListItem
      sx={{
        border: '1px solid #ffffff',
        borderRadius: 2,
        mb: 1,
        p: 2,
        position: 'relative',
        touchAction: 'manipulation',
        cursor: 'grab',
		backgroundColor: colors.secondaryBackground,
        '&:hover': {
          backgroundColor: colors.secondaryBackground,
        },
        '&:active': {
          cursor: 'grabbing',
          backgroundColor: colors.secondaryBackground,
        },
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          touchAction: 'none',
          cursor: 'grab',
          padding: '8px 0px',
         // marginLeft: '-8px',
          borderRadius: '4px',
		  position: 'absolute',
		  left: '-10px',
		  background: '#ffffff',
          '&:active': {
            cursor: 'grabbing',
            backgroundColor: 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <DragIndicatorIcon 
          sx={{ 
            color: 'text.secondary',
            fontSize: '24px'
          }} 
        />
      </Box>

      <Box 
        onClick={(e) => {
          e.stopPropagation();
          handleCardClick(collection);
        }}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          flex: 1,
          gap: 2,
          cursor: 'pointer',
		  //paddingTop: '20px',
        }}
      >
        <CardMedia
          component="img"
          image={collection.featured_image || DEFAULT_IMAGE_COLLECTION_URL}
          alt={collection.title}
          sx={{
            width: 60,
            height: 60,
            borderRadius: '8px',
            objectFit: 'cover',
            border: '1px solid',
            borderColor: 'divider'
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = DEFAULT_IMAGE_COLLECTION_URL;
          }}
        />
        
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="subtitle1"
            sx={{
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '4px'
            }}
          >
            {collection.title}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontSize: '0.75rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {collection.description}
          </Typography>
        </Box>
      </Box>

      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          handleUnpin(e, collection);
        }}
        sx={{
		  position: 'absolute',
		  right: '-15px',
		  padding: '5px',
          borderRadius: '40px',
		  background: '#ffffff',
		  border: '4px solid #f8fafc',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 1)'
          }
        }}
      >
        <PushPinIcon sx={{ color: colors.app_primary, fontSize: '1.2rem', }} />
      </IconButton>
    </ListItem>
  );

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)' }}
      >
        <CircularProgress sx={{ color: colors.app_primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: colors.primaryBackground,
      // py: { xs: 2, sm: 4 }
    }}>
	<MetaData component="PinnedCollections" />
	
	<Paper
          elevation={0}
        sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 1100,
            mb: 4,
			p: 2,
            borderRadius: 0,
            background: colors.primaryBackground,
            backdropFilter: 'blur(10px)',
			display: 'flex',
			flexDirection: 'column',
			gap: '10px',
			width: '100%',
			// borderBottom: '1px solid',
			// borderColor: 'divider',
        }}
      >
        
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: colors.app_primary,
				textAlign: 'center',
                fontSize: { xs: '1.5rem', sm: '2rem' }
              }}
            >
            Pinned Collections
          </Typography>
          
        
        
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name or category"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: showClearButton && (
              <InputAdornment position="end">
                <IconButton onClick={handleClearSearch} size="small">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '40px',
              backgroundColor: '#fff',
              '&.Mui-focused': {
                borderColor: colors.app_primary,
                boxShadow: `0 0 0 2px ${colors.app_primary}20`,
              },
            },
          }}
        />
		
		
				<Box sx={{ 
    display: 'flex', 
    alignItems: 'center',
    borderRadius: '40px',  // Increased radius to match image
    backgroundColor: 'white', // Changed to white background
    padding: '4px',
    width: 'fit-content',
	margin: '0px auto',
    //boxShadow: '0 2px 8px rgba(0,0,0,0.05)' // Added subtle shadow
}}>
    <Box
        onClick={() => setIsGridView(true)}
        sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '32px',
            cursor: 'pointer',
            backgroundColor: isGridView ? '#f0f7ff' : 'transparent',
            transition: 'all 0.2s ease',
            gap: '8px'
        }}
    >
        <ViewModuleIcon 
            sx={{ 
                color: isGridView ? colors.app_primary : 'text.secondary',
                fontSize: '20px'
            }}
        />
        <Typography
            sx={{
                color: isGridView ? colors.app_primary : 'text.secondary',
                fontSize: '14px',
                fontWeight: isGridView ? 600 : 400
            }}
        >
            Grid View
        </Typography>
    </Box>

    <Box
        onClick={() => setIsGridView(false)}
        sx={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 16px',
            borderRadius: '32px',
            cursor: 'pointer',
            backgroundColor: !isGridView ? '#f0f7ff' : 'transparent',
            transition: 'all 0.2s ease',
            gap: '8px'
        }}
    >
        <ViewListIcon 
            sx={{ 
                color: !isGridView ? colors.app_primary : 'text.secondary',
                fontSize: '20px'
            }}
        />
        <Typography
            sx={{
                color: !isGridView ? colors.app_primary : 'text.secondary',
                fontSize: '14px',
                fontWeight: !isGridView ? 600 : 400
            }}
        >
            List View
        </Typography>
		
		
		
    </Box>
</Box>
		
		
        </Paper>
		
	
	
	
    <Container maxWidth="lg">

		<Typography 
            sx={{
                fontSize: '1rem',
                fontWeight: 400,
				margin: '5px auto',
				color: '#888',
            }}
        >
            Press and hold the ⠿ icon to re-arrange the cards in List View
        </Typography>

      {filteredCollections.length === 0 ? (
          <Paper
            elevation={0}
          sx={{ 
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Typography color="text.secondary" variant="h6">
              {searchQuery ? 'No collections found matching your search' : 'No pinned collections yet'}
          </Typography>
          </Paper>
      ) : isGridView ? (
        <Grid container spacing={2} sx={{ mt: 2, pb: 4 }}>
          {filteredCollections.map((collection) => (
              <Grid item xs={6} sm={6} md={4} key={collection.data_id}>
                <CollectionCard
                  item={collection}
                  isClicked={clickedItem === collection.data_id}
                  onCardClick={() => handleCardClick(collection)}
                />
            </Grid>
          ))}
        </Grid>
      ) : (
        <List sx={{ mt: 2, pb: 4 }}>
          <ReactSortable
            list={filteredCollections}
            setList={handleSortEnd}
            animation={200}
            delayOnTouchStart={true}
            delay={2}
            dragClass="sortable-drag"
            ghostClass="sortable-ghost"
            chosenClass="sortable-chosen"
          >
            {filteredCollections.map((collection) => (
              <div key={collection.data_id}>
                <ListViewItem collection={collection} />
              </div>
            ))}
          </ReactSortable>
        </List>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
            sx={{ 
              width: '100%',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
    </Box>
  );
};

export default PinnedCollections;