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

const entities : Array<ownerData> = [
    {id: 'staff', name:"TrP Tools Staff", icon:"https://cdn.trptools.com/icon.webp"}
]

async function getInfoByOwner(ownerId : string) : Promise<ownerData | null> {
    const ownerIdTable : Array<string> = ownerId.split(':')
    const ownerType : string = ownerIdTable[0]
    const ownerData : string = ownerIdTable[1]

    switch (ownerType) {
        case 'entity':
            const entity : ownerData | null = entities.find(item => item.id === ownerData) || null;
            return entity
        case 'user':
            const intOwnerData : number = parseInt(ownerData)
            var username = await noblox.getUsernameFromId(intOwnerData)
            var userImage = await noblox.getPlayerThumbnail(intOwnerData, 420, "png", true, "headshot")
            var imageUrl = userImage[0].imageUrl || ""

            const data : ownerData = {id : ownerData, name : username, icon : imageUrl}
            return data
        case 'group':
            // coming soon
            return null
        default:
            return null
    }
}

async function compileDocumentFromSearch(document : articleObject) {
    const previewImage = document.body.match(/!\[.*?\]\((.*?)\)/)?.[1] || null;
    const info = await getInfoByOwner(document.owner);
    return {
        id: document.id,
        title: document.title,
        owner: info,
        previewImage: previewImage
    };
}

router.get('/get', async (req, res) => {
    const type = req.query.type

    const query = req.query.query
    let owner = req.query.user
    let tags : any = req.query.tags

    if (tags) {
        tags = JSON.parse(tags)
    }

    if (owner) {
        owner = 'user:' + owner
    }
    
    let result = await db.findArticle({type : type, query : query, owner : owner, tags : tags})

    const selectedUser = await db.getUserById(owner)
    const loggedInUser = await db.getUserById(req.cookies.token)

    if (selectedUser && selectedUser.settings && selectedUser.settings.hidearticles == true) {
        if (loggedInUser && loggedInUser.id != selectedUser.id) {
            res.status(403).send('Access denied')
            return;
        } else if (!loggedInUser) {
            res.status(403).send('Access denied')
            return;
        }
    }

    if (!result) {res.status(500); return}

    let queryResult : Array<publicArticleObject> = []

    for await (const doc of result) {
        const compiledDoc = await compileDocumentFromSearch(doc)
        queryResult.push(compiledDoc)
    }

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
        if (loggedInUser.id == article.owner.split(':')[1]) {ownsPage = true}
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
        if (loggedInUser.id == article.owner.split(':')[1]) {ownsPage = true}
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
        articleId: article.id,
        tags: JSON.stringify(article.tags)
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
    const tags : Array<string> = JSON.parse(req.body.tags)

    // run permission checks
    if (!article) {
        res.status(404).send('Article not found')
        return
    }

    let ownsPage = false

    if (loggedInUser) {
        if (loggedInUser.id == article.owner.split(':')[1]) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
    } else {
        res.status(403).send('Access denied')
        return
    }

    if (ownsPage == false) {
        res.status(403).send('Access denied')
        return        
    }

    // tags xss security
    let newtags : Array<string> = []
    tags.forEach((tag) => {
        newtags.push(sanitizeHtml(tag))
    });
    newtags = newtags.filter(Boolean)

    // run the command
    await db.editArticle(req.params.id, title, body, newtags)

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
    const tags : Array<string> = JSON.parse(req.body.tags)

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

    let newtags : Array<string> = []

    tags.forEach((tag) => {
        newtags.push(sanitizeHtml(tag))
    });

    // run the command
    const info : baseArticleObject = {
        owner: 'user:' + loggedInUser.id,
        title: title,
        body: body,
        type: articleType,
        tags: newtags
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
        articleId: "",
        tags: JSON.stringify([])
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
        if (loggedInUser.id == article.owner.split(':')[1]) {ownsPage = true}
        if (loggedInUser.sitePermissionLevel >= articleEditPermissions[article.type]) {ownsPage = true}
    }

    const rawbody = article.body
    const sanitizedbody = sanitizeHtml(rawbody)
    const mdbody = marked.parse(sanitizedbody)

    let ownerData : ownerData | null = await getInfoByOwner(article.owner)
    if (!ownerData) {ownerData = {
        id: 'unknown',
        name: 'unknown',
        icon: 'unknown'
    }}

    let previewImage = rawbody.match(/!\[.*?\]\((.*?)\)/)?.[1] || null;
    if (!previewImage) {previewImage = ""}

    res.render('article.ejs', {
        title: article.title,
        ownerId : article.owner.split(':')[1],
        body: mdbody,
        username: ownerData.name,
        profileSource: ownerData.icon,
        views: article.views,
        ownsPage: ownsPage,
        articleId: article.id,
        articleType: article.type,
        tags: JSON.stringify(article.tags),
        imageUrl: previewImage
      });
});

module.exports = router;