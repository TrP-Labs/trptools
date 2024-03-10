const express = require('express');
const marked = require('marked')
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
require('dotenv').config();
const db = require(__dirname + '/db.js');
const path = require('path');
const noblox = require('noblox.js');

router.get('/:id', async (req, res) => {
    const article = await db.getArticle(req.params.id)

    if (!article) {
        res.sendFile(path.join(__dirname, '..', 'Content/404.html'))
        return
    }

    const rawbody = article.body
    const sanitizedbody = sanitizeHtml(rawbody)
    const mdbody = marked.parse(sanitizedbody)

    const username = await noblox.getUsernameFromId(article.ownerId)
    let profileSource = await noblox.getPlayerThumbnail(article.ownerId, 420, "png", true, "Headshot")
    profileSource = profileSource[0].imageUrl

    res.render(path.join(__dirname, '..', 'Content/article.ejs'), {
        title: article.title,
        body: mdbody,
        username: username,
        profileSource: profileSource,
        views: article.views
      });
});

module.exports = router;