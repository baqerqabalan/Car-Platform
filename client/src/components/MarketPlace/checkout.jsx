import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import {
  TextField,
  Checkbox,
  Button,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  FormControlLabel,
  CssBaseline,
  Alert,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  getUserIdFromToken,
  isAuthenticated,
  setAuthHeader,
} from "../../helpers/authHelper";
import { ArrowBack, ArrowRight } from "@mui/icons-material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import bg from "../../assets/images/bg.jpg";


const Checkout = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [useRegisteredInfo, setUseRegisteredInfo] = useState(false);
  const [product, setProduct] = useState({});
  const [highestBid, setHighestBid] = useState(0);
  const [formValues, setFormValues] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const { mode } = useContext(ThemeContext || localStorage.getItem('theme')); // Access context for theme mode
  const [message, setMessage] = useState(null);
  const [winnerAuction, setWinnerAuction] = useState(false);
  const [isSaleFound, setIsSaleFound] = useState(null); 

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const handleDownloadPdf = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/sales/createSalePdf/${productId}`,
        {
          headers: setAuthHeader(),
          responseType: 'json',
        }
      );
  
      if (response.status !== 200) {
        setErrors("Failed to download PDF");
        setLoading(false);
        return;
      }
  
      const pdfBuffer = response.data.sale; // Extract the buffer from the response
  
      if (!pdfBuffer || pdfBuffer.length === 0) {
        setErrors("The PDF file is empty or corrupted.");
        setLoading(false);
        return;
      }
  
      // Convert the buffer to a Blob
      const pdfBlob = new Blob([new Uint8Array(pdfBuffer.data)], { type: 'application/pdf' });
  
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "reservation_bill.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setErrors("Error while downloading the reservation bill");
      setLoading(false);
    }
  };  
  
  const checkSale = useCallback(async () => {
    try{
      setLoading(true);
      setAuthHeader();

      const response = await axios.get(`http://localhost:5000/api/v1/sales/checkSale/${productId}`);

      if(response.status === 200 && response.data.message === "Sale Not Found"){        
        setLoading(false);
        setIsSaleFound(false);
      }else if(response.status === 200 && response.data.message === "Sale has found"){
        setLoading(false);
        setIsSaleFound(true);
      }else{
        setErrors("Something went wrong");
        setLoading(false);
      }
    }catch(error){
      console.log(error);
      setLoading(false);
      setErrors('Error while checking if this item had sold out');
    }
  },[productId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    if (!formValues.firstName) newErrors.firstName = "First Name is required";
    if (!formValues.lastName) newErrors.lastName = "Last Name is required";
    if (!formValues.email) newErrors.email = "Email is required";
    if (!formValues.phone) newErrors.phone = "Phone number is required";
    if (!formValues.address) newErrors.address = "Address is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        setLoading(true);
      
        const response = await axios.post(
          `http://localhost:5000/api/v1/sales/createSale/${productId}`,
          {
            seller_Info: {
              firstName: formValues.firstName,
              lastName: formValues.lastName,
              email: formValues.email,
              phone: formValues.phone,
              address: formValues.address,
            },
          }
        );

        if (response.status === 201) {
          setMessage(
            `Sale Completed Successfully 🎉`
          );
          setLoading(false);
        }else{
          setLoading(false);
          setErrors("Error while submitting the sale, try again later");
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
        setErrors("Error while submitting the sale, try again later");
      }
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

// Fetch product data
const fetchProduct = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get(
      `http://localhost:5000/api/v1/products/getProduct/${productId}`
    );

    if (response.status === 200) {
      setProduct(response.data.product);

      const isHighestBidder =
        response?.data?.auction?.highestBidder === getUserIdFromToken();

      setWinnerAuction(isHighestBidder);
      setHighestBid(isHighestBidder ? response.data.auction.highestBid : 0);
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    setErrors((prev) => ({ ...prev, product: "Error fetching the product" }));
  } finally {
    setLoading(false);
  }
}, [productId]);

// Check user authentication
const checkAuthentication = useCallback(() => {
  if (isAuthenticated()) {
    setAuthHeader();
    return true;
  } else {
    navigate(`/login?redirect=/Market Place/Checkout/${productId}`);
    return false;
  }
}, [navigate, productId]);

