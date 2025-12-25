import { styled } from '@mui/material/styles';
import { Card, Box, Container, Button, Paper, Typography, TextField, Avatar,Grid,InputBase, AppBar, Toolbar } from '@mui/material';

export const colors = {
  primary: '#3B82F6',          // Matching primary color for general use
  secondary: '#333333',        // Matches the secondary color definition
  tertiary: '#EE8B60',         // Matching tertiary color usage
  alternate: '#E0E3E7',        // Light alternate color
  primaryText: '#14181B',      // Primary text color for readability
  secondaryText: '#57636C',    // Secondary text for less emphasis
  primaryBackground: '#F8FAFC', // Primary background to keep things light
  secondaryBackground: '#FFFFFF', // Used for cards and secondary elements
  accent1: '#FFD700',
  accent2: '#4D39D2C0',
  accent3: '#4dee8b',
  accent4: '#FFFFFF',
  success: '#249689',
  warning: '#F9CF58',
  error: '#FF5963',
  info: '#FFFFFF',
  callbuttonbg: '#fb6800',
  whatsappbuttonbg: '#60ab13',
  amazonbuttonbg: '#ffd814',
  borderRadius35: '35px', 
  borderRadius25: '25px',      // Consistent border radius for rounded components
  commonbtnbg: 'white',        // Background color for common buttons
  bxshadowbtn: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em', // Button shadow
  commonbtntextcolor: '#5f6366', // Common button text color
  sectionmb: '0px 0px 20px 0px',
  categoryActive: '#ff4405',  
  categoryActiveText: '#FFFFFF',
  categoryBackground: '#F8FAFC',
  categoryBorder: '#E2E8F0',
  linkSectionBackground: '#F8FAFC',
  stickyBackground: 'rgba(255, 255, 255, 0.98)',
  sectionActive: '#a59894',
  accent2Light: '#ff440530',
  cardBackground: '#FFFFFF', 
  shadow: 'rgba(67, 71, 85, 0.27) 0px 0px 0.25em, rgba(90, 125, 188, 0.05) 0px 0.25em 1em',
  app_primary: '#CF5F39', 
  app_secondary: '#00036E',  
  app_tertiary: '#EE8B60', 
  app_alternate: '#E0E3E7',  
  app_primaryText: '#14181B',  
  app_secondaryText: '#57636C', 
  app_primaryBackground: '#F1F4F8',
  app_secondaryBackground: '#FFFFFF',
  app_accent1: '#4B39EF4C', 
  app_accent2: '#39D2C04D', 
  app_accent3: '#EE8B604D',   
  app_accent4: '#FFFFFF00',   
  app_success: '#249689',         
  app_warning: '#F9CF58',           
  app_error: '#FF5963',           
  app_info: '#FFFFFF', 
  default_category_avatar: '#85929e',  
  searchbaractiveborder: '#007bff'
};




export const typography = {
  h1: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '64px',
    fontWeight: 'normal',
    color: colors.primaryText,
  },
  h2: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '44px',
    fontWeight: 'normal',
    color: colors.primaryText,
  },
  h3: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '36px',
    fontWeight: 600,
    color: colors.primaryText,
  },
  h4: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '32px',
    fontWeight: 600,
    color: colors.primaryText,
  },
  h5: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '24px',
    fontWeight: 500,
    color: colors.primaryText,
  },
  h6: {
    fontFamily: 'Outfit, sans-serif',
    fontSize: '22px',
    fontWeight: 500,
    color: colors.primaryText,
  },
  body1: {
    fontFamily: 'Readex Pro, sans-serif',
    fontSize: '16px',
    fontWeight: 'normal',
    color: colors.primaryText,
  },
  body2: {
    fontFamily: 'Readex Pro, sans-serif',
    fontSize: '14px',
    fontWeight: 'normal',
    color: colors.primaryText,
  },
};

// Base Container Components
export const MainContainer = styled(Container)({
  width: '100%',
  margin: '0 auto',
  padding: '16px',
  backgroundColor: colors.primaryBackground
});

