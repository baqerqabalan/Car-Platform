import {
  Box,
  CircularProgress,
  Link,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import axios from "axios";
import CarModelViewer from "./CarModelViewer";
import { Navigation, Pagination } from "swiper/modules";
import NormalSales from './NormalSale';

const Slideshow = () => {
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const [activeAdId, setActiveAdId] = useState(null); // State for tracking the active ad

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous error messages

      const response = await axios.get(
        `http://localhost:5000/api/v1/advertisements/getAds`);

      const fetchedAds = response.data?.data || []; // Ensure fetchedAds is an array
      setAds(fetchedAds);

      // Set the active ad only if there are ads
      if (fetchedAds.length > 0) {
        setActiveAdId(fetchedAds[0]._id);
      } else {
        setActiveAdId(null); // Clear active ad if no ads are present
      }

      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch the current published ads");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);


  const handleTryAgain = () => {
    setError(null);
    fetchAds();
  };

  return (
    <Box sx={{ maxWidth: "100%" }}>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" sx={{ textAlign: "center", marginTop: 2 }}>
          {error}{" "}
          <Link
            onClick={() => handleTryAgain()}
            sx={{
              cursor: "pointer",
              color: "primary.main",
              textDecoration: "underline",
            }}
          >
            Try again
          </Link>
        </Typography>
      ) : ads?.length === 0 ? (
        <NormalSales />
      ) : (
        <Swiper
          spaceBetween={20}
          slidesPerView={1}
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          onSlideChange={(swiper) => setActiveAdId(ads[swiper.activeIndex]._id)} // Track active ad by slide index
        >
          {ads.map((ad) => (
            <SwiperSlide key={ad._id}>
              <Box
                sx={{
                  borderRadius: 3,
                  padding: 3,
                  boxShadow: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 4,
                  },
                }}
              >
                {/* Car Model Viewer for Active Ad */}
                {ad._id === activeAdId && (
                  <CarModelViewer
                    model={ad?.model}
                    audios={ad?.audios}
                    features={ad?.features}
                    productId={ad?.productId}
                  />
                )}
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
  );
};

export default Slideshow;