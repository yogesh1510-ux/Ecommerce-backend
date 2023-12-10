const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErros = require("../middleware/catchAsyncErros");
const ApiFeatures = require("../utils/apifetures");
const cloudinary = require("cloudinary");

//create all the product -- Admin

exports.createProducts = catchAsyncErros(async (req, res, next) => {
    // Check if req.body and req.body.images are defined

    console.log('Request Body:', req.body);

    if (!req.body || !req.body.images) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request format. Images are required.',
      });
    }
  
    let images = [];
  
    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }
  
    const imagesLinks = [];
  
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
  
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
  
    req.body.images = imagesLinks;
    req.body.user = req.user.id;
  
    const product = await Product.create(req.body);
  
    return res.status(201).json({
      success: true,
      product,
    });
  });
  
  
//get all the products

exports.getProducts = catchAsyncErros(async (req, res, next) => {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
  
    
    let apiFeature = new ApiFeatures(Product.find(), req.query).search().filter();
  
    
    const apiFeatureClone = new ApiFeatures(Product.find(), req.query).search().filter();
  
    
    let products = await apiFeature.query;
  
    
    let filterProductCount = products.length;
  
    
    apiFeatureClone.pagination(resultPerPage);
  
    
    products = await apiFeatureClone.query;
    
  
    return res.status(201).json({
      success: true,
      products,
      productCount,
      resultPerPage,
      filterProductCount
    });
  });
  



//get single product

exports.getProductDetails = catchAsyncErros(async(req,res,next) => {

    
    let product = await Product.findById(req.params.id);

    if(!product) {
        return next(new ErrorHandler("Product not founs",404));
    }

    return res.status(200).json({
        success:true,
        product
    })



// catch(err){
//     console.error(err); // Log the error for debugging purposes
//     return res.status(500).json({ error: 'An error occurred during getting single product details operation' });
// }



})


//update products --Admin

exports.updateProducts = catchAsyncErros(async (req,res,next) => {
    
    
    let product = await Product.findById(req.params.id);

if(!product){
    return  next(new ErrorHandler("Product does not upted",404))
}


let images = [];

if (typeof req.body.images === "string") {
  images.push(req.body.images);
} else {
  images = req.body.images;
}

if (images !== undefined) {
  // Deleting Images From Cloudinary
  for (let i = 0; i < product.images.length; i++) {
    await cloudinary.v2.uploader.destroy(product.images[i].public_id);
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.v2.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
}


product = await Product.findByIdAndUpdate(req.params.id,req.body,{
    new:true,
    runValidators:true,
    useFindAndModify:false
});


return  res.status(200).json({
    success:true,
    product
})



// catch(err){
//     console.error(err); // Log the error for debugging purposes
//     return res.status(500).json({ error: 'An error occurred during update operation' });
// }



})




//Delete A product --Admin


exports.deleteProduct = catchAsyncErros(async (req,res,next) => {

    

    let product = await Product.findById(req.params.id);

    if(!product) {
        return  next(new ErrorHandler("Product not foud",404))
    }


    product = await Product.findByIdAndDelete( {_id:req.params.id});
    

      

   return res.status(200).json({
        success:true,
        message:"Product delated sucessfully"
    })
    



// catch(err){
//     console.log(err);
    
//     return  res.status(500).json({ error:"An error occurred during delete operation" })
// }


}
)


exports.createProductReview = catchAsyncErros(async (req,res,next) =>{
    const { rating,comment,productId } = req.body;

    const review={
        user:req.user.id,
        name:req.user.name,
        rating:Number(rating),
        comment
    };

    const product= await Product.findById(productId);

    const isProductReviewed=  product.reviews.find(
        (review) => review.user.toString() ===req.user.id.toString()
    );


    if(isProductReviewed){
        product.reviews.forEach((review) =>{
            if(review.user.toString() === req.user.id.toString() ){
                review.rating=rating;
                review.comment=comment;
            }
        })
    }

    else{
        product.reviews.push(review);
        product.numOfReviews=product.reviews.length;

    }


    let avg=0;
    
     product.reviews.forEach(
        (review) => {
            avg=avg+review.rating
        }

    );  

    product.ratings = avg / product.reviews.length;
   

    
  await product.save({ validateBeforeSave: false });


    res.status(200).json({
        success:true
    })



} );


exports.getAllReviews = catchAsyncErros(async(req,res,next) => {

    const product= await Product.findById(req.query.id);

    if(!product) {
        return next(new ErrorHandler("Product not found",404));
    } 

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
});


exports.deleteReview = catchAsyncErros(async(req,res,next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHander("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message:"product deleted"
  });

});



exports.getAdminProducts = catchAsyncErros(async (req, res, next) => {
    const products = await Product.find();
  
    res.status(200).json({
      success: true,
      products,
    });
  });
