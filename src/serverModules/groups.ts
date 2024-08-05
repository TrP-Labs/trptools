import express from 'express';
import noblox from 'noblox.js';
import path from 'path';

const router = express.Router();
const db = require(__dirname + '/db.js');
const rootDir : string = path.resolve(__dirname, '../..');

router.get('/:id', async (req, res) => {
    // validate input
    const StringId : string = req.params.id
    const NumId : number = Number(StringId)
    if (!NumId) {
        res.sendFile(rootDir + "/content/404-group.html");
        return;
    }

    // validate group
    const group = await db.getGroupById(req.params.id)
    const robloxGroup = await noblox.getGroup(NumId)
    const loggedInUser = await db.getId(req.cookies.token)
    if (!group) {
        if (robloxGroup && loggedInUser && robloxGroup.owner.userId == loggedInUser.id) {
            res.redirect(`/groups/${StringId}/create`)
            return
        } else {
            res.sendFile(rootDir + "/content/404-group.html");
            return;
        }
    }

    // collect group data
    const logo = await noblox.getLogo(NumId, "420x420")

    let staff : Array<any> = []
    for (let roleDB of group.staff) {
        const role = await noblox.getRole(NumId, roleDB.role)
        const players = await noblox.getPlayers(NumId, role.id)

        let roleObject : any= {
            name: role.name,
            color: roleDB.color,
            members: []
        }
        
        for (let player of players) {
            const userImage = await noblox.getPlayerThumbnail(player.userId, 420, "png", true, "headshot")
            const imageUrl = userImage[0].imageUrl || 'https://cdn.trptools.com/404.png'

            roleObject.members.push({
                id: player.userId,
                username: player.username,
                image : imageUrl
            })
        }

        staff.push(roleObject)
    }

    // return group object
    res.render('group', {
        groupName: robloxGroup.name,
        imageUrl: logo,
        staff : staff || [],
        routes : group.routes || []
    })
})

router.get('/:id/create', async (req, res) => {
    // validate input
    const StringId : string = req.params.id
    const NumId : number = Number(StringId)
    if (!NumId) {
        res.sendFile(rootDir + "/content/404-group.html");
        return;
    }

    // validate group
    const group = await db.getGroupById(req.params.id)
    if (group) {
        res.redirect("/groups/" + StringId);
        return;
    }

    // collect group data
    const name = await noblox.getGroup(NumId)

    // return group object
    res.render('groupCreate', {
        groupName: name.name,
        id : StringId
    })
})

router.post('/:id/create', async (req, res) => {
    // validate input
    const StringId : string = req.params.id
    const NumId : number = Number(StringId)
    if (!NumId) {
        res.sendFile(rootDir + "/content/404-group.html");
        return;
    }

    const group = await db.getGroupById(req.params.id)
    const robloxGroup = await noblox.getGroup(NumId)
    const loggedInUser = await db.getId(req.cookies.token)
    if (group || !robloxGroup) {
        res.status(400).send('400 bad request')
    }
    if (loggedInUser && robloxGroup.owner.userId == loggedInUser.id) {
        db.createGroupId(StringId)
        res.status(200).send('200 group created')
    } else {
        res.status(403).send('403 forbidden')
    }

})

module.exports = router;