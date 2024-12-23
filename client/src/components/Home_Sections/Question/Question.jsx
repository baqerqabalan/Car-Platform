import React, { useState, useContext, useMemo} from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Avatar,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Divider,
  CircularProgress,
} from "@mui/material";
import QuoteIcon from "@mui/icons-material/FormatQuote";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeContext } from "../../../context/ThemeProviderComponent";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../helpers/authHelper";
import axios from "axios";

const Question = () => {
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [errorAlert, setErrorAlert] = useState("");
  const [successAlert, setSuccessAlert] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorAlert(null);
    setLoading(true);

    if (!isAuthenticated()) {
      setErrorAlert("Please login to ask a question");
      navigate("/login");
      return;
    }

    if (!question.trim()) {
      setErrorAlert("Please enter a question");
      return;
    }

    if (typeof question !== 'string' || question.length < 8 || question.length > 255) {
      setErrorAlert("Please enter a question between 8 and 255 characters");
      return;
    }    

    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/questions/createQuestion",
        { content: question, category:"General" }
      );
      if (response.status === 201) {
        setSuccessAlert("Question created successfully");
        setQuestion("");
        setLoading(false);
        setTimeout(() => setSuccessAlert(""), 2000);
      }
    } catch (error) {
      console.error("Error adding a question: ", error);
      setLoading(false);
      setErrorAlert(
        "There was an error submitting your question. Please try again."
      );
    }
  };

  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleCloseButton = () => {
    setErrorAlert("");
    setSuccessAlert("");
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {(errorAlert || successAlert) && (
        <Box
          sx={{ display: "flex", justifyContent: "center", marginBottom: 2, margin:1 }}
        >
          {errorAlert && (
            <Typography
              variant="body1"
              sx={{
                backgroundColor: "#D32F2F",
                color: "white",
                padding: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {errorAlert}
              <CloseIcon
                onClick={handleCloseButton}
                sx={{ marginLeft: "auto", cursor: "pointer" }}
              />
            </Typography>
          )}
          {successAlert && (
            <Typography
              variant="body1"
              sx={{
                backgroundColor: "#388E3C",
                color: "white",
                padding: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {successAlert}
              <CloseIcon
                onClick={handleCloseButton}
                sx={{ marginLeft: "auto", cursor: "pointer" }}
              />
            </Typography>
          )}
        </Box>
      )}
      <Paper
        elevation={3}
        sx={{
          padding: 3,
          borderRadius: 2,
          display: "flex",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              marginBottom: 1,
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#00008b",
            }}
            variant="rounded"
            alt="Quote Icon"
          >
            <QuoteIcon />
          </Avatar>
          <Typography variant="h5" component="h2" gutterBottom>
            Don't hesitate to ask a question!
          </Typography>
          <Divider sx={{ width: "75%" }} />
          <Typography variant="body2" color="textSecondary">
            Your question could help others find answers!
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Your Question"
                  variant="outlined"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question here..."
                  InputProps={{
                    sx: {
                      "&.MuiOutlinedInput-root": {
                        "&.Mui-focused fieldset": {
                          borderColor:
                            theme.palette.mode === "dark" ? "#fff" : "#00008b",
                        },
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      "&.Mui-focused": {
                        color: "#00008b",
                        fontWeight: "bold",
                      },
                      "&.MuiFormLabel-root": {
                        color:
                          theme.palette.mode === "dark" ? "#fff" : "#00008b",
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#fff" : "#00008b",
                    color: theme.palette.mode === "dark" ? "#00008b" : "#fff",
                  }}
                  fullWidth
                >
                  {loading ? <CircularProgress color="white"/> : 'Ask Question'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </ThemeProvider>
  );
};

export default Question;
