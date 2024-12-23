import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import axios from 'axios';
import { storeToken } from '../helpers/authHelper';

const LoginPage = () => {
  const [formValues, setFormValues] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const { username, password } = formValues;

    if (!username) {
      newErrors.username = "Username is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:4000/api/v1/auth/login",
          {
            username: formValues.username,
            password: formValues.password,
          }
        );

        storeToken(response.data.token);
        setMessage(response.data.message);
        if (response.status === 200) {
          setLoading(false);
          window.location.reload();
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Login failed. Please try again.";
        setMessage(errorMsg);
        setLoading(false);
      }
    }
  };

  const handlePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #00008b ,#009680, #1a2a6c, #009680)',
        backgroundSize: '400% 400%',
        animation: 'gradientBG 15s ease infinite',
        '@keyframes gradientBG': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Card elevation={10} sx={{
          borderRadius: 3,
          width: '100%',
          maxWidth: 450,
          backgroundColor: 'rgba(26, 26, 46, 0.85)', // translucent for glassmorphism effect
          backdropFilter: 'blur(10px)',
          padding: 3,
        }}>
          <CardContent>
            <Typography variant="h4" align="center" color="#ffffff" gutterBottom>
              Admin Panel Login
            </Typography>
            {message && (
              <Typography
                variant="body2"
                align="center"
                gutterBottom
                sx={{
                  backgroundColor: message.includes("success") ? "green" : "red",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  mb: 2,
                }}
              >
                {message}
              </Typography>
            )}
            <Box sx={{ mt: 3 }}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={formValues.username || ''}
                name="username"
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#0f3460' },
                    '&:hover fieldset': { borderColor: '#0f3460' },
                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                  },
                  '& .MuiInputBase-input': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                }}
                error={!!errors.username}
                helperText={errors.username}
              />
              <TextField
                label="Password"
                variant="outlined"
                name="password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                value={formValues.password || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#ffffff' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePasswordVisibility} edge="end" sx={{ color: '#ffffff' }}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#0f3460' },
                    '&:hover fieldset': { borderColor: '#0f3460' },
                    '&.Mui-focused fieldset': { borderColor: '#ffffff' },
                  },
                  '& .MuiInputBase-input': { color: '#ffffff' },
                  '& .MuiInputLabel-root': { color: '#b0b0b0' },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                }}
                error={!!errors.password}
                helperText={errors.password}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{
                  py: 1.5,
                  backgroundColor: '#0f3460',
                  '&:hover': { backgroundColor: '#0e2d52' },
                  fontWeight: 'bold',
                }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;