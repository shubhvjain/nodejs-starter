var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect(process.env.DB_URL, {
	useNewUrlParser: true,
	promiseLibrary: global.Promise,
    dbName:process.env.DB_NAME,
    useUnifiedTopology: true
});

var logSchema = mongoose.Schema({
    data: {
        type: Object,
        default: {}
    },
    display: {
        type: Boolean,
        required: true,
        default: false
    },
    username: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        required: true, // "user| system "
    },
    message: {
        type: String
    }
});
var logModel = mongoose.model('logs', logSchema)
module.exports.logModel = logModel;

let newDBLog = async (data) => {
    try {
        let obj;
        if (data.server == true) {
            obj = {
                username: "developer",
                type: "system",
                data: data.data,
                message: data.message,
                display: true
            }
        } else {
            obj = {
                username: data.username,
                type: data.type,
                data: data.data,
                message: data.message,
                display: data.display
            }
        }
        let sl = new logModel(obj)
        console.log(sl)
        await sl.save();
        return { message: "Logged" }
    } catch (error) {
        throw  error
    }
}
module.exports.newDBLog = newDBLog;

// let a = async ()=>{
// 	try {
// 		let ab = await newLog({
//             "username":"sample",
//             "type":"user",
//             "data":{},
//             "message":"sample log comes here",
//             "display":true
//         })
// 		 console.log( ab)
// 	} catch (error) {
// 		console.log(error)
// 	}
// }
// a()