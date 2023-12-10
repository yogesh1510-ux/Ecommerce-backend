module.exports = (theFun) => (req,res,next) => {
    Promise.resolve(theFun(req,res,next)).catch(next);
}




//another way 

// const asyncFunHandler = (theFun) => {
//     return (req,res,next) =>{
//         theFun(req,res,next).catch(err => next(err));

//     }
  
// }

// module.exports=asyncFunHandler;

