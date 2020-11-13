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
                body: "<p>Dear, <%-name%> </p> <p>Your password was changed on <b> <-%currentTime%>  </b> </p> <p>Reset your password immediately if it wasn't you and contact support </p> ",
                addHeader: true,
                addFooter: true
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Email template to alert when the user updates password ',
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
