import { Inventory, People, QuestionAnswer, ShoppingCart } from '@mui/icons-material';
import {  Box, Grid, Paper, styled, Typography } from '@mui/material'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

// Styled Paper component for widgets
const Widget = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    height: '100%',
  }));

const Cards = () => {
    const [usersCount, setUsersCount] = useState(0);
    const [questionsCount, setQuestionsCount] = useState(0);
    const [salesCount, setSalesCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);

    const fetchProductsCount = async() => {
        try{
            const response = await axios.get('http://localhost:4000/api/v1/main/getTotalProducts');
            setProductsCount(response.data.total);
        }catch(error){
            console.log(error);
        }
    };

    const fetchQuestionCount = async() => {
        try{
            const response = await axios.get('http://localhost:4000/api/v1/main/getTotalQuestions');
            setQuestionsCount(response.data.total);
        }catch(error){
            console.log(error);
        }
    };

    const fetchSalesCount = async() => {
        try{
            const response = await axios.get('http://localhost:4000/api/v1/main/getTotalSales');
            setSalesCount(response.data.total);
        }catch(error){
            console.log(error);
        }
    };

    const fetchUsersCount = async() => {
        try{
            const response = await axios.get('http://localhost:4000/api/v1/main/getTotalUsers');
            setUsersCount(response.data.total);
        }catch(error){
            console.log(error);
        }
    };

    useEffect(() => {
        fetchProductsCount();
        fetchQuestionCount();
        fetchSalesCount();
        fetchUsersCount();
    },[]);

  return (
    <>
    <Grid item xs={12} md={3}>
      <Widget>
        <Box display="flex" alignItems="center">
          <People fontSize="large" color="primary" />
          <Box ml={2}>
            <Typography variant="h6" fontWeight="bold">Users</Typography>
            <Typography variant="body2" color="text.secondary">Logged-in: {usersCount} user</Typography>
          </Box>
        </Box>
      </Widget>
    </Grid>
    <Grid item xs={12} md={3}>
      <Widget>
        <Box display="flex" alignItems="center">
          <QuestionAnswer fontSize="large" color="secondary" />
          <Box ml={2}>
            <Typography variant="h6" fontWeight="bold">Questions</Typography>
            <Typography variant="body2" color="text.secondary">{questionsCount} question</Typography>
          </Box>
        </Box>
      </Widget>
    </Grid>
    <Grid item xs={12} md={3}>
      <Widget>
        <Box display="flex" alignItems="center">
          <ShoppingCart fontSize="large" color="success" />
          <Box ml={2}>
            <Typography variant="h6" fontWeight="bold">Sales</Typography>
            <Typography variant="body2" color="text.secondary">{salesCount} sale</Typography>
          </Box>
        </Box>
      </Widget>
    </Grid>
    <Grid item xs={12} md={3}>
      <Widget>
        <Box display="flex" alignItems="center">
          <Inventory fontSize="large" color="error" />
          <Box ml={2}>
            <Typography variant="h6" fontWeight="bold">Products</Typography>
            <Typography variant="body2" color="text.secondary">{productsCount} product</Typography>
          </Box>
        </Box>
      </Widget>
    </Grid>
    </>
  )
}

export default Cards
