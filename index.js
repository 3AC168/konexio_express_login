const express = require("express");
const exphbs = require("express-handlebars");
const expressSession = require("express-session"); 
const MongoStore = require("connect-mongo")(expressSession);
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models").User; // same as: const User = require('./models/user); 

const port = process.env.PORT || 3000;

mongoose.connect(
    process.env.MONGODB_URI || 
    "mongodb://localhost:27017/authentication_exercise",
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }    
);

const app = express();

// Express configuration
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// enable session management
app.use(  //quand on voit app.use, c'est à dire qu'il va executer toutes les routes.
    expressSession({
        secret: "konexioasso07", //ce clé doit tout le temps caché, on va la securiser, hasher.
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// enable Passport 
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // Save the user.id to the session 
passport.deserializeUser(User.deserializeUser()); // Receive the user.id from the session and fetch the User from the DB by its ID

app.get("/", (req, res) => {
    console.log("GET /");
    res.render("home");
});

app.get("/admin", (req, res) => {  //c'est une route qui donne à la page administration
    console.log("GET /admin");
    if (req.isAuthenticated() === true) { //modifié avec "=== true" (// if(req.user.admin === true) pour le case plus complexe, à la fin de vidéo.)
        console.log(req.user); // (on voit utilisateurn, mais pas de mot de pass)
        res.render("admin", {
            user: req.user.toObject()        
        });  // peut faire ("admin", {user: req.user.toObjet()}); pour ajouter username apparu, à la fin de vidéo 
    } else {
        res.redirect("/");
    }
}); 

app.get("/signup", (req, res) => {
    console.log("GET /signup");
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});

app.post("/signup", (req, res) => {
    console.log("POST /signup"); 
    console.log(req.body);    // Ahmed a demandé ajouter. On voit ce que l'on a dans signup.handlebars
    // create a user with the defined model with
    // req.body.username, req.body.password

    // WITHOUT PASSPORT 

    // const username = req.body.username;
    // const password = req.body.password;

    //User.findOne({username: username}, (err, user) => {  //ajouter err
    //   if (user === null) {
    //    const newUser = new User({
    //      username: username,
    //      password: password,
    //    });
    //     newUser.save((err, obj) => {
    //      if (err) {
    //       console.log('/signup user save err', err);
    //       res.render('5000');
    //      } else {
    //          // Save a collection session with a token session and 
    //          // a session cookie in the browser
    //      }    
    //     });     
    //   }
    //});
    
    console.log("will signup");

    const username = req.body.username;
    const password = req.body.password;
    const confirm_password = req.body.password; 
    const email = req.body.email;
    const firstName = req.body.email;
    const surname = req.body.surname;
    const birthday = req.body.birthday.date;
    const age = req.body.age;

    // User.register(user, password, callback) - 3 parametres
    User.register(   //on utilise User.register crée par passport, on sera protégé
        new User({
            username: username, 
            email: email,
            firstName: firstName,
            surname: surname,
            birthday: birthday,
            age: age
            // other fields can be added here
        }),
        password, // password will be hasheds
        (err, email) => {    //user est changé pour email ?
            if (err) {
                console.log("/signup user register err", err);
                return res.render("signup");
            } else {
                passport.authenticate("local")(req, res, () => {  //”local” peut être celui du type de login il fait : “facebook” …
                    res.redirect("/admin");
                });
            }
        },
        confirm_password, 
        (err, email)=> {   //user est changé pour email  ? 
            if (err) {
                console.log("/signup user register err", err);
                return res.render("signup");
            } else {
                passport.authenticate("local")(req, res, () => {  //”local” peut être celui du type de login il fait : “facebook” …
                    res.redirect("/admin");
                });
            }
        }
    ) 
});

app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

app.post("/login", passport.authenticate("local", {
        successREdirect: "/admin",
        failureREdirect: "/login"
}));

// Without Passport

// app.post("/login", (req, res) => {
//   const md5 = require("md5"); // there for education purpose, if using this method, put it in the top of your file; // md5 est une méthode encryption qui n’est pas safe(sécurisé) d’aujoud’hui
//   User.find(
//     {
//       username: req.body.username,
//       password: md5(req.body.password)
//     },
//     (users) => {
//       // create a session cookie in the browser
//       // if the password is good
//       // and redirect to /admin
//     }
//   );
//   res.send("login");
// });

app.get("/logout", (req, res) => {
    console.log("GET /logout");
    req.logout();
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});