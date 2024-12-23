import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Divider,
  CircularProgress,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import axios from "axios";

const PackagesDialog = ({ open, onClose, reload }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState([""]);
  const [price, setPrice] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({
    title: "",
    description: "",
    price: "",
  });

  const handleAddDescription = () => {
    if (description.length < 4) {
      setDescription([...description, ""]);
    } else {
      setError("You can add a maximum of 4 descriptions.");
    }
  };

  const handleDescriptionChange = (index, value) => {
    const updatedDescriptions = [...description];
    updatedDescriptions[index] = value;
    setDescription(updatedDescriptions);
  };

  const handleRemoveDescription = (index) => {
    const updatedDescriptions = description.filter((_, i) => i !== index);
    setDescription(updatedDescriptions);
  };

  const validateForm = () => {
    let newErrors = {};
    if (!title.trim()) {
      newErrors.title = "Title is required.";
    }
    if (!description[0].trim()) {
      newErrors.description = "At Least One Description is required.";
    }
    if (!price || price <= 0) {
      newErrors.price = "Price must be greater than 0.";
    }
    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const data = { title, description, price };

    try {
      setLoading(true);
      setError(null);

      await axios.post("http://localhost:4000/api/v1/packages/create", data);

      setLoading(false);
      reload();
      onClose();
    } catch (error) {
      console.error("Failed to submit package:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Add Subscription Package
        <Divider />
      </DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        {loading ? (
          <Box display="flex" justifyContent="center" mt={3}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <>
            <Box mb={2} mt={1}>
              <TextField
                label="Title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              Descriptions
            </Typography>
            {description.map((desc, index) => (
              <Box key={index} display="flex" alignItems="center" mb={2}>
                <TextField
                  label={`Description ${index + 1}`}
                  value={desc}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  fullWidth
                  name="description"
                  error={!!formErrors.description}
                  helperText={index === 0 && formErrors.description}
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemoveDescription(index)}
                >
                  <Delete />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddDescription}
              fullWidth
              disabled={description.length >= 4} // Disable button when max reached
            >
              Add Description
            </Button>
            <Box mt={3}>
              <TextField
                label="Price ($)"
                type="number"
                name="price"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                fullWidth
                error={!!formErrors.price}
                helperText={formErrors.price}
              />
            </Box>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PackagesDialog;