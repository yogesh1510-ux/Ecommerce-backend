const catchAsyncErros = require("./catchAsyncErros");
const jwt=require("jsonwebtoken");
const User=require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");

exports.isAuthenticatedUser = catchAsyncErros(async (req,res,next) => {
    const {token} = req.cookies;

    if(!token){
        return next(new ErrorHandler("please login to acess required resources",401));
    }

    const decodedData= jwt.verify(token,process.env.JWT_SECRAT_KEY);

  req.user=  await User.findById(decodedData.id);
  next();

});


exports.authorizeRoles = (...role) =>{

  return (req,res,next) =>{
      if(!role.includes(req.user.role)){
          return next(new ErrorHandler(`Role: ${req.user.role} is not authorized to acess these resource`,403));
      }

      next();
  }

  
}