export const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: colors.secondaryBackground
}));

// Banner Components
export const BannerContainer = styled(Box)(({ isVisible }) => ({
  display: isVisible ? 'block' : 'none',
  opacity: isVisible ? 1 : 0,
  maxHeight: isVisible ? 'auto' : '0',  // Set to 'auto' to allow banner images to define their own height
  overflow: 'visible',
  transition: 'opacity 0.3s ease-in-out, max-height 0.3s ease-in-out',
  marginBottom: isVisible ? '16px' : '0',
  borderRadius: colors.borderRadius25,
}));

// Search Components
export const SearchBoxContainer = styled(Box)(({ isSearchClicked }) => ({
  position: isSearchClicked ? 'sticky' : 'static',
  top: 0,
  zIndex: 1100,
  backgroundColor: colors.secondaryBackground,
  transition: 'all 0.3s ease-in-out',
  paddingTop: isSearchClicked ? '10px' : '0',
  paddingBottom: isSearchClicked ? '10px' : '0',
  boxShadow: isSearchClicked ? colors.bxshadowbtn : 'none',
  marginBottom: '16px'
}));

// Category Components
export const CategorySectionContainer = styled(Box)(({ isSticky, isSearchClicked }) => ({
  position: 'sticky',
  top: isSearchClicked ? '60px' : '0px',
  zIndex: 1090,
  backgroundColor: colors.secondaryBackground,
  transition: 'all 0.3s ease-in-out'
}));

export const CategoryWrapper = styled(Box)(({ isSticky }) => ({
  marginLeft: isSticky ? '-40px' : '-15px',
  display: 'flex',
  overflowX: 'auto',
  whiteSpace: 'nowrap',
  padding: '10px',
  marginTop: 0,
  marginBottom: '16px',
  position: isSticky ? 'fixed' : 'relative',
  backgroundColor: colors.categoryBackground,
  boxShadow: isSticky ? colors.bxshadowbtn : 'none',
  borderBottom: `1px solid ${colors.categoryBorder}`,
  alignItems: 'center',
  width: isSticky ? '109%' : '109%',
  '&::-webkit-scrollbar': {
    display: 'none'
  },
  scrollbarWidth: 'none'
}));

export const StyledCategoryButton = styled(Button)(({ isActive }) => ({
  backgroundColor: isActive ? colors.categoryActive : colors.commonbtnbg,
  color: isActive ? colors.categoryActiveText : colors.commonbtntextcolor,
  borderRadius: colors.borderRadius25,
  fontSize: '11px',
  padding: '6px 12px',
  marginRight: '8px',
  border: isActive ? 'none' : `1px solid ${colors.categoryBorder}`,
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  minWidth: '60px',
  textAlign: 'center',
  flexShrink: 0,
  fontWeight: isActive ? 'bold' : 'normal',
  boxShadow: isActive ? colors.bxshadowbtn : 'none',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    backgroundColor: isActive ? colors.categoryActive : colors.alternate,
    opacity: isActive ? 0.9 : 1
  }
}));

export const CategoryCard = styled(Card)(({ theme, isActive }) => ({
  marginBottom: theme.spacing(5),
  padding: theme.spacing(2),
  transition: theme.transitions.create(['box-shadow', 'transform', 'background-color'], {
    duration: theme.transitions.duration.standard
  }),
  transform: isActive ? 'scale(1.02)' : 'scale(1)',
  backgroundColor: isActive ? colors.primary : colors.linkSectionBackground,
  boxShadow: isActive ? colors.bxshadowbtn : 'none',
  '&:hover': {
    transform: 'scale(1.01)',
    boxShadow: colors.bxshadowbtn
  }
}));

// Link Components
export const LinksSectionContainer = styled(Box)({
  marginBottom: colors.sectionmb,
  width: '100%'
});

export const LinkGrid = styled(Box)({
  width: '100%',
  margin: 0,
  background: 'transparent'
});

