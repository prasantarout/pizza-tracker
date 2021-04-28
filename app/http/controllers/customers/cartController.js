function cartController(){
    return {
       index (req,res){
        res.render('customer/cart')
       },
       update(req,res){
        //    let cart={
        //        items:{
        //            pizzaId:{items:pizzaObject,qty:0},

        //        },
        //        totalQty:0,
        //        totalprice:0
        //    }
//for the first time creating cart and adding basic object structure
        if(!req.session.cart){
            req.session.cart={
                items:{},
                totalQty:0,
                totalPrice:0
            }
         }
        let cart = req.session.cart
        
//check if item does not exits in cart
 if(!cart.items[req.body._id]){
 cart.items[req.body._id]={
     items:req.body,
     qty:1,
 }
 
 cart.totalQty=cart.totalQty+1;
 cart.totalPrice=cart.totalPrice +req.body.price// to get all the items of the pizza in the total number if you want to add your cart
   
}else{
    cart.items[req.body._id].qty= cart.items[req.body._id].qty + 1 //to maximize the quantity of the items
    cart.totalQty=cart.totalQty +1 //adding total quantity of the items in cart
    cart.totalPrice=cart.totalPrice +req.body.price//to add the total price of the items when the body executed and calculate the total price and add to the cart
     
}

 return res.json({totalQty:req.session.cart.totalQty}) //to send the items into the cart and added into the cart

       }
    }
}
module.exports=cartController