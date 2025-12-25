import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  IconButton,
  Tooltip,
  Stack,
  Chip,
  Fade,
  Paper,
  Modal,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Link,
  Divider,
  Button,
  TextField,
  CircularProgress,
  Alert,
  AlertTitle,
  Autocomplete,
  InputAdornment
} from '@mui/material';
import { Share2, X } from 'lucide-react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import SearchIcon from '@mui/icons-material/Search';
import { API_BASE_URL } from './config/apiConfigext';
import { API_BASE_URL_5best as API_BASE_URL_5best } from './config/apiConfigext';
import MetaData from './components/MetaData';

// Helper function to get cookie
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

const useCategoryMapping = () => {
  const [categoryMapping, setCategoryMapping] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}category_collection_api.php`);
        const data = await response.json();
        if (data.status) {
          const mapping = {};
          data.data.forEach(cat => {
            mapping[cat.sub_category_id] = {
              name: cat.sub_category_name,
              category: cat.category_name
            };
          });
          setCategoryMapping(mapping);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  return categoryMapping;
};

const ViewModal = ({ open, onClose, collection }) => {
  const categoryMapping = useCategoryMapping();
  
  if (!collection) return null;

  // Transform items into collections_url format
  const collectionUrls = [];
  for (let i = 1; i <= 10; i++) {
    const itemKey = `item${i}`;
    if (collection[itemKey]) {
      try {
        const url = collection[itemKey];
        collectionUrls.push({
          id: i,
          url: url,
          domain: url.includes('youtube.com') ? 'YouTube' : new URL(url).hostname,
          title: url.includes('youtube.com') ? 'YouTube Video' : url,
          favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
        });
      } catch (error) {
        console.error(`Error processing ${itemKey}:`, error);
      }
    }
  }

  // Prepare categories
  const categories = collection.category ? 
    collection.category.split(',').map(id => ({
      id,
      name: categoryMapping[id]?.name || 'Unknown',
      category: categoryMapping[id]?.category || 'Unknown Category'
    })) : [];

  const displayCollection = {
    ...collection,
    collections_url: collectionUrls,
    thumbnail: collection.featured_image,
    categories,
    country: collection.country_name,
    region: collection.region,
    language: collection.language,
    tags: Array.isArray(collection.tags) ? collection.tags : [collection.tags].filter(Boolean)
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 3 }
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 3,
          boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
          width: '95%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          '&:focus': { outline: 'none' },
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '3px',
          }
        }}
      >
        {/* Header Image Section */}
        <Box sx={{ position: 'relative' }}>
          <Box
            sx={{
              height: { xs: 200, sm: 300 },
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
              }
            }}
          >
            {displayCollection.thumbnail ? (
              <img
                src={displayCollection.thumbnail}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)'
                }}
              >
                <Share2 size={64} style={{ color: '#1976d2', opacity: 0.7 }} />
              </Box>
            )}
          </Box>

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              '&:hover': { bgcolor: 'white' }
            }}
          >
            <CancelIcon />
          </IconButton>
        </Box>

        {/* Content Section */}
        <Box sx={{ p: { xs: 2, sm: 4 } }}>
          {/* Title & Description */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.3 }}>
              {displayCollection.title || 'Untitled Collection'}
            </Typography>
            {displayCollection.description && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {displayCollection.description}
              </Typography>
            )}
          </Box>

          {/* Info Grid */}
          <Box sx={{ display: 'grid', gap: 3, mb: 4 }}>
            {/* Categories */}
            {displayCollection.categories?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                  borderRadius: 2
              }}
            >
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Categories
              </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {displayCollection.categories.map((category, index) => (
                  <Chip
                    key={index}
                      label={`${category.name} (${category.category})`}
                    size="small"
                    sx={{
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                        fontWeight: 500
                    }}
                  />
                ))}
              </Stack>
            </Paper>
            )}

            {/* Location & Language */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Details
              </Typography>
              <Stack spacing={2}>
                {displayCollection.country && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <PublicIcon sx={{ color: 'action.active' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {displayCollection.country}
                    </Typography>
                  </Box>
                )}
                {displayCollection.region && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <LocationCityIcon sx={{ color: 'action.active' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {displayCollection.region}
                    </Typography>
                  </Box>
                )}
                {displayCollection.language && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Language: {displayCollection.language}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Tags */}
            {displayCollection.tags?.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                  borderRadius: 2
              }}
            >
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Tags
              </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {displayCollection.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'primary.50',
                        color: 'primary.main',
                        fontWeight: 500
                      }}
                    />
                  ))}
              </Stack>
            </Paper>
            )}
          </Box>

          {/* Collection URLs */}
          <Paper
            elevation={0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 4, bgcolor: 'primary.main', borderRadius: '50%' }} />
                Collection URLs
                <Chip
                  label={`${collectionUrls.length} items`}
                  size="small"
                  sx={{
                    ml: 'auto',
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              </Typography>
            </Box>
            <List sx={{ width: '100%', p: 0 }}>
              {collectionUrls.map((url, index) => (
                <ListItem
                  key={url.id}
                  sx={{
                    borderBottom: index < collectionUrls.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                    px: 2.5
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => window.open(url.url, '_blank')}
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.50',
                        '&:hover': {
                          bgcolor: 'primary.100'
                        }
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      src={url.favicon}
                      alt={url.domain}
                      sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.domain}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      </Box>
    </Modal>
  );
};

const EditModal = ({ open, onClose, collection, setCollections }) => {
  const categoryMapping = useCategoryMapping();
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedThumbnail, setEditedThumbnail] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [collectionUrls, setCollectionUrls] = useState([]);

  // Fetch initial data when modal opens
  useEffect(() => {
    if (open && collection) {
      const fetchData = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}user_collection_share.php?data_id=${collection.data_id}`);
          const result = await response.json();
          if (result.status && result.data && result.data.length > 0) {
            const data = result.data[0];
            setEditedTitle(data.title || '');
            setEditedDescription(data.description || '');
            setEditedThumbnail(data.featured_image || '');
            setSelectedTags(Array.isArray(data.tags) ? data.tags : [data.tags].filter(Boolean));
            setSelectedCountry({ id: data.country_id, name: data.country_name });
            
            // Initialize selected regions from the API response
            const regions = data.region ? data.region.split(',').map(region => ({
              name: region.trim()
            })) : [];
            setSelectedRegions(regions);

            // Initialize selected languages from the API response
            if (data.language) {
              const selectedLangs = data.language.split(',').map(lang => lang.trim());
              // Fetch languages first if not already loaded
              if (languages.length === 0) {
                const langResponse = await fetch(`${API_BASE_URL}language.php?country_id=1`);
                const langData = await langResponse.json();
                if (langData.status && langData.data) {
                  setLanguages(langData.data);
                  // Find and set matching languages
                  const matchedLanguages = langData.data.filter(lang => 
                    selectedLangs.includes(lang.language_full_name)
                  );
                  setSelectedLanguages(matchedLanguages);
                }
              } else {
                // Find matching languages from existing languages array
                const matchedLanguages = languages.filter(lang => 
                  selectedLangs.includes(lang.language_full_name)
                );
                setSelectedLanguages(matchedLanguages);
              }
            }

            // Transform items into collection URLs
            const urls = [];
            for (let i = 1; i <= 10; i++) {
              const itemKey = `item${i}`;
              if (data[itemKey]) {
                try {
                  const url = data[itemKey];
                  urls.push({
                    id: i,
                    url: url,
                    domain: url.includes('youtube.com') ? 'YouTube' : new URL(url).hostname,
                    title: url.includes('youtube.com') ? 'YouTube Video' : url,
                    favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`
                  });
                } catch (error) {
                  console.error(`Error processing ${itemKey}:`, error);
                }
              }
            }
            setCollectionUrls(urls);
          }
        } catch (error) {
          console.error('Error fetching collection details:', error);
        }
      };

      fetchData();
    }
  }, [open, collection]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}category_collection_api.php`);
        const data = await response.json();
        if (data.status) {
          const formattedCategories = data.data.map(cat => ({
            id: cat.sub_category_id,
            label: `${cat.sub_category_name} (${cat.category_name})`,
            value: cat.sub_category_id
          }));
          setCategories(formattedCategories);

          // If we have collection data, set the initial selected categories
          if (collection?.category) {
            const selectedIds = collection.category.split(',');
            const selectedCats = formattedCategories.filter(cat => 
              selectedIds.includes(cat.id)
            );
            setSelectedCategories(selectedCats);
          }
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, [collection]);

  // Fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_5best}city.php?cid=1`);
        const data = await response.json();
        const transformedData = data.citydataall.map(city => ({
          country_id: data.country_id,
          country_name: data.country_name,
          state_name: city.state_name,
          city_id: city.city_id,
          city_name: city.city_name
        }));
        setLocationData(transformedData);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };
    fetchLocationData();
  }, []);

  // Fetch languages when country changes
  useEffect(() => {
    const fetchLanguages = async () => {
      if (!selectedCountry) return;
      try {
        const response = await fetch(`${API_BASE_URL}language.php?country_id=1`);
        const data = await response.json();
        if (data.status && data.data) {
          setLanguages(data.data);
        }
      } catch (error) {
        console.error('Error fetching languages:', error);
      }
    };
    fetchLanguages();
  }, [selectedCountry]);

  const handleTagAdd = (value) => {
    if (!value.trim()) return;
    if (!selectedTags.includes(value)) {
      setSelectedTags(prev => [...prev, value]);
    }
    setTagInput('');
  };

  const handleTagDelete = (valueToDelete) => {
    setSelectedTags(selectedTags.filter(value => value !== valueToDelete));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd(e.target.value);
    }
  };

  const getUniqueCountries = () => {
    if (!locationData?.length) return [];
    const uniqueCountries = [...new Set(locationData.map(item => item.country_name))];
    return uniqueCountries.map(countryName => ({
      id: locationData.find(item => item.country_name === countryName)?.country_id,
      name: countryName
    }));
  };

  const handleSave = async () => {
    if (!selectedCountry) {
      setValidationError('Please select a country to continue');
      return;
    }

    if (!selectedCategories.length) {
      setValidationError('Please select at least one category to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const userId = getCookie('user_id');
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('collection_id', collection.id);
      formData.append('data_id', collection.user_colc_data_id);
      formData.append('title', editedTitle);
      formData.append('description', editedDescription);
      formData.append('thumbnail', editedThumbnail);
      formData.append('tags', selectedTags.join(','));
      formData.append('categories', selectedCategories.map(cat => cat.id).join(','));
      formData.append('country_id', selectedCountry?.id || '');
      formData.append('country', selectedCountry?.name || '');
      formData.append('mode', 'edit');

      // Format regions as comma-separated string of region names
      if (selectedRegions.length > 0) {
        const formattedRegions = selectedRegions
          .map(region => region.name)
          .join(',');
        formData.append('regions', formattedRegions);
      }

      // Format languages as comma-separated string of language_full_name
      if (selectedLanguages.length > 0) {
        const formattedLanguages = selectedLanguages
          .map(lang => lang.language_full_name)
          .join(',');
        formData.append('language', formattedLanguages);
      }

      // Add collection URLs
      collectionUrls.forEach((urlData, index) => {
        if (index < 10) {
          formData.append(`item${index + 1}`, urlData.url);
        }
      });

      const response = await fetch(`${API_BASE_URL}share_collections.php`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.message === "success") {
        // Refresh the collections list after successful update
        const refreshResponse = await fetch(`${API_BASE_URL}user_collection_share.php?user_id=${userId}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.status && refreshData.data) {
          const sharedCollections = refreshData.data
            .filter(c => c.shared === "1")
            .map(collection => ({
              ...collection,
              data_id: collection.id
            }));
          setCollections(sharedCollections);
        }
        onClose();
      } else {
        throw new Error('Failed to update collection');
      }
    } catch (error) {
      console.error('Error updating collection:', error);
      setValidationError(error.message || 'Failed to update collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show validation error modal
  if (validationError) {
  return (
    <Modal
        open={!!validationError}
        onClose={() => setValidationError(null)}
      sx={{
        display: 'flex',
        alignItems: 'center',
          justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
            borderRadius: 2,
            p: 3,
            maxWidth: 400,
            width: '90%',
          position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid',
            borderColor: 'error.light',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #ef5350, #f44336)'
            }
          }}
        >
          <Alert 
            severity="error"
            variant="filled"
            sx={{
              boxShadow: 'none',
              bgcolor: 'error.light',
              '& .MuiAlert-icon': {
                fontSize: '2rem'
              }
            }}
          >
            <AlertTitle sx={{ fontWeight: 600, mb: 1 }}>
              Validation Error
            </AlertTitle>
            {validationError}
          </Alert>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={() => setValidationError(null)}
              variant="contained"
                sx={{
                bgcolor: 'error.main',
                '&:hover': {
                  bgcolor: 'error.dark'
                }
              }}
            >
              Got it
            </Button>
              </Box>
          </Box>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box 
        sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          maxWidth: 600,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          m: 2,
          '&:focus': {
            outline: 'none'
          },
          position: 'relative'
        }}
      >
          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
            '&:hover': { bgcolor: 'white' },
            zIndex: 1
            }}
          >
            <CancelIcon />
          </IconButton>

        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Edit Collection
            </Typography>

                  <TextField
                    fullWidth
          label="Title"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          sx={{ mb: 3 }}
          placeholder="Enter collection title"
                    variant="outlined"
        />

                  <TextField
                    fullWidth
          label="Description"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
                    multiline
          rows={4}
          sx={{ mb: 3 }}
          placeholder="Enter collection description"
                    variant="outlined"
        />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Featured Image
          </Typography>
          <TextField
            fullWidth
                    size="small"
            value={editedThumbnail}
            onChange={(e) => setEditedThumbnail(e.target.value)}
            placeholder="Enter image URL"
            sx={{ mb: 2 }}
            variant="outlined"
          />
          <Box
                    sx={{
              width: '100%',
              height: 200,
              borderRadius: 1,
              overflow: 'hidden',
              bgcolor: 'grey.100',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed',
              borderColor: 'divider',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                '& .preview-overlay': {
                  opacity: 1
                }
              }
            }}
          >
            {editedThumbnail ? (
              <>
                <img
                  src={editedThumbnail}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <Box
                  className="preview-overlay"
            sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    color: 'white'
                  }}
                >
                  <Typography variant="body2">
                    Click to change image
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Click to add featured image
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
                Categories
              </Typography>
          <Autocomplete
            multiple
            value={selectedCategories}
            onChange={(event, newValue) => setSelectedCategories(newValue)}
            options={categories}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select categories"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={option.id}
                  label={option.label}
                  {...getTagProps({ index })}
                sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              ))
            }
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Location
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              value={selectedCountry}
              onChange={(event, newValue) => {
                setSelectedCountry(newValue);
                setSelectedRegions([]);
              }}
              options={getUniqueCountries()}
              getOptionLabel={(option) => option?.name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  placeholder="Select country"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PublicIcon sx={{ color: 'action.active', mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    )
                  }}
                />
              )}
            />

            {/* Group regions by state */}
            {selectedCountry && (
              <Box>
                <Autocomplete
                  multiple
                  value={selectedRegions}
                  onChange={(event, newValue) => setSelectedRegions(newValue)}
                  options={locationData
                    .filter(item => item.country_name === selectedCountry?.name)
                    .reduce((acc, item) => {
                      const stateIndex = acc.findIndex(group => group.state === item.state_name);
                      if (stateIndex === -1) {
                        // Create new state group with state as an option
                        acc.push({
                          state: item.state_name,
                          options: [
                            // Add state as a selectable option
                            {
                              id: `state-${item.state_name}`,
                              name: item.state_name,
                              state: item.state_name,
                              isState: true
                            },
                            // Add the first city
                            {
                              id: item.city_id,
                              name: item.city_name,
                              state: item.state_name,
                              isState: false
                            }
                          ]
                        });
                      } else {
                        // Add city to existing state group
                        acc[stateIndex].options.push({
                          id: item.city_id,
                          name: item.city_name,
                          state: item.state_name,
                          isState: false
                        });
                      }
                      return acc;
                    }, [])
                    .flatMap(stateGroup => stateGroup.options)}
                  groupBy={(option) => option.state}
                  getOptionLabel={(option) => option.name}
                  isOptionEqualToValue={(option, value) => option.name === value.name}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.name}
                        label={option.name}
                        onDelete={() => {
                          setSelectedRegions(selectedRegions.filter(r => r.name !== option.name));
                        }}
                        deleteIcon={<X size={16} />}
                        sx={{
                          m: 0.5,
                          '& .MuiChip-deleteIcon': {
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'error.main'
                            }
                          }
                        }}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search regions"
                      placeholder={selectedRegions.length > 0 ? "" : "Search regions"}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <SearchIcon sx={{ color: 'action.active' }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        )
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        py: 1.5,
                        px: 2,
                        ...(option.isState && {
                          fontWeight: 600,
                          bgcolor: 'action.hover'
                        })
                      }}
                    >
                      <Typography variant="body2">
                        {option.name}
                      </Typography>
                    </Box>
                  )}
                  ListboxProps={{
                    sx: {
                      '& .MuiAutocomplete-groupUl': {
                        backgroundColor: 'background.paper',
                        '& .MuiAutocomplete-option': {
                          paddingLeft: 4
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}
          </Stack>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Languages
          </Typography>
          <Autocomplete
            multiple
            value={selectedLanguages}
            onChange={(event, newValue) => setSelectedLanguages(newValue)}
            options={languages}
            getOptionLabel={(option) => option.language_full_name}
            isOptionEqualToValue={(option, value) => option.language_full_name === value.language_full_name}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.language_full_name}
                  label={option.language_full_name}
                  onDelete={() => {
                    setSelectedLanguages(selectedLanguages.filter(lang => 
                      lang.language_full_name !== option.language_full_name
                    ));
                  }}
                  deleteIcon={<X size={16} />}
                  sx={{
                    m: 0.5,
                    '& .MuiChip-deleteIcon': {
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main'
                      }
                    }
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Languages"
                placeholder={selectedLanguages.length > 0 ? "" : "Select languages"}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'action.active' }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  )
                }}
              />
            )}
            renderOption={(props, option) => (
              <Box
                component="li"
                {...props}
                sx={{
                  py: 1.5,
                  px: 2
                }}
              >
                <Typography variant="body2">
                  {option.language_full_name}
                  {option.language_local_name && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        ml: 1,
                        color: 'text.secondary',
                        fontStyle: 'italic'
                      }}
                    >
                      ({option.language_local_name})
                    </Typography>
                  )}
                </Typography>
              </Box>
            )}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
            Tags
          </Typography>
          <Box sx={{ 
                border: '1px solid',
                borderColor: 'divider',
            borderRadius: 1,
            p: 1
          }}>
            <Box sx={{ 
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.5,
              mb: selectedTags.length > 0 ? 1 : 0
            }}>
              {selectedTags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagDelete(tag)}
                  sx={{ 
                    m: 0.5,
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
              <TextField
                fullWidth
                size="small"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add tag"
              helperText="Press Enter to add"
                sx={{
                '& .MuiInputBase-root': {
                  border: 'none',
                  '& fieldset': {
                    border: 'none'
                  }
                  }
                }}
              />
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Collection URLs
          </Typography>
            <Paper
              elevation={0}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              overflow: 'hidden'
              }}
            >
            <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 4, height: 4, bgcolor: 'primary.main', borderRadius: '50%' }} />
                Collection URLs
                <Chip
                  label={`${collectionUrls.length} items`}
                    size="small"
                    sx={{
                    ml: 'auto',
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500
                  }}
                />
                  </Typography>
            </Box>
            <List sx={{ width: '100%', p: 0 }}>
              {collectionUrls.map((url, index) => (
                <ListItem
                  key={url.id}
                  sx={{
                    borderBottom: index < collectionUrls.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                    px: 2
                  }}
                  secondaryAction={
                    <IconButton
                      edge="end"
                    size="small"
                      onClick={() => window.open(url.url, '_blank')}
                    sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.50',
                        '&:hover': {
                          bgcolor: 'primary.100'
                        }
                      }}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      src={url.favicon}
                      alt={url.domain}
                    sx={{
                        width: 24,
                        height: 24,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.title}
                  </Typography>
                        <Typography
                          variant="caption"
                    sx={{
                            color: 'text.secondary',
                            bgcolor: 'action.hover',
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {url.domain}
                        </Typography>
                </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
            </Paper>
          </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
            disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const ViewSharedCollections = () => {
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ show: false, message: '', type: 'success' });
  const [confirmDialog, setConfirmDialog] = useState({ open: false, collection: null });

  // Add confirmation dialog component
  const ConfirmDialog = ({ open, onClose, onConfirm }) => (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
          maxWidth: 400,
          width: '90%',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Confirm Unverify
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          Are you sure you want to unverify this collection? This action cannot be undone.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="error"
            onClick={onConfirm}
          >
            Unverify
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const handleStatusUpdate = async (collection, status) => {
    // If it's an unverify action, show confirmation dialog
    if (status === 'unverified') {
      setConfirmDialog({ open: true, collection });
      return;
    }

    // Proceed with the update
    await updateCollectionStatus(collection, status);
  };

  const updateCollectionStatus = async (collection, status) => {
    try {
      const userId = getCookie('user_id');
      const formData = new FormData();
      formData.append('data_id', collection.user_colc_data_id);
      formData.append('user_id', userId);
      formData.append('status', status);
      formData.append('mode', status === 'verified' ? 'verify' : 'delete');

      const response = await fetch(`${API_BASE_URL}share_collections.php`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.status) {
        // Show success message
        setStatusMessage({
          show: true,
          message: `Collection ${status === 'verified' ? 'verified' : 'unverified'} successfully!`,
          type: 'success'
        });

        // Hide message after 3 seconds
        setTimeout(() => {
          setStatusMessage({ show: false, message: '', type: 'success' });
        }, 3000);

        // If verified, remove the collection from the list
        if (status === 'verified') {
          setCollections(prevCollections => 
            prevCollections.filter(c => c.id !== collection.id)
          );
        } else {
          // Refresh the collections list for unverify action
          const refreshResponse = await fetch(`${API_BASE_URL}user_collection_share.php?user_id=${userId}`);
          const refreshData = await refreshResponse.json();
          if (refreshData.status && refreshData.data) {
            const sharedCollections = refreshData.data
              .filter(c => c.shared === "1")
              .map(collection => ({
                ...collection,
                data_id: collection.id
              }));
            setCollections(sharedCollections);
          }
        }
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating collection status:', error);
      setStatusMessage({
        show: true,
        message: 'Failed to update collection status',
        type: 'error'
      });

      setTimeout(() => {
        setStatusMessage({ show: false, message: '', type: 'error' });
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const userId = getCookie('user_id');
        // Use the new API endpoint
        const response = await fetch(`${API_BASE_URL}collection_verify.php?user_id=${userId}`);
        const data = await response.json();
        if (data.status && data.data) {
          // Transform the data to match the expected format
          const transformedCollections = data.data.map(item => ({
            id: item.data_id,
            user_colc_data_id: item.data_id,
            title: item.title,
            description: item.description,
            thumbnail: item.featured_image,
            created_at: item.created_at,
            collections_url: [
              {
                id: 1,
                url: item.featured_image,
                domain: new URL(item.featured_image).hostname,
                title: item.title,
                favicon: `https://www.google.com/s2/favicons?domain=${new URL(item.featured_image).hostname}`,
              },
            ],
            shared: "1", // Since these are all shared collections
            tags: [], // Initialize empty since not provided in new API
          }));
          setCollections(transformedCollections);
        }
      } catch (error) {
        console.error('Error fetching collections:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleViewClick = async (collection) => {
    try {
      console.log('Viewing collection:', collection);
      const dataId = collection.user_colc_data_id;
      const response = await fetch(`${API_BASE_URL}user_collection_share.php?data_id=${dataId}`);
      const result = await response.json();
      console.log('View response:', result);
      if (result.status && result.data && result.data.length > 0) {
        setSelectedCollection({
          ...collection,
          ...result.data[0]
        });
    setViewModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching collection details:', error);
    }
  };

  const handleEditClick = async (collection) => {
    try {
      const dataId = collection.user_colc_data_id;
      const response = await fetch(`${API_BASE_URL}user_collection_share.php?data_id=${dataId}`);
      const result = await response.json();
      if (result.status && result.data && result.data.length > 0) {
        setSelectedCollection({
          ...collection,
          ...result.data[0]
        });
    setEditModalOpen(true);
      }
    } catch (error) {
      console.error('Error fetching collection details:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)'
      }}>
        <Typography variant="h6" color="text.secondary">Loading collections...</Typography>
      </Box>
    );
  }

  return (
    <>
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
      py: { xs: 2, sm: 4 }
    }}>
        {/* Status Message */}
        <Fade in={statusMessage.show}>
          <Alert
            severity={statusMessage.type}
            sx={{
              position: 'fixed',
              top: 24,
              right: 24,
              left: { xs: 24, sm: 'auto' },
              zIndex: 9999,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              alignItems: 'center',
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircleIcon sx={{ fontSize: 20 }} />
            ) : (
              <CancelIcon sx={{ fontSize: 20 }} />
            )}
            {statusMessage.message}
          </Alert>
        </Fade>
      <MetaData component="ViewSharedCollections" />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ 
          mb: { xs: 3, sm: 5 },
          px: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' }
          }}>
            <Paper
              elevation={0}
              sx={{
                width: { xs: 64, sm: 72 },
                height: { xs: 64, sm: 72 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 4,
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                boxShadow: '0 8px 32px rgba(76,175,80,0.25)',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: 'white' }} />
            </Paper>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800,
                  fontSize: { xs: '1.75rem', sm: '2.5rem' },
                  background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
              >
                My Shared Collections
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {collections?.length || 0} collections shared publicly
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Collections Grid */}
        <Box sx={{ 
          display: 'grid', 
          gap: { xs: 3, sm: 4 }, 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)'
          },
          px: { xs: 2, sm: 0 }
        }}>
          {collections?.map((collection) => (
            <Card
              key={collection.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid',
                borderColor: 'divider',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  transform: { xs: 'none', sm: 'translateY(-8px)' },
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                  borderColor: 'primary.main',
                },
              }}
            >
              {/* Collection Image */}
              <Box
                className="collection-image"
                sx={{
                  height: { xs: 200, sm: 220 },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
                    opacity: 0.8,
                  },
                }}
              >
                {collection.thumbnail ? (
                  <img
                    src={collection.thumbnail}
                    alt=""
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(135deg, #f6f9fc 0%, #eef2f7 100%)',
                    }}
                  >
                    <Share2 
                      size={40}
                      style={{
                        opacity: 0.7,
                        color: '#1976d2'
                      }}
                    />
                  </Box>
                )}

                {/* Collection Stats */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    right: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    zIndex: 1,
                  }}
                >
                  <Chip
                    label={`${collection.collections_url.length} items`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.9)',
                      color: 'primary.main',
                      fontWeight: 600,
                      backdropFilter: 'blur(4px)',
                      '& .MuiChip-label': {
                        px: 1.5,
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Content */}
              <Box 
                sx={{ 
                  p: 2.5,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 1,
                    fontSize: { xs: '1.125rem', sm: '1.25rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    color: 'text.primary',
                    lineHeight: 1.4,
                  }}
                >
                  {collection.title || 'Untitled Collection'}
                </Typography>

                {collection.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      lineHeight: 1.6,
                      mb: 2,
                      fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                    }}
                  >
                    {collection.description}
                  </Typography>
                )}

                {/* Tags */}
                {collection.tags && typeof collection.tags === 'string' && collection.tags.length > 0 && (
                  <Stack 
                    direction="row" 
                    spacing={0.5} 
                    flexWrap="wrap" 
                    sx={{ mb: 'auto', gap: 0.5 }}
                  >
                    {collection.tags.split(',')
                      .filter(tag => tag && tag.trim())
                      .slice(0, 3)
                      .map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag.trim()}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.75rem',
                            bgcolor: 'primary.50',
                            color: 'primary.main',
                            fontWeight: 500,
                            '& .MuiChip-label': {
                              px: 1
                            }
                          }}
                        />
                      ))
                    }
                  </Stack>
                )}

                {/* Status and Actions */}
                <Box sx={{ mt: 3 }}>
                  {/* Status Bar */}
                  <Box 
                    sx={{ 
                      mb: 2,
                      pb: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'success.main',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.8,
                          fontWeight: 600,
                          fontSize: { xs: '0.9375rem', sm: '1rem' },
                          mb: 0.8
                        }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: { xs: 10, sm: 12 },
                            height: { xs: 10, sm: 12 },
                            borderRadius: '50%',
                            bgcolor: 'success.main',
                            position: 'relative',
                            display: 'inline-flex',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              width: '100%',
                              height: '100%',
                              borderRadius: '50%',
                              border: '1px solid',
                              borderColor: 'success.main',
                              animation: 'ripple 2s ease-out infinite',
                              opacity: 0
                            },
                            '@keyframes ripple': {
                              '0%': {
                                transform: 'scale(1)',
                                opacity: 0.5,
                              },
                              '100%': {
                                transform: 'scale(4)',
                                opacity: 0,
                              }
                            }
                          }}
                        />
                        Public
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                          display: 'block',
                          ml: 2.8,
                          fontWeight: 500
                        }}
                      >
                        {new Date().toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5}>
                      <IconButton
                        sx={{
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          color: 'primary.main',
                          '&:hover': {
                            color: 'primary.dark',
                            bgcolor: 'primary.50'
                          }
                        }}
                          onClick={() => handleViewClick(collection)}
                      >
                        <VisibilityIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      </IconButton>
                      <IconButton
                        sx={{
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          color: 'primary.main',
                          '&:hover': {
                            color: 'primary.dark',
                            bgcolor: 'primary.50'
                          }
                        }}
                        onClick={() => handleEditClick(collection)}
                      >
                        <EditIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Action Buttons */}
                  <Stack
                    direction="row"
                    spacing={4}
                    sx={{
                      justifyContent: 'center',
                      mt: 3,
                      mb: 1
                    }}
                  >
                    <IconButton
                        onClick={() => handleStatusUpdate(collection, 'verified')}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'success.50',
                        border: '3px solid',
                        borderColor: 'success.200',
                        color: 'success.main',
                        animation: 'float 3s ease-in-out infinite',
                        position: 'relative',
                        '@keyframes float': {
                          '0%, 100%': {
                            transform: 'translateY(0) scale(1) rotate(0)',
                          },
                          '50%': {
                            transform: 'translateY(-10px) scale(1.05) rotate(5deg)',
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -3,
                          border: '3px solid',
                          borderColor: 'success.200',
                          borderRadius: '50%',
                          animation: 'pulse 2s ease-out infinite',
                        },
                        '@keyframes pulse': {
                          '0%': {
                            transform: 'scale(1)',
                            opacity: 0.5,
                          },
                          '100%': {
                            transform: 'scale(1.5)',
                            opacity: 0,
                          }
                        },
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          bgcolor: 'success.main',
                          color: 'white',
                          transform: 'scale(1.2) rotate(15deg)',
                          boxShadow: `
                            0 0 15px rgba(76,175,80,0.5),
                            0 0 30px rgba(76,175,80,0.3),
                            0 0 45px rgba(76,175,80,0.1)
                          `,
                        },
                        '&:active': {
                          transform: 'scale(0.8) rotate(-15deg)',
                        }
                      }}
                    >
                      <CheckCircleIcon 
                        sx={{ 
                          fontSize: 36,
                          animation: 'wiggle 2s ease-in-out infinite',
                          '@keyframes wiggle': {
                            '0%, 100%': { transform: 'rotate(-5deg)' },
                            '50%': { transform: 'rotate(5deg)' }
                          }
                        }} 
                      />
                    </IconButton>
                    <IconButton
                        onClick={() => handleStatusUpdate(collection, 'unverified')}
                      sx={{
                        width: 60,
                        height: 60,
                        bgcolor: 'error.50',
                        border: '3px solid',
                        borderColor: 'error.200',
                        color: 'error.main',
                        animation: 'floatReverse 3s ease-in-out infinite',
                        position: 'relative',
                        '@keyframes floatReverse': {
                          '0%, 100%': {
                            transform: 'translateY(0) scale(1) rotate(0)',
                          },
                          '50%': {
                            transform: 'translateY(-10px) scale(1.05) rotate(-5deg)',
                          }
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: -3,
                          border: '3px solid',
                          borderColor: 'error.200',
                          borderRadius: '50%',
                          animation: 'pulseError 2s ease-out infinite',
                        },
                        '@keyframes pulseError': {
                          '0%': {
                            transform: 'scale(1)',
                            opacity: 0.5,
                          },
                          '100%': {
                            transform: 'scale(1.5)',
                            opacity: 0,
                          }
                        },
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        '&:hover': {
                          bgcolor: 'error.main',
                          color: 'white',
                          transform: 'scale(1.2) rotate(-15deg)',
                          boxShadow: `
                            0 0 15px rgba(211,47,47,0.5),
                            0 0 30px rgba(211,47,47,0.3),
                            0 0 45px rgba(211,47,47,0.1)
                          `,
                        },
                        '&:active': {
                          transform: 'scale(0.8) rotate(15deg)',
                        }
                      }}
                    >
                      <CancelIcon 
                        sx={{ 
                          fontSize: 36,
                          animation: 'wiggleReverse 2s ease-in-out infinite',
                          '@keyframes wiggleReverse': {
                            '0%, 100%': { transform: 'rotate(5deg)' },
                            '50%': { transform: 'rotate(-5deg)' }
                          }
                        }} 
                      />
                    </IconButton>
                  </Stack>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      </Container>
    </Box>
      <ViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        collection={selectedCollection}
      />
      <EditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        collection={selectedCollection}
        setCollections={setCollections}
      />
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, collection: null })}
        onConfirm={async () => {
          const collection = confirmDialog.collection;
          setConfirmDialog({ open: false, collection: null });
          if (collection) {
            await updateCollectionStatus(collection, 'unverified');
          }
        }}
      />
    </>
  );
};

export default ViewSharedCollections; 