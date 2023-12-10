const express=require("express");
const { newOrder, getSingleOrder, myOrder, getAllOrders, updateOrder, deleteeOrder } = require("../controller/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router=express.Router();


router.route("/order/new").post(isAuthenticatedUser,newOrder);

router.route("/order").get(isAuthenticatedUser,getSingleOrder);

router.route("/order/:id").get(isAuthenticatedUser,getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser,myOrder);

router.route("/admin/orders").get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders);

router.route("/admin/order/:id")
.put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteeOrder)


module.exports=router;
