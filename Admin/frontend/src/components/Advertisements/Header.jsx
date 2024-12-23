import React, { useContext,  useMemo, useState} from "react";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  createTheme,
} from "@mui/material";
import {  Add, AdsClick } from "@mui/icons-material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import AddAdDialog from "./Dialogs/AddAdDialog";

const Header = ({ onTabChange, tabValue }) => {
  const {mode }= useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Checks if screen is small

  const [openDialog, setOpenDialog] = useState(false);

  return (
    <Box
      sx={{
        bgcolor: "#1a1a2e",
        p: 3,
        color: "#fff",
        borderBottom: "2px solid #ddd",
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", color: "#e0e0e0" }}
      >
        <AdsClick /> Advertisements
      </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Show tabs or dropdown based on screen size */}
          {isSmallScreen ? (
            <FormControl variant="outlined" sx={{ width: 500, mr: 1 }}>
              <InputLabel>Tab</InputLabel>
              <Select
                value={tabValue || 0}
                onChange={(e) => onTabChange(null, parseInt(e.target.value))}
                sx={{ color: "white" }}
              >
                <MenuItem value={0}>Current Ad</MenuItem>
                <MenuItem value={1}>Next Ads</MenuItem>
                <MenuItem value={2}>Previous Ads</MenuItem>
            </Select>
            </FormControl>
          ) : (
            <Tabs
              value={tabValue}
              onChange={(event, newValue) => onTabChange(event, newValue)}
              aria-label="proposals tabs"
              textColor="inherit"
              sx={{
                bgcolor: "#1a1a2e",
                borderRadius: 1,
                "& .MuiTabs-indicator": {
                  backgroundColor: "#009688", // Set the indicator color here
                },
              }}
            >
              <Tab
                label="Current Ad"
                sx={{ fontWeight: "bold", color: "white" }}
              />
                            <Tab
                label="Next Ads"
                sx={{ fontWeight: "bold", color: "white" }}
              />
              <Tab
                label="Previous Ads"
                sx={{ fontWeight: "bold", color: "white" }}
              />
            </Tabs>
          )}

          {/* Buttons for subscription package actions */}
          <Box>
            <Button
              variant="outlined"
              startIcon={<Add />}
              sx={{
                borderColor: "#009688", // Set border color to match the indicator
                color: "#009688",
                fontWeight: "bold",
                "&:hover": { borderColor: "#007b6b", color: "#007b6b" },
                fontSize: isSmallScreen && "11px",
                ml: 5,
                mb: 1,
              }}
              onClick={() => setOpenDialog(true)}
            >
              Add Advertisement
            </Button>
            {openDialog && <AddAdDialog open={openDialog} onClose={() => setOpenDialog(false)} />}
          </Box>
        </Box>
    </Box>
  );
};

export default Header;