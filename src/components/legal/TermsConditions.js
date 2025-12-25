import React, { useState, useEffect } from 'react';
import './Legal.css';
import { API_BASE_URL } from '../../config/apiConfigext';
import { Container, Paper, Typography, Box, CircularProgress } from '@mui/material';
import GavelIcon from '@mui/icons-material/Gavel';

const TermsConditions = () => {
  const [termsData, setTermsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}get_terms_conditions.php`)
      .then(response => response.json())
      .then(data => {
        setTermsData(data);
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
  const fallbackTerms = {
    sections: [
      {
        title: "1. Acceptance of Terms",
        content: "By accessing and using this website, you accept and agree to be bound by these terms and conditions."
      },
      {
        title: "2. Use License",
        content: "This is a license to use our services according to these terms."
      },
      // Add more sections as needed
    ]
  };

  const displayData = termsData || fallbackTerms;

  return (
    <Container maxWidth="lg" className="legal-wrapper" sx={{ paddingTop: 4 }}>
      <Paper elevation={3} className="legal-paper">
        <Box className="legal-header">
          <Typography variant="h3" component="h1" gutterBottom>
            Terms and Conditions
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

export default TermsConditions;