// Sidebar.js
import React, { useEffect, useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  CardMedia,
  useMediaQuery,
} from "@mui/material";
import {
  Home,
  Dashboard,
  Settings,
  Logout,
  HelpOutline,
  AdsClick,
  ArrowLeft,
  Message,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import logo from "../assets/images/gray logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import Dash from "../pages/Home";
import Sales from '../pages/Sales';
import MechanicProposals from "../pages/MechanicProposals";
import Questions from "../pages/Questions";
import Advertisments from "../pages/Advertisments";
import Messages from '../pages/ContactUs';
import { clearToken } from "../helpers/authHelper";

function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const isLargeScreen = useMediaQuery("(min-width:768px)");

  const navigate = useNavigate();

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (isLargeScreen) {
      setIsOpen(isLargeScreen);
    }
  }, [isLargeScreen]);

  const menuItems = [
    { text: "Dashboard", icon: <Home />, route: "" },
    { text: "Sales", icon: <Settings />, route: "sales" },
    {
      text: "Mechanic Proposals",
      icon: <Dashboard />,
      route: "mechanic-proposals",
    },
    { text: "Advertisements", icon: <AdsClick />, route: "advertisements" },
    { text: "Questions", icon: <HelpOutline />, route: "questions" },
    { text: "Messages", icon: <Message />, route: "messages" },
    { text: "Logout", icon: <Logout />, route: "logout" },
  ];

  const handleNavigate = (page) => {
    navigate(`/${page}`);
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
    window.location.reload();
  };

  const location = useLocation();

  return (
    <Box display="flex" sx={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={isOpen}
        sx={{
          width: isOpen ? 240 : 60,
          flexShrink: 0,
          transition: "width 0.3s ease-in-out", // Animation for the sidebar width
          "& .MuiDrawer-paper": {
            width: isOpen ? 240 : 60,
            boxSizing: "border-box",
            backgroundColor: "#1a1a2e",
            color: "#ffffff",
            overflowX: "hidden", // Prevent horizontal scroll within the drawer
          },
        }}
      >
        {/* Toggle Button */}
        <Box
          display="flex"
          justifyContent={isOpen ? "space-between" : "center"}
          p={2}
        >
          {isOpen && (
            <CardMedia
              component="img"
              sx={{ width: 100, height: "auto", objectFit: "contain" }}
              src={logo}
              alt="logo"
            />
          )}
          <IconButton onClick={toggleDrawer} sx={{ color: "#ffffff" }}>
            {isOpen ? <ArrowLeft /> : <MenuIcon />}
          </IconButton>
        </Box>

        {/* Menu Items */}
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => { item.route === 'logout' ? handleLogout() : handleNavigate(item.route)}}
                sx={{
                  minHeight: 48,
                  justifyContent: isOpen ? "initial" : "center",
                  px: 2.5,
                  "&:hover": {
                    backgroundColor: "#0f3460",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: "#ffffff",
                    minWidth: 0,
                    mr: isOpen ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{ opacity: isOpen ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Content Area (optional, for page layout) */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowX: "hidden", // Prevent horizontal scroll in content area
        }}
      >
        {location.pathname === "/" && <Dash />}
        {location.pathname === "/sales" && <Sales />}
        {location.pathname === "/mechanic-proposals" && <MechanicProposals />}
        {location.pathname === "/questions" && <Questions />}
        {location.pathname === "/advertisements" && <Advertisments />}
        {location.pathname === "/messages" && <Messages />}
      </Box>
    </Box>
  );
}

export default Sidebar;
