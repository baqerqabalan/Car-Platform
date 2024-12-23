import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  Grid,
  Paper,
  IconButton,
  Badge,
  createTheme,
  CircularProgress,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LockIcon from "@mui/icons-material/Lock";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useParams } from "react-router-dom"; // Assuming you're using react-router for navigation
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import {
  clearToken,
  getUserIdFromToken,
  isAuthenticated,
  setAuthHeader,
} from "../../helpers/authHelper";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import moment from "moment";
import Close from "@mui/icons-material/Close";
import UpdatePasswordDialog from "./updatePasswordDialog";

const Profile = () => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const fileInputRef = useRef(null);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const { mode } = React.useContext(
    ThemeContext || localStorage.getItem("theme")
  );

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const [profile, setProfile] = useState([]);

  const { userId } = useParams();

  const [badges, setBadges] = useState([]);

  const navigate = useNavigate();

  // Function to check if a date of birth indicates an age of 18 or older
  const isAdult = (dob) => {
    const currentDate = moment();
    const userDob = moment(dob, "YYYY-MM-DD");
    const age = currentDate.diff(userDob, "years");
    return age >= 18;
  };

  const validateForm = () => {
    const newErrors = {};
    const { firstName, lastName, dob, job} = profile;

    const namePattern = /^[A-Za-z]+$/;

    if (!profile.firstName) {
      newErrors.firstName = "First Name is required";
    } else if (!namePattern.test(firstName)) {
      newErrors.firstName = "First Name must contain only letters.";
    }
    if (!profile.lastName) {
      newErrors.lastName = "Last Name is required";
    } else if (!namePattern.test(lastName)) {
      newErrors.lastName = "Last Name must contain only letters.";
    }
    if (!profile.dob) {
      newErrors.dob = "Date of Birth is required";
    } else if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
      newErrors.dob = "Invalid Date of Birth format. Use YYYY-MM-DD.";
    } else if (!isAdult(dob)) {
      newErrors.dob = "You must be at least 18 years old to sign up.";
    }
    if (!profile.job) {
      newErrors.job = "Job is required";
    } else if (!namePattern.test(job)) {
      newErrors.job = "Job must contain only letters.";
    }

    if (!profile.phoneNumber)
      newErrors.phoneNumber = "Phone Number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditToggle = async (e) => {
    e.preventDefault();

    if (editMode) {
      if(!validateForm()) return;

      setLoading(true);
      try {
        const response = await axios.patch(
          "http://localhost:5000/api/v1/auth/updateUserInfo",
          {
            firstName: profile.firstName,
            lastName: profile.lastName,
            dob: profile.dob,
            job: profile.job,
            phoneNumber: profile.phoneNumber,
          }
        );
        if (response.status === 200) {
          setEditMode(false);
          setLoading(false);
          setMessage("Profile Updated Successfully");
          setInterval(() => {
            setMessage("");
          }, 2000);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setError("Error while updating the profile");
      }
    } else {
      setEditMode(true);
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleEditPhotoToggle = () => {
    // Trigger the file input when the pencil icon is clicked
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    if (isAuthenticated()) {
      const file = event.target.files[0];
      if (file) {
        try {
          // Create FormData to handle the image file upload
          const formData = new FormData();
          formData.append("profileImg", file);

          // Send the file to the server via axios
          const response = await axios.patch(
            "http://localhost:5000/api/v1/auth/updateProfileImg",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );

          // Update the profile image in the frontend
          setProfileImg(response.data.profileImg); // Use the profileImg from the response
          setMessage("Profile Image updated successfully");
          setInterval(() => {
            setMessage("");
          }, 2000);
          fetchUserInfo();
        } catch (error) {
          console.log(error);
          setError("Can't update profile image");
        }
      }
    }
  };

  const fetchUserInfo = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/auth/getUser/${userId}`
      );

      // Extract user data
      const userData = response.data;

      const formattedDob = moment(userData.data.dob).format("YYYY-MM-DD");

      // Set the profile state with the formatted dob
      setProfile({
        ...userData.data,
        dob: formattedDob, // Assign the formatted dob here
      });

      // Set badges state correctly from userData
      setBadges(userData.badges); // Ensure badges are properly set
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("Error fetching the user");
    }
  }, [userId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

  const handleLogout = () => {
    clearToken();
    setAuthHeader();
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container
        maxWidth="lg"
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center", // Align items vertically
            my: 2, // Adds vertical margin
          }}
        >
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            sx={{
              display: "flex",
              alignItems: "center", // Ensure the icon aligns with the text
              gap: 1, // Adds space between icon and text
            }}
            aria-label="Go back"
          >
            <ArrowBackIcon />
            Back
          </Button>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              backgroundColor: theme.palette.mode === "dark" ? "#000" : "#fff",
            }}
          >
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography
            sx={{
              backgroundColor: "transparent",
              color: "#000",
              textAlign: "center",
              p: 2,
              borderRadius: 2,
              fontWeight: "bold",
            }}
          >
            {error}
          </Typography>
        ) : message ? (
          <Box display="flex" justifyContent="center">
            <Typography
              sx={{
                backgroundColor: "green",
                color: "#fff",
                textAlign: "center",
                width: "50%",
                p: 2,
                borderRadius: 2,
                fontWeight: "bold",
                m: 5,
              }}
            >
              {message} <Close onClick={() => setMessage("")} />
            </Typography>
          </Box>
        ) : (
          <Paper
            elevation={3}
            sx={{
              flexGrow: 1,
              padding: 2,
              borderRadius: 2,
              display: "flex",
              gap: 4,
              mb: 1,
            }}
          >
            {/* Profile Section */}
            <Box sx={{ flex: 2 }}>
              <Box
                display="flex"
                alignItems="center"
                flexDirection="column"
                mb={4}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    profile._id === getUserIdFromToken() ? (
                      <IconButton
                        onClick={handleEditPhotoToggle}
                        sx={{ backgroundColor: "white" }}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                    ) : null
                  }
                >
                  <Avatar
                    alt={`${profile.firstName} ${profile.lastName}`}
                    src={
                      profile?.profileImg
                        ? `http://localhost:5000/${profile?.profileImg}`
                        : undefined
                    }
                    sx={{ width: 120, height: 120 }}
                  />
                </Badge>

                {/* Hidden input to handle file selection */}
                <input
                  type="file"
                  accept="image/*"
                  name="profileImg"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Box>

              <Box display="flex" flexDirection="column" gap={2} mb={4}>
                {editMode && profile._id === getUserIdFromToken() ? (
                  <>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleInputChange}
                      helperText={errors.firstName}
                      error={!!errors.firstName}
                      fullWidth
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={profile.lastName}
                      helperText={errors.lastName}
                      error={!!errors.lastName}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <TextField
                      label="Date of Birth"
                      name="dob"
                      value={profile.dob}
                      helperText={errors.dob}
                      error={!!errors.dob}
                      onChange={handleInputChange}
                      fullWidth
                      type="date"
                    />
                    <TextField
                      label="Job"
                      name="job"
                      value={profile.job}
                      helperText={errors.job}
                      error={!!errors.job}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      value={profile.phoneNumber}
                      helperText={errors.phoneNumber}
                      error={!!errors.phoneNumber}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleEditToggle}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Typography variant="h6">{`${profile.firstName} ${profile.lastName}`}</Typography>
                    <Typography variant="body1">
                      Date of Birth: {profile.dob}
                    </Typography>
                    <Typography variant="body1">Job: {profile.job}</Typography>
                    <Typography variant="body1">
                      Phone Number: {profile.phoneNumber}
                    </Typography>
                    <Typography variant="body1">
                      Reputation Score: {profile.reputationScore}
                    </Typography>

                    {profile._id === getUserIdFromToken() ? (
                      <Button
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={handleEditToggle}
                      >
                        Edit Info
                      </Button>
                    ) : (
                      ""
                    )}
                  </>
                )}
              </Box>

              {profile._id === getUserIdFromToken() ? (
                <>
                  <Box display="flex" justifyContent="center" mb={4}>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={handleOpenDialog}
                      sx={{
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#fff" : "#00008b",
                        color:
                          theme.palette.mode === "dark" ? "#00008b" : "#fff",
                      }}
                    >
                      Update Password
                    </Button>
                    <UpdatePasswordDialog
                      open={dialogOpen}
                      onClose={handleCloseDialog}
                      currentPassword={profile?.password}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 4,
                      mb: 1,
                      display: "flex",
                      justifyContent: {
                        xs: "center", // for extra small screens (right-aligned)
                        sm: "flex-end", // for small screens and above (center-aligned)
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<LogoutIcon />}
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </Box>
                </>
              ) : (
                ""
              )}
            </Box>

            {/* Earned Badges Section */}
            <Box
              sx={{
                flex: 1,
                borderLeft:
                  theme.palette.mode === "dark"
                    ? "0.1px solid rgb(245,245,245,0.3)"
                    : "0.1px solid rgb(0,0,0,0.1)",
                px: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                Earned Badges
              </Typography>
              {badges && badges.length > 0 ? (
                <Grid container spacing={2}>
                  {badges.map((badge) => (
                    <Grid item xs={12} key={badge._id}>
                      <Paper
                        elevation={2}
                        sx={{
                          padding: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          borderRadius: 2,
                        }}
                      >
                        <EmojiEventsIcon color="primary" fontSize="large" />
                        <Box display="flex" flexDirection="column">
                          <Typography variant="body1">{badge.name}</Typography>
                          <Typography variant="body2">
                            {badge.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography
                  sx={{
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    textAlign: "center",
                    my: 1,
                  }}
                >
                  No Badges Earned Yet
                </Typography>
              )}
            </Box>
          </Paper>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default Profile;
