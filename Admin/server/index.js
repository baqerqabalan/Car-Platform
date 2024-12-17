const express = require('express');
const cors = require('cors');
const path=require('path');
const app = express();
const DB = require('../../server/database').connectDB;



require('dotenv').config();
DB();

app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../../server/uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up routes
const userRouter = require('./Routes/userRouter');
const salesRouter = require('./Routes/salesRouter');
const proposalsRouter = require('./Routes/proposalsRouter');
const subscriptionRouter = require('./Routes/subscriptionPackageRouter');
const questionRouter = require('./Routes/questionRouter');
const advertisementRouter = require('./Routes/advertisementRouter');
const contactRouter = require('./Routes/messagesRouter');
const cardsRouter = require('./Routes/cardsRouter');
const badgesRouter = require('./Routes/badgesRouter');
const activityRouter = require('./Routes/recentActivityRouter');
const userActivityRouter = require('./Routes/chartRouter');


// Example of more organized routes
app.use(`/api/${process.env.API_VERSION}/auth/`, userRouter);
app.use(`/api/${process.env.API_VERSION}/questions/`, questionRouter);
app.use(`/api/${process.env.API_VERSION}/activities/`, activityRouter);
app.use(`/api/${process.env.API_VERSION}/user-activity/`,userActivityRouter );
app.use(`/api/${process.env.API_VERSION}/badges/`, badgesRouter);
app.use(`/api/${process.env.API_VERSION}/main/`, cardsRouter);
app.use(`/api/${process.env.API_VERSION}/advertisements/`, advertisementRouter);
app.use(`/api/${process.env.API_VERSION}/sales/`, salesRouter);
app.use(`/api/${process.env.API_VERSION}/proposals/`, proposalsRouter);
app.use(`/api/${process.env.API_VERSION}/packages/`, subscriptionRouter);
app.use(`/api/${process.env.API_VERSION}/messages/`, contactRouter);

app.listen(4000, () => {
    console.log("Server is running on port 4000");
});
