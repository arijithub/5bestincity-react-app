import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  IconButton,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { openDB } from 'idb';
import axios from 'axios';
import ListingCard from './components/5best/ListingCard';
import { API_ENDPOINTS } from './config/apiConfigext';
import { BADGE_IMAGE_BASE_URL } from './config/apiConfig';
import { colors } from './theme-styles';
import MetaData from './components/MetaData';

const PinnedBusinesses = () => {
  const [pinnedBusinesses, setPinnedBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearButton, setShowClearButton] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  useEffect(() => {
    fetchPinnedBusinesses();
  }, []);

  useEffect(() => {
    filterBusinesses();
  }, [searchQuery, pinnedBusinesses]);

  const fetchPinnedBusinesses = async () => {
    try {
      const db = await openDB('collectionsDB', 3, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('pins')) {
            const pinsStore = db.createObjectStore('pins', { keyPath: 'dataId' });
            pinsStore.createIndex('byType', 'type');
            pinsStore.createIndex('byTimestamp', 'timestamp');
            pinsStore.createIndex('byAction', 'action');
          }
        }
      });

      const allPins = await db.getAll('pins') || [];
      
      const businessPins = allPins.filter(pin => 
        pin.type === 'business' && 
        pin.dataId && 
        pin.action === 'pin'
      );
      
      const pinnedBusinessDetails = await Promise.all(
        businessPins.map(async (pin) => {
          try {
            const businessId = pin.pinid || pin.dataId.replace('business_', '');
            const response = await axios.get(
              `${API_ENDPOINTS.BUSINESS_DETAILS}?proid=${businessId}`
            );
            
            // Process badge URLs in the response data
            if (response.data && response.data.badgeinfo) {
              response.data.badgeinfo = response.data.badgeinfo.map(badge => ({
                ...badge,
                badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
              }));
            }
            
            return response.data;
          } catch (error) {
            console.error(`Error fetching details for business ${pin.dataId}:`, error);
            return null;
          }
        })
      );

      const validBusinessDetails = pinnedBusinessDetails.filter(business => business !== null);
      setPinnedBusinesses(validBusinessDetails);
      setFilteredBusinesses(validBusinessDetails);
    } catch (error) {
      console.error('Error fetching pinned businesses:', error);
      setPinnedBusinesses([]);
      setFilteredBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterBusinesses = () => {
    if (!searchQuery.trim()) {
      setFilteredBusinesses(pinnedBusinesses);
      return;
    }

    const filtered = pinnedBusinesses.filter(business => {
      const searchText = searchQuery.toLowerCase();
      return (
        business.listdata.business_name.toLowerCase().includes(searchText) ||
        business.listdata.business_description?.toLowerCase().includes(searchText) ||
        business.listdata.business_address?.toLowerCase().includes(searchText)
      );
    });

    setFilteredBusinesses(filtered);
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

  const handleUnpin = async (businessId) => {
    try {
      const db = await openDB('collectionsDB', 3);
      const pinStore = db.transaction('pins', 'readwrite').objectStore('pins');
      const dataId = `business_${businessId}`;
      
      const existingPin = await pinStore.get(dataId);
      
      const pinData = {
        dataId: dataId,
        pinid: businessId,
        type: 'business',
        timestamp: new Date().toISOString(),
        action: 'unpin',
        synced: false,
        synced_at: null,
        metadata: {}
      };

      if (existingPin) {
        await pinStore.put({
          ...existingPin,
          ...pinData
        });
      } else {
        await pinStore.put(pinData);
      }
      
      setPinnedBusinesses(prev => 
        prev.filter(business => business.listdata.listing_id !== businessId)
      );
      setFilteredBusinesses(prev => 
        prev.filter(business => business.listdata.listing_id !== businessId)
      );

      setSnackbarMessage('Business unpinned successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      console.error('Error unpinning business:', error);
      setSnackbarMessage('Error unpinning business');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

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
      //py: { xs: 2, sm: 4 }
    }}>
	<MetaData component="PinnedBusinesses" />
	
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
            Pinned Businesses
          </Typography>
          
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by business name"
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
        </Paper>
	
	
	
      <Container maxWidth="lg">
        {/* Header Section */}
        

        {/* Businesses Grid */}
        <Box sx={{ mb: 4 }}>
          {filteredBusinesses.length === 0 ? (
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
                {searchQuery ? 'No businesses found matching your search' : 'No pinned businesses yet'}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredBusinesses.map((business) => {
                // Process badge URLs for each business
                const processedBusiness = {
                  ...business,
                  badgeinfo: business.badgeinfo?.map(badge => ({
                    ...badge,
                    badge_url: badge.badge_url?.replace(`${BADGE_IMAGE_BASE_URL}`, "")
                  }))
                };

                const hasBadge = processedBusiness.badgeinfo && processedBusiness.badgeinfo.length > 0;

                return (
                  <Grid item xs={12} sm={6} md={4} key={business.listdata.listing_id}>
                    <ListingCard 
                      listingData={processedBusiness}
                      onPinClick={() => handleUnpin(business.listdata.listing_id)}
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
                        cssEase: 'linear'
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
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        minWidth: '120px',
                        borderRadius: '20px',
                        textTransform: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      callButtonStyle={{
                        fontSize: '0.875rem',
                        padding: '8px 16px',
                        minWidth: '120px',
                        borderRadius: '20px',
                        textTransform: 'none',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                      isLoggedIn={true}
                      allowRedirect={hasBadge ? "yes" : "no"}
                      isPinned={true}
                    />
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ 
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PinnedBusinesses;