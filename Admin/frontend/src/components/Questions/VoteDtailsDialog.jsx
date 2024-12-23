import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Slide,
  Typography,
  Box,
  CircularProgress,
  Link,
  Avatar,
  Pagination,
  Divider,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import SellerInfo from "../Sales/Dialogs/SellerInfo";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import moment from "moment";
import { setAuthHeader } from "../../helpers/authHelper";

const SlideTransition = React.forwardRef((props, ref) => (
  <Slide direction="left" ref={ref} {...props} />
));

const ITEMS_PER_PAGE = 20;

const VoteDetailsDialog = ({ open, onClose, answerId }) => {
  const mode = useContext(ThemeContext || localStorage.getItem('theme'));
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [upvoters, setUpVoters] = useState([]);
  const [downvoters, setDownVoters] = useState([]);
  const [answer, setAnswer] = useState(null);
  const [openUserDialogId, setOpenUserDialogId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUpvotes, setTotalUpvotes] = useState(0);
  const [totalDownvotes, setTotalDownvotes] = useState(0);

  const fetchVotings = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:4000/api/v1/questions/getAllVotings/${answerId}?page=${page}&limit=${ITEMS_PER_PAGE}`,
          setAuthHeader()
        );
        setUpVoters(response.data.upvoters);
        setDownVoters(response.data.downvoters);
        setTotalUpvotes(response.data.totalUpvotes);
        setTotalDownvotes(response.data.totalDownvotes);
        setAnswer(response.data.answer);
        setError(null);
      } catch (error) {
        setError("Error fetching the voters");
      } finally {
        setLoading(false);
      }
    },
    [answerId]
  );

  useEffect(() => {
    fetchVotings(currentPage);
  }, [fetchVotings, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={SlideTransition}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            borderRadius: "16px 0 0 16px",
            boxShadow: theme.shadows[5],
            bgcolor: theme.palette.background.paper,
            color: theme.palette.text.primary,
          },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Vote Details</Typography>
            <IconButton
              onClick={onClose}
              sx={{ color: theme.palette.text.primary }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography
            variant="body2"
            sx={{ color: theme.palette.text.secondary, wordBreak:"break-word" }}
            dangerouslySetInnerHTML={{ __html: answer}}
          />
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box textAlign="center">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" textAlign="center">
              {error}{" "}
              <Link onClick={() => fetchVotings()}>Please try again</Link>
            </Typography>
          ) : (
            <>
              <Grid container spacing={2} alignItems="stretch">
                {/* Upvoters Section */}
                <Grid item xs={5}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Upvoters:</strong>
                  </Typography>
                  <Divider sx={{ mb: 1, width:"50%"  }} />
                  {upvoters.length === 0 ? (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      No UpVoters Yet
                    </Typography>
                  ) : (
                    <List>
                      {upvoters.map((user) => (
                        <ListItem key={user.id}>
                          <Avatar
                            src={`http://localhost:5000/${user.voterUserId.profileImg}`}
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                            sx={{ mr: 1, cursor:"pointer"}}
                            onClick={() => setOpenUserDialogId(user.voterUserId._id)}
                          />
                          <ListItemText
                            primary={
                              <>
                                {`${user.voterUserId.firstName} ${user.voterUserId.lastName}`}{" "}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 1 }}
                                >
                                  {moment(user.createdAt).format(
                                    "DD-MM-YYYY HH:mm:ss"
                                  )}
                                </Typography>
                              </>
                            }
                          />
                          {openUserDialogId === user.voterUserId._id && (
                            <SellerInfo
                              open={openUserDialogId === user.voterUserId._id}
                              onClose={() => setOpenUserDialogId(null)}
                              sellerId={user.voterUserId._id}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                {/* Downvoters Section */}
                <Grid item xs={5}>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Downvoters:</strong>
                  </Typography>
                  <Divider sx={{ mb: 1, width:"50%" }} />
                  {downvoters.length === 0 ? (
                    <Typography
                      sx={{
                        textAlign: "center",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      No DownVoters Yet
                    </Typography>
                  ) : (
                    <List>
                      {downvoters.map((user) => (
                        <ListItem key={user.id}>
                          <Avatar
                            src={`http://localhost:5000/${user.voterUserId.profileImg}`}
                            onError={(e) =>
                              (e.target.src = "/default-avatar.png")
                            }
                            sx={{ mr: 1, cursor:"pointer" }}
                            onClick={() => setOpenUserDialogId(user.voterUserId._id)}
                          />
                          <ListItemText
                            primary={
                              <>
                                {" "}
                                {`${user.voterUserId.firstName} ${user.voterUserId.lastName}`}{" "}
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{ ml: 1 }}
                                >
                                  {moment(user.createdAt).format(
                                    "DD-MM-YYYY HH:mm:ss"
                                  )}
                                </Typography>
                              </>
                            }
                          />
                          {openUserDialogId && (
                            <SellerInfo
                              open={openUserDialogId === user.voterUserId._id}
                              onClose={() => setOpenUserDialogId(null)}
                              sellerId={user.voterUserId._id}
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Grid>
              </Grid>
              {/* Pagination */}
              <Box mt={3} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(
                    Math.max(totalUpvotes, totalDownvotes) / ITEMS_PER_PAGE
                  )}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="secondary"
                />
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ThemeProvider>
  );
};

export default VoteDetailsDialog;
