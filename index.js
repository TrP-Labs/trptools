const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
var cookieParser = require('cookie-parser')
require('dotenv').config();

app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'Content'), {
    extensions: ['html'],
}));

// Require module systems
app.use('/proxy', require(__dirname + '/serverModules/proxy.js'));
app.use('/auth', require(__dirname + '/serverModules/auth.js'));
app.use('/articles', require(__dirname + '/serverModules/articles.js'));

const socketIO = require(__dirname + '/serverModules/dispatchSocket.js');
socketIO(http);

// 404 Handler - This must come last
app.use(function(req, res) {
    res.status(404).sendFile(__dirname + '/Content/404.html');
});

http.listen(process.env.PORT);