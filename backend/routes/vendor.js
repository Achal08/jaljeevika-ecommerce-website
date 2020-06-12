const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var url = require('url');
var http = require('http');
const { vforwardAuthenticated } = require('../config/auth-vendor');
//const Regex = require("regex");

// Vendor Model
const Vendor = require('../models/Vendor');
const contact = require('../models/Vendorcontact')

// Welcome Page
router.get('/', vforwardAuthenticated, (req, res) => res.render('vendorhome'));

// Login Page
router.get('/login', vforwardAuthenticated, (req, res) =>res.render('vendorlogin'));

// Contact Page
router.get('/contact', vforwardAuthenticated,  (req, res) => res.render('vendorcontact'));

// Registration Page
router.get('/register', vforwardAuthenticated,  (req, res) => res.render('vendorreg'));

// Contact Handle
router.post('/contact',(req,res )=>{
    const name = req.body.name
    const email = req.body.email
    const subject = req.body.subject
    const message = req.body.message
    let errors =[]

    if (!name|| !email || !subject || !message){
        errors.push({msg :"Please all the required fields"})
    }
    if (errors.length >0){
        res.render('vendorcontact', {
            errors,})
    }

    const newmessage = contact({
        name, email, subject, message
    })

    newmessage.save().then(() => {
        let success_msg = "successfully sent!"
        res.render('vendorcontact',{success_msg})
    }).catch(()=>{
        res.send("Err")
    })

   /* contact.find({}, (err, data)=>{
        console.log(data)
    })*/
});

// Send Handle
router.post('/send', (req, res)=>{
    const customerid = req.body.customerid;
    const vendorid = req.body.vendorid;
    const message = req.body.message;
    if (!customerid || !vendorid || !message){
        errors.push({ msg: 'Please type something'});
        
    }
    if(errors.length >0){
        res.render('vendorcontact', {
            errors,
        });
    }
});

// Register Handle
router.post('/register', (req, res) => {
    
    const name = req.body.name;
    const vendorname = req.body.vendorname
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const password2 = req.body.password2;
    const pancard = req.body.pancard;
    const gst = req.body.gst;
    const address1 = req.body.address1;
    const address2 = req.body.address2
    const landmark = req.body.landmark;
    const district = req.body.district;
    const state = req.body.state;
    const country = req.body.country;
    const pincode = req.body.pincode;
    const conditions = req.body.conditions;
    let errors = [];

    // Validation

    // Check required fields
    if(!name || !pancard || !gst|| !vendorname || !password || !password2 || !email || !phone || !address1 || !address2 || !district || !state || !country || !pincode){
        errors.push({ msg: 'Please fill in all the required fields'});
    }

    // Check passwords match
    if(password !== password2){
        errors.push({ msg: 'Passwords do not match'});
    }

    // Check password length
    if(password.length < 6){
        errors.push({ msg: 'Password should be at least 6 characters long'});
    }

    if(conditions !="agreed"){
        errors.push({msg :'Please agree to the use of privacy and conditions'})
    }

    if(errors.length >0)
    {
        res.render('vendorreg', {
            errors,
            name,
            vendorname, 
            email, 
            phone,
            password, 
            gst, 
            pancard, 
            address1, 
            address2, 
            landmark,
            district, 
            state, 
            country, 
            pincode
        });
    }
    else
    {   
        // Validation passed
        Vendor.findOne({ email: email})
            .then(vendor => {
                if(vendor)
                {
                    // Vendor exists
                    errors.push({ msg: 'Email is already registered'});
                    res.render('vendorreg', {
                        errors,
                        name,
                        vendorname, 
                        email, 
                        phone,
                        password, 
                        gst, 
                        pancard, 
                        address1, 
                        address2, 
                        landmark,
                        district, 
                        state, 
                        country, 
                        pincode
                    });
                } 
                else
                {
                    const newvendor   = new Vendor({
                        name,
                        vendorname, 
                        email, 
                        phone,
                        password, 
                        gst, 
                        pancard, 
                        address1, 
                        address2, 
                        landmark,
                        district, 
                        state, 
                        country, 
                        pincode
       
                    });
                    
                    // Hash Password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newvendor.password, salt, (err, hash) => {
                          if (err) throw err;
                          newvendor.password = hash;
                          newvendor
                            .save()
                            .then(user => {
                              req.flash(
                                'success_msg',
                                'You are now registered and can log in'
                              );
                              res.redirect('/vendor/login');
                            })
                            .catch(err => console.log(err));
                        });
                    });
                }
            });
    }
});

// Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('vendor', {
      successRedirect: '/vendordashboard',
      failureRedirect: '/vendor/login',
      failureFlash: true
    })(req, res, next);
});
  
// Logout Handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/vendor/login');
});

module.exports = router; 