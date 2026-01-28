const express = require('express');
const jwt = require("jsonwebtoken");
const app = express();

app.use(express.json());
// const bodyparser = require("body-parser");
// app.use(bodyparser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];


const secret = "bharatmatakijay,vandematram"


function authentication(req,res,next){
 const authheader =  req.headers.authorization;


 if(authheader){
  const token = authheader.split(' ')[1];
  console.log(token);
   jwt.verify(token,secret,(err,user)=>{
    if(err){
      
      return res.status(404).send("fornidden");
    }
    req.user = user;
    console.log(user);
    next();
  }) 
 }else{
    res.status(404).send("authentication failed");
 }

}

function userAuthentication(req,res,next){
 if(req.user.role != "user"){
  return res.status(404).send("access denied");
 }
 next()
}

function adminAuthentication(req,res,next){
 if(req.user.role != "admin"){
  return res.status(404).send("access denied");
 }
 next()
}


const generatejwt = (admin) =>{
  const paylod = {username:admin.username,role:admin.role};
  return jwt.sign(paylod,secret,{expiresIn:'1h'});
}

// const usergeneratejwt = (admin) => {

// }

// Admin routes
app.post('/admin/signup', (req, res) => {
      
  const admin = req.body;
  const isexists = ADMINS.find(a=>a.username === admin.username);
  if(isexists){
    res.status(404).send("user already exists");
  }else{
    Object.assign(admin,{role:"admin"});
    ADMINS.push(admin);
    const token = generatejwt(admin);
    res.status(200).send({message:"admin created succesfully ",token});
  }
});

app.post('/admin/login',  (req, res) => {
  // logic to log in admin

  const admin = {
    username : req.body.username,
    password : req.body.password,
    role : "admin"
  }

  const user = ADMINS.find(a=>a.username===admin.username && a.password===admin.password);
  
    if(user){
    const token = generatejwt(admin);
    res.status(200).send({message  : "logged in : ", token});
    }else{
    res.status(405).send("no user exists");
    }
});

app.post('/admin/courses', authentication, adminAuthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  
  if(!course.title){
    res.status(404).send("plz pass the title of course");
    return;
  }
  if(!course.description){
    res.status(404).send("plz pass the description of course");
    return;
  }
  if(!course.price){
    res.status(404).send("plz pss the price of course");
    return;
  }
  
  course.id = Date.now();
  COURSES.push(course);
  res.status(200).json({message: "course created", courseid : course.id});
  
});

app.put('/admin/courses/:courseId',authentication, adminAuthentication, (req, res) => {
  const id = Number(req.params.courseId);
  const course = COURSES.find(a=> a.id === id);

   

  if(course){
    Object.assign(course,req.body);
    
    res.status(200).json({COURSES},"here is courses aray");
  }else{
    res.status(404).send("no course exists with id ", id);
  }

});

app.get('/admin/courses', authentication,adminAuthentication,(req, res) => {
  // logic to get all courses
  res.status(200).json(COURSES);
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  const user = {...req.body,role:"user",purchasedcourse : []};
  const isexists = USERS.find(a => user.username === a.username);
  if(isexists){
    
    res.status(404).send("user already exists");

  }else{
    USERS.push(user);
    const token = generatejwt(user);
    res.status(200).send("user created " , token);
  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  
  
  const user = USERS.find(a=>a.username === req.body.username && a.password === req.body.password);
  if(user){
   
      const token = generatejwt(user);

  res.status(200).send({"logged in succesfully" : token });
    

  }else{
   res.status(404).send("no user exists");
  }

});

app.get('/users/courses',authentication,userAuthentication, (req, res) => {
  // logic to list all courses
  res.status(200).json({courses : COURSES.filter(a=>a.published)})
});

app.post('/users/courses/:courseId',authentication,userAuthentication,(req,res)=>{
  // logic to purchase a course
  const id = parseInt(req.params.courseId);
  const course = COURSES.find(a=>a.id === id);
  
  const username = req.user.username;
  
  const user = USERS.find(a=>a.username === username);
  user.purchasedcourse.push(course);
  res.status(200).send("course purchased succesfully : " , course);
});

app.get('/users/purchasedCourses',authentication,userAuthentication, (req, res) => {
  // logic to view purchased courses
  const username = req.user.username;
  const user = USERS.find(a=>a.username===username);
  res.status(200).json({purchasedcourse:user.purchasedcourse});
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