export const LinkCard = styled(Card)({
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'transparent',
  boxShadow: 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    transition: 'transform 0.2s ease-in-out'
  }
});

// Button Components
export const CommonButton = styled(Button)({
  backgroundColor: colors.commonbtnbg,
  color: colors.commonbtntextcolor,
  boxShadow: colors.bxshadowbtn,
  
  borderRadius: colors.borderRadius25,
  '&:hover': {
    backgroundColor: colors.alternate,
    boxShadow: colors.bxshadowbtn,
	opacity: 0.9
  }
});


export const CallButton = styled(CommonButton)({
  backgroundColor: colors.callbuttonbg,
  color: colors.secondaryBackground,
  '&:hover': {
    backgroundColor: colors.callbuttonbg,
    opacity: 0.9
  }
});

export const WhatsAppButton = styled(CommonButton)({
  backgroundColor: colors.whatsappbuttonbg,
  color: colors.secondaryBackground,
  '&:hover': {
    backgroundColor: colors.whatsappbuttonbg,
    opacity: 0.9
  }
});

// Card Components with enhanced styles
export const EnhancedCard = styled(Card)(({ theme }) => ({
  backgroundColor: colors.secondaryBackground,
  borderRadius: colors.borderRadius25,
  boxShadow: colors.bxshadowbtn,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: colors.bxshadowbtn,
  },
}));

// WebApps Page Specific Styles
export const WebAppsContainer = styled(Container)({
  maxWidth: 'lg',
});

export const WebAppsTitle = styled(Typography)({
  fontSize: '20px',
  padding: '10px',
  textAlign: 'center',
});

export const SearchTextField = styled(TextField)({
  marginBottom: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '30px',
    padding: '8px 16px',
    height: '45px',
    transition: 'all 0.3s ease',
    backgroundColor: '#ffffff',
    '& fieldset': {
      border: '1px solid #ddd',
    },
    '&:hover fieldset': {
      borderColor: '#aaa',
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.searchbaractiveborder + ' !important',
      borderWidth: '1px',
      boxShadow: `0 0 5px ${colors.searchbaractiveborder}40`,
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '10px',
  },
});

export const SearchEngineAvatar = styled(Avatar)(({ isSelected }) => ({
  width: 40,
  height: 40,
  padding: '8px',
  backgroundColor: isSelected ? colors.primary : 'gray',
  cursor: 'pointer',
}));

export const PopularLinksContainer = styled(Paper)({
  padding: 2,
  marginBottom: 2,
});

export const CategoryListBox = styled(Box)(({ isSticky }) => ({
  display: isSticky ? 'flex' : '-webkit-inline-box',
  flexDirection: isSticky ? 'column' : 'row',
  overflowX: isSticky ? 'visible' : 'auto',
  overflowY: isSticky ? 'auto' : 'visible',
  position: isSticky ? 'sticky' : 'static',
  top: isSticky ? '0px' : 'auto',
  maxHeight: isSticky ? 'calc(100vh - 40px)' : 'auto',
  width: isSticky ? '60px' : '100%',
  padding: '16px 0',
  backgroundColor: isSticky ? colors.secondaryBackground : 'transparent',
  zIndex: 1,
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '-ms-overflow-style': 'none',
  'scrollbar-width': 'none',
}));

