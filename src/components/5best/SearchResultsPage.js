import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  CircularProgress,
  useTheme
} from '@mui/material';

import { getApiUrl, getImageUrl, ENDPOINTS } from '../../config/apiConfig';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SearchResultsPage() {
  const { cityId } = useParams();
  const query = useQuery();
  const searchTerm = query.get('q');
  const [cityData, setCityData] = useState(null);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchCityData();
  }, [cityId]);

  useEffect(() => {
    if (cityData) {
      filterCategories();
    }
  }, [cityData, searchTerm]);

  const fetchCityData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.CATEGORY, `cityid=${cityId}`));
      const data = await response.json();
      setCityData(data);
    } catch (error) {
      console.error('Error fetching city data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCategories = () => {
    const filtered = cityData.categories.filter(category => 
      category.sub_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.related_keywords && category.related_keywords.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredCategories(filtered);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!cityData) return <Typography>No data available</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography variant="h4" gutterBottom align="center" style={{ color: theme.palette.primary.main }}>
          Search Results for "{searchTerm}" in {cityData.city_name}, {cityData.state_name}
        </Typography>
        {filteredCategories.length === 0 ? (
          <Typography variant="h6" align="center">No results found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filteredCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category.sub_category_name}>
                <Card 
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05) rotateY(5deg)',
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={getImageUrl('category', category.sub_category_image)}
                    alt={category.sub_category_name}
                    sx={{
                      objectFit: 'contain',
                      backgroundColor: theme.palette.grey[200],
                      padding: 2,
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="div" align="center">
                      {category.sub_category_name}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
}

export default SearchResultsPage;