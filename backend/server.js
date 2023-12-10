const app = require('./app');
const dotenv=require('dotenv');
const connectDatabase =require("./config/database");
const cloudinary = require("cloudinary");


//unhandled exception

process.on("uncaughtException",(err)=>{
    console.log(`Error : ${err.message}`);
    console.log("server is shutting dowm due to unhandled wexception");
    process.exit(1);
})





dotenv.config({path:"backend/config/config.env"});

connectDatabase();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_KEY,
    api_secret:process.env.CLOUDINARY_API
})


const server= app.listen(process.env.PORT,() => {
    console.log(`server is listning at portnumber ${process.env.PORT} `)
})

 
//unhandled promiss rejection
process.on("unhandledRejection",(err) => {
    console.log(`Error : ${err.message}`);
    console.log("server is shutting down due to unhandle promiss rejection");

    server.close(() =>{
        process.exit(1);
    })
})