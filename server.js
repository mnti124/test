const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const secretkey = require('./secretkey.js');
console.log(secretkey);
//Stripe publishable key
const stripe = require('stripe')(secretkey);
const uuid = require('uuid');
//parse appliation in x-www urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//parse application in json format
app.use(bodyParser.json());
app.use(cors());


//Route
app.get('/', function(req,res){
    res.send('It works');
})

//Post route will allow customer to charged once they put their info: all coming from 
// front-end: input field etc...inside of the form tag  
app.post('/payment', async(req,res)=>{

    //Once the client fill up their information: it is passed to the server in a json format
    //which is captured inside of req.body.
    //req.body contains proeprties such as: product, email, name etc..these are called tokens. 
    //tokens are objects that allows our server to identify information required to 
    //make api calls to other servers
    //Both product and token are passed from the front-end
    const {product, token} = req.body;//deconstructoring object

    console.log('Product info ' + product.price);
    console.log('Token: ' + token.id);
    //unique key generated to avoid customer being charged more than once
    //const idemepotencyKey = uuid();
    try{
        const customer = await stripe.customers.create({
            //If this is process succesffully it will return a promise
            email: token.email,
            source: token.id,
            description: 'My first customer'
        });
        const chargeCustomer = await stripe.charges.create({
            amount: product.price,
            currency: 'usd',
            customer: customer.id,
            receipt_email: token.email,
            description: `Purchased: ${product.name}`,
            shipping: {
                //card is a property from the token that contains information about the user
                name: token.card.name,
                address: {
                    country: token.card.address_country,
                    line1: 'safjdslfj'
                }
            }

        })
        // .then(response => {
            res.status(201).send({
                'Success': 'Successful payment'
            })
        // })
        //Sending a message to user if charge was successfull
        
        
    }catch(e){
        
        console.log(e);
    }
   
})

const port = process.env.NODE_ENV || 8080;

app.listen(port, function(){
    console.log('Server listening at port 8080');
})
