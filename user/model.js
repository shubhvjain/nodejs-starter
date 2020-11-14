var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var momentTimezone = require("moment-timezone")
var passwordValidator = require('password-validator');

let configs = require('../admin/config');
var cfn = require('../services/utils');
var emailServices = require('../admin/email')
var dbLog = require('../admin/serverLogs')

// mongo init
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    promiseLibrary: global.Promise,
    dbName: process.env.DB_NAME,
    useUnifiedTopology: true
});

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true,
        unique: true,
        min: [4, 'Minimum 5 chars required'],
        max: [20, 'Only 20 chars allowed'],
        validate: {
            // https://www.mkyong.com/regular-expressions/how-to-validate-username-with-regular-expression/
            validator: function (v) {
                return /^[a-z0-9_-]{4,20}$/.test(v);
            },
            message: 'Invalid username'
        },
    },
    password: {
        type: String,
        default: 'notset' // password validation in done in the pre function
    },
    pwdchange: { type: Date },
    email: {
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(v);
            },
            message: 'Invalid email'
        },
    },
    name: {
        // String regx = "^[\\p{L} .'-]+$"; https://stackoverflow.com/a/15806080
        type: String,
        default: 'User ',
        validate: {
            validator: function (v) {
                return /[a-zA-Z ]{2,50}$/.test(v);
            },
            message: 'Invalid name'
        },
    },
    status: { // to verfiy email by sending a mail
        type: Number,
        enum: [0, 1, -1],
        default: 0 // 0 = unverified or inactive  , 1 = active, -1 = suspended 
    },
    createdOn: { // date on which account was created
        type: Date,
        default: Date.now
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedOn: {
        type: Date
    },
    emailToken: {
        type: String,
        default: 'not_set'
    },
    emailTokenSetDate: {
        type: Date
    },
    emailTokenType: {
        type: String,
        default: 'not_set'
    },
    mobileNo: {
        type: String,
        //(\+\d{1,3}[ ]+)+\d{10} , https://regex101.com/r/fX2bZ8/315
        validate: {
            validator: function (v) {
                return /^(\+\d{1,3}[ ]+)+\d{10}$/.test(v);
            },
            message: 'Invalid mobile no. Valid format - code<space>no'
        },
    },
    address: {
        type: String,
        default: ' ',
        max: [250, 'Only 250 characters allowed']
    },
    role: {
        type: "String",
        default: configs.getInner('user', 'defaultRole'),
        enum: configs.getInner('user', 'roles')
    },
    timezone: {
        type: 'String',
        default: 'Asia/Kolkata'
    }
});

// to perform necessary actions before saving user's data
UserSchema.pre('save', function (next) {
    const user = this, SALT_FACTOR = 5;
    // hash the  password every time password is defined 
    if (!user.isModified('password')) {
        return next();
    } else {
        var schema = new passwordValidator();
        schema
            .is().min(8) // Minimum length 8 
            .is().max(50) // Maximum length 100 
            .has().uppercase() // Must have uppercase letters 
            .has().lowercase() // Must have lowercase letters 
            .has().symbols() //  Must have symbols 
            .has().digits() // Must have digits 
            .has().not().spaces() // Should not have spaces 
            .is().not().oneOf(['Password@123', 'Password.123', 'Password.1']); // Blacklist these values 
        if (schema.validate(this.password) == false) {
            next(cfn.genError('validationError', "Password must satisfy following criteria - " + schema.validate(this.password, { list: true }).join(',')))
        } else {
            var currentTime = new Date();
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(this.password, salt);
            var pwd = this.password;
            this.password = hash;
            this.pwdchange = currentTime;
            // send email to user when ever password is changed
            if (!user.status == 0) {
                emailServices.composeSendEmail(this.username, this.email, 'pwdChanged', {
                    name: this.name,
                    currentTime: currentTime
                })
                dbLog.newDBLog({
                    username: this.username,
                    type: 'user',
                    message: 'user.passwordChanged',
                    display: true,
                    data: {}
                })
            }
        }
    }
    // to add date and time of deletion whenever a user is deleted
    if (!user.isModified('deleted')) {
        return next();
    } else {
        this['deletedOn'] = new Date();
    }
    next();
});

