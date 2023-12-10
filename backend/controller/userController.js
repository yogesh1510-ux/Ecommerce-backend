const User=require("../models/userModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErros = require("../middleware/catchAsyncErros");
const { json } = require("body-parser");
const setTokens = require("../utils/jwtTokens");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");


exports.userRegister = catchAsyncErros(async(req,res,next) => {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:"avatars",
        width:150,
        crop:"scale",

    })


    const { name,email,password } = req.body;

    const user= await  User.create({
        name,email,password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    }) ;

   

    setTokens(user,201,res);

})


exports.userLogin = catchAsyncErros( async (req,res,next) => {
    const {email,password} = req.body;

    
    if(!email || !password) {
        return next(new ErrorHandler("please Enter email and password", 400));
    }

    const user= await User.findOne({ email   }).select("+password");

    if(!user){
        return next(new ErrorHandler("please enter valid email and password",401));
    }

    const isPasswordValid = await  user.compairPassword(password);
    
    if(!isPasswordValid ){
        return next(new ErrorHandler("please enter valid email and password",401));
    }

 
    

    setTokens(user,200,res);



} );


exports.userLogOut = catchAsyncErros( async (req,res,next) => {
    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true
    });

    res.status(200).json({
        success:true,
        message:"Logged Out"
    })
});


exports.forgotPassword = catchAsyncErros(async (req,res,next) =>{
   
    const user = await User.findOne({email:req.body.email});
    
    if(!user){
        return next(new ErrorHandler("User not found",404));

    } 

    const restToken= user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
      )}/password/reset/${resetToken}`;
    

    const message=`Your password reset token is as following :-\n\n ${resetPasswordUrl} \n\n if you have not requested these email please ignore it`;


    try {
        await sendEmail({
            email:user.email,
            subject:"Ecommerce Password Recovery",
            message
            
        })

        res.status(200).json({
            success:true,
            message:`email is send to ${user.email} successfully`
        })
        
    } catch (error) {
        user.resetPasswordToken =undefined;
        user.resetPasswordExpire=undefined;

        await user.save({validateBeforeSave:false});

        return next(new ErrorHandler(error.message,500));
    }

} ) ;


exports.resetPassword = catchAsyncErros(async (req,res,next) => {

    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user= await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{ $gt:Date.now() }
    });

    if(!user){
        return next(new ErrorHandler("Reset password Token is invalid or has been expired",400));
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("confirmPassword does not match with enterd Password",400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    setTokens(user,200,res);

});


exports.getUserDetails = catchAsyncErros(async(req,res,next) => {
    
    const user= await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    })
});

exports.updatePassword = catchAsyncErros(async(req,res,next) => {
    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.compairPassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("oldPassword is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("password does not match",400));
    }

    user.password=req.body.newPassword;

    await user.save();

    setTokens(user,200,res);

});



exports.updateProfile = catchAsyncErros(async(req,res,next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email
    };

    if (req.body.avatar && req.body.avatar.trim() !== "") {
        
        const user = await User.findById(req.user.id);

        const imageId= user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);

        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder:"avatars",
            width:150,
            crop:"scale",
    
        });

        newUserData.avatar ={
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
       
    }


    const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        
    });
});

exports.getAllUsers = catchAsyncErros(async(req,res,next) => {

    const users= await User.find();

    res.status(200).json({
        success:true,
        users
    });
});


exports.getSingleUser = catchAsyncErros(async(req,res,next) => {
    
    const user= await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`user with Id: ${req.params.is} does not exists`));
    }


    res.status(200).json({
        success:true,
        user
    })

});




exports.updateUserRole = catchAsyncErros(async(req,res,next) => {
    const newUserData = {
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    };


    const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });

    res.status(200).json({
        success:true,
        user
    });
});

exports.deleteUser = catchAsyncErros(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    const imageId = user.avatar.public_id;
  
    await cloudinary.v2.uploader.destroy(imageId);
  
    await user.deleteOne();
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });
  



