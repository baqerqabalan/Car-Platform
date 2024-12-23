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
import ShareProduct from "../carSlideShow/ShareProduct";
import "./Auction.css";
import axios from "axios";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../helpers/authHelper";

const Auction = () => {
  const [cardsData, setCardsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctionData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/auctions/getAllAuctions"
        );

        const data = response.data.products;
        setCardsData(data);
      } catch (error) {
        console.log("Error fetching auction data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionData();
  }, []);


  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#00008b",
        }}
      >
        <CircularProgress color="inherit" />
      </Box>
    );
  }
  return (
    <div className="card-container">
      <h1 className="title">Auctions Going on</h1>
      {cardsData?.length > 0 ? (
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
          {cardsData?.map((card, index) => (
            <SwiperSlide key={index}>
              <Card className="card">
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
                        bgcolor: !card?.sellerId?.profileImg ? "red" : "transparent",
                        cursor: "pointer",
                      }}
                      aria-label="recipe"
                      onClick={() => navigate(`/Profile/${card?.sellerId?._id}`)}
                    >
                      {!card?.sellerId?.ProfileImg && card?.sellerId?.firstName
                        ? card?.sellerId?.firstName[0]
                        : null}
                    </Avatar>
                  }
                  title={`${card?.sellerId?.firstName} ${card?.sellerId?.lastName}`}
                  subheader={`Auction Ends in: ${moment(card?.auction_end_date).format('DD-MM-YYYY hh:mm A')}`}
                />

                <CardMedia
                  component="img"
                  height="194"
                  image={`http://localhost:5000/${card?.image}`} // Ensure card.image is just the filename
                  alt={card?.name || "Product image"} // Use a more descriptive alt text
                />
                <CardContent>
                  <Typography variant="body5" color="text.secondary">
                    {`${card?.name} `}
                  </Typography>
                  <br />
                  <Typography variant="body6" color="text.secondary">
                    {`Original Price: $ ${card?.price} `}
                    <br />
                    Highest Bid: {card?.highestBid ? `${card?.highestBid}` : 'Be the first Bidder'}
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
                    className="bid-btn"
                    onClick={() => {
                      !isAuthenticated() ?
                        navigate(
                          `/login?redirect=/Market Place/Auction/${card?._id}`
                        )
                      :
                        navigate(`/Market Place/Auction/${card?._id}`);
                    }}
                  >
                    Bid Now
                  </Button>
                </CardActions>
              </Card>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <Typography sx={{ color: "white", textAlign: "center" }} variant="h6">
          No auctions at the moment. But there's still plenty to explore! Browse
          our categories or sign up for notifications about the next big sale
          🔍. <br />{" "}
          <Button
            sx={{ backgroundColor: "white", color: "#00008b", mt: 3 }}
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

export default Auction;
