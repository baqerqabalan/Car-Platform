import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Link,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import {  ViewList } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const MechanicProposalsHeader = ({ onTabChange, tabValue }) => {
  const [countRequestedProposals, setCountRequestedProposals] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg")); // Checks if screen is small

  const navigate = useNavigate('');

  const fetchTotalProposals = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:4000/api/v1/proposals/getRequestTotal`
      );

      if (response.status === 200) {
        setCountRequestedProposals(response.data.total);
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError("Failed to get the total of requested proposals");
    }
  };

  useEffect(() => {
    fetchTotalProposals();
  }, []);

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
        Mechanic Proposals
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error && !loading ? (
        <Typography color="error">
          {error}{" "}
          <Link
            sx={{ cursor: "pointer" }}
            onClick={() => fetchTotalProposals()}
          >
            please try again
          </Link>
        </Typography>
      ) : (
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
                <MenuItem value={0}>Approved</MenuItem>
                <MenuItem value={1}>Disapproved</MenuItem>
                <MenuItem value={2}>
                  Requested{" "}
                  <Box
                    sx={{
                      ml: 1,
                      backgroundColor: "#009688",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {countRequestedProposals}
                  </Box>
                </MenuItem>
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
                label="Approved"
                sx={{ fontWeight: "bold", color: "white" }}
              />
              <Tab
                label="Disapproved"
                sx={{ fontWeight: "bold", color: "white" }}
              />
              <Tab
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    <Typography>Requested</Typography>
                    <Box
                      sx={{
                        ml: 1,
                        backgroundColor: "#009688",
                        color: "#fff",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      {countRequestedProposals}
                    </Box>
                  </Box>
                }
                sx={{ fontWeight: "bold", color: "white" }}
              />
            </Tabs>
          )}

          {/* Buttons for subscription package actions */}
          <Box>
            <Button
              variant="outlined"
              startIcon={<ViewList />}
              sx={{
                borderColor: "#009688", // Set border color to match the indicator
                color: "#009688",
                fontWeight: "bold",
                "&:hover": { borderColor: "#007b6b", color: "#007b6b" },
                fontSize: isSmallScreen && "11px",
                ml: 5,
                mb: 1,
              }}
              onClick={() => navigate('/view-packages')}
            >
              View Available Packages
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MechanicProposalsHeader;
