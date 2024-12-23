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
  CardContent,
  Typography,
  Avatar,
  Grid,
  Box,
  Button,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import Image from "../Sales/Dialogs/Image";
import SliderImage from "../Sales/Dialogs/SliderImage";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import axios from "axios";
import ApprovedStatusDialog from "./ApprovedStatusDialog";

const ProposalCards = ({ tabValue }) => {
  const { mode } = useContext(ThemeContext);
  const [openImageDialogId, setOpenImageDialogId] = useState("");
  const [openSliderImageDialogId, setOpenSliderImageDialogId] = useState("");
  const [openRecieptDialogId, setOpenRecieptDialogId] = useState("");
  const [openUserInfo, setOpenUserInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [proposalId, setProposalId] = useState("");
  const [status, setStatus] = useState(null);

  // Theme settings
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#1a1a2e" },
          background: { default: mode === "light" ? "#f4f6f8" : "#121212" },
        },
      }),
    [mode]
  );

  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/proposals/getProposals`,
        {
          params: {
            tabValue: tabValue,
            page: page, // Use the current page instead of totalPages
            limit: 3, // Fetch 3 proposals per page
          },
        }
      );

      setProposals(response.data.proposals);
      setTotalPages(response.data.totalPages); // Set the total pages
      setLoading(false);
    } catch (error) {
      console.log("Error fetching proposals:", error);
      setError("Failed fetching the proposals");
      setLoading(false);
    }
  }, [tabValue, page]); // Make sure the dependency is `page`

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handlePageChange = (event, value) => {
    setPage(value); // Update the page when the user changes the page
  };

  const handleUpload = (file) => {
    setUploadedImage(file); // Store the uploaded image file
  };

  const handleChangeStatus = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("proposalId", proposalId);
      formData.append("status", status);
      if (uploadedImage) formData.append("recieptImg", uploadedImage); // Attach the image file

      await axios.patch(
        `http://localhost:4000/api/v1/proposals/updateProposal`,
        formData, 
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      setError(null);
      window.location.reload();

    } catch (error) {
      console.log(error);
      setError("Failed to update the status");
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : proposals.length === 0 ? (
          <Typography color="secondary">No Proposals Available</Typography>
        ) : (
          <>
            <Grid container spacing={3}>
              {proposals.map((proposal, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      bgcolor: mode === "light" ? "#fff" : "#1e1e2e",
                      boxShadow: 3,
                      borderRadius: 2,
                    }}
                  >
                    <CardContent>
                      {/* Mechanic Avatar and Info */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 2 }}
                      >
                        <Avatar
                          src={`http://localhost:5000/${proposal.user.profileImg}`}
                          alt={`${proposal.user.firstName} ${proposal.user.lastName}`}
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            cursor: "pointer",
                          }}
                          onClick={() => setOpenUserInfo(true)}
                        />
                        {openUserInfo && (
                          <SellerInfo
                            open={openUserInfo}
                            onClose={() => setOpenUserInfo(false)}
                            sellerId={proposal.user._id}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#009688" }}
                          >
                            {proposal.user.firstName} {proposal.user.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {proposal.proposal.marketName}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Proposal Title */}
                      <Typography variant="h6" gutterBottom>
                        {proposal.proposal.title}
                      </Typography>

                      {/* Proposal Description */}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {proposal.proposal.description}
                      </Typography>

                      {/* Location and Skills */}
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Location:</strong> {proposal.proposal.location}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Subscribed Package:</strong>{" "}
                        {proposal.subscriptionPackage.title}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Experience:</strong>{" "}
                        {proposal.proposal.experience} years
                      </Typography>
                      {proposal?.proposal?.skills && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Skills:</strong> {proposal.proposal.skills}
                        </Typography>
                      )}

                      {/* Contact Information */}
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Email:</strong> {proposal.proposal.email}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Phone:</strong> {proposal.proposal.phoneNumber}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        {proposal?.proposal?.image && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                mx: 1,
                                textAlign: "center",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#009688",
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#00796b",
                                },
                              }}
                              onClick={() => setOpenImageDialogId(proposal.proposal._id)}
                            >
                              <strong>View Poster</strong>
                            </Typography>
                            {openImageDialogId === proposal.proposal._id && (
                              <Image
                                open={openImageDialogId === proposal.proposal._id}
                                onClose={() => setOpenImageDialogId(null)}
                                image={proposal.proposal.image}
                                port={5000}
                              />
                            )}
                          </>
                        )}

                        {proposal?.proposal?.additionalImages.length > 0 && (
                          <>
                            <Typography
                              variant="body2"
                              sx={{
                                mb: 1,
                                mx: 1,
                                textAlign: "center",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#009688",
                                borderRadius: "5px",
                                cursor: "pointer",
                                "&:hover": {
                                  backgroundColor: "#00796b",
                                },
                              }}
                              onClick={() => setOpenSliderImageDialogId(proposal.proposal._id)}
                            >
                              <strong>View Work Images</strong>
                            </Typography>
                            {openSliderImageDialogId === proposal.proposal._id && (
                              <SliderImage
                              open={
                                openSliderImageDialogId ===
                                proposal.proposal._id
                              }
                                onClose={() => setOpenSliderImageDialogId(null)}
                                images={proposal.proposal.additionalImages}
                              />
                            )}{" "}
                          </>
                        )}
                        {tabValue === 0 && (
                          <>
                            {proposal?.proposal?.recieptImg && (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    mb: 1,
                                    mx: 1,
                                    textAlign: "center",
                                    padding: "5px",
                                    color: "#fff",
                                    backgroundColor: "#009688",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                    "&:hover": {
                                      backgroundColor: "#00796b",
                                    },
                                  }}
                                  onClick={() => setOpenRecieptDialogId(proposal.proposal._id)}>
                                  <strong>View Reciept</strong>
                                </Typography>
                                {openRecieptDialogId ===
                                  proposal.proposal._id && (
                                  <Image
                                    open={
                                      openRecieptDialogId ===
                                      proposal.proposal._id
                                    }
                                    onClose={() => setOpenRecieptDialogId(null)} // Close dialog
                                    image={proposal.proposal.recieptImg}
                                    port={4000}
                                  />
                                )}{" "}
                              </>
                            )}
                          </>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      {tabValue === 2 ? (
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "right",
                          }}
                        >
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setProposalId(proposal.proposal._id);
                              setStatus("approved");
                              setOpenStatusDialog(true);
                            }}
                            sx={{ marginRight: 1, backgroundColor: "#009688" }}
                          >
                            Approve
                          </Button>
                          {openStatusDialog && (
                            <ApprovedStatusDialog
                              open={openStatusDialog}
                              onClose={() => setOpenStatusDialog(false)}
                              onUpload={handleUpload}
                              onSubmit={handleChangeStatus}
                            />
                          )}
                          <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={() =>
                              handleChangeStatus(
                                proposal.proposal._id,
                                "disapproved"
                              )
                            }
                          >
                            Disapprove
                          </Button>
                        </Box>
                      ) : null}
                    </CardContent>
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
      </Box>
    </ThemeProvider>
  );
};

export default ProposalCards;
