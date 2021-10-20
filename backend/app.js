var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users.routes');
var tokenRouter = require('./routes/tokens.routes');
var groupMessageRouter = require('./routes/groupmessages.routes');
var groupMemberRouter = require('./routes/groupmembers.routes.js')
var chatsRouter = require('./routes/chats.routes.js')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend/dist")));
app.use(express.static(path.join(__dirname, "./public")));
app.use("/login", (req, res, next) => res.redirect("/"));
app.use("/home", (req, res, next) => res.redirect("/"));

// api routes
app.use('/api/users', usersRouter);
app.use('/api/groupmessages', groupMessageRouter);
app.use('/api/groupmembers', groupMemberRouter);
app.use('/api/token', tokenRouter);
app.use('/api/chats', chatsRouter);

// 404
app.use('/*', (req, res, next) => res.sendFile(path.join(__dirname, "./static_views/404.html")))

module.exports = app;
