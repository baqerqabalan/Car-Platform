import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Avatar,
  Pagination,
  CircularProgress,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";
import axios from "axios";
import moment from "moment";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../helpers/authHelper";

const ProposalList = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { mode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchProposals = async (currentPage = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/v1/subscriptions/getProposals`,
        {
          params: { page: currentPage, limit: 3 },
        }
      );

      if (response.status === 200) {
        const proposalsWithUserData = response.data.proposals.map(
          (proposal) => {
            const user = response.data.users.find(
              (u) => u._id === proposal.requestedClientId
            );
            return {
              ...proposal,
              user: user
                ? {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    profileImg: user.profileImg,
                  }
                : {},
              createdProposalDateAt: moment(proposal.createdAt).format(
                "YYYY/MM/DD"
              ),
            };
          }
        );

        setProposals(proposalsWithUserData);
        setTotalPages(Math.ceil(response.data.totalProposals / 3)); // Calculate total pages based on total proposals
      } else {
        setError("Error fetching proposals");
      }
    } catch (error) {
      console.log(error);
      setError("Error fetching the proposals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals(page);
  }, [page]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const cardStyles = {
    marginBottom: "16px",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {loading ? (
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
        ) : error ? (
          <Typography variant="h6" align="center" color="error">
            {error}
          </Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {proposals.map((proposal, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={cardStyles}>
                    <CardContent>
                      <Box display="flex" alignItems="center" mb={2}>
                        <Avatar
                          onClick={() =>
                            navigate(`/Profile/${proposal.user._id}`)
                          }
                          src={
                            proposal.user.profileImg
                              ? `http://localhost:5000/${proposal.user.profileImg}`
                              : undefined
                          }
                          alt={
                            proposal.user.profileImg
                              ? proposal.user.firstName[0]
                              : "U"
                          }
                          sx={{
                            bgcolor: !proposal.user.profileImg
                              ? "red"
                              : "transparent",
                            cursor: "pointer",
                            width: 56,
                            height: 56,
                            mr: 2,
                          }}
                        />
                        <Typography variant="subtitle1" fontWeight="bold">
                          {proposal.user.firstName} {proposal.user.lastName}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "600",
                          mb: 1,
                          background:
                            "linear-gradient(90deg, #3f51b5, #4caf50)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {proposal.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mb: 2 }}
                      >
                        {proposal.description}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Date: {proposal.createdProposalDateAt}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          const redirectPath = `/Mechanic%20Proposals/Proposal/${encodeURIComponent(
                            proposal._id
                          )}`;
                          if (isAuthenticated()) {
                            navigate(redirectPath);
                          } else {
                            navigate(`/login?redirect=${redirectPath}`);
                          }
                        }}
                        sx={{
                          backgroundColor: "#3f51b5",
                          borderRadius: "20px",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "#303f9f",
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Box mt={4} mb={2} display="flex" justifyContent="center">
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-previousNext": {
                    color: theme.palette.mode === "dark" ? "#fff" : "#000",
                  },
                }}
              />
            </Box>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default ProposalList;
