import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  CircularProgress,
  Container,
  createTheme,
  List,
  ListItem,
  Pagination,
  Typography,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import AuctionButton from "./AuctionButton";
import { getUserIdFromToken, isAuthenticated } from "../../helpers/authHelper";
import { useNavigate } from "react-router-dom";

const MarketPlaceList = ({ selectedFilter, sortOption, searchQuery }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 10;
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Construct the base query
        let query = `http://localhost:5000/api/v1/products?filter=${selectedFilter}&page=${page}&limit=${productsPerPage}`;

        // Add sort option if it exists
        if (sortOption) query += `&sort=${sortOption}`;

        // Only add search query if it's present
        if (searchQuery) query += `&search=${searchQuery}`;

        // Fetch data
        const { data } = await axios.get(query);

        // Format products and update state
        const formattedProducts = data.products.map((product) => ({
          ...product,
          createdAt: moment(product.createdAt).format("DD-MM-YYYY HH:mm"),
        }));

        setProducts(formattedProducts);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setError("No Products Found");
        setLoading(false);
      }
    };

    fetchProducts(); // Fetch without search query
  }, [selectedFilter, sortOption, searchQuery, page]);

  const handlePageChange = (event, value) => setPage(value);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ textAlign: "center", p: 2, fontWeight: "bold" }}>
        {error}
      </Typography>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {products.length > 0 ? (
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mx: "auto",
            maxWidth: "1200px",
          }}
        >
          {products.map((product) => (
            <ListItem key={product._id} sx={{ p: 0 }}>
              <Card
                sx={{
                  width: "100%",
                  boxShadow: 3,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#2d2d2d" : "#f0f4f8",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": { transform: "scale(1.03)" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  {/* Product Image */}
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: "100%", sm: "500px" } }} // Full width on small screens, fixed width on larger screens
                    height="250"
                    image={
                      product.image
                        ? `http://localhost:5000/${product.image}`
                        : "/static/images/default.jpg"
                    }
                    alt={product.name}
                  />
                  {/* Product Info */}
                  <Box sx={{ flex: 1 }}>
                    <CardHeader
                      avatar={
                        <Avatar
                          src={
                            product.seller.profileImg
                              ? `http://localhost:5000/${product.seller.profileImg}`
                              : undefined
                          }
                          alt={
                            product.seller.profileImg
                              ? product.seller.firstName[0]
                              : "U"
                          }
                          sx={{
                            bgcolor: !product.seller.profileImg
                              ? "red"
                              : "transparent",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            navigate(`/Profile/${product.seller._id}`)
                          }
                        >
                          {!product.seller.profileImg &&
                          product.seller.firstName
                            ? product.seller.firstName[0]
                            : null}
                        </Avatar>
                      }
                      sx={{
                        color:
                          theme.palette.mode === "dark" ? "#fff" : "#00008b",
                      }}
                      title={`${product.seller.firstName} ${product.seller.lastName}`}
                      subheader={`Listed on: ${product.createdAt}`}
                    />
                    <CardContent
                      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          component={"a"}
                          onClick={() =>
                            isAuthenticated()
                              ? navigate(`/Market Place/Product/${product._id}`)
                              : navigate(
                                  `/login?redirect=/Market Place/Product/${product._id}`
                                )
                          }
                          sx={{
                            textDecoration: "none",
                            color:
                              theme.palette.mode === "dark"
                                ? "#fff"
                                : "#00008b",
                            cursor: "pointer",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "#fff"
                                : "#00008b",
                            mt: 1,
                          }}
                        >
                          {product.description}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "#fff"
                                : "#00008b",
                            mt: 1,
                          }}
                        >
                          Address: {product.address}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            color:
                              theme.palette.mode === "dark"
                                ? "#fff"
                                : "#00008b",
                            mt: 1,
                          }}
                        >
                          Price: ${product.price}
                        </Typography>
                        {product.is_auction ? (
                          <AuctionButton product={product} />
                        ) : (
                          <Button
                            onClick={() => {
                              if (isAuthenticated()) {
                                navigate(
                                  `/Market Place/Checkout/${product._id}`
                                );
                              } else {
                                navigate(
                                  `/login?redirect=/Market Place/Checkout/${product._id}`
                                );
                              }
                            }}
                            variant="contained"
                            disabled={
                              product.sellerId === getUserIdFromToken()
                                ? true
                                : false
                            }
                            sx={{
                              backgroundColor: "green",
                              mt: 2,
                              color: "white",
                              fontWeight: "bold",
                              "&:hover": {
                                backgroundColor: "#32cd32", // Lighter green on hover
                                transform: "scale(1.05)",
                              },
                            }}
                            startIcon={<i className="fas fa-shopping-cart" />} // Add shopping cart icon
                          >
                            Buy Now
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Box>
                </Box>
              </Card>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography sx={{ textAlign: "center" }}>
          No {selectedFilter} Products Found
        </Typography>
      )}
      {/* Pagination Component */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Container>
  );
};

export default MarketPlaceList;
