import { Avatar, Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

const BuyerInfo = ({ open, onClose, buyerId }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buyer, setBuyer] = useState(null);

    const fetchBuyerInfo = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:4000/api/v1/sales/getBuyerInfo/${buyerId}`);
            const formattedData = {
                ...response.data,
                dob: moment(response.data.dob).format('DD-MM-YYYY')
            }
            setBuyer(formattedData);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setError("Failed to fetch the buyer information");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchBuyerInfo();
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
                <Typography variant="h6">Buyer Info</Typography>
                <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                    <Avatar
                        src={`http://localhost:5000/${buyer?.profileImg}` || null}
                        alt={buyer?.firstName?.[0]}
                        sx={{ width: 80, height: 80, mb: 2 }}
                    />
                    <Typography variant="body1"><strong>Full Name:</strong> {buyer?.firstName} {buyer?.lastName}</Typography>
                    <Typography variant="body1"><strong>Phone Number:</strong> {buyer?.phoneNumber}</Typography>
                    <Typography variant="body1"><strong>Email:</strong> {buyer?.email}</Typography>
                    <Typography variant="body1"><strong>Job:</strong> {buyer?.job}</Typography>
                    <Typography variant="body1"><strong>Date of Birth:</strong> {buyer?.dob}</Typography>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default BuyerInfo;