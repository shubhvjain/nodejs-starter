var rn = require('random-number');
var gen = rn.generator({ min: 100001, max: 999999, integer: true });

const cnf = require('./config');
var eservice = require("./email");
var UserModel = require('../user/model');
const cmFn = require('../services/utils');
var dblog = require('./serverLogs')

let generatePin = async (userid, templateId) => {
    try {
        var validTypes = cnf.get('validPinTypes');
        if (!validTypes.includes(templateId)) {throw cmFn.genError('internalError', 'Invalid email token type' + templateId);}
        var st = 1;
        //  if this is a pin to activate account, status is not activated
        if (templateId == 'activateAccount') { st = 0 }
        await UserModel.userExists({ status: st, username: userid })
        var gen_pin = gen();
        await UserModel.update(userid, { emailTokenType: templateId, emailToken: gen_pin });
        return gen_pin
    } catch (error) { throw error }
}
module.exports.generatePin = generatePin;

let generateAndSendPin = async (user, data1) => {
    // data1 = json ,  must contain templateId,task,
    // to generate PIN and send it to email
    // user = username  
    try {
        let genPin = await generatePin(user, data1.templateId);
        let data = await UserModel.userExists({ username: user });
        var dataToSend = {
            pin: genPin,
            name: data.name,
            username: data.username,
            email: data.email,
            task: data1.task
        }
        await eservice.composeSendEmail(user, data.email, data1.templateId, dataToSend);
        return;
    } catch (error) { throw (error) }
}
module.exports.generateAndSendPin = generateAndSendPin;

let verifyPin = async (user, pin, type) => {
    // user - username
    try {
        var validTypes = cnf.get('validPinTypes');
        if (!validTypes.includes(type)) {throw cmFn.genError('internalError', 'Invalid email token type ' + type);}
        await UserModel.comparePin(user, pin, type)
        return ;
    } catch (error) {
        error.message = error.message + "(or the user may already be active or pin does not match)";
        throw error;
    }
}
module.exports.verifyPin = verifyPin;

let  resolvePin = async (user, pin, type) => {
    // user - username
        try {
            var validTypes = cnf.get('validPinTypes');
            if (!validTypes.includes(type)) {throw cmFn.genError('internalError', 'Invalid email token type ' + type);}
            let data = await UserModel.comparePin(user, pin, type)
            var updates = {};
            let uData = {};
            if (type == 'activateAccount') {
                // also update the status
                uData['email'] = data.email;
                uData['name'] = data.name;
                uData['username'] = data.username;
                updates['status'] = 1;
            }
            updates.emailTokenType = ' ';
            updates.emailToken = 'notSet';
            await UserModel.update(user, updates);
            if (type == 'activateAccount') {
                // if email verified successfully ,send success mail
                await dblog.newDBLog({ username: data.username, message: "user.emailVerified", type: 'user', display: true, data: {} })
                await eservice.composeSendEmail(data.username,uData['email'], 'accountActivated', uData)
            }
            return ;
        } catch (error) {
            error.message = error.message + "(or the user may already be active or pin does not match)";
            throw error;
        };
}
module.exports.resolvePin = resolvePin;