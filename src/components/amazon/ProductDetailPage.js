import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardMedia, Typography, Container } from '@mui/material';
import he from 'he';
import { ENDPOINTS, getApiUrl } from '../../config/apiConfigext';

function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    fetch(getApiUrl(ENDPOINTS.AMAZON_API, `productId=${productId}`))
      .then(response => response.json())
      .then(data => {
        const foundProduct = data.amazondata.find(p => p.product_id.toString() === productId);
        setProduct(foundProduct);
      })
      .catch(error => console.error('Failed to load product details:', error));
  }, [productId]);

  if (!product) return <div>Loading...</div>;

  return (
    <Container>
      <Card>
        <CardMedia
          component="img"
          height="300"
          image={product.product_image_url}
          alt={product.product_name}
        />
        <CardContent>
          <Typography gutterBottom variant="h4" component="div">
            {he.decode(product.product_name)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {product.description}
          </Typography>
          <Typography variant="h6" color="primary">
            Price: ₹{product.offer_price}
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ProductDetailPage;