export const CategoryItem = styled(Box)(({ isActive, isSticky }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingLeft: '0px',
  paddingTop: '4px !important',
  paddingBottom: '4px !important',
  width: isSticky ? 'auto' : '70px',
  marginRight: '4px !important',
  marginLeft: '4px !important',
  marginTop: '0px !important',
  marginBottom: isSticky ? '6px !important' : '0px',
  border: isSticky ? '0px solid #d9c3c3' : '1px solid #d9c3c3',
  borderRadius: isSticky ? '8px' : '8px',
  height: isSticky ? '100px' : 'auto',
  fontSize: '9px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  transform: isActive ? 'scale(1.05)' : 'scale(1)',
  backgroundColor: isActive ? colors.primary : 'transparent',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

export const CategoryItemAvatar = styled(Avatar)(({ isActive }) => ({
  width: 40,
  height: 40,
  transition: 'all 0.3s ease',
  transform: isActive ? 'scale(1.1)' : 'scale(1)',
  border: isActive ? '2px solid' : 'none',
  borderColor: colors.primary,
}));

export const CategoryItemText = styled(Typography)(({ isActive }) => ({
  marginTop: '4px',
  fontWeight: isActive ? 'normal' : 'normal',
  color: isActive ? colors.categoryActiveText : colors.primaryText,
  fontSize: '11px',
  textAlign: 'center',
  width: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  padding: '0 2px',
  lineHeight: '1.2'
}));

export const LinksByCategoryPaper = styled(Paper)(({ isActive }) => ({
  padding: 16,
  marginBottom: 16,
  backgroundColor: isActive ? colors.categoryActive : 'transparent',
  transition: 'background-color 0.3s ease, transform 0.3s ease',
  transform: isActive ? 'scale(1.02)' : 'scale(1)',
  borderRadius: '10px',
  '&:hover': {
    transform: 'scale(1.01)',
  },
}));

export const LinkItem = styled(Box)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: '0px solid #e0e0e0',
  borderRadius: '8px',
  padding: '0px',
  transition: 'box-shadow 0.3s',
});

export const LinkItemAvatar = styled(Avatar)({
  width: 50,
  height: 50,
  marginBottom: 8,
  padding: '0px',
  border: '2px solid #b3b3b3',
});

export const LinkItemText = styled(Typography)({
  textDecoration: 'none',
  color: 'rgba(0, 0, 0, 0.87)',
  fontWeight: 'bold',
  lineHeight: '12px',
  fontSize: '11px',
  display: '-webkit-box',
  WebkitBoxOrient: 'vertical',
  width: '100%',
  overflow: 'hidden',
  WebkitLineClamp: 2,
  textOverflow: 'ellipsis',
});

export const MoreButton = styled(Typography)({
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'normal',
  border: '2px solid #c3a7a7',
  borderRadius: '50%',
  fontSize: '11px',
  width: '50px',
  display: 'block',
  height: '50px',
  margin: '0 auto',
  paddingTop: '14px',
  background: '#c3a7a7',
  '&:hover': {
    textDecoration: 'underline',
  },
});

// Renamed Banner Container for WebApps
export const WebAppsBannerContainer = styled(Box)({
  position: 'relative',
  height: '200px',
  overflow: 'hidden',
  marginTop: '-20px !important',
});

export const BannerImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  borderRadius: '15px',
  width: '100%',
  height: '100%',
  background: colors.secondaryBackground,
   objectFit: 'contain',
  transition: 'opacity 0.5s ease-in-out',
  paddingBottom: '10px',
});

// Add these to your theme-styles.js
export const PopularLinksWrapper = styled(Paper)(({ theme }) => ({
  padding: 16,
  marginBottom: 16,
}));

export const PopularLinkItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  textAlign: 'center',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
  },
});

export const PopularLinkAvatar = styled(Avatar)({
  width: 50,
  height: 50,
  marginBottom: 8,
});

export const PopularLinkText = styled(Typography)({
  fontSize: '0.75rem',
  textAlign: 'center',
  color: colors.primaryText,
});

export const ShowMoreButton = styled(Button)({
  margin: '16px auto',
  display: 'block',
  color: colors.primary,
  borderColor: colors.primary,
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: 'rgba(195, 81, 47, 0.04)',
  },
});

// Loading Components
export const LoadingWrapper = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh'
});

// Error Display Components
export const ErrorWrapper = styled(Box)({
  textAlign: 'center',
  marginTop: '16px'
});

export const ErrorText = styled(Typography)({
  color: colors.error,
  fontWeight: 500
});

// Search Results Components
export const SearchResultsContainer = styled(Box)({
  marginTop: '16px'
});

