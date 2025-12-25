import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import { API_ENDPOINTS,DEFAULT_IMAGE_BASE_URL } from '../../config/apiConfigext';
import { trackLinkClick, getRecentlyViewed, getMostViewed } from '../../utils/linkDatabase';

const LinksSection = ({ linkData, activeCategory, sectionRefs, setRecentlyViewed, setMostViewed }) => {
  const theme = useTheme();
  const sectionRef = useRef(null);

  const handleLinkClick = async (e, link, category) => {
    e.preventDefault();
    try {
      const linkObject = {
        link_id: link.link_id,
        link_name: link.link_name,
        link_URL: link.link_URL,
        link_image: link.link_image,
        category_id: category.category_id,
        sub_category_name: category.sub_category_name
      };

      await trackLinkClick(linkObject);
      const [recent, most] = await Promise.all([
        getRecentlyViewed(),
        getMostViewed()
      ]);
      setRecentlyViewed(recent);
      setMostViewed(most);
      
      // Modify the URL before opening
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
      className="links-section-box"
      ref={sectionRef}
      sx={{
        position: 'relative',
        zIndex: 1,
        mt: 0,
        pt: 0,
        marginTop: '-20px',
      }}
    >
      {linkData.map((category, index) => (
        <Paper 
          className="cat-cardbox"
          key={category.subcat_id}
          id={`category-${category.category_id}`}
          ref={(el) => {
            if (el) {
              sectionRefs.current[category.sub_category_name] = el;
            }
          }}
          elevation={category.sub_category_name === activeCategory ? 8 : 1}
          sx={{
            mt: index === 0 ? '20px' : 1,
            mb: 2,
            p: 10,
            scrollMarginTop: '100px',
            transition: theme.transitions.create(['box-shadow', 'transform', 'background-color', 'margin'], {
              duration: theme.transitions.duration.standard,
            }),
            transform: category.sub_category_name === activeCategory ? 'scale(1.02)' : 'scale(1)',
            backgroundColor: category.sub_category_name === activeCategory 
              ? colors.accent2Light
              : colors.linkSectionBackground,
            '&:hover': {
              transform: 'scale(1.01)',
            },
            position: 'relative',
            zIndex: category.sub_category_name === activeCategory ? 1 : 'auto',
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              color: category.sub_category_name === activeCategory 
                ? colors.primaryText
                : colors.secondary, 
              fontWeight: 'bold',
              paddingLeft: '10px',
            }}
          >
            {category.sub_category_name}
          </Typography>
          
          <Grid container spacing={1} sx={{ width: '100%', margin: 0, background: 'transparent' }}>
            {category.links.map((link) => (
              <Grid 
                item 
                xs={3}
                sm={3} 
                md={4} 
                lg={3} 
                xl={2} 
                key={link.link_id} 
                sx={{ 
                  width: '25%',
                  padding: '0px',
                  boxSizing: 'border-box',
                  paddingTop: '8px',
                  paddingLeft: '5px'
                }}
              >
                <a 
                  href={link.link_URL} 
                  className="category-link-box"
                  onClick={(e) => handleLinkClick(e, link, category)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Card 
                    className="grid-item"
                    sx={{ 
                      textAlign: 'center',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      background: 'transparent',
                    }}
                  >
                    <Box
                      component="img"
                      src={link.link_image}
                      alt={link.link_name}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = DEFAULT_IMAGE_BASE_URL;
                      }}
                      sx={{ 
                        width: 60,
                        height: 60, 
                        margin: 'auto',  
                        pt: 1, 
                        borderRadius: '50%', 
                        background: colors.secondaryBackground,
                        border: `2px solid ${colors.secondaryBackground}`,
                        padding: '2px',
                        objectFit: 'contain'
                      }}
                    />
                    <CardContent className="cardTitle" sx={{ 
                      padding: '4px !important',
                      width: '100%',
                      textAlign: 'center',
                      maxWidth: {
                        xs: '70px',  // Limit width on mobile
                        sm: '100%'   // Full width on larger screens
                      },
                      margin: '0 auto'
                    }}> 
                      <Typography 
                        variant="body2" 
                        component="div"  // Changed to div for better text wrapping
                        sx={{
                          fontSize: {
                            xs: '10px',  // Smaller font on mobile
                            sm: '11px'   // Regular size on larger screens
                          },
                          lineHeight: '1.1',
                          color: category.sub_category_name === activeCategory ? colors.primaryText : '#000',
                          display: 'block',  // Changed to block
                          maxHeight: '22px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          wordBreak: 'break-all',  // Changed to break-all
                          textAlign: 'center',
                          padding: '0 2px',
                          '& > span': {  // Wrap text in a span
                            display: 'inline-block',
                            maxWidth: '100%'
                          }
                        }}
                      >  
                        <span>{link.link_name}</span>
                      </Typography>
                    </CardContent>
                  </Card>
                </a>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Box>
  );
};

export default LinksSection;