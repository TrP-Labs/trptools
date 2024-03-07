const express = require('express');
const router = express.Router();
require('dotenv').config();
const db = require(__dirname + '/db.js');
const path = require('path');
const noblox = require('noblox.js');

router.get('/:id', async (req, res) => {
    console.log(req.params.id)
    const article = await db.getArticle(Number(req.params.id))

    console.log(article)

    if (!article) {
        res.sendFile(path.join(__dirname, '..', 'Content/404.html'))
        return
    }

    res.send('you found a valid page!')
});

module.exports = router;