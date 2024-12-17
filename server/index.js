const express = require('express');
const cors = require('cors');
const app = express();
const DB = require('./database').connectDB;


require('dotenv').config();
DB();

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Set up routes
const userRouter = require('./routers/userRouter');
const questionRouter = require('./routers/questionRouter');
const answerRouter = require('./routers/answerRouter');
const votingsRouter = require('./routers/votingsRouter');
const productRouter = require('./routers/productRouter');
const auctionRouter = require('./routers/auctionRouter');
const salesRouter = require('./routers/salesRouter');
const subscriptionRouter = require('./routers/subscriptionPackageRouter');
const requestSubscriptionRouter = require('./routers/requestSubscriptionRouter');
const contactRouter = require('./routers/contactRouter');
const advertisementRouter = require('./routers/advertisementRouter');

// Example of more organized routes
app.use(`/api/${process.env.API_VERSION}/auth/`, userRouter);
app.use(`/api/${process.env.API_VERSION}/questions/`, questionRouter);
app.use(`/api/${process.env.API_VERSION}/answers/`, answerRouter);
app.use(`/api/${process.env.API_VERSION}/votings/`, votingsRouter);
app.use(`/api/${process.env.API_VERSION}/products/`, productRouter);
app.use(`/api/${process.env.API_VERSION}/auctions/`, auctionRouter);
app.use(`/api/${process.env.API_VERSION}/sales/`, salesRouter);
app.use(`/api/${process.env.API_VERSION}/subscriptions/`, subscriptionRouter);
app.use(`/api/${process.env.API_VERSION}/subscriptions/`, requestSubscriptionRouter);
app.use(`/api/${process.env.API_VERSION}/contacts/`, contactRouter);
app.use(`/api/${process.env.API_VERSION}/advertisements/`, advertisementRouter);

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
