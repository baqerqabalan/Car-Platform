import {
  Box,
  Button,
  Container,
  createTheme,
  Typography,
  Stack,
  ButtonGroup,
  TextField,
  Autocomplete,
} from "@mui/material";
import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { isAuthenticated } from "../../helpers/authHelper";
import CloseIcon from "@mui/icons-material/Close";
import AddProductDialog from "./addPostDialog";

const filters = ["All", "Normal", "Auction"];
const sortOptions = [
  { label: "High to Low Price", value: "highToLowPrice" },
  { label: "Low to High Price", value: "lowToHighPrice" },
  { label: "Newest to Oldest", value: "newestToOldest" },
  { label: "Oldest to Newest", value: "oldestToNewest" },
];

const Header = ({
  onFilterChange,
  onSearch,
  setSortOption
}) => {
  const { mode } = useContext(ThemeContext);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [activeFilter, setActiveFilter] = useState(filters[0]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const navigate = useNavigate();

  const handleClickOpen = () => {
    if (isAuthenticated()) {
      setOpen(true);
    } else {
      navigate(`/login?redirect=/Market Place`);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFilterClick = (filter) => {
    onFilterChange(filter);
    setActiveFilter(filter);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f7f9fc",
          p: 3,
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{
            color: theme.palette.mode === "dark" ? "#fff" : "#000",
          }}
        >
          All Items
        </Typography>

        {message && (
          <Box
            sx={{
              backgroundColor: "green",
              color: "white",
              textAlign: "center",
              p: "5px 12px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography sx={{ flexGrow: 1 }}>{message}</Typography>
            <CloseIcon
              sx={{
                cursor: "pointer",
                ml: 2,
              }}
              onClick={() => setMessage("")} // Handle message close
            />
          </Box>
        )}

        <Button
          onClick={handleClickOpen}
          sx={{
            color: theme.palette.mode === "dark" ? "#00008b" : "#fff",
            backgroundColor: theme.palette.mode === "dark" ? "#fff" : "#00008b",
            p: "10px 20px",
            borderRadius: "25px",
            fontWeight: "bold",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              backgroundColor:
                theme.palette.mode === "dark" ? "#f0f0f0" : "#000080",
            },
          }}
        >
          Add a Post
        </Button>
        <AddProductDialog open={open} handleClose={handleClose} />
      </Box>

      {/* Filter Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          backgroundColor: theme.palette.mode === "dark" ? "#444" : "#e6e9ef",
          p: 1,
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: { xs: 1, sm: 0 },
            border:
              theme.palette.mode === "dark"
                ? "1px solid #fff"
                : "1px solid #00008b",
            borderRadius: "12px",
            backgroundColor: theme.palette.mode === "dark" ? "#555" : "#fff",
            boxShadow: "0 3px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <ButtonGroup>
            {filters.map((filter) => (
              <Button
                key={filter}
                variant="text"
                sx={{
                  color: theme.palette.mode === "dark" ? "#fff" : "#00008b",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  backgroundColor:
                    activeFilter === filter
                      ? theme.palette.mode === "dark"
                        ? "#00008b"
                        : "#c0c0c0"
                      : "transparent",
                  "&:hover": {
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#000080" : "#c0c0c0",
                  },
                }}
                onClick={() => handleFilterClick(filter)}
              >
                {filter} Sales
              </Button>
            ))}
          </ButtonGroup>
        </Stack>

        <Box
          display="flex"
          justifyContent="center" // Center the search field and button
          alignItems="center"
          sx={{ width: "100%" }}
        >
          <TextField
            type="search"
            label="Search"
            variant="outlined"
            value={searchTerm} // Bind searchTerm state
            onChange={handleSearchChange} // Handle input change
            sx={{
              width: { xs: "100%", sm: "300px" }, // Responsive width
              mr: 2, // Margin between search field and button
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px", // Rounded corners for modern look
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.mode === "dark" ? "#fff" : "#00008b", // Label color
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.mode === "dark" ? "#fff" : "#00008b", // Border color
              },
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch} // Trigger search on button click
            sx={{
              backgroundColor:
                theme.palette.mode === "dark" ? "#fff" : "#00008b",
              padding: "10px 20px",
              borderRadius: "25px",
              fontWeight: "bold",
              textTransform: "none", // Keep button text untransformed
              color: theme.palette.mode === "dark" ? "#00008b" : "#fff",
              "&:hover": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#fff" : "#000080", // Hover color
              },
            }}
          >
            Search
          </Button>
        </Box>
        <Autocomplete
          disablePortal
          options={sortOptions} // Pass the full sortOptions array
          getOptionLabel={(option) => option.label} // Specify which field to display in the dropdown
          onChange={(event, value) => setSortOption(value?.value || "")} // Update selected sort option's value
          sx={{ width: 300, xs: { mt: 1 } }}
          renderInput={(params) => <TextField {...params} label="Sort By" />}
        />
      </Box>
    </Container>
  );
};

export default Header;
