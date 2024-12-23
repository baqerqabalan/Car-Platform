import React, { useContext, useMemo, useState, useEffect } from "react";
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TablePagination,
  ThemeProvider,
  createTheme,
  CircularProgress,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { ThemeContext } from "../../context/ThemeProviderComponent";
import axios from "axios";
import moment from "moment";
import SellerInfo from "./Dialogs/SellerInfo";
import BuyerInfo from "./Dialogs/BuyerInfo";
import Image from "./Dialogs/Image";
import ImageSliderDialog from "./Dialogs/SliderImage";

function Row({ index, row }) {
  const [open, setOpen] = React.useState(false);
  const [openSellerInfo, setOpenSellerInfo] = React.useState(false);
  const [openBuyerInfo, setOpenBuyerInfo] = React.useState(false);
  const [openImage, setOpenImage] = React.useState(false);
  const [openSliderImages, setOpenSliderImages] = React.useState(false);

  // Toggle expand/collapse state
  return (
    <>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{
              color: "#4CAF50", // Green color for expand icon
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{index + 1}</TableCell>
        <TableCell
          onClick={() => setOpenSellerInfo(true)}
          sx={{
            textDecoration: row?.seller?.firstName &&  "underline",
            color: "#00796b",
            cursor: row?.seller?.firstName && "pointer",
          }} // Teal color for clickable seller
        >
          {row?.seller?.firstName ? `${row.seller.firstName}` : `-`} {row?.seller?.lastName && `${row?.seller?.lastName}`}
          </TableCell>
        {openSellerInfo && row?.seller?._id && (
          <SellerInfo
            open={openSellerInfo}
            onClose={() => setOpenSellerInfo(false)}
            sellerId={row.seller._id}
          />
        )}
        <TableCell
          sx={{
            textDecoration: row?.buyer?.firstName && "underline",
            color: "#00796b",
            cursor: row?.buyer?.firstName && "pointer",
          }} // Teal color for clickable buyer
          onClick={() => {
            if (row?.buyer?._id) {
              setOpenBuyerInfo(true);
            }
          }}
        >
          {row?.buyer?.firstName ? `${row.buyer.firstName}` : `-`} {row?.buyer?.lastName && `${row?.buyer?.lastName}`}
        </TableCell>
        {openBuyerInfo && row?.buyer?._id && (
          <BuyerInfo
            open={openBuyerInfo}
            onClose={() => setOpenBuyerInfo(false)}
            buyerId={row?.buyer?._id}
          />
        )}
        <TableCell>{row.product.name}</TableCell>
        <TableCell>{row.product.category}</TableCell>
        <TableCell>${row.product.price}</TableCell>
        <TableCell>{row.product.status}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{ color: "#009688" }}
              >
                Details
              </Typography>
              <Table size="small" aria-label="details">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Image</TableCell>
                    <TableCell>Additional Images</TableCell>
                    <TableCell>Address</TableCell>
                    <TableCell>Auction Start Date</TableCell>
                    <TableCell>Auction End Date</TableCell>
                    <TableCell>Posted At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>{row.product.description}</TableCell>
                    <TableCell
                      onClick={() => setOpenImage(true)}
                      sx={{
                        textDecoration: "underline",
                        color: "#009688",
                        cursor: "pointer",
                      }}
                    >
                      View Image
                    </TableCell>
                    {openImage && (
                      <Image
                        open={openImage}
                        onClose={() => setOpenImage(false)}
                        image={row.product.image}
                        port={5000}
                      />
                    )}
                    {row?.product?.images.length !== 0 ? (
                      <>
                        <TableCell
                          onClick={() => setOpenSliderImages(true)}
                          sx={{
                            textDecoration: "underline",
                            color: "#009688",
                            cursor: "pointer",
                          }}
                        >
                          View Additional Images
                        </TableCell>
                        {openSliderImages && (
                          <ImageSliderDialog
                            open={openSliderImages}
                            onClose={() => setOpenSliderImages(false)}
                            images={row.product.images}
                          />
                        )}
                      </>
                    ) : (
                      <TableCell align="center">-</TableCell>
                    )}
                    <TableCell>{row.product.address}</TableCell>
                    <TableCell>{row.product.auctionStartDate}</TableCell>
                    <TableCell>{row.product.auctionEndDate}</TableCell>
                    <TableCell>{row.product.productCreatedAt}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Typography
                variant="h6"
                gutterBottom
                component="div"
                sx={{ mt: 2, color: "#009688" }}
              >
                Bidding History
              </Typography>
              <Table size="small" aria-label="history">
                <TableHead>
                  <TableRow>
                    <TableCell>Bidder Name</TableCell>
                    <TableCell>Bidding Amount</TableCell>
                    <TableCell>Bidding Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.bids.map((historyRow, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row">
                        {historyRow.bidderFullName}
                      </TableCell>
                      <TableCell>${historyRow.bidAmount}</TableCell>
                      <TableCell>{historyRow.bidCreatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default function CollapsibleTable({searchTerm, filterOption}) {
  const { mode } = useContext(ThemeContext);
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

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let query = `http://localhost:4000/api/v1/sales/getAuctionSales`;

        const params = new URLSearchParams();
        if (searchTerm) params.append("search", searchTerm);
        if (filterOption) params.append("filter", filterOption);
        params.append("rows", rowsPerPage);
        params.append("page", page + 1);

        const response = await axios.get(
          query,
          {
            params
          }
        );
        const formattedItems = response.data.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            productCreatedAt: moment(item.product.createdAt).format(
              "DD-MM-YYYY"
            ),
            auctionStartDate: moment(item.product.auction_start_date).format(
              "DD-MM-YYYY HH:mm:ss"
            ),
            auctionEndDate: moment(item.product.auction_end_date).format(
              "DD-MM-YYYY HH:mm:ss"
            ),
          },
          bids: item.bids.map((bid) => ({
            ...bid,
            bidCreatedAt: moment(bid.createdAt).format("DD-MM-YYYY HH:mm"),
          })),
        }));

        setRows(formattedItems);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [page, rowsPerPage, searchTerm, filterOption]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    <Box
      sx={{ backgroundColor: theme.palette.mode === "dark" ? "dark" : "white" }}
    >
      <CircularProgress />
    </Box>;
  }

  return (
    <ThemeProvider theme={theme}>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          overflow: "auto",
          boxShadow: 3,
          backgroundColor: mode === "light" ? "#ffffff" : "#1d1d1d",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress sx={{color: theme.palette.mode === "dark" ? "white" : "#000"}} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <Typography variant="h6" color="textSecondary">
              No matches found
            </Typography>
          </Box>
        ) : (
          <>
            <Table aria-label="collapsible table">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>ID</TableCell>
                  <TableCell>Seller Full Name</TableCell>
                  <TableCell>Buyer Full Name</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows
                  ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <Row key={index} index={index} row={row} />
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                mt: 2,
                ".MuiTablePagination-toolbar": { justifyContent: "center" },
                color: "#009688", // Text color for pagination
              }}
            />
          </>
        )}
      </TableContainer>
    </ThemeProvider>
  );
}
