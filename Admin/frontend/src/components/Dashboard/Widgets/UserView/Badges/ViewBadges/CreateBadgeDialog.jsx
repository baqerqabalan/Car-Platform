import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress, ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import axios from "axios";
import React, { useContext, useMemo, useState } from "react";
import { setAuthHeader } from "../../../../../../helpers/authHelper";
import { ThemeContext } from "../../../../../../context/ThemeProviderComponent";

const CreateBadgeDialog = ({ open, onClose }) => {
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    score: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formValues.name) newErrors.name = "Name is required.";
    if (!formValues.description) newErrors.description = "Description is required.";
    else if (formValues.description.length > 255 || formValues.description.length < 8) {
      newErrors.description = "Description should be between 8 and 255 characters.";
    }
    if (!formValues.score) newErrors.score = "Score is required.";
    else if (isNaN(Number(formValues.score)) || formValues.score < 0) {
      newErrors.score = "Score should be a positive number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveBadge = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setErrors({});

      await axios.post('http://localhost:4000/api/v1/badges/createBadge', formValues, setAuthHeader());
      window.location.reload();
      setLoading(false);
      onClose(); 
    } catch (error) {
      setLoading(false);
      console.error("Error creating badge:", error);
      setErrors({ general: "An error occurred while creating the badge." });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create New Badge</DialogTitle>
      <DialogContent>
        {errors.general && <p style={{ color: "red" }}>{errors.general}</p>}
        <TextField
          fullWidth
          label="Name*"
          name="name"
          value={formValues.name}
          onChange={handleChange}
          error={!!errors.name}
          helperText={errors.name}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Description*"
          name="description"
          multiline
          rows={4}
          value={formValues.description}
          onChange={handleChange}
          error={!!errors.description}
          helperText={errors.description}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Score*"
          name="score"
          type="number"
          value={formValues.score}
          onChange={handleChange}
          error={!!errors.score}
          helperText={errors.score}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSaveBadge} variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
    </ThemeProvider>
  );
};

export default CreateBadgeDialog;