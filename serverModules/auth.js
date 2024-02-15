const express = require('express');
const router = express.Router();

router.get('/login', async (req, res) => {
    res.status(405).send('405 method not allowed - login is not yet implemented')
});

module.exports = router;