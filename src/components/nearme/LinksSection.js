import React, { useEffect, useRef } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { colors } from '../../theme-styles';
import '../../styles/master.css';
import '../../styles/custom-styles.css';
import { API_ENDPOINTS,DEFAULT_IMAGE_BASE_URL } from '../../config/apiConfigext';
const LinksSection = ({ linkData, activeCategory, sectionRefs }) => {
  const theme = useTheme();
  const sectionRef = useRef(null);

  return (
    <Box 
      className="links-section-box"
      ref={sectionRef}
      sx={{
        position: 'relative',
        zIndex: 1,
        mt: 0,
        pt: 1
      }}
    >
      {linkData.map((category) => (
        <Paper 
          className="cat-cardbox"
          key={category.subcat_id}
          ref={(el) => {
            if (el) {
              sectionRefs.current[category.sub_category_name] = el;
            }
          }}
          elevation={category.sub_category_name === activeCategory ? 8 : 1}
          sx={{
            mt: 1,
            mb: 2,
            p: 10,
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
                    <CardContent className="cardTitle"> 
                      <Typography 
                        variant="body2" 
                        sx={{
                          fontSize: '0.75rem',
                          lineHeight: '1.2',
                          color: category.sub_category_name === activeCategory
                            ? colors.primaryText
                            : '#000',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >  
                        {link.link_name}
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