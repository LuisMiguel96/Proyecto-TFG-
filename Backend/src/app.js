var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var stravaRouter = require('./routes/stravaroutes');
var activitiesRouter = require('./routes/activities');
var analyzedRouter = require('./routes/analyzed');
var mlRouter= require('./routes/ml');

var app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Puerto del frontend
  credentials: true
}));

// view engine setup


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/strava', stravaRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/analyzed', analyzedRouter);
app.use('/api/ml',mlRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    error: err.message,
    details: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
