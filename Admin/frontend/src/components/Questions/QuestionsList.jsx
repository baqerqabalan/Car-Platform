import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Box,
  Button,
  createTheme,
  CssBaseline,
  ThemeProvider,
  Tooltip,
  Typography,
} from "@mui/material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import { HelpOutlineRounded } from "@mui/icons-material";
import moment from "moment";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import SellerInfo from "../Sales/Dialogs/SellerInfo";

const Header = () => {
  const { mode } = useContext(ThemeContext);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // Current page (0-indexed)
  const [pageSize, setPageSize] = useState(5); // Rows per page
  const [rowCount, setRowCount] = useState(0); // Total number of rows
  const tableRef = useRef();
  const navigate = useNavigate();
  const [openCreatorDialog, setOpenCreatorId] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:4000/api/v1/questions/getAllQuestions?page=${
            page + 1
          }&pageSize=${pageSize}`
        );
        const formattedData = response.data.questions.map(
          (question, index) => ({
            virtualId: page * pageSize + index + 1, // Calculate virtual ID
            id: question._id,
            questionContent: question.content,
            questionCreator: `${question.creatorId.firstName} ${question.creatorId.lastName}`, // Proper string interpolation
            creatorId: question.creatorId._id,
            questionCategory: question.category,
            questionCreatedAt: moment(question.createdAt).format("DD-MM-YYYY"),
            answerCount: question.answerCount || 0, // Ensure `answerCount` exists
          })
        );
        setRows(formattedData);
        setRowCount(response.data.total); // Update total row count
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [page, pageSize]); // Trigger fetch when page or pageSize changes

  // Define Columns
  const columns = [
    { field: "virtualId", headerName: "ID", flex: 0.5 },
    { field: "questionContent", headerName: "Question Content", flex: 2 },
    { field: "questionCategory", headerName: "Category", flex: 1 },
    {
      field: "questionCreator",
      headerName: "Creator",
      flex: 1,
      renderCell: (params) => (
        <>
          <Typography
            sx={{
              textDecoration: "underline",
              color: "#009688",
              cursor: "pointer",
              paddingTop: "10px",
            }}
            onClick={() => setOpenCreatorId(true)}
          >
            {params.value}
          </Typography>
          {openCreatorDialog && (
            <SellerInfo
              open={openCreatorDialog}
              onClose={() => setOpenCreatorId(false)}
              sellerId={params.row.creatorId}
            />
          )}
        </>
      ),
    },
    { field: "questionCreatedAt", headerName: "Posted At", flex: 1 },
    {
      field: "answers",
      headerName: "Answers",
      flex: 1,
      renderCell: (params) => (
        <Tooltip title="View Answers">
          <Badge
            badgeContent={params.row.answerCount}
            color="error"
            sx={{ marginRight: 1 }}
          >
            {params.row.answerCount !== 0 ?
            <Button
              variant="contained"
              sx={{backgroundColor:"#009688"}}
              onClick={() => handleViewAnswers(params.row)}
            >
              View
            </Button> : <Typography>No answers yet</Typography>}
          </Badge>
        </Tooltip>
      ),
    },
  ];

  // Handle View Details Action
  const handleViewAnswers = (row) => {
    navigate(`/answers/${row.id}`);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "80vh", width: "100%" }}>
        <Box
          sx={{
            width: "100%",
            m: 0,
            backgroundColor: "#1a1a2e",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h4" sx={{ p: 3, color: "white" }}>
            <HelpOutlineRounded /> Questions
          </Typography>
        </Box>
        <Box ref={tableRef}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server" // Enable server-side pagination
            page={page} // Controlled page state
            pageSize={pageSize} // Controlled pageSize state
            rowCount={rowCount} // Total rows from the server
            onPageChange={(newPage) => setPage(newPage)} // Update page state
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)} // Update pageSize state
            rowsPerPageOptions={[5, 10, 25]}
            disableSelectionOnClick
            sx={{
              backgroundColor: theme.palette.background.paper,
              boxShadow: 3,
              overflow: "auto",
              borderRadius: 2,
              ".MuiDataGrid-cell": { borderBottom: "1px solid #ccc" },
              ".MuiDataGrid-columnHeaders": {
                backgroundColor: "#f4f6f8",
                color: theme.palette.mode === "dark" ? "#fff" : "#333",
              },
            }}
          />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Header;
