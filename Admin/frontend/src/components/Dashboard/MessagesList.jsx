import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  CircularProgress,
  Link,
  Avatar,
  IconButton,
  Container,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import { ArrowLeft } from "@mui/icons-material";
import axios from "axios";
import moment from "moment";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import { useNavigate } from "react-router-dom";

const MessagesList = () => {
  const [open, setOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openUserDialogId, setOpenUserDialogId] = useState("");
  const [totalNotifications, setTotalNotifications] = useState(0);
  const mode = localStorage.getItem("theme") || 'light';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  const navigate = useNavigate();

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `http://localhost:4000/api/v1/messages/getPendingMessages`
      );
      setMessages(response.data.messages || []);
      setTotalNotifications(response.data.total);
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

  const handleReply = (message) => {
    setCurrentMessage(message);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setReply("");
  };

  const handleSendReply = async () => {
    if (!reply.trim()) {
      alert("Reply content cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post(`http://localhost:4000/api/v1/messages/sendMessage`, {
        email: currentMessage.email,
        reply,
      });

      handleClose();
      fetchMessages();
    } catch (err) {
      console.error(err);
      setError("Failed to send reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container sx={{ backgroundColor: theme.palette.background.default, minHeight: "100vh", py: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
            px: 3,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 1,
            marginY: 2,
          }}
        >
          <IconButton onClick={() => navigate(-1)} sx={{ color: theme.palette.text.primary }}>
            <ArrowLeft />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            {totalNotifications} Notifications
          </Typography>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography
            color="error"
            align="center"
            sx={{ mt: 5, px: 2, textAlign: "center" }}
          >
            {error}{" "}
            <Link onClick={fetchMessages} sx={{ cursor: "pointer" }}>
              Retry
            </Link>
          </Typography>
        ) : messages.length === 0 ? (
          <Typography
            color={theme.palette.text.secondary}
            align="center"
            sx={{ mt: 5, px: 2 }}
          >
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
                          src={`http://localhost:5000/${
                            msg.creatorId?.profileImg || "default-avatar.png"
                          }`}
                          onError={(e) =>
                            (e.target.src = "/default-avatar.png")
                          }
                          sx={{ mr: 1, cursor: "pointer" }}
                          onClick={() =>
                            setOpenUserDialogId(msg.creatorId?._id)
                          }
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
                        sx={{ backgroundColor: theme.palette.primary.main }}
                        onClick={() => handleReply(msg)}
                      >
                        Reply
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
              bgcolor: theme.palette.background.paper,
              boxShadow: 24,
              borderRadius: 2,
              p: 4,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Reply to {currentMessage?.creatorId?.firstName || "Unknown"}
            </Typography>
            <TextField
              fullWidth
              label="Reply"
              multiline
              rows={4}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendReply}
                sx={{ mr: 1 }}
              >
                Send
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      </Container>
    </ThemeProvider>
  );
};

export default MessagesList;