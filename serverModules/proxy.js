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

router.get('/profile', async (req, res) => {
    try {
        const username = await noblox.getUsernameFromId(req.query.id)
        let url = await noblox.getPlayerThumbnail(req.query.id, 420, "png", true, "Headshot")
        url = url[0].imageUrl

        res.status(200).send({
            username: username,
            imageUrl: url
        })
    } catch { 
        res.status(500).send()
    }
});

module.exports = router;