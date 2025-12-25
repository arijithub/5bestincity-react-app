import React from 'react';
import { Typography } from '@mui/material';
import { EnhancedCard, ContentWrapper, colors, typography} from '../../../theme-styles';


const Description = ({ description }) => (
  <Typography 
    variant="body1" 
    sx={{ 
      color: colors.primaryText,
      lineHeight: 1.8
    }}
  >
    {description}
  </Typography>
);

export default Description;