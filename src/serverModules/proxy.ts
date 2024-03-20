import express from 'express';
import noblox from 'noblox.js';
const router = express.Router();

router.get('/name', async (req, res) => {
    if (!req.query.id || typeof req.query.id !== "string") {
        res.status(400).send()
        return
    }

    const param : string = req.query.id
    const userId : number = Number(param)

    try {
        const name = await noblox.getUsernameFromId(userId)
        res.status(200).send({data : name})
    } catch {
        res.status(500).send()
    }
});

router.get('/profile', async (req, res) => {
    if (!req.query.id || typeof req.query.id !== "string") {
        res.status(400).send()
        return
    }

    const param : string = req.query.id
    const userId : number = Number(param)

    try {
        const username = await noblox.getUsernameFromId(userId)
        
        const userImage = await noblox.getPlayerThumbnail(userId, 420, "png", true, "headshot")
        const imageUrl = userImage[0].imageUrl

        res.status(200).send({
            username: username,
            imageUrl: imageUrl
        })
    } catch { 
        res.status(500).send()
    }
});

module.exports = router;