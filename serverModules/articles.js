const express = require('express');
const marked = require('marked')
const sanitizeHtml = require('sanitize-html');
const router = express.Router();
require('dotenv').config();
const db = require(__dirname + '/db.js');
const path = require('path');
const noblox = require('noblox.js');

router.get('/:id', async (req, res) => {
    const article = await db.getArticle(Number(req.params.id))

    if (!article) {
        res.sendFile(path.join(__dirname, '..', 'Content/404.html'))
        return
    }

    const rawbody = article.body
    const sanitizedbody = sanitizeHtml(rawbody)
    const mdbody = marked.parse(sanitizedbody)

    res.render(path.join(__dirname, '..', 'Content/article.ejs'), {
        title: article.title,
        body: mdbody
      });
});

module.exports = router;