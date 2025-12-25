import React, { useEffect, useRef } from 'react';
import { Box, Button, Avatar, Typography } from '@mui/material';
import { colors } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import { trackLinkClick, getRecentlyViewed, getMostViewed } from '../../utils/linkDatabase';

const CategorySection = ({ categories, onCategoryClick, activeCategory, isSticky, isSearchActive, setRecentlyViewed, setMostViewed }) => {
  const containerRef = useRef(null);
  const buttonsRef = useRef({});

  useEffect(() => {
    const scrollActiveButtonIntoView = () => {
      const activeButton = buttonsRef.current[activeCategory];
      if (activeButton && containerRef.current) {
        const container = containerRef.current;
        const buttonRect = activeButton.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        if (buttonRect.left < containerRect.left) {
          container.scrollTo({
            left: container.scrollLeft + buttonRect.left - containerRect.left - 20,
            behavior: 'smooth'
          });
        } else if (buttonRect.right > containerRect.right) {
          container.scrollTo({
            left: container.scrollLeft + buttonRect.right - containerRect.right + 20,
            behavior: 'smooth'
          });
        }
      }
    };

    scrollActiveButtonIntoView();
  }, [activeCategory]);

  const handleLinkClick = async (e, link) => {
    e.preventDefault();
    try {
      await trackLinkClick(link);
      const [recent, most] = await Promise.all([
        getRecentlyViewed(),
        getMostViewed()
      ]);
      setRecentlyViewed(recent);
      setMostViewed(most);
      const url = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error handling link click:', error);
      const url = link.link_URL.startsWith('inapp:') ? link.link_URL : `inapp:${link.link_URL}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Box 
      ref={containerRef}
      className="category-container"
      sx={{
        marginTop: 0,
        marginBottom: '16px',
        position: isSticky ? 'fixed' : 'relative',
        top: isSticky ? (isSearchActive ? '60px' : 0) : 'auto',
        zIndex: isSticky ? 1090 : 'auto',
        boxShadow: isSticky ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none',
        borderBottom: isSticky ? `1px solid ${colors.categoryBorder}` : 'none',
        background: colors.app_primaryBackground,
        width: isSticky ? '100vw' : '100%',
        left: isSticky ? 0 : 'auto',
        right: isSticky ? 0 : 'auto',
        marginLeft: isSticky ? 
          `calc(-50vw + 50%)` : '0',
        padding: '8px 16px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        scrollbarWidth: 'none',
        transition: 'all 0.2s ease-out',
        transform: isSticky ? 'translateY(0)' : 'translateY(0)',
        willChange: 'transform',
        '&::-webkit-scrollbar': {
          display: 'none'
        },
      }}
    >
      {categories.map((category) => (
        <Button
          key={category.subcat_id}
          ref={(el) => (buttonsRef.current[category.sub_category_name] = el)}
          onClick={() => onCategoryClick(category.sub_category_name)}
          className="category-button"
          sx={{
            backgroundColor:
              activeCategory === category.sub_category_name
                ? colors.categoryActive
                : colors.accent2Light,
            color:
              activeCategory === category.sub_category_name 
                ? colors.categoryActiveText 
                : colors.commonbtntextcolor,
            borderRadius: colors.borderRadius35,
            padding: '2px 8px 2px 2px',
            marginRight: '4px',
            border:
              activeCategory === category.sub_category_name
                ? 'none'
                : `1px solid ${colors.categoryBorder}`,
            display: 'flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            minWidth: '30px',
            fontSize: '0.75rem',
            height: '26px',
            fontWeight: activeCategory === category.sub_category_name ? 'bold' : 'normal',
            boxShadow: activeCategory === category.sub_category_name ? colors.bxshadowbtn : 'none',
            '&:hover': {
              backgroundColor:
                activeCategory === category.sub_category_name
                  ? colors.categoryActive  
                  : colors.accent2Light,
              opacity: activeCategory === category.sub_category_name ? 0.9 : 1,
            },
          }}
        >
          {category.sub_category_name === 'All' ? (
            <Typography sx={{
              marginLeft: '8px',
              backgroundColor: 'transparent',
            }}>ALL</Typography>
          ) : (
            <>
              <Avatar
                src={category.sub_category_image || ''}
                alt={category.sub_category_name}
                className="category-avatar"
                imgProps={{
                  loading: "lazy",
                  decoding: "async",
                  fetchpriority: "low"
                }}
                sx={{
                  width: 26,
                  height: 26,
                  border: `1px solid ${colors.categoryBorder}`,
                  bgcolor: !category.sub_category_image ? colors.default_category_avatar : 'transparent',
                  color: !category.sub_category_image ? colors.categoryActiveText : 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  '& img': {
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%'
                  }
                }}
              >
                {!category.sub_category_image && category.sub_category_name.charAt(0).toUpperCase()}
              </Avatar>
              <span style={{ marginLeft: '4px' }}>{category.sub_category_name}</span>
            </>
          )}
        </Button>
      ))}
    </Box>
  );
};

export default CategorySection;