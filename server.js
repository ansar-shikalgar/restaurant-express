const express = require('express')
const app = express()
const cors = require('cors')

const userRouter = require('./routes/users')
const restaurantsRouter = require('./routes/restaurants')
const menu_itemsRouter = require('./routes/menu_items')
const orders = require('./routes/orders')

const restAuth = require('./auth/restAuth')
const authUser = require('./auth/userAuth')

// golden rule - > middlewares run in order they are declared

// all my local routes by pass with authUser middleware
// static files (PUBLIC)
// adding static route for accessing category images from express server
app.use('/categoryImage' , express.static('categoryImages'))
// adding static route for menu_item 
app.use('/menuItemsImages' , express.static('menuItemsImages'))

app.use(cors())
app.use(express.json()) // express does not parse req bodies by default , if you dont enable body parser middleware req.body is undefined

app.use('/api/users' , authUser , userRouter)
// protected route
app.use('/api/restaurants' , restAuth , restaurantsRouter , menu_itemsRouter , orders )
  

app.listen(4000 , '0.0.0.0' , () => { 
    console.log("Server Started At Port Number 6000")
})

// app.listen(port, [hostname] , [backlog] , [callback])

// '0.0.0.0' -> it accepts request from any ip address(used for deployment)

// [backlog] - > its optional , if you want to keep optional then you should , maximum number of pending connection in queue
                            // rearly most widley used in express application 
                            // defualt values are hadled by using Node.js

// [callback] - > ensures that server started successfully