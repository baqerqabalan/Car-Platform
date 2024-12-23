import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Icon,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import moment from "moment";
import { EmojiEvents } from "@mui/icons-material";

const ViewEarnedBadgesDialog = ({ open, onClose, user, earnedBadges }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: "center", fontWeight: "bold" }}>
        <Typography variant="h6">
          Earned Badges for {user?.firstName} {user?.lastName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ padding: 3 }}>
        {earnedBadges && earnedBadges.length > 0 ? (
          <List sx={{ width: "100%", padding: 0 }}>
            {earnedBadges.map((badge) => (
              <ListItem
                key={badge._id}
                divider
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 2,
                  padding: 2,
                }}
              >
                <Icon sx={{ color: "gold", fontSize: 30 }}>
                  <EmojiEvents />
                </Icon>
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      fontWeight="bold"
                      sx={{ color: "primary.main" }}
                    >
                      {badge.badgeName}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ marginTop: 0.5 }}
                    >
                      Earned on: {moment(badge.earnedAt).format("DD-MM-YYYY")}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: 100 }}
          >
            <Typography
              variant="body1"
              color="text.secondary"
              textAlign="center"
            >
              No badges earned yet.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "secondary.main",
            color: "#fff",
            "&:hover": { backgroundColor: "secondary.dark" },
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewEarnedBadgesDialog;