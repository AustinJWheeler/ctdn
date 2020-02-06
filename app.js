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
// app.use(express.static(path.join(__dirname, 'public')));
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

// app.use('/', require('./routes/index'));

if (process.env.NODE_ENV === 'production') {
    // Express will serve up production assets
    // like our main.js file, or main.css file!
    app.use(express.static('client/build'));

    // Express will serve up the index.html file
    // if it doesn't recognize the route
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const port = process.env.PORT || 5000;

app.set('port', port);
module.exports = server;