export const SearchResultItem = styled(Box)({
  textDecoration: 'none',
  color: 'inherit',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  border: `1px solid ${colors.primary}`,
  borderRadius: '19px',
  padding: '8px',
  transition: 'box-shadow 0.3s, transform 0.2s',
  '&:hover': {
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    transform: 'translateY(-2px)'
  }
});

// Search Box Wrapper
export const SearchSection = styled(Box)({
  marginBottom: '32px'
});

// Search Engine List
export const SearchEngineList = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px'
});

export const SearchEngineItem = styled(Box)({
  margin: '0 8px',
  textAlign: 'center',
  cursor: 'pointer'
});

// Category Section Wrapper
export const CategorySection = styled(Box)(({ isSticky }) => ({
  display: 'flex',
  flexDirection: isSticky ? 'row' : 'column',
  width: '100%'
}));

// Content Section
export const ContentSection = styled(Box)(({ isSticky }) => ({
  flex: 1,
  paddingLeft: isSticky ? '16px' : 0,
  paddingTop: isSticky ? 0 : '16px'
}));

// Banner Section
export const BannerSection = styled(Box)({
  position: 'relative',
  height: '200px',
  overflow: 'hidden',
  marginTop: '-20px',
  marginBottom: '16px'
});

// Common Grid Container
export const GridContainer = styled(Grid)({
  width: '100%',
  margin: 0,
  background: 'transparent'
});

// Search Button Container
export const SearchButtonContainer = styled(Box)({
  textAlign: 'center',
  marginTop: '16px'
});

// Common Button Styles
export const StyledButton = styled(Button)({
  backgroundColor: colors.primary,
  color: colors.secondaryBackground,
  '&:hover': {
    backgroundColor: colors.secondary,
    opacity: 0.9
  }
});

// Footer Banner Container
export const FooterBannerContainer = styled(Box)({
  marginTop: '32px'
});


// Search Engine Components
export const SearchEngineContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '16px',
  gap: '16px'
});


export const SearchEngineName = styled(Typography)({
  fontSize: '12px',
  marginTop: '4px',
  color: colors.primaryText,
  fontWeight: 'normal'
});

// Category Page Specific Components
export const CategoryPageContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh'
});

export const CategoryBannerContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  padding: { xs: 2, sm: 3 },
});

export const CategoryBannerWrapper = styled(Box)({
  position: 'relative',
  width: '100%',
  height: { xs: '150px', sm: '200px' },
  overflow: 'hidden',
  borderRadius: '12px',
});

export const CategoryHeader = styled(Box)({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: colors.secondaryBackground,
  padding: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
});

export const CategoryTabsContainer = styled(Box)({
  display: 'flex',
  overflowX: 'auto',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': { display: 'none' },
  scrollbarWidth: 'none',
});

export const CategoryTab = styled(Box)(({ isActive }) => ({
  padding: '8px 16px',
  marginRight: '8px',
  borderRadius: '20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  backgroundColor: isActive ? colors.error : 'transparent',
  color: isActive ? colors.secondaryBackground : colors.primaryText,
  '&:hover': {
    backgroundColor: isActive ? colors.error : colors.alternate,
  },
  transition: 'all 0.3s ease-in-out',
}));

export const CategoryContent = styled(Box)({
  flexGrow: 1,
  padding: '16px'
});

export const CategorySearchEngines = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap',
  marginBottom: '16px'
});

export const SearchEngineBox = styled(Box)({
  margin: '0 8px',
  marginBottom: '8px',
  textAlign: 'center',
  cursor: 'pointer',
  width: 'calc(25% - 16px)',
  minWidth: '60px',
});

export const LinkPaper = styled(Paper)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '16px',
  borderRadius: '16px',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
  },
});

export const LinkAvatar = styled(Avatar)({
  width: 60,
  height: 60,
  marginBottom: '16px',
  backgroundColor: '#f5f5f5',
});

export const LinkTitle = styled(Typography)({
  fontWeight: '500',
  color: '#333',
  fontSize: '14px',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%',
  textAlign: 'center'
});


