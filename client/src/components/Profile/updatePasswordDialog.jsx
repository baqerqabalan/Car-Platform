import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  SentimentVerySatisfied as SatisfiedIcon,
  SentimentVeryDissatisfied as DissatisfiedIcon,
  Close,
} from "@mui/icons-material";
import axios from "axios";
import { clearToken, setAuthHeader } from "../../helpers/authHelper";
import { useNavigate } from "react-router-dom";

const PASSWORD_VALIDATION_RULES = [
  { key: "hasDigit", regex: /\d/, message: "a digit (0-9)" },
  { key: "hasLower", regex: /[a-z]/, message: "a lowercase letter (a-z)" },
  { key: "hasUpper", regex: /[A-Z]/, message: "an uppercase letter (A-Z)" },
  { key: "hasSpecialChar", regex: /[!@#$%^&*(),.?":{}|<>]/, message: "a special character (!@#$%^&*)" },
  { key: "hasMinLength", test: (password) => password.length >= 8, message: "at least 8 characters" },
];

const UpdatePasswordDialog = ({ open, onClose }) => {
  const [formData, setFormData] = useState({
    initialPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [validations, setValidations] = useState(
    PASSWORD_VALIDATION_RULES.reduce((acc, rule) => ({ ...acc, [rule.key]: false }), {})
  );
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (field === "newPassword") validatePassword(e.target.value);
  };

  const validatePassword = (password) => {
    const updatedValidations = PASSWORD_VALIDATION_RULES.reduce((acc, rule) => {
      const isValid = rule.test ? rule.test(password) : rule.regex.test(password);
      return { ...acc, [rule.key]: isValid };
    }, {});
    setValidations(updatedValidations);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.initialPassword) newErrors.initialPassword = "Current Password is required!";
    if (!formData.newPassword) newErrors.newPassword = "New Password is required!";
    if (Object.values(validations).includes(false))
      newErrors.newPassword = `Password must contain: ${PASSWORD_VALIDATION_RULES.filter(
        (rule) => !validations[rule.key]
      )
        .map((rule) => rule.message)
        .join(", ")}`;
    if (!formData.confirmPassword) newErrors.confirmPassword = "Confirm Password is required!";
    if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdatePassword = async () => {
    if (!validateForm()) return;
    try {
      const response = await axios.patch("http://localhost:5000/api/v1/auth/updatePassword", formData);
      if (response.status === 200) {
        setMessage(response.data.message);
        setTimeout(() => {
          clearToken();
          setAuthHeader();
          navigate("/login");
        }, 1000);
      } else {
        setErrors({ apiError: response.data.message || "Failed to update password." });
      }
    } catch (error) {
      setErrors({ apiError: error.response?.data?.message || "An error occurred." });
    }
  };

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const renderValidationList = () => (
    <Box mt={2}>
      <Typography variant="body2" color="textSecondary">
        Password must contain:
      </Typography>
      <List>
        {PASSWORD_VALIDATION_RULES.map((rule) => (
          <ListItem key={rule.key}>
            <ListItemIcon>
              {validations[rule.key] ? (
                <SatisfiedIcon sx={{ color: "green" }} />
              ) : (
                <DissatisfiedIcon sx={{ color: "red" }} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={rule.message}
              primaryTypographyProps={{
                style: { color: validations[rule.key] ? "green" : "red" },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Update Password</DialogTitle>
      <DialogContent>
        {errors.apiError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errors.apiError} <Close onClick={() => setErrors({ ...errors, apiError: null })} />
          </Typography>
        )}
        <TextField
          label="Current Password"
          type={visibility.currentPassword ? "text" : "password"}
          value={formData.initialPassword}
          onChange={handleInputChange("initialPassword")}
          error={!!errors.initialPassword}
          helperText={errors.initialPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleVisibility("currentPassword")}>
                  {visibility.currentPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="New Password"
          type={visibility.newPassword ? "text" : "password"}
          value={formData.newPassword}
          onChange={handleInputChange("newPassword")}
          error={!!errors.newPassword}
          helperText={errors.newPassword}
          onFocus={() => setValidations((prev) => ({ ...prev, show: true }))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleVisibility("newPassword")}>
                  {visibility.newPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
        {renderValidationList()}
        <TextField
          label="Confirm Password"
          type={visibility.confirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleVisibility("confirmPassword")}>
                  {visibility.confirmPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          fullWidth
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdatePassword} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePasswordDialog;