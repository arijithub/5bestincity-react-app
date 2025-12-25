import React, { useState, useEffect } from 'react';
import './Legal.css';
import { API_BASE_URL } from '../../config/apiConfigext';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';

const PrivacyPolicy = () => {
  const [policyData, setPolicyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}get_privacy_policy.php`)
      .then(response => response.json())
      .then(data => {
        setPolicyData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  // Fallback content in case API fails
  const fallbackPolicy = {
    sections: [
      {
        title: "1. Information Collection",
        content: "We collect information to provide better services to our users."
      },
      {
        title: "2. Data Usage",
        content: "Your data is used to improve user experience and our services."
      },
      // Add more sections as needed
    ]
  };

  const displayData = policyData || fallbackPolicy;

  return (
    <Container maxWidth="lg" className="legal-wrapper" sx={{ paddingTop: 4 }}>
      <Paper elevation={3} className="legal-paper">
        <Box className="legal-header">
          <Typography variant="h3" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>
        </Box>

        <Box className="legal-content">
          {displayData.sections.map((section, index) => (
            <Box key={index} className="legal-section">
              <Typography variant="h5" component="h2" gutterBottom>
                {section.title}
              </Typography>
              <Typography variant="body1" paragraph>
                {section.content}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;