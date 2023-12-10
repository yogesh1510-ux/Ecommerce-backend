const express= require('express');
const router=express.Router();
const {getProducts, createProducts, updateProducts, deleteProduct, getProductDetails, createProductReview, getAllReviews, deleteReview, getAdminProducts} =require('../controller/productController');
const { isAuthenticatedUser } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/auth');


router.route("/products").get(getProducts);

router.route("/admin/products").get(isAuthenticatedUser,authorizeRoles("admin"),getAdminProducts);



router.route("/admin/product/new").post(isAuthenticatedUser,authorizeRoles("admin") ,createProducts);

router.route("/admin/product/:id").put(isAuthenticatedUser,authorizeRoles("admin") ,updateProducts).delete(isAuthenticatedUser,authorizeRoles("admin") ,deleteProduct);

router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser,createProductReview);

router.route("/reviews").get(getAllReviews).delete(isAuthenticatedUser,deleteReview);

module.exports=router; 