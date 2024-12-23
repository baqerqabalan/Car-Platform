import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Box,
  Typography,
} from "@mui/material";
import { PlayArrow, Pause, Close } from "@mui/icons-material";

const Audios = ({ open, onClose, audios }) => {
  const [playing, setPlaying] = React.useState(null); // Keeps track of the currently playing audio

  const handlePlayPause = (audioKey) => {
    const audioElement = document.getElementById(audioKey);
    if (audioElement) {
      if (playing === audioKey) {
        audioElement.pause();
        setPlaying(null);
      } else {
        if (playing) document.getElementById(playing).pause(); // Pause currently playing audio
        audioElement.play();
        setPlaying(audioKey);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          backgroundColor: "#00695c",
          color: "#fff",
          fontSize: "1.6rem",
          fontWeight: 600,
          padding: "20px 24px",
          position: "relative",
        }}
      >
        Audio Files
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "#fff",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          padding: "20px",
          backgroundColor: "#f4f6f8",
          maxHeight: "500px",
          overflowY: "auto",
        }}
      >
        {audios && Object.keys(audios).length > 0 ? (
          <List
            sx={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
            }}
          >
            {Object.entries(audios).map(([key, src]) => (
              <ListItem
                key={key}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  gap: 2,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: "#e0f7fa",
                    transform: "scale(1.02)",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 500,
                        color: "#00695c",
                        textTransform: "capitalize",
                      }}
                    >
                      {key}
                    </Typography>
                  }
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <audio id={key} src={src} />
                  <IconButton
                    onClick={() => handlePlayPause(key)}
                    color="primary"
                    sx={{
                      backgroundColor: "#00695c",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#004d40",
                      },
                    }}
                  >
                    {playing === key ? <Pause /> : <PlayArrow />}
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "#777" }}
          >
            No audio files available.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Audios;
