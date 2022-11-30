const jwt = require('jsonwebtoken');
const { restart } = require('nodemon');
const { findById } = require('../models/users.models');
const User = require("../models/users.models");

function authenticateToken(req, res, next) 
{
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; //fetch token from the request body

    if (token == null) {
        return res.status(401).json({
            status: "Failure",
            data: {
                message: "Invalid Token => Token is empty"
            }
        });
    }

    // "MoosaHashim" is my secret key
    jwt.verify(token, "MoosaHashim",(err, user)=> {
        
        if(err) 
        {
            return res.sendStatus(403).json({
                status: "Fail",
                data: {
                    message: "Invalid Token => Unauthorised Access detected"
                }
            });
        }
        else
        {
            req.user = user;
            next();
        }    
    })
}

function generateAccessToken(userName) 
{
    //token will be generated against the data i.e; fullname you enter
    //secret key used will be "Moosa Hashim"
    return jwt.sign({
        data: userName}, 
        "MoosaHashim", {
        expiresIn: "6h"
    });
}


function checkToken(req, res, next) 
{
    const token  = authHeader && authHeader.split(" ")[1];

    if (token == null) 
    {
        return res.status(401).json({
            status: "Failure",
            data: {
                message: "Invalid Token => Token is empty"
            }
        });
    }

    jwt.verify(token, "MoosaHashim", (err, user) => {
        if (err) 
        {
            return res.sendStatus(403).json({
                status: "Failure",
                data: {
                    message: "Incorrect Token => Unauthorised Access detected"
                }
            });
        }
        req.user = user;
        return res.json({user: user, token});
    });
}

function checkRole(req, res) 
{
    const user = User.findById(req.body._id)
    .then(result => {

        if(result.userType !== 'ADMIN') {
            res.sendStatus(403).json({
                status: "Failure",
                data: {
                    message: "Unauthorised access => you are not an aadmin"
                }
            });
            return res.json({isAllowed: "false"});
        }
        if(result.userType == "USER") {
            isAllowed = true;
            return res.json({isAllowed: "true"});
        }     
    })
}

function EmailValidation(enteredEmail)
{
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(enteredEmail.value.match(mailformat))
    {
       return true;
    }
    else
    {
       return false;
    }
}

module.exports = {
    authenticateToken,
    generateAccessToken,
    checkToken,
    checkRole,
    EmailValidation
}