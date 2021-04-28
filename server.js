const dotenv = require('dotenv').config()
const res = require('express')
const express=require('express')
const app=express()
const ejs =require('ejs')
const path=require('path')
const expresslayout=require('express-ejs-layouts')
const PORT =process.env.PORT || 3000
const mongoose=require('mongoose')
const session=require('express-session')
const flash=require('express-flash')
const mongoDBStore =require('connect-mongo')
const passport=require('passport')
const Emitter=require('events')
const fs=require('fs')


//database connection
// const url='mongodb://localhost/pizza';
mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true,useCreateIndex:true,useUnifiedTopology:true,useFindAndModify:true}
);
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log('database connected....');
}).catch(err=>{
    console.log('connection failed...')
});


//sessions store in database
const mongoStore=new mongoDBStore({
    mongoUrl:'mongodb://localhost:27017/pizza',
    collection:'session'
})

//event emitter
const eventEmitter=new Emitter()
app.set('eventEmitter',eventEmitter)


//session configuration

app.use(session({
    secret:process.env.COOKIE_SECRET,
   resave:false,
   store:mongoStore,
    saveUninitialized:false,
    cookie:{maxAge:1000*60*60*24},//24hours equal
    // cookie:{maxAge:1000*15}
}));

//passport config

const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

//global middleware

app.use((req,res,next)=>{
res.locals.session=req.session
res.locals.user=req.user
next()
})

//using express-flash
app.use(flash())

//set template engine
app.use(expresslayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

//assets

app.use(express.static('public'))
app.use(express.urlencoded({ extended:false }))
app.use(express.json())
require('./routes/web')(app)

 const server= app.listen(PORT,()=> {
console.log(`lisatening on port ${PORT}`)
})

//socket
 const io=require('socket.io')(server)
io.on('connection',(socket)=>{

    //join to client connect
    
    socket.on('join',(orderId) => {
        socket.join(orderId)
    })
})
eventEmitter.on('orderUpdated',(data)=>{

    io.to(`order_${data.id}`).emit('orderUpdated',data)
    
    })
    eventEmitter.on('orderPlaced',(data) => {
        io.to('adminRoom').emit('orderPlaced',data)
    })
  