// Add these new components
export const CategoryTabContent = styled(Box)(({ isActive }) => ({
  padding: '8px 16px',
  marginRight: '8px',
  borderRadius: '20px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  backgroundColor: isActive ? colors.error : 'transparent',
  color: isActive ? colors.secondaryBackground : colors.primaryText,
  '&:hover': {
    backgroundColor: isActive ? colors.error : colors.alternate,
    transform: 'translateY(-2px)',
  },
  transition: 'all 0.3s ease-in-out',
}));

export const SubCategorySection = styled(Box)({
  marginBottom: '32px',
  '& h6': {
    marginBottom: '16px',
    fontWeight: 600
  }
});

export const CategoryGridContainer = styled(Grid)({
  '& .MuiGrid-item': {
    paddingTop: '8px',
    paddingBottom: '8px'
  }
});

export const LinkItemContainer = styled('a')({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  height: '100%',
  '&:hover': {
    textDecoration: 'none'
  }
});

export const SearchResultText = styled(Typography)({
  textAlign: 'center',
  marginTop: '16px',
  marginBottom: '24px',
  color: colors.secondaryText
});

export const NoResultsContainer = styled(Box)({
  textAlign: 'center',
  padding: '32px',
  '& > *': {
    marginBottom: '16px'
  }
});

export const CarouselContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: { xs: '150px', sm: '200px' },
  overflow: 'hidden',
  borderRadius: '12px',
});

export const CarouselImage = styled(Box)({
  width: '100%',
  height: '100%',
  position: 'relative',
});

export const CarouselImageItem = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// Define carousel settings object
export const carouselSettings = {
  indicators: true,
  navButtonsAlwaysVisible: true,
  animation: "fade",
  interval: 4000,
  indicatorContainerProps: {
    style: {
      position: 'absolute',
      bottom: '8px',
      zIndex: 1,
      width: '100%',
      textAlign: 'center',
    }
  },
  indicatorIconButtonProps: {
    style: {
      padding: '4px',
      color: 'rgba(255, 255, 255, 0.5)',
    }
  },
  activeIndicatorIconButtonProps: {
    style: {
      color: '#fff'
    }
  },
  sx: {
    height: '100%'
  }
};

export const ProductCard = styled(Card)({
  borderRadius: '12px',
  backgroundColor: colors.cardBackground,
  boxShadow: colors.shadow,
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0px 5px 20px rgba(0, 0, 0, 0.2)',
  },
});

export const ProductImage = styled('img')({
  height: '150px',
  objectFit: 'contain',
  marginBottom: '8px',
});

export const CategoryButton = styled(Button)(({ isActive }) => ({
  backgroundColor: isActive ? colors.primary : colors.cardBackground,
  color: isActive ? colors.cardBackground : colors.textPrimary,
  borderRadius: '20px',
  margin: '4px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: colors.primary,
    opacity: 0.9,
  },
}));

export const SearchContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: colors.cardBackground,
  borderRadius: '20px',
  padding: '8px 16px',
  boxShadow: colors.shadow,
});

export const SearchInput = styled(InputBase)({
  flex: 1,
  marginLeft: '8px',
  fontSize: '1rem',
  color: colors.textPrimary,
});

export const StickyHeader = styled(AppBar)({
  backgroundColor: colors.cardBackground,
  boxShadow: 'none',
  transition: 'box-shadow 0.3s ease',
  '&.sticky': {
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
  },
});

export const HeaderToolbar = styled(Toolbar)({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0 16px',
});



export default {
  colors,
  WebAppsContainer,
  WebAppsTitle,
  SearchTextField,
  SearchEngineAvatar,
  PopularLinksContainer,
  CategoryListBox,
  CategoryItem,
  CategoryItemAvatar,
  CategoryItemText,
  LinksByCategoryPaper,
  LinkItem,
  LinkItemAvatar,
  LinkItemText,
  MoreButton,
  WebAppsBannerContainer,
  BannerImage,
  
};