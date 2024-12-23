import React, { useContext, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Avatar,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Image from "../../Sales/Dialogs/Image";
import SliderImage from "../../Sales/Dialogs/SliderImage";
import { ThemeContext } from "../../../context/ThemeProviderComponent";

const Product = ({ open, onClose, product }) => {
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openSliderImageDialog, setOpenSliderImageDialog] = useState(false);
  const { mode } = useContext(ThemeContext || localStorage.getItem('theme'));

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const {
    address,
    auction_end_date,
    auction_start_date,
    category,
    description,
    image,
    images,
    is_auction,
    name,
    price,
  } = product;

  const formatDate = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(date).toLocaleDateString(undefined, options);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#00695c",
          color: "#fff",
          fontSize: "1.6rem",
          fontWeight: 600,
          padding: "20px 24px",
          position: "relative",
        }}
      >
        {name}
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
          padding: "20px",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Grid container spacing={3}>
          {/* Left Section: Images */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt:1,
                alignItems: "center",
              }}
            >
              <Avatar
                alt="Product image"
                src={`http://localhost:5000/${image}`}
                onClick={() => setOpenImageDialog(true)}
                sx={{
                  width: "100%",
                  maxWidth: 400,
                  height: 300,
                  objectFit: "contain",
                  borderRadius: "12px",
                  cursor:"pointer"
                }}
              />
              {openImageDialog && (
                <Image
                  open={openImageDialog}
                  onClose={() => setOpenImageDialog(false)}
                  image={image}
                  port={5000}
                />
              )}
              <Grid container spacing={2}>
                {images &&
                  images.map((img, idx) => (
                    <Grid item key={idx} xs={4}>
                      <Avatar
                        alt={`Product image ${idx + 1}`}
                        src={`http://localhost:5000/${img}`}
                        onClick={() => setOpenSliderImageDialog(true)}
                        sx={{
                          width: "100%",
                          height: 100,
                          objectFit: "contain",
                          borderRadius: "8px",
                          cursor:"pointer"
                        }}
                      />
                    </Grid>
                  ))}
                {openSliderImageDialog && (
                  <SliderImage
                    open={openSliderImageDialog}
                    onClose={() => setOpenSliderImageDialog(false)}
                    images={images}
                  />
                )}
              </Grid>
            </Box>
          </Grid>

          {/* Right Section: Details */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                mt:1
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: theme.palette.mode === "dark" ? "#00cfb7" : "#00695c" }}
              >
                Category: {category}
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: theme.palette.mode === "dark" ? "rgba(246, 246, 246, 0.78)" : "#333" }}
              >
                {description}
              </Typography>

              {/* Auction Section */}
              {is_auction && auction_start_date && auction_end_date ? (
                <Box
                  sx={{
                    backgroundColor: "#e0f7fa",
                    padding: 2,
                    borderRadius: "8px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", color:"#000"
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Auction Details
                  </Typography>
                  <Typography variant="body1">
                    Starts on: {formatDate(auction_start_date)}
                  </Typography>
                  <Typography variant="body1" >
                    Ends on: {formatDate(auction_end_date)}
                  </Typography>
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ fontStyle: "italic", color: "#888" }}
                >
                  This product is not on auction.
                </Typography>
              )}

              {/* Price and Address */}
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: theme.palette.mode === "dark" ? "#00cfb7" : "#00695c" }}
              >
                Price: ${price.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.mode === "dark" ? "rgba(246, 246, 246, 0.78)" : "#555" }}>
                Location: {address}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
    </ThemeProvider>
  );
};

export default Product;
