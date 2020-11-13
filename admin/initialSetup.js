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
                "supportEmail":"",
                "signature":"",
                "beginTemplate":"",
                "endTemplate":""
            },
            deletionAllowed: "no",
            updPwdRequired: "no",
            about: 'Configs related to email',
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
