import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Button,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";

const AddAdDialog = ({ open, onClose }) => {
  const [ad, setAd] = useState({
    model: null,
    startPublishDate: null,
    endPublishDate: null,
    audios: {
      horn: null,
      engine: null,
      boost: null,
    },
    features: {
      engine: "",
      interior: "",
      safety: "",
    },
    productId: "", // New state for selected product ID
  });
  const [products, setProducts] = useState([]); // To store product options
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch product names on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/advertisements/getProducts`
        );
        setProducts(response.data); // Adjust based on your API response structure
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (open) fetchProducts();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAd((prev) => {
      const updated = { ...prev };

      if (name === "startPublishDate" || name === "endPublishDate") {
        // Convert empty string to null
        updated[name] = value ? value : null;
      } else if (name in prev.features) {
        updated.features[name] = value;
      } else if (name === "productId") {
        updated.productId = value;
      }

      return updated;
    });
  };

  const handleFileUpload = (key, type, e) => {
    const file = e.target.files[0];
    if (file) {
      setAd((prev) => ({
        ...prev,
        [key]: type
          ? {
              ...prev[key],
              [type]: file,
            }
          : file,
      }));
    }
  };

  const validateFields = () => {
    const fieldErrors = {};
    if (!ad.model) fieldErrors.model = "3D Model is required";
    if (!ad.features.engine) fieldErrors.engine = "Engine feature is required";
    if (!ad.features.interior)
      fieldErrors.interior = "Interior feature is required";
    if (!ad.features.safety) fieldErrors.safety = "Safety feature is required";
    if (!ad.audios.engine) fieldErrors.engineAudio = "Engine sound is required";
    if (!ad.audios.horn) fieldErrors.hornAudio = "Horn sound is required";
    if (!ad.audios.boost) fieldErrors.boostAudio = "Boost sound is required";
    if (!ad.productId) fieldErrors.productId = "Product is required";
    if (ad.startPublishDate && isNaN(Date.parse(ad.startPublishDate))) {
      fieldErrors.startPublishDate = "Invalid start publish date";
    }
    if (ad.endPublishDate && isNaN(Date.parse(ad.endPublishDate))) {
      fieldErrors.endPublishDate = "Invalid end publish date";
    }

    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSaveAd = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("model", ad.model);
      Object.entries(ad.audios).forEach(([key, value]) => {
        formData.append(`audios[${key}]`, value);
      });
      formData.append("features", JSON.stringify(ad.features));
      formData.append("productId", ad.productId);
      formData.append("startPublishDate", ad.startPublishDate);
      formData.append("endPublishDate", ad.endPublishDate);

      const response = await axios.post(
        `http://localhost:4000/api/v1/advertisements/create-advertisement`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 201) {
        setLoading(false);
        setErrors({});
        onClose();
        console.log("Advertisement created successfully:", response.data);
      }
    } catch (error) {
      console.error("Error saving advertisement:", error);
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle display="flex" justifyContent="space-between">
        Add Advertisement
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {/* ComboBox for product selection */}
        <TextField
          select
          label="Select Product"
          name="productId"
          value={ad.productId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          error={!!errors.productId}
          helperText={errors.productId}
        >
          {products.map((product) => (
            <MenuItem key={product._id} value={product._id}>
              {product.name} - {product.sellerId.firstName}{" "}
              {product.sellerId.lastName}
            </MenuItem>
          ))}
        </TextField>

        {/* Other inputs remain unchanged */}
        <input
          accept=".glb,.gltf"
          type="file"
          onChange={(e) => handleFileUpload("model", null, e)}
          style={{ display: "none" }}
          id="model-upload"
        />
        <label htmlFor="model-upload">
          <Button variant="contained" component="span" fullWidth sx={{ mt: 2 }}>
            {ad.model ? "Change 3D Model" : "Upload 3D Model (.glb)"}
          </Button>
        </label>
        {ad.model && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Model uploaded: {ad.model.name}
          </Typography>
        )}
        {errors.model && (
          <Typography color="error" variant="caption">
            {errors.model}
          </Typography>
        )}

        {["engine", "interior", "safety"].map((feature) => (
          <TextField
            key={feature}
            label={`${
              feature.charAt(0).toUpperCase() + feature.slice(1)
            } Feature`}
            name={feature}
            value={ad.features[feature]}
            onChange={handleChange}
            fullWidth
            margin="normal"
            error={!!errors[feature]}
            helperText={errors[feature]}
          />
        ))}

        {/* Audio Upload */}
        {["engine", "horn", "boost"].map((type) => (
          <Box key={type} sx={{ mb: 2 }}>
            <input
              accept="audio/*"
              type="file"
              onChange={(e) => handleFileUpload("audios", type, e)}
              style={{ display: "none" }}
              id={`${type}-upload`}
            />
            <label htmlFor={`${type}-upload`}>
              <Button variant="contained" component="span">
                {ad.audios[type]
                  ? `Change ${type} Sound`
                  : `Upload ${type} Sound`}
              </Button>
            </label>
            {ad.audios[type] && (
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {type.charAt(0).toUpperCase() + type.slice(1)} sound uploaded:{" "}
                {ad.audios[type].name}
              </Typography>
            )}
            {errors[`${type}Audio`] && (
              <Typography color="error" variant="caption">
                {errors[`${type}Audio`]}
              </Typography>
            )}
          </Box>
        ))}
        <TextField
          label="Start Publish Date"
          type="datetime-local"
          name="startPublishDate"
          value={ad.startPublishDate}
          fullWidth
          margin="normal"
          error={!!errors.startPublishDate}
          onChange={handleChange}
          helperText={errors.startPublishDate}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Publish Date"
          type="datetime-local"
          name="endPublishDate"
          onChange={handleChange}
          value={ad.endPublishDate}
          fullWidth
          margin="normal"
          error={!!errors.endPublishDate}
          helperText={errors.endPublishDate}
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSaveAd} color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddAdDialog;
