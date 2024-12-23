import React, { useContext, useMemo, useState } from "react";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";

const Header = ({ tabValue, onTabChange, onSearch, onFilterChange }) => {
  const { mode } = useContext(ThemeContext);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  // State management for filter and search term
  const [filter, setFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Define filters for each sale type
  const getFilterOptions = () => {
    switch (tabValue) {
      case 1: // Normal Sales filters
        return [
          { value: "recent", label: "Added Recently" },
          { value: "sold", label: "Sold Products" },
          { value: "onSale", label: "Products on Sale" },
        ];
      default:
        return [
          { value: "goingAuctions", label: "Going on Auctions" },
          { value: "auctionEnded", label: "Auction Ended" },
          { value: "endingSoon", label: "Ending Soon" },
        ];
    }
  };

  // Handle search term change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value); // Pass search term to parent
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch(searchTerm); // Pass search term to parent on Enter key press
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    onFilterChange(e.target.value); // Pass filter option to parent
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        p={3}
        bgcolor="#1a1a2e"
        boxShadow={3}
      >
        {/* Tabs Section */}
        <Tabs
          value={tabValue}
          onChange={onTabChange}
          aria-label="sales tabs"
          textColor="inherit"
          sx={{
            bgcolor: "#1a1a2e",
            borderRadius: 1,
            "& .MuiTabs-indicator": {
              backgroundColor: "#009688",
            },
          }}
        >
          <Tab
            label="Auction Sales"
            sx={{ fontWeight: "bold", color: "white" }}
          />
          <Tab
            label="Normal Sales"
            sx={{ fontWeight: "bold", color: "white" }}
          />
        </Tabs>

        {/* Search and Filter Section */}
        <Box display="flex" gap={3} mt={2} justifyContent="space-between">
          {/* Search Bar */}
          <TextField
            variant="outlined"
            fullWidth
            placeholder="Search sales..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleSearchKeyPress}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                bgcolor: "#ffffff",
              },
              "& .MuiInputBase-input": {
                fontSize: "1rem",
                paddingLeft: "2rem",
                color: "#333",
              },
            }}
          />

          {/* Filter Options */}
          <TextField
            select
            label="Filter"
            value={filter}
            onChange={handleFilterChange}
            variant="outlined"
            sx={{
              minWidth: 150,
              borderRadius: "8px",
              bgcolor: "#ffffff",
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem value="">Clear Filter</MenuItem>

            {getFilterOptions().map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Header;
