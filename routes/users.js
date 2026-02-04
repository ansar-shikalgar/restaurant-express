const express = require('express')
const bcrypt = require('bcrypt')
const router = express.Router()
const result = require('../utils/result')
const pool = require('../utils/db')
const config = require('../utils/config')
const jwt = require('jsonwebtoken')


// signup users
console.log("userSignup")
router.post('/signup' , (req, res) => {
    const { full_name , email , password , phone  } = req.body
    const sql = `insert into users(full_name , email , password , phone ) values (? , ? , ? , ? )`
    bcrypt.hash(password , config.SALT_ROUND , (err , hashedPass) => {
        if(hashedPass) {
            pool.query(sql , [full_name , email  , hashedPass , phone , 'customer'] , (err , data) => {
                if(err) {
                    if(err.code == "ER_DUP_ENTRY"){
                        // detect which field cause duplication
                        if(err.message.includes('email')) {
                            res.send(result.createResult("This email is already registered. Try logging in instead."))
                        } 
                        if(err.message.includes('phone')) {
                            res.send(result.createResult("This phone number is already registered. Please use a different number."))
                        }
                    } else {
                        res.send(result.createResult("Duplicate entry detected" , null))
                    }
                } else {
                    res.send(result.createResult(null ,data))
                }
            })
        } else {
            res.send(result.createResult(err , null))
        }
    })
})


// signin users 
router.get('/signin' , (req, res) => {
    const { email , password } = req.body 
    const sql = `select * from users where email = ?`
    pool.query(sql, [email], (err , data) =>{
        if (err) {
            res.send(result.createResult(err, null))
        } else if(data.length == 0) {
            res.send(result.createResult("Invalid Email"))
        } else {
            bcrypt.compare(password , data[0].password , (err , hashedPassword) =>{
            const payload = {
                user_id : data[0].user_id
            }
            const token = jwt.sign(payload, config.secret)
                if(hashedPassword) {
                    const user = { 
                        token , 
                        full_name:data[0].full_name ,
                        email:data[0].email , 
                        phone:data[0].phone ,
                        role:data[0].role
                    }
                    res.send(result.createResult(err , user))
                } else {
                   res.send(result.createResult("Invalid Password")) 
                }
            })
        }
    })
})

// users address
router.post('/address', (req, res) => {
    const user_id = req.headers.user_id
    const { address_line , city , state , pincode , label } = req.body
    const sql = `insert into user_addresses(address_line  ,user_id ,  city , state , pincode , label) values ( ? , ? , ? , ? , ? , ? )`
    pool.query(sql, [address_line , user_id , city , state , pincode , label] , (err , data) => {
        if(err) {
            res.send(result.createResult(err, null))
        } else {
            res.send(result.createResult(null , data))
        }
    })
})

// users delete address
router.delete('/address' , (req, res) => {
    const user_id = req.headers.user_id
    const sql = `delete from user_addresses where user_id = ?`
    pool.query(sql , [user_id] , (err , data) =>{
        if(err) {
            res.send(result.createResult(err , null))
        } else {
            res.send(result.createResult(null, data))
        }
    })
})

// users can see all the restaurants
router.get('/restaurants' , (req, res) =>{
    const sql = `select * from restaurants` 
    pool.query(sql , (err , data) =>{
        if(err) {
            res.send(result.createResult(err , null))
        } else {
            res.send(result.createResult(null , data))
        }
    })
})

// to get particular restaurants coupons 
router.get('/coupons' , (req, res) =>{
    const{ restaurant_id } = req.body
    const sql = `select * from coupons where restaurant_id = ?` 
    pool.query(sql , [restaurant_id] , (err , data) =>{
        if(err) {
            res.send(result.createResult(err , null))
        } else if (data.length == 0) {
            res.send(result.createResult(`Restaurant Not Found With Id : ${restaurant_id}`))
        } else {
            res.send(result.createResult(null , data))
        }
    })
})

// to get all menuItems for particular restaurant 
router.get('/menu_items' , (req, res) => {
    const { restaurant_id } = req.body
    const sql = `select * from menu_items where restaurant_id = ?`
    pool.query(sql , [ restaurant_id ] , (err, data) => {
        if(err) {
            res.send(result.createResult(err , null))
        } else if( data.length == 0 ) {
            res.send(result.createResult(`Restaurant Not Found With Id : ${restaurant_id}`))
        } else {
            res.send(result.createResult(null , data))
        }
    })
})

// to add reviews fro users 
router.post('/review',(req,res)=>{
    const user_id = req.headers.user_id
    const {restaurant_id,item_id,rating,comment,created_at}= req.body
    const sql = `insert into reviews (user_id,restaurant_id,item_id,rating,comment,created_at) values (?,?,?,?,?,?)`
    pool.query(sql,[user_id,restaurant_id,item_id,rating,comment,created_at],(err,data)=>{
        res.send(result.createResult(err,data))
    })
})

// to get all review using rest_id , or item_id
router.get('/review',(req,res)=>{
    const user_id = req.headers.user_id
    const {restaurant_id,item_id} = req.body
    const sql = `select * from reviews where user_id = ? and restaurant_id = ? and  item_id = ?`
    pool.query(sql,[user_id,restaurant_id,item_id],(err,data)=>{
        res.send(result.createResult(err,data))
    })
})

// to complaint for users 
router.post('/complaint',(req,res)=>{
    const user_id = req.headers.user_id
    const {order_id,message,status,response} = req.body
    const sql = `insert into complaints (user_id,order_id,message,status,response) values (?,?,?,?,?)`
    pool.query(sql,[user_id,order_id,message,status,response],(err,data)=>{
        res.send(result.createResult(err,data))
    })
})

//add orderItems 
router.post('/orderItem',(req,res)=>{
    const {order_id,item_id,quantity,price} = req.body
    const sql = `insert into order_items (order_id,item_id,quantity,price) values (?,?,?,?)`
    pool.query(sql,[order_id,item_id,quantity,price],(err,data)=>{
        res.send(result.createResult(err,data))
    })
})

// get all users 
router.get('/' , (req, res) => {
    const sql = `select * from users`
    pool.query(sql , (err, data) => {
        res.send(result.createResult(err , data))
    })
})

module.exports = router