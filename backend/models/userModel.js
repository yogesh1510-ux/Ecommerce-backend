const express= require("express");
const moongose =require("mongoose");
const validator =require("validator");
const bcrypt =require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto=require("crypto");

const userSchema = moongose.Schema({
    name:{
        type:String,
        required:[true,"Please enter the name"],
        maxLength:[30,"name cannot exceds more than 30 charecters"],
        minLength:[4,"name must have minimum 4 charecters"]
    },
    email:{
        type:String,
        required:[true,"please enter email"],
        unique:true,
        validate:[validator.isEmail,"please Enter valid email"]
    },
    password:{
        type:String,
        required:[true,"please Enter password"],
        select:false,
        minLength:[8,"password lenght must be greater that 8"]
    },
    avatar:{
        public_id:{
            type:String,
            require:true
        },
        url:{
            type:String,
            require:true
        }
    },
    role:{
        type:String,
        default:"user"
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
});

userSchema.pre("save", async function(next) {
    
    if( !this.isModified("password")){
        next();
    }

    this.password=await bcrypt.hash(this.password,10);

   

});

userSchema.methods.getJwtToken = function () {
    return jwt.sign({id:this._id},process.env.JWT_SECRAT_KEY,{
        expiresIn:process.env.JWT_EXPIRE,
    })
} 


userSchema.methods.compairPassword =async function(compaPassword){
    return await bcrypt.compare(compaPassword,this.password);
}
                  
userSchema.methods.getResetPasswordToken = function () {
    const resteToken= crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken=crypto.createHash("sha256").update(resteToken).digest("hex");

    this.resetPasswordExpire=Date.now() + 15*60*1000;

    return resteToken;
}

module.exports = moongose.model("User",userSchema);
