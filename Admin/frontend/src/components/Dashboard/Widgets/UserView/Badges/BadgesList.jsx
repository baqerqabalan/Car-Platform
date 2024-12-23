import {
  Box,
  Button,
  CircularProgress,
  createTheme,
  CssBaseline,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useMemo, useState } from "react";
import Image from "../../../../Sales/Dialogs/Image";
import moment from "moment";
import axios from "axios";
import { ThemeContext } from "../../../../../context/ThemeProviderComponent";
import ViewEarnedBadgesDialog from "./ViewBadgesDialog";

const BadgesList = () => {
  const [users, setUsers] = useState([]);
  const [openImageDialogId, setOpenImageDialogId] = useState("");
  const [openBadgeDialogId, setOpenBadgeDialogId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { mode } = useContext(ThemeContext || localStorage.getItem("theme"));

  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const fetchBadges = async (page =1) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:4000/api/v1/badges/getAllUsers?page=${page}&limit=10`
      );
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.log("Error while fetching the users", error);
      setLoading(false);
      setError("Error Fetching Users");
    }
  };

  useEffect(() => {
    fetchBadges();
  }, [currentPage]);

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error" textAlign="center">
          {error} Please{" "}
          <Link onClick={() => fetchBadges()} sx={{ cursor: "pointer" }}>
            try again
          </Link>
          .
        </Typography>
      ) : (
        <>
        <TableContainer component={Paper} sx={{mt:2}}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date of Birth</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Profile Image</TableCell>
                <TableCell>Job</TableCell>
                <TableCell>Reputation Score</TableCell>
                <TableCell>Join Date</TableCell>
                <TableCell>Badges Earned</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {index+1}
                  </TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {moment(user?.dob).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell>{user?.phoneNumber}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => setOpenImageDialogId(user._id)}
                      sx={{ backgroundColor: "#009680", color: "white" }}
                    >
                      View Image
                    </Button>
                  </TableCell>
                  {openImageDialogId === user._id && (
                    <Image
                      open={openImageDialogId === user._id}
                      onClose={() => setOpenImageDialogId(null)}
                      image={user?.profileImg}
                      port={5000}
                    />
                  )}
                  <TableCell>{user?.job}</TableCell>
                  <TableCell sx={{textAlign:"center"}}>{user?.reputationScore}</TableCell>
                  <TableCell>
                    {moment(user?.joinDate).format("DD-MM-YYYY")}
                  </TableCell>
                  <TableCell>
                    {" "}
                    <Button
                      onClick={() => setOpenBadgeDialogId(user._id)}
                      sx={{ backgroundColor: "#009680", color: "white" }}
                    >
                      View Badges
                    </Button>
                  </TableCell>
                  {openBadgeDialogId === user._id && (
                    <ViewEarnedBadgesDialog
                      open={openBadgeDialogId === user._id}
                      onClose={() => setOpenBadgeDialogId(null)}
                      earnedBadges={user.earnedBadges}
                      user={user}
                    />
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          disabled={currentPage === 1}
          onClick={handlePrevious}
          sx={{ mx: 1 }}
        >
          Previous
        </Button>
        <Typography variant="body2" sx={{ mx: 2 }}>
          Page {currentPage} of {totalPages}
        </Typography>
        <Button
          disabled={currentPage === totalPages}
          onClick={handleNext}
          sx={{ mx: 1 }}
        >
          Next
        </Button>
      </Box>
      </>
      )}
    </ThemeProvider>
  );
};

export default BadgesList;
