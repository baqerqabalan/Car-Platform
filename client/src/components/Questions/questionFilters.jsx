import React, { useContext, useMemo, useState } from "react";
import {
  Collapse,
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  TextField,
  Button,
} from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { ThemeContext } from "../../context/ThemeProviderComponent";

function FilterSection({ showFilters, onFilterChange }) {
  const { mode } = useContext(ThemeContext);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const [sortBy, setSortBy] = useState("");
  const [unansweredOnly, setUnansweredOnly] = useState(false);
  const [unvotedOnly, setUnvotedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Handlers for filter changes
  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
    notifyParent(newSortBy, unansweredOnly, unvotedOnly, searchQuery);
  };

  const handleUnansweredChange = (event) => {
    const newValue = event.target.checked;
    setUnansweredOnly(newValue);
    notifyParent(sortBy, newValue, unvotedOnly, searchQuery);
  };

  const handleUnvotedChange = (event) => {
    const newValue = event.target.checked;
    setUnvotedOnly(newValue);
    notifyParent(sortBy, unansweredOnly, newValue, searchQuery);
  };

  const handleSearchChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchQuery(newSearchTerm); // Update the local state
  };

  // Trigger search when the button is clicked, and notify the parent
  const handleSearchClick = () => {
    notifyParent(sortBy, unansweredOnly, unvotedOnly, searchQuery);
  };

  // Notify parent about filter changes
  const notifyParent = (sortBy, unansweredOnly, unvotedOnly, searchQuery) => {
    onFilterChange({ sortBy, unansweredOnly, unvotedOnly, searchQuery });
  };

  return (
    <Collapse in={showFilters} timeout={400}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          mt: 2,
          backgroundColor: theme.palette.mode === "dark" ? "#444" : "#e6e9ef",
          padding: "10px",
          borderRadius: "10px",
        }}
      >
        {/* Sort By (Radio Buttons) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            mb: { xs: 2, md: 0 },
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Sort By
          </Typography>
          <RadioGroup
            aria-label="sortBy"
            name="sortBy"
            value={sortBy}
            onChange={handleSortChange}
          >
            <FormControlLabel
              value="mostToLowestVoted"
              control={
                <Radio
                  sx={{
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                    "&.Mui-checked": {
                      color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                    },
                  }}
                />
              }
              label="Most to Lowest Voted"
            />
            <FormControlLabel
              value="lowestToMostVoted"
              control={
                <Radio
                  sx={{
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                    "&.Mui-checked": {
                      color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                    },
                  }}
                />
              }
              label="Lowest to Most Voted"
            />
            <FormControlLabel
              value="newestToOldest"
              control={
                <Radio
                  sx={{
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                    "&.Mui-checked": {
                      color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                    },
                  }}
                />
              }
              label="Newest to Oldest"
            />
            <FormControlLabel
              value="oldestToNewest"
              control={
                <Radio
                  sx={{
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                    "&.Mui-checked": {
                      color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                    },
                  }}
                />
              }
              label="Oldest to Newest"
            />
          </RadioGroup>
        </Box>

        {/* Filters (Checkboxes) */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Filters
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={unansweredOnly}
                onChange={handleUnansweredChange}
                sx={{
                  color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                  "&.Mui-checked": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                  },
                }}
              />
            }
            label="Unanswered Only"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={unvotedOnly}
                onChange={handleUnvotedChange}
                sx={{
                  color: theme.palette.mode === "dark" ? "#fff" : "#000", // Unchecked color
                  "&.Mui-checked": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000", // Checked color
                  },
                }}
              />
            }
            label="Unvoted Only"
          />
        </Box>

        {/* Search By (Text Input) */}
        <Box sx={{ flex: 1, mb: 1 }}>
          <Typography variant="h6">Search By:</Typography>
          <TextField
            fullWidth
            label="Search"
            id="fullWidth"
            value={searchQuery}
            onChange={handleSearchChange} // Just update search query state
            sx={{
              "& .MuiInputLabel-root": {
                color: theme.palette.mode === "dark" ? "#fff" : "#000", // Label color
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.mode === "dark" ? "#fff" : "#000", // Border color
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.mode === "dark" ? "#fff" : "#000", // Border color on hover
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.mode === "dark" ? "#fff" : "#000", // Border color when focused
                },
              },
              "& .MuiInputBase-input": {
                color: theme.palette.mode === "dark" ? "#fff" : "#000", // Input text color
              },
            }}
          />
          <Button
            onClick={handleSearchClick} // Notify parent about the search when clicked
            sx={{
              mt: 2, // Add some margin at the top
              backgroundColor: theme.palette.mode === "dark" ? "#fff" : "#000",
              color: theme.palette.mode === "dark" ? "#000" : "#fff",
              "&:hover": {
                backgroundColor: theme.palette.mode === "dark" ? "#ddd" : "#333",
              },
            }}
          >
            Search
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
}

export default FilterSection;