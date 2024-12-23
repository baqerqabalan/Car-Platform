import {
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import axios from "axios";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";

const dummyQuestions = [
  {
    question: "Why is my car engine overheating?",
    category: "Engine",
    topAnswer:
      "Your car might be low on coolant or have a faulty radiator. Check the cooling system.",
    topAnswerVotes: 15,
    answerCount: 6,
  },
  {
    question: "What should I do if my car won't start?",
    category: "Electrical",
    topAnswer:
      "Check the battery and starter. A weak battery or a bad alternator could be the issue.",
    topAnswerVotes: 12,
    answerCount: 4,
  },
  {
    question: "Why do my brakes squeal when I stop?",
    category: "Brakes",
    topAnswer:
      "Squealing brakes usually indicate worn brake pads or glazing on the rotors. Get them inspected.",
    topAnswerVotes: 9,
    answerCount: 3,
  },
];

function FAQ() {
  const [topQuestions, setTopQuestions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Initially set to true to show loading spinner.

  useEffect(() => {
    const fetchTopAnsweredQuestions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/questions/getTopAnsweredQuestions"
        ); // Adjust the URL as needed
        setTopQuestions(response.data); // Safely access the data property
      } catch (err) {
        console.error("Error fetching top answered questions:", err);
        setError("Failed to fetch questions. Showing fallback data.");
        setTopQuestions(dummyQuestions); // Fallback to dummy data on error
      } finally {
        setLoading(false);
      }
    };

    fetchTopAnsweredQuestions();
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
    <Grid container spacing={2} sx={{ backgroundColor: "#00008b", padding: 3 }}>
      <Grid item xs={12}>
        <Typography variant="h4" className="title" gutterBottom color="white">
          Popular Questions
        </Typography>
      </Grid>

      {error ? (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      ) : null}

      {(topQuestions.length > 0 ? topQuestions : dummyQuestions).map(
        (question, index) => (
          <Grid
            key={index}
            item
            xs={12}
            sm={8}
            sx={{ marginBottom: 2, mx: "auto" }}
          >
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography variant="subtitle1">{question.question}</Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "auto",
                  }}
                >
                  <QuestionAnswerIcon sx={{ marginRight: 1 }} />
                  <Typography variant="body2">
                    {question.answerCount}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  dangerouslySetInnerHTML={{ __html: question.topAnswer }}
                />
                <Box
                  sx={{ display: "flex", alignItems: "center", marginTop: 1 }}
                >
                  <ThumbUpIcon sx={{ marginRight: 1 }} />
                  <Typography variant="body2">
                    {question.topAnswerVotes}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )
      )}
    </Grid>
  );
}

export default FAQ;
