const jwt = require('jsonwebtoken')
const result = require('../utils/result')
const config = require('../utils/config')

function restAuth(req, res, next){
    const url = req.url
    console.log("restaurant auth")
    console.log(url)
    if(url === '/register' || url === '/signin') {
        next()
    } else if(url === '/categories' && req.method === 'GET') {
        next()
    } else {
        const token = req.headers.token
        if(token) {
            try{
                const payload = jwt.verify(token , config.secret)
                req.headers.user_id = payload.user_id
                next()
            } catch {
                res.send(result.createResult("Invalid Token"))
            }
        }
    }
}


module.exports = restAuth