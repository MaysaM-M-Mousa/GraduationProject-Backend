var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "App Docs",
			version: "1.0.0",
			description: "A Simple Documentations for App",
		},
	},
	apis: ["./controllers/*.js"],
};

const specs = swaggerJsDoc(options);

var app = express();

if(process.env.ENVIRONMENT == 'DEVELOPMENT'){
  app.use("/swagger", swaggerUI.serve, swaggerUI.setup(specs));
}

app.use(cors())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send('error');
});

module.exports = app;
