import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import logo from "../../../assets/images/blue logo.png";
import grayLogo from "../../../assets/images/gray logo.png";
import "./nav.css";
import { useEffect } from "react";
import axios from "axios";
import {
  clearToken,
  getUserIdFromToken,
  isAuthenticated,
  setAuthHeader,
} from "../../../helpers/authHelper";
import {
  ButtonGroup,
  createTheme,
  CssBaseline,
  FormControlLabel,
  Link,
  styled,
  Switch,
  ThemeProvider,
} from "@mui/material";
import { ThemeContext } from "../../../context/ThemeProviderComponent";
import { useNavigate } from "react-router-dom";

const pages = [
  "Home",
  "Market Place",
  "Questions",
  "Mechanic Proposals",
  "Contact Us",
];
const settings = ["Account", "Logout"];

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

function Navbar() {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const { mode, toggleTheme } = React.useContext(ThemeContext); // Use context
  const navigate = useNavigate();
  let userId = null;

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogoutAction = () => {
    clearToken();
    setAuthHeader();
    navigate("/");
  };

  const handleAccountAction = () => {
    userId = getUserIdFromToken();
    navigate(`/Profile/${userId}`);
  };

  // Map settings to their corresponding functions
  const actionMap = {
    Account: handleAccountAction,
    Logout: handleLogoutAction,
  };

  const fetchProfileImg = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/auth/getProfileImg`,
        setAuthHeader()
      );

      setUser(response.data);
    } catch (error) {
      console.error("Error fetching the profile image:", error);
    }
  };
  useEffect(() => {
    if (isAuthenticated()) {
      fetchProfileImg();
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" className="nav">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Typography
                    key={page}
                    component={"a"}
                    onClick={handleCloseNavMenu}
                    href={page === "Home" ? "/" : `/${page}`}
                    sx={{
                      color: theme.palette.mode === "dark" ? "#fff" : "#00008b",
                      textDecoration: "none",
                    }}
                  >
                    {page}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box className="logo-container">
            <Link href="/">
              {theme.palette.mode === "dark" ? (
                <img src={grayLogo} alt="logo" className="logo" />
              ) : (
                <img src={logo} alt="logo" className="logo" />
              )}
            </Link>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
            }}
          >
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                href={page === "Home" ? "/" : `/${page}`}
                sx={{
                  my: 2,
                  color: theme.palette.mode === "dark" ? "#fff" : "#00008b",
                  display: "block",
                  fontSize: "14px",
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
          <FormControlLabel
            control={
              <MaterialUISwitch
                checked={mode === "dark"}
                onChange={toggleTheme}
              />
            }
          />
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated() ? (
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    src={
                      user?.profileImg
                        ? `http://localhost:5000/${user.profileImg}`
                        : undefined
                    }
                    alt={user?.firstName ? user.firstName[0] : ""}
                    sx={{
                      bgcolor: !user?.profileImg ? "red" : "transparent",
                      cursor: "pointer",
                    }}
                  />
                </IconButton>
              </Tooltip>
            ) : (
              <ButtonGroup
                disableElevation
                variant="contained"
                aria-label="Disabled button group"
              >
                <Button
                  sx={{
                    color: `${
                      theme.palette.mode === "dark" ? "#000" : "#fff"
                    } !important`,
                    backgroundColor: `${
                      theme.palette.mode === "dark" ? "#fff" : "#00008b"
                    } !important`,
                    background: `${
                      theme.palette.mode === "dark" ? "#fff" : "#00008b"
                    } !important`,
                  }}
                  className="btn"
                  href="/login"
                >
                  Login
                </Button>
                <Button
                  sx={{
                    color: `${
                      theme.palette.mode === "dark" ? "#000" : "#fff"
                    } !important`,
                    backgroundColor: `${
                      theme.palette.mode === "dark" ? "#fff" : "#00008b"
                    } !important`,
                    background: `${
                      theme.palette.mode === "dark" ? "#fff" : "#00008b"
                    } !important`,
                  }}
                  className="btn"
                  href="/signup"
                >
                  Signup
                </Button>
              </ButtonGroup>
            )}
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    handleCloseUserMenu();
                    actionMap[setting]?.();
                  }}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
export default Navbar;
