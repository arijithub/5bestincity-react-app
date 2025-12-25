import React, { useEffect, useState, useCallback, memo } from 'react';
import { useLogin } from './contexts/LoginContext';
import Tutorial from './Tutorial';





import {
  Card,
  CardContent,
  Typography,
  Box,
  Modal,
  Button,
  CircularProgress,
  Stack,
  Alert,
  AlertTitle,
  IconButton,
  Container,
  Divider,
  Link,
  TextField,
  Chip,
  Paper,
  Autocomplete,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Tooltip,
  InputAdornment,
  Collapse
} from '@mui/material';
import { Share2, X, Blocks, Send, Forward, CircleAlert } from 'lucide-react';
import PublicIcon from '@mui/icons-material/Public';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import MapIcon from '@mui/icons-material/Map';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { API_BASE_URL } from './config/apiConfigext';
import { API_BASE_URL as API_BASE_URL_5best } from './config/apiConfig';
import { Link as RouterLink } from 'react-router-dom';
import MetaData from './components/MetaData';
import { colors } from './theme-styles';



// tutorials section declaration


const tutorials = {
  sharedCollection: [
    './images/tutorial/ShareCollection-Tutorial-1.png',
    './images/tutorial/ShareCollection-Tutorial-2.png',
  ],
  anotherPage: [
    './images/tutorial/ShareCollection-Tutorial-1.png',
    './images/tutorial/ShareCollection-Tutorial-2.png',
  ],
};



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

// Suggested values for different sections
const suggestedValues = {
  tags: ['Popular', 'Trending', 'New', 'Featured', 'Best Rated']
};

const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
};

