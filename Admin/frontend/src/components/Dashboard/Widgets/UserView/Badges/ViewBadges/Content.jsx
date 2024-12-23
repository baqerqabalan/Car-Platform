import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CssBaseline,
  Grid,
  IconButton,
  TextField,
  Typography,
  createTheme,
  ThemeProvider,
  CircularProgress,
  Link,
} from "@mui/material";
import { Edit, Delete, Save, Cancel } from "@mui/icons-material";
import { ThemeContext } from "../../../../../../context/ThemeProviderComponent";
import axios from "axios";
import { setAuthHeader } from "../../../../../../helpers/authHelper";

const Content = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { mode } = useContext(ThemeContext || { mode: "light" });

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const [badges, setBadges] = useState([]);
  const [editingBadgeId, setEditingBadgeId] = useState("");
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  const handleEdit = (id) => {
    const badgeToEdit = badges.find((badge) => badge._id === id);
    setEditingBadgeId(id);
    setFormValues({ ...badgeToEdit }); // Use a shallow copy to prevent mutation
  };  

  const handleCancel = () => {
    setEditingBadgeId(null);
    setFormValues({});
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!formValues.name?.trim()) newErrors.name = "Name is required.";
    if (!formValues.description?.trim())
      newErrors.description = "Description is required.";
    if (!formValues.score || isNaN(formValues.score))
      newErrors.score = "Valid score is required.";
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };  

  const handleSave = async (id) => {
    if (!validateEditForm()) return;
  
    try {
        setLoading(true);

      await axios.patch(
        `http://localhost:4000/api/v1/badges/updateBadge/${id}`,
        formValues,
        setAuthHeader()
      );
      fetchBadges();
      setLoading(false);
      setError(null);
      handleCancel();
    } catch (error) {
      console.error("Error while editing the badge:", error);
      setError("Failed to edit the badge.");
      setLoading(false);
    }
  };  

  const handleDelete = async (id) => {
    try {
        setLoading(true);

      await axios.delete(
        `http://localhost:4000/api/v1/badges/deleteBadge/${id}`,
        setAuthHeader()
      );
      setLoading(false);
      setError(null);
      fetchBadges();
    } catch (error) {
      console.error("Error while deleting the badge:", error);
      setError("Failed to delete the badge.");
      setLoading(false);
    }
  };
  
  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const fetchBadges = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/badges/getAllBadges?page=${page}&limit=6`
      );
      setBadges(response.data.badges || []);
      setTotalPages(response.data.totalPages || 1);
      setCurrentPage(response.data.currentPage || 1);
      setError(null);
    } catch (err) {
      console.error("Error fetching badges", err);
      setError("Error fetching badges.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges(currentPage);
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error} Please{" "}
          <Link onClick={() => fetchBadges()} sx={{ cursor: "pointer" }}>
            try again
          </Link>
          .
        </Typography>
      ) : badges.length === 0 ? (
        <Typography textAlign="center" color="text.secondary">
          No badges available.
        </Typography>
      ) : (
        <>
          <Box sx={{ padding: 4 }}>
            <Grid container spacing={3}>
              {badges.map((badge) => (
                <Grid item xs={12} sm={6} md={4} key={badge._id}>
                  <Card
                    sx={{
                      boxShadow: 3,
                      borderRadius: 2,
                      "&:hover": { boxShadow: 6 },
                    }}
                  >
                    <CardContent>
                      {editingBadgeId === badge._id ? (
                        <>
                          <TextField
                            fullWidth
                            label="Name"
                            value={formValues.name || ""}
                            onChange={(e) =>
                              handleInputChange("name", e.target.value)
                            }
                            error={!!errors.name}
                            helperText={errors.name}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Description"
                            value={formValues.description || ""}
                            onChange={(e) =>
                              handleInputChange("description", e.target.value)
                            }
                            error={!!errors.description}
                            helperText={errors.description}
                            margin="normal"
                          />
                          <TextField
                            fullWidth
                            label="Score"
                            type="number"
                            value={formValues.score || ""}
                            onChange={(e) =>
                              handleInputChange("score", e.target.value)
                            }
                            error={!!errors.score}
                            helperText={errors.score}
                            margin="normal"
                          />
                        </>
                      ) : (
                        <>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", mb: 1 }}
                          >
                            {badge.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                          >
                            {badge.description}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", color: "primary.main" }}
                          >
                            Score: {badge.score}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      {editingBadgeId === badge._id ? (
                        <>
                          <Button
                            onClick={() => handleSave(badge._id)}
                            color="primary"
                            startIcon={<Save />}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={handleCancel}
                            color="secondary"
                            startIcon={<Cancel />}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            onClick={() => handleEdit(badge._id)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(badge._id)}
                            color="error"
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
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Button
              disabled={currentPage === 1}
              onClick={handlePrevious}
              sx={{ mx: 1 }}
            >
              Previous
            </Button>
            <Typography variant="body2" sx={{ mx: 2 }}>
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              disabled={currentPage === totalPages}
              onClick={handleNext}
              sx={{ mx: 1 }}
            >
              Next
            </Button>
          </Box>
        </>
      )}
    </ThemeProvider>
  );
};

export default Content;