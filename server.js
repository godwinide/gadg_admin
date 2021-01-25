const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
const expressLayout = require("express-ejs-layouts");
const flash = require('connect-flash');
const session = require('express-session');
const passport = require("passport")
const cors = require("cors")

// Dotenv
require('dotenv').config();
// mongodb
require("./config/db");
// Passport Config
require('./config/passport')(passport);


// config
app.set("view engine", "ejs");
app.use(expressLayout);

// middlewares
app.use(express.static("./public"))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/',
    limits: { fileSize: 5 * 1024 * 1024 * 1024 },
}));

app.use(flash());

// Express session
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );
  // Passport middleware
  app.use(passport.initialize());
  app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});


//ROUTES
require("./routes")(app);

const PORT = process.env.PORT;
app.listen(PORT, console.log(`server started on port ${PORT}`));

