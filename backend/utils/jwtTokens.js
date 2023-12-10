
const setTokens = (user,status,res) =>{
    const token=user.getJwtToken();

    const option={
        
        httpOnly:true,
        path: "/",
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
    };

return res.status(status).cookie("token",token,option).json({
    success:true,
    user,
    token
});


}


module.exports=setTokens;