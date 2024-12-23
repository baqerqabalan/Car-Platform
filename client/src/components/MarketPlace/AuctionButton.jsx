import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { ArrowRight, Gavel } from "@mui/icons-material";

const AuctionButton = ({ product }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isAuctionEnded, setIsAuctionEnded] = useState(false);

  useEffect(() => {
    if (product.is_auction === true) {
      const interval = setInterval(() => {
        const now = Date.now();
        const endDate = new Date(product.auction_end_date).getTime();
        const timeDiff = endDate - now;

        // Check if the auction has ended
        if (timeDiff <= 0) {
          clearInterval(interval);
          setIsAuctionEnded(true);
          setTimeRemaining("Auction Ended");
        } else {
          // Calculate years, months, days, hours, minutes, and seconds
          const years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
          const months = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24 * 365)) /
              (1000 * 60 * 60 * 24 * 30)
          );
          const days = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
          );
          const hours = Math.floor(
            (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDiff % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDiff % 1000) / 1000);

          if (years > 0) {
            setTimeRemaining(`${years}y ${months}mo ${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else if (months > 0) {
            setTimeRemaining(`${months}mo ${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else if (days > 0) {
            setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
          } else {
            setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
          }
        }
      }, 1000);

      // Clear the interval when the component is unmounted
      return () => clearInterval(interval);
    }
  }, [product.auction_end_date, product.is_auction]);

  return (
    <Button
      href={`/Market Place/Auction/${product._id}`}
      variant="contained"
      disabled={isAuctionEnded}
      sx={{
        mt: 2,
        backgroundColor: isAuctionEnded ? "gray" : "red",
        color: "white",
        fontWeight: "bold",
        width: "100%",
        textAlign: "left",
        animation: !isAuctionEnded ? "glow 1.5s infinite" : "none",
        "&:hover": {
          backgroundColor: isAuctionEnded ? "gray" : "#ff6347",
          transform: !isAuctionEnded ? "scale(1.05)" : "none",
        },
        "@keyframes glow": {
          "0%": { boxShadow: "0 0 5px red" },
          "50%": { boxShadow: "0 0 20px red" },
          "100%": { boxShadow: "0 0 5px red" },
        },
      }}
      startIcon={<Gavel />} // Auction hammer icon
      endIcon={<ArrowRight sx={{ textAlign: "right" }} />}
    >
      {isAuctionEnded ? "Auction Ended" : `Auction Going On - ${timeRemaining}`}
    </Button>
  );
};

export default AuctionButton;
