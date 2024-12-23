import {
  Box,
  Button,
  Container,
  createTheme,
  Typography,
  Stack,
  ButtonGroup,
  DialogActions,
  TextField,
  DialogContent,
  DialogTitle,
  Dialog,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { isAuthenticated } from "../../helpers/authHelper";
import CloseIcon from "@mui/icons-material/Close";
import QuestionFilter from './questionFilters';

const filters = ["Newest", "Active", "UnAnswered"];

const Header = ({ onFilterChange, setFilterOptions }) => {
  const { mode } = useContext(ThemeContext);
  const [questionCounter, setQuestionCounter] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]); // Track the active filter
  const [formValues, setFormValues] = React.useState({
    content: "", // Can be email or username
    category: "",
  });

  const navigate = useNavigate();

  const handleClickOpen = () => {
    if (isAuthenticated()) {
      setOpen(true);
    } else {
      navigate(`/login?redirect=/Questions`);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterClick = (filter) => {
    onFilterChange(filter);
    setActiveFilter(filter);
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  useEffect(() => {
    const fetchQuestionsCounter = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/questions/getQuestionCounter"
        );
        setQuestionCounter(response.data.count);
      } catch (error) {
        console.log(error);
      }
    };
    fetchQuestionsCounter();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  // Function to handle adding a question
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/v1/questions/createQuestion",
        {
          content: formValues.content,
          category: formValues.category,
        }
      );

      // Reset form values and close the dialog
      setFormValues({ content: "", category: "" });
      handleClose();

      // Optionally show success message
      setMessage("Question Added Successfully");

      window.location.reload();
    
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mb: 2 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f7f9fc",
          padding: "20px",
          borderRadius: "10px",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          }}
        >
          All Questions
        </Typography>
        {message && (
          <Typography
            sx={{
              backgroundColor: "green",
              color: "white",
              textAlign: "center",
              padding: "5px 10px",
              borderRadius: "5px",
            }}
          >
            {message}
            <CloseIcon sx={{ textAlign: "right", cursor: "pointer" }} />
          </Typography>
        )}
        <React.Fragment>
          <Button
            onClick={handleClickOpen}
            sx={{
              mt: { xs: 2, sm: 0 },
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
            Ask Question
          </Button>

          <Dialog open={open} onClose={handleClose}>
            <form onSubmit={handleAddQuestion}>
              <DialogTitle>Add a Question</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  id="content"
                  name="content"
                  value={formValues.content}
                  onChange={handleChange}
                  label="Question Content"
                  type="text"
                  fullWidth
                  variant="standard"
                />

                <TextField
                  id="category"
                  name="category"
                  select
                  required
                  label="Category"
                  fullWidth
                  variant="standard"
                  margin="dense"
                  onChange={handleChange}
                  value={formValues.category}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value=""></option>
                  <option value="General">General</option>
                  <option value="Engine & Transmission">
                    Engine & Transmission
                  </option>
                  <option value="Electrical System">Electrical System</option>
                  <option value="Brakes & Suspension">
                    Brakes & Suspension
                  </option>
                  <option value="Cooling & Heating">Cooling & Heating</option>
                  <option value="Fuel & Exhaust">Fuel & Exhaust</option>
                  <option value="Tires & Wheels">Tires & Wheels</option>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Submit</Button>
              </DialogActions>
            </form>
          </Dialog>
        </React.Fragment>
      </Box>

      {/* Filter Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexDirection: { xs: "column", sm: "row" },
          backgroundColor: theme.palette.mode === "dark" ? "#444" : "#e6e9ef",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        <Typography
          variant="body1"
          sx={{ color: theme.palette.mode === "dark" ? "#fff" : "#00008b" }}
        >
          {questionCounter} questions
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: { xs: 1, sm: 0 },
            border:
              theme.palette.mode === "dark"
                ? "#fff solid 1px"
                : "#00008b solid 1px",
            borderRadius: "10px",
            justifyContent: { xs: "center", sm: "flex-start" },
            backgroundColor: theme.palette.mode === "dark" ? "#555" : "#fff",
          }}
        >
          <ButtonGroup disableElevation variant="contained">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant="text"
                sx={{
                  color: theme.palette.mode === "dark" ? "#fff" : "#00008b",
                  fontWeight: "bold",
                  borderRadius: "10px",
                  backgroundColor:
                    activeFilter === filter
                      ? theme.palette.mode === "dark"
                        ? "#00008b"
                        : "#c0c0c0"
                      : "transparent", // Highlight the active filter
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#000080" : "#c0c0c0",
                  },
                }}
                onClick={() => handleFilterClick(filter)}
              >
                {filter}
              </Button>
            ))}
          </ButtonGroup>
        </Stack>

        <Button
          sx={{
            mt: { xs: 2, sm: 0 },
            display: "flex",
            alignItems: "center",
            border:
              theme.palette.mode === "dark"
                ? "#fff solid 1px"
                : "#00008b solid 1px",
            color: theme.palette.mode === "dark" ? "#fff" : "#00008b",
            padding: "5px 15px",
            borderRadius: "25px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#00008b",
              color: theme.palette.mode === "dark" ? "#00008b" : "#fff",
            },
          }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <FilterAltIcon sx={{ mr: 1 }} />
          Filter
        </Button>
      </Box>
      <QuestionFilter showFilters={showFilters} onFilterChange={setFilterOptions} />
    </Container>
  );
};

export default Header;
