const User =require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')
function authController(){

    const _getRedirectUrl =(res) =>{
        return res.user.role ==='admin' ? '/admin/orders' : '/customer/orders'
    }

    return {
        login (req,res){
            res.render('auth/login')
        },
        postLogin(req,res,next){
            const{email,password} =req.body
            //validate request
            if(!email || !password){
                req.flash('error','all field are required')
                return res.redirect('/login')
            }
passport.authenticate('local',(err,user,info)=>{
    if(err){
        req.flash('error',info.message)
        return next(err)
    }
    if(!user){
        req.flash('error',info.message)
        return res.redirect('/login')
    }
    req.login(user,(err)=>{
if(err){
    req.flash('error',info.message)
    return next(err)
}

return res.redirect(_getRedirectUrl(req))

    })

})(req,res,next)
        },
        register (req, res){
            res.render('auth/register')
        },
       async postRegister(req, res){
            const { name,email,password }=req.body
           //validate request
           if(!name || !email || !password ){
            req.flash('error','all fields are required') 
            req.flash('name',name) 
            
            req.flash('email',email)
             
   
            return res.redirect('/register')
           }
//check if email is exist
User.exists({email:email},(err,result)=>{
    if(result){
        req.flash('error','Email is alreary exist') 
            req.flash('name',name) 
            req.flash('email',email)

        
            return res.redirect('/register')
    }
})

//hash password

const hashedPassword= await bcrypt.hash(password,10)
// const hashPassword= await bcrypt.hash(confirmpassword,10)

//create a user
const user=new User({
    name,
    
    email,
    
    password:hashedPassword,
   
    

})
user.save().then((user) => {


return res.redirect('/')
}).catch( err =>{
    console.log(err)
    // req.flash('error','something went wrong') 
    return res.redirect('/register')
})


 },
 logout(req,res){
     req.logout()
     return res.redirect('/login')

 }

    }
}
module.exports=authController