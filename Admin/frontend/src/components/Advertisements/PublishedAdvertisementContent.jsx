import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  createTheme,
  CssBaseline,
  Link,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Countdown from "react-countdown";
import axios from "axios";
import CarModelViewer from "./CarModelViewer";
import { Navigation, Pagination } from "swiper/modules";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import { ThemeContext } from "../../context/ThemeProviderComponent";

const PublishedAdvertisementContent = ({ tabValue }) => {
  const { mode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);
  const [ads, setAds] = useState([]);
  const [error, setError] = useState("");
  const [activeAdId, setActiveAdId] = useState(null); // State for tracking the active ad
  const [openUserDialogId, setOpenUserDialogId] = useState("");

    const theme = useMemo(
      () =>
        createTheme({
          palette: {
            mode,
            primary: { main: "#1a1a2e" },
            background: { default: mode === "light" ? "#f4f6f8" : "#121212" },
          },
        }),
      [mode]
    );

  const fetchPublishedAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous error messages

      const response = await axios.get(
        `http://localhost:4000/api/v1/advertisements/getAds`,
        {
          params: {
            tabValue,
            page: 1,
            limit: 3,
          },
        }
      );

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
  }, [tabValue]);

  useEffect(() => {
    fetchPublishedAds();
  }, [fetchPublishedAds]);

  const handleStopPublish = async (adId) => {
    try {
      setLoading(true);

      const payload = {
        adId: adId,
        status: "hasPublished",
      };

      await axios.patch(
        `http://localhost:4000/api/v1/advertisements/updateAdStatus`,
        payload
      );

      setLoading(false);
      fetchPublishedAds();
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError("Failed to Unpublish this advertisement");
    }
  };

  const handleTryAgain = () => {
    setError(null);
    fetchPublishedAds();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Box sx={{ maxWidth: "100%", padding: 2 }}>
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
        <Typography sx={{ textAlign: "center" }} color="secondary">
          No Current Advertisements
        </Typography>
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
                  backgroundColor:theme.palette.background.paper,
                  borderRadius: 3,
                  padding: 3,
                  boxShadow: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box
                  display="flex"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Seller Information */}
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      onClick={() =>
                        setOpenUserDialogId(ad.product.sellerId._id)
                      }
                      src={`http://localhost:5000/${ad.product.sellerId.profileImg}`}
                      alt={ad.product.sellerId.firstName[0]}
                      sx={{ width: 70, height: 70, cursor: "pointer" }}
                    />
                    {openUserDialogId === ad.product.sellerId._id && (
                      <SellerInfo
                        open={openUserDialogId === ad.product.sellerId._id}
                        onClose={() => setOpenUserDialogId(null)}
                        sellerId={ad.product.sellerId._id}
                      />
                    )}
                    <Typography variant="h6">
                      {ad.product.sellerId.firstName}{" "}
                      {ad.product.sellerId.lastName}
                    </Typography>
                  </Box>

                  {/* Countdown Section */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="flex-end"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Active until:
                    </Typography>
                    {ad._id === activeAdId && (
                      <Countdown
                        key={ad?._id} // Force re-render when ad ID changes
                        date={ad?.endPublishDate}
                        renderer={({
                          years,
                          months,
                          days,
                          hours,
                          minutes,
                          seconds,
                        }) => (
                          <Typography variant="h6" sx={{color:theme.palette.mode === "dark" ? "#fff" : "#000"}}>
                            {/* Display years if not 0 */}
                            {years > 0 && `${years}Y`}
                            {/* Display months if not 0 */}
                            {months > 0 && ` ${months}M`}
                            {/* Display days if not 0 */}
                            {days > 0 && ` ${days}d`}
                            {/* Display hours if not 0 */}
                            {hours > 0 && ` ${hours}h`}
                            {/* Display minutes and seconds */}
                            {
                              minutes > 0 || seconds > 0
                                ? ` ${minutes}m ${seconds}s`
                                : "0m 0s" // If both minutes and seconds are 0, show 0m 0s
                            }
                          </Typography>
                        )}
                      />
                    )}
                  </Box>
                </Box>

                {/* Car Model Viewer for Active Ad */}
                {ad._id === activeAdId && (
                  <CarModelViewer
                    model={ad?.model}
                    audios={ad?.audios}
                    features={ad?.features}
                  />
                )}

                {/* Action Buttons */}
                <Box sx={{ marginTop: 3, display: "flex", gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleStopPublish(ad._id)}
                  >
                    Stop
                  </Button>
                </Box>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </Box>
    </ThemeProvider>
  );
};

export default PublishedAdvertisementContent;