// Fetch user data
const fetchUser = useCallback(async () => {
  setLoading(true);
  try {
    const response = await axios.get(`http://localhost:5000/api/v1/auth/getUserInfo`);

    if (response.status === 200) {
      const { firstName, lastName, phoneNumber, email } = response.data.user;
      setFormValues({ firstName, lastName, phone: phoneNumber, email });
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    setErrors((prev) => ({ ...prev, user: "Error fetching user info" }));
  } finally {
    setLoading(false);
  }
}, []); 

// Main effect to check sale and fetch data
useEffect(() => {
  const checkAndFetch = async () => {
    await checkSale();

    if (!isSaleFound && checkAuthentication()) {
      fetchProduct();
    }
  };

  checkAndFetch();
}, [isSaleFound, checkAuthentication, checkSale, fetchProduct]);

  // Toggle registered user info
  const handleUseRegisteredInfoChange = (e) => {
    setUseRegisteredInfo(e.target.checked);
    if (e.target.checked) {
      fetchUser();
    } else {
      setFormValues({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: "100vh", // Ensures the background covers the full viewport
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed", // Makes the background stay in place while scrolling
        }}
      >
        <Box
          sx={{
            maxWidth: 800,
            mx: "auto",
            px: 4,
            pt: 4,
            pb: 1,
            backgroundColor: theme.palette.mode === "dark" ? "#000" : "#f7f7f7",
            borderRadius: 4,
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button onClick={() => navigate('/Market Place')}>
              <ArrowBack />
            </Button>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                textAlign: "center",
                mb: 3,
                fontWeight: 700,
                color: theme.palette.mode === "dark" ? "#fff" : "#333",
              }}
            >
              Complete Your Purchase
            </Typography>
          </Box>
          {loading ? (
            <Box display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : (
            !isSaleFound ? (
              <>
              {message ? (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  mt={4}
                  p={3}
                  sx={{
                    backgroundColor: "background.paper",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: 2,
                    maxWidth: 400,
                    mx: "auto",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    color="primary"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {message}
                  </Typography>

                  <Button
                    onClick={() => navigate("/Market Place")}
                    variant="contained"
                    color="primary"
                    endIcon={<ArrowRight />}
                    sx={{ my: 2, width: "100%", textTransform: "none" }}
                  >
                    Explore More Products
                  </Button>

                  <Button
                    onClick={handleDownloadPdf}
                    variant="outlined"
                    color="secondary"
                    sx={{ width: "100%", textTransform: "none" }}
                  >
                    Download Bill
                  </Button>

                  <Alert severity="warning" sx={{ my: 2 }}>
                    You can download it once.
                  </Alert>
                </Box>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper
                        elevation={3}
                        sx={{
                          p: 3,
                          backgroundColor: "background.paper", // Dynamic dark/light theme compatibility
                          borderRadius: 2,
                          color: "text.primary", // Text color based on theme
                        }}
                      >
                        {winnerAuction ? (
                          <Typography variant="h6" color="green">
                            🎉Congratulations! You won the auction 🎉
                          </Typography>
                        ) : null}
                        {/* Seller Information */}
                        {product.sellerId && (
                          <Box display="flex" alignItems="center" mb={2}>
                            <Typography
                              variant="subtitle1"
                              color="text.secondary"
                              sx={{ mr: 1, fontWeight: 500 }}
                            >
                              Sold by:
                            </Typography>
                            <Avatar
                              src={`http://localhost:5000/${product.sellerId.profileImg}`}
                              alt={`${product.sellerId.firstName} ${product.sellerId.lastName}`}
                              sx={{
                                width: 50,
                                height: 50,
                                mx: 2,
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for visual appeal
                              }}
                            />
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main", // Highlight seller's name with primary color
                              }}
                            >
                              {product.sellerId.firstName}{" "}
                              {product.sellerId.lastName}
                            </Typography>
                          </Box>
                        )}

                        {/* Product Information */}
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            variant="square"
                            src={`http://localhost:5000/${product.image}`}
                            alt={product.name}
                            sx={{
                              width: 80,
                              height: 80,
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // Add shadow for product image
                            }}
                          />
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: "bold", color: "text.primary" }} // Product name in bold
                            >
                              {product.name}
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                color: "text.secondary", // Muted color for price
                                fontWeight: 500,
                              }}
                            >
                              $
                              {!winnerAuction
                                ? `${product.price}`
                                : `${highestBid}`}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={useRegisteredInfo}
                            onChange={handleUseRegisteredInfoChange}
                          />
                        }
                        label="Use Registered Info"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="First Name*"
                        name="firstName"
                        value={formValues.firstName}
                        onChange={handleInputChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        InputLabelProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                          },
                        }}
                        InputProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                            backgroundColor:
                              mode === "dark" ? "#333333" : undefined,
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Last Name*"
                        name="lastName"
                        value={formValues.lastName}
                        onChange={handleInputChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        InputLabelProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                          },
                        }}
                        InputProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                            backgroundColor:
                              mode === "dark" ? "#333333" : undefined,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email*"
                        name="email"
                        value={formValues.email}
                        onChange={handleInputChange}
                        error={!!errors.email}
                        helperText={errors.email}
                        InputLabelProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                          },
                        }}
                        InputProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                            backgroundColor:
                              mode === "dark" ? "#333333" : undefined,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone Number*"
                        name="phone"
                        value={formValues.phone}
                        onChange={handleInputChange}
                        error={!!errors.phone}
                        helperText={errors.phone}
                        InputLabelProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                          },
                        }}
                        InputProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                            backgroundColor:
                              mode === "dark" ? "#333333" : undefined,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Address*"
                        name="address"
                        value={formValues.address}
                        onChange={handleInputChange}
                        error={!!errors.address}
                        helperText={errors.address}
                        InputLabelProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                          },
                        }}
                        InputProps={{
                          style: {
                            color: mode === "dark" ? "#ffffff" : undefined,
                            backgroundColor:
                              mode === "dark" ? "#333333" : undefined,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                      >
                        Complete Purchase
                      </Button>
                    </Grid>
                  </Grid>
                </form>)
            }
            </>
          )
              : (
                  <Alert severity="success">
                   You already purchased this item, explore more products <Button onClick={() => navigate(`/Market Place`)}><ArrowRight /></Button>
                  </Alert>
              )
            )}
        </Box>
      </div>
    </ThemeProvider>
  );
};

export default Checkout;
