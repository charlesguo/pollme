var express = require('express');
mongoose = require('mongoose');
var sio = require('socket-io');
var port = process.env.PORT || 3000;
var everyauth = require('everyauth');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var errorHandler = require('errorhandler');
var morgan = require('morgan');
var fs = require('fs');
// var config = require('./config.json');

app = express();
var server = require('http').Server(app);

var io = sio(server);

var mongoUri =  process.env.MONGODB_URI || 'mongodb://localhost/polls';
mongoose.connect(mongoUri);

// require('./auth/strategies');

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
//app.use(session({ secret: config.session.secret, resave: false, saveUninitiatialized: false}));
// app.use(morgan('combined', {stream:fs.createWriteStream('./log_file.log', {flags: 'a'})}));
app.use(morgan('dev'));
// app.use(everyauth.middleware());

require('./routes');

// if(process.env.NODE_ENV === 'production') {
//   app.use(errorHandler());
//   process.on('uncaughtException', function (err) {
//     console.log('Uncaught exception: ' + err);
//   });
// } else {
//   app.use(errorHandler({ dumpExceptions: true, showStack: true }));
// }

io.sockets.on('connection', function(socket) {
  socket.on('join poll', function(poll_id) {
    socket.join('poll_'+poll_id);
  });

  socket.on('vote', function(data) {
    io.sockets.in('poll_'+data.poll_id).emit('vote proc', data);
  });
});

app.listen(process.env.PORT || 3000);
console.log(`server started on port ${port}`);
