import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import {
  Card,
  CardHeader,
  Avatar,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../helpers/authHelper";
import ShareProduct from "./ShareProduct";

const NormalSale = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNormalData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/products/getNormalSaleProducts"
        );

        const data = response.data.products;
        setCardsData(data);
      } catch (error) {
        console.log("Error fetching auction data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNormalData();
  }, []);


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
        <CircularProgress color="inherit" />
      </Box>
    );
  }
  return (
    <div>
      <Typography variant="h5" sx={{textAlign:"center", p:1}}>Sales Going on</Typography>
      {cardsData.length > 0 ? (
        <Swiper
          spaceBetween={30}
          loop={true}
          pagination={{ clickable: true }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          modules={[Autoplay, Pagination, Navigation]}
          breakpoints={{
            640: {
              // For small screens
              slidesPerView: 1,
            },
            768: {
              // For medium screens
              slidesPerView: 2,
            },
            1024: {
              // For larger screens
              slidesPerView: 3,
            },
          }}
        >
          {cardsData.map((card, index) => (
            <SwiperSlide key={index}>
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb:2}}>
              <Card sx={{maxWidth:"345px", width:"100%", m:"0 auto"}}>
                <CardHeader
                  avatar={
                    <Avatar
                      src={
                        card?.sellerId?.profileImg
                          ? `http://localhost:5000/${card?.sellerId?.profileImg}`
                          : undefined
                      }
                      alt={card?.sellerId?.firstName ? card?.sellerId?.firstName[0] : "U"}
                      sx={{
                        bgcolor: !card.sellerId.profileImg ? "red" : "transparent",
                        cursor: "pointer",
                      }}
                      aria-label="recipe"
                      onClick={() => navigate(`/Profile/${card.sellerId._id}`)}
                    >
                      {!card?.sellerId?.profileImg && card?.sellerId?.firstName
                        ? card?.sellerId?.firstName[0]
                        : null}
                    </Avatar>
                  }
                  title={`${card?.sellerId?.firstName} ${card?.sellerId?.lastName}`}
                />

                <CardMedia
                  component="img"
                  height="194"
                  image={`http://localhost:5000/${card?.image}`} // Ensure card.image is just the filename
                  alt={card?.title || "Product image"} // Use a more descriptive alt text
                />
                <CardContent>
                  <Typography variant="body5" sx={{color:"#000"}}>
                      {card?.name}
                  </Typography>
                  <br />
                  <Typography variant="body6" color="text.secondary">
                    Price: $ {card?.price}
                  </Typography>
                </CardContent>
                <CardActions
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                      <ShareProduct productId={card?._id} />
                  </div>
                  <Button
                    onClick={() => {
                      if (isAuthenticated()) {
                        navigate(
                          `/login?redirect=/Market Place/Product/${card?._id}`
                        );
                      } else {
                        navigate(`/Market Place/Product/${card?._id}`);
                      }
                    }}
                  >
                    Buy Now
                  </Button>
                </CardActions>
              </Card>
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Typography sx={{ textAlign: "center" }} variant="h6">
          No products available at the moment. But there's still plenty to explore! Browse
          our categories or sign up for notifications about the next big sale
          🔍. <br />{" "} 
          <Button
            sx={{ backgroundColor: "white", color: "#00008b", mt: 3, mb:1 }}
            variant="contained"
            href="/Market Place"
          >
            Visit the Market Palce
          </Button>
        </Typography>
      )}
    </div>
  );
};

export default NormalSale;
