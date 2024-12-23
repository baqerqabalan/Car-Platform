import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  createTheme,
  CssBaseline,
  FormControl,
  Grid,
  Link,
  MenuItem,
  Paper,
  Select,
  styled,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { BarChart } from "@mui/x-charts"; // Ensure this is correctly imported
import { ThemeContext } from "../../../context/ThemeProviderComponent";
import axios from "axios";
import { setAuthHeader } from "../../../helpers/authHelper";

const Widget = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const UserActivityChart = () => {
  const [timePeriod, setTimePeriod] = useState("daily");
  const [data, setData] = useState([]); // Store the activity data as an array
  const { mode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:4000/api/v1/user-activity/activityData?timePeriod=${timePeriod}`,
        setAuthHeader()
      );
      setData(response.data); // Directly set the activity data array
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log("Failed to load the bar chart", error);
      setError("Failed to load the analytics chart");
      setLoading(false);
    }
  }, [timePeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    setTimePeriod(event.target.value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid item xs={12} md={12}>
        <Widget>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight="bold">
              Analytics - Users Activity
            </Typography>
            <FormControl>
              <Select value={timePeriod} onChange={handleChange}>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">
              {error} Please{" "}
              <Link sx={{ cursor: "pointer" }} onClick={() => fetchData()}>
                try again
              </Link>
              .
            </Typography>
          ) : (
            <Box
              sx={{
                backgroundColor: theme.palette.background.paper,
                borderRadius: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 2,
              }}
            >
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#009680", stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: "#1e2a3d", stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
              </svg>

              <Box
                sx={{
                  overflowX: "auto", // Enables horizontal scrolling
                  width: "100%", // Ensures full width for the scroll container
                  "&::-webkit-scrollbar": {
                    height: "8px", // Scrollbar height
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888", // Scrollbar color
                    borderRadius: "4px", // Rounded corners
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555", // Hover state color
                  },
                }}
              >
                <BarChart
                  xAxis={[
                    {
                      scaleType: "band",
                      data: data.map((d) => d.label),
                    },
                  ]}
                  series={[
                    {
                      data: data.map((d) => d.value),
                      color: "url(#gradient)",
                    },
                  ]}
                  width={1000}
                  height={400}
                />
              </Box>
            </Box>
          )}
        </Widget>
      </Grid>
    </ThemeProvider>
  );
};

export default UserActivityChart;