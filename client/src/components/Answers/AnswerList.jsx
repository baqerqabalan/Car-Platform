import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  CircularProgress,
  Container,
  Typography,
  ListItem,
  List,
  Pagination,
  Button,
  Avatar,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownAltIcon from "@mui/icons-material/ThumbDownAlt";
import {
  isAuthenticated,
  getUserIdFromToken,
  setAuthHeader,
} from "../../helpers/authHelper";

const AnswerList = () => {
  const { mode } = useContext(ThemeContext);

  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [vote, setVote] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const { questionId } = useParams();

  const handleAvatarClick = () => {};

  const navigate = useNavigate();

  const theme = useMemo(
    () => ({
      palette: {
        mode,
        primary: {
          main: mode === "dark" ? "#fff" : "#00008b",
        },
        background: {
          main: mode === "dark" ? "#2d2d2d" : "#f0f4f8",
        },
      },
    }),
    [mode]
  );

  const checkAuthentication = () => {
    if (isAuthenticated()) {
      return true;
    } else {
      navigate(`/login?redirect=/Questions/${questionId}`);
      return false;
    }
  };

  const handleVotingAction = async (answerId, type) => {
    if (checkAuthentication()) {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/v1/votings/addVote/${answerId}`,
          {
            voteType: type,
          },
          setAuthHeader()
        );

        if (response.status === 201) {
          setVote(response.data.voting);
          fetchAnswers(page); // Refresh answers after voting
        }
      } catch (error) {
        console.log(error);
        setError("Unable to Vote");
      }
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value); // Update page state when user changes page
  };

  const fetchAnswers = useCallback(
    async (pageNumber) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/v1/answers/getQuestionsInfo/${questionId}?page=${pageNumber}&limit=10`
        );

        if (response.status === 200) {
          const userId = getUserIdFromToken();

          const formattedAnswers = response.data.answerData.map((answer) => ({
            ...answer,
            createdAt: moment(answer.createdAt).format("DD-MM-YYYY HH:mm"),
            isAnswerer: answer.creatorId._id === userId,
          }));

          setAnswers(formattedAnswers);
          setTotalPages(response.data.totalPages);
          setPage(response.data.currentPage);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setError("Error Fetching Answers");
        setLoading(false);
      }
    },
    [questionId]
  );

  useEffect(() => {
    fetchAnswers(page);
  }, [fetchAnswers, page]);

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
      <Typography
        sx={{
          backgroundColor: "transparent",
          color: "#000",
          textAlign: "center",
          p: 2,
          borderRadius: 2,
          fontWeight: "bold",
        }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <Container sx={{ py: 2 }}>
      {answers.length ? (
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mx: "auto",
            maxWidth: "1200px",
            width: "100%",
          }}
        >
          {answers.map((answer, index) => (
            <ListItem key={answer._id} sx={{ p: 0 }}>
              <Box
                sx={{
                  width: "100%",
                  boxShadow: 3,
                  borderRadius: 3,
                  mb: 2,
                  p: 2,
                  border: "1px solid #ddd",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#2d2d2d" : "#f0f4f8",
                  transform: "scale(1.02)",
                  transition: "all 0.3s ease-in-out",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Avatar
                    src={
                      // Show profile image only if user is not posting as guest or they are the answerer
                      answer.creatorId.profileImg &&
                      answer?.postedAs !== "guest"
                        ? `http://localhost:5000/${answer.creatorId.profileImg}`
                        : undefined
                    }
                    alt={
                      // If postedAs is guest, show 'G', otherwise show the first letter of the name or 'U'
                      answer.postedAs === "guest"
                        ? "G"
                        : answer.creatorId.firstName
                        ? answer.creatorId.firstName[0]
                        : "U"
                    }
                    sx={{
                      bgcolor: !answer.creatorId.profileImg && "red",
                      cursor:
                        answer.postedAs === "name" ? "pointer" : "default",
                    }}
                    onClick={
                      answer.postedAs === "name"
                        ? () => handleAvatarClick()
                        : undefined
                    } // Fix the onClick handler
                    aria-label="recipe"
                  >
                    {
                      // If there's no profile image, show fallback initials or "G" for guests
                      !answer.creatorId.profileImg
                        ? answer.postedAs === "guest"
                          ? "G"
                          : answer.creatorId.firstName
                          ? answer.creatorId.firstName[0]
                          : "U"
                        : null
                    }
                  </Avatar>
                  <Typography sx={{ marginLeft: "10px" }}>
                    {
                      // Display "You" if the user is the answerer, otherwise show name or "Guest"
                      answer.isAnswerer
                        ? "You"
                        : answer.postedAs === "guest"
                        ? "Guest"
                        : `${answer.creatorId.firstName} ${answer.creatorId.lastName}` // Full name for other users
                    }
                  </Typography>
                </Box>
                <Box sx={{ paddingTop: "10px" }}>
                  <Typography
                    variant="body1"
                    component="div"
                    sx={{
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                      wordBreak: "break-word",
                    }}
                    dangerouslySetInnerHTML={{ __html: answer.content }}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.mode === "dark" ? "#fff" : "#000",
                    }}
                  >
                    Posted on: {answer.createdAt}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      onClick={() => handleVotingAction(answer._id, "upvote")}
                      sx={{
                        minWidth: "auto",
                        p: 1,
                        backgroundColor: "transparent",
                      }}
                    >
                      <ThumbUpIcon
                        sx={{
                          color:
                            answer.userVote === "upvote"
                              ? "green !important"
                              : theme.palette.primary.main,
                        }}
                      />
                    </Button>
                    <Typography variant="body2">{answer.upVotes}</Typography>
                    <Button
                      onClick={() => handleVotingAction(answer._id, "downvote")}
                      sx={{
                        minWidth: "auto",
                        p: 1,
                        backgroundColor: "transparent",
                      }}
                    >
                      <ThumbDownAltIcon
                        sx={{
                          color:
                            answer.userVote === "downvote"
                              ? "#cc0000"
                              : theme.palette.primary.main,
                        }}
                      />
                    </Button>
                    <Typography
                      variant="body2"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {answer.downVotes}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography
          sx={{
            textAlign: "center",
            backgroundColor: "transparent",
            color: theme.palette.primary.main,
          }}
        >
          No Answers Found
        </Typography>
      )}
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

export default AnswerList;
