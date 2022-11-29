//imports from libraries
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const createError = require('http-errors');
const { unless } = require("express-unless")

//imports from your files and your implementation
const router = require("./routes/users.routes.js"); 
const dbConfig = require('./config/db.config'); //your database controller
const auth = require('./middleware/auth');
const errors = require('./middleware/errors');
const cors = require("cors");

//your express controllers is called app for this project
const app = express();

//added by Shaheer Ahmed
app.use(
    cors({
        origin: "*"
    })
)

//done so that you can use mongoose in all files
//using mongoose
mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.db,{
    useNewUrlParser: true, // fallback to old parser in case of error
    useUnifiedTopology: true // checks status of connection so as to not miss responses
}).then (
    () => {
        console.log('Database succesfully connected Alhumdulilah');
    },
    (error) => {
        console.log('Database cannot be connected' + error);
    }
);

auth.authenticateToken.unless = unless;

//users need to be able to access login & register page
//without the need of a token
app.use(
    auth.authenticateToken.unless({
        path: [
            {url: "/users/register", methods: ["POST"]},
            {url: "/users/login", methods: ["POST"]},
        ],
    })
);
//method used to recognise to identify incoming objects as json objects
app.use(express.json()); 

//defining the route
app.use("/users", router); //app.use("/users", require("./npmroutes/users.routes"));
app.use(errors.errorHandler);
require('dotenv').config();

//define your port
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => 
{
    console.log(`Server is sucessfully running on ${PORT}`)
});