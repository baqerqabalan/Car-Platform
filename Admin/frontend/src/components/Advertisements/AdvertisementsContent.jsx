import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Box,
  Button,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import Model from "./Dialogs/Model";
import Audio from "./Dialogs/Audios";
import Product from "./Dialogs/Product";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import axios from "axios";
import Features from "./Dialogs/Features";
import moment from "moment";

const AdvertisementContent = ({ tabValue }) => {
  const { mode } = useContext(ThemeContext);
  const [openModelDialogId, setOpenModelDialogId] = useState("");
  const [openAudiosDialogId, setOpenAudiosDialogId] = useState("");
  const [openProductDialogId, setOpenProductDialogId] = useState("");
  const [openFeaturesDialogId, setOpenFeaturesDialogId] = useState("");
  const [openUserInfoId, setOpenUserInfoId] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ads, setAds] = useState([]);
  const [total, setTotal] = useState(0);

  // Theme settings
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

  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const fetchTotalPublished = async () => {
    try{
      const response = await axios.get(`http://localhost:4000/api/v1/advertisements/getTotalPublished`);

      setTotal(response.data.totalPublished);
    }catch(error){  
      console.error(error);
    }
  };

  const fetchads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/advertisements/getAds`,
        {
          params: {
            tabValue: tabValue,
            page: page, // Use the current page instead of totalPages
            limit: 3, // Fetch 3 ads per page
          },
        }
      );

      setAds(response.data.data);
      setTotalPages(response.data.totalPages); // Set the total pages
      setLoading(false);
    } catch (error) {
      console.log("Error fetching ads:", error);
      setError("Failed fetching the ads");
      setLoading(false);
    }
  }, [tabValue, page]); // Make sure the dependency is `page`

  useEffect(() => {
    fetchTotalPublished();
    fetchads();
  }, [fetchads]);

  const handlePageChange = (event, value) => {
    setPage(value); // Update the page when the user changes the page
  };

  const handleChangeStatus = async (adId) => {
    try {
      setLoading(true);
  
      const payload = {
        adId: adId,
        status: "published",
      };
  
      await axios.patch(
        `http://localhost:4000/api/v1/advertisements/updateAdStatus`,
        payload, // send payload as JSON
        {
          headers: {
            "Content-Type": "application/json", // change to application/json
          },
        }
      );
  
      setLoading(false);
      setError(null);
      window.location.reload();
    } catch (error) {
      console.log(error);
      setError("Failed to update the status");
      setLoading(false);
    }
  };
  

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : ads?.length === 0 ? (
          <Typography color="secondary">No Ads Available</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {ads.map((ad, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      bgcolor: mode === "light" ? "#fff" : "#1e1e2e",
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          src={`http://localhost:5000/${ad?.product?.sellerId?.profileImg}`}
                          alt={`${ad?.product?.sellerId?.firstName} ${ad?.product?.sellerId?.lastName}`}
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            cursor: "pointer",
                          }}
                          onClick={() => setOpenUserInfoId(ad?.product.sellerId._id)}
                        />
                        {openUserInfoId === ad?.product.sellerId._id && (
                          <SellerInfo
                            open={openUserInfoId === ad?.product.sellerId._id}
                            onClose={() => setOpenUserInfoId(null)}
                            sellerId={ad?.product?.sellerId?._id}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#009688" }}
                          >
                            {ad?.product?.sellerId?.firstName}{" "}
                            {ad?.product?.sellerId?.lastName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* ad Title */}
                      <Typography
                        component="a"
                        sx={{ textAlign: "center", cursor:"pointer", color:"#009680", textDecoration:"underline" }}
                        onClick={() => setOpenProductDialogId(ad?.product?._id)}
                        variant="h6"
                        gutterBottom
                      >
                        {ad?.product?.name}
                      </Typography>
                      {openProductDialogId === ad?.product?._id && (
                        <Product
                          open={openProductDialogId === ad?.product?._id}
                          onClose={() => setOpenProductDialogId(null)}
                          product={ad?.product}
                        />
                      )}
                      <Typography
                        variant="body1"
                        gutterBottom>
                          Start Publish Date: {moment(ad?.startPublishDate).format('DD-MM-YYYY HH:MM:SS')}
                      </Typography>
                      <Typography
                        variant="body1"
                        gutterBottom>
                          End Publish Date:  {moment(ad?.endPublishDate).format('DD-MM-YYYY HH:MM:SS')}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {ad?.model && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                my:1,
                                mr:1,
                                textAlign: "center",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#009688",
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#00796b",
                                },
                              }}
                              onClick={() => setOpenModelDialogId(ad?._id)}
                            >
                              <strong>View Model</strong>
                            </Typography>
                            {openModelDialogId === ad?._id && (
                              <Model
                                open={openModelDialogId === ad?._id}
                                onClose={() => setOpenModelDialogId(null)}
                                model={ad?.model}
                              />
                            )}
                          </>
                        )}

                        {Object.keys(ad?.audios || {}).length > 0 && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                my:1,
                                mr:1,
                                textAlign: "center",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#009688",
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#00796b",
                                },
                              }}
                              onClick={() => setOpenAudiosDialogId(ad?._id)}
                            >
                              <strong>View Audios</strong>
                            </Typography>
                            {openAudiosDialogId === ad._id && (
                              <Audio
                                open={openAudiosDialogId === ad?._id}
                                onClose={() => setOpenAudiosDialogId(null)}
                                audios={ad?.audios}
                              />
                            )}{" "}
                          </>
                        )}

                        {Object.keys(ad?.features || {}).length > 0 && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                mr:1,
                                my:1,
                                textAlign: "center",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#009688",
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#00796b",
                                },
                              }}
                              onClick={() => setOpenFeaturesDialogId(ad?._id)}
                            >
                              <strong>View Features</strong>
                            </Typography>
                            {openFeaturesDialogId === ad._id && (
                              <Features
                                open={openFeaturesDialogId === ad?._id}
                                onClose={() => setOpenFeaturesDialogId(null)}
                                features={ad?.features}
                              />
                            )}{" "}
                          </>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      {tabValue === 1 && total !== 3 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              handleChangeStatus(ad._id);
                            }}
                            sx={{ marginRight: 1, backgroundColor: "#009688" }}
                          >
                            Publish
                          </Button>
                        </Box>
                      ) : null}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box mt={4} mb={2} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-previousNext": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default AdvertisementContent;
