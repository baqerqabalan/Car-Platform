import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Modal,
  CircularProgress,
  Link,
  Avatar,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import { Message } from "@mui/icons-material";
import axios from "axios";
import moment from "moment";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import { ThemeContext } from "../../context/ThemeProviderComponent";

const MessagesList = () => {
  const [open, setOpen] = useState(false); // Modal open state
  const [currentMessage, setCurrentMessage] = useState(null); // Selected message
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserDialogId, setOpenUserDialogId] = useState("");
  const { mode } = useContext(ThemeContext);

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:4000/api/v1/messages/getResolvedMessages`
      );
      setMessages(response.data.messages || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch messages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Open reply modal
  const handleReply = (message) => {
    setCurrentMessage(message);
    setOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setOpen(false);
    setCurrentMessage(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Box>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ backgroundColor: "#1a1a2e", color: "white", py: 4, pl: 1 }}
      >
        <Message sx={{ verticalAlign: "middle", mr: 1 }} />
        Messages
      </Typography>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">
          {error}{" "}
          <Link onClick={fetchMessages} sx={{ cursor: "pointer" }}>
            Retry
          </Link>
        </Typography>
      ) : messages.length === 0 ? (
        <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
          No messages found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg._id}>
                  {openUserDialogId === msg.creatorId?._id && (
                    <SellerInfo
                      open
                      onClose={() => setOpenUserDialogId("")}
                      sellerId={msg.creatorId?._id}
                    />
                  )}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={`http://localhost:5000/${msg.creatorId?.profileImg || "default-avatar.png"}`}
                        onError={(e) => (e.target.src = "/default-avatar.png")}
                        sx={{ mr: 1, cursor: "pointer" }}
                        onClick={() => setOpenUserDialogId(msg.creatorId?._id)}
                      />
                      <Typography>
                        {msg.creatorId?.firstName || "Unknown"}{" "}
                        {msg.creatorId?.lastName || ""}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{msg.email || "No email"}</TableCell>
                  <TableCell>{msg.message || "No message"}</TableCell>
                  <TableCell>
                    {moment(msg.createdAt).format("DD-MM-YYYY HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleReply(msg)}
                    >
                      View Reply
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Modal open={open} onClose={handleClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Reply to {currentMessage?.creatorId?.firstName || "Unknown"}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            {currentMessage?.reply || "No reply available."}
          </Typography>
          <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button variant="outlined" color="secondary" onClick={handleClose}>
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
    </ThemeProvider>
  );
};

export default MessagesList;