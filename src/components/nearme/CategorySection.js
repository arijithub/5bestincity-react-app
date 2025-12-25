import React, { useEffect, useRef } from 'react';
import { Box, Button, Avatar, Typography } from '@mui/material';
import { colors } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';


const CategorySection = ({ categories, onCategoryClick, activeCategory, isSticky, isSearchActive }) => {
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
        minWidth: '100vw',
        marginLeft: '-20px',
        left: isSticky ? 0 : 'auto',
        padding: '8px 16px',
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        scrollbarWidth: 'none',
        transition: 'all 0.3s ease-in-out',
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
                src={category.category_image}
                alt={category.category_name}
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
                  bgcolor: !category.category_image ? colors.default_category_avatar : '#ffffff',
                  color: !category.category_image ? colors.categoryActiveText : 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: 'medium'
                }}
              >
                {!category.category_image && ((category.category_name || category.sub_category_name || '#').charAt(0).toUpperCase())}
              </Avatar>
              {category.sub_category_name}
            </>
          )}
        </Button>
      ))}
    </Box>
  );
};

export default CategorySection;