import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { DEFAULT_IMAGE_AMAZON_URL } from '../../config/apiConfigext';

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  width: '100%',
  height: '100%',
  backgroundColor: '#ffffff',
  boxShadow: '0px 3px 15px rgba(0,0,0,0.1)',
  borderRadius: '12px',
  padding: theme.spacing(2),
  transition: '0.3s',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0px 5px 20px rgba(0,0,0,0.2)',
  },
  cursor: 'pointer',
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
  height: '150px',
  width: '100%',
  objectFit: 'contain',
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
  backgroundColor: '#f8f8f8',
  color: '#ff7043',
  padding: theme.spacing(0.5, 2),
  borderRadius: '24px',
  textAlign: 'center',
  fontWeight: 'bold',
  fontSize: '0.85rem',
  marginTop: theme.spacing(1),
  alignSelf: 'center',
}));

const decodeHtmlEntities = (text) => {
  if (!text) return '';
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
};

const ProductCard = ({ product, onClick }) => {
  if (!product) return null;

  const decodedProductName = decodeHtmlEntities(product.product_name);

  const handleImageError = (e) => {
    e.target.src = DEFAULT_IMAGE_AMAZON_URL;
    e.target.onerror = null;
  };

  return (
    <StyledCard onClick={() => onClick(product.product_url)}>
      <StyledCardMedia
        component="img"
        src={product.product_image_url || DEFAULT_IMAGE_AMAZON_URL}
        onError={handleImageError}
        alt={decodedProductName}
        loading="lazy"
        decoding="async"
        fetchpriority="low"
      />
      <CardContent sx={{ 
        padding: '4px 0px 0px',
        '&:last-child': { 
          paddingBottom: '4px'
        }
      }}>
        <Typography
          variant="body1"
          component="div"
          sx={{
            fontWeight: 500,
            color: '#333',
            fontSize: '0.875rem',
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.4em',
            mb: '2px',
          }}
        >
          {decodedProductName}
        </Typography>

        <Box sx={{ mt: '2px' }}>
          {product.product_price && product.product_price !== product.offer_price && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ 
                textDecoration: 'line-through',
                fontSize: '0.75rem',
                lineHeight: 1.2,
                mb: '2px'
              }}
            >
              ₹{product.product_price}
            </Typography>
          )}
          <Typography
            variant="h6"
            sx={{ 
              fontWeight: 'bold',
              color: '#ff7043',
              fontSize: '1rem',
              lineHeight: 1.2
            }}
          >
            ₹{product.offer_price}
          </Typography>
        </Box>
      </CardContent>
      {product.discount_percentage && (
        <DiscountBadge>
          {Math.round(product.discount_percentage)}% off
        </DiscountBadge>
      )}
    </StyledCard>
  );
};

export default ProductCard; 