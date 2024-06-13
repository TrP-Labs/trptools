import express from 'express';
import path from 'path';
import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const db = require(__dirname + '/db.js');
const rootDir : string = path.resolve(__dirname, '../..');

router.get('/edit', async (req, res) => {
    // Get information
    const loggedInUser = await db.getId(req.cookies.token)

    if (!loggedInUser) {
        res.status(403).send('Access denied')
        return;
    }

    // Run profile queries
    const username : string = await noblox.getUsernameFromId(loggedInUser.id)
    const userImage = await noblox.getPlayerThumbnail(loggedInUser.id, 420, "png", true, "headshot")
    const imageUrl = userImage[0].imageUrl

    res.render('settings.ejs', {
        id : loggedInUser.id,
        settings: JSON.stringify(loggedInUser.settings)
    });
});

router.post('/edit', async (req, res) => {
    // Get information
    const loggedInUser = await db.getId(req.cookies.token)

    if (!loggedInUser) {
        res.status(403).send('Access denied')
        return;
    }

    const edits = req.body
    if (!edits || !edits.favoriteRoutes || !edits.settings){
        res.status(400).send('Bad request')
        return;
    }

    try {
       await db.editId(loggedInUser.id, edits) 
    } catch {
        res.status(500).send('Internal server error')
        return;
    }

    res.status(200).send("Success")
});

router.get('/info/:id', async (req, res) => {
    const id : string = req.params.id
    const selectedUser : profile = await db.getUserById(id)
    const loggedInUser = await db.getId(req.cookies.token)

    const groupList = null

    if (selectedUser.settings && selectedUser.settings.hideroutes == true) {
        if (loggedInUser && loggedInUser.id != selectedUser.id) {
            res.status(403).send('Access denied')
            return;
        } else if (!loggedInUser) {
            res.status(403).send('Access denied')
            return;            
        }
    }

    res.status(200).send({
        routes: selectedUser.favoriteRoutes || [],
        //groups: groupList || []  -Coming soon
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
    let username : string = await noblox.getUsernameFromId(numericalId)
    const userImage = await noblox.getPlayerThumbnail(numericalId, 420, "png", true, "headshot")
    const imageUrl = userImage[0].imageUrl

    // Process information
    if (loggedInUser) {
        if (loggedInUser.id == selectedUser.id) {ownsPage = true}
    }

    if (selectedUser.settings && selectedUser.settings.hideprofile == true) {
        if (ownsPage == true) {
            username = username + ' 🔒'
        } else {
            res.sendFile(rootDir + "/content/404-user.html");
            return;
        }
    }

    res.render('profile.ejs', {
        userId: selectedUser.id,
        username: username,
        ownsPage: ownsPage,
        imageUrl: imageUrl
    });
});

module.exports = router;