import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Save,
  Delete,
  Close,
  AddCircle,
  RemoveCircle,
} from "@mui/icons-material";
import axios from "axios";

const PackagesView = ({ packages, onUpdate, onDelete }) => {
  const [editablePackage, setEditablePackage] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  const handleEdit = (pkg) => {
    setEditablePackage(pkg._id);
    setEditedFields({ ...pkg }); // Pre-fill fields with current package data
  };

  const validateFields = () => {
    const newErrors = {};

    if (!editedFields.title) {
      newErrors.title = "Title is required.";
    }
    if (editedFields.price === undefined || editedFields.price === "") {
      newErrors.price = "Price is required.";
    } else if (editedFields.price < 0) {
      newErrors.price = "Price cannot be negative.";
    }
    if (!editedFields.description || editedFields.description.length === 0) {
      newErrors.description = "At least one description is required.";
    } else {
      const emptyDescriptions = editedFields.description.some(
        (desc) => !desc.trim()
      );
      if (emptyDescriptions) {
        newErrors.description = "Descriptions cannot be empty.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field, value) => {
    setEditedFields((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // Clear the field error
  };

  const handleAddDescription = () => {
    if (editedFields.description.length < 4) {
      setEditedFields((prev) => ({
        ...prev,
        description: [...prev.description, ""],
      }));
    }
  };

  const handleRemoveDescription = (index) => {
    if (editedFields.description.length === 1) {
      setErrors((prev) => ({
        ...prev,
        description: "At least one description is required.",
      }));
      return;
    }
    setEditedFields((prev) => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!validateFields()) return;

    try {
      await axios.patch(
        `http://localhost:4000/api/v1/packages/update/${editablePackage}`,
        editedFields
      );
      setEditablePackage(null);
      setMessage("Package Updated Successfully");
      setError("");
      onUpdate(); // Refresh packages after update
    } catch (error) {
      console.error("Error updating package:", error);
      setError("Error updating package");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/v1/packages/delete/${id}`);
      setMessage("Package Deleted Successfully");
      setError(null);
      onDelete();
    } catch (error) {
      console.error("Error deleting package:", error);
      setError("Error deleting package");
    }
  };

  return (
    <Box mt={3}>
      {message && (
        <Box display="flex" justifyContent="center" mb={1}>
          <Typography bgcolor="#228b22" textAlign="center" p={1} color="white">
            {message}{" "}
            <IconButton>
              <Close
                sx={{ cursor: "pointer", color: "white" }}
                onClick={() => setMessage(null)}
              />
            </IconButton>
          </Typography>
        </Box>
      )}
      {error && (
        <Box display="flex" justifyContent="center" mb={1}>
          <Typography bgcolor="#ed1c24" textAlign="center" p={1} color="white">
            {error}
            <IconButton>
              <Close
                sx={{ cursor: "pointer", color: "white" }}
                onClick={() => setError(null)}
              />
            </IconButton>
          </Typography>
        </Box>
      )}
      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} sm={6} md={4} key={pkg._id}>
            <Card
              elevation={3}
              sx={{
                padding: 2,
                borderRadius: "12px",
                border:
                  editablePackage === pkg._id
                    ? "2px solid #1976d2"
                    : "2px solid transparent",
              }}
            >
              <CardContent>
                {editablePackage === pkg._id ? (
                  <>
                    <TextField
                      label="Title"
                      value={editedFields.title || ""}
                      error={!!errors.title}
                      helperText={errors.title}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                      required
                    />
                    <TextField
                      label="Price ($)"
                      type="number"
                      error={!!errors.price}
                      helperText={errors.price}
                      value={editedFields.price || ""}
                      onChange={(e) =>
                        handleFieldChange("price", e.target.value)
                      }
                      fullWidth
                      margin="normal"
                      required
                    />
                    {editedFields.description.map((desc, index) => (
                      <Box
                        key={index}
                        display="flex"
                        alignItems="center"
                        gap={1}
                        marginBottom={1}
                      >
                        <TextField
                          label={`Description ${index + 1}`}
                          value={desc}
                          error={!!errors.description && !desc.trim()}
                          helperText={
                            !!errors.description && !desc.trim()
                              ? errors.description
                              : ""
                          }
                          onChange={(e) =>
                            handleFieldChange("description", [
                              ...editedFields.description.slice(0, index),
                              e.target.value,
                              ...editedFields.description.slice(index + 1),
                            ])
                          }
                          fullWidth
                          required
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveDescription(index)}
                        >
                          <RemoveCircle />
                        </IconButton>
                      </Box>
                    ))}
                    {editedFields.description.length < 4 && (
                      <Button
                        startIcon={<AddCircle />}
                        onClick={handleAddDescription}
                        variant="outlined"
                        sx={{ marginTop: "8px" }}
                      >
                        Add Description
                      </Button>
                    )}
                  </>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {pkg.title}
                    </Typography>
                    <Typography variant="body1" color="textSecondary">
                      Price: ${pkg.price}
                    </Typography>
                    <Box mt={1}>
                      {pkg.description.map((desc, index) => (
                        <Typography
                          key={index}
                          variant="body2"
                          color="textSecondary"
                          sx={{ marginBottom: "4px" }}
                        >
                          • {desc}
                        </Typography>
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
              <CardActions>
                {editablePackage === pkg._id ? (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSave}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setEditablePackage(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <IconButton color="primary" onClick={() => handleEdit(pkg)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(pkg._id)}
                    >
                      <Delete />
                    </IconButton>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PackagesView;
