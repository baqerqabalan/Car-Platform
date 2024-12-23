import {
  Box,
  Chip,
  CircularProgress,
  createTheme,
  CssBaseline,
  Grid,
  IconButton,
  Link,
  List,
  ListItem,
  Paper,
  styled,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../../context/ThemeProviderComponent";
import { Refresh } from "@mui/icons-material";
import axios from "axios";
import { setAuthHeader } from "../../../helpers/authHelper";

// Styled Paper component for widgets
const Widget = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const TopUsers = () => {
  const { mode } = useContext(ThemeContext);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchActivity = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:4000/api/v1/activities/getActivity`,
        setAuthHeader()
      );
      const data = response.data;
      setActivities([data.lastUser, data.lastQuestion, data.lastSale]);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error("Error fetching activities:", error);
      setLoading(false);
      setError("Failed to find recents");
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid item xs={12} md={6}>
        <Widget>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h6" fontWeight="bold">
              Recent Activities
            </Typography>
            <IconButton
              onClick={() => fetchActivity()}
              sx={{ cursor: "pointer" }}
            >
              <Refresh />
            </IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">
              Failed to find recent activity. Please{" "}
              <Link onClick={() => fetchActivity()} sx={{ cursor: "pointer" }}>
                try again
              </Link>
              .
            </Typography>
          ) : (
            <List>
              {activities.length !== 0 ? (
                activities.map((activity, index) => (
                  <ListItem key={index}>
                    <Chip
                      label={activity.label}
                      color={
                        activity.label.includes("User")
                          ? "primary"
                          : activity.label.includes("Question")
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                    <Typography variant="body2" color="text.secondary" ml={2}>
                      {activity.timeAgo}
                    </Typography>
                  </ListItem>
                ))
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                >
                  No recent activities found.
                </Typography>
              )}
            </List>
          )}
        </Widget>
      </Grid>
    </ThemeProvider>
  );
};

export default TopUsers;
