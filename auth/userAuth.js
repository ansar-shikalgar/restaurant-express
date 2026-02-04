const jwt = require('jsonwebtoken')
const result = require('../utils/result') 
const config = require('../utils/config')

function authUser(req, res , next) {
    // for checking incoming requests and decrypt the token for different incoming request 
    

    console.log({
    url: req.url,
    originalUrl: req.originalUrl,
    method: req.method
    })
    
    const url = '/api/users'
   
    if(req.originalUrl === '/api/users/signup' || req.originalUrl === '/api/users/signin' || (`${url}/` && req.method === 'GET' )) { // for these two routes no need to verify/ authorization token
        next()  
    } else if ( (req.originalUrl === `${url}/restaurants` && req.method ==='GET') || (req.originalUrl === `${url}/coupons` && req.method === 'GET') || (req.originalUrl === `${url}/menu_items` && req.method === 'GET') || (req.originalUrl === `${url}/orderItem` && req.method === 'GET') )  {
        next()   
    } else {
        const token = req.headers.token 
        if(token){
            try{
                const payload = jwt.verify(token , config.secret)
                req.headers.user_id = payload.user_id
                next()
            } catch{
                res.send(result.createResult("Token Invalid"))
            }
        } else {
            res.send(result.createResult("Token Missing"))
        }
    }
}

module.exports = authUser