// Move ShareModal outside the main component
const ShareModal = memo(({
  open,
  onClose,
  editedTitle,
  setEditedTitle,
  editedDescription,
  setEditedDescription,
  editedThumbnail,
  setEditedThumbnail,
  selectedTags,
  tagInput,
  setTagInput,
  renderTagInput,
  collectionUrls,
  selectedCountry,
  setSelectedCountry,
  selectedRegions,
  setSelectedRegions,
  locationData,
  selectedCategories,
  setSelectedCategories,
  categories,
  collectionId,
  selectedCollection,
  getUniqueCountries,
  validationError,
  setValidationError,
  onSuccess,
  languages,
  selectedLanguages,
  setSelectedLanguages
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  
  
  

  const handleSubmit = async () => {
    // Validate required fields
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
      formData.append('user_id', userId); // Add user_id to form data
      formData.append('collection_id', collectionId);
      formData.append('data_id', selectedCollection?.user_colc_data_id); // Add data_id parameter
      formData.append('title', editedTitle);
      formData.append('description', editedDescription);
      formData.append('thumbnail', editedThumbnail);
      formData.append('tags', selectedTags.join(','));
      formData.append('categories', selectedCategories.map(cat => cat.id).join(','));
      formData.append('country', selectedCountry?.name || '');
      // Add mode parameter
      formData.append('mode', 'add');
      
      // Format regions as comma-separated string of city and state names
      if (selectedRegions.length > 0) {
        const formattedRegions = selectedRegions
          .map(region => region.name)
          .join(',');
        formData.append('regions', formattedRegions);
      }
      
      // Add languages as comma-separated string of language_full_name
      const formattedLanguages = selectedLanguages
        .map(lang => lang.language_full_name)
        .join(',');
      formData.append('language', formattedLanguages); // Changed from 'languages' to 'language'
      
      // Add URLs as item1 through item10
      collectionUrls.forEach((urlData, index) => {
        if (index < 10) {  // Only process first 10 URLs
          formData.append(`item${index + 1}`, urlData.url);
        }
      });

      const response = await fetch(`${API_BASE_URL}share_collections.php`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.message === "success") {
        // Immediately update the collection's shared status locally
        if (selectedCollection) {
          const updatedCollection = {
            ...selectedCollection,
            shared: "1",
            title: editedTitle,
            description: editedDescription,
            thumbnail: editedThumbnail,
            tags: selectedTags,
            categories: selectedCategories.map(cat => cat.id).join(','),
            country_name: selectedCountry?.name,
            region: selectedRegions.map(region => region.name).join(','),
            language: formattedLanguages,
            collections_url: collectionUrls
          };
          // Update the collection status in the parent component
          onSuccess && onSuccess(collectionId, updatedCollection);
        }
        setShowSuccess(true);
        // Close after 1.5 seconds
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 1500);
      } else {
        throw new Error('Failed to share collection');
      }
    } catch (error) {
      console.error('Error sharing collection:', error);
      setValidationError(error.message || 'Failed to share collection');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add validation error modal
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
      bgcolor: 'error.light',
      borderRadius: 5,
      p: 4,
      maxWidth: 400,
      width: '90%',
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    }}
  >
    {/* Icon */}
    <Box
      sx={{

        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '2rem',
        mx: 'auto',
        mb: 2,
      }}
    >
      <CircleAlert size={75} />
    </Box>

    {/* Title */}
    <Typography
      variant="h6"
      sx={{
        fontWeight: 600,
        color: 'white',
		fontSize: '24px',
        mb: 2,
      }}
    >
      Validation Error
    </Typography>

    {/* Message */}
    <Typography
      variant="body2"
      sx={{
        color: '#ffffff',
		fontSize: '15px',
        mb: 4,
      }}
    >
      {validationError}
    </Typography>

    {/* Button */}
    <Button
      onClick={() => setValidationError(null)}
      variant="contained"
      sx={{
        bgcolor: '#d32f2f',
        color: 'white',
        textTransform: 'none',
        fontWeight: 600,
        px: 5,
        py: 1.5,
        borderRadius: '25px',
        '&:hover': {
          bgcolor: '#b71c1c',
        },
      }}
    >
      Got it
    </Button>
  </Box>
</Modal>

    );
  }

  if (showSuccess) {
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
            p: 4,
            maxWidth: 400,
            width: '90%',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: 'linear-gradient(90deg, #4CAF50, #81C784)'
            }
          }}
        >
          <CheckCircleIcon 
            sx={{ 
              fontSize: 64, 
              color: 'success.main',
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Successfully Shared!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your collection has been shared successfully.
          </Typography>
        </Box>
      </Modal>
    );
  }

  return (

    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="share-modal-title"
      aria-describedby="share-modal-description"
      disableAutoFocus={false}
      disableEnforceFocus={false}
      disableRestoreFocus={false}
      keepMounted
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Box 
        component="div"
        sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
          maxWidth: 600,
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          m: 2,
          '&:focus': {
            outline: 'none'
          }
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <Typography id="share-modal-title" variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
          Share Collection
        </Typography>

        <TextField
          fullWidth
          label="Title"
          value={editedTitle}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditedTitle(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          sx={{ mb: 3 }}
          placeholder="Enter collection title"
          variant="outlined"
          autoFocus
        />

        <TextField
          fullWidth
          label="Description"
          value={editedDescription}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setEditedDescription(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault();
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
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
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditedThumbnail(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
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
                  alt="Featured"
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
            onChange={(event, newValue) => {
              setSelectedCategories(newValue);
            }}
            options={categories}
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Select categories"
                InputProps={{
                  ...params.InputProps,
                  sx: {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'divider'
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main'
                    }
                  }
                }}
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
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark'
                      }
                    }
                  }}
                />
              ))
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Location
          </Typography>
          <Stack spacing={2}>
            <Autocomplete
              value={selectedCountry}
              defaultValue={getUniqueCountries()[0]}
              onChange={(event, newValue) => {
                setSelectedCountry(newValue);
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />

            <Autocomplete
              multiple
              value={selectedRegions}
              onChange={(event, newValue) => {
                setSelectedRegions(newValue);
              }}
              options={(() => {
                // If no country is selected, return empty array
                if (!selectedCountry) return [];

                // Filter locations for selected country and create state map
                const stateMap = locationData
                  .filter(item => item.country_name === selectedCountry.name)
                  .reduce((acc, item) => {
                    if (!acc[item.state_name]) {
                      acc[item.state_name] = {
                        id: `state-${item.state_name}`,
                        name: item.state_name,
                        type: 'state',
                        cities: []
                      };
                    }
                    acc[item.state_name].cities.push({
                      id: item.city_id,
                      name: item.city_name,
                      state: item.state_name,
                      type: 'city'
                    });
                    return acc;
                  }, {});

                // Flatten the structure for the options list
                return Object.values(stateMap).flatMap(state => [
                  { id: state.id, name: state.name, type: 'state', state: null },
                  ...state.cities
                ]);
              })()}
              groupBy={(option) => option.type === 'state' ? null : option.state}
              getOptionLabel={(option) => option.name}
              filterOptions={(options, { inputValue }) => {
                const searchText = inputValue.toLowerCase();
                return options.filter(option => 
                  option.name.toLowerCase().includes(searchText) ||
                  (option.type === 'city' && option.state.toLowerCase().includes(searchText))
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region"
                  placeholder={selectedCountry ? "Search regions" : "Select a country first"}
                  disabled={!selectedCountry}
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
              renderGroup={(params) => (
                <Box key={params.key}>
                  <Box>
                    {params.children}
                  </Box>
                </Box>
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  sx={{
                    py: 1.5,
                    ...(option.type === 'state' ? {
                      px: 2,
                      bgcolor: 'grey.50',
                      fontWeight: 600,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'primary.50'
                      }
                    } : {
                      px: 4,
                      ml: 2,
                      '&:hover': {
                        bgcolor: 'primary.50'
                      }
                    })
                  }}
                >
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: option.type === 'state' ? 'text.primary' : 'text.secondary',
                      transition: 'color 0.2s ease',
                      '&:hover': {
                        color: 'primary.main'
                      }
                    }}
                  >
                    {option.name}
                  </Typography>
                </Box>
              )}
              ListboxProps={{
                sx: {
                  maxHeight: 300,
                  '& .MuiAutocomplete-groupUl': {
                    position: 'relative'
                  }
                }
              }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.name}${option.type === 'city' ? `, ${option.state}` : ''}`}
                    sx={{
                      bgcolor: 'grey.100',
                      color: 'text.primary',
                      fontWeight: 500,
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: 'primary.main'
                  }
                }
              }}
            />
          </Stack>
        </Box>

        {/* Language Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary' }}>
            Languages
          </Typography>
          <Autocomplete
            multiple
            value={selectedLanguages}
            onChange={(event, newValue) => {
              setSelectedLanguages(newValue);
            }}
            options={languages}
            getOptionLabel={(option) => option.language_full_name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={!selectedCountry}
            filterOptions={(options, { inputValue }) => {
              const searchText = inputValue.toLowerCase();
              return options.filter(option => 
                option.language_full_name.toLowerCase().includes(searchText) ||
                option.language_local_name.toLowerCase().includes(searchText)
              );
            }}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                <Typography variant="body2">
                  {option.language_full_name}
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
                </Typography>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Languages"
                placeholder={selectedCountry ? "Select languages" : "Select a country first"}
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
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  label={option.language_full_name}
                  sx={{
                    bgcolor: 'primary.50',
                    color: 'primary.main',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark'
                      }
                    }
                  }}
                />
              ))
            }
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              }
            }}
          />
        </Box>

        <Box sx={{ overflow: 'visible', mb: 3 }}>
          {renderTagInput('tags', tagInput, setTagInput, selectedTags, 'Add tag')}
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
            Collection URLs
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ 
                bgcolor: 'primary.50', 
                px: 1, 
                py: 0.5, 
                borderRadius: 1,
                color: 'primary.main',
                fontWeight: 500,
				fontSize: '15px',
              }}>
                {collectionUrls.length} items
              </Typography>
              <Link
                component="button"
                variant="caption"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const urls = collectionUrls.map(url => url.url);
                  const concatenatedUrl = urls.join('\\~\\');
                  if (concatenatedUrl) {
                    if (window.isNativeApp) {
                      window.location.href = 'collections:' + concatenatedUrl;
                    } else {
                      window.open('collections:' + concatenatedUrl, '_blank');
                    }
                  }
                }}
                sx={{
                  color: 'primary.main',
                  fontWeight: 600,
                  textDecoration: 'none',
				  backgroundColor: colors.primaryBackground,
				  borderRadius: '35px',
				  padding: '8px 15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  '&:hover': {
                    //textDecoration: 'underline',
					background: '#00000010',
                  }
                }}
              >
                Open All
                <OpenInNewIcon sx={{ fontSize: 18 }} />
              </Link>
            </Box>
          </Typography>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <List sx={{ width: '100%', p: 0 }}>
              {collectionUrls.map((url, index) => (
<ListItem
  key={url.id}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottom: index < collectionUrls.length - 1 ? '1px solid' : 'none',
    borderColor: 'divider',
    py: 2,
    px: 2,
    gap: 1,
    transition: 'all 0.2s ease',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  }}
>
  {/* Title and Description Section */}
  <Box sx={{ flex: 1, minWidth: 0 }}>
    <Typography
      variant="body1"
      sx={{
        fontWeight: 600,
        fontSize: '1rem',
        color: 'text.primary',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {url.title || 'Untitled Collection'}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        color: 'text.secondary',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        mt: 0.5,
      }}
    >
      {url.description || 'No description available.'}
    </Typography>
  </Box>

  {/* Bottom Section: Favicon, Domain, and Preview Button */}
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 1,
      width: '100%',
    }}
  >
    {/* Favicon */}
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: '50px',
        overflow: 'hidden',
        bgcolor: 'grey.100',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {url.favicon ? (
        <img
          src={url.favicon}
          alt={url.domain}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
          }}
        >
          <Blocks size={16} />
        </Box>
      )}
    </Box>

    {/* Domain */}
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 500,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {url.domain}
    </Typography>

    {/* Preview Button */}
    <Button
      variant="filled"
      size="small"
      sx={{
        textTransform: 'none',
        color: 'primary.main',
        backgroundColor: colors.primaryBackground,
        borderRadius: '35px',
        '&:hover': {
          backgroundImage: '#00000010',
        },
      }}
      startIcon={<OpenInNewIcon fontSize="small" />}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const inappUrl = 'inapp:' + url.url;
        window.isNativeApp ? (window.location.href = inappUrl) : window.open(inappUrl, '_blank');
      }}
    >
      Preview
    </Button>
  </Box>
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
			sx={{border: 'none', textTransform: 'none',}}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSubmitting}
			sx={{borderRadius: '40px', boxShadow: 'none', textTransform: 'none',}}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Sharing...' : <>Share <Forward size={20} style={{ marginLeft: 2 }} /></>}

          </Button>
        </Box>
      </Box>
    </Modal>
  );
});

const SharedCollectionPage = () => {
  const { userLoggedIn } = useLogin();
    const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialId, setTutorialId] = useState('sharedCollection');
  const [collections, setCollections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [sharedCollections, setSharedCollections] = useState(new Set());
  const [isEditor, setIsEditor] = useState(false);
  
  // Update selectedTags initial state to include all suggested tags
  const [selectedTags, setSelectedTags] = useState(suggestedValues.tags);
  
  // Input states
  const [tagInput, setTagInput] = useState('');

  // Edit states
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedThumbnail, setEditedThumbnail] = useState('');

  // Add state for categories and selected categories
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Add state declarations for languages
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  // Add state declarations in SharedCollectionPage component
  const [locationData, setLocationData] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedRegions, setSelectedRegions] = useState([]);

  // Add state for collections
  const [collectionUrls, setCollectionUrls] = useState([]);

  // Add state for removed tags
  const [removedTags, setRemovedTags] = useState(new Set());

  // Update modal visibility when login state changes
  useEffect(() => {
    setShowLoginModal(!userLoggedIn);
  }, [userLoggedIn]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!userLoggedIn) {
        setLoading(false);
        return;
      }

      const userId = getCookie('user_id');
      if (!userId) {
        setError('User ID not found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}user_collection_share.php?user_id=${userId}`
        );
        const data = await response.json();

        if (data.status) {
          setCollections(data.data);
          setIsEditor(data.is_editor === "1");
        } else {
          setError(data.message || 'No sharing rights available');
        }
      } catch (err) {
        setError('Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [userLoggedIn]);

  const handleShareClick = useCallback((collection) => {
    // Reset all fields
    setEditedTitle('');
    setEditedDescription('');
    setEditedThumbnail('');
    setSelectedTags(suggestedValues.tags); // Initialize with all suggested tags
    setTagInput('');
    setSelectedCountry(null);
    setSelectedRegions([]);
    setSelectedCategories([]);
    setValidationError(null);
    setRemovedTags(new Set()); // Reset removed tags
    
    // Set the selected collection and open modal
    setSelectedCollection(collection);
    setShareModalOpen(true);
  }, [setValidationError]);

  const handleTagAdd = useCallback((section, value) => {
    if (!value.trim()) return;
    
    if (section === 'tags') {
        if (!selectedTags.includes(value)) {
          setSelectedTags(prev => [...prev, value]);
        }
        setTagInput('');
    }
  }, [selectedTags]);

  const handleTagDelete = useCallback((section, valueToDelete) => {
    if (section === 'tags') {
      setSelectedTags(prev => prev.filter(tag => tag !== valueToDelete));
      setRemovedTags(prev => new Set([...prev, valueToDelete]));
    }
  }, []);

  const handleKeyPress = useCallback(debounce((e, section) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleTagAdd(section, e.target.value);
    }
  }, 300), [handleTagAdd]);

  const renderTagInput = useCallback((section, value, setValue, selectedTags, placeholder) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
        {section.charAt(0).toUpperCase() + section.slice(1)}
      </Typography>
      <Box sx={{ 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        backgroundColor: 'background.paper'
      }}>
        <Box sx={{ 
          minHeight: '48px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: selectedTags.length > 0 ? 1 : 0
        }}>
          {selectedTags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={() => handleTagDelete(section, tag)}
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
          ))}
          {suggestedValues[section]
            .filter(suggestion => !selectedTags.includes(suggestion) && !removedTags.has(suggestion))
            .map((suggestion) => (
              <Chip
                key={suggestion}
                label={suggestion}
                size="small"
                component="div"
                onClick={() => handleTagAdd(section, suggestion)}
                sx={{ 
                  m: 0.5,
                  bgcolor: 'primary.50',
                  '&:hover': { bgcolor: 'primary.100' },
                  cursor: 'pointer'
                }}
              />
            ))}
        </Box>
        <TextField
          fullWidth
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => handleKeyPress(e, section)}
          onFocus={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          placeholder={placeholder}
          helperText="Press Enter to add"
          sx={{
            '& .MuiInputBase-root': {
              border: 'none',
              '& fieldset': {
                border: 'none'
              }
            },
            '& .MuiFormHelperText-root': {
              mx: 0
            }
          }}
        />
      </Box>
    </Box>
  ), [handleTagAdd, handleKeyPress, handleTagDelete, removedTags]);

  useEffect(() => {
    if (selectedCollection && !editedTitle && !editedDescription && !editedThumbnail) {
      setEditedTitle(selectedCollection.title || '');
      setEditedDescription(selectedCollection.description || '');
      setEditedThumbnail(selectedCollection.thumbnail || '');
    }
  }, [selectedCollection, editedTitle, editedDescription, editedThumbnail]);

  // Add useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}category_collection_api.php`);
        const data = await response.json();
        if (data.status) {
          const formattedCategories = data.data.map(cat => ({
            id: cat.sub_category_id,
            label: `${cat.sub_category_name} ${cat.category_name}`,
            value: cat.sub_category_id
          }));
          setCategories(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Add useEffect to fetch location data
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL_5best}city.php?cid=1`);
        const data = await response.json();
        
        // Transform the data to match our needs
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

  // Add useEffect to fetch languages when country changes
  useEffect(() => {
    const fetchLanguages = async () => {
      if (!selectedCountry) return;
      
      try {
        // Use API_BASE_URL from apiConfigext.js
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
    // Reset selected languages when country changes
    setSelectedLanguages([]);
  }, [selectedCountry]);

  // Update location data processing functions
  const getUniqueCountries = useCallback(() => {
    if (!locationData?.length) return [];
    
    const uniqueCountries = [...new Set(locationData.map(item => item.country_name))];
    return uniqueCountries.map(countryName => ({
      id: locationData.find(item => item.country_name === countryName)?.country_id,
      name: countryName
    }));
  }, [locationData]);

  const getStatesForCountry = useCallback((countryId) => {
    if (!locationData?.length) return [];

    const uniqueStates = [...new Set(locationData
      .filter(item => item.country_id === countryId)
      .map(item => item.state_name)
    )];
    
    return uniqueStates.map(stateName => ({
      id: stateName,
      name: stateName
    }));
  }, [locationData]);

  const getCitiesForState = useCallback((stateId) => {
    if (!locationData?.length || !stateId) return [];

    return locationData
      .filter(item => item.state_name === stateId)
      .map(item => ({
        id: item.city_id,
        name: item.city_name
      }));
  }, [locationData]);
  
  

  // Add useEffect to fetch collection data
  useEffect(() => {
    const fetchCollectionData = async () => {
      try {
        const userId = getCookie('user_id');
        const response = await fetch(`${API_BASE_URL}user_collection_share.php?user_id=${userId}`);
        const data = await response.json();
        if (data.status && data.data) {
          // Flatten all URLs from all collections
          const allUrls = data.data.flatMap(collection => 
            collection.collections_url.map(url => ({
              ...url,
              collectionTitle: collection.title
            }))
          );
          setCollectionUrls(allUrls);
        }
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    fetchCollectionData();
  }, []);

  const handleShareSuccess = useCallback((collectionId, updatedCollection) => {
    // Update collections state to move the collection to shared
    setCollections(prevCollections => {
      if (!prevCollections) return prevCollections;
      
      return prevCollections.map(collection => {
        if (collection.id === collectionId) {
          return { ...collection, ...updatedCollection };
        }
        return collection;
      });
    });
    setSharedCollections(prev => new Set([...prev, collectionId]));
  }, []);

  const [isSharedSectionExpanded, setIsSharedSectionExpanded] = useState(false);

  const handleCollectionClick = (collection) => {
    const urls = collection.collections_url.map(url => url.url);
    const concatenatedUrl = urls.join('\\~\\');
    if (concatenatedUrl) {
      if (window.isNativeApp) {
        window.location.href = 'collections:' + concatenatedUrl;
      } else {
        window.open('collections:' + concatenatedUrl, '_blank');
      }
    }
  };

  const renderCollectionsList = (collections, isSharedSection = false) => {
    const filteredCollections = collections?.filter(collection => 
      isSharedSection ? collection.shared === "1" : collection.shared !== "1"
    );

    if (!filteredCollections?.length) return null;

    return (
      <Box sx={{ mb: 4 }}>
        {!isSharedSection && (
          <>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                
				 				
				<Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'text.primary',
                    fontWeight: 700,
					fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0,
                  }}
                >
                  
                  {`${filteredCollections.length} ${filteredCollections.length === 1 ? 'collection' : 'collections'}`} available to share
                  </Typography>
               
            </Box>
            </Box>
                <Stack spacing={2}>
                  {filteredCollections.map((collection) => (
<Card 
  sx={{ 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: 1.5,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 2,
    height: 'fit-content',
    position: 'relative',
	boxShadow: 'none',
  }}
>
  {/* Top Section: Image and Content */}
  <Box sx={{ display: 'flex', gap: 2 }}>
    {/* Left: Image Section */}
    <Box 
      sx={{ 
        width: 80, 
        height: 80, 
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'grey.100',
        flexShrink: 0,
        cursor: 'pointer'
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleCollectionClick(collection);
      }}
    >
      {collection.thumbnail ? (
        <img
          src={collection.thumbnail}
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
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.50',
            color: 'primary.main'
          }}
        >
		  <Blocks size={48} style={{color: '#4caf50', opacity: 0.5, }}/>
        </Box>
      )}
    </Box>

    {/* Right: Title and Description */}
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
      {/* Title */}
      <Typography 
  variant="h6" 
  sx={{ 
    fontWeight: 600,
    fontSize: '1rem',
    color: 'text.primary',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.5,
    wordWrap: 'break-word', // Prevents text from overflowing
    maxWidth: '90%'       // Ensures it fits within the card width
  }}
>
  {collection.title || 'Untitled Collection'}
</Typography>


      {/* Description */}
      {collection.description && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.5
          }}
        >
          {collection.description}
        </Typography>
      )}
    </Box>
  </Box>

  {/* Bottom Section: Items Count and Share Button */}
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      mt: '10px'
    }}
  >
    {/* Items Count */}
    <Typography 
      variant="caption" 
      sx={{ 
        color: 'text.secondary',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5
      }}
    >
      <Box 
        component="span" 
        sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%', 
          bgcolor: '#4caf50',
          position: 'relative',
          display: 'inline-flex',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '1px solid #4caf50',
            animation: 'ripple 2s ease-out infinite',
            opacity: 0
          },
          '@keyframes ripple': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.5
            },
            '100%': {
              transform: 'scale(4)',
              opacity: 0
            }
          }
        }} 
      />
      {collection.collections_url.length} items
    </Typography>

    {/* Share Button */}
    <Button
      variant="filled"
      size="small"
      sx={{
        textTransform: 'none',
        color: 'primary.main',
        borderColor: 'primary.main',
		bgcolor: colors.primaryBackground,
		borderRadius: '35px',
      }}
      onClick={(e) => {
        e.stopPropagation();
        handleShareClick(collection);
      }}
      endIcon={<Forward size={16}/>} 
    >
      Share
    </Button>
  </Box>
</Card>

              ))}
            </Stack>
          </>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <CircularProgress className="text-blue-600" />
      </div>
    );
  }

  const toggleDescription = (collectionId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [collectionId]: !prev[collectionId]
    }));
  };

  const renderDescription = (collection) => {
    const isExpanded = expandedDescriptions[collection.id];
    const description = collection.description || '';
    const shouldTruncate = description.length > 60;

    if (!shouldTruncate) return description;

    return (
      <>
        {isExpanded ? description : `${description.substring(0, 60)}...`}
        {shouldTruncate && (
          <Link
            component="button"
            variant="body2"
            onClick={(e) => {
              e.stopPropagation();
              toggleDescription(collection.id);
            }}
            sx={{
              ml: 0.5,
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
          >
            {isExpanded ? 'Read less' : 'Read more'}
          </Link>
        )}
      </>
    );
  };
  
  

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.primaryBackground, }}>
	<MetaData component="ShareCollections" />
	  {showTutorial && (
  <Tutorial
    tutorialId={tutorialId} // Dynamically set tutorial ID
    tutorials={tutorials}
    onClose={() => setShowTutorial(false)}
  />
)}
      {/* Login Modal */}
      <Modal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
		  background: colors.primaryBackground,
        }}
      >

          <Alert 
			  severity="info"
			  variant="filled"
			  sx={{ 
				borderRadius: 2,
				background: 'linear-gradient(135deg, #2196F3, #1976D2)',
				boxShadow: '0 4px 12px rgba(33, 150, 243, 0.2)',
				margin: '0px 20px',
				paddingTop: '40px',
				position: 'relative',
				outline: 'none',
				'& .MuiAlert-icon': {
				  fontSize: '4rem',
				  color: 'rgba(255, 255, 255, 0.95)',
				  position: 'absolute',
				  top: '-45px',
				  left: '50%',
				  transform: 'translateX(-50%)',
				  background: '#2196F3',
				  padding: '10px',
				  borderRadius: '50px',
				  //border: '5px solid #00000080',
				},
				'& .MuiAlert-message': {
				  width: '100%',
				  display: 'flex',
				  flexDirection: 'column',
				  gap: '10px',
				  justifyContent: 'center',
				  alignItems: 'center',
				}
			  }}
			>
            <AlertTitle sx={{ 
              mb: 1,
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '0.3px',
            }}>
              Sign In Required
            </AlertTitle>
            <Typography sx={{ 
              opacity: 0.95, 
              lineHeight: 1.6,
              fontSize: '0.95rem',
              color: 'rgba(255, 255, 255, 0.9)',
              letterSpacing: '0.2px'
            }}>
              This collection requires authentication to view. Please ensure you are logged in to access this content.
            </Typography>
          </Alert>

      </Modal>

      {/* Share Modal */}
      <ShareModal 
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        onSuccess={handleShareSuccess}
        editedTitle={editedTitle}
        setEditedTitle={setEditedTitle}
        editedDescription={editedDescription}
        setEditedDescription={setEditedDescription}
        editedThumbnail={editedThumbnail}
        setEditedThumbnail={setEditedThumbnail}
        selectedTags={selectedTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
        renderTagInput={renderTagInput}
        collectionUrls={collectionUrls}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        locationData={locationData}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        categories={categories}
        collectionId={selectedCollection?.id}
        selectedCollection={selectedCollection}
        getUniqueCountries={getUniqueCountries}
        validationError={validationError}
        setValidationError={setValidationError}
        languages={languages}
        selectedLanguages={selectedLanguages}
        setSelectedLanguages={setSelectedLanguages}
      />

      {/* Main Content */}
      {userLoggedIn && (
        <Container maxWidth="lg" sx={{ pt: 4, pb: 6 }}>
          {/* Header Section */}
          <Box 
            sx={{ 
              mb: 5,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -24,
                left: -24,
                right: -24,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(25,118,210,0.2), transparent)'
              }
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
            <Box
              sx={{
                position: 'relative',
				width: 56,
				height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                //  boxShadow: '0 8px 32px rgba(25,118,210,0.25)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                    inset: -2,
                    borderRadius: 'inherit',
                    padding: '2px',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                  }
                }}
              >
                <Share2 size={28} color="white" />
              </Box>
              <Box>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800,
					fontSize: '1.5rem',
                    letterSpacing: '-0.5px',
                    background: 'linear-gradient(135deg, #1a237e, #0d47a1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 0.5,
                  }}
                >
                  Share Collections
                </Typography>
                {isEditor && (
                  <RouterLink
                    to="/view-shared-collections"
                    style={{ textDecoration: 'none' }}
                  >
                    <Link
                      component="span"
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: 'primary.main',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          color: 'primary.dark',
                          gap: 1
                        }
                      }}
                    >
                      View Shared Collections
                      <OpenInNewIcon sx={{ fontSize: 16 }} />
                    </Link>
                  </RouterLink>
                )}
              </Box>
            </Box>

            <Box 
              sx={{ 
                display: 'flex', 
                gap: 2,
                alignItems: 'center',
                bgcolor: 'background.paper',
                p: 1,
                borderRadius: 2,
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1
                }}
              >
                <Box 
                  component="span" 
                  sx={{ 
                    width: 8, 
                    height: 8, 
                  borderRadius: '50%',
                    bgcolor: '#4caf50',
                    position: 'relative',
                    display: 'inline-flex',
                    '&::before': {
                  content: '""',
                  position: 'absolute',
                      width: '100%',
                      height: '100%',
                  borderRadius: '50%',
                      border: '1px solid #4caf50',
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
                Online
              </Typography>
              <Divider orientation="vertical" flexItem />
            <Typography 
                variant="body2" 
              sx={{ 
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                {collections?.filter(c => c.shared === "1").length || 0} Shared
            </Typography>
            </Box>
          </Box>

          {/* Content Section */}
          <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Available to Share Section */}
            <Box sx={{ flex: 2 }}>
          {error ? (
            <Alert 
              severity="error"
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    //boxShadow: '0 4px 12px rgba(211,47,47,0.1)',
					outline: 'none',
					marginTop: '50px',
					position: 'relative',
					'& .MuiAlert-icon': {
						  fontSize: '4rem',
						  color: '#FF5733',
						  position: 'absolute',
						  top: '-45px',
						  left: '50%',
						  transform: 'translateX(-50%)',
						  background: 'rgb(253, 237, 237)',
						  padding: '10px',
						  borderRadius: '50px',
						  
						},
                  }}
            >
              <AlertTitle sx={{ 
                    fontSize: '1.5rem',
                  }}>
				  Error !
			  </AlertTitle>
				<Typography sx={{ 
						fontSize: '1.2rem',  // Style for error message
						fontWeight: 400,   // Optional: control font weight
						color: 'inherit'   // Optional: inherit color from Alert
					  }}>
				
				{error}
			   </Typography>
            </Alert>
          ) : (
                renderCollectionsList(collections, false)
              )}
            </Box>

            {/* Already Shared Section */}
            <Box sx={{ flex: 1, minWidth: { lg: 360 } }}>
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'sticky',
                  top: 24,
                  bgcolor: 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    borderColor: 'primary.main'
                  }
                }}
              >
                <Box
                  onClick={() => setIsSharedSectionExpanded(!isSharedSectionExpanded)}
                  sx={{
                    p: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    bgcolor: isSharedSectionExpanded ? 'primary.50' : 'background.paper',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'primary.50'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'success.light',
                        color: 'white'
                      }}
                    >
                      <CheckCircleIcon />
                    </Box>
                    <Box>
                      <Typography 
                        variant="subtitle1" 
                        sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                        }}
                      >
                        Already Shared
                      </Typography>
                      <Typography 
                        variant="caption"
                        sx={{ 
                          color: 'text.secondary',
                          display: 'block'
                        }}
                      >
                        {collections?.filter(c => c.shared === "1").length || 0} collections shared
                      </Typography>
                    </Box>
                  </Box>
                  <ExpandMoreIcon 
                    sx={{ 
                      transform: isSharedSectionExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: 'action.active',
                      fontSize: 28
                    }} 
                  />
                </Box>
                <Collapse in={isSharedSectionExpanded}>
                  <Divider />
                  <Box 
                    sx={{ 
                      p: 2,
                      maxHeight: 'calc(100vh - 200px)',
                      overflowY: 'auto',
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
            <Stack spacing={2}>
                      {collections?.filter(c => c.shared === "1").map((collection) => (
                <Card 
                  key={collection.id} 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'visible',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                              borderColor: 'primary.main'
                    }
                  }}
                >
                  <Box 
                    sx={{ 
                              width: 48, 
                              height: 48, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      mr: 2,
                      bgcolor: 'grey.100',
                      flexShrink: 0,
                              border: '1px solid',
                              borderColor: 'divider'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCollectionClick(collection);
                    }}
                  >
                    {collection.thumbnail ? (
                      <img
                        src={collection.thumbnail}
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
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'primary.50',
                                  color: 'primary.main'
                        }}
                              >
                                <Share2 size={32} />
                              </Box>
                    )}
                  </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                              variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                                mb: 1,
                                color: 'text.primary'
                      }}
                    >
                      {collection.title || 'Untitled Collection'}
                    </Typography>
                            {collection.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{
                                  mb: 1.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  lineHeight: 1.5
                                }}
                              >
                                {collection.description}
                    </Typography>
                            )}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                              gap: 2,
                                flexWrap: 'wrap'
                              }}
                            >
                    <Typography 
                      variant="caption" 
                      sx={{ 
                                  color: 'text.secondary',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                        fontWeight: 500
                      }}
                    >
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 6, 
                                    height: 6, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main' 
                                  }} 
                                />
                                {collection.collections_url.length} items
                    </Typography>
                              {collection.tags && typeof collection.tags === 'string' && (
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {collection.tags.split(',').filter(tag => tag.trim()).slice(0, 3).map((tag, index) => (
                                    <Chip
                                      key={index}
                                      label={tag.trim()}
                                      size="small"
                                      sx={{ 
                                        height: 20,
                                        fontSize: '0.75rem',
                                        bgcolor: 'primary.50',
                                        color: 'primary.main',
                                        fontWeight: 500,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                  </Box>
                  
                </Card>
              ))}
            </Stack>
                  </Box>
                </Collapse>
              </Paper>
            </Box>
          </Box>
        </Container>
      )}
    </div>
  );
};

export default SharedCollectionPage;