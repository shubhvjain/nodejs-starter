var UserModel = require('../user/model')
var pinService = require('../admin/emailPin.js');
let util = require('../services/utils')
let cf = require('../admin/config');
let dbLog = require('../admin/serverLogs')
var momentTimezone = require("moment-timezone")

let index = (req, res, next) => { res.success({ msg: "User API" }) }
module.exports.index = index

//add new user and send pin to email
let signUp = async (req, res) => {
  try {
    let reqBody = req.body;
    await UserModel.insert(reqBody)
    await pinService.generateAndSendPin(reqBody.username, { templateId: "activateAccount" })
    res.success({ message: "Account created successfully. Email verification pending. Check your email to activate account." })
  } catch (err) {
    res.error(err);
  }
}
module.exports.signUp = signUp;

// to activate account by verifying the pin
// this is a common function to verify all types of pin
let verifyMail = async (req, res, next) => {
  try {
    util.inspectJSON(req.body, {
      requiredFields: ["username", "pin", "pinType"],
      validFields: ["username", "pin", "pinType"],
      acceptBlank: false
    })

    var jsonD = req.body;
    await util.inspectJSON(jsonD, {
      requiredFields: ["pin", "pinType", "username"],
      validFields: ['pin', 'pinType', 'username']
    })
    await pinService.verifyPin(jsonD.username, jsonD.pin, jsonD.pinType);
    await pinService.resolvePin(jsonD.username, jsonD.pin, jsonD.pinType)
    res.success({ "message": "PIN verified" });
  } catch (err) {
    res.error(err);
  }
}
module.exports.verifyMail = verifyMail;

// to send pin to email
let resendVerfiy = async (req, res) => {
  try {
    var jsonD = req.body;
    await util.inspectJSON(jsonD, {
      requiredFields: ["pinType", "username"],
      validFields: ['pinType', 'username']
    })
    await pinService.generateAndSendPin(jsonD.username, { templateId: jsonD.pinType, task: 'authenticate' })
    res.success({ message: "PIN sent to email" })
  } catch (err) {
    res.error(err);
  };
}
module.exports.resendVerfiy = resendVerfiy;

// to send password reset pin to email
let sendPasswordLink = async (req, res) => {
  try {
    var jsonD = req.body;
    await util.inspectJSON(jsonD, {
      requiredFields: ["username"],
      validFields: ["username"]
    })
    let data = await UserModel.userExists({ username: jsonD.username })
    await pinService.generateAndSendPin(data.username, { templateId: "resetWithPin" })
    await dbLog.newDBLog({ 
      username: data.username, 
      type: 'user', 
      message: 'user.forgetPasswordRequest', 
      data: {}, 
      display: true 
    })
    res.success({ message: 'Password reset pin sent to email' })
  } catch (error) {
    res.error(error);
  }
}
module.exports.sendPasswordLink = sendPasswordLink;

// to reset password
let resetPassword = async (req, res) => {
  try {
    var jsonD = req.body;
    await util.inspectJSON(jsonD, {
      requiredFields: ["pin", "username", "password"],
      validFields: ['pin', 'username', "password"]
    })
    await pinService.verifyPin(jsonD.username, jsonD.pin, "resetWithPin");
    await UserModel.update(jsonD.username, { password: jsonD.password })
    await pinService.resolvePin(jsonD.username, jsonD.pin, "resetWithPin")

    await dbLog.newDBLog({ 
      username: jsonD.username, 
      type: 'user', 
      message: 'user.passwordResetSuccess', 
      data: {}, 
      display: true 
    })

    res.success({ message: "Password Reset." })
  } catch (error) {
    res.error(error);

  }
}
module.exports.resetPassword = resetPassword;




// to get data of the user
let getUserData = async (req, res, next) => {
  try {
    let data = await UserModel.userSearch({
      username: req.params.uname
    })
    let tz = momentTimezone.tz.names()
    res.success({ user: data[0], static: { timezones: tz } });
  } catch (error) {
    res.error(error);
  }
}
module.exports.getUserData = getUserData;

// to update user info , will be used by both , user and admin
let setUserData = async (req, res, next) => {
  // edit profile
  try {
    var uid = req.params.uname;
    var jsonD = req.body;
    await UserModel.userUpdate(uid, jsonD)
    res.success({ message: "User data updated successfully" })
  } catch (error) {
    res.error(error);
  }
}
module.exports.setUserData = setUserData;

// to delete a user
let deleteUser = async (req, res, next) => {
  try {
    var uid = req.params.uname;
    await UserModel.userDelete(uid)
    res.success({ message: "User deleted successfully" })
  } catch (error) {
    res.error(error);

  }
}
module.exports.deleteUser = deleteUser;

let searchUser = async (req, res) => {
  try {
    let flds = req.body.fields
    let jsonD = JSON.parse(JSON.stringify(req.body));
    if (!req.body.fields) {
      flds = cf.getFields('user', req.valid_user_role, 'read');
    }
    await util.inspectJSON(jsonD, {
      validFields: ['fields', 'criteria'],
      requiredFields: ['criteria']
    })
    await util.inspectJSON(jsonD.criteria, {
      validFields: cf.getFields('user', req.valid_user_role, 'read'),
      acceptBlank: true
    })
    await util.inspectArray(flds, {
      validFields: cf.getFields('user', req.valid_user_role, 'read')
    })

    let d = await UserModel.userSearch(req.body.criteria, flds)
    res.success({ results: d })
  } catch (error) {
    res.error(error)

  }
}
module.exports.searchUser = searchUser;


// to verify whether the token provided by user is valid or not
async function getUserActivity(req, res) {
  try {
    console.log(1212)
    var uid = req.valid_username;
    let records = await util.searchLog({ username: uid, display: true })    // UserModel.userUpdate(uid, jsonD)
    res.success(records)
  } catch (error) {
    res.error(error);
  }

}
module.exports.getUserActivity = getUserActivity;
