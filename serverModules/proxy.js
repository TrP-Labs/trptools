const express = require('express');
const noblox = require('noblox.js');
const router = express.Router();

router.get('/name', async (req, res) => {
    try {
        const name = await noblox.getUsernameFromId(req.query.id)
        res.status(200).send({data : name})
    } catch {
        res.status(500).send()
    }
});

module.exports = router;