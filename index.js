const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);

app.use(express.static(path.join(__dirname, 'Content'), {
    extensions: ['html'],
}));

// Require module systems
app.use('/proxy', require(__dirname + '/serverModules/proxy.js'));

const socketIO = require(__dirname + '/serverModules/dispatchSocket.js');
socketIO(http);

// 404 Handler - This must come last
app.use(function(req, res) {
    res.status(404).send('404 not found');
});

http.listen(444);