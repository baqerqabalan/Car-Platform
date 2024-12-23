import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  createTheme,
  TextField,
  DialogTitle,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import {
  Email,
  Phone,
  WhatsApp,
  Close,
  Cancel,
  Edit,
  ArrowLeft,
} from "@mui/icons-material";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  getUserIdFromToken,
  isAuthenticated,
  setAuthHeader,
} from "../../helpers/authHelper";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";


const ImageSliderDialog = ({ open, onClose, images }) => (
  <Dialog
    open={open}
    onClose={onClose}
    fullWidth
    maxWidth="md"
    PaperProps={{
      style: {
        borderRadius: "12px", // Rounded corners for a modern look
        maxHeight: "85vh", // Limit height to avoid scrolls
        overflow: "hidden", // Prevent overflow
        padding: "20px", // Inner padding for better spacing
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
      },
    }}
  >
    <DialogContent
      sx={{
        overflow: "hidden",
        padding: "0", // Remove default padding for better image fit
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={10}
        slidesPerView={1}
        style={{ width: "100%", height: "100%" }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <CardMedia
              component="img"
              src={img.imageURL || `http://localhost:5000/${img}`}
              alt={`Image ${index + 1}`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 8,
                objectFit: "cover", // Ensures images fill the card nicely
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </DialogContent>
    <DialogActions
      sx={{
        justifyContent: "center",
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      <Button
        onClick={onClose}
        variant="contained"
        color="primary"
        sx={{ borderRadius: "8px" }}
      >
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const ProposalDetails = () => {
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);
  const { proposalId } = useParams();
  const [loading, setLoading] = useState(true);
  const [openImage, setOpenImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [deletedImages, setDeletedImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openImageSlider, setOpenImageSlider] = useState(false);

  const [formValues, setFormValues] = useState({
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
    additionalImages: [],
  });
  const navigate = useNavigate();
  const { mode } = useContext(ThemeContext || localStorage.getItem('theme'));

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleRemoveImage = (index) => {
    const imageToRemove = proposal.additionalImages[index];

    // Add removed image to deletedImages
    setDeletedImages((prevDeleted) => [...prevDeleted, imageToRemove]);

    // Remove the image from additionalImages
    const updatedImages = proposal.additionalImages.filter(
      (_, i) => i !== index
    );
    setProposal((prevProposal) => ({
      ...prevProposal,
      additionalImages: updatedImages,
    }));
  };

  const handleFileUpload = (event, type) => {
    const files = Array.from(event.target.files);
    if (type === "image") {
      const file = files[0];
      const coverImageURL = URL.createObjectURL(file);

      setFormValues((prevProposal) => ({
        ...prevProposal,
        image: coverImageURL,
        imageFile: file, // Store the file object for uploading
      }));
    } else if (type === "additionalImages") {
      const newImages = files.map((file) => ({
        file,
        imageURL: URL.createObjectURL(file), // Use Blob URL for instant preview
      }));

      setFormValues((prevProposal) => ({
        ...prevProposal,
        additionalImages: [
          ...(prevProposal.additionalImages || []),
          ...newImages,
        ], // Append new images
      }));

      // Update `additionalImages` in `proposal` to reflect changes immediately
      setProposal((prevProposal) => ({
        ...prevProposal,
        additionalImages: [
          ...(prevProposal.additionalImages || []),
          ...newImages,
        ],
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.title) errors.title = "Title is required.";
    if (!formValues.description) errors.description = "Description is required.";
    if (!formValues.firstName) errors.firstName = "First name is required.";
    if (!formValues.lastName) errors.lastName = "Last name is required.";
    if (!formValues.marketName)
      errors.marketName = "Market name is required.";
    if (!formValues.email) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Email address is invalid.";
    }
    if (!formValues.phoneNumber) {
      errors.phoneNumber = "Phone number is required.";
    }
    if (!formValues.location) errors.location = "Location is required.";
    if (!formValues.experience) {
      errors.experience = "Experience is required.";
    }else if(formValues.experience < 0){
      errors.experience = "Experience must be a positive number"
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;

  }

  // Combined function to handle saving changes and then fetching updated proposal data
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    if(!validateForm()){
      return;
    }
    
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", formValues.title);
      formData.append("description", formValues.description);
      formData.append("marketName", formValues.marketName);
      formData.append("phoneNumber", formValues.phoneNumber);
      formData.append("email", formValues.email);
      formData.append("location", formValues.location);
      formData.append("firstName", formValues.firstName);
      formData.append("lastName", formValues.lastName);
      formData.append("experience", formValues.experience);

      if (formValues.skills) {
        formData.append("skills", formValues.skills);
      }

      // Append cover image file if present
      if (formValues.imageFile) {
        formData.append("image", formValues.imageFile);
      }

      // Append multiple images (new ones only)
      formValues.additionalImages.forEach((imgObj) => {
        if (imgObj.file) {
          formData.append("additionalImages", imgObj.file);
        }
      });

      // Append the list of deleted images correctly
      if (deletedImages && deletedImages.length > 0) {
        deletedImages.forEach((img) => formData.append("deletedImages[]", img));
      }

      // API call to save the product changes
      await axios.patch(
        `http://localhost:5000/api/v1/subscriptions/updateSubscriptionDetails/${proposalId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Fetch updated proposal data after saving
      await fetchProposal(); // Refresh proposal data in the UI

      setEditMode(false);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error saving proposal details", error);
      setError("Failed to update the proposal");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  // Function to fetch and update proposal data
  const fetchProposal = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/api/v1/subscriptions/getProposalById/${proposalId}`
      );

      if (response.status === 200) {
        const proposalData = response.data.proposal;
        setProposal(proposalData);

        // Sync fetched proposal data with formValues state
        setFormValues({
          title: proposalData.title || "",
          description: proposalData.description || "",
          location: proposalData.location || "",
          firstName: proposalData.firstName || "",
          lastName: proposalData.lastName || "",
          marketName: proposalData.marketName || "",
          phoneNumber: proposalData.phoneNumber || "",
          email: proposalData.email || "",
          skills: proposalData.skills || "",
          experience: proposalData.experience || "",
          additionalImages: proposalData.additionalImages || [],
          image: proposalData.image || null,
        });
        return proposalData;
      }
    } catch (error) {
      console.log(error);
      setError("Error while fetching the proposal");
    } finally {
      setLoading(false); // Ensure loading state is stopped after the request finishes
    }
  },[proposalId]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };

  const checkAuthentication =useCallback(() => {
    if (isAuthenticated()) {
      setAuthHeader();
      return true;
    } else {
      navigate(`/login?redirect=Mechanic Proposals/Proposal/${proposalId}`);
      return false;
    }
  },[navigate, proposalId]);

  useEffect(() => {
    const fetchData = async () => {
      if (checkAuthentication()) {
        const prop = await fetchProposal();
        if (
          prop.subscription.title === "Premium Package" &&
          prop.requestedClientId === getUserIdFromToken()
        ) {
          setCanEdit(true);
        }
      }
    };
    fetchData(); 
  }, [checkAuthentication,fetchProposal]);

  const handleImageClick = (img) => {
    setSelectedImage(img);
    setOpenImage(true);
  };

  const handleCloseImage = () => {
    setOpenImage(false);
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

  if (error) {
    return (
      <Typography variant="h6" align="center" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ p: 2, borderRadius: "16px", boxShadow: 4 }}>
          <Box display="flex" justifyContent="space-between">
            {/* Back Button */}
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/Mechanic Proposals`)}
              startIcon={<ArrowLeft />}
              sx={{ mb: 2 }}
            >
              Back
            </Button>

            {canEdit ? (
              <Button
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minWidth: "50px", // Set a minimum width
                  height: "40px", // Set a smaller height
                  padding: 0, // Remove extra padding
                  mb: 2,
                }}
                variant="contained"
                color={editMode ? "secondary" : "primary"}
                onClick={handleEditToggle}
              >
                {editMode ? (
                  <Cancel fontSize="small" />
                ) : (
                  <Edit fontSize="small" />
                )}
              </Button>
            ) : null}

          </Box>
          {/* Proposal Main Image */}
          {proposal?.image &&
            (editMode ? (
              <>
                {/* Edit Cover Image Button */}
                <Button variant="outlined" component="label" fullWidth>
                  <input
                    type="file"
                    hidden
                    name="image"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "image")}
                  />
                  {formValues.image
                    ? `Selected: ${formValues.image}`
                    : "Edit Cover Image"}
                </Button>

                {/* Cover Image Preview */}
                {formValues.image ? (
                  <CardMedia
                    component="img"
                    height="400"
                    image={
                      formValues.image.startsWith("blob:")
                        ? formValues.image
                        : `http://localhost:5000/${formValues.image}`
                    }
                    alt="Preview Image"
                    sx={{ mt: 2 }}
                  />
                ) : null}
              </>
            ) : (
              <CardMedia
                component="img"
                height="300"
                image={`http://localhost:5000/${proposal.image}`}
                alt={proposal.title}
                sx={{ borderRadius: 2, mb: 2, cursor: "pointer" }}
                onClick={() =>
                  handleImageClick(`http://localhost:5000/${proposal.image}`)
                }
              />
            ))}
          <CardContent>
            {/* Proposal Title and Description */}
            {!editMode ? (
              <>
                <Typography
                  variant="h4"
                  gutterBottom
                  sx={{ fontWeight: "600" }}
                >
                  {proposal?.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {proposal?.description}
                </Typography>{" "}
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Proposal Title"
                  value={formValues.title}
                  name="title"
                  onChange={handleChange}
                  error={!!formErrors.title}
                  helperText={formErrors.title}
                  variant="outlined"
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formValues.description}
                  onChange={handleChange}
                  error={!!formErrors.description}
                  helperText={formErrors.description}
                  name="description"
                  variant="outlined"
                  margin="normal"
                  required
                  multiline
                  rows={4}
                />
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Proposal Details */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary">
                  Market Name
                </Typography>
                {!editMode ? (
                  <Typography>{proposal?.marketName}</Typography>
                ) : (
                  <TextField
                    fullWidth
                    value={formValues.marketName}
                    name="marketName"
                    onChange={handleChange}
                    error={!!formErrors.marketName}
                    helperText={formErrors.marketName}
                    variant="outlined"
                    margin="normal"
                    required
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary">
                  Location
                </Typography>
                {!editMode ? (
                  <Typography>{proposal?.location}</Typography>
                ) : (
                  <TextField
                    fullWidth
                    value={formValues.location}
                    name="location"
                    onChange={handleChange}
                    error={!!formErrors.location}
                    helperText={formErrors.location}
                    variant="outlined"
                    margin="normal"
                    required
                  />
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary">
                  Experience
                </Typography>
                {!editMode ? (
                  <Typography>{proposal?.experience} years</Typography>
                ) : (
                  <TextField
                    fullWidth
                    value={formValues.experience}
                    name="experience"
                    onChange={handleChange}
                    error={!!formErrors.experience}
                    helperText={formErrors.experience}
                    variant="outlined"
                    margin="normal"
                    required
                  />
                )}
              </Grid>
              {proposal?.skills && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" color="primary">
                    Skills
                  </Typography>
                  {!editMode ? (
                    <Typography>{proposal.skills}</Typography>
                  ) : (
                    <TextField
                      fullWidth
                      value={formValues.skills}
                      onChange={handleChange}
                      error={!!formErrors.skills}
                      helperText={formErrors.skills}
                      name="skills"
                      variant="outlined"
                      margin="normal"
                      required
                      multiline
                      rows={4}
                    />
                  )}
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="h6" color="primary">
                  Created On
                </Typography>
                <Typography>
                  {moment(proposal?.createdAt).format("YYYY-MM-DD")}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Contact Info */}
            <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 2 }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Contact Info
              </Typography>
              <Box>
                {!editMode ? (
                  <Typography variant="h6" gutterBottom>
                    {proposal?.firstName} {proposal?.lastName}
                  </Typography>
                ) : (
                  <Box display="flex" justifyContent="space-between">
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formValues.firstName}
                      name="firstName"
                      onChange={handleChange}
                      sx={{ marginRight: 2 }}
                      error={!!formErrors.firstName}
                      helperText={formErrors.firstName}
                      variant="outlined"
                      margin="normal"
                      required
                    />
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formValues.lastName}
                      name="lastName"
                      onChange={handleChange}
                      error={!!formErrors.lastName}
                      helperText={formErrors.lastName}
                      variant="outlined"
                      margin="normal"
                      required
                    />
                  </Box>
                )}
                <Box display="flex" alignItems="center">
                  {!editMode ? (
                    <>
                      <Phone fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {proposal?.phoneNumber}
                      </Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={formValues.phoneNumber}
                      name="phoneNumber"
                      onChange={handleChange}
                      error={!!formErrors.phoneNumber}
                      helperText={formErrors.phoneNumber}
                      variant="outlined"
                      margin="normal"
                      required
                    />
                  )}
                </Box>
                <Box display="flex" alignItems="center">
                  {!editMode ? (
                    <>
                      <Email fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="textSecondary">
                        {proposal?.email}
                      </Typography>
                    </>
                  ) : (
                    <TextField
                      fullWidth
                      label="Email"
                      value={formValues.email}
                      name="email"
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      variant="outlined"
                      margin="normal"
                      type="email"
                      required
                    />
                  )}
                </Box>
                {!editMode ? (
                  <Box display="flex" alignItems="center" mt={1}>
                    <IconButton
                      component="a"
                      href={`https://wa.me/${proposal?.phoneNumber}`}
                      target="_blank"
                      aria-label="WhatsApp"
                    >
                      <WhatsApp color="primary" />
                    </IconButton>
                    <IconButton
                      component="a"
                      href={`mailto:${proposal?.email}`}
                      aria-label="Email"
                    >
                      <Email color="primary" />
                    </IconButton>
                  </Box>
                ) : null}
              </Box>
            </Box>

            {/* Additional Images */}
            {proposal?.additionalImages && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" color="primary" gutterBottom>
                  Additional Images
                </Typography>
                <Box display="flex" overflow="auto" alignItems="center">
                  {/* Display images with remove button in edit mode */}
                  {proposal.additionalImages.slice(0, 2).map((img, index) => (
                    <Box position="relative" key={index} sx={{ mr: 1 }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={`http://localhost:5000/${img}`}
                        alt={`Additional Image ${index + 1}`}
                        sx={{ borderRadius: 2, cursor: "pointer" }}
                        onClick={() =>
                          setOpenImageSlider(true)
                        }
                      />

                      {/* Remove button only in edit mode */}
                      {editMode && (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => handleRemoveImage(index)}
                          sx={{
                            position: "absolute",
                            top: 0,
                            right: 0,
                            minWidth: "24px",
                            width: "24px",
                            height: "24px",
                            padding: 0,
                            borderRadius: "50%",
                            backgroundColor: "rgba(255, 0, 0, 0.7)",
                          }}
                        >
                          <Close />
                        </Button>
                      )}
                    </Box>
                  ))}

                  {/* Show more images button if there are more than 2 */}
                  {proposal.additionalImages.length > 2 && (
                    <>
                      <Button
                        variant="text"
                        onClick={() => setOpenImageSlider(true)}
                        sx={{ mr: 1 }}
                      >
                        +{proposal.additionalImages.length - 2}
                      </Button>
                      <ImageSliderDialog
                        open={openImageSlider}
                        onClose={() => setOpenImageSlider(false)}
                        images={proposal.additionalImages}
                      />
                    </>
                  )}

                  {/* Open Dialog button if in edit mode and less than 5 images */}
                  {editMode && proposal.additionalImages.length < 5 && (
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setDialogOpen(true)}
                      sx={{
                        height: "150px",
                        minWidth: "150px",
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      +
                    </Button>
                  )}
                </Box>

                <Dialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  maxWidth="md"
                  fullWidth
                >
                  <DialogTitle>Add Images</DialogTitle>
                  <DialogContent>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      gutterBottom
                    >
                      You can add up to {5 - proposal.additionalImages.length}{" "}
                      images.
                    </Typography>

                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {proposal.additionalImages.map((image, index) => (
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
                              src={
                                image.imageURL ||
                                `http://localhost:5000/${image}`
                              }
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
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={() => setDialogOpen(false)}
                      color="secondary"
                    >
                      Close
                    </Button>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={proposal.additionalImages.length >= 5}
                    >
                      Add Image
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={(e) =>
                          handleFileUpload(e, "additionalImages")
                        }
                      />
                    </Button>
                  </DialogActions>
                </Dialog>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Buttons */}
            {editMode ? (
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveChanges}
                  fullWidth
                >
                  Save Changes
                </Button>
              </Box>
            ) : null}
          </CardContent>
        </Card>

        {/* Image Dialog */}
        <Dialog open={openImage} onClose={handleCloseImage}>
          <DialogContent>
            <CardMedia
              component="img"
              height="400"
              image={selectedImage}
              alt="Enlarged Image"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseImage} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ThemeProvider>
  );
};

export default ProposalDetails;
