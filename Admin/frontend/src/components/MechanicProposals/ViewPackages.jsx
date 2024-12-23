import React, { useState, useEffect } from "react";
import PackagesView from "./Packages";
import axios from "axios";
import { Container, Button, Box, Pagination } from "@mui/material";
import { Add, ArrowCircleLeft } from "@mui/icons-material";
import PackagesDialog from './PackagesDialog';

const ViewPackages = () => {
  const [packages, setPackages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const itemsPerPage = 6;

  const fetchPackages = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/v1/packages/getAllPackages"
      );
      setPackages(data.packages);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPackages = packages.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Container
      maxWidth="lg"
      sx={{
        padding: "20px",
        backgroundColor: "#f7f9fc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
      }}
    >
      {/* Header Section */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        sx={{
          backgroundColor: "#e3e4e6",
          padding: "10px 15px",
          borderRadius: "6px",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.history.back()}
          startIcon={<ArrowCircleLeft />}
          sx={{
            backgroundColor: "#3f51b5",
            "&:hover": {
              backgroundColor: "#303f9f",
            },
          }}
        >
          Back
        </Button>
        <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                bgcolor: "#009688", // Set button background to match the indicator
                color: "#fff",
                "&:hover": { bgcolor: "#007b6b" }, // Slightly darker shade for hover
                fontWeight: "bold",
                mb: 1,
                ml: 5,
              }}
              onClick={() => setOpenPackageDialog(true)}
            >
              Add Subscription Package
            </Button>
            {openPackageDialog && (
              <PackagesDialog
                open={openPackageDialog}
                reload={fetchPackages}
                onClose={() => setOpenPackageDialog(false)}
              />
            )}
        <Pagination
          count={Math.ceil(packages.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{
            ".MuiPaginationItem-root": {
              fontWeight: "bold",
            },
          }}
        />
      </Box>

      {/* Packages View */}
      <PackagesView
        packages={currentPackages}
        onUpdate={fetchPackages}
        onDelete={fetchPackages}
      />

      {/* Footer Pagination */}
      <Box mt={3} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(packages.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          sx={{
            ".MuiPaginationItem-root": {
              fontWeight: "bold",
            },
          }}
        />
      </Box>
    </Container>
  );
};

export default ViewPackages;