import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";

const Features = ({ open, onClose, features }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#009680",
          color: "#fff",
          fontSize: "1.5rem",
          fontWeight: 600,
          padding: "16px 24px",
          position: "relative",
        }}
      >
        Features
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#fff",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          padding: "16px 24px",
          backgroundColor: "#f4f6f8",
          borderTop: "1px solid #ddd",
          overflowY: "auto",
          
        }}
      >
        {features && Object.keys(features).length > 0 ? (
          <List
            sx={{
              padding: 0,
              mt:1,
              display: "flex",
              flexDirection: "column",
              gap:2
            }}
          >
            {Object.entries(features).map(([key, value]) => (
              <ListItem
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  padding: "12px 16px",
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: "#009680",
                        textTransform: "capitalize",
                      }}
                    >
                      {key}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#333",
                        lineHeight: 1.5,
                      }}
                    >
                      {value}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "#777",
              fontStyle: "italic",
              padding: "20px",
            }}
          >
            No features available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Features;