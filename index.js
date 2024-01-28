import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";


import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import env from "dotenv";


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

const saltRounds = 10;
env.config();
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000*60*60*24,
      }// takes care of cookie duration
  })
);

app.use(express.static("public/static"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.get("/", (req, res)=>{
    res.render(__dirname+"/views/index.ejs");
});
app.get("/login", (req,res)=>{
    
    res.render(__dirname+"/views/partials/login.ejs");
})
app.get("/register", (req,res)=>{
    
    res.render(__dirname+"/views/partials/register.ejs");
})

app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  
  app.get("/dashboard", (req, res) => {
    // console.log(req.user);
    if (req.isAuthenticated()) {
      res.render(__dirname+"/views/partials/dashboard.ejs");
    } else {
      res.redirect(__dirname+"/views/partials/login.ejs");
    }
  });
  
  app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect:"/dashboard",
      failureRedirect:"/login",
    })
  );
  
  app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
  
    try {
      const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);
  
      if (checkResult.rows.length > 0) {
        res.redirect(__dirname+"/views/partials/login.ejs");
      } else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
          if (err) {
            console.error("Error hashing password:", err);
          } else {
            const result = await db.query(
              "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
              [email, hash]
            );
            const user = result.rows[0];
            req.login(user, (err) => {
              console.log("success");
              res.redirect(__dirname+"/views/partials/login.ejs");
            });
          }
        });
      }
    } catch (err) {
      console.log(err);
    }
  });
  
  passport.use(
    new Strategy(async function verify(username, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1 ", [
          username,
        ]);
        if (result.rows.length > 0) {
          const user = result.rows[0];
          const storedHashedPassword = user.password;
          bcrypt.compare(password, storedHashedPassword, (err, valid) => {
            if (err) {
              //Error with password check
              console.error("Error comparing passwords:", err);
              return cb(err);
            } else {
              if (valid) {
                //Passed password check
                return cb(null, user);
              } else {
                //Did not pass password check
                return cb(null, false);
              }
            }
          });
        } else {
          return cb("User not found");
        }
      } catch (err) {
        console.log(err);
      }
    })
  );
  
  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
  




// app.post("/login", (req, res)=>{
//     const loginEmail=req.body["loginEmail"];
//     const loginPassword=req.body['loginPassword'];
//     const isAuthenticated = true;

//     if (isAuthenticated) {
//         const details = { loginEmail: loginEmail, loginPassword: loginPassword };
//         res.render(__dirname+"/views/partials/dashboard.ejs",{ details:details});
//     } else {
//         res.redirect(__dirname+"/views/partials/login.ejs"); // Redirect to login page if authentication fails
//     }
// });
// app.get("/register",(req,res)=>{
//     const status= false;
//     res.render(__dirname+"/views/partials/login.ejs", {status:status});
// });
// app.get("/logout", (req, res)=>{

//     res.render(__dirname+"/views/index.ejs");
// });
let j=1;
for (let i=1;i<=15;i++){
app.get(`/${i}`, (req, res)=>{
    const obj=i;
    res.render(__dirname+`/views/partials/${j}.ejs`, {obj:obj});
});
}



// // adding the test quiz script
// const { Client } = pg;
// const client = new Client({
//   user: 'your_user',
//   host: 'localhost',
//   database: 'db', // Adjust this to your actual database name
//   password: '2!correctdhr',
//   port: 5432,
// });

// client.connect();

// app.get('/quiz', async (req, res) => {
//   try {
//     const result = await client.query('SELECT * FROM questions');
//     const questions = result.rows;
//     res.render('quiz', { questions });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.post('/quiz', async (req, res) => {
//   try {
//     const { userId, questionId, selectedAnswerId } = req.body;

//     await client.query('INSERT INTO user_responses (user_id, question_id, selected_answer_id) VALUES ($1, $2, $3)', [
//       userId,
//       questionId,
//       selectedAnswerId,
//     ]);

//     res.redirect('/quiz-results');
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });

// app.get('/quiz-results', async (req, res) => {
//   try {
//     const result = await client.query('SELECT * FROM user_responses WHERE user_id = $1', [userId]);
//     const userResponses = result.rows;
//     res.render('quiz_results', { userResponses });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send('Internal Server Error');
//   }
// });


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
