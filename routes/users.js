var express = require('express');
const expressValidator = require('express-validator');
var router = express.Router();
const { body, validationResult } = require('express-validator');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
const config = require('../config/database');
const passport = require('passport');

// Register the user with the given attributes
router.post('/register', function(req, res){
    // sanitize 
    if (req.body.name != undefined && req.body.password != undefined 
        && req.body.age != undefined && req.body.gender != undefined 
        && req.body.phone != undefined
        && req.body.city != undefined) {

        body('phone', 'valid phone required').isNumeric();
        body('age', 'valid age required').isNumeric();
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({success: false, msg: "Please provide valid user infomation"});
        }
        if (!/m|f/.test(req.body.gender)) {
            return res.json({success: false, msg: "Please provide valid gender"});
        } else {
            
            body("name").trim().escape();
            body("city").trim().escape();

            // Create a new instance of the user
            var newUser = new User({
                name: req.body.name,
                password: req.body.password,
                age: req.body.age,
                gender: req.body.gender,
                phone: req.body.phone,
                city: req.body.city,
            });

            // Add user to the database
            User.addUser(newUser, function (err) {
                if(err){
                    return res.json({success: false, msg: err.errmsg});
                } else {
                    return res.json({success: true, msg: "User registered"});
                }
            });
        }
    } else{
        return res.json({success: false, msg: "Fill in all blanks"});
    } 
});

// Login with the given email and password
router.post('/login', function (req, res) {
    // sanitize
    if ((req.body.name != undefined || req.body.phone != undefined) && req.body.password != undefined) {

        if (req.body.phone != undefined) {
            body('phone', 'valid phone required').isNumeric();
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({success: false, msg: "Please provide valid user infomation"});
        }

        var name = req.body.name;
        var phone = req.body.phone;
        var password = req.body.password;

        if (name != undefined) {
            User.getUserByName(name, function (err, user) {
                if (err) {
                    return res.json({success: false, msg: err.errmsg});
                }
                if (!user) {
                    return res.json({success: false, msg: "User not found"});
                }
                User.comparePassword(password, user.password, function (err, isMatch) {
                    if (err) {
                        return res.json({success: false, msg: err.errmsg});
                    }

                    // Assign the token to the user
                    if (isMatch) {
                        var token = jwt.sign(user.toJSON(), config.secret, {
                            expiresIn: 86400 // 24h
                        });

                        // return the token and the generated userID
                        return res.json({
                            success: true,
                            token: 'JWT ' + token,
                            user: user
                        });
                    } else {
                        return res.json({
                            success: false,
                            msg: "Wrong password"
                        });
                    }
                });
            });
        } else {
            User.getUserByPhone(phone, function (err, user) {
                if (err) {
                    return res.json({success: false, msg: err.errmsg});
                }
                if (!user) {
                    return res.json({success: false, msg: "User not found"});
                }
                User.comparePassword(password, user.password, function (err, isMatch) {
                    if (err) {
                        return res.json({success: false, msg: err.errmsg});
                    }

                    // Assign the token to the user
                    if (isMatch) {
                        var token = jwt.sign(user.toJSON(), config.secret, {
                            expiresIn: 86400 // 24h
                        });

                        // return the token and the generated userID
                        return res.json({
                            success: true,
                            token: 'JWT ' + token,
                            user: user
                        });
                    } else {
                        return res.json({
                            success: false,
                            msg: "Wrong password"
                        });
                    }
                });
            });
        }
        
    } else {
        return res.json({success: false, msg: "Missing name/phone/password"});
    }

});

router.get('/get', passport.authenticate('jwt', {session: false}), function (req, res){
    return res.json({success: true, user: req.user});
});

module.exports = router;