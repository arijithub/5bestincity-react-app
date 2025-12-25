import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, Button, Accordion, AccordionSummary, AccordionDetails,
  Checkbox, Divider, FormGroup, FormControlLabel, CircularProgress, Chip, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled } from '@mui/material/styles';
import {
  API_BASE_URL,
  ENDPOINTS,
  IMAGE_BASE_URL,
  getApiUrl,
  getEngineImageUrl,
  COLORS,
} from '../../config/apiConfigext';

const ModalContent = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px', // Ensures the modal fits better on all screen sizes
  maxHeight: '85vh', // Adjust modal height to fit within screen
  backgroundColor: theme.palette.background.paper,
  borderRadius: '16px', // Softer corners for a modern look
  boxShadow: '0px 12px 36px rgba(0, 0, 0, 0.2)', // Enhance shadow for better focus
  padding: theme.spacing(3),
  overflowY: 'auto', // Scroll if the content overflows
  display: 'flex',
  flexDirection: 'column',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
}));

const StyledCloseButton = styled(IconButton)(({ theme }) => ({
  color: 'black', // Black close button for better visibility
}));

const categories = [
  'Price',
  'Customer Ratings',
  'Discount',
  'Availability',
  'Corded/Cordless',
  'Ideal for',
  'GST Invoice Available',
  'Offers',
  'Category',
];

const fixedFilterOptions = {
  'Price': ['Rs. 100 and Below', 'Rs. 101 - Rs. 300', 'Rs. 301 - Rs. 500', 'Rs. 501 - Rs. 700', 'Rs. 700 and Above'],
  'Customer Ratings': ['4★ & above', '3★ & above'],
  'Discount': ['50% or more', '40% or more', '30% or more', '20% or more', '10% or more'],
  'Availability': ['Include Out of Stock'],
  'Corded/Cordless': ['Corded', 'Corded & Cordless', 'Cordless'],
  'Ideal for': ['Men', 'Women'],
  'GST Invoice Available': ['GST Invoice Available'],
  'Offers': ['Buy More, Save More', 'Special Price'],
};

const FilterModal = ({ open, onClose, selectedFilters, onFilterApply, onFilterReset }) => {
  const [selectedCategory, setSelectedCategory] = useState('Price');
  const [localFilters, setLocalFilters] = useState(selectedFilters);
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    if (selectedCategory === 'Category') {
      fetchDynamicFilters();
    }
  }, [selectedCategory]);

  const fetchDynamicFilters = async () => {
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.AMAZON_FILTER));
      const data = await response.json();
      setDynamicFilters(data.amazondata || []);
    } catch (error) {
      console.error('Error fetching dynamic filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleFilterChange = (filterId, isChecked) => {
    setLocalFilters((prev) => ({
      ...prev,
      [selectedCategory]: {
        ...prev[selectedCategory],
        [filterId]: isChecked,
      },
    }));
  };

  const handleApply = () => {
    onFilterApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({});
    onFilterReset();
  };

  const handleViewMore = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const renderFilterOptions = () => {
    const options = selectedCategory === 'Category' ? dynamicFilters : fixedFilterOptions[selectedCategory] || [];
    const initialDisplay = 5;
    const isExpanded = expandedCategories[selectedCategory];
    const displayOptions = isExpanded ? options : options.slice(0, initialDisplay);

    return (
      <FormGroup>
        {displayOptions.map((option) => {
          const optionId = selectedCategory === 'Category' ? option.store_id : option;
          const optionLabel = selectedCategory === 'Category' ? option.store_name : option;
          return (
            <FormControlLabel
              key={optionId}
              control={
                <Checkbox
                  checked={localFilters[selectedCategory]?.[optionId] || false}
                  onChange={(e) => handleFilterChange(optionId, e.target.checked)}
                />
              }
              label={optionLabel}
            />
          );
        })}
        {options.length > initialDisplay && (
          <Button onClick={() => handleViewMore(selectedCategory)} variant="text">
            {isExpanded ? 'View Less' : 'View More'}
          </Button>
        )}
      </FormGroup>
    );
  };

  const renderSelectedFiltersChips = () => {
    return Object.entries(localFilters).flatMap(([category, filters]) =>
      Object.entries(filters).map(([filterId, isChecked]) =>
        isChecked ? (
          <Chip
            key={filterId}
            label={`${category}: ${filterId}`}
            onDelete={() => handleFilterChange(filterId, false)}
            style={{ margin: '4px' }}
          />
        ) : null
      )
    );
  };

  return (
    <Modal open={open} onClose={onClose} fullWidth>
      <ModalContent>
        {/* Modal Header */}
        <ModalHeader>
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
          <StyledCloseButton onClick={onClose}>
            <CloseIcon />
          </StyledCloseButton>
        </ModalHeader>

        {/* Selected Filters Chips */}
        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mb: 2 }}>
          {renderSelectedFiltersChips()}
        </Box>

        {/* Accordion for Category Filters */}
        <Box sx={{ mb: 2 }}>
          {categories.map((category) => (
            <Accordion
              key={category}
              expanded={selectedCategory === category}
              onChange={() => handleCategorySelect(category)}
              sx={{
                backgroundColor: '#f9f9f9',
                boxShadow: 'none',
                borderRadius: '8px',
                mb: 1,
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ fontWeight: 'bold' }}>
                <Typography>{category}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {loading ? <CircularProgress size={24} /> : renderFilterOptions()}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* Divider */}
        <Divider sx={{ my: 2 }} />

        {/* Reset & Apply Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', position: 'sticky', bottom: 0 }}>
          <Button onClick={handleReset} variant="contained" color="primary">
            Reset
          </Button>
          <Button onClick={handleApply} variant="contained" color="secondary">
            Apply
          </Button>
        </Box>
      </ModalContent>
    </Modal>
  );
};

export default FilterModal;
