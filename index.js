const express = require('express');
const jwt = require("jsonwebtoken");
const app = express();
const mongoose = require("mongoose");

app.use(express.json());
// const bodyparser = require("body-parser");
// app.use(bodyparser.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];


const secret = "bharatmatakijay,vandematram";

const UserSchema = new mongoose.Schema({
  username:String,
  password:String,
  purchasedcourse:[{type:mongoose.Schema.Types.ObjectId , ref:'Course'}]
});

const AdminSchema = new mongoose.Schema({
  username:String,
  password:String
})

const CourseSchema = new mongoose.Schema({
  title:String,
  description:String,
  price : String,
  published:Boolean
})


const User = mongoose.model('user',UserSchema);
const Admin = mongoose.model('admin',AdminSchema);
const Course = mongoose.model('courses',CourseSchema);


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

mongoose.connect('mongodb+srv://krishnkantsjp2004_db_user:krishna123@cluster0.aao6s49.mongodb.net/test')

// Admin routes
app.post('/admin/signup', async (req, res) => {
      
  const {username,password} = req.body;
  const admin = await Admin.findOne({username});
  if(admin){
    res.status(404).send("user already exists");
  }else{
    const newAdmin = new Admin({username:username,password:password});
    await newAdmin.save();
    
    const token = generatejwt({username , role:'admin'});
    res.status(200).send({message:"admin created succesfully ",token});
  }
});

app.post('/admin/login',  async (req, res) => {
  // logic to log in admin

const {username , password} = req.body;

const admin = await ADMINS.findone({username,password});

if(admin){
   const token = generatejwt({username , role:'admin'});
    res.status(200).send({message:"logged in succensfully ",token});
}else{
    res.status(404).send("user or password is incorrect");
}

});

app.post('/admin/courses', authentication, adminAuthentication, async (req, res) => {
  // logic to create a course
  const course = new Course(req.body);
  
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
  await Courses.save();
  

  res.status(200).json({message: "course created", courseid : course.id});
  
});

app.put('/admin/courses/:courseId',authentication, adminAuthentication, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req,params.courseid,req.body,{new : true});
  if(course){
    res.status(200).send({message : "course updated" , course});
  }else{
    res.status(404).send({message : "course not found"});
  }
});

app.get('/admin/courses', authentication,adminAuthentication,async (req, res) => {
  // logic to get all courses
  const courses = await Course.find({});
  res.status(200).json({courses});
});

// User routes
app.post('/users/signup', async (req, res) => {
  // logic to sign up user
  const {username,password} = req.body;
 const user = await User.findOne({username});
 if(user){
  res.status(409).send("user already exists");
 }else{
  const newuser = new User({username,password});
  await newuser.save();
  const token = generatejwt({username,role:'user'});
  res.status(200).send({message : "you are signuped" , token});
 }
});

app.post('/users/login', async (req, res) => {
  // logic to log in user
  
const {username,password} = req.body;
const user = await User.findOne({username,password});
if(user){
  const token = generatejwt({username,role:'user'});
  res.status(200).json({message:"you are logged in",token});
}else{
   res.status(403).send("user or password is wrong");
}
});

app.get('/users/courses',authentication,userAuthentication, async (req, res) => {
  // logic to list all courses
  const courses = await Course.find({published:true});
  res.status(200).json({courses : courses});
});

app.post('/users/courses/:courseId',authentication,userAuthentication,async(req,res)=>{
  // logic to purchase a course
  
  const course = await Course.findById(req.params.courseId);
  if(course){
    const user = await User.findOne({username : req.user.username});
    if(user){
      user.purchasedcourse.push(course.id);
      await user.save();
      res.status(200).send("course purchased");
    }else{
      res.status(403).send("user dont exists");
    }
  }else{
    res.status(402).send("no course exists with this id");
  }
});

app.get('/users/purchasedCourses',authentication,userAuthentication, async (req, res) => {
  // logic to view purchased courses
  const user = await User
    .findOne({ username: req.user.username })
    .populate('purchasedcourse');

  if (user) {
    res.json({
      purchasedCourses: user.purchasedcourse || []
    });
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
