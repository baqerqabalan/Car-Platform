import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Typography,
  Divider,
  IconButton,
  Grid,
} from "@mui/material";
import axios from "axios";
import { Close } from "@mui/icons-material";

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

const initialFormState = {
  name: "",
  description: "",
  price: "",
  image: null,
  additionalImages: [],
  is_auction: false,
  auction_end_date: null,
  category: "",
  confirmUserInfo: false,
  agreeToTerms: false,
  address: "",
};

const errorMessages = {
  required: "This field is required",
  descriptionLength: "Description should be between 10 and 255 characters",
  priceInvalid: "Price must be a positive number",
  auctionDateMissing: "Auction End Date is required for auction items",
  auctionDateValidation: "Auction End Date should be in the future",
  imageMissing: "Please upload a cover image",
  confirmUserInfo:
    "You must confirm that the registered user info will be used",
  agreeToTerms: "You must agree to the terms and conditions",
  address: "Address is required",
};

const AddProductDialog = ({ open, handleClose }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleMultiFileUpload = (e) => {
    const newFiles = Array.from(e.target.files); // Get new files from input
    const existingFiles = formData.additionalImages; // Get existing files
    const totalFiles = existingFiles.concat(newFiles).slice(0, 5); // Concatenate and limit to 5
    setFormData((prevValues) => ({
      ...prevValues,
      additionalImages: totalFiles,
    }));
  };

  const handleRemoveImage = (index) => {
    const updatedImages = [...formData.additionalImages];
    updatedImages.splice(index, 1); // Remove the image at the specified index
    setFormData((prevValues) => ({
      ...prevValues,
      additionalImages: updatedImages,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    const {
      name,
      description,
      price,
      image,
      category,
      is_auction,
      auction_end_date,
      confirmUserInfo,
      agreeToTerms,
      address,
    } = formData;

    if (!name) newErrors.name = errorMessages.required;
    if (!description) newErrors.description = errorMessages.required;
    else if (description.length < 10 || description.length > 255)
      newErrors.description = errorMessages.descriptionLength;

    if (!price || price <= 0) newErrors.price = errorMessages.priceInvalid;
    if (!image) newErrors.image = errorMessages.imageMissing;
    if (!category) newErrors.category = errorMessages.required;

    if (is_auction && !auction_end_date)
      newErrors.auction_end_date = errorMessages.auctionDateMissing;
    if (
      is_auction &&
      auction_end_date &&
      new Date(auction_end_date) < Date.now()
    )
      newErrors.auction_end_date = errorMessages.auctionDateValidation;

    if (!confirmUserInfo)
      newErrors.confirmUserInfo = errorMessages.confirmUserInfo;
    if (!agreeToTerms) newErrors.agreeToTerms = errorMessages.agreeToTerms;
    if (!address) newErrors.address = errorMessages.address;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCheckboxChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.checked });

  const handleFileUpload = (e, field) =>
    setFormData({
      ...formData,
      [field]: e.target.files.length ? e.target.files[0] : null,
    });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("image", formData.image);
      formDataToSubmit.append("address", formData.address);
      formDataToSubmit.append("is_auction", formData.is_auction);
      formDataToSubmit.append("price", formData.price);
      formDataToSubmit.append("category", formData.category);
      formDataToSubmit.append("confirmUserInfo", formData.confirmUserInfo);
      formDataToSubmit.append("agreeToTerms", formData.agreeToTerms);
      if (formData.is_auction) {
        formDataToSubmit.append("auction_end_date", formData.auction_end_date);
      }
      if (formData.additionalImages) {
        formData.additionalImages.forEach((file) =>
          formDataToSubmit.append("additionalImages", file)
        );
      }

      const response = await axios.post(
        `http://localhost:5000/api/v1/products/create`,
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setMessage(response.data.message);
        setFormData(initialFormState);
        setTimeout(() => setMessage(""), 1000);
        handleClose();
        window.location.reload();
      } else {
        setErrors({
          general: response.data.message || "Failed to add product",
        });
      }
    } catch (error) {
      setErrors({ general: "Error adding product" });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} sx={{ width: "100%" }}>
      <DialogTitle>Add New Product</DialogTitle>
      {message && (
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
      )}
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Product Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            label="Description"
            name="description"
            multiline
            rows={3}
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
            required
          />
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
            required
          />
          <FormControl error={!!errors.category} required>
            <InputLabel id="category-label">Car Brand</InputLabel>
            <Select
              labelId="category-label"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              {carBrands.map((brand) => (
                <MenuItem key={brand} value={brand}>
                  {brand}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" component="label">
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFileUpload(e, "image")}
            />
            {formData.image
              ? `Selected: ${formData.image.name}`
              : "Upload Cover Image*"}
          </Button>
          {!!errors.image && <Box color="error.main">{errors.image}</Box>}

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
              {formData.additionalImages?.length
                ? `Selected: ${formData.additionalImages.length} images`
                : "Upload Images of your product"}
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
                {formData.additionalImages?.length >= 5 && (
                  <Typography variant="body2" color="error">
                    You can only upload up to 5 images.
                  </Typography>
                )}
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {formData.additionalImages?.map((image, index) => (
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
                    disabled={formData.additionalImages?.length >= 5}
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

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_auction}
                name="is_auction"
                onChange={handleCheckboxChange}
              />
            }
            label="Is this an Auction Product?"
          />
          {formData.is_auction && (
            <TextField
              label="Auction End Date"
              name="auction_end_date"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={formData.auction_end_date}
              onChange={handleChange}
              error={!!errors.auction_end_date}
              helperText={errors.auction_end_date}
              required
            />
          )}
        </Box>
        <Divider sx={{ mt: 2 }} />
        <Box display="flex" flexDirection="column" mt={2}>
          <Typography>Additional Seller Info</Typography>
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.confirmUserInfo}
                name="confirmUserInfo"
                onChange={handleCheckboxChange}
              />
            }
            label="I confirm that the registered user information will be used*"
          />
          {errors.confirmUserInfo && (
            <Typography color="error" variant="caption">
              {errors.confirmUserInfo}
            </Typography>
          )}
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.agreeToTerms}
                name="agreeToTerms"
                onChange={handleCheckboxChange}
              />
            }
            label="Agree to the terms and conditions*"
          />
          {errors.agreeToTerms && (
            <Typography color="error" variant="caption">
              {errors.agreeToTerms}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleFormSubmit}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
