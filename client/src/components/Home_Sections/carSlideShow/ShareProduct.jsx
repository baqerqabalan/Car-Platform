import React from "react";
import { IconButton } from "@mui/material";
import Share from '@mui/icons-material/Share';

export default function ShareButton({productId}) {
  const handleShare = () => {
    const port = window.location.port;
    const productUrl = `http://localhost:${port}/Market Place/Product/${productId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Amazing Product",
          text: "Check out this amazing product I found!",
          url: productUrl,
        })
        .then(() => console.log("Product shared successfully!"))
        .catch((error) => console.error("Error sharing the product:", error));
    } else {
      navigator.clipboard.writeText(productUrl).then(
        () => {
          alert("Link copied to clipboard. Share it manually!");
        },
        (err) => {
          console.error("Failed to copy link:", err);
        }
      );
    }
  };

  return (
    <IconButton aria-label="share" onClick={handleShare}>
        <Share />
        </IconButton>
  );
}
