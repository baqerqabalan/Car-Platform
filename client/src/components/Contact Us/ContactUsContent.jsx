import React, { useContext, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  IconButton,
  Link,
  createTheme,
  ThemeProvider,
  CssBaseline,
  CircularProgress,
} from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import { Facebook, Instagram, LinkedIn } from "@mui/icons-material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import { getToken, isAuthenticated } from "../../helpers/authHelper";
import { useNavigate } from "react-router-dom";

const ContactUs = () => {
  const { mode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formValues, setFormValues] = useState({
    fullName: "",
    email: "",
    message: "",
  });

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Use setFormErrors here
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.fullName) {
      newErrors.fullName = "Full Name is required";
    }
    if (!formValues.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email address is invalid.";
    }

    if (!formValues.message) {
      newErrors.message = "Message is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (isAuthenticated()) {
      setLoading(true);

      if (!validateForm()) {
        setLoading(false);
        return;
      }

      setError(null);
      setMessage(null);

      try {
        const formData = new FormData();
        formData.append("fullName", formValues.fullName);
        formData.append("email", formValues.email);
        formData.append("message", formValues.message);

        const token = getToken();
        const response = await axios.post(
          `http://localhost:5000/api/v1/contacts/contact`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle successful message submission
        if (response.status === 201) {
          setMessage("Message sent successfully");
          setTimeout(() => {
            setFormValues({ fullName: "", email: "", message: "" });
            setMessage(null);
          }, 1000);
        }
      } catch (error) {
        console.error("Error sending the message:", error);
        setError(error.response.data.message || "Something went wrong");
        setTimeout(() => {
          setFormValues({ fullName: "", email: "", message: "" });
          setError(null);
        },1000);
      } finally {
        setLoading(false);
      }
    } else {
      navigate("/login?redirect=/Contact Us");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ mt: 1, mb: 4 }}>
        <Container
          maxWidth="md"
          sx={{
            padding: { xs: 3, md: 5 },
            backgroundColor: theme.palette.background.paper,
            borderRadius: "12px",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 4px 16px rgba(255,255,255,0.3)"
                : "0 4px 16px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: theme.palette.mode === "dark" ? "#fff" : "#333",
            }}
          >
            Contact Us
          </Typography>
          <Typography
            variant="body1"
            align="center"
            sx={{
              mb: 4,
              color: theme.palette.mode === "dark" ? "#fff" : "#333",
            }}
          >
            We’d love to hear from you! Feel free to get in touch with any
            questions or feedback.
          </Typography>

          <Grid container spacing={5}>
            {/* Contact Information Section */}
            <Grid item xs={12} md={5}>
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.mode === "dark" ? "#fff" : "#333",
                  }}
                >
                  Contact Information
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Email color="primary" sx={{ mr: 1 }} />
                  <Typography>Email: carisco@gmail.com</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Phone color="primary" sx={{ mr: 1 }} />
                  <Typography>Phone: +1 (123) 456-7890</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography>Location: Coming Soon 😀</Typography>
                </Box>
              </Box>

              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.mode === "dark" ? "#fff" : "#333",
                }}
              >
                Follow Us
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <IconButton
                  component={Link}
                  href="https://facebook.com"
                  target="_blank"
                  color="primary"
                >
                  <Facebook />
                </IconButton>
                <IconButton
                  component={Link}
                  href="https://instagram.com"
                  target="_blank"
                  color="primary"
                >
                  <Instagram />
                </IconButton>
                <IconButton
                  component={Link}
                  href="https://linkedin.com"
                  target="_blank"
                  color="primary"
                >
                  <LinkedIn />
                </IconButton>
              </Box>
            </Grid>

            {/* Form Section */}
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: theme.palette.mode === "dark" ? "#fff" : "#333",
                }}
              >
                Get in Touch
              </Typography>
              <Box component="form" noValidate autoComplete="off">
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={formValues.fullName || ""}
                  onChange={handleChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName || ""}
                  variant="outlined"
                  margin="normal"
                  required
                  sx={{ borderRadius: 1 }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  name="email"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  value={formValues.email}
                  onChange={handleChange}
                  variant="outlined"
                  margin="normal"
                  required
                  sx={{ borderRadius: 1 }}
                />
                <TextField
                  fullWidth
                  label="Message"
                  multiline
                  rows={4}
                  variant="outlined"
                  name="message"
                  error={!!formErrors.message}
                  helperText={formErrors.message}
                  value={formValues.message}
                  onChange={handleChange}
                  margin="normal"
                  required
                  sx={{ borderRadius: 1 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleSendMessage}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    color: "#fff",
                    backgroundColor: "#007bff",
                    "&:hover": { backgroundColor: "#0056b3" },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" /> // Size adjusted for better alignment
                  ) : (
                    "Send Message"
                  )}
                </Button>
                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
                {message && (
                  <Typography color="success" sx={{ mt: 2 }}>
                    {message}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ContactUs;
