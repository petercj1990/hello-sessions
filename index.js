// include modules
var bodyParser          = require('body-parser');
var cookieParser        = require('cookie-parser');
var express             = require('express');
var passport            = require('passport');
var LocalStrategy       = require('passport-local').Strategy;
var session             = require('express-session');

// initialize express app
var app = express();

//"database without a database lol"
var users = [];

//console.log('im running');
// tell passport to use a local strategy and tell it how to validate a username and password
passport.use(new LocalStrategy(function(username, password, done) {
    for(var z = 0 ; z< users.length; z++){
        if (users[z].username === username && users[z].password === password) {
            return done(null, users[z]);
        }
    }
    if (username && password === 'pass') {
        var curUser = {
            username: username,
            password: password,
                keys: {}
        };
        users.push(curUser);
        return done(null, curUser);
    }
    else{
        return(done, false);
    }
}));

// tell passport how to turn a user into serialized data that will be stored with the session
passport.serializeUser(function(user, done) {
    done(null, user.username);
});

// tell passport how to go from the serialized data back to the user
passport.deserializeUser(function(id, done) {
    done(null, { username: id });
});

// tell the express app what middleware to use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// see if you are running
app.post('/health', function (req, res) {
    //res.sendStatus(200);
    res.status(200).send(passport);
});

//login
app.post('/login', 
    passport.authenticate('local'),
    function(req, res){
        res.status(200).send(req.user.keys);
    }
);


// show keys
app.get('/', function (req, res) {
    if (req.user) return res.send(req.user.keys);
    else(res.sendStatus(401));
});


// add keys
app.put('/',
    function(req, res) {
        console.log("req", req.query);
        if(req.user){
            for (var x = 0; x < users.length; x++){
                if (req.user.username === users[x].username){
                    console.log("before", users[x].keys);
                    users[x].keys[ req.query.key]= req.query.value;
                    console.log("after", users[x].keys);
                    req.user.keys = users[x].keys;
                }
            }
            return res.send(req.user.keys);
        }
        else{
            return res.sendStatus(401);
        }
    }
);

// remove keys
app.delete('/',
    function(req, res) {
        res.send('You are trynna delete' );
    });

// log the user out
app.get('/logout', function(req, res) {
    req.logout();
    res.sendStatus(200);
});

// start the server listening
app.listen(3000, function () {
    console.log('Server listening on port 3000. babab');

});

