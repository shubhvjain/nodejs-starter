var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var helmet = require('helmet')
var useragent = require('express-useragent');
var winston = require('winston');
const { createLogger, format, transports } = require('winston');

// global log object 
logger1 = winston.createLogger({
    format: format.combine(format.timestamp(),format.json()),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'serverLogs.log' })
    ]
});
logger1.info("server.started");

var usersRouter = require('./user/routes');
var adminRouter = require('./admin/router')

var apiMiddle = require('./services/middlewares');
var dbLog = require("./admin/serverLogs")
// dbLog.newDBLog({server:true,message:"server.started"}) //TODO uncomment

var app = express();

// app.use(async function(req,res,next){
//     let data = await dbLog.logModel.find({})
//     console.log(data)
//     next()
// })

app.use(useragent.express());
app.use(logger('dev'));
app.use(compression()); 
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// to limit the size of requests
app.use(bodyParser.json({ strict: true, limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(apiMiddle.responseHandler); // to add custom success nd erand error functions 
app.use(apiMiddle.enableCORS); // to enable CORS

app.get('/', function (req, res, next) {
    res.success({ message: 'API working!' });
});

// path to public files
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/admin',adminRouter);

app.use(function (req, res, next) {
    var err = new Error('notfound::Route not found');
    err.status = 404;
    next(err);
});

// the error handler
app.use(apiMiddle.appErrorHandler);

module.exports = app;