import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Container,
    createTheme,
    List,
    ListItem,
    Pagination,
    Typography,
  } from "@mui/material";
  import axios from "axios";
  import moment from "moment";
  import React, { useContext, useEffect, useMemo, useState } from "react";
  import { ThemeContext } from "../../context/ThemeProviderComponent";
  
  const QuestionList = ({ selectedFilter, filterOptions }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1); // State for the current page
    const [totalPages, setTotalPages] = useState(1); // Total number of pages
    const questionsPerPage = 10; // Number of questions per page
    const { mode } = useContext(ThemeContext);
  
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  
    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          setLoading(true);
    
          // Build the query string with optional sorting
          let query = `http://localhost:5000/api/v1/questions?filter=${selectedFilter}&page=${page}&limit=${questionsPerPage}`;
          
          if (filterOptions.sortBy) {
            query += `&sort=${filterOptions.sortBy}`; // Append sort if it's provided
          }
          
          if(filterOptions.unansweredOnly){
            query += `&unansweredOnly=true`; 
          }

          if(filterOptions.unvotedOnly){
            query += `&unvotedOnly=true`; 
          }

          if(filterOptions.searchQuery){
            query +=`&search=${filterOptions.searchQuery}`;
          }
          
          const { data } = await axios.get(query);
    
          // Format 'createdAt' for each question
          const formattedQuestions = data.data.map((question) => ({
            ...question,
            createdAt: moment(question.createdAt).format("DD-MM-YYYY HH:mm"),
          }));
    
          setQuestions(formattedQuestions);
    
          // Assuming the API response includes total pages (e.g., data.totalPages)
          setTotalPages(data.totalPages);  // Use the totalPages from the response
    
          setLoading(false);
        } catch (error) {
          console.log(error);
          setError("No Questions Found");
          setLoading(false);
        }
      };
    
      fetchQuestions();
    }, [selectedFilter, filterOptions, page]);
    
    const handlePageChange = (event, value) => {
      setPage(value); // Update the page state when the user changes the page
    };
  
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
      <Container sx={{ py: 4 }}>
        {questions.length > 0 ? (
        <List
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3,
            mx: "auto",
            maxWidth: "1200px",
          }}
        >
          {questions.map((question) => (
            <ListItem key={question._id} sx={{ p: 0 }}>
              <Card
                sx={{
                  width: "100%",
                  boxShadow: 3,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#2d2d2d" : "#f0f4f8",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.03)",
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    gap: 2,
                    p: 3,
                  }}
                >
                  {/* Left Side: Votes and Answers */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      color:
                        theme.palette.mode === "dark" ? "#fff" : "text.secondary",
                    }}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {question.voteCounts}
                    </Typography>
                    <Typography variant="caption">Votes</Typography>
  
                    <Typography variant="body1" fontWeight="bold">
                      {question.answerCounts}
                    </Typography>
                    <Typography variant="caption">Answers</Typography>
                  </Box>
  
                  {/* Right Side: Question Content and Date */}
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      component="a"
                      href={`/Questions/${question._id}`}
                      sx={{
                        textDecoration: "none",
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                        cursor: "pointer",
                      }}
                    >
                      {question.content.trimEnd()}
                      {question.content.slice(-1) !== "?" ? "?" : ""}
                    </Typography>
  
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        textAlign: "right",
                        color:
                          theme.palette.mode === "dark" ? "#fff" : "text.secondary",
                        fontStyle: "italic",
                      }}
                    >
                      {question.createdAt}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
        ) : (
            <Typography sx={{ backgroundColor :"transparent", color: theme.palette.mode === "dark" ? "#fff" : "#000" , textAlign:"center"}}>
                No {selectedFilter} Questions Found
            </Typography>
        )}
        {/* Pagination Component */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages} // Total number of pages
            page={page} // Current page
            onChange={handlePageChange} // Page change handler
            color="primary"
          />
        </Box>
      </Container>
    );
  };
  
  export default QuestionList;  