const express = require('express');
const noblox = require('noblox.js');
const router = express.Router();

const audioendpoint = 'https://api.hyra.io/audio/'

try {
    noblox.setCookie(process.env.RBX_TOKEN)
} catch {
    console.log('noblox could not login with the RBX_TOKEN enviroment variable, /audio endpoint will be disabled')
}

router.get('/name', async (req, res) => {
    try {
        const name = await noblox.getUsernameFromId(req.query.id)
        res.status(200).send({data : name})
    } catch {
        res.status(500).send()
    }
});

router.get('/audio', async (req, res) => {
    try {
        const result = await fetch(audioendpoint + req.query.id)
        let file = await result.blob()
        file = await file.arrayBuffer()
        console.log(file)
        res.status(200).send([file])
    } catch {
        res.status(500).send()
    }
});


module.exports = router;