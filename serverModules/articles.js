const express = require('express');
const marked = require('marked')
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
require('dotenv').config();
const db = require(__dirname + '/db.js');
const path = require('path');
const noblox = require('noblox.js');

const articleEditPermissions = {
    'articles':4,
    'officialDoc':3
}

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

router.post('/delete/:id', async (req, res) => {
    const loggedInUser = await db.getId(req.cookies.token)
    const article = await db.getArticle(req.params.id)

    if (!article) {
        res.status(404).send('Article not found')
        return
    }

    let ownsPage = false

    if (loggedInUser) {
        if (loggedInUser.id == article.ownerId) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
    } else {
        res.status(403).send('Access denied')
        return
    }

    if (ownsPage == false) {
        res.status(403).send('Access denied')
        return        
    }

    const result = await db.deleteArticle(article.id)

    if (result == true) {
        res.status(200).send('Deleted article')
    } else {
        res.status(500).send('Internal server error')
    }
});

router.get('/edit/:id', async (req, res) => {
    const loggedInUser = await db.getId(req.cookies.token)
    const article = await db.getArticle(req.params.id)

    if (!article) {
        res.status(404).send('Article not found')
        return
    }

    let ownsPage = false

    if (loggedInUser) {
        if (loggedInUser.id == article.ownerId) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
    } else {
        res.status(403).send('Access denied')
        return
    }

    if (ownsPage == false) {
        res.status(403).send('Access denied')
        return        
    }

    res.status(415).send('not implemented')
});

router.get('/:id', async (req, res) => {
    const article = await db.getArticle(req.params.id)

    if (!article) {
        res.sendFile(path.join(__dirname, '..', 'Content/404.html'))
        return
    }

    let ownsPage = false
    const loggedInUser = await db.getId(req.cookies.token)

    if (loggedInUser) {
        if (loggedInUser.id == article.ownerId) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
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
        views: article.views,
        ownsPage: ownsPage,
        articleId: article.id
      });
});

module.exports = router;