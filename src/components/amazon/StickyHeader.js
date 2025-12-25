import React from 'react';
import { styled } from '@mui/material/styles';
import { AppBar, Toolbar, Box, InputBase, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

// Wrapper to prevent layout shift
const HeaderWrapper = styled('div')(({ theme }) => ({
  height: '80px', // Fixed height to prevent layout shift
  width: '100%',
  position: 'relative',
  marginBottom: theme.spacing(2),
}));

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: 'none',
  transition: 'box-shadow 0.3s ease, background-color 0.3s ease',
  position: 'absolute', // Start as absolute
  top: 0,
  left: 0,
  right: 0,
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  
  '&.sticky': {
    position: 'fixed',
    backgroundColor: '#ffffff',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  }
}));

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: '100%',
  padding: theme.spacing(0, 2),
  gap: theme.spacing(1),
}));

const SearchBarWrapper = styled(Box)(({ theme, expanded, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  flex: expanded ? 1 : '1 1 auto',
  backgroundColor: '#f5f5f5',
  borderRadius: '20px',
  padding: theme.spacing(0.5, 2),
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:focus-within': {
    borderColor: isActive ? '#2196f3' : colors.searchbaractiveborder,
    boxShadow: isActive ? '0 0 0 1px rgba(33, 150, 243, 0.2)' : '0 0 5px rgba(0, 123, 255, 0.5)',
  }
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  marginLeft: theme.spacing(1),
}));

const ActionButton = styled('button')(({ theme }) => ({
  backgroundColor: '#ffd814',
  border: 'none',
  borderRadius: '20px',
  padding: theme.spacing(1, 2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'transform 0.2s ease',
  
  '&:hover': {
    transform: 'translateY(-1px)',
  },

  '&:active': {
    transform: 'translateY(0)',
  }
}));

const StickyHeader = ({ 
  isSearchFocused,
  searchTerm,
  onSearchChange,
  onSearchFocus,
  onSearchClear,
  onSortClick,
  onFilterClick,
  filterCount 
}) => {
  const [isSticky, setIsSticky] = React.useState(false);
  
  React.useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <HeaderWrapper>
      <StyledAppBar className={isSticky ? 'sticky' : ''}>
        <SearchContainer>
          <SearchBarWrapper 
            expanded={isSearchFocused}
            isActive={!!searchTerm || isSearchFocused}
          >
            <SearchIcon />
            <StyledInput
              placeholder="Search products..."
              value={searchTerm}
              onChange={onSearchChange}
              onFocus={onSearchFocus}
              fullWidth
            />
            {searchTerm && (
              <IconButton 
                onClick={(e) => {
                  e.preventDefault();
                  onSearchClear();
                }} 
                size="small"
              >
                <ClearIcon />
              </IconButton>
            )}
          </SearchBarWrapper>
          
          {!isSearchFocused && (
            <>
              <ActionButton onClick={onSortClick}>
                <SortIcon /> Sort
              </ActionButton>
              <ActionButton onClick={onFilterClick}>
                <FilterListIcon /> 
                Filter {filterCount > 0 && `(${filterCount})`}
              </ActionButton>
            </>
          )}
        </SearchContainer>
      </StyledAppBar>
    </HeaderWrapper>
  );
};

export default StickyHeader;