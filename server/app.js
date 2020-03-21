const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const expressSession = require('express-session');
const awsSdk = require('aws-sdk');
const dynamodbStore = require('dynamodb-store');

const http = require('http');
const expressWs = require('express-ws');
const expressSslify = require('express-sslify');
const debug = require('debug');

const keys = require('./config/keys');
const db = require('./dynamodb')();
if (!keys.production) db.createTable().catch(x => x);

const app = express();
app.enable('trust proxy');
const server = http.createServer(app);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
if (keys.forceTLS)
  app.use(expressSslify.HTTPS({trustProtoHeader: true}));
expressWs(app, server);

require('./websocket')(app, db);

// Session
app.use(expressSession({
  secret: keys.expressSessionSecret,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: keys.forceTLS,
  },
  store: new dynamodbStore({
    table: {
      name: keys.dynamoTableName,
      hashKey: 'pk',
      hashPrefix: 's#'
    },
    keepExpired: false,
    touchInterval: 1000 * 30,
    ttl: 1000 * 60 * 60 * 24 * 7,
  }),
  resave: false,
  saveUninitialized: false,
}));

// Oauth Routes
require('./passport')(app, db);

require('./routes')(app, db);

// if (keys.production) {
  // Express will serve up production assets
  // like our main.js file, or main.css file!
  app.use(express.static('build'));

  // Express will serve up the index.html file
  // if it doesn't recognize the route
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
// }

const port = normalizePort(process.env.PORT || '5000');

app.set('port', port);
module.exports = server;

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const logger = debug('countdown:server');

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  logger('Listening on ' + bind);
}

function normalizePort(val) {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
}
