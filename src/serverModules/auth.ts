import express from 'express';
import dotenv from 'dotenv'
import crypto from 'crypto';
import noblox from 'noblox.js';

const router = express.Router();
dotenv.config();
const db = require(__dirname + '/db.js');


// uuidv4 compliant generator
function uuidv4(): string {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: string) =>
      (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
    );
}

// Simple redirect endpoint
router.get('/login', async (req, res) => {
    if (req.cookies.token) {
        res.redirect('/')
        return
    }

    res.redirect(
        `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.OAUTH_CID}&redirect_uri=${process.env.OAUTH_REDIRECT}&scope=openid&response_type=code`
    );
});

// Account creation handler
router.get('/redirect', async (req, res) => {
    // Validate request cookies & params
    if (!req.query.code || typeof req.query.code !== 'string') {
        res.status(403)
        return
    }
    
    const code : string = req.query.code

    // Construct request
    const params = new URLSearchParams();
    params.append('client_id', process.env.OAUTH_CID);
    params.append('client_secret', process.env.OAUTH_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    let result

    // Send request for authentication
    try {
        result = await fetch('https://apis.roblox.com/oauth/v1/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params,
        })
        
        result = await result.json()
    } catch {
        res.status(500).send('unknown server error while authenticating')
    }

    // Send request for data access
    try {
        result = await fetch('https://apis.roblox.com/oauth/v1/userinfo', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + result.access_token
            },
        })
        
        result = await result.json()
    } catch (err) {
        res.status(500).send('unknown server error while retrieving data')
        return
    }

    const id = result.sub
    const token = uuidv4()

    db.addId(id, token)

    res.cookie('token', token)
    res.redirect('/')
});

router.get('/info', async (req, res) => {
    const info = await db.getId(req.cookies.token)
    if (!info) {res.status(404).send({'error':'account not found'}); return}

    const username = await noblox.getUsernameFromId(info.id)

    const userImage = await noblox.getPlayerThumbnail(info.id, 420, "png", true, "headshot")
    const imageUrl = userImage[0].imageUrl

    res.status(200).send({
        id: info.id,
        username: username,
        imageUrl: imageUrl,
        settings: info.settings,
        sitePermissionLevel: info.sitePermissionLevel,
    })
});

module.exports = router;