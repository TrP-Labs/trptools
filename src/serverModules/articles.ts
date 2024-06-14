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
    const tag = req.query.tag
    const user = req.query.user
    let result 

    if (query) {
        result = await db.findArticle(query, type)
    } else if (tag) {
        result = await db.findArticlesWithTag(tag)
    } else if (user) {
        const selectedUser = await db.getUserById(user)
        const loggedInUser = await db.getUserById(req.cookies.token)

        if (selectedUser.settings && selectedUser.settings.hidearticles == true) {
            if (loggedInUser && loggedInUser.id != selectedUser.id) {
                res.status(403).send('Access denied')
                return;
            } else if (!loggedInUser) {
                res.status(403).send('Access denied')
                return;            
            }
        }

        result = await db.findArticlesFromUser(user)
    } else {
        result = await db.findAllArticles(type)
    }

    if (!result) {res.status(500); return}

    let queryResult : Array<publicArticleObject> = []

    await result.forEach((document : articleObject) => {
        const previewImage = document.body.match(/!\[.*?\]\((.*?)\)/)?.[1] || null;
        queryResult.push({
            id: document.id,
            title: document.title,
            owner: document.owner,
            previewImage: previewImage
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
        title: article.title.replace(/"/g, "&quot;"),
        body: body,
        articleId: article.id
    });
});

router.post('/edit/:id', async (req, res) => {
    // run database queries
    const loggedInUser = await db.getId(req.cookies.token)
    const article : articleObject = await db.getArticle(req.params.id)

    // get values to edit
    if (!req.body.title || typeof req.body.title !== "string") {return}
    if (!req.body.body || typeof req.body.body !== "string") {return}

    const title : string = req.body.title
    const body : string = req.body.body

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

router.post('/post', async (req, res) => {
    // run database queries
    const loggedInUser = await db.getId(req.cookies.token)

    // get values to edit
    if (!req.body.title || typeof req.body.title !== "string") {return}
    if (!req.body.body || typeof req.body.body !== "string") {return}
    if (!req.body.articleType || typeof req.body.articleType !== "string") {return}

    const title : string = decodeURI(req.body.title)
    const body : string = decodeURI(req.body.body)
    const articleType : string = req.body.articleType

    // run permission checks
    let hasPermission = false

    if (loggedInUser) {
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[articleType]) {hasPermission = true}
    } else {
        res.status(403).send('Access denied')
        return
    }

    if (hasPermission == false) {
        res.status(403).send('Access denied')
        return        
    }

    // run the command
    const info : baseArticleObject = {
        owner: loggedInUser.id,
        title: title,
        body: body,
        type: articleType
    }

    const id = await db.createArticle(info)

    res.status(200).send({response: "Created Article", data: id})
});

router.get('/post', async (req, res) => {
    // run database queries
    const loggedInUser = await db.getId(req.cookies.token)

    // get values to edit
    if (!req.query.articleType || typeof req.query.articleType !== "string") {return}

    const articleType : string = req.query.articleType

    // run permission checks
    let hasPermission = false

    if (loggedInUser) {
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[articleType]) {hasPermission = true}
    } else {
        res.status(403).send('Access denied')
        return
    }

    if (hasPermission == false) {
        res.status(403).send('Access denied')
        return        
    }

    res.render('editarticle.ejs', {
        title: "",
        body: "",
        articleId: ""
    });
});

router.get('/search', async (req, res) => {
    res.sendFile(rootDir + "/content/articleSearch.html")
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

    try {
        var username = await noblox.getUsernameFromId(article.owner)
        var userImage = await noblox.getPlayerThumbnail(article.owner, 420, "png", true, "headshot")
        var imageUrl = userImage[0].imageUrl || ""
    } catch {
        var username = "TrP Tools Staff"
        var imageUrl = "https://cdn.trptools.com/icon.webp"
    }

    let previewImage = rawbody.match(/!\[.*?\]\((.*?)\)/)?.[1] || null;
    if (!previewImage) {previewImage = ""}

    res.render('article.ejs', {
        title: article.title,
        ownerId : article.owner,
        body: mdbody,
        shortbody: sanitizedbody.substring(0,150),
        username: username,
        profileSource: imageUrl,
        views: article.views,
        ownsPage: ownsPage,
        articleId: article.id,
        articleType: article.type,
        tags: JSON.stringify(article.tags),
        imageUrl: previewImage
      });
});

module.exports = router;