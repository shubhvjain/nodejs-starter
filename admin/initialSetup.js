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
                "headerTemplate": " this is the header... this can also be in ejs",
                "footerTemplate": " this is the footer in ejs. signature <%-signature%>  <br> Support email : <%-supportEmail%>",
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
