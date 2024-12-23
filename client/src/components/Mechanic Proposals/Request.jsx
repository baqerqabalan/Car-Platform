import React, { useMemo, useState, useContext, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  FormControlLabel,
  CssBaseline,
  Checkbox,
  CircularProgress,
  DialogContent,
  IconButton,
  DialogTitle,
  Dialog,
  Divider,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Close } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import {
  getToken,
  isAuthenticated,
  setAuthHeader,
} from "../../helpers/authHelper";

const SubscriptionRequest = () => {
  const [selectedPackage, setSelectedPackage] = useState();
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext || localStorage.getItem("theme"));
  const [formValues, setFormValues] = React.useState({
    title: "",
    description: "",
    location: "",
    firstName: "",
    lastName: "",
    marketName: "",
    phoneNumber: "",
    email: "",
    password: "",
    image: null,
    skills: "",
    experience: "",
    subscription: "",
    additionalImages: [],
  });
  const [errors, setErrors] = React.useState({});
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [loading, setLoading] = useState(true);
  const [useRegisteredInfo, setUseRegisteredInfo] = useState(false);
  const [packages, setPackages] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [isRequestFound, setIsRequestFound] = useState(null);
  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleMultiFileUpload = (e) => {
    const newFiles = Array.from(e.target.files); // Get new files from input
    const existingFiles = formValues.additionalImages; // Get existing files
    const totalFiles = existingFiles.concat(newFiles).slice(0, 5); // Concatenate and limit to 5
    setFormValues((prevValues) => ({
      ...prevValues,
      additionalImages: totalFiles,
    }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formValues.additionalImages];
    updatedImages.splice(index, 1); // Remove the image at the specified index
    setFormValues((prevValues) => ({
      ...prevValues,
      additionalImages: updatedImages,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formValues.title) newErrors.title = "Title is required.";
    if (!formValues.description) newErrors.description = "Description is required.";
    if (!formValues.firstName) newErrors.firstName = "First name is required.";
    if (!formValues.lastName) newErrors.lastName = "Last name is required.";
    if (!formValues.marketName)
      newErrors.marketName = "Market name is required.";
    if (!formValues.email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Email address is invalid.";
    }
    if (!formValues.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required.";
    }
    if (!formValues.location) newErrors.location = "Location is required.";
    if (!formValues.experience) {
      newErrors.experience = "Experience is required.";
    }else if(formValues.experience < 0){
      newErrors.experience = "Experience must be a positive number"
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check user authentication
  const checkAuthentication = useCallback(() => {
    if (isAuthenticated()) {
      setAuthHeader();
      return true;
    } else {
      navigate(`/login?redirect=Mechanic Proposals/Request`);
    }
  },[navigate]);

  const checkPreviousRequest = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:5000/api/v1/subscriptions/checkPreviousRequest",
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (
        response.status === 200 &&
        response.data.message === "Request Not Found"
      ) {
        setLoading(false);
        setIsRequestFound(false);
      } else if (
        response.status === 200 &&
        response.data.message === "Request Found"
      ) {
        setLoading(false);
        setIsRequestFound(true);
      } else {
        setErrors("Something went wrong");
        setLoading(false);
      }
    } catch (error) {
      console.log("Error checking previous requests: ", error);
      setLoading(false);
      setErrors(
        "Error while checking if this user has sent previously a request"
      );
    }
  };
  const handleSubmit = async () => {
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Create a new FormData instance
      const formData = new FormData();

      // Append text fields
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);
      formData.append("firstName", formValues.firstName);
      formData.append("lastName", formValues.lastName);
      formData.append("email", formValues.email);
      formData.append("phoneNumber", formValues.phoneNumber);
      formData.append("location", formValues.location);
      formData.append("marketName", formValues.marketName);
      formData.append("experience", formValues.experience);
      formData.append("skills", formValues.skills);
      formData.append("subscription", selectedPackage);

      // Append files
      if (selectedFile) formData.append("image", selectedFile);
      if (formValues.additionalImages) {
        formValues.additionalImages.forEach((file) =>
          formData.append("additionalImages", file)
        );
      }

      const response = await axios.post(
        `http://localhost:5000/api/v1/subscriptions/requestSubscription`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );

      if (response.status === 201) {
        navigate("/Mechanic Proposals");
      }
    } catch (error) {
      console.error("Error sending the request:", error);
      setErrors("Error sending the request");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Fetch user data
  const fetchUser = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/auth/getUserInfo`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      if (response.status === 200) {
        setFormValues({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          phoneNumber: response.data.user.phoneNumber,
          email: response.data.user.email,
        });
      }
    } catch (error) {
      console.log(error);
      setErrors({ ...errors, user: "Error fetching user info" });
    }
  };

  const handleFileUpload = (e, field) => {
    setSelectedFile(e.target.files[0]);
    setFormValues({
      ...formValues,
      [field]: e.target.files.length ? e.target.files[0] : null,
    });
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchPackages = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/v1/subscriptions/getSubscriptionPackages`
      );

      if (response.status === 200) {
        setPackages(response.data.packages);
        setLoading(false);
        return response.data.packages;
      }
    } catch (error) {
      console.log("Error fetching packages: ", error);
      setLoading(false);
      setErrors("Error fetching packages");
    }
  };

  useEffect(() => {
    // Fetch packages and set the first package as selected
    const fetchData = async () => {
      await checkPreviousRequest();
      if (!isRequestFound && checkAuthentication()) {
        const fetchedPackages = await fetchPackages();
        if (fetchedPackages.length > 0) {
          setSelectedPackage(fetchedPackages[0]._id); // Set the first package as selected
        }
      }
    };
    fetchData();
  }, [isRequestFound, checkAuthentication]);

  // Package select handler
  const handlePackageSelect = (pkgId) => {
    setSelectedPackage(pkgId);
    setFormValues((prevValues) => ({
      ...prevValues,
      subscription: pkgId,
    }));
  };

  const cardStyles = (isSelected) => ({
    border: isSelected ? "2px solid #1976d2" : "1px solid #ccc",
    boxShadow: isSelected
      ? "0 8px 20px rgba(25, 118, 210, 0.3)"
      : "0 4px 10px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
    borderRadius: "12px",
    backgroundColor: theme.palette.main,
    transition: "all 0.3s ease",
  });

  const handleUseRegisteredInfoChange = async (e) => {
    setUseRegisteredInfo(e.target.checked);

    if (e.target.checked) {
      await fetchUser();
    } else {
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
      });
      setErrors({}); // Clear errors when switching modes
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            mt: 2,
          }}
        >
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft /> Back
          </Button>
          <Typography variant="h4" align="center">
            Request a Proposal
          </Typography>
        </Box>
        {!isRequestFound ? (
          <>
            <Box
              component="form"
              sx={{
                p: 3,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: theme.palette.background.default,
              }}
            >
              <Typography variant="h5" gutterBottom>
                Proposal Details
              </Typography>
              <TextField
                fullWidth
                label="Proposal Title"
                value={formValues.title}
                name="title"
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={formValues.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                name="description"
                variant="outlined"
                margin="normal"
                required
                multiline
                rows={4}
              />

              <>
                <Typography variant="h6" sx={{ mt: 3 }}>
                  Personal Information
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useRegisteredInfo}
                      onChange={handleUseRegisteredInfoChange}
                    />
                  }
                  label="Use Registered Info"
                />

                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100vh",
                    }}
                  >
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formValues.firstName}
                      onChange={handleChange}
                      error={!!errors.firstName}
                      helperText={errors.firstName}
                      name="firstName"
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formValues.lastName}
                      onChange={handleChange}
                      error={!!errors.lastName}
                      helperText={errors.lastName}
                      name="lastName"
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Email"
                      value={formValues.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      name="email"
                      variant="outlined"
                      type="email"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formValues.phoneNumber}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      name="phoneNumber"
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Location"
                      value={formValues.location}
                      onChange={handleChange}
                      error={!!errors.location}
                      helperText={errors.location}
                      name="location"
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Market Name"
                      value={formValues.marketName}
                      onChange={handleChange}
                      error={!!errors.marketName}
                      helperText={errors.marketName}
                      name="marketName"
                      variant="outlined"
                      margin="normal"
                      required
                    />
                  </>
                )}
              </>

              <Typography variant="h6" sx={{ mt: 3 }}>
                Additional Information
              </Typography>
              <TextField
                fullWidth
                label="Experience in Field (years)"
                name="experience"
                variant="outlined"
                margin="normal"
                value={formValues.experience}
                onChange={handleChange}
                error={!!errors.experience}
                helperText={errors.experience}
                required
                type="number"
                inputProps={{ min: 0 }} // Set minimum value to 0
              />
              <TextField
                fullWidth
                label="Skills or Certifications"
                name="skills"
                value={formValues.skills}
                onChange={handleChange}
                error={!!errors.skills}
                helperText={errors.skills}
                variant="outlined"
                margin="normal"
                multiline
                rows={2}
              />
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
                  name="image"
                  hidden
                  onChange={(e) => handleFileUpload(e, "image")}
                />
                {selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : "Upload a Poster"}
              </Button>

              <>
                <Button
                  sx={{
                    backgroundColor: "#00008b",
                    color: "white",
                    marginY: 1,
                    "&:hover": { backgroundColor: "#00006b" },
                  }}
                  variant="contained"
                  fullWidth
                  onClick={handleDialogOpen}
                >
                  {formValues.additionalImages?.length
                    ? `Selected: ${formValues.additionalImages.length} images`
                    : "Upload Images of your work"}
                </Button>

                <Dialog
                  open={openDialog}
                  onClose={handleDialogClose}
                  maxWidth="sm"
                  fullWidth
                >
                  <DialogTitle>
                    Add Additional Images
                    <IconButton
                      aria-label="close"
                      onClick={handleDialogClose}
                      sx={{
                        position: "absolute",
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                      }}
                    >
                      <Close />
                    </IconButton>
                  </DialogTitle>
                  <DialogContent dividers>
                    {formValues.additionalImages?.length >= 5 && (
                      <Typography variant="body2" color="error">
                        You can only upload up to 5 images.
                      </Typography>
                    )}
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {formValues.additionalImages?.map((image, index) => (
                        <Grid item xs={6} key={index}>
                          <Box
                            sx={{
                              position: "relative",
                              width: "100%",
                              height: 100,
                              overflow: "hidden",
                              borderRadius: 1,
                              border: "1px solid #ddd",
                            }}
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                            <IconButton
                              sx={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                backgroundColor: "rgba(255, 255, 255, 0.7)",
                              }}
                              onClick={() => handleRemoveImage(index)}
                              size="small"
                            >
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Divider sx={{ marginY: 2 }} />
                    <Box display="flex" justifyContent="right" marginY={2}>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={handleDialogClose}
                        component="label"
                        sx={{ marginRight: 1 }}
                      >
                        Cancel
                        <input type="reset" hidden />
                      </Button>
                      <Button
                        variant="contained"
                        component="label"
                        disabled={formValues.additionalImages?.length >= 5}
                      >
                        Add Images
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={handleMultiFileUpload}
                        />
                      </Button>
                    </Box>
                  </DialogContent>
                </Dialog>
              </>
            </Box>

            <Box sx={{ my: 4 }}>
              <Typography variant="h5" align="center" gutterBottom>
                Choose Your Subscription Package
              </Typography>
              <Grid container spacing={3} justifyContent="center">
                {packages.map((pkg) => (
                  <Grid item xs={12} sm={6} md={4} key={pkg._id}>
                    <Card
                      sx={cardStyles(selectedPackage === pkg._id)}
                      onClick={() => handlePackageSelect(pkg._id)}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          color={
                            selectedPackage === pkg._id
                              ? "primary"
                              : "textPrimary"
                          }
                          align="center"
                        >
                          {pkg.title}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          align="center"
                          sx={{ mt: 1, fontWeight: "bold" }}
                        >
                          ${pkg.price}/month
                        </Typography>
                        {pkg.description.map((feature, i) => (
                          <Typography
                            key={i}
                            variant="body2"
                            color="textSecondary"
                            align="center"
                          >
                            {feature}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Box textAlign="center" mt={4}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={handleSubmit}
                >
                  Confirm Subscription & Submit
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Alert severity="success">
            You already requested a proposal, explore another proposals{" "}
            <Button onClick={() => navigate(`/Mechanic Proposals`)}>
              <ArrowRight />
            </Button>
          </Alert>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default SubscriptionRequest;
