const express = require('express');
const router = express.Router();
require('dotenv').config();

router.get('/login', async (req, res) => {
    res.redirect(
        `https://apis.roblox.com/oauth/v1/authorize?client_id=${process.env.OAUTH_CID}&redirect_uri=${'https://trptools.tickogrey.com/auth/redirect'}&scope=openid&response_type=code`
    );
});

router.get('/redirect', async (req, res) => {
    // Validate Params
    const code = req.query.code

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

    console.log(id)
});

module.exports = router;