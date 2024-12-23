import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Box, IconButton, Badge, Menu, MenuItem, Typography, createTheme, styled, Switch,  CssBaseline } from "@mui/material";
import { Notifications, AccountCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/system";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { clearToken, setAuthHeader } from "../../helpers/authHelper";
import axios from "axios";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 62,
    height: 34,
    padding: 7,
    "& .MuiSwitch-switchBase": {
      margin: 1,
      padding: 0,
      transform: "translateX(6px)",
      "&.Mui-checked": {
        color: "#fff",
        transform: "translateX(22px)",
        "& .MuiSwitch-thumb:before": {
          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
            "#fff"
          )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
        },
        "& + .MuiSwitch-track": {
          opacity: 1,
          backgroundColor: "#aab4be",
          ...theme.applyStyles("dark", {
            backgroundColor: "#8796A5",
          }),
        },
      },
    },
    "& .MuiSwitch-thumb": {
      backgroundColor: "#00008b",
      width: 32,
      height: 32,
      "&::before": {
        content: "''",
        position: "absolute",
        width: "100%",
        height: "100%",
        left: 0,
        top: 0,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          "#fff"
        )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
      },
      ...theme.applyStyles("dark", {
        backgroundColor: "#003892",
      }),
    },
    "& .MuiSwitch-track": {
      opacity: 1,
      backgroundColor: "#aab4be",
      borderRadius: 20 / 2,
      ...theme.applyStyles("dark", {
        backgroundColor: "#8796A5",
      }),
    },
  }));

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState(0); // Example notifications count
  const navigate = useNavigate();
  
  const { mode, toggleTheme } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    clearToken();
    setAuthHeader();
    window.location.reload();
    handleUserMenuClose();
  };

  const fetchNotificationsTotal = useCallback(async() => {
    try{
      const response = await axios.get(`http://localhost:4000/api/v1/messages/getTotalMessages`);
      setNotifications(response.data.total);
      if(response.data.total === 0){
        setNotifications(0);
      }
    }catch(error){
      console.error(error);
    }
  },[]);

  useEffect(() => {
    fetchNotificationsTotal();
  },[fetchNotificationsTotal]);

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#1a1a2e",
        color: "white",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Search Bar */}
      <Box
        sx={{
          padding: "5px 15px",
        }}
      >
       <Typography color="white" variant="h5">
        Dashboard
       </Typography>
      </Box>

      {/* Right side with Notifications and User menu */}
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {/* Notifications */}
                <MaterialUISwitch
                  checked={mode === "dark"}
                  onChange={toggleTheme}
                  aria-label="Toggle dark mode"
                />

        <IconButton sx={{ color: "white", marginRight: "20px" }} onClick={() => navigate('/notifications')}>
          <Badge badgeContent={notifications} color="error">
            <Notifications />
          </Badge>
        </IconButton>

        {/* User Menu */}
        <IconButton
          onClick={handleUserMenuOpen}
          sx={{ color: "white", borderRadius: "50%", padding: "5px" }}
        >
          <AccountCircle />
        </IconButton>

        {/* User Menu Dropdown */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
          sx={{ mt: "45px" }}
        >
          <MenuItem onClick={handleLogout}>
            <Typography sx={{ width: "100%" }}>Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
    </ThemeProvider>
  );
}

export default Header;