var User = mongoose.model('users1', UserSchema);
module.exports.UserSchema = User;

let insert = async (jsonData) => {
    try {
        await cfn.inspectJSON(jsonData, {
            requiredFields: ['email', 'password', 'username'],
            validFields: ['username', 'email', 'password', 'mobileNo', 'name', 'address', 'timezone']
        })
        await userNotExists({ username: jsonData.username });
        await userNotExists({ email: jsonData.email });
        var newUser = new User(jsonData);
        await newUser.save();
        await dbLog.newDBLog({ username: newUser['username'], type: 'user', message: 'user.signUp', data: {} })
        return;
    } catch (err) {
        throw err;
    }
}

let userNotExists = async (jsonData) => {
    // to check wheter user exists or not, resolves if not exists
    try {
        let user = await User.findOne(jsonData);
        if (user) {
            throw cfn.genError('recordExists', 'User already exists')
        } else { return; }
    } catch (err) {throw err;};
}

let userExists = async (jsonData) => {
    try {
        // to search for active, not deleted user only 
        jsonData['deleted'] = false;
        let user = await User.findOne(jsonData)
        if (user) {
            return user
        } else {
            throw cfn.genError('notFound', 'No user found')
        }
    } catch (error) {throw error}
}

let search = async (jsonData, fieldsToFetch) => {
    // jsonData - criteria , fieldsToFetch = array of valid fields to fetch
    try {
        let a = fieldsToFetch, b = jsonData;
        if (!fieldsToFetch) { a = configs.getInner('user', 'defaultNoField') }
        if (!jsonData['deleted']) { b['deleted'] = false; }
        let user = await User.find(b, a.join(' '));
        if (!user || Object.keys(user).length <= 0) {
            throw cfn.genError('notFound', 'No user found')
        } else {
            return user
        }
    } catch (error) { throw error }
}

let update = async (user, jsonData) => {
    try {
        cfn.inspectJSON(jsonData, {
            validFields: ['password', 'mobileNo', 'name', 'address', 'emailToken', 'emailTokenType', 'status', 'timezone'],
            acceptBlank: false
        })
        if (jsonData.timezone) {
            let tzs = momentTimezone.tz.names();
            if (tzs.indexOf(jsonData.timezone) == -1) {
                throw cfn.genError('validationError', 'Invalid time zone')
            }
        }
        let udata = await userExists({ username: user });

        // to hash email token
        if (jsonData['emailToken']) {
            if (jsonData['emailToken'] != 'notSet') {
                var esalt = bcrypt.genSaltSync(10);
                var ehash = bcrypt.hashSync(jsonData['emailToken'] + "", esalt);
                jsonData['emailToken'] = ehash;
                jsonData['emailTokenSetDate'] = new Date();
            }
        }
        // now update the values
        Object.keys(jsonData).forEach(function (key) {
            udata[key] = jsonData[key];
        });
        await udata.save();
        return;
    } catch (error) { throw error }
}

let comparePassword = async (user1, password) => {
    try {
        let user = await userExists({ username: user1, status: 1 })
        if (bcrypt.compareSync(password, user.password)) {
            return user
        } else {
            throw cfn.genError('unauthozired', 'Passwords do not match')
        }
    } catch (error) {throw error}
}

let comparePin = async (user, pin, type) =>{
    // user - username
    try {
        let user1 = await userExists({username: user,emailTokenType: type})
        let spin = " ";
        spin = pin + "";
        if (bcrypt.compareSync(spin, user1.emailToken)) {return user1} 
        else {throw cfn.genError('unauthorized', 'PIN do not match');}
    } catch (error) {throw error}
}

let del =  async (user1)=> {
    // user1- username
    try {
        let user = await User.findOne({username: user1})
        user.deleted = true;
        return user.save();
    } catch (error) {throw error}
}

module.exports.comparePassword = comparePassword;
module.exports.comparePin = comparePin;
module.exports.insert = insert;
module.exports.userNotExists = userNotExists;
module.exports.search = search;
module.exports.update = update;
module.exports.userExists = userExists;
module.exports.del = del;