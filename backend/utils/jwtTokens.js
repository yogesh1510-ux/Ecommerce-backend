
const setTokens = (user,status,res) =>{
    const token=user.getJwtToken();

    const option={
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE *24 *60*60*1000),
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