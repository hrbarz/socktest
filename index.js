var express = require('express'),
    passport = require('passport'),
    config = require('./config/config'),
    mongoose = require('mongoose');

var db = mongoose.connect(config.db);

//require('./config/passport')(passport);


var app = express();

require('./config/express')(app, passport, db);




