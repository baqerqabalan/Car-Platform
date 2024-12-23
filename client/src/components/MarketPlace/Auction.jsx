import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  CssBaseline,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GavelIcon from "@mui/icons-material/Gavel";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import Countdown from "react-countdown";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import {
  getUserIdFromToken,
  isAuthenticated,
  setAuthHeader,
} from "../../helpers/authHelper";

const Auction = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [biddingPrice, setBiddingPrice] = useState("");
  const [productData, setProductData] = useState(null);
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  const { mode } = React.useContext(ThemeContext || localStorage.getItem('theme')); // Use context

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const checkAuthentication = useCallback(() => {
    if (!isAuthenticated()) {
      navigate(`/login?redirect=/Market Place/Auction/${productId}`);
    } else {
      return true;
    }
  }, [productId, navigate]);

  const submitBid = async () => {
    try {
      // Validate bidding price
      if (
        !biddingPrice ||
        isNaN(biddingPrice) ||
        biddingPrice <= productData?.auction?.highestBid
      ) {
        setBidError("Please enter a valid bid higher than the current highest bid.");
        return;
      }
  
      // Make POST request with Bearer token in headers
      const response = await axios.post(
        `http://localhost:5000/api/v1/auctions/bid/${productId}`,
        { bidAmount: Number(biddingPrice) },
            setAuthHeader()
      );
  
      // Handle response
      if (response.status === 201) {
        setBidSuccess("Bid placed successfully!");
        setInterval(() => {
          setBidSuccess("");
        }, 1000);
        setBidError(null);
        fetchProduct(); // Refresh product data
        setBiddingPrice(""); // Reset the input field
      } else {
        setBidError(response.data.message || "Failed to place bid.");
        setBidSuccess(null);
      }
    } catch (error) {
      setBidError(error.response?.data?.message || "Failed placing bid.");
      setBidSuccess(null);
    }
  };  

  const fetchProduct = useCallback(async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/products/getProduct/${productId}`
      );

      if (response.status === 200) {
        let data = response.data;

        if (data.product.is_auction) {
          data.product.auction_start_date = new Date(
            data.product.auction_start_date
          );
          data.product.auction_end_date = new Date(
            data.product.auction_end_date
          );
        }

        if (data.biddingHistory && data.biddingHistory.length > 0) {
          data.biddingHistory = data.biddingHistory.map((bid) => ({
            ...bid,
            createdAt: moment(bid.createdAt).format("DD-MM-YYYY HH:mm"),
          }));
        }

        setProductData(data);
        setLoading(false);
      } else {
        setErrors(response.data.message);
        setLoading(false);
      }
    } catch (error) {
      setErrors("Error fetching product details");
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (checkAuthentication()) {
      fetchProduct();
    }
  }, [fetchProduct, checkAuthentication]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          backgroundColor: theme.palette.background.default,
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (errors) {
    return (
      <Typography
        variant="h6"
        sx={{
          textAlign: "center",
          p: 2,
          fontWeight: "bold",
          color: "error.main",
        }}
      >
        {errors}
      </Typography>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 5, mb: 5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <IconButton
            onClick={() => navigate(-1)}
            aria-label="go back"
            sx={{ backgroundColor: "grey.100", color: "#000" }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardMedia
                component="img"
                alt={productData?.product?.name}
                height="300"
                image={`http://localhost:5000/${productData?.product?.image?.replace(
                  /\\/g,
                  "/"
                )}`}
                sx={{ borderRadius: "12px", objectFit: "cover" }}
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h4"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  color: theme.palette.mode === "dark" ? "#fff" : "#000",
                }}
              >
                {productData.product.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {productData.product.description}
              </Typography>
              <Typography variant="h5" sx={{ color: "#d32f2f", mb: 2 }}>
                Highest Bid:{" "}
                {productData?.auction?.highestBid
                  ? `$${productData?.auction?.highestBid}`
                  : `Be the first Bidder`}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                Time Remaining:
              </Typography>
              <Countdown
                date={productData?.product?.auction_end_date}
                renderer={({ hours, minutes, seconds, completed }) => {
                  if (completed) {
                    return (
                      <Typography variant="h6" color="error">
                        Auction Ended
                      </Typography>
                    );
                  } else {
                    return (
                      <Typography variant="h6" color="primary">
                        {hours}h {minutes}m {seconds}s
                      </Typography>
                    );
                  }
                }}
              />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
              <TextField
                label="Your Bid"
                variant="outlined"
                name="bidAmount"
                type="number"
                value={biddingPrice}
                onChange={(e) => setBiddingPrice(e.target.value)}
                sx={{ mr: 2, flex: 1 }}
                InputProps={{
                  inputProps: {
                    min: productData?.auction?.highestBid
                      ? productData?.auction?.highestBid + 1
                      : productData?.product?.price + 1,
                  },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={submitBid}
                disabled={
                  productData?.product?.sellerId?._id === getUserIdFromToken()
                    ? true
                    : false
                }
                sx={{ height: 56 }}
                startIcon={<GavelIcon />}
              >
                Place Bid
              </Button>
            </Box>
            {bidError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {bidError}
              </Typography>
            )}
            {bidSuccess && (
              <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                {bidSuccess}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
              mb: 2,
            }}
          >
            Bid History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bidder</TableCell>
                  <TableCell align="right">Bid Amount</TableCell>
                  <TableCell align="right">Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productData?.biddingHistory?.map((bid) => (
                  <TableRow key={bid?._id}>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          alt={
                            productData?.anonymousBid
                              ? "G"
                              : `${bid?.userId?.firstName} ${bid?.userId?.lastName}`
                          }
                          src={
                            productData?.anonymousBid
                              ? "G"
                              : `http://localhost:5000/${bid?.userId?.profileImg?.replace(
                                  /\\/g,
                                  "/"
                                )}`
                          }
                          sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        {bid?.userId?._id === getUserIdFromToken()
                          ? "You"
                          : productData?.anonymousBid
                          ? "G"
                          : `${bid?.userId?.firstName} ${bid?.userId?.lastName}`}
                      </Box>
                    </TableCell>
                    <TableCell align="right">${bid?.bidAmount}</TableCell>
                    <TableCell align="right">{bid?.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Auction;
