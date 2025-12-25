import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TextField, InputAdornment, Box, Typography, Grid, IconButton, CircularProgress, Avatar, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { styled } from '@mui/system';

import './styles/master.css';
import './styles/custom-styles.css';
import {
  ENDPOINTS,
  getApiUrl,
  SEARCH_ENGINE_IMAGE_BASE_URL,
  COUNTRY_IMAGE_BASE_URL, // Import the constant
} from './config/apiConfig';

const StyledListItem = styled(Box)({
  borderRadius: '12px',
  marginBottom: '10px',
  backgroundColor: '#fff',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  padding: '12px',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-4px)',
  },
});

const BestLocationsPage = () => {
  const { subcategory } = useParams(); // Extract subcategory ID from the URL
  const [searchEngines, setSearchEngines] = useState([]);
  const [groupedLocations, setGroupedLocations] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchClicked, setIsSearchClicked] = useState(false);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const searchRef = useRef(null);
  const topCitiesRef = useRef(null);
  const [topCities, setTopCities] = useState([]);
  const [subcatTitle, setSubcatTitle] = useState('');
  const [subcatTitle1, setSubcatTitle1] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
         const locationUrl = getApiUrl(
          ENDPOINTS.LOCATION_BY_SUBCATEGORY,
          `subcat=${subcategory}`
        );
        const cityUrl = getApiUrl(ENDPOINTS.CITY, "cid=1");

        const [locationResponse, engineResponse] = await Promise.all([
          axios.get(locationUrl),
          axios.get(cityUrl),
        ]);

        const locationData = locationResponse.data || {};
        const engineData = engineResponse.data || {};
		
		if (locationData?.subcat_urlslug) {
		  const formattedSubcatTitle = locationData.subcat_urlslug
			.replace(/-/g, ' ') // Replace hyphens with spaces
			.charAt(0)
			.toUpperCase() + locationData.subcat_urlslug.replace(/-/g, ' ').slice(1); // Capitalize the first letter
		  setSubcatTitle(formattedSubcatTitle);
		  
		  const formattedSubcatTitle1 = locationData.subcat_urlslug;
		  setSubcatTitle1(formattedSubcatTitle1);
		}


        // Safely set locations and top cities
        if (locationData?.locations) {
          const grouped = locationData.locations.reduce((acc, location) => {
            const { state } = location;
            if (!acc[state]) {
              acc[state] = [];
            }
            acc[state].push(location);
            return acc;
          }, {});
          setGroupedLocations(grouped || {});
          setFilteredLocations(locationData.locations || []);
          setTopCities(locationData.topcities || []);
        }

        // Safely set search engines
        if (engineData?.searchengine?.searchenginedata) {
          const initializedEngines = engineData.searchengine.searchenginedata.map((engine) => ({
            ...engine,
            selected: engine.selected === 'true',
          }));
          setSearchEngines(initializedEngines || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setGroupedLocations({});
        setFilteredLocations([]);
        setTopCities([]);
        setSearchEngines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();


    const handleScroll = () => {
      if (searchRef.current && topCitiesRef.current) {
        const topCitiesRect = topCitiesRef.current.getBoundingClientRect();
        if (topCitiesRect.bottom <= 0) {
          setIsSticky(true);
        } else {
          setIsSticky(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [subcategory]);

    useEffect(() => {
        if (searchTerm === '') {
            setFilteredLocations(Object.values(groupedLocations).flat());
        } else {
            const filtered = Object.values(groupedLocations).flat().filter(location =>
                location.city.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredLocations(filtered);
        }
    }, [searchTerm, groupedLocations]);

    const handleClear = () => {
        // Reset search term
        setSearchTerm('');
        
        // Reset filtered locations to original state
        setFilteredLocations(Object.values(groupedLocations).flat());
        
        // Reset search click state
        setIsSearchClicked(false);
        
        // Reset sticky state
        setIsSticky(false);
        
        // Smooth scroll back to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    const handleSearchClick = () => {
        // Scroll the search bar to the top smoothly
        if (searchRef.current) {
            searchRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setIsSticky(true);
        }
    };
	
	const toggleEngineSelection = (clickedEngine) => {
    setSearchEngines(
        searchEngines.map(engine =>
            engine.searchenginename === clickedEngine
                ? { ...engine, selected: !engine.selected }
                : engine
        )
    );
};

const handleSearch = () => {
    let searchUrls = '';
    searchEngines.forEach(engine => {
        if (engine.selected) {
            searchUrls += `${engine.searchengineurl}${searchTerm}~`;
        }
    });
    if (searchUrls) {
        const finalUrls = searchUrls.slice(0, -1);
        window.open(finalUrls, '_blank');
    }
};

const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredLocations.length === 0 && searchTerm) {
        e.preventDefault();
        handleSearch();
    }
};

    return (
       <Box className="locations-container">
            {isLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {!isSearchClicked && (
                        <Box ref={topCitiesRef}>
                            <Typography 
                                variant="h4" 
                                className="page-title"
                            >
                                Top {subcatTitle} in India
                            </Typography>
                            <Grid 
                                container 
                                className="top-cities-grid"
                            >
                                {topCities.map((city, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: '10px'
                                        }}
										onClick={() => window.location.href = `/${subcatTitle1}/${city.urlslug}`}
                                    >
                                        <Avatar
                                           src={`${COUNTRY_IMAGE_BASE_URL}${city.city_image}`} // Use dynamic URL
                                            alt={city.city_name}
                                            sx={{ 
                                                width: '60px',
                                                height: '60px',
                                                borderRadius: '50%'
                                            }}
                                        />
                                        <Typography 
                                            sx={{ 
                                                fontSize: '12px',
                                                textAlign: 'center',
                                                color: '#333',
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {city.city_name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    <Box
                        ref={searchRef}
                        sx={{
                            position: isSticky || isSearchClicked ? 'fixed' : 'relative',
                            top: isSticky || isSearchClicked ? 0 : 'auto',
                            left: isSticky || isSearchClicked ? 0 : 'auto',
                            right: isSticky || isSearchClicked ? 0 : 'auto',
                            zIndex: 1000,
                            backgroundColor: 'white',
                            padding: (isSticky || isSearchClicked) ? '10px 15px' : '0',
                            transition: 'all 0.3s ease',
                            boxShadow: (isSticky || isSearchClicked) ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none',
                        }}
                    >
                        <TextField
                            fullWidth
                            placeholder="Search your city"
                            value={searchTerm}
							onKeyDown={handleKeyDown}
                            onFocus={() => setIsSearchClicked(true)}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon style={{ color: '#000' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchTerm && (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClear}>
                                            <CloseIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                borderRadius: '12px',
                                padding: '0px',
                                color: '#333',
                                margin: '0px',
                                backdropFilter: 'blur(15px)',
                                '& .MuiOutlinedInput-root': {
                                    '& fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: 'transparent',
                                    },
                                    '& input': {
                                        color: '#333',
                                    }
                                },
                            }}
                        />
						{filteredLocations.length === 0 && searchTerm && (
    <Box 
        sx={{ 
            textAlign: 'center',
            marginTop: 4,
            ...(isSticky || isSearchClicked) && {
                marginTop: '80px'
            }
        }}
    >
        <Typography color="error" variant="h6">No cities to show</Typography>
        <Grid container justifyContent="center" spacing={2} sx={{ mt: 2 }}>
            {searchEngines.map((engine) => (
                <Grid item key={engine.searchenginename}>
                    <IconButton
                        onClick={() => toggleEngineSelection(engine.searchenginename)}
                        sx={{
                            backgroundColor: engine.selected ? 'red' : 'gray',
                            borderRadius: '50%',
                            '&:hover': {
                                backgroundColor: engine.selected ? 'red' : 'gray',
                            },
                        }}
                    >
                     <img
                            src={`${SEARCH_ENGINE_IMAGE_BASE_URL}${engine.searchengineimage.replace('../', '')}`} // Use dynamic URL
                            alt={engine.searchenginename}
                            style={{ width: '40px', height: '40px' }}
                        />
                    </IconButton>
                </Grid>
            ))}
        </Grid>
        <Button 
            variant="outlined" 
            onClick={handleSearch}
            sx={{ marginTop: 2 }}
        >
            Search
        </Button>
    </Box>
)}
                    </Box>

                  
                    <Box 
                        sx={{ 
                            marginTop: 4,
                            ...(isSticky || isSearchClicked) && {
                                marginTop: '80px' // Increased margin when search is sticky
                            }
                        }}
                    >
                        {filteredLocations.map((location, index) => (
                            <Link 
                                to={`/${location.subcat_urlslug}/${location.city_urlslug}`} 
                                key={index} 
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <StyledListItem sx={{ display: 'flex', alignItems: 'center' }}>
                                     <Avatar
                                        src={`${COUNTRY_IMAGE_BASE_URL}${location.city_image}`} // Use dynamic URL
                                        alt={location.city}
                                        sx={{ 
                                            width: 50,
                                            height: 50,
                                            marginRight: 2
                                        }}
                                    />
                                    <Box>
                                        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
                                            {location.city}
                                        </Typography>
                                        <Typography sx={{ fontSize: '14px', color: '#979797' }}>
                                            {location.state}
                                        </Typography>
                                    </Box>
                                </StyledListItem>
                            </Link>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default BestLocationsPage;
