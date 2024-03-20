import express from 'express';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';
import path from 'path';
import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const db = require(__dirname + '/db.js');
const rootDir : string = path.resolve(__dirname, '..');

const articleEditPermissions : ArticleEditPermissions = {
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

    if (!result) {res.status(500); return}

    let queryResult : Array<publicArticleObject> = []

    await result.forEach((document : publicArticleObject) => {
        queryResult.push({
            id: document.id,
            title: document.title,
            owner: document.owner
        })
    });

    res.status(200).send(queryResult)
});

router.post('/delete/:id', async (req, res) => {
    const loggedInUser = await db.getId(req.cookies.token)
    const article : articleObject = await db.getArticle(req.params.id)

    if (!article) {
        res.status(404).send('Article not found')
        return
    }

    let ownsPage = false

    if (loggedInUser) {
        if (loggedInUser.id == article.owner) {ownsPage = true}
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
    const article : articleObject = await db.getArticle(req.params.id)

    if (!article) {
        res.sendFile(path.join(rootDir, 'Content/404.html'))
        return
    }

    let ownsPage = false
    const loggedInUser = await db.getId(req.cookies.token)

    if (loggedInUser) {
        if (loggedInUser.id == article.owner) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
    }

    const rawbody = article.body
    const sanitizedbody = sanitizeHtml(rawbody)
    const mdbody = marked.parse(sanitizedbody)

    const username = await noblox.getUsernameFromId(article.owner)

    const userImage = await noblox.getPlayerThumbnail(article.owner, 420, "png", true, "headshot")
    const imageUrl = userImage[0].imageUrl

    res.render(path.join(rootDir, 'Content/article.ejs'), {
        title: article.title,
        body: mdbody,
        username: username,
        profileSource: imageUrl,
        views: article.views,
        ownsPage: ownsPage,
        articleId: article.id
      });
});

module.exports = router;