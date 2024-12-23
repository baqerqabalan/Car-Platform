import React, { useContext, useMemo, useState } from "react";
import { Button, Container, createTheme, Typography } from "@mui/material";
import { Box } from "@mui/material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../helpers/authHelper";

const Header = () => {
  const [message, setMessage] = useState(null);
  const { mode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const headerStyles = {
    container: { mb: 4 },
    headerBox: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      mb: 3,
      backgroundColor: theme.palette.mode === "dark" ? "#333" : "#f7f9fc",
      padding: "16px 24px",
      borderRadius: "12px",
      boxShadow:
        theme.palette.mode === "dark"
          ? "0 4px 10px rgba(255, 255, 255, 0.1)"
          : "0 4px 12px rgba(0, 0, 0, 0.05)",
      transition: "background-color 0.3s ease",
    },
    titleButtonContainer: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
    },
    title: {
      color: theme.palette.mode === "dark" ? "#EAEAEA" : "#333333",
      fontWeight: "600",
      fontSize: "1.5rem",
    },
    messageBox: {
      backgroundColor: theme.palette.success.main,
      color: "#FFFFFF",
      display: "flex",
      alignItems: "center",
      padding: "8px 16px",
      borderRadius: "8px",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
      opacity: message ? 1 : 0,
      transition: "opacity 0.3s ease",
    },
    closeIcon: {
      cursor: "pointer",
      marginLeft: "8px",
      "&:hover": {
        color: theme.palette.error.light,
      },
    },
    addButton: {
      color: theme.palette.mode === "dark" ? "#0D47A1" : "#FFFFFF",
      backgroundColor: theme.palette.mode === "dark" ? "#E0E0E0" : "#1976D2",
      padding: "8px 20px",
      borderRadius: "8px",
      fontWeight: "500",
      textTransform: "capitalize",
      boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
      "&:hover": {
        backgroundColor: theme.palette.mode === "dark" ? "#FFFFFF" : "#1565C0",
        transform: "scale(1.05)",
      },
    },
  };

  return (
    <Container maxWidth="lg" sx={headerStyles.container}>
      <Box sx={headerStyles.headerBox}>
        <Box sx={headerStyles.titleButtonContainer}>
          <Typography variant="h5" sx={headerStyles.title}>
            All Proposals
          </Typography>
        </Box>
        <Box sx={{ float: "right" }}>
          <Button
            sx={headerStyles.addButton}
            onClick={() => {
              if (isAuthenticated()) {
                navigate("/Mechanic Proposals/Request");
              } else {
                navigate("/login?redirect=/Mechanic Proposals/Request");
              }
            }}
          >
            Add a Proposal
          </Button>
        </Box>

        {message && (
          <Box sx={headerStyles.messageBox}>
            <Typography sx={{ flexGrow: 1 }}>{message}</Typography>
            <Close
              sx={headerStyles.closeIcon}
              onClick={() => setMessage(null)}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Header;
