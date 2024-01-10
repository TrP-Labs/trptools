const express = require('express');
const app = express();
const path = require('path');
const PORT = 80;
 
app.use(express.static(path.join(__dirname, 'Pages'), { // Serve Pages directory
    extensions: ['html'],
}));
 
app.use(function(req, res) { // Page does not exist
    res.status(404).send('404 not found');
});

app.listen(PORT)