const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser') 
var session = require('express-session')
var User = require('./models/User.js')
//var db = require('./helpers/init_mongo.js')

app.set('view-engine', 'ejs')
//add a bit of middleware
app.use(cookieParser())
app.use(express.urlencoded({extended : false}))

app.use(function(req,res,next) {
    res.setHeader("Content-Security-Policy", "script-src 'self' https://apis.google.com");
    return next();
 })

app.use(session({
    //change session secret randomly or whatever todo!
    //also base key of mongo id? TODO
    key: 'user_id',
    secret: 'work hard',
    resave: false,
    saveUninitialized: false,
    cookie : {
        expires: 6000000
    }
}));

//checker to see if hanging cookie
app.use((req, res, next) => {
   
    if (req.cookies.user_id && !req.session.user) {
       console.clear('cookie cleared')
       res.clearCookie('user_id');        
    }
    
    next();
 });

 //lil cute middleware to check/redirect users if their session is saved
var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_id) {
        res.redirect('/dashboard');
    } else {
        next();
    }    
};

app.get('/', (req, res) => {
    res.render('index.ejs')	
})



app.listen(9001) 