import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled Dialog with a vivid gradient background and rounded corners
const StyledDialog = styled(Dialog)({
  '& .MuiPaper-root': {
    borderRadius: '20px',
    boxShadow: '0px 15px 40px rgba(0, 0, 0, 0.3)',
    background: 'linear-gradient(135deg, #ece9e6, #ffffff)',
    padding: '20px',
  },
});

// Gradient header with bold, bright text
const StyledDialogTitle = styled(DialogTitle)({
  background: 'linear-gradient(to right, #ff4081, #ff80ab)',
  color: '#FFFFFF',
  textAlign: 'center',
  fontWeight: 'bold',
  padding: '16px',
  borderRadius: '16px 16px 0 0',
});

// Styling for form control labels with animated effects
const StyledFormControlLabel = styled(FormControlLabel)({
  '& .MuiCheckbox-root': {
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.2)',
    },
  },
  '& .MuiTypography-root': {
    fontWeight: '600',
    transition: 'color 0.3s ease',
    '&:hover': {
      color: '#ff4081',
    },
  },
});

// Stylish buttons with gradient background and hover effects
const StyledButton = styled(Button)({
  fontWeight: 'bold',
  borderRadius: '25px',
  padding: '10px 20px',
  boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0px 8px 25px rgba(255, 64, 129, 0.5)',
    transform: 'scale(1.05)',
  },
});

// Main Component
const FilterCollectionsModal = ({ open, onClose, onApply, filterOptions, selectedFilters, setSelectedFilters }) => {
  const [tempSelectedFilters, setTempSelectedFilters] = useState({});

  useEffect(() => {
    // Reset selected filters when the modal opens
    if (open) {
      setTempSelectedFilters(selectedFilters);
    }
  }, [open, selectedFilters]);

  const handleFilterChange = (category, subCategory) => {
    setTempSelectedFilters(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subCategory]: !prev[category]?.[subCategory]
      }
    }));
  };

  const handleApply = () => {
    setSelectedFilters(tempSelectedFilters);
    onApply(tempSelectedFilters);
    onClose();
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <StyledDialogTitle>Filter Collections</StyledDialogTitle>
      <DialogContent dividers>
        {Object.keys(filterOptions).length === 0 ? (
          <Typography variant="body1" color="textSecondary">
            No filter options available.
          </Typography>
        ) : (
          Object.entries(filterOptions).map(([category, subCategories]) => (
            <Box key={category} mb={2}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', marginBottom: '8px', color: '#ff4081' }}>
                {category}
              </Typography>
              <FormGroup>
                {subCategories.map(subCategory => (
                  <StyledFormControlLabel
                    key={subCategory.sub_category_id}
                    control={
                      <Checkbox
                        checked={tempSelectedFilters[category]?.[subCategory.sub_category_name] || false}
                        onChange={() => handleFilterChange(category, subCategory.sub_category_name)}
                        sx={{
                          '&.Mui-checked': {
                            color: '#ff4081',
                          },
                        }}
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <img
                          src={subCategory.dataurl}
                          alt={subCategory.sub_category_name}
                          style={{ width: 24, height: 24, marginRight: 8 }}
                          loading="lazy"
                          decoding="async"
                          fetchpriority="low"
                        />
                        {subCategory.sub_category_name}
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </Box>
          ))
        )}
      </DialogContent>
      <DialogActions sx={{ padding: '16px', justifyContent: 'space-between' }}>
        <StyledButton onClick={onClose} variant="outlined" color="secondary">
          Cancel
        </StyledButton>
        <StyledButton onClick={handleApply} variant="contained" color="primary" sx={{ background: 'linear-gradient(to right, #ff4081, #ff80ab)' }}>
          Apply
        </StyledButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default FilterCollectionsModal;
