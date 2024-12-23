import { Close } from "@mui/icons-material";
import {
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

const Image = ({ open, onClose, image, port }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!image) {
      setError("Error fetching the image");
    }
  }, [image]);

  if (error) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography variant="h6" color="error" align="center" p={2}>
            {error}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6">Image</Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, display: "flex", justifyContent: "center" }}>
        <CardMedia
          component="img"
          src={`http://localhost:${port}/${image}`}
          alt="Item image"
          sx={{
            maxHeight: "500px",
            width: "100%",
            objectFit: "contain",
            borderRadius: 1,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Image;