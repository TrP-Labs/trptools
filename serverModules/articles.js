const express = require('express');
const marked = require('marked')
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
require('dotenv').config();
const db = require(__dirname + '/db.js');
const path = require('path');
const noblox = require('noblox.js');

router.get('/get', async (req, res) => {
    const type = req.query.type
    const query = req.query.query
    let result 

    if (query) {
        result = await db.findArticle(query, type)
    } else {
        result = await db.findAllArticles(type)
    }

    let queryResult = []

    await result.forEach(document => {
        queryResult.push({
            id: document.id,
            title: document.title,
            ownerId: document.ownerId
        })
    });

    res.status(200).send(queryResult)
});

router.get('/:id', async (req, res) => {
    console.log('returning article')
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