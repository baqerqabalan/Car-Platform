import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  Divider,
  CardMedia,
  Stack,
  ImageList,
  ImageListItem,
  CircularProgress,
  createTheme,
  ThemeProvider,
  CssBaseline,
  FormControlLabel,
  TextField,
  Avatar,
  Dialog,
  Alert,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AuctionIcon from "@mui/icons-material/Gavel";
import { useNavigate, useParams } from "react-router-dom";
import { getUserIdFromToken, isAuthenticated } from "../../helpers/authHelper";
import moment from "moment";
import axios from "axios";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import AuctionButton from "./AuctionButton";
import { Cancel, Delete, Edit, ZoomOut } from "@mui/icons-material";
import { useCallback } from "react";

const carBrands = [
  "Mercedes",
  "BMW",
  "Audi",
  "Toyota",
  "Honda",
  "Ford",
  "Chevrolet",
  "Tesla",
];

const ViewProductDetails = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const { mode } = React.useContext(
    ThemeContext || localStorage.getItem("theme")
  );
  const [editMode, setEditMode] = useState(false); // New state for edit mode
  const [switchAuction, setSwitchAuction] = useState(false);
  const [editableProduct, setEditableProduct] = useState({
    name: "",
    description: "",
    price: "",
    image: "", // Existing images from the server
    images: [], // Images to display, both from object URLs and server
    category: "",
    address: "",
    is_auction: false,
    auction_end_date: "",
    auction_start_date: "",
  });
  const [openZoom, setOpenZoom] = useState(false);
  const [zoomImage, setZoomImage] = useState("");
  const [biddingHistory, setBiddingHistory] = useState(null);
  const [error, setError] = useState(null);
  const [deletedImages, setDeletedImages] = useState([]);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleFileUpload = (event, type) => {
    const files = event.target.files;

    if (type === "image") {
      const file = files[0];
      const coverImageURL = URL.createObjectURL(file);

      setEditableProduct((prevProduct) => ({
        ...prevProduct,
        image: coverImageURL,
        imageFile: file, // Store the file object for uploading
      }));
    } else if (type === "images") {
      const newImages = Array.from(files).map((file) => ({
        file,
        imageURL: URL.createObjectURL(file), // Blob URL for preview
      }));

      setEditableProduct((prevProduct) => ({
        ...prevProduct,
        images: [...(prevProduct.images || []), ...newImages], // Append new images
      }));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!editableProduct.name) {
      errors.name = "Product Name is required";
    }
    if (!editableProduct.description) {
      errors.description = "Description is required";
    } else if (editableProduct.length < 8 || editableProduct.length > 255) {
      errors.description = "Description must be between 8 and 255 characters";
    }
    if (!editableProduct.category) {
      errors.category = "Category is required";
    }
    if (!editableProduct.address) {
      errors.address = "Address is required";
    }
    if (!editableProduct.price) {
      errors.price = "Price is required";
    } else if (editableProduct.price < 0) {
      errors.price = "Price must be greater than 0";
    }

    if (!editableProduct.image) {
      errors.image = "Cover Image is required";
    }

    if (editableProduct.is_auction) {
      if (!editableProduct.auction_end_date) {
        errors.auction_end_date = "Auction end date is required";
      } else if (
        new Date(editableProduct.auction_end_date) < Date.now()
      ) {
        errors.auction_end_date = "Auction end date must be in future";
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", editableProduct.name);
      formData.append("description", editableProduct.description);

      if (!editableProduct.is_auction) {
        formData.append("price", editableProduct.price);
      }

      formData.append("category", editableProduct.category);
      formData.append("address", editableProduct.address);

      // Check if the auction state has changed
      const isAuctionSwitchedOn =
        editableProduct.is_auction && !product.is_auction;

      // Only set auction_start_date if auction mode was just activated
      if (editableProduct.is_auction) {
        formData.append("is_auction", true);
        if (isAuctionSwitchedOn) {
          formData.append("auction_start_date", Date.now());
        } else {
          formData.append("auction_start_date", product.auction_start_date); // Preserve existing start date
        }

        if (editableProduct.auction_end_date) {
          formData.append("auction_end_date", editableProduct.auction_end_date);
        }
      } else {
        formData.append("is_auction", false);
      }

      // Append cover image file if present
      if (editableProduct.imageFile) {
        formData.append("image", editableProduct.imageFile);
      }

      // Append multiple images (new ones only)
      editableProduct.images.forEach((imgObj) => {
        if (imgObj.file) {
          formData.append("images", imgObj.file);
        }
      });

      // Append the list of deleted images
      deletedImages.forEach((img) => {
        formData.append("deletedImages", img); // Append the image URL/path to delete
      });

      // API call to save the product changes
      await axios.patch(
        `http://localhost:5000/api/v1/products/update/${productId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setProduct(editableProduct);
      setEditMode(false);
      setLoading(false);
      fetchProduct(); // Refresh the product data
    } catch (error) {
      console.error("Error saving product details", error);
      setError("Failed to update the product");
      setLoading(false);
    }
  };

  const removeAdditionalImage = (index) => {
    setEditableProduct((prevProduct) => {
      const updatedImages = prevProduct.images.filter((_, i) => i !== index);

      // Track the removed image
      const removedImage = prevProduct.images[index];

      if (removedImage) {
        setDeletedImages((prevDeletedImages) => [
          ...prevDeletedImages,
          removedImage,
        ]);

        // Revoke object URL if it's a blob URL
        if (removedImage.imageURL) {
          URL.revokeObjectURL(removedImage.imageURL);
        }
      }

      // Update the product with the new images
      return {
        ...prevProduct,
        images: updatedImages,
      };
    });
  };

  // Function to handle switching to/from auction
  const handleAuctionCheckboxChange = (event) => {
    const { checked } = event.target;

    setEditableProduct((prevState) => ({
      ...prevState,
      is_auction: checked, // Update auction state
    }));

    // Show auction date field only if checked (i.e., auction mode)
    setSwitchAuction(checked);
  };

  // Function to handle switching to a normal sale
  const handleCheckboxChange = (event) => {
    const { checked } = event.target;

    if (checked) {
      setEditableProduct((prevState) => ({
        ...prevState,
        is_auction: false, // Switch to normal sale
        auction_end_date: null, // Clear auction end date
        auction_start_date: null, // Clear auction start date
      }));
    } else {
      setEditableProduct((prevState) => ({
        ...prevState,
        is_auction: true, // Switch to auction sale
      }));
    }
  };

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `http://localhost:5000/api/v1/products/getProduct/${productId}`
      );
      if (response.status === 200) {
        let data = response.data;
        let biddingHistory = response.data.biddingHistory;

        if (data.product.is_auction) {
          data.product.auction_start_date = new Date(
            data.product.auction_start_date
          );
          data.product.auction_end_date = moment(
            data.product.auction_end_date
          ).format("YYYY-MM-DD HH:mm");
        }

        data.product.createdAt = moment(data.product.createdAt).format(
          "DD-MM-YYYY HH:mm"
        );
        setProduct(data.product);
        setBiddingHistory(biddingHistory);
        setEditableProduct(data.product); // Initialize editable data
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }, [productId]);

  const handleZoom = (image) => {
    setZoomImage(image);
    setOpenZoom(true);
  };

  const handleCloseZoom = () => setOpenZoom(false);

  useEffect(() => {
    return () => {
      editableProduct.images.forEach((imgObj) => {
        if (imgObj.imageURL && imgObj.imageURL.startsWith("blob:")) {
          URL.revokeObjectURL(imgObj.imageURL);
        }
      });
    };
  }, [editableProduct.images]);

  const checkAuthentication = useCallback(() => {
    if (isAuthenticated()) {
      return true;
    } else {
      navigate(`/login?redirect=Market Place/Product/${productId}`);
    }
  }, [productId, navigate]);

  useEffect(() => {
    if (checkAuthentication()) {
      fetchProduct();
    }
  }, [checkAuthentication, fetchProduct]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    setEditableProduct({
      ...editableProduct,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: theme.palette.default,
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
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          p: 2,
          fontWeight: "bold",
          color: "error.main",
        }}
      >
        {error} Please{" "}
        <Link onClick={() => fetchProduct()} sx={{ cursor: "pointer" }}>
          try again later
        </Link>
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 4 }}>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          {/* Back Button */}
          <Button
            onClick={() => navigate(-1)}
            sx={{ display: "flex", justifyContent: "start" }}
            variant="outlined"
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          {/* Edit Mode Toggle Button */}
          {product.sellerId._id === getUserIdFromToken() ? (
            <Button
              sx={{ display: "flex", justifyContent: "center" }}
              variant="contained"
              color={editMode ? "secondary" : "primary"}
              onClick={handleEditToggle}
            >
              {editMode ? <Cancel /> : <Edit />}
            </Button>
          ) : null}
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {editMode ? (
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
                    {editableProduct.image
                      ? `Selected: ${editableProduct.image}`
                      : "Edit Cover Image"}
                  </Button>

                  {/* Cover Image Preview */}
                  {editableProduct.image ? (
                    <CardMedia
                      component="img"
                      height="400"
                      image={
                        editableProduct.image.startsWith("blob:")
                          ? editableProduct.image
                          : `http://localhost:5000/${editableProduct.image}`
                      }
                      alt="Preview Image"
                      sx={{ mt: 2 }}
                    />
                  ) : null}
                </>
              ) : (
                <CardMedia
                  component="img"
                  height="400"
                  image={`http://localhost:5000/${product.image}`}
                  alt={product.name}
                  onClick={() => handleZoom(product.image)}
                  sx={{ cursor: "pointer" }}
                />
              )}
            </Paper>

            <Box sx={{ mt: 2 }}>
              {editMode ? (
                <>
                  {/* Add Additional Images Button */}
                  <Button variant="outlined" component="label" fullWidth>
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      name="images"
                      multiple
                      onChange={(e) => handleFileUpload(e, "images")}
                    />
                    Add Additional Images
                  </Button>

                  {/* Display Additional Images */}
                  <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                    {editableProduct.images.map((image, index) => (
                      <ImageListItem key={index}>
                        <CardMedia
                          component="img"
                          onClick={() => handleZoom(image)}
                          image={
                            image.file
                              ? URL.createObjectURL(image.file)
                              : image.imageURL ||
                                `http://localhost:5000/${image}`
                          }
                          alt={`Image ${index}`}
                          sx={{ cursor: "pointer" }}
                        />

                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => removeAdditionalImage(index)}
                        >
                          Remove
                        </Button>
                      </ImageListItem>
                    ))}
                  </ImageList>
                </>
              ) : (
                <ImageList sx={{ mt: 2 }} cols={3} rowHeight={164}>
                  {product.images.map((image, index) => (
                    <ImageListItem key={index}>
                      <CardMedia
                        component="img"
                        onClick={() => handleZoom(image)}
                        image={`http://localhost:5000/${image}`} // Server-stored images
                        alt={`Image ${index}`}
                        sx={{ cursor: "pointer" }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 4 }}>
              {editMode ? (
                <>
                  <TextField
                    label="Product Name"
                    name="name"
                    value={editableProduct.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Product Description"
                    name="description"
                    value={editableProduct.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    fullWidth
                    required
                    error={!!formErrors.description}
                    helperText={formErrors.description}
                    sx={{ mb: 2 }}
                  />
                  {biddingHistory && biddingHistory.length === 0 ? (
                    <TextField
                      label="Price"
                      name="price"
                      value={editableProduct.price}
                      onChange={handleChange}
                      error={!!formErrors.price}
                      helperText={formErrors.price}
                      required
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                  ) : (
                    <Typography variant="h5" color="primary" gutterBottom>
                      Price: ${product.price}
                      {editMode ? (
                        <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                          Sorry you can't update the price since the customers
                          start to bid
                        </Alert>
                      ) : null}
                    </Typography>
                  )}
                  <FormControl
                    error={!!formErrors.category}
                    helperText={formErrors.category}
                    sx={{ mb: 2 }}
                    fullWidth
                    required
                  >
                    <InputLabel id="category-label">Category</InputLabel>
                    <Select
                      labelId="category-label"
                      name="category"
                      value={product.category}
                      onChange={handleChange}
                      fullWidth
                    >
                      {carBrands.map((brand) => (
                        <MenuItem key={brand} value={brand}>
                          {brand}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Location"
                    name="address"
                    value={editableProduct.address}
                    onChange={handleChange}
                    error={!!formErrors.address}
                    helperText={formErrors.address}
                    fullWidth
                    required
                    sx={{ mb: 2 }}
                  />
                </>
              ) : (
                <>
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {product.description}
                  </Typography>
                  <Typography variant="h5" color="primary" gutterBottom>
                    Price: ${product.price}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Category: {product.category}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Location: {product.address}
                  </Typography>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              {product.is_auction ? (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AuctionIcon fontSize="small" color="secondary" />
                      <Typography variant="body1" fontWeight="bold">
                        Auction Information
                      </Typography>
                    </Stack>

                    {editMode && biddingHistory.length === 0 ? (
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={!editableProduct.is_auction} // Checkbox reflects the opposite of `is_auction`
                            name="is_auction"
                            onChange={handleCheckboxChange} // Handles switching between auction and normal sale
                          />
                        }
                        label="Do you want to switch this product to a normal sale?"
                      />
                    ) : editMode && biddingHistory.length !== 0 ? (
                      <Alert severity="warning">
                        Sorry, you can't switch to a normal sale since customers
                        have already started bidding.
                      </Alert>
                    ) : null}

                    <Typography variant="body2" color="text.secondary">
                      Start Date:{" "}
                      {moment(product.auction_start_date).format(
                        "DD-MM-YYYY HH:mm:ss"
                      )}
                    </Typography>

                    {editMode &&
                    new Date() < new Date(product.auction_end_date) ? (
                      <TextField
                        type="datetime-local"
                        label="Auction End Date"
                        name="auction_end_date"
                        error={!!formErrors.auction_end_date}
                        helperText={formErrors.auction_end_date}
                        value={editableProduct.auction_end_date}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2, mt: 2 }}
                        required
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        End Date:{" "}
                        {moment(product.auction_end_date).format(
                          "DD-MM-YYYY HH:mm:ss"
                        )}
                      </Typography>
                    )}

                    <AuctionButton product={product} />
                  </Box>
                </>
              ) : (
                editMode && (
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editableProduct.is_auction} // Checkbox reflects `is_auction`
                          name="is_auction"
                          onChange={handleAuctionCheckboxChange} // Handles switching to auction sale
                        />
                      }
                      label="Do you want to switch this product to an auction sale?"
                    />
                    {switchAuction && (
                      <TextField
                        type="datetime-local"
                        label="Auction End Date"
                        name="auction_end_date"
                        InputLabelProps={{ shrink: true }}
                        error={!!formErrors.auction_end_date}
                        helperText={formErrors.auction_end_date}
                        value={editableProduct.auction_end_date}
                        onChange={handleChange}
                        fullWidth
                        sx={{ mb: 2, mt: 2 }}
                        required
                      />
                    )}
                  </>
                )
              )}

              <Divider sx={{ my: 2 }} />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", gap: 1 }} // Better layout control with spacing
                gutterBottom
              >
                Seller:
                <Avatar
                  src={
                    product.sellerId.profileImg
                      ? `http://localhost:5000/${product.sellerId.profileImg}`
                      : undefined
                  }
                  alt={
                    product.sellerId.profileImg
                      ? product.sellerId.firstName[0]
                      : "U"
                  }
                  sx={{
                    bgcolor: !product.sellerId.profileImg
                      ? "red"
                      : "transparent",
                    cursor: "pointer",
                    width: 30, // Adjust avatar size
                    height: 30,
                    marginLeft: 1, // Add space between text and avatar
                  }}
                  onClick={() => navigate(`/Profile/${product.sellerId._id}`)}
                >
                  {!product.sellerId.profileImg && product.sellerId.firstName
                    ? product.sellerId.firstName[0]
                    : null}
                </Avatar>
                <Typography
                  component="span"
                  sx={{ fontWeight: "bold", marginLeft: 0.5 }} // Add bold style for the name
                >
                  {product.sellerId.firstName} {product.sellerId.lastName}
                </Typography>
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {editMode && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleSaveChanges}
          >
            Save Changes
          </Button>
        )}
      </Box>
      {/* Zoom Dialog */}
      <Dialog open={openZoom} onClose={handleCloseZoom} maxWidth="lg">
        <CardMedia
          component="img"
          image={`http://localhost:5000/${zoomImage}`}
          alt="Zoomed Image"
          sx={{ maxHeight: "90vh", maxWidth: "90vw" }}
        />
        <Button
          onClick={handleCloseZoom}
          startIcon={<ZoomOut />}
          sx={{ position: "absolute", top: 8, right: 8 }}
        >
          Close
        </Button>
      </Dialog>
    </ThemeProvider>
  );
};

export default ViewProductDetails;
