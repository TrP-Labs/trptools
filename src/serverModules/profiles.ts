import express from 'express';
import path from 'path';
import noblox from 'noblox.js';
import dotenv from 'dotenv';
import { profile } from 'console';

dotenv.config();
const router = express.Router();
const db = require(__dirname + '/db.js');
const rootDir : string = path.resolve(__dirname, '../..');

router.get('/info/:id', async (req, res) => {
    const id : string = req.params.id
    const selectedUser : profile = await db.getUserById(id)

    const groupList = null

    res.status(200).send({
        routes: selectedUser.favoriteRoutes || [],
        groups: groupList || []
    })
});

router.get('/:id', async (req, res) => {
    let ownsPage = false
    const id : string = req.params.id

    // Get information
    const loggedInUser = await db.getId(req.cookies.token)
    const numericalId : number = parseInt(id)
    const selectedUser : profile = await db.getUserById(id)

    if (!selectedUser) {
        res.sendFile(rootDir + "/content/404-user.html");
        return;
    }

    // Run profile queries
    const username : string = await noblox.getUsernameFromId(numericalId)
    const userImage = await noblox.getPlayerThumbnail(numericalId, 420, "png", true, "headshot")
    const imageUrl = userImage[0].imageUrl

    // Process information
    if (loggedInUser) {
        if (loggedInUser.id == selectedUser.id) {ownsPage = true}
    }

    res.render('profile.ejs', {
        userId: selectedUser.id,
        username: username,
        ownsPage: ownsPage,
        imageUrl: imageUrl
    });
});

module.exports = router;