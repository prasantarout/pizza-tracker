import { loadStripe } from '@stripe/stripe-js' 
import {placeOrder} from './apiService'
import {CardWidget} from './CardWidget'

export async function initStripe(){

    const stripe = await loadStripe('pk_test_51IbAY4SEfgyVBzoTTz89LHwThW7ReGOOlwQuwKWqb7JkYhrEx6ZugTgqSuWzt4yTTK2NjtmN7hveLAOxDjSAiEYs00FJuwD0mx');
    
    let card=null;
  

            const paymentType=document.querySelector('#paymentType');
            if(!paymentType){
                return;
            }
            paymentType.addEventListener('change',(e)=>{

                // console.log(e.target.value)
                if(e.target.value === 'card'){
            //display widet
            
            card=new CardWidget(stripe)
          card.mount()
     
    }else{
      //not to display
       card.destroy()
       }
    })
    
    
    //ajax call
const paymentForm=document.querySelector('#paymentForm');
if(paymentForm){
 
  paymentForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    let formData = new FormData(paymentForm);
    
    let formObject={}
    for(let [key,value] of formData.entries()){
      
      formObject[key]=value
      
    }

if(!card){
  //ajax call
placeOrder(formObject);
return;
}
const token=await card.createToken()
formObject.stripeToken =token.id;
placeOrder(formObject);
//verify card


 })
}
}