var nodemailer = require('nodemailer');
var ejs = require('ejs');

var util = require('../services/utils')
let dbConfig = require('./serverSettings')
let dbLog = require('./serverLogs')


// const transporter1 = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     secure: false,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PWD
//     },
//     tls: {
//         rejectUnauthorized: false,
//        //  secureProtocol: "TLSv1_method",
//     }
// });

// https://nodemailer.com/smtp/well-known/
let transporter1 = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PWD
    },
});

let sendEmail = async (uname, reciever, data) => {
    try {
        var mailOptions = {
            from: process.env.EMAIL_USER,
            to: reciever,
            subject: data.subject,
            text: " ",
            html: data.body
        };
        await transporter1.sendMail(mailOptions)
        // throw util.genError("sample","testing")
        await dbLog.newDBLog({
            username: uname,
            message: "email.sent",
            type: "user",
            data: mailOptions,
            display: false
        })
        return { message: "Mail sent" }
    } catch (error) {
        console.log(error)
        await dbLog.newDBLog({
            username: uname,
            message: "email.sentError",
            type: "user",
            data: { error: error.messsage, mailOptions: mailOptions },
            display: false
        })
        throw util.genError('sendEmailError', error.messsage);
    }
}
module.exports.sendEmail = sendEmail;

// just composes email , given the template id and data
let composeEmail = async (templateID, data) => {
    try {
        // get the template
        let rec1 = await dbConfig.settingExists({ link: templateID }, true)
        // get email config setting doc
        let rec2 = await dbConfig.settingExists({ link: "emailData" }, true)

        let defData = rec2["data"];
        let templData = rec1['data'];
        // combine default data and input data 
        let combData = Object.assign(defData["defaultData"], data)
        if (templData) {
            if (templData.type == 'ejs') {
                let sub = ejs.render(templData.subject, combData)
                let body = `${templData.addHeader ? defData.headerTemplate : ""}
                            ${templData.body} 
                            ${templData.addFooter ? defData.footerTemplate : ""}`
                let bodyhtml = ejs.render(body, combData)
                return { subject: sub, body: bodyhtml }
            }
            else {
                throw util.genError('internalError', 'Invalid mail template type ' + templData.type + ' for template ' + templData.name, 'email.composeEmail')
            }
        } else {
            throw util.genError("internalError", "Mail template not found. Mail not send")
        }
    } catch (error) {
        throw error
    }
}
module.exports.composeEmail = composeEmail;

//compose email using the provided template id and data and send the email
// mostly , this function will be used at other pages
let composeSendEmail = async (uname, reciever, templateId, data) => {
    try {
        //reciever - email id  
        let emailData = await composeEmail(templateId, data);
        let msg = await sendEmail(uname, reciever, emailData)
        return msg
    } catch (error) {
        throw error
    }
}
module.exports.composeSendEmail = composeSendEmail;

// composeEmail('customEmail', { name: "Shubh"}).then((result) => {
//     console.log(result);
// }).catch((er) => {
//     console.log(er)
// })
// composeSendEmail('vardhan', 'shubhbpl@gmail.com', 'customEmail', { name: "Shubh..." }).then(msg => { console.log(msg) }).catch(err => { console.log(err) })
