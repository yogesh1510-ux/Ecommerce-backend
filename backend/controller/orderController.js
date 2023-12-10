const catchAsyncErros = require("../middleware/catchAsyncErros");
const Order = require("../models/orderModel");
const Product =require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");


exports.newOrder = catchAsyncErros(async (req,res,next) =>{

    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice} = req.body;

    const order= await Order.create({
        shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice,paidAt:Date.now(),user:req.user._id    
    });

    res.status(200).json({
        success:true,
        order
    })

} );


exports.getSingleOrder = catchAsyncErros(async (req,res,next) => {
    
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    );
    
    if(!order){
        return next(new ErrorHandler("Oder not found",404));
    }

    res.status(200).json({
        success:true,
        order
    })


});

exports.myOrder = catchAsyncErros(async(req,res,next) =>{
    
    const orders = await Order.find({user:req.user.id});
    
    

    res.status(200).json({
        success:true,
        orders
    })

});


//get all orders --admin

exports.getAllOrders = catchAsyncErros(async(req,res,next) => {

    const orders= await Order.find();

    let totalAmount=0;

    orders.forEach(
        (order)=>{
            totalAmount+=order.totalPrice
        } 
    );

    

   
    res.status(200).json({
        success:true,
        totalAmount,
        orders
    })

});

//update order status --admin

exports.updateOrder = catchAsyncErros(async(req,res,next) => {

    const order= await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("order is not present",404));
       }

    if(order.orderStatus=="Delivered"){
        return next(new ErrorHandler("you have alredy delivered these product",400));
    }

    order.orderItems.forEach(async (order) => {
        await updateStocks(order.product,order.quantity)
    });

    order.orderStatus=req.body.status;

    if(req.body.status=="Delivered"){
        order.deliveredAt=Date.now();
    }

    await order.save({validateBeforeSave: false});

    res.status(200).json({
        success:true,
    });
    

});


//delete order  --admin

exports.deleteeOrder = catchAsyncErros(async(req,res,next) => {

   const order = await Order.findById(req.params.id);

   if(!order){
    return next(new ErrorHandler("order is not present",404));
   }

   await Order.findByIdAndDelete({_id:req.params.id});

   res.status(200).json({
    success:true
   })

});




async function updateStocks(id,quantity){

    const product = await Product.findById(id);

    product.stocks-=quantity;

    await product.save({validateBeforeSave:false});
}