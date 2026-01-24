const express = require('express');
const app = express();

app.use(express.json());
// const bodyparser = require("body-parser");
// app.use(bodyparser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];


function Adminauthentication(req,res,next){
  const {username, password}  = req.headers;
  console.log(username  + " " +  password);
  console.log(ADMINS);
  const isexists = ADMINS.find(a=>a.username === username && a.password === password);

  console.log(isexists);
 
  if(isexists){
    next();
  }else{
    res.status(404).send("user or password is wrong or not found");
  }

}

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
// console.log(req.body);
   const admin = req.body;
   console.log(admin);
  const isexists = ADMINS.find(a=>a.username === admin.username);
  if(isexists){
    res.status(404).send("user already exists");
  }else{
    ADMINS.push(admin);
    res.status(200).send("user created succesfully");
  }
});

app.post('/admin/login',Adminauthentication, (req, res) => {
  // logic to log in admin
    res.status(200).send("user logged in succesfully");
  
});

app.post('/admin/courses', Adminauthentication, (req, res) => {
  // logic to create a course
  const course = req.body;
  console.log(course);
  // if(!course.title){
  //   res.status(404).send("plz pass the title of course");
  //   return;
  // }
  // if(!course.description){
  //   res.status(404).send("plz pass the description of course");
  //   return;
  // }
  // if(!course.price){
  //   res.status(404).send("plz pss the price of course");
  //   return;
  // }
  
  course.id = Date.now();
  COURSES.push(course);
  res.status(200).json({message: "course created", courseid : course.id});
  
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
