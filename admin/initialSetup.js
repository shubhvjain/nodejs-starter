// initial setup 
// run only for the first time 
var SettingsModel = require('./serverSettings');

let newConfig = async () => {
    console.log("Creating configs.....")
    let defaultConfigs = [
        {
            link: 'emailData',
            sType: 'config',
            data: {
                "headerTemplate": "<div class='email' style=\"font-family: 'Courier', sans-serif; display: block;  padding: 10% 10%; background: #fff; box-shadow: 0 0 15px 0 #999; border-radius: 10px; font-size: 18px;  line-height: 1.6;\"> ",
                "footerTemplate": "<br> <p>Thanks, <%-signature%></p><br><p>Support email - <%-supportEmail%></p></div>",
                "defaultData": {
                    "supportEmail": "sampleemail.com",
                    "signature": "shubh",
                }
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Configs related to email',
            username: 'initByServer'
        },
        {
            link: 'customEmail',
            sType: 'template',
            data: {
                type: 'ejs',
                subject: "Hello, <%-name%>",
                body: "This is a sample email. This is some variable :  <%let currentTime= new Date();%>  <%-currentTime%>",
                addHeader: true,
                addFooter: true
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template for testing',
            username: 'initByServer'
        },
        {
            link: 'pwdChanged',
            sType: 'template',
            data: {
                type: 'ejs',
                subject: "Password Changed",
                body: "<p>Dear, <%-name%> </p> <p>Your password was changed on <b> <%-currentTime%>  </b> </p> <p>Reset your password immediately if it wasn't you and contact support </p> ",
                addHeader: true,
                addFooter: true
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template to alert when the user updates password ',
            username: 'initByServer'
        },
        {
            link: 'activateAccount',
            sType: 'template',
            data: {
                type: 'ejs',
                addHeader: true,
                addFooter: true,
                subject: "Verify PIN",
                body: "<p>Dear, <%-name%> </p><p>Your 6 digit pin to activate your account is </p> <p style=\"text-align:center;font-size:40px;\"> <%-pin%> </p> <p>Do not share this pin with anyone</p><p>Note that this pin is valid only for a certian period of time.</p>",
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template to Verify pin to activate account',
            username: 'initByServer'
        },
        {
            link: 'accountActivated',
            sType: 'template',
            data: {
                type: 'ejs',
                addHeader: true,
                addFooter: true,
                subject: "Account activated",
                body: " <p>Dear, <%-name%> </p> <p>Your account is now active. Your username is  </p> <p style='text-align:center;font-size:40px;'> <%-username%> </p> <p>Use this username and your password to login</p> <p>Do not share your password with anyone. </p>",
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template for email sent after account is created successfully',
            username: 'initByServer'
        },
        {
            link: 'resetWithPin',
            sType: 'template',
            data: {
                type: 'ejs',
                addHeader: true,
                addFooter: true,
                subject: "Reset password",
                body: "<p>Dear, <%-name%> </p><p>Your 6 digit pin to reset your password is</p> <p style=\"text-align:center;font-size:40px;\"> <%-pin%> </p> <p>Do not share this pin with anyone</p><p>Note that this pin is valid only for a certian period of time. </p>",
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template to Reset password',
            username: 'initByServer'
        },
    ]

    for (let index = 0; index < defaultConfigs.length; index++) {
        try {
            const element = defaultConfigs[index];
            let a = await SettingsModel.insertSetting(element)
            console.log(a)
        } catch (error) {
            console.log(error)
        }


    }


}



let main = async () => {
    try {
        await newConfig()
    } catch (error) {
        console.log(error)
    }
}


main()
