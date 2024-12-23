import React, { useContext } from "react";
import blueLogo from "../../../assets/images/blue logo.png";
import grayLogo from "../../../assets/images/gray logo.png";
import { Copyright, Email, Facebook, Instagram } from "@mui/icons-material";
import {
  createTheme,
  Container,
  CssBaseline,
  Link,
  ThemeProvider,
  Box,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import { ThemeContext } from "../../../context/ThemeProviderComponent";

const Footer = ({ bgColor }) => {
  const currentYear = new Date().getFullYear();
  const { mode } = useContext(ThemeContext);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  // Define background and text colors based on the theme and bgColor prop
  const backgroundColor =
    bgColor === "#00008b"
      ? mode === "dark"
        ? "#2d2d2d" // Dark background in dark mode
        : "#00008b" // Blue background in light mode
      : mode === "dark"
      ? "#2d2d2d" // Default dark mode background
      : "#fff"; // Default light mode background

  const textColor =
    bgColor === "#00008b" ? "#fff" : mode === "dark" ? "#fff" : "#00008b";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: backgroundColor,
          py: 3,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            <Grid item xs={12} md={4}>
              <Link href="/">
                <img
                  src={
                    bgColor === "#00008b"
                      ? grayLogo
                      : mode === "dark"
                      ? grayLogo
                      : blueLogo
                  }
                  alt="logo"
                  style={{ width: "150px" }}
                />
              </Link>
              <Typography variant="h6" color={textColor}>
                You're Welcome
              </Typography>
            </Grid>

            <Grid item xs={12} md={4} sx={{ mt: 2 }}>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
              >
                <Link href="/" color="inherit" underline="hover" sx={{ mb: 1 , color: textColor }}>
                  Home
                </Link>
                <Link
                  href="/Market Place"
                  color="inherit"
                  underline="hover"
                  sx={{ mb: 1 , color: textColor }}
                >
                  Market Place
                </Link>
                <Link
                  href="/Questions"
                  color="inherit"
                  underline="hover"
                  sx={{ mb: 1, color: textColor}}
                >
                  Questions
                </Link>
                <Link
                  href="/Mechanic Proposals"
                  color="inherit"
                  underline="hover"
                  sx={{ mb: 1 , color: textColor}}
                >
                  Mechanic Proposals
                </Link>
                <Link href="/Contact Us" color="inherit" underline="hover" sx={{mb:1, color: textColor}}>
                  Contact Us
                </Link>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" color={textColor} gutterBottom>
                Stay Connected 🙂
              </Typography>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <IconButton href="https://www.instagram.com" color="inherit">
                  <Instagram  sx={{ color: textColor}} />
                </IconButton>
                <IconButton href="https://www.facebook.com" color="inherit">
                  <Facebook sx={{ color: textColor}}/>
                </IconButton>
                <IconButton
                  href="mailto:baqerqabalan2@gmail.com"
                  color="inherit"
                >
                  <Email sx={{ color: textColor }}/>
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          <Box mt={2} textAlign="center">
            <Typography variant="body2" color={textColor}>
              Implemented by Baqer Qabalan
            </Typography>
            <Typography
              variant="body2"
              color={textColor}
              sx={{ fontSize: "12px", mt: 1 }}
            >
              Copyright <Copyright fontSize="small" /> {currentYear}
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Footer;