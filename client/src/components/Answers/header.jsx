import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import CloseIcon from "@mui/icons-material/Close";
import { isAuthenticated } from "../../helpers/authHelper";
import LexicalEditor from "./lexicalEditor";

const Header = () => {
  const { mode } = useContext(ThemeContext);
  const { questionId } = useParams();
  const navigate = useNavigate();

  const [questionData, setQuestionData] = useState(null);
  const [answerCounts, setAnswerCounts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [open, setOpen] = useState(false);
  const [answerContent, setAnswerContent] = useState("");
  const [validateMessage, setValidateMessage] = useState(null);
  const [selectedValue, setSelectedValue] = React.useState("a");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  const theme = useMemo(
    () => ({
      palette: {
        mode,
        primary: {
          main: mode === "dark" ? "#fff" : "#00008b",
        },
      },
    }),
    [mode]
  );

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/v1/answers/getQuestion/${questionId}`
        );
        const { questionData, answerCounts } = response.data.data;

        if (questionData.createdAt) {
          questionData.createdAt = moment(questionData.createdAt).format(
            "DD-MM-YYYY HH:mm"
          );
        }

        setQuestionData(questionData);
        setAnswerCounts(answerCounts);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setError("Error Fetching Question");
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  const handleClickOpen = () => {
    isAuthenticated()
      ? setOpen(true)
      : navigate(`/login?redirect=/Questions/${questionId}`);
  };

  const handleClose = () => setOpen(false);

  const validateAnswer = (content) => {
    // Check if content is empty or null
    if (content.length === 0 || content === null) {
      setValidateMessage("Please fill in the text");
      return false; // Prevent submission
    }

    // Check if content is shorter than 8 characters
    if (content.length < 8) {
      setValidateMessage("Answer should be more than 8 characters");
      return false; // Prevent submission
    }

    // Clear any previous validation messages
    setValidateMessage("");
    return true; // Allow submission
  };

  const handleAddAnswer = async (e) => {
    e.preventDefault(); // Prevent form submission on every call

    // Validate the answer content before submitting
    if (!validateAnswer(answerContent)) {
      return; // Stop execution if validation fails
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/v1/answers/createAnswer/${questionId}`,
        {
          content: answerContent,
          postedAs: selectedValue === "a" ? "name" : "guest"
        }
      );

      if (response.status === 201) {
        setAnswerContent("");
        handleClose();
        setMessage("Answer added successfully");

        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.log(error);
    }
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
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography
        sx={{
          color: "#f44336",
          textAlign: "center",
          p: 2,
          fontWeight: "bold",
        }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f7f9fc",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              color: theme.palette.mode === "dark" ? "#fff" : "#000", // Changed text color to white
              mb: 1,
            }}
          >
            {`${questionData.content.trimEnd()}${
              questionData.content.slice(-1) !== "?" ? "?" : ""
            }`}
          </Typography>

          <Button
            onClick={handleClickOpen}
            sx={{
              color: theme.palette.mode === "dark" ? "#00008b" : "#fff",
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#00008b",
              padding: "8px 16px",
              borderRadius: "25px",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#f0f0f0" : "#000080",
              },
            }}
          >
            Add Answer
          </Button>

          <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleAddAnswer}>
              <DialogTitle>Add an Answer</DialogTitle>
              <DialogContent>
                {validateMessage && (
                  <Box
                    sx={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ flexGrow: 1 }}>
                      {validateMessage}
                    </Typography>
                    <CloseIcon
                      onClick={() => setValidateMessage(null)}
                      sx={{ cursor: "pointer" }}
                    />
                  </Box>
                )}

                {/* Text Editor for the answer */}
                <LexicalEditor setAnswerContent={setAnswerContent} />

                {/* Radio Buttons for choosing between name and guest */}
                <RadioGroup
                  value={selectedValue}
                  onChange={handleChange}
                  required
                  name="post-options"
                >
                  <FormControlLabel
                    value="a"
                    control={<Radio />}
                    label="Post with your name"
                  />
                  <FormControlLabel
                    value="b"
                    control={<Radio />}
                    label="Post as a Guest"
                  />
                </RadioGroup>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Submit</Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="body2">
            Asked on: {questionData.createdAt}
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {answerCounts} answers
          </Typography>
        </Box>

        {message && (
          <Box
            sx={{
              backgroundColor: "green",
              color: "white",
              padding: "5px 10px",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography sx={{ flexGrow: 1 }}>{message}</Typography>
            <CloseIcon
              onClick={() => setMessage(null)}
              sx={{ cursor: "pointer" }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Header;
