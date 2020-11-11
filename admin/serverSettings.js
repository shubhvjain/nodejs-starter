var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var utils = require('../services/utils');
// let User = require("../user/model");
// let configs = require('../services/config');

mongoose.connect(process.env.DB_URL, {
	useNewUrlParser: true,
	promiseLibrary: global.Promise,
    dbName:process.env.DB_NAME,
    useUnifiedTopology: true
});

var SetingsModel = mongoose.Schema({
    link: { 
        type: String, 
        required: true , 
        trim: true,
        minlength: 5,
        maxlength: 400,
        lowercase: true},
    sType: {
        type: String,
        enum: ['config', 'template', 'flags'],
        required: true
    },
    data: { type: {}, default: { data: 'Not added yet' } },
    deletionAllowed: { type: String, required: true , enum: ['yes','no']},
    updPwdRequired: { type: String, required: true , enum: ['yes','no']},

    about: { type: String, default: "  ", },
    createdOn: { type: Date, default: Date.now },
    username: { type: String, required: true }
});

var Mdl = mongoose.model('settings', SetingsModel);
// current media types - image and diagram
// image -  will be stored in external server and it's url will be stored in 'data' field
// diagram will be stored in the database in 'data' field

module.exports.settingModel = Mdl

let insertSetting = async (jsonData) => {
    try {
        utils.inspectJSON(jsonData, {
            requiredFields: ['link', 'username', 'sType', 'data', 'deletionAllowed', 'updPwdRequired'],
            validFields: ['link', 'username', 'sType', 'data', 'deletionAllowed', 'about', 'updPwdRequired']
        })
        await objectNotExists({ link: jsonData.link });
        var newRecord = new Mdl(jsonData);
        console.log(newRecord)
        await newRecord.save();
        return { message: 'Setting added' }
    } catch (error) {
        throw error
    }
}

function objectNotExists(jsonData) {
    // to check wheter record exists or not, resolves if not exists
    return new Promise(function (resolve, reject) {
        Mdl.findOne(jsonData)
            .then(function (record) {
                if (record) {
                    reject(cfn.genError('recordExists', 'Record already exists'));
                } else {
                    resolve();
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

let searchSetting = (jsonData, fieldsToFetch) => {
    // jsonData - criteria , fieldsToFetch = array of valid fields to fetch
    return new Promise(function (resolve, reject) {
        let a = fieldsToFetch, b = jsonData;
        if (!fieldsToFetch) {
            // define defaultNoField in the config file
            a = configs.getInner('settingsModel', 'defaultNoField')
        }
        console.log(b)
        Mdl.find(b, a.join(' '))
            .then(function (record) {
                if (!record || Object.keys(record).length <= 0) {
                    reject(cfn.genError('notFound', 'No record found'));
                } else {
                    resolve(record);
                }
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

let settingExists = async (criteria, resolveExists) => {
    return new Promise(function (resolve, reject) {
        // to search for active, not deleted user only, add status 1 to all request
        console.log(criteria)
        Mdl.findOne(criteria)
            .then(function (user) {
                //console.log("---\n"+JSON.stringify(criteria)+"\n ----")
                //       console.log("----\n"+JSON.stringify(user)+"\n--")
                console.log(user)
                if (user) {
                    if (resolveExists) {
                        resolve(user);
                    } else {
                        reject(cfn.genError('duplicate', 'settings exists'));
                    }
                } else {
                    if (resolveExists == false) {
                        resolve()
                    } else {
                        reject(cfn.genError('notFound', 'Setting not found'))

                    }
                }

            })
            .catch(function (err) {
                reject(err);
            });
    });
}

let updateSetting = async (username, link, updates) => {
    try {
        let updObj = updates
        await cfn.inspectJSON(updates, {
            validFields: ['data', 'about', 'pwd','updPwdRequired']
        })

        let settingObject = await settingExists({
            link: link
        }, true);

        if (settingObject.updPwdRequired=="yes") {
            await cfn.inspectJSON(updates, {
                validFields:['data', 'about', 'pwd','updPwdRequired'],
                requiredFields: ['pwd']
            })
            await User.comparePassword(username, updates['pwd']);
            delete updObj['pwd']
        }

        Object.keys(updObj).forEach(function (key) {
            settingObject[key] = updObj[key];
        });

        await settingObject.save();
        return { message: 'Setting updated' }
    } catch (error) {
        throw error
    }
}

let deleteSetting = async (user, link) => {
    try {
        let user1 = await Mdl.findOne({
            link: link
        })
        if (user1['deletionAllowed'] == "yes") {
            logit.info(user + " deleted setting " + link + ", data dump =" + JSON.stringify(user1));
            await Mdl.findByIdAndRemove(user1._id)
            return { message: 'Setting deleted' }
        } else {
            throw cfn.genError('notAllowed', 'This setting cannot be deleted')
        }
    } catch (error) {
        throw error
    }
}

module.exports.insertSetting = insertSetting;
module.exports.searchSetting = searchSetting;
module.exports.updateSetting = updateSetting;
module.exports.deleteSetting = deleteSetting;
module.exports.settingExists = settingExists