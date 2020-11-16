var express = require('express');
var router = express.Router();
var handler = require('./handler');

router.route('/')
    .get(handler.index)
    .post(handler.signUp)

router.route('/verifyPin')
    .post(handler.verifyMail)
    .put(handler.resendVerfiy)

router.route('/password')
    .post(handler.sendPasswordLink)
    .put(handler.resetPassword)    

router.route('/login')
  .post(handler.login);

module.exports = router;



// var userCtrl = require("./controller");
// var auth = require('../services/authenticate');

// router.route('/verifytoken')
//   .post(userCtrl.verifyToken)



// //authenticate all the routes mentioned below
// router.use(auth.needAuthentication);

// // For - /api/user/u/:uname - To view,edit,delete user
// router.route('/u/:uname')
//   .get(auth.privateForUser, userCtrl.getUserData)
//   .put(auth.privateForUser,userCtrl.getUserActivity)
//   .post(userCtrl.setUserData)
//   .delete(userCtrl.deleteUser);

// router.use(auth.mustbea("manager"))

// //search in the user module 
// router.route('/search')
//   .post(userCtrl.searchUser);

// module.exports = router;
