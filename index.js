"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const config = require('./config/database');
const mongoose = require('mongoose');

//Connect to database
var database = ""
if (config.environment == "PROD") {
    database = config.ProdDB;
} else {
    database = config.TestDB;
}

mongoose.connect(database);

mongoose.connection.on('connected', function(){
    console.log('Connected to database' + database);
});

mongoose.connection.on('error', function(err){
    console.log('Database error:' + err);
});


const app = express();

var users = require('./routes/users');

// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use('/users', users);

// create a path to our install package
app.get('/downloadFile/install', (req, res) => {
    res.download('./downloadFile/app.apk');
});

app.get('/test', (req, res) => {
    res.send('hello world');
})

app.listen(8080, () => {
    console.log('listening to port 8080');
});
