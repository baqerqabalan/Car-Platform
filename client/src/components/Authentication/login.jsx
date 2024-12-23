import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {
  Container,
  Button,
  Typography,
  Grid,
  Avatar,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import carImage from "../../assets/images/car.jpg";
import { storeToken } from "../../helpers/authHelper";

export default function LoginForm() {
  const [formValues, setFormValues] = React.useState({
    identifier: "", // Can be email or username
    password: "",
  });
  const [errors, setErrors] = React.useState({});
  const [message, setMessage] = React.useState();
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirect = queryParams.get("redirect") || "/";
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });
    if (errors[id]) {
      setErrors({ ...errors, [id]: null });
    }
  };

  const validateIdentifier = () => {
    const newErrors = {};
    if (!formValues.identifier) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formValues.identifier)) {
      newErrors.email = "Email is invalid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const newErrors = {};
    const { identifier, password } = formValues;

    if (!identifier) {
      newErrors.identifier = "Email or Username is required.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (validateForm()) {
      try {
        const response = await axios.post(
          "http://localhost:5000/api/v1/auth/login",
          {
            identifier: formValues.identifier,
            password: formValues.password,
          }
        );

        storeToken(response.data.token);

        setMessage(response.data.message);
        if (response.status === 200) {
          setLoading(false);
          navigate(redirect);
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || "Login failed. Please try again.";
        setMessage(errorMsg);
        setLoading(false);
      }
    } else {
      setLoading(false);
      console.log("Validation errors:", errors);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleForgotPassword = async (e) => {
    if (validateIdentifier()) {
      e.preventDefault(); // Prevent default form submission behavior

      try {
        // Make a PATCH request to the backend with the user's email
        const response = await axios.patch(
          "http://localhost:5000/api/v1/auth/forgotPassword",
          { identifier: formValues.identifier }
        );

        if (response.status === 200) {
          // Set a success message to notify the user
          setMessage("Password reset link has been sent to your email!");
        }
      } catch (error) {
        // Set an error message if the request fails
        setMessage(error.response?.data?.message || "Something went wrong.");
      }
    } else {
      return;
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: `url(${carImage})`,
        backgroundSize: "cover", // Ensures the image covers the entire page
        backgroundPosition: "center", // Centers the image
        minHeight: "100vh", // Ensures it covers the full viewport height
        display: "flex", // Flexbox to center the form
        justifyContent: "flex-start", // Centers content horizontally
        alignItems: "center", // Centers content vertically
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)", // Slight transparency for the form background
          padding: "2rem",
          borderRadius: "8px", // Rounds the corners of the form
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Adds some shadow for depth
          maxWidth: "500px", // Optional max width for the form
          marginLeft: "2rem", // Adds margin from the left edge
          marginRight: "2rem",
        }}
      >
        <Grid container justifyContent="center">
          <Avatar sx={{ bgcolor: "#00008b", mb: 2 }}>
            <LockOutlinedIcon />
          </Avatar>
        </Grid>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{ fontWeight: "bold", color: "#00008b" }}
        >
          Login
        </Typography>

        {message && (
          <Typography
            variant="body2"
            align="center"
            gutterBottom
            sx={{
              backgroundColor: message.includes("success") || message.includes("reset") ? "green" : "red",
              color: "white",
              padding: "0.5rem",
              borderRadius: "4px",
              mb: 2,
            }}
          >
            {message}
          </Typography>
        )}

        {Object.keys(errors).length > 0 && (
          <div style={{ color: "White", backgroundColor:"red", textAlign:"center" }}>
            {Object.entries(errors).map(([key, value]) => (
              <p key={key}>{value}</p>
            ))}
          </div>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            "& .MuiTextField-root": { m: 1, width: "100%" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TextField
            required
            id="identifier"
            label="Email or Username"
            variant="outlined"
            name={
              /\S+@\S+\.\S+/.test(formValues.identifier) ? "email" : "username"
            }
            value={formValues.identifier}
            onChange={handleChange}
            error={!!errors.identifier}
            helperText={errors.identifier}
          />
          <TextField
            required
            id="password"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            value={formValues.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleClickShowPassword} edge="end">
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading} // Disable button when loading
            sx={{
              mt: 2,
              mb: 2,
              bgcolor: "#00008b",
              "&:hover": {
                bgcolor: "#00004b",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
          <Button
            variant="text"
            onClick={handleForgotPassword}
            sx={{
              display: "flex",
              justifyContent: "right",
              m: 0,
              fontStyle: "italic",
              backgroundColor: "transparent",
              color: "#00008b",
              textDecoration: "underline",
              fontSize: "12px",
            }}
          >
            Forgot Password?
          </Button>
          <Typography variant="body2" align="center">
            Don't have an account?{" "}
            <Link href="/signup" underline="hover" sx={{ color: "#00008b" }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
