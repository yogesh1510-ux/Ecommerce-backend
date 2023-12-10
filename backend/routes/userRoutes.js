const express = require("express");
const { userRegister, userLogin, userLogOut, forgotPassword, resetPassword, getUserDetails, updatePassword, updateProfile, getAllUsers, getSingleUser, updateUserRole, deleteUser } = require("../controller/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();



router.route("/register").post(userRegister);

router.route("/login").post(userLogin);

router.route("/logout").get(userLogOut);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser,updatePassword);

router.route("/me/update").put(isAuthenticatedUser,updateProfile);

router.route("/admin/users").get(isAuthenticatedUser,authorizeRoles("admin"),getAllUsers);

router.route("/admin/user/:id")
.get(isAuthenticatedUser,authorizeRoles("admin"),getSingleUser)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteUser);  


module.exports=router;