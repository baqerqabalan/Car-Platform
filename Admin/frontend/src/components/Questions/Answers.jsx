import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createTheme,
  CssBaseline,
  ThemeProvider,
  Card,
  Typography,
  Button,
  Stack,
  Avatar,
  Box,
  IconButton,
  Pagination,
  CircularProgress,
  Link,
} from "@mui/material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import axios from "axios";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import VoteDetailsDialog from "./VoteDtailsDialog";

const Answers = () => {
  const mode = useContext(ThemeContext || localStorage.getItem('theme'));
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const { questionId } = useParams();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [question, setQuestion] = useState(null);
  const [answerCounts, setAnswerCounts] = useState(0);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openVotersDialogId, setOpenVotersDialogId] = useState(null);

  const navigate = useNavigate();

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const fetchAnswers = useCallback(async () => {
    setLoading(true); // Show loading state when switching pages
    try {
      const response = await axios.get(
        `http://localhost:4000/api/v1/questions/getAllAnswers/${questionId}`,
        { params: { page } }
      );
      setAnswers(response.data.answers);
      setQuestion(response.data.question.content);
      setTotalPages(response.data.totalPages);
      setAnswerCounts(response.data.answerCounts); // Total answers count
      setLoading(false);
    } catch (err) {
      console.error("Error fetching answers:", err);
      setError("Error fetching answers. Please try again later.");
      setLoading(false);
    }
  }, [page, questionId]);

  useEffect(() => {
    fetchAnswers();
  }, [fetchAnswers]);

  const handleTryAgain = () => {
    setError(null);
    fetchAnswers();
  };
  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "white",
          color: "#fff",
          padding: 2,
        }}
      >
        <Stack
          spacing={3}
          sx={{
            maxWidth: "800px",
            margin: "0 auto",
            marginTop: "20px",
          }}
        >
          {/* Back Button */}
          <Box display="flex" alignItems="center" gap={1}>
            <Button
              onClick={handleBack}
              variant="contained"
              sx={{ backgroundColor: "#1a1a2e" }}
            >
              <IconButton>
                <ArrowBackIcon sx={{ color: "#fff" }} />
              </IconButton>
              Back
            </Button>
          </Box>

          {/* Question Title with Answer Counter */}
          <Card
            sx={{
              padding: 3,
              borderRadius: "12px",
              boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="h6" fontWeight="bold" color="#1a1a2e">
              {question}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {answerCounts} Answers
            </Typography>
          </Card>

          {/* Answers List */}
          {loading ? (
            <Typography color="secondary" align="center">
              <CircularProgress sx={{ color: theme.palette.mode === "dark" ? "white" : "dark" }} />
            </Typography>
          ) : error ? (
            <Typography color="error" align="center">
              {error}{" "}
              <Link onClick={() => handleTryAgain()}>Please try again</Link>
            </Typography>
          ) : (
            answers.map((answer) => (
              <Card
                key={answer.id}
                sx={{
                  padding: 2,
                  borderRadius: "12px",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                  backgroundColor: answer.id % 2 === 0 ? "#e3f2fd" : "#e8f5e9",
                }}
              >
                {/* Answer Header */}
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar
                    src={`http://localhost:5000/${answer.creatorId.profileImg}`}
                    alt={answer.creatorId.firstName[0]}
                    onClick={() => setOpenUserDialog(true)}
                    sx={{
                      border: "2px solid #009688",
                      boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                      cursor: "pointer",
                    }}
                  />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="#009688"
                  >
                    {answer.creatorId.firstName} {answer.creatorId.lastName}
                  </Typography>
                  {openUserDialog && (
                    <SellerInfo
                      open={openUserDialog}
                      onClose={() => setOpenUserDialog(false)}
                      sellerId={answer.creatorId._id}
                    />
                  )}
                </Box>

                {/* Answer Content */}
                <Typography
                  variant="body1"
                  sx={{ marginBottom: "10px", color: "#444", wordBreak:"break-word" }}
                  dangerouslySetInnerHTML={{ __html: answer.content }}
                />

                {/* Show Votes Button */}
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    backgroundColor: "#009688",
                    "&:hover": { backgroundColor: "#00796b" },
                  }}
                  onClick={() => setOpenVotersDialogId(answer._id)}
                >
                  Show Voters ({answer.voteCounts})
                </Button>
                {openVotersDialogId === answer._id && (
                  <VoteDetailsDialog
                    open={openVotersDialogId === answer._id}
                    onClose={() => setOpenVotersDialogId(null)}
                    answerId={answer._id}
                  />
                )}
              </Card>
            ))
          )}{/*Hul henne */}
        </Stack>

        <Box mt={4} mb={2} display="flex" justifyContent="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{
              "& .MuiPaginationItem-previousNext": {
                color: "#000",
              },
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Answers;
