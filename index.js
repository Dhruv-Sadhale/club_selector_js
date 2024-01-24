import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
app.set("view engine", "ejs");
app.use(express.static("public/static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res)=>{
    res.render(__dirname+"/views/index.ejs");
});
app.get("/sign-in", (req,res)=>{
    const status=true;
    res.render(__dirname+"/views/partials/login.ejs",{status:status});
})
app.post("/login", (req, res)=>{
    const loginEmail=req.body["loginEmail"];
    const loginPassword=req.body['loginPassword'];
    const isAuthenticated = true;

    if (isAuthenticated) {
        const details = { loginEmail: loginEmail, loginPassword: loginPassword };
        res.render(__dirname+"/views/partials/dashboard.ejs",{ details:details});
    } else {
        res.redirect(__dirname+"/views/partials/login.ejs"); // Redirect to login page if authentication fails
    }
});
app.get("/register",(req,res)=>{
    const status= false;
    res.render(__dirname+"/views/partials/login.ejs", {status:status});
});
app.get("/logout", (req, res)=>{

    res.render(__dirname+"/views/index.ejs");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
