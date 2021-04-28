
const Order=require('../../../models/order')
const moment=require('moment')
const stripe=require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController(){
    return {
        store(req,res){
          
     //validate request to the user input

     const{name,phone,address,state,dist,pincode,stripeToken,paymentType}=req.body
     if(!name || !phone || !address  || !state || !dist || !pincode ){
         
        return res.status(422).json({ message :'all fields are required'});
       
        
     }
    //create order
     const order=new Order({
         customerId:req.user._id,
         items:req.session.cart.items,
         name:name,
         phone:phone,
         address:address,
         state:state,
         dist:dist,
         pincode:pincode
       
     })//order save on database
          order.save().then(result =>{
         Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
            // req.flash('success','order placed successfully')
            
            //stripe payment/ordr payment/create payment
            if(paymentType === 'card'){
           stripe.charges.create({
               amount:req.session.cart.totalPrice * 100,
               source:stripeToken,
               currency:'INR',
               description:`pizza order:${placedOrder._id}`
           }).then(()=>{
            placedOrder.paymentStatus =true
            placedOrder.paymentType=paymentType
           
            placedOrder.save().then((ord)=>{
               
            //emit
            const eventEmitter = req.app.get('eventEmitter')
            eventEmitter.emit('orderPlaced',ord)
            delete req.session.cart
            return res.json({ message :'payment successful,order placed successfully'});
           
        }).catch((err)=>{
           
            console.log(err)
           
        })
           }).catch((err)=>{
               console.log(err)
            delete req.session.cart
            return res.json({ message :'order placed but payment failed ,please pay at delivery time'});
            });
           
        }else{
         delete req.session.cart
         return res.json({ message :'order placed succefully'});
        }
   
  })
      

     }).catch(err =>{
       
        return res.status(500).json({ message :'something went wrong'});  
        //  req.flash('error',"something went wrong")
        //  return res.redirect('/cart')
     })

        },
       async index(req,res){
            const orders=await Order.find({customerId:req.user._id},
                null,
                {sort:{'createdAt':-1}})
             res.header('cache-control', 'no-cache, private, no-store, must-revalidate, max-scale=0, post-check=0, pre-check=0')

                res.render('customer/orders',{orders:orders,moment:moment})
         },
        async show(req,res){
         
            const order =await Order.findById(req.params.id)

            //authorised user
            if(req.user._id.toString() === order.customerId.toString()){
               return  res.render('customer/singleOrder',{order:order})

            }
            return res.redirect('/')
         }
    }
}
module.exports=orderController