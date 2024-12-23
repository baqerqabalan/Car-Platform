import {
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  styled,
  Typography,
  Button,
  Avatar,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useMemo, useState } from "react";
import moment from "moment";
import SellerInfo from "../../../Sales/Dialogs/SellerInfo";
import { ThemeContext } from "../../../../context/ThemeProviderComponent";
import { useNavigate } from "react-router-dom";

// Styled Paper component for widgets
const Widget = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(2),
  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
  height: "100%",
}));

const UserBadgeWidget = () => {
  const [users, setUsers] = useState([]);
  const [openUserDialogId, setOpenUserDialogId] = useState("");
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/badges/getEarnedBadges"
      );
      setUsers(response.data.users || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const navigate = useNavigate();
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid item xs={12} md={6}>
        <Widget>
          <Grid container justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              Latest Users Who Earned Badges
            </Typography>
            <Button variant="outlined" color="primary" size="small" onClick={() => navigate('/badges')}>
              Manage Badges
            </Button>
          </Grid>

          {users.length === 0 ? (
            <Typography color="text.secondary">No users found</Typography>
          ) : (
            <List>
              {users.map((user, index) => (
                <ListItem key={index}>
                  <Avatar
                    src={`http://localhost:5000/${user.userId?.profileImg}`}
                    alt={user.userId?.firstName?.[0] || "?"}
                    sx={{
                      width: 40,
                      height: 40,
                      marginRight: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => setOpenUserDialogId(user.userId._id)}
                  />
                  {openUserDialogId === user.userId._id && (
                    <SellerInfo
                      open={user.userId._id}
                      onClose={() => setOpenUserDialogId(null)}
                      sellerId={user.userId._id}
                    />
                  )}
                  <ListItemText
                    primary={
                      <Typography>
                        {user.userId?.firstName || "Unknown"}{" "}
                        {user.userId?.lastName || ""} earned the{" "}
                        <strong>{user.badgeId?.name || "Unknown"}</strong> badge
                        on{" "}
                        {moment(user.badgeId?.createdAt).format("DD-MM-YYYY")}.
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Widget>
      </Grid>
    </ThemeProvider>
  );
};

export default UserBadgeWidget;
