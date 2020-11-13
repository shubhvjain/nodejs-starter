// note that sub catogeries inside the config file must have this format -
// (only then the getInner function will return correct results)
//          they must be array of json. 
//          each json must have a unique 'name' field
let configs = {
    setupDevelopment: {

    },
    setupProduction: {

    },
    adminUsername: 'vardhan',
    auth: {
        loginTknValidity: "24",// =  7 * 24 , token valid for next 7 days
        loginSecretCode: "SuperSecretTextMessage#1.2.3.4",
        loginTknLong: "1080", // 45*24 , 45 days token 
        tokenHeaderName: "user-access-token",
    },
    authModel1: [
        {
            name: "user",
            developer: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "status", "pwdchange", "deleted", "deletedOn", "role", "emailTokenType", "emailTokenSetDate"],
                write: ["name", "mobileNo", "password", "address", "password", "role", "status", "deleted", "emailToken"]
            },
            admin: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "status", "pwdchange", "deleted", "deletedOn", "role"],
                write: ["name", "mobileNo", "password", "address", "password", "role", "status", "deleted"]
            },
            manager: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "status", "pwdchange", "deleted", "deletedOn", "role"],
                write: ["name", "mobileNo", "password", "address", "password"]
            },
            staff: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "status", "role"],
                write: ["name", "mobileNo", "password", "address"]
            },
            guest: {
                read: ["name"],
                write: []
            },
            member: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "role"],
                write: ["name", "mobileNo", "password", "address"]
            },
            newUser: {
                write: ["username", "name", "email", "mobileNo", "password", "address", "pin"]
            }
        }
    ],
    authModel:
        [{
            name: "user",
            developer: {
                read: ["emailTokenType", "emailTokenSetDate"],
                write: ["emailToken"]
            },
            admin: {
                read: [],
                write: ["role", "status", "deleted"]
            },
            manager: {
                read: ["pwdchange", "deleted", "deletedOn"],
                write: []
            },
            staff: {
                read: ["status"],
                write: []
            },
            member: {
                read: ["username", "name", "email", "mobileNo", "address", "createdOn", "role"],
                write: ["name", "mobileNo", "password", "address"]
            },
            guest: {
                read: ["name"],
                write: []
            },
            newUser: {
                write: ["username", "name", "email", "mobileNo", "password", "address", "pin"]
            }
        }],
    authHierarchy: { "developer": 1, "admin": 2, "manager": 3, "staff": 4, "member": 5, "guest": 6, "newUser": 7 },
    validPinTypes: ['verifyWithPin', 'resetWithPin', 'activateAccount'],
    userRoles: ["developer", "admin", "manager", "staff", "member", "guest"],
    user: {
        defaultRole: "member",
        // for userSearch() function in user model
        validSearchFields: ['role', 'username', 'email', 'password', 'mobileNo', 'name', 'address'],
        validFetchFields: ['username', 'role', 'address', 'email', 'mobileNo', 'name', 'createdOn', 'emailTokenType'],
        defaultNoField: ['timezone', 'username', 'name', 'email', 'address', 'mobileNo', 'createdOn', 'role']
    },
    note: {
        defaultNoField: ['title', 'description', 'createdOn', 'username', 'pages', 'link', 'tags']

    },
    page: {
        defaultNoField: ['review', 'pin', 'title', 'ver', 'link', 'book', 'createdOn', 'username', 'review','pageType']
    },
    note1: {
        defaultNoField: ['pin', 'title', 'link', 'tags', 'createdOn', 'username', 'about']
    },
    new_model: {
        defaultNoField: ['field1']
    },
    settingsModel: {
        defaultNoField: ['link','data','sType']
    }
}
// to get a config value
let get = (name) => {
    if (!configs[name]) {
        throw new Error("config not found");
    }
    //TODO here a reference of the object is passed make a copy of it using stringify and parse and then send it
    return configs[name];
}
module.exports.get = get;

let getInner = (category, innerName) => {
    if (!configs[category]) {
        throw new Error("Config not found");
    }
    let filterByName = (item) => {
        if (item.name == innerName) {
            return true;
        } else {
            return false;
        }
    }
    let fetchedValue = "";
    if (Array.isArray(configs[category])) {
        fetchedValue = configs[category].filter(filterByName);
    } else if (configs[category] !== null && typeof configs[category] === 'object') {
        fetchedValue = configs[category][innerName];
    }
    return fetchedValue; // returns an array
}
module.exports.getInner = getInner;
//let a = getInner('mailTemplates','verifyWithPin')
//console.log(a);

let getFields = (model, role, type) => {
    // returns an array of valid fields for a particular type of a particular user role in a model 
    // model - which module , role - any of the valid role, type - read or write
    let role1 = JSON.stringify(get('userRoles'));
    let vrole = JSON.parse(role1);
    //console.log(configs.userRoles);
    //let vrole = vrole1
    //console.log(role)
    //console.log(vrole);
    let idx = vrole.indexOf(role);
    //console.log(idx);
    if (idx > -1) {
        let rls = vrole.splice(idx, vrole.length);
        let flds = [];
        let allFlds = getInner('authModel', 'user')[0];
        rls.forEach((item) => {
            let fld = [];
            fld = allFlds[item][type];
            if (fld) {
                fld.map((fl) => {
                    flds.push(fl);
                })
            } else {
                console.log("role matrix not found")
            }
        })
        let unique = flds.filter((v, i, a) => a.indexOf(v) === i);
        //console.log(unique);
        return unique;
    } else {
        console.log("role not found");
        return []
    }
}
module.exports.getFields = getFields;


let getHeierarchy = (role) => {
    let role1 = JSON.stringify(get('authHierarchy'));
    let vrole = JSON.parse(role1);
    return vrole[role];
}
module.exports.getHeierarchy = getHeierarchy;


