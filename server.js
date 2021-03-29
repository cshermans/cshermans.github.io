const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser') 
var session = require('express-session')
var User = require('./models/User.js')
var Blog = require('./models/Blog.js')


//initialize mongo db
var db = require('./helpers/init_mongo.js')

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

app.get('/register', sessionChecker, (req, res) => {
    res.render('register.ejs')	
})
 
 //register handler, drops new users into DB
app.post('/register', async (req, res) => {
    //log users into mongodb 
    var new_user = new User();
    new_user.name = req.body.name;
    new_user.email = req.body.email;
    new_user.password = new_user.generateHash(req.body.password);
  
    new_user.save(function(err, savedUser) {
       if(err) {
          console.log(err);
          res.redirect('/register')
       }
       console.log('user added successfully!')
       req.session.user = new_user
       res.redirect('/dashboard')
    })
}) 

app.get('/login', sessionChecker, (req, res) => {
    res.render('login.ejs')	
})
 
 //login handler, verifies user in DB
app.post('/login', (req,res) => {
    //set this up with passport ideally... auth with db todo?
    var username = req.body.email
    var password = req.body.password
   
    User.findOne({email:username})
    .then(user => {
       if(user) {
          bcrypt.compare(password, user.password, function(err, result) {
             if(err) {
                //maybe send this back in res json?
                console.log(err)
                return res.redirect('/login')
             }
             else if(result){
                //let token = jwt.sign({name:user.name}, ) todo
                req.session.user = user
                console.log(req.session.user)
                console.log('Login successful')
                return res.redirect('/dashboard');
             }else {
                console.log('Password does not match')
                return res.redirect('/login')
             }
          })
       }
    })
})

// route for user logout
app.post('/logout', (req, res) => {
    if (req.session.user && req.cookies.user_id) {
        res.clearCookie('user_id');
        console.log('logout successful')
        res.redirect('/');
    } else {
       res.redirect('/login');
    }
});

app.get('/new_blog', (req, res) => {
    res.render('new_blog.ejs')	
})

app.post('/new_blog', (req, res) => {
    var new_blog = new Blog();
    new_blog.text = req.body.text
    new_blog.user = req.session.user.email

    new_blog.save(function(err, savedUser) {
        if(err) {
           console.log(err);
           console.log('not ok')
           res.redirect('/dashboard')
        }
        console.log('ok blog submit')
        res.redirect('/dashboard')
        
     })
})

app.get('/dashboard', (req, res) => {
    res.render('dashboard.ejs')	
})
app.listen(9001) 