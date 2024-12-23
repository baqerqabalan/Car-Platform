import { Close } from '@mui/icons-material';
import { Box, Button, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import React, { useState } from 'react';

const ApprovedStatusDialog = ({ open, onClose, onUpload, onSubmit }) => {
  const [image, setImage] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      onUpload(file);
    }
  };

  const handleCloseAndSubmit = () => {
    if (image) {
      onSubmit();
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Upload the Subscription Receipt Image</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {image ? (
          <CardMedia component="img" image={image} sx={{ maxHeight: 200, margin: 'auto', borderRadius: 1 }} />
        ) : (
          <Typography align="center" color="textSecondary" sx={{ my: 2 }}>
            Please select an image to upload
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions sx={{ justifyContent: 'space-between', padding: 2 }}>
        <Button
          variant="contained"
          color="primary"
          component="label"
          sx={{ textTransform: 'none' }}
        >
          Select Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        <Button
          color="primary"
          variant="contained"
          onClick={handleCloseAndSubmit}
          disabled={!image}
          sx={{ textTransform: 'none' }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApprovedStatusDialog;