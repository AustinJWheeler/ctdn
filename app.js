const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressSession = require('express-session');
const connectMongodbSession = require('connect-mongodb-session');
const http = require('http');
const expressWs = require('express-ws');

const keys = require('./config/keys');
require('./database');

const app = express();
const server = http.createServer(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
expressWs(app, server);

require('./routes/websocket')(app);

// Session
app.use(expressSession({
    secret: keys.expressSessionSecret,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    },
    store: new (connectMongodbSession(expressSession))({
        uri: keys.mongoURI,
        collection: 'sessions'
    }),
    resave: false,
    saveUninitialized: true
}));

// Oauth Routes
require('./passport')(app);

require('./routes/routes')(app);

app.use('/', require('./routes/index'));

app.set('port', 5000);
module.exports = server;
