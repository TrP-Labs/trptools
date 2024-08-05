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
    if (!group) {
        res.sendFile(rootDir + "/content/404-group.html");
        return;
    }

    // collect group data
    const logo = await noblox.getLogo(NumId, "420x420")
    const name = await noblox.getGroup(NumId)

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
        groupName: name.name,
        imageUrl: logo,
        staff : staff || [],
        routes : group.routes || []
    })
})

module.exports = router;