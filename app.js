var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
require('dotenv').config()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var kindergartensRouter = require('./routes/kindergartens');
var childRouter = require('./routes/child')
var fileRouter = require("./routes/file")
var RegisterApplicationRouter = require("./routes/registerapplication")
var AuditRouter = require('./routes/audit')
var ReviewRouter = require('./routes/review')
var ServiceRouter = require('./routes/service')
var PlanRouter = require('./routes/plan')
var SubscriptionRouter = require('./routes/subscription')
var JobRouter = require('./routes/jobs')
var EmployeeRouter = require('./routes/employee')
var BonusController = require('./routes/bonus')
var TimeOffCategoryController = require('./routes/timeoffcategory')

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/kindergartens', kindergartensRouter);
app.use('/children', childRouter);
app.use('/files', fileRouter);
app.use('/uploads', express.static('./uploads'));
app.use('/RegisterApplication', RegisterApplicationRouter);
app.use('/audit', AuditRouter);
app.use('/reviews', ReviewRouter);
app.use('/services', ServiceRouter);
app.use('/plans', PlanRouter);
app.use('/subscriptions', SubscriptionRouter);
app.use('/jobs', JobRouter);
app.use('/employees', EmployeeRouter);
app.use('/bonuses', BonusController);
app.use('/timeoffcategories', TimeOffCategoryController);

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
