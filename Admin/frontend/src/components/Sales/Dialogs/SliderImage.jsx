import { Close } from "@mui/icons-material";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css"; // Import Swiper styles
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import React, { useEffect, useState } from "react";

const ImageSliderDialog = ({ open, onClose, images }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!images || images.length === 0) {
      setError("Error fetching images");
    }
  }, [images]);

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
        <Typography variant="h6">Additional Images</Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          spaceBetween={10}
          slidesPerView={1}
          style={{ width: "100%", height: "100%" }}
        >
          {images.map((img, index) => (
            <SwiperSlide key={index}>
              <img
                src={`http://localhost:5000/${img}`}
                alt={`Slide ${index + 1}`}
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "contain",
                  borderRadius: "8px",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </DialogContent>
    </Dialog>
  );
};

export default ImageSliderDialog;