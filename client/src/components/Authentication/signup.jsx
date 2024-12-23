import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import {
  Container,
  Button,
  Typography,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import carImage from "../../assets/images/car.jpg";
import axios from "axios";
import Close from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import SentimentVeryDissatisfiedIcon from "@mui/icons-material/SentimentVeryDissatisfied";
import SentimentVerySatisfiedIcon from "@mui/icons-material/SentimentVerySatisfied";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function SignupForm() {
  const [selectedFile, setSelectedFile] = React.useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file); // Store the file object instead of its name
    }
  };

  // Function to check if a date of birth indicates an age of 18 or older
  const isAdult = (dob) => {
    const currentDate = moment();
    const userDob = moment(dob, "YYYY-MM-DD");
    const age = currentDate.diff(userDob, "years");
    return age >= 18;
  };

  const [formValues, setFormValues] = React.useState({
    firstName: "",
    lastName: "",
    dob: "",
    job: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [errors, setErrors] = React.useState({});
  const [message, setMessage] = React.useState();
  const navigate = useNavigate();

  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showValidation, setShowValidation] = React.useState(false);
  const [validations, setValidations] = React.useState({
    hasDigit: false,
    hasLower: false,
    hasUpper: false,
    hasSpecialChar: false,
    hasMinLength: false,
  });

  // Handle password changes
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    // Update validation checks
    setValidations({
      hasDigit: /\d/.test(newPassword),
      hasLower: /[a-z]/.test(newPassword),
      hasUpper: /[A-Z]/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      hasMinLength: newPassword.length >= 8,
    });
  };

  // Handle focus to show validation
  const handlePasswordFocus = () => {
    setShowValidation(true);
  };

  // Handle blur to hide validation
  const handlePasswordBlur = () => {
    setShowValidation(false);
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues({ ...formValues, [id]: value });

    // Only for password input, update the validations
    if (id === "password") {
      handlePasswordChange(e); // Call the password validation logic here
    }

    if (errors[id]) {
      setErrors({ ...errors, [id]: null }); // Clear error when the user types
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      firstName,
      lastName,
      dob,
      job,
      username,
      password,
      email,
      phoneNumber,
    } = formValues;

    // Regular expression to allow only alphabetic characters
    const namePattern = /^[A-Za-z]+$/;

    // First name validation
    if (!firstName) {
      newErrors.firstName = "First Name is required.";
    } else if (!namePattern.test(firstName)) {
      newErrors.firstName = "First Name must contain only letters.";
    }

    // Last name validation
    if (!lastName) {
      newErrors.lastName = "Last Name is required.";
    } else if (!namePattern.test(lastName)) {
      newErrors.lastName = "Last Name must contain only letters.";
    }

    // Date of birth validation (YYYY-MM-DD format)
    if (!dob) {
      newErrors.dob = "Date of Birth is required.";
    } else if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
      newErrors.dob = "Invalid Date of Birth format. Use YYYY-MM-DD.";
    } else if (!isAdult(dob)) {
      newErrors.dob = "You must be at least 18 years old to sign up.";
    }

    // First name validation
    if (!job) {
      newErrors.job = "Job is required.";
    } else if (!namePattern.test(job)) {
      newErrors.job = "Job must contain only letters.";
    }

    if (!username) {
      newErrors.username = "Username is required.";
    } else if (username.length < 5) {
      newErrors.username = "Username must be greater than 5 characters";
    }

    if (!password) newErrors.password = "Password is required.";

    const unmetValidations = Object.entries(validations)
      .filter(([_, valid]) => !valid)
      .map(([rule]) => rule);

    if (unmetValidations.length > 0) {
      newErrors.password = `Password must meet the following requirements: ${unmetValidations
        .join(", ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")}`;
    }

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid.";
    }
    if (!phoneNumber) {
      newErrors.phoneNumber = "Phone Number is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create FormData object to handle file uploads
        const formData = new FormData();
        formData.append("firstName", formValues.firstName);
        formData.append("lastName", formValues.lastName);
        formData.append("dob", formValues.dob);
        formData.append("job", formValues.job);
        formData.append("username", formValues.username);
        formData.append("email", formValues.email);
        formData.append("password", formValues.password);
        formData.append("phoneNumber", formValues.phoneNumber);
        formData.append("profileImg", selectedFile); // Assuming selectedFile holds the file

        const response = await axios.post(
          "http://localhost:5000/api/v1/auth/signup",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data", // Important for file uploads
            },
          }
        );

        // Update message and navigate
        setMessage(response.data.message); // Set message from response
        if (response.status === 201) {
          setTimeout(() => {
            navigate("/login");
          }, 3000); // Redirect after 3 seconds if account is created
        }
      } catch (error) {
        // Handle error response from server
        const errorMsg =
          error.response && error.response.data.message
            ? error.response.data.message
            : "Something went wrong. Please try again.";
        setMessage(errorMsg);
      }
    }
  };

  const handleCloseButton = () => {
    setMessage("");
  };

  // Toggle password visibility
  const handleClickShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
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
        padding: "2rem", // Optional padding around the form
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
        }}
      >
        <Grid container justifyContent="center">
          <Avatar sx={{ bgcolor: "#00008b", mb: 1 }}>
            <LockOutlinedIcon />
          </Avatar>
        </Grid>
        <Typography
          variant="h6"
          align="center"
          gutterBottom
          sx={{ color: "#00008b", fontWeight: "bold" }}
        >
          Create Account
        </Typography>
        {message === "Username or email already exists" ? (
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{
              backgroundColor: "#dc3545", // Error background (red)
              color: "white",
              fontWeight: "bold",
            }}
          >
            {message}
            <Link
              sx={{
                textDecoration: "underline",
                marginLeft: "10px",
                color: "white",
              }}
              href="/login"
            >
              Login now
            </Link>
            <Button
              onClick={handleCloseButton}
              sx={{ backgroundColor: "transparent", color: "white" }}
            >
              <Close />
            </Button>
          </Typography>
        ) : message === "Account Created Successfully" ? (
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            sx={{
              backgroundColor: "green", // Success background (green)
              color: "white",
              fontWeight: "bold",
            }}
          >
            {message}
            <Button
              onClick={handleCloseButton}
              sx={{ backgroundColor: "transparent", color: "white" }}
            >
              <Close />
            </Button>
          </Typography>
        ) : null}
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { m: 1, width: "100%" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            required
            id="firstName"
            label="First Name"
            variant="outlined"
            name="firstName"
            value={formValues.firstName}
            onChange={handleChange}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
          <TextField
            required
            id="lastName"
            label="Last Name"
            variant="outlined"
            name="lastName"
            value={formValues.lastName}
            onChange={handleChange}
            error={!!errors.lastName}
            helperText={errors.lastName}
          />
          <TextField
            required
            id="dob"
            label="Date of Birth"
            type="date"
            name="dob"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            value={formValues.dob}
            onChange={handleChange}
            error={!!errors.dob}
            helperText={errors.dob}
          />
          <TextField
            required
            id="job"
            label="Job"
            variant="outlined"
            name="job"
            value={formValues.job}
            onChange={handleChange}
            error={!!errors.job}
            helperText={errors.job}
          />
          <TextField
            required
            id="username"
            label="Username"
            variant="outlined"
            name="username"
            value={formValues.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
          />
          <TextField
            required
            id="email"
            label="Email"
            type="email"
            variant="outlined"
            name="email"
            value={formValues.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            required
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            variant="outlined"
            name="password"
            value={formValues.password}
            onChange={handleChange}
            onFocus={handlePasswordFocus}
            onBlur={handlePasswordBlur}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
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
                      <SentimentVeryDissatisfiedIcon sx={{ color: "red" }} />
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
                      <SentimentVeryDissatisfiedIcon sx={{ color: "red" }} />
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
                      <SentimentVeryDissatisfiedIcon sx={{ color: "red" }} />
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
                      <SentimentVeryDissatisfiedIcon sx={{ color: "red" }} />
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
                      <SentimentVeryDissatisfiedIcon sx={{ color: "red" }} />
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
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            variant="outlined"
            name="phoneNumber"
            value={formValues.phoneNumber}
            onChange={handleChange}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
          />
          <Box sx={{ width: "100%", margin: "16px 0" }}>
            <Button
              variant="contained"
              component="label"
              fullWidth // This ensures the button takes the full width of its container
              sx={{
                backgroundColor: "#00008b", // Example color
                color: "white",
                "&:hover": {
                  backgroundColor: "#00006b", // Darker shade on hover
                },
              }}
            >
              <input
                type="file"
                name="profileImg"
                hidden
                onChange={handleFileChange}
              />
              {selectedFile
                ? `Selected: ${selectedFile}`
                : "Choose Profile Image"}
            </Button>
          </Box>
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              width: "100%",
              backgroundColor: "#00008b",
              "&:hover": {
                backgroundColor: "#125a9a",
              },
              padding: 1.5,
              fontWeight: "bold",
            }}
          >
            Sign Up
          </Button>
        </Box>
        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: "#00008b" }}
        >
          Already have an account?{" "}
          <Link
            style={{
              fontWeight: "bold",
              cursor: "pointer",
              textDecoration: "underline",
              color: "#00008b",
            }}
            href="/login"
          >
            Login
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
