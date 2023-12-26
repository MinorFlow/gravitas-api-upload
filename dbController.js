const mariadb = require('mariadb')
const vals = require('./conn')

const pool = mariadb.createPool({
    host: vals.DBHost,
    port: vals.DBPort,
    user: vals.DBUser,
    password: vals.DBPass,
    connectionLimit: 5
})

async function userRegistration(id, pw, nickname) {
    let result = false
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const check = await conn.query("SELECT count(*) 'cnt' FROM member WHERE id=?", [id])
        const checkCnt = check[0]['cnt'] ?? 1
        if (checkCnt == 0) {
            const today = new Date()
            const todayY = today.getFullYear()
            const todayM = today.getMonth() + 1
            const todayD = today.getDate()
            const todayRaw = Date.now()
            const param = [id, nickname, pw, todayY, todayM, todayD, `${todayRaw}`]
            const res = await conn.query("INSERT INTO member value (REPLACE(UUID(),'-',''), ?, ?, SHA2(?, 256), ?, ?, ?, ?)", param)
            result = true
            console.log(`I: [USER REGISTRATION] Member insert complete (REQ_ID: ${id})`)
        } else {
            console.log(`E: [USER REGISTRATION] Member ID already exists (REQ_ID: ${id})`)
        }
    } catch(e) {
        result = false
        console.log(`E: [USER REGISTRATION] ${e} (REQ_ID: ${id})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function userLogin(id, pw) {
    let result = {
        success: false,
        nickname: ''
    };
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const res = await conn.query("SELECT nickname FROM member WHERE id=? AND pw=?", [id, pw])
        if (res.length == 1) {
            // 비밀번호 일치함
            result.success = true
            result.nickname = res[0].nickname
            console.log(`I: [USER LOGIN] login complete (REQ_ID: ${id})`)
        } else {
            console.log(`E: [USER LOGIN] incorrect password (REQ_ID: ${id})`)
        }
    } catch(e) {
        result.success = false
        console.log(`E: [USER LOGIN] ${e} (REQ_ID: ${id})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function checkID(id) {
    let result = false
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const res = await conn.query("SELECT count(*) 'cnt' FROM member WHERE id=?", [id])
        const checkCnt = res[0]['cnt'] ?? 1
        if (checkCnt == 0) {
            // 아이디 중복 X
            result = true
            console.log(`I: [CHECK ID] check complete (REQ_ID: ${id})`)
        } else {
            console.log(`E: [CHECK ID] already exists (REQ_ID: ${id})`)
        }
    } catch(e) {
        result = false
        console.log(`E: [CHECK ID] ${e} (REQ_ID: ${id})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function getUserInfo(handle) {
    let result = {
        success: false,
    }
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const res = await conn.query("SELECT uid, nickname, join_y, join_m, join_d FROM member WHERE id=?", [handle])
        if (res.length == 1) {
            const tempRes = res[0]
            const tempUID = tempRes['uid']
            const tempNickname = tempRes['nickname']
            const tempY = tempRes['join_y']
            const tempM = tempRes['join_m']
            const tempD = tempRes['join_d']
            result.uid = tempUID
            result.nickname = tempNickname
            result.joindate = `${tempY}.${tempM < 10 ? '0' : ''}${tempM}.${tempD < 10 ? '0' : ''}${tempD}`
            result.success = true
            console.log(`I: [GET USER INFO] info send ok (REQ_ID: ${handle})`)
        } else {
            console.log(`E: [GET USER INFO] missmatch ID (REQ_ID: ${handle})`)
        }
    } catch(e) {
        result.success = false
        console.log(`E: [GET USER INFO] info send fail (REQ_ID: ${handle})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function createPlanet(handle, name, desc) {
    // CODE 0: All ok
    // CODE 1: Unknown User
    // CODE 2: Unknown Error
    let code = 0
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const uidQuery = await conn.query("SELECT uid FROM member WHERE id=?", [handle])
        if (uidQuery.length == 1) {
            const uid = uidQuery[0]['uid']
            const today = new Date()
            const todayY = today.getFullYear()
            const todayM = today.getMonth() + 1
            const todayD = today.getDate()
            const todayRaw = Date.now()
            const param = [name, desc, uid, todayY, todayM, todayD, todayRaw]
            const res = await conn.query("INSERT INTO planet VALUE (REPLACE(UUID(),'-',''), ?, ?, NULL, ?, ?, ?, ?, ?)", param)
            console.log(`I: [CREATE PLANET] success (REQ_ID: ${handle}, NAME: ${name})`)
        } else {
            code = 1
            console.log(`E: [CREATE PLANET] missmatch ID (REQ_ID: ${handle}, NAME: ${name})`)
        }
    } catch(e) {
        code = 2
        console.log(`E: [CREATE PLANET] ${e} (REQ_ID: ${handle}, NAME: ${name})`)
    } finally {
        if (conn) conn.release()
    }
    return code
}

async function createHorizon(handle, name, desc, type, pUID) {
    // CODE 0: All ok
    // CODE 1: Unknown User
    // CODE 2: Unknown Error
    let code = 0
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const uidQuery = await conn.query("SELECT uid FROM member WHERE id=?", [handle])
        if (uidQuery.length == 1) {
            const uid = uidQuery[0]['uid']
            const todayRaw = Date.now()
            const param = [pUID, name, desc, type, uid, todayRaw]
            const res = await conn.query("INSERT INTO horizon VALUE (REPLACE(UUID(),'-',''), ?, ?, NULL, ?, ?, ?, ?)", param)
            console.log(`I: [CREATE HORIZON] success (REQ_ID: ${handle}, NAME: ${name})`)
        } else {
            code = 1
            console.log(`E: [CREATE HORIZON] missmatch ID (REQ_ID: ${handle}, NAME: ${name})`)
        }
    } catch(e) {
        code = 2
        console.log(`E: [CREATE HORIZON] ${e} (REQ_ID: ${handle}, NAME: ${name})`)
    } finally {
        if (conn) conn.release()
    }
    return code
}

async function getPlanetList() {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query("SELECT p.*, m.nickname FROM planet p, member m WHERE p.manager=m.uid ORDER BY p.create_raw DESC")
        console.log(`I: [GET PLANET LIST] success`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET PLANET LIST] ${e}`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function getHorizonList(planetUID) {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query("SELECT h.*, m.nickname FROM horizon h, member m WHERE h.manager=m.uid AND group_dt=? ORDER BY create_raw DESC", [planetUID])
        console.log(`I: [GET HORIZON LIST] success (TARGET: ${planetUID})`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET HORIZON LIST] ${e} (TARGET: ${planetUID})`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function getPostList(type, uid) {
    let targetField
    if (type == 1) targetField = 'target_planet'
    else targetField = 'target_horizon'
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query(`SELECT p.uid, p.title, m.nickname, p.date, p.view_cnt, p.rcmd_cnt FROM post p, member m WHERE p.writer=m.uid AND p.${targetField}=? ORDER BY p.date DESC`, [uid])
        console.log(`I: [GET POST LIST] success (TYPE: ${type}, TARGET: ${uid})`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET POST LIST] ${e} (TYPE: ${type}, TARGET: ${uid})`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function getPostListAll() {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query(`SELECT p.uid, p.title, m.nickname, p.date, p.view_cnt, p.rcmd_cnt FROM post p, member m WHERE p.writer=m.uid ORDER BY p.view_cnt DESC`)
        console.log(`I: [GET POST LIST ALL] success`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET POST LIST ALL] ${e}`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function getPostDetail(uid) {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query(`SELECT p.uid, m.nickname, p.title, p.content, p.date, p.view_cnt, p.rcmd_cnt, p.drcmd_cnt FROM post p, member m WHERE p.writer=m.uid AND p.uid=?`, [uid])
        await conn.query("UPDATE post SET view_cnt = post.view_cnt + 1 WHERE uid=?", [uid])
        console.log(`I: [GET POST DETAIL] success (TARGET: ${uid})`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET POST DETAIL] ${e} (TARGET: ${uid})`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function writePost(handle, type, uid, title, content) {
    let result = false
    let targetField
    if (type == 1) targetField = 'target_planet'
    else targetField = 'target_horizon'
    let conn
    try {
        const todayRaw = Date.now()
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const uidQuery = await conn.query("SELECT uid FROM member WHERE id=?", [handle])
        if (uidQuery.length == 1) {
            const userUID = uidQuery[0]['uid']
            const queryRes = await conn.query(`INSERT INTO post VALUE (REPLACE(UUID(),'-',''), ?, ${type == 1 ? '?, NULL' : 'NULL, ?'}, ?, ?, ?, 0, 0, 0)`, [userUID, uid, title, content, todayRaw])
            result = true
            console.log(`I: [WRITE POST] success (REQ_ID: ${handle}, TYPE: ${type}, TITLE: ${title}, TARGET: ${uid})`)
        } else {
            console.log(`E: [WRITE POST] missmatch ID (REQ_ID: ${handle}, TYPE: ${type}, TITLE: ${title}, TARGET: ${uid})`)
        }
    } catch(e) {
        result = false
        console.log(`E: [WRITE POST] ${e} (REQ_ID: ${handle}, TYPE: ${type}, TITLE: ${title}, TARGET: ${uid})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function getCommentList(uid) {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query(`SELECT c.*, m.nickname FROM comment c, member m WHERE c.writer=m.uid AND c.post_dt=? ORDER BY c.date`, [uid])
        console.log(`I: [GET COMMENT LIST] success (TARGET: ${uid})`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET COMMENT LIST] ${e} (TARGET: ${uid})`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

async function writeComment(handle, uid, content) {
    let result = false
    let conn
    try {
        const todayRaw = Date.now()
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const uidQuery = await conn.query("SELECT uid FROM member WHERE id=?", [handle])
        if (uidQuery.length == 1) {
            const userUID = uidQuery[0]['uid']
            const queryRes = await conn.query(`INSERT INTO comment VALUE (REPLACE(UUID(),'-',''), ?, ?, NULL, ?, NULL, ?)`, [userUID, uid, content, todayRaw])
            result = true
            console.log(`I: [WRITE COMMENT] success (REQ_ID: ${handle}, CONTENT: ${content}, TARGET: ${uid})`)
        } else {
            console.log(`E: [WRITE COMMENT] missmatch ID (REQ_ID: ${handle}, CONTENT: ${content}, TARGET: ${uid})`)
        }
    } catch(e) {
        result = false
        console.log(`E: [WRITE COMMENT] ${e} (REQ_ID: ${handle}, CONTENT: ${content}, TARGET: ${uid})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function createEvent(handle, uid, title, desc, location, date) {
    let result = false
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const uidQuery = await conn.query("SELECT uid FROM member WHERE id=?", [handle])
        if (uidQuery.length == 1) {
            const userUID = uidQuery[0]['uid']
            const queryRes = await conn.query(`INSERT INTO horizon_event VALUE (REPLACE(UUID(),'-',''), ?, ?, ?, ?, ?, ?)`, [uid, userUID, title, date, location, desc])
            result = true
            console.log(`I: [CREATE EVENT] success (REQ_ID: ${handle}, TITLE: ${title}, TARGET: ${uid})`)
        } else {
            console.log(`E: [CREATE EVENT] missmatch ID (REQ_ID: ${handle}, TITLE: ${title}, TARGET: ${uid})`)
        }
    } catch(e) {
        result = false
        console.log(`E: [CREATE EVENT] ${e} (REQ_ID: ${handle}, TITLE: ${title}, TARGET: ${uid})`)
    } finally {
        if (conn) conn.release()
    }
    return result
}

async function getEventList(horizonUID) {
    let conn
    try {
        conn = await pool.getConnection()
        conn.query('use gravitas')
        const queryRes = await conn.query("SELECT e.*, m.nickname FROM horizon_event e, member m WHERE e.host=m.uid AND target=? ORDER BY date DESC", [horizonUID])
        console.log(`I: [GET EVENT LIST] success (TARGET: ${horizonUID})`)
        return queryRes
    } catch(e) {
        console.log(`E: [GET EVENT LIST] ${e} (TARGET: ${horizonUID})`)
        return []
    } finally {
        if (conn) conn.release()
    }
}

module.exports = {
    checkID,
    userRegistration,
    userLogin,
    createPlanet,
    createHorizon,
    createEvent,
    getUserInfo,
    getPlanetList,
    getHorizonList,
    getPostList,
    getPostListAll,
    getPostDetail,
    getCommentList,
    getEventList,
    writePost,
    writeComment,
}