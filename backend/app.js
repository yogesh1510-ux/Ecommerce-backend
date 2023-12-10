 const express =require ("express");
 const app=express();
 const errorMiddleware = require("./middleware/error");
 const cookieParser = require("cookie-parser");
 const bodyParser = require("body-parser");
 const fileUpload = require("express-fileupload");
 const dotenv=require('dotenv');
 const path = require("path");

 dotenv.config({path:"backend/config/config.env"});


 const products=require("./routes/productRoutes");
 const users = require("./routes/userRoutes");
 const order=require("./routes/orderRoutes");
 const payment = require("./routes/paymentRoites");

 app.use(express.json());
 app.use(cookieParser());
 app.use(bodyParser.urlencoded({ extended:true }));
 app.use(fileUpload());

 app.use("/api/v1",products)
 app.use("/api/v1",users)
 app.use("/api/v1",order);
 app.use("/api/v1",payment);

 app.use(express.static(path.join(__dirname, "../frontend/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/build/index.html"));
});


 app.use(errorMiddleware);

// app.all("*",(req,res) =>{
//     const err="something went wrong";
//     res.status(500).json({
//         success:false,
//         message:err.message,
//         stack:err.stack
//     })
// })



 
 module.exports =app;