import { styled } from '@mui/material/styles';
import { Card } from '@mui/material';

export const colors = {
  primary: '#2c3e50', // Dark blue-gray
  secondary: '#34495e', // Slightly lighter blue-gray
  accent: '#3498db', // Bright blue
  text: '#333333', // Dark gray for text
  background: '#ecf0f1', // Light gray background
};

export const EnhancedCard = styled(Card)(({ theme }) => ({
  background: colors.background,
  borderRadius: '12px',
  padding: theme.spacing(3),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-5px) rotateX(5deg)',
    boxShadow: '0 20px 30px rgba(0, 0, 0, 0.2)',
  },
  '&:active': {
    transform: 'translateY(-8px) rotateX(8deg) scale(1.02)',
    boxShadow: '0 25px 35px rgba(0, 0, 0, 0.3)',
  },
}));

export const ContentWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  background: '#ffffff',
  border: `1px solid ${colors.background}`,
}));