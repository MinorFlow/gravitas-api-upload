const jwt = require('jsonwebtoken')

const dbConn = require('./dbController')
const express = require('express')
const app = express()
const port = 3003

const server = app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})

app.use(express.json());
app.use(express.urlencoded({extended: true}));

function validationToken(token) {
    const result = {
        success: false,
        handle: null
    }
    if (token) {
        try {
            var decoded = jwt.verify(token, process.env.ENCODE_HASH)
            result.success = true
            result.handle = decoded.handle
        } catch(e) {
            result.success = false
            result.handle = null
        }
    }
    return result
}

app.post('/api/register', async (req, res) => {
    let success = false
    const id = req.body['id']
    const pw = req.body['pw']
    const nickname = req.body['nickname']
    if (id && pw && nickname) {
        try {
            const queryRes = await dbConn.userRegistration(id, pw, nickname)
            success = queryRes
        } catch(e) {
            success = false
        }
    }
    res.json({
        success: success
    })
})

app.post('/api/login', async (req, res) => {
    let result = { success: false }
    const id = req.body['id']
    const pw = req.body['pw']
    if (id && pw) {
        try {
            const queryRes = await dbConn.userLogin(id, pw)
            if (queryRes.success) {
                result.success = true
                result.token = jwt.sign({handle: id, nickname: queryRes.nickname}, process.env.ENCODE_HASH)
            }
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})

app.post('/api/checkid', async (req, res) => {
    let result = {
        success: false,
    }
    const id = req.body['id']
    if (id) {
        try {
            const queryRes = await dbConn.checkID(id)
            if (queryRes) {
                result.success = true
            }
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})

app.post('/api/getuserinfo', async (req, res) => {
    let result = {
        success: false,
    }
    const token = req.body['token']
    if (token) {
        let validToken = false
        let handle
        try {
            var decoded = jwt.verify(token, process.env.ENCODE_HASH)
            validToken = true
            handle = decoded.handle
        } catch(e) {
            validToken = false
        }
        if (validToken) {
            try {
                const queryRes = await dbConn.getUserInfo(handle)
                if (queryRes.success) {
                    result.uid = queryRes.uid
                    result.nickname = queryRes.nickname
                    result.joindate = queryRes.joindate
                    result.success = true
                }
            } catch(e) {
                result.success = false
            }
        }
    }
    res.json(result)
})

app.post('/api/createplanet', async (req, res) => {
    let success = false
    const token = req.body['token']
    const planetName = req.body['name']
    const planetDesc = req.body['desc']
    const validationResult = validationToken(token)
    if (validationResult.success) {
        try {
            const queryRes = await dbConn.createPlanet(validationResult.handle, planetName, planetDesc)
            if (queryRes == 0) success = true
        } catch(e) {
            success = false
        }
    }
    res.json({
        success: success
    })
})

app.post('/api/createhorizon', async (req, res) => {
    let success = false
    const token = req.body['token']
    const horizonName = req.body['name']
    const horizonDesc = req.body['desc']
    const type = req.body['type']
    const pUID = req.body['pUID']
    const validationResult = validationToken(token)
    if (validationResult.success) {
        try {
            const queryRes = await dbConn.createHorizon(validationResult.handle, horizonName, horizonDesc, type, pUID)
            if (queryRes == 0) success = true
        } catch(e) {
            success = false
        }
    }
    res.json({
        success: success
    })
})

app.post('/api/getplanetlist', async (req, res) => {
    let result = {
        success: false
    }
    try {
        const queryRes = await dbConn.getPlanetList()
        result.data = queryRes
        result.success = true
    } catch(e) {
        result.success = false
    }
    res.json(result)
})

app.post('/api/gethorizonlist', async (req, res) => {
    let result = {
        success: false
    }
    const planetUID = req.body['planet_uid']
    try {
        const queryRes = await dbConn.getHorizonList(planetUID)
        result.data = queryRes
        result.success = true
    } catch(e) {
        result.success = false
    }
    res.json(result)
})

app.post('/api/getpostlist', async (req, res) => {
    let result = {
        success: false
    }
    const type = req.body['type'] ?? 1
    const uid = req.body['uid']
    if (type && uid) {
        try {
            const queryRes = await dbConn.getPostList(type, uid)
            result.data = queryRes
            result.success = true
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})

app.post('/api/getpostlistall', async (req, res) => {
    let result = {
        success: false
    }
    try {
        const queryRes = await dbConn.getPostListAll()
        result.data = queryRes
        result.success = true
    } catch(e) {
        result.success = false
    }
    res.json(result)
})

app.post('/api/getpostdetail', async (req, res) => {
    let result = {
        success: false
    }
    const uid = req.body['uid']
    if (uid) {
        try {
            const queryRes = await dbConn.getPostDetail(uid)
            if (queryRes.length == 1) {
                result.success = true
                result.data = queryRes[0]
            }
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})

app.post('/api/writepost', async (req, res) => {
    let result = {
        success: false
    }
    const token = req.body['token']
    const type = req.body['type'] ?? 1
    const uid = req.body['uid']
    const title = req.body['title']
    const content = req.body['content']
    if (title != '' && content != '' && token) {
        const validationResult = validationToken(token)
        if (validationResult.success && uid) {
            try {
                const queryRes = await dbConn.writePost(validationResult.handle, type, uid, title, content)
                result.success = true
            } catch(e) {
                result.success = false
            }
        }
    }
    res.json(result)    
})

app.post('/api/getplanetinfo', async (req, res) => {
    let result = {
        success: false
    }
    
})

app.post('/api/getcommentlist', async (req, res) => {
    let result = {
        success: false
    }
    const uid = req.body['uid']
    if (uid) {
        try {
            const queryRes = await dbConn.getCommentList(uid)
            result.success = true
            result.data = queryRes
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})

app.post('/api/writecomment', async (req, res) => {
    let result = {
        success: false
    }
    const token = req.body['token']
    const uid = req.body['uid']
    const content = req.body['content']
    if (content != '' && token) {
        const validationResult = validationToken(token)
        if (validationResult.success && uid) {
            try {
                const queryRes = await dbConn.writeComment(validationResult.handle, uid, content)
                result.success = queryRes
            } catch(e) {
                result.success = false
            }
        }
    }
    res.json(result)    
})

app.post('/api/createevent', async (req, res) => {
    let result = {
        success: false
    }
    const token = req.body['token']
    const uid = req.body['uid']
    const title = req.body['title']
    const desc = req.body['desc']
    const location = req.body['location']
    const date = req.body['date']
    if (token) {
        const validationResult = validationToken(token)
        if (validationResult.success && uid && title && desc && location && date) {
            try {
                const queryRes = await dbConn.createEvent(validationResult.handle, uid, title, desc, location, date)
                result.success = queryRes
            } catch(e) {
                result.success = false
            }
        }
    }
    res.json(result)    
})

app.post('/api/geteventlist', async (req, res) => {
    let result = {
        success: false
    }
    const uid = req.body['uid']
    if (uid) {
        try {
            const queryRes = await dbConn.getEventList(uid)
            result.data = queryRes
            result.success = true
        } catch(e) {
            result.success = false
        }
    }
    res.json(result)
})