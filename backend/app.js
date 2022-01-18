var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();

var usersRouter = require('./routes/users.routes');
var tokenRouter = require('./routes/tokens.routes');
var messageRouter = require('./routes/messages.routes');
var groupRouter = require('./routes/groups.routes.js')
var chatsRouter = require('./routes/chats.routes.js')
var searchRouter = require('./routes/search.routes.js')
var privConRouter = require('./routes/privcons.routes.js')

var app = express();

if(process.env.NODE_ENV == "development") app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(express.static(path.join(__dirname, "./public")));
app.use("/login", (req, res, next) => res.redirect("/"));
app.use("/home", (req, res, next) => res.redirect("/"));

// api routes
app.use('/api/users/con', privConRouter); // privCon == Private Connection
app.use('/api/users', usersRouter);
app.use('/api/messages', messageRouter);
app.use('/api/group', groupRouter);
app.use('/api/token', tokenRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/search', searchRouter);

// 404
app.use('/*', (req, res, next) => res.sendFile(path.join(__dirname, "./static_views/404.html")))

module.exports = app;
