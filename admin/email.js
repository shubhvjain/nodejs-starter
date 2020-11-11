var nodemailer = require('nodemailer');
var configs = require('./config');
var util = require('./utilities')

//  https://stackoverflow.com/a/17606289
String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: process.env.EMAIL_TYPE,
//         user: process.env.EMAIL_USER,
//         clientId: process.env.EMAIL_CLIENTID,
//         clientSecret: process.env.EMAIL_CLIENTSECRET,
//         refreshToken: process.env.EMAIL_REFRESHTOKEN,
//         accessToken: process.env.EMAILACCESSTOKEN
//     }
// });


const transporter1 = nodemailer.createTransport({
    host: process.env.EHOST,
    port: process.env.EPORT,
    secure: false, // use TLS
    auth: {
        user: process.env.EUSER,
        pass: process.env.EPASS
    },
    tls: {
        rejectUnauthorized: false,
        secureProtocol: "TLSv1_method",
    }
});


//core function that actually sends email
let sendEmail = (reciever, data) => {
    return new Promise(async function (resolve, reject) {
        try {
            var mailOptions = {
                from: process.env.EUSER,
                to: reciever,
                subject: data.subject,
                text: " ",
                html: data.body
            };

            await transporter1.sendMail(mailOptions)
            //await util.newLog({ server: true, message: 'email.sent', data: mailOptions })
            if (logit) {
                logit.info("email sent to ' " + reciever + "' subject is '" + data.subject + "'");
            } else {
                console.log("email sent to ' " + reciever + "' subject is '" + data.subject + "'");
            }
            resolve({ message: "Mail sent" });
        } catch (error) {
            console.log(error)
            //await util.newLog({ server: true, message: 'error.sendEmail', data: { error: error, reciever: reciever, data: data } })
            reject(util.genError('sendEmailError', error.messsage));
        }
    });
}
module.exports.sendEmail = sendEmail;

let dbConfig = require('../settings/model')
// just composes email , given the template id and data
let composeEmail = async (templateID, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // step 1 - get the template
            // let templData = configs.getInner('mailTemplates', templateID)[0];
            let a = await dbConfig.settingExists({ link: templateID }, true)
            let templData = a['data'];
            //   console.log(templData)

            if (templData) {
                // handling html type template
                if (templData.type == 'html') {
                    let bdy = templData.body;
                    // step 2 -  add data inside the Template body
                    templData.replacement.map((key) => {
                        let res = key.slice(1, key.length - 1)
                        bdy = bdy.replaceAll(key, data[res]);
                    });
                    resolve({ subject: templData.subject, body: bdy });
                } else {
                    throw util.genError('internalError', 'Invalid mail template type ' + templData.type + ' for template ' + templData.name, 'email.composeEmail')
                }
            } else {
                throw util.genError("internalError", "Mail template not found. Mail not send")
            }
        } catch (error) {
            await util.newLog({ server: true, message: 'error.composeEmail', data: { error: error, templateID: templateID, data: data } })
            reject(error)

        }
    });
}
module.exports.composeEmail = composeEmail;

//compose email using the provided template id and data and send the email
// mostly , this function will be used at other pages
let composeSendEmail = (reciever, templateId, data) => {
    //reciever - email id
    return new Promise((resolve, reject) => {
        composeEmail(templateId, data)
            .then((emailData) => {
                return sendEmail(reciever, emailData)
            })
            .then((msg) => {
                resolve(msg);
            })
            .catch((err) => {
                reject(err)
            })
    })
}
module.exports.composeSendEmail = composeSendEmail;

// running funcions here 
// composeEmail('verifyWithPin', { name: "Some name", pin: 12344, email: "shubhbpl@gmail.com" ,task:'login'}).then((result) => {
//     console.log(result);
// }).catch((er) => {
//     console.log(er)
// })
// wont work if email.js is run individually, requires env variable
// sendEmail('shubhbpl@gmail.com', { header: 'Hi there', body: 'Just testing whether email service is working or not', name: "Some name", pin: 12344, email: "shubhbpl@gmail.com", task: 'login' }).then((result) => {
//     console.log(result);
// }).catch((er) => {
//     console.log(er)
// })