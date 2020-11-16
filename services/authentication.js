let User = require("../user/model");
const jwt = require('jsonwebtoken');
const uti = require("./utils");
const cnf = require("../admin/config");
var userheadername = cnf.getInner('auth', 'tokenHeaderName');

// common validation function, validates incoming 'token'
let validateUser = (token) => {
        return new Promise((resolve,reject)=>{
            if (token) {
                let secCode = cnf.getInner('auth', 'loginSecretCode')
                jwt.verify(token, secCode, async function (err, decoded) {
                    if (err) {
                        reject(uti.genError('unauthorized', "Failed to authenticate token.Login again", ''))
                    } else {
                        try {
                            let udata = await User.userExists({ username: decoded.data.username });
                            var d1 = new Date(decoded.iat * 1000);  // https://stackoverflow.com/a/847196
                            var d2 = new Date(udata.pwdchange);
                            //console.log(udata);
                            if (d1 <= d2) {
                                reject(uti.genError('unauthorized', "Password changed. Login again ", ''))
                            } else {
                                decoded.data['role'] = udata.role;
                                decoded.data['timezone'] = udata.timezone
                                resolve(decoded.data);
                            }
                        } catch (error) { reject(error) }
                    }
                });
            } else {
                reject(uti.genError('unauthorized', "No token provided", ''))
            }
        })
        
}
module.exports.validateUser = validateUser;

// middleware to authenticate requests 
let needAuthentication = async (req, res, next) => {
    try {
        var token = req.body[userheadername] || req.query.token || req.headers[userheadername] || req.cookies[userheadername];
        let data = await validateUser(token)
        // include user meta in the current request and use this later 
        req.valid_username = data.username;
        req.valid_user_role = data.role; // user role 
        req.valid_time_zone = data.timezone // time zone of the user 
        next();
    } catch (error) {
        console.log('-----request--body---------')
        console.log(req.body)
        console.log('---------------------------')
        if (error.message == "Token not valid. Password changed") {
            res.clearCookie(userheadername);
        }
        res.error(error);
    }
}
module.exports.needAuthentication = needAuthentication

let compareUname = (pname, uname) => {
    if (pname === uname) {return} 
    else {throw new Error("Unauthorized access");}
}

let privateForUser = async (req, res, next) => {
    try {
        var paramUname = req.params.uname
        var token = req.body.token || req.query.token || req.headers[userheadername] || req.cookies[userheadername]
        let data = await validateUser(token)
        req.valid_username = data.username;
        req.valid_user_role = data.role; // user role 
        req.valid_time_zone = data.timezone
        compareUname(req.valid_username, paramUname)
        next();
    } catch (error) {
        if (error.message == "Token not valid. Password changed") {
            res.clearCookie(userheadername);
        }
        res.error(error)
    }
}
module.exports.privateForUser = privateForUser;