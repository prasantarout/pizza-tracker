const localStrategy=require('passport-local').Strategy
const User=require('../models/user')
const bcrypt=require('bcrypt')

function init(passport){
passport.use(new localStrategy({ usernameField:'email'}, async (email,password,done)=>{
//logic
//check if email exist
const user=await User.findOne({email:email})
if(!user){
    return done(null,false,{message:'no user with this email'})
}

bcrypt.compare(password,user.password).then(match=>{
    if(match){
        return done(null,user,{message:'login successfully'})
    }
    return done(null,false,{message:'wrong username or password'})
}).catch(err=>{
    return done(null,false,{message:'somethings went wrong'})
})
}))
passport.serializeUser((user,done)=>{
    done(null,user._id)

})
passport.deserializeUser((id,done)=>{
User.findById(id,(err,user)=>{
done(err,user)
})
})

}
module.exports=init