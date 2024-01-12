const express = require('express');
const app = express();
const path = require('path');
const PORT = 80;
 
app.use(express.static(path.join(__dirname, 'Content'), { // Serve Pages directory
    extensions: ['html'],
}));

// Rendering and API modules
app.use('/proxy', require(__dirname + '/serverModules/proxy.js'));
 
app.use(function(req, res) { // 404 Handler - This must come last
    res.status(404).send('404 not found');
});

app.listen(PORT)