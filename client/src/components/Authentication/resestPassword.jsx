import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CircularProgress,
  InputAdornment,
  IconButton,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import carImage from "../../assets/images/car.jpg";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [verification, setVerification] = useState(true);
  const [validations, setValidations] = useState({
    hasDigit: false,
    hasLower: false,
    hasUpper: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });
  const navigate = useNavigate();

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle focus to show validation
  const handlePasswordFocus = () => {
    setShowValidation(true);
  };

  // Handle blur to hide validation
  const handlePasswordBlur = () => {
    setShowValidation(false);
  };

  const validatePassword = (password) => {
    setValidations({
      hasDigit: /\d/.test(password),
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*]/.test(password),
      hasMinLength: password.length >= 8,
    });
  };

  const verifyToken = useCallback(async () => {
    setLoading(true); // Start loading state
    try {
      await axios.get(`http://localhost:5000/api/v1/auth/verifyToken/${token}`);
  
      // If successful, set verification to true
      setVerification(true);
    } catch (error) {
      // Handle errors (status 400 or 500)
      if (error.response && error.response.status === 400) {
        setVerification(false); // Token is invalid or expired
      } else {
        setError("Failed to Verify Token");
      }
    } finally {
      setLoading(false); // Stop loading state
    }
  }, [token]);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    if (!password || !confirmedPassword) {
      setError("Fill required fields");
      setLoading(false);
      return;
    }

    if (password !== confirmedPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    if (!Object.values(validations).every((val) => val)) {
      setError("Password does not meet the required criteria");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.patch(
        `http://localhost:5000/api/v1/auth/resetPassword/${token}`,
        { password, confirmedPassword }
      );
      setMessage(response.data.message);
      setError("");
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
      setLoading(false);
    }
  };

  return (
    <>
      {!verification ? (
        <Box
          sx={{
            backgroundImage: `url(${carImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#fff",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            padding: "16px",
          }}
        >
          <Box
            sx={{
              backgroundColor: "rgba(255, 0, 0, 0.85)",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
              maxWidth: "400px",
              width: "100%",
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#fff" }}
            >
              Token Expired or Invalid
            </Typography>
            <Typography variant="body1" sx={{ marginBottom: "16px" }}>
              Your session token has expired or is invalid. Please log in again
              to continue.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                navigate("/login");
              }}
              sx={{
                backgroundColor: "#fff",
                color: "#d32f2f",
                fontWeight: "bold",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              Go to Login
            </Button>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            backgroundImage: `url(${carImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "100vh",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              maxWidth: "500px",
              marginLeft: "2rem",
              marginRight: "2rem",
            }}
          >
            <Grid container justifyContent="center">
              <Avatar sx={{ bgcolor: "#00008b", mb: 2 }}>
                <LockOutlined />
              </Avatar>
            </Grid>
            <Typography
              variant="h6"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold", color: "#00008b" }}
            >
              Reset Password
            </Typography>

            {message && (
              <Typography
                variant="body2"
                align="center"
                gutterBottom
                sx={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  mb: 2,
                }}
              >
                {message}
              </Typography>
            )}

            {error && (
              <Typography
                variant="body2"
                align="center"
                gutterBottom
                sx={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "0.5rem",
                  borderRadius: "4px",
                  mb: 2,
                }}
              >
                {error}
              </Typography>
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
                id="password"
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                onFocus={handlePasswordFocus}
                onBlur={handlePasswordBlur}
                variant="outlined"
                value={password}
                onChange={handlePasswordChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {showValidation && (
                <Box mt={2}>
                  <Typography variant="body2" color="textSecondary">
                    Password must contain:
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        {validations.hasDigit ? (
                          <SentimentVerySatisfiedIcon sx={{ color: "green" }} />
                        ) : (
                          <SentimentVeryDissatisfiedIcon
                            sx={{ color: "red" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="A digit (0-9)"
                        primaryTypographyProps={{
                          style: {
                            color: validations.hasDigit ? "green" : "red",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {validations.hasLower ? (
                          <SentimentVerySatisfiedIcon sx={{ color: "green" }} />
                        ) : (
                          <SentimentVeryDissatisfiedIcon
                            sx={{ color: "red" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="A lowercase letter (a-z)"
                        primaryTypographyProps={{
                          style: {
                            color: validations.hasLower ? "green" : "red",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {validations.hasUpper ? (
                          <SentimentVerySatisfiedIcon sx={{ color: "green" }} />
                        ) : (
                          <SentimentVeryDissatisfiedIcon
                            sx={{ color: "red" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="An uppercase letter (A-Z)"
                        primaryTypographyProps={{
                          style: {
                            color: validations.hasUpper ? "green" : "red",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {validations.hasSpecialChar ? (
                          <SentimentVerySatisfiedIcon sx={{ color: "green" }} />
                        ) : (
                          <SentimentVeryDissatisfiedIcon
                            sx={{ color: "red" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="A special character (!@#$%^&*)"
                        primaryTypographyProps={{
                          style: {
                            color: validations.hasSpecialChar ? "green" : "red",
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        {validations.hasMinLength ? (
                          <SentimentVerySatisfiedIcon sx={{ color: "green" }} />
                        ) : (
                          <SentimentVeryDissatisfiedIcon
                            sx={{ color: "red" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Minimum 8 characters"
                        primaryTypographyProps={{
                          style: {
                            color: validations.hasMinLength ? "green" : "red",
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </Box>
              )}
              <TextField
                required
                id="confirmedPassword"
                label="Confirm Password"
                name="confirmedPassword"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={confirmedPassword}
                onChange={(e) => setConfirmedPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleClickShowPassword} edge="end">
                        {showPassword ? <Visibility /> : <VisibilityOff />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  bgcolor: "#00008b",
                  "&:hover": {
                    bgcolor: "#00004b",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </Box>
          </Container>
        </Box>
      )}{" "}
    </>
  );
};

export default ResetPassword;
