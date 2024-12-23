import { Avatar, Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

const SellerInfo = ({ open, onClose, sellerId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [seller, setSeller] = useState(null);

    const fetchSellerInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/v1/sales/getSellerInfo/${sellerId}`);
            const formattedData = {
                ...response.data,
                dob: moment(response.data.dob).format('DD-MM-YYYY')
            }
            setSeller(formattedData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch the seller information");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchSellerInfo();
        }
    }, [open]);

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogContent>
                    <Typography variant="h6" color="error" align="center" p={2}>
                        {error}
                    </Typography>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">User Info</Typography>
                <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    <Avatar
                        src={`http://localhost:5000/${seller?.profileImg}` || null}
                        alt={seller?.firstName?.[0]}
                        sx={{ width: 80, height: 80, mb: 2 }}
                    />
                    <Typography variant="body1"><strong>Full Name:</strong> {seller?.firstName} {seller?.lastName}</Typography>
                    <Typography variant="body1"><strong>Phone Number:</strong> {seller?.phoneNumber}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {seller?.email}</Typography>
                    <Typography variant="body1"><strong>Job:</strong> {seller?.job}</Typography>
                    <Typography variant="body1"><strong>Date of Birth:</strong> {seller?.dob}</Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default SellerInfo;