import express from 'express';
import marked from 'marked';
import sanitizeHtml from 'sanitize-html';
import path from 'path';
import noblox from 'noblox.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const db = require(__dirname + '/db.js');
const rootDir : string = path.resolve(__dirname, '../..');

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

    const body : string = article.body.replace(/<br\s*\/?>/gi, '\n');

    res.render('editarticle.ejs', {
        title: article.title,
        body: body,
        articleId: article.id
    });
});

router.post('/edit/:id', async (req, res) => {
    // run database queries
    const loggedInUser = await db.getId(req.cookies.token)
    const article : articleObject = await db.getArticle(req.params.id)

    // get values to edit
    if (!req.query.title || typeof req.query.title !== "string") {return}
    if (!req.query.body || typeof req.query.body !== "string") {return}

    const title : string = req.query.title
    const body : string = req.query.body

    // run permission checks
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

    // run the command
    await db.editArticle(req.params.id, title, body)

    res.status(200).send("updated article")
});

router.get('/:id', async (req, res) => {
    const article : articleObject = await db.getArticle(req.params.id)

    if (!article) {
        res.sendFile(path.join(rootDir, 'content/404.html'))
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

    res.render('article.ejs', {
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